/**
 * Live Web Audio engine bridge (UI layer).
 *
 * The engine package (src/engine) provides pure, deterministic offline
 * renderers plus a buffer-oriented SessionPlayer — it has no real-time node
 * graph and no AnalyserNode tap. This adapter builds the live front-panel
 * graph (oscillators + engine-rendered noise/bowl/nature loops + analysers)
 * so the Studio visualizer and Analyzer can run at 60 fps from real meter
 * data. WAV export and preset rendering still go through the pure engine.
 *
 * Graph (v2):
 *
 *   tone chain ─┐
 *   noiseBus  ──┼─▶ bus ─┬─▶ directGain ─────────────┬─▶ master ─▶ spectrum analyser ─▶ destination
 *   layerBus  ──┘        └─▶ infantFilter ─▶ filterGain ┘      └─▶ splitter ─▶ L/R analysers
 *
 *   previews ──▶ previewBus ─┬─▶ previewDirect ──────────────────┬─▶ destination
 *                            └─▶ previewFilter ─▶ previewFiltered ┘
 *
 * The infant path is a 1 kHz low-pass (governor INFANT_MAX_LOWPASS_HZ) that is
 * cross-faded in with equal-power gains, so toggling infant mode mid-session
 * never clicks. Previews have their own copy of that split so they stay
 * audible while the session is stopped (master is 0) yet still honor infant
 * mode. Section buses let the Studio bypass a whole section (noise mixer /
 * nature+bowl layers) with a 50 ms ramp and no source restarts.
 */

import {
  dbToLin,
  isochronicGate,
  renderBowl,
  renderNature,
  renderNoise,
  type EntrainmentMode,
  type NatureKind,
  type NoiseColor,
} from '@/engine';
import { INFANT_MAX_LOWPASS_HZ } from '@/safety/governor';

export type Waveform = 'sine' | 'triangle' | 'square';
export type GateShape = 'raised-cosine' | 'hard';

export interface LiveEngineConfig {
  mode: EntrainmentMode;
  carrierHz: number;
  beatHz: number;
  waveform: Waveform;
  gateDuty: number; // 0..1
  gateShape: GateShape;
}

/**
 * Engine → UI notifications.
 *  - `interrupted`: the OS suspended the context behind our back (phone call,
 *    iOS audio-session steal, Bluetooth handoff); the engine has flipped
 *    itself to paused and hard-muted the master, so a platform auto-resume
 *    stays silent until the user presses RESUME.
 *  - `fade-done`: a scheduled fade-out reached silence and the engine stopped.
 *  - `fade-cancelled`: a fade was dropped by pause / interruption (never by
 *    the user's own cancel, which the UI already knows about).
 */
export type LiveEngineEvent = 'interrupted' | 'fade-done' | 'fade-cancelled';
export type LiveEngineListener = (event: LiveEngineEvent) => void;

const NOISE_COLORS: NoiseColor[] = ['white', 'pink', 'brown', 'blue', 'violet', 'grey'];
/** Engine noise layers are scaled by 0.25 × level — mirror that here. */
const NOISE_SCALE = 0.25;
/** Fade-outs ramp linearly in dB down to this floor, then snap to true 0. */
const FADE_FLOOR_LIN = 1e-3; // −60 dB
const FADE_FLOOR_DB = -60;
/** Number of linear segments approximating the dB-linear fade curve. */
const FADE_SEGMENTS = 12;
/** Layer sources ramp to 0 with this time constant before they are stopped (no pop). */
const LAYER_RELEASE_TC = 0.02;
const LAYER_RELEASE_MS = 120;

interface LayerNode {
  src: AudioBufferSourceNode;
  gain: GainNode;
}

interface FadeState {
  t0: number;
  sec: number;
  fromDb: number;
}

function resolveCtx(): AudioContext | null {
  const g = globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = g.AudioContext ?? g.webkitAudioContext;
  return Ctor ? new Ctor() : null;
}

export class LiveEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private oscL: OscillatorNode | null = null;
  private oscR: OscillatorNode | null = null;
  private gL: GainNode | null = null;
  private gR: GainNode | null = null;
  private gateGain: GainNode | null = null;
  private gateSrc: AudioBufferSourceNode | null = null;
  private anaSpectrum: AnalyserNode | null = null;
  private anaL: AnalyserNode | null = null;
  private anaR: AnalyserNode | null = null;
  /** Section buses: noise colors and nature/bowl layers each sum into their
   * own gain stage before the main bus, so the Studio's master bypass
   * toggles can ramp a whole section to true 0 without stopping sources. */
  private noiseBus: GainNode | null = null;
  private layerBus: GainNode | null = null;
  private noiseBypassed = false;
  private layersBypassed = false;
  /** Infant path: bus → lowpass → filterGain; direct path: bus → directGain. */
  private directGain: GainNode | null = null;
  private filterGain: GainNode | null = null;
  private infantFilter: BiquadFilterNode | null = null;
  private infantOn = false;
  /** Preview path with its own infant split (independent of master). */
  private previewBus: GainNode | null = null;
  private previewDirect: GainNode | null = null;
  private previewFiltered: GainNode | null = null;
  private previewFilter: BiquadFilterNode | null = null;
  /** Desired layer state, remembered even before the AudioContext exists
   * (v1 dropped mixer moves made while idle). Applied on every start(). */
  private noiseLevels = new Map<NoiseColor, number>();
  private natureState: { kind: NatureKind | null; db: number } = { kind: null, db: -Infinity };
  private bowlState: { enabled: boolean; baseHz: number; db: number } = { enabled: false, baseHz: 136.1, db: -Infinity };
  private noiseNodes = new Map<NoiseColor, LayerNode>();
  private noiseBuffers = new Map<NoiseColor, AudioBuffer>();
  private layerNodes: { nature?: LayerNode; bowl?: LayerNode } = {};
  /** One-shot preview sources (playBuffer) so panic/stop can cut them too. */
  private previewSrcs = new Set<AudioBufferSourceNode>();
  private listeners = new Set<LiveEngineListener>();
  private running = false;
  private paused = false;
  /** True while a scheduled fade-out owns the master gain (volume changes are deferred). */
  private fading = false;
  private fade: FadeState | null = null;
  private fadeTimer: number | null = null;
  /** pause() suspends the context 90 ms after its ramp; the timer is cancellable. */
  private pauseTimer: number | null = null;
  /** True between our own ctx.suspend() and its statechange — not an OS interruption. */
  private suspendPending = false;
  private config: LiveEngineConfig = {
    mode: 'binaural',
    carrierHz: 200,
    beatHz: 10,
    waveform: 'sine',
    gateDuty: 0.5,
    gateShape: 'raised-cosine',
  };
  private outDb = -12;
  private muted = false;

  get isRunning(): boolean {
    return this.running;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  get isFading(): boolean {
    return this.fading;
  }

  /** Seconds until the active fade reaches silence (null when not fading). */
  get fadeRemainingSec(): number | null {
    if (!this.fading || !this.fade || !this.ctx) return null;
    return Math.max(0, this.fade.t0 + this.fade.sec - this.ctx.currentTime);
  }

  get context(): AudioContext | null {
    return this.ctx;
  }

  get sampleRate(): number {
    return this.ctx?.sampleRate ?? 48000;
  }

  /** True when the platform could build the infant low-pass path. */
  get hasInfantFilter(): boolean {
    return this.infantFilter !== null;
  }

  /** Subscribe to engine events; returns the unsubscribe function. */
  subscribe(listener: LiveEngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: LiveEngineEvent): void {
    for (const l of this.listeners) {
      try {
        l(event);
      } catch {
        /* a listener must never break the engine */
      }
    }
  }

  private ensureGraph(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const ctx = resolveCtx();
    if (!ctx) return null;
    this.ctx = ctx;
    // Gain creation order is part of the contract with the engine tests:
    // 0 bus, 1 master, 2 noiseBus, 3 layerBus, 4 directGain, 5 filterGain,
    // 6 previewBus, 7 previewDirect, 8 previewFiltered.
    this.bus = ctx.createGain();
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.anaSpectrum = ctx.createAnalyser();
    this.anaSpectrum.fftSize = 4096;
    this.anaSpectrum.smoothingTimeConstant = 0.6;
    this.master.connect(this.anaSpectrum);
    this.anaSpectrum.connect(ctx.destination);
    // Section buses (start at the current bypass state — set at graph build,
    // before any source flows, so this is not an audible step).
    this.noiseBus = ctx.createGain();
    this.noiseBus.gain.value = this.noiseBypassed ? 0 : 1;
    this.noiseBus.connect(this.bus);
    this.layerBus = ctx.createGain();
    this.layerBus.gain.value = this.layersBypassed ? 0 : 1;
    this.layerBus.connect(this.bus);
    // Infant low-pass path (cross-faded with the direct path).
    const canFilter = typeof ctx.createBiquadFilter === 'function';
    this.directGain = ctx.createGain();
    this.filterGain = ctx.createGain();
    this.bus.connect(this.directGain);
    this.directGain.connect(this.master);
    if (canFilter) {
      this.infantFilter = this.makeLowpass(ctx);
      this.bus.connect(this.infantFilter);
      this.infantFilter.connect(this.filterGain);
      this.filterGain.connect(this.master);
    }
    // Preview path — same split, straight to the output.
    this.previewBus = ctx.createGain();
    this.previewDirect = ctx.createGain();
    this.previewFiltered = ctx.createGain();
    this.previewBus.connect(this.previewDirect);
    this.previewDirect.connect(ctx.destination);
    if (canFilter) {
      this.previewFilter = this.makeLowpass(ctx);
      this.previewBus.connect(this.previewFilter);
      this.previewFilter.connect(this.previewFiltered);
      this.previewFiltered.connect(ctx.destination);
    }
    const infantActive = this.infantOn && this.infantFilter !== null;
    this.directGain.gain.value = infantActive ? 0 : 1;
    this.filterGain.gain.value = infantActive ? 1 : 0;
    this.previewDirect.gain.value = infantActive ? 0 : 1;
    this.previewFiltered.gain.value = infantActive ? 1 : 0;
    const splitter = ctx.createChannelSplitter(2);
    this.master.connect(splitter);
    this.anaL = ctx.createAnalyser();
    this.anaR = ctx.createAnalyser();
    this.anaL.fftSize = 2048;
    this.anaR.fftSize = 2048;
    this.anaL.smoothingTimeConstant = 0;
    this.anaR.smoothingTimeConstant = 0;
    splitter.connect(this.anaL, 0);
    splitter.connect(this.anaR, 1);
    // OS interruptions (calls, audio-session steals) suspend the context
    // without us asking; detect that and surface it as a pause.
    ctx.onstatechange = () => this.handleStateChange();
    return ctx;
  }

  private makeLowpass(ctx: AudioContext): BiquadFilterNode {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = INFANT_MAX_LOWPASS_HZ;
    f.Q.value = Math.SQRT1_2;
    return f;
  }

  /** Called by the platform when the AudioContext state changes. */
  private handleStateChange(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const state = ctx.state as string;
    if (state === 'running') {
      this.suspendPending = false;
      return;
    }
    const stalled = state === 'suspended' || state === 'interrupted' || state === 'closed';
    if (!stalled) return;
    if (this.suspendPending && state === 'suspended') {
      // Our own pause() landing — not an interruption.
      this.suspendPending = false;
      return;
    }
    if (this.running && !this.paused) {
      // External interruption: hold the clock and hard-mute. The context is
      // not rendering, so an instant set cannot click; it guarantees that a
      // platform auto-resume (end of call, unlock) stays silent until the
      // user presses RESUME.
      this.paused = true;
      this.clearPauseTimer();
      this.clearFade(true);
      if (this.master) {
        this.master.gain.cancelScheduledValues(ctx.currentTime);
        this.master.gain.value = 0;
      }
      this.emit('interrupted');
    }
  }

  /** Analysers for canvas scopes; null before first start (no AudioContext yet). */
  analysers(): { spectrum: AnalyserNode; left: AnalyserNode; right: AnalyserNode } | null {
    if (!this.anaSpectrum || !this.anaL || !this.anaR) return null;
    return { spectrum: this.anaSpectrum, left: this.anaL, right: this.anaR };
  }

  /** Rebuild the tone chain for the current config (called on mode/waveform change). */
  private buildTone(): void {
    const ctx = this.ctx;
    if (!ctx || !this.bus) return;
    this.teardownTone();
    const { mode, carrierHz, beatHz, waveform } = this.config;
    this.merger = ctx.createChannelMerger(2);
    this.merger.connect(this.bus);
    this.gL = ctx.createGain();
    this.gR = ctx.createGain();
    this.gL.connect(this.merger, 0, 0);
    this.gR.connect(this.merger, 0, 1);

    const mkOsc = (freq: number): OscillatorNode => {
      const o = ctx.createOscillator();
      o.type = waveform;
      o.frequency.value = freq;
      return o;
    };

    if (mode === 'binaural') {
      this.oscL = mkOsc(carrierHz);
      this.oscR = mkOsc(carrierHz + beatHz);
      this.gL.gain.value = 0.5;
      this.gR.gain.value = 0.5;
      this.oscL.connect(this.gL);
      this.oscR.connect(this.gR);
      this.oscL.start();
      this.oscR.start();
    } else if (mode === 'monaural') {
      // Both tones summed acoustically into both ears (half level each).
      this.oscL = mkOsc(carrierHz);
      this.oscR = mkOsc(carrierHz + beatHz);
      this.gL.gain.value = 0.5;
      this.gR.gain.value = 0.5;
      this.oscL.connect(this.gL);
      this.oscL.connect(this.gR);
      this.oscR.connect(this.gL);
      this.oscR.connect(this.gR);
      this.oscL.start();
      this.oscR.start();
    } else {
      // Isochronic: single carrier, both channels, gated by a looped envelope.
      this.oscL = mkOsc(carrierHz);
      this.gateGain = ctx.createGain();
      this.gateGain.gain.value = 0;
      this.gateSrc = ctx.createBufferSource();
      this.gateSrc.buffer = this.renderGateBuffer(beatHz, this.config.gateDuty, this.config.gateShape);
      this.gateSrc.loop = true;
      this.gateSrc.connect(this.gateGain.gain as unknown as AudioNode);
      this.oscL.connect(this.gateGain);
      this.gateGain.connect(this.gL);
      this.gateGain.connect(this.gR);
      this.gL.gain.value = 0.7;
      this.gR.gain.value = 0.7;
      this.oscL.start();
      this.gateSrc.start();
    }
  }

  /** One period-accurate gate envelope loop: N whole cycles in ~1 s. */
  private renderGateBuffer(beatHz: number, duty: number, shape: GateShape): AudioBuffer {
    const ctx = this.ctx!;
    const sr = ctx.sampleRate;
    const cycles = Math.max(1, Math.round(beatHz));
    const len = Math.max(64, Math.round((cycles / Math.max(0.05, beatHz)) * sr));
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const cyclePhase = (i / len) * cycles;
      const p = cyclePhase - Math.floor(cyclePhase);
      data[i] = shape === 'hard' ? (p < duty ? 1 : 0) : isochronicGate(p, duty);
    }
    return buf;
  }

  /** Detach the current tone chain from the engine fields and return it for teardown. */
  private detachTone(): { sources: (OscillatorNode | AudioBufferSourceNode | null)[]; nodes: (AudioNode | null)[] } {
    const captured = {
      sources: [this.oscL, this.oscR, this.gateSrc],
      nodes: [this.gateGain, this.gL, this.gR, this.merger],
    };
    this.oscL = this.oscR = null;
    this.gateSrc = null;
    this.gateGain = null;
    this.gL = this.gR = null;
    this.merger = null;
    return captured;
  }

  private static stopChain(chain: { sources: (OscillatorNode | AudioBufferSourceNode | null)[]; nodes: (AudioNode | null)[] }): void {
    for (const n of chain.sources) {
      if (n) {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
        n.disconnect();
      }
    }
    for (const n of chain.nodes) n?.disconnect();
  }

  private teardownTone(): void {
    LiveEngine.stopChain(this.detachTone());
  }

  private clearFadeTimer(): void {
    if (this.fadeTimer !== null) {
      window.clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  /** Drop an active fade. `notify` emits fade-cancelled (pause / interruption paths). */
  private clearFade(notify = false): void {
    const wasFading = this.fading;
    this.fading = false;
    this.fade = null;
    this.clearFadeTimer();
    if (wasFading && notify) this.emit('fade-cancelled');
  }

  private clearPauseTimer(): void {
    if (this.pauseTimer !== null) {
      window.clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

  /**
   * Build the node graph without starting any source (so callers can query
   * platform capabilities such as `hasInfantFilter` before authorizing a
   * session). Returns false when Web Audio is unavailable.
   */
  prepare(): boolean {
    return this.ensureGraph() !== null;
  }

  start(): boolean {
    const ctx = this.ensureGraph();
    if (!ctx) return false;
    this.clearPauseTimer();
    this.suspendPending = false;
    if (ctx.state !== 'running') void ctx.resume(); // 'suspended' (autoplay) or WebKit 'interrupted'
    this.clearFade();
    if (!this.running) {
      this.buildTone();
      this.syncLayers();
      this.running = true;
    }
    this.paused = false;
    this.applyMasterGain(0.05);
    return true;
  }

  /** Materialize remembered mixer/layer state into live nodes (idempotent). */
  private syncLayers(): void {
    for (const [color, db] of this.noiseLevels) {
      if (!this.noiseNodes.has(color)) this.applyNoiseLevel(color, db);
    }
    if (this.natureState.kind && !this.layerNodes.nature) this.applyNature(this.natureState.kind, this.natureState.db);
    if (this.bowlState.enabled && !this.layerNodes.bowl) this.applyBowl(true, this.bowlState.baseHz, this.bowlState.db);
  }

  /** Gentle stop with a short fade (normal stop path). */
  stop(fadeSec = 0.15): void {
    this.paused = false;
    this.clearPauseTimer();
    this.suspendPending = false;
    this.clearFade();
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(0, t + fadeSec);
    this.running = false;
    // Detach the chain now so a start() inside the fade window builds a fresh
    // chain the delayed teardown cannot touch.
    const chain = this.detachTone();
    window.setTimeout(() => LiveEngine.stopChain(chain), fadeSec * 1000 + 60);
  }

  /**
   * Schedule the dB-linear fade curve from `fromLin` to silence over `sec`,
   * arm the completion timer, and record the fade for countdowns / unmute.
   */
  private scheduleFade(fromLin: number, sec: number): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const p = this.master.gain;
    p.cancelScheduledValues(t);
    p.setValueAtTime(p.value, t);
    const from = Math.max(FADE_FLOOR_LIN, fromLin);
    const fromDb = 20 * Math.log10(from);
    if (fromLin <= FADE_FLOOR_LIN) {
      p.linearRampToValueAtTime(0, t + 0.05);
    } else {
      // Piecewise-linear approximation of an exponential (dB-linear) decay —
      // works on every AudioParam implementation, including test doubles.
      for (let i = 1; i <= FADE_SEGMENTS; i++) {
        const k = i / FADE_SEGMENTS;
        const db = fromDb + (FADE_FLOOR_DB - fromDb) * k;
        p.linearRampToValueAtTime(Math.pow(10, db / 20), t + sec * k);
      }
      p.linearRampToValueAtTime(0, t + sec + 0.05);
    }
    this.clearFadeTimer();
    this.fading = true;
    this.fade = { t0: t, sec, fromDb };
    this.fadeTimer = window.setTimeout(() => {
      this.fadeTimer = null;
      if (!this.fading) return;
      this.fading = false;
      this.fade = null;
      this.stop(0.05);
      this.emit('fade-done');
    }, (sec + 0.1) * 1000);
  }

  /**
   * Sleep fade: ramp the master gain to silence over `fadeSec` (dB-linear,
   * so the last minute is not perceptually abrupt), then stop the engine.
   * The session stays `running` until the fade lands — the clock and dose
   * tracker keep ticking on real output — and `fade-done` fires on landing.
   * The curve starts from the *current* output level (so re-triggering a fade
   * mid-fade, or fading inside resumeSafely's ramp-in, never jumps up), and a
   * muted engine fades straight to 0. No-op when idle or paused.
   */
  fadeOut(fadeSec: number): boolean {
    if (!this.ctx || !this.master || !this.running || this.paused) return false;
    const sec = Math.max(0.05, fadeSec);
    const target = this.muted ? 0 : dbToLin(this.outDb);
    // AudioParam.value reads back the automated value on real engines; a
    // readback at/below the floor (just started, or a test double that never
    // advances) falls back to the nominal level.
    const readback = this.master.gain.value;
    const cur = Number.isFinite(readback) && readback > FADE_FLOOR_LIN ? readback : target;
    const from = this.muted ? 0 : Math.min(cur, target);
    this.scheduleFade(from, sec);
    return true;
  }

  /** Abort a scheduled fade-out and restore the current volume (150 ms). */
  cancelFadeOut(): void {
    if (!this.fading) return;
    this.clearFade();
    this.applyMasterGain(0.15);
  }

  /**
   * Pause: ramp master to 0 over 50 ms (no click), then suspend the
   * AudioContext so its clock — and every oscillator/gate/noise phase
   * accumulator — freezes in place (player.ts pause semantics applied to the
   * live graph: the position is retained, not rebuilt). Resume continues the
   * frozen phases, so there is no phase jump. Drops an active fade
   * (fade-cancelled). No-op when not running.
   */
  pause(): void {
    if (!this.ctx || !this.master || !this.running || this.paused) return;
    this.clearFade(true);
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(0, t + 0.05);
    this.paused = true;
    const ctx = this.ctx;
    // Suspend only after the fade has landed, and only if still paused
    // (stop()/panic()/resume() clear the timer, cancelling this).
    this.clearPauseTimer();
    this.pauseTimer = window.setTimeout(() => {
      this.pauseTimer = null;
      if (this.paused && ctx.state === 'running') {
        this.suspendPending = true;
        void ctx.suspend();
      }
    }, 90);
  }

  /**
   * Resume from pause: unfreeze the context clock (all phases continue from
   * the suspended accumulator) and ramp master back over 150 ms. No-op when
   * not paused.
   */
  resume(): void {
    if (!this.ctx || !this.master || !this.paused) return;
    this.paused = false;
    this.clearPauseTimer();
    this.suspendPending = false;
    void this.ctx.resume();
    const t = this.ctx.currentTime;
    const target = this.muted ? 0 : dbToLin(this.outDb);
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(target, t + 0.15);
  }

  /** Panic: hard mute at 0 ms — no fade (safety spec: fades are how people get hurt). */
  panic(): void {
    this.paused = false;
    this.clearPauseTimer();
    this.suspendPending = false;
    this.clearFade();
    // Previews bypass the master bus, so panic must cut them explicitly —
    // panic silences EVERYTHING.
    this.stopPreviews();
    if (!this.ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.value = 0;
    this.running = false;
    this.teardownTone();
    // Panic empties the bus: every layer loop is released too (the remembered
    // mixer state re-materializes them on the next start()).
    this.releaseAllLayers();
  }

  private releaseAllLayers(): void {
    for (const node of this.noiseNodes.values()) this.releaseLayer(node);
    this.noiseNodes.clear();
    if (this.layerNodes.nature) this.releaseLayer(this.layerNodes.nature);
    if (this.layerNodes.bowl) this.releaseLayer(this.layerNodes.bowl);
    this.layerNodes = {};
  }

  /** Hard-stop all one-shot preview buffers (second tap / panic / new preview). */
  stopPreviews(): void {
    for (const src of this.previewSrcs) {
      try {
        src.onended = null;
        src.stop();
      } catch {
        /* already stopped */
      }
      src.disconnect();
    }
    this.previewSrcs.clear();
  }

  /** Resume after panic at −12 dB below previous level, ramped 2 s. */
  resumeSafely(): number {
    this.outDb = Math.max(-60, this.outDb - 12);
    this.start();
    if (this.ctx && this.master) {
      const t = this.ctx.currentTime;
      const target = this.muted ? 0 : dbToLin(this.outDb);
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(0, t);
      this.master.gain.linearRampToValueAtTime(target, t + 2);
    }
    return this.outDb;
  }

  private applyMasterGain(rampSec = 0.05): void {
    if (!this.ctx || !this.master || this.fading) return;
    // Nothing may reach the output unless a session is live: layer loops stay
    // connected while idle, so an unmute while STOPPED (or after a PANIC)
    // must resolve to silence, not to the fader level.
    const target = this.muted || !this.running || this.paused ? 0 : dbToLin(this.outDb);
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(target, t + rampSec);
  }

  setOutputDb(db: number): void {
    this.outDb = Math.max(-60, Math.min(0, db));
    if (this.running) this.applyMasterGain();
  }

  getOutputDb(): number {
    return this.outDb;
  }

  /**
   * Mute always wins: during a fade the curve is cut to 0 immediately (the
   * fade timer still stops the engine on schedule); unmuting during a fade
   * re-issues the remainder of the curve from where it would be now.
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.fading && this.ctx && this.master) {
      const t = this.ctx.currentTime;
      const p = this.master.gain;
      if (muted) {
        p.cancelScheduledValues(t);
        p.setValueAtTime(p.value, t);
        p.linearRampToValueAtTime(0, t + 0.02);
      } else if (this.fade) {
        const elapsed = Math.max(0, t - this.fade.t0);
        const remaining = Math.max(0.1, this.fade.sec - elapsed);
        const k = Math.min(1, elapsed / this.fade.sec);
        const db = this.fade.fromDb + (FADE_FLOOR_DB - this.fade.fromDb) * k;
        this.scheduleFade(Math.pow(10, db / 20), remaining);
      }
      return;
    }
    this.applyMasterGain(0.02);
  }

  /**
   * Infant mode low-pass (≤1 kHz, governor rule): cross-fades the filtered
   * path in over 50 ms — on the session path and on the preview path.
   * Returns false when the platform has no BiquadFilter (the caller should
   * then refuse to authorize an infant session).
   */
  setInfantFilter(on: boolean): boolean {
    this.infantOn = on;
    if (!this.ctx || !this.directGain || !this.filterGain) return this.infantFilter !== null || !on;
    if (!this.infantFilter) return !on;
    const t = this.ctx.currentTime;
    this.directGain.gain.setTargetAtTime(on ? 0 : 1, t, 0.05);
    this.filterGain.gain.setTargetAtTime(on ? 1 : 0, t, 0.05);
    this.previewDirect?.gain.setTargetAtTime(on ? 0 : 1, t, 0.05);
    this.previewFiltered?.gain.setTargetAtTime(on ? 1 : 0, t, 0.05);
    return true;
  }

  /** Live-update config. Rebuilds the tone chain only when structure changes. */
  updateConfig(next: Partial<LiveEngineConfig>): void {
    const prev = this.config;
    this.config = { ...prev, ...next };
    if (!this.running || !this.ctx) return;
    const structural =
      prev.mode !== this.config.mode || prev.waveform !== this.config.waveform;
    if (structural) {
      this.buildTone();
      return;
    }
    const { mode, carrierHz, beatHz } = this.config;
    if (mode === 'binaural' && this.oscL && this.oscR) {
      this.oscL.frequency.value = carrierHz;
      this.oscR.frequency.value = carrierHz + beatHz;
    } else if (mode === 'monaural' && this.oscL && this.oscR) {
      this.oscL.frequency.value = carrierHz;
      this.oscR.frequency.value = carrierHz + beatHz;
    } else if (mode === 'isochronic' && this.oscL) {
      this.oscL.frequency.value = carrierHz;
      if (prev.beatHz !== beatHz || prev.gateDuty !== this.config.gateDuty || prev.gateShape !== this.config.gateShape) {
        // Swap the gate loop for the new rate/shape.
        if (this.gateSrc) {
          const old = this.gateSrc;
          const src = this.ctx.createBufferSource();
          src.buffer = this.renderGateBuffer(beatHz, this.config.gateDuty, this.config.gateShape);
          src.loop = true;
          if (this.gateGain) src.connect(this.gateGain.gain as unknown as AudioNode);
          src.start();
          this.gateSrc = src;
          try {
            old.stop(this.ctx.currentTime + 0.02);
          } catch {
            /* noop */
          }
          old.disconnect();
        }
      }
    }
  }

  /**
   * Click-free master bypass for a whole section (noise mixer / nature+bowl
   * layers): ramps the section bus with a 50 ms time constant. No
   * gain.value step, no source stop/start — toggling mid-session cannot
   * click, and re-enable is phase-continuous (buffers keep looping).
   */
  private rampSection(section: GainNode | null, on: boolean): void {
    if (!this.ctx || !section) return;
    section.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05);
  }

  /** Bypass (false) or enable (true) the noise mixer section. */
  setNoiseBypass(on: boolean): void {
    this.noiseBypassed = !on;
    this.rampSection(this.noiseBus, on);
  }

  /** Bypass (false) or enable (true) the nature/bowl layers section. */
  setLayersBypass(on: boolean): void {
    this.layersBypassed = !on;
    this.rampSection(this.layerBus, on);
  }

  /** Ramp a layer to silence, then stop and disconnect it (no pop on release). */
  private releaseLayer(node: LayerNode): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    node.gain.gain.cancelScheduledValues(t);
    node.gain.gain.setTargetAtTime(0, t, LAYER_RELEASE_TC);
    window.setTimeout(() => {
      try {
        node.src.stop();
      } catch {
        /* already stopped */
      }
      node.src.disconnect();
      node.gain.disconnect();
    }, LAYER_RELEASE_MS);
  }

  private makeLoop(data: Float32Array, gainLin: number, into: AudioNode): LayerNode {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, data.length, ctx.sampleRate);
    buffer.getChannelData(0).set(data);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = gainLin;
    src.connect(gain);
    gain.connect(into);
    src.start();
    return { src, gain };
  }

  /** Set one noise color's level in dB (−Infinity = off). Loops an engine-rendered buffer. */
  setNoiseLevel(color: NoiseColor, db: number): void {
    if (Number.isFinite(db)) this.noiseLevels.set(color, db);
    else this.noiseLevels.delete(color);
    this.applyNoiseLevel(color, db);
  }

  private applyNoiseLevel(color: NoiseColor, db: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.bus) return;
    const existing = this.noiseNodes.get(color);
    if (!Number.isFinite(db)) {
      if (existing) {
        this.noiseNodes.delete(color);
        this.releaseLayer(existing);
      }
      return;
    }
    if (!existing) {
      let buffer = this.noiseBuffers.get(color);
      if (!buffer) {
        const data = renderNoise(color, 8, ctx.sampleRate);
        buffer = ctx.createBuffer(1, data.length, ctx.sampleRate);
        buffer.getChannelData(0).set(data);
        this.noiseBuffers.set(color, buffer);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = dbToLin(db) * NOISE_SCALE;
      src.connect(gain);
      gain.connect(this.noiseBus ?? this.bus);
      src.start();
      this.noiseNodes.set(color, { src, gain });
    } else {
      existing.gain.gain.setTargetAtTime(dbToLin(db) * NOISE_SCALE, ctx.currentTime, 0.05);
    }
  }

  /**
   * Play a rendered stereo buffer once through the preview path (audible while
   * the session is stopped; honors infant mode). Sources are tracked so
   * stopPreviews()/panic() can cut them; `onEnded` fires on natural
   * completion (never on a manual stop).
   */
  playBuffer(left: Float32Array, right: Float32Array, sampleRate: number, db = -18, onEnded?: () => void): boolean {
    const ctx = this.ensureGraph();
    if (!ctx || !this.bus) return false;
    if (ctx.state !== 'running') void ctx.resume(); // 'suspended' (autoplay) or WebKit 'interrupted'
    const frames = Math.min(left.length, right.length);
    if (frames === 0) return false;
    const buffer = ctx.createBuffer(2, frames, sampleRate);
    buffer.getChannelData(0).set(left.subarray(0, frames));
    buffer.getChannelData(1).set(right.subarray(0, frames));
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.onended = () => {
      this.previewSrcs.delete(src);
      src.disconnect();
      onEnded?.();
    };
    const gain = ctx.createGain();
    gain.gain.value = dbToLin(db);
    src.connect(gain);
    gain.connect(this.previewBus ?? ctx.destination);
    this.previewSrcs.add(src);
    src.start();
    return true;
  }

  /**
   * Route an HTMLMediaElement (pre-rendered preview file) through the preview
   * path so it honors infant mode's low-pass like engine previews do. Returns
   * a detach function, or null when Web Audio is unavailable (the caller then
   * falls back to the element's own volume). A media element can only be
   * attached once per element, so callers pass a fresh Audio() each time.
   */
  attachMediaElement(el: HTMLMediaElement, db: number): (() => void) | null {
    const ctx = this.ensureGraph();
    if (!ctx || !this.previewBus || typeof ctx.createMediaElementSource !== 'function') return null;
    if (ctx.state !== 'running') void ctx.resume(); // 'suspended' (autoplay) or WebKit 'interrupted'
    let src: MediaElementAudioSourceNode;
    try {
      src = ctx.createMediaElementSource(el);
    } catch {
      return null; // already attached elsewhere / cross-origin without CORS
    }
    const gain = ctx.createGain();
    gain.gain.value = dbToLin(db);
    src.connect(gain);
    gain.connect(this.previewBus);
    return () => {
      try {
        src.disconnect();
        gain.disconnect();
      } catch {
        /* already gone */
      }
    };
  }

  /** Nature texture layer (engine-rendered loop) — routed via layerBus. kind null = off. */
  setNature(kind: NatureKind | null, db: number): void {
    this.natureState = { kind: kind && Number.isFinite(db) ? kind : null, db };
    this.applyNature(kind, db);
  }

  private applyNature(kind: NatureKind | null, db: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.bus) return;
    if (this.layerNodes.nature) {
      this.releaseLayer(this.layerNodes.nature);
      this.layerNodes.nature = undefined;
    }
    if (!kind || !Number.isFinite(db)) return;
    this.layerNodes.nature = this.makeLoop(renderNature(kind, 12, ctx.sampleRate), dbToLin(db) * 0.5, this.layerBus ?? this.bus);
  }

  /** Singing-bowl layer (engine-rendered loop) — routed via layerBus. enabled false = off. */
  setBowl(enabled: boolean, baseHz: number, db: number): void {
    this.bowlState = { enabled: enabled && Number.isFinite(db), baseHz, db };
    this.applyBowl(enabled, baseHz, db);
  }

  private applyBowl(enabled: boolean, baseHz: number, db: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.bus) return;
    if (this.layerNodes.bowl) {
      this.releaseLayer(this.layerNodes.bowl);
      this.layerNodes.bowl = undefined;
    }
    if (!enabled || !Number.isFinite(db)) return;
    this.layerNodes.bowl = this.makeLoop(
      renderBowl({ baseHz, level: 1, restrikeSec: 8 }, 8, ctx.sampleRate),
      dbToLin(db) * 0.5,
      this.layerBus ?? this.bus,
    );
  }
}

export const LIVE_NOISE_COLORS = NOISE_COLORS;

/**
 * Global session state (UI layer): live engine config, transport, session
 * timer with limit enforcement + sleep fade, WHO-ITU H.870 dose tracking
 * (src/safety, persisted across reloads), safety governor enforcement at
 * START, panic flow, preset/frequency loading, share links, and the
 * off-thread WAV export.
 *
 * v2 changes at a glance:
 *   - The front panel is remembered across reloads (sessionPersistence.ts).
 *   - START is gated by the SafetyGovernor: one-time advisory acknowledgment,
 *     the gain cap, the session cap, and — in infant mode — the live 1 kHz
 *     low-pass, a ≤50 dBA level and the 45-minute cap.
 *   - The limit ends with a dB-linear sleep fade (default 30 s) instead of a
 *     hard stop; a manual sleep fade is one click away.
 *   - OS audio interruptions flip the session to PAUSED instead of leaving a
 *     silent "running" state; Media Session + Wake Lock keep long sessions
 *     controllable and alive on phones.
 *   - Share links reproduce the whole setup on another device.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  checkPhaseGuardrails,
  renderPhase,
  renderSession,
  type EntrainmentMode,
  type NoiseColor,
  type Phase as EnginePhase,
} from '@/engine';
import { SoundDoseTracker } from '@/safety/dose';
import {
  DEFAULT_GOVERNOR_CONFIG,
  INFANT_MAX_LOWPASS_HZ,
  INFANT_MAX_SESSION_MIN,
  SafetyGovernor,
  type AuthorizationResult,
  type GovernorConfig,
} from '@/safety/governor';
import type { Preset, SessionSpec as DataSessionSpec } from '@/data/presets';
import type { Grade } from '@/data/frequencies';
import {
  deleteUserPreset,
  loadUserPresets,
  saveUserPreset,
  type UserPreset,
} from './userPresets';
import { LiveEngine, type GateShape, type Waveform } from '../audio/liveEngine';
import { MediaSessionBridge } from '../audio/mediaSession';
import {
  buildExportSpec,
  downloadBytes,
  exportFileName,
  renderExportAsync,
} from '../audio/renderExport';
import { useWakeLock } from '../hooks';
import { bandForBeat } from '../theme';
import {
  DBFS_TO_DBA_OFFSET,
  PREVIEW_MAX_SEC,
  beatAtTime,
  buildExportPhases,
  newUiPhase as newPhase,
  presetPreviewPhases,
  truncatePhases,
  type BowlLayer,
  type NatureLayer,
  type UiPhase,
} from './sessionMath';
import { ALL_NOISE_OFF, DEFAULT_FRONT_PANEL, INFANT_MAX_VOLUME_DB } from './sessionDefaults';
import { SessionCtx } from './useSession';
import type { ExportWavOptions, SessionActions, SessionSnapshot } from './types';
import {
  appendDose,
  loadDoseLog,
  loadFrontPanel,
  readAdvisoryAck,
  saveDoseLog,
  saveFrontPanel,
  writeAdvisoryAck,
  type DoseLogEntry,
  type FrontPanel,
} from './sessionPersistence';
import { encodeShare, shareFromHash, shareUrl, type ShareState } from './shareLink';

/** Merge a share payload over a front panel. */
function panelFromShare(base: FrontPanel, s: ShareState): FrontPanel {
  return {
    ...base,
    mode: s.mode,
    carrierHz: s.carrierHz,
    beatHz: s.phases[0]?.beatHz ?? base.beatHz,
    waveform: s.waveform,
    phases: s.phases.map((p) => newPhase(p.durationSec, p.beatHz)),
    noiseDb: { ...ALL_NOISE_OFF, ...s.noiseDb },
    noiseOn: s.noiseOn,
    nature: { ...s.nature },
    bowl: { ...s.bowl },
    layersOn: s.layersOn,
    limitMin: s.limitMin,
    fadeOutSec: s.fadeOutSec,
    presetName: s.presetName ?? 'Shared session',
    presetGrade: null,
  };
}

interface BootState {
  panel: FrontPanel;
  fromShare: boolean;
  advisoryAck: boolean;
  doseLog: DoseLogEntry[];
}

/** One-time boot: restore the persisted panel (or a share link), the dose log and the advisory flag. */
function boot(): BootState {
  const restored = loadFrontPanel(DEFAULT_FRONT_PANEL);
  const shared = typeof window !== 'undefined' ? shareFromHash(window.location.hash) : null;
  return {
    panel: shared ? panelFromShare(restored, shared) : restored,
    fromShare: shared !== null,
    advisoryAck: readAdvisoryAck(),
    doseLog: loadDoseLog(Date.now()),
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const bootRef = useRef<BootState | null>(null);
  if (!bootRef.current) bootRef.current = boot();
  const init = bootRef.current.panel;

  const engineRef = useRef<LiveEngine>(null as unknown as LiveEngine);
  const doseRef = useRef<SoundDoseTracker>(null as unknown as SoundDoseTracker);
  const doseLogRef = useRef<DoseLogEntry[]>(bootRef.current.doseLog);
  if (!engineRef.current) {
    const eng = new LiveEngine();
    // Push the restored panel into the engine before any node exists — it
    // remembers mixer/layer state and materializes it on the first start().
    eng.updateConfig({
      mode: init.mode,
      carrierHz: init.carrierHz,
      beatHz: init.beatHz,
      waveform: init.waveform,
      gateDuty: init.gateDuty,
      gateShape: init.gateShape,
    });
    eng.setOutputDb(init.volumeDb);
    for (const [color, db] of Object.entries(init.noiseDb) as [NoiseColor, number][]) eng.setNoiseLevel(color, db);
    eng.setNature(init.nature.on ? init.nature.kind : null, init.nature.db);
    eng.setBowl(init.bowl.on, init.bowl.lock ? init.carrierHz : init.bowl.baseHz, init.bowl.db);
    eng.setNoiseBypass(init.noiseOn);
    eng.setLayersBypass(init.layersOn);
    eng.setInfantFilter(init.infantMode);
    engineRef.current = eng;
  }
  if (!doseRef.current) {
    const tracker = new SoundDoseTracker('adult');
    for (const e of doseLogRef.current) {
      try {
        tracker.addExposure(e.dbA, e.seconds);
      } catch {
        /* a bad row never poisons the tracker */
      }
    }
    doseRef.current = tracker;
  }

  const [mode, setModeState] = useState<EntrainmentMode>(init.mode);
  const [carrierHz, setCarrierState] = useState(init.carrierHz);
  const [beatHz, setBeatState] = useState(init.beatHz);
  const [waveform, setWaveformState] = useState<Waveform>(init.waveform);
  const [phaseLock, setPhaseLock] = useState(init.phaseLock);
  const [gateDuty, setGateDutyState] = useState(init.gateDuty);
  const [gateShape, setGateShapeState] = useState<GateShape>(init.gateShape);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [interrupted, setInterrupted] = useState(false);
  const [fading, setFading] = useState(false);
  const [panicked, setPanicked] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [limitMin, setLimitMinState] = useState(init.limitMin);
  const [fadeOutSec, setFadeOutSecState] = useState(init.fadeOutSec);
  const [volumeDb, setVolumeDbState] = useState(init.volumeDb);
  const [muted, setMutedState] = useState(false);
  const [noiseDb, setNoiseDbState] = useState<Record<NoiseColor, number>>(init.noiseDb);
  const [noiseOn, setNoiseOnState] = useState(init.noiseOn);
  const [nature, setNatureState] = useState<NatureLayer>(init.nature);
  const [bowl, setBowlState] = useState<BowlLayer>(init.bowl);
  const [layersOn, setLayersOnState] = useState(init.layersOn);
  const [phases, setPhasesState] = useState<UiPhase[]>(init.phases);
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const [dosePercent, setDosePercent] = useState(() => doseRef.current.weeklyDosePercent());
  const [governor, setGovernorState] = useState<GovernorConfig>({
    ...DEFAULT_GOVERNOR_CONFIG,
    infantMode: init.infantMode,
    drivingWarningAcknowledged: bootRef.current.advisoryAck,
  });
  const [startBlocked, setStartBlocked] = useState<string[]>([]);
  const [advisoryOpen, setAdvisoryOpen] = useState(false);
  // Synchronous mirror of the acknowledgment so a START issued in the same
  // tick as the acknowledgment (the dialog's "I UNDERSTAND — START") never
  // reads a stale closure and re-opens the gate.
  const ackRef = useRef(bootRef.current.advisoryAck);
  const [presetName, setPresetName] = useState<string | null>(init.presetName);
  const [presetGrade, setPresetGrade] = useState<Grade | null>(init.presetGrade);
  const [dirty, setDirty] = useState(bootRef.current.fromShare);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  // MY PRESETS: localStorage-backed user saves (salvaged on corrupt reads).
  const [userPresets, setUserPresets] = useState<UserPreset[]>(() => loadUserPresets());
  // One-at-a-time preview playback (preset/experiment/cymatics previews).
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewStopRef = useRef<(() => void) | null>(null);
  const exportingRef = useRef(false);

  // Latest-value refs for the 1 s clock (avoids the v1 stale-closure limit bug).
  const limitRef = useRef(limitMin);
  limitRef.current = limitMin;
  const fadeRef = useRef(fadeOutSec);
  fadeRef.current = fadeOutSec;
  const phasesRef = useRef(phases);
  phasesRef.current = phases;
  const volumeRef = useRef(volumeDb);
  volumeRef.current = volumeDb;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const markDirty = useCallback(() => setDirty(true), []);
  /** Latest start() (declared below); read by acknowledgeAdvisory and the media session. */
  const startRef = useRef<() => boolean>(() => false);

  const pushConfig = useCallback(
    (patch: Partial<{ mode: EntrainmentMode; carrierHz: number; beatHz: number; waveform: Waveform; gateDuty: number; gateShape: GateShape }>) => {
      engineRef.current.updateConfig(patch);
    },
    [],
  );

  // Clear a consumed share hash so a reload does not re-apply it.
  useEffect(() => {
    if (!bootRef.current?.fromShare || typeof window === 'undefined') return;
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      /* ignore */
    }
  }, []);

  const persistDose = useCallback(() => {
    saveDoseLog(doseLogRef.current, Date.now());
  }, []);

  // ---- governor -------------------------------------------------------------
  const authorization = useMemo<AuthorizationResult>(() => {
    const gov = new SafetyGovernor(governor);
    return gov.authorizeSession({
      durationMin: limitMin,
      gainDbFs: muted ? -60 : volumeDb,
      lowpassHz: governor.infantMode ? INFANT_MAX_LOWPASS_HZ : undefined,
      autoShutoff: true,
      targetDbA: governor.infantMode ? volumeDb + DBFS_TO_DBA_OFFSET : undefined,
    });
  }, [governor, limitMin, volumeDb, muted]);

  // ---- transport -----------------------------------------------------------
  const start = useCallback((): boolean => {
    const eng = engineRef.current;
    if (!ackRef.current) {
      setAdvisoryOpen(true);
      return false;
    }
    eng.prepare();
    const gov = new SafetyGovernor({ ...governor, drivingWarningAcknowledged: true });
    const auth = gov.authorizeSession({
      durationMin: limitMin,
      gainDbFs: muted ? -60 : volumeDb,
      lowpassHz: governor.infantMode && eng.hasInfantFilter ? INFANT_MAX_LOWPASS_HZ : undefined,
      autoShutoff: true,
      targetDbA: governor.infantMode ? volumeDb + DBFS_TO_DBA_OFFSET : undefined,
    });
    if (!auth.ok) {
      setStartBlocked(auth.reasons);
      return false;
    }
    eng.setOutputDb(volumeDb);
    eng.setMuted(muted);
    eng.setInfantFilter(governor.infantMode);
    if (!eng.start()) {
      setStartBlocked(['Web Audio is unavailable in this browser.']);
      return false;
    }
    setStartBlocked([]);
    setRunning(true);
    setPaused(false);
    setInterrupted(false);
    setFading(false);
    setPanicked(false);
    return true;
  }, [governor, limitMin, volumeDb, muted]);

  const stop = useCallback(() => {
    engineRef.current.stop(0.3);
    setRunning(false);
    setPaused(false);
    setInterrupted(false);
    setFading(false);
    persistDose();
  }, [persistDose]);

  const togglePause = useCallback(() => {
    // Idle/panicked: nothing live to pause — no-op (Space stays inert).
    if (!running || panicked) return;
    if (paused) {
      engineRef.current.resume();
      setPaused(false);
      setInterrupted(false);
    } else {
      engineRef.current.pause();
      setPaused(true);
    }
  }, [running, panicked, paused]);

  const panic = useCallback(() => {
    // engine.panic() cuts tracked preview sources too; also clear the UI-side
    // preview handle (HTMLAudio stop fn + previewId).
    previewStopRef.current?.();
    previewStopRef.current = null;
    setPreviewId(null);
    engineRef.current.panic();
    setRunning(false);
    setPaused(false);
    setInterrupted(false);
    setFading(false);
    setPanicked(true);
    persistDose();
  }, [persistDose]);

  const rehearsePanic = useCallback(() => {
    // Test mode: same visual sequence, no engine bus is touched.
    setPanicked(true);
  }, []);

  const resumeSafely = useCallback(() => {
    const db = engineRef.current.resumeSafely();
    setVolumeDbState(db);
    setRunning(true);
    setPaused(false);
    setPanicked(false);
  }, []);

  const dismissPanic = useCallback(() => setPanicked(false), []);

  const startSleepFade = useCallback(
    (sec?: number): boolean => {
      const s = sec ?? fadeRef.current;
      if (s <= 0) {
        stop();
        return true;
      }
      const ok = engineRef.current.fadeOut(s);
      if (ok) setFading(true);
      return ok;
    },
    [stop],
  );

  const cancelSleepFade = useCallback(() => {
    engineRef.current.cancelFadeOut();
    setFading(false);
  }, []);

  const setFadeOutSec = useCallback((sec: number) => {
    setFadeOutSecState(Math.max(0, Math.min(600, Math.round(sec))));
  }, []);

  // ---- engine events: OS interruptions, fade landing ------------------------
  useEffect(() => {
    return engineRef.current.subscribe((ev) => {
      if (ev === 'interrupted') {
        setPaused(true);
        setInterrupted(true);
      } else if (ev === 'fade-done') {
        setRunning(false);
        setPaused(false);
        setFading(false);
        setElapsedSec(0);
        saveDoseLog(doseLogRef.current, Date.now());
      }
    });
  }, []);

  // ---- session clock / dose / limit / fade ----------------------------------
  useEffect(() => {
    // Paused: clock held (elapsed/dose freeze); resumes from `elapsedSec`.
    if (!running || paused) return;
    const t0 = Date.now();
    const base = elapsedSec;
    let ticks = 0;
    const iv = window.setInterval(() => {
      const now = Date.now();
      const next = base + (now - t0) / 1000;
      const limitSec = limitRef.current * 60;
      // Limit enforcement: sleep fade over the last `fadeOutSec`, then stop.
      if (next >= limitSec) {
        stop();
        setElapsedSec(0);
        return;
      }
      const fade = fadeRef.current;
      if (fade > 0 && !engineRef.current.isFading && next >= limitSec - fade) {
        if (engineRef.current.fadeOut(Math.max(1, limitSec - next))) setFading(true);
      }
      // Phase plan drives the live beat.
      const { beat, idx } = beatAtTime(phasesRef.current, next);
      setBeatState((cur) => {
        if (Math.abs(cur - beat) > 0.005) {
          pushConfig({ beatHz: beat });
          return Math.round(beat * 100) / 100;
        }
        return cur;
      });
      setActivePhaseIdx(idx);
      // H.870 dose accumulation (1 s tick at the current estimated level).
      if (!mutedRef.current) {
        const dbA = volumeRef.current + DBFS_TO_DBA_OFFSET;
        try {
          doseRef.current.addExposure(dbA, 1);
          appendDose(doseLogRef.current, dbA, 1, now);
        } catch {
          /* guard: never crash the clock */
        }
      }
      setDosePercent(doseRef.current.weeklyDosePercent());
      setElapsedSec(Math.floor(next));
      if (++ticks % 30 === 0) saveDoseLog(doseLogRef.current, now);
    }, 1000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, paused]);

  // ---- platform integrations ------------------------------------------------
  useWakeLock(running && !paused);

  startRef.current = start;
  const stopRef = useRef(stop);
  stopRef.current = stop;
  const togglePauseRef = useRef(togglePause);
  togglePauseRef.current = togglePause;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const runningRef = useRef(running);
  runningRef.current = running;
  const mediaRef = useRef<MediaSessionBridge | null>(null);
  if (!mediaRef.current) {
    mediaRef.current = new MediaSessionBridge({
      play: () => {
        if (runningRef.current && pausedRef.current) togglePauseRef.current();
        else if (!runningRef.current) startRef.current();
      },
      pause: () => {
        if (runningRef.current && !pausedRef.current) togglePauseRef.current();
      },
      stop: () => stopRef.current(),
    });
  }
  useEffect(() => {
    const m = mediaRef.current!;
    const info = {
      title: presetName ?? 'Open Sync session',
      artist: `${mode.toUpperCase()} · ${beatHz.toFixed(2)} Hz`,
    };
    if (running && !paused) m.activate(info);
    else if (running && paused) m.pause(info);
    else m.deactivate();
  }, [running, paused, presetName, mode, beatHz]);
  useEffect(() => () => mediaRef.current?.deactivate(), []);

  // ---- front-panel persistence (debounced) -----------------------------------
  useEffect(() => {
    const t = window.setTimeout(() => {
      saveFrontPanel({
        mode,
        carrierHz,
        beatHz,
        waveform,
        phaseLock,
        gateDuty,
        gateShape,
        limitMin,
        volumeDb,
        noiseDb,
        noiseOn,
        nature,
        bowl,
        layersOn,
        phases,
        presetName,
        presetGrade,
        fadeOutSec,
        infantMode: governor.infantMode,
      });
    }, 250);
    return () => window.clearTimeout(t);
  }, [
    mode, carrierHz, beatHz, waveform, phaseLock, gateDuty, gateShape, limitMin, volumeDb, noiseDb, noiseOn,
    nature, bowl, layersOn, phases, presetName, presetGrade, fadeOutSec, governor.infantMode,
  ]);

  // ---- advisory -----------------------------------------------------------------
  const acknowledgeAdvisory = useCallback(
    (opts: { andStart?: boolean } = {}) => {
      ackRef.current = true;
      writeAdvisoryAck();
      setGovernorState((cur) => ({ ...cur, drivingWarningAcknowledged: true }));
      setAdvisoryOpen(false);
      // Continue into the session the user asked for — same tick, no stale closure.
      if (opts.andStart) startRef.current();
    },
    [],
  );
  const openAdvisory = useCallback(() => setAdvisoryOpen(true), []);
  const closeAdvisory = useCallback(() => setAdvisoryOpen(false), []);

  // ---- config setters -------------------------------------------------------
  const setMode = useCallback(
    (m: EntrainmentMode) => {
      setModeState(m);
      pushConfig({ mode: m });
      markDirty();
    },
    [pushConfig, markDirty],
  );
  const setCarrierHz = useCallback(
    (hz: number) => {
      const clamped = Math.min(1000, Math.max(20, hz));
      setCarrierState(clamped);
      pushConfig({ carrierHz: clamped });
      markDirty();
    },
    [pushConfig, markDirty],
  );
  const setBeatHz = useCallback(
    (hz: number) => {
      const clamped = Math.min(80, Math.max(0.1, hz));
      setBeatState(clamped);
      pushConfig({ beatHz: clamped });
      markDirty();
    },
    [pushConfig, markDirty],
  );
  const setWaveform = useCallback(
    (w: Waveform) => {
      setWaveformState(w);
      pushConfig({ waveform: w });
      markDirty();
    },
    [pushConfig, markDirty],
  );
  const setGateDuty = useCallback(
    (d: number) => {
      setGateDutyState(d);
      pushConfig({ gateDuty: d });
    },
    [pushConfig],
  );
  const setGateShape = useCallback(
    (s: GateShape) => {
      setGateShapeState(s);
      pushConfig({ gateShape: s });
    },
    [pushConfig],
  );
  const setNoiseDb = useCallback((color: NoiseColor, db: number) => {
    setNoiseDbState((cur) => ({ ...cur, [color]: db }));
    engineRef.current.setNoiseLevel(color, db);
    setDirty(true);
  }, []);
  // Section bypass: a click-free ramp on the engine's section bus — fader
  // positions are kept, so re-enabling restores the exact mix.
  const setNoiseOn = useCallback((on: boolean) => {
    setNoiseOnState(on);
    engineRef.current.setNoiseBypass(on);
    setDirty(true);
  }, []);
  const setNature = useCallback((patch: Partial<NatureLayer>) => {
    setNatureState((cur) => {
      const next = { ...cur, ...patch };
      engineRef.current.setNature(next.on ? next.kind : null, next.db);
      return next;
    });
    setDirty(true);
  }, []);
  const setBowl = useCallback((patch: Partial<BowlLayer>) => {
    setBowlState((cur) => {
      const next = { ...cur, ...patch };
      engineRef.current.setBowl(next.on, next.lock ? 0 : next.baseHz, next.db);
      return next;
    });
    setDirty(true);
  }, []);
  // Section bypass for the nature/bowl layers: click-free ramp on the
  // engine's layer bus; per-layer settings are kept for re-enable.
  const setLayersOn = useCallback((on: boolean) => {
    setLayersOnState(on);
    engineRef.current.setLayersBypass(on);
    setDirty(true);
  }, []);
  // Bowl "detune to carrier" lock.
  useEffect(() => {
    if (bowl.on && bowl.lock) engineRef.current.setBowl(true, carrierHz, bowl.db);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrierHz, bowl.lock, bowl.on]);
  const setVolumeDb = useCallback(
    (db: number) => {
      // The governor gain cap (−6 dBFS default) and the infant ceiling are
      // enforced at the fader, not only at START.
      const cap = governor.infantMode ? Math.min(governor.maxGainDbFs, INFANT_MAX_VOLUME_DB) : governor.maxGainDbFs;
      const clamped = Math.max(-60, Math.min(cap, db));
      setVolumeDbState(clamped);
      engineRef.current.setOutputDb(clamped);
    },
    [governor.infantMode, governor.maxGainDbFs],
  );
  const setMuted = useCallback((m: boolean) => {
    setMutedState(m);
    engineRef.current.setMuted(m);
  }, []);
  const setLimitMin = useCallback(
    (min: number) => {
      // Limits only tighten live; loosening applies next session (safety spec).
      const cap = governor.infantMode ? Math.min(governor.maxSessionMin, INFANT_MAX_SESSION_MIN) : governor.maxSessionMin;
      const clamped = Math.max(1, Math.min(cap, Math.round(min)));
      if (!running || clamped < limitMin) setLimitMinState(clamped);
    },
    [running, limitMin, governor.infantMode, governor.maxSessionMin],
  );
  const setGovernor = useCallback((patch: Partial<GovernorConfig>) => {
    setGovernorState((cur) => {
      const next = { ...cur, ...patch };
      if (patch.infantMode !== undefined && patch.infantMode !== cur.infantMode) {
        engineRef.current.setInfantFilter(patch.infantMode);
        if (patch.infantMode) {
          // Infant mode tightens the level and session caps immediately.
          setVolumeDbState((v) => {
            const clamped = Math.min(v, INFANT_MAX_VOLUME_DB);
            engineRef.current.setOutputDb(clamped);
            return clamped;
          });
          setLimitMinState((l) => Math.min(l, INFANT_MAX_SESSION_MIN));
        }
      }
      if (patch.maxGainDbFs !== undefined) {
        setVolumeDbState((v) => {
          const clamped = Math.min(v, next.maxGainDbFs);
          engineRef.current.setOutputDb(clamped);
          return clamped;
        });
      }
      return next;
    });
  }, []);
  const setPhases = useCallback((p: UiPhase[]) => {
    setPhasesState(p.slice(0, 8));
    setDirty(true);
  }, []);

  // ---- user presets (Studio "SAVE AS PRESET") -------------------------------
  const saveCurrentAsPreset = useCallback(
    (name: string): UserPreset => {
      // Snapshot the front panel as a data-layer SessionSpec: per-phase beat,
      // current carrier/mode, unity gain (the fader is a playback control,
      // not part of the saved stimulus).
      const spec: DataSessionSpec = {
        autoShutoff: true,
        phases: phases.map((p, i) => ({
          name: `phase-${i + 1}`,
          durationSec: p.durationSec,
          carrierHz,
          beatHz: p.beatHz,
          gainDbFs: 0,
          mode,
        })),
      };
      const result = saveUserPreset(name, spec);
      setUserPresets(result.presets);
      setPresetName(result.preset.name);
      setPresetGrade(null);
      setDirty(false);
      return result.preset;
    },
    [phases, carrierHz, mode],
  );

  const deleteUserPresetById = useCallback((id: string) => {
    setUserPresets(deleteUserPreset(id));
  }, []);

  // ---- loading --------------------------------------------------------------
  const loadPreset = useCallback(
    (preset: Preset) => {
      const first = preset.spec.phases[0];
      if (first) {
        setCarrierState(first.carrierHz);
        setBeatState(first.beatHz);
        pushConfig({ carrierHz: first.carrierHz, beatHz: first.beatHz });
      }
      setPhasesState(
        preset.spec.phases.slice(0, 8).map((p) => newPhase(p.durationSec, p.beatHz)),
      );
      setPresetName(preset.title);
      setPresetGrade(preset.grade);
      setDirty(false);
    },
    [pushConfig],
  );

  const loadFrequency = useCallback(
    (hz: number, name?: string) => {
      // Sub-40 Hz values load as a beat at a 200 Hz carrier; audible ones as carrier.
      if (hz <= 40) {
        setCarrierState(200);
        setBeatState(hz);
        pushConfig({ carrierHz: 200, beatHz: hz });
        setPhasesState([newPhase(20 * 60, hz)]);
      } else {
        setCarrierState(Math.min(1000, hz));
        pushConfig({ carrierHz: Math.min(1000, hz) });
      }
      setPresetName(name ?? null);
      setPresetGrade(null);
      setDirty(false);
    },
    [pushConfig],
  );

  const applyShare = useCallback(
    (s: ShareState) => {
      const panel = panelFromShare(DEFAULT_FRONT_PANEL, s);
      setModeState(panel.mode);
      setCarrierState(panel.carrierHz);
      setBeatState(panel.beatHz);
      setWaveformState(panel.waveform);
      pushConfig({ mode: panel.mode, carrierHz: panel.carrierHz, beatHz: panel.beatHz, waveform: panel.waveform });
      setPhasesState(panel.phases);
      setNoiseDbState(panel.noiseDb);
      for (const [color, db] of Object.entries(panel.noiseDb) as [NoiseColor, number][]) engineRef.current.setNoiseLevel(color, db);
      setNoiseOnState(panel.noiseOn);
      engineRef.current.setNoiseBypass(panel.noiseOn);
      setNatureState(panel.nature);
      engineRef.current.setNature(panel.nature.on ? panel.nature.kind : null, panel.nature.db);
      setBowlState(panel.bowl);
      engineRef.current.setBowl(panel.bowl.on, panel.bowl.lock ? panel.carrierHz : panel.bowl.baseHz, panel.bowl.db);
      setLayersOnState(panel.layersOn);
      engineRef.current.setLayersBypass(panel.layersOn);
      if (!running) setLimitMinState(panel.limitMin);
      setFadeOutSecState(panel.fadeOutSec);
      setPresetName(panel.presetName);
      setPresetGrade(null);
      setDirty(true);
    },
    [pushConfig, running],
  );

  const resetFrontPanel = useCallback(() => {
    const d = DEFAULT_FRONT_PANEL;
    setModeState(d.mode);
    setCarrierState(d.carrierHz);
    setBeatState(d.beatHz);
    setWaveformState(d.waveform);
    setPhaseLock(d.phaseLock);
    setGateDutyState(d.gateDuty);
    setGateShapeState(d.gateShape);
    pushConfig({ mode: d.mode, carrierHz: d.carrierHz, beatHz: d.beatHz, waveform: d.waveform, gateDuty: d.gateDuty, gateShape: d.gateShape });
    setPhasesState([newPhase(8 * 60, 10), newPhase(20 * 60, 6), newPhase(62 * 60, 4)]);
    setNoiseDbState(ALL_NOISE_OFF);
    for (const color of Object.keys(ALL_NOISE_OFF) as NoiseColor[]) engineRef.current.setNoiseLevel(color, -Infinity);
    setNoiseOnState(true);
    engineRef.current.setNoiseBypass(true);
    setNatureState(d.nature);
    engineRef.current.setNature(null, d.nature.db);
    setBowlState(d.bowl);
    engineRef.current.setBowl(false, d.bowl.baseHz, d.bowl.db);
    setLayersOnState(true);
    engineRef.current.setLayersBypass(true);
    if (!running) setLimitMinState(d.limitMin);
    setFadeOutSecState(d.fadeOutSec);
    setVolumeDbState(d.volumeDb);
    engineRef.current.setOutputDb(d.volumeDb);
    setPresetName(null);
    setPresetGrade(null);
    setDirty(false);
  }, [pushConfig, running]);

  const getShareLink = useCallback((): string => {
    const state: ShareState = {
      mode,
      carrierHz,
      waveform,
      phases: phases.map((p) => ({ durationSec: p.durationSec, beatHz: p.beatHz })),
      noiseDb: Object.fromEntries(Object.entries(noiseDb).filter(([, db]) => Number.isFinite(db))) as Partial<Record<NoiseColor, number>>,
      noiseOn,
      nature,
      bowl,
      layersOn,
      limitMin,
      fadeOutSec,
      presetName: presetName ?? undefined,
    };
    if (typeof window === 'undefined') return `#s=${encodeShare(state)}`;
    return shareUrl(state, window.location.origin, import.meta.env.BASE_URL);
  }, [mode, carrierHz, waveform, phases, noiseDb, noiseOn, nature, bowl, layersOn, limitMin, fadeOutSec, presetName]);

  const previewHz = useCallback((hz: number) => {
    // Inaudible values (< 40 Hz) preview as a binaural beat on a 200 Hz carrier.
    const phase: EnginePhase =
      hz <= 40
        ? { durationSec: 2.5, carrierHz: 200, beatHz: Math.max(0.1, hz), mode: 'binaural', gainDb: -14 }
        : { durationSec: 2.5, carrierHz: Math.min(1200, hz), beatHz: 0, mode: 'monaural', gainDb: -14 };
    const r = renderPhase(phase, 48000);
    engineRef.current.playBuffer(r.left, r.right, 48000, -12);
  }, []);

  // ---- previews (≤30 s, never dose-debited — the dose clock only ticks while
  // a session is running, and previews never call start()) -------------------
  const stopPreview = useCallback(() => {
    previewStopRef.current?.();
    previewStopRef.current = null;
    engineRef.current.stopPreviews();
    setPreviewId(null);
  }, []);

  const startPreview = useCallback((id: string, startFn: () => (() => void) | void) => {
    // One preview at a time: stop whatever is playing first.
    previewStopRef.current?.();
    previewStopRef.current = null;
    engineRef.current.stopPreviews();
    const stopFn = startFn();
    previewStopRef.current = typeof stopFn === 'function' ? stopFn : null;
    setPreviewId(id);
  }, []);

  const togglePreview = useCallback(
    (id: string, startFn: () => (() => void) | void) => {
      if (previewId === id) stopPreview();
      else startPreview(id, startFn);
    },
    [previewId, startPreview, stopPreview],
  );

  const previewPhases = useCallback(
    (id: string, phases: readonly EnginePhase[], maxSec: number = PREVIEW_MAX_SEC) => {
      if (previewId === id) {
        stopPreview();
        return;
      }
      const truncated = truncatePhases(phases, Math.min(30, maxSec));
      if (truncated.length === 0) return;
      const r = renderSession({ name: 'preview', phases: truncated, crossfadeSec: 0.5, masterGainDb: -6 });
      if (r.left.length === 0) return;
      const sr = r.manifest.sampleRate;
      // Previews respect the governor gain cap (quiet hours / infant mode).
      const db = Math.min(-12, governor.maxGainDbFs);
      startPreview(id, () => {
        engineRef.current.playBuffer(r.left, r.right, sr, db, () =>
          setPreviewId((cur) => (cur === id ? null : cur)),
        );
      });
    },
    [previewId, governor.maxGainDbFs, startPreview, stopPreview],
  );

  const previewPreset = useCallback(
    (preset: Preset) => {
      previewPhases(`preset:${preset.id}`, presetPreviewPhases(preset));
    },
    [previewPhases],
  );

  const previewUrl = useCallback(
    (id: string, url: string) => {
      if (previewId === id) {
        stopPreview();
        return;
      }
      // Governor gain cap applied as HTMLAudio volume (engine previews use the
      // same min(−12 dB, cap) rule). File previews are ≤30 s renders and never
      // touch the dose clock; panic()/stopPreview() cut them via the stop fn.
      const db = Math.min(-12, governor.maxGainDbFs);
      startPreview(id, () => {
        const audio = new Audio(url);
        audio.volume = Math.min(1, Math.pow(10, db / 20));
        const clearIfCurrent = () => setPreviewId((cur) => (cur === id ? null : cur));
        audio.onended = clearIfCurrent;
        audio.onerror = clearIfCurrent;
        void audio.play().catch(clearIfCurrent);
        return () => {
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
          audio.src = '';
        };
      });
    },
    [previewId, governor.maxGainDbFs, startPreview, stopPreview],
  );

  const previewTone = useCallback(
    (id: string, hz: number, durSec = 30) => {
      if (previewId === id) {
        stopPreview();
        return;
      }
      const carrier = Math.min(1200, Math.max(20, hz));
      const dur = Math.min(30, Math.max(1, durSec));
      const r = renderPhase(
        { durationSec: dur, carrierHz: carrier, beatHz: 0, mode: 'monaural', gainDb: Math.min(-14, governor.maxGainDbFs) },
        48000,
      );
      const db = Math.min(-12, governor.maxGainDbFs);
      startPreview(id, () => {
        engineRef.current.playBuffer(r.left, r.right, 48000, db, () =>
          setPreviewId((cur) => (cur === id ? null : cur)),
        );
      });
    },
    [previewId, governor.maxGainDbFs, startPreview, stopPreview],
  );

  // ---- export (off-thread; honors the session limit) --------------------------
  const exportWav = useCallback(
    async (options: ExportWavOptions = {}): Promise<boolean> => {
      if (exportingRef.current) return false;
      exportingRef.current = true;
      setExporting(true);
      setExportError(null);
      try {
        // Bypassed sections are omitted from the export (see buildExportPhases).
        const enginePhases = buildExportPhases(phases, carrierHz, mode, { noiseDb, noiseOn, nature, bowl, layersOn });
        const spec = buildExportSpec(presetName ?? 'Open Sync session', enginePhases, { maxSec: limitMin * 60, masterGainDb: -6 });
        const format = options.format ?? 'pcm16';
        const result = await renderExportAsync(spec, format);
        downloadBytes(result.wav, exportFileName(presetName, format));
        return true;
      } catch (e) {
        setExportError(e instanceof Error ? e.message : 'Export failed');
        return false;
      } finally {
        exportingRef.current = false;
        setExporting(false);
      }
    },
    [phases, carrierHz, mode, noiseDb, noiseOn, bowl, nature, layersOn, presetName, limitMin],
  );

  // ---- warnings (engine guardrails) ------------------------------------------
  const warnings = useMemo(() => {
    const w = checkPhaseGuardrails(
      { durationSec: 60, carrierHz, beatHz, mode, gainDb: 0 },
      48000,
    );
    if (waveform === 'square') w.push('square wave: harmonics — check THD in Analyzer');
    return w;
  }, [carrierHz, beatHz, mode, waveform]);

  const value = useMemo<SessionSnapshot & SessionActions>(
    () => ({
      mode,
      carrierHz,
      beatHz,
      waveform,
      phaseLock,
      gateDuty,
      gateShape,
      running,
      paused,
      interrupted,
      fading,
      panicked,
      elapsedSec,
      limitMin,
      fadeOutSec,
      volumeDb,
      muted,
      band: bandForBeat(beatHz),
      warnings,
      noiseDb,
      noiseOn,
      nature,
      bowl,
      layersOn,
      phases,
      activePhaseIdx,
      dosePercent,
      estDbA: volumeDb + DBFS_TO_DBA_OFFSET,
      governor,
      authorization,
      startBlocked,
      advisoryAcknowledged: governor.drivingWarningAcknowledged,
      advisoryOpen,
      presetName,
      presetGrade,
      dirty,
      userPresets,
      exporting,
      exportError,
      previewId,
      togglePreview,
      stopPreview,
      previewPreset,
      previewPhases,
      previewUrl,
      previewTone,
      start,
      stop,
      togglePause,
      panic,
      rehearsePanic,
      resumeSafely,
      dismissPanic,
      startSleepFade,
      cancelSleepFade,
      setFadeOutSec,
      acknowledgeAdvisory,
      openAdvisory,
      closeAdvisory,
      setMode,
      setCarrierHz,
      setBeatHz,
      setWaveform,
      setPhaseLock,
      setGateDuty,
      setGateShape,
      setNoiseDb,
      setNoiseOn,
      setNature,
      setBowl,
      setLayersOn,
      setVolumeDb,
      setMuted,
      setLimitMin,
      setGovernor,
      setPhases,
      saveCurrentAsPreset,
      deleteUserPreset: deleteUserPresetById,
      loadPreset,
      loadFrequency,
      previewHz,
      exportWav,
      getShareLink,
      applyShare,
      resetFrontPanel,
      engineRef,
    }),
    [
      mode, carrierHz, beatHz, waveform, phaseLock, gateDuty, gateShape, running, paused, interrupted, fading, panicked,
      elapsedSec, limitMin, fadeOutSec, volumeDb, muted, warnings, noiseDb, noiseOn, nature, bowl, layersOn, phases,
      activePhaseIdx, dosePercent, governor, authorization, startBlocked, advisoryOpen, presetName, presetGrade, dirty,
      userPresets, exporting, exportError, previewId, togglePreview, stopPreview, previewPreset, previewPhases,
      previewUrl, previewTone, start, stop, togglePause, panic, rehearsePanic, resumeSafely, dismissPanic,
      startSleepFade, cancelSleepFade, setFadeOutSec, acknowledgeAdvisory, openAdvisory, closeAdvisory, setMode,
      setCarrierHz, setBeatHz, setWaveform, setGateDuty, setGateShape, setNoiseDb, setNoiseOn, setNature, setBowl,
      setLayersOn, setVolumeDb, setMuted, setLimitMin, setGovernor, setPhases, saveCurrentAsPreset,
      deleteUserPresetById, loadPreset, loadFrequency, previewHz, exportWav, getShareLink, applyShare, resetFrontPanel,
    ],
  );

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

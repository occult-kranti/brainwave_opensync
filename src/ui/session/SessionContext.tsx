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

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  MAX_SESSION_MIN,
  SafetyGovernor,
  clampSessionCap,
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
  BELL_DB,
  DBFS_TO_DBA_OFFSET,
  PREVIEW_MAX_SEC,
  beatAtTime,
  bellVoiceFrom,
  buildExportPhases,
  liveBowlsFrom,
  newBowlLayer,
  newUiPhase as newPhase,
  presetPreviewPhases,
  truncatePhases,
  type BowlLayer,
  type NatureLayer,
  type UiPhase,
} from './sessionMath';
import { MAX_BOWLS } from '@/engine';
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
import { STORAGE_KEYS, removeKey } from '@/lib/storage';
import { flushDeferredPwaReload, setPwaReloadGuard } from '@/app/pwa';
import { encodeShare, shareFromHash, shareUrl, type ShareState } from './shareLink';

/** Merge a share payload over a front panel. A share never loosens the infant caps of the panel it lands on. */
function panelFromShare(base: FrontPanel, s: ShareState): FrontPanel {
  const limitCap = base.infantMode ? Math.min(base.sessionCapMin, INFANT_MAX_SESSION_MIN) : base.sessionCapMin;
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
    bowls: s.bowls.slice(0, MAX_BOWLS).map((b) => newBowlLayer(b)),
    bellEveryMin: s.bellEveryMin,
    layersOn: s.layersOn,
    limitMin: Math.min(s.limitMin, limitCap),
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

/**
 * Build the live engine pre-loaded with the restored panel: it remembers
 * mixer/layer state before any node exists and materializes it on the first
 * start().
 */
function createEngine(init: FrontPanel): LiveEngine {
  const eng = new LiveEngine();
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
  eng.setBowls(liveBowlsFrom(init.bowls, init.carrierHz));
  eng.setNoiseBypass(init.noiseOn);
  eng.setLayersBypass(init.layersOn);
  eng.setInfantFilter(init.infantMode);
  return eng;
}

/** Rebuild the H.870 tracker from the persisted 7-day log (a bad row never poisons it). */
function createDoseTracker(log: readonly DoseLogEntry[]): SoundDoseTracker {
  const tracker = new SoundDoseTracker('adult');
  for (const e of log) {
    try {
      tracker.addExposure(e.dbA, e.seconds);
    } catch {
      /* skip */
    }
  }
  return tracker;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  // One-time boot and the two singletons live in lazy state initializers:
  // they run exactly once and are never read back through a ref during
  // render (react-hooks/refs).
  const [bootState] = useState(boot);
  const init = bootState.panel;
  const [engine] = useState(() => createEngine(init));
  const [doseTracker] = useState(() => createDoseTracker(bootState.doseLog));
  const engineRef = useRef<LiveEngine>(engine);
  const doseRef = useRef<SoundDoseTracker>(doseTracker);
  const doseLogRef = useRef<DoseLogEntry[]>(bootState.doseLog);

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
  const [fadeEndsAtSec, setFadeEndsAtSec] = useState<number | null>(null);
  const [panicked, setPanicked] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [limitMin, setLimitMinState] = useState(init.limitMin);
  const [fadeOutSec, setFadeOutSecState] = useState(init.fadeOutSec);
  const [volumeDb, setVolumeDbState] = useState(init.volumeDb);
  const [muted, setMutedState] = useState(false);
  const [noiseDb, setNoiseDbState] = useState<Record<NoiseColor, number>>(init.noiseDb);
  const [noiseOn, setNoiseOnState] = useState(init.noiseOn);
  const [nature, setNatureState] = useState<NatureLayer>(init.nature);
  const [bowls, setBowlsState] = useState<BowlLayer[]>(init.bowls);
  const [bellEveryMin, setBellEveryMinState] = useState(init.bellEveryMin);
  /** Same-tick mirror of the bowl set: every bowl setter writes it before React renders. */
  const bowlsRef = useRef<BowlLayer[]>(init.bowls);
  const bellRef = useRef(init.bellEveryMin);
  /** Index of the last interval-bell period that rang (−1 = ring at the first tick). */
  const lastBellIdxRef = useRef(-1);
  const [layersOn, setLayersOnState] = useState(init.layersOn);
  const [phases, setPhasesState] = useState<UiPhase[]>(init.phases);
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const [dosePercent, setDosePercent] = useState(() => doseTracker.weeklyDosePercent());
  const [governor, setGovernorState] = useState<GovernorConfig>({
    ...DEFAULT_GOVERNOR_CONFIG,
    maxSessionMin: clampSessionCap(init.sessionCapMin),
    infantMode: init.infantMode,
    drivingWarningAcknowledged: bootState.advisoryAck,
  });
  const [startBlocked, setStartBlocked] = useState<string[]>([]);
  const [advisoryOpen, setAdvisoryOpen] = useState(false);
  const [advisoryPendingStart, setAdvisoryPendingStart] = useState(false);
  // Synchronous mirror of the acknowledgment so a START issued in the same
  // tick as the acknowledgment (the dialog's "I UNDERSTAND — START") never
  // reads a stale closure and re-opens the gate.
  const ackRef = useRef(bootState.advisoryAck);
  const [presetName, setPresetName] = useState<string | null>(init.presetName);
  const [presetGrade, setPresetGrade] = useState<Grade | null>(init.presetGrade);
  const [dirty, setDirty] = useState(bootState.fromShare);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  // MY PRESETS: localStorage-backed user saves (salvaged on corrupt reads).
  const [userPresets, setUserPresets] = useState<UserPreset[]>(() => loadUserPresets());
  // One-at-a-time preview playback (preset/experiment/cymatics previews).
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewStopRef = useRef<(() => void) | null>(null);
  const exportingRef = useRef(false);

  // Latest-value refs. They are updated synchronously inside the setters (not
  // only after render) so a same-tick `setVolumeDb(x); setLimitMin(y); start()`
  // — the Quick Lab arm launcher — authorizes and starts with the new values,
  // and the 1 s clock never reads a stale limit.
  // Re-synced after every commit in a layout effect (so any state writer
  // keeps them current before an event handler or timer can run) AND written
  // inside the setters (so a same-tick read is exact).
  const limitRef = useRef(limitMin);
  const fadeRef = useRef(fadeOutSec);
  const phasesRef = useRef(phases);
  const volumeRef = useRef(volumeDb);
  const mutedRef = useRef(muted);
  /** True when the panic that opened the overlay cut a live session (vs. a rehearsal). */
  const panicWasLiveRef = useRef(false);
  const carrierRef = useRef(carrierHz);
  const governorRef = useRef(governor);
  const elapsedRef = useRef(elapsedSec);
  const runningRef = useRef(running);
  const pausedRef = useRef(paused);
  useLayoutEffect(() => {
    limitRef.current = limitMin;
    fadeRef.current = fadeOutSec;
    phasesRef.current = phases;
    volumeRef.current = volumeDb;
    mutedRef.current = muted;
    carrierRef.current = carrierHz;
    governorRef.current = governor;
    elapsedRef.current = elapsedSec;
    runningRef.current = running;
    pausedRef.current = paused;
  });
  /** The limit fade is issued at most once per session (a cancel must not re-arm it every tick). */
  const limitFadeIssuedRef = useRef(false);

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
    if (!bootState.fromShare || typeof window === 'undefined') return;
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      /* ignore */
    }
  }, [bootState.fromShare]);

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
  /**
   * Governor check for a live session at `gainDb` with the latest limit /
   * mute / infant state. Reads refs, never closures, so it is exact in the
   * same tick as the setters that preceded it. Shared by start() and
   * resumeSafely().
   */
  const authorizeLive = useCallback((gainDb: number): AuthorizationResult => {
    const eng = engineRef.current;
    const gov = governorRef.current;
    eng.prepare();
    return new SafetyGovernor({ ...gov, drivingWarningAcknowledged: ackRef.current }).authorizeSession({
      durationMin: limitRef.current,
      gainDbFs: mutedRef.current ? -60 : gainDb,
      lowpassHz: gov.infantMode && eng.hasInfantFilter ? INFANT_MAX_LOWPASS_HZ : undefined,
      autoShutoff: true,
      targetDbA: gov.infantMode ? gainDb + DBFS_TO_DBA_OFFSET : undefined,
    });
  }, []);

  const start = useCallback((): boolean => {
    const eng = engineRef.current;
    // Already live: START is a no-op (never reset a running session's clock).
    if (runningRef.current) return true;
    if (!ackRef.current) {
      setAdvisoryPendingStart(true);
      setAdvisoryOpen(true);
      return false;
    }
    const auth = authorizeLive(volumeRef.current);
    if (!auth.ok) {
      setStartBlocked(auth.reasons);
      return false;
    }
    eng.setOutputDb(volumeRef.current);
    eng.setMuted(mutedRef.current);
    eng.setInfantFilter(governorRef.current.infantMode);
    if (!eng.start()) {
      setStartBlocked(['Web Audio is unavailable in this browser.']);
      return false;
    }
    // A fresh session starts its clock, phase plan and limit fade from zero.
    runningRef.current = true;
    pausedRef.current = false;
    limitFadeIssuedRef.current = false;
    lastBellIdxRef.current = -1;
    elapsedRef.current = 0;
    setElapsedSec(0);
    setActivePhaseIdx(0);
    setFadeEndsAtSec(null);
    setStartBlocked([]);
    setRunning(true);
    setPaused(false);
    setInterrupted(false);
    setFading(false);
    setPanicked(false);
    return true;
  }, [authorizeLive]);

  const stop = useCallback(() => {
    engineRef.current.stop(0.3);
    runningRef.current = false;
    pausedRef.current = false;
    setRunning(false);
    setPaused(false);
    setInterrupted(false);
    setFading(false);
    setFadeEndsAtSec(null);
    // A rehearsal or a real panic must never survive a normal STOP.
    setPanicked(false);
    persistDose();
  }, [persistDose]);

  const togglePause = useCallback(() => {
    // Idle/panicked: nothing live to pause — no-op (Space stays inert).
    if (!running || panicked) return;
    if (paused) {
      engineRef.current.resume();
      pausedRef.current = false;
      setPaused(false);
      setInterrupted(false);
    } else {
      // The engine drops an active fade on pause (fade-cancelled) — mirror it.
      engineRef.current.pause();
      pausedRef.current = true;
      setPaused(true);
      setFading(false);
      setFadeEndsAtSec(null);
    }
  }, [running, panicked, paused]);

  const panic = useCallback(() => {
    // engine.panic() cuts tracked preview sources too; also clear the UI-side
    // preview handle (HTMLAudio stop fn + previewId).
    previewStopRef.current?.();
    previewStopRef.current = null;
    setPreviewId(null);
    panicWasLiveRef.current = runningRef.current;
    engineRef.current.panic();
    runningRef.current = false;
    pausedRef.current = false;
    setRunning(false);
    setPaused(false);
    setInterrupted(false);
    setFading(false);
    setPanicked(true);
    persistDose();
  }, [persistDose]);

  const rehearsePanic = useCallback(() => {
    // Test mode: same visual sequence, no engine bus is touched. Never while a
    // session is live — a rehearsal there would freeze pause/resume.
    if (runningRef.current) return;
    panicWasLiveRef.current = false;
    setPanicked(true);
  }, []);

  /**
   * Resume after a panic at −12 dB below the previous level. Goes through the
   * same gate as START: advisory acknowledgment, then the governor with the
   * lowered level (a rehearsal from a fresh device must not start unchecked).
   * The session clock continues from where the panic cut it — the limit is a
   * budget, and the time already listened counts.
   */
  const resumeSafely = useCallback(() => {
    if (!ackRef.current) {
      setPanicked(false);
      setAdvisoryPendingStart(true);
      setAdvisoryOpen(true);
      return;
    }
    const target = Math.max(-60, volumeRef.current - 12);
    const auth = authorizeLive(target);
    if (!auth.ok) {
      setPanicked(false);
      setStartBlocked(auth.reasons);
      return;
    }
    engineRef.current.setInfantFilter(governorRef.current.infantMode);
    const db = engineRef.current.resumeSafely();
    volumeRef.current = db;
    runningRef.current = true;
    pausedRef.current = false;
    if (!panicWasLiveRef.current) {
      // Resuming from a rehearsal (or after a normal STOP) is a fresh session:
      // only a panic that cut a live session continues that session's budget.
      limitFadeIssuedRef.current = false;
      lastBellIdxRef.current = -1;
      elapsedRef.current = 0;
      setElapsedSec(0);
      setActivePhaseIdx(0);
      setFadeEndsAtSec(null);
    }
    panicWasLiveRef.current = false;
    setVolumeDbState(db);
    setStartBlocked([]);
    setRunning(true);
    setPaused(false);
    setInterrupted(false);
    setPanicked(false);
  }, [authorizeLive]);

  const dismissPanic = useCallback(() => setPanicked(false), []);

  const startSleepFade = useCallback(
    (sec?: number): boolean => {
      const s = sec ?? fadeRef.current;
      if (s <= 0) {
        stop();
        return true;
      }
      const ok = engineRef.current.fadeOut(s);
      if (ok) {
        setFading(true);
        setFadeEndsAtSec(elapsedRef.current + s);
      }
      return ok;
    },
    [stop],
  );

  const cancelSleepFade = useCallback(() => {
    engineRef.current.cancelFadeOut();
    setFading(false);
    setFadeEndsAtSec(null);
  }, []);

  const setFadeOutSec = useCallback((sec: number) => {
    setFadeOutSecState(Math.max(0, Math.min(600, Math.round(sec))));
  }, []);

  // ---- engine events: OS interruptions, fade landing ------------------------
  useEffect(() => {
    return engineRef.current.subscribe((ev) => {
      if (ev === 'interrupted') {
        pausedRef.current = true;
        setPaused(true);
        setInterrupted(true);
        setFading(false);
        setFadeEndsAtSec(null);
      } else if (ev === 'fade-cancelled') {
        setFading(false);
        setFadeEndsAtSec(null);
      } else if (ev === 'fade-done') {
        runningRef.current = false;
        pausedRef.current = false;
        setRunning(false);
        setPaused(false);
        setFading(false);
        setFadeEndsAtSec(null);
        elapsedRef.current = 0;
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
      // A tick that fires after stop/panic/fade-done but before React has
      // torn this effect down must not touch the clock.
      if (!runningRef.current || pausedRef.current) return;
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
      if (fade > 0 && !limitFadeIssuedRef.current && next >= limitSec - fade) {
        // Issued once per session: a CANCEL inside the window must not turn
        // into a volume pump (cancel → re-arm → cancel …). After a cancel the
        // limit simply stops the session on time.
        limitFadeIssuedRef.current = true;
        if (!engineRef.current.isFading && engineRef.current.fadeOut(Math.max(1, limitSec - next))) {
          setFading(true);
          setFadeEndsAtSec(limitSec);
        }
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
      // Interval bell: one strike at the start and at every period boundary.
      const bellMin = bellRef.current;
      if (bellMin > 0) {
        const period = Math.floor(next / (bellMin * 60));
        if (period !== lastBellIdxRef.current) {
          lastBellIdxRef.current = period;
          engineRef.current.strikeBell(bellVoiceFrom(bowlsRef.current, carrierRef.current), BELL_DB);
        }
      }
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
      elapsedRef.current = Math.floor(next);
      setElapsedSec(Math.floor(next));
      if (++ticks % 30 === 0) saveDoseLog(doseLogRef.current, now);
    }, 1000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, paused]);

  // ---- platform integrations ------------------------------------------------
  useWakeLock(running && !paused);
  // A service-worker update applied in another tab must not reload this one
  // mid-session; the held reload runs once the session ends.
  useEffect(() => {
    setPwaReloadGuard(() => runningRef.current);
    return () => setPwaReloadGuard(null);
  }, []);
  useEffect(() => {
    if (!running) flushDeferredPwaReload();
  }, [running]);

  const stopRef = useRef(stop);
  const togglePauseRef = useRef(togglePause);
  useLayoutEffect(() => {
    startRef.current = start;
    stopRef.current = stop;
    togglePauseRef.current = togglePause;
  });
  // Lock-screen / hardware-key bridge: built on mount (an effect, so its
  // handlers may read the transport refs); the handlers go through the
  // latest-callback refs so they never capture a stale transport.
  const mediaRef = useRef<MediaSessionBridge | null>(null);
  useEffect(() => {
    const m = new MediaSessionBridge({
      play: () => {
        if (runningRef.current && pausedRef.current) togglePauseRef.current();
        else if (!runningRef.current) startRef.current();
      },
      pause: () => {
        if (runningRef.current && !pausedRef.current) togglePauseRef.current();
      },
      stop: () => stopRef.current(),
    });
    mediaRef.current = m;
    return () => {
      m.deactivate();
      if (mediaRef.current === m) mediaRef.current = null;
    };
  }, []);
  useEffect(() => {
    const m = mediaRef.current;
    if (!m) return;
    // No live beat readout here: a phase-plan glide changes it every second
    // and would churn the lock-screen notification.
    const info = {
      title: presetName ?? 'Open Sync session',
      artist: `${mode.toUpperCase()} · Open Sync`,
    };
    if (running && !paused) m.activate(info);
    else if (running && paused) m.pause(info);
    else m.deactivate();
  }, [running, paused, presetName, mode]);

  // ---- front-panel persistence (debounced, flushed on hide/unload) ----------
  const panelRef = useRef<FrontPanel | null>(null);
  useLayoutEffect(() => {
    panelRef.current = {
      mode,
      carrierHz,
      beatHz,
      waveform,
      phaseLock,
      gateDuty,
      gateShape,
      limitMin,
      sessionCapMin: governor.maxSessionMin,
      volumeDb,
      noiseDb,
      noiseOn,
      nature,
      bowls,
      bellEveryMin,
      layersOn,
      phases,
      presetName,
      presetGrade,
      fadeOutSec,
      infantMode: governor.infantMode,
    };
  });
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (panelRef.current) saveFrontPanel(panelRef.current);
    }, 250);
    return () => window.clearTimeout(t);
  }, [
    mode, carrierHz, beatHz, waveform, phaseLock, gateDuty, gateShape, limitMin, volumeDb, noiseDb, noiseOn,
    nature, bowls, bellEveryMin, layersOn, phases, presetName, presetGrade, fadeOutSec, governor.infantMode, governor.maxSessionMin,
  ]);
  useEffect(() => {
    // React never runs effect cleanups on unload, and a backgrounded phone
    // page may be frozen before a pending timer fires: flush synchronously.
    const flush = () => {
      if (panelRef.current) saveFrontPanel(panelRef.current);
      saveDoseLog(doseLogRef.current, Date.now());
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // ---- advisory -----------------------------------------------------------------
  const acknowledgeAdvisory = useCallback(
    (opts: { andStart?: boolean } = {}) => {
      ackRef.current = true;
      writeAdvisoryAck();
      setGovernorState((cur) => ({ ...cur, drivingWarningAcknowledged: true }));
      setAdvisoryOpen(false);
      setAdvisoryPendingStart(false);
      // Continue into the session the user asked for — same tick, no stale closure.
      if (opts.andStart) startRef.current();
    },
    [],
  );
  /** Review the advisory (Safety Center): accepting never starts anything. */
  const openAdvisory = useCallback(() => {
    setAdvisoryPendingStart(false);
    setAdvisoryOpen(true);
  }, []);
  const closeAdvisory = useCallback(() => {
    setAdvisoryOpen(false);
    setAdvisoryPendingStart(false);
  }, []);

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
      carrierRef.current = clamped;
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
  // Bowl set. Every setter derives the next set from the same-tick ref, pushes
  // it to the engine (locks resolved against the carrier — so a level change
  // on a locked bowl never renders a 0 Hz bowl) and then commits it to state.
  const commitBowls = useCallback((next: BowlLayer[]) => {
    bowlsRef.current = next;
    setBowlsState(next);
    engineRef.current.setBowls(liveBowlsFrom(next, carrierRef.current));
    setDirty(true);
  }, []);
  const setBowls = useCallback((next: BowlLayer[]) => commitBowls(next.slice(0, MAX_BOWLS)), [commitBowls]);
  const setBowl = useCallback(
    (id: string, patch: Partial<Omit<BowlLayer, 'id'>>) => {
      if (!bowlsRef.current.some((b) => b.id === id)) return;
      commitBowls(bowlsRef.current.map((b) => (b.id === id ? { ...b, ...patch, id } : b)));
    },
    [commitBowls],
  );
  const addBowl = useCallback(
    (init?: Partial<Omit<BowlLayer, 'id'>>): string | null => {
      if (bowlsRef.current.length >= MAX_BOWLS) return null;
      const b = newBowlLayer(init);
      commitBowls([...bowlsRef.current, b]);
      return b.id;
    },
    [commitBowls],
  );
  const removeBowl = useCallback((id: string) => commitBowls(bowlsRef.current.filter((b) => b.id !== id)), [commitBowls]);
  const setBellEveryMin = useCallback((min: number) => {
    const v = Number.isFinite(min) ? Math.max(0, Math.min(60, Math.round(min))) : 0;
    bellRef.current = v;
    // Re-base the period counter so a change mid-session never rings at once.
    lastBellIdxRef.current = v > 0 ? Math.floor(elapsedRef.current / (v * 60)) : -1;
    setBellEveryMinState(v);
    setDirty(true);
  }, []);
  // Section bypass for the nature/bowl layers: click-free ramp on the
  // engine's layer bus; per-layer settings are kept for re-enable.
  const setLayersOn = useCallback((on: boolean) => {
    setLayersOnState(on);
    engineRef.current.setLayersBypass(on);
    setDirty(true);
  }, []);
  // Bowl "detune to carrier" lock: locked bowls re-tune when the carrier moves.
  useEffect(() => {
    if (bowlsRef.current.some((b) => b.on && b.lock)) engineRef.current.setBowls(liveBowlsFrom(bowlsRef.current, carrierHz));
  }, [carrierHz]);
  const setVolumeDb = useCallback(
    (db: number) => {
      // The governor gain cap (−6 dBFS default) and the infant ceiling are
      // enforced at the fader, not only at START.
      const cap = governor.infantMode ? Math.min(governor.maxGainDbFs, INFANT_MAX_VOLUME_DB) : governor.maxGainDbFs;
      const clamped = Math.max(-60, Math.min(cap, db));
      volumeRef.current = clamped;
      setVolumeDbState(clamped);
      engineRef.current.setOutputDb(clamped);
    },
    [governor.infantMode, governor.maxGainDbFs],
  );
  const setMuted = useCallback((m: boolean) => {
    mutedRef.current = m;
    setMutedState(m);
    engineRef.current.setMuted(m);
  }, []);
  const setLimitMin = useCallback(
    (min: number) => {
      // Limits only tighten live; loosening applies next session (safety spec).
      const cap = governor.infantMode ? Math.min(governor.maxSessionMin, INFANT_MAX_SESSION_MIN) : governor.maxSessionMin;
      const clamped = Math.max(1, Math.min(cap, MAX_SESSION_MIN, Math.round(min)));
      if (!running || clamped < limitMin) {
        limitRef.current = clamped;
        setLimitMinState(clamped);
      }
    },
    [running, limitMin, governor.infantMode, governor.maxSessionMin],
  );
  const setGovernor = useCallback((patch: Partial<GovernorConfig>) => {
    // The advisory acknowledgment has one writer: keep the synchronous ref and
    // the persisted record in step with the governor flag (Safety Center chip).
    if (patch.drivingWarningAcknowledged !== undefined) {
      ackRef.current = patch.drivingWarningAcknowledged;
      if (patch.drivingWarningAcknowledged) writeAdvisoryAck();
      else removeKey(STORAGE_KEYS.advisoryAck);
    }
    if (patch.infantMode) {
      // Infant mode tightens the level and session caps immediately.
      volumeRef.current = Math.min(volumeRef.current, INFANT_MAX_VOLUME_DB);
      limitRef.current = Math.min(limitRef.current, INFANT_MAX_SESSION_MIN);
    }
    if (patch.maxGainDbFs !== undefined) volumeRef.current = Math.min(volumeRef.current, patch.maxGainDbFs);
    if (patch.maxSessionMin !== undefined) {
      // A lower cap tightens the session length now (mid-session too); a
      // higher one never loosens a running session (setLimitMin refuses).
      const cap = clampSessionCap(patch.maxSessionMin);
      patch = { ...patch, maxSessionMin: cap };
      limitRef.current = Math.min(limitRef.current, cap);
      setLimitMinState((l) => Math.min(l, cap));
    }
    setGovernorState((cur) => {
      const next = { ...cur, ...patch };
      governorRef.current = next;
      if (patch.infantMode !== undefined && patch.infantMode !== cur.infantMode) {
        engineRef.current.setInfantFilter(patch.infantMode);
        if (patch.infantMode) {
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
      // Storage full/blocked: the preset exists for this tab only — stay dirty
      // so the unsaved-changes dot keeps telling the truth.
      setDirty(!result.persisted);
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
      const panel = panelFromShare(
        { ...DEFAULT_FRONT_PANEL, infantMode: governorRef.current.infantMode, sessionCapMin: governorRef.current.maxSessionMin },
        s,
      );
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
      bowlsRef.current = panel.bowls;
      setBowlsState(panel.bowls);
      engineRef.current.setBowls(liveBowlsFrom(panel.bowls, panel.carrierHz));
      bellRef.current = panel.bellEveryMin;
      lastBellIdxRef.current = panel.bellEveryMin > 0 ? Math.floor(elapsedRef.current / (panel.bellEveryMin * 60)) : -1;
      setBellEveryMinState(panel.bellEveryMin);
      setLayersOnState(panel.layersOn);
      engineRef.current.setLayersBypass(panel.layersOn);
      if (!running) {
        limitRef.current = panel.limitMin;
        setLimitMinState(panel.limitMin);
      }
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
    const freshBowls = d.bowls.map((b) => ({ ...b }));
    bowlsRef.current = freshBowls;
    setBowlsState(freshBowls);
    engineRef.current.setBowls([]);
    bellRef.current = d.bellEveryMin;
    lastBellIdxRef.current = -1;
    setBellEveryMinState(d.bellEveryMin);
    setLayersOnState(true);
    engineRef.current.setLayersBypass(true);
    if (!running) {
      limitRef.current = d.limitMin;
      setLimitMinState(d.limitMin);
    }
    setFadeOutSecState(d.fadeOutSec);
    volumeRef.current = d.volumeDb;
    setVolumeDbState(d.volumeDb);
    engineRef.current.setOutputDb(d.volumeDb);
    setPresetName(null);
    setPresetGrade(null);
    setDirty(false);
  }, [pushConfig, running]);

  const resetDoseLog = useCallback(() => {
    doseRef.current.reset();
    doseLogRef.current = [];
    removeKey(STORAGE_KEYS.doseHistory);
    setDosePercent(0);
  }, []);

  const getShareLink = useCallback((): string => {
    const state: ShareState = {
      mode,
      carrierHz,
      waveform,
      phases: phases.map((p) => ({ durationSec: p.durationSec, beatHz: p.beatHz })),
      noiseDb: Object.fromEntries(Object.entries(noiseDb).filter(([, db]) => Number.isFinite(db))) as Partial<Record<NoiseColor, number>>,
      noiseOn,
      nature,
      bowls: bowls.map(({ id: _id, ...b }) => b),
      bellEveryMin,
      layersOn,
      limitMin,
      fadeOutSec,
      presetName: presetName ?? undefined,
    };
    if (typeof window === 'undefined') return `#s=${encodeShare(state)}`;
    return shareUrl(state, window.location.origin, import.meta.env.BASE_URL);
  }, [mode, carrierHz, waveform, phases, noiseDb, noiseOn, nature, bowls, bellEveryMin, layersOn, limitMin, fadeOutSec, presetName]);

  /**
   * Preview playback level: at most −12 dB, never above the governor gain cap,
   * and inside infant mode never above the infant ceiling (previews use the
   * engine's preview path, which also carries the 1 kHz low-pass).
   */
  const previewLevelDb = useCallback(
    (base = -12): number =>
      Math.min(base, governor.maxGainDbFs, governor.infantMode ? INFANT_MAX_VOLUME_DB : 0),
    [governor.maxGainDbFs, governor.infantMode],
  );

  const previewHz = useCallback(
    (hz: number) => {
      // Inaudible values (< 40 Hz) preview as a binaural beat on a 200 Hz carrier.
      const phase: EnginePhase =
        hz <= 40
          ? { durationSec: 2.5, carrierHz: 200, beatHz: Math.max(0.1, hz), mode: 'binaural', gainDb: -14 }
          : { durationSec: 2.5, carrierHz: Math.min(1200, hz), beatHz: 0, mode: 'monaural', gainDb: -14 };
      const r = renderPhase(phase, 48000);
      engineRef.current.playBuffer(r.left, r.right, 48000, previewLevelDb(-12));
    },
    [previewLevelDb],
  );

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
      // Previews respect the governor gain cap and the infant ceiling.
      const db = previewLevelDb(-12);
      startPreview(id, () => {
        engineRef.current.playBuffer(r.left, r.right, sr, db, () =>
          setPreviewId((cur) => (cur === id ? null : cur)),
        );
      });
    },
    [previewId, previewLevelDb, startPreview, stopPreview],
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
      // Governor gain cap + infant ceiling applied as HTMLAudio volume (engine
      // previews use the same rule). File previews are ≤30 s renders and never
      // touch the dose clock; panic()/stopPreview() cut them via the stop fn.
      const db = previewLevelDb(-12);
      startPreview(id, () => {
        const audio = new Audio(url);
        // Through the engine's preview path when Web Audio is available (so the
        // infant low-pass applies to pre-rendered files too); the element's own
        // volume is the fallback.
        const detach = engineRef.current.attachMediaElement(audio, db);
        audio.volume = detach ? 1 : Math.min(1, Math.pow(10, db / 20));
        // Media elements fetch with Range headers (HTTP 206), which the
        // service worker's audio cache cannot store; a plain fetch of the same
        // URL seeds the cache so the file is available offline afterwards.
        if (typeof fetch === 'function' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
          void fetch(url).catch(() => {});
        }
        const clearIfCurrent = () => setPreviewId((cur) => (cur === id ? null : cur));
        audio.onended = clearIfCurrent;
        audio.onerror = clearIfCurrent;
        void audio.play().catch(clearIfCurrent);
        return () => {
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
          detach?.();
          audio.src = '';
        };
      });
    },
    [previewId, previewLevelDb, startPreview, stopPreview],
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
        { durationSec: dur, carrierHz: carrier, beatHz: 0, mode: 'monaural', gainDb: previewLevelDb(-14) },
        48000,
      );
      const db = previewLevelDb(-12);
      startPreview(id, () => {
        engineRef.current.playBuffer(r.left, r.right, 48000, db, () =>
          setPreviewId((cur) => (cur === id ? null : cur)),
        );
      });
    },
    [previewId, previewLevelDb, startPreview, stopPreview],
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
        const enginePhases = buildExportPhases(phases, carrierHz, mode, { noiseDb, noiseOn, nature, bowls, bellEveryMin, layersOn });
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
    [phases, carrierHz, mode, noiseDb, noiseOn, bowls, bellEveryMin, nature, layersOn, presetName, limitMin],
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
      fadeEndsAtSec,
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
      bowls,
      bellEveryMin,
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
      advisoryPendingStart,
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
      addBowl,
      removeBowl,
      setBowls,
      setBellEveryMin,
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
      resetDoseLog,
      engineRef,
    }),
    [
      mode, carrierHz, beatHz, waveform, phaseLock, gateDuty, gateShape, running, paused, interrupted, fading, fadeEndsAtSec, panicked,
      elapsedSec, limitMin, fadeOutSec, volumeDb, muted, warnings, noiseDb, noiseOn, nature, bowls, bellEveryMin, layersOn, phases,
      activePhaseIdx, dosePercent, governor, authorization, startBlocked, advisoryOpen, advisoryPendingStart, presetName, presetGrade, dirty,
      userPresets, exporting, exportError, previewId, togglePreview, stopPreview, previewPreset, previewPhases,
      previewUrl, previewTone, start, stop, togglePause, panic, rehearsePanic, resumeSafely, dismissPanic,
      startSleepFade, cancelSleepFade, setFadeOutSec, acknowledgeAdvisory, openAdvisory, closeAdvisory, setMode,
      setCarrierHz, setBeatHz, setWaveform, setGateDuty, setGateShape, setNoiseDb, setNoiseOn, setNature, setBowl,
      addBowl, removeBowl, setBowls, setBellEveryMin, setLayersOn, setVolumeDb, setMuted, setLimitMin, setGovernor, setPhases, saveCurrentAsPreset,
      deleteUserPresetById, loadPreset, loadFrequency, previewHz, exportWav, getShareLink, applyShare, resetFrontPanel, resetDoseLog,
    ],
  );

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

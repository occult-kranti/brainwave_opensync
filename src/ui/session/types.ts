/**
 * Session context types (UI layer). Kept apart from the provider so the
 * React-refresh rule holds (SessionContext.tsx exports only the provider).
 */

import type { EntrainmentMode, NoiseColor, Phase as EnginePhase } from '@/engine';
import type { AuthorizationResult, GovernorConfig } from '@/safety/governor';
import type { Preset } from '@/data/presets';
import type { Grade } from '@/data/frequencies';
import type { UserPreset } from './userPresets';
import type { GateShape, LiveEngine, Waveform } from '../audio/liveEngine';
import type { ExportFormat } from '../audio/renderExport';
import type { BandName } from '../theme';
import type { BowlLayer, NatureLayer, UiPhase } from './sessionMath';
import type { ShareState } from './shareLink';

export interface SessionSnapshot {
  mode: EntrainmentMode;
  carrierHz: number;
  beatHz: number;
  waveform: Waveform;
  phaseLock: boolean;
  gateDuty: number;
  gateShape: GateShape;
  running: boolean;
  /** True while a running session is paused (audio frozen, clock held). */
  paused: boolean;
  /** True when the pause was forced by the OS (call, audio-session steal). */
  interrupted: boolean;
  /** True while the sleep fade is ramping the output to silence. */
  fading: boolean;
  /** Session-clock second at which the active fade reaches silence (null when not fading). */
  fadeEndsAtSec: number | null;
  panicked: boolean;
  elapsedSec: number;
  limitMin: number;
  /** Seconds of dB-linear fade before the limit (0 = stop hard). */
  fadeOutSec: number;
  volumeDb: number;
  muted: boolean;
  band: BandName | null;
  warnings: string[];
  noiseDb: Record<NoiseColor, number>;
  /** Noise mixer master bypass (true = section audible). */
  noiseOn: boolean;
  nature: NatureLayer;
  bowl: BowlLayer;
  /** Nature/bowl layers master bypass (true = section audible). */
  layersOn: boolean;
  phases: UiPhase[];
  activePhaseIdx: number;
  dosePercent: number;
  estDbA: number;
  governor: GovernorConfig;
  /** Governor verdict for the current front panel (what START will check). */
  authorization: AuthorizationResult;
  /** Reasons the last START was refused (empty when it went through). */
  startBlocked: string[];
  /** One-time safety advisory (driving / seizure / headphones). */
  advisoryAcknowledged: boolean;
  advisoryOpen: boolean;
  /** True when the open advisory was raised by START (accepting continues into the session). */
  advisoryPendingStart: boolean;
  presetName: string | null;
  presetGrade: Grade | null;
  dirty: boolean;
  /** Saved "MY PRESETS" entries (localStorage-backed, versioned). */
  userPresets: UserPreset[];
  exporting: boolean;
  exportError: string | null;
}

export interface ExportWavOptions {
  format?: ExportFormat;
}

export interface SessionActions {
  /** Currently-playing preview id (preset:<id>, exp:<id>, cym:<id>, …) or null. */
  previewId: string | null;
  /** Toggle a preview: `startFn` starts playback and may return a stop fn. */
  togglePreview: (id: string, startFn: () => (() => void) | void) => void;
  /** Stop whatever preview is playing (no-op when none). */
  stopPreview: () => void;
  /** Preview the first ~10 s of a data-layer preset (toggle). */
  previewPreset: (preset: Preset) => void;
  /** Preview a list of engine phases (≤30 s) under an arbitrary id (toggle). */
  previewPhases: (id: string, phases: readonly EnginePhase[], maxSec?: number) => void;
  /** Play a pre-rendered preview file (public/previews/<id>.wav) via HTMLAudio; toggle on repeat. */
  previewUrl: (id: string, url: string) => void;
  /** Play a plain tone at `hz` for `durSec` (≤30) under an arbitrary id (toggle). */
  previewTone: (id: string, hz: number, durSec?: number) => void;
  /** Start a session. Returns false (and sets startBlocked / advisoryOpen) when refused. */
  start: () => boolean;
  stop: () => void;
  /**
   * Global pause/resume (Space hotkey, status-bar chip, palette). Freezes the
   * live engine phase-coherently (suspend, no click/jump) and holds the
   * session clock. No-op while idle or panicked.
   */
  togglePause: () => void;
  panic: () => void;
  rehearsePanic: () => void;
  resumeSafely: () => void;
  dismissPanic: () => void;
  /** Sleep fade: ramp to silence over `sec` (default: the configured fade) then stop. */
  startSleepFade: (sec?: number) => boolean;
  cancelSleepFade: () => void;
  setFadeOutSec: (sec: number) => void;
  /** Record the one-time advisory acknowledgment (persisted), close the dialog, optionally start. */
  acknowledgeAdvisory: (opts?: { andStart?: boolean }) => void;
  openAdvisory: () => void;
  closeAdvisory: () => void;
  setMode: (m: EntrainmentMode) => void;
  setCarrierHz: (hz: number) => void;
  setBeatHz: (hz: number) => void;
  setWaveform: (w: Waveform) => void;
  setPhaseLock: (v: boolean) => void;
  setGateDuty: (d: number) => void;
  setGateShape: (s: GateShape) => void;
  setNoiseDb: (color: NoiseColor, db: number) => void;
  setNoiseOn: (on: boolean) => void;
  setNature: (patch: Partial<NatureLayer>) => void;
  setBowl: (patch: Partial<BowlLayer>) => void;
  setLayersOn: (on: boolean) => void;
  setVolumeDb: (db: number) => void;
  setMuted: (m: boolean) => void;
  setLimitMin: (min: number) => void;
  setGovernor: (patch: Partial<GovernorConfig>) => void;
  setPhases: (phases: UiPhase[]) => void;
  /**
   * Persist the current front-panel config as a named user preset
   * (Studio "SAVE AS PRESET"). Duplicate names replace in place.
   * Returns the stored entry.
   */
  saveCurrentAsPreset: (name: string) => UserPreset;
  /** Delete a user preset by id. */
  deleteUserPreset: (id: string) => void;
  loadPreset: (preset: Preset) => void;
  loadFrequency: (hz: number, name?: string) => void;
  previewHz: (hz: number) => void;
  /** Off-thread offline render → WAV download. Resolves true on success. */
  exportWav: (options?: ExportWavOptions) => Promise<boolean>;
  /** Share link reproducing the current front panel. */
  getShareLink: () => string;
  /** Apply a decoded share payload to the front panel. */
  applyShare: (state: ShareState) => void;
  /** Restore factory defaults for the front panel (does not touch presets or dose). */
  resetFrontPanel: () => void;
  /** Start a new dose week: clears the tracker and the persisted 7-day log. */
  resetDoseLog: () => void;
  engineRef: React.RefObject<LiveEngine>;
}

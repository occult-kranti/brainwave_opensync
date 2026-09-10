/**
 * Front-panel persistence (v2).
 *
 * v1 forgot the whole live setup on reload. v2 remembers the last front
 * panel (modality, carrier, waveform, plan, mixer, layers, limit, fade) and a
 * rolling 7-day dose log so the WHO-ITU H.870 "weekly allowance" actually
 * spans a week rather than a page load. Both blobs are versioned through
 * src/lib/storage and validated field by field on read — a corrupt or stale
 * blob degrades to defaults, never to a crash.
 */

import type { EntrainmentMode, NatureKind, NoiseColor } from '@/engine';
import { STORAGE_KEYS, readJson, writeJson, type StorageLike, defaultStorage } from '@/lib/storage';
import type { Grade } from '@/data/frequencies';
import type { GateShape, Waveform } from '../audio/liveEngine';
import type { BowlLayer, NatureLayer, UiPhase } from './sessionMath';
import { INFANT_MAX_SESSION_MIN } from '@/safety/governor';
import { INFANT_CEILING_DBA } from '@/safety/dose';
import { DBFS_TO_DBA_OFFSET } from './sessionMath';
import { truncateCodePoints } from './shareLink';

export const FRONT_PANEL_VERSION = 2;
export const DOSE_LOG_VERSION = 2;
export const ADVISORY_ACK_VERSION = 2;

/** Everything the Studio can set that is worth remembering across reloads. */
export interface FrontPanel {
  mode: EntrainmentMode;
  carrierHz: number;
  beatHz: number;
  waveform: Waveform;
  phaseLock: boolean;
  gateDuty: number;
  gateShape: GateShape;
  limitMin: number;
  volumeDb: number;
  noiseDb: Record<NoiseColor, number>;
  noiseOn: boolean;
  nature: NatureLayer;
  bowl: BowlLayer;
  layersOn: boolean;
  phases: UiPhase[];
  presetName: string | null;
  presetGrade: Grade | null;
  fadeOutSec: number;
  infantMode: boolean;
}

const MODES: EntrainmentMode[] = ['binaural', 'monaural', 'isochronic'];
const WAVES: Waveform[] = ['sine', 'triangle', 'square'];
const GATES: GateShape[] = ['raised-cosine', 'hard'];
const NOISES: NoiseColor[] = ['white', 'pink', 'brown', 'blue', 'violet', 'grey'];
const NATURES: NatureKind[] = ['rain', 'ocean', 'stream', 'fire', 'thunder'];
const GRADES = ['A', 'B', 'C', 'D'];

const num = (v: unknown, lo: number, hi: number, fb: number): number => {
  const n = typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fb;
};
/** dB level that may legitimately be −Infinity (fader at −∞ = off). JSON turns it into null. */
const level = (v: unknown, fb: number): number => {
  if (v === null || v === -Infinity) return -Infinity;
  return num(v, -60, 0, fb);
};
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fb: T): T => (allowed.includes(v as T) ? (v as T) : fb);

/** Sanitize a parsed blob against `defaults`; unknown/invalid fields fall back. */
export function sanitizeFrontPanel(raw: unknown, defaults: FrontPanel): FrontPanel {
  if (!raw || typeof raw !== 'object') return defaults;
  const r = raw as Record<string, unknown>;
  const noiseDb = { ...defaults.noiseDb };
  if (r.noiseDb && typeof r.noiseDb === 'object') {
    for (const c of NOISES) noiseDb[c] = level((r.noiseDb as Record<string, unknown>)[c], defaults.noiseDb[c]);
  }
  const nat = (r.nature ?? {}) as Record<string, unknown>;
  const bowl = (r.bowl ?? {}) as Record<string, unknown>;
  const phasesRaw = Array.isArray(r.phases) ? r.phases : [];
  const phases: UiPhase[] = [];
  for (const p of phasesRaw.slice(0, 8)) {
    if (!p || typeof p !== 'object') continue;
    const q = p as Record<string, unknown>;
    // Non-positive / non-numeric values are invalid rows, not clamped ones.
    if (!(typeof q.durationSec === 'number' && q.durationSec > 0) || !(typeof q.beatHz === 'number' && q.beatHz > 0)) continue;
    const durationSec = num(q.durationSec, 1, 6 * 3600, 60);
    const beatHz = num(q.beatHz, 0.1, 80, 10);
    phases.push({ id: typeof q.id === 'string' && q.id ? q.id : `p${phases.length}-${Math.round(durationSec)}`, durationSec, beatHz });
  }
  const infantMode = typeof r.infantMode === 'boolean' ? r.infantMode : defaults.infantMode;
  // A persisted panel can never loosen the infant caps (rails only tighten).
  const limitCap = infantMode ? INFANT_MAX_SESSION_MIN : 90;
  const volumeCap = infantMode ? INFANT_CEILING_DBA - DBFS_TO_DBA_OFFSET : 0;
  return {
    mode: oneOf(r.mode, MODES, defaults.mode),
    carrierHz: num(r.carrierHz, 20, 1000, defaults.carrierHz),
    beatHz: num(r.beatHz, 0.1, 80, defaults.beatHz),
    waveform: oneOf(r.waveform, WAVES, defaults.waveform),
    phaseLock: typeof r.phaseLock === 'boolean' ? r.phaseLock : defaults.phaseLock,
    gateDuty: num(r.gateDuty, 0.05, 0.95, defaults.gateDuty),
    gateShape: oneOf(r.gateShape, GATES, defaults.gateShape),
    limitMin: num(r.limitMin, 1, limitCap, Math.min(defaults.limitMin, limitCap)),
    volumeDb: num(r.volumeDb, -60, volumeCap, Math.min(defaults.volumeDb, volumeCap)),
    noiseDb,
    noiseOn: typeof r.noiseOn === 'boolean' ? r.noiseOn : defaults.noiseOn,
    nature: {
      on: typeof nat.on === 'boolean' ? nat.on : defaults.nature.on,
      kind: oneOf(nat.kind, NATURES, defaults.nature.kind),
      db: level(nat.db, defaults.nature.db),
    },
    bowl: {
      on: typeof bowl.on === 'boolean' ? bowl.on : defaults.bowl.on,
      baseHz: num(bowl.baseHz, 20, 1000, defaults.bowl.baseHz),
      db: level(bowl.db, defaults.bowl.db),
      lock: typeof bowl.lock === 'boolean' ? bowl.lock : defaults.bowl.lock,
    },
    layersOn: typeof r.layersOn === 'boolean' ? r.layersOn : defaults.layersOn,
    phases: phases.length ? phases : defaults.phases,
    presetName: typeof r.presetName === 'string' && r.presetName.trim() ? truncateCodePoints(r.presetName.trim(), 80) : null,
    presetGrade: GRADES.includes(r.presetGrade as string) ? (r.presetGrade as Grade) : null,
    fadeOutSec: num(r.fadeOutSec, 0, 600, defaults.fadeOutSec),
    infantMode,
  };
}

export function loadFrontPanel(defaults: FrontPanel, storage: StorageLike | null = defaultStorage()): FrontPanel {
  const raw = readJson<unknown>(STORAGE_KEYS.frontPanel, FRONT_PANEL_VERSION, storage);
  return raw === null ? defaults : sanitizeFrontPanel(raw, defaults);
}

export function saveFrontPanel(panel: FrontPanel, storage: StorageLike | null = defaultStorage()): boolean {
  // JSON has no −Infinity; store off-faders as null (sanitize maps null back).
  const json = JSON.parse(JSON.stringify(panel, (_k, v) => (v === -Infinity ? null : v))) as FrontPanel;
  return writeJson(STORAGE_KEYS.frontPanel, FRONT_PANEL_VERSION, json, storage);
}

// ---------------------------------------------------------------------------
// Dose log — rolling 7-day window of exposures, coalesced per level.
// ---------------------------------------------------------------------------

export interface DoseLogEntry {
  /** Epoch ms when this run of exposure started. */
  t: number;
  dbA: number;
  seconds: number;
}

export const DOSE_WINDOW_MS = 7 * 24 * 3600 * 1000;
/** Ticks within this gap at the same level merge into one entry (1 s ticks → one row per level change). */
const COALESCE_GAP_MS = 10_000;
const MAX_ENTRIES = 5000;

/** Append one exposure tick to the log (mutates + returns the same array). */
export function appendDose(log: DoseLogEntry[], dbA: number, seconds: number, now: number): DoseLogEntry[] {
  const last = log[log.length - 1];
  if (last && last.dbA === dbA && now - (last.t + last.seconds * 1000) <= COALESCE_GAP_MS) {
    last.seconds += seconds;
  } else {
    log.push({ t: now, dbA, seconds });
  }
  if (log.length > MAX_ENTRIES) log.splice(0, log.length - MAX_ENTRIES);
  return log;
}

/** Clock-skew slack: rows that claim to start later than this are phantoms. */
const FUTURE_SLACK_MS = 60_000;

/**
 * Drop entries that ended before the 7-day window, entries that start in the
 * future (a clock jump must not leave phantom dose behind), and cap any
 * single row at the window length.
 */
export function pruneDose(log: readonly DoseLogEntry[], now: number): DoseLogEntry[] {
  const cutoff = now - DOSE_WINDOW_MS;
  return log
    .filter((e) => e.t <= now + FUTURE_SLACK_MS && e.t + e.seconds * 1000 >= cutoff)
    .map((e) => (e.seconds * 1000 > DOSE_WINDOW_MS ? { ...e, seconds: DOSE_WINDOW_MS / 1000 } : e));
}

export function loadDoseLog(now: number, storage: StorageLike | null = defaultStorage()): DoseLogEntry[] {
  const raw = readJson<unknown>(STORAGE_KEYS.doseHistory, DOSE_LOG_VERSION, storage);
  if (!Array.isArray(raw)) return [];
  const clean: DoseLogEntry[] = [];
  for (const e of raw) {
    if (!e || typeof e !== 'object') continue;
    const { t, dbA, seconds } = e as Record<string, unknown>;
    if (typeof t === 'number' && Number.isFinite(t) && typeof dbA === 'number' && Number.isFinite(dbA) && typeof seconds === 'number' && seconds > 0) {
      clean.push({ t, dbA, seconds });
    }
  }
  return pruneDose(clean, now);
}

export function saveDoseLog(log: readonly DoseLogEntry[], now: number, storage: StorageLike | null = defaultStorage()): boolean {
  return writeJson(STORAGE_KEYS.doseHistory, DOSE_LOG_VERSION, pruneDose(log, now), storage);
}

// ---------------------------------------------------------------------------
// Advisory acknowledgment (driving / seizure / headphones notice)
// ---------------------------------------------------------------------------

export interface AdvisoryAck {
  at: string; // ISO 8601
}

export function readAdvisoryAck(storage: StorageLike | null = defaultStorage()): boolean {
  const v = readJson<AdvisoryAck>(STORAGE_KEYS.advisoryAck, ADVISORY_ACK_VERSION, storage);
  return !!v && typeof v.at === 'string';
}

export function writeAdvisoryAck(storage: StorageLike | null = defaultStorage(), now = new Date()): boolean {
  return writeJson(STORAGE_KEYS.advisoryAck, ADVISORY_ACK_VERSION, { at: now.toISOString() }, storage);
}

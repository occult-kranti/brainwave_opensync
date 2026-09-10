/**
 * Pure session math shared by SessionContext, the export worker orchestration
 * and tests: phase truncation, export phase building, preset preview phases,
 * the phase-plan beat glide, and clock formatting. No React, no Web Audio.
 */

import type { BowlMaterial, BowlSetPreset, BowlStrike, EntrainmentMode, NoiseColor, Phase as EnginePhase } from '@/engine';
import { BOWL_RESTRIKE_CHOICES, MAX_BOWLS, dbToLin } from '@/engine';
import type { Preset } from '@/data/presets';
import type { NatureKind } from '@/engine';
import type { LiveBowl } from '../audio/liveEngine';

export interface UiPhase {
  id: string;
  durationSec: number;
  beatHz: number;
}

let phaseSeq = 0;
/** Fresh UI phase with a unique id (ids key the timeline's drag state). */
export const newUiPhase = (durationSec: number, beatHz: number): UiPhase => ({
  id: `p${++phaseSeq}-${Date.now().toString(36)}`,
  durationSec,
  beatHz,
});

/** Nature/bowl layer state as held by the session (mirrors SessionSnapshot). */
export interface NatureLayer {
  on: boolean;
  kind: NatureKind;
  db: number;
}
/** One bowl of the Studio's bowl set. */
export interface BowlLayer {
  /** Stable id (keys React rows and the live engine's per-bowl loops). */
  id: string;
  on: boolean;
  material: BowlMaterial;
  strike: BowlStrike;
  baseHz: number;
  db: number;
  /** −1 (left) … 1 (right). */
  pan: number;
  /** Re-strike interval in seconds (one of BOWL_RESTRIKE_CHOICES). */
  restrikeSec: number;
  /** Follow the session carrier instead of `baseHz`. */
  lock: boolean;
}

let bowlSeq = 0;
/** Fresh bowl with a unique id. Defaults: Himalayan antique, mallet, 136.1 Hz, −30 dB, center, 8 s. */
export const newBowlLayer = (init: Partial<Omit<BowlLayer, 'id'>> = {}): BowlLayer => ({
  id: `b${++bowlSeq}-${Date.now().toString(36)}`,
  on: true,
  material: 'himalayan-antique',
  strike: 'mallet',
  baseHz: 136.1,
  db: -30,
  pan: 0,
  restrikeSec: 8,
  lock: false,
  ...init,
});

/** Snap any interval to the nearest offered re-strike choice. */
export function snapRestrike(sec: number): number {
  if (!Number.isFinite(sec)) return 8;
  return BOWL_RESTRIKE_CHOICES.reduce((best, c) => (Math.abs(c - sec) < Math.abs(best - sec) ? c : best), BOWL_RESTRIKE_CHOICES[0]);
}

/** Turn a ready-made bowl set into fresh Studio rows (all on, capped at MAX_BOWLS). */
export function bowlSetToLayers(set: BowlSetPreset): BowlLayer[] {
  return set.bowls.slice(0, MAX_BOWLS).map((b) =>
    newBowlLayer({ material: b.material, strike: b.strike, baseHz: b.baseHz, db: b.db, pan: b.pan, restrikeSec: snapRestrike(b.restrikeSec), lock: false }),
  );
}

/** Live-engine view of the bowl set: only bowls that are on, locks resolved to the carrier. */
export function liveBowlsFrom(bowls: readonly BowlLayer[], carrierHz: number): LiveBowl[] {
  return bowls
    .filter((b) => b.on)
    .map((b) => ({
      id: b.id,
      baseHz: b.lock ? carrierHz : b.baseHz,
      db: b.db,
      material: b.material,
      strike: b.strike,
      pan: b.pan,
      restrikeSec: b.restrikeSec,
    }));
}

/** Interval-bell choices in minutes (0 = off). */
export const BELL_CHOICES: readonly number[] = [0, 1, 2, 3, 5, 10, 15, 20, 30];
/** Interval bell level on the layer bus (dB). */
export const BELL_DB = -18;
/** Interval bell voice when the bowl set is empty: A3 on an antique bowl. */
export const DEFAULT_BELL_VOICE = { baseHz: 220, material: 'himalayan-antique' as BowlMaterial, strike: 'mallet' as BowlStrike };

/** The bell rings the first bowl of the set (on or off, lock resolved), else the default voice. */
export function bellVoiceFrom(bowls: readonly BowlLayer[], carrierHz: number): { baseHz: number; material: BowlMaterial; strike: BowlStrike } {
  const b = bowls[0];
  if (!b) return { ...DEFAULT_BELL_VOICE };
  // A rim-sung bowl has no strike to ring; the bell always strikes.
  return { baseHz: b.lock ? carrierHz : b.baseHz, material: b.material, strike: b.strike === 'rim' ? 'mallet' : b.strike };
}

/** Headphone estimate: design reference point −18 dBFS ≈ 58 dBA (±6 dB). */
export const DBFS_TO_DBA_OFFSET = 76;

/** Preview renders are capped at 30 s — previews never debit the H.870 dose tracker (sessions do). */
export const PREVIEW_MAX_SEC = 10;

/** Truncate a phase list to a total of `maxSec` seconds (preview renders). */
export function truncatePhases(phases: readonly EnginePhase[], maxSec: number): EnginePhase[] {
  const out: EnginePhase[] = [];
  let remaining = maxSec;
  for (const p of phases) {
    if (remaining <= 0) break;
    const d = Math.min(p.durationSec, remaining);
    if (d > 0) out.push({ ...p, durationSec: d });
    remaining -= d;
  }
  return out;
}

/** Layer/bypass mix state that gates noise/bowl/nature into the WAV export. */
export interface ExportLayers {
  noiseDb: Record<NoiseColor, number>;
  noiseOn: boolean;
  nature: NatureLayer;
  bowls: readonly BowlLayer[];
  /** Interval bell period in minutes (0 = none). */
  bellEveryMin: number;
  layersOn: boolean;
}

/**
 * Build the engine phase list for a WAV export. Bypassed sections are
 * OMITTED from the phases entirely — the exported file contains no noise /
 * bowl / nature content at all (not merely a zero-gain render of it).
 * (Export flattens the mixer to the loudest noise color, as before.)
 * Bowls keep their relative balance: the loudest bowl renders at level 0.5
 * (the v2.0 single-bowl level) and the others sit below it by their dB gap.
 * The interval bell is a bowl re-struck every N minutes, so the export rings
 * it at each phase start and every N minutes within a phase.
 */
export function buildExportPhases(
  phases: readonly UiPhase[],
  carrierHz: number,
  mode: EntrainmentMode,
  layers: ExportLayers,
): EnginePhase[] {
  const enginePhases: EnginePhase[] = phases.map((p) => ({
    durationSec: p.durationSec,
    carrierHz,
    beatHz: p.beatHz,
    mode,
    gainDb: 0,
  }));
  const loudestNoise = (Object.entries(layers.noiseDb) as [NoiseColor, number][]).reduce(
    (best, [c, db]) => (db > best[1] ? [c, db] : best),
    ['pink', -Infinity] as [NoiseColor, number],
  );
  if (layers.noiseOn && Number.isFinite(loudestNoise[1])) {
    for (const p of enginePhases) {
      p.noise = { color: loudestNoise[0], level: Math.min(1, Math.pow(10, loudestNoise[1] / 20) * 4) };
    }
  }
  const activeBowls = layers.layersOn ? layers.bowls.filter((b) => b.on && Number.isFinite(b.db)) : [];
  if (activeBowls.length) {
    const maxDb = Math.max(...activeBowls.map((b) => b.db));
    for (const p of enginePhases) {
      p.bowls = activeBowls.map((b) => ({
        baseHz: b.lock ? carrierHz : b.baseHz,
        level: 0.5 * dbToLin(b.db - maxDb),
        material: b.material,
        strike: b.strike,
        pan: b.pan,
        restrikeSec: b.restrikeSec,
      }));
    }
  }
  if (layers.layersOn && layers.bellEveryMin > 0) {
    const voice = bellVoiceFrom(layers.bowls, carrierHz);
    for (const p of enginePhases) {
      (p.bowls ??= []).push({ ...voice, level: 0.4, restrikeSec: layers.bellEveryMin * 60 });
    }
  }
  if (layers.layersOn && layers.nature.on) {
    for (const p of enginePhases) p.nature = { kind: layers.nature.kind, level: 0.5 };
  }
  return enginePhases;
}

/** First ~`maxSec` of a data-layer preset as engine phases (binaural, per-phase gain). */
export function presetPreviewPhases(preset: Preset, maxSec: number = PREVIEW_MAX_SEC): EnginePhase[] {
  return truncatePhases(
    preset.spec.phases.map((p) => ({
      durationSec: p.durationSec,
      carrierHz: p.carrierHz,
      beatHz: p.beatHz,
      mode: 'binaural' as const,
      gainDb: Math.min(0, p.gainDbFs),
    })),
    maxSec,
  );
}

/** Beat at time t given the phase plan, with a 60 s linear glide between beats. */
export function beatAtTime(phases: UiPhase[], tSec: number): { beat: number; idx: number } {
  let acc = 0;
  let prevBeat: number | null = null;
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    if (tSec < acc + p.durationSec || i === phases.length - 1) {
      const local = Math.max(0, tSec - acc);
      if (prevBeat !== null && prevBeat !== p.beatHz) {
        const ramp = Math.min(60, p.durationSec * 0.5);
        if (local < ramp) {
          const k = local / ramp;
          return { beat: prevBeat + (p.beatHz - prevBeat) * k, idx: i };
        }
      }
      return { beat: p.beatHz, idx: i };
    }
    acc += p.durationSec;
    prevBeat = p.beatHz;
  }
  return { beat: phases[phases.length - 1]?.beatHz ?? 10, idx: phases.length - 1 };
}

/** mm:ss or hh:mm:ss mono formatting for timers. */
export function fmtClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${String(h).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
}

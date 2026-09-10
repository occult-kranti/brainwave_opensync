/**
 * Pure session math shared by SessionContext, the export worker orchestration
 * and tests: phase truncation, export phase building, preset preview phases,
 * the phase-plan beat glide, and clock formatting. No React, no Web Audio.
 */

import type { EntrainmentMode, NoiseColor, Phase as EnginePhase } from '@/engine';
import type { Preset } from '@/data/presets';
import type { NatureKind } from '@/engine';

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
export interface BowlLayer {
  on: boolean;
  baseHz: number;
  db: number;
  lock: boolean;
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
  bowl: BowlLayer;
  layersOn: boolean;
}

/**
 * Build the engine phase list for a WAV export. Bypassed sections are
 * OMITTED from the phases entirely — the exported file contains no noise /
 * bowl / nature content at all (not merely a zero-gain render of it).
 * (Export flattens the mixer to the loudest noise color, as before.)
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
  if (layers.layersOn && layers.bowl.on) {
    for (const p of enginePhases) {
      p.bowl = { baseHz: layers.bowl.lock ? carrierHz : layers.bowl.baseHz, level: 0.5 };
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

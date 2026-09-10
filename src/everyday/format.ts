/**
 * Pure helpers for the everyday screens: level ↔ percent mapping, clock
 * text, chip tables, and "which row is selected" derivations from the
 * session snapshot. No React, no DOM.
 */

import { BOWL_SETS, type NoiseColor } from '@/engine';
import { INFANT_MAX_SESSION_MIN, MAX_SESSION_MIN } from '@/safety/governor';
import type { GovernorConfig } from '@/safety/governor';
import type { BowlLayer } from '@/ui/session/sessionMath';
import { copy } from './copy';

/** Output volume fader range (dBFS). */
export const VOLUME_MIN_DB = -60;
export const VOLUME_MAX_DB = 0;
/** Section level sliders (noise / nature / bowls), dB. */
export const LEVEL_MIN_DB = -60;
export const LEVEL_MAX_DB = -10;
export const NOISE_DEFAULT_DB = -30;
export const NATURE_DEFAULT_DB = -30;
export const BOWLS_DEFAULT_DB = -28;

export const DURATION_CHIPS: readonly number[] = [15, 30, 45, 60, 90, 120, 180];
export const CAP_CHIPS: readonly number[] = [60, 90, 120, 180, 240];
export const BELL_ROWS: readonly number[] = [0, 5, 10, 15, 20, 30];
export const BELL_CYCLE: readonly number[] = [0, 5, 10, 15];
/** Noise colours offered as rows (the lab's other colours stay reachable through its own mixer). */
export const NOISE_ROWS = ['pink', 'brown', 'white'] as const satisfies readonly NoiseColor[];
export type NoiseRow = (typeof NOISE_ROWS)[number];

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** dB → 0…100 (%), linear in dB across [min, max]; −Infinity reads as 0. */
export function dbToPct(db: number, min: number, max: number): number {
  if (!Number.isFinite(db)) return 0;
  return Math.round(clamp(((db - min) / (max - min)) * 100, 0, 100));
}

/** 0…100 (%) → dB across [min, max]. */
export function pctToDb(pct: number, min: number, max: number): number {
  return Math.round(min + (clamp(pct, 0, 100) / 100) * (max - min));
}

/** The user-facing session cap: infant mode never exceeds 45 min. */
export function effectiveCapMin(governor: Pick<GovernorConfig, 'maxSessionMin' | 'infantMode'>): number {
  return governor.infantMode ? Math.min(governor.maxSessionMin, INFANT_MAX_SESSION_MIN) : governor.maxSessionMin;
}

/** Duration chips the cap allows (a chip above the cap is hidden, not disabled). */
export function durationChips(capMin: number): number[] {
  return DURATION_CHIPS.filter((m) => m <= capMin);
}

/** Seconds left: to the fade landing while fading, else to the limit. */
export function remainingSec(s: { limitMin: number; elapsedSec: number; fading: boolean; fadeEndsAtSec: number | null }): number {
  const end = s.fading && s.fadeEndsAtSec !== null ? s.fadeEndsAtSec : s.limitMin * 60;
  return Math.max(0, end - s.elapsedSec);
}

/** Local wall-clock time `remaining` seconds after `nowMs` (HH:MM, locale). */
export function fmtEndsAt(nowMs: number, remaining: number): string {
  const d = new Date(nowMs + remaining * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function fmtMin(min: number): string {
  return `${min} ${copy.units.min}`;
}

/** Sleep-fade chip label: Off / 30 s / 2 min … */
export function fmtFade(sec: number): string {
  if (sec <= 0) return copy.sounds.off;
  if (sec < 60) return `${sec} ${copy.units.sec}`;
  return fmtMin(Math.round(sec / 60));
}

export function fmtCap(min: number): string {
  return min >= MAX_SESSION_MIN ? copy.settings.capOff : fmtMin(min);
}

/** Loudest finite noise colour, or null when every colour is off. */
export function selectedNoise(noiseDb: Record<NoiseColor, number>): NoiseColor | null {
  let best: NoiseColor | null = null;
  let bestDb = -Infinity;
  for (const [c, db] of Object.entries(noiseDb) as [NoiseColor, number][]) {
    if (Number.isFinite(db) && db > bestDb) {
      best = c;
      bestDb = db;
    }
  }
  return best;
}

/** Bowl set the current rows came from: 'off' (none on), a set id, or null (custom). */
export function matchBowlSet(bowls: readonly BowlLayer[]): string | null {
  const on = bowls.filter((b) => b.on);
  if (on.length === 0) return 'off';
  const set = BOWL_SETS.find(
    (s) => s.bowls.length === on.length && s.bowls.every((sb, i) => sb.material === on[i].material && sb.strike === on[i].strike && Math.abs(sb.baseHz - on[i].baseHz) < 0.01),
  );
  return set ? set.id : null;
}

/** Level shown for the bowl slider: the loudest bowl that is on, else the default. */
export function bowlsLevelDb(bowls: readonly BowlLayer[]): number {
  const on = bowls.filter((b) => b.on && Number.isFinite(b.db));
  return on.length ? Math.max(...on.map((b) => b.db)) : BOWLS_DEFAULT_DB;
}

/** Next bell period in the player's Off/5/10/15 cycle. */
export function nextBell(current: number): number {
  const i = BELL_CYCLE.indexOf(current);
  return BELL_CYCLE[(i + 1) % BELL_CYCLE.length];
}

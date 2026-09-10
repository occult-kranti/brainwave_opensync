/**
 * Pure helpers for the Studio bowl-set panel (BowlSet.tsx): note-picker
 * value resolution, typed-Hz parsing and the small labels each row renders.
 * No React, no DOM — kept apart so the .tsx file exports only its component
 * (react-refresh/only-export-components).
 */

import { BOWL_NOTE_CHOICES, bowlMaterial, bowlStrike, noteLabel } from '@/engine';
import type { BowlMaterial, BowlStrike } from '@/engine';
import type { BowlLayer } from '@/ui/session/sessionMath';

/** Sentinel value of the note picker when the bowl's Hz is not a listed note. */
export const CUSTOM_NOTE = 'custom';

/** Cents inside which a Hz counts as the listed note (matches noteLabel's ±2¢ display rule). */
const NOTE_TOLERANCE_CENTS = 2;

/** Bowl pitch bounds accepted from the typed readout (exclusive). */
export const BOWL_HZ_MIN = 20;
export const BOWL_HZ_MAX = 1000;

/** Unsigned distance in cents between two frequencies (Infinity when either is invalid). */
export function centsBetween(hzA: number, hzB: number): number {
  if (!(Number.isFinite(hzA) && Number.isFinite(hzB) && hzA > 0 && hzB > 0)) return Infinity;
  return Math.abs(1200 * Math.log2(hzA / hzB));
}

/** The listed picker note within ±2¢ of `hz`, or null when the pitch is custom. */
export function listedNoteFor(hz: number): { label: string; hz: number } | null {
  let best: { label: string; hz: number } | null = null;
  let bestCents = Infinity;
  for (const c of BOWL_NOTE_CHOICES) {
    const d = centsBetween(hz, c.hz);
    if (d < bestCents) {
      bestCents = d;
      best = c;
    }
  }
  return best && bestCents <= NOTE_TOLERANCE_CENTS ? best : null;
}

/** Value of the note <select>: the listed note's Hz as a string, or CUSTOM_NOTE. */
export function noteSelectValue(hz: number): string {
  const n = listedNoteFor(hz);
  return n ? String(n.hz) : CUSTOM_NOTE;
}

/** Label of the extra picker option for a custom pitch, e.g. "CUSTOM · C#3 −31¢". */
export function customNoteLabel(hz: number): string {
  return `CUSTOM · ${noteLabel(hz)}`;
}

/** Parse a typed Hz value; null unless 20 < v < 1000. */
export function parseBowlHz(raw: string): number | null {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v > BOWL_HZ_MIN && v < BOWL_HZ_MAX ? v : null;
}

/** The pitch a bowl actually sounds at (LOCK follows the session carrier). */
export function bowlPitchHz(bowl: Pick<BowlLayer, 'lock' | 'baseHz'>, carrierHz: number): number {
  return bowl.lock ? carrierHz : bowl.baseHz;
}

/** Row label for the re-strike choice: INTERVAL between strikes, or the swell/release CYCLE of a rim-sung bowl. */
export function restrikeLabel(strike: BowlStrike): 'INTERVAL' | 'CYCLE' {
  return strike === 'rim' ? 'CYCLE' : 'INTERVAL';
}

/** Chip label for an interval-bell period in minutes: OFF or "N MIN". */
export function bellChoiceLabel(min: number): string {
  return min <= 0 ? 'OFF' : `${min} MIN`;
}

/** One-line row caption: the material blurb followed by the strike blurb. */
export function bowlCaption(material: BowlMaterial, strike: BowlStrike): string {
  return [bowlMaterial(material).blurb, bowlStrike(strike).blurb].filter(Boolean).join(' ');
}

/** Pan readout: "C" at center, else "L 45" / "R 45" (percent off center). */
export function panLabel(pan: number): string {
  const p = Number.isFinite(pan) ? Math.round(Math.min(1, Math.abs(pan)) * 100) : 0;
  if (p === 0) return 'C';
  return `${pan < 0 ? 'L' : 'R'} ${p}`;
}

/** Slider-safe level: the bowl's dB clamped to the −60…0 range (−∞ reads as −60). */
export function levelSliderDb(db: number): number {
  if (!Number.isFinite(db)) return -60;
  return Math.max(-60, Math.min(0, db));
}

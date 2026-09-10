/**
 * Pure phase-timeline math (drag/resize constraints, beat draft parsing),
 * separated from the component so it is unit-testable and refresh-safe.
 */

import type { UiPhase } from '../session/sessionMath';

/** Every phase keeps at least this much time after any edit. */
export const MIN_PHASE_SEC = 60;

/**
 * Pure phase-move transform (node-testable): shift block `idx`'s left edge,
 * lending/stealing against the previous block; the first block instead
 * steals/lends against the FOLLOWING one. Both neighbours keep the 60 s
 * floor, so a move can never push a phase below MIN_PHASE_SEC or negative.
 */
export function movePhase(phases: readonly UiPhase[], idx: number, shiftSec: number): UiPhase[] {
  const next = phases.map((p) => ({ ...p }));
  if (idx < 0 || idx >= next.length) return next;
  if (idx > 0) {
    const maxShift = next[idx].durationSec - MIN_PHASE_SEC;
    const minShift = -(next[idx - 1].durationSec - MIN_PHASE_SEC);
    const clamped = Math.max(minShift, Math.min(maxShift, shiftSec));
    next[idx - 1].durationSec += clamped;
    next[idx].durationSec -= clamped;
  } else if (next.length > 1) {
    const maxShift = next[1].durationSec - MIN_PHASE_SEC;
    const minShift = -(next[0].durationSec - MIN_PHASE_SEC);
    const clamped = Math.max(minShift, Math.min(maxShift, shiftSec));
    next[0].durationSec += clamped;
    next[1].durationSec -= clamped;
  }
  return next;
}

/**
 * Parse a hand-typed beat value. Ceiling is 40 Hz — the Studio BEAT knob's
 * maximum (the ≤30 Hz percept warning is surfaced separately in Studio).
 */
export function parseBeatDraft(raw: string): number | null {
  const v = parseFloat(raw);
  if (!Number.isFinite(v) || v < 0.1 || v > 40) return null;
  return Math.round(v * 100) / 100;
}

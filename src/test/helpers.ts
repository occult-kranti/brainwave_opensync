/** Shared test helpers (imported by the vitest setup file and by suites that manage storage themselves). */
import { STORAGE_KEYS } from '@/lib/storage';

/** Model a returning user who already acknowledged the one-time safety advisory. */
export function seedAdvisoryAck(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.advisoryAck, JSON.stringify({ version: 2, data: { at: '2026-01-01T00:00:00.000Z' } }));
  } catch {
    /* node environment without storage */
  }
}

/** Forget the advisory so a suite can exercise the START gate. */
export function clearAdvisoryAck(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEYS.advisoryAck);
  } catch {
    /* ignore */
  }
}

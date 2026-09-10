/**
 * Vitest setup (runs before every test file, in that file's environment).
 *
 * v2 persists the Studio front panel and a 7-day dose log, and gates the
 * first START behind a one-time safety advisory (driving / seizure /
 * headphones). Tests must not leak that state into each other, and the
 * existing UI suites model a returning user who already acknowledged the
 * advisory — so before each test the persisted blobs are cleared and the
 * acknowledgment is re-seeded whenever a DOM storage exists. Suites that
 * clear localStorage themselves call `seedAdvisoryAck()` afterwards; suites
 * that exercise the gate call `clearAdvisoryAck()`.
 */
import { beforeEach } from 'vitest';
import { STORAGE_KEYS } from '@/lib/storage';
import { seedAdvisoryAck } from './helpers';

function reset() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.frontPanel);
    localStorage.removeItem(STORAGE_KEYS.doseHistory);
  } catch {
    /* node environment without storage */
  }
  seedAdvisoryAck();
}

reset();
beforeEach(reset);

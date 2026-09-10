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

// DOM suites mount pages that fetch the preview manifest; there is no server
// in tests, so answer with a 404 instead of a real socket (ECONNREFUSED noise).
if (typeof window !== 'undefined' && typeof fetch === 'function') {
  const realFetch = fetch;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (/previews\/manifest\.json/.test(url)) return Promise.resolve(new Response(null, { status: 404 }));
    return realFetch(input, init);
  }) as typeof fetch;
}

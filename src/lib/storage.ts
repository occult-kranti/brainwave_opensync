/**
 * Versioned localStorage helper — the one place that knows how the app
 * persists state.
 *
 * Every key is registered in STORAGE_KEYS (existing keys keep their historical
 * strings so no user data is lost across the v2 upgrade). Values are wrapped
 * as `{ version, data }`; a version mismatch or malformed payload reads as
 * `null` so callers fall back to defaults instead of crashing. All access is
 * try/catch-guarded (private mode, quota, SSR/test renders without a window).
 */

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Registry of persisted keys. Add here; never inline a key string elsewhere. */
export const STORAGE_KEYS = {
  sidebar: 'open-sync:sidebar',
  density: 'opensync.density.v1',
  userPresets: 'open-sync:user-presets',
  dreamJournal: 'open-sync.dream-journal.v1',
  wbtbNights: 'open-sync.wbtb-nights.v1',
  realityCheck: 'open-sync.reality-check.v1',
  cymaticsCoach: 'opensync.cymatics.coach.v1',
  quicklab: 'opensync.quicklab.v1',
  // v2
  frontPanel: 'open-sync:front-panel.v2',
  doseHistory: 'open-sync:dose-history.v2',
  advisoryAck: 'open-sync:advisory-ack.v2',
  shortcutsSeen: 'open-sync:shortcuts-seen.v2',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

interface Envelope<T> {
  version: number;
  data: T;
}

export function defaultStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Read a versioned JSON value; null when missing, malformed, or another version. */
export function readJson<T>(key: string, version: number, storage: StorageLike | null = defaultStorage()): T | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Envelope<T>> | null;
    if (!parsed || typeof parsed !== 'object' || parsed.version !== version || !('data' in parsed)) return null;
    return parsed.data as T;
  } catch {
    return null;
  }
}

/** Write a versioned JSON value. Returns false when storage is unavailable or full. */
export function writeJson<T>(key: string, version: number, data: T, storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    const env: Envelope<T> = { version, data };
    storage.setItem(key, JSON.stringify(env));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string, storage: StorageLike | null = defaultStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Plain string read/write for the two legacy unversioned keys (sidebar, density). */
export function readString(key: string, storage: StorageLike | null = defaultStorage()): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string, storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** In-memory StorageLike for tests. */
export function memoryStorage(seed: Record<string, string> = {}): StorageLike & { dump(): Record<string, string> } {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    dump: () => Object.fromEntries(map),
  };
}

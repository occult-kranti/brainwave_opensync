import { describe, expect, it } from 'vitest';
import { STORAGE_KEYS, memoryStorage, readJson, readString, removeKey, writeJson, writeString } from '../storage';

describe('storage helper', () => {
  it('round-trips a versioned value', () => {
    const st = memoryStorage();
    expect(writeJson('k', 2, { a: 1 }, st)).toBe(true);
    expect(readJson<{ a: number }>('k', 2, st)).toEqual({ a: 1 });
    expect(JSON.parse(st.dump().k)).toEqual({ version: 2, data: { a: 1 } });
  });

  it('reads null on version mismatch, malformed JSON, or missing key', () => {
    const st = memoryStorage({ bad: '{not json', old: JSON.stringify({ version: 1, data: 1 }), naked: '42' });
    expect(readJson('bad', 1, st)).toBeNull();
    expect(readJson('old', 2, st)).toBeNull();
    expect(readJson('naked', 1, st)).toBeNull();
    expect(readJson('missing', 1, st)).toBeNull();
  });

  it('never throws when storage is unavailable or throws', () => {
    expect(readJson('k', 1, null)).toBeNull();
    expect(writeJson('k', 1, {}, null)).toBe(false);
    const throwing = {
      getItem: () => {
        throw new Error('quota');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {
        throw new Error('quota');
      },
    };
    expect(readJson('k', 1, throwing)).toBeNull();
    expect(writeJson('k', 1, {}, throwing)).toBe(false);
    expect(() => removeKey('k', throwing)).not.toThrow();
    expect(readString('k', throwing)).toBeNull();
    expect(writeString('k', 'v', throwing)).toBe(false);
  });

  it('keeps the historical key strings so v1 user data survives the upgrade', () => {
    expect(STORAGE_KEYS.userPresets).toBe('open-sync:user-presets');
    expect(STORAGE_KEYS.dreamJournal).toBe('open-sync.dream-journal.v1');
    expect(STORAGE_KEYS.quicklab).toBe('opensync.quicklab.v1');
    expect(STORAGE_KEYS.sidebar).toBe('open-sync:sidebar');
    expect(STORAGE_KEYS.density).toBe('opensync.density.v1');
    // every key is unique
    expect(new Set(Object.values(STORAGE_KEYS)).size).toBe(Object.keys(STORAGE_KEYS).length);
  });
});

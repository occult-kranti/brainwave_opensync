import { describe, expect, it } from 'vitest';
import { memoryStorage } from '@/lib/storage';
import {
  appendDose,
  loadDoseLog,
  loadFrontPanel,
  pruneDose,
  readAdvisoryAck,
  sanitizeFrontPanel,
  saveDoseLog,
  saveFrontPanel,
  writeAdvisoryAck,
  type FrontPanel,
} from '../sessionPersistence';

const defaults: FrontPanel = {
  mode: 'binaural',
  carrierHz: 200,
  beatHz: 10,
  waveform: 'sine',
  phaseLock: true,
  gateDuty: 0.5,
  gateShape: 'raised-cosine',
  limitMin: 90,
  sessionCapMin: 1440,
  volumeDb: -12,
  noiseDb: { white: -Infinity, pink: -Infinity, brown: -Infinity, blue: -Infinity, violet: -Infinity, grey: -Infinity },
  noiseOn: true,
  nature: { on: false, kind: 'rain', db: -30 },
  bowls: [{ id: 'b-default', on: false, material: 'himalayan-antique', strike: 'mallet', baseHz: 136.1, db: -30, pan: 0, restrikeSec: 8, lock: false }],
  bellEveryMin: 0,
  layersOn: true,
  phases: [{ id: 'a', durationSec: 600, beatHz: 10 }],
  presetName: null,
  presetGrade: null,
  fadeOutSec: 30,
  infantMode: false,
};

describe('front panel persistence', () => {
  it('round-trips including −∞ faders (JSON null) and preset identity', () => {
    const st = memoryStorage();
    const panel: FrontPanel = {
      ...defaults,
      mode: 'isochronic',
      noiseDb: { ...defaults.noiseDb, pink: -22 },
      nature: { on: true, kind: 'ocean', db: -26 },
      presetName: 'Focus SMR',
      presetGrade: 'B',
      fadeOutSec: 120,
      phases: [
        { id: 'x', durationSec: 300, beatHz: 14 },
        { id: 'y', durationSec: 900, beatHz: 12 },
      ],
    };
    expect(saveFrontPanel(panel, st)).toBe(true);
    expect(loadFrontPanel(defaults, st)).toEqual(panel);
  });

  it('falls back to defaults when nothing is stored or the blob is hostile', () => {
    expect(loadFrontPanel(defaults, memoryStorage())).toEqual(defaults);
    const s = sanitizeFrontPanel(
      { mode: 'laser', carrierHz: 1e9, beatHz: -4, waveform: 3, limitMin: 99999, volumeDb: 12, phases: [{ durationSec: 0, beatHz: 10 }, 'x'], noiseDb: { pink: 5, nope: -3 }, presetGrade: 'Z' },
      defaults,
    );
    expect(s.mode).toBe('binaural');
    expect(s.carrierHz).toBe(1000);
    expect(s.beatHz).toBe(0.1); // clamped, like the Studio setter
    expect(s.limitMin).toBe(1440); // no cap by default: clamped to the 24 h bound, not to 90
    expect(s.volumeDb).toBe(0);
    expect(s.phases).toEqual(defaults.phases); // no valid phase → defaults
    expect(s.noiseDb.pink).toBe(0);
    expect(s.presetGrade).toBeNull();
  });
});

describe('dose log', () => {
  it('coalesces consecutive same-level ticks and prunes beyond 7 days', () => {
    const t0 = 1_800_000_000_000;
    const log = appendDose([], 58, 1, t0);
    for (let i = 1; i < 60; i++) appendDose(log, 58, 1, t0 + i * 1000);
    expect(log).toEqual([{ t: t0, dbA: 58, seconds: 60 }]);
    appendDose(log, 64, 1, t0 + 60_000);
    expect(log).toHaveLength(2);
    // A gap longer than 10 s starts a new row even at the same level.
    appendDose(log, 64, 1, t0 + 120_000);
    expect(log).toHaveLength(3);
    const eightDays = t0 + 8 * 24 * 3600 * 1000;
    expect(pruneDose(log, eightDays)).toEqual([]);
    expect(pruneDose(log, t0 + 3600_000)).toHaveLength(3);
  });

  it('persists and reloads only valid, in-window rows', () => {
    const st = memoryStorage();
    const now = 1_800_000_000_000;
    const log = [
      { t: now - 10 * 24 * 3600 * 1000, dbA: 60, seconds: 100 }, // stale
      { t: now - 3600_000, dbA: 58, seconds: 900 },
    ];
    expect(saveDoseLog(log, now, st)).toBe(true);
    expect(loadDoseLog(now, st)).toEqual([{ t: now - 3600_000, dbA: 58, seconds: 900 }]);
    st.setItem(Object.keys(st.dump())[0], JSON.stringify({ version: 2, data: [{ t: 'x' }, null, { t: now, dbA: 50, seconds: 5 }] }));
    expect(loadDoseLog(now, st)).toEqual([{ t: now, dbA: 50, seconds: 5 }]);
  });
});

describe('advisory acknowledgment', () => {
  it('is false until written, then true', () => {
    const st = memoryStorage();
    expect(readAdvisoryAck(st)).toBe(false);
    expect(writeAdvisoryAck(st, new Date('2026-09-09T00:00:00Z'))).toBe(true);
    expect(readAdvisoryAck(st)).toBe(true);
  });
});

describe('persistence — v2.0.1 hardening', () => {
  it('a persisted infant panel cannot exceed the infant caps', () => {
    const s = sanitizeFrontPanel({ ...defaults, infantMode: true, limitMin: 90, volumeDb: -6 }, defaults);
    expect(s.infantMode).toBe(true);
    expect(s.limitMin).toBe(45);
    expect(s.volumeDb).toBe(-26);
    const n = sanitizeFrontPanel({ ...defaults, infantMode: false, limitMin: 90, volumeDb: -6 }, defaults);
    expect(n.limitMin).toBe(90);
    expect(n.volumeDb).toBe(-6);
  });

  it('drops phantom dose rows from the future and caps a single row at the window', () => {
    const now = 1_800_000_000_000;
    const log = [
      { t: now + 3 * 3600 * 1000, dbA: 60, seconds: 100 }, // clock jumped backwards → phantom
      { t: now - 1000, dbA: 58, seconds: 10 * 24 * 3600 }, // absurd length
      { t: now - 5000, dbA: 58, seconds: 5 },
    ];
    const pruned = pruneDose(log, now);
    expect(pruned).toHaveLength(2);
    expect(pruned[0].seconds).toBe(7 * 24 * 3600);
    expect(pruned[1]).toEqual({ t: now - 5000, dbA: 58, seconds: 5 });
  });
});

describe('persistence — bowl sets (v2.1)', () => {
  it('a v2.0 blob with a single `bowl` migrates to a one-bowl set in the original voice', () => {
    const s = sanitizeFrontPanel({ ...defaults, bowls: undefined, bowl: { on: true, baseHz: 220, db: -24, lock: true } }, defaults);
    expect(s.bowls).toEqual([
      { id: 'b-legacy', on: true, material: 'tibetan-bronze', strike: 'mallet', baseHz: 220, db: -24, pan: 0, restrikeSec: 8, lock: true },
    ]);
    expect(s.bellEveryMin).toBe(0);
  });

  it('a bowl set round-trips, an empty set is a real state, and bad rows are clamped or dropped', () => {
    const st = memoryStorage();
    const panel: FrontPanel = {
      ...defaults,
      bowls: [
        { id: 'x1', on: true, material: 'crystal-quartz', strike: 'rim', baseHz: 261.63, db: -Infinity, pan: -0.5, restrikeSec: 16, lock: false },
        { id: 'x2', on: false, material: 'brass', strike: 'soft', baseHz: 400, db: -20, pan: 0.25, restrikeSec: 12, lock: true },
      ],
      bellEveryMin: 5,
    };
    expect(saveFrontPanel(panel, st)).toBe(true);
    expect(loadFrontPanel(defaults, st)).toEqual(panel);
    expect(sanitizeFrontPanel({ ...defaults, bowls: [] }, defaults).bowls).toEqual([]);
    const messy = sanitizeFrontPanel(
      {
        ...defaults,
        bowls: [
          { id: 'dup', material: 'unobtainium', strike: 7, baseHz: 5000, db: 12, pan: -9, restrikeSec: 5, lock: 'yes' },
          { id: 'dup', on: true },
          'junk',
          ...Array.from({ length: 10 }, (_, i) => ({ id: `m${i}`, on: true })),
        ],
        bellEveryMin: -4,
      },
      defaults,
    );
    expect(messy.bowls).toHaveLength(7);
    expect(messy.bowls[0]).toEqual({ id: 'dup', on: false, material: 'himalayan-antique', strike: 'mallet', baseHz: 1000, db: 0, pan: -1, restrikeSec: 4, lock: false });
    expect(messy.bowls[1].id).not.toBe('dup');
    expect(messy.bellEveryMin).toBe(0);
  });
});

describe('persistence — user session cap (v2.2)', () => {
  it('a v2.0/2.1 blob without a cap reads as no cap and keeps its length', () => {
    const s = sanitizeFrontPanel({ ...defaults, sessionCapMin: undefined, limitMin: 90 }, defaults);
    expect(s.sessionCapMin).toBe(1440);
    expect(s.limitMin).toBe(90);
  });

  it('round-trips the cap, clamps it, and never lets the length exceed it', () => {
    const st = memoryStorage();
    const panel: FrontPanel = { ...defaults, sessionCapMin: 120, limitMin: 100 };
    expect(saveFrontPanel(panel, st)).toBe(true);
    expect(loadFrontPanel(defaults, st)).toEqual(panel);
    const tight = sanitizeFrontPanel({ ...defaults, sessionCapMin: 30, limitMin: 90 }, defaults);
    expect(tight.limitMin).toBe(30);
    const wide = sanitizeFrontPanel({ ...defaults, sessionCapMin: 1440, limitMin: 600 }, defaults);
    expect(wide.limitMin).toBe(600);
    expect(sanitizeFrontPanel({ ...defaults, sessionCapMin: 1 }, defaults).sessionCapMin).toBe(5);
    expect(sanitizeFrontPanel({ ...defaults, sessionCapMin: 99999 }, defaults).sessionCapMin).toBe(1440);
    // Infant mode still wins over a wider cap.
    const infant = sanitizeFrontPanel({ ...defaults, infantMode: true, sessionCapMin: 240, limitMin: 240 }, defaults);
    expect(infant.limitMin).toBe(45);
  });
});

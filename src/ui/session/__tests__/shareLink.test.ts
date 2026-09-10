import { describe, expect, it } from 'vitest';
import { decodeShare, encodeShare, shareFromHash, shareUrl, toBase64Url, type ShareState } from '../shareLink';

const state: ShareState = {
  mode: 'isochronic',
  carrierHz: 250,
  waveform: 'triangle',
  phases: [
    { durationSec: 480, beatHz: 10 },
    { durationSec: 1200, beatHz: 6 },
  ],
  noiseDb: { pink: -24, brown: -30 },
  noiseOn: true,
  nature: { on: true, kind: 'ocean', db: -28 },
  bowls: [
    { on: true, material: 'himalayan-antique', strike: 'soft', baseHz: 136.1, db: -32, pan: -0.5, restrikeSec: 12, lock: false },
    { on: true, material: 'crystal-quartz', strike: 'rim', baseHz: 261.63, db: -28, pan: 0.5, restrikeSec: 16, lock: true },
  ],
  bellEveryMin: 5,
  layersOn: false,
  limitMin: 45,
  fadeOutSec: 120,
  presetName: 'Evening drift',
};

describe('share links', () => {
  it('round-trips the full front panel', () => {
    const enc = encodeShare(state);
    expect(enc).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeShare(enc)).toEqual(state);
  });

  it('is compact and hash-safe', () => {
    const url = shareUrl(state, 'https://example.org', '/brainwave_opensync/');
    expect(url.startsWith('https://example.org/brainwave_opensync/studio#s=')).toBe(true);
    expect(url.length).toBeLessThan(400);
    expect(shareFromHash(new URL(url).hash)).toEqual(state);
  });

  it('applies defaults and clamps hostile values', () => {
    const enc = toBase64Url(
      JSON.stringify({ v: 2, m: 'weird', c: 99999, w: 'saw', p: [[1e9, -5], [60, 12], 'junk'], n: { pink: 50, laser: -10 }, l: 500, f: -3 }),
    );
    const s = decodeShare(enc)!;
    expect(s.mode).toBe('binaural');
    expect(s.waveform).toBe('sine');
    expect(s.carrierHz).toBe(1000);
    expect(s.phases).toEqual([{ durationSec: 60, beatHz: 12 }]); // first pair rejected (beat ≤ 0), junk skipped
    expect(s.noiseDb).toEqual({ pink: 0 });
    expect(s.limitMin).toBe(90);
    expect(s.fadeOutSec).toBe(0);
  });

  it('rejects garbage, wrong versions, and empty plans', () => {
    expect(decodeShare('not base64!!')).toBeNull();
    expect(decodeShare(toBase64Url('{"v":1,"p":[[60,10]]}'))).toBeNull();
    expect(decodeShare(toBase64Url('{"v":2,"p":[]}'))).toBeNull();
    expect(decodeShare(toBase64Url('{"v":2,"p":[[0,10]]}'))).toBeNull();
    expect(shareFromHash('#nothing')).toBeNull();
    expect(shareFromHash('')).toBeNull();
  });

  it('caps the phase count at eight', () => {
    const many = { ...state, phases: Array.from({ length: 12 }, (_, i) => ({ durationSec: 60, beatHz: i + 1 })) };
    expect(decodeShare(encodeShare(many))!.phases).toHaveLength(8);
  });
});

describe('share links — v2.0.1 hardening', () => {
  it('a layer at −∞ dB encodes as OFF and decodes as OFF, never as 0 dB', () => {
    const enc = encodeShare({ ...state, nature: { on: true, kind: 'rain', db: -Infinity }, bowls: [{ ...state.bowls[0], db: -Infinity }] });
    const d = decodeShare(enc)!;
    expect(d.nature.on).toBe(false);
    expect(d.bowls).toEqual([]);
    expect(d.nature.db).toBe(-30); // default, not 0
  });

  it('null / string wire numbers fall back instead of coercing to 0', () => {
    const enc = toBase64Url(JSON.stringify({ v: 2, m: 'binaural', c: null, w: 'sine', p: [[60, '10']], na: [1, 'rain', null], l: '5' }));
    const d = decodeShare(enc)!;
    expect(d.carrierHz).toBe(200);
    expect(d.phases).toEqual([{ durationSec: 60, beatHz: 10 }]); // pair values go through Number() by design
    expect(d.nature.db).toBe(-30);
    expect(d.limitMin).toBe(90);
  });

  it('truncates preset names by code point (no lone surrogates)', () => {
    const name = '🎧'.repeat(70);
    const d = decodeShare(encodeShare({ ...state, presetName: name }))!;
    expect(d.presetName).toBe('🎧'.repeat(60));
  });
});

describe('share links — bowl sets (v2.1)', () => {
  it('a v2.0 link with the single `b` bowl decodes as a one-bowl set with the original voice', () => {
    const enc = toBase64Url(JSON.stringify({ v: 2, m: 'binaural', c: 200, w: 'sine', p: [[60, 10]], b: [1, 136.1, -30, 1] }));
    const d = decodeShare(enc)!;
    expect(d.bowls).toEqual([
      { on: true, material: 'tibetan-bronze', strike: 'mallet', baseHz: 136.1, db: -30, pan: 0, restrikeSec: 8, lock: true },
    ]);
    expect(d.bellEveryMin).toBe(0);
  });

  it('bowls that are off are not carried; the set is capped and every field is clamped', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ ...state.bowls[0], baseHz: 100 + i }));
    const d = decodeShare(encodeShare({ ...state, bowls: [{ ...state.bowls[1], on: false }, ...many] }))!;
    expect(d.bowls).toHaveLength(7);
    expect(d.bowls.every((b) => b.on)).toBe(true);
    const bad = toBase64Url(JSON.stringify({ v: 2, m: 'binaural', c: 200, w: 'sine', p: [[60, 10]], bs: [[5000, 12, 99, -3, 7, 1000, 1], 'junk'], be: 999 }));
    const e = decodeShare(bad)!;
    expect(e.bowls).toHaveLength(1);
    expect(e.bowls[0]).toEqual({ on: true, material: 'crystal-quartz', strike: 'mallet', baseHz: 1000, db: 0, pan: 1, restrikeSec: 16, lock: true });
    expect(e.bellEveryMin).toBe(60);
  });
});

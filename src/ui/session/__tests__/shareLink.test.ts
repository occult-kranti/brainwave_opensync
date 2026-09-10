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
  bowl: { on: true, baseHz: 136.1, db: -32, lock: false },
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

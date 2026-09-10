/**
 * Bowl sets (v2.1): material / strike profiles, per-bowl pan, the `bowls[]`
 * phase field, ring-through re-strikes and the pitch helpers.
 */
import { describe, expect, it } from 'vitest';
import {
  BOWL_MATERIALS,
  BOWL_MATERIAL_IDS,
  BOWL_NOTE_CHOICES,
  BOWL_SETS,
  BOWL_STRIKES,
  BOWL_STRIKE_IDS,
  MAX_BOWLS,
  bowlMaterial,
  bowlStrike,
  fftInPlace,
  hzToNote,
  noteLabel,
  noteToHz,
  panGains,
  phaseBowls,
  renderBowl,
  renderPhase,
  renderSession,
} from '..';
import type { Phase } from '../types';

const SR = 48000;

function rms(buf: Float32Array): number {
  let acc = 0;
  for (let i = 0; i < buf.length; i++) acc += buf[i] * buf[i];
  return Math.sqrt(acc / Math.max(1, buf.length));
}

function magAt(buf: Float32Array, hz: number): number {
  let size = 1;
  while (size < buf.length) size <<= 1;
  const re = new Float32Array(size);
  const im = new Float32Array(size);
  re.set(buf);
  fftInPlace(re, im, false);
  const k = Math.round((hz * size) / SR);
  return Math.sqrt(re[k] * re[k] + im[k] * im[k]);
}

const phase = (over: Partial<Phase> = {}): Phase => ({ durationSec: 1, carrierHz: 200, beatHz: 10, mode: 'binaural', gainDb: 0, ...over });

describe('bowl profiles', () => {
  it('every material and strike has a consistent, well-formed profile', () => {
    expect(BOWL_MATERIAL_IDS).toEqual(BOWL_MATERIALS.map((m) => m.id));
    expect(BOWL_STRIKE_IDS).toEqual(BOWL_STRIKES.map((s) => s.id));
    for (const m of BOWL_MATERIALS) {
      expect(m.ratios[0]).toBe(1);
      expect(m.amps).toHaveLength(m.ratios.length);
      expect(m.decaySec).toBeGreaterThan(0);
      expect(m.doublet).toBeGreaterThanOrEqual(0);
      expect(m.blurb).not.toMatch(/heal|cure|balance|align/i);
    }
    // Unknown ids fall back to the first profile rather than throwing.
    expect(bowlMaterial('nope' as never).id).toBe('tibetan-bronze');
    expect(bowlStrike(undefined).id).toBe('mallet');
    expect(bowlMaterial('tibetan-bronze').ratios).toEqual([1, 2.76, 5.4]);
  });

  it('each material renders a distinct, deterministic, RMS-normalized voice', () => {
    const seen = new Set<string>();
    for (const m of BOWL_MATERIALS) {
      const a = renderBowl({ baseHz: 136.1, level: 1, material: m.id }, 1, SR, 5);
      const b = renderBowl({ baseHz: 136.1, level: 1, material: m.id }, 1, SR, 5);
      expect(a).toEqual(b);
      expect(rms(a)).toBeCloseTo(1, 3);
      const key = Array.from(a.subarray(1000, 1010)).map((x) => x.toFixed(5)).join(',');
      expect(seen.has(key)).toBe(false);
      seen.add(key);
      // The material's own partials are present.
      for (const r of m.ratios) expect(magAt(a, 136.1 * r)).toBeGreaterThan(0);
    }
  });

  it('crystal quartz sustains far longer than brass', () => {
    const late = (id: 'crystal-quartz' | 'brass'): number => {
      const buf = renderBowl({ baseHz: 200, level: 1, material: id }, 8, SR, 3);
      return rms(buf.subarray(6 * SR, 7 * SR)) / rms(buf.subarray(0, SR));
    };
    expect(late('crystal-quartz')).toBeGreaterThan(late('brass') * 3);
  });

  it('a soft mallet has weaker upper partials than a plain strike', () => {
    const hard = renderBowl({ baseHz: 150, level: 1, material: 'bell-bronze', strike: 'mallet' }, 2, SR, 9);
    const soft = renderBowl({ baseHz: 150, level: 1, material: 'bell-bronze', strike: 'soft' }, 2, SR, 9);
    const ratio = (buf: Float32Array): number => magAt(buf, 150 * 5.15) / magAt(buf, 150);
    expect(ratio(soft)).toBeLessThan(ratio(hard) * 0.5);
  });

  it('rim singing swells in, sustains and releases to silence before each new cycle', () => {
    const buf = renderBowl({ baseHz: 220, level: 1, material: 'himalayan-antique', strike: 'rim', restrikeSec: 4 }, 8, SR, 2);
    const seg = (a: number, b: number): number => rms(buf.subarray(Math.round(a * SR), Math.round(b * SR)));
    expect(seg(0, 0.05)).toBeLessThan(seg(1.5, 2) * 0.2); // swell
    expect(seg(1.5, 2)).toBeCloseTo(seg(2, 2.5), 0); // sustain
    expect(seg(3.95, 4)).toBeLessThan(seg(2, 2.5) * 0.1); // release
    expect(Math.abs(buf[0])).toBeLessThan(1e-6);
    expect(Math.abs(buf[buf.length - 1])).toBeLessThan(1e-3);
  });

  it('earlier strikes ring through a re-strike (no amplitude reset)', () => {
    // With a decay much longer than the interval the level just before the
    // second strike must be a substantial fraction of the level after it.
    const buf = renderBowl({ baseHz: 180, level: 1, material: 'crystal-quartz', restrikeSec: 2 }, 6, SR, 4);
    const before = rms(buf.subarray(Math.round(1.9 * SR), Math.round(1.99 * SR)));
    const after = rms(buf.subarray(Math.round(2.01 * SR), Math.round(2.1 * SR)));
    expect(before).toBeGreaterThan(after * 0.5);
    // A buffer that is an exact number of cycles loops: cycle 2 equals cycle 3
    // apart from the slow shimmer FM (compare envelopes, not samples).
    const c2 = rms(buf.subarray(2 * SR, 3 * SR));
    const c3 = rms(buf.subarray(4 * SR, 5 * SR));
    expect(c2).toBeCloseTo(c3, 2);
  });

  it('custom partials still override the material profile', () => {
    const buf = renderBowl({ baseHz: 100, level: 1, material: 'crystal-quartz', partials: [1, 3, 7] }, 2, SR, 3);
    expect(magAt(buf, 300)).toBeGreaterThan(magAt(buf, 242));
    expect(magAt(buf, 700)).toBeGreaterThan(magAt(buf, 417));
  });
});

describe('pan and the bowls[] phase field', () => {
  it('panGains is equal-power, clamps, and is exactly [1, 1] at center', () => {
    expect(panGains(0)).toEqual([1, 1]);
    expect(panGains(undefined)).toEqual([1, 1]);
    expect(panGains(Number.NaN)).toEqual([1, 1]);
    expect(panGains(-1)).toEqual([Math.SQRT2, expect.closeTo(0, 12)]);
    expect(panGains(5)).toEqual([expect.closeTo(0, 12), Math.SQRT2]);
    const [l, r] = panGains(0.3);
    expect(l * l + r * r).toBeCloseTo(2, 10);
    expect(r).toBeGreaterThan(l);
  });

  it('phaseBowls lists the legacy single bowl first, then the set', () => {
    const one = { baseHz: 1, level: 1 };
    const two = { baseHz: 2, level: 1 };
    expect(phaseBowls({})).toEqual([]);
    expect(phaseBowls({ bowl: one })).toEqual([one]);
    expect(phaseBowls({ bowl: one, bowls: [two] })).toEqual([one, two]);
  });

  it('a centered bowl mixes identically into both channels; a panned one does not', () => {
    const centered = renderPhase(phase({ mode: 'monaural', bowls: [{ baseHz: 136.1, level: 0.5 }] }), SR);
    expect(centered.left).toEqual(centered.right);
    const legacy = renderPhase(phase({ mode: 'monaural', bowl: { baseHz: 136.1, level: 0.5 } }), SR);
    expect(legacy.left).toEqual(centered.left); // `bowls: [x]` ≡ `bowl: x`
    const panned = renderPhase(phase({ mode: 'monaural', bowls: [{ baseHz: 136.1, level: 0.5, pan: -0.8 }] }), SR);
    const tone = renderPhase(phase({ mode: 'monaural' }), SR);
    const bowlOnly = (side: Float32Array, base: Float32Array): number => {
      const d = new Float32Array(side.length);
      for (let i = 0; i < d.length; i++) d[i] = side[i] - base[i];
      return rms(d);
    };
    expect(bowlOnly(panned.left, tone.left)).toBeGreaterThan(bowlOnly(panned.right, tone.right) * 4);
  });

  it('bowls in a set get different strike phases and the set changes the manifest hash', () => {
    const a = renderPhase(phase({ bowls: [{ baseHz: 150, level: 0.5 }] }), SR);
    const b = renderPhase(phase({ bowls: [{ baseHz: 150, level: 0.5 }, { baseHz: 150, level: 0.5 }] }), SR);
    expect(b.left).not.toEqual(a.left);
    const spec = { phases: [phase({ durationSec: 0.5, bowls: [{ baseHz: 150, level: 0.5, material: 'brass' as const }] })] };
    const h1 = renderSession(spec).manifest.hash;
    const h2 = renderSession({ phases: [phase({ durationSec: 0.5, bowls: [{ baseHz: 150, level: 0.5, material: 'crystal-quartz' as const }] })] }).manifest.hash;
    expect(h1).not.toBe(h2);
  });

  it('skips bowls with a non-positive or non-finite level', () => {
    const tone = renderPhase(phase({ mode: 'monaural' }), SR);
    const mixed = renderPhase(phase({ mode: 'monaural', bowls: [{ baseHz: 136.1, level: 0 }, { baseHz: 136.1, level: Number.NaN }] }), SR);
    expect(mixed.left).toEqual(tone.left);
  });
});

describe('pitch helpers and bowl sets', () => {
  it('note ↔ Hz round-trips and labels cents', () => {
    expect(noteToHz(69)).toBe(440);
    expect(hzToNote(440)).toEqual({ name: 'A', octave: 4, midi: 69, cents: 0 });
    expect(noteLabel(261.63)).toBe('C4');
    expect(noteLabel(136.1)).toBe('C#3 -31¢');
    expect(noteLabel(0)).toBe('—');
    expect(BOWL_NOTE_CHOICES[0]).toEqual({ label: 'C2', hz: 65.41 });
    expect(BOWL_NOTE_CHOICES[BOWL_NOTE_CHOICES.length - 1].label).toBe('B5');
    for (const c of BOWL_NOTE_CHOICES) expect(c.hz).toBeGreaterThan(20);
    for (const c of BOWL_NOTE_CHOICES) expect(c.hz).toBeLessThan(1000);
  });

  it('every bowl set fits the cap and stays inside the bowl ranges', () => {
    const ids = new Set<string>();
    for (const set of BOWL_SETS) {
      expect(ids.has(set.id)).toBe(false);
      ids.add(set.id);
      expect(set.bowls.length).toBeGreaterThan(0);
      expect(set.bowls.length).toBeLessThanOrEqual(MAX_BOWLS);
      expect(set.blurb).not.toMatch(/heal|cure|activate|align/i);
      for (const b of set.bowls) {
        expect(BOWL_MATERIAL_IDS).toContain(b.material);
        expect(BOWL_STRIKE_IDS).toContain(b.strike);
        expect(b.baseHz).toBeGreaterThan(20);
        expect(b.baseHz).toBeLessThan(1000);
        expect(b.db).toBeLessThanOrEqual(0);
        expect(Math.abs(b.pan)).toBeLessThanOrEqual(1);
        expect([4, 6, 8, 12, 16]).toContain(b.restrikeSec);
      }
    }
  });
});

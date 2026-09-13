import { describe, expect, it } from 'vitest';
import { amplitudeSpectrum } from '@/soniclab/dsp';
import {
  DEFAULT_SOUND_RECIPE,
  renderSoundRecipe,
  validateSoundRecipe,
  type SoundKind,
  type SoundRecipe,
} from '../model';

const SR = 8192;
const KINDS: SoundKind[] = ['pairs', 'am', 'noise-comb', 'noise-am', 'pan', 'phase-mod'];
const recipe = (patch: Partial<SoundRecipe> = {}): SoundRecipe => ({
  ...DEFAULT_SOUND_RECIPE,
  pairs: DEFAULT_SOUND_RECIPE.pairs.map((pair) => ({ ...pair })),
  durationSec: 2,
  ...patch,
});

function spectrum(samples: Float32Array): Float64Array {
  // Exactly one second, clear of the edge fades: one-Hz FFT bins.
  return amplitudeSpectrum(samples.subarray(SR / 4, 5 * SR / 4), SR).mags;
}

function energy(samples: Float32Array, startSec = 0.1, endSec = 1.9): number {
  let total = 0;
  const start = Math.round(startSec * SR);
  const end = Math.min(samples.length, Math.round(endSec * SR));
  for (let i = start; i < end; i++) total += samples[i] ** 2;
  return total / (end - start);
}

describe('sound recipe validation', () => {
  it('owns the returned pair data and accepts documented limits', () => {
    const original = recipe({
      carrierHz: 60, rateHz: 40, gainDb: -60, phaseDepthRad: Math.PI,
      durationSec: 300, seed: 0xffffffff,
      pairs: [{ leftHz: 60, rightHz: 1000, weight: 1 }],
    });
    const checked = validateSoundRecipe(original);
    expect(checked).toEqual(original);
    checked.pairs[0].leftHz = 200;
    expect(original.pairs[0].leftHz).toBe(60);
  });

  it('allows empty pairs only for methods that do not use them', () => {
    expect(validateSoundRecipe(recipe({ kind: 'am', pairs: [] })).pairs).toEqual([]);
    expect(() => validateSoundRecipe(recipe({ pairs: [] }))).toThrow('at least 1');
  });

  it.each([
    ['kind', 'unknown'], ['kind', 1], ['carrierHz', 59], ['carrierHz', 1001],
    ['carrierHz', '200'], ['carrierHz', Infinity], ['rateHz', 0], ['rateHz', 40.01],
    ['rateHz', NaN], ['depth', -0.01], ['depth', 1.01], ['phaseDepthRad', -1],
    ['phaseDepthRad', Math.PI + 0.01], ['phaseDepthRad', Infinity],
    ['noiseMix', -0.01], ['noiseMix', 1.01], ['noiseMix', NaN],
    ['durationSec', 1.99], ['durationSec', 300.01], ['durationSec', Number.MAX_VALUE],
    ['durationSec', Infinity], ['gainDb', -17.99], ['gainDb', -60.01], ['gainDb', NaN],
    ['seed', -1], ['seed', 0x100000000], ['seed', 1.5], ['seed', Infinity],
    ['pairs', null], ['pairs', Array(5).fill({ leftHz: 100, rightHz: 104, weight: 1 })],
    ['pairs', Array(1)], ['pairs', [null]], ['pairs', [[]]],
    ['pairs', [{ leftHz: 100, rightHz: 104, weight: 0 }]],
    ['pairs', [{ leftHz: 100, rightHz: 104, weight: NaN }]],
    ['pairs', [{ leftHz: 100, rightHz: 104, weight: -1 }]],
    ['pairs', [{ leftHz: 100, rightHz: 104, weight: 1.01 }]],
    ['pairs', [{ leftHz: 0, rightHz: 104, weight: 1 }]],
    ['pairs', [{ leftHz: 100, rightHz: 1001, weight: 1 }]],
    ['pairs', [{ leftHz: NaN, rightHz: 104, weight: 1 }]],
  ])('rejects invalid %s = %j before rendering', (key, value) => {
    const bad = { ...recipe(), [key]: value };
    expect(() => validateSoundRecipe(bad)).toThrow();
    expect(() => renderSoundRecipe(bad as SoundRecipe, SR)).toThrow();
  });

  it.each([undefined, null, [], 200, 'pairs'])('rejects non-object input %j', (input) => {
    expect(() => validateSoundRecipe(input)).toThrow('object');
  });

  it.each([0, 7999, 48001, NaN, Infinity, 44100.5])('rejects invalid sample rate %s', (sr) => {
    expect(() => renderSoundRecipe(recipe(), sr)).toThrow('Sample rate');
  });
});

describe('separate and simultaneous tone pairs', () => {
  it('routes 100 Hz to the left and 104 Hz to the right without a physical 4 Hz tone', () => {
    const rendered = renderSoundRecipe(recipe(), SR);
    const l = spectrum(rendered.left);
    const r = spectrum(rendered.right);
    expect(l[100]).toBeGreaterThan(0.05);
    expect(r[104]).toBeGreaterThan(0.05);
    expect(l[104] / l[100]).toBeLessThan(0.0001);
    expect(r[100] / r[104]).toBeLessThan(0.0001);
    expect(l[4] / l[100]).toBeLessThan(0.0001);
    expect(r[4] / r[104]).toBeLessThan(0.0001);
  });

  it('renders all three Septon example pairs simultaneously with exact channel frequencies', () => {
    const rendered = renderSoundRecipe(recipe({ pairs: [
      { leftHz: 200, rightHz: 204, weight: 1 },
      { leftHz: 204, rightHz: 208, weight: 1 },
      { leftHz: 208, rightHz: 212, weight: 1 },
    ] }), SR);
    const l = spectrum(rendered.left);
    const r = spectrum(rendered.right);
    for (const hz of [200, 204, 208]) expect(l[hz] / l[200]).toBeCloseTo(1, 4);
    for (const hz of [204, 208, 212]) expect(r[hz] / r[204]).toBeCloseTo(1, 4);
    expect(l[212] / l[200]).toBeLessThan(0.0001);
    expect(r[200] / r[204]).toBeLessThan(0.0001);
  });

  it('makes a physical monaural beat when both tones are assigned to each ear', () => {
    const rendered = renderSoundRecipe(recipe({ pairs: [
      { leftHz: 100, rightHz: 100, weight: 1 },
      { leftHz: 104, rightHz: 104, weight: 1 },
    ] }), SR);
    expect(rendered.left).toEqual(rendered.right);
    const s = spectrum(rendered.left);
    expect(s[100]).toBeCloseTo(s[104], 6);
    // The two tones cancel near 1/8 s and reinforce near 1/4 s.
    expect(energy(rendered.left, 0.115, 0.135)).toBeLessThan(energy(rendered.left, 0.24, 0.26) / 20);
  });

  it('preserves relative pair weights and does not boost intentionally quiet weights', () => {
    const rendered = renderSoundRecipe(recipe({ pairs: [
      { leftHz: 100, rightHz: 104, weight: 0.25 },
      { leftHz: 200, rightHz: 204, weight: 0.5 },
    ] }), SR);
    const s = spectrum(rendered.left);
    expect(s[200] / s[100]).toBeCloseTo(2, 4);
    const reference = renderSoundRecipe(recipe(), SR);
    expect(s[100] / spectrum(reference.left)[100]).toBeCloseTo(0.25, 4);
  });
});

describe('modulation methods', () => {
  it('AM creates symmetric sidebands and no physical low-rate tone', () => {
    const rendered = renderSoundRecipe(recipe({ kind: 'am', carrierHz: 256, rateHz: 8 }), SR);
    const s = spectrum(rendered.left);
    expect(rendered.left).toEqual(rendered.right);
    expect(s[248] / s[256]).toBeCloseTo(0.5, 4);
    expect(s[264] / s[256]).toBeCloseTo(0.5, 4);
    expect(s[8] / s[256]).toBeLessThan(0.0001);
    const unmodulated = renderSoundRecipe(recipe({ kind: 'am', carrierHz: 256, rateHz: 8, depth: 0 }), SR);
    expect(spectrum(unmodulated.left)[248] / spectrum(unmodulated.left)[256]).toBeLessThan(0.0001);
  });

  it('full-depth AM reaches a quiet trough every cycle', () => {
    const rendered = renderSoundRecipe(recipe({ kind: 'am', carrierHz: 256, rateHz: 4 }), SR);
    expect(energy(rendered.left, 0.12, 0.13)).toBeLessThan(energy(rendered.left, 0.245, 0.255) / 1000);
  });

  it('opposite phase modulation cancels odd sidebands when summed to mono', () => {
    const rendered = renderSoundRecipe(recipe({ kind: 'phase-mod', carrierHz: 256, rateHz: 8, phaseDepthRad: 0.5 }), SR);
    const l = spectrum(rendered.left);
    const r = spectrum(rendered.right);
    const sum = Float32Array.from(rendered.left, (value, i) => (value + rendered.right[i]) / 2);
    const mono = spectrum(sum);
    // J1(0.5)/J0(0.5), from the sinusoidal phase-modulation expansion.
    expect(l[264] / l[256]).toBeCloseTo(0.242268457674874 / 0.938469807240813, 4);
    expect(r[264] / l[264]).toBeCloseTo(1, 4);
    expect(mono[264] / l[264]).toBeLessThan(0.0001);
    expect(mono[256] / l[256]).toBeCloseTo(1, 4);
  });

  it('zero phase depth is a steady identical-channel tone', () => {
    const pm = renderSoundRecipe(recipe({ kind: 'phase-mod', phaseDepthRad: 0 }), SR);
    const tone = renderSoundRecipe(recipe({ kind: 'am', depth: 0 }), SR);
    expect(pm.left).toEqual(tone.left);
    expect(pm.right).toEqual(tone.right);
  });

  it('equal-power panning moves energy between ears while retaining total power', () => {
    const pan = renderSoundRecipe(recipe({ kind: 'pan', rateHz: 1 }), SR);
    const tone = renderSoundRecipe(recipe({ kind: 'am', depth: 0 }), SR);
    expect(energy(pan.right, 0.24, 0.26)).toBeGreaterThan(energy(pan.left, 0.24, 0.26) * 1000);
    expect(energy(pan.left, 0.74, 0.76)).toBeGreaterThan(energy(pan.right, 0.74, 0.76) * 1000);
    expect(energy(pan.left) + energy(pan.right)).toBeCloseTo(energy(tone.left), 9);
  });
});

describe('noise methods', () => {
  it.each([0, 1234, 0xffffffff])('is deterministic and finite with seed %s', (seed) => {
    const r = recipe({ kind: 'noise-comb', rateHz: 0.125, seed });
    const a = renderSoundRecipe(r, SR);
    const b = renderSoundRecipe(r, SR);
    expect(a.left).toEqual(b.left);
    expect(a.right).toEqual(b.right);
    expect(a.left.every(Number.isFinite)).toBe(true);
    expect(energy(a.left)).toBeGreaterThan(1e-8);
  });

  it('changes with the seed and has stronger low-band than high-band power', () => {
    const a = renderSoundRecipe(recipe({ kind: 'noise-am', depth: 0, seed: 1 }), SR);
    const b = renderSoundRecipe(recipe({ kind: 'noise-am', depth: 0, seed: 2 }), SR);
    expect(a.left).not.toEqual(b.left);
    const s = spectrum(a.left);
    const low = s.slice(100, 400).reduce((sum, value) => sum + value * value, 0) / 300;
    const high = s.slice(2000, 3000).reduce((sum, value) => sum + value * value, 0) / 1000;
    expect(low).toBeGreaterThan(high * 3);
  });

  it('comb depth zero leaves shared noise unchanged; depth one changes stereo filtering', () => {
    const dry = renderSoundRecipe(recipe({ kind: 'noise-am', depth: 0 }), SR);
    const bypass = renderSoundRecipe(recipe({ kind: 'noise-comb', depth: 0 }), SR);
    expect(bypass.left).toEqual(dry.left);
    expect(bypass.right).toEqual(dry.right);
    const wet = renderSoundRecipe(recipe({ kind: 'noise-comb', rateHz: 0.125, depth: 1 }), SR);
    expect(wet.left).not.toEqual(dry.left);
    expect(wet.left).not.toEqual(wet.right);
  });

  it('noise AM repeats from its seed and physically reduces power at envelope troughs', () => {
    const r = recipe({ kind: 'noise-am', rateHz: 4, depth: 1 });
    const modulated = renderSoundRecipe(r, SR);
    expect(modulated.left).toEqual(modulated.right);
    expect(modulated.left).toEqual(renderSoundRecipe(r, SR).left);
    let troughPower = 0;
    let crestPower = 0;
    for (const start of [0.125, 0.375, 0.625, 0.875, 1.125, 1.375, 1.625]) {
      troughPower += energy(modulated.left, start - 0.01, start + 0.01);
      crestPower += energy(modulated.left, start + 0.115, start + 0.135);
    }
    expect(troughPower).toBeLessThan(crestPower / 100);
  });

  it('noise-only methods ignore the unused noise mix control', () => {
    for (const kind of ['noise-am', 'noise-comb'] as const) {
      const a = renderSoundRecipe(recipe({ kind, noiseMix: 0 }), SR);
      const b = renderSoundRecipe(recipe({ kind, noiseMix: 1 }), SR);
      expect(a.left).toEqual(b.left);
      expect(a.right).toEqual(b.right);
    }
  });

  it('100% noise replaces every tone method with the same shared noise', () => {
    const noise = renderSoundRecipe(recipe({ kind: 'noise-am', depth: 0 }), SR);
    for (const kind of ['pairs', 'am', 'pan', 'phase-mod'] as const) {
      const r = renderSoundRecipe(recipe({ kind, noiseMix: 1 }), SR);
      expect(r.left).toEqual(noise.left);
      expect(r.right).toEqual(noise.right);
    }
  });
});

describe('render bounds and output level', () => {
  it('reports silence without NaNs when an intentionally tiny weight underflows Float32', () => {
    const r = renderSoundRecipe(recipe({ pairs: [{ leftHz: 100, rightHz: 104, weight: Number.MIN_VALUE }] }), SR);
    expect(r.left.every((sample) => sample === 0)).toBe(true);
    expect(r.right.every((sample) => sample === 0)).toBe(true);
    expect(r.peakDb).toBe(-Infinity);
  });

  it.each(KINDS)('%s stays finite, fades to zero, and respects the chosen gain', (kind) => {
    const r = renderSoundRecipe(recipe({
      kind, gainDb: -18, rateHz: 40, carrierHz: 1000, phaseDepthRad: Math.PI,
      noiseMix: 0.5, pairs: Array.from({ length: 4 }, () => ({ leftHz: 1000, rightHz: 1000, weight: 1 })),
    }), 8000);
    expect(r.left.length).toBe(16000);
    expect(r.right.length).toBe(16000);
    expect(r.left).not.toBe(r.right);
    expect(r.sampleRate).toBe(8000);
    expect(r.durationSec).toBe(2);
    expect(r.left.every(Number.isFinite)).toBe(true);
    expect(r.right.every(Number.isFinite)).toBe(true);
    expect(Math.abs(r.left[0])).toBe(0);
    expect(Math.abs(r.right[0])).toBe(0);
    expect(Math.abs(r.left[r.left.length - 1])).toBe(0);
    expect(Math.abs(r.right[r.right.length - 1])).toBe(0);
    expect(r.peakDb).toBeLessThanOrEqual(-18 + 1e-5);
    const peak = Math.max(...r.left.map(Math.abs), ...r.right.map(Math.abs));
    expect(r.peakDb).toBeCloseTo(20 * Math.log10(peak), 12);
  });

  it.each(KINDS)('%s preserves a 12 dB gain change without normalizing it away', (kind) => {
    const a = renderSoundRecipe(recipe({ kind, gainDb: -36 }), SR);
    const b = renderSoundRecipe(recipe({ kind, gainDb: -24 }), SR);
    expect(b.peakDb - a.peakDb).toBeCloseTo(12, 4);
  });

  it('keeps the entire 50 ms fade below its envelope ceiling', () => {
    const r = renderSoundRecipe(recipe({ kind: 'am', depth: 0 }), SR);
    const scale = 10 ** (DEFAULT_SOUND_RECIPE.gainDb / 20);
    const edgeFrames = Math.round(0.05 * SR);
    for (let i = 0; i < edgeFrames; i++) {
      const ceiling = scale * (0.5 - 0.5 * Math.cos(Math.PI * i / edgeFrames));
      expect(Math.abs(r.left[i])).toBeLessThanOrEqual(ceiling + 1e-8);
      expect(Math.abs(r.left[r.left.length - 1 - i])).toBeLessThanOrEqual(ceiling + 1e-8);
    }
  });
});

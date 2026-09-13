import { describe, expect, it } from 'vitest';
import { amplitudeSpectrum } from '@/soniclab/dsp';
import {
  componentsForRecipe,
  DEFAULT_RECIPE,
  notesForRecipe,
  renderHarmonicRecipe,
  validateRecipe,
  type HarmonicRecipe,
} from '../model';

const SR = 8000;
const SINE = [1, 0, 0, 0, 0, 0, 0, 0];
const recipe = (patch: Partial<HarmonicRecipe> = {}): HarmonicRecipe => ({
  ...DEFAULT_RECIPE, customRatios: [...DEFAULT_RECIPE.customRatios], harmonics: [...SINE], durationSec: 2, ...patch,
});

function strongestFrequency(samples: Float32Array, sampleRate: number): number {
  const { freqs, mags } = amplitudeSpectrum(samples, sampleRate);
  let best = 1;
  for (let k = 2; k < mags.length; k++) if (mags[k] > mags[best]) best = k;
  return freqs[best];
}

describe('harmonic recipe validation', () => {
  it('accepts valid limits and owns its arrays', () => {
    const original = recipe({ rootHz: 55, gainDb: -60, tempo: 40, durationSec: 30, customRatios: [0.25, 8] });
    const validated = validateRecipe(original);
    expect(validated).toEqual(original);
    validated.customRatios[0] = 1;
    validated.harmonics[0] = 0;
    expect(original.customRatios[0]).toBe(0.25);
    expect(original.harmonics[0]).toBe(1);
  });

  it.each([
    ['rootHz', NaN], ['rootHz', Infinity], ['rootHz', 0], ['rootHz', 881],
    ['gainDb', -17], ['gainDb', -61], ['durationSec', 1], ['durationSec', 31],
    ['durationSec', Number.MAX_VALUE], ['tempo', 39], ['tempo', 181],
    ['tuning', 'mystical'], ['chord', 'unknown'], ['pattern', 'loop'],
    ['customRatios', []], ['customRatios', Array(8).fill(1)], ['customRatios', [0.24]],
    ['customRatios', [8.01]], ['customRatios', [Infinity]], ['customRatios', Array(2)],
    ['harmonics', [1]], ['harmonics', Array(8).fill(NaN)], ['harmonics', Array(8).fill(-0.1)],
    ['harmonics', Array(8).fill(1.01)], ['harmonics', Array(8)], ['rootHz', '220'],
  ])('rejects invalid %s input %j before rendering', (key, value) => {
    const invalid = { ...recipe(), [key]: value };
    expect(() => validateRecipe(invalid)).toThrow();
    expect(() => renderHarmonicRecipe(invalid as HarmonicRecipe, SR)).toThrow();
  });

  it.each([null, undefined, [], 220, 'recipe'])('rejects non-object recipes %j', (value) => {
    expect(() => validateRecipe(value)).toThrow('object');
  });

  it.each([0, NaN, Infinity, 7999, 96001, 44100.5])('rejects unsafe sample rate %s', (sampleRate) => {
    expect(() => renderHarmonicRecipe(recipe(), sampleRate)).toThrow('Sample rate');
  });
});

describe('tuning and component mathematics', () => {
  it('matches just, equal-tempered and Pythagorean interval definitions', () => {
    const just = notesForRecipe(recipe());
    expect(just.map((note) => note.hz)).toEqual([220, 275, 330]);
    expect(just[1].cents).toBeCloseTo(386.3137138648, 8);
    expect(just[1].deviationCents).toBeCloseTo(-13.6862861352, 8);
    const equal = notesForRecipe(recipe({ tuning: 'equal' }));
    expect(equal[1].hz).toBeCloseTo(220 * 2 ** (4 / 12), 10);
    expect(equal.every((note) => Math.abs(note.deviationCents) < 1e-10)).toBe(true);
    const pythagorean = notesForRecipe(recipe({ tuning: 'pythagorean' }));
    expect(pythagorean[1].ratio).toBe(81 / 64);
    expect(notesForRecipe(recipe({ tuning: 'pythagorean', chord: 'minor' }))[1].ratio).toBe(32 / 27);
    expect(notesForRecipe(recipe({ chord: 'dominant7' }))[3].ratio).toBe(7 / 4);
  });

  it('preserves literal ratios and has exact octave relationships', () => {
    const custom = notesForRecipe(recipe({ tuning: 'equal', chord: 'custom', customRatios: [2, 1, 0.5] }));
    expect(custom.map((note) => note.hz)).toEqual([440, 220, 110]);
    expect(custom.map((note) => note.cents)).toEqual([1200, 0, -1200]);
    const harmonic = notesForRecipe(recipe({ tuning: 'equal', chord: 'harmonic' }));
    expect(harmonic.map((note) => note.ratio)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(notesForRecipe(recipe({ chord: 'phi' }))[1].ratio).toBeCloseTo((1 + Math.sqrt(5)) / 2, 12);
  });

  it('omits subaudible components, frequencies above 16 kHz, and Nyquist itself', () => {
    expect(componentsForRecipe(recipe({ rootHz: 55, chord: 'custom', customRatios: [0.25] }), SR)).toEqual([]);
    const high = recipe({ rootHz: 880, chord: 'harmonic', harmonics: Array(8).fill(1) });
    expect(componentsForRecipe(high).every((c) => c.hz <= 16000)).toBe(true);
    expect(componentsForRecipe(high, SR).every((c) => c.hz < SR / 2)).toBe(true);
    const atNyquist = recipe({ rootHz: 500, chord: 'custom', customRatios: [8] });
    expect(componentsForRecipe(atNyquist, SR)).toEqual([]);
    const components = componentsForRecipe(recipe({ chord: 'unison', harmonics: [1, 0.5, 0, 0, 0, 0, 0, 0] }), SR);
    expect(components.map((c) => [c.hz, c.amplitude, c.noteIndex, c.harmonic])).toEqual([[220, 1, 0, 1], [440, 0.5, 0, 2]]);
  });
});

describe('bounded harmonic rendering', () => {
  it('renders reproducible identical channels, correct duration and silent endpoints', () => {
    const r = renderHarmonicRecipe(recipe(), SR);
    expect(r.left.length).toBe(2 * SR);
    expect(r.durationSec).toBe(2);
    expect(r.sampleRate).toBe(SR);
    expect(r.left).toEqual(r.right);
    expect(r.left).not.toBe(r.right);
    expect(r.left).toEqual(renderHarmonicRecipe(recipe(), SR).left);
    expect(r.left[0]).toBe(0);
    expect(r.left[r.left.length - 1]).toBe(0);
    expect(r.peakDb).toBeLessThanOrEqual(-24 + 1e-5);
  });

  it('places spectral peaks at the requested triad frequencies within one FFT bin', () => {
    const r = renderHarmonicRecipe(recipe({ rootHz: 200 }), SR);
    const { freqs, mags } = amplitudeSpectrum(r.left.subarray(400), SR);
    const binHz = freqs[1] - freqs[0];
    let globalPeak = 0;
    for (const mag of mags) globalPeak = Math.max(globalPeak, mag);
    for (const target of [200, 250, 300]) {
      let peak = 0;
      let peakHz = 0;
      for (let k = 1; k < mags.length; k++) {
        if (Math.abs(freqs[k] - target) < 3 * binHz && mags[k] > peak) {
          peak = mags[k];
          peakHz = freqs[k];
        }
      }
      expect(Math.abs(peakHz - target)).toBeLessThanOrEqual(binHz);
      expect(peak / globalPeak).toBeGreaterThan(0.75);
    }
  });

  it('adds the selected harmonic without inventing other strong components', () => {
    const r = renderHarmonicRecipe(recipe({ rootHz: 250, chord: 'unison', harmonics: [1, 0.5, 0, 0, 0, 0, 0, 0] }), SR);
    const { freqs, mags } = amplitudeSpectrum(r.left.subarray(400), SR);
    const binFor = (hz: number) => Math.round(hz / freqs[1]);
    expect(mags[binFor(500)] / mags[binFor(250)]).toBeCloseTo(0.5, 3);
    expect(mags[binFor(750)] / mags[binFor(250)]).toBeLessThan(0.001);
  });

  it('preserves gain differences instead of normalizing quiet renders upward', () => {
    const quiet = renderHarmonicRecipe(recipe({ chord: 'unison', gainDb: -30 }), SR);
    const loud = renderHarmonicRecipe(recipe({ chord: 'unison', gainDb: -24 }), SR);
    expect(loud.peakDb - quiet.peakDb).toBeCloseTo(6, 4);
    for (const i of [501, 800, 2901, 4501]) {
      expect(loud.left[i]).toBeCloseTo(quiet.left[i] * Math.pow(10, 6 / 20), 7);
    }
  });

  it('retains silence for zero harmonics and all excluded notes', () => {
    const silent = renderHarmonicRecipe(recipe({ harmonics: Array(8).fill(0) }), SR);
    expect(silent.left.every((sample) => sample === 0)).toBe(true);
    expect(silent.peakDb).toBe(-Infinity);
    expect(silent.omittedPartials).toBe(0);
    const excluded = renderHarmonicRecipe(recipe({ rootHz: 55, chord: 'custom', customRatios: [0.25] }), SR);
    expect(excluded.left.every((sample) => sample === 0)).toBe(true);
    expect(excluded.omittedPartials).toBe(1);
  });

  it('stays finite and below the selected gain bound at maximum polyphony', () => {
    const high = recipe({ rootHz: 880, chord: 'harmonic', harmonics: Array(8).fill(1), gainDb: -18, pattern: 'progression', tempo: 180, durationSec: 4 });
    const r = renderHarmonicRecipe(high, SR);
    expect(r.left.every(Number.isFinite)).toBe(true);
    expect(r.peakDb).toBeLessThanOrEqual(-18 + 1e-5);
    expect(r.omittedPartials).toBeGreaterThan(0);
  });

  it('arpeggiates one note per beat and fades each transition', () => {
    const r = renderHarmonicRecipe(recipe({ rootHz: 200, pattern: 'arpeggio', tempo: 120 }), SR);
    for (const [startSec, target] of [[0.05, 200], [0.55, 250], [1.05, 300], [1.55, 200]]) {
      const start = Math.round(startSec * SR);
      expect(Math.abs(strongestFrequency(r.left.subarray(start, start + 2048), SR) - target)).toBeLessThan(SR / 2048);
    }
    for (const boundary of [4000, 8000, 12000]) {
      expect(Math.abs(r.left[boundary - 1])).toBe(0);
      expect(r.left[boundary]).toBe(0);
    }
  });

  it('transposes the full chord every four beats and repeats the progression', () => {
    const r = renderHarmonicRecipe(recipe({ rootHz: 300, chord: 'unison', pattern: 'progression', tempo: 120, durationSec: 10 }), SR);
    for (const [startSec, target] of [[0.1, 300], [2.1, 400], [4.1, 450], [6.1, 300], [8.1, 300]]) {
      const start = Math.round(startSec * SR);
      expect(Math.abs(strongestFrequency(r.left.subarray(start, start + 4096), SR) - target)).toBeLessThan(SR / 4096);
    }
    for (const boundary of [2, 4, 6, 8]) {
      expect(Math.abs(r.left[boundary * SR - 1])).toBe(0);
      expect(r.left[boundary * SR]).toBe(0);
    }
  });
});

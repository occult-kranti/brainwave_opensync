/**
 * Harmonic Lab recipes and bounded additive rendering. No Web Audio or DOM.
 *
 * Frequencies describe generated audio, not a listener's physiological state.
 * Harmonic/phi/custom chords retain literal ratios; the other chord presets
 * follow the selected temperament. Existing engine renders remain untouched.
 */

import { ratioToCents } from '@/soniclab/generators';

export interface HarmonicRecipe {
  rootHz: number;
  tuning: 'just' | 'equal' | 'pythagorean';
  chord: 'unison' | 'fifth' | 'major' | 'minor' | 'dominant7' | 'harmonic' | 'phi' | 'custom';
  customRatios: number[];
  harmonics: number[];
  pattern: 'chord' | 'arpeggio' | 'progression';
  tempo: number;
  durationSec: number;
  gainDb: number;
}

export interface HarmonicNote {
  label: string;
  ratio: number;
  hz: number;
  cents: number;
  /** Difference from the named interval, or nearest 12-TET note for literal ratios. */
  deviationCents: number;
}

export interface HarmonicComponent {
  hz: number;
  /** Relative harmonic weight, before the renderer's conservative gain bound. */
  amplitude: number;
  noteIndex: number;
  /** One-based harmonic number (1 is the fundamental). */
  harmonic: number;
}

export interface HarmonicRender {
  left: Float32Array;
  right: Float32Array;
  sampleRate: number;
  /** Sample peak in dBFS; -Infinity for silence. Not a true-peak estimate. */
  peakDb: number;
  /** Excluded nonzero partial slots across unique transpositions actually used. */
  omittedPartials: number;
  durationSec: number;
}

export const DEFAULT_RECIPE: HarmonicRecipe = {
  rootHz: 220,
  tuning: 'just',
  chord: 'major',
  customRatios: [1, 1.25, 1.5],
  harmonics: [1, 0.35, 0.2, 0.1, 0.06, 0.03, 0, 0],
  pattern: 'chord',
  tempo: 80,
  durationSec: 8,
  gainDb: -24,
};

const TUNINGS = ['just', 'equal', 'pythagorean'] as const;
const CHORDS = ['unison', 'fifth', 'major', 'minor', 'dominant7', 'harmonic', 'phi', 'custom'] as const;
const PATTERNS = ['chord', 'arpeggio', 'progression'] as const;
const PROGRESSION = [1, 4 / 3, 3 / 2, 1] as const;

function finiteRange(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${label} must be a finite number between ${min} and ${max}.`);
  }
  return value;
}

function choice<T extends string>(value: unknown, choices: readonly T[], label: string): T {
  if (typeof value !== 'string' || !choices.includes(value as T)) {
    throw new RangeError(`${label} must be one of: ${choices.join(', ')}.`);
  }
  return value as T;
}

/** Validate imports and control values before any buffer allocation; return owned arrays. */
export function validateRecipe(input: unknown): HarmonicRecipe {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('A harmonic recipe must be an object.');
  }
  const x = input as Record<string, unknown>;
  const rootHz = finiteRange(x.rootHz, 'Root frequency (Hz)', 55, 880);
  const tuning = choice(x.tuning, TUNINGS, 'Tuning');
  const chord = choice(x.chord, CHORDS, 'Chord');
  const pattern = choice(x.pattern, PATTERNS, 'Pattern');
  const tempo = finiteRange(x.tempo, 'Tempo (beats per minute)', 40, 180);
  const durationSec = finiteRange(x.durationSec, 'Duration (seconds)', 2, 30);
  const gainDb = finiteRange(x.gainDb, 'Gain (dBFS)', -60, -18);
  if (!Array.isArray(x.customRatios) || x.customRatios.length < 1 || x.customRatios.length > 7) {
    throw new RangeError('Custom ratios must contain between 1 and 7 numbers.');
  }
  if (!Array.isArray(x.harmonics) || x.harmonics.length !== 8) {
    throw new RangeError('Harmonics must contain exactly 8 amplitudes.');
  }
  // Array.from also visits sparse slots; missing entries must not evade validation.
  const customRatios = Array.from(x.customRatios, (v, i) => finiteRange(v, `Custom ratio ${i + 1}`, 0.25, 8));
  const harmonics = Array.from(x.harmonics, (v, i) => finiteRange(v, `Harmonic ${i + 1} amplitude`, 0, 1));
  return { rootHz, tuning, chord, customRatios, harmonics, pattern, tempo, durationSec, gainDb };
}

interface Interval {
  label: string;
  semitones: number;
  just: number;
  pythagorean: number;
}

const ROOT: Interval = { label: 'Root', semitones: 0, just: 1, pythagorean: 1 };
const FIFTH: Interval = { label: 'Perfect fifth', semitones: 7, just: 3 / 2, pythagorean: 3 / 2 };
const MAJOR_THIRD: Interval = { label: 'Major third', semitones: 4, just: 5 / 4, pythagorean: 81 / 64 };
const MINOR_THIRD: Interval = { label: 'Minor third', semitones: 3, just: 6 / 5, pythagorean: 32 / 27 };
const SEVENTH: Interval = { label: 'Minor seventh', semitones: 10, just: 7 / 4, pythagorean: 16 / 9 };

function makeNote(rootHz: number, ratio: number, label: string, targetCents?: number): HarmonicNote {
  const cents = ratioToCents(ratio);
  return {
    label,
    ratio,
    hz: rootHz * ratio,
    cents,
    deviationCents: cents - (targetCents ?? Math.round(cents / 100) * 100),
  };
}

function recipeNotes(recipe: HarmonicRecipe): HarmonicNote[] {
  const { chord, rootHz, tuning } = recipe;
  if (chord === 'custom') return recipe.customRatios.map((r, i) => makeNote(rootHz, r, `Custom ${i + 1}`));
  if (chord === 'harmonic') return Array.from({ length: 7 }, (_, i) => makeNote(rootHz, i + 1, `Harmonic ${i + 1}`));
  if (chord === 'phi') {
    const phi = (1 + Math.sqrt(5)) / 2;
    return [1, phi, phi * phi].map((r, i) => makeNote(rootHz, r, ['Root', 'Phi', 'Phi squared'][i]));
  }
  const intervals = chord === 'unison' ? [ROOT]
    : chord === 'fifth' ? [ROOT, FIFTH]
      : chord === 'minor' ? [ROOT, MINOR_THIRD, FIFTH]
        : chord === 'dominant7' ? [ROOT, MAJOR_THIRD, FIFTH, SEVENTH]
          : [ROOT, MAJOR_THIRD, FIFTH];
  return intervals.map((interval) => {
    const ratio = tuning === 'equal' ? Math.pow(2, interval.semitones / 12) : interval[tuning];
    const label = interval === SEVENTH && tuning === 'just' ? 'Harmonic seventh (7:4)' : interval.label;
    return makeNote(rootHz, ratio, label, interval.semitones * 100);
  });
}

/** Base harmony; progression transposes this harmony as described by the pattern. */
export function notesForRecipe(input: HarmonicRecipe): HarmonicNote[] {
  return recipeNotes(validateRecipe(input));
}

function validSampleRate(value: number): number {
  const sr = finiteRange(value, 'Sample rate (Hz)', 8000, 96000);
  if (!Number.isInteger(sr)) throw new RangeError('Sample rate must be a whole number of Hz.');
  return sr;
}

function componentsAt(
  recipe: HarmonicRecipe,
  notes: HarmonicNote[],
  sampleRate: number,
  transpose: number,
): { components: HarmonicComponent[]; omitted: number } {
  const components: HarmonicComponent[] = [];
  let omitted = 0;
  notes.forEach((note, noteIndex) => {
    recipe.harmonics.forEach((amplitude, i) => {
      if (amplitude === 0) return;
      const harmonic = i + 1;
      const hz = note.hz * transpose * harmonic;
      if (hz < 20 || hz > 16000 || hz >= sampleRate / 2) {
        omitted++;
      } else {
        components.push({ hz, amplitude, noteIndex, harmonic });
      }
    });
  });
  return { components, omitted };
}

/** Nominal base-harmony components, filtered to the actual output frequency band. */
export function componentsForRecipe(input: HarmonicRecipe, sampleRate = 48000): HarmonicComponent[] {
  const recipe = validateRecipe(input);
  return componentsAt(recipe, recipeNotes(recipe), validSampleRate(sampleRate), 1).components;
}

/**
 * Add a component using a stable oscillator recurrence. Re-anchor every 4096
 * samples so long notes do not accumulate rotation error; no time quantization
 * or rounding of the requested frequency is used.
 */
function addComponent(
  out: Float32Array,
  start: number,
  end: number,
  hz: number,
  amplitude: number,
  sampleRate: number,
): void {
  const step = 2 * Math.PI * hz / sampleRate;
  const sinStep = Math.sin(step);
  const cosStep = Math.cos(step);
  let sin = 0;
  let cos = 1;
  for (let i = start; i < end; i++) {
    const local = i - start;
    if (local !== 0 && local % 4096 === 0) {
      sin = Math.sin(step * local);
      cos = Math.cos(step * local);
    }
    out[i] += amplitude * sin;
    const nextSin = sin * cosStep + cos * sinStep;
    cos = cos * cosStep - sin * sinStep;
    sin = nextSin;
  }
}

function fadeSegment(out: Float32Array, start: number, end: number, sampleRate: number): void {
  const edge = Math.min(Math.floor((end - start) / 2), Math.round(0.02 * sampleRate));
  for (let i = 0; i < edge; i++) {
    const gain = 0.5 - 0.5 * Math.cos(Math.PI * i / edge);
    out[start + i] *= gain;
    out[end - 1 - i] *= gain;
  }
}

/**
 * Render at most 30 seconds of mono-compatible stereo. Chords sustain;
 * arpeggios play one note per beat; progression changes the full harmony every
 * four beats through root multipliers 1, 4/3, 3/2, 1 and repeats if necessary.
 * A sum-of-amplitudes bound preserves headroom without measuring and boosting
 * quiet renders. Output contains the chosen gain, including in WAV exports.
 */
export function renderHarmonicRecipe(input: HarmonicRecipe, sampleRate = 48000): HarmonicRender {
  const recipe = validateRecipe(input);
  const sr = validSampleRate(sampleRate);
  const notes = recipeNotes(recipe);
  const frames = Math.round(recipe.durationSec * sr);
  const left = new Float32Array(frames);
  const shapeCache = new Map<number, ReturnType<typeof componentsAt>>();
  const shape = (transpose: number) => {
    let result = shapeCache.get(transpose);
    if (!result) {
      result = componentsAt(recipe, notes, sr, transpose);
      shapeCache.set(transpose, result);
    }
    return result;
  };
  const weightSum = recipe.harmonics.reduce((sum, amplitude) => sum + amplitude, 0);
  const simultaneousNotes = recipe.pattern === 'arpeggio' ? 1 : notes.length;
  const gain = Math.pow(10, recipe.gainDb / 20) / (simultaneousNotes * Math.max(1, weightSum));
  const segmentSec = recipe.pattern === 'chord' ? recipe.durationSec
    : (recipe.pattern === 'progression' ? 4 : 1) * 60 / recipe.tempo;
  let segmentIndex = 0;
  for (let start = 0; start < frames; segmentIndex++) {
    const end = Math.min(frames, Math.round((segmentIndex + 1) * segmentSec * sr));
    const transpose = recipe.pattern === 'progression' ? PROGRESSION[segmentIndex % PROGRESSION.length] : 1;
    for (const component of shape(transpose).components) {
      if (recipe.pattern === 'arpeggio' && component.noteIndex !== segmentIndex % notes.length) continue;
      addComponent(left, start, end, component.hz, component.amplitude * gain, sr);
    }
    fadeSegment(left, start, end, sr);
    start = end;
  }
  // Also cover sub-sample final segments and guarantee exact silent endpoints.
  left[0] = 0;
  left[frames - 1] = 0;
  let peak = 0;
  for (const sample of left) peak = Math.max(peak, Math.abs(sample));
  let omittedPartials = 0;
  for (const result of shapeCache.values()) omittedPartials += result.omitted;
  return {
    left,
    right: left.slice(),
    sampleRate: sr,
    peakDb: peak > 0 ? 20 * Math.log10(peak) : -Infinity,
    omittedPartials,
    durationSec: frames / sr,
  };
}

/**
 * Original, bounded demonstrations of published audio methods.
 * No recordings, physiological model, DOM, or changes to the session engine.
 */

export type SoundKind = 'pairs' | 'am' | 'noise-comb' | 'noise-am' | 'pan' | 'phase-mod';

export interface SoundPair {
  leftHz: number;
  rightHz: number;
  weight: number;
}

export interface SoundRecipe {
  kind: SoundKind;
  pairs: SoundPair[];
  carrierHz: number;
  rateHz: number;
  /** AM / pan / comb depth from 0 (off) to 1. */
  depth: number;
  /** Opposite stereo phase modulation, in radians. */
  phaseDepthRad: number;
  /** Linear noise mixture; ignored by the two noise-only methods. */
  noiseMix: number;
  durationSec: number;
  /** Conservative sample-amplitude ceiling, in dBFS. Not a calibrated SPL. */
  gainDb: number;
  seed: number;
}

export interface SoundRender {
  left: Float32Array;
  right: Float32Array;
  sampleRate: number;
  durationSec: number;
  /** Peak of the stored samples in dBFS, not reconstructed true peak. */
  peakDb: number;
}

export const DEFAULT_SOUND_RECIPE: SoundRecipe = {
  kind: 'pairs',
  pairs: [{ leftHz: 100, rightHz: 104, weight: 1 }],
  carrierHz: 200,
  rateHz: 4,
  depth: 1,
  phaseDepthRad: 1,
  noiseMix: 0,
  durationSec: 20,
  gainDb: -24,
  seed: 2026,
};

const KINDS: readonly SoundKind[] = ['pairs', 'am', 'noise-comb', 'noise-am', 'pan', 'phase-mod'];
const TAU = 2 * Math.PI;

function finiteRange(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${label} must be a finite number between ${min} and ${max}.`);
  }
  return value;
}

/** Validate every field, including sparse arrays and inactive controls, before allocation. */
export function validateSoundRecipe(input: unknown): SoundRecipe {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('A sound recipe must be an object.');
  }
  const x = input as Record<string, unknown>;
  if (typeof x.kind !== 'string' || !KINDS.includes(x.kind as SoundKind)) {
    throw new RangeError(`Sound kind must be one of: ${KINDS.join(', ')}.`);
  }
  const kind = x.kind as SoundKind;
  if (!Array.isArray(x.pairs) || x.pairs.length > 4 || (kind === 'pairs' && x.pairs.length === 0)) {
    throw new RangeError('Pairs must be an array of up to 4 entries; the pairs method needs at least 1.');
  }
  const pairs = Array.from(x.pairs, (entry, index): SoundPair => {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new TypeError(`Pair ${index + 1} must be an object.`);
    }
    const pair = entry as Record<string, unknown>;
    return {
      leftHz: finiteRange(pair.leftHz, `Pair ${index + 1} left frequency (Hz)`, 60, 1000),
      rightHz: finiteRange(pair.rightHz, `Pair ${index + 1} right frequency (Hz)`, 60, 1000),
      weight: finiteRange(pair.weight, `Pair ${index + 1} weight`, 0, 1),
    };
  });
  if (kind === 'pairs' && !pairs.some((pair) => pair.weight > 0)) {
    throw new RangeError('At least one pair needs a positive weight.');
  }
  const seed = finiteRange(x.seed, 'Noise seed', 0, 0xffffffff);
  if (!Number.isInteger(seed)) throw new RangeError('Noise seed must be a whole number.');
  return {
    kind,
    pairs,
    carrierHz: finiteRange(x.carrierHz, 'Carrier frequency (Hz)', 60, 1000),
    rateHz: finiteRange(x.rateHz, 'Modulation rate (Hz)', 0.05, 40),
    depth: finiteRange(x.depth, 'Modulation depth', 0, 1),
    phaseDepthRad: finiteRange(x.phaseDepthRad, 'Phase depth (radians)', 0, Math.PI),
    noiseMix: finiteRange(x.noiseMix, 'Noise mixture', 0, 1),
    durationSec: finiteRange(x.durationSec, 'Duration (seconds)', 2, 300),
    gainDb: finiteRange(x.gainDb, 'Output gain (dBFS)', -60, -18),
    seed,
  };
}

/**
 * Voss–McCartney-style octave random holds plus a white-noise term.
 * Equal bounded terms produce pink-like noise, not an exact 1/f spectrum.
 * The unsigned LCG handles seed zero without a special or silent sequence.
 */
function noiseGenerator(seed: number): () => number {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return 2 * (state / 4294967296) - 1;
  };
  const rows = Float64Array.from({ length: 16 }, random);
  let sum = rows.reduce((total, row) => total + row, 0);
  let clock = 0;
  return () => {
    clock = (clock + 1) & 0xffff;
    if (clock !== 0) {
      let row = 0;
      let bits = clock;
      while ((bits & 1) === 0) {
        row++;
        bits >>>= 1;
      }
      const value = random();
      sum += value - rows[row];
      rows[row] = value;
    }
    return (sum + random()) / 17;
  };
}

function validSampleRate(value: number): number {
  const sampleRate = finiteRange(value, 'Sample rate (Hz)', 8000, 48000);
  if (!Number.isInteger(sampleRate)) throw new RangeError('Sample rate must be a whole number of Hz.');
  return sampleRate;
}

function delayedSample(ring: Float64Array, writeAt: number, delayFrames: number): number {
  // Delay is always at least 0.5 ms, so the current write is never read back.
  const position = (writeAt - delayFrames + ring.length) % ring.length;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return ring[lower] * (1 - fraction) + ring[(lower + 1) % ring.length] * fraction;
}

/**
 * The chosen gain is already in these samples, so playback and WAV exports
 * have the same level. A 50 ms raised-cosine fade reaches zero at both ends.
 *
 * Pair weights are divided by max(1, sum), preserving deliberately quiet
 * weights. Noise and tone form a convex mixture. Comb taps use a convex dry /
 * delayed mixture; equal-power panning and modulation never exceed unity.
 * No peak normalization or automatic gain boost is applied.
 *
 * Carrier / pair limits stay far below Nyquist at every supported sample
 * rate. AM sidebands are below 1040 Hz. Phase modulation is not strictly band
 * limited; at the allowed depths and rates its significant sidebands remain
 * far below the minimum 4 kHz Nyquist frequency.
 */
export function renderSoundRecipe(input: SoundRecipe, sampleRate = 48000): SoundRender {
  const recipe = validateSoundRecipe(input);
  const sr = validSampleRate(sampleRate);
  const frames = Math.round(recipe.durationSec * sr);
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  const fadeFrames = Math.round(0.05 * sr);
  const gain = Math.pow(10, recipe.gainDb / 20);
  const pairBound = Math.max(1, recipe.pairs.reduce((sum, pair) => sum + pair.weight, 0));
  const noiseOnly = recipe.kind === 'noise-comb' || recipe.kind === 'noise-am';
  const noise = noiseOnly || recipe.noiseMix > 0 ? noiseGenerator(recipe.seed) : undefined;
  const ring = recipe.kind === 'noise-comb' ? new Float64Array(Math.ceil(sr * 0.005) + 2) : undefined;
  let writeAt = 0;
  let peak = 0;

  for (let i = 0; i < frames; i++) {
    const time = i / sr;
    const phase = TAU * recipe.rateHz * time;
    const dryNoise = noise?.() ?? 0;
    let l = 0;
    let r = 0;

    if (recipe.kind === 'pairs') {
      for (const pair of recipe.pairs) {
        l += pair.weight * Math.sin(TAU * pair.leftHz * time) / pairBound;
        r += pair.weight * Math.sin(TAU * pair.rightHz * time) / pairBound;
      }
    } else if (recipe.kind === 'noise-comb' && ring) {
      const sweep = 0.5 + 0.5 * Math.sin(phase);
      const wetL = recipe.depth * sweep;
      const wetR = recipe.depth * (1 - sweep);
      const delayedL = delayedSample(ring, writeAt, sr * (0.0005 + 0.0045 * sweep));
      const delayedR = delayedSample(ring, writeAt, sr * (0.0005 + 0.0045 * (1 - sweep)));
      l = (dryNoise + wetL * delayedL) / (1 + wetL);
      r = (dryNoise + wetR * delayedR) / (1 + wetR);
      ring[writeAt] = dryNoise;
      writeAt = (writeAt + 1) % ring.length;
    } else if (recipe.kind === 'am' || recipe.kind === 'noise-am') {
      const envelope = 1 - recipe.depth / 2 + recipe.depth / 2 * Math.cos(phase);
      l = (recipe.kind === 'am' ? Math.sin(TAU * recipe.carrierHz * time) : dryNoise) * envelope;
      r = l;
    } else if (recipe.kind === 'phase-mod') {
      const offset = recipe.phaseDepthRad * Math.sin(phase);
      l = Math.sin(TAU * recipe.carrierHz * time + offset);
      r = Math.sin(TAU * recipe.carrierHz * time - offset);
    } else if (recipe.kind === 'pan') {
      const angle = Math.PI / 4 * (1 + recipe.depth * Math.sin(phase));
      const tone = Math.sin(TAU * recipe.carrierHz * time);
      l = tone * Math.cos(angle);
      r = tone * Math.sin(angle);
    }

    if (!noiseOnly && recipe.noiseMix > 0) {
      l = (1 - recipe.noiseMix) * l + recipe.noiseMix * dryNoise;
      r = (1 - recipe.noiseMix) * r + recipe.noiseMix * dryNoise;
    }
    const edgeDistance = Math.min(i, frames - 1 - i);
    const fade = edgeDistance < fadeFrames ? 0.5 - 0.5 * Math.cos(Math.PI * edgeDistance / fadeFrames) : 1;
    left[i] = l * fade * gain;
    right[i] = r * fade * gain;
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  }

  return { left, right, sampleRate: sr, durationSec: frames / sr, peakDb: peak === 0 ? -Infinity : 20 * Math.log10(peak) };
}

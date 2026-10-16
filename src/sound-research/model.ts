/**
 * Educational signal algebra and an ideal linear oscillator, without a
 * physiological model or acoustic calibration. This module never plays audio.
 */

export const MAX_PLOT_SAMPLES = 1200;
export const MODEL_NOTICE = 'Model only. Digital sample amplitude is not sound pressure level. No tissue, disease, or treatment response is predicted.';

export interface WaveformConfig {
  /** Left/first oscillator frequency, rather than the midpoint of the pair. */
  carrierHz: number;
  beatHz: number;
  modulationDepth: number;
  durationSec: number;
  sampleCount: number;
}

export interface WaveformRow {
  timeSec: number;
  carrier: number;
  binauralLeft: number;
  binauralRight: number;
  /** Two sine waves averaged into one channel; not the engine's AM mode. */
  monaural: number;
  am: number;
  envelope: number;
}

export interface EnvelopeConfig {
  beatHz: number;
  modulationDepth: number;
  durationSec: number;
  sampleCount: number;
}

export interface EnvelopeRow {
  timeSec: number;
  /** Nonnegative, sinusoidal amplitude-modulation envelope. */
  envelope: number;
  /** Magnitude of the signed coefficient of the averaged two-tone sum. */
  monauralEnvelope: number;
}

export interface ResonatorConfig {
  dampingRatio: number;
  maxFrequencyRatio: number;
  sampleCount: number;
}

export interface ResonanceRow {
  frequencyRatio: number;
  /** Displacement amplitude divided by the static displacement F0/k. */
  response: number;
  phaseLagRad: number;
}

export interface SensitivityScenario {
  id: 'low' | 'base' | 'high';
  label: string;
  dampingRatio: number;
  rows: ResonanceRow[];
}

export const DEFAULT_WAVEFORM_CONFIG: Readonly<WaveformConfig> = Object.freeze({
  carrierHz: 180,
  beatHz: 6,
  modulationDepth: 1,
  durationSec: 0.05,
  sampleCount: MAX_PLOT_SAMPLES,
});

export const DEFAULT_ENVELOPE_CONFIG: Readonly<EnvelopeConfig> = Object.freeze({
  beatHz: 6,
  modulationDepth: 1,
  durationSec: 1,
  sampleCount: 600,
});

export const DEFAULT_RESONATOR_CONFIG: Readonly<ResonatorConfig> = Object.freeze({
  dampingRatio: 0.15,
  maxFrequencyRatio: 3,
  sampleCount: 600,
});

const TAU = 2 * Math.PI;
const MIN_DAMPING = 0.01;
const MAX_DAMPING = 2;

function objectRecord(input: unknown, label: string): Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return input as Record<string, unknown>;
}

function finiteRange(input: unknown, label: string, min: number, max: number): number {
  if (typeof input !== 'number' || !Number.isFinite(input) || input < min || input > max) {
    throw new RangeError(`${label} must be a finite number between ${min} and ${max}.`);
  }
  return input;
}

function validCount(input: unknown): number {
  const count = finiteRange(input, 'Plot sample count', 2, MAX_PLOT_SAMPLES);
  if (!Number.isInteger(count)) throw new RangeError('Plot sample count must be a whole number.');
  return count;
}

/** Maximum display window retaining at least eight samples per fastest cycle. */
export function maxWaveformDurationSec(carrierHz: number, beatHz: number, sampleCount = MAX_PLOT_SAMPLES): number {
  const carrier = finiteRange(carrierHz, 'Carrier frequency (Hz)', 60, 1000);
  const beat = finiteRange(beatHz, 'Beat/modulation rate (Hz)', 0, 40);
  const count = validCount(sampleCount);
  // carrier + beat is also the upper AM sideband.
  return Math.min(1, (count - 1) / (8 * (carrier + beat)));
}

/** Validate the complete input before allocating any plotted rows. */
export function validateWaveformConfig(input: unknown): WaveformConfig {
  const value = objectRecord(input, 'Waveform configuration');
  const config: WaveformConfig = {
    carrierHz: finiteRange(value.carrierHz, 'Carrier frequency (Hz)', 60, 1000),
    beatHz: finiteRange(value.beatHz, 'Beat/modulation rate (Hz)', 0, 40),
    modulationDepth: finiteRange(value.modulationDepth, 'Modulation depth', 0, 1),
    durationSec: finiteRange(value.durationSec, 'Plot duration (seconds)', 0.002, 1),
    sampleCount: validCount(value.sampleCount),
  };
  const maximum = maxWaveformDurationSec(config.carrierHz, config.beatHz, config.sampleCount);
  if (config.durationSec > maximum) {
    throw new RangeError(`Shorten the plot window to ${maximum.toPrecision(5)} seconds or increase samples to resolve the carrier.`);
  }
  return config;
}

/** The sine phase convention matches the existing engine's AM oscillator. */
function amEnvelope(beatHz: number, depth: number, timeSec: number): number {
  return 1 - depth / 2 + depth / 2 * Math.sin(TAU * beatHz * timeSec);
}

export function buildWaveformRows(input: WaveformConfig = DEFAULT_WAVEFORM_CONFIG): WaveformRow[] {
  const config = validateWaveformConfig(input);
  return Array.from({ length: config.sampleCount }, (_, index) => {
    const timeSec = index * config.durationSec / (config.sampleCount - 1);
    const carrier = Math.sin(TAU * config.carrierHz * timeSec);
    const binauralRight = Math.sin(TAU * (config.carrierHz + config.beatHz) * timeSec);
    const envelope = amEnvelope(config.beatHz, config.modulationDepth, timeSec);
    return {
      timeSec,
      carrier,
      binauralLeft: carrier,
      binauralRight,
      monaural: (carrier + binauralRight) / 2,
      am: envelope * carrier,
      envelope,
    };
  });
}

export function validateEnvelopeConfig(input: unknown): EnvelopeConfig {
  const value = objectRecord(input, 'Envelope configuration');
  const config: EnvelopeConfig = {
    beatHz: finiteRange(value.beatHz, 'Beat/modulation rate (Hz)', 0, 40),
    modulationDepth: finiteRange(value.modulationDepth, 'Modulation depth', 0, 1),
    durationSec: finiteRange(value.durationSec, 'Envelope duration (seconds)', 0.05, 10),
    sampleCount: validCount(value.sampleCount),
  };
  if (config.beatHz > 0 && (config.sampleCount - 1) / config.durationSec < 8 * config.beatHz) {
    throw new RangeError('Shorten the envelope window or increase samples to resolve the modulation.');
  }
  return config;
}

/** Slow envelopes are sampled independently of the much faster carrier. */
export function buildEnvelopeRows(input: EnvelopeConfig = DEFAULT_ENVELOPE_CONFIG): EnvelopeRow[] {
  const config = validateEnvelopeConfig(input);
  return Array.from({ length: config.sampleCount }, (_, index) => {
    const timeSec = index * config.durationSec / (config.sampleCount - 1);
    return {
      timeSec,
      envelope: amEnvelope(config.beatHz, config.modulationDepth, timeSec),
      monauralEnvelope: Math.abs(Math.cos(Math.PI * config.beatHz * timeSec)),
    };
  });
}

function damping(input: unknown): number {
  return finiteRange(input, 'Damping ratio', MIN_DAMPING, MAX_DAMPING);
}

/**
 * H(r) = 1 / sqrt((1-r^2)^2 + (2*zeta*r)^2), r = forcing/natural frequency.
 * An ideal steady-state, force-driven linear oscillator; no physical units.
 * Positive damping excludes the undefined undamped resonant singularity.
 */
export function resonatorResponse(frequencyRatio: number, dampingRatio: number): number {
  const ratio = finiteRange(frequencyRatio, 'Frequency ratio', 0, 1_000_000);
  const zeta = damping(dampingRatio);
  return 1 / Math.hypot(1 - ratio * ratio, 2 * zeta * ratio);
}

export function validateResonatorConfig(input: unknown): ResonatorConfig {
  const value = objectRecord(input, 'Resonator configuration');
  return {
    dampingRatio: damping(value.dampingRatio),
    maxFrequencyRatio: finiteRange(value.maxFrequencyRatio, 'Maximum plotted frequency ratio', 1, 10),
    sampleCount: validCount(value.sampleCount),
  };
}

export function buildResonanceRows(input: ResonatorConfig = DEFAULT_RESONATOR_CONFIG): ResonanceRow[] {
  const config = validateResonatorConfig(input);
  return Array.from({ length: config.sampleCount }, (_, index) => {
    const frequencyRatio = index * config.maxFrequencyRatio / (config.sampleCount - 1);
    return {
      frequencyRatio,
      response: resonatorResponse(frequencyRatio, config.dampingRatio),
      phaseLagRad: Math.atan2(2 * config.dampingRatio * frequencyRatio, 1 - frequencyRatio * frequencyRatio),
    };
  });
}

/** Half/double the baseline damping; omit a duplicate at either domain bound. */
export function buildSensitivityScenarios(input: ResonatorConfig = DEFAULT_RESONATOR_CONFIG): SensitivityScenario[] {
  const config = validateResonatorConfig(input);
  const scenarios: Omit<SensitivityScenario, 'rows'>[] = [];
  const lower = Math.max(MIN_DAMPING, config.dampingRatio / 2);
  const higher = Math.min(MAX_DAMPING, config.dampingRatio * 2);
  if (lower < config.dampingRatio) scenarios.push({ id: 'low', label: 'Lower damping', dampingRatio: lower });
  scenarios.push({ id: 'base', label: 'Selected damping', dampingRatio: config.dampingRatio });
  if (higher > config.dampingRatio) scenarios.push({ id: 'high', label: 'Higher damping', dampingRatio: higher });
  return scenarios.map((scenario) => ({
    ...scenario,
    rows: buildResonanceRows({ ...config, dampingRatio: scenario.dampingRatio }),
  }));
}

/** CSV metadata is intentionally explicit about normalized values and parameters. */
function csvMetadata(model: string, config: object): string[] {
  return [
    '# Open Sync educational model v1',
    `# ${MODEL_NOTICE}`,
    `# model=${model}`,
    ...Object.entries(config).map(([key, value]) => `# ${key}=${String(value)}`),
  ];
}

export function waveformCsv(input: WaveformConfig = DEFAULT_WAVEFORM_CONFIG): string {
  const config = validateWaveformConfig(input);
  const rows = buildWaveformRows(config);
  return [
    ...csvMetadata('normalized digital signals; AM uses a sine envelope', config),
    '# monaural=(left+right)/2; binaural channels are not acoustically summed here',
    'time_sec,carrier,binaural_left,binaural_right,monaural_two_tone,am,envelope',
    ...rows.map((row) => [row.timeSec, row.carrier, row.binauralLeft, row.binauralRight, row.monaural, row.am, row.envelope].join(',')),
  ].join('\n') + '\n';
}

export function envelopeCsv(input: EnvelopeConfig = DEFAULT_ENVELOPE_CONFIG): string {
  const config = validateEnvelopeConfig(input);
  const rows = buildEnvelopeRows(config);
  return [
    ...csvMetadata('analytical envelopes; not brain or body activity', config),
    'time_sec,am_envelope,monaural_envelope',
    ...rows.map((row) => [row.timeSec, row.envelope, row.monauralEnvelope].join(',')),
  ].join('\n') + '\n';
}

export function resonanceCsv(input: ResonatorConfig = DEFAULT_RESONATOR_CONFIG): string {
  const config = validateResonatorConfig(input);
  const rows = buildResonanceRows(config);
  return [
    ...csvMetadata('ideal linear steady-state oscillator; all quantities dimensionless except phase in radians', config),
    '# response=displacement_amplitude/(force_amplitude/stiffness)',
    'frequency_ratio,normalized_displacement,phase_lag_rad',
    ...rows.map((row) => [row.frequencyRatio, row.response, row.phaseLagRad].join(',')),
  ].join('\n') + '\n';
}

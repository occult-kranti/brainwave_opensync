/** Ideal linear acoustics for scale comparison, without exposure calibration. */

export interface AcousticsInput {
  frequencyHz: number;
  /** Fixed classroom reference: air 343 m/s or fresh water 1480 m/s at 20 °C. */
  soundSpeed: number;
  /** Hypothetical positive ratio Z2/Z1, independent of the medium selector. */
  impedanceRatio: number;
}

export interface AcousticsResult {
  wavelengthM: number;
  periodMs: number;
  /** Reflected / incident power at one ideal lossless normal-incidence interface. */
  reflectionPower: number;
  /** Transmitted / incident power; not a pressure-amplitude coefficient. */
  transmissionPower: number;
}

export interface ImpedanceSweepRow {
  impedanceRatio: number;
  reflectionPower: number;
  transmissionPower: number;
}

export const MAX_ACOUSTICS_SAMPLES = 600;
export const ACOUSTICS_NOTICE = 'Ideal linear acoustics only. The medium selector sets wavelength; the hypothetical impedance ratio is independent. No body coupling, sound dose, or treatment response is estimated.';
export const DEFAULT_ACOUSTICS_INPUT: Readonly<AcousticsInput> = Object.freeze({
  frequencyHz: 180,
  soundSpeed: 343,
  impedanceRatio: 1,
});

export const ACOUSTICS_SOURCES = [
  {
    id: 'openstax-wavelength',
    title: 'OpenStax: Speed of Sound, Frequency, and Wavelength',
    url: 'https://openstax.org/books/college-physics-2e/pages/17-2-speed-of-sound-frequency-and-wavelength',
    scope: 'Wave relation and classroom sound-speed references at 20 °C.',
  },
  {
    id: 'mit-acoustic-boundary',
    title: 'MIT / David H. Staelin: Acoustic boundary conditions, §13.2.1',
    url: 'https://ocw.mit.edu/courses/6-013-electromagnetics-and-applications-spring-2009/d3be4ea78b036a6362230fb41780cf54_MIT6_013S09_notes.pdf',
    scope: 'Ideal pressure and velocity continuity; normalized acoustic reflection.',
  },
  {
    id: 'unsw-pitch',
    title: 'UNSW: Note names, MIDI numbers and frequencies',
    url: 'https://www.phys.unsw.edu.au/jw/notes.html',
    scope: 'Frequency ratios, octaves and cents.',
  },
] as const;

function finiteRange(input: unknown, label: string, minimum: number, maximum: number): number {
  if (typeof input !== 'number' || !Number.isFinite(input) || input < minimum || input > maximum) {
    throw new RangeError(`${label} must be a finite number between ${minimum} and ${maximum}.`);
  }
  return input;
}

export function validateAcousticsInput(input: unknown): AcousticsInput {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Acoustics input must be an object.');
  }
  const value = input as Record<string, unknown>;
  if (value.soundSpeed !== 343 && value.soundSpeed !== 1480) {
    throw new RangeError('Select the ideal air reference (343 m/s) or fresh-water reference (1480 m/s).');
  }
  return {
    frequencyHz: finiteRange(value.frequencyHz, 'Frequency (Hz)', 60, 1000),
    soundSpeed: value.soundSpeed,
    impedanceRatio: finiteRange(value.impedanceRatio, 'Hypothetical impedance ratio Z2/Z1', 0.01, 100),
  };
}

function interfaceFractions(impedanceRatio: number): Pick<AcousticsResult, 'reflectionPower' | 'transmissionPower'> {
  const denominator = impedanceRatio + 1;
  const pressureReflection = (impedanceRatio - 1) / denominator;
  return {
    reflectionPower: pressureReflection * pressureReflection,
    transmissionPower: 4 * impedanceRatio / (denominator * denominator),
  };
}

/**
 * lambda = c/f; period_ms = 1000/f.
 * R = ((q-1)/(q+1))^2; T = 4q/(q+1)^2, q = Z2/Z1 > 0.
 * The last two are ideal power fractions, independent of f and selected c.
 */
export function calculateAcoustics(input: AcousticsInput = DEFAULT_ACOUSTICS_INPUT): AcousticsResult {
  const value = validateAcousticsInput(input);
  return {
    wavelengthM: value.soundSpeed / value.frequencyHz,
    periodMs: 1000 / value.frequencyHz,
    ...interfaceFractions(value.impedanceRatio),
  };
}

/** Musical interval: a doubled frequency is +1200 cents, not an energy scale. */
export function pitchIntervalCents(frequencyHz: number, referenceHz: number): number {
  const frequency = finiteRange(frequencyHz, 'Frequency (Hz)', 60, 1000);
  const reference = finiteRange(referenceHz, 'Reference frequency (Hz)', 60, 1000);
  return 1200 * Math.log2(frequency / reference);
}

function validSampleCount(input: unknown): number {
  const count = finiteRange(input, 'Impedance plot sample count', 2, MAX_ACOUSTICS_SAMPLES);
  if (!Number.isInteger(count)) throw new RangeError('Impedance plot sample count must be a whole number.');
  return count;
}

/** Log-spaced hypothetical ratios from 0.01 to 100, including both endpoints. */
export function buildImpedanceSweepRows(sampleCount = 201): ImpedanceSweepRow[] {
  const count = validSampleCount(sampleCount);
  return Array.from({ length: count }, (_, index) => {
    const impedanceRatio = index === 0 ? 0.01 : index === count - 1 ? 100 : 10 ** (-2 + 4 * index / (count - 1));
    return { impedanceRatio, ...interfaceFractions(impedanceRatio) };
  });
}

/** Numerical export with selected scale values and an independent interface sweep. */
export function acousticsCsv(input: AcousticsInput = DEFAULT_ACOUSTICS_INPUT, sampleCount = 201): string {
  const value = validateAcousticsInput(input);
  const count = validSampleCount(sampleCount);
  const result = calculateAcoustics(value);
  const rows = buildImpedanceSweepRows(count);
  return [
    '# Open Sync acoustics model v1',
    `# ${ACOUSTICS_NOTICE}`,
    '# assumptions=plane waves; one flat lossless interface; normal incidence; positive real impedances',
    '# speed_reference_temperature_C=20; sound speeds are approximate classroom values',
    `# frequencyHz=${value.frequencyHz}`,
    `# soundSpeed_m_per_s=${value.soundSpeed}`,
    `# selected_impedanceRatio=${value.impedanceRatio}`,
    `# selected_wavelength_m=${result.wavelengthM}`,
    `# selected_period_ms=${result.periodMs}`,
    `# selected_reflection_power_fraction=${result.reflectionPower}`,
    `# selected_transmission_power_fraction=${result.transmissionPower}`,
    '# sweep=logarithmic hypothetical impedance ratios 0.01..100; independent of frequency and sound speed',
    `# sampleCount=${count}`,
    'impedance_ratio,reflection_power_fraction,transmission_power_fraction',
    ...rows.map((row) => [row.impedanceRatio, row.reflectionPower, row.transmissionPower].join(',')),
  ].join('\n') + '\n';
}

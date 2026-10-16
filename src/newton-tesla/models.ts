/** Bounded teaching models. No hardware control, medical mapping or audio output. */

export const MAX_MODEL_SAMPLES = 600;
export const FIELD_NOTICE = 'Normalized field geometry only; no actual magnetic flux density, coil current, torque or exposure is calculated.';
export const RLC_NOTICE = 'Ideal passive series RLC model, powered by the specified sinusoidal source. These calculations are not device-building instructions or a real-component safety assessment.';
export const OPTICS_NOTICE = 'Ideal ray refraction at one flat interface. Indices are supplied model parameters; no color-to-audio or biological equivalence is assumed.';

export interface FieldInput {
  amplitudeRatio: number;
  phaseDeg: number;
  sampleCount: number;
}

export interface RotatingFieldRow {
  angleDeg: number;
  bx: number;
  by: number;
  magnitude: number;
}

export interface RotatingFieldSummary {
  shape: 'circle' | 'ellipse' | 'line';
  minimumMagnitude: number;
  maximumMagnitude: number;
  direction: 'counterclockwise' | 'clockwise' | 'linear';
}

export interface RlcInput {
  inductanceMh: number;
  capacitanceNf: number;
  resistanceOhm: number;
  frequencyHz: number;
  inputVrms: number;
}

export interface RlcResult {
  resonantFrequencyHz: number;
  qualityFactor: number;
  currentArms: number;
  currentMilliAmps: number;
  /** Current relative to source voltage: negative means current lags. */
  currentPhaseDeg: number;
  impedanceOhm: number;
  /** Average real power supplied by the source. */
  inputPowerW: number;
  dissipationPowerW: number;
  /** Positive for an inductive load, negative for a capacitive load. */
  reactivePowerVar: number;
  apparentPowerVa: number;
  inductorVoltageVrms: number;
  capacitorVoltageVrms: number;
  /** Positive-frequency capacitor-voltage maximum, or null when none exists. */
  capacitorPeakFrequencyHz: number | null;
}

export interface RlcSweepRow {
  frequencyRatio: number;
  frequencyHz: number;
  currentMilliAmps: number;
  /** I_rms divided by the current at series resonance, V_rms/R. */
  normalizedCurrent: number;
  currentPhaseDeg: number;
  inputPowerW: number;
}

export interface OpticsInput {
  n1: number;
  n2: number;
  /** Angle from the surface normal, in degrees. */
  incidenceDeg: number;
}

export interface RefractionResult {
  totalInternalReflection: boolean;
  transmittedDeg: number | null;
  criticalAngleDeg: number | null;
  reflectedDeg: number;
}

export interface RefractionRow extends RefractionResult {
  incidenceDeg: number;
}

export const DEFAULT_FIELD_INPUT: Readonly<FieldInput> = Object.freeze({ amplitudeRatio: 1, phaseDeg: 90, sampleCount: 361 });
export const DEFAULT_RLC_INPUT: Readonly<RlcInput> = Object.freeze({
  inductanceMh: 10,
  capacitanceNf: 1000,
  resistanceOhm: 220,
  frequencyHz: 1000,
  inputVrms: 0.5,
});
export const DEFAULT_OPTICS_INPUT: Readonly<OpticsInput> = Object.freeze({ n1: 1, n2: 1.5, incidenceDeg: 35 });

export const NEWTON_TESLA_MODEL_SOURCES = [
  {
    id: 'mit-two-phase',
    title: 'MIT: Electromechanical Dynamics, Chapter 4',
    url: 'https://ocw.mit.edu/courses/res-6-003-electromechanical-dynamics-spring-2009/30dd72688208782bff485372c57bd3c3_chap04_emd.pdf',
    scope: 'Balanced quadrature excitation and rotating fields, §4.1.3–4.1.4.',
  },
  {
    id: 'mit-rlc',
    title: 'MIT: Frequency response, resonance, bandwidth and Q',
    url: 'https://ocw.mit.edu/courses/6-071j-introduction-to-electronics-signals-and-measurement-spring-2006/5bcec4bfba5f2e99754b77509e9e7ab4_resonance_qfactr.pdf',
    scope: 'Passive series impedance, power dissipation and Q.',
  },
  {
    id: 'openstax-rlc',
    title: 'OpenStax: Resonance in an AC Circuit',
    url: 'https://openstax.org/books/university-physics-volume-2/pages/15-5-resonance-in-an-ac-circuit',
    scope: 'Current maximum at series resonance and dependence on resistance.',
  },
  {
    id: 'openstax-refraction',
    title: 'OpenStax: Total Internal Reflection',
    url: 'https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection',
    scope: 'Snell’s law, angles from the normal and critical-angle condition.',
  },
] as const;

const TAU = 2 * Math.PI;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function record(input: unknown, label: string): Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) throw new TypeError(`${label} must be an object.`);
  return input as Record<string, unknown>;
}

function finiteRange(input: unknown, label: string, minimum: number, maximum: number): number {
  if (typeof input !== 'number' || !Number.isFinite(input) || input < minimum || input > maximum) {
    throw new RangeError(`${label} must be a finite number between ${minimum} and ${maximum}.`);
  }
  return input;
}

function sampleCount(input: unknown, minimum = 2): number {
  const count = finiteRange(input, 'Plot sample count', minimum, MAX_MODEL_SAMPLES);
  if (!Number.isInteger(count)) throw new RangeError('Plot sample count must be a whole number.');
  return count;
}

export function validateFieldInput(input: unknown): FieldInput {
  const value = record(input, 'Field input');
  return {
    amplitudeRatio: finiteRange(value.amplitudeRatio, 'Orthogonal amplitude ratio', 0, 2),
    phaseDeg: finiteRange(value.phaseDeg, 'Relative phase (degrees)', -180, 180),
    sampleCount: sampleCount(value.sampleCount),
  };
}

/** Bx=cos(theta), By=a*cos(theta-phi), with arbitrary normalized field units. */
export function buildRotatingFieldRows(input: FieldInput = DEFAULT_FIELD_INPUT): RotatingFieldRow[] {
  const value = validateFieldInput(input);
  const phase = value.phaseDeg * DEG_TO_RAD;
  return Array.from({ length: value.sampleCount }, (_, index) => {
    const angleDeg = 360 * index / (value.sampleCount - 1);
    const theta = angleDeg * DEG_TO_RAD;
    const bx = Math.cos(theta);
    const by = value.amplitudeRatio * Math.cos(theta - phase);
    return { angleDeg, bx, by, magnitude: Math.hypot(bx, by) };
  });
}

/** Analytical ellipse radii from singular values of the two-component map. */
export function calculateRotatingField(input: FieldInput = DEFAULT_FIELD_INPUT): RotatingFieldSummary {
  const value = validateFieldInput(input);
  const phase = value.phaseDeg * DEG_TO_RAD;
  const a = value.amplitudeRatio;
  const trace = 1 + a * a;
  const determinant = (a * Math.sin(phase)) ** 2;
  const largestEigenvalue = (trace + Math.sqrt(Math.max(0, trace * trace - 4 * determinant))) / 2;
  const maximumMagnitude = Math.sqrt(largestEigenvalue);
  const minimumMagnitude = Math.sqrt(determinant / largestEigenvalue);
  const linear = a === 0 || Math.abs(Math.sin(phase)) < 1e-12;
  const circle = !linear && Math.abs(a - 1) < 1e-12 && Math.abs(Math.cos(phase)) < 1e-12;
  return {
    shape: linear ? 'line' : circle ? 'circle' : 'ellipse',
    minimumMagnitude: linear ? 0 : minimumMagnitude,
    maximumMagnitude,
    direction: linear ? 'linear' : Math.sin(phase) > 0 ? 'counterclockwise' : 'clockwise',
  };
}

export function validateRlcInput(input: unknown): RlcInput {
  const value = record(input, 'Series RLC input');
  return {
    inductanceMh: finiteRange(value.inductanceMh, 'Inductance (mH)', 1, 100),
    capacitanceNf: finiteRange(value.capacitanceNf, 'Capacitance (nF)', 100, 10_000),
    resistanceOhm: finiteRange(value.resistanceOhm, 'Resistance (ohms)', 100, 2000),
    frequencyHz: finiteRange(value.frequencyHz, 'Source frequency (Hz)', 20, 20_000),
    inputVrms: finiteRange(value.inputVrms, 'Source voltage (Vrms)', 0.1, 1),
  };
}

function rlcAtFrequency(value: RlcInput, frequencyHz: number): RlcResult {
  const inductanceH = value.inductanceMh * 1e-3;
  const capacitanceF = value.capacitanceNf * 1e-9;
  const omega = TAU * frequencyHz;
  const omega0 = 1 / Math.sqrt(inductanceH * capacitanceF);
  const resonantFrequencyHz = omega0 / TAU;
  const qualityFactor = omega0 * inductanceH / value.resistanceOhm;
  const inductiveReactance = omega * inductanceH;
  const capacitiveReactance = 1 / (omega * capacitanceF);
  const netReactance = inductiveReactance - capacitiveReactance;
  const impedanceOhm = Math.hypot(value.resistanceOhm, netReactance);
  const currentArms = value.inputVrms / impedanceOhm;
  const impedancePhase = Math.atan2(netReactance, value.resistanceOhm);
  return {
    resonantFrequencyHz,
    qualityFactor,
    currentArms,
    currentMilliAmps: 1000 * currentArms,
    currentPhaseDeg: -impedancePhase * RAD_TO_DEG,
    impedanceOhm,
    inputPowerW: value.inputVrms * currentArms * Math.cos(impedancePhase),
    dissipationPowerW: currentArms * currentArms * value.resistanceOhm,
    reactivePowerVar: currentArms * currentArms * netReactance,
    apparentPowerVa: value.inputVrms * currentArms,
    inductorVoltageVrms: currentArms * inductiveReactance,
    capacitorVoltageVrms: currentArms * capacitiveReactance,
    capacitorPeakFrequencyHz: qualityFactor > Math.SQRT1_2
      ? resonantFrequencyHz * Math.sqrt(1 - 1 / (2 * qualityFactor * qualityFactor))
      : null,
  };
}

/** Steady state with RMS source/current convention; ideal L/C consume no mean power. */
export function calculateSeriesRlc(input: RlcInput = DEFAULT_RLC_INPUT): RlcResult {
  const value = validateRlcInput(input);
  return rlcAtFrequency(value, value.frequencyHz);
}

/**
 * A split log sweep includes f/f0=1 exactly and keeps frequencies in 20..20000 Hz.
 * Current is normalized to V/R. Minimum three rows retain both ends and resonance.
 */
export function buildRlcSweepRows(input: RlcInput = DEFAULT_RLC_INPUT, countInput = 301): RlcSweepRow[] {
  const value = validateRlcInput(input);
  const count = sampleCount(countInput, 3);
  const f0 = rlcAtFrequency(value, value.frequencyHz).resonantFrequencyHz;
  const minimumHz = Math.max(20, 0.1 * f0);
  const maximumHz = Math.min(20_000, 3 * f0);
  const lowerLog = Math.log(minimumHz / f0);
  const upperLog = Math.log(maximumHz / f0);
  const peakIndex = Math.max(1, Math.min(count - 2, Math.round(-lowerLog / (upperLog - lowerLog) * (count - 1))));
  return Array.from({ length: count }, (_, index) => {
    const logRatio = index <= peakIndex
      ? lowerLog * (1 - index / peakIndex)
      : upperLog * (index - peakIndex) / (count - 1 - peakIndex);
    const frequencyHz = index === 0 ? minimumHz : index === count - 1 ? maximumHz : index === peakIndex ? f0 : f0 * Math.exp(logRatio);
    const result = rlcAtFrequency(value, frequencyHz);
    return {
      frequencyRatio: frequencyHz / f0,
      frequencyHz,
      currentMilliAmps: result.currentMilliAmps,
      normalizedCurrent: result.currentArms / (value.inputVrms / value.resistanceOhm),
      currentPhaseDeg: result.currentPhaseDeg,
      inputPowerW: result.inputPowerW,
    };
  });
}

export function validateOpticsInput(input: unknown): OpticsInput {
  const value = record(input, 'Refraction input');
  return {
    n1: finiteRange(value.n1, 'Incident-medium refractive index', 1, 2.5),
    n2: finiteRange(value.n2, 'Transmitted-medium refractive index', 1, 2.5),
    incidenceDeg: finiteRange(value.incidenceDeg, 'Incidence angle from the normal (degrees)', 0, 89.9),
  };
}

function refractionAtAngle(value: OpticsInput, incidenceDeg: number): RefractionResult {
  const criticalAngleDeg = value.n1 > value.n2 ? Math.asin(value.n2 / value.n1) * RAD_TO_DEG : null;
  const totalInternalReflection = criticalAngleDeg !== null && incidenceDeg > criticalAngleDeg;
  const sineTransmission = value.n1 / value.n2 * Math.sin(incidenceDeg * DEG_TO_RAD);
  return {
    totalInternalReflection,
    transmittedDeg: totalInternalReflection ? null : incidenceDeg === criticalAngleDeg ? 90 : Math.asin(Math.min(1, sineTransmission)) * RAD_TO_DEG,
    criticalAngleDeg,
    reflectedDeg: incidenceDeg,
  };
}

/** Snell's law at a planar interface. A missing transmitted ray is null, never NaN. */
export function calculateRefraction(input: OpticsInput = DEFAULT_OPTICS_INPUT): RefractionResult {
  const value = validateOpticsInput(input);
  return refractionAtAngle(value, value.incidenceDeg);
}

export function buildRefractionRows(input: OpticsInput = DEFAULT_OPTICS_INPUT, countInput = 181): RefractionRow[] {
  const value = validateOpticsInput(input);
  const count = sampleCount(countInput);
  return Array.from({ length: count }, (_, index) => {
    const incidenceDeg = index * 89.9 / (count - 1);
    return { incidenceDeg, ...refractionAtAngle(value, incidenceDeg) };
  });
}

function metadata(model: string, notice: string, input: object): string[] {
  return [
    '# Open Sync Newton-Tesla teaching models v1',
    `# model=${model}`,
    `# ${notice}`,
    ...Object.entries(input).map(([key, value]) => `# ${key}=${String(value)}`),
  ];
}

export function rotatingFieldCsv(input: FieldInput = DEFAULT_FIELD_INPUT): string {
  const value = validateFieldInput(input);
  const rows = buildRotatingFieldRows(value);
  return [
    ...metadata('orthogonal sinusoidal field geometry', FIELD_NOTICE, value),
    '# theta increases from 0 to 360 degrees; components and magnitude are dimensionless',
    'angle_deg,bx_normalized,by_normalized,magnitude_normalized',
    ...rows.map((row) => [row.angleDeg, row.bx, row.by, row.magnitude].join(',')),
  ].join('\n') + '\n';
}

export function rlcCsv(input: RlcInput = DEFAULT_RLC_INPUT, countInput = 301): string {
  const value = validateRlcInput(input);
  const count = sampleCount(countInput, 3);
  const selected = calculateSeriesRlc(value);
  const rows = buildRlcSweepRows(value, count);
  return [
    ...metadata('passive series RLC; sinusoidal steady state', RLC_NOTICE, value),
    '# source voltage and current use RMS; current phase is relative to source voltage; negative means lag',
    '# inputPowerW is mean real source power; ideal L and C have zero mean dissipation',
    `# sampleCount=${count}`,
    ...Object.entries(selected).map(([key, result]) => `# selected_${key}=${result === null ? 'none' : String(result)}`),
    '# capacitorPeakFrequencyHz is an analytical capacitor-voltage maximum, not the current resonance; none means no positive-frequency maximum',
    'frequency_ratio,frequency_hz,current_mA_rms,normalized_current,current_phase_deg,input_power_W',
    ...rows.map((row) => [row.frequencyRatio, row.frequencyHz, row.currentMilliAmps, row.normalizedCurrent, row.currentPhaseDeg, row.inputPowerW].join(',')),
  ].join('\n') + '\n';
}

export function opticsCsv(input: OpticsInput = DEFAULT_OPTICS_INPUT, countInput = 181): string {
  const value = validateOpticsInput(input);
  const count = sampleCount(countInput);
  const rows = buildRefractionRows(value, count);
  const selected = calculateRefraction(value);
  return [
    ...metadata('Snell refraction and total internal reflection', OPTICS_NOTICE, value),
    '# all angles in degrees from the surface normal; no Fresnel power fractions or dispersion model',
    '# empty transmitted angle means no propagating transmitted ray; TIR flag 1=true and 0=false',
    `# sampleCount=${count}`,
    `# selected_transmitted_angle_deg=${selected.transmittedDeg ?? 'none'}`,
    `# critical_angle_deg=${selected.criticalAngleDeg ?? 'none'}`,
    'incidence_deg,transmitted_deg,reflected_deg,total_internal_reflection',
    ...rows.map((row) => [row.incidenceDeg, row.transmittedDeg ?? '', row.reflectedDeg, row.totalInternalReflection ? 1 : 0].join(',')),
  ].join('\n') + '\n';
}

/** Bounded, virtual teaching models: no hardware, sound output or exposure guidance. */
export const MAX_LEVITATION_SAMPLES = 600;
export const GRAVITY_M_PER_S2 = 9.80665;
/** Teaching approximation, not an assertion that mu_0 is exact in the revised SI. */
export const VACUUM_PERMEABILITY_H_PER_M = 4 * Math.PI * 1e-7;
export const IDEAL_AIR = Object.freeze({ densityKgM3: 1.2, soundSpeedMPerS: 343 });
export const ACOUSTIC_NOTICE = 'Virtual 1D inviscid Rayleigh-sphere model in ideal air. Pressure is a numerical peak amplitude, not an exposure recommendation or device setting. Local vertical restoring force does not establish 3D confinement. Thermoviscous effects, streaming, finite boundaries and particle interactions are omitted; ka below 0.3 alone does not validate a real experiment.';
export const DIAMAGNETIC_NOTICE = 'Local weak, linear, isotropic diamagnetic force budget only. A signed gradient is supplied, not a realizable magnet geometry. Force balance does not establish stability. Susceptibility anisotropy, demagnetization, field backreaction and buoyancy are omitted.';
export const MECHANICAL_NOTICE = 'Driven linear spring–mass vibration comparison, not a levitation or feedback model. Gravity produces static downward sag. The external force supplies the dissipated energy. Travel limits, nonlinearities and transients are omitted.';

export interface AcousticInput {
  frequencyHz: number;
  /** Nonnegative peak amplitude at a standing-wave pressure antinode, not RMS. */
  pressurePeakPa: number;
  particleRadiusMm: number;
  particleDensityKgM3: number;
  particleCompressibilityPaInv: number;
  /** Spatial phase in cos(kz + phase); not a relative transducer phase. */
  phaseDeg: number;
}
export interface AcousticSummary {
  wavelengthM: number;
  ka: number;
  contrastFactor: number;
  energyDensityJm3: number;
  volumeM3: number;
  weightN: number;
  buoyancyN: number;
  effectiveWeightN: number;
  maxAcousticForceN: number;
  forceMarginRatio: number;
  phaseTranslationM: number;
  trapStatus: 'stable' | 'marginal' | 'none';
  stablePositionM: number | null;
  unstablePositionM: number | null;
  marginalPositionM: number | null;
  /** -dF_net/dz at the stable root. Zero when no strictly stable root exists. */
  restoringStiffnessNPerM: number;
  /** Analytical force-balance threshold, not a recommended pressure. */
  minimumPressurePeakPa: number | null;
}
export interface AcousticRow {
  positionM: number;
  /** Signed spatial coefficient of cos(omega*t). */
  pressureAmplitudePa: number;
  pressureRmsPa: number;
  /** Signed spatial coefficient of sin(omega*t); not simultaneous with pressure peak. */
  velocityAmplitudeMPerS: number;
  acousticForceN: number;
  netForceN: number;
  acousticPotentialJ: number;
  totalPotentialJ: number;
}
export interface DiamagneticInput {
  /** Dimensionless SI volume susceptibility; negative for this model. */
  susceptibility: number;
  densityKgM3: number;
  radiusMm: number;
  /** Signed d(B^2)/dz, with z upward. This is NOT B*dB/dz. */
  fieldSquaredGradientT2PerM: number;
}
export interface DiamagneticSummary {
  volumeM3: number;
  weightN: number;
  magneticForceN: number;
  netForceN: number;
  forceWeightRatio: number;
  requiredGradientT2PerM: number;
  balanceStatus: 'upward-excess' | 'downward-excess' | 'balanced';
}
export interface DiamagneticRow {
  fieldSquaredGradientT2PerM: number;
  magneticForceN: number;
  netForceN: number;
  forceWeightRatio: number;
}
export interface MechanicalInput {
  massGrams: number;
  stiffnessNPerM: number;
  dampingRatio: number;
  forcePeakN: number;
  frequencyHz: number;
}
export interface MechanicalSummary {
  naturalFrequencyHz: number;
  displacementResonanceHz: number | null;
  dampingNSecondsPerM: number;
  displacementPeakM: number;
  velocityPeakMPerS: number;
  /** Displacement relative to driving force: a negative angle denotes lag. */
  phaseDeg: number;
  /** Positive downward static displacement; dynamic displacement is about this equilibrium. */
  staticSagM: number;
  meanInputPowerW: number;
  meanDissipationPowerW: number;
  /** Displacement transfer magnitude normalized by 1/k, defined even at zero drive. */
  magnification: number;
}
export interface MechanicalRow {
  frequencyRatio: number;
  frequencyHz: number;
  displacementPeakM: number;
  phaseDeg: number;
  meanInputPowerW: number;
  meanDissipationPowerW: number;
  magnification: number;
}

export const DEFAULT_ACOUSTIC_INPUT: Readonly<AcousticInput> = Object.freeze({ frequencyHz: 40_000, pressurePeakPa: 700, particleRadiusMm: 0.15, particleDensityKgM3: 50, particleCompressibilityPaInv: 1e-9, phaseDeg: 0 });
export const DEFAULT_DIAMAGNETIC_INPUT: Readonly<DiamagneticInput> = Object.freeze({ susceptibility: -9e-6, densityKgM3: 1000, radiusMm: 1, fieldSquaredGradientT2PerM: -2000 });
export const DEFAULT_MECHANICAL_INPUT: Readonly<MechanicalInput> = Object.freeze({ massGrams: 10, stiffnessNPerM: 10, dampingRatio: 0.1, forcePeakN: 0.01, frequencyHz: 5 });

export const LEVITATION_MODEL_SOURCES = [
  { id: 'settnes-bruus', title: 'Settnes & Bruus: acoustic radiation force (2012)', url: 'https://arxiv.org/pdf/1110.6037', scope: 'Primary derivation: Gor’kov potential and inviscid scattering coefficients; paper also explains viscous corrections absent here. Its liquid examples do not validate this ideal-air model.' },
  { id: 'berry-geim', title: 'Berry & Geim: Of flying frogs and levitrons (1997)', url: 'https://www.physics.umd.edu/grt/taj/411c/FlyingFrogs.pdf', scope: 'Magnetic potential, diamagnetic force balance, and the additional spatial conditions required for stability.' },
  { id: 'openstax-forcing', title: 'OpenStax: Forced Oscillations', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations', scope: 'Externally driven damped harmonic motion and resonance; the displayed steady-state power balance follows from the same equation.' },
] as const;

const TAU = 2 * Math.PI;
const DEG = Math.PI / 180;
const BALANCE_TOLERANCE = 1e-10;

function record(input: unknown, name: string): Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) throw new TypeError(`${name} must be an object.`);
  return input as Record<string, unknown>;
}
function bounded(input: unknown, name: string, min: number, max: number): number {
  if (typeof input !== 'number' || !Number.isFinite(input) || input < min || input > max) throw new RangeError(`${name} must be a finite number between ${min} and ${max}.`);
  return input;
}
function count(input: unknown, minimum = 2): number {
  const value = bounded(input, 'Sample count', minimum, MAX_LEVITATION_SAMPLES);
  if (!Number.isInteger(value)) throw new RangeError('Sample count must be a whole number.');
  return value;
}
function sphereVolume(radiusMm: number): number { return 4 * Math.PI * (radiusMm * 1e-3) ** 3 / 3; }
function modulo(value: number, period: number): number { return ((value % period) + period) % period; }

export function validateAcousticInput(input: unknown): AcousticInput {
  const v = record(input, 'Acoustic input');
  return {
    frequencyHz: bounded(v.frequencyHz, 'Frequency (Hz)', 20_000, 80_000),
    pressurePeakPa: bounded(v.pressurePeakPa, 'Virtual peak pressure (Pa)', 0, 3000),
    particleRadiusMm: bounded(v.particleRadiusMm, 'Sphere radius (mm)', 0.05, 0.2),
    particleDensityKgM3: bounded(v.particleDensityKgM3, 'Particle density (kg/m^3)', 10, 3000),
    particleCompressibilityPaInv: bounded(v.particleCompressibilityPaInv, 'Particle compressibility (Pa^-1)', 0, 2e-5),
    phaseDeg: bounded(v.phaseDeg, 'Spatial phase (degrees)', -180, 180),
  };
}
function acousticParameters(v: AcousticInput) {
  const { densityKgM3: rho, soundSpeedMPerS: c } = IDEAL_AIR;
  const wavelengthM = c / v.frequencyHz;
  const k = TAU / wavelengthM;
  const volumeM3 = sphereVolume(v.particleRadiusMm);
  const f1 = 1 - v.particleCompressibilityPaInv * rho * c * c;
  const f2 = 2 * (v.particleDensityKgM3 - rho) / (2 * v.particleDensityKgM3 + rho);
  const contrastFactor = f1 / 3 + f2 / 2;
  const energyDensityJm3 = v.pressurePeakPa ** 2 / (4 * rho * c * c);
  const weightN = v.particleDensityKgM3 * volumeM3 * GRAVITY_M_PER_S2;
  const buoyancyN = rho * volumeM3 * GRAVITY_M_PER_S2;
  const effectiveWeightN = weightN - buoyancyN;
  const signedForceAmplitudeN = 3 * volumeM3 * k * energyDensityJm3 * contrastFactor;
  return { wavelengthM, k, volumeM3, f1, f2, contrastFactor, energyDensityJm3, weightN, buoyancyN, effectiveWeightN, signedForceAmplitudeN };
}
export function calculateAcousticTrap(input: AcousticInput = DEFAULT_ACOUSTIC_INPUT): AcousticSummary {
  const v = validateAcousticInput(input);
  const p = acousticParameters(v);
  const maxAcousticForceN = Math.abs(p.signedForceAmplitudeN);
  const forceMarginRatio = maxAcousticForceN / p.effectiveWeightN;
  const marginal = Math.abs(forceMarginRatio - 1) <= BALANCE_TOLERANCE;
  const trapStatus = marginal ? 'marginal' : forceMarginRatio > 1 ? 'stable' : 'none';
  let stablePositionM: number | null = null;
  let unstablePositionM: number | null = null;
  let marginalPositionM: number | null = null;
  let restoringStiffnessNPerM = 0;
  if (trapStatus !== 'none') {
    const alpha = Math.asin(Math.max(-1, Math.min(1, p.effectiveWeightN / p.signedForceAmplitudeN)));
    const stableAngle = p.signedForceAmplitudeN > 0 ? (Math.PI - alpha) / 2 : alpha / 2;
    const unstableAngle = p.signedForceAmplitudeN > 0 ? alpha / 2 : (Math.PI - alpha) / 2;
    const position = (angle: number) => modulo(angle - v.phaseDeg * DEG, Math.PI) / p.k;
    if (marginal) marginalPositionM = position(stableAngle);
    else {
      stablePositionM = position(stableAngle);
      unstablePositionM = position(unstableAngle);
      restoringStiffnessNPerM = 2 * p.k * Math.sqrt(Math.max(0, maxAcousticForceN ** 2 - p.effectiveWeightN ** 2));
    }
  }
  const thresholdEnergy = Math.abs(p.contrastFactor) > 1e-14 ? p.effectiveWeightN / (3 * p.volumeM3 * p.k * Math.abs(p.contrastFactor)) : null;
  return {
    wavelengthM: p.wavelengthM, ka: p.k * v.particleRadiusMm * 1e-3, contrastFactor: p.contrastFactor,
    energyDensityJm3: p.energyDensityJm3, volumeM3: p.volumeM3, weightN: p.weightN, buoyancyN: p.buoyancyN, effectiveWeightN: p.effectiveWeightN,
    maxAcousticForceN, forceMarginRatio, phaseTranslationM: -v.phaseDeg * DEG / p.k,
    trapStatus, stablePositionM, unstablePositionM, marginalPositionM, restoringStiffnessNPerM,
    minimumPressurePeakPa: thresholdEnergy === null ? null : Math.sqrt(4 * IDEAL_AIR.densityKgM3 * IDEAL_AIR.soundSpeedMPerS ** 2 * thresholdEnergy),
  };
}
function acousticAtPosition(v: AcousticInput, p: ReturnType<typeof acousticParameters>, positionM: number): AcousticRow {
  const angle = p.k * positionM + v.phaseDeg * DEG;
  const pressureAmplitudePa = v.pressurePeakPa * Math.cos(angle);
  const velocityAmplitudeMPerS = v.pressurePeakPa / (IDEAL_AIR.densityKgM3 * IDEAL_AIR.soundSpeedMPerS) * Math.sin(angle);
  const acousticForceN = p.signedForceAmplitudeN * Math.sin(2 * angle);
  const acousticPotentialJ = p.volumeM3 * p.energyDensityJm3 * (p.f1 * Math.cos(angle) ** 2 - 1.5 * p.f2 * Math.sin(angle) ** 2);
  return { positionM, pressureAmplitudePa, pressureRmsPa: Math.abs(pressureAmplitudePa) / Math.SQRT2, velocityAmplitudeMPerS, acousticForceN, netForceN: acousticForceN - p.effectiveWeightN, acousticPotentialJ, totalPotentialJ: acousticPotentialJ + p.effectiveWeightN * positionM };
}
/** One radiation-force period, 0 <= z <= lambda/2. The full pressure field has period lambda. */
export function buildAcousticRows(input: AcousticInput = DEFAULT_ACOUSTIC_INPUT, sampleCount = 301): AcousticRow[] {
  const v = validateAcousticInput(input);
  const n = count(sampleCount);
  const p = acousticParameters(v);
  return Array.from({ length: n }, (_, i) => acousticAtPosition(v, p, p.wavelengthM / 2 * i / (n - 1)));
}

export function validateDiamagneticInput(input: unknown): DiamagneticInput {
  const v = record(input, 'Diamagnetic input');
  return {
    susceptibility: bounded(v.susceptibility, 'SI volume susceptibility', -5e-4, -1e-7),
    densityKgM3: bounded(v.densityKgM3, 'Density (kg/m^3)', 100, 20_000),
    radiusMm: bounded(v.radiusMm, 'Sphere radius (mm)', 0.1, 10),
    fieldSquaredGradientT2PerM: bounded(v.fieldSquaredGradientT2PerM, 'Signed d(B^2)/dz (T^2/m)', -5000, 5000),
  };
}
export function calculateDiamagneticBalance(input: DiamagneticInput = DEFAULT_DIAMAGNETIC_INPUT): DiamagneticSummary {
  const v = validateDiamagneticInput(input);
  const volumeM3 = sphereVolume(v.radiusMm);
  const weightN = v.densityKgM3 * volumeM3 * GRAVITY_M_PER_S2;
  const magneticForceN = v.susceptibility * volumeM3 * v.fieldSquaredGradientT2PerM / (2 * VACUUM_PERMEABILITY_H_PER_M);
  const netForceN = magneticForceN - weightN;
  const forceWeightRatio = magneticForceN / weightN;
  return { volumeM3, weightN, magneticForceN, netForceN, forceWeightRatio,
    requiredGradientT2PerM: 2 * VACUUM_PERMEABILITY_H_PER_M * v.densityKgM3 * GRAVITY_M_PER_S2 / v.susceptibility,
    balanceStatus: Math.abs(forceWeightRatio - 1) <= BALANCE_TOLERANCE ? 'balanced' : forceWeightRatio > 1 ? 'upward-excess' : 'downward-excess',
  };
}
export function buildDiamagneticRows(input: DiamagneticInput = DEFAULT_DIAMAGNETIC_INPUT, sampleCount = 201): DiamagneticRow[] {
  const v = validateDiamagneticInput(input);
  const n = count(sampleCount);
  return Array.from({ length: n }, (_, i) => {
    const fieldSquaredGradientT2PerM = -5000 + 10_000 * i / (n - 1);
    const result = calculateDiamagneticBalance({ ...v, fieldSquaredGradientT2PerM });
    return { fieldSquaredGradientT2PerM, magneticForceN: result.magneticForceN, netForceN: result.netForceN, forceWeightRatio: result.forceWeightRatio };
  });
}

export function validateMechanicalInput(input: unknown): MechanicalInput {
  const v = record(input, 'Mechanical input');
  return {
    massGrams: bounded(v.massGrams, 'Mass (g)', 1, 100),
    stiffnessNPerM: bounded(v.stiffnessNPerM, 'Spring stiffness (N/m)', 1, 100),
    dampingRatio: bounded(v.dampingRatio, 'Damping ratio', 0.05, 2),
    forcePeakN: bounded(v.forcePeakN, 'Peak driving force (N)', 0, 0.05),
    frequencyHz: bounded(v.frequencyHz, 'Driving frequency (Hz)', 0.2, 100),
  };
}
export function calculateDrivenOscillator(input: MechanicalInput = DEFAULT_MECHANICAL_INPUT): MechanicalSummary {
  const v = validateMechanicalInput(input);
  const massKg = v.massGrams * 1e-3;
  const omega0 = Math.sqrt(v.stiffnessNPerM / massKg);
  const omega = TAU * v.frequencyHz;
  const ratio = omega / omega0;
  const magnification = 1 / Math.hypot(1 - ratio * ratio, 2 * v.dampingRatio * ratio);
  const displacementPeakM = v.forcePeakN / v.stiffnessNPerM * magnification;
  const velocityPeakMPerS = omega * displacementPeakM;
  const dampingNSecondsPerM = 2 * v.dampingRatio * Math.sqrt(v.stiffnessNPerM * massKg);
  const phase = -Math.atan2(2 * v.dampingRatio * ratio, 1 - ratio * ratio);
  const meanDissipationPowerW = dampingNSecondsPerM * velocityPeakMPerS ** 2 / 2;
  // Average F(t)*v(t): displacement phase plus pi/2 is the velocity phase.
  const meanInputPowerW = v.forcePeakN * velocityPeakMPerS * (-Math.sin(phase)) / 2;
  return { naturalFrequencyHz: omega0 / TAU,
    displacementResonanceHz: v.dampingRatio < Math.SQRT1_2 ? omega0 / TAU * Math.sqrt(1 - 2 * v.dampingRatio ** 2) : null,
    dampingNSecondsPerM, displacementPeakM, velocityPeakMPerS, phaseDeg: phase / DEG,
    staticSagM: massKg * GRAVITY_M_PER_S2 / v.stiffnessNPerM,
    meanInputPowerW, meanDissipationPowerW, magnification,
  };
}
export function buildMechanicalRows(input: MechanicalInput = DEFAULT_MECHANICAL_INPUT, sampleCount = 301): MechanicalRow[] {
  const v = validateMechanicalInput(input);
  const n = count(sampleCount, 3);
  const f0 = calculateDrivenOscillator(v).naturalFrequencyHz;
  const low = Math.max(0.2, f0 * 0.1);
  const high = Math.min(100, f0 * 3);
  const below = Math.floor((n - 1) / 2);
  return Array.from({ length: n }, (_, i) => {
    const candidate = i === below ? f0 : i < below ? low * (f0 / low) ** (i / below) : f0 * (high / f0) ** ((i - below) / (n - 1 - below));
    const frequencyHz = Math.min(100, Math.max(0.2, candidate));
    const result = calculateDrivenOscillator({ ...v, frequencyHz });
    return { frequencyRatio: frequencyHz / f0, frequencyHz, displacementPeakM: result.displacementPeakM, phaseDeg: result.phaseDeg, meanInputPowerW: result.meanInputPowerW, meanDissipationPowerW: result.meanDissipationPowerW, magnification: result.magnification };
  });
}

function metadata(name: string, notice: string, settings: Record<string, number>, extra: string[]): string {
  return [`# ${name}`, '# Deterministic virtual teaching model; no measured data.', `# ${notice}`, ...Object.entries(settings).map(([key, value]) => `# ${key}=${value}`), ...extra.map(line => `# ${line}`)].join('\n');
}
export function acousticCsv(input: AcousticInput = DEFAULT_ACOUSTIC_INPUT, sampleCount = 301): string {
  const v = validateAcousticInput(input);
  const rows = buildAcousticRows(v, sampleCount);
  const summary = calculateAcousticTrap(v);
  return `${metadata('Ideal acoustic force and potential', ACOUSTIC_NOTICE, { ...v }, [
    'z upward; force in N; energy in J; spatial phase in cos(kz+phase). Pressure and velocity amplitudes have different temporal phases.',
    `airDensityKgM3=${IDEAL_AIR.densityKgM3}; soundSpeedMPerS=${IDEAL_AIR.soundSpeedMPerS}; gravityMPerS2=${GRAVITY_M_PER_S2}`,
    'U_total=U_acoustic+(rho_particle-rho_air)*V*g*z; potential reference is arbitrary; force/potential period lambda/2 before the gravity tilt.',
    `trapStatus=${summary.trapStatus}; ka=${summary.ka}; contrastFactor=${summary.contrastFactor}`,
    'Stable means local restoring slope in the vertical model only; marginal equality has zero stiffness.',
    LEVITATION_MODEL_SOURCES[0].url,
  ])}\nposition_m,pressure_amplitude_pa,pressure_rms_pa,velocity_amplitude_m_per_s,acoustic_force_n,net_force_n,acoustic_potential_j,total_potential_j\n${rows.map(r => [r.positionM, r.pressureAmplitudePa, r.pressureRmsPa, r.velocityAmplitudeMPerS, r.acousticForceN, r.netForceN, r.acousticPotentialJ, r.totalPotentialJ].join(',')).join('\n')}\n`;
}
export function diamagneticCsv(input: DiamagneticInput = DEFAULT_DIAMAGNETIC_INPUT, sampleCount = 201): string {
  const v = validateDiamagneticInput(input);
  const rows = buildDiamagneticRows(v, sampleCount);
  return `${metadata('Local diamagnetic force budget', DIAMAGNETIC_NOTICE, { ...v }, [
    'z upward; susceptibility is dimensionless SI volume susceptibility; gradient=d(B^2)/dz in T^2/m (twice B*dB/dz).',
    `mu0ApproxHPerM=${VACUUM_PERMEABILITY_H_PER_M}; gravityMPerS2=${GRAVITY_M_PER_S2}`,
    'Each row is an independent hypothetical local gradient; rows do not define a spatial field or a stability calculation.',
    LEVITATION_MODEL_SOURCES[1].url,
  ])}\ngradient_b_squared_t2_per_m,magnetic_force_n,net_force_n,magnetic_force_over_weight\n${rows.map(r => [r.fieldSquaredGradientT2PerM, r.magneticForceN, r.netForceN, r.forceWeightRatio].join(',')).join('\n')}\n`;
}
export function mechanicalCsv(input: MechanicalInput = DEFAULT_MECHANICAL_INPUT, sampleCount = 301): string {
  const v = validateMechanicalInput(input);
  const rows = buildMechanicalRows(v, sampleCount);
  return `${metadata('Driven mechanical oscillator', MECHANICAL_NOTICE, { ...v }, [
    'm*x_ddot+b*x_dot+k*x=F_peak*cos(omega*t); x is about the gravitational equilibrium; displacement and driving force are peak amplitudes.',
    'Phase is displacement relative to force; power is a cycle mean; static downward sag=m*g/k.',
    `gravityMPerS2=${GRAVITY_M_PER_S2}; maximumRows=${MAX_LEVITATION_SAMPLES}; logarithmic sweep includes the natural frequency.`,
    LEVITATION_MODEL_SOURCES[2].url,
  ])}\nfrequency_hz,frequency_over_natural,displacement_peak_m,displacement_phase_deg,input_mean_power_w,dissipation_mean_power_w,magnification\n${rows.map(r => [r.frequencyHz, r.frequencyRatio, r.displacementPeakM, r.phaseDeg, r.meanInputPowerW, r.meanDissipationPowerW, r.magnification].join(',')).join('\n')}\n`;
}

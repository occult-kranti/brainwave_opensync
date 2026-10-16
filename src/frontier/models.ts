/** Original bounded comparisons; no audio, apparatus control or outcome predictions. */
export const MAX_FRONTIER_SAMPLES = 600;
export const SOUND_SPEED_M_PER_S = 343;
export const LIGHT_SPEED_M_PER_S = 299_792_458;
export const H_PLANCK_J_S = 6.62607015e-34;
export const K_BOLTZMANN_J_PER_K = 1.380649e-23;

export const CHANNEL_NOTICE = 'The same frequency number does not identify a physical channel. Sound wavelength uses ideal air at 343 m/s; electromagnetic wavelength uses vacuum light speed. The photon energy belongs to the electromagnetic comparison, not to a sound dose. Amplitude, coupling, dispersion and attenuation are absent.';
export const THERMAL_NOTICE = 'Classical equilibrium in one dimension with prescribed positive harmonic stiffness; this does not establish an achievable trap. Stokes drag assumes a spherical particle in a continuum Newtonian liquid, far from walls. Corner frequency assumes overdamped motion. Free diffusion and stationary trapped spread are different quantities. No quantum state, gravitational cancellation, capture probability or biological response is modeled.';
export const COHERENCE_NOTICE = 'Two equal-amplitude, monochromatic waves with fixed relative phase. The reported normalized intensity is local mean-square amplitude divided by the fixed constructive maximum, not net standing-wave energy flux. Node spacing lambda/2 applies only to counterpropagating planar waves. Boundaries, incoherence, attenuation and unequal sources are omitted.';

export interface ChannelComparison {
  frequencyHz: number;
  periodS: number;
  acousticWavelengthM: number;
  emVacuumWavelengthM: number;
  photonEnergyJ: number;
}
export interface ThermalTrapInput {
  stiffnessNpm: number;
  temperatureK: number;
  radiusM: number;
  viscosityPas: number;
}
export interface ThermalTrapResult {
  /** One Cartesian coordinate, not a three-dimensional radial distance. */
  rmsDisplacementM: number;
  /** Free Stokes–Einstein diffusion coefficient; not trapped variance. */
  diffusionM2PerS: number;
  dragNsPerM: number;
  cornerHz: number;
  relaxationTimeS: number;
  thermalEnergyJ: number;
}
export interface ThermalTrapRow {
  displacementM: number;
  probabilityDensityPerM: number;
  relativeDensity: number;
  relativePotentialKT: number;
}
export interface CoherenceInput {
  frequencyHz: number;
  /** Signed path difference between the two waves, not an observation coordinate. */
  pathDifferenceM: number;
  /** Relative phase between the waves, not the spatial phase of cos(kz+phi). */
  phaseDeg: number;
}
export interface CoherenceResult {
  wavelengthM: number;
  /** Only for an ideal counterpropagating standing-wave geometry. */
  nodeSpacingM: number;
  phaseDifferenceRad: number;
  /** |1+exp(i*delta)|^2/4; a local squared-amplitude ratio, not net energy flux. */
  normalizedIntensity: number;
}
export interface CoherenceRow {
  pathDifferenceM: number;
  normalizedIntensity: number;
  phaseDifferenceRad: number;
}

export const DEFAULT_THERMAL_TRAP: Readonly<ThermalTrapInput> = Object.freeze({ stiffnessNpm: 1e-6, temperatureK: 300, radiusM: 1e-7, viscosityPas: 0.001 });
export const DEFAULT_COHERENCE: Readonly<CoherenceInput> = Object.freeze({ frequencyHz: 440, pathDifferenceM: 0, phaseDeg: 0 });

function bounded(value: unknown, name: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new RangeError(`${name} must be a finite number between ${min} and ${max}.`);
  return value;
}
function record(input: unknown, name: string): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError(`${name} must be an object.`);
  return input as Record<string, unknown>;
}
function samples(value: unknown, minimum: number): number {
  const result = bounded(value, 'Plot sample count', minimum, MAX_FRONTIER_SAMPLES);
  if (!Number.isInteger(result)) throw new RangeError('Plot sample count must be a whole number.');
  return result;
}

export function channelComparison(frequencyHz = 440): ChannelComparison {
  const f = bounded(frequencyHz, 'Frequency (Hz)', 1, 100_000);
  return { frequencyHz: f, periodS: 1 / f, acousticWavelengthM: SOUND_SPEED_M_PER_S / f, emVacuumWavelengthM: LIGHT_SPEED_M_PER_S / f, photonEnergyJ: H_PLANCK_J_S * f };
}
export function validateThermalTrapInput(input: unknown): ThermalTrapInput {
  const v = record(input, 'Thermal trap input');
  return {
    stiffnessNpm: bounded(v.stiffnessNpm, 'Prescribed stiffness (N/m)', 1e-9, 1e-3),
    temperatureK: bounded(v.temperatureK, 'Temperature (K)', 250, 350),
    radiusM: bounded(v.radiusM, 'Particle radius (m)', 25e-9, 5e-6),
    viscosityPas: bounded(v.viscosityPas, 'Dynamic viscosity (Pa s)', 1e-4, 0.1),
  };
}
export function thermalTrap(input: ThermalTrapInput = DEFAULT_THERMAL_TRAP): ThermalTrapResult {
  const v = validateThermalTrapInput(input);
  const thermalEnergyJ = K_BOLTZMANN_J_PER_K * v.temperatureK;
  const dragNsPerM = 6 * Math.PI * v.viscosityPas * v.radiusM;
  const relaxationTimeS = dragNsPerM / v.stiffnessNpm;
  return { thermalEnergyJ, dragNsPerM,
    rmsDisplacementM: Math.sqrt(thermalEnergyJ / v.stiffnessNpm),
    diffusionM2PerS: thermalEnergyJ / dragNsPerM,
    cornerHz: 1 / (2 * Math.PI * relaxationTimeS), relaxationTimeS,
  };
}
/** The Gaussian is not renormalized to the finite plotting window. */
export function buildThermalTrapRows(input: ThermalTrapInput = DEFAULT_THERMAL_TRAP, sampleCount = 201): ThermalTrapRow[] {
  const result = thermalTrap(input);
  const n = samples(sampleCount, 3);
  const sigma = result.rmsDisplacementM;
  return Array.from({ length: n }, (_, i) => {
    const scaled = -4 + 8 * i / (n - 1);
    const relativePotentialKT = scaled * scaled / 2;
    const relativeDensity = Math.exp(-relativePotentialKT);
    return { displacementM: scaled * sigma, probabilityDensityPerM: relativeDensity / (Math.sqrt(2 * Math.PI) * sigma), relativeDensity, relativePotentialKT };
  });
}
export function validateCoherenceInput(input: unknown): CoherenceInput {
  const v = record(input, 'Coherence input');
  return {
    frequencyHz: bounded(v.frequencyHz, 'Frequency (Hz)', 1, 100_000),
    pathDifferenceM: bounded(v.pathDifferenceM, 'Signed path difference (m)', -1, 1),
    phaseDeg: bounded(v.phaseDeg, 'Relative source phase (degrees)', -180, 180),
  };
}
export function coherence(input: CoherenceInput = DEFAULT_COHERENCE): CoherenceResult {
  const v = validateCoherenceInput(input);
  const wavelengthM = SOUND_SPEED_M_PER_S / v.frequencyHz;
  const phaseDifferenceRad = 2 * Math.PI * v.pathDifferenceM / wavelengthM + v.phaseDeg * Math.PI / 180;
  return { wavelengthM, nodeSpacingM: wavelengthM / 2, phaseDifferenceRad, normalizedIntensity: Math.max(0, Math.min(1, (1 + Math.cos(phaseDifferenceRad)) / 2)) };
}
/** At most two interference cycles; at least eight intervals per cycle. */
export function buildCoherenceRows(input: CoherenceInput = DEFAULT_COHERENCE, sampleCount = 201): CoherenceRow[] {
  const v = validateCoherenceInput(input);
  const n = samples(sampleCount, 17);
  const wavelengthM = coherence(v).wavelengthM;
  const min = Math.max(-1, v.pathDifferenceM - wavelengthM);
  const max = Math.min(1, v.pathDifferenceM + wavelengthM);
  return Array.from({ length: n }, (_, i) => {
    const pathDifferenceM = Math.min(1, Math.max(-1, min + (max - min) * i / (n - 1)));
    const result = coherence({ ...v, pathDifferenceM });
    return { pathDifferenceM, normalizedIntensity: result.normalizedIntensity, phaseDifferenceRad: result.phaseDifferenceRad };
  });
}

function metadata(title: string, notice: string, settings: Record<string, number>, assumptions: string[]): string {
  return [`# ${title}`, '# Deterministic model output, not measured data.', `# ${notice}`, ...Object.entries(settings).map(([key, value]) => `# ${key}=${value}`), ...assumptions.map(value => `# ${value}`)].join('\n');
}
export function channelComparisonCsv(frequencyHz = 440): string {
  const r = channelComparison(frequencyHz);
  return `${metadata('Channel scale comparison', CHANNEL_NOTICE, { frequencyHz: r.frequencyHz }, [
    `soundSpeedMPerS=${SOUND_SPEED_M_PER_S}; vacuumLightSpeedMPerS=${LIGHT_SPEED_M_PER_S}; PlanckJs=${H_PLANCK_J_S}`,
    'https://www.nist.gov/si-redefinition/meet-constants',
  ])}\nfrequency_hz,period_s,acoustic_wavelength_m,vacuum_em_wavelength_m,photon_energy_j\n${[r.frequencyHz, r.periodS, r.acousticWavelengthM, r.emVacuumWavelengthM, r.photonEnergyJ].join(',')}\n`;
}
export function thermalTrapCsv(input: ThermalTrapInput = DEFAULT_THERMAL_TRAP, sampleCount = 201): string {
  const v = validateThermalTrapInput(input);
  const result = thermalTrap(v);
  const rows = buildThermalTrapRows(v, sampleCount);
  return `${metadata('Classical harmonic distribution', THERMAL_NOTICE, { ...v, ...result }, [
    `BoltzmannJPerK=${K_BOLTZMANN_J_PER_K}; window=-4*sigma to +4*sigma; full Gaussian density is not renormalized to this window.`,
    'U/(kBT)=x^2/(2*sigma^2); sigma^2=kBT/stiffness; probability density has units m^-1.',
    'Free diffusion D=kBT/drag; trapped stationary variance=D*relaxationTime; cornerHz=1/(2*pi*relaxationTime).',
    'No particle mass is supplied; the overdamped/inertial crossover is not verified.',
    'https://www.feynmanlectures.caltech.edu/I_40.html',
  ])}\ndisplacement_m,probability_density_per_m,relative_density,relative_potential_kBT\n${rows.map(r => [r.displacementM, r.probabilityDensityPerM, r.relativeDensity, r.relativePotentialKT].join(',')).join('\n')}\n`;
}
export function coherenceCsv(input: CoherenceInput = DEFAULT_COHERENCE, sampleCount = 201): string {
  const v = validateCoherenceInput(input);
  const rows = buildCoherenceRows(v, sampleCount);
  return `${metadata('Equal-wave relative phase comparison', COHERENCE_NOTICE, { ...v }, [
    'delta=2*pi*frequency*pathDifference/343+relativePhase; normalizedIntensity=(1+cos(delta))/2; normalization is fixed across all phases.',
    `plotPathMinM=${rows[0].pathDifferenceM}; plotPathMaxM=${rows[rows.length - 1].pathDifferenceM}; bounded local window avoids plotting unresolved high-frequency fringes.`,
    'Path difference repeats after lambda. Only for counterpropagating waves is pathDifference=2*z+constant, giving node spacing lambda/2.',
  ])}\npath_difference_m,relative_phase_rad,normalized_mean_square_amplitude\n${rows.map(r => [r.pathDifferenceM, r.phaseDifferenceRad, r.normalizedIntensity].join(',')).join('\n')}\n`;
}

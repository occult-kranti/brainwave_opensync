import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ACOUSTIC_INPUT as acoustic, DEFAULT_DIAMAGNETIC_INPUT as magnetic, DEFAULT_MECHANICAL_INPUT as mechanical,
  GRAVITY_M_PER_S2 as g, VACUUM_PERMEABILITY_H_PER_M as mu0, IDEAL_AIR,
  calculateAcousticTrap, buildAcousticRows, validateAcousticInput, acousticCsv,
  calculateDiamagneticBalance, buildDiamagneticRows, validateDiamagneticInput, diamagneticCsv,
  calculateDrivenOscillator, buildMechanicalRows, validateMechanicalInput, mechanicalCsv,
} from './models';

function relative(actual: number, expected: number, tolerance = 1e-10) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance * Math.max(Math.abs(expected), 1e-25));
}

describe('ideal acoustic force and gravity tilt', () => {
  it('uses metres, peak pressure, time-averaged energy and buoyancy consistently', () => {
    const result = calculateAcousticTrap();
    relative(result.wavelengthM, 343 / 40_000);
    relative(result.volumeM3, 4 / 3 * Math.PI * (0.15e-3) ** 3);
    relative(result.energyDensityJm3, 700 ** 2 / (4 * 1.2 * 343 ** 2));
    relative(result.weightN, 50 * result.volumeM3 * g);
    relative(result.buoyancyN, 1.2 * result.volumeM3 * g);
    relative(result.effectiveWeightN, 48.8 * result.volumeM3 * g);
    const row = buildAcousticRows()[0];
    expect(row.pressureAmplitudePa).toBe(700);
    relative(row.pressureRmsPa, 700 / Math.SQRT2);
    expect(row.velocityAmplitudeMPerS).toBe(0);
  });
  it('doubles pressure into four times the force and potential', () => {
    const base = buildAcousticRows(acoustic, 9);
    const doubled = buildAcousticRows({ ...acoustic, pressurePeakPa: 1400 }, 9);
    relative(doubled[1].acousticForceN, 4 * base[1].acousticForceN);
    relative(doubled[1].acousticPotentialJ, 4 * base[1].acousticPotentialJ);
  });
  it('cancels particle volume from force margin and threshold, but not force magnitude', () => {
    const small = calculateAcousticTrap({ ...acoustic, particleRadiusMm: 0.1 });
    const large = calculateAcousticTrap({ ...acoustic, particleRadiusMm: 0.2 });
    relative(large.maxAcousticForceN, 8 * small.maxAcousticForceN);
    relative(large.effectiveWeightN, 8 * small.effectiveWeightN);
    relative(large.forceMarginRatio, small.forceMarginRatio);
    relative(large.minimumPressurePeakPa!, small.minimumPressurePeakPa!);
    relative(large.stablePositionM!, small.stablePositionM!);
  });
  it('matches minus the spatial derivative of the total potential', () => {
    const rows = buildAcousticRows(acoustic, 599);
    for (const i of [70, 210, 420, 530]) {
      const forceFromPotential = -(rows[i + 1].totalPotentialJ - rows[i - 1].totalPotentialJ) / (rows[i + 1].positionM - rows[i - 1].positionM);
      expect(Math.abs(forceFromPotential - rows[i].netForceN)).toBeLessThan(calculateAcousticTrap().maxAcousticForceN * 2e-5);
    }
  });
  it.each([1e-9, 2e-5])('finds a restoring root for either contrast sign (compressibility %s)', particleCompressibilityPaInv => {
    const input = { ...acoustic, pressurePeakPa: 1500, particleCompressibilityPaInv };
    const result = calculateAcousticTrap(input);
    expect(result.trapStatus).toBe('stable');
    expect(result.stablePositionM).not.toBeNull();
    expect(result.unstablePositionM).not.toBeNull();
    const k = 2 * Math.PI / result.wavelengthM;
    const amplitude = Math.sign(result.contrastFactor) * result.maxAcousticForceN;
    const angle = k * result.stablePositionM!;
    relative(amplitude * Math.sin(2 * angle), result.effectiveWeightN);
    const derivative = 2 * k * amplitude * Math.cos(2 * angle);
    expect(derivative).toBeLessThan(0);
    relative(-derivative, result.restoringStiffnessNPerM);
    expect(2 * k * amplitude * Math.cos(2 * k * result.unstablePositionM!)).toBeGreaterThan(0);
  });
  it('has only downward net force and no equilibrium below the force ceiling', () => {
    const input = { ...acoustic, pressurePeakPa: 50 };
    expect(buildAcousticRows(input).every(row => row.netForceN < 0)).toBe(true);
    const result = calculateAcousticTrap(input);
    expect(result.trapStatus).toBe('none');
    expect(result.stablePositionM).toBeNull();
    expect(result.unstablePositionM).toBeNull();
    expect(result.marginalPositionM).toBeNull();
    expect(result.restoringStiffnessNPerM).toBe(0);
  });
  it('classifies equality as marginal with zero stiffness', () => {
    const threshold = calculateAcousticTrap().minimumPressurePeakPa!;
    const result = calculateAcousticTrap({ ...acoustic, pressurePeakPa: threshold });
    expect(result.trapStatus).toBe('marginal');
    expect(result.stablePositionM).toBeNull();
    expect(result.marginalPositionM).not.toBeNull();
    expect(result.restoringStiffnessNPerM).toBe(0);
    expect(calculateAcousticTrap({ ...acoustic, pressurePeakPa: threshold * 1.001 }).trapStatus).toBe('stable');
    expect(calculateAcousticTrap({ ...acoustic, pressurePeakPa: threshold * 0.999 }).trapStatus).toBe('none');
  });
  it('zero drive leaves gravity and a linear potential tilt', () => {
    const input = { ...acoustic, pressurePeakPa: 0 };
    const result = calculateAcousticTrap(input);
    expect(result.trapStatus).toBe('none');
    expect(result.forceMarginRatio).toBe(0);
    for (const row of buildAcousticRows(input)) {
      expect(Math.abs(row.acousticForceN)).toBe(0);
      relative(row.netForceN, -result.effectiveWeightN);
      relative(row.totalPotentialJ, result.effectiveWeightN * row.positionM);
    }
  });
  it('has no radiation trap when compressibility and density contributions cancel', () => {
    const f2 = 2 * (acoustic.particleDensityKgM3 - 1.2) / (2 * acoustic.particleDensityKgM3 + 1.2);
    const particleCompressibilityPaInv = (1 + 1.5 * f2) / (1.2 * 343 ** 2);
    const result = calculateAcousticTrap({ ...acoustic, particleCompressibilityPaInv });
    expect(Math.abs(result.contrastFactor)).toBeLessThan(1e-14);
    expect(result.trapStatus).toBe('none');
    expect(result.minimumPressurePeakPa).toBeNull();
  });
  it('translates equilibrium by minus phase/k modulo lambda/2', () => {
    const initial = calculateAcousticTrap();
    const moved = calculateAcousticTrap({ ...acoustic, phaseDeg: 30 });
    relative(initial.stablePositionM! - moved.stablePositionM!, initial.wavelengthM / 12);
    relative(moved.phaseTranslationM, -initial.wavelengthM / 12);
    relative(calculateAcousticTrap({ ...acoustic, phaseDeg: 180 }).stablePositionM!, initial.stablePositionM!);
  });
  it('force is lambda/2-periodic while gravity changes total potential across a cell', () => {
    const input = { ...acoustic, phaseDeg: 25 };
    const rows = buildAcousticRows(input);
    const first = rows[0], last = rows.at(-1)!;
    relative(last.acousticForceN, first.acousticForceN);
    relative(last.acousticPotentialJ, first.acousticPotentialJ);
    relative(last.pressureAmplitudePa, -first.pressureAmplitudePa);
    relative(last.totalPotentialJ - first.totalPotentialJ, calculateAcousticTrap(input).effectiveWeightN * last.positionM);
  });
  it('all allowed size and frequency extremes meet the declared numerical ka bound', () => {
    const result = calculateAcousticTrap({ ...acoustic, frequencyHz: 80_000, particleRadiusMm: 0.2 });
    expect(result.ka).toBeLessThan(0.3);
    expect(result.ka).toBeGreaterThan(0.29);
    expect(IDEAL_AIR.densityKgM3).toBe(1.2);
  });
});

describe('signed local diamagnetic budget', () => {
  it('repels a diamagnet toward smaller B squared and retains the factor of two', () => {
    const result = calculateDiamagneticBalance();
    relative(result.magneticForceN, magnetic.susceptibility * result.volumeM3 * -2000 / (2 * mu0));
    expect(result.magneticForceN).toBeGreaterThan(0);
    const reversed = calculateDiamagneticBalance({ ...magnetic, fieldSquaredGradientT2PerM: 2000 });
    relative(reversed.magneticForceN, -result.magneticForceN);
    expect(reversed.netForceN).toBeLessThan(-reversed.weightN);
  });
  it('a uniform field supplies no force in this approximation', () => {
    const result = calculateDiamagneticBalance({ ...magnetic, fieldSquaredGradientT2PerM: 0 });
    expect(result.magneticForceN).toBeCloseTo(0);
    relative(result.netForceN, -result.weightN);
    expect(result.balanceStatus).toBe('downward-excess');
  });
  it('reports local balance without a stability property', () => {
    const threshold = calculateDiamagneticBalance().requiredGradientT2PerM;
    expect(threshold).toBeLessThan(0);
    const result = calculateDiamagneticBalance({ ...magnetic, fieldSquaredGradientT2PerM: threshold });
    relative(result.forceWeightRatio, 1);
    expect(Math.abs(result.netForceN)).toBeLessThan(result.weightN * 1e-12);
    expect(result.balanceStatus).toBe('balanced');
    expect(result).not.toHaveProperty('stable');
  });
  it('has volume-independent balance but cubic force scaling', () => {
    const first = calculateDiamagneticBalance({ ...magnetic, radiusMm: 1 });
    const second = calculateDiamagneticBalance({ ...magnetic, radiusMm: 2 });
    relative(second.weightN, 8 * first.weightN);
    relative(second.magneticForceN, 8 * first.magneticForceN);
    relative(second.forceWeightRatio, first.forceWeightRatio);
    relative(second.requiredGradientT2PerM, first.requiredGradientT2PerM);
  });
  it('doubled density doubles the required gradient magnitude', () => {
    relative(calculateDiamagneticBalance({ ...magnetic, densityKgM3: 2000 }).requiredGradientT2PerM, 2 * calculateDiamagneticBalance().requiredGradientT2PerM);
  });
  it('sweeps signed hypothetical gradients without a spatial-stability claim', () => {
    const rows = buildDiamagneticRows(magnetic, 101);
    expect(rows[0].fieldSquaredGradientT2PerM).toBe(-5000);
    expect(rows.at(-1)!.fieldSquaredGradientT2PerM).toBe(5000);
    expect(rows.every((r, i) => i === 0 || r.magneticForceN < rows[i - 1].magneticForceN)).toBe(true);
  });
});

describe('ordinary driven vibration', () => {
  it('uses SI mass, Hooke static sag and the natural frequency', () => {
    const result = calculateDrivenOscillator();
    relative(result.naturalFrequencyHz, Math.sqrt(10 / 0.01) / (2 * Math.PI));
    relative(result.staticSagM, 0.01 * g / 10);
    relative(result.dampingNSecondsPerM, 2 * 0.1 * Math.sqrt(10 * 0.01));
  });
  it('at the natural frequency displacement lags by 90 degrees and magnification is 1/(2 zeta)', () => {
    const f0 = calculateDrivenOscillator().naturalFrequencyHz;
    const result = calculateDrivenOscillator({ ...mechanical, frequencyHz: f0 });
    relative(result.phaseDeg, -90);
    relative(result.magnification, 1 / (2 * mechanical.dampingRatio));
    relative(result.displacementPeakM, mechanical.forcePeakN / mechanical.stiffnessNPerM / (2 * mechanical.dampingRatio));
  });
  it('mean driving work equals viscous dissipation across frequencies', () => {
    for (const frequencyHz of [0.2, 1, 5, 50, 100]) {
      const result = calculateDrivenOscillator({ ...mechanical, frequencyHz });
      relative(result.meanInputPowerW, result.meanDissipationPowerW);
      relative(result.meanDissipationPowerW, result.dampingNSecondsPerM * result.velocityPeakMPerS ** 2 / 2);
      expect(result.meanInputPowerW).toBeGreaterThan(0);
    }
  });
  it('double drive gives double motion and fourfold dissipated power', () => {
    const first = calculateDrivenOscillator();
    const second = calculateDrivenOscillator({ ...mechanical, forcePeakN: 0.02 });
    relative(second.displacementPeakM, 2 * first.displacementPeakM);
    relative(second.meanInputPowerW, 4 * first.meanInputPowerW);
    relative(second.staticSagM, first.staticSagM);
  });
  it('zero drive yields no dynamic motion or power while static sag remains', () => {
    const result = calculateDrivenOscillator({ ...mechanical, forcePeakN: 0 });
    expect(result.displacementPeakM).toBe(0);
    expect(result.velocityPeakMPerS).toBe(0);
    expect(result.meanInputPowerW).toBe(0);
    expect(result.meanDissipationPowerW).toBe(0);
    expect(result.staticSagM).toBeGreaterThan(0);
    expect(Number.isFinite(result.magnification)).toBe(true);
  });
  it('distinguishes displacement resonance from natural frequency and overdamped response', () => {
    const result = calculateDrivenOscillator();
    expect(result.displacementResonanceHz).toBeLessThan(result.naturalFrequencyHz);
    relative(result.displacementResonanceHz!, result.naturalFrequencyHz * Math.sqrt(1 - 2 * mechanical.dampingRatio ** 2));
    expect(calculateDrivenOscillator({ ...mechanical, dampingRatio: Math.SQRT1_2 }).displacementResonanceHz).toBeNull();
    expect(calculateDrivenOscillator({ ...mechanical, dampingRatio: 2 }).displacementResonanceHz).toBeNull();
  });
  it('approaches the static compliance at low frequency and inertial response at high frequency', () => {
    const low = calculateDrivenOscillator({ ...mechanical, massGrams: 1, stiffnessNPerM: 100, frequencyHz: 0.2 });
    expect(Math.abs(low.magnification - 1)).toBeLessThan(2e-5);
    const high = calculateDrivenOscillator({ ...mechanical, massGrams: 100, stiffnessNPerM: 1, frequencyHz: 100 });
    relative(high.displacementPeakM, mechanical.forcePeakN / (0.1 * (2 * Math.PI * 100) ** 2), 3e-5);
  });
  it('bounds the sweep and includes natural frequency at every allowed mass/stiffness extreme', () => {
    for (const massGrams of [1, 100]) for (const stiffnessNPerM of [1, 100]) {
      const input = { ...mechanical, massGrams, stiffnessNPerM };
      const rows = buildMechanicalRows(input, 600);
      expect(rows).toHaveLength(600);
      expect(rows.every(row => row.frequencyHz >= 0.2 && row.frequencyHz <= 100)).toBe(true);
      expect(rows.some(row => row.frequencyRatio === 1)).toBe(true);
      expect(rows.every((row, i) => i === 0 || row.frequencyHz > rows[i - 1].frequencyHz)).toBe(true);
    }
  });
});

describe('bounded input and reproducible export contracts', () => {
  it('rejects malformed records and nonfinite scalar fields', () => {
    for (const [defaults, validate] of [[acoustic, validateAcousticInput], [magnetic, validateDiamagneticInput], [mechanical, validateMechanicalInput]] as const) {
      for (const invalid of [null, undefined, [], 'input']) expect(() => validate(invalid)).toThrow();
      for (const key of Object.keys(defaults)) for (const invalid of [NaN, Infinity, -Infinity, '1', undefined]) expect(() => validate({ ...defaults, [key]: invalid })).toThrow();
    }
  });
  it('rejects values outside each model domain', () => {
    expect(() => validateAcousticInput({ ...acoustic, frequencyHz: 19_999 })).toThrow();
    expect(() => validateAcousticInput({ ...acoustic, particleRadiusMm: 0.201 })).toThrow();
    expect(() => validateAcousticInput({ ...acoustic, pressurePeakPa: -1 })).toThrow();
    expect(() => validateAcousticInput({ ...acoustic, phaseDeg: 181 })).toThrow();
    expect(() => validateDiamagneticInput({ ...magnetic, susceptibility: 0 })).toThrow();
    expect(() => validateDiamagneticInput({ ...magnetic, fieldSquaredGradientT2PerM: 5001 })).toThrow();
    expect(() => validateMechanicalInput({ ...mechanical, dampingRatio: 0 })).toThrow();
    expect(() => validateMechanicalInput({ ...mechanical, massGrams: 0 })).toThrow();
    expect(() => validateMechanicalInput({ ...mechanical, frequencyHz: 101 })).toThrow();
  });
  it.each([NaN, Infinity, -Infinity, 0, 1, 3.5, 601, 1e9])('rejects invalid row allocation %s', sampleCount => {
    expect(() => buildAcousticRows(acoustic, sampleCount)).toThrow();
    expect(() => buildDiamagneticRows(magnetic, sampleCount)).toThrow();
    expect(() => buildMechanicalRows(mechanical, sampleCount)).toThrow();
  });
  it('allows small bounded plots without mutating input', () => {
    expect(buildAcousticRows(Object.freeze({ ...acoustic }), 2)).toHaveLength(2);
    expect(buildDiamagneticRows(Object.freeze({ ...magnetic }), 2)).toHaveLength(2);
    expect(buildMechanicalRows(Object.freeze({ ...mechanical }), 3)).toHaveLength(3);
    expect(() => buildMechanicalRows(mechanical, 2)).toThrow();
    expect(buildAcousticRows(acoustic, 600)).toHaveLength(600);
  });
  it('CSV exports are deterministic with numerical units, assumptions and row counts', () => {
    const exports = [acousticCsv(acoustic, 9), diamagneticCsv(magnetic, 9), mechanicalCsv(mechanical, 9)];
    expect(acousticCsv(acoustic, 9)).toBe(exports[0]);
    expect(diamagneticCsv(magnetic, 9)).toBe(exports[1]);
    expect(mechanicalCsv(mechanical, 9)).toBe(exports[2]);
    for (const csv of exports) {
      expect(csv).toContain('no measured data');
      const lines = csv.trim().split('\n').filter(line => !line.startsWith('#'));
      expect(lines).toHaveLength(10);
      expect(lines.slice(1).every(line => line.split(',').every(value => Number.isFinite(Number(value))))).toBe(true);
    }
    expect(exports[0]).toContain('pressure_amplitude_pa');
    expect(exports[0]).toContain('local restoring slope');
    expect(exports[1]).toContain('twice B*dB/dz');
    expect(exports[2]).toContain('input_mean_power_w');
    expect(exports[2]).toContain('not a levitation');
  });
});

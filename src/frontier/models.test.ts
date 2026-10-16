import { describe, expect, it } from 'vitest';
import {
  channelComparison, channelComparisonCsv, thermalTrap, buildThermalTrapRows, thermalTrapCsv,
  coherence, buildCoherenceRows, coherenceCsv, DEFAULT_THERMAL_TRAP as thermal, DEFAULT_COHERENCE as wave,
  LIGHT_SPEED_M_PER_S as c, SOUND_SPEED_M_PER_S as cs, H_PLANCK_J_S as h, K_BOLTZMANN_J_PER_K as kB,
} from './models';

function relative(actual: number, expected: number, tolerance = 1e-12) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance * Math.max(Math.abs(expected), 1e-40));
}

describe('physical channel scale comparison', () => {
  it('returns distinct wavelengths and a shared period in SI units', () => {
    const row = channelComparison(440);
    relative(row.acousticWavelengthM, 0.7795454545454545);
    relative(row.emVacuumWavelengthM, 681346.4954545455);
    relative(row.periodS * row.frequencyHz, 1);
    relative(row.photonEnergyJ / row.frequencyHz, h);
  });
  it('doubling frequency halves wavelength and period while doubling photon energy', () => {
    const a = channelComparison(500), b = channelComparison(1000);
    relative(b.acousticWavelengthM, a.acousticWavelengthM / 2);
    relative(b.emVacuumWavelengthM, a.emVacuumWavelengthM / 2);
    relative(b.periodS, a.periodS / 2);
    relative(b.photonEnergyJ, 2 * a.photonEnergyJ);
    relative(a.emVacuumWavelengthM / a.acousticWavelengthM, c / cs);
    relative(b.emVacuumWavelengthM / b.acousticWavelengthM, c / cs);
  });
  it.each([0, -1, 100001, Infinity, -Infinity, NaN])('rejects invalid frequency %s', value => {
    expect(() => channelComparison(value)).toThrow();
    expect(() => channelComparisonCsv(value)).toThrow();
  });
});

describe('classical prescribed harmonic trap', () => {
  it('links equipartition, free diffusion and relaxation with consistent units', () => {
    const r = thermalTrap();
    relative(r.rmsDisplacementM ** 2 * thermal.stiffnessNpm, kB * thermal.temperatureK);
    relative(r.diffusionM2PerS * r.dragNsPerM, r.thermalEnergyJ);
    relative(r.rmsDisplacementM ** 2, r.diffusionM2PerS * r.relaxationTimeS);
    relative(2 * Math.PI * r.cornerHz * r.relaxationTimeS, 1);
    relative(r.dragNsPerM, 1.884955592153876e-9);
    expect(r.rmsDisplacementM).toBeGreaterThan(64e-9);
    expect(r.rmsDisplacementM).toBeLessThan(65e-9);
  });
  it('doubling stiffness halves variance and relaxation time, but leaves free diffusion unchanged', () => {
    const first = thermalTrap();
    const second = thermalTrap({ ...thermal, stiffnessNpm: 2 * thermal.stiffnessNpm });
    relative(second.rmsDisplacementM ** 2, first.rmsDisplacementM ** 2 / 2);
    relative(second.relaxationTimeS, first.relaxationTimeS / 2);
    relative(second.cornerHz, 2 * first.cornerHz);
    relative(second.diffusionM2PerS, first.diffusionM2PerS);
  });
  it.each(['radiusM', 'viscosityPas'] as const)('doubling %s changes dynamics but not equilibrium variance', key => {
    const first = thermalTrap();
    const second = thermalTrap({ ...thermal, [key]: 2 * thermal[key] });
    relative(second.rmsDisplacementM, first.rmsDisplacementM);
    relative(second.dragNsPerM, 2 * first.dragNsPerM);
    relative(second.diffusionM2PerS, first.diffusionM2PerS / 2);
    relative(second.cornerHz, first.cornerHz / 2);
    relative(second.relaxationTimeS, 2 * first.relaxationTimeS);
  });
  it('temperature changes variance and diffusion linearly at fixed supplied liquid properties', () => {
    const cold = thermalTrap({ ...thermal, temperatureK: 250 });
    const warm = thermalTrap({ ...thermal, temperatureK: 350 });
    relative(warm.rmsDisplacementM ** 2 / cold.rmsDisplacementM ** 2, 350 / 250);
    relative(warm.diffusionM2PerS / cold.diffusionM2PerS, 350 / 250);
    relative(warm.cornerHz, cold.cornerHz);
  });
  it('plots a symmetric Gaussian with an absolute density and no window renormalization', () => {
    const rows = buildThermalTrapRows(thermal, 599);
    const sigma = thermalTrap().rmsDisplacementM;
    relative(rows[0].displacementM, -4 * sigma);
    relative(rows.at(-1)!.displacementM, 4 * sigma);
    expect(rows[299].relativeDensity).toBe(1);
    expect(rows[299].relativePotentialKT).toBe(0);
    relative(rows[0].relativeDensity, Math.exp(-8));
    for (const i of [0, 50, 120, 250]) relative(rows[i].probabilityDensityPerM, rows[598 - i].probabilityDensityPerM);
    const integral = rows.slice(1).reduce((sum, row, i) => sum + (row.displacementM - rows[i].displacementM) * (row.probabilityDensityPerM + rows[i].probabilityDensityPerM) / 2, 0);
    expect(integral).toBeGreaterThan(0.99993);
    expect(integral).toBeLessThan(0.99994);
  });
  it('keeps every scalar and Gaussian row finite at allowed parameter extremes', () => {
    for (const stiffnessNpm of [1e-9, 1e-3]) for (const temperatureK of [250, 350]) for (const radiusM of [25e-9, 5e-6]) for (const viscosityPas of [1e-4, 0.1]) {
      const input = { stiffnessNpm, temperatureK, radiusM, viscosityPas };
      expect(Object.values(thermalTrap(input)).every(Number.isFinite)).toBe(true);
      expect(buildThermalTrapRows(input, 3).every(row => Object.values(row).every(Number.isFinite))).toBe(true);
    }
  });
  it('rejects invalid thermal inputs and zero-force-constant singularities', () => {
    for (const key of Object.keys(thermal)) for (const value of [NaN, Infinity, -Infinity, 0, -1, '1', undefined]) expect(() => thermalTrap({ ...thermal, [key]: value })).toThrow();
    expect(() => thermalTrap({ ...thermal, stiffnessNpm: 1e-10 })).toThrow();
    expect(() => thermalTrap({ ...thermal, temperatureK: 351 })).toThrow();
    expect(() => thermalTrap({ ...thermal, radiusM: 5e-9 })).toThrow();
    expect(() => thermalTrap({ ...thermal, viscosityPas: 0.10001 })).toThrow();
  });
});

describe('equal-amplitude phase and path interference', () => {
  it('gives fixed-normalization constructive, quadrature and destructive values', () => {
    expect(coherence({ ...wave, phaseDeg: 0 }).normalizedIntensity).toBe(1);
    relative(coherence({ ...wave, phaseDeg: 90 }).normalizedIntensity, 0.5);
    expect(coherence({ ...wave, phaseDeg: 180 }).normalizedIntensity).toBe(0);
    expect(coherence({ ...wave, phaseDeg: -180 }).normalizedIntensity).toBe(0);
  });
  it('distinguishes path-difference periodicity lambda from spatial node spacing lambda/2', () => {
    const lambda = coherence().wavelengthM;
    expect(coherence({ ...wave, pathDifferenceM: lambda / 2 }).normalizedIntensity).toBe(0);
    expect(coherence({ ...wave, pathDifferenceM: lambda }).normalizedIntensity).toBe(1);
    relative(coherence().nodeSpacingM, lambda / 2);
  });
  it('lets source phase compensate the propagation phase with correct sign', () => {
    const lambda = coherence().wavelengthM;
    const result = coherence({ ...wave, pathDifferenceM: lambda / 4, phaseDeg: -90 });
    expect(result.normalizedIntensity).toBe(1);
    expect(Math.abs(result.phaseDifferenceRad)).toBeLessThan(1e-15);
  });
  it('uses relative phase, not the standing-wave spatial phase convention', () => {
    const lambda = coherence().wavelengthM;
    const originalNodeZ = lambda / 4;
    const phaseChangeRad = Math.PI / 2;
    const translatedNodeZ = originalNodeZ - lambda * phaseChangeRad / (4 * Math.PI);
    const result = coherence({ ...wave, pathDifferenceM: 2 * translatedNodeZ, phaseDeg: 90 });
    expect(result.normalizedIntensity).toBe(0);
  });
  it('does not renormalize a low-frequency partial fringe to its own maximum', () => {
    const rows = buildCoherenceRows({ ...wave, frequencyHz: 1, phaseDeg: 90 });
    const maximum = Math.max(...rows.map(row => row.normalizedIntensity));
    expect(maximum).toBeLessThan(0.51);
    expect(maximum).toBeGreaterThan(0.5);
  });
  it.each([-1, -0.5, 0, 0.5, 1])('bounds high-frequency plots around selected path %s without unresolved cycles', pathDifferenceM => {
    const input = { ...wave, frequencyHz: 100_000, pathDifferenceM, phaseDeg: 70 };
    const lambda = coherence(input).wavelengthM;
    const rows = buildCoherenceRows(input, 17);
    expect(rows).toHaveLength(17);
    expect(rows[0].pathDifferenceM).toBeGreaterThanOrEqual(-1);
    expect(rows.at(-1)!.pathDifferenceM).toBeLessThanOrEqual(1);
    expect(rows[0].pathDifferenceM).toBeLessThanOrEqual(pathDifferenceM);
    expect(rows.at(-1)!.pathDifferenceM).toBeGreaterThanOrEqual(pathDifferenceM);
    expect(rows.at(-1)!.pathDifferenceM - rows[0].pathDifferenceM).toBeLessThanOrEqual(2 * lambda + 1e-14);
    expect(rows.every(row => row.normalizedIntensity >= 0 && row.normalizedIntensity <= 1)).toBe(true);
    for (let i = 1; i < rows.length; i++) expect(rows[i].phaseDifferenceRad - rows[i - 1].phaseDifferenceRad).toBeLessThanOrEqual(Math.PI / 4 + 1e-10);
  });
  it('rejects nonfinite phase/path and out-of-range inputs', () => {
    for (const key of Object.keys(wave)) for (const value of [NaN, Infinity, -Infinity, '1', undefined]) expect(() => coherence({ ...wave, [key]: value })).toThrow();
    expect(() => coherence({ ...wave, frequencyHz: 0 })).toThrow();
    expect(() => coherence({ ...wave, phaseDeg: 181 })).toThrow();
    expect(() => coherence({ ...wave, pathDifferenceM: 1.01 })).toThrow();
  });
});

describe('allocation and export contracts', () => {
  it.each([null, [], false, 'input'])('rejects a malformed input object %s', input => {
    expect(() => thermalTrap(input as never)).toThrow();
    expect(() => coherence(input as never)).toThrow();
  });
  it.each([NaN, Infinity, -Infinity, 0, 2, 19.5, 601, 1e9])('rejects invalid row allocation %s before building a plot', count => {
    expect(() => buildThermalTrapRows(thermal, count)).toThrow();
    expect(() => buildCoherenceRows(wave, count)).toThrow();
  });
  it('enforces the more stringent coherence minimum and accepts bounded frozen inputs', () => {
    expect(() => buildCoherenceRows(wave, 16)).toThrow();
    expect(buildCoherenceRows(Object.freeze({ ...wave }), 600)).toHaveLength(600);
    expect(buildThermalTrapRows(Object.freeze({ ...thermal }), 600)).toHaveLength(600);
  });
  it('exports deterministic rows with dimensions and assumptions', () => {
    const a = channelComparisonCsv(440), b = thermalTrapCsv(thermal, 17), d = coherenceCsv(wave, 17);
    expect(a).toBe(channelComparisonCsv(440));
    expect(b).toBe(thermalTrapCsv(thermal, 17));
    expect(d).toBe(coherenceCsv(wave, 17));
    expect(a).toContain('photon_energy_j');
    expect(b).toContain('probability_density_per_m');
    expect(b).toContain('prescribed positive harmonic stiffness');
    expect(d).toContain('plotPathMinM=');
    expect(d).toContain('not net standing-wave energy flux');
    expect(d).toContain('normalization is fixed');
    for (const [csv, dataCount] of [[a, 1], [b, 17], [d, 17]] as const) {
      const data = csv.trim().split('\n').filter(row => !row.startsWith('#')).slice(1);
      expect(data).toHaveLength(dataCount);
      expect(data.every(row => row.split(',').every(value => Number.isFinite(Number(value))))).toBe(true);
    }
  });
});

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ACOUSTICS_INPUT,
  MAX_ACOUSTICS_SAMPLES,
  acousticsCsv,
  buildImpedanceSweepRows,
  calculateAcoustics,
  pitchIntervalCents,
  validateAcousticsInput,
} from './acoustics';

describe('standard acoustic scale arithmetic', () => {
  it('keeps wavelength in metres and period in milliseconds', () => {
    const result = calculateAcoustics({ frequencyHz: 343, soundSpeed: 343, impedanceRatio: 1 });
    expect(result.wavelengthM).toBe(1);
    expect(result.periodMs).toBeCloseTo(1000 / 343, 12);
    expect(result.periodMs / 1000 * 343).toBeCloseTo(result.wavelengthM, 12);
    expect(calculateAcoustics({ frequencyHz: 1000, soundSpeed: 1480, impedanceRatio: 1 }).wavelengthM).toBe(1.48);
  });

  it('halves wavelength and period when frequency doubles at fixed sound speed', () => {
    const low = calculateAcoustics({ ...DEFAULT_ACOUSTICS_INPUT, frequencyHz: 220 });
    const high = calculateAcoustics({ ...DEFAULT_ACOUSTICS_INPUT, frequencyHz: 440 });
    expect(high.wavelengthM).toBe(low.wavelengthM / 2);
    expect(high.periodMs).toBe(low.periodMs / 2);
    expect(high.reflectionPower).toBe(low.reflectionPower);
    expect(high.transmissionPower).toBe(low.transmissionPower);
  });

  it('changes wavelength, but not period or hypothetical coupling, when reference medium changes', () => {
    const air = calculateAcoustics({ ...DEFAULT_ACOUSTICS_INPUT, impedanceRatio: 10 });
    const water = calculateAcoustics({ ...DEFAULT_ACOUSTICS_INPUT, soundSpeed: 1480, impedanceRatio: 10 });
    expect(water.wavelengthM / air.wavelengthM).toBeCloseTo(1480 / 343, 12);
    expect(water.periodMs).toBe(air.periodMs);
    expect(water.reflectionPower).toBe(air.reflectionPower);
    expect(water.transmissionPower).toBe(air.transmissionPower);
  });

  it('represents musical octaves, semitones, inversion and interval addition in cents', () => {
    expect(pitchIntervalCents(440, 440)).toBe(0);
    expect(pitchIntervalCents(440, 220)).toBe(1200);
    expect(pitchIntervalCents(220, 440)).toBe(-1200);
    expect(pitchIntervalCents(440 * 2 ** (1 / 12), 440)).toBeCloseTo(100, 10);
    expect(pitchIntervalCents(528, 432)).toBeCloseTo(-pitchIntervalCents(432, 528), 10);
    expect(pitchIntervalCents(528, 220)).toBeCloseTo(pitchIntervalCents(528, 432) + pitchIntervalCents(432, 220), 10);
  });
});

describe('ideal normal-incidence power fractions', () => {
  it('transmits all power for equal impedances and reproduces an analytic mismatch', () => {
    const matched = calculateAcoustics();
    expect(matched.reflectionPower).toBe(0);
    expect(matched.transmissionPower).toBe(1);
    const mismatch = calculateAcoustics({ ...DEFAULT_ACOUSTICS_INPUT, impedanceRatio: 3 });
    expect(mismatch.reflectionPower).toBe(0.25);
    expect(mismatch.transmissionPower).toBe(0.75);
  });

  it('conserves ideal power and has reciprocal symmetry across the entire sweep', () => {
    for (const row of buildImpedanceSweepRows(MAX_ACOUSTICS_SAMPLES)) {
      expect(row.reflectionPower + row.transmissionPower).toBeCloseTo(1, 14);
      expect(row.reflectionPower).toBeGreaterThanOrEqual(0);
      expect(row.reflectionPower).toBeLessThanOrEqual(1);
      expect(row.transmissionPower).toBeGreaterThan(0);
      expect(row.transmissionPower).toBeLessThanOrEqual(1);
      const reciprocal = calculateAcoustics({ ...DEFAULT_ACOUSTICS_INPUT, impedanceRatio: 1 / row.impedanceRatio });
      expect(row.reflectionPower).toBeCloseTo(reciprocal.reflectionPower, 14);
      expect(row.transmissionPower).toBeCloseTo(reciprocal.transmissionPower, 14);
    }
  });

  it('sweeps logarithmically with exact endpoints and a matched midpoint for odd counts', () => {
    const rows = buildImpedanceSweepRows();
    expect(rows).toHaveLength(201);
    expect(rows[0].impedanceRatio).toBe(0.01);
    expect(rows[100].impedanceRatio).toBe(1);
    expect(rows[200].impedanceRatio).toBe(100);
    const multiplier = rows[1].impedanceRatio / rows[0].impedanceRatio;
    for (let index = 1; index < rows.length; index++) {
      expect(rows[index].impedanceRatio / rows[index - 1].impedanceRatio).toBeCloseTo(multiplier, 12);
    }
    expect(buildImpedanceSweepRows()).toEqual(rows);
    expect(buildImpedanceSweepRows(2).map(({ impedanceRatio }) => impedanceRatio)).toEqual([0.01, 100]);
  });
});

describe('strict input and reproducible export', () => {
  it.each([NaN, Infinity, -Infinity, '343', null, undefined])('rejects nonfinite or nonnumeric fields (%s)', (invalid) => {
    expect(() => validateAcousticsInput({ ...DEFAULT_ACOUSTICS_INPUT, frequencyHz: invalid })).toThrow();
    expect(() => validateAcousticsInput({ ...DEFAULT_ACOUSTICS_INPUT, soundSpeed: invalid })).toThrow();
    expect(() => validateAcousticsInput({ ...DEFAULT_ACOUSTICS_INPUT, impedanceRatio: invalid })).toThrow();
  });

  it('rejects unsupported physical calibration values and out-of-range inputs', () => {
    for (const soundSpeed of [0, 342.9, 344, 1500]) {
      expect(() => calculateAcoustics({ ...DEFAULT_ACOUSTICS_INPUT, soundSpeed })).toThrow();
    }
    for (const frequencyHz of [0, 59.99, 1000.01]) {
      expect(() => calculateAcoustics({ ...DEFAULT_ACOUSTICS_INPUT, frequencyHz })).toThrow();
      expect(() => pitchIntervalCents(frequencyHz, 440)).toThrow();
      expect(() => pitchIntervalCents(440, frequencyHz)).toThrow();
    }
    for (const impedanceRatio of [-1, 0, 0.009, 101]) {
      expect(() => calculateAcoustics({ ...DEFAULT_ACOUSTICS_INPUT, impedanceRatio })).toThrow();
    }
    for (const input of [null, [], true, 'input', {}]) expect(() => validateAcousticsInput(input)).toThrow();
  });

  it.each([0, 1, -1, 2.5, 601, 1_000_000_000, NaN, Infinity])('rejects invalid allocation count %s before generating rows or CSV', (count) => {
    expect(() => buildImpedanceSweepRows(count)).toThrow();
    expect(() => acousticsCsv(DEFAULT_ACOUSTICS_INPUT, count)).toThrow();
  });

  it('exports selected parameters and numerical fractions with units and model assumptions', () => {
    const input = { frequencyHz: 440, soundSpeed: 1480, impedanceRatio: 3 };
    const csv = acousticsCsv(input, 11);
    expect(csv).toContain('# frequencyHz=440');
    expect(csv).toContain('# soundSpeed_m_per_s=1480');
    expect(csv).toContain('# selected_impedanceRatio=3');
    expect(csv).toContain('# selected_reflection_power_fraction=0.25');
    expect(csv).toContain('# selected_transmission_power_fraction=0.75');
    expect(csv).toContain('one flat lossless interface; normal incidence');
    expect(csv).toContain('independent of frequency and sound speed');
    expect(csv).toContain('No body coupling');
    const lines = csv.trim().split('\n').filter((line) => !line.startsWith('#'));
    expect(lines).toHaveLength(12);
    expect(lines[0]).toBe('impedance_ratio,reflection_power_fraction,transmission_power_fraction');
    for (const line of lines.slice(1)) {
      const values = line.split(',').map(Number);
      expect(values).toHaveLength(3);
      expect(values.every(Number.isFinite)).toBe(true);
      expect(values[1] + values[2]).toBeCloseTo(1, 14);
    }
    expect(acousticsCsv(input, 11)).toBe(csv);
  });
});

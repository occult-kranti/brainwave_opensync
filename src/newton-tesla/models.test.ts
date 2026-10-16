import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FIELD_INPUT,
  DEFAULT_OPTICS_INPUT,
  DEFAULT_RLC_INPUT,
  MAX_MODEL_SAMPLES,
  buildRefractionRows,
  buildRlcSweepRows,
  buildRotatingFieldRows,
  calculateRefraction,
  calculateRotatingField,
  calculateSeriesRlc,
  opticsCsv,
  rlcCsv,
  rotatingFieldCsv,
  validateFieldInput,
  validateOpticsInput,
  validateRlcInput,
} from './models';

describe('orthogonal rotating field geometry', () => {
  it('produces a constant unit magnitude in quadrature and reverses direction with phase', () => {
    for (const row of buildRotatingFieldRows()) expect(row.magnitude).toBeCloseTo(1, 12);
    expect(calculateRotatingField()).toEqual({ shape: 'circle', minimumMagnitude: 1, maximumMagnitude: 1, direction: 'counterclockwise' });
    expect(calculateRotatingField({ ...DEFAULT_FIELD_INPUT, phaseDeg: -90 }).direction).toBe('clockwise');
    const forward = buildRotatingFieldRows();
    const reverse = buildRotatingFieldRows({ ...DEFAULT_FIELD_INPUT, phaseDeg: -90 });
    for (let index = 0; index < forward.length; index++) {
      expect(forward[index].bx).toBe(reverse[index].bx);
      expect(forward[index].by).toBeCloseTo(-reverse[index].by, 12);
    }
  });

  it('reduces to a line for in-phase, opposite-phase or single-axis inputs', () => {
    for (const phaseDeg of [0, 180, -180]) {
      const input = { ...DEFAULT_FIELD_INPUT, phaseDeg, amplitudeRatio: 0.5 };
      expect(calculateRotatingField(input).shape).toBe('line');
      expect(calculateRotatingField(input).minimumMagnitude).toBe(0);
      expect(calculateRotatingField(input).maximumMagnitude).toBeCloseTo(Math.sqrt(1.25), 12);
      for (const row of buildRotatingFieldRows(input)) {
        expect(row.by).toBeCloseTo((phaseDeg === 0 ? 0.5 : -0.5) * row.bx, 12);
      }
    }
    expect(calculateRotatingField({ ...DEFAULT_FIELD_INPUT, amplitudeRatio: 0 }).direction).toBe('linear');
  });

  it('reports analytical ellipse radii and keeps every sampled vector within them', () => {
    const quadrature = calculateRotatingField({ ...DEFAULT_FIELD_INPUT, amplitudeRatio: 0.5 });
    expect(quadrature.shape).toBe('ellipse');
    expect(quadrature.minimumMagnitude).toBeCloseTo(0.5, 12);
    expect(quadrature.maximumMagnitude).toBeCloseTo(1, 12);
    const input = { ...DEFAULT_FIELD_INPUT, amplitudeRatio: 1.7, phaseDeg: 43 };
    const result = calculateRotatingField(input);
    for (const row of buildRotatingFieldRows(input)) {
      expect(row.magnitude).toBeGreaterThanOrEqual(result.minimumMagnitude - 1e-12);
      expect(row.magnitude).toBeLessThanOrEqual(result.maximumMagnitude + 1e-12);
    }
    expect(result.minimumMagnitude * result.maximumMagnitude).toBeCloseTo(1.7 * Math.sin(43 * Math.PI / 180), 12);
  });
});

describe('passive series RLC steady state', () => {
  it('converts mH/nF to SI and has I=V/R, zero phase, equal L/C voltage at current resonance', () => {
    const input = { ...DEFAULT_RLC_INPUT, inductanceMh: 20, capacitanceNf: 1000, resistanceOhm: 100 };
    const base = calculateSeriesRlc(input);
    const expectedF0 = 1 / (2 * Math.PI * Math.sqrt(0.02 * 1e-6));
    expect(base.resonantFrequencyHz).toBeCloseTo(expectedF0, 10);
    const result = calculateSeriesRlc({ ...input, frequencyHz: base.resonantFrequencyHz });
    expect(result.currentArms).toBeCloseTo(input.inputVrms / input.resistanceOhm, 12);
    expect(result.currentMilliAmps).toBeCloseTo(5, 12);
    expect(result.currentPhaseDeg).toBeCloseTo(0, 10);
    expect(result.impedanceOhm).toBeCloseTo(input.resistanceOhm, 12);
    expect(result.inductorVoltageVrms).toBeCloseTo(result.capacitorVoltageVrms, 12);
    expect(result.capacitorVoltageVrms).toBeCloseTo(result.qualityFactor * input.inputVrms, 12);
  });

  it('conserves mean real power and satisfies the apparent-power triangle', () => {
    for (const frequencyHz of [20, 250, 1000, 6000, 20_000]) {
      const result = calculateSeriesRlc({ ...DEFAULT_RLC_INPUT, frequencyHz });
      expect(result.inputPowerW).toBeCloseTo(result.dissipationPowerW, 14);
      expect(result.apparentPowerVa ** 2).toBeCloseTo(result.inputPowerW ** 2 + result.reactivePowerVar ** 2, 14);
      expect(result.inputPowerW).toBeGreaterThan(0);
      expect(result.currentArms).toBeLessThanOrEqual(DEFAULT_RLC_INPUT.inputVrms / DEFAULT_RLC_INPUT.resistanceOhm);
    }
  });

  it('has leading current below resonance and lagging current above resonance', () => {
    const f0 = calculateSeriesRlc().resonantFrequencyHz;
    const below = calculateSeriesRlc({ ...DEFAULT_RLC_INPUT, frequencyHz: f0 / 2 });
    const above = calculateSeriesRlc({ ...DEFAULT_RLC_INPUT, frequencyHz: f0 * 2 });
    expect(below.currentPhaseDeg).toBeGreaterThan(0);
    expect(below.reactivePowerVar).toBeLessThan(0);
    expect(above.currentPhaseDeg).toBeLessThan(0);
    expect(above.reactivePowerVar).toBeGreaterThan(0);
    expect(below.currentArms).toBeCloseTo(above.currentArms, 12);
  });

  it('distinguishes the capacitor-voltage maximum from the series current resonance', () => {
    const input = { ...DEFAULT_RLC_INPUT, inductanceMh: 20, capacitanceNf: 1000, resistanceOhm: 100 };
    const result = calculateSeriesRlc(input);
    expect(result.capacitorPeakFrequencyHz).not.toBeNull();
    const peakFrequency = result.capacitorPeakFrequencyHz!;
    expect(peakFrequency).toBeLessThan(result.resonantFrequencyHz);
    const atPeak = calculateSeriesRlc({ ...input, frequencyHz: peakFrequency });
    const lower = calculateSeriesRlc({ ...input, frequencyHz: peakFrequency * 0.99 });
    const higher = calculateSeriesRlc({ ...input, frequencyHz: peakFrequency * 1.01 });
    const atCurrentResonance = calculateSeriesRlc({ ...input, frequencyHz: result.resonantFrequencyHz });
    expect(atPeak.capacitorVoltageVrms).toBeGreaterThan(lower.capacitorVoltageVrms);
    expect(atPeak.capacitorVoltageVrms).toBeGreaterThan(higher.capacitorVoltageVrms);
    expect(atPeak.capacitorVoltageVrms).toBeGreaterThan(atCurrentResonance.capacitorVoltageVrms);
    expect(atPeak.currentArms).toBeLessThan(atCurrentResonance.currentArms);
    expect(calculateSeriesRlc().capacitorPeakFrequencyHz).toBeNull();
  });

  it('scales current with source voltage, and average power with source voltage squared', () => {
    const low = calculateSeriesRlc({ ...DEFAULT_RLC_INPUT, inputVrms: 0.25 });
    const high = calculateSeriesRlc({ ...DEFAULT_RLC_INPUT, inputVrms: 0.5 });
    expect(high.currentArms).toBe(low.currentArms * 2);
    expect(high.inputPowerW).toBe(low.inputPowerW * 4);
    expect(high.qualityFactor).toBe(low.qualityFactor);
    expect(high.resonantFrequencyHz).toBe(low.resonantFrequencyHz);
  });

  it('includes exact current resonance and bounded frequencies across extreme sweep inputs', () => {
    for (const inductanceMh of [1, 100]) {
      for (const capacitanceNf of [100, 10_000]) {
        for (const count of [3, 301, MAX_MODEL_SAMPLES]) {
          const input = { ...DEFAULT_RLC_INPUT, inductanceMh, capacitanceNf };
          const rows = buildRlcSweepRows(input, count);
          expect(rows).toHaveLength(count);
          const peak = rows.find((row) => row.frequencyRatio === 1);
          expect(peak).toBeDefined();
          expect(peak!.normalizedCurrent).toBeCloseTo(1, 12);
          for (let index = 0; index < rows.length; index++) {
            expect(rows[index].frequencyHz).toBeGreaterThanOrEqual(20);
            expect(rows[index].frequencyHz).toBeLessThanOrEqual(20_000);
            expect(rows[index].normalizedCurrent).toBeLessThanOrEqual(1 + 1e-12);
            if (index > 0) expect(rows[index].frequencyHz).toBeGreaterThan(rows[index - 1].frequencyHz);
          }
        }
      }
    }
  });
});

describe('refraction and total internal reflection', () => {
  it('obeys Snell at transmission, preserves normal incidence and equal-index direction', () => {
    const result = calculateRefraction();
    expect(result.totalInternalReflection).toBe(false);
    expect(DEFAULT_OPTICS_INPUT.n1 * Math.sin(DEFAULT_OPTICS_INPUT.incidenceDeg * Math.PI / 180)).toBeCloseTo(DEFAULT_OPTICS_INPUT.n2 * Math.sin(result.transmittedDeg! * Math.PI / 180), 12);
    expect(result.reflectedDeg).toBe(DEFAULT_OPTICS_INPUT.incidenceDeg);
    expect(calculateRefraction({ ...DEFAULT_OPTICS_INPUT, incidenceDeg: 0 }).transmittedDeg).toBe(0);
    const equal = calculateRefraction({ n1: 1.5, n2: 1.5, incidenceDeg: 65 });
    expect(equal.transmittedDeg).toBeCloseTo(65, 12);
    expect(equal.criticalAngleDeg).toBeNull();
  });

  it('returns a grazing transmitted ray at critical angle and null above it', () => {
    const input = { n1: 1.5, n2: 1, incidenceDeg: 30 };
    const critical = calculateRefraction(input).criticalAngleDeg!;
    const atCritical = calculateRefraction({ ...input, incidenceDeg: critical });
    expect(atCritical.totalInternalReflection).toBe(false);
    expect(atCritical.transmittedDeg).toBe(90);
    const above = calculateRefraction({ ...input, incidenceDeg: critical + 1e-7 });
    expect(above.totalInternalReflection).toBe(true);
    expect(above.transmittedDeg).toBeNull();
    const below = calculateRefraction({ ...input, incidenceDeg: critical - 1e-7 });
    expect(below.totalInternalReflection).toBe(false);
    expect(below.transmittedDeg).toBeLessThan(90);
  });

  it('is reversible below critical and has no spurious TIR when entering a higher index', () => {
    const initial = calculateRefraction({ n1: 1, n2: 1.5, incidenceDeg: 60 });
    const reverse = calculateRefraction({ n1: 1.5, n2: 1, incidenceDeg: initial.transmittedDeg! });
    expect(reverse.transmittedDeg).toBeCloseTo(60, 12);
    expect(buildRefractionRows({ n1: 1, n2: 2.5, incidenceDeg: 0 }).every((row) => !row.totalInternalReflection && row.transmittedDeg !== null)).toBe(true);
  });
});

describe('bounds and exports', () => {
  it.each([NaN, Infinity, -Infinity, null, undefined, '1'])('rejects invalid numeric fields %s', (invalid) => {
    for (const key of ['amplitudeRatio', 'phaseDeg', 'sampleCount']) expect(() => validateFieldInput({ ...DEFAULT_FIELD_INPUT, [key]: invalid })).toThrow();
    for (const key of ['inductanceMh', 'capacitanceNf', 'resistanceOhm', 'frequencyHz', 'inputVrms']) expect(() => validateRlcInput({ ...DEFAULT_RLC_INPUT, [key]: invalid })).toThrow();
    for (const key of ['n1', 'n2', 'incidenceDeg']) expect(() => validateOpticsInput({ ...DEFAULT_OPTICS_INPUT, [key]: invalid })).toThrow();
  });

  it('rejects malformed objects and domain violations', () => {
    for (const input of [null, true, [], {}, 'model']) {
      expect(() => validateFieldInput(input)).toThrow();
      expect(() => validateRlcInput(input)).toThrow();
      expect(() => validateOpticsInput(input)).toThrow();
    }
    expect(() => buildRotatingFieldRows({ ...DEFAULT_FIELD_INPUT, amplitudeRatio: -0.1 })).toThrow();
    expect(() => calculateSeriesRlc({ ...DEFAULT_RLC_INPUT, inputVrms: 2 })).toThrow();
    expect(() => calculateSeriesRlc({ ...DEFAULT_RLC_INPUT, resistanceOhm: 0 })).toThrow();
    expect(() => calculateRefraction({ ...DEFAULT_OPTICS_INPUT, n1: 0 })).toThrow();
    expect(() => calculateRefraction({ ...DEFAULT_OPTICS_INPUT, incidenceDeg: 90 })).toThrow();
  });

  it.each([0, 1, -1, 2.5, 601, 1e9, NaN, Infinity])('rejects allocation size %s before all row and export generation', (count) => {
    expect(() => buildRotatingFieldRows({ ...DEFAULT_FIELD_INPUT, sampleCount: count })).toThrow();
    expect(() => rotatingFieldCsv({ ...DEFAULT_FIELD_INPUT, sampleCount: count })).toThrow();
    expect(() => buildRlcSweepRows(DEFAULT_RLC_INPUT, count)).toThrow();
    expect(() => rlcCsv(DEFAULT_RLC_INPUT, count)).toThrow();
    expect(() => buildRefractionRows(DEFAULT_OPTICS_INPUT, count)).toThrow();
    expect(() => opticsCsv(DEFAULT_OPTICS_INPUT, count)).toThrow();
  });

  it('exports explicit units, assumptions and reproducible numerical rows', () => {
    const field = rotatingFieldCsv();
    const rlc = rlcCsv();
    const optics = opticsCsv({ n1: 1.5, n2: 1, incidenceDeg: 45 });
    expect(field).toContain('components and magnitude are dimensionless');
    expect(rlc).toContain('current_mA_rms');
    expect(rlc).toContain('mean real source power');
    expect(optics).toContain('empty transmitted angle means no propagating transmitted ray');
    for (const [csv, count] of [[field, 361], [rlc, 301], [optics, 181]] as const) {
      const lines = csv.trim().split('\n').filter((line) => !line.startsWith('#'));
      expect(lines).toHaveLength(count + 1);
      expect(csv).not.toContain('NaN');
      expect(csv).not.toContain('Infinity');
      for (const line of lines.slice(1)) expect(line.split(',').filter((cell) => cell !== '').map(Number).every(Number.isFinite)).toBe(true);
    }
    expect(rotatingFieldCsv()).toBe(field);
    expect(rlcCsv()).toBe(rlc);
    const tirRows = optics.trim().split('\n').filter((line) => !line.startsWith('#')).slice(1).map((line) => line.split(','));
    expect(tirRows.some((row) => row[1] === '' && row[3] === '1')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ENVELOPE_CONFIG,
  DEFAULT_RESONATOR_CONFIG,
  DEFAULT_WAVEFORM_CONFIG,
  MAX_PLOT_SAMPLES,
  buildEnvelopeRows,
  buildResonanceRows,
  buildSensitivityScenarios,
  buildWaveformRows,
  envelopeCsv,
  maxWaveformDurationSec,
  resonanceCsv,
  resonatorResponse,
  validateEnvelopeConfig,
  validateResonatorConfig,
  validateWaveformConfig,
  waveformCsv,
} from './model';

describe('normalized signal comparison', () => {
  it('matches the independent two-tone sum/product identity without summing binaural ears', () => {
    const config = { ...DEFAULT_WAVEFORM_CONFIG, carrierHz: 120, beatHz: 8 };
    for (const row of buildWaveformRows(config)) {
      const product = Math.sin(2 * Math.PI * (config.carrierHz + config.beatHz / 2) * row.timeSec)
        * Math.cos(Math.PI * config.beatHz * row.timeSec);
      expect(row.monaural).toBeCloseTo(product, 12);
      expect(row.binauralLeft).toBe(row.carrier);
      expect(row.binauralRight).toBeCloseTo(Math.sin(2 * Math.PI * 128 * row.timeSec), 12);
    }
    expect(buildWaveformRows(config).some((row) => Math.abs(row.binauralLeft - row.binauralRight) > 0.1)).toBe(true);
  });

  it('reduces the two-tone sum to the carrier when the frequency difference is zero', () => {
    for (const row of buildWaveformRows({ ...DEFAULT_WAVEFORM_CONFIG, beatHz: 0 })) {
      expect(row.monaural).toBe(row.carrier);
      expect(row.binauralLeft).toBe(row.binauralRight);
      // The sine-envelope phase is held at zero: full-depth AM has constant 1/2 gain.
      expect(row.envelope).toBe(0.5);
      expect(row.am).toBe(row.carrier / 2);
    }
  });

  it('has no AM when depth is zero and retains bounded normalized samples', () => {
    for (const row of buildWaveformRows({ ...DEFAULT_WAVEFORM_CONFIG, modulationDepth: 0 })) {
      expect(row.envelope).toBe(1);
      expect(row.am).toBe(row.carrier);
    }
    for (const row of buildWaveformRows()) {
      for (const value of [row.carrier, row.binauralLeft, row.binauralRight, row.monaural, row.am]) {
        expect(Math.abs(value)).toBeLessThanOrEqual(1);
      }
      expect(row.envelope).toBeGreaterThanOrEqual(0);
      expect(row.envelope).toBeLessThanOrEqual(1);
    }
  });

  it('resolves a slow analytical envelope independently of the carrier', () => {
    const rows = buildEnvelopeRows({ beatHz: 1, modulationDepth: 1, durationSec: 1, sampleCount: 33 });
    expect(rows[8].envelope).toBe(1);
    expect(rows[24].envelope).toBe(0);
    expect(rows[0].monauralEnvelope).toBe(1);
    expect(rows[16].monauralEnvelope).toBeCloseTo(0, 12);
    expect(rows[32].monauralEnvelope).toBe(1);
    expect(rows.at(-1)?.timeSec).toBe(1);
  });

  it('includes both endpoints and limits allocations to 1200 rows', () => {
    const rows = buildWaveformRows();
    expect(rows).toHaveLength(MAX_PLOT_SAMPLES);
    expect(rows[0].timeSec).toBe(0);
    expect(rows.at(-1)?.timeSec).toBe(DEFAULT_WAVEFORM_CONFIG.durationSec);
    expect(buildWaveformRows()).toEqual(rows);
  });

  it('rejects undersampled display windows, including an undersampled envelope', () => {
    expect(() => buildWaveformRows({ ...DEFAULT_WAVEFORM_CONFIG, durationSec: 1 })).toThrow(/resolve the carrier/);
    expect(() => buildEnvelopeRows({ ...DEFAULT_ENVELOPE_CONFIG, sampleCount: 2 })).toThrow(/resolve the modulation/);
    const durationSec = maxWaveformDurationSec(1000, 40);
    expect(() => buildWaveformRows({ ...DEFAULT_WAVEFORM_CONFIG, carrierHz: 1000, beatHz: 40, durationSec })).not.toThrow();
    expect(() => buildWaveformRows({ ...DEFAULT_WAVEFORM_CONFIG, carrierHz: 1000, beatHz: 40, durationSec: durationSec + 1e-6 })).toThrow();
  });
});

describe('ideal dimensionless forced oscillator', () => {
  it('has the static response, resonant value, and high-frequency asymptote', () => {
    for (const zeta of [0.01, 0.1, 0.5, 1, 2]) {
      expect(resonatorResponse(0, zeta)).toBe(1);
      expect(resonatorResponse(1, zeta)).toBeCloseTo(1 / (2 * zeta), 12);
      const ratio = 100_000;
      expect(resonatorResponse(ratio, zeta) * ratio * ratio).toBeCloseTo(1, 8);
    }
  });

  it('has the analytical amplitude maximum below the natural frequency for weak damping', () => {
    const zeta = 0.15;
    const ratioAtPeak = Math.sqrt(1 - 2 * zeta * zeta);
    const peak = resonatorResponse(ratioAtPeak, zeta);
    expect(peak).toBeCloseTo(1 / (2 * zeta * Math.sqrt(1 - zeta * zeta)), 12);
    expect(peak).toBeGreaterThan(resonatorResponse(1, zeta));
    expect(peak).toBeGreaterThan(resonatorResponse(ratioAtPeak - 0.01, zeta));
    expect(peak).toBeGreaterThan(resonatorResponse(ratioAtPeak + 0.01, zeta));
  });

  it('has correct phase limits and finite responses with stronger damping', () => {
    const rows = buildResonanceRows({ dampingRatio: 0.1, maxFrequencyRatio: 10, sampleCount: 1001 });
    expect(rows[0].phaseLagRad).toBe(0);
    expect(rows[100].frequencyRatio).toBe(1);
    expect(rows[100].phaseLagRad).toBeCloseTo(Math.PI / 2, 12);
    expect(rows[1000].phaseLagRad).toBeGreaterThan(3.1);
    for (let ratio = 0.1; ratio <= 10; ratio += 0.1) {
      expect(resonatorResponse(ratio, 0.2)).toBeLessThan(resonatorResponse(ratio, 0.1));
    }
    expect(rows.every((row) => Number.isFinite(row.response) && row.response > 0)).toBe(true);
  });

  it('creates reproducible half/base/double sensitivity scenarios without domain duplicates', () => {
    const scenarios = buildSensitivityScenarios();
    expect(scenarios.map(({ dampingRatio }) => dampingRatio)).toEqual([0.075, 0.15, 0.3]);
    expect(scenarios.every(({ rows }) => rows.length === DEFAULT_RESONATOR_CONFIG.sampleCount)).toBe(true);
    expect(buildSensitivityScenarios({ ...DEFAULT_RESONATOR_CONFIG, dampingRatio: 0.01 }).map(({ id }) => id)).toEqual(['base', 'high']);
    expect(buildSensitivityScenarios({ ...DEFAULT_RESONATOR_CONFIG, dampingRatio: 2 }).map(({ id }) => id)).toEqual(['low', 'base']);
    expect(buildSensitivityScenarios()).toEqual(scenarios);
  });
});

describe('input and export contracts', () => {
  it.each([NaN, Infinity, -Infinity, '12', null, undefined])('rejects invalid numeric input %s in all model families', (invalid) => {
    expect(() => validateWaveformConfig({ ...DEFAULT_WAVEFORM_CONFIG, carrierHz: invalid })).toThrow();
    expect(() => validateEnvelopeConfig({ ...DEFAULT_ENVELOPE_CONFIG, beatHz: invalid })).toThrow();
    expect(() => validateResonatorConfig({ ...DEFAULT_RESONATOR_CONFIG, dampingRatio: invalid })).toThrow();
  });

  it.each([0, -1, 1, 2.5, 1201, Number.MAX_SAFE_INTEGER, NaN, Infinity])('rejects invalid allocation size %s', (sampleCount) => {
    expect(() => buildWaveformRows({ ...DEFAULT_WAVEFORM_CONFIG, sampleCount })).toThrow();
    expect(() => buildEnvelopeRows({ ...DEFAULT_ENVELOPE_CONFIG, sampleCount })).toThrow();
    expect(() => buildResonanceRows({ ...DEFAULT_RESONATOR_CONFIG, sampleCount })).toThrow();
  });

  it('rejects missing objects and invalid oscillator parameters before allocation', () => {
    for (const input of [null, [], false, 'config', {}]) {
      expect(() => validateWaveformConfig(input)).toThrow();
      expect(() => validateEnvelopeConfig(input)).toThrow();
      expect(() => validateResonatorConfig(input)).toThrow();
    }
    expect(() => resonatorResponse(1, 0)).toThrow();
    expect(() => resonatorResponse(-1, 0.1)).toThrow();
    expect(() => resonatorResponse(Infinity, 0.1)).toThrow();
    expect(() => validateWaveformConfig({ ...DEFAULT_WAVEFORM_CONFIG, modulationDepth: 2 })).toThrow();
  });

  it('exports numeric rows and the exact configuration with interpretation metadata', () => {
    for (const [csv, count, columns] of [
      [waveformCsv(), DEFAULT_WAVEFORM_CONFIG.sampleCount, 7],
      [envelopeCsv(), DEFAULT_ENVELOPE_CONFIG.sampleCount, 3],
      [resonanceCsv(), DEFAULT_RESONATOR_CONFIG.sampleCount, 3],
    ] as const) {
      expect(csv).toContain('Model only.');
      expect(csv).toContain('Digital sample amplitude is not sound pressure level.');
      expect(csv).toContain(`# sampleCount=${count}`);
      const lines = csv.trim().split('\n').filter((line) => !line.startsWith('#'));
      expect(lines).toHaveLength(count + 1);
      for (const line of lines.slice(1)) {
        const values = line.split(',').map(Number);
        expect(values).toHaveLength(columns);
        expect(values.every(Number.isFinite)).toBe(true);
      }
    }
    expect(resonanceCsv()).toContain('normalized_displacement');
    expect(waveformCsv()).toContain('# carrierHz=180');
  });
});

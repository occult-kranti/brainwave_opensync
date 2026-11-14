import { describe, expect, it } from 'vitest';
import {
  AIR_SPEED_M_S,
  LIGHT_SPEED_M_S,
  MAX_ECHO_STEPS,
  TROPICAL_YEAR_SECONDS,
  frequencyRelations,
  octaveFrequency,
  rectangularRoomModeHz,
  rectangularRoomPressureAt,
  stepEcho,
  wavelengthComparison,
  wavelengthMeters,
} from '../models';

const room = { lengthM: 10, widthM: 5, heightM: 4 };
const axial = { x: 1, y: 0, z: 0 };
const stairs = { runM: 0.3, riseM: 0.2, offsetM: 3, sourceHeightM: 1.5, steps: 15 };

describe('wave scales and musical arithmetic', () => {
  it('keeps period and wavelengths independent of one another at a single frequency', () => {
    expect(wavelengthComparison(10)).toEqual({
      frequencyHz: 10,
      periodSeconds: 0.1,
      airMeters: 34.3,
      vacuumMeters: 29_979_245.8,
    });
    expect(wavelengthMeters(100)).toBe(3.43);
    expect(wavelengthMeters(0.1)).toBe(3430);
    expect(wavelengthMeters(0.1, LIGHT_SPEED_M_S)).toBe(2_997_924_580);
  });

  it('distinguishes a 3:2 interval from the fifth harmonic and octave', () => {
    expect(frequencyRelations(100)).toEqual({
      rootHz: 100, perfectFifthHz: 150, fifthHarmonicHz: 500, octaveHz: 200,
    });
    const solar = frequencyRelations(0.003);
    expect(solar.fifthHarmonicHz).toBeCloseTo(0.015, 12);
    expect(solar.perfectFifthHz).toBeCloseTo(0.0045, 12);
  });

  it('makes the choice of octave explicit for a season-length period', () => {
    expect(octaveFrequency(TROPICAL_YEAR_SECONDS, 0)).toBeCloseTo(3.1688765e-8, 14);
    expect(octaveFrequency(TROPICAL_YEAR_SECONDS, 32)).toBeCloseTo(136.1022, 3);
    expect(octaveFrequency(TROPICAL_YEAR_SECONDS, 33)).toBe(2 * octaveFrequency(TROPICAL_YEAR_SECONDS, 32));
    expect(octaveFrequency(8, -1)).toBe(0.0625);
  });

  it('rejects nonfinite, nonpositive or nonrepresentable values', () => {
    for (const invalid of [0, -1, Infinity, NaN]) {
      expect(() => wavelengthComparison(invalid)).toThrow(RangeError);
      expect(() => wavelengthMeters(10, invalid)).toThrow(RangeError);
      expect(() => frequencyRelations(invalid)).toThrow(RangeError);
      expect(() => octaveFrequency(invalid, 32)).toThrow(RangeError);
    }
    expect(() => wavelengthComparison(Number.MIN_VALUE)).toThrow(RangeError);
    expect(() => octaveFrequency(2, 0.5)).toThrow(RangeError);
    expect(() => octaveFrequency(2, 1024)).toThrow(RangeError);
  });
});

describe('ideal rigid rectangular room', () => {
  it('calculates axial and mixed modes and scales with propagation speed and geometry', () => {
    expect(rectangularRoomModeHz(room, axial)).toBeCloseTo(17.15, 12);
    expect(rectangularRoomModeHz(room, { x: 2, y: 1, z: 0 })).toBeCloseTo(48.50752519, 8);
    expect(rectangularRoomModeHz(room, axial, 350)).toBeCloseTo(17.5, 12);
    expect(rectangularRoomModeHz({ lengthM: 20, widthM: 10, heightM: 8 }, axial)).toBeCloseTo(8.575, 12);
  });

  it('places an axial pressure node halfway between opposite walls', () => {
    expect(rectangularRoomPressureAt(room, axial, { xM: 0, yM: 3, zM: 2 })).toBe(1);
    expect(rectangularRoomPressureAt(room, axial, { xM: 5, yM: 0, zM: 0 })).toBeCloseTo(0, 14);
    expect(rectangularRoomPressureAt(room, axial, { xM: 10, yM: 5, zM: 4 })).toBe(-1);
  });

  it('rejects invalid dimensions, orders and sample coordinates', () => {
    expect(() => rectangularRoomModeHz({ ...room, widthM: 0 }, axial)).toThrow(RangeError);
    for (const x of [-1, 0, 0.5, Infinity, NaN]) {
      expect(() => rectangularRoomModeHz(room, { x, y: 0, z: 0 })).toThrow(RangeError);
    }
    expect(() => rectangularRoomPressureAt(room, axial, { xM: 10.1, yM: 0, zM: 0 })).toThrow(RangeError);
  });
});

describe('regularly spaced point-scatterer travel times', () => {
  it('produces exact flat-row spacing and a reciprocal gap rate', () => {
    const rows = stepEcho({ ...stairs, riseM: 0, sourceHeightM: 0 });
    expect(rows[0]).toEqual({ step: 1, timeSeconds: 6 / AIR_SPEED_M_S, spacingSeconds: null, spacingHz: null });
    for (const row of rows.slice(1)) {
      expect(row.spacingSeconds).toBeCloseTo(0.6 / AIR_SPEED_M_S, 12);
      expect(row.spacingHz).toBeCloseTo(AIR_SPEED_M_S / 0.6, 9);
    }
  });

  it('shows increasing delay gaps and declining local repetition rates in one example', () => {
    const rows = stepEcho(stairs);
    expect(rows[0].timeSeconds).toBeCloseTo(2 * Math.hypot(3, 1.5) / AIR_SPEED_M_S, 12);
    expect(rows[1].spacingHz).toBeGreaterThan(rows[14].spacingHz!);
    for (const [index, row] of rows.entries()) {
      expect(row.step).toBe(index + 1);
      if (index > 1) expect(row.spacingSeconds).toBeGreaterThan(rows[index - 1].spacingSeconds!);
    }
  });

  it('sorts arrivals by time when an elevated receiver is closer to a higher edge', () => {
    const rows = stepEcho({ ...stairs, runM: 0.1, riseM: 1, offsetM: 0.1, sourceHeightM: 4, steps: 6 });
    expect(rows[0].step).toBe(5);
    for (const row of rows.slice(1)) expect(row.spacingSeconds).toBeGreaterThan(0);
  });

  it('does not assign a frequency to coincident arrivals', () => {
    const rows = stepEcho({ runM: 1, riseM: 1, offsetM: 3, sourceHeightM: 4, steps: 2, speedMps: 1 });
    expect(rows[1].spacingSeconds).toBe(0);
    expect(rows[1].spacingHz).toBeNull();
  });

  it('bounds the requested allocation before building paths', () => {
    for (const steps of [0, 1, 2.5, MAX_ECHO_STEPS + 1, NaN, Infinity]) {
      expect(() => stepEcho({ ...stairs, steps })).toThrow(RangeError);
    }
    expect(stepEcho({ ...stairs, steps: MAX_ECHO_STEPS })).toHaveLength(MAX_ECHO_STEPS);
    expect(() => stepEcho({ ...stairs, runM: 0 })).toThrow(RangeError);
  });
});

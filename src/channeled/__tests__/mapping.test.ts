import { describe, expect, it } from 'vitest';
import { getFrequencyById } from '@/data/frequencies';
import { BOWL_SETS, MAX_BOWLS } from '@/engine/bowls';
import { copy } from '@/everyday/copy';
import { ILLUSTRATIVE_K, LIGHT_SPEED_M_PER_S, map, MAPPING_ANCHOR, PHI, PHI_CENTS, PHI_LADDER_HZ, SCALE_READINGS, vacuumWavelength } from '../mapping';

describe('illustrative mapping arithmetic', () => {
  it('reproduces all seven divisions exactly, including the chosen anchor', () => {
    expect(SCALE_READINGS.map(({ stated }) => map(stated))).toEqual([6, 10, 27.4, 28.6, 29.2, 40, 66.6]);
    for (const { stated } of SCALE_READINGS) expect(map(stated)).toBe(stated / 5_000);
    expect(map(MAPPING_ANCHOR.stated)).toBe(MAPPING_ANCHOR.mappedHz);
    expect(ILLUSTRATIVE_K).toBe(MAPPING_ANCHOR.stated / MAPPING_ANCHOR.mappedHz);
    expect(map(333_000)).toBeCloseTo(66.6, 9);
  });

  it('uses the existing catalog for band bounds, without treating 40 Hz as gamma onset', () => {
    for (const row of SCALE_READINGS) {
      const band = getFrequencyById(row.bandId)!.band!;
      expect(map(row.stated)).toBeGreaterThanOrEqual(band.minHz);
      expect(map(row.stated)).toBeLessThanOrEqual(band.maxHz);
    }
    expect(getFrequencyById('band-gamma')!.band!.minHz).toBe(30);
  });

  it('shows that a different chosen constant changes the result', () => {
    expect(map(200_000, 10_000)).toBe(20);
    expect(map(200_000, 2_500)).toBe(80);
    expect(map(0)).toBe(0);
  });

  it('rejects non-finite inputs and non-positive scale factors', () => {
    for (const input of [-1, Number.NaN, Infinity, -Infinity]) expect(() => map(input)).toThrow(RangeError);
    for (const k of [0, -1, Number.NaN, Infinity]) expect(() => map(200_000, k)).toThrow(RangeError);
  });
});

describe('pitch and conditional electromagnetic arithmetic', () => {
  it('retains phi precision in every ladder pitch and never rounds before playback', () => {
    expect(PHI).toBe((1 + Math.sqrt(5)) / 2);
    expect(PHI_CENTS).toBeCloseTo(833.0902963567409, 9);
    expect(PHI_LADDER_HZ).toHaveLength(5);
    for (let i = 0; i < PHI_LADDER_HZ.length; i++) {
      expect(PHI_LADDER_HZ[i]).toBe(110 * PHI ** i);
      if (i > 0) expect(PHI_LADDER_HZ[i] / PHI_LADDER_HZ[i - 1]).toBeCloseTo(PHI, 12);
    }
  });

  it('loads the same exact ladder into bowls within the engine limits and provides Everyday copy', () => {
    const set = BOWL_SETS.find((item) => item.id === 'golden-ratio-chord')!;
    expect(set.bowls.map((bowl) => bowl.baseHz)).toEqual(PHI_LADDER_HZ);
    expect(set.bowls.length).toBeLessThanOrEqual(MAX_BOWLS);
    for (const bowl of set.bowls) {
      expect(bowl.baseHz).toBeGreaterThan(20);
      expect(bowl.baseHz).toBeLessThan(1_000);
    }
    expect(copy.sounds.bowlSets['golden-ratio-chord'].split(/\s+/).length).toBeLessThanOrEqual(6);
  });

  it('uses c/f only in a function explicitly scoped to vacuum wavelengths', () => {
    expect(LIGHT_SPEED_M_PER_S).toBe(299_792_458);
    expect(vacuumWavelength(200_000)).toBe(1_498.96229);
    for (const hz of [0, -1, Infinity, NaN]) expect(() => vacuumWavelength(hz)).toThrow(RangeError);
  });
});

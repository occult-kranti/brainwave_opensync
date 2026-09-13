/** Arithmetic demonstrations, not a conversion from a measured body signal. */
export const ILLUSTRATIVE_K = 5_000;
export const MAPPING_ANCHOR = { stated: 200_000, mappedHz: 40 } as const;
export const PHI = (1 + Math.sqrt(5)) / 2;
export const PHI_CENTS = 1_200 * Math.log2(PHI);
export const PHI_LADDER_HZ: readonly number[] = Array.from({ length: 5 }, (_, n) => 110 * PHI ** n);
export const LIGHT_SPEED_M_PER_S = 299_792_458;

export const SCALE_READINGS = [
  { stated: 30_000, bandId: 'band-theta', sessionIds: ['p8JC21bFf5M', 'ygzBrMyMAQA'] },
  { stated: 50_000, bandId: 'band-alpha', sessionIds: ['p8JC21bFf5M', 'ygzBrMyMAQA'] },
  { stated: 137_000, bandId: 'band-beta', sessionIds: ['hTlU_M_R0eE'] },
  { stated: 143_000, bandId: 'band-beta', sessionIds: ['lLFUTAVah30'] },
  { stated: 146_000, bandId: 'band-beta', sessionIds: ['hTlU_M_R0eE'] },
  { stated: 200_000, bandId: 'band-gamma', sessionIds: ['p8JC21bFf5M', 'ygzBrMyMAQA'] },
  { stated: 333_000, bandId: 'band-gamma', sessionIds: ['p8JC21bFf5M', 'ygzBrMyMAQA'] },
] as const;

/** Positive finite source numbers only; k is an explicitly chosen scale factor. */
export function map(stated: number, k = ILLUSTRATIVE_K): number {
  if (!Number.isFinite(stated) || stated < 0 || !Number.isFinite(k) || k <= 0) {
    throw new RangeError('Mapping requires a finite non-negative number and positive finite scale factor.');
  }
  return stated / k;
}

/** Valid only under an explicit electromagnetic-wave-in-vacuum assumption. */
export function vacuumWavelength(frequencyHz: number): number {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) {
    throw new RangeError('Frequency must be positive and finite.');
  }
  return LIGHT_SPEED_M_PER_S / frequencyHz;
}

import { describe, expect, it } from 'vitest';
import { renderNature, renderNoise } from '@/engine';
import { seamlessTextureLoop } from '../loopBuffer';

function rms(data: Float32Array): number {
  let energy = 0;
  for (const sample of data) energy += sample * sample;
  return Math.sqrt(energy / data.length);
}
function differenceRms(data: Float32Array): number {
  let energy = 0;
  for (let i = 1; i < data.length; i++) energy += (data[i] - data[i - 1]) ** 2;
  return Math.sqrt(energy / (data.length - 1));
}
const jump = (data: Float32Array) => Math.abs(data[0] - data[data.length - 1]);
function sameBytes(left: Float32Array, right: Float32Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  const a = new Uint8Array(left.buffer, left.byteOffset, left.byteLength);
  const b = new Uint8Array(right.buffer, right.byteOffset, right.byteLength);
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

describe('live texture loop seams', () => {
  for (const sampleRate of [44100, 48000]) {
    for (const [name, seconds, render] of [
        ['brown', 8, (duration: number) => renderNoise('brown', duration, sampleRate)],
        ['fire', 12, (duration: number) => renderNature('fire', duration, sampleRate)],
        ['thunder', 12, (duration: number) => renderNature('thunder', duration, sampleRate)],
    ] as const) {
      it(`removes the exceptional ${name} wrap transient at ${sampleRate} Hz without a level dip`, () => {
        const overlap = Math.round(sampleRate * 0.1);
        const original = render(seconds);
        const source = render(seconds + overlap / sampleRate);
        const copy = source.slice();
        const loop = seamlessTextureLoop(source, overlap);
        // Reproduces the old exceptional sample step rather than asserting
        // that every random texture sample must be identical across a join.
        expect(jump(original) / differenceRms(original), name).toBeGreaterThan(8);
        expect(jump(loop) / differenceRms(loop), name).toBeLessThan(4);
        expect(jump(loop), name).toBeLessThan(jump(original) / 10);
        expect(loop.length, name).toBe(seconds * sampleRate);
        expect(rms(loop), name).toBeCloseTo(rms(source), 6);
        // Direct byte comparison keeps full bit-for-bit coverage without
        // asking the assertion library to inspect half a million numbers.
        expect(sameBytes(source, copy), 'offline renderer input remains unchanged').toBe(true);
        // Over 90 seconds, all wrap boundaries repeat the conditioned join;
        // there is no scheduled replacement with a new texture at 16/24 s.
        for (let second = seconds; second < 90; second += seconds) {
          const boundary = second * sampleRate;
          const before = loop[(boundary - 1) % loop.length];
          const after = loop[boundary % loop.length];
          expect(Math.abs(after - before), `${name}@${second}s`).toBe(jump(loop));
        }
      });
    }
  }

  it('joins overlapping ramps without forcing the endpoints to silence', () => {
    const data = Float32Array.from({ length: 1000 }, (_, i) => 0.25 + Math.sin(i / 70) * 0.05);
    const loop = seamlessTextureLoop(data, 100);
    expect(loop[0]).toBeGreaterThan(0.1);
    expect(loop[loop.length - 1]).toBeGreaterThan(0.1);
    expect(jump(loop)).toBeLessThan(0.001);
    expect(rms(loop)).toBeCloseTo(rms(data), 6);
  });

  it('keeps exact loop periods at fractional-margin and high sample rates, with bounded finite peaks', () => {
    for (const sampleRate of [11025, 96000]) {
      const overlap = Math.round(sampleRate * 0.1);
      const source = renderNoise('brown', 8 + overlap / sampleRate, sampleRate);
      const loop = seamlessTextureLoop(source, overlap);
      expect(loop.length).toBe(8 * sampleRate);
      expect(rms(loop)).toBeCloseTo(1, 6);
      let sourcePeak = 0;
      let loopPeak = 0;
      let finite = true;
      for (const sample of source) sourcePeak = Math.max(sourcePeak, Math.abs(sample));
      for (const sample of loop) {
        finite = finite && Number.isFinite(sample);
        loopPeak = Math.max(loopPeak, Math.abs(sample));
      }
      expect(finite).toBe(true);
      // Equal-power mixing cannot make an arbitrary input peak unbounded.
      // This fixture's full-loop normalization also keeps its peak below
      // the conservative correlated two-input bound.
      expect(loopPeak).toBeLessThan(sourcePeak * Math.SQRT2);
    }
  });

  it('rejects invalid internal margins instead of allocating a malformed loop', () => {
    const data = new Float32Array(10);
    for (const overlap of [NaN, Infinity, -1, 0, 1, 2.5, 5, 20]) {
      expect(() => seamlessTextureLoop(data, overlap)).toThrow(RangeError);
    }
  });
});

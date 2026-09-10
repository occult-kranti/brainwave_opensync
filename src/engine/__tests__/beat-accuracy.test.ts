/**
 * README claim under test: "rendered beat frequency verified to <0.001 Hz".
 * The pure engine's phase accumulators are measured from the rendered audio
 * itself: every rising zero crossing is located with linear interpolation,
 * and the mean period over a 60 s render gives the tone frequency to well
 * below a millihertz. The beat is the difference of the two ear frequencies.
 */
import { describe, expect, it } from 'vitest';
import { renderBinaural } from '../synth';

function measureHz(x: Float32Array, sampleRate: number): number {
  const crossings: number[] = [];
  for (let i = 1; i < x.length; i++) {
    if (x[i - 1] < 0 && x[i] >= 0) {
      const frac = x[i - 1] / (x[i - 1] - x[i]); // linear interpolation between samples
      crossings.push(i - 1 + frac);
    }
  }
  const first = crossings[0];
  const last = crossings[crossings.length - 1];
  return ((crossings.length - 1) * sampleRate) / (last - first);
}

describe('rendered beat accuracy', () => {
  it('measures the binaural beat to better than 0.001 Hz over a 60 s render', () => {
    const sr = 48000;
    const r = renderBinaural({ durationSec: 60, carrierHz: 200, beatHz: 4, mode: 'binaural', gainDb: 0 }, sr);
    const fL = measureHz(r.left, sr);
    const fR = measureHz(r.right, sr);
    expect(Math.abs(fL - 200)).toBeLessThan(0.001);
    expect(Math.abs(fR - 204)).toBeLessThan(0.001);
    expect(Math.abs(fR - fL - 4)).toBeLessThan(0.001);
  });

  it('holds for a fractional beat and a high carrier', () => {
    const sr = 48000;
    const r = renderBinaural({ durationSec: 60, carrierHz: 432, beatHz: 7.83, mode: 'binaural', gainDb: 0 }, sr);
    expect(Math.abs(measureHz(r.right, sr) - measureHz(r.left, sr) - 7.83)).toBeLessThan(0.001);
  });
});

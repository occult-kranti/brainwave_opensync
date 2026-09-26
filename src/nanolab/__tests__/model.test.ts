// @ts-expect-error -- node types are deliberately excluded from the app tsconfig
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { DEFAULT_NANO_RECIPE, NANO_KINDS, exportNanoSignal, renderNanoSignal, validateNanoRecipe } from '../model';

// Independent float64 Fourier projection: no production FFT/window or predicted-line helper.
function component(samples: Float32Array, hz: number, square = false) {
  const n = 65536, offset = 10000; let re = 0, im = 0;
  for (let i = 0; i < n; i++) { const x = square ? samples[offset + i] ** 2 : samples[offset + i]; const a = 2 * Math.PI * hz * i / 48000; re += x * Math.cos(a); im -= x * Math.sin(a); }
  return 2 * Math.hypot(re, im) / n;
}
const recipe = { ...DEFAULT_NANO_RECIPE, carrierHz: 375, rateHz: 23.4375, durationSec: 2, gainDb: -24 };
describe('NanoLab independent signal verification', () => {
  it('rejects invalid allocations and parameters before synthesis', () => {
    for (const patch of [{ durationSec: 1e20 }, { durationSec: Infinity }, { durationSec: 0 }, { rateHz: NaN }, { rateHz: -1 }, { carrierHz: 24000 }, { gainDb: 0 }, { kind: 'unknown' }, { durationSec: '10' }]) expect(() => validateNanoRecipe({ ...recipe, ...patch })).toThrow();
    expect(() => validateNanoRecipe(null)).toThrow(); expect(() => validateNanoRecipe([])).toThrow();
    for (const kind of ['two-tone', 'baseband', 'carrier']) expect(validateNanoRecipe({ ...recipe, kind, carrierHz: 80, rateHz: 80 }).kind).toBe(kind);
    expect(() => validateNanoRecipe({ ...recipe, kind: 'am', carrierHz: 80, rateHz: 80 })).toThrow('positive');
  });
  it('is deterministic, diotic, edge-faded, bounded and finite at all allowed limits', () => {
    for (const kind of NANO_KINDS) {
      const sound = renderNanoSignal({ ...recipe, kind });
      expect(sound.left).toEqual(renderNanoSignal({ ...recipe, kind }).left); expect(sound.right).toEqual(sound.left);
      expect(sound.left.length).toBe(96000); expect(Math.abs(sound.left[0])).toBe(0); expect(Math.abs(sound.left.at(-1)!)).toBe(0);
      let peak = 0; for (const x of sound.left) { expect(Number.isFinite(x)).toBe(true); peak = Math.max(peak, Math.abs(x)); }
      expect(peak).toBeLessThanOrEqual(10 ** (-24 / 20) + 1e-8); expect(sound.samplePeak).toBe(peak);
      const quiet = renderNanoSignal({ ...recipe, kind, gainDb: -30 }); expect(component(quiet.left, kind === 'baseband' ? 23.4375 : kind === 'two-tone' ? 363.28125 : 375) / component(sound.left, kind === 'baseband' ? 23.4375 : kind === 'two-tone' ? 363.28125 : 375)).toBeCloseTo(10 ** (-6 / 20), 6);
    }
    const max = renderNanoSignal({ ...recipe, kind: 'am', durationSec: 30, carrierHz: 1000, rateHz: 80, gainDb: -18 });
    expect(max.left.length).toBe(1440000); expect(max.samplePeak).toBeLessThanOrEqual(10 ** (-18 / 20) + 1e-8);
  });
  it('separates beat envelope from baseband using independent Fourier projections', () => {
    const g = 10 ** (-24 / 20), two = renderNanoSignal({ ...recipe, kind: 'two-tone' });
    expect(component(two.left, 363.28125)).toBeCloseTo(g / 2, 7); expect(component(two.left, 386.71875)).toBeCloseTo(g / 2, 7);
    expect(component(two.left, 23.4375)).toBeLessThan(1e-8); expect(component(two.left, 375)).toBeLessThan(1e-8);
    // The nonlinear square has a difference-frequency component, the original sum does not.
    expect(component(two.left, 23.4375, true)).toBeCloseTo(g * g / 4, 8);
    const am = renderNanoSignal({ ...recipe, kind: 'am' });
    expect(component(am.left, 375)).toBeCloseTo(g / 2, 7);
    for (const f of [351.5625, 398.4375]) expect(component(am.left, f)).toBeCloseTo(g / 4, 7);
    expect(component(am.left, 23.4375)).toBeLessThan(1e-8);
    const base = renderNanoSignal({ ...recipe, kind: 'baseband' }), carrier = renderNanoSignal({ ...recipe, kind: 'carrier' });
    expect(component(base.left, 23.4375)).toBeCloseTo(g, 7); expect(component(base.left, 375)).toBeLessThan(1e-8);
    expect(component(carrier.left, 375)).toBeCloseTo(g, 7); expect(component(carrier.left, 23.4375)).toBeLessThan(1e-8);
    expect(two.spectrum.strongestBins.slice(0, 2).map(p => p.hz).sort((a, b) => a - b)).toEqual([363.28125, 386.71875]);
  });
  it('exports the measured signal with independently decoded PCM and verified checksum', async () => {
    const sound = renderNanoSignal({ ...recipe, kind: 'two-tone' }), { wav, manifest } = await exportNanoSignal(sound);
    const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength), json = JSON.parse(new TextDecoder().decode(manifest));
    expect(new TextDecoder().decode(wav.slice(0, 4))).toBe('RIFF'); expect(view.getUint16(20, true)).toBe(1); expect(view.getUint16(22, true)).toBe(2); expect(view.getUint32(24, true)).toBe(48000); expect(view.getUint16(34, true)).toBe(16);
    expect(wav.length).toBe(44 + sound.left.length * 4); expect(json.wavSha256).toBe(createHash('sha256').update(wav).digest('hex')); expect(json.physicalCalibration).toBeNull();
    const decoded = new Float32Array(sound.left.length);
    for (let i = 0; i < decoded.length; i++) { const l = view.getInt16(44 + i * 4, true), r = view.getInt16(46 + i * 4, true); expect(l).toBe(r); decoded[i] = l / 32768; }
    let maxError = 0; for (let i = 0; i < decoded.length; i++) maxError = Math.max(maxError, Math.abs(decoded[i] - sound.left[i]));
    expect(maxError).toBeLessThan(2 / 32768); expect(component(decoded, 23.4375)).toBeLessThan(1e-6);
    expect(component(decoded, 363.28125)).toBeCloseTo(10 ** (-24 / 20) / 2, 4);
  });
  it('retains existing components that happen to coincide with the selected rate', () => {
    const g = 10 ** (-24 / 20);
    // Use a one-second integer-cycle projection for the reviewer-provided examples.
    const project = (samples: Float32Array, hz: number) => { let re = 0, im = 0; for (let i = 0; i < 48000; i++) { const a = 2 * Math.PI * hz * i / 48000; re += samples[12000 + i] * Math.cos(a); im += samples[12000 + i] * Math.sin(a); } return 2 * Math.hypot(re, im) / 48000; };
    const two = renderNanoSignal({ ...recipe, kind: 'two-tone', carrierHz: 90, rateHz: 60 });
    expect(project(two.left, 60)).toBeCloseTo(g / 2, 7); expect(two.predictedLines.some(line => line.hz === 60)).toBe(true);
    const am = renderNanoSignal({ ...recipe, kind: 'am', carrierHz: 80, rateHz: 40 });
    expect(project(am.left, 40)).toBeCloseTo(g / 4, 7); expect(am.predictedLines.some(line => line.hz === 40)).toBe(true);
  });
});

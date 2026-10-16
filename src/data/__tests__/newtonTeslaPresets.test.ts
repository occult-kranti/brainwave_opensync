import { describe, expect, it } from 'vitest';
import { renderSession } from '@/engine';
import { findBannedPhrases } from '@/docs/vocabulary';
import { presetPreviewPhases } from '@/ui/session/sessionMath';
import { CLEAN_PRESET_MIX, sanitizePresetMix } from '../presetMix';
import { NEWTON_TESLA_PRESETS } from '../newtonTeslaPresets';

const get = (suffix: string) => NEWTON_TESLA_PRESETS.find((item) => item.id === `nt-${suffix}`)!;

/** Exact-bin projection for these two-second, integer/half-integer test tones. */
function spectralAmplitude(samples: Float32Array, hz: number, sampleRate: number): number {
  let cosine = 0;
  let sine = 0;
  for (let index = 0; index < samples.length; index++) {
    const angle = 2 * Math.PI * hz * index / sampleRate;
    cosine += samples[index] * Math.cos(angle);
    sine += samples[index] * Math.sin(angle);
  }
  return 2 * Math.hypot(cosine, sine) / samples.length;
}

describe('Newton–Tesla acoustic comparison recipes', () => {
  it('provides exactly four complete, quiet, bounded original experimental recipes', () => {
    expect(NEWTON_TESLA_PRESETS).toHaveLength(4);
    expect(new Set(NEWTON_TESLA_PRESETS.map((item) => item.id)).size).toBe(4);
    for (const item of NEWTON_TESLA_PRESETS) {
      expect(item.id).toMatch(/^nt-/);
      expect(item.grade).toBe('D');
      expect(item.category).toBe('Experimental');
      expect(item.title).toContain('experimental tier');
      expect(item.rationale).toContain('Original audio illustration; listening benefits are unvalidated.');
      expect(findBannedPhrases([item.title, item.purpose, item.rationale, ...item.citations].join(' '))).toEqual([]);
      expect(item.citations.length).toBeGreaterThan(0);
      item.citations.forEach((url) => expect(new URL(url).protocol).toBe('https:'));
      expect(item.spec.autoShutoff).toBe(true);
      const duration = item.spec.phases.reduce((sum, step) => sum + step.durationSec, 0) / 60;
      expect(duration).toBeGreaterThanOrEqual(5);
      expect(duration).toBeLessThanOrEqual(6);
      expect(item.spec.limitMin).toBe(duration);
      expect(item.spec.mix).toEqual({ ...CLEAN_PRESET_MIX, volumeDb: -28 });
      expect(sanitizePresetMix(item.spec.mix)).toEqual(item.spec.mix);
      for (const step of item.spec.phases) {
        for (const value of [step.carrierHz, step.durationSec, step.beatHz, step.gainDbFs, step.rampSec]) expect(Number.isFinite(value)).toBe(true);
        expect(step.carrierHz).toBeGreaterThanOrEqual(100);
        expect(step.carrierHz + step.beatHz).toBeLessThanOrEqual(1000);
        expect(step.beatHz).toBeGreaterThanOrEqual(0);
        expect(step.beatHz).toBeLessThanOrEqual(30);
        expect(step.gainDbFs).toBeLessThanOrEqual(-26);
        expect(step.mode).toBe('binaural');
        expect(step.rampSec).toBeGreaterThan(0);
        expect(step.rampSec).toBeLessThan(step.durationSec);
      }
    }
  });

  it('renders the declared separate-channel frequencies without an extra low-frequency tone', () => {
    const sampleRate = 8000;
    for (const suffix of ['phase-drift', 'detuning-3']) {
      const item = get(suffix);
      const step = item.spec.phases[0];
      const audio = renderSession({ sampleRate, phases: presetPreviewPhases(item, 2) });
      const gain = 10 ** (step.gainDbFs / 20);
      expect(spectralAmplitude(audio.left, step.carrierHz, sampleRate)).toBeCloseTo(gain, 6);
      expect(spectralAmplitude(audio.right, step.carrierHz + step.beatHz, sampleRate)).toBeCloseTo(gain, 6);
      expect(spectralAmplitude(audio.left, step.carrierHz + step.beatHz, sampleRate)).toBeLessThan(1e-6);
      expect(spectralAmplitude(audio.right, step.carrierHz, sampleRate)).toBeLessThan(1e-6);
      expect(spectralAmplitude(audio.right, step.beatHz, sampleRate)).toBeLessThan(1e-6);
    }
    expect(get('phase-drift').rationale).toContain('does not set an initial phase offset');
  });

  it('matches comparison controls and preserves both mathematically distinct tuning systems', () => {
    const slow = get('phase-drift');
    const faster = get('detuning-3');
    expect(slow.spec.mix).toEqual(faster.spec.mix);
    expect(slow.spec.phases[0].carrierHz).toBe(faster.spec.phases[0].carrierHz);
    expect(slow.spec.limitMin).toBe(faster.spec.limitMin);
    const ratios = get('ratio-steps');
    const tempered = get('tempered-steps');
    expect(ratios.spec.mix).toEqual(tempered.spec.mix);
    expect(ratios.spec.phases.map((step) => step.durationSec)).toEqual(tempered.spec.phases.map((step) => step.durationSec));
    expect(ratios.spec.phases.map((step) => step.carrierHz)).toEqual([320, 384, 512, 256]);
    expect(tempered.spec.phases[0].carrierHz).toBeCloseTo(322.539789, 5);
    expect(tempered.spec.phases[1].carrierHz).toBeCloseTo(383.566611, 5);
    expect(tempered.spec.phases.slice(2).map((step) => step.carrierHz)).toEqual([512, 256]);
    for (const item of [ratios, tempered]) expect(item.spec.phases.every((step) => step.beatHz === 0)).toBe(true);
  });

  it('renders reproducibly with finite quiet samples and four distinct short previews', () => {
    const fingerprints = new Set<string>();
    for (const item of NEWTON_TESLA_PRESETS) {
      const spec = { sampleRate: 8000, phases: presetPreviewPhases(item, 2) };
      const audio = renderSession(spec);
      const repeated = renderSession(spec);
      expect(audio.left).toEqual(repeated.left);
      expect(audio.right).toEqual(repeated.right);
      expect(audio.warnings).toEqual([]);
      expect(audio.left.every(Number.isFinite)).toBe(true);
      expect(audio.right.every(Number.isFinite)).toBe(true);
      expect(audio.manifest.peak).toBeGreaterThan(0.001);
      expect(audio.manifest.peak).toBeLessThan(0.05);
      fingerprints.add(JSON.stringify([Array.from(audio.left.slice(0, 256)), Array.from(audio.right.slice(0, 256))]));
      if (item.spec.phases[0].beatHz === 0) expect(audio.left).toEqual(audio.right);
    }
    expect(fingerprints.size).toBe(4);
  });
});

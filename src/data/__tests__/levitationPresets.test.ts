import { describe, expect, it } from 'vitest';
import { encodeWav, renderSession } from '@/engine';
import { findBannedPhrases } from '@/docs/vocabulary';
import { presetPreviewPhases } from '@/ui/session/sessionMath';
import { CLEAN_PRESET_MIX, sanitizePresetMix } from '../presetMix';
import { LEVITATION_PRESETS } from '../levitationPresets';
import { SOUND_RESEARCH_PRESETS } from '../soundResearchPresets';
import { NEWTON_TESLA_PRESETS } from '../newtonTeslaPresets';

const get = (suffix: string) => LEVITATION_PRESETS.find((item) => item.id === `levitation-${suffix}`)!;

/** Fourier projection: four seconds resolves the quarter-Hz detuning exactly. */
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

describe('levitation-lab listening companions', () => {
  it('provides four original, bounded experimental recipes with a complete quiet mixer', () => {
    expect(LEVITATION_PRESETS).toHaveLength(4);
    const previousIds = new Set([...SOUND_RESEARCH_PRESETS, ...NEWTON_TESLA_PRESETS].map((item) => item.id));
    expect(new Set(LEVITATION_PRESETS.map((item) => item.id)).size).toBe(4);
    for (const item of LEVITATION_PRESETS) {
      expect(item.id).toMatch(/^levitation-/);
      expect(previousIds.has(item.id)).toBe(false);
      expect(item.grade).toBe('D');
      expect(item.category).toBe('Experimental');
      expect(item.title).toContain('experimental tier');
      expect(item.rationale).toContain('Original listening comparison; benefits are unvalidated.');
      expect(item.rationale).toContain('do not reproduce an acoustic trap or levitate objects');
      expect(findBannedPhrases([item.title, item.purpose, item.rationale, ...item.citations].join(' '))).toEqual([]);
      expect(item.citations.length).toBeGreaterThan(0);
      item.citations.forEach((url) => expect(new URL(url).protocol).toBe('https:'));
      expect(item.spec.autoShutoff).toBe(true);
      const minutes = item.spec.phases.reduce((sum, step) => sum + step.durationSec, 0) / 60;
      expect(minutes).toBeGreaterThanOrEqual(5);
      expect(minutes).toBeLessThanOrEqual(6);
      expect(item.spec.limitMin).toBe(minutes);
      expect(item.spec.mix).toEqual({ ...CLEAN_PRESET_MIX, volumeDb: -30 });
      expect(sanitizePresetMix(item.spec.mix)).toEqual(item.spec.mix);
      for (const step of item.spec.phases) {
        for (const value of [step.carrierHz, step.beatHz, step.gainDbFs, step.durationSec, step.rampSec]) expect(Number.isFinite(value)).toBe(true);
        expect(step.carrierHz).toBeGreaterThanOrEqual(100);
        expect(step.carrierHz + step.beatHz).toBeLessThanOrEqual(1000);
        expect(step.beatHz).toBeGreaterThanOrEqual(0);
        expect(step.beatHz).toBeLessThanOrEqual(1);
        expect(step.gainDbFs).toBe(-30);
        expect(step.mode).toBe('binaural');
        expect(step.rampSec).toBeGreaterThan(0);
        expect(step.rampSec).toBeLessThan(step.durationSec);
      }
    }
  });

  it('changes only the right-channel tone in the reference/detuning pair, with no low-frequency line', () => {
    const reference = get('frequency-reference');
    const detuned = get('phase-drift');
    const a = reference.spec.phases[0];
    const b = detuned.spec.phases[0];
    expect(reference.spec.mix).toEqual(detuned.spec.mix);
    expect([a.carrierHz, a.gainDbFs, a.durationSec, a.mode, a.rampSec]).toEqual([b.carrierHz, b.gainDbFs, b.durationSec, b.mode, b.rampSec]);
    expect(a.beatHz).toBe(0);
    expect(b.beatHz).toBe(0.75);
    const sampleRate = 8000;
    const controlAudio = renderSession({ sampleRate, phases: presetPreviewPhases(reference, 4) });
    const detunedAudio = renderSession({ sampleRate, phases: presetPreviewPhases(detuned, 4) });
    expect(controlAudio.left).toEqual(controlAudio.right);
    expect(controlAudio.left).toEqual(detunedAudio.left);
    const gain = 10 ** (-30 / 20);
    expect(spectralAmplitude(detunedAudio.left, 340, sampleRate)).toBeCloseTo(gain, 6);
    expect(spectralAmplitude(detunedAudio.right, 340.75, sampleRate)).toBeCloseTo(gain, 6);
    expect(spectralAmplitude(detunedAudio.right, 340, sampleRate)).toBeLessThan(1e-6);
    expect(spectralAmplitude(detunedAudio.left, 340.75, sampleRate)).toBeLessThan(1e-6);
    expect(spectralAmplitude(detunedAudio.right, 0.75, sampleRate)).toBeLessThan(1e-6);
    expect(detuned.rationale).toContain('does not set an initial phase offset');
  });

  it('reverses sequence order while matching frequency exposure, gain and both output channels', () => {
    const ascending = get('wavelength-ascent');
    const descending = get('wavelength-descent');
    expect(ascending.spec.mix).toEqual(descending.spec.mix);
    expect(ascending.spec.phases.map((step) => step.carrierHz)).toEqual([225, 450, 675, 900]);
    expect(descending.spec.phases).toEqual([...ascending.spec.phases].reverse());
    for (const step of ascending.spec.phases) {
      expect(step.durationSec).toBe(90);
      expect(step.beatHz).toBe(0);
      const singlePhase = { ...ascending, spec: { ...ascending.spec, phases: [step] } };
      const audio = renderSession({ sampleRate: 8000, phases: presetPreviewPhases(singlePhase, 1) });
      expect(audio.left).toEqual(audio.right);
      expect(spectralAmplitude(audio.left, step.carrierHz, 8000)).toBeCloseTo(10 ** (-30 / 20), 6);
    }
  });

  it('produces four distinct deterministic finite short buffers and quiet PCM16 WAVs', () => {
    const fingerprints = new Set<string>();
    for (const item of LEVITATION_PRESETS) {
      const spec = { sampleRate: 12000, phases: presetPreviewPhases(item, 2) };
      const audio = renderSession(spec);
      const repeated = renderSession(spec);
      expect(audio.left).toEqual(repeated.left);
      expect(audio.right).toEqual(repeated.right);
      expect(audio.warnings).toEqual([]);
      expect(audio.left.every(Number.isFinite)).toBe(true);
      expect(audio.right.every(Number.isFinite)).toBe(true);
      expect(audio.manifest.peak).toBeGreaterThan(0.01);
      expect(audio.manifest.peak).toBeLessThan(0.032);
      fingerprints.add(JSON.stringify([Array.from(audio.left.slice(0, 256)), Array.from(audio.right.slice(0, 256))]));
      const wav = encodeWav(audio.left, audio.right, 12000, 'pcm16');
      const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
      expect(wav.byteLength).toBe(96044);
      expect(view.getUint16(22, true)).toBe(2);
      expect(view.getUint32(24, true)).toBe(12000);
      expect(view.getUint16(34, true)).toBe(16);
      let pcmPeak = 0;
      for (let offset = 44; offset < wav.length; offset += 2) pcmPeak = Math.max(pcmPeak, Math.abs(view.getInt16(offset, true)));
      expect(pcmPeak).toBeGreaterThan(100);
      expect(pcmPeak).toBeLessThanOrEqual(1037);
    }
    expect(fingerprints.size).toBe(4);
  });
});

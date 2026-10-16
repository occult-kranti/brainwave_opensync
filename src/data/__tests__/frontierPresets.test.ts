import { describe, expect, it } from 'vitest';
import { renderSession, checkPhaseGuardrails } from '@/engine';
import { findBannedPhrases } from '@/docs/vocabulary';
import { presetPreviewPhases } from '@/ui/session/sessionMath';
import { CLEAN_PRESET_MIX, sanitizePresetMix } from '../presetMix';
import { BASHAR_STUDY_PRESETS, FREQUENCY_STUDY_PRESETS, FRONTIER_PRESETS } from '../frontierPresets';
import { RUNTIME_PREVIEW_CATALOG } from '../runtimePreviewCatalog';
import { BASHAR_PRESETS } from '@/channeled/bashar';
import { LEVITATION_PRESETS } from '../levitationPresets';

const get = (id: string) => FRONTIER_PRESETS.find(item => item.id === id)!;
function spectralAmplitude(samples: Float32Array, hz: number, sampleRate: number): number {
  let cosine = 0, sine = 0;
  for (let i = 0; i < samples.length; i++) {
    const angle = 2 * Math.PI * hz * i / sampleRate;
    cosine += samples[i] * Math.cos(angle); sine += samples[i] * Math.sin(angle);
  }
  return 2 * Math.hypot(cosine, sine) / samples.length;
}

describe('frontier listening comparisons', () => {
  it('provides eight original quiet experimental recipes with explicit source and playback limits', () => {
    expect(BASHAR_STUDY_PRESETS).toHaveLength(4);
    expect(FREQUENCY_STUDY_PRESETS).toHaveLength(4);
    expect(new Set(FRONTIER_PRESETS.map(p => p.id)).size).toBe(8);
    const oldSpecs = new Set([...BASHAR_PRESETS, ...LEVITATION_PRESETS].map(p => JSON.stringify(p.spec)));
    for (const p of FRONTIER_PRESETS) {
      expect(p.id).toMatch(/^(bashar-study-|frequency-study-)/);
      expect(p.category).toBe('Experimental'); expect(p.grade).toBe('D');
      expect(p.title).toContain('experimental tier');
      expect(p.rationale).toContain('benefits are unvalidated');
      expect(p.rationale).toContain('app choices');
      expect(p.purpose!.length).toBeGreaterThan(50);
      expect(oldSpecs.has(JSON.stringify(p.spec))).toBe(false);
      expect(p.spec.autoShutoff).toBe(true);
      expect(p.spec.mix).toEqual({ ...CLEAN_PRESET_MIX, volumeDb: -30 });
      expect(sanitizePresetMix(p.spec.mix)).toEqual(p.spec.mix);
      expect(p.spec.phases.reduce((sum, step) => sum + step.durationSec, 0)).toBe(p.spec.limitMin! * 60);
      expect(p.spec.limitMin).toBe(p.id.startsWith('bashar-') ? 6 : 5);
      expect(findBannedPhrases([p.title, p.purpose, p.rationale, ...p.citations].join(' '))).toEqual([]);
      p.citations.forEach(url => expect(new URL(url).protocol).toBe('https:'));
      for (const phase of p.spec.phases) {
        expect([phase.carrierHz, phase.beatHz, phase.gainDbFs, phase.durationSec, phase.rampSec].every(Number.isFinite)).toBe(true);
        expect(phase.mode).toBe('binaural'); expect(phase.gainDbFs).toBe(-30);
        expect(phase.carrierHz).toBeGreaterThanOrEqual(200);
        expect(phase.carrierHz + phase.beatHz).toBeLessThanOrEqual(500);
        expect(phase.beatHz).toBeGreaterThanOrEqual(0); expect(phase.beatHz).toBeLessThanOrEqual(5);
        expect(phase.rampSec).toBeGreaterThan(0); expect(phase.rampSec!).toBeLessThan(phase.durationSec);
      }
    }
    for (const p of BASHAR_STUDY_PRESETS) {
      expect(p.rationale).toContain('does not prescribe these pitches');
      expect(p.rationale).toContain('without source endorsement');
    }
  });

  it('holds timing and gain fixed in channel-offset and first-interval comparisons', () => {
    const matched = get('bashar-study-matched-steps'), offset = get('bashar-study-offset-steps');
    expect(matched.spec.phases.map(p => p.carrierHz / 248)).toEqual([1, 1.25, 1.5, 2]);
    for (let i = 0; i < matched.spec.phases.length; i++) {
      const a = matched.spec.phases[i], b = offset.spec.phases[i];
      expect({ ...a, name: '', beatHz: 2 }).toEqual({ ...b, name: '' });
      expect(a.beatHz).toBe(0);
    }
    const fifth = get('bashar-study-fifth-return'), octave = get('bashar-study-octave-return');
    expect(fifth.spec.phases.slice(1)).toEqual(octave.spec.phases.slice(1));
    expect(fifth.spec.phases[0].carrierHz / 248).toBe(1.5);
    expect(octave.spec.phases[0].carrierHz / 248).toBe(2);
    expect(fifth.spec.phases.map(p => p.durationSec)).toEqual(octave.spec.phases.map(p => p.durationSec));
  });

  it('renders the phase comparison as two isolated lines with the intended 0.8-second drift period', () => {
    const reference = get('frequency-study-phase-reference'), drift = get('frequency-study-phase-drift');
    const spec = (p: typeof reference) => ({ sampleRate: 8000, phases: presetPreviewPhases(p, 4) });
    const a = renderSession(spec(reference)), b = renderSession(spec(drift));
    expect(a.left).toEqual(a.right); expect(a.left).toEqual(b.left);
    expect(1 / drift.spec.phases[0].beatHz).toBe(0.8);
    expect(spectralAmplitude(b.left, 312, 8000)).toBeCloseTo(10 ** (-30 / 20), 6);
    expect(spectralAmplitude(b.right, 313.25, 8000)).toBeCloseTo(10 ** (-30 / 20), 6);
    expect(spectralAmplitude(b.right, 312, 8000)).toBeLessThan(1e-6);
    expect(spectralAmplitude(b.left, 1.25, 8000)).toBeLessThan(1e-6);
  });

  it('keeps the sideband illustration distinct from AM and the alias reference distinct from undersampling', () => {
    const pair = get('frequency-study-sideband-pair'), reference = get('frequency-study-alias-proxy');
    const a = renderSession({ sampleRate: 8000, phases: presetPreviewPhases(pair, 1) });
    const b = renderSession({ sampleRate: 8000, phases: presetPreviewPhases(reference, 1) });
    expect(a.left).toEqual(b.left); expect(b.left).toEqual(b.right);
    expect(spectralAmplitude(a.left, 288, 8000)).toBeCloseTo(10 ** (-30 / 20), 6);
    expect(spectralAmplitude(a.right, 293, 8000)).toBeCloseTo(10 ** (-30 / 20), 6);
    for (const channel of [a.left, a.right]) {
      expect(spectralAmplitude(channel, 283, 8000)).toBeLessThan(1e-6);
      expect(spectralAmplitude(channel, 5, 8000)).toBeLessThan(1e-6);
    }
    expect(pair.rationale).toContain('not AM playback');
    expect(reference.rationale).toContain('never generates 7,712 Hz');
    for (let n = 0; n < 128; n++) {
      expect(Math.sin(2 * Math.PI * 7712 * n / 8000)).toBeCloseTo(-Math.sin(2 * Math.PI * 288 * n / 8000), 10);
    }
  });

  it('renders all eight declared runtime previews deterministically within the 10-second quiet contract', () => {
    const fingerprints = new Set<string>();
    for (const entry of RUNTIME_PREVIEW_CATALOG) {
      const phases = presetPreviewPhases(get(entry.id));
      expect(phases.reduce((sum, p) => sum + p.durationSec, 0)).toBe(entry.maxSeconds);
      phases.forEach(p => expect(checkPhaseGuardrails(p, entry.sampleRate)).toEqual([]));
      const spec = { sampleRate: entry.sampleRate, phases, crossfadeSec: 0.5, masterGainDb: -6 };
      const audio = renderSession(spec), repeated = renderSession(spec);
      expect(audio.left.length).toBe(entry.sampleRate * entry.maxSeconds);
      expect(audio.left.every((value, index) => value === repeated.left[index])).toBe(true);
      expect(audio.right.every((value, index) => value === repeated.right[index])).toBe(true);
      expect(audio.left.every(Number.isFinite)).toBe(true); expect(audio.right.every(Number.isFinite)).toBe(true);
      expect(audio.warnings).toEqual([]);
      expect(audio.manifest.peak).toBeGreaterThan(0.01); expect(audio.manifest.peak).toBeLessThan(0.016);
      fingerprints.add(JSON.stringify([Array.from(audio.left.slice(0, 256)), Array.from(audio.right.slice(0, 256))]));
    }
    expect(fingerprints.size).toBe(8);
  });
});

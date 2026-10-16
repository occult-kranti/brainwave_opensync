// @ts-expect-error -- node types excluded from tsconfig.app on purpose
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { BOWL_RESTRIKE_CHOICES, renderSession } from '@/engine';
import { findBannedPhrases } from '@/docs/vocabulary';
import { presetPreviewPhases } from '@/ui/session/sessionMath';
import { sanitizePresetMix } from '../presetMix';
import { SOUND_RESEARCH_PRESETS } from '../soundResearchPresets';

const get = (suffix: string) => SOUND_RESEARCH_PRESETS.find((item) => item.id === `research-${suffix}`)!;

describe('sound research listening recipes', () => {
  it('provides twelve original, bounded experimental designs with source links', () => {
    expect(SOUND_RESEARCH_PRESETS).toHaveLength(12);
    expect(new Set(SOUND_RESEARCH_PRESETS.map((item) => item.id)).size).toBe(12);
    for (const item of SOUND_RESEARCH_PRESETS) {
      expect(item.id).toMatch(/^research-/);
      expect(item.category).toBe('Experimental');
      expect(item.grade).toBe('D');
      expect(item.title).toContain('experimental tier');
      expect(item.rationale).toContain('Original listening design; benefits are unvalidated.');
      expect(item.purpose?.length).toBeGreaterThan(20);
      expect(item.citations.length).toBeGreaterThan(0);
      item.citations.forEach((citation) => expect(new URL(citation).protocol).toBe('https:'));
      expect(findBannedPhrases([item.title, item.purpose, item.rationale, ...item.citations].join(' '))).toEqual([]);
      expect(item.spec.autoShutoff).toBe(true);
      const durationMin = item.spec.phases.reduce((sum, phase) => sum + phase.durationSec, 0) / 60;
      expect(durationMin).toBeGreaterThanOrEqual(5);
      expect(durationMin).toBeLessThanOrEqual(12);
      expect(item.spec.limitMin).toBe(durationMin);
      for (const phase of item.spec.phases) {
        for (const value of [phase.durationSec, phase.carrierHz, phase.beatHz, phase.gainDbFs, phase.rampSec]) {
          expect(Number.isFinite(value), item.id).toBe(true);
        }
        expect(phase.durationSec).toBeGreaterThan(0);
        expect(phase.carrierHz).toBeGreaterThanOrEqual(100);
        expect(phase.carrierHz).toBeLessThanOrEqual(1000);
        expect(phase.beatHz).toBeGreaterThanOrEqual(0);
        expect(phase.beatHz).toBeLessThanOrEqual(30);
        expect(phase.gainDbFs).toBeLessThanOrEqual(-24);
        expect(phase.rampSec).toBeGreaterThan(0);
        expect(phase.rampSec).toBeLessThan(phase.durationSec);
      }
    }
  });

  it('fully replaces prior layers and survives mixer sanitization without changing its sound', () => {
    for (const item of SOUND_RESEARCH_PRESETS) {
      const mix = item.spec.mix!;
      expect(sanitizePresetMix(mix), item.id).toEqual(mix);
      expect(mix.waveform).toBe('sine');
      expect(mix.volumeDb).toBeLessThanOrEqual(-26);
      expect(mix.layersOn).toBe(true);
      expect(mix.bellEveryMin).toBe(0);
      expect(mix.noiseOn).toBe(Object.keys(mix.noiseDb).length > 0);
      for (const db of Object.values(mix.noiseDb)) {
        expect(Number.isFinite(db)).toBe(true);
        expect(db).toBeLessThanOrEqual(-24);
      }
      expect(Number.isFinite(mix.nature.db)).toBe(true);
      expect(mix.nature.db).toBeLessThanOrEqual(-24);
      for (const bowl of mix.bowls) {
        expect(bowl.on).toBe(true);
        expect(bowl.lock).toBe(false);
        expect(Number.isFinite(bowl.baseHz)).toBe(true);
        expect(bowl.baseHz).toBeGreaterThan(0);
        expect(bowl.baseHz).toBeLessThanOrEqual(1000);
        expect(bowl.db).toBeLessThanOrEqual(-24);
        expect(BOWL_RESTRIKE_CHOICES).toContain(bowl.restrikeSec);
        expect(bowl.pan).toBeGreaterThanOrEqual(-1);
        expect(bowl.pan).toBeLessThanOrEqual(1);
      }
    }
  });

  it('matches stereo comparison settings and distinguishes offline AM from the binaural pair', () => {
    const control = get('carrier-control');
    for (const id of ['stereo-6', 'stereo-10', 'monaural-6']) {
      const comparison = get(id);
      expect(comparison.spec.mix).toEqual(control.spec.mix);
      expect(comparison.spec.limitMin).toBe(control.spec.limitMin);
      expect(comparison.spec.phases[0].carrierHz).toBe(control.spec.phases[0].carrierHz);
      expect(comparison.spec.phases[0].gainDbFs).toBe(control.spec.phases[0].gainDbFs);
    }
    expect(control.spec.phases[0].beatHz).toBe(0);
    const stereo = renderSession({ sampleRate: 8000, phases: presetPreviewPhases(get('stereo-6'), 1) });
    const mono = renderSession({ sampleRate: 8000, phases: presetPreviewPhases(get('monaural-6'), 1) });
    expect(mono.left).toEqual(mono.right);
    expect(stereo.left).not.toEqual(stereo.right);
    expect(stereo.left).not.toEqual(mono.left);
  });

  it('discloses the existing live two-tone versus preview/export sine-AM variants', () => {
    for (const suffix of ['monaural-6', 'slow-pulse']) {
      const item = get(suffix);
      expect(item.purpose).toContain('Preview/export:');
      expect(item.purpose).toContain('sine AM');
      expect(item.purpose).toContain('Live Studio:');
      expect(item.rationale).toContain('cosine beat envelope');
      expect(item.rationale).toContain('differ');
    }
    expect(get('monaural-6').rationale).toContain('214/226 Hz sidebands');
    expect(get('monaural-6').rationale).toContain('220 and 226 Hz tones');
    expect(get('slow-pulse').purpose).toContain('180 and 180.125 Hz');
  });

  it('retains authored texture layers in the preview adapter', () => {
    for (const color of ['pink', 'brown'] as const) {
      const item = get(`${color}-bed`);
      expect(item.purpose).toContain('audible 180 Hz');
      const [phase] = presetPreviewPhases(item, 1);
      expect(phase.carrierHz).toBe(180);
      expect(phase.beatHz).toBe(0);
      expect(phase.noise?.color).toBe(color);
      expect(phase.noise?.level).toBeGreaterThan(0);
    }
    expect(presetPreviewPhases(get('bowl-trio'), 1)[0].bowls).toHaveLength(3);
    expect(presetPreviewPhases(get('rain-bowl'), 1)[0].nature?.kind).toBe('rain');
  });

  it('renders twelve distinct, finite, non-silent quiet sounds through the existing adapter', () => {
    const hashes = new Set<string>();
    for (const item of SOUND_RESEARCH_PRESETS) {
      // Cover every phase without allocating a full-length listening session.
      const compressed = { ...item, spec: { ...item.spec, phases: item.spec.phases.map((phase) => ({ ...phase, durationSec: 0.5 })) } };
      const rendered = renderSession({ sampleRate: 8000, crossfadeSec: 0.02, phases: presetPreviewPhases(compressed, 10) });
      expect(rendered.warnings, item.id).toEqual([]);
      expect(rendered.manifest.peak, item.id).toBeGreaterThan(0.001);
      expect(rendered.manifest.peak, item.id).toBeLessThan(0.1);
      expect(rendered.left.every(Number.isFinite), item.id).toBe(true);
      expect(rendered.right.every(Number.isFinite), item.id).toBe(true);
      const hash = createHash('sha256').update(new Uint8Array(rendered.left.buffer)).update(new Uint8Array(rendered.right.buffer)).digest('hex');
      hashes.add(hash);
    }
    expect(hashes.size).toBe(12);
  });
});

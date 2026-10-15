import { describe, expect, it } from 'vitest';
import { suggestSessions, needsHeadphones, type SessionPreferences } from '../sessionSuggestions';
import { PRACTICE_GOALS, PRACTICE_PRESETS } from '../listeningPractice';
import { ARCHIVE_PRESETS, ARCHIVE_SOURCES } from '../archivePractice';
import { PRESETS, type Preset } from '../presets';
import { presetPreviewPhases } from '@/ui/session/sessionMath';
import { renderSession } from '@/engine';

const prefs: SessionPreferences = { goal: 'unwind', minutes: 5, headphones: false, experimental: false };
describe('session suggestions', () => {
  it('finds adult, nonexperimental speaker options for every intention and respects the requested time', () => {
    for (const goal of PRACTICE_GOALS) {
      const matches = suggestSessions({ ...prefs, goal: goal.id });
      expect(matches.length, goal.id).toBeGreaterThan(0);
      for (const { preset, minutes } of matches) {
        expect(preset.category).not.toBe('Infant');
        expect(preset.category).not.toBe('Experimental');
        expect(preset.grade).not.toBe('D');
        expect(needsHeadphones(preset)).toBe(false);
        expect(minutes).toBeLessThanOrEqual(5);
      }
    }
  });
  it('requires both headphones and experimental opt-in for a binaural archive recipe', () => {
    const catalog = [ARCHIVE_PRESETS.find((p) => p.id === 'archive-gateway-inspired')!];
    const p = { ...prefs, goal: 'dream' as const, minutes: 15 };
    expect(suggestSessions(p, catalog)).toEqual([]);
    expect(suggestSessions({ ...p, experimental: true }, catalog)).toEqual([]);
    expect(suggestSessions({ ...p, headphones: true }, catalog)).toEqual([]);
    expect(suggestSessions({ ...p, experimental: true, headphones: true }, catalog)[0].preset).toBe(catalog[0]);
  });
  it('matches pre-existing catalog entries, not only the new handpicked sounds', () => {
    const old = PRESETS.filter((p) => !p.id.startsWith('practice-') && !p.id.startsWith('archive-'));
    expect(suggestSessions({ ...prefs, headphones: true, minutes: 30 }, old).length).toBeGreaterThan(0);
  });
  it('excludes infant sessions even with opt-in and hides adult recommendations in infant mode', () => {
    expect(suggestSessions({ ...prefs, infantMode: true })).toEqual([]);
    expect(suggestSessions({ ...prefs, experimental: true, headphones: true }, PRESETS.filter((p) => p.category === 'Infant'))).toEqual([]);
    expect(suggestSessions({ ...prefs, minutes: NaN })).toEqual([]);
    expect(suggestSessions({ ...prefs, minutes: 0 })).toEqual([]);
  });
  it('is deterministic and marks a time-limited session as shortened', () => {
    const catalog = [PRACTICE_PRESETS.find((p) => p.id === 'practice-evening-rain')!];
    const result = suggestSessions({ ...prefs, goal: 'sleep' }, catalog);
    expect(result[0]).toMatchObject({ minutes: 5, shortened: true });
    expect(result).toEqual(suggestSessions({ ...prefs, goal: 'sleep' }, catalog));
  });
});

describe('new listening designs', () => {
  const all = [...PRACTICE_PRESETS, ...ARCHIVE_PRESETS];
  it.each(all.map((p): [string, Preset] => [p.id, p]))('%s renders bounded, finite, non-silent stereo audio', (_, preset) => {
    const phases = presetPreviewPhases(preset, 1);
    const { left, right } = renderSession({ phases, sampleRate: 8000, masterGainDb: -6, crossfadeSec: 0.1 });
    expect(left.length).toBeGreaterThan(0);
    let peak = 0;
    for (const channel of [left, right]) for (const sample of channel) {
      expect(Number.isFinite(sample)).toBe(true);
      peak = Math.max(peak, Math.abs(sample));
    }
    expect(peak).toBeGreaterThan(0.00001);
    expect(peak).toBeLessThan(0.2);
    expect(preset.spec.autoShutoff).toBe(true);
    expect(preset.spec.phases.length).toBeLessThanOrEqual(8);
  });
  it('keeps archive experiments explicitly speculative and traceable to inspected or qualified sources', () => {
    for (const preset of ARCHIVE_PRESETS) {
      expect(preset.grade).toBe('D');
      expect(preset.category).toBe('Experimental');
      expect(preset.title).toContain('experimental tier');
      expect(ARCHIVE_SOURCES.some((s) => s.preset === preset.id)).toBe(true);
      expect(preset.citations.length).toBeGreaterThan(0);
    }
    expect(ARCHIVE_SOURCES.find((s) => s.id === 'china-2026')?.kind).toContain('protocol');
    expect(ARCHIVE_SOURCES.find((s) => s.id === 'russia-2026')?.access).toContain('Author-uploaded');
  });
});

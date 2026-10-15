import { describe, expect, it } from 'vitest';
import { HYPNOSIS_PRESETS } from '../hypnosisPractice';
import { PRESETS, presetDurationMin } from '../presets';
import { matchesCollection, matchesListeningFilters, presetFamily } from '../presetBrowse';
import { suggestSessions } from '../sessionSuggestions';

describe('hypnosis practice catalog', () => {
  it('ships eight distinct, bounded practices with explicit sources and authored mixes', () => {
    expect(HYPNOSIS_PRESETS).toHaveLength(8);
    for (const preset of HYPNOSIS_PRESETS) {
      expect(PRESETS.some(p => p.id === preset.id)).toBe(true);
      expect(presetDurationMin(preset)).toBeGreaterThanOrEqual(5);
      expect(presetDurationMin(preset)).toBeLessThanOrEqual(15);
      expect(preset.spec.autoShutoff).toBe(true);
      expect(preset.spec.mix?.volumeDb).toBeLessThanOrEqual(-24);
      expect(preset.citations.length).toBeGreaterThan(0);
      expect(matchesCollection(preset, 'hypnosis')).toBe(true);
      expect(presetFamily(preset)).toBe('Hypnosis & suggestion');
    }
  });
  it('excludes the binaural comparison from speaker-only results, and keeps overnight separate', () => {
    const comparison = PRESETS.find(p => p.id === 'hypnosis-theta-control')!;
    expect(matchesListeningFilters(comparison, 'speakers', '', '')).toBe(false);
    expect(matchesListeningFilters(comparison, 'headphones', 'short', 'binaural')).toBe(true);
    const overnight = PRESETS.find(p => p.id === 'night-hypnosis')!;
    expect(matchesCollection(overnight, 'hypnosis')).toBe(true);
    expect(matchesCollection(overnight, 'overnight')).toBe(true);
    expect(matchesListeningFilters(overnight, 'speakers', 'night', 'steady')).toBe(true);
    expect(matchesListeningFilters(overnight, '', 'short', '')).toBe(false);
  });
  it('matches hypnosis to an actual hypnosis practice without introducing experiments by default', () => {
    const suggestions = suggestSessions({ goal: 'hypnosis', minutes: 6, headphones: false, experimental: false });
    expect(suggestions[0].preset.id).toBe('hypnosis-arrive');
    expect(suggestions.every(s => s.preset.grade !== 'D')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { findBannedPhrases } from '@/docs/vocabulary';
import * as content from '../bashar';

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('channeled source claim discipline', () => {
  it('grades every source theme D and marks transcript provenance unverified', () => {
    expect(content.SOURCE_CARDS).toHaveLength(6);
    for (const card of content.SOURCE_CARDS) {
      expect(card.grade).toBe('D');
      expect(card.sources.length).toBeGreaterThan(0);
      for (const source of card.sources) expect(source.label).toMatch(/supplied|User-supplied/i);
    }
    expect(content.BASHAR_COPY.provenance.join(' ')).toContain('not been independently verified');
    expect(content.BASHAR_COPY.provenance.join(' ')).toContain('No fixed musical tuning');
    expect(content.BASHAR_COPY.provenance.join(' ')).toContain('does mention EEG values in Hz');
  });

  it('does not claim a universal corpus audit, proof of contradiction, or hard EEG limit', () => {
    const text = strings(content).join(' ').toLowerCase();
    for (const overclaim of ['names no hz value anywhere', 'scalp eeg at ~100', 'gamma onset (the anchor)', 'two incompatible eeg claims']) {
      expect(text).not.toContain(overclaim);
    }
    expect(text).toContain('not a demonstrated contradiction');
    expect(text).toContain('electromagnetic wave in vacuum');
  });

  it('keeps the chosen constant and anchor together on catalog and playback mapping surfaces', () => {
    const surfaces = [
      content.MAPPING_NOTE, content.BASHAR_COPY.mappingIntro,
      content.BASHAR_COPY.mappingCaption, content.BASHAR_COPY.calculatorResult(50_000, 10),
      ...content.BASHAR_FREQUENCIES.filter((entry) => entry.id.startsWith('bashar-map')).flatMap((entry) => [entry.note, entry.origin]),
      content.BASHAR_PRESETS[0].rationale,
    ];
    for (const surface of surfaces) {
      expect(surface).toContain('5,000'); expect(surface).toContain('200,000 ↔ 40 Hz');
    }
  });

  it('contains no banned claims in exported strings or formatted UI messages', () => {
    const text = strings(content).concat([
      content.BASHAR_COPY.calculatorResult(200_000, 40),
      content.BASHAR_COPY.phaseLabel(0, 200, 40, 'monaural'),
      content.BASHAR_COPY.presetMeta(35), content.BASHAR_COPY.gradeLabel('D'),
    ]).join(' ');
    expect(findBannedPhrases(text)).toEqual([]);
  });
});

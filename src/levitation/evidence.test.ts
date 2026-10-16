import { describe, expect, it } from 'vitest';
import { LEVITATION_EXPERIMENTS, LEVITATION_SOURCES, MEDIA_RECORDS } from './index';
import { CONNECTIONS } from './connections';

describe('levitation evidence navigation', () => {
  it('resolves every experiment and connection to a unique, inspectable source', () => {
    const ids = new Set(LEVITATION_SOURCES.map(source => source.id));
    expect(ids.size).toBe(LEVITATION_SOURCES.length);
    for (const item of [...LEVITATION_EXPERIMENTS, ...CONNECTIONS]) {
      expect(item.sourceIds.length, item.id).toBeGreaterThan(0);
      for (const id of item.sourceIds) expect(ids.has(id), `${item.id} -> ${id}`).toBe(true);
    }
    for (const source of LEVITATION_SOURCES) {
      expect(new URL(source.url).protocol).toBe('https:');
      for (const value of [source.version, source.passageRead, source.access, source.evidence, source.limitations]) expect(value.length).toBeGreaterThan(0);
    }
  });
  it('keeps experiment and media limits available beside their claims', () => {
    for (const experiment of LEVITATION_EXPERIMENTS) {
      expect(experiment.status).toBe('Proposed');
      for (const value of [experiment.control, experiment.measurement, experiment.falsifier, experiment.limits]) expect(value.length).toBeGreaterThan(0);
    }
    for (const media of MEDIA_RECORDS) {
      expect(media.inspection.length).toBeGreaterThan(0);
      expect(media.transcriptStatus.length).toBeGreaterThan(0);
      expect(media.limits.length).toBeGreaterThan(0);
    }
  });
});

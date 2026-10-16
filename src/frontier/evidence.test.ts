import { describe, expect, it } from 'vitest';
// @ts-expect-error -- node types excluded from tsconfig.app on purpose
import { readFileSync } from 'node:fs';
import { BASHAR_CLAIMS, FRONTIER_CONNECTIONS, FRONTIER_SOURCES, FREQUENCY_HYPOTHESES } from './index';
import { FRONTIER_PRESETS } from '@/data/frontierPresets';
import { PRESETS } from '@/data/presets';
import { matchesCollection, presetFamily } from '@/data/presetBrowse';

describe('frontier research provenance', () => {
  it('resolves every claim, connection and hypothesis without conflating source records', () => {
    const ids = FRONTIER_SOURCES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const row of [...BASHAR_CLAIMS, ...FRONTIER_CONNECTIONS, ...FREQUENCY_HYPOTHESES]) {
      expect(row.sourceIds.length).toBeGreaterThan(0);
      for (const id of row.sourceIds) expect(ids, `${row.id}: ${id}`).toContain(id);
    }
    for (const source of FRONTIER_SOURCES) {
      expect(new URL(source.url).protocol).toBe('https:');
      for (const value of [source.locator, source.access, source.summary, source.limitation]) expect(value.length).toBeGreaterThan(20);
    }
  });
  it('keeps every proposal operational and associated audio identifiable', () => {
    for (const h of FREQUENCY_HYPOTHESES) {
      for (const key of ['useCase','channel','variables','model','prediction','setup','control','observable','falsifier','limitation'] as const) expect(h[key].length, `${h.id}.${key}`).toBeGreaterThan(20);
      for (const id of h.presetIds) expect(FRONTIER_PRESETS.some(p => p.id === id)).toBe(true);
    }
    expect(FRONTIER_PRESETS.every(p => PRESETS.some(c => c.id === p.id))).toBe(true);
    for (const [collection, family] of [['bashar-studies','Bashar research sounds'],['frequency-studies','Frequency studies']] as const) {
      const matches = PRESETS.filter(p => matchesCollection(p, collection));
      expect(matches).toHaveLength(4);
      expect(matches.every(p => presetFamily(p) === family)).toBe(true);
    }
  });
  it('ships the same source and hypothesis records in the downloadable register', () => {
    const shipped = JSON.parse(readFileSync('public/research/bashar-frequency-evidence.json', 'utf8'));
    expect(shipped.sources).toEqual(FRONTIER_SOURCES);
    expect(shipped.claims).toEqual(BASHAR_CLAIMS);
    expect(shipped.connections).toEqual(FRONTIER_CONNECTIONS);
    expect(shipped.hypotheses).toEqual(FREQUENCY_HYPOTHESES);
    expect(shipped.presets).toEqual(FRONTIER_PRESETS);
  });
});

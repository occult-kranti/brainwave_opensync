import { describe, expect, it } from 'vitest';
import { PRESETS, getPresetById } from '../presets';
import { matchesCollection, matchesObeSubgroup, MATH_PRESET_IDS, OBE_PRESET_GROUPS, OBE_SUBGROUPS, obeSubgroupFor } from '../presetBrowse';

describe('OBE and mathematical listening collections', () => {
  it('assigns only existing presets, exactly once, to a supported OBE subgroup', () => {
    const ids = PRESETS.filter(p => matchesCollection(p, 'obe')).map(p => p.id);
    expect(new Set(ids).size).toBe(Object.keys(OBE_PRESET_GROUPS).length);
    for (const [id, subgroup] of Object.entries(OBE_PRESET_GROUPS)) {
      expect(getPresetById(id), id).toBeDefined();
      expect(OBE_SUBGROUPS.some(([key]) => key === subgroup), id).toBe(true);
    }
    for (const [subgroup] of OBE_SUBGROUPS) {
      expect(PRESETS.filter(p => matchesCollection(p, 'obe') && matchesObeSubgroup(p, subgroup)).length, subgroup).toBeGreaterThan(0);
    }
  });
  it('separates astral imagery and remote-viewing journals from dream-awareness practice', () => {
    const astral = getPresetById('night-astral')!;
    const viewing = getPresetById('night-viewing')!;
    expect(obeSubgroupFor(astral)).toBe('astral-imagery');
    expect(obeSubgroupFor(viewing)).toBe('remote-viewing');
    expect(matchesObeSubgroup(astral, 'dream-awareness')).toBe(false);
    expect(matchesObeSubgroup(viewing, 'astral-imagery')).toBe(false);
    expect(matchesObeSubgroup(astral, '')).toBe(true);
  });
  it('does not turn every Bashar, mathematical or sleep preset into an OBE preset', () => {
    for (const id of ['exp-bashar-scale-map', 'exp-phi-ladder', 'frequency-study-phase-drift', 'sleep-delta-descent', 'infant-womb-hush']) {
      expect(matchesCollection(getPresetById(id)!, 'obe'), id).toBe(false);
    }
    expect(obeSubgroupFor({ ...getPresetById('night-astral')!, id: 'constructor' })).toBeUndefined();
  });
  it('includes the mapped, ratio, octave and phase studies in the math collection', () => {
    for (const id of MATH_PRESET_IDS) {
      expect(getPresetById(id), id).toBeDefined();
      expect(matchesCollection(getPresetById(id)!, 'math'), id).toBe(true);
    }
    for (const id of ['frequency-study-alias-proxy', 'nt-ratio-steps', 'bashar-study-octave-return', 'nano-am-16']) {
      expect(matchesCollection(getPresetById(id)!, 'math'), id).toBe(true);
    }
    expect(matchesCollection(getPresetById('night-astral')!, 'math')).toBe(false);
  });
});

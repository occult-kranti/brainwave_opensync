import { describe, expect, it } from 'vitest';
import { buildPracticePlan, FOUNDATION_TAPES, PRACTICE_PLAN_SOURCES, practiceTimeWindow, type PracticePlanOptions } from '../practicePlan';
import { getPresetById, presetDurationMin } from '../presets';

const defaults: PracticePlanOptions = { cadence: 5, budget: 20, time: '07:30', material: 'opensync', approach: 'repeat', foundation: 'intro-10' };

describe('home practice timetable', () => {
  it('creates two bounded weeks with quiet days and no catch-up obligation', () => {
    for (const cadence of [3, 5, 7] as const) {
      const days = buildPracticePlan({ ...defaults, cadence });
      expect(days).toHaveLength(14);
      expect(days.filter(d => d.active)).toHaveLength(cadence * 2);
      expect(days.filter(d => !d.active).every(d => d.listenMin === 0 && d.presetId === null)).toBe(true);
      expect(days.map(d => d.day)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    }
  });
  it('fits the actual original sound and reflection inside each offered time budget', () => {
    for (const budget of [10, 20, 45] as const) {
      const days = buildPracticePlan({ ...defaults, budget });
      for (const day of days.filter(d => d.active)) {
        const p = getPresetById(day.presetId!);
        expect(p).toBeDefined();
        expect(presetDurationMin(p!)).toBe(day.listenMin);
        expect(day.listenMin + day.preparationMin + day.reflectionMin).toBe(budget);
        expect(day.detail).toContain('not the commercial');
      }
    }
  });
  it('does not instruct a short window to truncate an owned commercial recording', () => {
    for (const budget of [10, 20] as const) {
      const days = buildPracticePlan({ ...defaults, material: 'gateway', budget });
      for (const day of days.filter(d => d.active)) {
        expect(day.presetId).not.toBeNull();
        expect(day.detail).toContain('instead of cutting a commercial tape');
      }
    }
    const full = buildPracticePlan({ ...defaults, material: 'gateway', budget: 45 });
    for (const day of full.filter(d => d.active)) {
      expect(day.presetId).toBeNull();
      expect(day.listenMin).toBe(0); // Unknown edition length must not be invented.
      expect(day.detail).toContain('not a verified track length');
    }
  });
  it('can repeat a chosen foundation or draft a sequence without jumping wave order', () => {
    const repeated = buildPracticePlan({ ...defaults, foundation: 'advanced-10' });
    expect(repeated.filter(d => d.active).every(d => d.foundation === 'advanced-10')).toBe(true);
    const sequence = buildPracticePlan({ ...defaults, cadence: 7, approach: 'sequence' });
    expect(sequence.slice(0, 12).map(d => d.foundation)).toEqual(FOUNDATION_TAPES.flatMap(t => [t.id, t.id]));
  });
  it('separates the sleep recording from an alert morning timetable', () => {
    const days = buildPracticePlan({ ...defaults, cadence: 7, approach: 'sequence', material: 'gateway', budget: 45 });
    const sleep = days.filter(d => d.foundation === 'sleep');
    expect(sleep.length).toBeGreaterThan(0);
    expect(sleep.every(d => d.time.startsWith('At bedtime'))).toBe(true);
    expect(days.find(d => d.foundation === 'intro-10')!.time).toBe('07:30–08:15');
  });
  it('shows midnight rollover and rejects incomplete clocks', () => {
    expect(practiceTimeWindow('23:45', 45)).toBe('23:45–00:30 (+1 day)');
    for (const invalid of ['', '25:00', '09:99', '7:30', '<script>']) expect(practiceTimeWindow(invalid, 20)).toBe('Choose a local start time');
  });
  it('keeps official, historical and anecdotal evidence separate', () => {
    expect(PRACTICE_PLAN_SOURCES.some(s => s.kind === 'Official guidance')).toBe(true);
    expect(PRACTICE_PLAN_SOURCES.find(s => s.id === 'manual-mirror')!.note).toContain('not been authenticated');
    expect(PRACTICE_PLAN_SOURCES.filter(s => s.id.startsWith('community')).every(s => s.kind.startsWith('Anecdotes'))).toBe(true);
  });
});

/**
 * Variety Pack tests — the pack exists to spread options across everyday
 * categories, so distribution is enforced here, not just integrity.
 */
import { describe, expect, it } from 'vitest';
import { VARIETY_PRESETS } from '../varietyPack';
import { PRESETS, getPresetById, presetDurationMin } from '../presets';
import { BANNED_PHRASES } from '@/docs/vocabulary';

describe('variety pack integrity', () => {
  it('has unique ids and registers in the catalog', () => {
    const ids = VARIETY_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of VARIETY_PRESETS) {
      const full = getPresetById(p.id);
      expect(full, p.id).toBeDefined();
      expect(full!.dose, p.id).toBeDefined();
      expect(full!.purpose).toBe(p.purpose);
    }
  });

  it('spreads across everyday categories — none in Experimental', () => {
    expect(VARIETY_PRESETS.every((p) => p.category !== 'Experimental')).toBe(true);
    const byCat = (c: string) => VARIETY_PRESETS.filter((p) => p.category === c).length;
    expect(byCat('Sleep')).toBeGreaterThanOrEqual(3);
    expect(byCat('Focus')).toBeGreaterThanOrEqual(3);
    expect(byCat('Relax')).toBeGreaterThanOrEqual(3);
    expect(byCat('Meditate')).toBeGreaterThanOrEqual(3);
    expect(byCat('Lucid Dream')).toBeGreaterThanOrEqual(2);
  });

  it('all entries are grade B or C (D-grade rule never triggers here)', () => {
    for (const p of VARIETY_PRESETS) expect(['B', 'C'], p.id).toContain(p.grade);
  });

  it('no banned overclaim phrases in purposes, rationales or citations', () => {
    for (const p of VARIETY_PRESETS) {
      const text = [p.title, p.purpose, p.rationale, ...p.citations].join(' ').toLowerCase();
      for (const phrase of BANNED_PHRASES) {
        expect(text.includes(phrase), `${p.id}: "${phrase}"`).toBe(false);
      }
    }
  });
});

describe('variety pack specifics', () => {
  it('528 blind pair strictly alternates 528/440 with equal blocks', () => {
    const p = getPresetById('relax-528-blind-pair')!;
    expect(p.spec.phases.map((ph) => ph.carrierHz)).toEqual([528, 440, 528, 440]);
    expect(p.spec.phases.every((ph) => ph.durationSec === 300 && ph.gainDbFs === -16)).toBe(true);
  });

  it('cyclic sigh pacer is 10 minutes at a slow breath cadence', () => {
    const p = getPresetById('relax-cyclic-sigh-pacer')!;
    expect(presetDurationMin(p)).toBeCloseTo(10, 6);
    expect(p.spec.phases[1].beatHz).toBeCloseTo(0.09, 2);
    expect(p.grade).toBe('B');
  });

  it('power nap ends with a wake rise (last phase faster than the nap)', () => {
    const p = getPresetById('sleep-power-nap-25')!;
    const beats = p.spec.phases.map((ph) => ph.beatHz);
    expect(Math.max(...beats)).toBe(beats[beats.length - 1]);
    expect(presetDurationMin(p)).toBeCloseTo(25, 6);
  });

  it('52/17 rhythm is 52 min work + 17 min break', () => {
    const p = getPresetById('focus-52-17-rhythm')!;
    expect(p.spec.phases[0].durationSec).toBe(3120);
    expect(p.spec.phases[1].durationSec).toBe(1020);
  });

  it('brown rain bed is beat-free with a rain layer', () => {
    const p = getPresetById('focus-brown-rain')!;
    expect(p.spec.phases.every((ph) => ph.beatHz === 0)).toBe(true);
    expect(p.spec.mix?.nature.on).toBe(true);
    expect(p.spec.mix?.noiseOn).toBe(true);
  });

  it('catalog grows past 90 presets with the pack', () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(95);
  });
});

/**
 * Healing Sound Lab data integrity — ids, doses, claim discipline, and the
 * ultrasound/nanoparticle portrait arithmetic recomputed from the literature
 * values so a typo in the data file fails here, not in the UI.
 */
import { describe, expect, it } from 'vitest';
import {
  HEALING_GOV,
  HEALING_HYPOTHESES,
  HEALING_PRESETS,
  HEALING_STUDIES,
  NANO_PORTRAITS,
} from '../healingLab';
import { PRESETS, getPresetById, presetDurationMin } from '../presets';
import { BANNED_PHRASES } from '@/docs/vocabulary';

const collectStrings = (): string[] => {
  const out: string[] = [];
  for (const s of HEALING_STUDIES) out.push(s.name, s.setup, s.dose, s.outcome, s.note, s.source);
  for (const g of HEALING_GOV) out.push(g.name, g.years, g.agency, g.record, g.source);
  for (const n of NANO_PORTRAITS) out.push(n.label, n.physicalHz, n.context, n.citation);
  for (const h of HEALING_HYPOTHESES) out.push(h.title, h.statement, h.prediction, h.homeTest, h.prior, ...h.citations);
  for (const p of HEALING_PRESETS) out.push(p.title, p.rationale, ...p.citations);
  return out;
};

describe('healingLab data integrity', () => {
  it('has unique ids within and across collections', () => {
    const ids = [
      ...HEALING_STUDIES.map((x) => x.id),
      ...HEALING_GOV.map((x) => x.id),
      ...NANO_PORTRAITS.map((x) => x.id),
      ...HEALING_HYPOTHESES.map((x) => x.id),
      ...HEALING_PRESETS.map((x) => x.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every study states its dose (duration/cadence discipline)', () => {
    for (const s of HEALING_STUDIES) {
      for (const field of [s.name, s.setup, s.dose, s.outcome, s.note, s.source]) {
        expect(field.trim().length, s.id).toBeGreaterThan(0);
      }
    }
  });

  it('no banned overclaim phrases anywhere in the module', () => {
    for (const text of collectStrings()) {
      const lower = text.toLowerCase();
      for (const phrase of BANNED_PHRASES) {
        expect(lower.includes(phrase), `"${phrase}" in "${text.slice(0, 60)}…"`).toBe(false);
      }
    }
  });
});

describe('nano/ultrasound portrait arithmetic (recomputed)', () => {
  const portrait = (id: string) => NANO_PORTRAITS.find((n) => n.id === id)!;

  it('0.88 MHz at n=13 lands at 107.42 Hz', () => {
    expect(portrait('nano-sdt-088').toneHz).toBeCloseTo(0.88e6 * 2 ** -13, 2);
  });
  it('1.00 MHz at n=13 lands at 122.07 Hz', () => {
    expect(portrait('nano-sdt-100').toneHz).toBeCloseTo(1.0e6 * 2 ** -13, 2);
  });
  it('2.64 MHz at n=14 lands at 161.13 Hz', () => {
    expect(portrait('nano-hifu-264').toneHz).toBeCloseTo(2.64e6 * 2 ** -14, 2);
  });
  it('the MENP 50 Hz field rate is already audio-range (n=0, honest note)', () => {
    const m = portrait('nano-menp-50');
    expect(m.octaveN).toBe(0);
    expect(m.toneHz).toBe(50);
    expect(m.context).toContain('MAGNETIC FIELD');
  });
});

describe('healing preset pack', () => {
  it('all presets registered in the main catalog with dose metadata', () => {
    for (const p of HEALING_PRESETS) {
      const full = getPresetById(p.id);
      expect(full, p.id).toBeDefined();
      expect(full!.dose, p.id).toBeDefined();
    }
  });

  it('bowl session uses measured-geometry bowls over a quiet bed (30 min)', () => {
    const p = getPresetById('heal-bowl-session')!;
    expect(p.spec.mix?.bowls).toHaveLength(3);
    const bases = p.spec.mix!.bowls.map((b) => b.baseHz);
    expect(bases).toEqual([136.1, 188, 500]);
    expect(presetDurationMin(p)).toBeCloseTo(30, 6);
    expect(p.grade).toBe('C');
    expect(p.rationale).toContain('no control');
  });

  it('VAT scan walks the Skille range as pure tones (30/60/90/120 Hz, 20 min)', () => {
    const p = getPresetById('heal-vat-skille-scan')!;
    expect(p.spec.phases.map((ph) => ph.carrierHz)).toEqual([30, 60, 90, 120]);
    expect(p.spec.phases.every((ph) => ph.beatHz === 0)).toBe(true);
    expect(presetDurationMin(p)).toBeCloseTo(20, 6);
  });

  it('WBV analog is a 30 Hz monaural envelope at the Rubin window', () => {
    const p = getPresetById('heal-wbv-30-analog')!;
    expect(p.spec.phases[0].beatHz).toBe(30);
    expect(p.spec.phases[0].mode).toBe('monaural');
    expect(presetDurationMin(p)).toBeCloseTo(20, 6);
    expect(p.rationale).toContain('platform');
  });

  it('Pythagorean ladder climbs harmonics 1–6 of 72 Hz', () => {
    const p = getPresetById('heal-pythagorean-ladder')!;
    expect(p.spec.phases.map((ph) => ph.carrierHz)).toEqual([72, 144, 216, 288, 360, 432]);
    expect(presetDurationMin(p)).toBeCloseTo(24, 6);
  });

  it('sonodynamic portrait carriers equal the portrait table tones', () => {
    const p = getPresetById('exp-sonodynamic-portrait')!;
    const carriers = p.spec.phases.map((ph) => ph.carrierHz);
    const table = ['nano-sdt-088', 'nano-sdt-100', 'nano-sdt-110', 'nano-hifu-264'].map(
      (id) => NANO_PORTRAITS.find((n) => n.id === id)!.toneHz,
    );
    expect(carriers.slice(0, 4)).toEqual(table);
    expect(carriers[4]).toBeCloseTo(3.3e6 * 2 ** -14, 2);
    expect(p.grade).toBe('D');
  });

  it('piezo-nano portrait pairs the 1 MHz portrait with the 50 Hz MENP rate (monaural)', () => {
    const p = getPresetById('exp-piezo-nano-portrait')!;
    expect(p.spec.phases[0].carrierHz).toBeCloseTo(122.07, 2);
    expect(p.spec.phases[0].beatHz).toBe(50);
    expect(p.spec.phases[0].mode).toBe('monaural');
    expect(p.grade).toBe('D');
  });

  it('Otto 128 preset self-blinds with alternating 120 Hz blocks', () => {
    const p = getPresetById('exp-tuning-fork-128')!;
    expect(p.spec.phases.map((ph) => ph.carrierHz)).toEqual([128, 120, 128, 120]);
    expect(p.grade).toBe('D');
  });

  it('healing hypotheses reference real presets with falsifiable fields', () => {
    for (const h of HEALING_HYPOTHESES) {
      expect(getPresetById(h.presetId), h.id).toBeDefined();
      expect(h.prediction.trim().length).toBeGreaterThan(0);
      expect(h.homeTest.trim().length).toBeGreaterThan(0);
    }
  });

  it('keeps the catalog at or above 79 presets', () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(79);
  });
});

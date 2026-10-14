/**
 * Nature Calls Lab tests — species acoustics honesty, Dolbear math round-trip,
 * domain limits for high-frequency carriers, and the ethics rail.
 */
import { describe, expect, it } from 'vitest';
import {
  DOLBEAR_VALID_F,
  NATURE_HYPOTHESES,
  NATURE_PRESETS,
  NATURE_STUDIES,
  PLAYBACK_ETHICS,
  SPECIES_CARDS,
  dolbearF,
  dolbearRateHz,
} from '../natureLab';
import { PRESETS, getPresetById } from '../presets';
import { BANNED_PHRASES } from '@/docs/vocabulary';

const allText = (): string[] => {
  const out: string[] = [...PLAYBACK_ETHICS];
  for (const s of SPECIES_CARDS) {
    out.push(s.species, s.hearing, s.observe, s.headline, s.source);
    for (const c of s.calls) out.push(c.name, c.band, c.meaning);
  }
  for (const n of NATURE_STUDIES) out.push(n.name, n.finding, n.numbers, n.headline, n.source);
  for (const h of NATURE_HYPOTHESES) out.push(h.title, h.headline, h.statement, h.prediction, h.homeTest, h.prior, ...h.citations);
  for (const p of NATURE_PRESETS) out.push(p.title, p.purpose, p.rationale, ...p.citations);
  return out;
};

describe('natureLab integrity', () => {
  it('unique ids across species, studies, hypotheses, presets', () => {
    const ids = [
      ...SPECIES_CARDS.map((x) => x.id),
      ...NATURE_STUDIES.map((x) => x.id),
      ...NATURE_HYPOTHESES.map((x) => x.id),
      ...NATURE_PRESETS.map((x) => x.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every species card carries hearing range, observe protocol, headline and ≥3 calls', () => {
    for (const s of SPECIES_CARDS) {
      expect(s.hearing.length, s.id).toBeGreaterThan(0);
      expect(s.observe.length, s.id).toBeGreaterThan(0);
      expect(s.headline.length, s.id).toBeGreaterThan(0);
      expect(s.calls.length, s.id).toBeGreaterThanOrEqual(3);
      for (const c of s.calls) {
        expect(c.band, `${s.id}/${c.name}`).toMatch(/Hz|kHz/);
      }
    }
  });

  it('every study/hypothesis headline is short (≤26 words)', () => {
    const wc = (t: string) => t.split(/\s+/).filter(Boolean).length;
    for (const n of NATURE_STUDIES) expect(wc(n.headline), n.id).toBeLessThanOrEqual(26);
    for (const h of NATURE_HYPOTHESES) expect(wc(h.headline), h.id).toBeLessThanOrEqual(26);
    for (const s of SPECIES_CARDS) expect(wc(s.headline), s.id).toBeLessThanOrEqual(26);
  });

  it('ethics rail is present and restrictive', () => {
    expect(PLAYBACK_ETHICS.length).toBeGreaterThanOrEqual(5);
    const joined = PLAYBACK_ETHICS.join(' ').toLowerCase();
    expect(joined).toContain('never');
    expect(joined).toContain('30 seconds');
  });

  it('no banned overclaim phrases anywhere', () => {
    for (const text of allText()) {
      const lower = text.toLowerCase();
      for (const phrase of BANNED_PHRASES) {
        expect(lower.includes(phrase), `"${phrase}" in "${text.slice(0, 50)}…"`).toBe(false);
      }
    }
  });
});

describe('Dolbear math', () => {
  it('round-trips: rate at 70 °F is 2 chirps/s; count-in-15s + 40 returns 70', () => {
    const rate = dolbearRateHz(70);
    expect(rate).toBeCloseTo(2, 6);
    const counted15 = Math.round(rate * 15);
    expect(dolbearF(counted15)).toBe(70);
  });
  it('validity band is the documented 55–100 °F', () => {
    expect(DOLBEAR_VALID_F).toEqual({ min: 55, max: 100 });
    expect(dolbearRateHz(55)).toBeCloseTo(1, 6);
  });
});

describe('nature presets', () => {
  it('all registered with dose metadata', () => {
    for (const p of NATURE_PRESETS) {
      const full = getPresetById(p.id);
      expect(full, p.id).toBeDefined();
      expect(full!.dose, p.id).toBeDefined();
      expect(full!.purpose).toBe(p.purpose);
    }
  });

  it('high-frequency education presets respect the 4 kHz isochronic ceiling', () => {
    for (const id of ['nature-sparrow-band', 'nature-bluejay-jeer', 'nature-squirrel-alarm', 'nature-dolbear-cricket']) {
      const p = getPresetById(id)!;
      for (const ph of p.spec.phases) {
        expect(ph.mode, `${id}/${ph.name}`).toBe('isochronic');
        expect(ph.carrierHz, `${id}/${ph.name}`).toBeLessThanOrEqual(4000);
      }
    }
  });

  it('sparrow band shows the documented upward urban shift', () => {
    const p = getPresetById('nature-sparrow-band')!;
    const carriers = p.spec.phases.map((ph) => ph.carrierHz);
    expect(carriers[1]).toBeGreaterThan(carriers[0]);
    expect(carriers[1] - carriers[0]).toBeCloseTo(800, -1);
  });

  it('purr companion uses the measured 25 Hz rate as monaural AM', () => {
    const p = getPresetById('nature-cat-purr-companion')!;
    expect(p.spec.phases[0].beatHz).toBe(25);
    expect(p.spec.phases[0].mode).toBe('monaural');
    expect(p.grade).toBe('C');
  });

  it('plant portrait tones equal the octave arithmetic (20/50 kHz ÷ 2^8)', () => {
    const p = getPresetById('nature-plant-clicks-portrait')!;
    expect(p.spec.phases[0].carrierHz).toBeCloseTo(20000 * 2 ** -8, 2);
    expect(p.spec.phases[1].carrierHz).toBeCloseTo(50000 * 2 ** -8, 2);
  });

  it('cricket reference holds 2 chirps/s (70 °F) in the 3 kHz band', () => {
    const p = getPresetById('nature-dolbear-cricket')!;
    expect(p.spec.phases[0].beatHz).toBe(2);
    expect(p.spec.phases[0].carrierHz).toBe(3000);
  });

  it('synthesized call approximations stay D-grade and say so', () => {
    for (const id of ['nature-sparrow-band', 'nature-bluejay-jeer', 'nature-squirrel-alarm']) {
      const p = getPresetById(id)!;
      expect(p.grade, id).toBe('D');
      expect(p.rationale.toLowerCase(), id).toMatch(/approximat|not a|never broadcast/);
    }
  });

  it('catalog grows to ≥103 presets', () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(103);
  });
});

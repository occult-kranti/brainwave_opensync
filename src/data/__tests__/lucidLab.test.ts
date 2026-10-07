/**
 * Lucid Audio Lab data integrity — ids, claim discipline, octave arithmetic.
 *
 * The octave-portrait values are recomputed here from physical constants so a
 * typo in the data file fails the suite, not the user.
 */
import { describe, expect, it } from 'vitest';
import {
  EXPEDITION_PRESETS,
  GOV_FREY,
  GOV_PROGRAMS,
  KEPLER_SONGS,
  LUCID_AUDIO_STUDIES,
  LUCID_HYPOTHESES,
  LUCID_LAB_PRESETS,
  OCTAVE_PORTRAITS,
  PRESET_ART,
} from '../lucidLab';
import { PRESETS, getPresetById, presetDurationMin } from '../presets';
import { BANNED_PHRASES } from '@/docs/vocabulary';
import { TLR_CUE } from '@/dream/protocols';

const C = 299_792_458;

const collectStrings = (): string[] => {
  const out: string[] = [];
  for (const s of LUCID_AUDIO_STUDIES) out.push(s.name, s.setup, s.timing, s.outcome, s.note, s.source);
  for (const g of [...GOV_PROGRAMS, GOV_FREY]) out.push(g.name, g.years, g.agency, g.record, g.audioLink, g.source);
  for (const o of OCTAVE_PORTRAITS) out.push(o.label, o.sourceQuantity, o.sourceValue, o.note, o.citation);
  for (const h of LUCID_HYPOTHESES) out.push(h.title, h.statement, h.prediction, h.homeTest, h.prior, ...h.citations);
  for (const p of [...LUCID_LAB_PRESETS, ...EXPEDITION_PRESETS]) out.push(p.title, p.rationale, ...p.citations);
  for (const k of KEPLER_SONGS) out.push(k.planet, k.interval);
  return out;
};

describe('lucidLab data integrity', () => {
  it('has unique ids within and across collections', () => {
    const ids = [
      ...LUCID_AUDIO_STUDIES.map((x) => x.id),
      ...GOV_PROGRAMS.map((x) => x.id),
      GOV_FREY.id,
      ...OCTAVE_PORTRAITS.map((x) => x.id),
      ...LUCID_HYPOTHESES.map((x) => x.id),
      ...LUCID_LAB_PRESETS.map((x) => x.id),
      ...EXPEDITION_PRESETS.map((x) => x.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every study carries setup, timing, outcome, note and source', () => {
    for (const s of LUCID_AUDIO_STUDIES) {
      for (const field of [s.name, s.setup, s.timing, s.outcome, s.note, s.source]) {
        expect(field.trim().length, s.id).toBeGreaterThan(0);
      }
    }
  });

  it('every government entry carries dual grades and a source', () => {
    for (const g of GOV_PROGRAMS) {
      expect(['A', 'B', 'C', 'D'], g.id).toContain(g.recordGrade);
      expect(['A', 'B', 'C', 'D'], g.id).toContain(g.claimGrade);
      expect(g.source.trim().length, g.id).toBeGreaterThan(0);
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

describe('TLR cue canon consistency', () => {
  it('the TLR study card cites the canonical cue frequencies and level discipline', () => {
    const tlr = LUCID_AUDIO_STUDIES.find((s) => s.id === 'study-carr-2023-tlr')!;
    for (const f of TLR_CUE.freqsHz) expect(tlr.setup).toContain(String(f));
    expect(tlr.setup).toContain('650');
    expect(tlr.setup).toMatch(/40–45 dB/);
  });
});

describe('octave portrait arithmetic (recomputed from constants)', () => {
  const portrait = (id: string) => OCTAVE_PORTRAITS.find((o) => o.id === id)!;

  it('Earth year reproduces the Cousto OM tone at n=32', () => {
    const exact = (1 / (365.256363004 * 86400)) * 2 ** 32;
    expect(portrait('octave-earth-year').toneHz).toBeCloseTo(exact, 2);
    expect(portrait('octave-earth-year').octaveN).toBe(32);
  });

  it('Earth day reproduces 194.18 Hz at n=24', () => {
    const exact = (1 / 86400) * 2 ** 24;
    expect(portrait('octave-earth-day').toneHz).toBeCloseTo(exact, 2);
  });

  it('hydrogen 21 cm line octaves down to 677.30 Hz at n=21', () => {
    const exact = 1_420_405_751.768 * 2 ** -21;
    expect(portrait('octave-hydrogen-21cm').toneHz).toBeCloseTo(exact, 2);
    expect(portrait('octave-hydrogen-21cm').direction).toBe('down');
  });

  it('solar p-mode tone is the 300 s period at n=17', () => {
    const exact = (1 / 300) * 2 ** 17;
    expect(portrait('octave-solar-pmode').toneHz).toBeCloseTo(exact, 2);
  });

  it('Newton Dorian division closes the visible octave', () => {
    const fRed = C / 750e-9;
    const ratios = [9 / 8, 256 / 243, 9 / 8, 9 / 8, 9 / 8, 256 / 243, 9 / 8];
    const edges = [fRed];
    for (const r of ratios) edges.push(edges[edges.length - 1] * r);
    // the division lands within 2% of the 380 nm violet edge
    expect(C / edges[7] / 1e-9).toBeGreaterThan(370);
    expect(C / edges[7] / 1e-9).toBeLessThan(385);
    const redCenter = Math.sqrt(edges[0] * edges[1]) * 2 ** -40;
    const violetCenter = Math.sqrt(edges[6] * edges[7]) * 2 ** -40;
    expect(portrait('octave-newton-red').toneHz).toBeCloseTo(redCenter, 2);
    expect(portrait('octave-newton-violet').toneHz).toBeCloseTo(violetCenter, 2);
  });

  it('every portrait states n, direction and a citation', () => {
    for (const o of OCTAVE_PORTRAITS) {
      expect(Number.isInteger(o.octaveN), o.id).toBe(true);
      expect(o.octaveN, o.id).toBeGreaterThan(0);
      expect(o.toneHz, o.id).toBeGreaterThan(0);
      expect(o.citation.trim().length, o.id).toBeGreaterThan(0);
    }
  });
});

describe('lucid lab preset pack', () => {
  it('all presets are registered in the main catalog with dose metadata', () => {
    for (const p of [...LUCID_LAB_PRESETS, ...EXPEDITION_PRESETS]) {
      const full = getPresetById(p.id);
      expect(full, p.id).toBeDefined();
      expect(full!.dose, p.id).toBeDefined();
    }
  });

  it('every artwork mapping points at an existing public/art file reference pattern', () => {
    for (const [id, art] of Object.entries(PRESET_ART)) {
      expect(getPresetById(id), `art for unknown preset ${id}`).toBeDefined();
      expect(art, id).toMatch(/^art\/[a-z0-9-]+\.jpg$/);
    }
  });

  it('Kepler ratios recompute from eccentricities via the second law', () => {
    const cents = (r: number, target: number) => 1200 * Math.log2(r / target);
    for (const k of KEPLER_SONGS) {
      const exact = ((1 + k.eccentricity) / (1 - k.eccentricity)) ** 2;
      expect(k.ratio, k.planet).toBeCloseTo(exact, 3);
    }
    // Earth within perceptual tolerance of the 16:15 semitone, per the literature
    const earth = KEPLER_SONGS.find((k) => k.planet === 'Earth')!;
    expect(Math.abs(cents(earth.ratio, 16 / 15))).toBeLessThan(5);
    // Venus is the most circular: smallest slide
    const venus = KEPLER_SONGS.find((k) => k.planet === 'Venus')!;
    expect(venus.ratio).toBeLessThan(1.04);
  });

  it('Kepler motet preset alternates aphelion→perihelion tones per planet, beat-free', () => {
    const p = getPresetById('exp-kepler-motet')!;
    expect(p.spec.phases).toHaveLength(KEPLER_SONGS.length * 2);
    KEPLER_SONGS.forEach((k, i) => {
      expect(p.spec.phases[i * 2].carrierHz).toBeCloseTo(k.aphelionHz, 2);
      expect(p.spec.phases[i * 2 + 1].carrierHz).toBeCloseTo(k.perihelionHz, 2);
    });
    for (const ph of p.spec.phases) expect(ph.beatHz).toBe(0);
    expect(p.grade).toBe('D');
    expect(p.category).toBe('Experimental');
  });

  it('five-tone preset walks the C pentatonic in 5-minute steps (25 min)', () => {
    const p = getPresetById('meditate-five-tones')!;
    expect(p.spec.phases.map((ph) => ph.carrierHz)).toEqual([261.63, 293.66, 329.63, 392, 440]);
    expect(p.spec.phases.every((ph) => ph.durationSec === 300)).toBe(true);
    expect(presetDurationMin(p)).toBeCloseTo(25, 6);
    expect(p.category).toBe('Meditate');
    expect(p.grade).toBe('B');
  });

  it('Tesla 3-6-9 preset is labeled folklore with 3 rounds of 3/6/9 Hz', () => {
    const p = getPresetById('exp-tesla-369')!;
    expect(p.grade).toBe('D');
    expect(p.category).toBe('Experimental');
    expect(p.title.toLowerCase()).toContain('experimental tier');
    expect(p.spec.phases.map((ph) => ph.beatHz)).toEqual([3, 6, 9, 3, 6, 9, 3, 6, 9]);
  });

  it('GENUS daily hour matches the clinical 60-min dose as monaural 40 Hz AM', () => {
    const p = getPresetById('exp-genus-daily-hour')!;
    expect(p.spec.phases).toHaveLength(1);
    expect(p.spec.phases[0].durationSec).toBe(3600);
    expect(p.spec.phases[0].beatHz).toBe(40);
    expect(p.spec.phases[0].mode).toBe('monaural');
    expect(p.rationale).toContain('missed its primary');
  });

  it('Frey/RF-hearing entry is documented with dual grades and no in-app audio', () => {
    expect(GOV_FREY.recordGrade).toBe('A');
    expect(['B', 'C', 'D']).toContain(GOV_FREY.claimGrade);
    expect(GOV_FREY.audioLink.toLowerCase()).toContain('never emit rf');
  });

  it('practice presets live in the Lucid Dream category', () => {
    for (const id of ['lucid-tlr-training-bed', 'lucid-wbtb-return-descent', 'lucid-rem-window-theta', 'lucid-n1-incubation', 'lucid-ssild-pacer']) {
      expect(getPresetById(id)?.category, id).toBe('Lucid Dream');
    }
  });

  it('Gateway reconstructions are labeled unofficial and graded no higher than C', () => {
    for (const p of LUCID_LAB_PRESETS.filter((x) => x.id.startsWith('gateway-'))) {
      expect(p.title.toLowerCase(), p.id).toContain('reconstruction');
      expect(p.title.toLowerCase(), p.id).toContain('unofficial');
      expect(['C', 'D'], p.id).toContain(p.grade);
    }
  });

  it('Newton spectrum walk uses the Dorian band-center tones ascending, beat-free', () => {
    const p = getPresetById('exp-newton-spectrum-dorian')!;
    const carriers = p.spec.phases.map((ph) => ph.carrierHz);
    expect(carriers).toEqual([385.6, 419.79, 457.01, 514.13, 578.4, 629.68, 685.51]);
    for (const ph of p.spec.phases) expect(ph.beatHz).toBe(0);
    expect(p.grade).toBe('D');
  });

  it('planetary ascent matches the portrait table values in ascending pitch order', () => {
    const p = getPresetById('exp-planetary-octave-ascent')!;
    const carriers = p.spec.phases.map((ph) => ph.carrierHz);
    const tableValues = carriers.map(
      (hz) => OCTAVE_PORTRAITS.find((o) => Math.abs(o.toneHz - hz) < 0.005)?.toneHz,
    );
    expect(tableValues.every((v) => v !== undefined)).toBe(true);
    const sorted = [...carriers].sort((a, b) => a - b);
    expect(carriers).toEqual(sorted);
  });

  it('SSILD pacer runs 8 cycles of three 30 s senses (12 min total)', () => {
    const p = getPresetById('lucid-ssild-pacer')!;
    expect(p.spec.phases).toHaveLength(24);
    for (const ph of p.spec.phases) expect(ph.durationSec).toBe(30);
    expect(presetDurationMin(p)).toBeCloseTo(12, 6);
  });

  it('gamma probes keep >30 Hz content on monaural AM', () => {
    for (const id of ['exp-theta-gamma-interleave', 'exp-rem-gamma-whisper', 'relax-vat-40-analog']) {
      const p = getPresetById(id)!;
      for (const ph of p.spec.phases) {
        if (ph.beatHz > 30) expect(ph.mode, `${id}/${ph.name}`).toBe('monaural');
      }
    }
  });

  it('hypotheses reference real presets and carry falsifiable fields', () => {
    for (const h of LUCID_HYPOTHESES) {
      expect(getPresetById(h.presetId), h.id).toBeDefined();
      expect(h.prediction.trim().length, h.id).toBeGreaterThan(0);
      expect(h.homeTest.trim().length, h.id).toBeGreaterThan(0);
      expect(h.prior.trim().length, h.id).toBeGreaterThan(0);
    }
  });

  it('keeps the overall catalog at or above its previous size floor', () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(72);
  });
});

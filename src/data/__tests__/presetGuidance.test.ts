import { describe, expect, it } from 'vitest';
import { PRESETS, getPresetById, type Preset } from '../presets';
import { CLEAN_PRESET_MIX } from '../presetMix';
import { presetGuidance } from '../presetGuidance';
import { findBannedPhrases } from '@/docs/vocabulary';

const preset = (id: string) => getPresetById(id)!;
const custom = (): Preset => ({
  id: 'user:example', title: 'My listening comparison', category: 'Experimental', grade: 'D',
  rationale: 'Personal composition.', citations: [],
  spec: { autoShutoff: true, phases: [220, 330, 220].map(carrierHz => ({ name: 'step', durationSec: 60, carrierHz, beatHz: 0, mode: 'binaural', gainDbFs: -28 })) },
});

describe('preset practice guidance', () => {
  it('covers every catalog recipe without changing its signal, timing or evidence', () => {
    const before = JSON.stringify(PRESETS);
    expect(PRESETS.length).toBeGreaterThanOrEqual(167);
    for (const p of PRESETS) {
      const guide = presetGuidance(p);
      for (const field of ['logic', 'experience', 'howToUse', 'howOften', 'limits'] as const) {
        expect(guide[field].length, `${p.id}/${field}`).toBeGreaterThan(45);
        expect(findBannedPhrases(guide[field]), `${p.id}/${field}`).toEqual([]);
      }
      expect(guide.howOften, p.id).toMatch(/not a validated|no validated/i);
      expect(guide.sources.length, p.id).toBeGreaterThan(0);
      expect(new Set(guide.sources.map(source => source.url)).size, p.id).toBe(guide.sources.length);
      for (const source of guide.sources) {
        expect(source.label, p.id).toBeTruthy();
        expect(new URL(source.url).protocol, p.id).toBe('https:');
      }
    }
    expect(JSON.stringify(PRESETS)).toBe(before);
  });

  it('keeps the chosen Bashar anchor, seven steps and uncertain provenance visible', () => {
    const guide = presetGuidance(preset('exp-bashar-scale-map'));
    expect(guide.logic).toContain('k = 5,000');
    expect(guide.logic).toContain('333,000 → 66.6');
    expect(guide.limits).toContain('200,000 ↔ 40 Hz');
    expect(guide.limits).toContain('no supplied instrument');
    expect(guide.sources.some(source => source.label.includes('unverified'))).toBe(true);
    expect(guide.howToUse).toContain('stereo headphones');
  });

  it('distinguishes phi intervals, sequential pitches and overlapping modeled bowls', () => {
    const ladder = presetGuidance(preset('exp-phi-ladder'));
    const chord = presetGuidance(preset('exp-phi-bowl-chord'));
    expect(ladder.logic).toContain('110 × φⁿ');
    expect(ladder.logic).toContain('not a beat rate');
    expect(chord.logic).toContain('overlap as a chord');
    expect(chord.logic).toContain('modeled bowl partials');
  });

  it('does not silently present live shared-tone synthesis as offline sine AM', () => {
    for (const id of ['exp-bashar-scale-map', 'exp-bashar-gamma-contradiction', 'nano-am-16', 'research-monaural-6']) {
      const guide = presetGuidance(preset(id));
      expect(guide.logic, id).toContain('Preview/export uses sine amplitude modulation');
      expect(guide.logic, id).toMatch(/live playback (mixes|uses)/);
      expect(guide.logic, id).toContain('spectra differ');
    }
  });

  it('keeps OBE and Gateway experiences separate from literal travel and validated dosage', () => {
    for (const id of ['archive-gateway-inspired', 'gateway-focus-10-reconstruction', 'gateway-focus-12-reconstruction', 'gateway-focus-15-reconstruction', 'gateway-focus-21-reconstruction', 'night-astral']) {
      const guide = presetGuidance(preset(id));
      expect(guide.limits, id).toContain('do not by themselves establish that awareness left the body');
      expect(guide.howOften, id).toContain('not a validated OBE dose');
      expect(guide.howToUse, id).toMatch(/room|bodily support/);
    }
    expect(presetGuidance(preset('night-viewing')).howToUse).toContain('count misses');
    expect(presetGuidance(preset('night-astral')).limits).toContain('not a recommended practice dose');
  });

  it('explains the original mathematical mapping, including units and chosen octaves', () => {
    const cases = {
      'exp-hydrogen-21cm-portrait': '1,420,405,751.768/2,097,152',
      'exp-cmb-peak-portrait': '160,400,000,000/268,435,456',
      'exp-solar-pmode-portrait': '(1/300) × 2¹⁷',
      'exp-planetary-octave-ascent': '(1/T) × 2ⁿ',
      'exp-newton-spectrum-dorian': '(c/λ) × 2⁻⁴⁰',
      'exp-kepler-motet': '((1 + e)/(1 − e))²',
      'research-equal-temperament': '220 × 2^(n/12)',
      'archive-seven-intervals': '9/8, 5/4, 4/3',
      'frequency-study-alias-proxy': '|7,712 − 8,000| = 288',
    };
    for (const [id, formula] of Object.entries(cases)) expect(presetGuidance(preset(id)).logic, id).toContain(formula);
    expect(presetGuidance(preset('relax-schumann-sim')).limits).toContain('electromagnetic cavity resonances');
  });

  it('preserves ordered repeated pitches and carrier-locked bowl meaning for saved presets', () => {
    const p = custom();
    p.spec.limitMin = 2;
    p.spec.mix = { ...CLEAN_PRESET_MIX, bowls: [{ on: true, material: 'crystal-quartz', strike: 'soft', baseHz: 999, db: -30, pan: 0, restrikeSec: 12, lock: true }] };
    const before = JSON.stringify(p);
    const guide = presetGuidance(p);
    expect(guide.logic).toContain('220 → 330 → 220 Hz');
    expect(guide.logic).toContain('pitch follows the current carrier');
    expect(guide.logic).not.toContain('999');
    expect(guide.logic).toContain('timer stops at 2 minutes');
    expect(JSON.stringify(p)).toBe(before);
  });

  it('does not suggest adult headphones, timer overrides or repeated dosing for infants', () => {
    for (const p of PRESETS.filter(item => item.category === 'Infant')) {
      const guide = presetGuidance(p);
      expect(guide.howToUse).toContain('Never put headphones on an infant');
      expect(guide.howOften).toContain('No automatic repeat schedule');
      expect(guide.limits).toContain('does not authorize a longer or louder session');
    }
  });

  it('does not imply that a dream soundtrack contains REM sensing or verified dream cues', () => {
    const tlr = presetGuidance(preset('lucid-tlr-training-bed'));
    expect(tlr.howToUse).toContain('does not automatically insert, train or replay a cue');
    expect(tlr.limits).toContain('does not sense REM');
    expect(presetGuidance(preset('lucid-rem-window-theta')).limits).toContain('neither detects REM');
  });

  it('discloses the existing eight-section loader cap instead of promising the full authored sequence', () => {
    const guide = presetGuidance(preset('lucid-ssild-pacer'));
    expect(guide.logic).toContain('24 sections total 12 minutes');
    expect(guide.limits).toContain('keeps only the first eight (4 minutes');
    expect(presetGuidance(preset('exp-tesla-369')).limits).toContain('keeps only the first eight (24 minutes');
    expect(presetGuidance(preset('exp-phi-ladder')).limits).not.toContain('keeps only the first eight');
    expect(presetGuidance(preset('focus-brown-noise')).logic).toContain('noise mode currently falls back to steady-tone playback');
  });
});

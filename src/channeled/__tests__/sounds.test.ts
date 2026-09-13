import { describe, expect, it } from 'vitest';
import { getPresetById } from '@/data/presets';
import { CLEAN_PRESET_MIX, sanitizePresetMix } from '@/data/presetMix';
import { renderPhase } from '@/engine';
import { buildExportPhases, presetPreviewPhases } from '@/ui/session/sessionMath';
import { ALL_NOISE_OFF } from '@/ui/session/sessionDefaults';
import { BASHAR_PRESETS } from '../bashar';
import { PHI_LADDER_HZ } from '../mapping';

describe('Bashar sound recipes', () => {
  it('registers four playable recipes with explicit, reproducible mixer profiles', () => {
    expect(BASHAR_PRESETS).toHaveLength(4);
    for (const p of BASHAR_PRESETS) {
      expect(getPresetById(p.id)).toMatchObject(p);
      expect(p.spec.mix?.waveform).toBe('sine');
      expect(p.spec.mix?.noiseOn).toBe(false);
      expect(p.spec.mix?.nature.on).toBe(false);
      expect(p.spec.mix?.bellEveryMin).toBe(0);
    }
    expect(BASHAR_PRESETS.filter((p) => p.id !== 'exp-phi-bowl-chord').every((p) => p.spec.mix?.bowls.length === 0)).toBe(true);
  });

  it('renders the simultaneous phi bowl chord with nonzero stereo bowl content', () => {
    const chord = getPresetById('exp-phi-bowl-chord')!;
    const phase = presetPreviewPhases(chord, 2)[0];
    expect(phase.bowls?.map((b) => b.baseHz)).toEqual(PHI_LADDER_HZ);
    expect(phase.bowls?.every((b) => b.restrikeSec === 12 && b.strike === 'soft')).toBe(true);
    expect(phase.carrierHz).toBe(110);
    expect(phase.beatHz).toBe(0);
    const withBowls = renderPhase(phase, 8000);
    const rootOnly = renderPhase({ ...phase, bowls: [] }, 8000);
    let bowlEnergy = 0;
    let widthEnergy = 0;
    for (let i = 0; i < withBowls.left.length; i++) {
      bowlEnergy += (withBowls.left[i] - rootOnly.left[i]) ** 2;
      widthEnergy += (withBowls.left[i] - withBowls.right[i]) ** 2;
    }
    expect(bowlEnergy).toBeGreaterThan(1e-5);
    expect(widthEnergy).toBeGreaterThan(1e-5);
  });

  it('retains the chord mix when a short preview selects just one phase', () => {
    const chord = getPresetById('exp-phi-bowl-chord')!;
    const preview = presetPreviewPhases({ ...chord, spec: { ...chord.spec, phases: [{ ...chord.spec.phases[0], durationSec: 8 }] } });
    expect(preview[0].durationSec).toBe(8);
    expect(preview[0].bowls?.map((b) => b.baseHz)).toEqual(PHI_LADDER_HZ);
  });

  it('preserves absolute bowl-fader attenuation in exports even with a single quiet bowl', () => {
    const p = getPresetById('exp-phi-bowl-chord')!;
    const render = (db: number) => buildExportPhases([{ id: 'one', durationSec: 2, beatHz: 0 }], 110, 'binaural', {
      ...CLEAN_PRESET_MIX, noiseDb: ALL_NOISE_OFF,
      bowls: [{ ...p.spec.mix!.bowls[0], db, id: 'b' }],
    })[0].bowls![0].level;
    expect(render(-60) / render(-20)).toBeCloseTo(0.01, 12);
    expect(render(-60)).toBeCloseTo(0.0025, 12);
    expect(render(0)).toBe(1);
    expect(render(20)).toBe(1);
  });

  it('sanitizes optional serialized mixer data without converting null to an audible level', () => {
    const mix = sanitizePresetMix({
      waveform: 'laser', noiseDb: { pink: null, white: 999 }, noiseOn: true,
      nature: { on: true, db: null, kind: 'unknown' },
      bowls: Array.from({ length: 10 }, () => ({ on: true, material: 'bad', strike: 'bad', baseHz: 2000, db: null, pan: 4, restrikeSec: 3 })),
      bellEveryMin: Infinity, volumeDb: 8,
    })!;
    expect(mix.waveform).toBe('sine');
    expect(mix.noiseDb).toEqual({ white: 0 });
    expect(mix.nature.on).toBe(false);
    expect(mix.bowls).toHaveLength(7);
    expect(mix.bowls[0]).toMatchObject({ on: false, baseHz: 1000, db: -60, pan: 1, restrikeSec: 4 });
    expect(mix.bellEveryMin).toBe(0);
    expect(mix.volumeDb).toBe(0);
    expect(sanitizePresetMix(null)).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { renderSession } from '@/engine';
import { OVERNIGHT_PRESETS, prepareNightPreset } from '../overnightPractice';
import { NANO_BENCH_PRESETS, NANO_STUDIO_PRESETS } from '../nanoPresets';
import { matchesListeningFilters } from '../presetBrowse';
import { needsHeadphones } from '../sessionSuggestions';
import { presetPreviewPhases, newUiPhase } from '@/ui/session/sessionMath';
import { sanitizeFrontPanel } from '@/ui/session/sessionPersistence';
import { DEFAULT_FRONT_PANEL } from '@/ui/session/sessionDefaults';
import { renderNanoSignal } from '@/nanolab/model';
import { assertBrowserExportFits, renderExportAsync } from '@/ui/audio/renderExport';

describe('overnight audio contracts', () => {
  it.each(OVERNIGHT_PRESETS.map(p => [p.id, p] as const))('%s survives persistence with all seven hours and no binaural beat', (_, p) => {
    const panel = sanitizeFrontPanel({ ...DEFAULT_FRONT_PANEL, limitMin: 420, phases: p.spec.phases.map(ph => newUiPhase(ph.durationSec, ph.beatHz, { ...ph, mode: 'monaural' })) }, DEFAULT_FRONT_PANEL);
    expect(panel.limitMin).toBe(420);
    expect(panel.phases.reduce((s, ph) => s + ph.durationSec, 0)).toBe(25200);
    expect(needsHeadphones(p)).toBe(false);
    expect(p.spec.mix?.bellEveryMin).toBe(0);
    const rendered = renderSession({ phases: presetPreviewPhases(p, .2), sampleRate: 8000, masterGainDb: -6 });
    expect(rendered.left.some(x => Math.abs(x) > 1e-5)).toBe(true);
    expect(rendered.left.every(x => Number.isFinite(x) && Math.abs(x) < .1)).toBe(true);
  });
  it('keeps the complete plan while choosing 30 minutes or applying the existing cap', () => {
    expect(prepareNightPreset('lucid', false).spec.limitMin).toBe(30);
    expect(prepareNightPreset('lucid', true, 60).spec.limitMin).toBe(60);
    expect(prepareNightPreset('hypnosis', true).spec.limitMin).toBe(420);
    expect(prepareNightPreset('astral', false).spec.phases.reduce((s, p) => s + p.durationSec, 0)).toBe(25200);
  });
  it('intersects setup, duration and sound filters', () => {
    expect(matchesListeningFilters(OVERNIGHT_PRESETS[0], 'speakers', 'night', 'nature')).toBe(true);
    expect(matchesListeningFilters(OVERNIGHT_PRESETS[0], 'headphones', 'night', '')).toBe(false);
    expect(matchesListeningFilters(OVERNIGHT_PRESETS[0], '', 'short', '')).toBe(false);
    expect(matchesListeningFilters(NANO_STUDIO_PRESETS[0], 'speakers', 'short', 'pulse')).toBe(true);
    expect(matchesListeningFilters(NANO_STUDIO_PRESETS[2], 'speakers', 'short', 'pulse')).toBe(false);
  });
  it('rejects seven-hour WAV allocation before worker or synchronous rendering', async () => {
    const phases = [{ durationSec: 25200, carrierHz: 120, beatHz: 0, mode: 'monaural' as const, gainDb: -30 }];
    await expect(renderExportAsync({ phases }, 'pcm16')).rejects.toThrow('90 minutes');
    expect(() => assertBrowserExportFits({ phases: [{ ...phases[0], durationSec: 5400 }] })).not.toThrow();
  });
  it.each(NANO_BENCH_PRESETS)('bench recipe $id renders finite, quiet, identical channels', p => {
    const sound = renderNanoSignal({ ...p.recipe, durationSec: 2 });
    expect(sound.left.every((x, i) => Number.isFinite(x) && x === sound.right[i] && Math.abs(x) <= 10 ** (-30 / 20))).toBe(true);
    expect(sound.samplePeak).toBeGreaterThan(0);
  });
});

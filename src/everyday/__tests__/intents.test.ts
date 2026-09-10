/**
 * Everyday intents — applying each intent drives the session setters with
 * the documented values (pure: a mocked session object, node environment).
 */
import { describe, expect, it, vi } from 'vitest';
import { BOWL_SETS } from '@/engine';
import { getPresetById } from '@/data/presets';
import { INTENTS, NOISE_COLORS, applyIntent, bowlSetLayers, intentById, intentFromPresetName, intentPreset, isIntentId, type IntentSession } from '../intents';

function mockSession(startResult = true) {
  return {
    loadPreset: vi.fn(),
    setNoiseDb: vi.fn(),
    setNoiseOn: vi.fn(),
    setNature: vi.fn(),
    setBowls: vi.fn(),
    setBellEveryMin: vi.fn(),
    setLimitMin: vi.fn(),
    setFadeOutSec: vi.fn(),
    setLayersOn: vi.fn(),
    start: vi.fn(() => startResult),
  } satisfies IntentSession;
}

/** The dB every colour was set to, as one record. */
function noiseCalls(s: ReturnType<typeof mockSession>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [color, db] of s.setNoiseDb.mock.calls as [string, number][]) out[color] = db;
  return out;
}

describe('intent table', () => {
  it('has the four intents with their graded presets', () => {
    expect(INTENTS.map((i) => i.id)).toEqual(['sleep', 'focus', 'relax', 'meditate']);
    for (const i of INTENTS) {
      const preset = getPresetById(i.presetId);
      expect(preset, i.presetId).toBeTruthy();
      expect(intentPreset(i)).toBe(preset);
      expect(['A', 'B', 'C', 'D']).toContain(preset!.grade);
    }
    expect(intentById('sleep').durationMin).toBe(45);
    expect(intentById('focus').durationMin).toBe(30);
    expect(intentById('relax').durationMin).toBe(30);
    expect(intentById('meditate').durationMin).toBe(20);
  });

  it('isIntentId / intentFromPresetName', () => {
    expect(isIntentId('sleep')).toBe(true);
    expect(isIntentId('nap')).toBe(false);
    expect(isIntentId(null)).toBe(false);
    expect(intentFromPresetName(intentPreset(intentById('relax')).title)?.id).toBe('relax');
    expect(intentFromPresetName('Something else')).toBeNull();
    expect(intentFromPresetName(null)).toBeNull();
  });

  it('bowlSetLayers: every bowl of the set, all on, at the given level', () => {
    const trio = BOWL_SETS.find((s) => s.id === 'himalayan-trio')!;
    const layers = bowlSetLayers('himalayan-trio', -28);
    expect(layers).toHaveLength(trio.bowls.length);
    for (const [i, b] of layers.entries()) {
      expect(b.on).toBe(true);
      expect(b.db).toBe(-28);
      expect(b.baseHz).toBe(trio.bowls[i].baseHz);
      expect(b.material).toBe(trio.bowls[i].material);
    }
    expect(bowlSetLayers('no-such-set', -28)).toEqual([]);
  });
});

describe('applyIntent', () => {
  it('Sleep: slow-wave preset, brown −30, no nature, no bowls, no bell, 45 min, 10-min fade', () => {
    const s = mockSession();
    expect(applyIntent(s, intentById('sleep'))).toBe(true);
    expect(s.loadPreset).toHaveBeenCalledWith(getPresetById('sleep-slow-wave-cue'));
    const noise = noiseCalls(s);
    expect(noise.brown).toBe(-30);
    for (const c of NOISE_COLORS) if (c !== 'brown') expect(noise[c]).toBe(-Infinity);
    expect(Object.keys(noise).sort()).toEqual([...NOISE_COLORS].sort());
    expect(s.setNoiseOn).toHaveBeenCalledWith(true);
    expect(s.setNature).toHaveBeenCalledWith({ on: false });
    expect(s.setBowls).toHaveBeenCalledWith([]);
    expect(s.setBellEveryMin).toHaveBeenCalledWith(0);
    expect(s.setLimitMin).toHaveBeenCalledWith(45);
    expect(s.setFadeOutSec).toHaveBeenCalledWith(600);
    expect(s.setLayersOn).toHaveBeenCalledWith(true);
    expect(s.start).toHaveBeenCalledTimes(1);
  });

  it('Focus: alpha preset, all noise off, 30 min, 30 s fade', () => {
    const s = mockSession();
    applyIntent(s, intentById('focus'));
    expect(s.loadPreset).toHaveBeenCalledWith(getPresetById('focus-alpha-flow'));
    for (const db of Object.values(noiseCalls(s))) expect(db).toBe(-Infinity);
    expect(s.setNature).toHaveBeenCalledWith({ on: false });
    expect(s.setBowls).toHaveBeenCalledWith([]);
    expect(s.setBellEveryMin).toHaveBeenCalledWith(0);
    expect(s.setLimitMin).toHaveBeenCalledWith(30);
    expect(s.setFadeOutSec).toHaveBeenCalledWith(30);
  });

  it('Relax: alpha ease, pink −34, rain −30 on, 30 min, 2-min fade', () => {
    const s = mockSession();
    applyIntent(s, intentById('relax'));
    expect(s.loadPreset).toHaveBeenCalledWith(getPresetById('relax-alpha-ease'));
    const noise = noiseCalls(s);
    expect(noise.pink).toBe(-34);
    expect(noise.brown).toBe(-Infinity);
    expect(noise.white).toBe(-Infinity);
    expect(s.setNature).toHaveBeenCalledWith({ on: true, kind: 'rain', db: -30 });
    expect(s.setBowls).toHaveBeenCalledWith([]);
    expect(s.setLimitMin).toHaveBeenCalledWith(30);
    expect(s.setFadeOutSec).toHaveBeenCalledWith(120);
  });

  it('Meditate: theta garden, Himalayan trio at −28, bell every 10 min, 20 min, 60 s fade', () => {
    const s = mockSession();
    applyIntent(s, intentById('meditate'));
    expect(s.loadPreset).toHaveBeenCalledWith(getPresetById('meditate-theta-garden'));
    for (const db of Object.values(noiseCalls(s))) expect(db).toBe(-Infinity);
    expect(s.setNature).toHaveBeenCalledWith({ on: false });
    const bowls = s.setBowls.mock.calls[0][0];
    expect(bowls).toHaveLength(3);
    for (const b of bowls) {
      expect(b.on).toBe(true);
      expect(b.db).toBe(-28);
    }
    expect(s.setBellEveryMin).toHaveBeenCalledWith(10);
    expect(s.setLimitMin).toHaveBeenCalledWith(20);
    expect(s.setFadeOutSec).toHaveBeenCalledWith(60);
  });

  it('start() runs last and its verdict is returned', () => {
    const s = mockSession(false);
    expect(applyIntent(s, intentById('sleep'))).toBe(false);
    const startOrder = s.start.mock.invocationCallOrder[0];
    for (const fn of [s.loadPreset, s.setNoiseDb, s.setNoiseOn, s.setNature, s.setBowls, s.setBellEveryMin, s.setLimitMin, s.setFadeOutSec, s.setLayersOn]) {
      for (const order of fn.mock.invocationCallOrder) expect(order).toBeLessThan(startOrder);
    }
  });
});

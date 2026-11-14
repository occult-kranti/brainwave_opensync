import { describe, expect, it } from 'vitest';
import { renderSession } from '@/engine';
import {
  cymaticsRecipe, LISTENING_LIMIT_SEC, LISTENING_PRESETS, listeningPhases, listeningPreviewId, validSaHz,
  type ListeningPreset,
} from '../listening';

function preset(id: string): ListeningPreset {
  const match = LISTENING_PRESETS.find((candidate) => candidate.id === id);
  if (!match) throw new Error(`Missing preset ${id}`);
  return match;
}

function toneComponent(samples: Float32Array, hz: number, sampleRate: number) {
  const from = sampleRate;
  const to = from + sampleRate;
  let real = 0;
  let imag = 0;
  for (let index = from; index < to; index++) {
    const angle = 2 * Math.PI * hz * index / sampleRate;
    real += samples[index] * Math.cos(angle);
    imag += samples[index] * Math.sin(angle);
  }
  return Math.hypot(real, imag) * 2 / sampleRate;
}

describe('Archaeoacoustics listening presets', () => {
  it('serializes distinct bounded previews and valid, explicit visual recipes', () => {
    expect(LISTENING_PRESETS).toHaveLength(16);
    expect(new Set(LISTENING_PRESETS.map(listeningPreviewId)).size).toBe(LISTENING_PRESETS.length);
    expect(new Set(LISTENING_PRESETS.map((item) => item.topic)).size).toBe(6);
    expect(preset('schumann-mode-sonification')).toMatchObject({ topic: 'brainwaves', relatedTopic: 'celestial' });
    for (const item of LISTENING_PRESETS) {
      const phases = listeningPhases(item);
      expect(phases.length).toBeGreaterThan(0);
      expect(phases.reduce((total, phase) => total + phase.durationSec, 0)).toBeLessThanOrEqual(LISTENING_LIMIT_SEC);
      expect(phases.every((phase) => phase.gainDb === -24 && phase.carrierHz >= 40 && phase.carrierHz <= 2000)).toBe(true);
      const look = cymaticsRecipe(item);
      if (!look) continue;
      expect(phases.map((phase) => phase.carrierHz)).toContain(look.hz);
      expect(look.hz).toBeLessThanOrEqual(1200);
    }
  });

  it('preserves the frequencies and distinguishes the fifth from harmonic five', () => {
    expect(listeningPhases(preset('newgrange-110'))[0].carrierHz).toBe(110);
    expect(listeningPhases(preset('cook-tone-series')).map((phase) => phase.carrierHz)).toEqual([90, 100, 110, 120, 130]);
    expect(listeningPhases(preset('interval-and-harmonic')).map((phase) => phase.carrierHz)).toEqual([100, 150, 100, 500]);
    expect(listeningPhases(preset('schumann-mode-sonification'))[0].carrierHz).toBeCloseTo(125.28, 8);
    expect(listeningPhases(preset('solar-p-mode-sonification'))[0].carrierHz).toBeCloseTo(98.304, 8);
    expect(listeningPhases(preset('cousto-earth-year'))[0].carrierHz).toBeCloseTo(136.1022078, 6);
  });

  it('bounds Sa and keeps its fifth and virtual plate in sync', () => {
    expect(validSaHz(NaN)).toBe(147);
    expect(validSaHz(0)).toBe(80);
    expect(validSaHz(400)).toBe(360);
    const sa = preset('sa-tonic');
    expect(listeningPhases(sa, 183.4).map((phase) => phase.carrierHz)).toEqual([183.4, 275.1, 183.4]);
    expect(cymaticsRecipe(sa, 183.4)?.hz).toBe(183.4);
  });

  it('synthesizes an amplitude envelope around 220 Hz with 210 Hz and 230 Hz sidebands', () => {
    const sampleRate = 8000;
    const plain = renderSession({ sampleRate, phases: listeningPhases(preset('plain-carrier')), masterGainDb: -6 });
    const modulated = renderSession({ sampleRate, phases: listeningPhases(preset('carrier-10hz')), masterGainDb: -6 });
    const component = (samples: Float32Array, hz: number) => toneComponent(samples, hz, sampleRate);
    expect(component(plain.left, 220)).toBeGreaterThan(0.02);
    expect(component(plain.left, 230)).toBeLessThan(1e-5);
    for (const sideband of [210, 230]) {
      expect(component(modulated.left, sideband) / component(modulated.left, 220)).toBeCloseTo(0.5, 4);
    }
    expect(component(modulated.left, 10)).toBeLessThan(1e-5);
    expect(modulated.left.every((sample, index) => sample === modulated.right[index])).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { DEFAULT_LOOK, parseLook, SCENES, sceneLook } from '../instrument/scenes';
import { makeTone } from '../instrument/signal';

describe('cymatic instrument recipes and previews', () => {
  it('round trips every scene without persisting a live input', () => {
    for (const scene of SCENES) {
      const look = sceneLook(scene);
      expect(parseLook({ ...JSON.parse(JSON.stringify(look)), input: 'mic' })).toEqual(look);
    }
  });

  it('bounds imported controls and handles stale or malformed values', () => {
    const look = parseLook({ scene: 'unknown', hz: 90000, detail: -25, phase: '100', effect: 'missing' });
    expect(look).toEqual({ ...DEFAULT_LOOK, hz: 1200, detail: 0 });
  });

  it('fades both ends and bounds each waveform preview', () => {
    for (const kind of ['sine', 'triangle', 'square', 'sawtooth'] as const) {
      const tone = makeTone(440, kind);
      expect(tone.length).toBe(384000);
      expect(tone[0]).toBe(0);
      expect(Math.abs(tone.at(-1)!)).toBe(0);
      expect(tone.some((value) => Math.abs(value) > 0.4)).toBe(true);
      expect(tone.every((value) => Math.abs(value) <= 0.551)).toBe(true);
    }
  });
});

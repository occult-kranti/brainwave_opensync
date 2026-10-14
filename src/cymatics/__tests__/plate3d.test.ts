/**
 * plate3d pure-core tests — palette monotonicity, camera projection sanity,
 * and the displacement-field height mapping. Canvas drawing itself is covered
 * by the page-level smoke tests.
 */
import { describe, expect, it } from 'vitest';
import {
  GOLD_PLATE_STOPS,
  PLATE3D_BACKGROUND,
  fieldHeight,
  projectPoint,
  rampGold,
  type Camera,
} from '../plate3d';

const CAM: Camera = { yaw: 0.4, tilt: 1.02, dist: 2.1, cx: 200, cy: 200, scale: 180 };

describe('gold plate palette', () => {
  it('stops are ordered and span [0,1]', () => {
    expect(GOLD_PLATE_STOPS[0].t).toBe(0);
    expect(GOLD_PLATE_STOPS[GOLD_PLATE_STOPS.length - 1].t).toBe(1);
    for (let i = 1; i < GOLD_PLATE_STOPS.length; i++) {
      expect(GOLD_PLATE_STOPS[i].t).toBeGreaterThan(GOLD_PLATE_STOPS[i - 1].t);
    }
  });

  it('ramp luminance rises monotonically from dark node to golden crest', () => {
    const lum = (t: number) => { const [r, g, b] = rampGold(t); return r + g + b; };
    let prev = -1;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const l = lum(t);
      expect(l).toBeGreaterThanOrEqual(prev);
      prev = l;
    }
  });

  it('clamps out-of-range and NaN inputs', () => {
    expect(rampGold(-3)).toEqual(GOLD_PLATE_STOPS[0].rgb);
    expect(rampGold(9)).toEqual(GOLD_PLATE_STOPS[GOLD_PLATE_STOPS.length - 1].rgb);
    expect(rampGold(NaN)).toEqual(GOLD_PLATE_STOPS[0].rgb);
  });

  it('matches the photographed plate: dark warm background, ivory-gold sand', () => {
    expect(PLATE3D_BACKGROUND[0]).toBeLessThan(20);
    const crest = rampGold(1);
    expect(crest[0]).toBeGreaterThan(200); // warm red channel leads
    expect(crest[0]).toBeGreaterThan(crest[2]); // warm, not white-blue
  });
});

describe('camera projection', () => {
  it('projects finite, on-screen points for the plate domain', () => {
    for (const [x, y] of [[-1, -1], [1, 1], [0, 0], [1, -1]] as const) {
      const p = projectPoint(x, y, 0.3, CAM);
      expect(Number.isFinite(p.px)).toBe(true);
      expect(Number.isFinite(p.py)).toBe(true);
      expect(p.px).toBeGreaterThan(-100);
      expect(p.px).toBeLessThan(500);
    }
  });

  it('farther points get smaller perspective factors', () => {
    const near = projectPoint(0, -1, 0, CAM); // front edge after tilt
    const far = projectPoint(0, 1, 0, CAM);
    expect(far.depth).toBeGreaterThan(near.depth);
    expect(far.persp).toBeLessThan(near.persp);
  });
});

describe('displacement height mapping', () => {
  it('z equals the plate field scaled by amp and breathing factor', () => {
    const field = (x: number, y: number) => Math.sin(Math.PI * x) * Math.cos(Math.PI * y);
    const z = fieldHeight(field, 0, 0, 0.34, 1);
    expect(z).toBeCloseTo(field(0.5, 0.5) * 0.34, 12);
  });

  it('nodal lines (field = 0) sit at zero height — the valleys where sand settles', () => {
    const field = (x: number, y: number) => Math.sin(2 * Math.PI * x) * Math.sin(2 * Math.PI * y);
    expect(fieldHeight(field, 0, 0, 0.34, 1)).toBeCloseTo(0, 12); // domain center (0,0) -> plate (0.5,0.5) node
    const crest = fieldHeight(field, -0.5, -0.5, 0.34, 1);
    expect(Math.abs(crest)).toBeGreaterThan(0.2);
  });
});

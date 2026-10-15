import { describe, expect, it } from 'vitest';
import { projectPoint, resonancePoint } from '../resonanceGeometry';

describe('visual geometry', () => {
  it('keeps both surfaces and the perspective finite through a full rotation', () => {
    for (const dimension of ['3d', '4d'] as const) for (let t = 0; t < Math.PI * 2; t += .3) for (let u = 0; u < Math.PI * 2; u += .4) for (let v = 0; v < Math.PI * 2; v += .5) {
      const p = projectPoint(resonancePoint(u, v, t, dimension), 100);
      for (const n of [p.x, p.y, p.z]) expect(Number.isFinite(n)).toBe(true);
      expect(Math.abs(p.x)).toBeLessThan(400);
      expect(Math.abs(p.y)).toBeLessThan(400);
    }
  });
  it('closes each surface at the parameter seams', () => {
    for (const dimension of ['3d', '4d'] as const) {
      const p = resonancePoint(0, .8, .3, dimension), q = resonancePoint(Math.PI * 2, .8, .3, dimension);
      expect(p.x).toBeCloseTo(q.x, 10); expect(p.y).toBeCloseTo(q.y, 10); expect(p.z).toBeCloseTo(q.z, 10);
    }
  });
});

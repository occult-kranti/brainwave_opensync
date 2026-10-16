import { describe, expect, it } from "vitest";
import {
  compositionForRoute,
  rotateClifford,
  worldBudget,
  worldPoint,
} from "../worldGeometry";

describe("immersive world geometry", () => {
  it("preserves the unit 3-sphere under both independent 4D plane rotations", () => {
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.27) {
      for (let u = 0; u < Math.PI * 2; u += 0.43) {
        const p = rotateClifford(u, u * 1.7, angle);
        expect(p.x ** 2 + p.y ** 2 + p.z ** 2 + p.w ** 2).toBeCloseTo(1, 12);
      }
    }
  });
  it("has no projection singularity through a complete four-dimensional rotation", () => {
    for (let a = 0; a < Math.PI * 2; a += 0.25)
      for (let u = 0; u < Math.PI * 2; u += 0.33)
        for (let v = 0; v < Math.PI * 2; v += 0.41) {
          const p = worldPoint(u, v, a, "4d");
          expect(Number.isFinite(p.x + p.y + p.z)).toBe(true);
          // The 1.75 projection distance stays outside the unit hypersphere.
          expect(Math.hypot(p.x, p.y, p.z)).toBeLessThan(3.067);
        }
  });
  it("closes both parameter seams in both dimensions", () => {
    for (const dimension of ["3d", "4d"] as const)
      for (const angle of [0, 0.7, 3.1, 6.1]) {
        const start = worldPoint(0.31, 0.67, angle, dimension);
        for (const end of [
          worldPoint(0.31 + Math.PI * 2, 0.67, angle, dimension),
          worldPoint(0.31, 0.67 + Math.PI * 2, angle, dimension),
        ]) {
          expect(end.x).toBeCloseTo(start.x, 10);
          expect(end.y).toBeCloseTo(start.y, 10);
          expect(end.z).toBeCloseTo(start.z, 10);
        }
      }
  });
  it("changes composition between reading, listening and making while keeping the left copy area clear", () => {
    const home = compositionForRoute("/"),
      research = compositionForRoute("/research-hub"),
      studio = compositionForRoute("/studio");
    expect(home.x).toBeGreaterThan(2);
    expect(research.x).toBeGreaterThan(home.x);
    expect(research.cool).toBeGreaterThan(home.cool);
    expect(studio.tilt).not.toBe(research.tilt);
  });
  it("bounds mobile and light geometry, frame rate and pixel ratio", () => {
    const desktop = worldBudget(1440, "balanced", 3),
      mobile = worldBudget(390, "balanced", 3),
      light = worldBudget(1440, "light", 3);
    expect(desktop.dpr).toBe(1.5);
    expect(desktop.fps).toBe(30);
    expect(mobile.dpr).toBe(1);
    expect(light.dpr).toBe(1);
    expect(mobile.strands * mobile.segments).toBeLessThan(
      desktop.strands * desktop.segments,
    );
    expect(mobile.particles).toBeLessThan(desktop.particles);
    expect(mobile.fps).toBe(20);
  });
});

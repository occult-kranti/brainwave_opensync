import { describe, expect, it } from "vitest";
import {
  SAND_FORMS,
  cliffordPoint,
  formPoint,
  grainBudget,
  mixPoints,
  projectFour,
  rotateFour,
  seededRandom,
} from "./math";

describe("dimensional sand geometry", () => {
  it("keeps the Clifford torus on the unit 3-sphere through XW and YW rotations", () => {
    for (let i = 0; i < 80; i++) {
      const p = rotateFour(
        cliffordPoint(i * 0.37, i * 0.13),
        i * 0.43,
        i * 0.17,
      );
      expect(p.reduce((sum, x) => sum + x * x, 0)).toBeCloseTo(1, 12);
    }
  });
  it("has no perspective pole over a full sweep of both fourth-coordinate rotations", () => {
    for (let i = 0; i < 60; i++)
      for (let j = 0; j < 40; j++) {
        const q = projectFour(
          rotateFour(
            cliffordPoint(i * 0.17, j * 0.29),
            (i / 59) * Math.PI * 2,
            (j / 39) * Math.PI * 2,
          ),
        );
        expect(q.every(Number.isFinite)).toBe(true);
        expect(Math.hypot(...q)).toBeLessThan(1.5);
      }
    expect(projectFour([0, 0, 0, 1.15], 1.15).every(Number.isFinite)).toBe(
      true,
    );
  });
  it("moves the actual 3D projection when a fourth-coordinate rotation changes", () => {
    const a = formPoint("clifford", 1.1, 2.3, 0, 0, 0);
    const b = formPoint("clifford", 1.1, 2.3, 0, Math.PI / 2, 0);
    expect(Math.hypot(...a.map((x, i) => x - b[i]))).toBeGreaterThan(0.4);
  });
  it("has bounded, distinct forms with exact morph endpoints", () => {
    const points = SAND_FORMS.map((f) =>
      formPoint(f.id, 1.4, 3.6, 0.2, 0.7, 0.2),
    );
    for (const p of points) {
      expect(p.every(Number.isFinite)).toBe(true);
      expect(Math.hypot(...p)).toBeLessThan(5);
    }
    for (let i = 1; i < points.length; i++)
      expect(
        Math.hypot(...points[i].map((v, k) => v - points[i - 1][k])),
      ).toBeGreaterThan(0.15);
    expect(mixPoints(points[0], points[1], 0)).toEqual(points[0]);
    expect(mixPoints(points[0], points[1], 1)).toEqual(points[1]);
  });
  it("caps mobile and lower-core budgets and remains deterministic", () => {
    expect(grainBudget(80000, 390, 8)).toBe(24000);
    expect(grainBudget(80000, 1440, 2)).toBe(24000);
    expect(grainBudget(800000, 1440, 8)).toBe(80000);
    const a = seededRandom(55),
      b = seededRandom(55);
    expect(Array.from({ length: 100 }, a)).toEqual(
      Array.from({ length: 100 }, b),
    );
  });
});

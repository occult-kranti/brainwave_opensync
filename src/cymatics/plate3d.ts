/**
 * plate3d — 3D cymatics plate renderer (pure canvas, no WebGL).
 *
 * The plate surface height IS the displacement field: z = u(x,y) × amp, so
 * antinodes rise as glowing ridges and nodal lines sit in the dark valleys.
 * Sand particles (shared SandState from chladni.ts) drift along −∇|u| toward
 * the nodes — the same physics as the 2D sand mode, now readable as terrain.
 *
 * The GOLD_PLATE palette is sampled from a photographed steel-plate Chladni
 * figure (warm ivory-gold sand on a dark oiled plate).
 *
 * The numeric core (projectPoint, fieldHeight, rampGold) is pure and
 * node-testable; drawPlate3D is the canvas wrapper.
 */

import type { SandState } from './chladni';

export type Rgb = readonly [number, number, number];

/** Palette stops by normalized |displacement| t ∈ [0,1] — dark node → hot crest. */
export const GOLD_PLATE_STOPS: readonly { t: number; rgb: Rgb }[] = [
  { t: 0.0, rgb: [12, 9, 7] },
  { t: 0.22, rgb: [44, 34, 26] },
  { t: 0.45, rgb: [97, 81, 66] },
  { t: 0.68, rgb: [160, 138, 115] },
  { t: 0.86, rgb: [209, 188, 167] },
  { t: 1.0, rgb: [240, 226, 205] },
];

export const PLATE3D_BACKGROUND: Rgb = [10, 8, 6];

/** Sample the golden ramp at t (clamped, piecewise-linear). */
export function rampGold(t: number): Rgb {
  const x = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0;
  for (let i = 1; i < GOLD_PLATE_STOPS.length; i++) {
    const hi = GOLD_PLATE_STOPS[i];
    if (x <= hi.t) {
      const lo = GOLD_PLATE_STOPS[i - 1];
      const f = (x - lo.t) / Math.max(1e-9, hi.t - lo.t);
      return [
        Math.round(lo.rgb[0] + (hi.rgb[0] - lo.rgb[0]) * f),
        Math.round(lo.rgb[1] + (hi.rgb[1] - lo.rgb[1]) * f),
        Math.round(lo.rgb[2] + (hi.rgb[2] - lo.rgb[2]) * f),
      ];
    }
  }
  return GOLD_PLATE_STOPS[GOLD_PLATE_STOPS.length - 1].rgb;
}

/** Displacement height at plate-domain point (x, y ∈ [-1,1]²) with slow breathing. */
export function fieldHeight(
  field: (x: number, y: number) => number,
  x: number,
  y: number,
  amp: number,
  breathe: number,
): number {
  return field((x + 1) / 2, (y + 1) / 2) * amp * breathe;
}

export interface ProjectedPoint {
  px: number;
  py: number;
  /** Camera-space depth (bigger = farther). */
  depth: number;
  persp: number;
  z: number;
}

export interface Camera {
  yaw: number;
  tilt: number;
  dist: number;
  cx: number;
  cy: number;
  scale: number;
}

/** Rotate (yaw about plane normal, tilt about X) and perspective-project. */
export function projectPoint(x: number, y: number, z: number, cam: Camera): ProjectedPoint {
  const cosY = Math.cos(cam.yaw);
  const sinY = Math.sin(cam.yaw);
  const xr = x * cosY - y * sinY;
  const yr = x * sinY + y * cosY;
  const cosT = Math.cos(cam.tilt);
  const sinT = Math.sin(cam.tilt);
  const yv = yr * cosT - z * sinT;
  const zv = yr * sinT + z * cosT;
  const persp = cam.dist / Math.max(0.35, cam.dist + zv);
  return {
    px: cam.cx + xr * cam.scale * persp,
    py: cam.cy + yv * cam.scale * 0.68 * persp,
    depth: zv,
    persp,
    z,
  };
}

const css = (rgb: Rgb, alpha = 1): string => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;

export interface Plate3DDrawOptions {
  /** Seconds since start (drives yaw sway + amplitude breathing). */
  time: number;
  /** Amplitude scale of the terrain (displacement exaggeration). */
  amp: number;
  /** Extra glow 0..1 from audio energy. */
  energy: number;
  /** Grid resolution (lines drawn every `stride`). */
  gridX: number;
  gridY: number;
  stride: number;
  /** Sand particles (already stepped by the caller). */
  particles: SandState | null;
  /** Still camera for reduced-motion renders. */
  still?: boolean;
}

/**
 * Draw the plate as a golden height-field terrain with sand settling in the
 * nodal valleys. Row-first grid strokes, depth-sorted particles on top.
 */
export function drawPlate3D(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  field: (x: number, y: number) => number,
  opts: Plate3DDrawOptions,
): void {
  const { time, amp, energy, gridX, gridY, stride, particles, still } = opts;
  const t = still ? 4 : time;
  const cam: Camera = {
    yaw: still ? 0.42 : 0.42 + 0.28 * Math.sin(t * 0.09),
    tilt: 1.02,
    dist: 2.1,
    cx: w / 2,
    cy: h * 0.6,
    scale: Math.min(w, h) * 0.46,
  };
  const breathe = 1 + (still ? 0 : 0.07 * Math.sin(t * 0.7));
  const ampNow = amp * (1 + energy * 0.45);

  ctx.fillStyle = css(PLATE3D_BACKGROUND);
  ctx.fillRect(0, 0, w, h);

  const glow = 0.72 + energy * 0.28;

  // Mesh: stride-spaced rows and columns, segment-colored by |displacement|.
  ctx.lineCap = 'round';
  const segLen = 4;
  const drawPolyline = (pts: ProjectedPoint[], vals: number[]) => {
    for (let s = 0; s < pts.length - 1; s += segLen) {
      const end = Math.min(pts.length - 1, s + segLen);
      const v = vals.slice(s, end + 1).reduce((a, b) => a + b, 0) / (end - s + 1);
      const dim = 1 - Math.min(0.45, Math.max(0, (pts[s].depth + 0.9) * 0.18));
      const c = rampGold(v * glow);
      ctx.strokeStyle = css([Math.round(c[0] * dim), Math.round(c[1] * dim), Math.round(c[2] * dim)], 0.9);
      ctx.lineWidth = 1.1 * pts[s].persp;
      ctx.beginPath();
      ctx.moveTo(pts[s].px, pts[s].py);
      for (let k = s + 1; k <= end; k++) ctx.lineTo(pts[k].px, pts[k].py);
      ctx.stroke();
    }
  };

  for (let j = 0; j < gridY; j += stride) {
    const y = (j / (gridY - 1)) * 2 - 1;
    const pts: ProjectedPoint[] = [];
    const vals: number[] = [];
    for (let i = 0; i < gridX; i++) {
      const x = (i / (gridX - 1)) * 2 - 1;
      const z = fieldHeight(field, x, y, ampNow, breathe);
      pts.push(projectPoint(x, y, z, cam));
      vals.push(Math.min(1, Math.abs(field((x + 1) / 2, (y + 1) / 2)) * 1.35));
    }
    drawPolyline(pts, vals);
  }
  for (let i = 0; i < gridX; i += stride) {
    const x = (i / (gridX - 1)) * 2 - 1;
    const pts: ProjectedPoint[] = [];
    const vals: number[] = [];
    for (let j = 0; j < gridY; j++) {
      const y = (j / (gridY - 1)) * 2 - 1;
      const z = fieldHeight(field, x, y, ampNow, breathe);
      pts.push(projectPoint(x, y, z, cam));
      vals.push(Math.min(1, Math.abs(field((x + 1) / 2, (y + 1) / 2)) * 1.35));
    }
    drawPolyline(pts, vals);
  }

  // Sand: depth-sorted golden grains sitting on the terrain.
  if (particles && particles.count > 0) {
    const n = particles.count;
    const items: { depth: number; px: number; py: number; persp: number; v: number }[] = [];
    for (let k = 0; k < n; k++) {
      const x = particles.x[k] * 2 - 1;
      const y = particles.y[k] * 2 - 1;
      const u = field(particles.x[k], particles.y[k]);
      const z = u * ampNow * breathe + 0.015;
      const p = projectPoint(x, y, z, cam);
      items.push({ depth: p.depth, px: p.px, py: p.py, persp: p.persp, v: Math.min(1, Math.abs(u) * 1.35) });
    }
    items.sort((a, b) => b.depth - a.depth);
    const core = rampGold(0.95);
    for (const it of items) {
      const r = 1.05 * it.persp;
      // halo + grain core as rects (happy-dom-compatible: no ctx.arc in tests)
      ctx.fillStyle = css(rampGold(Math.min(1, it.v + 0.3)), 0.16);
      ctx.fillRect(it.px - r * 2.6, it.py - r * 2.6, r * 5.2, r * 5.2);
      ctx.fillStyle = css(core, 0.85);
      ctx.fillRect(it.px - r, it.py - r, r * 2, r * 2);
    }
  }
}

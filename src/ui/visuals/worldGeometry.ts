/** Original parametric installation. No third-party geometry or textures. */
export interface WorldPoint {
  x: number;
  y: number;
  z: number;
}
export interface WorldComposition {
  x: number;
  y: number;
  scale: number;
  turn: number;
  tilt: number;
  cool: number;
  motif: number;
}

/** Independent rotations preserve the unit Clifford torus in R4. */
export function rotateClifford(u: number, v: number, angle: number) {
  const a = Math.cos(u) / Math.SQRT2;
  const b = Math.sin(u) / Math.SQRT2;
  const c = Math.cos(v) / Math.SQRT2;
  const d = Math.sin(v) / Math.SQRT2;
  return {
    x: a * Math.cos(angle) - d * Math.sin(angle),
    y: b * Math.cos(angle * 0.7) - c * Math.sin(angle * 0.7),
    z: b * Math.sin(angle * 0.7) + c * Math.cos(angle * 0.7),
    w: a * Math.sin(angle) + d * Math.cos(angle),
  };
}

/** Bounded perspective projection; the eye stays outside the unit 3-sphere. */
export function worldPoint(
  u: number,
  v: number,
  fourth: number,
  dimension: "3d" | "4d",
  motif = 0,
): WorldPoint {
  if (dimension === "4d") {
    const p = rotateClifford(u, v, fourth);
    const perspective = 2.3 / (1.75 - p.w);
    return { x: p.x * perspective, y: p.y * perspective, z: p.z * perspective };
  }
  const twist = v + 0.3 * Math.sin(u * 3 + motif);
  const r = 0.42 + 0.055 * Math.sin(u * 7 + v * 3 + motif);
  const ring = 1.03 + 0.12 * Math.sin(u * 3 + motif);
  return {
    x: (ring + r * Math.cos(twist)) * Math.cos(u),
    y: (ring + r * Math.cos(twist)) * Math.sin(u),
    z: r * Math.sin(twist) + 0.1 * Math.sin(u * 3),
  };
}

export function compositionForRoute(route: string): WorldComposition {
  if (route === "/" || route === "")
    return {
      x: 2.3,
      y: 0.3,
      scale: 1.7,
      turn: -0.3,
      tilt: 0.8,
      cool: 0.1,
      motif: 0,
    };
  if (/research|theory|sources|evidence|science|safety|help/.test(route))
    return {
      x: 2.8,
      y: 0.5,
      scale: 1.8,
      turn: 0.7,
      tilt: 0.4,
      cool: 0.8,
      motif: 2,
    };
  if (/studio|harmonic|sonic|designer|frequency|test/.test(route))
    return {
      x: 2.35,
      y: 0.3,
      scale: 1.75,
      turn: 0.5,
      tilt: 1.1,
      cool: 0.55,
      motif: 1,
    };
  if (/listen|session|sleep|dream/.test(route))
    return {
      x: 2.4,
      y: 0.2,
      scale: 1.85,
      turn: -0.7,
      tilt: 0.65,
      cool: 0.55,
      motif: 3,
    };
  if (/cymatics/.test(route))
    return {
      x: 2.7,
      y: 0.4,
      scale: 1.7,
      turn: 0.2,
      tilt: 0.5,
      cool: 0.4,
      motif: 0,
    };
  return {
    x: 2.6,
    y: 0.35,
    scale: 1.75,
    turn: -0.15,
    tilt: 1.05,
    cool: 0.2,
    motif: 1.5,
  };
}

export function worldBudget(
  width: number,
  quality: "balanced" | "light",
  pixelRatio: number,
) {
  const light = quality === "light" || width < 700;
  return {
    dpr: Math.min(Math.max(1, pixelRatio || 1), light ? 1 : 1.5),
    strands: light ? 48 : 88,
    segments: light ? 88 : 144,
    particles: light ? 1200 : 2800,
    fps: light ? 20 : 30,
  };
}

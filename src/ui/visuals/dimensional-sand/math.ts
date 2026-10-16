/** Original parametric sand artwork. Coordinates are mathematical, not extra physical dimensions. */
export const SAND_FORMS = [
  {
    id: "clifford",
    label: "Clifford bloom",
    detail: "A rotating four-coordinate torus, projected into 3D.",
  },
  {
    id: "torus",
    label: "Toroidal tide",
    detail: "Nested sand ribbons winding around a toroidal field.",
  },
  {
    id: "vortex",
    label: "Vortex cathedral",
    detail: "Spiralling grain columns with an open central axis.",
  },
  {
    id: "dunes",
    label: "Dune interference",
    detail: "Intersecting wave fronts sculpted into a granular landscape.",
  },
  {
    id: "plate",
    label: "Nodal garden",
    detail: "Sampled plate nodes, lifted into an artistic relief.",
  },
] as const;
export type SandForm = (typeof SAND_FORMS)[number]["id"];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];
export type SandPalette = "copper" | "glacier" | "ivory";
export const PALETTES: Record<SandPalette, [string, string, string]> = {
  copper: ["#b65e38", "#f1d9b6", "#83c9d5"],
  glacier: ["#387f91", "#c6e7ec", "#c99b74"],
  ivory: ["#927b62", "#fff0d0", "#91b1b0"],
};
export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function cliffordPoint(u: number, v: number): Vec4 {
  const r = Math.SQRT1_2;
  return [r * Math.cos(u), r * Math.sin(u), r * Math.cos(v), r * Math.sin(v)];
}
/** Orthogonal XW then YW rotations; norm in R4 is preserved. */
export function rotateFour(p: Vec4, angle: number, tilt: number): Vec4 {
  const c = Math.cos(angle),
    s = Math.sin(angle),
    ct = Math.cos(tilt),
    st = Math.sin(tilt);
  const x = p[0] * c - p[3] * s,
    w = p[0] * s + p[3] * c;
  return [x, p[1] * ct - w * st, p[2], p[1] * st + w * ct];
}
/** Perspective from w=2.6, outside the unit 3-sphere: no singularity in valid geometry. */
export function projectFour(p: Vec4, distance = 2.6): Vec3 {
  const d = Math.max(1.15, Number.isFinite(distance) ? distance : 2.6);
  const scale = 2.25 / Math.max(0.15, d - p[3]);
  return [p[0] * scale, p[1] * scale, p[2] * scale];
}
export function formPoint(
  form: SandForm,
  u: number,
  v: number,
  layer: number,
  rotation = 0,
  tilt = 0,
): Vec3 {
  if (form === "clifford") {
    const p = projectFour(rotateFour(cliffordPoint(u, v), rotation, tilt));
    return [p[0] * 1.75, p[1] * 1.75, p[2] * 1.75];
  }
  if (form === "torus") {
    const tube = 0.38 + layer * 0.18;
    const band = (Math.PI * 2) / 9;
    const twist = Math.floor(v / band) * band + (v % band) * 0.12 + u * 3;
    const r = 1.35 + tube * Math.cos(twist);
    return [r * Math.cos(u), tube * Math.sin(twist), r * Math.sin(u)];
  }
  if (form === "vortex") {
    const y = (v / Math.PI - 1) * 1.8;
    const r = 0.35 + 0.7 * Math.pow(Math.abs(y), 1.3) + layer * 0.2;
    const rib = (Math.PI * 2) / 24;
    const a = Math.floor(u / rib) * rib + (u % rib) * 0.15 + y * 2.3;
    return [r * Math.cos(a), y, r * Math.sin(a)];
  }
  const x = (u / Math.PI - 1) * 1.8,
    z = (v / Math.PI - 1) * 1.8;
  if (form === "dunes")
    return [
      x,
      0.24 * Math.sin(x * 4.5) * Math.cos(z * 3.2) +
        0.16 * Math.sin((x + z) * 5) +
        layer * 0.12,
      z,
    ];
  return [x, layer * 0.08, z];
}
export function mixPoints(a: Vec3, b: Vec3, mix: number): Vec3 {
  const t = Math.max(0, Math.min(1, mix));
  if (t === 0) return [...a];
  if (t === 1) return [...b];
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}
export function grainBudget(
  requested: number,
  width: number,
  cores = 4,
): number {
  const cap = width < 650 || cores < 4 ? 24000 : 80000;
  return Math.max(
    2000,
    Math.min(cap, Math.round(Number.isFinite(requested) ? requested : 40000)),
  );
}

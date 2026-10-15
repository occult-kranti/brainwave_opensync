export type FieldDimension = '3d' | '4d';
export interface Point3 { x: number; y: number; z: number }
/** A toroidal surface or a stereographic projection of a rotated Clifford torus in R4. */
export function resonancePoint(u: number, v: number, rotation: number, dimension: FieldDimension): Point3 {
  let x: number, y: number, z: number;
  if (dimension === '4d') {
    const a = Math.cos(u) / Math.SQRT2, b = Math.sin(u) / Math.SQRT2;
    const c = Math.cos(v) / Math.SQRT2, d = Math.sin(v) / Math.SQRT2;
    const theta = rotation * .32 + .45;
    const xr = a * Math.cos(theta) - d * Math.sin(theta);
    const wr = a * Math.sin(theta) + d * Math.cos(theta);
    const yr = b * Math.cos(theta * .7) - c * Math.sin(theta * .7);
    const zr = b * Math.sin(theta * .7) + c * Math.cos(theta * .7);
    const scale = 1 / (1.7 - wr);
    x = xr * scale * 2.4; y = yr * scale * 2.4; z = zr * scale * 2.4;
  } else {
    const r = .36 + .045 * Math.cos(u * 6 + v * 3);
    const twist = v + .24 * Math.sin(u * 3);
    x = (1 + r * Math.cos(twist)) * Math.cos(u);
    y = (1 + r * Math.cos(twist)) * Math.sin(u);
    z = r * Math.sin(twist);
  }
  const tilt = .93;
  const yy = y * Math.cos(tilt) - z * Math.sin(tilt), zz = y * Math.sin(tilt) + z * Math.cos(tilt);
  return { x: x * Math.cos(rotation) + zz * Math.sin(rotation), y: yy, z: -x * Math.sin(rotation) + zz * Math.cos(rotation) };
}
export function projectPoint(p: Point3, size: number): Point3 {
  const perspective = 4.8 / (4.8 + p.z);
  return { x: p.x * size * perspective, y: p.y * size * perspective, z: p.z };
}

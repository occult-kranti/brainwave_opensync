import { readJson, STORAGE_KEYS } from "@/lib/storage";
export type FieldMaterial = "silk" | "threads" | "particles";
export interface SpatialSettings {
  dimension: "3d" | "4d";
  material: FieldMaterial;
  zoom: number;
  resetToken: number;
  rotation: number;
  fourth: number;
  motion: boolean;
  ambient: boolean;
  quality: "balanced" | "light";
}
export const DEFAULT_SPATIAL: SpatialSettings = {
  resetToken: 0,
  dimension: "3d",
  material: "silk",
  zoom: 1,
  rotation: 0.35,
  fourth: 30,
  motion: true,
  ambient: true,
  quality: "balanced",
};
export const MIN_ZOOM = 0.5,
  MAX_ZOOM = 1.8;
export function clampZoom(value: number): number {
  return Number.isFinite(value)
    ? Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)) * 100) / 100
    : 1;
}
export function sanitizeSpatial(value: unknown): SpatialSettings {
  const v =
    value && typeof value === "object"
      ? (value as Partial<SpatialSettings>)
      : {};
  return {
    ...DEFAULT_SPATIAL,
    resetToken: typeof v.resetToken === "number" && Number.isFinite(v.resetToken) ? v.resetToken : 0,
    dimension: v.dimension === "4d" ? "4d" : "3d",
    material:
      v.material === "threads" || v.material === "particles"
        ? v.material
        : "silk",
    zoom: clampZoom(typeof v.zoom === "number" ? v.zoom : 1),
    rotation:
      typeof v.rotation === "number" && Number.isFinite(v.rotation)
        ? v.rotation % (Math.PI * 2)
        : 0.35,
    fourth:
      typeof v.fourth === "number" && Number.isFinite(v.fourth)
        ? Math.max(0, Math.min(360, v.fourth))
        : 30,
    motion: typeof v.motion === "boolean" ? v.motion : true,
    ambient: typeof v.ambient === "boolean" ? v.ambient : true,
    quality: v.quality === "light" ? "light" : "balanced",
  };
}
export function readSpatial(): SpatialSettings {
  return sanitizeSpatial(readJson(STORAGE_KEYS.spatial, 1));
}

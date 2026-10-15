import { createContext, useContext } from "react";
import type { SpatialSettings } from "./spatialState";
export interface SpatialContextValue {
  settings: SpatialSettings;
  update: (value: Partial<SpatialSettings>) => void;
  zoomBy: (delta: number) => void;
  turn: (delta: number) => void;
  resetView: () => void;
  immersive: boolean;
  setImmersive: (open: boolean) => void;
}
export const SpatialContext = createContext<SpatialContextValue | null>(null);
export function useSpatial() {
  return useContext(SpatialContext);
}

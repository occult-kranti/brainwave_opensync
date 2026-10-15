import { useEffect, useMemo, useState, type ReactNode } from "react";
import { writeJson, STORAGE_KEYS } from "@/lib/storage";
import {
  clampZoom,
  readSpatial,
  sanitizeSpatial,
  type SpatialSettings,
} from "./spatialState";
import { SpatialContext } from "./spatialContext";
export function SpatialProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(() => {
    const value = readSpatial();
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? { ...value, motion: false }
      : value;
  });
  const [immersive, setImmersive] = useState(false);
  useEffect(() => {
    writeJson(STORAGE_KEYS.spatial, 1, settings);
  }, [settings]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (media.matches) setSettings((s) => ({ ...s, motion: false }));
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const value = useMemo(
    () => ({
      settings,
      immersive,
      setImmersive,
      update: (next: Partial<SpatialSettings>) =>
        setSettings((s) => sanitizeSpatial({ ...s, ...next })),
      zoomBy: (delta: number) =>
        setSettings((s) => ({ ...s, zoom: clampZoom(s.zoom + delta) })),
      turn: (delta: number) =>
        setSettings((s) => ({ ...s, rotation: s.rotation + delta })),
      resetView: () =>
        setSettings((s) => ({ ...s, zoom: 1, rotation: 0.35, fourth: 30, resetToken: s.resetToken + 1 })),
    }),
    [settings, immersive],
  );
  return (
    <SpatialContext.Provider value={value}>{children}</SpatialContext.Provider>
  );
}

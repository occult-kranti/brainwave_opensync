import { useEffect, useRef, useState } from "react";
import { useSpatial } from "./spatialContext";
import { DEFAULT_SPATIAL } from "./spatialState";
import type { WorldController } from "./worldRenderer";

/** Persistent decorative space. Functional pages remain normal accessible HTML. */
export function ResonantWorld({
  route,
  immersive = false,
}: {
  route: string;
  immersive?: boolean;
}) {
  const spatial = useSpatial();
  const settings = spatial?.settings ?? DEFAULT_SPATIAL;
  const suspended =
    !immersive && (Boolean(spatial?.immersive) || route.includes("/cymatics"));
  const enabled = immersive || settings.ambient;
  const host = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    fallbackCanvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<WorldController | null>(null);
  const [renderer, setRenderer] = useState<
    "loading" | "webgl" | "canvas" | "unavailable"
  >("loading");
  const latest = useRef({ settings, route, suspended });
  useEffect(() => {
    latest.current = { settings, route, suspended };
    controller.current?.update(settings, route, suspended);
  }, [settings, route, suspended]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false,
      fallingBack = false;
    const startFallback = async () => {
      if (cancelled || fallingBack) return;
      fallingBack = true;
      controller.current?.dispose();
      controller.current = null;
      try {
        const { createCanvasWorld } = await import("./worldCanvas");
        if (cancelled || !host.current || !fallbackCanvas.current) return;
        const state = latest.current;
        controller.current = createCanvasWorld(
          fallbackCanvas.current,
          host.current,
          state.settings,
          state.route,
          immersive,
        );
        controller.current?.update(
          state.settings,
          state.route,
          state.suspended,
        );
        setRenderer(controller.current ? "canvas" : "unavailable");
      } catch {
        if (!cancelled) setRenderer("unavailable");
      }
    };
    if (typeof WebGL2RenderingContext === "undefined") void startFallback();
    else
      void import("./worldRenderer")
        .then(({ createWorldRenderer }) => {
          if (cancelled || !canvas.current || !host.current) return;
          try {
            const state = latest.current;
            controller.current = createWorldRenderer(
              canvas.current,
              host.current,
              state.settings,
              state.route,
              immersive,
              () => {
                void startFallback();
              },
            );
            controller.current.update(
              state.settings,
              state.route,
              state.suspended,
            );
            setRenderer("webgl");
          } catch {
            void startFallback();
          }
        })
        .catch(() => {
          void startFallback();
        });
    return () => {
      cancelled = true;
      controller.current?.dispose();
      controller.current = null;
    };
  }, [enabled, immersive, settings.quality]);
  return (
    <div
      ref={host}
      className={`resonant-world${immersive ? " resonant-world-immersive" : ""}`}
      data-renderer={renderer}
      data-dimension={settings.dimension}
      data-motion={settings.motion && !suspended ? "moving" : "still"}
      aria-hidden={!immersive}
      role={immersive ? "img" : undefined}
      aria-label={
        immersive
          ? settings.dimension === "4d"
            ? "A four-dimensional Clifford torus projected into a luminous three-dimensional space"
            : "An intricate three-dimensional filament sculpture above a reflective floor"
          : undefined
      }
      style={{ display: enabled ? undefined : "none" }}
    >
      <canvas
        key={`gpu-${enabled}-${settings.quality}-${immersive}`}
        ref={canvas}
        style={{
          opacity: renderer === "webgl" ? 1 : 0,
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      />
      <canvas
        key={`canvas-${enabled}-${settings.quality}-${immersive}`}
        ref={fallbackCanvas}
        style={{
          opacity: renderer === "canvas" ? 1 : 0,
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      />
      {immersive && renderer === "canvas" && (
        <span className="sr-only">
          Interactive perspective rendering. WebGL is unavailable.
        </span>
      )}
      {immersive && renderer === "unavailable" && (
        <span className="sr-only">
          Rendering is unavailable on this device.
        </span>
      )}
    </div>
  );
}

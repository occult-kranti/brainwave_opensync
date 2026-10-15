import { useEffect, useRef, useState } from "react";
import { assetUrl } from "@/lib/assetUrl";
import type { SpatialSettings } from "./spatialState";
import type { FieldRenderer } from "./webglField";
export function FieldCanvas({
  settings,
  ambient = false,
  suspended = false,
}: {
  settings: SpatialSettings;
  ambient?: boolean;
  suspended?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    fallbackCanvas = useRef<HTMLCanvasElement>(null),
    fallbackRenderer = useRef<FieldRenderer | null>(null),
    host = useRef<HTMLDivElement>(null),
    renderer = useRef<FieldRenderer | null>(null);
  const [supported] = useState(
    () => typeof WebGL2RenderingContext !== "undefined",
  );
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(!supported),
    [retry, setRetry] = useState(0);
  const [outline, setOutline] = useState(false);
  const latest = useRef(settings);
  useEffect(() => {
    latest.current = { ...settings, motion: settings.motion && !suspended };
    renderer.current?.update(latest.current);
    fallbackRenderer.current?.update(latest.current);
  }, [settings, suspended]);
  useEffect(() => {
    let cancelled = false;
    if (!supported) return;
    void import("./webglField")
      .then(({ createFieldRenderer }) => {
        if (cancelled || !canvas.current || !host.current) return;
        try {
          renderer.current = createFieldRenderer(
            canvas.current,
            host.current,
            latest.current,
            () => {
              setReady(false);
              setFailed(true);
            },
            ambient,
          );
          setReady(true);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [ambient, retry, supported]);
  useEffect(() => {
    let cancelled = false;
    if (!failed || ambient) return;
    void import('./canvasField').then(({createCanvasField}) => {
      if(cancelled || !fallbackCanvas.current || !host.current) return;
      try { fallbackRenderer.current=createCanvasField(fallbackCanvas.current,host.current,latest.current); setOutline(Boolean(fallbackRenderer.current)); } catch { setOutline(false); }
    });
    return () => { cancelled=true; fallbackRenderer.current?.dispose(); fallbackRenderer.current=null; };
  }, [failed,ambient]);
  return (
    <div
      ref={host}
      className={`spatial-canvas ${ambient ? "spatial-canvas-ambient" : ""}`}
      data-renderer={ready ? "webgl" : outline ? "canvas" : "poster"}
    >
      {!ready && !outline && (
        <img
          className="field-poster"
          src={assetUrl("art/resonance-sculpture.webp")}
          alt={ambient ? "" : "A fine-threaded glass torus in a dark gallery"}
        />
      )}
      <canvas
        key={retry}
        ref={canvas}
        aria-hidden={ambient || !ready}
        role={ambient ? undefined : "img"}
        aria-label={
          settings.dimension === "4d"
            ? "Generative art: a four-dimensional Clifford torus projected into three dimensions"
            : "Generative art: a rotating three-dimensional torus"
        }
        style={{ opacity: ready ? 1 : 0 }}
      />
      {failed && !ambient && <canvas className="field-outline-canvas" ref={fallbackCanvas} role="img" aria-hidden={!outline} aria-label={settings.dimension === '4d' ? 'Interactive outline: four-dimensional Clifford projection' : 'Interactive outline: three-dimensional toroidal field'} style={{opacity:outline?1:0}} />}
      {failed && !ambient && (
        <div className="field-fallback" role="status">
          {outline ? "Interactive outline · WebGL unavailable" : "Still artwork · 3D rendering unavailable"}{" "}
          {supported && (
            <button
              onClick={() => {
                setFailed(false);
                setReady(false);
                setOutline(false);
                setRetry((n) => n + 1);
              }}
            >
              Retry 3D
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef } from "react";
import { Minus, Orbit, Pause, Play, Plus, X } from "lucide-react";
import { useLocation } from "react-router";
import { ArchiveThemePicker } from "@/ui/components/ArchiveThemePicker";
import type { ArchiveTheme } from "@/ui/archiveTheme";
import { FieldControls } from "./FieldControls";
import { SpatialPortal } from "./SpatialEnvironment";
import { useSpatial } from "./spatialContext";
import { MAX_ZOOM, MIN_ZOOM } from "./spatialState";

/** World controls never start, stop, or reconfigure the audio graph. */
export function WorldToolbar({
  theme,
  onThemeChange,
}: {
  theme: ArchiveTheme;
  onThemeChange: (theme: ArchiveTheme) => void;
}) {
  const spatial = useSpatial();
  const details = useRef<HTMLDetailsElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    if (details.current) details.current.open = false;
  }, [pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (spatial?.immersive) return;
      if (event.key !== "Escape" || !details.current?.open) return;
      details.current.open = false;
      details.current.querySelector("summary")?.focus();
    };
    const outside = (event: PointerEvent) => {
      if (spatial?.immersive) return;
      if (
        details.current?.open &&
        event.target instanceof Node &&
        !details.current.contains(event.target)
      )
        details.current.open = false;
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [spatial?.immersive]);
  if (!spatial) return null;
  const { settings, update, zoomBy } = spatial;
  return (
    <div className="world-toolbar" aria-label="World controls">
      <span className="world-coordinate" aria-hidden="true">
        {settings.dimension === "4d" ? "R⁴ → R³" : "R³"} /{" "}
        {Math.round(settings.zoom * 100)}%
      </span>
      <button
        type="button"
        aria-label="Zoom out world"
        disabled={settings.zoom <= MIN_ZOOM}
        onClick={() => zoomBy(-0.1)}
      >
        <Minus size={14} />
      </button>
      <button
        type="button"
        aria-label="Zoom in world"
        disabled={settings.zoom >= MAX_ZOOM}
        onClick={() => zoomBy(0.1)}
      >
        <Plus size={14} />
      </button>
      <button
        type="button"
        aria-label={settings.motion ? "Pause world motion" : "Animate world"}
        aria-pressed={!settings.motion}
        onClick={() => update({ motion: !settings.motion })}
      >
        {settings.motion ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <details ref={details} className="world-settings">
        <summary>
          <Orbit size={15} />
          <span>Scene</span>
        </summary>
        <div className="world-settings-panel">
          <div className="world-settings-heading">
            <span>Shape your space</span>
            <button
              type="button"
              aria-label="Close scene settings"
              onClick={() => {
                if (details.current) {
                  details.current.open = false;
                  details.current.querySelector("summary")?.focus();
                }
              }}
            >
              <X size={17} />
            </button>
          </div>
          <FieldControls expanded allowExpand={false} />
          <ArchiveThemePicker value={theme} onChange={onThemeChange} />
          <SpatialPortal />
          <p>
            Visual settings only. Sound starts in the player or a sound tool.
          </p>
        </div>
      </details>
    </div>
  );
}

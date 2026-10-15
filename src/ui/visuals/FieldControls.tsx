import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useSpatial } from "./spatialContext";
import { MAX_ZOOM, MIN_ZOOM } from "./spatialState";
export function FieldControls({
  expanded = false,
  allowExpand = true,
}: {
  expanded?: boolean;
  allowExpand?: boolean;
}) {
  const spatial = useSpatial();
  if (!spatial) return null;
  const {
    settings: s,
    update,
    zoomBy,
    turn,
    resetView,
    setImmersive,
  } = spatial;
  return (
    <div className="spatial-controls">
      <div className="field-toolbar">
        <div className="field-dimensions" aria-label="Geometry dimension">
          <button
            aria-pressed={s.dimension === "3d"}
            onClick={() => update({ dimension: "3d" })}
          >
            3D
          </button>
          <button
            aria-pressed={s.dimension === "4d"}
            onClick={() => update({ dimension: "4d" })}
          >
            4D
          </button>
        </div>
        <span>
          {s.dimension === "3d" ? "Toroidal field" : "Clifford projection"}
        </span>
        <div className="field-orbit">
          <button aria-label="Rotate geometry left" onClick={() => turn(-0.18)}>
            <ArrowLeft size={16} />
          </button>
          <button
            aria-label={s.motion ? "Pause visual motion" : "Animate geometry"}
            onClick={() => update({ motion: !s.motion })}
          >
            {s.motion ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button aria-label="Rotate geometry right" onClick={() => turn(0.18)}>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div className="field-camera">
        <span>View</span>
        <button
          aria-label="Zoom out geometry"
          disabled={s.zoom <= MIN_ZOOM}
          onClick={() => zoomBy(-0.1)}
        >
          <Minus size={16} />
        </button>
        <output aria-label="Geometry zoom">{Math.round(s.zoom * 100)}%</output>
        <button
          aria-label="Zoom in geometry"
          disabled={s.zoom >= MAX_ZOOM}
          onClick={() => zoomBy(0.1)}
        >
          <Plus size={16} />
        </button>
        <button className="field-reset" onClick={resetView}>
          <RotateCcw size={14} />
          Reset view
        </button>
        {allowExpand && (
          <button
            className="field-expand"
            aria-label="Open immersive visual space"
            onClick={() => setImmersive(true)}
          >
            <Maximize2 size={15} />
          </button>
        )}
      </div>
      {expanded && (
        <div className="field-advanced">
          <fieldset>
            <legend>Surface</legend>
            {(["silk", "threads", "particles"] as const).map((material) => (
              <button
                key={material}
                aria-pressed={s.material === material}
                onClick={() => update({ material })}
              >
                {material === "silk"
                  ? "Sculpture"
                  : material === "threads"
                    ? "Threads"
                    : "Particles"}
              </button>
            ))}
          </fieldset>
          {s.dimension === "4d" && (
            <label className="field-axis-control">
              Fourth-axis rotation <output>{s.fourth}°</output>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={s.fourth}
                onChange={(e) => update({ fourth: Number(e.target.value) })}
              />
            </label>
          )}
          <label className="field-quality">
            Render detail
            <select
              value={s.quality}
              onChange={(e) =>
                update({
                  quality: e.target.value === "light" ? "light" : "balanced",
                })
              }
            >
              <option value="balanced">Balanced · up to 30 fps</option>
              <option value="light">Light · up to 20 fps</option>
            </select>
          </label>
          <label className="field-ambient">
            <input
              type="checkbox"
              checked={s.ambient}
              onChange={(e) => update({ ambient: e.target.checked })}
            />
            Show geometry behind pages
          </label>
        </div>
      )}
    </div>
  );
}

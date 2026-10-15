import { useRef } from "react";
import { useSpatial } from "./spatialContext";
import { SpatialProvider } from "./SpatialProvider";
import { FieldCanvas } from "./FieldCanvas";
import { FieldControls } from "./FieldControls";
/** Visual controls are isolated from the audio graph and share preferences across routes. */
export function ResonanceField({
  compact = false,
  immersive = false,
}: {
  compact?: boolean;
  immersive?: boolean;
}) {
  const spatial = useSpatial();
  const drag = useRef<number | null>(null);
  if (!spatial)
    return (
      <SpatialProvider>
        <ResonanceField compact={compact} immersive={immersive} />
      </SpatialProvider>
    );
  return (
    <div
      className={`resonance-field ${compact ? "field-compact" : ""} ${immersive ? "field-immersive" : ""}`}
    >
      <div
        className="field-canvas"
        onPointerDown={(e) => {
          if (e.target instanceof Element && e.target.closest("button")) return;
          drag.current = e.clientX;
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current === null) return;
          spatial.turn((e.clientX - drag.current) * 0.004);
          drag.current = e.clientX;
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <FieldCanvas
          settings={spatial.settings}
          suspended={spatial.immersive && !immersive}
        />
        <span className="field-axis field-axis-top">
          {spatial.settings.dimension === "4d" ? "R⁴ → R³" : "R³"}
        </span>
        <span className="field-axis field-axis-bottom">DRAG TO TURN</span>
      </div>
      <FieldControls expanded={immersive} allowExpand={!immersive} />
    </div>
  );
}

import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Orbit, X } from "lucide-react";
import { Link } from "react-router";
import { PanicButton } from "@/ui/components/Panic";
import { useSession } from "@/ui/session/useSession";
import { fmtClock } from "@/ui/session/sessionMath";
import { useSpatial } from "./spatialContext";
import { FieldCanvas } from "./FieldCanvas";
import { ResonantWorld } from "./ResonantWorld";
import { FieldControls } from "./FieldControls";
export function SpatialBackdrop() {
  const spatial = useSpatial();
  if (!spatial || !spatial.settings.ambient) return null;
  return (
    <div className="spatial-backdrop" aria-hidden="true">
      <FieldCanvas
        settings={spatial.settings}
        ambient
        suspended={spatial.immersive}
      />
    </div>
  );
}
export function SpatialPortal() {
  const spatial = useSpatial();
  const session = useSession();
  const setImmersive = spatial?.setImmersive;
  useEffect(() => {
    if (session.panicked) setImmersive?.(false);
  }, [session.panicked, setImmersive]);
  if (!spatial) return null;
  return (
    <Dialog.Root open={spatial.immersive} onOpenChange={spatial.setImmersive}>
      <Dialog.Trigger className="spatial-trigger">
        <Orbit size={16} />
        <span>Visual space</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="spatial-overlay" />
        <Dialog.Content className="spatial-room">
          <header>
            <div>
              <span className="overline">Your visual companion</span>
              <Dialog.Title>Inside the field.</Dialog.Title>
            </div>
            <div className="spatial-room-actions">
              <PanicButton />
              <Dialog.Close aria-label="Close visual space">
                <X size={22} />
              </Dialog.Close>
            </div>
          </header>
          <Dialog.Description>
            Explore a torus in three dimensions or its four-dimensional Clifford
            counterpart. These are mathematical artworks, independent of your
            sound.
          </Dialog.Description>
          <div className="world-room-stage">
            <ResonantWorld route="/" immersive />
            <div className="world-room-controls">
              <FieldControls expanded allowExpand={false} />
            </div>
          </div>
          <details className="spatial-explainer">
            <summary>About the geometry & design</summary>
            <p>
              The 3D form is a torus with a small periodic twist. The Clifford
              torus starts in four spatial coordinates: (cos u, sin u, cos v,
              sin v) / √2. Rotations in the XW and YZ planes change its shape
              after perspective projection into 3D. The fourth dimension here is
              a mathematical coordinate, not time or a measured state of mind.
            </p>
            <p>
              Original geometry and artwork. Design references:{" "}
              <a href="https://miegakure.com/" target="_blank" rel="noreferrer">
                Marc ten Bosch’s Miegakure
              </a>{" "}
              for gradual exploration of dimensions;{" "}
              <a
                href="https://www.marpi.studio/exhibitions/odra"
                target="_blank"
                rel="noreferrer"
              >
                Marpi’s Odra
              </a>{" "}
              for sound within an interactive environment; and{" "}
              <a
                href="https://thatgamecompany.com/journey/"
                target="_blank"
                rel="noreferrer"
              >
                thatgamecompany’s Journey
              </a>{" "}
              for quiet spatial composition.
            </p>
          </details>
          <footer>
            <span>
              {session.running
                ? `${session.paused ? "Paused" : "Listening"} · ${fmtClock(Math.max(0, session.limitMin * 60 - session.elapsedSec))} remaining`
                : "Sound is stopped"}
            </span>
            {session.running && (
              <button onClick={session.togglePause}>
                {session.paused ? "Resume sound" : "Pause sound"}
              </button>
            )}
            <Dialog.Close asChild>
              <Link to="/listen">Open session player →</Link>
            </Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

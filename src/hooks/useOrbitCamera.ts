/**
 * useOrbitCamera — drag-to-orbit / wheel-zoom / pinch-zoom / double-click-reset
 * camera state for the cymatics plate renderers. Pointer Events cover mouse,
 * touch and pen; two-pointer pinch adjusts zoom. `interacted` flips on first
 * input so callers can disable idle auto-sway once the user takes over.
 */

import { useCallback, useRef } from 'react';
import { orbitBy, zoomBy, type OrbitCam } from '@/cymatics/plate3d';

const DEFAULT_CAM: OrbitCam = { yaw: 0.42, tilt: 1.02, dist: 2.1 };

export interface OrbitBind {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  onDoubleClick: () => void;
}

export function useOrbitCamera(initial: Partial<OrbitCam> = {}) {
  const cam = useRef<OrbitCam>({ ...DEFAULT_CAM, ...initial });
  const interacted = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef(0);

  const reset = useCallback(() => {
    cam.current = { ...DEFAULT_CAM, ...initial };
    interacted.current = false;
    pinchDist.current = 0;
    pointers.current.clear();
  }, [initial]);

  const bind: OrbitBind = {
    onPointerDown: (e) => {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y);
      }
    },
    onPointerMove: (e) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      interacted.current = true;
      if (pointers.current.size === 2) {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const [a, b] = [...pointers.current.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist.current > 0 && d > 0) cam.current = zoomBy(cam.current, d / pinchDist.current);
        pinchDist.current = d;
      } else {
        cam.current = orbitBy(cam.current, e.clientX - prev.x, e.clientY - prev.y);
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
    },
    onPointerUp: (e) => {
      pointers.current.delete(e.pointerId);
      pinchDist.current = 0;
    },
    onPointerCancel: (e) => {
      pointers.current.delete(e.pointerId);
      pinchDist.current = 0;
    },
    onWheel: (e) => {
      interacted.current = true;
      cam.current = zoomBy(cam.current, Math.exp(-e.deltaY * 0.0012));
    },
    onDoubleClick: () => reset(),
  };

  return { cam, interacted, bind, reset };
}

/**
 * Shared canvas primitives for the scope surfaces (Visualizer, StudioScope):
 * one graticule and one phosphor-glow trace implementation, no copies.
 */

import { LINE } from '../theme';

/**
 * Graticule (P0-5): dim, dotted, well below trace brightness (~80% max) so
 * the eye goes to the signal first. Subdivision dots; only the center axis
 * gets a slightly brighter dash. Exported for reuse by StudioScope (the
 * always-visible Studio waveform strip) — one graticule implementation.
 */
export function drawGrid(g: CanvasRenderingContext2D, w: number, h: number, dpr: number) {
  g.strokeStyle = `${LINE[1]}44`;
  g.lineWidth = 1;
  g.setLineDash([1 * dpr, 5 * dpr]);
  for (let i = 1; i < 10; i++) {
    const x = (i / 10) * w;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, h);
    g.stroke();
  }
  for (let i = 1; i < 5; i++) {
    const y = (i / 5) * h;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
  // center axis: still dim, slightly longer dash
  g.setLineDash([3 * dpr, 4 * dpr]);
  g.strokeStyle = `${LINE[2]}88`;
  g.beginPath();
  g.moveTo(0, h / 2);
  g.lineTo(w, h / 2);
  g.stroke();
  g.setLineDash([]);
}

/** Byte time-domain trace with phosphor glow (§5.10). Shared with StudioScope. */
export function trace(g: CanvasRenderingContext2D, data: Uint8Array, w: number, h: number, color: string, dpr: number) {
  g.beginPath();
  const n = data.length;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * w;
    const y = h / 2 + ((data[i] - 128) / 128) * (h * 0.45);
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.strokeStyle = color;
  g.lineWidth = 1.5 * dpr;
  g.shadowColor = color;
  g.shadowBlur = 4 * dpr;
  g.stroke();
  g.shadowBlur = 0;
}

/**
 * Field4D — a toggleable ambient "4D plane" backdrop.
 *
 * A 3D wireframe grid plane, perspective-projected, whose surface undulates
 * with time (the fourth axis) and gently hue-drifts over minutes; the running
 * session's beat rate modulates the wave tempo and amplitude. Pure canvas,
 * no WebGL — low density on phones, capped DPR, honors prefers-reduced-motion,
 * and never renders unless explicitly enabled (stored per device).
 */

import { useEffect, useRef } from 'react';
import { useSession } from '@/ui/session/useSession';
import { useIsMobile } from '@/hooks/use-mobile';

export function Field4D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { beatHz, carrierHz, running } = useSession();
  const isMobile = useIsMobile();
  const live = useRef({ beat: 6, carrier: 200, running: false });
  useEffect(() => {
    live.current = { beat: beatHz || 6, carrier: carrierHz || 200, running };
  }, [beatHz, carrierHz, running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nx = isMobile ? 22 : 34;
    const ny = isMobile ? 12 : 18;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const start = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const { beat, carrier, running: isRunning } = live.current;
      const amp = isRunning ? 1 : 0.4;
      const tempo = beat * 0.06;
      // Slow hue orbit between the app's teal and amber — time as the 4th axis.
      const hue = 185 + 25 * Math.sin(t * 0.03) + (carrier % 40) * 0.4;
      const tilt = 1.02;
      const yaw = 0.22 * Math.sin(t * 0.05);

      ctx.clearRect(0, 0, w, h);
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cy = Math.cos(tilt);
      const sy = Math.sin(tilt);
      const cx = w / 2;
      const cyy = h * 0.62;
      const scale = Math.min(w, h) * 0.52;

      const project = (gx: number, gy: number) => {
        const x = (gx / (nx - 1)) * 2 - 1;
        const y = (gy / (ny - 1)) * 2 - 1;
        const z = amp * (
          0.34 * Math.sin(2 * Math.PI * (x * 1.4 + t * tempo * 0.4)) * Math.cos(2 * Math.PI * (y * 1.1 - t * tempo * 0.3)) +
          0.14 * Math.sin(2 * Math.PI * (x * 2.9 + y * 2.2 + t * tempo))
        );
        // yaw around Z axis in the plane, then tilt around X (view).
        const xr = x * cosY - y * sinY;
        const yr = x * sinY + y * cosY;
        const yv = yr * cy - z * sy;
        const zv = yr * sy + z * cy;
        const persp = 1 / (1.75 - zv * 0.5);
        return {
          px: cx + xr * scale * persp,
          py: cyy + yv * scale * 0.62 * persp,
          z, persp,
        };
      };

      for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
          const p = project(i, j);
          const light = 26 + p.z * 22 + p.persp * 18;
          ctx.fillStyle = `hsl(${hue.toFixed(1)}, 42%, ${Math.max(14, Math.min(62, light)).toFixed(1)}%)`;
          const r = 1.05 * p.persp + (isRunning ? 0.25 : 0);
          ctx.beginPath();
          ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
          ctx.fill();
          if (i % 2 === 0 && i + 2 < nx) {
            const q = project(i + 2, j);
            ctx.strokeStyle = `hsla(${hue.toFixed(1)}, 38%, 46%, 0.16)`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(p.px, p.py);
            ctx.lineTo(q.px, q.py);
            ctx.stroke();
          }
          if (j % 2 === 0 && j + 2 < ny) {
            const q = project(i, j + 2);
            ctx.strokeStyle = `hsla(${hue.toFixed(1)}, 38%, 46%, 0.12)`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.px, p.py);
            ctx.lineTo(q.px, q.py);
            ctx.stroke();
          }
        }
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [isMobile]);

  return (
    <div ref={wrapRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: -1, borderRadius: 'inherit' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', opacity: 0.6 }} />
    </div>
  );
}

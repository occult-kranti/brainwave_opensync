/**
 * StudioScope — the Studio's always-visible live waveform strip (design.md
 * §5.10, scope panel): L (teal) and R (amber) time-domain traces overlaid on
 * the shared dotted graticule, straight from the engine's AnalyserNodes.
 *
 * Shares its canvas internals with the tabbed Visualizer (imported
 * `drawGrid` / `trace` — one graticule/trace implementation, no copies).
 *
 * Performance guards:
 *  - rAF loop runs ONLY while the session is playing AND the strip is on
 *    screen (IntersectionObserver) — when idle it paints a single static
 *    frame (grid + NO SIGNAL watermark) and schedules no frames;
 *  - devicePixelRatio capped at 2.
 */

import { useEffect, useRef, useState } from 'react';
import { AMBER, INK, MONO, TEAL, TEXT } from '../theme';
import { useSession } from '../session/SessionContext';
import { InfoPopover } from './InfoPopover';
import { drawGrid, trace } from './Visualizer';

/** Paints the static idle frame (graticule + watermark). No rAF. */
function paintIdleFrame(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, canvas.clientWidth * dpr);
  const h = Math.max(1, canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.fillStyle = INK[0];
  ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h, dpr);
  ctx.font = MONO(14 * dpr, 600);
  ctx.fillStyle = `${TEXT[3]}55`;
  ctx.textAlign = 'center';
  ctx.fillText('NO SIGNAL — START SESSION', w / 2, h / 2);
  ctx.textAlign = 'left';
}

export function StudioScope({ height = 220 }: { height?: number }) {
  const { engineRef, running } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Pause off-screen (design.md §6 performance guardrail).
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Live loop — only while playing and on screen. No busy loop when idle.
  useEffect(() => {
    if (!running || !visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, canvas.clientWidth * dpr);
      const h = Math.max(1, canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.fillStyle = INK[0];
      ctx.fillRect(0, 0, w, h);
      drawGrid(ctx, w, h, dpr);

      const ana = engineRef.current?.analysers();
      if (!ana) {
        ctx.font = MONO(14 * dpr, 600);
        ctx.fillStyle = `${TEXT[3]}55`;
        ctx.textAlign = 'center';
        ctx.fillText('NO SIGNAL — START SESSION', w / 2, h / 2);
        ctx.textAlign = 'left';
        return;
      }
      const l = new Uint8Array(ana.left.fftSize);
      const r = new Uint8Array(ana.right.fftSize);
      ana.left.getByteTimeDomainData(l);
      ana.right.getByteTimeDomainData(r);
      trace(ctx, l, w, h, TEAL, dpr);
      trace(ctx, r, w, h, AMBER, dpr);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [running, visible, engineRef]);

  // Idle / off-screen: paint one static watermark frame, schedule nothing.
  useEffect(() => {
    if (running || !visible) return;
    const canvas = canvasRef.current;
    if (canvas) paintIdleFrame(canvas);
  }, [running, visible]);

  return (
    <div
      ref={hostRef}
      data-testid="studio-scope"
      data-state={running ? 'live' : 'idle'}
      className="scope-well flex flex-col"
      style={{ height }}
    >
      <div className="flex items-center gap-2 hairline-b" style={{ padding: '8px 12px' }}>
        <span className="t-label">SESSION SCOPE</span>
        <span className="t-readout-sm flex items-center gap-1" style={{ color: TEAL }}>
          <span aria-hidden style={{ width: 8, height: 2, background: TEAL, display: 'inline-block' }} />L
        </span>
        <span className="t-readout-sm flex items-center gap-1" style={{ color: AMBER }}>
          <span aria-hidden style={{ width: 8, height: 2, background: AMBER, display: 'inline-block' }} />R
        </span>
        <InfoPopover featureId="visualizer" label="About the live scope" />
        <span className="t-readout-sm text-3" style={{ marginLeft: 'auto' }}>
          {running ? 'LIVE' : 'NO SIGNAL'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ flex: 1, width: '100%', display: 'block' }}
        aria-label={
          running
            ? 'Live session waveform — left channel teal, right channel amber'
            : 'NO SIGNAL — engine stopped, start a session to see the live waveform'
        }
      />
    </div>
  );
}

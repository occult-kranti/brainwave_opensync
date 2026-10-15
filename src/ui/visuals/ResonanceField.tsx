import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { assetUrl } from '@/lib/assetUrl';
import { projectPoint, resonancePoint, type FieldDimension } from './resonanceGeometry';

/** Independent visual art: never reads or changes the audio graph. */
export function ResonanceField({ compact = false }: { compact?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const rotation = useRef(.35);
  const [dimension, setDimension] = useState<FieldDimension>('3d');
  const [motion, setMotion] = useState(false);
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const drag = useRef<number | null>(null);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotion(!preference.matches);
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const node = canvas.current, host = frame.current;
    if (!node || !host) return;
    let ctx: CanvasRenderingContext2D | null;
    try { ctx = node.getContext('2d'); } catch { return; }
    if (!ctx) return;
    setReady(true);
    let raf = 0, last = 0, visible = true, width = 0, height = 0;
    const draw = () => {
      if (!ctx || !width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width * .31, height * .37);
      const color = getComputedStyle(host).getPropertyValue('--field-color').trim() || '181, 206, 192';
      const lines = compact ? 66 : 100, steps = 90;
      for (let i = 0; i < lines; i++) {
        const v = i / lines * Math.PI * 2;
        ctx.beginPath(); let depth = 0;
        for (let j = 0; j <= steps; j++) {
          const p = projectPoint(resonancePoint(j / steps * Math.PI * 2, v, rotation.current, dimension), scale);
          const x = width / 2 + p.x, y = height / 2 + p.y;
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          depth += p.z;
        }
        const alpha = Math.max(.10, Math.min(.6, .32 - depth / (steps + 1) * .14));
        ctx.strokeStyle = `rgba(${color},${alpha})`; ctx.lineWidth = .65; ctx.stroke();
      }
      // Quiet meridians reveal depth without bloom, flash or pixel filters.
      for (let i = 0; i < 24; i++) {
        ctx.beginPath();
        for (let j = 0; j <= 64; j++) {
          const p = projectPoint(resonancePoint(i / 24 * Math.PI * 2, j / 64 * Math.PI * 2, rotation.current, dimension), scale);
          if (j === 0) ctx.moveTo(width / 2 + p.x, height / 2 + p.y); else ctx.lineTo(width / 2 + p.x, height / 2 + p.y);
        }
        ctx.strokeStyle = `rgba(${color},.12)`; ctx.lineWidth = .5; ctx.stroke();
      }
    };
    const tick = (time: number) => {
      if (!motion || !visible || document.hidden) { raf = 0; return; }
      if (time - last >= 33) { rotation.current += Math.min(time - last, 50) * .000045; last = time; draw(); }
      raf = requestAnimationFrame(tick);
    };
    const schedule = () => { if (motion && visible && !document.hidden && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const resize = () => {
      const box = host.getBoundingClientRect(); width = box.width; height = box.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      node.width = Math.round(width * dpr); node.height = Math.round(height * dpr); ctx?.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(host); resize();
    const intersection = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; schedule(); }) : null;
    intersection?.observe(host);
    document.addEventListener('visibilitychange', schedule); schedule();
    return () => { cancelAnimationFrame(raf); observer?.disconnect(); intersection?.disconnect(); document.removeEventListener('visibilitychange', schedule); };
  }, [dimension, motion, revision, compact]);
  const turn = (amount: number) => { rotation.current += amount; setRevision(v => v + 1); };
  return <div className={`resonance-field ${compact ? 'field-compact' : ''}`}>
    <div className="field-canvas" ref={frame} onPointerDown={e => { drag.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (drag.current === null) return; turn((e.clientX - drag.current) * .004); drag.current = e.clientX; }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      {!ready && <img className="field-poster" src={assetUrl('art/resonance-sculpture.webp')} alt="A fine-threaded glass torus in a dark gallery" />}
      <canvas ref={canvas} aria-label={dimension === '4d' ? 'Generative art: a four-dimensional Clifford torus projected into three dimensions' : 'Generative art: a rotating three-dimensional torus'} role="img" />
      <span className="field-axis field-axis-top">Y</span><span className="field-axis field-axis-bottom">X</span>
    </div>
    <div className="field-toolbar"><div className="field-dimensions" aria-label="Geometry dimension"><button aria-pressed={dimension === '3d'} onClick={() => setDimension('3d')}>3D</button><button aria-pressed={dimension === '4d'} onClick={() => setDimension('4d')}>4D</button></div><span>{dimension === '3d' ? 'Toroidal field' : 'Clifford projection'}</span><div className="field-orbit"><button aria-label="Rotate geometry left" onClick={() => turn(-.18)}><ArrowLeft size={14} /></button><button aria-label={motion ? 'Pause visual motion' : 'Animate geometry'} onClick={() => setMotion(!motion)}>{motion ? <Pause size={13} /> : <Play size={13} />}</button><button aria-label="Rotate geometry right" onClick={() => turn(.18)}><ArrowRight size={14} /></button></div></div>
  </div>;
}

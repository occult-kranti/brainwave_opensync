/** Full-screen visualization. Portaled out of the player's clipped stacking context. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Pause, Play, RotateCcw } from 'lucide-react';
import { VIRTUAL_PLATES, createSand, drivenSquareField, drivenSquareModes, stepParticles, type SandState } from '@/cymatics/chladni';
import { renderFrame } from '@/cymatics/render';
import { drawPlate3D, drawPlate5D } from '@/cymatics/plate3d';
import { sampleAudioFeatures, SILENT_FEATURES } from '@/cymatics/audioLink';
import { useSession } from '@/ui/session/useSession';
import { useIsMobile } from '@/hooks/use-mobile';
import { useModalA11y } from '@/ui/hooks';
import { useOrbitCamera } from '@/hooks/useOrbitCamera';
import { Field4D } from './Field4D';
import { useField4d } from '@/hooks/useField4d';
import { PanicButton } from './Panic';
import './cymaticsStage.css';

const PLATE = { ...VIRTUAL_PLATES[0], fundamentalHz: 16 };
type View = 'sand' | '3d' | '5d';

export function CymaticsOverlay({ onClose }: { onClose: () => void }) {
  const { carrierHz, running, paused, engineRef } = useSession();
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sandRef = useRef<SandState | null>(null);
  const [view, setView] = useState<View>('sand');
  const [motionOn, setMotionOn] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [revision, setRevision] = useState(0);
  const [field4dOn, setField4dOn] = useField4d();
  const { cam, interacted, bind, reset } = useOrbitCamera();
  useModalA11y(true, onClose, closeRef, dialogRef);
  const drive = Math.max(20, Math.min(1000, carrierHz || 200));
  // Fixed display plate: carrier changes now actually change the nodal pattern.
  const field = useMemo(() => drivenSquareField(drivenSquareModes(drive, PLATE)), [drive]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const sand = createSand(isMobile ? 2400 : 4200, 7, false);
    // A legible settled figure even with motion disabled or audio stopped.
    for (let i = 0; i < 100; i++) stepParticles(sand, field, 1 / 30, { jitter: 0, speed: 0.4 });
    sandRef.current = sand;
    const buffer = document.createElement('canvas');
    const resolution = isMobile ? 256 : 384;
    buffer.width = buffer.height = resolution;
    const bufferCtx = buffer.getContext('2d');
    let raf = 0;
    let last = 0;
    let energy = 0.2;
    const draw = (now: number) => {
      if (document.hidden) return;
      if (motionOn && now - last < 1000 / 24) { raf = requestAnimationFrame(draw); return; }
      const dt = last ? Math.min(0.08, (now - last) / 1000) : 1 / 24;
      last = now;
      const size = Math.max(1, Math.min(800, Math.round(canvas.clientWidth * Math.min(2, window.devicePixelRatio || 1))));
      if (canvas.width !== size || canvas.height !== size) canvas.width = canvas.height = size;
      const analyser = engineRef.current?.analysers()?.spectrum ?? null;
      const features = analyser && running && !paused ? sampleAudioFeatures(analyser, engineRef.current?.sampleRate ?? 48000) : SILENT_FEATURES;
      energy += ((features.active ? Math.min(1, 0.25 + features.energy) : 0.2) - energy) * 0.12;
      if (motionOn) stepParticles(sand, field, dt, { speed: 0.4, jitter: 0.002 + energy * 0.006 });
      if (view === 'sand') {
        renderFrame(bufferCtx, resolution, resolution, { field, circular: false, mode: 'sand', colormap: 'gold-plate', particles: sand, energy });
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(buffer, 0, 0, size, size);
      } else {
        (view === '5d' ? drawPlate5D : drawPlate3D)(ctx, size, size, field, {
          time: motionOn ? now / 1000 : 4, amp: 0.32, energy, gridX: isMobile ? 40 : 60, gridY: isMobile ? 30 : 40,
          stride: 2, particles: sand, still: !motionOn, orbit: interacted.current ? { ...cam.current } : undefined,
        });
      }
      if (motionOn) raf = requestAnimationFrame(draw);
    };
    const redraw = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = 0; raf = requestAnimationFrame(draw); } };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(redraw);
    observer?.observe(canvas);
    document.addEventListener('visibilitychange', redraw);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); observer?.disconnect(); document.removeEventListener('visibilitychange', redraw); };
  }, [field, engineRef, running, paused, view, isMobile, motionOn, revision, cam, interacted]);

  return createPortal(<div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Cymatics sand plate stage" className="cymatics-stage" tabIndex={-1}>
    {field4dOn && motionOn && <div className="cymatics-stage-backdrop"><Field4D /></div>}
    <header className="cymatics-stage-header"><div><span className="eyebrow">A moment in motion</span><h2>Sound, made visible.</h2></div><div className="cymatics-stage-actions"><PanicButton /><button ref={closeRef} className="chip" aria-label="Close cymatics stage" onClick={onClose}><X size={16} /> Close</button></div></header>
    <div className="cymatics-stage-body"><div className="cymatics-stage-view">
      <div className="cymatics-view-tabs" aria-label="Plate view">{(['sand', '3d', '5d'] as View[]).map((v) => <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>{v === 'sand' ? 'Sand' : v === '3d' ? '3D surface' : 'Phase colour · 5D'}</button>)}</div>
      <canvas ref={canvasRef} {...(view === 'sand' ? {} : bind)} onDoubleClick={() => { if (view !== 'sand') { reset(); setRevision((v) => v + 1); } }} onPointerUp={(e) => { bind.onPointerUp(e); if (!motionOn) setRevision((v) => v + 1); }} onWheel={(e) => { if (view !== 'sand') { bind.onWheel(e); if (!motionOn) setRevision((v) => v + 1); } }} aria-label={view === 'sand' ? 'Simulated sand collecting on the nodal lines of a square plate' : 'Interactive virtual plate: drag to orbit, scroll to zoom'} style={{ touchAction: view === 'sand' ? 'auto' : 'none', cursor: view === 'sand' ? 'default' : 'grab' }} />
      <p className="cymatics-stage-hint">{view === 'sand' ? 'Grains gather where the virtual plate is still.' : 'Drag to orbit · scroll or pinch to zoom · double-click to reset'}</p>
    </div><aside className="cymatics-stage-info"><span className="eyebrow">Virtual sand garden</span><h3>Let the pattern<br />hold your attention.</h3><p>Follow the grains, or simply look away and listen. The picture is optional.</p>
      <dl><div><dt>Session carrier</dt><dd>{drive.toFixed(1)} Hz</dd></div><div><dt>Audio</dt><dd>{running ? paused ? 'Paused' : 'Playing' : 'Stopped · visual preview'}</dd></div><div><dt>View</dt><dd>Simulation</dd></div></dl>
      <div className="cymatics-stage-tools"><button className="chip" aria-pressed={motionOn} onClick={() => setMotionOn(!motionOn)}>{motionOn ? <Pause size={14} /> : <Play size={14} />}{motionOn ? 'Pause motion' : 'Animate pattern'}</button><button className="chip" onClick={() => { reset(); setRevision((n) => n + 1); }}><RotateCcw size={14} />Reset view</button><button className="chip" aria-pressed={field4dOn} onClick={() => setField4dOn(!field4dOn)}>4D field {field4dOn ? 'on' : 'off'}</button></div>
      <details className="quiet-disclosure"><summary>How this image works</summary><p>A square-plate model with a fixed, illustrative 16 Hz fundamental. Carrier frequency selects the response; measured audio energy changes brightness. The plate is not a measurement of a person or a physical experiment.</p><p>The 3D height depicts displacement. “5D” is the existing name for an extra velocity colour channel, not five spatial dimensions. Motion is slowed for viewing. The underlying plate tools remain in Cymatics.</p></details>
    </aside></div>
  </div>, document.body);
}

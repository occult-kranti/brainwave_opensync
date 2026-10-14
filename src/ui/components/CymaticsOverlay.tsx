/**
 * CymaticsOverlay — the full-screen sand-plate stage for the Studio.
 *
 * Opens as a viewport-filling modal so the plate has room: a large square
 * canvas centered on a dimmed stage, the 3D plate renderer by default (the
 * surface height IS the displacement field; sand drifts along −∇|u| into the
 * nodal valleys), a 2D sand fallback, and an optional 4D-field backdrop behind
 * the canvas (shares the Studio's 4D toggle state). Esc / backdrop / Close
 * all dismiss; focus returns to the trigger.
 *
 * Display tuning: the virtual plate's fundamental is set to carrier ÷ 6.5 so
 * a session carrier excites the pattern-rich (2,3)/(3,2) mode pair (the
 * physical 30 cm steel plate would show the (1,1) dome at these frequencies).
 * The caption states this; physics and honesty chain unchanged.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  VIRTUAL_PLATES,
  createSand,
  drivenSquareField,
  drivenSquareModes,
  stepParticles,
  type SandState,
} from '@/cymatics/chladni';
import { renderFrame } from '@/cymatics/render';
import { drawPlate3D } from '@/cymatics/plate3d';
import { sampleAudioFeatures, SILENT_FEATURES } from '@/cymatics/audioLink';
import { useSession } from '@/ui/session/useSession';
import { useIsMobile } from '@/hooks/use-mobile';
import { useModalA11y } from '@/ui/hooks';
import { Field4D } from '@/ui/components/Field4D';
import { useField4d } from '@/hooks/useField4d';

const PLATE = VIRTUAL_PLATES.find((p) => p.id === 'steel-square-30') ?? VIRTUAL_PLATES[0];

/** Display tuning ratio (f_drive / f_fundamental) → the (2,3)/(3,2) pair. */
const DISPLAY_MODE_RATIO = 6.5;

/** Stage z-index: below detail popovers (75), panic surfaces (90), bottom bar (100). */
const STAGE_Z = 60;

export function CymaticsOverlay({ onClose }: { onClose: () => void }) {
  const { carrierHz, running, engineRef } = useSession();
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sandRef = useRef<SandState | null>(null);
  const energyRef = useRef(0.15);
  const [view3d, setView3d] = useState(true);
  const [field4dOn, setField4dOn] = useField4d();

  useModalA11y(true, onClose, closeRef);

  // Esc closes (desktop browsers; the backdrop click covers touch).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // The plate is driven by the session carrier tone (fallback: the plate's
  // own fundamental when the engine is stopped).
  const driveHz = carrierHz > 0 ? carrierHz : PLATE.fundamentalHz;
  const roundedDrive = Math.round(driveHz);

  const field = useMemo(() => {
    const displayPlate = { ...PLATE, fundamentalHz: roundedDrive / DISPLAY_MODE_RATIO };
    const modes = drivenSquareModes(roundedDrive, displayPlate);
    return drivenSquareField(modes);
  }, [roundedDrive]);

  useEffect(() => {
    sandRef.current = createSand(isMobile ? 2600 : 5200, 7, false);
  }, [isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
      last = now;
      const analyser = engineRef.current?.analysers()?.spectrum ?? null;
      const feats = analyser ? sampleAudioFeatures(analyser, engineRef.current?.sampleRate ?? 48000) : SILENT_FEATURES;
      const targetEnergy = feats.active ? 0.25 + feats.energy * 0.6 : running ? 0.4 : 0.15;
      energyRef.current += (targetEnergy - energyRef.current) * 0.08;

      const sand = sandRef.current;
      if (sand && !reduced) stepParticles(sand, field, dt * 0.9, { speed: 0.4, jitter: 0.02 + energyRef.current * 0.05 });
      if (view3d) {
        drawPlate3D(ctx, size, size, field, {
          time: now / 1000,
          amp: 0.36,
          energy: energyRef.current,
          gridX: isMobile ? 56 : 84,
          gridY: isMobile ? 40 : 60,
          stride: 2,
          particles: sand,
          still: reduced,
        });
      } else {
        renderFrame(ctx, size, size, {
          field,
          circular: false,
          mode: 'sand',
          colormap: 'gold-plate',
          particles: sand,
          energy: energyRef.current,
        });
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [field, engineRef, running, view3d, isMobile]);

  const canvasPx = Math.min(isMobile ? 420 : 640, typeof window === 'undefined' ? 640 : window.innerWidth - 32);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cymatics sand plate stage"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: STAGE_Z, display: 'flex', flexDirection: 'column',
        background: 'rgba(5, 6, 8, 0.88)', backdropFilter: 'blur(6px)',
      }}
    >
      {field4dOn && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <Field4D />
        </div>
      )}

      {/* header bar */}
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', padding: '12px 16px', borderBottom: '1px solid var(--line-2)', flexWrap: 'wrap' }}
      >
        <span className="t-label" style={{ marginRight: 'auto' }}>
          SAND ON A SQUARE PLATE · DRIVEN BY {roundedDrive} HZ
        </span>
        <button type="button" className={`chip ${view3d ? 'chip-active' : ''}`} aria-pressed={view3d} onClick={() => setView3d(true)}>3D PLATE</button>
        <button type="button" className={`chip ${!view3d ? 'chip-active' : ''}`} aria-pressed={!view3d} onClick={() => setView3d(false)}>2D SAND</button>
        <button type="button" className={`chip ${field4dOn ? 'chip-active' : ''}`} aria-pressed={field4dOn} onClick={() => setField4dOn(!field4dOn)}>4D FIELD</button>
        <button ref={closeRef} type="button" className="chip" aria-label="Close cymatics stage" onClick={onClose}>
          <X size={14} /> Close
        </button>
      </div>

      {/* stage */}
      <div
        style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, minHeight: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <canvas
          ref={canvasRef}
          width={canvasPx}
          height={canvasPx}
          style={{
            display: 'block', aspectRatio: '1', width: `min(${canvasPx}px, 92vw, 62vh)`, height: 'auto',
            borderRadius: 10, background: 'rgba(10,8,6,0.92)', boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          }}
        />
      </div>

      {/* caption */}
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', padding: '0 16px 14px', maxWidth: 860, margin: '0 auto' }}>
        <p className="t-caption" style={{ color: 'var(--text-3)', textAlign: 'center' }}>
          Simulation: sand settles on the nodal lines of the plate mode nearest the session carrier. In 3D the surface
          height is the plate's displacement field — grains collect in the valleys. Display tuning: plate fundamental =
          carrier ÷ 6.5 for the pattern-rich (2,3)/(3,2) pair; a physical 30 cm steel plate would show the (1,1) dome at
          this frequency. A visualization of the sound, not a measurement of its effect on you.
        </p>
      </div>
    </div>
  );
}

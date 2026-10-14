/**
 * CymaticsOverlay — live sand-on-a-square-plate simulation for the Studio.
 *
 * A toggleable art overlay: the session carrier drives a virtual steel plate
 * (drivenSquareModes / drivenSquareField from the Cymatics module), sand
 * particles drift onto the nodal lines, and spectral energy (when an analyser
 * is attached) feeds grain brightness. Real plate physics as a visualization —
 * it is not a measurement of the listener.
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

const PLATE = VIRTUAL_PLATES.find((p) => p.id === 'steel-square-30') ?? VIRTUAL_PLATES[0];

/**
 * Display tuning: on the physical 30 cm steel plate (fundamental 180 Hz) a
 * 100–300 Hz session carrier only excites the (1,1) single-hump mode — a
 * boring dome. We tune the virtual plate so the carrier lands on the
 * (2,3)/(3,2) pair (f/f₀ = 6.5), the classic diamond-pattern territory from
 * the photographed plates. The caption says so; the physics is unchanged.
 */
const DISPLAY_MODE_RATIO = 6.5;

export function CymaticsOverlay({ onClose }: { onClose: () => void }) {
  const { carrierHz, running, engineRef } = useSession();
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sandRef = useRef<SandState | null>(null);
  const energyRef = useRef(0.15);
  const [view3d, setView3d] = useState(true);

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
    sandRef.current = createSand(isMobile ? 2200 : 4200, 7, false);
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
          amp: 0.34,
          energy: energyRef.current,
          gridX: isMobile ? 52 : 76,
          gridY: isMobile ? 36 : 54,
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

  const size = Math.min(520, typeof window === 'undefined' ? 520 : window.innerWidth - 48);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cymatics sand plate overlay"
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(6, 8, 10, 0.72)', backdropFilter: 'blur(3px)', borderRadius: 12, padding: 8,
      }}
    >
      <div
        className="panel"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 14, width: '100%', maxWidth: size + 28, maxHeight: '100%', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <span className="t-label text-3">SAND ON A SQUARE PLATE · STEEL 30×30 CM · DRIVEN BY {roundedDrive} HZ</span>
          <span className="flex gap-2">
            <button type="button" className={`chip ${view3d ? 'chip-active' : ''}`} aria-pressed={view3d} onClick={() => setView3d(true)}>3D PLATE</button>
            <button type="button" className={`chip ${!view3d ? 'chip-active' : ''}`} aria-pressed={!view3d} onClick={() => setView3d(false)}>2D SAND</button>
            <button type="button" className="chip" aria-label="Close cymatics overlay" onClick={onClose}>
              <X size={14} /> Close
            </button>
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={isMobile ? 360 : 520}
          height={isMobile ? 360 : 520}
          style={{ display: 'block', margin: '0 auto', height: 'min(46vh, 440px)', width: 'auto', maxWidth: '100%', aspectRatio: '1', borderRadius: 8, background: 'var(--ink-0)' }}
        />
        <p className="t-caption text-3" style={{ marginTop: 10 }}>
          Simulation: sand grains settle on the nodal lines of the plate mode nearest the session carrier — the same
          eigenmode math as the Cymatics Studio page. In 3D the surface height is the plate's displacement field, so the
          sand collects in the valleys; the gold palette matches a photographed steel-plate figure. Display tuning: the
          virtual plate's fundamental is set to carrier ÷ 6.5 so the carrier excites the pattern-rich (2,3)/(3,2) mode
          pair (on the physical 30 cm plate the same carrier would show the single-hump (1,1) dome). A visualization of
          the sound, not a measurement of its effect on you.
        </p>
      </div>
    </div>
  );
}

/**
 * CymaticsOverlay — live sand-on-a-square-plate simulation for the Studio.
 *
 * A toggleable art overlay: the session carrier drives a virtual steel plate
 * (drivenSquareModes / drivenSquareField from the Cymatics module), sand
 * particles drift onto the nodal lines, and spectral energy (when an analyser
 * is attached) feeds grain brightness. Real plate physics as a visualization —
 * it is not a measurement of the listener.
 */

import { useEffect, useMemo, useRef } from 'react';
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
import { sampleAudioFeatures, SILENT_FEATURES } from '@/cymatics/audioLink';
import { useSession } from '@/ui/session/useSession';
import { useIsMobile } from '@/hooks/use-mobile';

const PLATE = VIRTUAL_PLATES.find((p) => p.id === 'steel-square-30') ?? VIRTUAL_PLATES[0];

export function CymaticsOverlay({ onClose }: { onClose: () => void }) {
  const { carrierHz, running, engineRef } = useSession();
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sandRef = useRef<SandState | null>(null);
  const energyRef = useRef(0.15);

  // The plate is driven by the session carrier tone (fallback: the plate's
  // own fundamental when the engine is stopped).
  const driveHz = carrierHz > 0 ? carrierHz : PLATE.fundamentalHz;
  const roundedDrive = Math.round(driveHz);

  const field = useMemo(() => {
    const modes = drivenSquareModes(roundedDrive, PLATE);
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
      renderFrame(ctx, size, size, {
        field,
        circular: false,
        mode: 'sand',
        colormap: 'amber-grain',
        particles: sand,
        energy: energyRef.current,
      });
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [field, engineRef, running]);

  const size = Math.min(520, typeof window === 'undefined' ? 520 : window.innerWidth - 48);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cymatics sand plate overlay"
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(6, 8, 10, 0.72)', backdropFilter: 'blur(3px)', borderRadius: 12, padding: 12,
      }}
    >
      <div
        className="panel"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 16, maxWidth: size + 32, width: '100%' }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span className="t-label text-3">SAND ON A SQUARE PLATE · STEEL 30×30 CM · DRIVEN BY {roundedDrive} HZ</span>
          <button type="button" className="chip" aria-label="Close cymatics overlay" onClick={onClose}>
            <X size={14} /> Close
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={isMobile ? 360 : 520}
          height={isMobile ? 360 : 520}
          style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block', background: 'var(--ink-0)' }}
        />
        <p className="t-caption text-3" style={{ marginTop: 10 }}>
          Simulation: sand grains settle on the nodal lines of the plate mode nearest the session carrier — the same
          eigenmode math as the Cymatics Studio page. A visualization of the sound, not a measurement of its effect on you.
        </p>
      </div>
    </div>
  );
}

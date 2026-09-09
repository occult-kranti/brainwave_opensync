/**
 * StudioCymatics — a compact, audio-reactive Chladni panel embedded in the
 * Studio. The live engine's spectrum analyser drives a declared VIRTUAL
 * PLATE (default: the 30×30 cm steel plate) through the shared audioLink
 * pipeline (src/cymatics/audioLink.ts):
 *
 *  - PHYSICS mode (default): the smoothed spectral peak is the drive
 *    frequency; nearby eigenmodes are superposed with Lorentzian weights
 *    (`drivenSquareModes`) — the physically motivated model of a driven
 *    plate. Label: "drives a virtual plate — simulated response".
 *  - ART mode (user toggle): the peak frequency is mapped straight onto
 *    pattern indices (`driveFromFeatures().artMode`). Label: "artistic
 *    rendering of a virtual plate".
 *
 * HONESTY: real cymatic figures depend on plate geometry, material, and
 * boundary conditions — never on frequency alone. Both labels are permanent
 * and frame everything as a virtual plate; nothing here is a measurement.
 *
 * Degradation / cost: with no running session (or a null analyser) it paints
 * ONE static deterministic frame plus a hint and schedules no rAF work.
 * Live rendering goes to a 192 px internal buffer (≤ 256 px cap) upscaled
 * with smoothing; off-screen pause via IntersectionObserver; DPR cap 2.
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { TEXT } from '../theme';
import { useSession } from '../session/SessionContext';
import { InfoPopover } from './InfoPopover';
import {
  VIRTUAL_PLATES,
  drivenSquareField,
  drivenSquareModes,
  squarePlateValue,
} from '@/cymatics/chladni';
import { renderFrame } from '@/cymatics/render';
import {
  driveFromFeatures,
  sampleAudioFeatures,
  smoothDriveHz,
  type AnalyserLike,
} from '@/cymatics/audioLink';

type Interpretation = 'physics' | 'art';

/** Fixed compact-panel plate (the full Cymatic Studio offers the selector). */
const PLATE = VIRTUAL_PLATES[0]; // steel square 30×30 cm, fundamental 180 Hz

/** Internal render-buffer resolution (≤ 256 px, upscaled to the display). */
const RES = 192;

/** Honesty labels — permanent, virtual-plate framing in both modes. */
const HONESTY: Record<Interpretation, string> = {
  physics: 'Live audio drives a virtual plate — simulated response, not a measurement of a physical plate.',
  art: 'Artistic rendering of a virtual plate — the peak frequency is mapped straight onto pattern indices.',
};

/** Deterministic resting frame: driven superposition at 3× the fundamental. */
const STATIC_FIELD = drivenSquareField(drivenSquareModes(PLATE.fundamentalHz * 3, PLATE));

export function StudioCymatics({
  analyser,
  height = 220,
}: {
  /** Force an analyser (or null) — defaults to the live engine's spectrum tap. */
  analyser?: AnalyserLike | null;
  height?: number;
}) {
  const { engineRef, running } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null);
  const smoothHzRef = useRef(0);
  const [mode, setMode] = useState<Interpretation>('physics');
  const [live, setLive] = useState(false);
  const [readout, setReadout] = useState<{ hz: number; mode: string } | null>(null);
  const [visible, setVisible] = useState(true);

  // An explicit prop drives the panel on its own; otherwise follow transport.
  const driving = running || analyser != null;

  // Pause off-screen (design.md §6 performance guardrail).
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Live loop — only while driven and on screen. No busy loop when idle.
  useEffect(() => {
    if (!driving || !visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!bufferRef.current) bufferRef.current = document.createElement('canvas');
    const buf = bufferRef.current;
    buf.width = RES;
    buf.height = RES;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const ana =
        analyser !== undefined ? analyser : engineRef.current?.analysers()?.spectrum ?? null;
      const feats = sampleAudioFeatures(ana, engineRef.current?.sampleRate ?? 48000);

      let field = STATIC_FIELD;
      let energy = 0;
      if (feats.active && feats.peakHz > 0) {
        const driveHz = smoothDriveHz(smoothHzRef.current, feats.peakHz);
        smoothHzRef.current = driveHz;
        const drive = driveFromFeatures({ ...feats, peakHz: driveHz }, PLATE);
        let modeLabel: string | null = null;
        if (mode === 'physics' && drive.squareModes.length > 0) {
          field = drivenSquareField(drive.squareModes);
          const top = drive.squareModes[0];
          modeLabel = `(${top.n},${top.m})`;
        } else if (mode === 'art' && drive.artMode) {
          const { n, m } = drive.artMode;
          field = (x, y) => squarePlateValue(x, y, n, Math.max(n === 0 && m === 0 ? 1 : 0, m), 1);
          modeLabel = `(${n},${m})`;
        }
        energy = feats.energy;
        setLive((prev) => (prev ? prev : true));
        if (modeLabel) {
          const rounded = Math.round(driveHz * 10) / 10;
          setReadout((prev) =>
            prev && Math.abs(prev.hz - rounded) < 0.5 && prev.mode === modeLabel
              ? prev
              : { hz: rounded, mode: modeLabel },
          );
        }
      } else {
        smoothHzRef.current = 0;
        setLive((prev) => (prev ? false : prev));
      }

      renderFrame(buf.getContext('2d'), RES, RES, {
        field,
        circular: false,
        mode: 'lines',
        colormap: 'amber-grain',
        energy,
      });
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, canvas.clientWidth * dpr);
      const h = Math.max(1, canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(buf, 0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [driving, visible, mode, analyser, engineRef]);

  // Idle: paint the static deterministic frame once, schedule nothing.
  useEffect(() => {
    if (driving || !visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!bufferRef.current) bufferRef.current = document.createElement('canvas');
    const buf = bufferRef.current;
    buf.width = RES;
    buf.height = RES;
    renderFrame(buf.getContext('2d'), RES, RES, {
      field: STATIC_FIELD,
      circular: false,
      mode: 'lines',
      colormap: 'amber-grain',
      energy: 0,
    });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, canvas.clientWidth * dpr);
    const h = Math.max(1, canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(buf, 0, 0, w, h);
  }, [driving, visible]);

  return (
    <div
      ref={hostRef}
      data-testid="studio-cymatics"
      data-state={live ? 'live' : 'static'}
      className="scope-well flex flex-col"
      style={{ height }}
    >
      <div className="flex items-center gap-2 hairline-b" style={{ padding: '8px 12px' }}>
        <span className="t-label">CYMATICS</span>
        {(['physics', 'art'] as Interpretation[]).map((m) => (
          <button
            key={m}
            type="button"
            className={`chip ${mode === m ? 'chip-active' : ''}`}
            style={{ height: 22, fontSize: 10 }}
            onClick={() => setMode(m)}
            title={
              m === 'physics'
                ? 'Eigenfrequency-ladder drive — drives a virtual plate — simulated response'
                : 'Direct frequency→mode morph — artistic rendering of a virtual plate'
            }
          >
            {m.toUpperCase()}
          </button>
        ))}
        <InfoPopover featureId="cymatic-patterns" label="About cymatic patterns" />
        <Link
          to="/cymatics"
          className="chip"
          style={{ marginLeft: 'auto', height: 22, fontSize: 10, textDecoration: 'none' }}
          title="Open the full Cymatic Studio"
        >
          FULL STUDIO ↗
        </Link>
      </div>
      <canvas
        ref={canvasRef}
        style={{ flex: 1, width: '100%', display: 'block', minHeight: 0 }}
        aria-label={
          live
            ? 'Live Chladni pattern driven by the session audio on a virtual plate'
            : 'Static Chladni figure — start a session to drive the virtual plate live'
        }
      />
      <div className="hairline-t" style={{ padding: '8px 12px' }}>
        <p className="t-caption" style={{ color: TEXT[3], marginBottom: 4 }}>
          {HONESTY[mode]}
        </p>
        <div className="t-readout-sm" style={{ color: TEXT[3] }}>
          PLATE {PLATE.label}
          {' · '}
          {live && readout
            ? `DRIVE ${readout.hz.toFixed(1)} Hz · MODE ${readout.mode}`
            : 'STATIC — START A SESSION TO DRIVE THE PLATE LIVE'}
        </div>
      </div>
    </div>
  );
}

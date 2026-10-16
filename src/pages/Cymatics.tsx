/**
 * Cymatic Studio (W6) — Chladni-style nodal-pattern visualizer.
 *
 * Physics model (src/cymatics/chladni.ts): idealized square plate (Bourke
 * cos-form + generalized sin-mix with fractional morphing) and circular
 * plate (Bessel modes). A declared VIRTUAL PLATE preset defines an
 * eigenfrequency ladder; a driving frequency (manual, typed, or live audio
 * peak) excites nearby modes with Lorentzian weights ("physics mode").
 *
 * HONESTY (surfaced in the info popover + a permanent warning chip): real
 * cymatic patterns depend on plate geometry, material, thickness, and
 * boundary conditions — NOT on frequency alone. Everything here is the
 * simulated response of a chosen virtual plate.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Play,
  Pause,
  Shuffle,
  Square,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Hand,
} from "lucide-react";
import { Link } from "react-router";
import { createPortal } from "react-dom";
import {
  CymaticsSurface,
  type SurfaceCamera,
  type SurfaceStyle,
} from "@/ui/visuals/CymaticsSurface";
import { DimensionalSand } from "@/ui/visuals/DimensionalSand";
import {
  SAND_FORMS,
  type SandForm,
  type SandPalette,
} from "@/ui/visuals/dimensional-sand/math";
import { ResonanceField } from "@/ui/visuals/ResonanceField";
import { PanicButton } from "@/ui/components/Panic";
import { useModalA11y } from "@/ui/hooks";
import "./cymatics-lab.css";
import { useSession } from "@/ui/session/useSession";
import { Chip, Readout } from "@/ui/components/primitives";
import { FREQUENCIES } from "@/data/frequencies";
import {
  VIRTUAL_PLATES,
  circularModeHz,
  createSand,
  drivenCircularField,
  drivenCircularModes,
  drivenSquareField,
  drivenSquareModes,
  frequencyToModes,
  plateField,
  squareModeHz,
  stepParticles,
  virtualPlateById,
  type PlateSign,
  type SandState,
} from "@/cymatics/chladni";
import { COLORMAPS, renderFrame, type ColormapName } from "@/cymatics/render";
import { drawPlate3D, drawPlate5D } from "@/cymatics/plate3d";
import { useOrbitCamera } from "@/hooks/useOrbitCamera";
import { sampleAudioFeatures, smoothDriveHz } from "@/cymatics/audioLink";

type DriveMode = "manual" | "frequency" | "audio";
type Interpretation = "physics" | "art";

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  disabled?: boolean;
}) {
  return (
    <div style={{ opacity: disabled ? 0.4 : 1 }}>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 4 }}
      >
        <span className="t-label">{label}</span>
        <Readout value={format ? format(value) : String(value)} size="sm" />
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--amber)" }}
      />
    </div>
  );
}

export default function Cymatics() {
  const {
    carrierHz: sessionCarrierHz,
    beatHz: sessionBeatHz,
    engineRef,
    previewId,
    previewTone,
  } = useSession();

  // ---- plate + mode state --------------------------------------------------
  const [plateId, setPlateId] = useState("steel-square-30");
  const plate = virtualPlateById(plateId);
  const shape = plate.shape;
  const [interp, setInterp] = useState<Interpretation>("physics");
  const [driveMode, setDriveMode] = useState<DriveMode>("manual");

  const [n, setN] = useState(3);
  const [m, setM] = useState(4);
  const [sign, setSign] = useState<PlateSign>(1);
  const [mixA, setMixA] = useState(1);
  const [mixB, setMixB] = useState(-1);
  const [circM, setCircM] = useState(1);
  const [circS, setCircS] = useState(1);

  const [freqHz, setFreqHz] = useState(432);
  const [audioHz, setAudioHz] = useState(0);
  const [audioActive, setAudioActive] = useState(false);

  // ---- render state --------------------------------------------------------
  const [renderMode, setRenderMode] = useState<
    "lines" | "sand" | "plate3d" | "plate5d"
  >("plate3d");
  const [colormap, setColormap] = useState<ColormapName>("gold-plate");
  const [view, setView] = useState<
    SurfaceStyle | "sand" | "lines" | "geometry" | "universe"
  >("universe");
  const [gpu, setGpu] = useState(true);
  const [sandForm, setSandForm] = useState<SandForm>("clifford");
  const [sandPalette, setSandPalette] = useState<SandPalette>("copper");
  const [sandCount, setSandCount] = useState(40000);
  const [rotation4, setRotation4] = useState(0.6);
  const [tilt4, setTilt4] = useState(0.35);
  const [dispersion, setDispersion] = useState(0.08);
  const [turbulence, setTurbulence] = useState(0.28);
  const [lift, setLift] = useState(0.15);
  const [stir, setStir] = useState(false);
  const [sandRenderer, setSandRenderer] = useState("Preparing grains…");
  const sandApi = useRef<SurfaceCamera | null>(null);
  const sandPose = useRef({ position: [0, 2.05, 5.9], time: 0 });
  const universe = view === "universe";
  const selectedForm = SAND_FORMS.find((f) => f.id === sandForm)!;
  const [paused, setPaused] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [amplitude, setAmplitude] = useState(0.25);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<"plate" | "drive" | "look">("plate");
  const surfaceApi = useRef<SurfaceCamera | null>(null);
  const surfacePoseRef = useRef({ position: [0, 3.5, 4.4], time: 0 });
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const freezeTime = useRef(0);
  useModalA11y(expanded, () => setExpanded(false), closeRef, stageRef);
  const usingGpu = gpu && ["surface", "particles", "water"].includes(view);
  const {
    cam: orbitCamRef,
    interacted: orbitedRef,
    bind: orbitBind,
  } = useOrbitCamera();
  const [threshold, setThreshold] = useState(0.08);
  const [particleCount, setParticleCount] = useState(6000);
  const [speed, setSpeed] = useState(1);
  const [resolution, setResolution] = useState(288);
  const [seed, setSeed] = useState(7);

  // ---- canvas + sim refs -----------------------------------------------------
  const displayRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null);
  const sandRef = useRef<SandState | null>(null);
  const energyRef = useRef(0);
  const smoothHzRef = useRef(0);

  const driveHz = driveMode === "audio" ? audioHz : freqHz;
  const driven = driveMode !== "manual";

  // The field is the single source of truth for both render modes.
  const field = useMemo((): ((x: number, y: number) => number) => {
    if (driven && driveHz > 0) {
      if (interp === "physics") {
        if (shape === "square")
          return drivenSquareField(drivenSquareModes(driveHz, plate));
        return drivenCircularField(
          drivenCircularModes(driveHz, plate),
          plate.boundary,
        );
      }
      // Art mode: snap to the nearest rung of the honest ladder, render pure.
      const best = frequencyToModes(driveHz, shape, {
        fundamentalHz: plate.fundamentalHz,
        scaling: plate.scaling,
        boundary: plate.boundary,
        tolerance: 10,
        limit: 1,
      })[0];
      if (best) {
        if (best.kind === "square") {
          const bn = best.n;
          const bm = best.m;
          const bs = best.sign;
          return (x, y) =>
            plateField({
              shape: "square",
              n: bn,
              m: bm,
              sign: bs,
              mixA: 1,
              mixB: -1,
              useMix: false,
              circM: 0,
              circS: 1,
              boundary: "clamped",
            })(x, y);
        }
        const bm2 = best.m;
        const bs2 = best.s;
        const bb = best.boundary;
        return (x, y) =>
          plateField({
            shape: "circular",
            n: 0,
            m: 1,
            sign: 1,
            mixA: 1,
            mixB: -1,
            useMix: false,
            circM: bm2,
            circS: bs2,
            boundary: bb,
          })(x, y);
      }
    }
    if (shape === "square") {
      if (interp === "art") {
        const fn = n;
        const fm = m;
        return (x, y) =>
          plateField({
            shape: "square",
            n: fn,
            m: fm,
            sign,
            mixA,
            mixB,
            useMix: true,
            circM: 0,
            circS: 1,
            boundary: "clamped",
          })(x, y);
      }
      const ni = Math.round(n);
      const mi = Math.round(m);
      return plateField({
        shape: "square",
        n: ni,
        m: Math.max(ni === 0 && mi === 0 ? 1 : 0, mi),
        sign,
        mixA: 1,
        mixB: -1,
        useMix: false,
        circM: 0,
        circS: 1,
        boundary: "clamped",
      });
    }
    return plateField({
      shape: "circular",
      n: 0,
      m: 1,
      sign: 1,
      mixA: 1,
      mixB: -1,
      useMix: false,
      circM,
      circS,
      boundary: plate.boundary,
    });
  }, [
    driven,
    driveHz,
    interp,
    shape,
    plate,
    n,
    m,
    sign,
    mixA,
    mixB,
    circM,
    circS,
  ]);

  // Modal-frequency readout for the current selection.
  const modalHz = useMemo(() => {
    if (shape === "square") {
      const ni = Math.round(n);
      const mi = Math.max(
        ni === 0 && Math.round(m) === 0 ? 1 : 0,
        Math.round(m),
      );
      return squareModeHz(ni, mi, plate.fundamentalHz, plate.scaling);
    }
    return circularModeHz(circM, circS, plate.fundamentalHz, plate.boundary);
  }, [shape, n, m, circM, circS, plate]);

  // Sand lifecycle: reseed when count / shape / seed changes.
  useEffect(() => {
    sandRef.current = createSand(particleCount, seed, shape === "circular");
  }, [particleCount, shape, seed]);

  // ---- animation loop --------------------------------------------------------
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      if (document.hidden) return;
      if (!paused) freezeTime.current += dt * speed;
      // Audio link (degrades gracefully to a static frame when offline).
      if (driveMode === "audio") {
        const analyser = engineRef.current?.analysers()?.spectrum ?? null;
        const feats = sampleAudioFeatures(
          analyser,
          engineRef.current?.sampleRate ?? 48000,
        );
        energyRef.current = feats.energy;
        setAudioActive(feats.active);
        if (feats.active) {
          const smoothed = smoothDriveHz(smoothHzRef.current, feats.peakHz);
          smoothHzRef.current = smoothed;
          setAudioHz((cur) =>
            Math.abs(cur - smoothed) > 0.5
              ? Math.round(smoothed * 10) / 10
              : cur,
          );
        }
      } else {
        energyRef.current = 0;
        smoothHzRef.current = 0;
        setAudioActive(false);
      }

      if (usingGpu || view === "geometry" || view === "universe") return;
      const canvas = displayRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (!bufferRef.current)
        bufferRef.current = document.createElement("canvas");
      const buf = bufferRef.current;
      if (buf.width !== resolution || buf.height !== resolution) {
        buf.width = resolution;
        buf.height = resolution;
      }

      const sand = sandRef.current;
      if (
        !paused &&
        (renderMode === "sand" ||
          renderMode === "plate3d" ||
          renderMode === "plate5d") &&
        sand
      ) {
        stepParticles(sand, field, dt * speed, {
          jitter: 0.012 + energyRef.current * 0.05,
        });
      }

      const orbit = orbitedRef.current ? { ...orbitCamRef.current } : undefined;
      if (renderMode === "plate3d" || renderMode === "plate5d") {
        const drawFn = renderMode === "plate5d" ? drawPlate5D : drawPlate3D;
        drawFn(buf.getContext("2d")!, resolution, resolution, field, {
          time: freezeTime.current,
          amp: amplitude,
          energy: energyRef.current,
          gridX: resolution >= 512 ? 76 : 52,
          gridY: resolution >= 512 ? 54 : 36,
          stride: 2,
          particles: sand,
          orbit,
        });
      } else {
        renderFrame(buf.getContext("2d"), resolution, resolution, {
          field,
          circular: shape === "circular",
          mode: renderMode,
          colormap,
          threshold,
          particles: renderMode === "sand" ? sand : null,
          energy: energyRef.current,
        });
      }
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const size = Math.min(canvas.width, canvas.height);
      ctx.drawImage(
        buf,
        (canvas.width - size) / 2,
        (canvas.height - size) / 2,
        size,
        size,
      );
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    field,
    renderMode,
    colormap,
    threshold,
    resolution,
    speed,
    shape,
    driveMode,
    engineRef,
    orbitCamRef,
    orbitedRef,
    paused,
    amplitude,
    usingGpu,
    view,
  ]);

  // ---- actions ----------------------------------------------------------------
  const exportPng = useCallback(() => {
    if (universe) {
      sandApi.current?.capture();
      return;
    }
    if (usingGpu) {
      surfaceApi.current?.capture();
      return;
    }
    const res = 1024;
    const off = document.createElement("canvas");
    off.width = res;
    off.height = res;
    if (renderMode === "plate3d" || renderMode === "plate5d") {
      const drawFn = renderMode === "plate5d" ? drawPlate5D : drawPlate3D;
      drawFn(off.getContext("2d")!, res, res, field, {
        time: freezeTime.current,
        amp: amplitude,
        energy: 0,
        gridX: 76,
        gridY: 54,
        stride: 2,
        particles: sandRef.current,
        still: true,
        orbit: { ...orbitCamRef.current },
      });
    } else {
      renderFrame(off.getContext("2d"), res, res, {
        field,
        circular: shape === "circular",
        mode: renderMode,
        colormap,
        threshold,
        particles: renderMode === "sand" ? sandRef.current : null,
        energy: 0,
      });
    }
    off.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cymatics-${shape}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [
    field,
    shape,
    renderMode,
    colormap,
    threshold,
    usingGpu,
    universe,
    amplitude,
    orbitCamRef,
  ]);

  const selectShape = (next: "square" | "circular") => {
    if (next === shape) return;
    const first = VIRTUAL_PLATES.find((p) => p.shape === next);
    if (first) setPlateId(first.id);
  };

  const libFrequencies = FREQUENCIES.filter((f) => typeof f.hz === "number");

  // "Hear this pattern": the drive frequency (audio-linked live peak, typed Hz)
  // or, in manual mode, the selected mode's eigenfrequency — as a capped tone.
  const hearHz = driven && driveHz > 0 ? driveHz : modalHz;
  const hearing = previewId === "cymatics:plate";

  const modeLabel =
    shape === "square"
      ? driven
        ? "DRIVEN"
        : `(n=${interp === "art" ? n.toFixed(2) : Math.round(n)}, m=${interp === "art" ? m.toFixed(2) : Math.round(m)})`
      : driven
        ? "DRIVEN"
        : `(m=${circM}, s=${circS})`;

  const changeView = (next: typeof view) => {
    setView(next);
    if (next === "sand" || next === "lines") setRenderMode(next);
    else setRenderMode("plate3d");
  };
  const zoom = (factor: number) => {
    if (universe) sandApi.current?.zoom(factor);
    else if (usingGpu) surfaceApi.current?.zoom(factor);
    else {
      orbitedRef.current = true;
      orbitCamRef.current.dist = Math.max(
        0.8,
        Math.min(6, orbitCamRef.current.dist / factor),
      );
    }
  };
  const reset = () => {
    sandApi.current?.reset();
    surfaceApi.current?.reset();
    orbitCamRef.current = { yaw: 0.42, tilt: 1.02, dist: 2.1 };
    orbitedRef.current = true;
  };
  const cameraControls = !["geometry", "sand", "lines"].includes(view) && (
    <div className="cym-camera" aria-label="Camera controls">
      <button
        aria-label={universe ? "Zoom out sand" : "Zoom out plate"}
        onClick={() => zoom(1 / 1.15)}
      >
        <Minus size={16} />
      </button>
      <button
        aria-label={universe ? "Zoom in sand" : "Zoom in plate"}
        onClick={() => zoom(1.15)}
      >
        <Plus size={16} />
      </button>
      <span />
      <button
        aria-label={universe ? "Rotate sand left" : "Rotate plate left"}
        onClick={() => {
          if (universe) sandApi.current?.turn(-1);
          else if (usingGpu) surfaceApi.current?.turn(-1);
          else {
            orbitedRef.current = true;
            orbitCamRef.current.yaw -= 0.2;
          }
        }}
      >
        <ArrowLeft size={16} />
      </button>
      <button
        aria-label={universe ? "Rotate sand right" : "Rotate plate right"}
        onClick={() => {
          if (universe) sandApi.current?.turn(1);
          else if (usingGpu) surfaceApi.current?.turn(1);
          else {
            orbitedRef.current = true;
            orbitCamRef.current.yaw += 0.2;
          }
        }}
      >
        <ArrowRight size={16} />
      </button>
      <button
        onClick={() => {
          if (universe) sandApi.current?.top();
          else if (usingGpu) surfaceApi.current?.top();
          else {
            orbitedRef.current = true;
            orbitCamRef.current.tilt = 0.02;
          }
        }}
      >
        Top view
      </button>
      <button onClick={reset}>
        <RotateCcw size={14} /> Reset
      </button>
    </div>
  );
  const stage = (
    <div
      className={`cym-stage ${universe ? "cym-universe" : ""} ${expanded ? "cym-stage-expanded" : ""}`}
      ref={stageRef}
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded || undefined}
      aria-label={expanded ? "Expanded cymatics stage" : undefined}
    >
      <div className="cym-stage-top">
        <span>
          <i />{" "}
          {universe
            ? "DIMENSIONAL SAND / GENERATIVE ART"
            : view === "geometry"
              ? "MATHEMATICAL GEOMETRY"
              : usingGpu
                ? "LIVE 3D SURFACE"
                : "CANVAS PLATE MODEL"}
        </span>
        <div>
          {view !== "geometry" && (
            <button aria-pressed={paused} onClick={() => setPaused(!paused)}>
              {paused ? <Play size={14} /> : <Pause size={14} />}{" "}
              {paused ? "Animate" : "Pause motion"}
            </button>
          )}
          <button
            ref={closeRef}
            aria-label={
              expanded ? "Exit expanded stage" : "Expand cymatics stage"
            }
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          {expanded && <PanicButton />}
        </div>
      </div>
      <div className="cym-stage-view">
        {universe ? (
          <DimensionalSand
            field={field}
            form={sandForm}
            count={sandCount}
            rotation={rotation4}
            tilt={tilt4}
            dispersion={dispersion}
            turbulence={turbulence}
            lift={lift}
            palette={sandPalette}
            speed={speed}
            paused={paused}
            stir={stir}
            energy={energyRef}
            api={sandApi}
            poseRef={sandPose}
            onRenderer={setSandRenderer}
          />
        ) : view === "geometry" ? (
          <ResonanceField immersive />
        ) : usingGpu ? (
          <CymaticsSurface
            field={field}
            circular={shape === "circular"}
            style={view as SurfaceStyle}
            density={particleCount}
            amplitude={amplitude}
            speed={speed}
            paused={paused}
            api={surfaceApi}
            poseRef={surfacePoseRef}
            onUnavailable={() => setGpu(false)}
          />
        ) : (
          <canvas
            ref={displayRef}
            width={1024}
            height={760}
            {...orbitBind}
            aria-label="Interactive plate — drag to orbit, scroll or pinch to zoom, double-click to reset"
          />
        )}
        {view !== "geometry" && (
          <>
            <div className="cym-stage-caption">
              <span>
                {universe ? (
                  sandRenderer
                ) : (
                  <>
                    {shape === "square" ? "SQUARE" : "CIRCULAR"} / {modeLabel}
                  </>
                )}
              </span>
              <span>
                {universe
                  ? "Drag to orbit · scroll to travel closer"
                  : !gpu && ["surface", "particles", "water"].includes(view)
                    ? "Interactive Canvas fallback · GPU unavailable"
                    : view === "water"
                      ? "Fluid styling · artistic displacement"
                      : view === "particles"
                        ? "Sampled nodal points · not grain dynamics"
                        : "Analytic virtual-plate approximation"}
              </span>
            </div>
            {universe && (
              <>
                <div className="cym-sand-title">
                  <span>GRAINS IN TRANSFORMATION</span>
                  <h2>{selectedForm.label}</h2>
                  <p>{selectedForm.detail}</p>
                </div>
                <details className="cym-sculpt">
                  <summary>
                    <SlidersHorizontal size={15} /> Sculpt the field
                  </summary>
                  <div className="cym-sculpt-body">
                    <div className="cym-sculpt-heading">
                      Fourth-coordinate rotation
                    </div>
                    <Slider
                      label="XW rotation"
                      value={rotation4}
                      min={0}
                      max={Math.PI * 2}
                      step={0.02}
                      onChange={setRotation4}
                      format={(v) => `${Math.round((v * 180) / Math.PI)}°`}
                      disabled={sandForm !== "clifford"}
                    />
                    <Slider
                      label="YW rotation"
                      value={tilt4}
                      min={0}
                      max={Math.PI * 2}
                      step={0.02}
                      onChange={setTilt4}
                      format={(v) => `${Math.round((v * 180) / Math.PI)}°`}
                      disabled={sandForm !== "clifford"}
                    />
                    <Slider
                      label="Dispersion"
                      value={dispersion}
                      min={0}
                      max={1.5}
                      step={0.01}
                      onChange={setDispersion}
                      format={(v) => v.toFixed(2)}
                    />
                    <Slider
                      label="Turbulence"
                      value={turbulence}
                      min={0}
                      max={2}
                      step={0.02}
                      onChange={setTurbulence}
                      format={(v) => v.toFixed(2)}
                    />
                    <Slider
                      label="Lift"
                      value={lift}
                      min={-1}
                      max={2}
                      step={0.02}
                      onChange={setLift}
                      format={(v) => v.toFixed(2)}
                    />
                    <Slider
                      label="Time flow"
                      value={speed}
                      min={0}
                      max={2}
                      step={0.05}
                      onChange={setSpeed}
                      format={(v) => `${v.toFixed(2)}×`}
                    />
                    <label>
                      Grain budget
                      <select
                        aria-label="Dimensional grain budget"
                        value={sandCount}
                        onChange={(e) => setSandCount(Number(e.target.value))}
                      >
                        <option value={20000}>20,000 · light</option>
                        <option value={40000}>40,000 · balanced</option>
                        <option value={80000}>80,000 · rich</option>
                      </select>
                    </label>
                    <p>Actual density adapts to screen size and performance.</p>
                    <label>
                      Material
                      <select
                        aria-label="Sand material"
                        value={sandPalette}
                        onChange={(e) =>
                          setSandPalette(e.target.value as SandPalette)
                        }
                      >
                        <option value="copper">Copper / pearl</option>
                        <option value="glacier">Glacial silver</option>
                        <option value="ivory">Ivory / charcoal</option>
                      </select>
                    </label>
                  </div>
                </details>
                <button
                  className="cym-stir"
                  aria-pressed={stir}
                  onClick={() => setStir(!stir)}
                >
                  <Hand size={14} />{" "}
                  {stir ? "Stirring · drag grains" : "Stir grains"}
                </button>
              </>
            )}
            {cameraControls}
          </>
        )}
      </div>
      {universe && (
        <div className="cym-form-rail" aria-label="Sand forms">
          {SAND_FORMS.map((form, index) => (
            <button
              key={form.id}
              aria-pressed={sandForm === form.id}
              onClick={() => setSandForm(form.id)}
            >
              <span>0{index + 1}</span>
              {form.label}
            </button>
          ))}
        </div>
      )}
      <div className="cym-stage-bottom">
        <div>
          <small>{universe ? "PLATE TONE" : "MODAL FREQUENCY"}</small>
          <strong>
            {modalHz.toFixed(1)} <em>Hz</em>
          </strong>
        </div>
        <div>
          <small>DRIVE</small>
          <strong>
            {driven ? driveHz.toFixed(1) : "Manual"} {driven && <em>Hz</em>}
          </strong>
        </div>
        <div className="cym-stage-buttons">
          <button
            className={hearing ? "cym-active" : ""}
            onClick={() => previewTone("cymatics:plate", hearHz)}
            aria-label={
              hearing
                ? "Stop the pattern tone"
                : `Hear this pattern: ${hearHz.toFixed(1)} Hz tone`
            }
          >
            {hearing ? <Square size={14} /> : <Play size={14} />}{" "}
            {hearing ? "Stop tone" : "Hear pattern"}
          </button>
          <button disabled={view === "geometry"} onClick={exportPng}>
            <Download size={14} /> Save image
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div className={`cym-lab ${universe ? "cym-lab-universe" : ""}`}>
      <header className="cym-heading">
        <div>
          <span className="res-kicker">THE SAND OBSERVATORY</span>
          <h1>
            Cymatics<span>Between dimensions.</span>
          </h1>
        </div>
        <p>
          Sculpt the field. Rotate through four coordinates.
          <br />
          Generative art and an independent virtual-plate model.
        </p>
      </header>
      <div className="cym-view-tabs" aria-label="Visualisation style">
        {(
          [
            ["universe", "Dimensional sand"],
            ["surface", "3D surface"],
            ["particles", "Nodal particles"],
            ["water", "Fluid art"],
            ["sand", "Sand simulation"],
            ["lines", "Nodal lines"],
            ["geometry", "3D / 4D geometry"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-pressed={view === id}
            onClick={() => changeView(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="cym-layout">
        <div className="cym-main">
          {expanded ? createPortal(stage, document.body) : stage}
          {!universe && (
            <div className="cym-presets">
              <div>
                <span className="res-kicker">PATTERN STUDIES</span>
                <p>Choose a starting point</p>
              </div>
              {[
                [1, 2, "Cross"],
                [2, 3, "Lattice"],
                [3, 4, "Petals"],
                [4, 7, "Woven"],
                [5, 8, "Interference"],
                [6, 7, "Intricate"],
              ].map(([pn, pm, title]) => (
                <button
                  key={title}
                  aria-pressed={
                    n === pn &&
                    m === pm &&
                    driveMode === "manual" &&
                    shape === "square"
                  }
                  onClick={() => {
                    selectShape("square");
                    setN(Number(pn));
                    setM(Number(pm));
                    setDriveMode("manual");
                    setInterp("physics");
                    setSeed((v) => v + 1);
                    if (view === "geometry") changeView("surface");
                  }}
                >
                  <span>
                    {pn} : {pm}
                  </span>
                  {title}
                </button>
              ))}
            </div>
          )}
          <p className="cym-model-note">
            Dimensional sand is a parametric artwork. Its four-coordinate
            rotations are mathematical projections, not physical extra
            dimensions. The plate views retain the analytic model: a frequency
            alone does not determine a universal shape. Sound starts only with
            Hear pattern.
          </p>
          <details className="cym-method">
            <summary>How this model works · sources & limits</summary>
            <p>
              The square model uses analytic cosine-mode combinations. Circular
              patterns use Bessel modes. In frequency mode, the selected virtual
              plate supplies an approximate eigenfrequency ladder, mixed with
              Lorentzian weights. This is an educational model, not a calibrated
              finite-element solver or prediction for an arbitrary real plate.
            </p>
            <p>
              Dimensional sand morphs between parametric surfaces using GPU
              grain sprites. The Clifford form begins on a unit sphere in four
              coordinates, rotates in the XW and YW planes, then projects from w
              = 2.6 into three dimensions. Pointer swirls, dispersion and
              turbulence are visual displacements; no granular mechanics or
              fluid equations are solved. Studio audio can modulate size when
              explicitly selected in Signal controls.
            </p>
            <p>
              In the 3D view, surface height is an exaggerated oscillation of
              the same field, and nodal particles sample its zero set. Sand
              simulation uses the existing particle relaxation model. The fluid
              view is artistic; no fluid dynamics are solved. The fourth
              coordinate in the Clifford view is mathematical, not a measured
              brain state.
            </p>
            <a
              href="https://github.com/mrdoob/three.js"
              target="_blank"
              rel="noreferrer"
            >
              Three.js · open-source rendering engine (MIT) ↗
            </a>
            <a
              href="https://arxiv.org/abs/1308.5523"
              target="_blank"
              rel="noreferrer"
            >
              Müller · Numerical Chladni figures ↗
            </a>
            <a
              href="https://www.math.brown.edu/tbanchof/Beyond3d.new/chapter6/s6_8.html"
              target="_blank"
              rel="noreferrer"
            >
              Banchoff · Beyond the Third Dimension ↗
            </a>
          </details>
        </div>
        <details
          className="cym-model-controls"
          open={universe ? undefined : true}
        >
          <summary>
            Plate &amp; sound controls{" "}
            <span>Virtual plate · optional audio drive · model settings</span>
          </summary>
          <aside className="cym-inspector">
            <div className="cym-inspector-title">
              <span>Shape the experiment</span>
              <span>↗</span>
            </div>
            <div
              className="cym-inspector-tabs"
              aria-label="Experiment controls"
            >
              {(["plate", "drive", "look"] as const).map((t) => (
                <button
                  key={t}
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t === "look"
                    ? "Appearance"
                    : t === "drive"
                      ? "Signal"
                      : "Plate"}
                </button>
              ))}
            </div>
            {tab === "plate" && (
              <div className="cym-controls">
                <h2>Virtual plate</h2>
                <div className="cym-chips">
                  <Chip
                    active={shape === "square"}
                    onClick={() => selectShape("square")}
                  >
                    Square
                  </Chip>
                  <Chip
                    active={shape === "circular"}
                    onClick={() => selectShape("circular")}
                  >
                    Circular
                  </Chip>
                </div>
                <label>
                  Plate preset
                  <select
                    aria-label="Virtual plate preset"
                    value={plateId}
                    onChange={(e) => setPlateId(e.target.value)}
                  >
                    {VIRTUAL_PLATES.map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p>{plate.note}</p>
                <div className="cym-stat">
                  <span>Fundamental</span>
                  <strong>{plate.fundamentalHz} Hz</strong>
                </div>
                <h2>Mode shape</h2>
                {shape === "square" ? (
                  <>
                    <Slider
                      label="Mode N"
                      value={n}
                      min={0}
                      max={12}
                      step={1}
                      onChange={setN}
                    />
                    <Slider
                      label="Mode M"
                      value={m}
                      min={1}
                      max={12}
                      step={1}
                      onChange={setM}
                    />
                    <div className="cym-chips">
                      <Chip active={sign === 1} onClick={() => setSign(1)}>
                        Difference −
                      </Chip>
                      <Chip active={sign === -1} onClick={() => setSign(-1)}>
                        Sum +
                      </Chip>
                    </div>
                  </>
                ) : (
                  <>
                    <Slider
                      label="Angular mode"
                      value={circM}
                      min={0}
                      max={5}
                      step={1}
                      onChange={setCircM}
                    />
                    <Slider
                      label="Radial mode"
                      value={circS}
                      min={1}
                      max={5}
                      step={1}
                      onChange={setCircS}
                    />
                  </>
                )}
                {driven && (
                  <button
                    className="cym-control-link"
                    onClick={() => setDriveMode("manual")}
                  >
                    Use these manual modes
                  </button>
                )}
                <button
                  className="cym-control-link"
                  onClick={() => setSeed((v) => v + 1)}
                >
                  <Shuffle size={14} /> Scatter sand
                </button>
                <p>
                  Scatter affects Sand simulation. Nodal particles show the
                  sampled zero set.
                </p>
              </div>
            )}
            {tab === "drive" && (
              <div className="cym-controls">
                <h2>Drive the pattern</h2>
                <div className="cym-chips">
                  {(["manual", "frequency", "audio"] as const).map((v) => (
                    <Chip
                      key={v}
                      active={driveMode === v}
                      onClick={() => setDriveMode(v)}
                    >
                      {v === "audio" ? "Studio audio" : v}
                    </Chip>
                  ))}
                </div>
                {driveMode === "manual" ? (
                  <p>
                    Use the Plate tab to select mode numbers. This view is
                    silent until you choose Hear pattern.
                  </p>
                ) : driveMode === "frequency" ? (
                  <>
                    <label>
                      Drive frequency · Hz
                      <input
                        aria-label="Drive frequency in Hz"
                        type="number"
                        min={20}
                        max={8000}
                        value={freqHz}
                        onChange={(e) =>
                          setFreqHz(
                            Math.min(
                              8000,
                              Math.max(20, Number(e.target.value) || 20),
                            ),
                          )
                        }
                      />
                    </label>
                    <Slider
                      label="Frequency"
                      value={freqHz}
                      min={20}
                      max={4000}
                      step={1}
                      onChange={setFreqHz}
                    />
                    <select
                      aria-label="Library frequency"
                      value=""
                      onChange={(e) => {
                        if (Number(e.target.value) > 0)
                          setFreqHz(Math.min(8000, Number(e.target.value)));
                      }}
                    >
                      <option value="">Choose a library frequency…</option>
                      {libFrequencies.map((f) => (
                        <option key={f.id} value={f.hz}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="cym-control-link"
                      onClick={() => setFreqHz(Math.max(20, sessionCarrierHz))}
                    >
                      Use Studio carrier · {sessionCarrierHz.toFixed(0)} Hz
                    </button>
                    <button
                      className="cym-control-link"
                      onClick={() =>
                        setFreqHz(Math.max(20, sessionBeatHz * 40))
                      }
                    >
                      Use beat × 40 · {(sessionBeatHz * 40).toFixed(0)} Hz
                    </button>
                  </>
                ) : (
                  <>
                    <div className="cym-signal" role="status">
                      {audioActive
                        ? `Live spectrum · ${audioHz.toFixed(1)} Hz`
                        : "No signal · start a session in Studio"}
                    </div>
                    <Link to="/studio" className="cym-control-link">
                      Open Studio →
                    </Link>
                    <p>
                      The measured spectral peak drives the virtual plate. This
                      does not measure a physical plate or your brain.
                    </p>
                  </>
                )}
                <h2>Interpretation</h2>
                <div className="cym-chips">
                  <Chip
                    active={interp === "physics"}
                    onClick={() => setInterp("physics")}
                  >
                    Plate model
                  </Chip>
                  <Chip
                    active={interp === "art"}
                    onClick={() => setInterp("art")}
                  >
                    Art mix
                  </Chip>
                </div>
                {interp === "art" && (
                  <>
                    <Slider
                      label="Mix A"
                      value={mixA}
                      min={-1}
                      max={1}
                      step={0.05}
                      onChange={setMixA}
                    />
                    <Slider
                      label="Mix B"
                      value={mixB}
                      min={-1}
                      max={1}
                      step={0.05}
                      onChange={setMixB}
                    />
                    <p>
                      Art mix applies to square manual modes. Frequency drive
                      uses the nearest mode.
                    </p>
                  </>
                )}
              </div>
            )}
            {tab === "look" && (
              <div className="cym-controls">
                <h2>Surface & motion</h2>
                <Slider
                  label="Height exaggeration"
                  value={amplitude}
                  min={0}
                  max={0.65}
                  step={0.01}
                  onChange={setAmplitude}
                  format={(v) => v.toFixed(2)}
                />
                <Slider
                  label="Motion speed"
                  value={speed}
                  min={0}
                  max={2}
                  step={0.05}
                  onChange={setSpeed}
                  format={(v) => `${v.toFixed(2)}×`}
                />
                <Slider
                  label="Particle budget"
                  value={particleCount}
                  min={1000}
                  max={20000}
                  step={1000}
                  onChange={setParticleCount}
                />
                <p>
                  Particle budget affects nodal particles and sand. Motion speed
                  changes the visual animation, not the tone frequency.
                </p>
                <details>
                  <summary>Canvas settings</summary>
                  <label>
                    Palette
                    <select
                      value={colormap}
                      onChange={(e) =>
                        setColormap(e.target.value as ColormapName)
                      }
                    >
                      {COLORMAPS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Slider
                    label="Line width"
                    value={threshold}
                    min={0.01}
                    max={0.3}
                    step={0.005}
                    onChange={setThreshold}
                  />
                  <Slider
                    label="Canvas detail"
                    value={resolution}
                    min={128}
                    max={512}
                    step={32}
                    onChange={setResolution}
                  />
                  <p>
                    Palette and line width apply to Sand simulation and Nodal
                    lines.
                  </p>
                </details>
                <button
                  className="cym-control-link"
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? "Resume visual motion" : "Freeze visual motion"}
                </button>
              </div>
            )}
            <div className="cym-inspector-foot">
              <PanicButton />
              <span>Stop all sound is always available.</span>
            </div>
          </aside>
        </details>
      </div>
    </div>
  );
}

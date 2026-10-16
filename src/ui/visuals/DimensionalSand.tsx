import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { SurfaceCamera } from "./CymaticsSurface";
import {
  PALETTES,
  SAND_FORMS,
  cliffordPoint,
  formPoint,
  grainBudget,
  seededRandom,
  type SandForm,
  type SandPalette,
  type Vec3,
} from "./dimensional-sand/math";
import { sandFragment, sandVertex } from "./dimensional-sand/shaders";

export interface SandPose {
  position: number[];
  time: number;
}
interface Props {
  form: SandForm;
  field: (x: number, y: number) => number;
  count: number;
  rotation: number;
  tilt: number;
  dispersion: number;
  turbulence: number;
  lift: number;
  palette: SandPalette;
  speed: number;
  paused: boolean;
  stir: boolean;
  energy: RefObject<number>;
  api: RefObject<SurfaceCamera | null>;
  poseRef: RefObject<SandPose>;
  onRenderer: (name: string) => void;
}
function saveCanvas(canvas: HTMLCanvasElement) {
  const output = document.createElement("canvas");
  output.width = canvas.width;
  output.height = canvas.height;
  const ctx = output.getContext("2d");
  if (!ctx) return;
  const glow = ctx.createRadialGradient(
    output.width / 2,
    output.height * 0.4,
    0,
    output.width / 2,
    output.height * 0.4,
    Math.max(output.width, output.height) * 0.65,
  );
  glow.addColorStop(0, "#1e242b");
  glow.addColorStop(0.42, "#0d1118");
  glow.addColorStop(1, "#070a10");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, output.width, output.height);
  ctx.drawImage(canvas, 0, 0);
  output.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "opensync-dimensional-sand.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, "image/png");
}
/** Parametric grain sculpture. Morphology and turbulence are artistic, not a particle-physics solver. */
export function DimensionalSand(props: Props) {
  const { api: apiRef, poseRef } = props;
  const elementRef = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    latest.current = props;
  }, [props]);
  useEffect(() => {
    const element = elementRef.current;
    if (!element || fallback) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "low-power",
      });
    } catch {
      const unavailableFrame = requestAnimationFrame(() => setFallback(true));
      return () => cancelAnimationFrame(unavailableFrame);
    }
    renderer.setClearColor("#070a10", 0);
    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        element.clientWidth < 650 ? 1.25 : 1.5,
      ),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      "Dimensional sand artwork. Drag to orbit; use Stir grains to swirl the field.",
    );
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
    camera.position.fromArray(poseRef.current.position);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.2;
    controls.maxDistance = 13;
    const initialWeights = SAND_FORMS.map((f) =>
      f.id === latest.current.form ? 1 : 0,
    );
    const uniforms = {
      weights: { value: initialWeights },
      time: { value: poseRef.current.time },
      rotation4: { value: 0 },
      tilt4: { value: 0 },
      dispersion: { value: 0.1 },
      turbulence: { value: 0.2 },
      lift: { value: 0.1 },
      energy: { value: 0 },
      dpr: { value: renderer.getPixelRatio() },
      pointer: { value: new THREE.Vector3() },
      pointerStrength: { value: 0 },
      warm: { value: new THREE.Color() },
      pearl: { value: new THREE.Color() },
      cool: { value: new THREE.Color() },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: sandVertex,
      fragmentShader: sandFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    let geometry = new THREE.BufferGeometry();
    const grains = new THREE.Points(geometry, material);
    grains.frustumCulled = false;
    scene.add(grains);
    let previousField: Props["field"] | undefined,
      previousCount = 0,
      requestedCount = 0;
    let effectiveCap = Infinity,
      lastRebuild = 0;
    function rebuild(p: Props) {
      const count = Math.min(
        effectiveCap,
        grainBudget(
          p.count,
          element!.clientWidth,
          navigator.hardwareConcurrency || 4,
        ),
      );
      const random = seededRandom(79271);
      const plate = new Float32Array(count * 3),
        torus = new Float32Array(count * 3),
        vortex = new Float32Array(count * 3),
        dunes = new Float32Array(count * 3),
        clifford = new Float32Array(count * 4),
        noise = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const u = random() * Math.PI * 2,
          v = random() * Math.PI * 2,
          layer = random() - 0.5;
        torus.set(formPoint("torus", u, v, layer), i * 3);
        vortex.set(formPoint("vortex", u, v, layer), i * 3);
        dunes.set(formPoint("dunes", u, v, layer), i * 3);
        clifford.set(cliffordPoint(u, v), i * 4);
        noise.set([random(), random(), random()], i * 3);
        let x = random(),
          z = random();
        for (let a = 0; a < 18; a++) {
          if (Math.abs(p.field(x, z)) < 0.075) break;
          x = random();
          z = random();
        }
        plate.set([(x - 0.5) * 3.6, layer * 0.06, (z - 0.5) * 3.6], i * 3);
      }
      geometry.dispose();
      geometry = new THREE.BufferGeometry();
      for (const [name, values, size] of [
        ["position", plate, 3],
        ["aTorus", torus, 3],
        ["aVortex", vortex, 3],
        ["aDunes", dunes, 3],
        ["aClifford", clifford, 4],
        ["aRandom", noise, 3],
      ] as const)
        geometry.setAttribute(name, new THREE.BufferAttribute(values, size));
      grains.geometry = geometry;
      previousField = p.field;
      previousCount = count;
      requestedCount = p.count;
      lastRebuild = performance.now();
      latest.current.onRenderer(`GPU · ${(count / 1000).toFixed(0)}k grains`);
    }
    const resize = () => {
      const w = element.clientWidth,
        h = element.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio || 1,
          w < 650 ? 1.25 : 1.5,
          Math.sqrt(2000000 / (w * h)),
        ),
      );
      uniforms.dpr.value = renderer.getPixelRatio();
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      grains.scale.setScalar(camera.aspect < 1 ? camera.aspect * 0.93 : 1);
      if (
        previousCount &&
        previousCount >
          grainBudget(
            latest.current.count,
            w,
            navigator.hardwareConcurrency || 4,
          )
      )
        rebuild(latest.current);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const direction = new THREE.Vector3(),
      raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2(),
      plane = new THREE.Plane(),
      hit = new THREE.Vector3();
    let pointerActive = false;
    const move = (event: PointerEvent) => {
      if (!latest.current.stir) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      camera.getWorldDirection(direction);
      plane.setFromNormalAndCoplanarPoint(direction, new THREE.Vector3());
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(plane, hit))
        uniforms.pointer.value.copy(hit).divideScalar(grains.scale.x);
      pointerActive = true;
    };
    const leave = () => {
      pointerActive = false;
    };
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerdown", move);
    renderer.domElement.addEventListener("pointerleave", leave);
    renderer.domElement.addEventListener("pointerup", leave);
    const reset = () => {
      camera.position.set(0, 2.05, 5.9);
      controls.target.set(0, 0, 0);
      controls.update();
    };
    apiRef.current = {
      zoom: (factor) => {
        const v = camera.position.clone().sub(controls.target);
        v.setLength(THREE.MathUtils.clamp(v.length() / factor, 2.2, 13));
        camera.position.copy(controls.target).add(v);
        controls.update();
      },
      turn: (direction) => {
        camera.position.applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          direction * 0.2,
        );
        controls.update();
      },
      top: () => {
        camera.position.set(0, 6.3, 0.001);
        controls.target.set(0, 0, 0);
        controls.update();
      },
      reset,
      capture: () => {
        renderer.render(scene, camera);
        saveCanvas(renderer.domElement);
      },
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      setFallback(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    let raf = 0,
      last = 0,
      time = poseRef.current.time,
      samples = 0,
      frameTotal = 0;
    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      if (document.hidden) {
        last = now;
        return;
      }
      if (now - last < 1000 / 30) return;
      const frameMs = now - last,
        dt = Math.min(frameMs / 1000, 0.08);
      last = now;
      const p = latest.current;
      if (
        !previousField ||
        requestedCount !== p.count ||
        (p.form === "plate" &&
          previousField !== p.field &&
          now - lastRebuild > 500)
      )
        rebuild(p);
      if (!p.paused) time += dt * p.speed;
      uniforms.time.value = time;
      uniforms.rotation4.value = p.rotation;
      uniforms.tilt4.value = p.tilt;
      uniforms.dispersion.value = p.dispersion;
      uniforms.turbulence.value = p.turbulence;
      uniforms.lift.value = p.lift;
      uniforms.energy.value = p.energy.current;
      uniforms.pointerStrength.value +=
        ((pointerActive && p.stir ? 1 : 0) - uniforms.pointerStrength.value) *
        Math.min(1, dt * 7);
      const [warm, pearl, cool] = PALETTES[p.palette];
      uniforms.warm.value.set(warm);
      uniforms.pearl.value.set(pearl);
      uniforms.cool.value.set(cool);
      SAND_FORMS.forEach((f, i) => {
        const target = f.id === p.form ? 1 : 0;
        uniforms.weights.value[i] +=
          (target - uniforms.weights.value[i]) *
          (p.paused ? 1 : Math.min(1, dt * 2.3));
      });
      controls.enabled = !p.stir;
      controls.update();
      renderer.render(scene, camera);
      // Lower the particle ceiling after sustained slow frames; never grow it automatically.
      if (samples < 90) {
        samples++;
        frameTotal += frameMs;
      } else if (samples === 90) {
        samples++;
        if (frameTotal / 90 > 60 && previousCount > 20000) {
          effectiveCap = 20000;
          rebuild(p);
        }
      }
    };
    raf = requestAnimationFrame(animate);
    return () => {
      poseRef.current = { position: camera.position.toArray(), time };
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      apiRef.current = null;
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerdown", move);
      renderer.domElement.removeEventListener("pointerleave", leave);
      renderer.domElement.removeEventListener("pointerup", leave);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // One resource lifetime; current state is read through latest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback]);
  return fallback ? (
    <CanvasSand {...props} />
  ) : (
    <div
      className="dimensional-sand"
      ref={elementRef}
      data-renderer="dimensional-webgl"
    />
  );
}

/** Same parametric forms and 4D projection at a lower budget when WebGL is unavailable. */
function CanvasSand(props: Props) {
  const { api: apiRef, poseRef } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null),
    latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  }, [props]);
  useEffect(() => {
    const canvas = canvasRef.current,
      ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    latest.current.onRenderer("Canvas fallback · 2.4k grains");
    const initialPose = poseRef.current;
    const random = seededRandom(79271),
      samples = Array.from(
        { length: 2400 },
        () =>
          [
            random() * Math.PI * 2,
            random() * Math.PI * 2,
            random() - 0.5,
            random(),
          ] as const,
      );
    let yaw = 0.3,
      tilt = 0.42,
      zoom = 1,
      time = poseRef.current.time,
      dragging = false,
      px = 0,
      py = 0,
      pointerX = 0,
      pointerY = 0,
      pointerActive = false;
    const weights = SAND_FORMS.map((f) =>
      f.id === latest.current.form ? 1 : 0,
    );
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        1.25,
        Math.sqrt(1200000 / Math.max(1, rect.width * rect.height)),
      );
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const down = (e: PointerEvent) => {
      dragging = true;
      px = e.clientX;
      py = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) * canvas.width) / rect.width;
      pointerY = ((e.clientY - rect.top) * canvas.height) / rect.height;
      pointerActive = true;
      if (dragging && !latest.current.stir) {
        yaw += (e.clientX - px) * 0.008;
        tilt = Math.max(-1.5, Math.min(1.5, tilt + (e.clientY - py) * 0.008));
      }
      px = e.clientX;
      py = e.clientY;
    };
    const up = () => {
      dragging = false;
      pointerActive = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom = Math.max(0.4, Math.min(2.4, zoom * Math.exp(-e.deltaY * 0.001)));
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", up);
    canvas.addEventListener("wheel", wheel, { passive: false });
    apiRef.current = {
      zoom: (f) => {
        zoom = Math.max(0.4, Math.min(2.4, zoom * f));
      },
      reset: () => {
        yaw = 0.3;
        tilt = 0.42;
        zoom = 1;
      },
      turn: (d) => {
        yaw += d * 0.2;
      },
      top: () => {
        tilt = 1.5;
      },
      capture: () => saveCanvas(canvas),
    };
    let raf = 0,
      last = 0;
    function draw(now: number) {
      raf = requestAnimationFrame(draw);
      if (document.hidden) {
        last = now;
        return;
      }
      if (now - last < 1000 / 24) return;
      const dt = Math.min((now - last) / 1000, 0.08);
      last = now;
      const p = latest.current;
      if (!p.paused) time += dt * p.speed;
      SAND_FORMS.forEach((f, i) => {
        weights[i] +=
          ((f.id === p.form ? 1 : 0) - weights[i]) *
          (p.paused ? 1 : Math.min(1, dt * 2.3));
      });
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const scale = Math.min(canvas!.width, canvas!.height) * 0.23 * zoom;
      const colors = PALETTES[p.palette];
      for (const [u, v, layer, grain] of samples) {
        const point: Vec3 = [0, 0, 0];
        SAND_FORMS.forEach((form, i) => {
          if (weights[i] < 0.001) return;
          const a = formPoint(
            form.id,
            u,
            v,
            layer,
            p.rotation + time * 0.11,
            p.tilt + Math.sin(time * 0.09) * 0.22,
          );
          if (form.id === "plate")
            a[1] = p.field((a[0] / 1.8 + 1) / 2, (a[2] / 1.8 + 1) / 2) * 0.12;
          for (let d = 0; d < 3; d++) point[d] += a[d] * weights[i];
        });
        point[0] +=
          Math.sin(point[1] * 3.2 + time * 0.7 + grain * 6) *
            p.turbulence *
            0.22 +
          layer * p.dispersion;
        point[1] +=
          Math.cos(point[2] * 3.7 - time * 0.5 + grain * 6) *
            p.turbulence *
            0.22 +
          p.lift *
            (0.22 + 0.25 * Math.sin(point[0] * 2 + point[2] * 2 + time * 0.35));
        point[2] +=
          Math.sin(point[0] * 3.6 + time * 0.6 + grain * 6) *
          p.turbulence *
          0.22;
        const x = point[0] * Math.cos(yaw) - point[2] * Math.sin(yaw),
          z = point[0] * Math.sin(yaw) + point[2] * Math.cos(yaw);
        const y = point[1] * Math.cos(tilt) - z * Math.sin(tilt),
          depth = point[1] * Math.sin(tilt) + z * Math.cos(tilt),
          perspective = 5 / Math.max(1.4, 5 + depth);
        let sx = canvas!.width / 2 + x * scale * perspective,
          sy = canvas!.height / 2 - y * scale * perspective;
        if (p.stir && pointerActive) {
          const dx = sx - pointerX,
            dy = sy - pointerY,
            force = Math.exp(-(dx * dx + dy * dy) / (scale * scale * 0.12));
          sx -= dy * force;
          sy += dx * force;
        }
        ctx!.globalAlpha = Math.max(0.12, Math.min(0.9, 0.65 - depth * 0.12));
        ctx!.fillStyle = colors[grain > 0.83 ? 2 : grain > 0.38 ? 1 : 0];
        ctx!.beginPath();
        ctx!.arc(
          sx,
          sy,
          Math.max(0.6, perspective * (0.65 + grain)),
          0,
          Math.PI * 2,
        );
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }
    raf = requestAnimationFrame(draw);
    return () => {
      initialPose.time = time;
      cancelAnimationFrame(raf);
      observer.disconnect();
      apiRef.current = null;
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", up);
      canvas.removeEventListener("wheel", wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="dimensional-sand dimensional-sand-fallback"
      data-renderer="dimensional-canvas"
      role="img"
      aria-label="Interactive dimensional sand, Canvas fallback. Drag to orbit and use the camera controls to zoom."
    />
  );
}

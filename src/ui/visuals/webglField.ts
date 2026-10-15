import * as THREE from "three";
import { fieldVertex, fieldFragment } from "./fieldShaders";
import type { SpatialSettings } from "./spatialState";
export interface FieldRenderer {
  update: (settings: SpatialSettings) => void;
  dispose: () => void;
}
/** Owns its GPU resources; no audio imports, global animation loop or page event capture. */
export function createFieldRenderer(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  initial: SpatialSettings,
  onFailure: () => void,
  ambient = false,
): FieldRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
  camera.position.z = 5.5;
  const geometry = new THREE.PlaneGeometry(1, 1, 128, 72);
  const uniforms = {
    uTime: { value: 0 },
    uRotation: { value: initial.rotation },
    uFourth: { value: (initial.fourth * Math.PI) / 180 },
    uDimension: { value: initial.dimension === "4d" ? 1 : 0 },
    uPointSize: { value: 1.6 },
    uMaterial: { value: 0 },
    uColor: { value: new THREE.Color("#b8cfca") },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: fieldVertex,
    fragmentShader: fieldFragment,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
  const sculpture = new THREE.Mesh(geometry, material);
  const particles = new THREE.Points(geometry, material);
  scene.add(sculpture, particles);
  let settings = initial,
    raf = 0,
    last = 0,
    elapsed = 0,
    visible = true,
    disposed = false,
    contextLost = false;
  const color = () => {
    const raw = getComputedStyle(host).getPropertyValue("--field-color").trim();
    const rgb = raw.split(",").map(Number);
    if (rgb.length === 3 && rgb.every(Number.isFinite))
      uniforms.uColor.value.setRGB(
        rgb[0] / 255,
        rgb[1] / 255,
        rgb[2] / 255,
        THREE.SRGBColorSpace,
      );
  };
  const render = () => {
    if (disposed || contextLost || document.hidden || !visible) return;
    uniforms.uTime.value = elapsed;
    uniforms.uRotation.value = settings.rotation;
    uniforms.uFourth.value = (settings.fourth * Math.PI) / 180;
    uniforms.uDimension.value = settings.dimension === "4d" ? 1 : 0;
    uniforms.uMaterial.value =
      settings.material === "particles"
        ? 2
        : settings.material === "threads"
          ? 1
          : 0;
    sculpture.visible = settings.material !== "particles";
    particles.visible = !sculpture.visible;
    material.depthWrite = settings.material === "silk";
    camera.zoom = settings.zoom;
    camera.updateProjectionMatrix();
    color();
    renderer.render(scene, camera);
  };
  const canAnimate = () =>
    settings.motion && visible && !document.hidden && !disposed && !contextLost;
  const tick = (time: number) => {
    raf = 0;
    if (!canAnimate()) return;
    const interval =
      settings.quality === "light" || ambient ? 1000 / 20 : 1000 / 30;
    if (time - last >= interval) {
      elapsed += Math.min(time - last, 80) / 1000;
      last = time;
      render();
    }
    raf = requestAnimationFrame(tick);
  };
  const schedule = () => {
    if (canAnimate() && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
  const resize = () => {
    const box = host.getBoundingClientRect();
    if (!box.width || !box.height) return;
    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        settings.quality === "light" ? 1 : 1.5,
      ),
    );
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    // Keep the complete default sculpture in narrow portrait viewports.
    camera.position.z = camera.aspect < 1 ? 5.5 / camera.aspect : 5.5;
    camera.updateProjectionMatrix();
    render();
  };
  const observer =
    typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
  observer?.observe(host);
  const intersection =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          visible = entries[0]?.isIntersecting ?? false;
          if (visible) {
            render();
            schedule();
          } else {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        });
  intersection?.observe(host);
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else {
      render();
      schedule();
    }
  };
  const lost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(raf);
    raf = 0;
    onFailure();
  };
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", visibility);
  const themeObserver = new MutationObserver(() => render());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-archive-theme"],
  });
  resize();
  schedule();
  return {
    update(next) {
      const reset = next.resetToken !== settings.resetToken;
      const quality = next.quality !== settings.quality;
      settings = next;
      if (reset) elapsed = 0;
      if (!settings.motion) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (quality) resize();
      render();
      schedule();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      intersection?.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", visibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

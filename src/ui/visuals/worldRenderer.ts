import * as THREE from "three";
import type { SpatialSettings } from "./spatialState";
import {
  compositionForRoute,
  worldBudget,
  type WorldComposition,
} from "./worldGeometry";
import {
  dustFragment,
  dustVertex,
  filamentFragment,
  filamentVertex,
  floorFragment,
  floorVertex,
  haloFragment,
  haloVertex,
  silkFragment,
  silkVertex,
  surfacePointsVertex,
} from "./worldShaders";

export interface WorldController {
  update: (
    settings: SpatialSettings,
    route: string,
    suspended: boolean,
  ) => void;
  dispose: () => void;
}

const TAU = Math.PI * 2;
const PIXEL_LIMIT = 3_000_000;
export function createWorldRenderer(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  initial: SpatialSettings,
  initialRoute: string,
  immersive: boolean,
  onLost: () => void,
): WorldController {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x06090e, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 45);
  const budget = worldBudget(
    host.clientWidth,
    initial.quality,
    window.devicePixelRatio,
  );
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [],
    parameters: number[] = [];
  for (let strand = 0; strand < budget.strands; strand++) {
    const v = (strand / budget.strands) * TAU;
    for (let segment = 0; segment < budget.segments; segment++) {
      for (const step of [segment, segment + 1]) {
        const u = (step / budget.segments) * TAU;
        positions.push(0, 0, 0);
        parameters.push(u, v + 0.12 * Math.sin(u * 3 + strand * 0.025));
      }
    }
  }
  // Longitudinal curves reveal the 4D surface structure as it turns.
  for (let strand = 0; strand < 20; strand++) {
    const u = (strand / 20) * TAU;
    for (let segment = 0; segment < budget.segments; segment++) {
      for (const step of [segment, segment + 1]) {
        positions.push(0, 0, 0);
        parameters.push(u, (step / budget.segments) * TAU);
      }
    }
  }
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute(
    "parameter",
    new THREE.Float32BufferAttribute(parameters, 2),
  );
  // Shader positions are procedural; a conservative bound avoids false culling.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
  const surfaceGeometry = new THREE.PlaneGeometry(1, 1, 72, 40);
  const uv = surfaceGeometry.getAttribute("uv");
  const surfaceParams = new Float32Array(uv.count * 2);
  for (let i = 0; i < uv.count; i++) {
    surfaceParams[i * 2] = uv.getX(i) * TAU;
    surfaceParams[i * 2 + 1] = uv.getY(i) * TAU;
  }
  surfaceGeometry.setAttribute(
    "parameter",
    new THREE.BufferAttribute(surfaceParams, 2),
  );
  surfaceGeometry.boundingSphere = geometry.boundingSphere.clone();
  const pointGeometry = new THREE.BufferGeometry();
  const pointParams = new Float32Array(budget.particles * 2);
  for (let i = 0; i < budget.particles; i++) {
    pointParams[i * 2] = ((i * 0.61803398875) % 1) * TAU;
    pointParams[i * 2 + 1] = ((i * 0.41421356237) % 1) * TAU;
  }
  pointGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(budget.particles * 3), 3),
  );
  pointGeometry.setAttribute(
    "parameter",
    new THREE.BufferAttribute(pointParams, 2),
  );
  pointGeometry.boundingSphere = geometry.boundingSphere.clone();
  const uniforms = {
    uTime: { value: 0 },
    uFourth: { value: (initial.fourth * Math.PI) / 180 },
    uDimension: { value: initial.dimension === "4d" ? 1 : 0 },
    uMotif: { value: 0 },
    uCool: { value: 0.2 },
    uOpacity: { value: 0.48 },
    uDpr: { value: budget.dpr },
  };
  function material(
    vertexShader: string,
    fragmentShader: string,
    opacity: number,
  ) {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { ...uniforms, uOpacity: { value: opacity } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }
  const threadMaterial = material(filamentVertex, filamentFragment, 0.48);
  const glassMaterial = material(silkVertex, silkFragment, 1);
  glassMaterial.blending = THREE.NormalBlending;
  glassMaterial.depthWrite = true;
  glassMaterial.polygonOffset = true;
  glassMaterial.polygonOffsetFactor = 1;
  glassMaterial.polygonOffsetUnits = 1;
  const reflectedGlassMaterial = material(silkVertex, silkFragment, 0.15);
  reflectedGlassMaterial.blending = THREE.NormalBlending;
  const pointMaterial = material(surfacePointsVertex, dustFragment, 0.85);
  const reflectedMaterial = material(filamentVertex, filamentFragment, 0.065);
  const sculpture = new THREE.Group(),
    reflected = new THREE.Group();
  const threads = new THREE.LineSegments(geometry, threadMaterial);
  const silk = new THREE.Mesh(surfaceGeometry, glassMaterial);
  const points = new THREE.Points(pointGeometry, pointMaterial);
  const reflectedSilk = new THREE.Mesh(surfaceGeometry, reflectedGlassMaterial);
  silk.renderOrder = 2;
  threads.renderOrder = 3;
  points.renderOrder = 3;
  sculpture.add(silk, threads, points);
  reflected.add(
    reflectedSilk,
    new THREE.LineSegments(geometry, reflectedMaterial),
  );
  scene.add(sculpture, reflected);
  const floorGeometry = new THREE.PlaneGeometry(40, 40);
  floorGeometry.rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.ShaderMaterial({
    vertexShader: floorVertex,
    fragmentShader: floorFragment,
    uniforms: { uCool: uniforms.uCool },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -2.2;
  scene.add(floor);
  const haloGeometry = new THREE.PlaneGeometry(16, 12);
  const haloMaterial = new THREE.ShaderMaterial({
    vertexShader: haloVertex,
    fragmentShader: haloFragment,
    uniforms: {
      uColor: { value: new THREE.Color(0.2, 0.37, 0.46) },
      uOpacity: { value: 0.18 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  halo.position.set(3, 1, -5);
  scene.add(halo);
  const copperHaloMaterial = haloMaterial.clone();
  copperHaloMaterial.uniforms.uColor.value = new THREE.Color(0.5, 0.18, 0.08);
  copperHaloMaterial.uniforms.uOpacity.value = 0.14;
  const copperHalo = new THREE.Mesh(haloGeometry, copperHaloMaterial);
  copperHalo.position.set(-4, -1, -3);
  scene.add(copperHalo);
  const dustGeometry = new THREE.BufferGeometry();
  const dustCount = budget.particles / 2;
  const dustPositions = new Float32Array(dustCount * 3),
    seeds = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    const a = (i * 0.61803398875) % 1,
      b = (i * 0.75487766625) % 1,
      c = (i * 0.56984029099) % 1;
    dustPositions.set([(a - 0.5) * 22, (b - 0.5) * 9, -c * 15], i * 3);
    seeds[i] = c;
  }
  dustGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dustPositions, 3),
  );
  dustGeometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
  const dustMaterial = material(dustVertex, dustFragment, 0.42);
  scene.add(new THREE.Points(dustGeometry, dustMaterial));
  let settings = initial,
    route = initialRoute,
    suspended = false,
    disposed = false,
    frame = 0,
    last = 0,
    time = 0;
  let width = 1,
    height = 1,
    pointerX = 0,
    pointerY = 0,
    smoothX = 0,
    smoothY = 0;
  const composition = compositionForRoute(route);
  let target = { ...composition };
  let dirty = true;
  function resize() {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    const requested = worldBudget(
      width,
      settings.quality,
      window.devicePixelRatio,
    ).dpr;
    const dpr = Math.min(requested, Math.sqrt(PIXEL_LIMIT / (width * height)));
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    uniforms.uDpr.value = dpr;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    dirty = true;
    wake();
  }
  function targetComposition(): WorldComposition {
    const value = compositionForRoute(route);
    if (immersive)
      return { ...value, x: 0, y: 0.25, scale: width < 700 ? 1.1 : 1.65 };
    if (width < 700) return { ...value, x: 0.7, y: 0.9, scale: 1.15 };
    return value;
  }
  function draw(now: number) {
    frame = 0;
    if (disposed || document.hidden) return;
    const moving = settings.motion && !suspended;
    if (moving && now - last < 1000 / budget.fps) {
      frame = requestAnimationFrame(draw);
      return;
    }
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (moving) time += dt;
    target = targetComposition();
    const rate = moving ? 0.055 : 1;
    for (const key of Object.keys(composition) as Array<keyof WorldComposition>)
      composition[key] += (target[key] - composition[key]) * rate;
    smoothX += ((moving ? pointerX : 0) - smoothX) * 0.04;
    smoothY += ((moving ? pointerY : 0) - smoothY) * 0.04;
    uniforms.uTime.value = time;
    uniforms.uFourth.value = (settings.fourth * Math.PI) / 180 + time * 0.045;
    uniforms.uDimension.value = settings.dimension === "4d" ? 1 : 0;
    uniforms.uMotif.value = composition.motif;
    uniforms.uCool.value = composition.cool;
    const rotation = settings.rotation + composition.turn + time * 0.025;
    const scale = composition.scale * settings.zoom;
    sculpture.position.set(
      composition.x,
      composition.y + Math.sin(time * 0.18) * 0.06,
      0,
    );
    sculpture.rotation.set(composition.tilt, rotation, -0.18);
    sculpture.scale.setScalar(scale);
    reflected.position.set(
      sculpture.position.x,
      -4.4 - sculpture.position.y,
      0,
    );
    reflected.rotation.set(-composition.tilt, rotation, 0.18);
    reflected.scale.set(scale, -scale, scale);
    threads.visible = settings.material !== "particles";
    silk.visible = settings.material === "silk";
    reflectedSilk.visible = silk.visible;
    points.visible = true;
    threadMaterial.uniforms.uOpacity.value =
      settings.material === "threads" ? 0.62 : 0.24;
    pointMaterial.uniforms.uOpacity.value =
      settings.material === "particles" ? 1 : 0.62;
    reflected.visible = settings.material !== "particles";
    camera.position.set(
      smoothX * 0.13,
      1.25 + smoothY * 0.1,
      width < 700 ? 8.7 : 8.4,
    );
    camera.lookAt(0, width < 700 ? 0.3 : 0.15, 0);
    renderer.render(scene, camera);
    dirty = false;
    if (moving) frame = requestAnimationFrame(draw);
  }
  function wake() {
    if (
      !frame &&
      !disposed &&
      !document.hidden &&
      (dirty || (settings.motion && !suspended))
    )
      frame = requestAnimationFrame(draw);
  }
  function pointer(event: PointerEvent) {
    if (!settings.motion || suspended) return;
    pointerX = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    pointerY = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      last = performance.now();
      dirty = true;
      wake();
    }
  }
  function lost(event: Event) {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    onLost();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  window.addEventListener("pointermove", pointer, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", lost);
  resize();
  return {
    update(next, nextRoute, nextSuspended) {
      const wasSuspended = suspended;
      if (next.resetToken !== settings.resetToken) {
        time = 0;
        pointerX = 0;
        pointerY = 0;
        smoothX = 0;
        smoothY = 0;
      }
      settings = next;
      route = nextRoute;
      suspended = nextSuspended;
      if (suspended && !wasSuspended) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      dirty = true;
      wake();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", pointer);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", lost);
      for (const item of [
        geometry,
        surfaceGeometry,
        pointGeometry,
        floorGeometry,
        haloGeometry,
        dustGeometry,
      ])
        item.dispose();
      for (const item of [
        threadMaterial,
        glassMaterial,
        reflectedGlassMaterial,
        pointMaterial,
        reflectedMaterial,
        floorMaterial,
        haloMaterial,
        copperHaloMaterial,
        dustMaterial,
      ])
        item.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

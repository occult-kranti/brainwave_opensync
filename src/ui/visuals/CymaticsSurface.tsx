import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export type SurfaceStyle = "surface" | "particles" | "water";
export interface SurfaceCamera {
  zoom: (factor: number) => void;
  reset: () => void;
  top: () => void;
  turn: (direction: number) => void;
  capture: () => void;
}
interface Props {
  field: (x: number, y: number) => number;
  circular: boolean;
  style: SurfaceStyle;
  density: number;
  amplitude: number;
  speed: number;
  paused: boolean;
  api: RefObject<SurfaceCamera | null>;
  poseRef: RefObject<{ position: number[]; time: number }>;
  onUnavailable: () => void;
}
/** A renderer for the existing analytic plate model, not a material solver. */
export function CymaticsSurface(props: Props) {
  const { api: apiRef, poseRef } = props;
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  }, [props]);
  useEffect(() => {
    if (!host.current) return;
    const element = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
      });
    } catch {
      latest.current.onUnavailable();
      return;
    }
    renderer.setClearColor("#0b1016");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive three-dimensional cymatics surface. Drag to orbit, pinch or scroll to zoom.",
    );
    renderer.domElement.setAttribute("role", "img");
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
    camera.position.fromArray(poseRef.current.position);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 1.2;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI * 0.88;
    const uniforms = {
      time: { value: 0 },
      amplitude: { value: 0.25 },
      circular: { value: 0 },
      mode: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      vertexShader: `attribute float fieldValue; varying float f; varying vec2 uv0; varying float elevation; uniform float time; uniform float amplitude; uniform float mode;
      void main(){uv0=uv;f=fieldValue;vec3 p=position;float wave=sin(time*2.1);p.y=f*amplitude*wave; if(mode>1.5) p.y+=.025*sin(p.x*18.+time)*cos(p.z*14.-time);elevation=p.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader: `varying float f;varying vec2 uv0;varying float elevation;uniform float circular;uniform float mode;
      void main(){if(circular>.5&&length(uv0-.5)>.5)discard;float nodes=exp(-abs(f)*22.);vec3 base=mix(vec3(.027,.08,.12),vec3(.2,.39,.49),smoothstep(-.4,.4,elevation));vec3 color=mix(base,vec3(.95,.69,.39),nodes*.9);float gx=abs(fract(uv0.x*70.)-.5),gy=abs(fract(uv0.y*70.)-.5);float grid=1.-smoothstep(.015,.045,min(gx,gy));color+=vec3(.17,.28,.32)*grid*.38;if(mode>1.5)color=mix(color,vec3(.38,.69,.79),smoothstep(.05,.32,elevation)*.6);gl_FragColor=vec4(color,1.);}`,
    });
    const pointMat = new THREE.PointsMaterial({
      size: 0.018,
      color: "#f0c394",
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    let mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null =
      null;
    let points: THREE.Points<
      THREE.BufferGeometry,
      THREE.PointsMaterial
    > | null = null;
    let oldField: Props["field"] | undefined,
      oldDensity = 0,
      oldCircular = false;
    const grid = new THREE.GridHelper(8, 28, "#304452", "#19232d");
    grid.position.y = -0.43;
    scene.add(grid);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.62, 1.625, 128),
      new THREE.MeshBasicMaterial({ color: "#4b6374", side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.41;
    scene.add(ring);
    function rebuild(p: Props) {
      if (mesh) {
        scene.remove(mesh);
        mesh.geometry.dispose();
      }
      if (points) {
        scene.remove(points);
        points.geometry.dispose();
      }
      const geometry = new THREE.PlaneGeometry(2.6, 2.6, 112, 112);
      geometry.rotateX(-Math.PI / 2);
      const pos = geometry.attributes.position;
      const values = new Float32Array(pos.count);
      for (let i = 0; i < pos.count; i++)
        values[i] = Math.max(
          -2,
          Math.min(
            2,
            p.field((pos.getX(i) / 1.3 + 1) / 2, (pos.getZ(i) / 1.3 + 1) / 2),
          ),
        );
      geometry.setAttribute("fieldValue", new THREE.BufferAttribute(values, 1));
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      // Bounded rejection sampling visualises the zero set. It is not a grain dynamics simulation.
      const coords: number[] = [];
      let seed = 1337;
      const rand = () => {
        seed = (1664525 * seed + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const target = Math.min(p.density, 20000);
      for (let i = 0; i < target * 25 && coords.length < target * 3; i++) {
        const x = rand() * 2 - 1,
          z = rand() * 2 - 1;
        if (p.circular && x * x + z * z > 1) continue;
        const f = Math.abs(p.field((x + 1) / 2, (z + 1) / 2));
        if (f < 0.055 + rand() * 0.04)
          coords.push(x * 1.3, 0.018 + (rand() - 0.5) * 0.012, z * 1.3);
      }
      const pointGeo = new THREE.BufferGeometry();
      pointGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(coords, 3),
      );
      points = new THREE.Points(pointGeo, pointMat);
      scene.add(points);
      oldField = p.field;
      oldDensity = p.density;
      oldCircular = p.circular;
    }
    const resize = () => {
      const w = element.clientWidth,
        h = element.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const reset = () => {
      camera.position.set(0, 3.5, 4.4);
      controls.target.set(0, 0, 0);
      controls.update();
    };
    apiRef.current = {
      zoom: (factor) => {
        const dir = camera.position.clone().sub(controls.target);
        dir.setLength(THREE.MathUtils.clamp(dir.length() / factor, 1.2, 10));
        camera.position.copy(controls.target).add(dir);
        controls.update();
      },
      reset,
      top: () => {
        camera.position.set(0, 5.5, 0.001);
        controls.target.set(0, 0, 0);
        controls.update();
      },
      turn: (d) => {
        const v = camera.position.clone().sub(controls.target);
        v.applyAxisAngle(new THREE.Vector3(0, 1, 0), d * 0.2);
        camera.position.copy(controls.target).add(v);
        controls.update();
      },
      capture: () => {
        renderer.render(scene, camera);
        renderer.domElement.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "opensync-cymatics.png";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        });
      },
    };
    const lost = (e: Event) => {
      e.preventDefault();
      latest.current.onUnavailable();
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    let frame = 0,
      last = 0,
      time = poseRef.current.time;
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      if (now - last < 33 || document.hidden) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const p = latest.current;
      if (
        oldField !== p.field ||
        oldDensity !== p.density ||
        oldCircular !== p.circular
      )
        rebuild(p);
      if (!p.paused) time += dt * p.speed;
      uniforms.time.value = time;
      uniforms.amplitude.value = p.amplitude;
      uniforms.circular.value = p.circular ? 1 : 0;
      uniforms.mode.value = p.style === "water" ? 2 : 0;
      if (mesh) mesh.visible = p.style !== "particles";
      if (points) points.visible = p.style !== "water";
      controls.update();
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      poseRef.current = { position: camera.position.toArray(), time };
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      apiRef.current = null;
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      mesh?.geometry.dispose();
      points?.geometry.dispose();
      material.dispose();
      pointMat.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      ring.geometry.dispose();
      ring.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Renderer owns resources once; live props are read through the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={host} className="cymatics-gpu" data-renderer="webgl" />;
}

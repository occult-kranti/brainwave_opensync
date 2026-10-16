import type { SpatialSettings } from "./spatialState";
import {
  compositionForRoute,
  worldBudget,
  worldPoint,
  type WorldPoint,
} from "./worldGeometry";
import type { WorldController } from "./worldRenderer";

/** Perspective fallback uses the same geometry, rotations and controller as WebGL. */
export function createCanvasWorld(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  initial: SpatialSettings,
  initialRoute: string,
  immersive: boolean,
): WorldController | null {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return null;
  let settings = initial,
    route = initialRoute,
    suspended = false;
  let width = 1,
    height = 1,
    dpr = 1,
    time = 0,
    last = 0,
    frame = 0,
    disposed = false;
  function project(p: WorldPoint) {
    const dy = p.y - 1.25,
      dz = p.z - 8.4;
    const y = dy * 0.9915 - dz * 0.1305;
    const depth = Math.max(0.5, -dy * 0.1305 - dz * 0.9915);
    const f = (height * 1.27) / depth;
    return { x: width * 0.5 + p.x * f, y: height * 0.5 - y * f, depth };
  }
  function resize() {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    dpr = Math.min(
      worldBudget(width, settings.quality, window.devicePixelRatio).dpr,
      Math.sqrt(3_000_000 / (width * height)),
    );
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    wake();
  }
  function render(now: number) {
    frame = 0;
    if (disposed || document.hidden || !ctx) return;
    const moving = settings.motion && !suspended;
    if (moving && now - last < 1000 / 20) {
      frame = requestAnimationFrame(render);
      return;
    }
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (moving) time += dt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#06090e";
    ctx.fillRect(0, 0, width, height);
    const composition = compositionForRoute(route);
    if (immersive) {
      composition.x = 0;
      composition.scale = width < 700 ? 1.1 : 1.65;
    } else if (width < 700) {
      composition.x = 0.7;
      composition.y = 0.9;
      composition.scale = 1.15;
    }
    const origin = project({ x: composition.x, y: composition.y, z: 0 });
    const glow = ctx.createRadialGradient(
      origin.x,
      origin.y,
      0,
      origin.x,
      origin.y,
      height * 0.75,
    );
    glow.addColorStop(0, "rgba(35,63,75,.22)");
    glow.addColorStop(0.6, "rgba(15,29,40,.15)");
    glow.addColorStop(1, "rgba(6,9,14,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    // A projected grid and a mirrored sculpture establish a shared floor plane.
    ctx.lineWidth = 0.65;
    for (let i = -14; i <= 14; i++) {
      const a = project({ x: i, y: -2.2, z: -14 }),
        b = project({ x: i, y: -2.2, z: 4 });
      ctx.strokeStyle = `rgba(119,146,151,${0.065 * (1 - Math.abs(i) / 20)})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      if (i <= 4) {
        const c = project({ x: -16, y: -2.2, z: i }),
          d = project({ x: 16, y: -2.2, z: i });
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
    }
    const rotation = settings.rotation + composition.turn + time * 0.025;
    const cx = Math.cos(composition.tilt),
      sx = Math.sin(composition.tilt),
      cy = Math.cos(rotation),
      sy = Math.sin(rotation);
    function transform(u: number, v: number, reflected: boolean) {
      const p = worldPoint(
        u,
        v,
        (settings.fourth * Math.PI) / 180 + time * 0.045,
        settings.dimension,
        composition.motif,
      );
      const y = p.y * cx - p.z * sx,
        z = p.y * sx + p.z * cx;
      const xx = p.x * cy + z * sy,
        zz = -p.x * sy + z * cy;
      const scale = composition.scale * settings.zoom;
      const worldY = y * scale + composition.y + Math.sin(time * 0.18) * 0.06;
      return project({
        x: xx * scale + composition.x,
        y: reflected ? -4.4 - worldY : worldY,
        z: zz * scale,
      });
    }
    const strands = width < 700 || settings.quality === "light" ? 30 : 54;
    const segments = width < 700 ? 72 : 112;
    const lines: {
      points: ReturnType<typeof project>[];
      depth: number;
      strand: number;
      reflected: boolean;
    }[] = [];
    for (const reflected of [true, false]) {
      for (let strand = 0; strand < strands; strand++) {
        const v = (strand / strands) * Math.PI * 2;
        const points = [];
        for (let j = 0; j <= segments; j++) {
          const u = (j / segments) * Math.PI * 2;
          points.push(
            transform(
              u,
              v + 0.12 * Math.sin(u * 3 + strand * 0.025),
              reflected,
            ),
          );
        }
        lines.push({
          points,
          depth: points.reduce((sum, p) => sum + p.depth, 0) / points.length,
          strand,
          reflected,
        });
      }
    }
    lines.sort((a, b) => b.depth - a.depth);
    for (const line of lines) {
      const cool =
        Math.sin((line.strand / strands) * Math.PI * 4) * 0.5 + 0.5 >
        0.55 - composition.cool * 0.2;
      const opacity =
        (line.reflected ? 0.055 : settings.material === "silk" ? 0.48 : 0.65) *
        Math.min(1, 8 / line.depth);
      ctx.strokeStyle = cool
        ? `rgba(137,204,220,${opacity})`
        : `rgba(235,153,101,${opacity})`;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = line.reflected ? 0.6 : 0.8;
      if (settings.material === "particles") {
        if (line.reflected) continue;
        for (let i = line.strand % 3; i < line.points.length; i += 3) {
          const p = line.points[i];
          ctx.fillRect(p.x, p.y, 1.2, 1.2);
        }
      } else {
        ctx.beginPath();
        line.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    }
    for (let i = 0; i < 180; i++) {
      const x = (((i * 0.61803398875) % 1) - 0.5) * 22;
      const y =
        (((i * 0.75487766625) % 1) - 0.5) * 9 +
        Math.sin(time * 0.06 + i) * 0.12;
      const p = project({ x, y, z: -((i * 0.56984029099) % 1) * 15 });
      ctx.fillStyle =
        i % 3 === 0 ? "rgba(210,150,104,.25)" : "rgba(149,192,204,.22)";
      ctx.fillRect(p.x, p.y, 1, 1);
    }
    if (moving) frame = requestAnimationFrame(render);
  }
  function wake() {
    if (!disposed && !document.hidden && !frame)
      frame = requestAnimationFrame(render);
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      last = performance.now();
      wake();
    }
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  document.addEventListener("visibilitychange", visibility);
  resize();
  return {
    update(next, nextRoute, nextSuspended) {
      if (next.resetToken !== settings.resetToken) time = 0;
      settings = next;
      route = nextRoute;
      suspended = nextSuspended;
      wake();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}

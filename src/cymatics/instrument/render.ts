import { circularPlateValue, drivenCircularField, drivenCircularModes, drivenSquareField, drivenSquareModes, squarePlateValue, type VirtualPlate } from '../chladni';
import type { Look, Scene, Waveform } from './scenes';
import type { Signal } from './signal';

const TAU = Math.PI * 2;
const SIZE = 960;
const CENTER = SIZE / 2;
const RADIUS = 418;
const TEXTURE_COUNT = 39000;
const TEXTURE = new Float32Array(TEXTURE_COUNT * 3);
let randomState = 321701;
function random() {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  return randomState / 4294967296;
}

for (let index = 0; index < TEXTURE.length; index++) TEXTURE[index] = random();

export function grainField(plate: VirtualPlate, hz: number) {
  if (plate.shape === 'circular') {
    const modes = drivenCircularModes(hz, plate);
    return modes.length ? drivenCircularField(modes, plate.boundary) :
      (x: number, y: number) => circularPlateValue(2 * Math.hypot(x - 0.5, y - 0.5), Math.atan2(y - 0.5, x - 0.5), 4, 2, plate.boundary);
  }
  const modes = drivenSquareModes(hz, plate).filter(({ n, m }) => n > 0 && m > 0);
  return modes.length ? drivenSquareField(modes) : (x: number, y: number) => squarePlateValue(x, y, 2, 5);
}

function vessel(ctx: CanvasRenderingContext2D, round: boolean, r: number) {
  ctx.beginPath();
  if (round) ctx.arc(CENTER, CENTER, r, 0, TAU);
  else ctx.roundRect(CENTER - r, CENTER - r, r * 2, r * 2, 23);
}

function drawRim(ctx: CanvasRenderingContext2D, look: Look, scene: Scene) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  const round = look.shape === 'round' || look.view === 'scope';
  const metal = ctx.createLinearGradient(120, 60, 850, 850);
  metal.addColorStop(0, '#d7be91');
  metal.addColorStop(0.24, '#3d3228');
  metal.addColorStop(0.53, '#c2a077');
  metal.addColorStop(0.76, '#41372a');
  metal.addColorStop(1, '#8a765e');
  vessel(ctx, round, RADIUS + 14);
  ctx.fillStyle = metal;
  ctx.fill();
  vessel(ctx, round, RADIUS + 9);
  ctx.fillStyle = '#0c0b0b';
  ctx.fill();
  vessel(ctx, round, RADIUS + 5);
  ctx.strokeStyle = '#bba48180';
  ctx.lineWidth = 2;
  ctx.stroke();
  vessel(ctx, round, RADIUS);
  ctx.clip();
  const shade = ctx.createRadialGradient(395, 330, 25, CENTER, CENTER, 580);
  shade.addColorStop(0, scene.colors[2]);
  shade.addColorStop(1, '#08080b');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function paintGrains(ctx: CanvasRenderingContext2D, look: Look, scene: Scene, plate: VirtualPlate, hz: number) {
  const field = grainField(plate, hz);
  const sample = new Float32Array(75 * 75);
  let max = 0;
  for (let y = 0; y < 75; y++) {
    for (let x = 0; x < 75; x++) {
      const value = field(x / 74, y / 74);
      sample[y * 75 + x] = value;
      max = Math.max(max, Math.abs(value));
    }
  }
  const color = look.effect === 'mono' ? '#fff5e5' : scene.colors[0];
  const ink = look.view === 'ink';
  const print = look.effect === 'halftone';
  const amount = print ? 98 * 98 : Math.round(15000 + look.detail * 235);
  ctx.fillStyle = color;
  for (let index = 0; index < amount; index++) {
    const x = print ? (index % 98 + 0.5) / 98 : TEXTURE[index * 3];
    const y = print ? (Math.floor(index / 98) + 0.5) / 98 : TEXTURE[index * 3 + 1];
    const grain = TEXTURE[index * 3 + 2];
    if (look.shape === 'round' && (x - 0.5) ** 2 + (y - 0.5) ** 2 > 0.246) continue;
    const u = (look.effect === 'mirror' ? Math.abs(x - 0.5) + 0.5 : x) * 74;
    const v = y * 74;
    const ix = Math.min(73, Math.floor(u));
    const iy = Math.min(73, Math.floor(v));
    const row = iy * 75 + ix;
    const t = u - ix;
    const top = sample[row] * (1 - t) + sample[row + 1] * t;
    const bottom = sample[row + 75] * (1 - t) + sample[row + 76] * t;
    const delta = v - iy;
    const amplitude = Math.abs(top * (1 - delta) + bottom * delta) / Math.max(max, 1e-8);
    const threshold = (ink ? 0.014 : 0.031) + look.depth * (ink ? 0.00048 : 0.00098);
    const nodal = Math.exp(-Math.pow(amplitude / threshold, 1.35));
    if (!print && grain > nodal * 0.93 + (ink ? 0.01 : 0.065)) continue;
    const alpha = (0.10 + nodal * 0.71) * (0.45 + look.light / 115);
    ctx.globalAlpha = Math.min(1, alpha);
    const size = print ? 1 + nodal * 4.1 : (ink ? 1.3 : 0.65) + grain * (1.2 + nodal * 0.9);
    ctx.fillRect(CENTER - RADIUS + x * 2 * RADIUS, CENTER - RADIUS + y * 2 * RADIUS, size, size);
  }
  ctx.globalAlpha = 1;
}

function paintWater(ctx: CanvasRenderingContext2D, look: Look, scene: Scene, time: number, hz: number, level: number) {
  const pigment = look.effect === 'mono' ? '#fffaea' : scene.colors[1];
  ctx.lineWidth = 1.4 + look.depth * 0.023;
  ctx.strokeStyle = pigment;
  ctx.shadowColor = pigment;
  ctx.shadowBlur = look.light * 0.23;
  const frequency = 2 + Math.log2(Math.max(20, hz) / 20);
  const layers = 21 + Math.round(look.detail * 0.42);
  const bend = 11 + look.depth * 0.27 + level * look.response * 0.36;
  const count = 138;
  for (let band = 0; band < layers; band++) {
    const radius = 19 + band * 399 / layers;
    ctx.globalAlpha = (0.18 + (band % 3) * 0.12) * (0.5 + look.light / 100);
    ctx.beginPath();
    for (let j = 0; j <= count; j++) {
      const angle = TAU * j / count;
      const theta = look.effect === 'mirror' ? Math.abs(Math.sin(angle)) * Math.PI : angle;
      const harmonics = Math.round(frequency);
      const wave = Math.cos(theta * harmonics + Math.sin(time) * 0.8) *
        Math.sin(radius * 0.033 - time * (0.4 + look.response * 0.017));
      const ripple = Math.cos(theta * (harmonics + 3) - time * 0.65 + radius * 0.026);
      const r = radius + (wave + 0.48 * ripple) * bend * Math.min(1, radius / 100);
      const x = CENTER + r * Math.cos(angle);
      const y = CENTER + r * Math.sin(angle);
      if (!j || (look.effect === 'halftone' && j % 3 === 0)) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function wave(kind: Waveform, angle: number) {
  const cycle = ((angle / TAU) % 1 + 1) % 1;
  if (kind === 'triangle') return 1 - 4 * Math.abs(cycle - 0.5);
  if (kind === 'square') return cycle < 0.5 ? 1 : -1;
  if (kind === 'sawtooth') return cycle * 2 - 1;
  return Math.sin(angle);
}

function paintScope(ctx: CanvasRenderingContext2D, look: Look, scene: Scene, time: number, signal: Signal | null) {
  const color = look.effect === 'mono' ? '#fff9ec' : scene.colors[0];
  ctx.strokeStyle = '#ffffff25';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(75, CENTER);
  ctx.lineTo(885, CENTER);
  ctx.moveTo(CENTER, 75);
  ctx.lineTo(CENTER, 885);
  ctx.stroke();
  const ratio = look.hz >= 500 ? 5 / 3 : 3 / 2;
  const phase = look.phase * Math.PI / 180;
  const count = signal ? Math.min(signal.left.length, signal.right.length) : 600;
  let peak = 0;
  if (signal) {
    for (let i = 0; i < count; i++) peak = Math.max(peak, Math.abs(signal.left[i]), Math.abs(signal.right[i]));
  }
  const offset = signal?.hz ? Math.round(phase * signal.sampleRate / (TAU * signal.hz)) : 0;
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const angle = TAU * 2 * i / (count - 1);
    const left = signal ? signal.left[i] : wave(look.wave, angle);
    const right = signal ? signal.right[(i + offset) % count] : wave(look.wave, angle * ratio + phase + time * 0.24);
    const a = look.stereo === 'ms' ? (left - right) / 2 : left;
    const b = look.stereo === 'ms' ? (left + right) / 2 : right;
    const scale = (235 + look.depth * 0.75) / (signal ? Math.max(0.025, peak) : 1);
    const x = CENTER + (look.effect === 'mirror' ? Math.abs(a) : a) * scale;
    const y = CENTER - b * scale;
    if (!i || (look.effect === 'halftone' && i % 6 === 0)) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4 + look.detail * 0.031;
  ctx.shadowColor = color;
  ctx.shadowBlur = 7 + look.light * 0.32;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

export function createRenderer(canvas: HTMLCanvasElement) {
  const frame = document.createElement('canvas');
  frame.width = frame.height = SIZE;
  const frameContext = frame.getContext('2d')!;
  const ctx = canvas.getContext('2d')!;
  let cachedKey = '';
  return (look: Look, scene: Scene, plate: VirtualPlate, time: number, signal: Signal | null) => {
    const hz = signal?.hz ? Math.round(signal.hz / 12) * 12 : look.hz;
    const level = signal?.level ?? 0;
    const key = JSON.stringify([look, hz, plate.id]);
    if (cachedKey === key && (look.view === 'sand' || look.view === 'ink') && !look.mix) return;
    if (cachedKey !== key) {
      frameContext.save();
      drawRim(frameContext, look, scene);
      if (look.view === 'sand' || look.view === 'ink') paintGrains(frameContext, look, scene, plate, hz);
      frameContext.restore();
      cachedKey = key;
    }
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(frame, 0, 0);
    ctx.save();
    vessel(ctx, look.shape === 'round' || look.view === 'scope', RADIUS);
    ctx.clip();
    if (look.view === 'scope') paintScope(ctx, look, scene, time, signal);
    if (look.view === 'water') paintWater(ctx, look, scene, time, hz, level);
    if (look.mix > 0) {
      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(Math.PI / 10 + level * 0.19);
      ctx.scale(0.76, 0.76);
      ctx.translate(-CENTER, -CENTER);
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = scene.colors[0];
      ctx.lineWidth = 1.15;
      const bands = signal?.bands ?? [0.13, 0.24, 0.20];
      for (let ring = 0; ring < 11; ring++) {
        ctx.globalAlpha = (look.mix / 100) * (0.24 + bands[ring % 3] * 0.69);
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const angle = TAU * i / 120;
          const radius = 32 + ring * 31 + 19 * Math.cos(angle * 7 + time * 0.65 + ring * 0.25);
          const x = CENTER + Math.cos(angle) * radius;
          const y = CENTER + Math.sin(angle) * radius;
          if (!i) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  };
}

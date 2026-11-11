export const SCENES = [
  { id: 'atelier', name: 'Plate Atelier', number: '01', motif: 'sand', source: 'Figura', note: 'Ivory, brass and standing waves', colors: ['#e8d5a4', '#ac6c39', '#151319'] },
  { id: 'violet', name: 'Violet Field', number: '02', motif: 'ink', source: 'Cymatics.app', note: 'An ultraviolet field of nodal ink', colors: ['#efdcff', '#a777fb', '#100b20'] },
  { id: 'liquid', name: 'Liquid Glass', number: '03', motif: 'water', source: 'SYQEL', note: 'Refracted light over moving water', colors: ['#d1fff2', '#38a9ad', '#071e24'] },
  { id: 'signal', name: 'Signal Trace', number: '04', motif: 'scope', source: 'Photism', note: 'A luminous stereo trace', colors: ['#ffdfd9', '#f28b80', '#251018'] },
  { id: 'stage', name: 'Prism Stage', number: '05', motif: 'water', source: 'Synesthesia / Resolume', note: 'Layered visuals with reactive color', colors: ['#dcffc7', '#b3da67', '#151c0f'] },
] as const;

export type Scene = typeof SCENES[number];
export type View = Scene['motif'];
export type Shape = 'round' | 'square';
export type Waveform = 'sine' | 'triangle' | 'square' | 'sawtooth';
export type Effect = 'natural' | 'mono' | 'mirror' | 'halftone';
export type Input = 'tone' | 'studio' | 'mic' | 'file' | 'tab' | 'system';

export interface Look {
  scene: Scene['id'];
  view: View;
  hz: number;
  shape: Shape;
  plate: string;
  wave: Waveform;
  effect: Effect;
  detail: number;
  response: number;
  depth: number;
  light: number;
  mix: number;
  phase: number;
  stereo: 'xy' | 'ms';
}

export const DEFAULT_LOOK: Look = {
  scene: 'atelier', view: 'sand', hz: 432, shape: 'round', plate: '',
  wave: 'sine', effect: 'natural', detail: 60, response: 54, depth: 46,
  light: 65, mix: 0, phase: 90, stereo: 'xy',
};

export function sceneLook(scene: Scene): Look {
  return {
    ...DEFAULT_LOOK, scene: scene.id, view: scene.motif,
    hz: scene.id === 'liquid' ? 174 : 432,
    light: scene.id === 'violet' ? 78 : 65,
    mix: scene.id === 'stage' ? 42 : 0,
  };
}

export const QUICK_HZ = [174, 285, 396, 432, 440, 528, 639, 741, 852, 963];

export function bounded(value: number, min: number, max: number, fallback: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function pick<T extends string>(value: unknown, choices: readonly T[], fallback: T): T {
  return choices.find((choice) => choice === value) ?? fallback;
}

export function parseLook(value: unknown): Look {
  const data = value && typeof value === 'object' ? value as Partial<Look> : {};
  const scene = SCENES.find((item) => item.id === data.scene) ?? SCENES[0];
  const defaults = sceneLook(scene);
  const percent = (key: 'detail' | 'response' | 'depth' | 'light' | 'mix') =>
    bounded(data[key] ?? NaN, 0, 100, defaults[key]);
  return {
    scene: scene.id, view: pick(data.view, ['sand', 'ink', 'water', 'scope'], defaults.view),
    hz: bounded(data.hz ?? NaN, 20, 1200, defaults.hz), shape: pick(data.shape, ['round', 'square'], defaults.shape),
    plate: typeof data.plate === 'string' ? data.plate.slice(0, 64) : '',
    wave: pick(data.wave, ['sine', 'triangle', 'square', 'sawtooth'], defaults.wave),
    effect: pick(data.effect, ['natural', 'mono', 'mirror', 'halftone'], defaults.effect),
    detail: percent('detail'), response: percent('response'), depth: percent('depth'),
    light: percent('light'), mix: percent('mix'),
    phase: bounded(data.phase ?? NaN, 0, 180, defaults.phase),
    stereo: pick(data.stereo, ['xy', 'ms'], defaults.stereo),
  };
}

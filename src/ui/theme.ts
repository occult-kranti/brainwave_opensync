/**
 * Open Sync UI — design-token constants ("Ink & Amber", design.md §2).
 * Canvas/SVG renderers cannot read CSS classes, so the exact hex values
 * live here as well as in index.css.
 */

export const INK = {
  0: '#111c18',
  1: '#15211c',
  2: '#1a2922',
  3: '#23352b',
  4: '#2b4034',
} as const;

export const LINE = { 1: '#304439', 2: '#42594a' } as const;

export const TEXT = {
  1: '#f0ebdf',
  2: '#b9c3b6',
  3: '#96a492',
  inv: '#141414',
} as const;

export const AMBER = '#e3cba3';
export const AMBER_HI = '#f0ddbd';
export const AMBER_DIM = '#89765a';
export const TEAL = '#91b29b';
export const TEAL_HI = '#b2ccb5';
export const TEAL_DIM = '#45664f';
export const DANGER = '#C4634F';
export const DANGER_HI = '#D97B66';

export type GradeLetter = 'A' | 'B' | 'C' | 'D';

export const GRADE_COLOR: Record<GradeLetter, string> = {
  A: '#5FA98C',
  B: '#A9B368',
  C: '#e3cba3',
  D: '#C4634F',
};

export const GRADE_WORD: Record<GradeLetter, string> = {
  A: 'SOLID',
  B: 'HUMAN',
  C: 'PLAUS.',
  D: 'FOLKL.',
};

export const GRADE_MEANING: Record<GradeLetter, string> = {
  A: 'Solid physics / multiple peer-reviewed replications',
  B: 'Some human evidence (small pilots)',
  C: 'Plausible mechanism, weak or indirect evidence',
  D: 'Folklore / numerology — no physiological evidence',
};

/** Brainwave band color-coding (design.md §7). */
export const BAND_COLOR = {
  delta: '#8A8A84',
  theta: '#9488A8',
  alpha: '#5FA98C',
  beta: '#e3cba3',
  gamma: '#C4634F',
} as const;

export type BandName = keyof typeof BAND_COLOR;

export const BANDS: readonly { name: BandName; label: string; min: number; max: number }[] = [
  { name: 'delta', label: 'DELTA', min: 0.5, max: 4 },
  { name: 'theta', label: 'THETA', min: 4, max: 8 },
  { name: 'alpha', label: 'ALPHA', min: 8, max: 13 },
  { name: 'beta', label: 'BETA', min: 13, max: 30 },
  { name: 'gamma', label: 'GAMMA', min: 30, max: 40 },
];

/** Beat Hz → band; null when outside the 0.5–40 Hz display range. */
export function bandForBeat(beatHz: number): BandName | null {
  for (const b of BANDS) if (beatHz >= b.min && beatHz < b.max) return b.name;
  if (beatHz >= 40) return 'gamma';
  if (beatHz > 0 && beatHz < 0.5) return 'delta';
  return null;
}

export const NOISE_COLOR: Record<string, string> = {
  white: '#C9C4B8',
  pink: '#C48F8F',
  brown: '#A87E5B',
  blue: '#7C96A8',
  violet: '#9488A8',
  grey: '#8A8A84',
};

export const NOISE_SLOPE: Record<string, string> = {
  white: 'White: flat spectrum, equal energy per Hz',
  pink: 'Pink: −3 dB/oct, equal energy per octave',
  brown: 'Brown: −6 dB/oct, low-frequency weighted',
  blue: 'Blue: +3 dB/oct, high-frequency weighted',
  violet: 'Violet: +6 dB/oct, brightest spectrum',
  grey: 'Grey: psychoacoustic equal-loudness shaped',
};

/** Canvas font shorthands. */
export const MONO = (px: number, weight = 500) =>
  `${weight} ${px}px "IBM Plex Mono", ui-monospace, monospace`;

/** Interpolate teal → amber along depth (Levels ladder, design §levels). */
export function depthColor(t: number): string {
  const a = [0x4f, 0x8c, 0x82];
  const b = [0xd9, 0xa4, 0x41];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * Math.min(1, Math.max(0, t))));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Engine LED states, consistent everywhere: off = idle, amber = playing, teal = paused. */
export function engineLedState(running: boolean, paused: boolean): 'off' | 'amber' | 'teal' {
  return running ? (paused ? 'teal' : 'amber') : 'off';
}

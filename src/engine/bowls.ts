/**
 * Open Sync engine — singing-bowl voice profiles and bowl-set data.
 *
 * Pure data + pure helpers, no DOM. A "material" is a physical-modelling
 * profile (partial ratios, relative amplitudes, decay, slow shimmer FM and a
 * mode-doublet split for hand-hammered asymmetry). A "strike" is a playing
 * technique: how the partials are weighted and how the envelope opens.
 *
 * Provenance of the numbers: partial ratios for struck metal bowls cluster
 * around 1 : 2.7–2.9 : 4.9–5.7 : 7.9–9.1 (Inácio, Henrique & Antunes,
 * "The dynamics of Tibetan singing bowls", Acta Acustica 92, 2006; Terwagne
 * & Bush, Nonlinearity 24, 2011). Quartz bowls are closer to a plate/glass
 * spectrum with a dominant fundamental and long sustain. These are sound
 * models chosen by ear against those measurements — they carry no claim of
 * any physiological effect (the layer is graded D throughout the app).
 */

import type { BowlMaterial, BowlSpec, BowlStrike } from './types';

export interface BowlMaterialProfile {
  id: BowlMaterial;
  label: string;
  /** Partial frequency ratios relative to the fundamental. */
  ratios: readonly number[];
  /** Relative partial amplitudes (same length as `ratios`). */
  amps: readonly number[];
  /** Amplitude decay time constant of the fundamental in seconds. */
  decaySec: number;
  /** Slow shimmer FM depth (fraction of frequency) and rate (Hz). */
  fmDepth: number;
  fmHz: number;
  /**
   * Mode-doublet split as a fraction of each partial's frequency. Real bowls
   * are never perfectly round, so each mode splits into two close frequencies
   * that beat slowly. 0 = perfectly symmetric (no beating).
   */
  doublet: number;
  /** One line about the sound. Describes the model, never an effect. */
  blurb: string;
}

export interface BowlStrikeProfile {
  id: BowlStrike;
  label: string;
  /** Per-partial amplitude weights (last value repeats for higher partials). */
  weights: readonly number[];
  /** Attack ramp in seconds (0 = instantaneous strike). */
  attackSec: number;
  /** Sustained (rubbed-rim) voice instead of a ring-down. */
  sustained: boolean;
  blurb: string;
}

const legacyAmps = (count: number): number[] => Array.from({ length: count }, (_, i) => 1 / (1 + 1.2 * i));

/** Material profiles, in the order the UI lists them. */
export const BOWL_MATERIALS: readonly BowlMaterialProfile[] = [
  {
    id: 'tibetan-bronze',
    label: 'Tibetan bronze',
    ratios: [1, 2.76, 5.4],
    amps: legacyAmps(3),
    decaySec: 6,
    fmDepth: 0.002,
    fmHz: 1.1,
    doublet: 0,
    blurb: 'The original Open Sync bowl: three inharmonic partials, medium ring-down.',
  },
  {
    id: 'himalayan-antique',
    label: 'Himalayan antique',
    ratios: [1, 2.63, 4.91, 7.86],
    amps: [1, 0.55, 0.22, 0.09],
    decaySec: 9,
    fmDepth: 0.0035,
    fmHz: 0.65,
    doublet: 0.004,
    blurb: 'Thick hand-hammered alloy model: slow beating between split modes, long warm ring.',
  },
  {
    id: 'bell-bronze',
    label: 'Bell bronze',
    ratios: [1, 2.71, 5.15, 8.42, 12.1],
    amps: [1, 0.62, 0.38, 0.2, 0.1],
    decaySec: 7.5,
    fmDepth: 0.0025,
    fmHz: 1.4,
    doublet: 0.0015,
    blurb: 'Machine-cast B20 bronze model: bright, five clear partials, bell-like attack.',
  },
  {
    id: 'brass',
    label: 'Brass',
    ratios: [1, 2.94, 5.72, 9.12],
    amps: [1, 0.7, 0.4, 0.18],
    decaySec: 3.5,
    fmDepth: 0.003,
    fmHz: 1.7,
    doublet: 0.002,
    blurb: 'Thin brass model: louder upper partials and a shorter, more percussive decay.',
  },
  {
    id: 'crystal-quartz',
    label: 'Crystal quartz',
    ratios: [1, 2.42, 4.17],
    amps: [1, 0.22, 0.06],
    decaySec: 14,
    fmDepth: 0.0006,
    fmHz: 0.35,
    doublet: 0.0008,
    blurb: 'Frosted quartz model: near-pure fundamental, very long sustain, little shimmer.',
  },
];

export const BOWL_STRIKES: readonly BowlStrikeProfile[] = [
  { id: 'mallet', label: 'Mallet', weights: [1], attackSec: 0, sustained: false, blurb: 'Plain strike: every partial speaks at once.' },
  {
    id: 'soft',
    label: 'Soft mallet',
    weights: [1, 0.42, 0.22, 0.13, 0.08],
    attackSec: 0.012,
    sustained: false,
    blurb: 'Padded mallet: fewer highs and a 12 ms bloom instead of a click.',
  },
  {
    id: 'rim',
    label: 'Rim (singing)',
    weights: [1, 0.3, 0.12, 0.05, 0.03],
    attackSec: 0,
    sustained: true,
    blurb: 'Rubbed rim: the bowl sings continuously, swelling in and releasing before each new pass.',
  },
];

export const DEFAULT_BOWL_MATERIAL: BowlMaterial = 'tibetan-bronze';
export const DEFAULT_BOWL_STRIKE: BowlStrike = 'mallet';

export function bowlMaterial(id: BowlMaterial | undefined): BowlMaterialProfile {
  return BOWL_MATERIALS.find((m) => m.id === id) ?? BOWL_MATERIALS[0];
}

export function bowlStrike(id: BowlStrike | undefined): BowlStrikeProfile {
  return BOWL_STRIKES.find((s) => s.id === id) ?? BOWL_STRIKES[0];
}

export const BOWL_MATERIAL_IDS: readonly BowlMaterial[] = BOWL_MATERIALS.map((m) => m.id);
export const BOWL_STRIKE_IDS: readonly BowlStrike[] = BOWL_STRIKES.map((s) => s.id);

/**
 * Equal-power stereo pan gains for `pan` in −1..1. Center returns exactly
 * [1, 1] so an un-panned bowl mixes identically into both channels.
 */
export function panGains(pan: number | undefined): [number, number] {
  const p = typeof pan === 'number' && Number.isFinite(pan) ? Math.max(-1, Math.min(1, pan)) : 0;
  if (p === 0) return [1, 1];
  const theta = ((p + 1) * Math.PI) / 4;
  return [Math.cos(theta) * Math.SQRT2, Math.sin(theta) * Math.SQRT2];
}

/** Every bowl of a phase in mix order: the single legacy `bowl` first, then the set. */
export function phaseBowls(phase: { bowl?: BowlSpec; bowls?: BowlSpec[] }): BowlSpec[] {
  const out: BowlSpec[] = [];
  if (phase.bowl) out.push(phase.bowl);
  if (phase.bowls) for (const b of phase.bowls) out.push(b);
  return out;
}

// ---------------------------------------------------------------------------
// Pitch helpers (12-TET, A4 = 440) for the bowl pitch picker.
// ---------------------------------------------------------------------------

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/** Frequency of a 12-TET note (A4 = 440 Hz). */
export function noteToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** MIDI number for a note name + octave, e.g. ('C#', 3) → 49. */
export function noteMidi(name: (typeof NOTE_NAMES)[number], octave: number): number {
  return (octave + 1) * 12 + NOTE_NAMES.indexOf(name);
}

/** Nearest 12-TET note for a frequency, with the cents offset. */
export function hzToNote(hz: number): { name: string; octave: number; midi: number; cents: number } {
  if (!Number.isFinite(hz) || hz <= 0) return { name: '—', octave: 0, midi: 0, cents: 0 };
  const exact = 69 + 12 * Math.log2(hz / 440);
  const midi = Math.round(exact);
  const cents = Math.round((exact - midi) * 100);
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  return { name, octave: Math.floor(midi / 12) - 1, midi, cents };
}

/** Short pitch label, e.g. "C#3 +4¢" (cents omitted when within ±2). */
export function noteLabel(hz: number): string {
  const n = hzToNote(hz);
  if (n.name === '—') return '—';
  const c = Math.abs(n.cents) > 2 ? ` ${n.cents > 0 ? '+' : ''}${n.cents}¢` : '';
  return `${n.name}${n.octave}${c}`;
}

/** Pitch choices for the bowl picker: C2 (65 Hz) … B5 (988 Hz), inside the 20–1000 Hz bowl range. */
export const BOWL_NOTE_CHOICES: readonly { label: string; hz: number }[] = (() => {
  const out: { label: string; hz: number }[] = [];
  for (let midi = noteMidi('C', 2); midi <= noteMidi('B', 5); midi++) {
    const hz = noteToHz(midi);
    out.push({ label: `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`, hz: Math.round(hz * 100) / 100 });
  }
  return out;
})();

// ---------------------------------------------------------------------------
// Bowl sets — ready-made multi-bowl arrangements. Pure data; every set is
// graded D (texture/enjoyment) and the blurbs describe sound, not effects.
// ---------------------------------------------------------------------------

export interface BowlSetBowl {
  material: BowlMaterial;
  strike: BowlStrike;
  baseHz: number;
  /** Level in dBFS relative to the layer bus. */
  db: number;
  pan: number;
  restrikeSec: number;
}

export interface BowlSetPreset {
  id: string;
  name: string;
  /** What it sounds like — no claims. */
  blurb: string;
  bowls: readonly BowlSetBowl[];
}

/** Hard cap on bowls per session (memory: one looped buffer per bowl). */
export const MAX_BOWLS = 7;

const hz = (name: (typeof NOTE_NAMES)[number], octave: number): number => Math.round(noteToHz(noteMidi(name, octave)) * 100) / 100;

export const BOWL_SETS: readonly BowlSetPreset[] = [
  {
    id: 'himalayan-trio',
    name: 'Himalayan trio',
    blurb: 'Three antique-style bowls a fifth and an octave apart, struck on staggered intervals.',
    bowls: [
      { material: 'himalayan-antique', strike: 'mallet', baseHz: 136.1, db: -24, pan: -0.45, restrikeSec: 12 },
      { material: 'himalayan-antique', strike: 'soft', baseHz: 204.15, db: -28, pan: 0.45, restrikeSec: 16 },
      { material: 'tibetan-bronze', strike: 'soft', baseHz: 272.2, db: -32, pan: 0, restrikeSec: 8 },
    ],
  },
  {
    id: 'crystal-pair',
    name: 'Crystal pair',
    blurb: 'Two quartz bowls sung on the rim, C4 and G4, drifting slowly across the stereo field.',
    bowls: [
      { material: 'crystal-quartz', strike: 'rim', baseHz: hz('C', 4), db: -26, pan: -0.35, restrikeSec: 16 },
      { material: 'crystal-quartz', strike: 'rim', baseHz: hz('G', 4), db: -30, pan: 0.35, restrikeSec: 12 },
    ],
  },
  {
    id: 'seven-note-set',
    name: 'Seven-note set',
    blurb: 'A C-major seven-bowl set (C3 to B3), the layout sold as a "chakra set". The note-to-body mapping is folklore; the scale is real.',
    bowls: [
      { material: 'himalayan-antique', strike: 'mallet', baseHz: hz('C', 3), db: -26, pan: -0.6, restrikeSec: 16 },
      { material: 'tibetan-bronze', strike: 'mallet', baseHz: hz('D', 3), db: -28, pan: -0.4, restrikeSec: 12 },
      { material: 'bell-bronze', strike: 'soft', baseHz: hz('E', 3), db: -30, pan: -0.2, restrikeSec: 8 },
      { material: 'himalayan-antique', strike: 'soft', baseHz: hz('F', 3), db: -30, pan: 0, restrikeSec: 16 },
      { material: 'tibetan-bronze', strike: 'mallet', baseHz: hz('G', 3), db: -28, pan: 0.2, restrikeSec: 12 },
      { material: 'bell-bronze', strike: 'soft', baseHz: hz('A', 3), db: -30, pan: 0.4, restrikeSec: 8 },
      { material: 'crystal-quartz', strike: 'mallet', baseHz: hz('B', 3), db: -32, pan: 0.6, restrikeSec: 16 },
    ],
  },
  {
    id: 'deep-drone',
    name: 'Deep drone',
    blurb: 'Two large bowls an octave apart, rim-sung, plus a brass accent every 12 s.',
    bowls: [
      { material: 'himalayan-antique', strike: 'rim', baseHz: hz('A', 2), db: -24, pan: -0.25, restrikeSec: 16 },
      { material: 'crystal-quartz', strike: 'rim', baseHz: hz('A', 3), db: -30, pan: 0.25, restrikeSec: 12 },
      { material: 'brass', strike: 'mallet', baseHz: hz('E', 4), db: -34, pan: 0.5, restrikeSec: 12 },
    ],
  },
  {
    id: 'bright-bells',
    name: 'Bright bells',
    blurb: 'Bell bronze and brass at higher pitches for a glittering, faster-decaying texture.',
    bowls: [
      { material: 'bell-bronze', strike: 'mallet', baseHz: hz('E', 4), db: -28, pan: -0.5, restrikeSec: 8 },
      { material: 'brass', strike: 'mallet', baseHz: hz('B', 4), db: -32, pan: 0.5, restrikeSec: 12 },
      { material: 'bell-bronze', strike: 'soft', baseHz: hz('G#', 4), db: -30, pan: 0, restrikeSec: 16 },
    ],
  },
];

/** Re-strike intervals offered live (seconds). Each is the loop length of that bowl's buffer. */
export const BOWL_RESTRIKE_CHOICES: readonly number[] = [4, 6, 8, 12, 16];

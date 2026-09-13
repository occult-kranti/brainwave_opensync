/**
 * Sonic Lab — page catalog: generator card metadata, groups, grades, and the
 * honesty labels surfaced in the UI. Kept separate from the page component so
 * tests can lint every user-facing string (banned-claim lint, honesty labels)
 * without rendering.
 *
 * `featureId` values are FEATURES (src/docs/features.ts) ids. They do not
 * exist yet — InfoPopover renders nothing until the doc entries are merged
 * (lead owns features.ts). Needed ids are listed in NEEDED_FEATURE_IDS.
 */

import type { GradeLetter } from '@/ui/theme';

export type SonicGroup =
  | 'illusions'
  | 'math-rhythms'
  | 'fractal-chaos'
  | 'custom-waves'
  | 'tuning'
  | 'astro';

export interface SonicCard {
  id: string;
  group: SonicGroup;
  title: string;
  grade: GradeLetter;
  /** One-line what-it-is (shown on the card). */
  blurb: string;
  /** Honesty caveat (shown as a warning chip when present). */
  caveat?: string;
  /** features.ts id for the ⓘ popover (pending lead merge). */
  featureId: string;
}

export const SONIC_GROUPS: ReadonlyArray<{ id: SonicGroup; title: string }> = [
  { id: 'illusions', title: 'Auditory Illusions' },
  { id: 'math-rhythms', title: 'Mathematical Rhythms' },
  { id: 'fractal-chaos', title: 'Fractal & Chaos' },
  { id: 'custom-waves', title: 'Custom Waveforms' },
  { id: 'tuning', title: 'Tuning Systems' },
  { id: 'astro', title: 'Astro-Tuned' },
];

export const SONIC_CARDS: readonly SonicCard[] = [
  {
    id: 'shepard',
    group: 'illusions',
    title: 'Shepard–Risset glissando',
    grade: 'A',
    blurb:
      'Overlapping tones an octave apart create the impression of a continually rising pitch.',
    featureId: 'soniclab-shepard',
  },
  {
    id: 'risset-rhythm',
    group: 'illusions',
    title: 'Risset rhythm',
    grade: 'A',
    blurb:
      'Two click patterns speed up and crossfade to create the impression of continuous acceleration.',
    featureId: 'soniclab-risset-rhythm',
  },
  {
    id: 'barber-pole',
    group: 'illusions',
    title: 'Barber-pole AM',
    grade: 'B',
    blurb:
      'Overlapping amplitude pulses sweep through a 2:1 range to create a continuous-motion illusion.',
    caveat: 'The strength of the illusion varies by listener.',
    featureId: 'soniclab-barber-pole',
  },
  {
    id: 'euclidean',
    group: 'math-rhythms',
    title: 'Euclidean rhythm gate',
    grade: 'A',
    blurb:
      'Spread pulses evenly across a set number of steps. The pattern controls when a tone plays.',
    featureId: 'soniclab-euclidean',
  },
  {
    id: 'phi-beatty',
    group: 'math-rhythms',
    title: 'Golden-ratio Beatty rhythm',
    grade: 'B',
    blurb:
      'Place pulses with a Beatty sequence using the golden ratio. Compare its spacing with a regular rhythm.',
    caveat: 'No special effect on listeners is established. Historical claims about composers using φ remain contested (Grade C).',
    featureId: 'soniclab-phi-beatty',
  },
  {
    id: 'prime-pulse',
    group: 'math-rhythms',
    title: 'Prime pulse train',
    grade: 'B',
    blurb: 'Play a click on prime-numbered steps: 2, 3, 5, 7, 11, and so on.',
    featureId: 'soniclab-prime-pulse',
  },
  {
    id: 'fibonacci-word',
    group: 'math-rhythms',
    title: 'Fibonacci word rhythm',
    grade: 'B',
    blurb: 'Self-similar rhythm from the word A→AB, B→A; the long:short ratio approaches φ.',
    caveat:
      'The substitution rule defines the rhythm. It establishes no special physiological effect.',
    featureId: 'soniclab-fibonacci-word',
  },
  {
    id: 'fractal-noise',
    group: 'fractal-chaos',
    title: '1/f^α fractal noise',
    grade: 'A',
    blurb:
      'Change the frequency balance of noise. Alpha 0 is white, 1 is pink, and 2 is Brownian.',
    caveat: 'Grade A covers the spectral rule. Whether the sound is pleasant depends on the listener.',
    featureId: 'soniclab-fractal-noise',
  },
  {
    id: 'logistic',
    group: 'fractal-chaos',
    title: 'Logistic-map chaos LFO',
    grade: 'A',
    blurb:
      'Use x′ = r·x(1−x) to vary pitch or amplitude. Adjust r to compare steady, repeating, and chaotic patterns.',
    featureId: 'soniclab-logistic',
  },
  {
    id: 'custom-wave',
    group: 'custom-waves',
    title: 'Custom waveform designer',
    grade: 'A',
    blurb:
      'Build tones with harmonic sliders, frequency modulation, waveshaping, or phase distortion.',
    featureId: 'soniclab-custom-wave',
  },
  {
    id: 'tuning-systems',
    group: 'tuning',
    title: 'Tuning systems explorer',
    grade: 'A',
    blurb:
      'Compare just intonation, equal divisions, and the Bohlen–Pierce scale. Read each interval in cents.',
    featureId: 'soniclab-tuning',
  },
  {
    id: 'astro',
    group: 'astro',
    title: 'Astro-tuned sonification',
    grade: 'D',
    blurb:
      'Turn orbital periods and Earth time cycles into pitches. The selected reference sets the audible range.',
    caveat:
      'Grade A covers the frequency calculation. There is no evidence for special planetary effects on listeners (Grade D).',
    featureId: 'soniclab-astro',
  },
];

/** features.ts entries the lead needs to add for the ⓘ popovers to light up. */
export const NEEDED_FEATURE_IDS = SONIC_CARDS.map((c) => c.featureId);

/** Mandatory D-grade meaning label shown in the astro panel (E2 §5.2). */
export const ASTRO_MEANING_LABEL =
  'These pitches are calculated from astronomical periods. There is no evidence of any special effect on listeners.';

/** Banned overclaim phrases — mirror of the program-wide lint lists. */
export { BANNED_PHRASES } from '@/docs/vocabulary';

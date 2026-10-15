import type { NanoRecipe } from '@/nanolab/model';
import type { Preset } from './presets';
import { CLEAN_PRESET_MIX } from './presetMix';

export const NANO_BENCH_PRESETS: readonly { id: string; title: string; note: string; recipe: NanoRecipe }[] = [
  { id: 'pair', title: 'Two-tone envelope', note: '392 + 408 Hz; a 16 Hz envelope, with no extra 16 Hz spectral line.', recipe: { kind: 'two-tone', carrierHz: 400, rateHz: 16, durationSec: 10, gainDb: -30 } },
  { id: 'am', title: 'Amplitude modulation', note: '400 Hz carrier, 16 Hz modulation; sidebands at 384 and 416 Hz.', recipe: { kind: 'am', carrierHz: 400, rateHz: 16, durationSec: 10, gainDb: -30 } },
  { id: 'baseband', title: 'Low-frequency control', note: 'An actual 16 Hz signal. It may be inaudible; do not turn it up.', recipe: { kind: 'baseband', carrierHz: 400, rateHz: 16, durationSec: 10, gainDb: -30 } },
  { id: 'carrier', title: 'Steady carrier control', note: '400 Hz only; the same duration and gain ceiling for comparison.', recipe: { kind: 'carrier', carrierHz: 400, rateHz: 16, durationSec: 10, gainDb: -30 } },
];

/** Studio uses sine AM for monaural mode, not the bench's physical two-tone sum. */
export const NANO_STUDIO_PRESETS: readonly Preset[] = [
  { id: 'nano-am-16', title: 'NanoLab · 16 Hz AM — experimental tier', rate: 16, purpose: 'A 400 Hz carrier with 16 Hz sine amplitude modulation. Speaker-compatible, with stationary lines at 384, 400 and 416 Hz.' },
  { id: 'nano-am-40', title: 'NanoLab · 40 Hz AM — experimental tier', rate: 40, purpose: 'A 400 Hz carrier with 40 Hz sine amplitude modulation. Speaker-compatible, with stationary lines at 360, 400 and 440 Hz.' },
  { id: 'nano-carrier', title: 'NanoLab · steady control — experimental tier', rate: 0, purpose: 'A steady 400 Hz comparison tone without modulation. Use the NanoLab bench for exact short two-tone and baseband controls.' },
].map(({ id, title, rate, purpose }) => ({ id, title, purpose, category: 'Experimental', grade: 'D',
  rationale: 'The signal mathematics is established; any wellness or nanoparticle effect of this original listening recipe is unverified. No magnetic field, optical exposure or material dose is supplied.',
  citations: ['https://www.cs.cmu.edu/~15322/book/ch06/03.html', 'https://openstax.org/books/university-physics-volume-1/pages/17-6-beats'],
  spec: { autoShutoff: true, mix: { ...CLEAN_PRESET_MIX, volumeDb: -30 }, phases: [{ name: rate ? 'sine amplitude modulation' : 'unmodulated control', durationSec: 300, carrierHz: 400, beatHz: rate, mode: 'monaural', gainDbFs: -30 }] },
}));

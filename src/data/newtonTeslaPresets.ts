import type { Phase, Preset } from './presets';
import { CLEAN_PRESET_MIX, type PresetMix } from './presetMix';

const SOURCES = {
  phase: 'https://openstax.org/books/university-physics-volume-1/pages/16-2-mathematics-of-waves',
  beats: 'https://openstax.org/books/university-physics-volume-1/pages/17-6-beats',
  pitch: 'https://www.cs.cmu.edu/~15322/book/ch04/01.html',
  newtonMusic: 'https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00034',
  teslaPhase: 'https://patents.google.com/patent/US381968A/en',
  teslaLecture: 'https://www.gutenberg.org/files/13476/13476-h/13476-h.htm',
};

const quietMix = (): PresetMix => ({
  ...CLEAN_PRESET_MIX,
  noiseDb: {}, nature: { ...CLEAN_PRESET_MIX.nature }, bowls: [], volumeDb: -28,
});

const phase = (name: string, carrierHz: number, durationSec: number, beatHz = 0): Phase => ({
  name, carrierHz, durationSec, beatHz, mode: 'binaural', gainDbFs: -28, rampSec: 15,
});

function recipe(
  id: string, title: string, purpose: string, rationale: string,
  phases: Phase[], citations: string[],
): Omit<Preset, 'dose'> {
  return {
    id: `nt-${id}`, title: `${title} — experimental tier`, category: 'Experimental', grade: 'D',
    purpose,
    rationale: `Original audio illustration; listening benefits are unvalidated. ${rationale}`,
    citations,
    spec: { autoShutoff: true, limitMin: phases.reduce((sum, item) => sum + item.durationSec, 0) / 60, mix: quietMix(), phases },
  };
}

/**
 * Acoustic companions to the Newton–Tesla reading page, authored for this app.
 * No initial-phase field exists in the preset schema: phase drift is obtained
 * from frequency difference, never described as a prescribed phase offset.
 * Binaural mode retains its channel-frequency meaning in live and offline audio.
 * Steady phases use beatHz=0 in the same mode; no monaural AM adapter is involved.
 * The complete clean mixer prevents old noise/bowls/nature layers carrying over.
 * Authored rampSec is metadata; existing live/offline transition rules still apply.
 */
export const NEWTON_TESLA_PRESETS: readonly Omit<Preset, 'dose'>[] = [
  recipe(
    'phase-drift', 'Slow relative-phase drift',
    'Five minutes of 240 Hz on the left and 240.5 Hz on the right. Use stereo headphones and compare with Faster stereo detuning.',
    'The 0.5 Hz difference advances relative phase by one turn every two seconds. The preset does not set an initial phase offset. Tesla’s phase patent supplies historical context; this sound does not reproduce its magnetic field or motor.',
    [phase('240 left / 240.5 right', 240, 300, 0.5)], [SOURCES.phase, SOURCES.teslaPhase],
  ),
  recipe(
    'detuning-3', 'Faster stereo detuning',
    'Five minutes of 240 Hz on the left and 243 Hz on the right. Compare with the 0.5 Hz version at the same comfortable device setting.',
    'The carrier, duration and digital gain match Slow relative-phase drift; only the right-channel frequency changes. A 3 Hz difference means three relative-phase turns per second. It is neither a 3 Hz sound-pressure tone nor an EEG measurement.',
    [phase('240 left / 243 right', 240, 300, 3)], [SOURCES.phase, SOURCES.beats],
  ),
  recipe(
    'ratio-steps', 'Simple-ratio tuning steps',
    'Four 90-second tones in both ears: 320, 384, 512 and 256 Hz. Compare the same pitch contour in Equal-tempered tuning steps.',
    'The ratios against the chosen 256 Hz root are 5:4, 3:2, 2:1 and 1:1. Newton’s color/music analogy motivates examining ratios; these chosen pitches and their order are ours, not his tuning prescription. The tones play sequentially, with no measured resonator response.',
    [5 / 4, 3 / 2, 2, 1].map((ratio) => phase(`${ratio}:1 against 256 Hz`, 256 * ratio, 90)), [SOURCES.pitch, SOURCES.newtonMusic],
  ),
  recipe(
    'tempered-steps', 'Equal-tempered tuning steps',
    'Four 90-second tones in both ears: about 322.54, 383.57, 512 and 256 Hz. The order matches Simple-ratio tuning steps.',
    'Pitches follow 256 × 2^(n/12), with n = 4, 7, 12 and 0. The root is a design choice, not a historical healing frequency. Tesla’s discussion of electrical tuning is context only; these sounds do not model his circuit.',
    [4, 7, 12, 0].map((semitones) => phase(`${semitones} semitones above 256 Hz`, 256 * 2 ** (semitones / 12), 90)), [SOURCES.pitch, SOURCES.teslaLecture],
  ),
];

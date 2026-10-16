import type { Phase, Preset, PresetMode } from './presets';
import { CLEAN_PRESET_MIX, type PresetMix } from './presetMix';

const SOURCES = {
  beats: 'https://openstax.org/books/university-physics-volume-1/pages/17-6-beats',
  modulation: 'https://www.cs.cmu.edu/~15322/book/ch06/03.html',
  synthesis: 'https://www.cs.cmu.edu/~15322/book/ch03/02.html',
  pitch: 'https://www.cs.cmu.edu/~15322/book/ch04/01.html',
  modelling: 'https://www.cs.cmu.edu/~15322/book/ch12/01.html',
  comparison: 'https://doi.org/10.3389/fnhum.2017.00557',
  tradition: 'https://classics.mit.edu/Plato/timaeus.html',
};

const phase = (name: string, minutes: number, carrierHz = 220, beatHz = 0, mode: PresetMode = 'monaural'): Phase => ({
  name, durationSec: minutes * 60, carrierHz, beatHz, mode, gainDbFs: -26, rampSec: 15,
});

/** Complete mixer profiles prevent a previous session's layers carrying over. */
function quietMix(overrides: Partial<PresetMix> = {}): PresetMix {
  return {
    ...CLEAN_PRESET_MIX,
    noiseDb: {},
    nature: { ...CLEAN_PRESET_MIX.nature },
    bowls: [],
    volumeDb: -26,
    ...overrides,
  };
}

function preset(
  id: string, title: string, purpose: string, rationale: string,
  phases: Phase[], citations: string[], mix: PresetMix = quietMix(),
): Omit<Preset, 'dose'> {
  return {
    id: `research-${id}`, title: `${title} — experimental tier`, category: 'Experimental', grade: 'D',
    purpose,
    rationale: `Original listening design; benefits are unvalidated. ${rationale}`,
    citations,
    spec: { autoShutoff: true, limitMin: phases.reduce((sum, item) => sum + item.durationSec, 0) / 60, phases, mix },
  };
}

/**
 * Original acoustic comparisons, not clinical protocols or proprietary tracks.
 * Sources support concepts or historical context, not efficacy of these recipes.
 * Digital gain is not a measured headphone or room sound-pressure level.
 * rampSec is authored metadata; the existing live/offline transition rules apply.
 * Texture beds retain an explicit tone because the current engine has no
 * independently muted carrier. Their labels describe that audible combination.
 */
export const SOUND_RESEARCH_PRESETS: readonly Omit<Preset, 'dose'>[] = [
  preset(
    'carrier-control', 'Steady carrier control',
    'Six minutes of 220 Hz in both ears. Compare with the stereo examples using the same headphones and comfortable volume.',
    'The carrier, duration and digital gain match the stereo examples. This is a beat-free acoustic reference, without loudness calibration or a measured biological outcome.',
    [phase('steady reference', 6, 220, 0, 'binaural')], [SOURCES.beats, SOURCES.comparison],
  ),
  preset(
    'stereo-6', 'Stereo difference · 6 Hz',
    'Six minutes with 220 Hz on the left and 226 Hz on the right. Use stereo headphones; compare with Steady carrier control.',
    'The 6 Hz number is the difference between two audible tones, not a separate 6 Hz tone or a measured brain rhythm. Record comfort and preference only.',
    [phase('220 left / 226 right', 6, 220, 6, 'binaural')], [SOURCES.comparison, SOURCES.beats],
  ),
  preset(
    'stereo-10', 'Stereo difference · 10 Hz',
    'Six minutes with 220 Hz on the left and 230 Hz on the right. Use stereo headphones; compare with the 6 Hz example.',
    'Changing the difference from 6 to 10 Hz changes the acoustic stimulus. It does not establish a particular mental state, and expectations can affect preference.',
    [phase('220 left / 230 right', 6, 220, 10, 'binaural')], [SOURCES.comparison, SOURCES.beats],
  ),
  preset(
    'monaural-6', 'Shared-channel beat comparison · 6 Hz',
    'Six minutes in both channels. Preview/export: sine AM at 6 Hz. Live Studio: two tones at 220 and 226 Hz. Speakers or headphones can reproduce either version.',
    'Preview/export has a 220 Hz carrier and 214/226 Hz sidebands. Live Studio sums 220 and 226 Hz tones, producing a cosine beat envelope. The versions share a rate but differ in waveform and spectrum.',
    [phase('6 Hz shared-channel comparison', 6, 220, 6)], [SOURCES.modulation, SOURCES.beats],
  ),
  preset(
    'slow-pulse', 'Slow acoustic pulse',
    'Five minutes of a slow amplitude pattern. Preview/export: 0.125 Hz sine AM. Live Studio: beating between 180 and 180.125 Hz. Breathe naturally at your own pace.',
    'Preview/export uses sine AM with 179.875/180/180.125 Hz spectral lines. Live Studio has a cosine beat envelope from two tones; the waveforms differ. Neither version prescribes breathing or measures physiology.',
    [phase('eight-second amplitude comparison', 5, 180, 0.125)], [SOURCES.modulation, SOURCES.beats],
  ),
  preset(
    'pink-bed', 'Steady tone & pink texture',
    'Eight minutes of an audible 180 Hz steady tone with a quiet pink-noise layer. Compare the texture with the brown-noise version.',
    'The colored-noise layer is explicitly mixed with a carrier; this is not noise-only audio. The texture and timing are composition choices, not a sleep-stage intervention.',
    [phase('180 Hz with pink texture', 8, 180)], [SOURCES.synthesis],
    quietMix({ noiseOn: true, noiseDb: { pink: -26 } }),
  ),
  preset(
    'brown-bed', 'Steady tone & brown texture',
    'Eight minutes of an audible 180 Hz steady tone with a quiet brown-noise layer. Compare at the same comfortable device setting.',
    'The carrier and timing match the pink-texture version. Digital settings do not make the textures perceptually equal in loudness or establish an attention benefit.',
    [phase('180 Hz with brown texture', 8, 180)], [SOURCES.synthesis],
    quietMix({ noiseOn: true, noiseDb: { brown: -26 } }),
  ),
  preset(
    'bowl-trio', 'Three bowls & reference tone',
    'Ten minutes of a 220 Hz reference tone with softly struck bowls based at 220, 330 and 440 Hz. Notice each modelled timbre and decay.',
    'Bowl voices are procedural models with inharmonic partials, not recordings of measured instruments. The base-pitch ratios do not make every partial harmonic.',
    [phase('reference tone and three bowls', 10)], [SOURCES.modelling, SOURCES.synthesis],
    quietMix({ bowls: [
      { on: true, material: 'himalayan-antique', strike: 'soft', baseHz: 220, db: -28, pan: -0.25, restrikeSec: 16, lock: false },
      { on: true, material: 'crystal-quartz', strike: 'soft', baseHz: 330, db: -30, pan: 0, restrikeSec: 12, lock: false },
      { on: true, material: 'bell-bronze', strike: 'soft', baseHz: 440, db: -32, pan: 0.25, restrikeSec: 8, lock: false },
    ] }),
  ),
  preset(
    'ratio-sequence', 'Simple-ratio pitch sequence',
    'Four two-minute tones: 220, 275, 330 and 440 Hz. Compare the same contour in Equal-temperament sequence.',
    'The pitches use ratios 1, 5:4, 3:2 and 2 against 220 Hz. They play in sequence, not as simultaneous harmonics; no ratio has a demonstrated benefit here.',
    [1, 5 / 4, 3 / 2, 2].map((ratio) => phase(`${220 * ratio} Hz`, 2, 220 * ratio)), [SOURCES.synthesis],
  ),
  preset(
    'equal-temperament', 'Equal-temperament sequence',
    'Four two-minute tones: a 220 Hz root, then 4, 7 and 12 equal-tempered semitones above it. Compare with Simple-ratio pitch sequence.',
    'Each pitch is 220 × 2^(semitones/12). The shared root, duration and digital gain support a musical comparison; they do not create a blinded or calibrated study.',
    [0, 4, 7, 12].map((semitones) => phase(`${semitones} semitones above root`, 2, 220 * 2 ** (semitones / 12))), [SOURCES.pitch],
  ),
  preset(
    'fifth-drone', 'Traditions-inspired fifth drone',
    'Eight minutes of a 220 Hz tone and a softly sustained bowl based at 330 Hz. Listen to the 3:2 base-pitch relationship.',
    'Plato’s Timaeus discusses ratios in a philosophical cosmology. That text is cultural inspiration; these chosen pitches and modelled bowl are not a recovered ancient practice.',
    [phase('tone and fifth bowl', 8)], [SOURCES.tradition, SOURCES.modelling],
    quietMix({ bowls: [
      { on: true, material: 'himalayan-antique', strike: 'rim', baseHz: 330, db: -28, pan: 0, restrikeSec: 16, lock: false },
    ] }),
  ),
  preset(
    'rain-bowl', 'Rain, bowl & steady tone',
    'Twelve minutes of procedural rain, a softly recurring 294 Hz bowl and a steady 147 Hz tone. An original background listening mix.',
    'The rain is synthesized and the bowl is modelled. This composition does not reproduce a nature recording, sound-therapy session or paid product.',
    [phase('rain and bowl listening', 12, 147)], [SOURCES.modelling],
    quietMix({ nature: { on: true, kind: 'rain', db: -28 }, bowls: [
      { on: true, material: 'crystal-quartz', strike: 'soft', baseHz: 294, db: -30, pan: 0.15, restrikeSec: 16, lock: false },
    ] }),
  ),
];

import type { Phase, Preset } from './presets';
import { CLEAN_PRESET_MIX, type PresetMix } from './presetMix';

const SOURCES = {
  interview: 'https://batgap.com/darryl-anka-bashar-transcript/',
  waves: 'https://openstax.org/books/university-physics-volume-1/pages/16-2-mathematics-of-waves',
  beats: 'https://openstax.org/books/university-physics-volume-1/pages/17-6-beats',
  sampling: 'https://www.analog.com/media/en/training-seminars/tutorials/mt-002.pdf',
};
const quietMix = (): PresetMix => ({
  ...CLEAN_PRESET_MIX,
  noiseDb: {}, nature: { ...CLEAN_PRESET_MIX.nature }, bowls: [], volumeDb: -30,
});
const tone = (carrierHz: number, durationSec: number, beatHz = 0): Phase => ({
  name: beatHz ? `${carrierHz} Hz left / ${carrierHz + beatHz} Hz right` : `${carrierHz} Hz in both channels`,
  carrierHz, beatHz, durationSec, mode: 'binaural', gainDbFs: -30, rampSec: 15,
});
function recipe(id: string, title: string, purpose: string, rationale: string, phases: Phase[], citations: string[]): Omit<Preset, 'dose'> {
  return {
    id, title: `${title} — experimental tier`, category: 'Experimental', grade: 'D', purpose,
    rationale: `Original listening comparison; benefits are unvalidated. ${rationale} Starting pitches, durations and digital gains are app choices. Digital gain does not specify calibrated sound pressure.`,
    citations,
    spec: { autoShutoff: true, limitMin: phases.reduce((sum, step) => sum + step.durationSec, 0) / 60, mix: quietMix(), phases },
  };
}
const sourceScope = 'The host transcript documents Anka’s reported interpretation; it does not prescribe these pitches or establish a measured consciousness state. This is our listening-study extension, without source endorsement.';

/** Source-claim comparisons, separate from the four older supplied-digest illustrations. */
export const BASHAR_STUDY_PRESETS: readonly Omit<Preset, 'dose'>[] = [
  recipe(
    'bashar-study-matched-steps', 'Matched pitch steps',
    'Compare four quiet 90-second tones, 248 → 310 → 372 → 496 Hz, identical in both channels, with the offset-channel version.',
    `The ratios to our 248 Hz reference are 1, 5/4, 3/2 and 2. This is a matched-channel control for an audio comparison, not a claim about personal alignment. ${sourceScope}`,
    [248, 310, 372, 496].map(hz => tone(hz, 90)), [SOURCES.interview, SOURCES.waves],
  ),
  recipe(
    'bashar-study-offset-steps', 'Offset pitch steps',
    'The same four left-channel tones and timing, with the right channel 2 Hz higher at every step. Use stereo headphones for channel separation.',
    `Only the right-channel frequency differs from Matched pitch steps: 250, 312, 374 and 498 Hz. Relative phase advances at 2 turns per second; no separate 2 Hz tone is emitted. Neither condition measures a listener’s internal state. ${sourceScope}`,
    [248, 310, 372, 496].map(hz => tone(hz, 90, 2)), [SOURCES.interview, SOURCES.waves],
  ),
  recipe(
    'bashar-study-fifth-return', 'Fifth then return',
    'Listen to 372 → 248 → 496 → 248 Hz, 90 seconds per step in both channels. Compare the first return with the octave version.',
    `The first descent is from 3/2 of the 248 Hz root; the second is from twice that root. Only the first pitch differs from Octave then return. Equal digital gain does not guarantee equal perceived loudness. ${sourceScope}`,
    [372, 248, 496, 248].map(hz => tone(hz, 90)), [SOURCES.interview, SOURCES.waves],
  ),
  recipe(
    'bashar-study-octave-return', 'Octave then return',
    'Listen to 496 → 248 → 496 → 248 Hz, 90 seconds per step in both channels. Both returns now span a 2:1 interval.',
    `Timing, gain and the final three pitches match Fifth then return; the first pitch changes from 372 to 496 Hz. This holds sequence structure fixed while changing the first interval. ${sourceScope}`,
    [496, 248, 496, 248].map(hz => tone(hz, 90)), [SOURCES.interview, SOURCES.waves],
  ),
];

/** Audible proxies for the frequency bench; no high-frequency apparatus or measurement is implied. */
export const FREQUENCY_STUDY_PRESETS: readonly Omit<Preset, 'dose'>[] = [
  recipe(
    'frequency-study-phase-reference', 'Phase drift reference',
    'Five minutes of 312 Hz in both channels. Compare with Phase drift at 1.25 Hz using the same comfortable device setting.',
    'Matched channel frequencies give zero relative phase drift in this ideal signal. The preset schema has no initial-phase parameter. Playback does not measure spatial interference, room pressure or biological coherence.',
    [tone(312, 300)], [SOURCES.waves],
  ),
  recipe(
    'frequency-study-phase-drift', 'Phase drift at 1.25 Hz',
    'Five minutes of 312 Hz left and 313.25 Hz right. This changes only the right-channel frequency from the matched reference.',
    'Relative phase changes by 2π × 1.25 × t radians and completes a turn every 0.8 seconds. This is detuning, not a fixed initial-phase offset; no isolated 1.25 Hz tone or measured neural rhythm is produced.',
    [tone(312, 300, 1.25)], [SOURCES.waves, SOURCES.beats],
  ),
  recipe(
    'frequency-study-sideband-pair', 'Five-hertz spectral separation',
    'Five minutes of 288 Hz left and 293 Hz right. Compare the fixed 288 Hz reference with a second channel shifted by 5 Hz.',
    'The two lines illustrate the arithmetic distance from a chosen carrier to one upper AM sideband: 293 − 288 = 5 Hz. Actual AM at 5 Hz would also require a lower 283 Hz sideband and a specified amplitude relation. This stereo pair is not AM playback and does not produce a separate 5 Hz signal. Speaker or mono mixing changes the comparison.',
    [tone(288, 300, 5)], [SOURCES.beats, SOURCES.waves],
  ),
  recipe(
    'frequency-study-alias-proxy', 'Alias arithmetic · audible reference',
    'Five minutes of a steady 288 Hz tone in both channels. Use it as the carrier control for Five-hertz spectral separation or as an audible reference for the sampling calculation.',
    'For an illustrative 8,000 samples/s clock, a 7,712 Hz sine folds to a 288 Hz magnitude-frequency alias because |7,712 − 8,000| = 288. Its ideal sampled sine has reversed sign relative to a positive-phase 288 Hz sine. This recipe directly synthesizes 288 Hz at the engine rate; it never generates 7,712 Hz or performs that undersampling. The chosen arithmetic does not establish a hidden physical signal.',
    [tone(288, 300)], [SOURCES.sampling],
  ),
];

/** Phase ramps are saved metadata; existing live/offline transition behavior is unchanged. */
export const FRONTIER_PRESETS: readonly Omit<Preset, 'dose'>[] = [...BASHAR_STUDY_PRESETS, ...FREQUENCY_STUDY_PRESETS];

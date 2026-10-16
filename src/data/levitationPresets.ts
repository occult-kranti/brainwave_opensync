import type { Phase, Preset } from './presets';
import { CLEAN_PRESET_MIX, type PresetMix } from './presetMix';

const SOURCES = {
  waves: 'https://openstax.org/books/university-physics-volume-1/pages/16-2-mathematics-of-waves',
  standingWaves: 'https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance',
  trapping: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4627579/',
};

const quietMix = (): PresetMix => ({
  ...CLEAN_PRESET_MIX,
  noiseDb: {}, nature: { ...CLEAN_PRESET_MIX.nature }, bowls: [], volumeDb: -30,
});

const phase = (carrierHz: number, durationSec: number, beatHz = 0): Phase => ({
  name: beatHz === 0 ? `${carrierHz} Hz in both channels` : `${carrierHz} left / ${carrierHz + beatHz} right`,
  carrierHz, beatHz, durationSec, mode: 'binaural', gainDbFs: -30, rampSec: 15,
});

function recipe(
  id: string, title: string, purpose: string, rationale: string,
  phases: Phase[], citations: string[],
): Omit<Preset, 'dose'> {
  return {
    id: `levitation-${id}`,
    title: `${title} — experimental tier`,
    category: 'Experimental', grade: 'D', purpose,
    rationale: `Original listening comparison; benefits are unvalidated. ${rationale} These audible tones do not reproduce an acoustic trap or levitate objects.`,
    citations,
    spec: {
      autoShutoff: true,
      limitMin: phases.reduce((sum, item) => sum + item.durationSec, 0) / 60,
      mix: quietMix(), phases,
    },
  };
}

/**
 * Quiet audio companions to a separate force/field model, not its actuators.
 * The schema has no initial-phase parameter. Frequency difference produces
 * relative-phase drift; it does not program a spatial interference pattern.
 * Zero-beat binaural phases give the same steady frequency to both channels,
 * avoiding the existing nonzero-rate monaural live/offline distinction.
 * rampSec remains authored metadata under the existing transition rules.
 */
export const LEVITATION_PRESETS: readonly Omit<Preset, 'dose'>[] = [
  recipe(
    'frequency-reference', 'Equal-frequency reference',
    'Five minutes of a quiet 340 Hz sine tone in both channels. Compare with the slightly detuned version using the same comfortable device setting.',
    'This controls the carrier, duration, waveform and digital gain for the phase-drift comparison. Equal channel frequencies are not evidence of a standing wave in the room; that requires specified propagation paths and boundaries.',
    [phase(340, 300)], [SOURCES.waves, SOURCES.standingWaves],
  ),
  recipe(
    'phase-drift', 'Close stereo detuning',
    'Five minutes of 340 Hz on the left and 340.75 Hz on the right. Use stereo headphones to keep the two channels separate.',
    'Only the right-channel frequency changes from Equal-frequency reference. The 0.75 Hz difference advances relative phase by one turn in 4/3 seconds. This preset does not set an initial phase offset or emit a separate 0.75 Hz tone. The trapping paper supplies context for spatial phase control, not evidence for this listening recipe.',
    [phase(340, 300, 0.75)], [SOURCES.waves, SOURCES.trapping],
  ),
  recipe(
    'wavelength-ascent', 'Wavelength comparison · ascending pitch',
    'Four 90-second tones in both channels: 225, 450, 675 and 900 Hz. Compare with the reversed sequence at the same device setting.',
    'At a fixed wave speed, wavelength follows c/f. These successive pitches illustrate the frequency side of that relationship; they do not measure spatial nodes, pressure or force. Equal digital gains do not guarantee equal perceived loudness across pitches.',
    [225, 450, 675, 900].map((hz) => phase(hz, 90)), [SOURCES.waves, SOURCES.standingWaves],
  ),
  recipe(
    'wavelength-descent', 'Wavelength comparison · descending pitch',
    'The same four 90-second tones in reverse order: 900, 675, 450 and 225 Hz. Duration, frequencies, waveform and digital gain match the ascending sequence.',
    'Changing order while retaining equal time at each frequency permits a listening comparison of sequence direction. At a fixed wave speed, lower frequency means longer wavelength. Acoustic trapping additionally depends on a spatial field and the object; tone order alone is not a force model.',
    [900, 675, 450, 225].map((hz) => phase(hz, 90)), [SOURCES.waves, SOURCES.trapping],
  ),
];

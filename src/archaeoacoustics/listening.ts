import { DEFAULT_LOOK, parseLook, type Look } from '@/cymatics/instrument/scenes';
import type { Phase } from '@/engine';
import { frequencyRelations, octaveFrequency, TROPICAL_YEAR_SECONDS } from './models';
import type { TopicId } from './types';
type Pitch = number | 'sa' | 'pa';
type PresetKind = 'Reported value' | 'Study tones' | 'Selected pitch' | 'Sonification' | 'Listening control';

interface ListeningPhase {
  pitch: Pitch;
  seconds: number;
  modulationHz?: number;
}

interface Figure {
  view: 'sand' | 'ink' | 'water';
  pitch: Pitch;
  shape?: Look['shape'];
}

export interface ListeningPreset {
  id: string;
  title: string;
  topic: TopicId;
  relatedTopic?: TopicId;
  kind: PresetKind;
  reference: string;
  description: string;
  phases: readonly ListeningPhase[];
  figure?: Figure;
  source?: { label: string; url: string };
}

export const LISTENING_LIMIT_SEC = 18;
export const SA_DEFAULT_HZ = 147;
export const SA_MIN_HZ = 80;
export const SA_MAX_HZ = 360;

const EARTH_YEAR_TONE_HZ = octaveFrequency(TROPICAL_YEAR_SECONDS, 32);
const SOLAR_TONE_HZ = octaveFrequency(1 / 0.003, 15);
const HARMONIC_REFERENCE = frequencyRelations(100);

export const LISTENING_PRESETS: readonly ListeningPreset[] = [
  {
    id: 'interval-and-harmonic',
    title: 'Perfect fifth and fifth harmonic',
    topic: 'celestial',
    kind: 'Listening control',
    reference: '100 Hz → 150 Hz → 100 Hz → 500 Hz',
    description: 'Hear a selected 100 Hz reference against a 3:2 musical fifth and an integer fifth harmonic. The latter is 5:1 above the reference.',
    phases: [HARMONIC_REFERENCE.rootHz, HARMONIC_REFERENCE.perfectFifthHz, HARMONIC_REFERENCE.rootHz, HARMONIC_REFERENCE.fifthHarmonicHz]
      .map((pitch) => ({ pitch, seconds: 4 })),
    figure: { view: 'sand', pitch: HARMONIC_REFERENCE.perfectFifthHz },
  },
  {
    id: 'solar-p-mode-sonification',
    title: 'Five-minute solar oscillation',
    topic: 'celestial',
    kind: 'Sonification',
    reference: '≈0.003 Hz × 2¹⁵ → 98.304 Hz',
    description: 'An approximate solar oscillation rate maps to an audible sine through 15 octave doublings. The octave count is a listening choice.',
    phases: [{ pitch: SOLAR_TONE_HZ, seconds: 8 }],
    source: { label: 'NASA on solar oscillations', url: 'https://solarscience.msfc.nasa.gov/Helioseismology.shtml' },
    figure: { view: 'sand', pitch: SOLAR_TONE_HZ },
  },
  {
    id: 'newgrange-110',
    title: 'Newgrange chamber reference',
    topic: 'architecture',
    kind: 'Reported value',
    reference: '110 Hz · Newgrange',
    description: 'A pure tone at a chamber resonance reported in the six-site field study. The sound of the chamber also depends on where the source and listener stand.',
    phases: [{ pitch: 110, seconds: 8 }],
    source: { label: 'Jahn, Devereux and Ibison field study', url: 'https://doi.org/10.1121/1.414642' },
    figure: { view: 'sand', pitch: 110 },
  },
  {
    id: 'six-site-95-120',
    title: 'Across the six-site range',
    topic: 'architecture',
    kind: 'Listening control',
    reference: '95 Hz → 110 Hz → 120 Hz',
    description: 'Compare the endpoints of the reported range and an interior pitch with the same synthesized signal and gain setting.',
    phases: [{ pitch: 95, seconds: 5 }, { pitch: 110, seconds: 5 }, { pitch: 120, seconds: 5 }],
    source: { label: 'Jahn, Devereux and Ibison field study', url: 'https://doi.org/10.1121/1.414642' },
  },
  {
    id: 'hypogeum-70-114',
    title: 'Hypogeum Oracle Room references',
    topic: 'architecture',
    kind: 'Reported value',
    reference: '70 Hz → 114 Hz',
    description: 'Hear sine tones at two peaks reported for the Oracle Room in a 2015 study. Site response can change with source and microphone position.',
    phases: [{ pitch: 70, seconds: 5 }, { pitch: 114, seconds: 5 }],
    source: { label: 'Debertolis, Coimbra and Eneix report', url: 'https://arts.units.it/handle/11368/2849406' },
    figure: { view: 'sand', pitch: 114 },
  },
  {
    id: 'hampi-pillar-range',
    title: 'Hampi pillar frequency range',
    topic: 'india',
    kind: 'Selected pitch',
    reference: '243 Hz → 300 Hz → 396 Hz',
    description: 'The endpoints come from the lower range measured for east-side pillar 2. The 300 Hz tone is a selected point within that range.',
    phases: [{ pitch: 243, seconds: 4 }, { pitch: 300, seconds: 4 }, { pitch: 396, seconds: 4 }],
    source: { label: 'Kumar and colleagues, Table I', url: 'https://doi.org/10.1121/1.2945170' },
    figure: { view: 'sand', pitch: 300, shape: 'square' },
  },
  {
    id: 'chant-spectrum',
    title: 'Three peaks from one Vedic chant',
    topic: 'ritual',
    kind: 'Reported value',
    reference: '147.5 Hz → 302 Hz → 440 Hz',
    description: 'These three sine tones correspond to peaks in one chant spectrum reported by Prasad and Rajavel. The synthetic sequence leaves out the performance, text, and room response.',
    phases: [{ pitch: 147.5, seconds: 4 }, { pitch: 302, seconds: 4 }, { pitch: 440, seconds: 4 }],
    source: { label: 'Prasad and Rajavel, Table 3', url: 'https://www.academia.edu/38208102/Acoustics_of_Chants_pdf' },
  },
  {
    id: 'conch-reference',
    title: 'Conch partials',
    topic: 'ritual',
    kind: 'Reported value',
    reference: '327.5 Hz → 655 Hz → 980 Hz',
    description: 'Hear three spectral components from one reported conch measurement in sequence. A blown conch combines partials, breath noise, and changes in pitch.',
    phases: [{ pitch: 327.5, seconds: 4 }, { pitch: 655, seconds: 4 }, { pitch: 980, seconds: 4 }],
    source: { label: 'Prasad and Rajavel, Table 3', url: 'https://www.academia.edu/38208102/Acoustics_of_Chants_pdf' },
    figure: { view: 'sand', pitch: 327.5 },
  },
  {
    id: 'bowl-water-drive',
    title: 'Water-filled bowl drive',
    topic: 'ritual',
    kind: 'Reported value',
    reference: '188 Hz · one water-filled bowl',
    description: 'Hear the drive frequency applied to a water-filled bowl in a published fluid dynamics demonstration. The liquid view translates this pitch into an artistic ripple field.',
    phases: [{ pitch: 188, seconds: 8 }],
    source: { label: 'Terwagne and Bush water-filled bowl demonstration', url: 'https://arxiv.org/abs/1010.3193' },
    figure: { view: 'water', pitch: 188 },
  },
  {
    id: 'cousto-earth-year',
    title: 'Cousto’s Earth-year octave',
    topic: 'ritual',
    kind: 'Sonification',
    reference: '1 tropical year → +32 octaves → ≈136.10 Hz',
    description: 'Play the synthetic tone from Cousto’s modern conversion of a tropical year. The selected Sa in the next comparison can move independently.',
    phases: [{ pitch: EARTH_YEAR_TONE_HZ, seconds: 8 }],
    source: { label: 'Hans Cousto’s tuning fork notes', url: 'https://www.planetware.de/octave/The_CoOc_Tuning.pdf' },
    figure: { view: 'sand', pitch: EARTH_YEAR_TONE_HZ },
  },
  {
    id: 'sa-tonic',
    title: 'Adjustable Sa and Pa',
    topic: 'ritual',
    kind: 'Listening control',
    reference: 'Chosen Sa → 3:2 Pa → Sa',
    description: 'An illustrative just-fifth cycle follows the Sa you select. Indian classical performers choose their own tonic for each rendition.',
    phases: [{ pitch: 'sa', seconds: 4 }, { pitch: 'pa', seconds: 4 }, { pitch: 'sa', seconds: 4 }],
    source: { label: 'CompMusic tonic identification study', url: 'https://compmusic.upf.edu/node/323' },
    figure: { view: 'ink', pitch: 'sa' },
  },
  {
    id: 'cook-tone-series',
    title: 'Five pitches from the EEG pilot',
    topic: 'brainwaves',
    kind: 'Study tones',
    reference: '90 → 100 → 110 → 120 → 130 Hz',
    description: 'Cook and colleagues played these pitches to 30 adults while recording EEG. This short sequence demonstrates the stimulus frequencies. The study used its own listening protocol and EEG measurements.',
    phases: [90, 100, 110, 120, 130].map((pitch) => ({ pitch, seconds: 3 })),
    source: { label: 'Cook and colleagues EEG pilot', url: 'https://www.tandfonline.com/doi/abs/10.2752/175169608783489099' },
  },
  {
    id: 'plain-carrier',
    title: 'Steady 220 Hz carrier',
    topic: 'brainwaves',
    kind: 'Listening control',
    reference: '220 Hz · steady pitch',
    description: 'Hear the same 220 Hz carrier used in the amplitude modulation example, with fixed amplitude.',
    phases: [{ pitch: 220, seconds: 8 }],
  },
  {
    id: 'carrier-10hz',
    title: '220 Hz carrier with 10 Hz modulation',
    topic: 'brainwaves',
    kind: 'Listening control',
    reference: '220 Hz carrier · 10 Hz amplitude modulation',
    description: 'The pitch is the 220 Hz carrier and the amplitude rises and falls ten times per second. Compare it with the steady carrier above. Their perceived loudness can differ.',
    phases: [{ pitch: 220, seconds: 8, modulationHz: 10 }],
  },
  {
    id: 'schumann-mode-sonification',
    title: 'Schumann mode sonification',
    topic: 'brainwaves',
    relatedTopic: 'celestial',
    kind: 'Sonification',
    reference: '≈7.83, 14, 20 Hz × 16 → 125.28, 224, 320 Hz',
    description: 'Three synthetic tones use a four-octave shift of reference values for electromagnetic cavity modes. The playback represents only their frequency spacing.',
    phases: [{ pitch: 7.83 * 16, seconds: 5 }, { pitch: 14 * 16, seconds: 5 }, { pitch: 20 * 16, seconds: 5 }],
    source: { label: 'Reference Schumann mode frequencies', url: 'https://doi.org/10.1029/2006JA011726' },
    figure: { view: 'ink', pitch: 7.83 * 16 },
  },
  {
    id: 'pitch-comparison-432-440-528',
    title: '432, 440 and 528 Hz comparison',
    topic: 'geometry',
    kind: 'Selected pitch',
    reference: '432 Hz → 440 Hz → 528 Hz',
    description: 'These pitches appear in the supplied architectural claims. Here they are three synthetic test tones for comparing pitch or driving the same virtual plate.',
    phases: [{ pitch: 432, seconds: 4 }, { pitch: 440, seconds: 4 }, { pitch: 528, seconds: 4 }],
    figure: { view: 'ink', pitch: 440 },
  },
];

export function listeningPreviewId(preset: ListeningPreset): string {
  return `archaeoacoustics:${preset.id}`;
}

export function validSaHz(value: number): number {
  return Number.isFinite(value) ? Math.min(SA_MAX_HZ, Math.max(SA_MIN_HZ, value)) : SA_DEFAULT_HZ;
}

function pitchHz(pitch: Pitch, saHz: number): number {
  if (pitch === 'sa') return saHz;
  if (pitch === 'pa') return saHz * 1.5;
  return pitch;
}

export function listeningPhases(preset: ListeningPreset, saHz = SA_DEFAULT_HZ): Phase[] {
  const tonic = validSaHz(saHz);
  let remaining = LISTENING_LIMIT_SEC;
  return preset.phases.flatMap(({ pitch, seconds, modulationHz = 0 }) => {
    const carrierHz = pitchHz(pitch, tonic);
    if (!Number.isFinite(carrierHz) || carrierHz < 40 || carrierHz > 2000 ||
      !Number.isFinite(seconds) || seconds <= 0 || remaining <= 0 ||
      !Number.isFinite(modulationHz) || modulationHz < 0 || modulationHz > 20) return [];
    const durationSec = Math.min(seconds, remaining);
    remaining -= durationSec;
    return [{
      durationSec, carrierHz, beatHz: modulationHz,
      mode: modulationHz ? 'monaural' : 'binaural', gainDb: -24,
    }];
  });
}

export function cymaticsRecipe(preset: ListeningPreset, saHz = SA_DEFAULT_HZ): Look | null {
  const figure = preset.figure;
  if (!figure) return null;
  const scene = figure.view === 'ink' ? 'violet' : figure.view === 'water' ? 'liquid' : 'atelier';
  return parseLook({
    ...DEFAULT_LOOK, scene, view: figure.view, shape: figure.shape ?? 'round',
    hz: pitchHz(figure.pitch, validSaHz(saHz)),
  });
}

import type { Preset } from './presets';
import { CLEAN_PRESET_MIX } from './presetMix';

export const PRACTICE_SOURCES = {
  beats: { title: 'López-Caballero & Escera · EEG and binaural beats (2017)', url: 'https://doi.org/10.3389/fnhum.2017.00557' },
  hypnosis: { title: 'Cordi, Schlarb & Rasch · Hypnotic suggestion and sleep (2014)', url: 'https://pubmed.ncbi.nlm.nih.gov/24882909/' },
  networks: { title: 'Jiang et al. · Brain activity during hypnosis (2017)', url: 'https://pubmed.ncbi.nlm.nih.gov/27469596/' },
  dormio: { title: 'Haar Horowitz et al. · Dormio (2020)', url: 'https://doi.org/10.1016/j.concog.2020.102938' },
  creativity: { title: 'Lacaux et al. · Sleep onset and creativity (2021)', url: 'https://doi.org/10.1126/sciadv.abj5866' },
  incubation: { title: 'Haar Horowitz et al. · Dream incubation and creativity (2023)', url: 'https://pubmed.ncbi.nlm.nih.gov/37188795/' },
  acoustic: { title: 'Ngo et al. · Rhythmic acoustic stimulation (2013)', url: 'https://arxiv.org/abs/1407.7999' },
  current: { title: 'Lin et al. · Customized binaural audio pilot (2025)', url: 'https://www.e-jsm.org/journal/view.php?number=410' },
} as const;

export type PracticeGoal = 'unwind' | 'meditate' | 'sleep' | 'dream' | 'hypnosis' | 'focus' | 'comfort';
export const PRACTICE_GOALS: readonly { id: PracticeGoal; title: string; description: string; route: string }[] = [
  { id: 'unwind', title: 'Unwind', description: 'Take a little pressure off the day.', route: '/nature' },
  { id: 'meditate', title: 'Meditate', description: 'Give your attention a place to rest.', route: '/harmonics' },
  { id: 'sleep', title: 'Prepare for sleep', description: 'A quiet beginning to your night.', route: '/dream' },
  { id: 'dream', title: 'Explore dreaming', description: 'Notice imagery and remember it.', route: '/lucid' },
  { id: 'hypnosis', title: 'Self-hypnosis', description: 'Practice attention and gentle suggestion.', route: '/hypnosis' },
  { id: 'focus', title: 'Focus', description: 'Set aside a few undistracted minutes.', route: '/quicklab' },
  { id: 'comfort', title: 'Rest & comfort', description: 'Explore healing traditions as listening.', route: '/healing' },
];

const source = (key: keyof typeof PRACTICE_SOURCES) => `${PRACTICE_SOURCES[key].title}: ${PRACTICE_SOURCES[key].url}`;
const tone = (name: string, minutes: number, carrierHz: number, beatHz = 0, mode: 'monaural' | 'binaural' | 'isochronic' = 'monaural') => ({ name, durationSec: minutes * 60, carrierHz, beatHz, mode, gainDbFs: -24 });
const rain = { ...CLEAN_PRESET_MIX, nature: { on: true, kind: 'rain' as const, db: -26 }, volumeDb: -24 };
const bowls = { ...CLEAN_PRESET_MIX, volumeDb: -24, bowls: [
  { on: true, material: 'himalayan-antique' as const, strike: 'soft' as const, baseHz: 220, db: -24, pan: 0, restrikeSec: 16, lock: false },
  { on: true, material: 'crystal-quartz' as const, strike: 'soft' as const, baseHz: 330, db: -28, pan: 0.2, restrikeSec: 12, lock: false },
] };

/** Original listening designs, not copies of clinical interventions. */
export const PRACTICE_PRESETS: readonly Preset[] = [
  { id: 'practice-soft-landing', title: 'Soft landing', category: 'Relax', grade: 'C',
    purpose: 'Five minutes of a steady 160 Hz tone with rain. Breathe naturally and let the sound stay in the background.',
    rationale: 'An original comfort mix. The tone, rain and five-minute duration are design choices; this particular recipe has not been clinically tested.',
    citations: [source('beats')], spec: { autoShutoff: true, mix: rain, phases: [tone('arrive', 5, 160)] } },
  { id: 'practice-bowl-attention', title: 'Bowl & breath', category: 'Meditate', grade: 'C', art: 'art/bowl-session.jpg',
    purpose: 'Ten minutes of a 110 Hz root and two soft bowls. Return attention to each fading strike.',
    rationale: 'The 220:330 Hz pitches form a 3:2 musical interval. That exact ratio is acoustic arithmetic; a special healing effect from it is not established.',
    citations: ['Goldsby et al. (2017), observational singing-bowl study, doi:10.1177/2156587216668109'],
    spec: { autoShutoff: true, mix: bowls, phases: [tone('listen', 10, 110)] } },
  { id: 'practice-evening-rain', title: 'Evening rain', category: 'Sleep', grade: 'C',
    purpose: 'Fifteen minutes of rain over a steady low tone. Use before sleep if you find it comfortable.',
    rationale: 'A wind-down soundtrack with an automatic stop. Neither the 120 Hz pitch nor this duration establishes a sleep stage or treats insomnia.',
    citations: [source('acoustic')], spec: { autoShutoff: true, mix: rain, phases: [tone('wind down', 15, 120)] } },
  { id: 'practice-suggestion-space', title: 'Suggestion space', category: 'Meditate', grade: 'C',
    purpose: 'Ten minutes of a steady 180 Hz tone and quiet pink noise for a self-read attention exercise. No spoken guidance is included.',
    rationale: 'Hypnosis studies use verbal suggestions and assess individual responsiveness. This optional sound bed does not reproduce those interventions; the sound settings are arbitrary.',
    citations: [source('hypnosis'), source('networks')],
    spec: { autoShutoff: true, mix: { ...CLEAN_PRESET_MIX, volumeDb: -24, noiseOn: true, noiseDb: { pink: -30 } }, phases: [tone('attend', 10, 180)] } },
  { id: 'practice-steady-focus', title: 'One quiet task', category: 'Focus', grade: 'C',
    purpose: 'Ten minutes of a steady 180 Hz tone with a soft brown-noise layer. Choose one small task before you begin.',
    rationale: 'A personal preference experiment. The noise layer is explicitly authored; improved concentration is not established for this recipe.',
    citations: [source('beats')],
    spec: { autoShutoff: true, mix: { ...CLEAN_PRESET_MIX, volumeDb: -24, noiseOn: true, noiseDb: { brown: -28 } }, phases: [tone('one task', 10, 180)] } },
  { id: 'practice-gentle-rhythm', title: 'Gentle rhythm', category: 'Relax', grade: 'C',
    purpose: 'A 180 Hz tone pulsed once every ten seconds. Use it as an optional attention cue; keep breathing comfortable.',
    rationale: 'A 0.1 Hz pulse repeats six times per minute. This is a timing relation, not a prescribed breathing rate or evidence of brain entrainment.',
    citations: [source('beats')], spec: { autoShutoff: true, mix: { ...CLEAN_PRESET_MIX, volumeDb: -24 }, phases: [tone('slow rhythm', 5, 180, 0.1, 'isochronic')] } },
  { id: 'practice-theta-comparison', title: 'Theta listening comparison — experimental tier', category: 'Experimental', grade: 'D',
    purpose: 'Compare a steady tone with a 6 Hz binaural difference, then return to the steady tone. Headphones required.',
    rationale: 'The difference between 180 and 186 Hz is 6 Hz. A hypnotic state from this difference is not established; compare comfort rather than claiming a brain-state change.',
    citations: [source('beats'), source('networks')],
    spec: { autoShutoff: true, mix: { ...CLEAN_PRESET_MIX, volumeDb: -24 }, phases: [tone('steady baseline', 3, 180), tone('6 Hz difference', 4, 180, 6, 'binaural'), tone('steady return', 3, 180)] } },
  { id: 'practice-dream-edge', title: 'Dream edge — experimental tier', category: 'Experimental', grade: 'D', art: 'art/lucid-dream.jpg',
    purpose: 'Twelve minutes of rain and a steady 140 Hz tone for noticing imagery at rest. Write down impressions afterwards.',
    rationale: 'Hypnagogic imagery occurs near sleep onset. This open-loop soundtrack has no sleep sensors or timed verbal cues and is not Dormio or a verified lucid-dream method.',
    citations: [source('dormio'), source('incubation'), source('creativity')], spec: { autoShutoff: true, mix: rain, phases: [tone('notice imagery', 12, 140)] } },
];

export const PRACTICE_PRESET_GOALS: Record<string, readonly PracticeGoal[]> = {
  'practice-soft-landing': ['unwind', 'comfort'], 'practice-bowl-attention': ['meditate', 'comfort'],
  'practice-evening-rain': ['sleep', 'dream'], 'practice-suggestion-space': ['hypnosis', 'meditate'],
  'practice-steady-focus': ['focus'], 'practice-gentle-rhythm': ['unwind', 'meditate'],
  'practice-theta-comparison': ['hypnosis'], 'practice-dream-edge': ['dream'],
};

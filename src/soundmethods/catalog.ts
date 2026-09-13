import type { SoundRecipe } from './model';

export interface MethodSource {
  id: string;
  kind: 'Document' | 'Patent' | 'Study' | 'Tool';
  title: string;
  year: string;
  url: string;
  finding: string;
  limit: string;
}

export const METHOD_SOURCES: readonly MethodSource[] = [
  { id: 'gateway', kind: 'Document', title: 'Gateway assessment · Wayne McDonnell', year: '1983', url: 'https://documents2.theblackvault.com/documents/cia/CIA-RDP96-00788R001700210016-5.pdf', finding: 'An Army assessment of Monroe’s course. It discusses binaural beats, relaxation, imagery, and speculative explanations.', limit: 'The archived report is not a controlled efficacy trial. It does not supply a complete recording or a verified frequency for each Focus level.' },
  { id: 'monroe-1975', kind: 'Patent', title: 'Monroe · US3884218A', year: '1975', url: 'https://patents.google.com/patent/US3884218A/en', finding: 'Describes a repetitive sound whose amplitude follows a signal based on a sleep EEG pattern.', limit: 'Our noise-envelope example uses a chosen sine envelope. It has no recorded EEG input and does not reproduce the full method.' },
  { id: 'monroe-1993', kind: 'Patent', title: 'Monroe · US5213562A', year: '1993', url: 'https://patents.google.com/patent/US5213562A/en', finding: 'Describes binaural carrier pairs, layered signals, and phased pink sound. One example sends 100 Hz to the left ear and 104 Hz to the right.', limit: 'The patent’s claims about changing or transferring mental states are separate from the described signal. A patent does not establish those effects.' },
  { id: 'monroe-1994', kind: 'Patent', title: 'Monroe · US5356368A', year: '1994', url: 'https://patents.google.com/patent/US5356368A/en', finding: 'Its Septon example uses left tones at 200, 204, and 208 Hz and right tones at 204, 208, and 212 Hz. It also describes a slow noise-filter sweep.', limit: 'Several frequency differences overlap. The name Septon does not establish seven independent percepts or seven brain responses.' },
  { id: 'sam', kind: 'Patent', title: 'Atwater and Turner · SAM application', year: '2013', url: 'https://patents.google.com/patent/US20130010967A1/en', finding: 'This patent application describes stereo phase modulation with opposite signs in the two channels. This can produce a moving or changing spatial sound.', limit: 'Our example uses chosen settings in a disclosed equation. It is not a copy of a commercial SAM or Monroe Sound Science recording.' },
  { id: 'hull', kind: 'Patent', title: 'Hull · US2304095A', year: '1942', url: 'https://patents.google.com/patent/US2304095A/en', finding: 'Describes slowly varying sound pitch and amplitude, with proposed changes in breathing and heart rate.', limit: 'An ordinary sound player has no breathing or heart sensor. A slow audio swell does not track those signals.' },
  { id: 'flanagan', kind: 'Patent', title: 'Flanagan · US3393279A', year: '1968', url: 'https://patents.google.com/patent/US3393279A/en', finding: 'Describes audio-modulated electrical apparatus coupled to a person through electrodes.', limit: 'Historical context only. A headphone WAV cannot reproduce electrical or RF coupling, so this page has no Neurophone replica.' },
  { id: 'nagle', kind: 'Patent', title: 'Nagle · US4191175A', year: '1980', url: 'https://patents.google.com/patent/US4191175A/en', finding: 'Describes filtered pulse bursts around 7 Hz, with a tunable band-pass stage and spectral emphasis near 2.6 kHz.', limit: 'Our 7 Hz noise example shares a repetition rate only. It does not implement this circuit or establish its claimed hypnotic and anesthetic effects.' },
  { id: 'mss', kind: 'Document', title: 'Monroe Sound Science · official description', year: 'Checked 2026', url: 'https://www.monroeinstitute.org/pages/monroe-sound-science', finding: 'The Institute lists binaural and monaural beats, isochronic tones, frequency modulation, phase modulation, and spatial angle modulation.', limit: 'A first-party description of a proprietary system. It does not provide all mixes, timings, or independent evidence for the advertised outcomes.' },
  { id: 'ingendoh', kind: 'Study', title: 'Ingendoh, Posny and Heine · EEG review', year: '2023', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023', finding: 'Across 14 studies, five supported the proposed EEG entrainment effect, eight did not, and one was mixed.', limit: 'Methods and EEG analyses varied. The review does not support a dependable conversion from audio beat rate to a mental state.' },
  { id: 'orozco', kind: 'Study', title: 'Orozco Perez and colleagues · binaural vs monaural', year: '2020', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7082494/', finding: 'Both sound constructions produced measurable auditory responses. Connectivity differed; mood did not change in this experiment.', limit: 'An auditory response and a mood benefit are separate results. This experiment does not test Gateway’s full guided course.' },
  { id: 'lopez', kind: 'Study', title: 'López-Caballero and Escera · EEG and arousal', year: '2017', url: 'https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2017.00557/full', finding: 'Fourteen participants heard several beat rates. The study did not find corresponding changes in EEG power, heart rate, or skin conductance.', limit: 'Small sample and short exposures. A null result under these conditions does not test every possible sound program.' },
  { id: 'engelbregt', kind: 'Study', title: 'Engelbregt and colleagues · 40 Hz and attention', year: '2021', url: 'https://link.springer.com/article/10.1007/s00221-021-06155-z', finding: 'Twenty-five students completed an attention task during binaural, monaural, and noise conditions. Error patterns differed, without a consistent 40–45 Hz EEG-power increase.', limit: 'A task difference does not demonstrate the proposed EEG mechanism or establish a general attention aid.' },
  { id: 'soderlund', kind: 'Study', title: 'Söderlund and colleagues · noise and recall', year: '2010', url: 'https://link.springer.com/article/10.1186/1744-9081-6-55', finding: 'In 51 pupils, white noise helped recall in an inattentive subgroup and reduced it in an attentive subgroup.', limit: 'Two noise conditions cannot identify an optimal level. This quiet mixer is not a replication of the study’s acoustic setup or a treatment.' },
  { id: 'kanzler', kind: 'Study', title: 'Kanzler and colleagues · combined sound study', year: '2023', url: 'https://www.explorationpub.com/Journals/ent/Article/100464', finding: 'A small study compared binaural, isochronic, combined sounds, and noise over 21 days, with EEG and questionnaire outcomes.', limit: 'The authors used a 0.10 significance threshold; participant accounting and varying rates complicate interpretation. Treat its positive findings as exploratory.' },
  { id: 'melnichuk', kind: 'Study', title: 'Melnichuk and colleagues · stimulus parameters', year: '2025', url: 'https://pubmed.ncbi.nlm.nih.gov/39910150/', finding: 'The indexed abstract describes 80 undergraduates and 16 conditions varying beat band, carrier, onset timing, and masking noise.', limit: 'Full-text retrieval was incomplete in this review. This entry records the study design without claiming a detailed result.' },
  { id: 'sbagen', kind: 'Tool', title: 'SBaGen', year: 'GPL-2.0', url: 'https://uazu.net/sbagen/', finding: 'Text schedules, simultaneous tone pairs, noise, and WAV output. The author describes the original project as unmaintained.', limit: 'Its Focus files trace to anonymous USENET measurements with missing amplitudes. They are not verified Monroe master recipes. No code or recordings were imported.' },
  { id: 'sbagenx', kind: 'Tool', title: 'SBaGenX', year: 'GPL-2.0', url: 'https://github.com/lm7137/SBaGenX', finding: 'A continuation with binaural, monaural, and isochronic modes, noise modulation, curve files, and envelope plots.', limit: 'License and project documentation were checked; the executable was not tested here. OpenSync uses independently written synthesis.' },
  { id: 'moodist', kind: 'Tool', title: 'Moodist', year: 'MIT code', url: 'https://github.com/remvze/moodist', finding: 'An ambient sound mixer with saved mixes, timers, fades, and beat generators.', limit: 'Its code license is separate from third-party sound licenses. No bundled audio was copied into OpenSync.' },
  { id: 'sylvan', kind: 'Tool', title: 'Kayvan Sylvan · Binaural Generator', year: 'MIT', url: 'https://github.com/ksylvan/binaural-generator', finding: 'YAML schedules, stable and transition steps, configurable carriers, noise, fades, and WAV/FLAC export.', limit: 'A useful example of inspectable sound recipes. Names such as focus or sleep do not themselves establish an effect.' },
  { id: 'gnaural', kind: 'Tool', title: 'Gnaural', year: 'Project documentation', url: 'https://gnaural.sourceforge.net/', finding: 'A programmable binaural generator with schedule graphs and XML sound descriptions.', limit: 'The project documentation was checked. An exact first-party license file was not verified in this review, and no code was imported.' },
];

export interface SoundMethod {
  id: string;
  title: string;
  family: 'Monroe / Gateway' | 'Modulation' | 'Comparison';
  description: string;
  basis: string;
  boundary: string;
  sourceIds: string[];
  headphones: boolean;
  recipe: SoundRecipe;
}

const recipe = (patch: Partial<SoundRecipe>): SoundRecipe => ({
  kind: 'pairs', pairs: [{ leftHz: 100, rightHz: 104, weight: 1 }], carrierHz: 200,
  rateHz: 4, depth: 1, phaseDepthRad: 1, noiseMix: 0, durationSec: 20, gainDb: -24,
  seed: 2026, ...patch,
});

export const SOUND_METHODS: readonly SoundMethod[] = [
  { id: 'monroe-pair', title: 'Monroe’s 4 Hz pair', family: 'Monroe / Gateway', description: '100 Hz in the left ear. 104 Hz in the right. Listen for a slow beat between them.', basis: 'Frequencies from the 1993 patent example.', boundary: 'The 4 Hz difference describes the sound. It does not measure or set your EEG.', sourceIds: ['monroe-1993'], headphones: true, recipe: recipe({}) },
  { id: 'gateway-example', title: 'Gateway’s 10 Hz example', family: 'Monroe / Gateway', description: 'Two steady tones, 10 Hz apart, sent to separate ears.', basis: 'The report explains a 10 Hz difference. The 200/210 Hz carrier pair is our choice.', boundary: 'A demonstration of the report’s explanation. Gateway’s voice guidance, music, and complete sequence are not reproduced.', sourceIds: ['gateway'], headphones: true, recipe: recipe({ pairs: [{ leftHz: 200, rightHz: 210, weight: 1 }], rateHz: 10 }) },
  { id: 'septon', title: 'Three-pair Septon example', family: 'Monroe / Gateway', description: 'Three tones in each ear, spaced 4 Hz apart. The combined sound has several overlapping beats.', basis: 'Channel frequencies from the 1994 patent table.', boundary: 'Includes the table’s tones, without its EEG-derived signals, voice, or background recording.', sourceIds: ['monroe-1994'], headphones: true, recipe: recipe({ pairs: [{ leftHz: 200, rightHz: 204, weight: 1 }, { leftHz: 204, rightHz: 208, weight: 1 }, { leftHz: 208, rightHz: 212, weight: 1 }] }) },
  { id: 'phase-motion', title: 'Opposite stereo phase', family: 'Modulation', description: 'The phase offset shifts in opposite directions in each ear. One cycle takes eight seconds.', basis: 'Public stereo phase equation; 200 Hz, 0.125 Hz motion, and 1 radian depth are our choices.', boundary: 'Phase modulation differs from ordinary left/right volume panning. Perceived motion varies with listening setup.', sourceIds: ['sam'], headphones: true, recipe: recipe({ kind: 'phase-mod', pairs: [], rateHz: .125 }) },
  { id: 'phased-noise', title: 'Sweeping filtered noise', family: 'Monroe / Gateway', description: 'Soft, low-weighted noise passes through a slowly changing delay filter in each ear.', basis: 'Inspired by the phased-noise description. We choose a 0.5–5 ms delay and 0.125 Hz sweep.', boundary: 'The generated noise is a pink-like approximation. Its spectrum and filter do not reproduce a Monroe recording.', sourceIds: ['monroe-1993', 'monroe-1994'], headphones: true, recipe: recipe({ kind: 'noise-comb', pairs: [], rateHz: .125, depth: .7 }) },
  { id: 'noise-pulse', title: 'Noise with a 7 Hz envelope', family: 'Modulation', description: 'The same noise rises and falls in volume seven times each second in both ears.', basis: 'Original amplitude-modulation example related to the 1975 sound-envelope method.', boundary: 'The envelope is a sine wave chosen for this demo, not a sleep EEG recording.', sourceIds: ['monroe-1975'], headphones: false, recipe: recipe({ kind: 'noise-am', pairs: [], rateHz: 7 }) },
  { id: 'monaural-pair', title: 'The 4 Hz pair mixed together', family: 'Comparison', description: '100 and 104 Hz are mixed into both ears. The slow beat is now present in the audio signal itself.', basis: 'Comparison for the split-ear 100/104 Hz example.', boundary: 'Both channels are identical. Equal peak ceilings do not guarantee equal perceived loudness between methods.', sourceIds: ['monroe-1993'], headphones: false, recipe: recipe({ pairs: [{ leftHz: 100, rightHz: 100, weight: 1 }, { leftHz: 104, rightHz: 104, weight: 1 }] }) },
  { id: 'am-tone', title: 'A tone with a 4 Hz envelope', family: 'Modulation', description: 'A 200 Hz tone gently pulses four times each second in both ears.', basis: 'Original sine-envelope comparison. Change the pulse rate and depth below.', boundary: 'Volume modulation is directly present in the signal. A larger pulse is not evidence of a stronger mental effect.', sourceIds: ['sam'], headphones: false, recipe: recipe({ kind: 'am', pairs: [] }) },
  { id: 'steady-control', title: 'Steady tone comparison', family: 'Comparison', description: 'The same 200 Hz tone in both ears, with no beat or modulation.', basis: 'Original comparison sound.', boundary: 'This is a labeled listening comparison, not a blinded trial or a matched-loudness control.', sourceIds: ['sam'], headphones: false, recipe: recipe({ pairs: [{ leftHz: 200, rightHz: 200, weight: 1 }], depth: 0 }) },
];

export function sourcesForMethod(method: SoundMethod): MethodSource[] {
  return method.sourceIds.map((id) => METHOD_SOURCES.find((source) => source.id === id)!).filter(Boolean);
}

export function recipeFile(recipeValue: SoundRecipe, methodId: string): Uint8Array {
  return new TextEncoder().encode(JSON.stringify({ format: 'opensync-sound-method', version: 1, methodId, sampleRate: 48000, recipe: recipeValue }, null, 2));
}

export function signalSummary(value: SoundRecipe): string {
  if (value.kind === 'pairs') return `Left: ${value.pairs.map((p) => p.leftHz).join(' + ')} Hz. Right: ${value.pairs.map((p) => p.rightHz).join(' + ')} Hz.`;
  if (value.kind === 'phase-mod') return `${value.carrierHz} Hz carrier. Opposite phase offsets: ${value.phaseDepthRad.toFixed(2)} radians at ${value.rateHz} Hz.`;
  if (value.kind === 'noise-comb') return `Generated noise; 0.5–5 ms delay sweep at ${value.rateHz} Hz. Depth: ${Math.round(value.depth * 100)}%.`;
  if (value.kind === 'noise-am') return `Generated noise; ${value.rateHz} Hz volume envelope. Depth: ${Math.round(value.depth * 100)}%.`;
  return `${value.carrierHz} Hz tone; ${value.rateHz} Hz ${value.kind === 'pan' ? 'left/right motion' : 'volume envelope'}. Depth: ${Math.round(value.depth * 100)}%.`;
}

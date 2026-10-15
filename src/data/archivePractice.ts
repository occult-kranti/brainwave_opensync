import type { Preset } from './presets';
import type { PracticeGoal } from './listeningPractice';
import { CLEAN_PRESET_MIX } from './presetMix';

export type ArchiveGroup = 'Government archives' | 'Russia & China' | 'Books & esoteric traditions';
export interface ArchiveSource {
  id: string; group: ArchiveGroup; title: string; origin: string; kind: string; access: string;
  finding: string; limit: string; url: string; alternate?: string; preset?: string;
}
/** Review date: 2026-10-15. Archival custody, authorship, funding and evidence are separate fields. */
export const ARCHIVE_SOURCES: readonly ArchiveSource[] = [
  { id: 'gateway', group: 'Government archives', title: 'Analysis and Assessment of Gateway Process', origin: 'US Army · Wayne M. McDonnell · 1983', kind: 'Military assessment held in the CIA archive', access: 'Transcript reviewed; CIA PDF redirected to archive homepage',
    finding: 'The report discusses Hemi-Sync, imagery and a proposed account of altered experience. It combines descriptions of practice with speculative physical explanations.',
    limit: 'An assessment is not a controlled efficacy trial. Neither a CIA archive stamp nor the report’s equations establishes remote viewing or a validated brain-state recipe.',
    url: 'https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf', alternate: 'https://en.wikisource.org/wiki/Analysis_and_Assessment_of_Gateway_Process', preset: 'archive-gateway-inspired' },
  { id: 'soviet-assessment', group: 'Government archives', title: 'Soviet and Czechoslovakian parapsychology', origin: 'US intelligence archive · reporting about the USSR and Czechoslovakia', kind: 'Historical intelligence report', access: 'Indexed record only; full archive PDF unavailable in this review',
    finding: 'The archive records US interest in reported parapsychology research in those countries.',
    limit: 'This is not an original Russian government endorsement or a verified sound protocol. No preset is attributed to uninspected methods.', url: 'https://www.cia.gov/readingroom/docs/CIA-RDP96-00792R000600350001-3.pdf' },
  { id: 'qigong-archive', group: 'Government archives', title: 'Yan Xin Qigong and Contemporary Sciences', origin: 'Chinese material held in a US intelligence archive', kind: 'Archived report about qigong claims', access: 'Indexed record only; full archive PDF unavailable in this review',
    finding: 'A historical research lead on claims surrounding qigong and unusual capabilities.',
    limit: 'Custody in a government archive does not verify the reported capabilities. The original Chinese government’s endorsement and a reproducible audio dose are not established here.', url: 'https://www.cia.gov/readingroom/docs/CIA-RDP96-00792R000300430003-5.pdf' },
  { id: 'lida', group: 'Russia & China', title: 'LIDA-era multisensory apparatus', origin: 'Soviet inventors · US patent 3,773,049 · 1973', kind: 'Primary patent disclosure', access: 'Full patent text reviewed',
    finding: 'The apparatus combines heat, light, sound and VHF electromagnetic radiation. It is a physical multisensory device, not just an audio file.',
    limit: 'A patent documents a proposed invention, not clinical proof. Our two-pulse-per-second audio example omits the other modalities and does not reproduce the apparatus or its proposed treatment.', url: 'https://patents.google.com/patent/US3773049A/en', preset: 'archive-pulse-study' },
  { id: 'russia-2026', group: 'Russia & China', title: 'Alpha EEG/EMG neurofeedback with binaural beats', origin: 'Russian-led international team · Federal Research Center, Novosibirsk · 2026', kind: 'Randomized placebo-controlled crossover study', access: 'Author-uploaded full text reviewed; publisher access unavailable',
    finding: 'In 22 healthy adults, personalized EEG-derived stimulation and neurofeedback separately improved some outcomes; combining them reduced several training measures relative to neurofeedback alone.',
    limit: 'Small sample and single-session limits matter. Specific government funding was not verified. Our fixed 10 Hz comparison is not their individualized 400 Hz-carrier stimulus or EEG feedback.', url: 'https://doi.org/10.1016/j.ijpsycho.2026.113337', alternate: 'https://www.researchgate.net/publication/400283225_Alpha-EEGEMG_neurofeedback_combined_with_binaural_beats_stimulation_A_randomized_placebo-controlled_within-subject_cross_over_study', preset: 'archive-alpha-comparison' },
  { id: 'china-2026', group: 'Russia & China', title: '40 Hz auditory stimulation during surgery', origin: 'Soochow University-led team, China · 16 April 2026', kind: 'Government-funded randomized trial protocol', access: 'Full protocol and funding statement reviewed',
    finding: 'The protocol proposes testing postoperative sleep outcomes after intraoperative stimulation. Funding includes NSFC 82471281 and Jiangsu Key R&D BE2023709.',
    limit: 'A protocol is a plan, not a positive result. Our short audible modulation example is not the trial stimulus, a surgical intervention, or a treatment for sleep problems.', url: 'https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2026.1813371/full', preset: 'archive-gamma-texture' },
  { id: 'six-sounds', group: 'Russia & China', title: '六字诀 · Liuzijue, the six-sound practice', origin: 'General Administration of Sport of China · Health Qigong Management Center · 2018', kind: 'Official traditional-practice instruction', access: 'Chinese original reviewed; English summary is our translation',
    finding: 'The instruction describes six breath/vocal forms: 嘘、呵、呼、呬、吹、嘻, with attention to articulation and comfortable practice.',
    limit: 'Traditional organ and qi explanations are not calibrated acoustic mechanisms. The source supplies no universal organ-to-hertz table. Our six timed sections contain no vocal instruction or organ frequencies.', url: 'https://www.sport.gov.cn/qgzx/n5407/c878295/content.html', preset: 'archive-six-pauses' },
  { id: 'sufi', group: 'Books & esoteric traditions', title: 'The Mysticism of Sound / The Sufi Message, volume II', origin: 'Hazrat Inayat Khan · collected teachings', kind: 'Primary spiritual text', access: 'Full compilation available; opening sound chapters reviewed',
    finding: 'Sound, music and vibration are discussed as spiritual experience and metaphor.',
    limit: 'A spiritual account does not supply a tested therapeutic frequency table. The 110:220:330 Hz pitches below are our musical choice, not a prescribed Sufi dose.', url: 'https://sufiorder.toronto.on.ca/downloads/message_volumes/volume_2.pdf', preset: 'archive-harmonic-contemplation' },
  { id: 'kybalion', group: 'Books & esoteric traditions', title: 'The Kybalion', origin: '“Three Initiates” · 1908 · Project Gutenberg edition', kind: 'Primary modern esoteric book', access: 'Full text reviewed, especially vibration and rhythm sections',
    finding: 'The book presents principles of vibration and rhythm within a metaphysical system.',
    limit: 'These are philosophical assertions, not experimental neuroscience. The seven steps below are a new musical composition, not recovered ancient or secret frequencies.', url: 'https://www.gutenberg.org/cache/epub/14209/pg14209-images.html', preset: 'archive-seven-intervals' },
];

const phase = (name: string, minutes: number, carrierHz: number, beatHz = 0, mode: 'monaural' | 'binaural' | 'isochronic' = 'monaural') => ({ name, durationSec: minutes * 60, carrierHz, beatHz, mode, gainDbFs: -24 });
const make = (id: string, title: string, purpose: string, rationale: string, phases: Preset['spec']['phases'], mix = { ...CLEAN_PRESET_MIX, volumeDb: -24 }): Preset => ({
  id, title: `${title} — experimental tier`, category: 'Experimental', grade: 'D', purpose, rationale,
  citations: ARCHIVE_SOURCES.filter((s) => s.preset === id).map((s) => `${s.title}: ${s.url}`),
  spec: { autoShutoff: true, phases, mix },
});

/** Entirely original audio; no proprietary recordings, hidden messages or clinical replicas. */
export const ARCHIVE_PRESETS: readonly Preset[] = [
  make('archive-gateway-inspired', 'Gateway-inspired descent', 'Fifteen minutes of a 180 Hz carrier with successive 8, 6 and 4 Hz binaural differences. Use stereo headphones.', 'An original sequence prompted by a historical report. These three rates and durations are chosen here; they are not verified Gateway Focus levels or a recreation of Hemi-Sync.', [phase('8 Hz difference', 5, 180, 8, 'binaural'), phase('6 Hz difference', 5, 180, 6, 'binaural'), phase('4 Hz difference', 5, 180, 4, 'binaural')]),
  make('archive-pulse-study', 'Two pulses', 'Five minutes of a 180 Hz tone pulsed twice per second. Explore the audible rhythm at low volume.', 'A deliberately simplified audio illustration. The 2 Hz rate is a design choice; heat, light, electromagnetic stimulation and clinical device claims are not reproduced.', [phase('two pulses per second', 5, 180, 2, 'isochronic')]),
  make('archive-alpha-comparison', 'Alpha listening comparison', 'Compare three minutes of a steady tone, four minutes of a 10 Hz binaural difference, and a three-minute return. Headphones required.', 'A fixed-rate personal listening comparison. It contains no EEG/EMG measurement or biofeedback and does not replicate the individualized 2026 Russian study methods.', [phase('steady baseline', 3, 180), phase('10 Hz difference', 4, 180, 10, 'binaural'), phase('steady return', 3, 180)]),
  make('archive-gamma-texture', 'Forty-cycle texture', 'Five minutes of a 200 Hz tone with 40 pulses per second. Listen to the texture without adding flashing visuals.', '40 Hz names the amplitude-envelope rate, not a treatment or a measured brain rhythm. This short demonstration is not the Chinese surgical-trial stimulus; that publication is a protocol.', [phase('40 Hz envelope', 5, 200, 40, 'isochronic')]),
  make('archive-six-pauses', 'Six quiet pauses', 'Six one-minute sections over the same steady 196 Hz tone. Breathe naturally; each section is simply a place to pause.', 'A structural reflection on the six-sound tradition, not a vocal lesson. The pitch and timing are arbitrary and do not map organs, qi or syllables to hertz.', ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'].map((name) => phase(`${name} pause`, 1, 196))),
  make('archive-harmonic-contemplation', 'Harmonic contemplation', 'Ten minutes of a 110 Hz root with softly recurring 220 and 330 Hz bowls. Listen to each sound fade.', 'An original listening companion to a spiritual text. The 1:2:3 harmonic relation is mathematical; a particular spiritual or healing outcome is not established.', [phase('listen and return', 10, 110)], { ...CLEAN_PRESET_MIX, volumeDb: -24, bowls: [{ on: true, material: 'himalayan-antique', strike: 'soft', baseHz: 220, db: -27, pan: 0, restrikeSec: 15, lock: false }, { on: true, material: 'crystal-quartz', strike: 'soft', baseHz: 330, db: -30, pan: 0, restrikeSec: 20, lock: false }] }),
  make('archive-seven-intervals', 'Seven intervals', 'A seven-minute pitch journey: 110 Hz multiplied by 1, 9/8, 5/4, 4/3, 3/2, 5/3 and 2. One quiet minute at each pitch.', 'A new composition inspired by philosophical rhythm and vibration. Ratios define musical intervals; no historical frequency prescription, planetary correspondence or therapeutic effect is implied.', [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 2].map((ratio, i) => phase(`interval ${i + 1}`, 1, 110 * ratio))),
];

export const ARCHIVE_PRESET_GOALS: Record<string, readonly PracticeGoal[]> = {
  'archive-gateway-inspired': ['hypnosis', 'dream'], 'archive-pulse-study': ['meditate'],
  'archive-alpha-comparison': ['meditate', 'focus'], 'archive-gamma-texture': ['focus'],
  'archive-six-pauses': ['meditate', 'unwind'], 'archive-harmonic-contemplation': ['meditate', 'comfort'],
  'archive-seven-intervals': ['meditate'],
};

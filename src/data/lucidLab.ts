/**
 * Lucid Audio Lab — research-grade data for the dedicated lucid dreaming page.
 *
 * Curated under the repo's claim discipline (src/docs/vocabulary.ts) and the
 * lucid-dreaming evidence rules used by src/dream/protocols.ts:
 *  - techniques "support the practice of" lucid dreaming; nothing here is an
 *    on/off switch for lucidity;
 *  - the validated audio route is cue reactivation (TLR): a sound PAIRED with
 *    a practiced mindset before sleep, replayed quietly during REM;
 *  - octave-portrait tones carry dual grades: A for the arithmetic, D for any
 *    therapeutic meaning (an octave of an orbital period or a photon frequency
 *    is a representational device, not a shared physics);
 *  - government-program entries grade the DOCUMENTED RECORD and the CAPABILITY
 *    CLAIMS separately; a declassified assessment is not an endorsement.
 *
 * Every entry carries its timing/duration window and its citation.
 */

import type { Grade } from './frequencies';
import type { Preset } from './presets';
import { CLEAN_PRESET_MIX } from './presetMix';

/** Preset as authored here; presets.ts attaches H.870 dose metadata. */
type PresetSpec = Omit<Preset, 'dose'>;

// ---------------------------------------------------------------------------
// 1. Audio & frequency research on lucid dreaming — the evidence table
// ---------------------------------------------------------------------------

export interface LucidStudy {
  id: string;
  name: string;
  /** Signal + delivery setup, honestly specified. */
  setup: string;
  /** Timing / duration window used in the protocol. */
  timing: string;
  /** Outcome with the numbers the paper actually reports. */
  outcome: string;
  grade: Grade;
  gradeMinus?: boolean;
  /** Caveat or why it matters. */
  note: string;
  source: string;
}

export const LUCID_AUDIO_STUDIES: readonly LucidStudy[] = [
  {
    id: 'study-carr-2023-tlr',
    name: 'Targeted Lucidity Reactivation (TLR), laboratory naps',
    setup:
      'Ascending pure-tone cue (400/600/800 Hz, ~650 ms, ~40–45 dB at the ear) paired before sleep with a ' +
      'critical-awareness exercise, then replayed during polysomnography-confirmed REM.',
    timing: 'Pre-sleep pairing 15–25 min (up to ~15 cue presentations); cues replayed in REM during 90-min morning naps.',
    outcome: '50% signal-verified lucid dreams in cued naps vs 17% uncued (N=38). The cue→mindset association is the active ingredient.',
    grade: 'A',
    gradeMinus: true,
    note: 'The best-validated audio protocol. Cues without pre-sleep pairing are much weaker — association, not frequency, does the work.',
    source: 'Carr, Konkoly, Mallett et al. 2023, Psychology of Consciousness 10(4):413–433',
  },
  {
    id: 'study-mallett-2024-app',
    name: 'Smartphone TLR at home (no EEG)',
    setup:
      'App pairs a chosen sound with a lucid mindset exercise before sleep, then replays the sound during sleep ' +
      'from ~6 h after onset. Blinded control nights used a different sound or none.',
    timing: 'Pairing 15–25 min before bed; replay window ~6 h after sleep onset with jittered gaps.',
    outcome: 'Lucid-dream frequency rose from 0.74 to 2.11 per week vs the prior week, and beat blinded control nights.',
    grade: 'B',
    note: 'First controlled home translation of TLR. REM targeting without EEG is the last-third-of-night heuristic.',
    source: 'Mallett, Konkoly, Paller et al. 2024, Consciousness and Cognition (PMC11542932)',
  },
  {
    id: 'study-konkoly-2021-interactive',
    name: 'Interactive dreaming — two-way communication in REM',
    setup:
      'Spoken questions and tone cues presented during REM; trained lucid dreamers answered with pre-agreed eye-movement ' +
      'and facial-muscle signals across four laboratories.',
    timing: 'Cues delivered inside polysomnography-verified REM episodes; responses measured in seconds, in real time.',
    outcome: 'Signal-verified answers from ongoing lucid dreams (158 attempts across 57 sessions; correct responses in 18.4% of clear-signal trials).',
    grade: 'A',
    gradeMinus: true,
    note: 'Proof that sound enters the dream and can be processed there — the foundation under every cueing protocol.',
    source: 'Konkoly et al. 2021, Current Biology 31(7):1417–1427, DOI 10.1016/j.cub.2021.01.026',
  },
  {
    id: 'study-wolk-2024-multicentre',
    name: 'SSILD + TLR multi-centre wearable-EEG study',
    setup:
      'Senses-initiated lucid-dream training paired with multimodal cues (visual, auditory, tactile), cues replayed in REM ' +
      'on one of two morning naps; 2-channel EEG headband + open-source Dreamento toolbox.',
    timing: 'Morning naps near the REM-propensity peak; pre-sleep training immediately before.',
    outcome: 'Signal-verified lucid dreams in 65% (NL) and 45% (IT) of participants; REM cueing raised verified lucidity at the IT site (35% vs 15% sham) and lengthened episodes ~2.5× at NL.',
    grade: 'B',
    note: 'Preprint (bioRxiv 2024); the largest verified induction sample to date. Site differences are an honest reminder that protocols travel imperfectly.',
    source: 'Wolk, Dresler et al. 2024, bioRxiv 10.1101/2024.06.21.600133 (multi-centre, N=60 planned)',
  },
  {
    id: 'study-peters-2024-sounds',
    name: 'Sounds of Lucidity — verbal cue + reality checks',
    setup:
      'The spoken phrase "You are dreaming" associated with reality-check practice in a pre-sleep learning phase, ' +
      'then presented during REM sleep.',
    timing: 'Pre-sleep learning phase each evening; cue presented in REM during the laboratory night.',
    outcome: '54.5% reported a lucid dream; 27.3% met strict criteria; cue incorporation into dream reports 38.9%.',
    grade: 'B',
    note: 'Verbal cues work through the same pairing mechanism as tones. Content of the cue matters less than the practiced association.',
    source: 'Peters, Erlacher, Rühl & Schädlich 2024, Dreaming 35(S):S41–S57, DOI 10.1037/drm0000282',
  },
  {
    id: 'study-erlacher-2020-ring',
    name: 'Ring, ring, ring… Are you dreaming? (acoustic cue + reflection)',
    setup:
      'A pager-style beep paired with Tholey-style critical reflection across a six-day training, then the same beep ' +
      'presented in REM in the sleep lab.',
    timing: 'Six-day training with cues at intervals through the day; single laboratory night with REM cueing.',
    outcome: '41.7% self-rated lucid dreams; 16.7% signal-verified.',
    grade: 'B',
    note: 'Shows a long conditioning runway works, but a later strict replication landed much lower — training quality is the swing variable.',
    source: 'Erlacher, Schmid, Schuler & Rasch 2020, Int. J. Dream Research 13(2):267–273, DOI 10.11588/ijodr.2020.2.74880',
  },
  {
    id: 'study-ijodr-2026-replication',
    name: 'Auditory-triggered reality checks — strict 2026 replication',
    setup:
      'Two-day reality-check training with pedometer beeps, then the same beeps during REM on one laboratory night.',
    timing: 'Two-day training; one lab night; cues in scored REM phases.',
    outcome: '36% of dream reports incorporated the beep, but only 1 of 15 participants (6.7%) met strict lucid-dream criteria.',
    grade: 'B',
    note: 'The sobering counterweight: incorporation is common, lucidity conversion is not. Brief or autopilot reality checks do not transfer.',
    source: 'Int. J. Dream Research 19(1) 2026, DOI 10.11588/ijodr.2026.1.115408',
  },
  {
    id: 'study-voss-2014-tacs',
    name: 'Frontal 25/40 Hz tACS during REM (electrical, not audio)',
    setup:
      'Transcranial alternating current over fronto-temporal cortex at 2–100 Hz during REM; 25 Hz and especially 40 Hz ' +
      'raised dream self-awareness ratings.',
    timing: 'Stimulation after ~3 a.m., after 2–3 min of uninterrupted REM, for 30 s; awakening 5–10 s later for reports.',
    outcome: 'Higher self-awareness ratings at 25/40 Hz — but no eye-signal verification, a contested lucidity criterion, and a null same-frequency replication.',
    grade: 'D',
    note: 'Electrical stimulation, not sound; excluded from this app regardless. Any "40 Hz audio for lucidity" product leans on a claim that did not replicate even electrically.',
    source: 'Voss et al. 2014, Nat Neurosci 17:810–812 (DOI 10.1038/nn.3719); null replication: Blanchette-Carrière et al. 2020, Consciousness and Cognition',
  },
  {
    id: 'study-laberge-2018-galantamine',
    name: 'Galantamine timing (education only — we never dose)',
    setup:
      'Double-blind crossover (N=121): galantamine 0/4/8 mg taken during a 30–40 min wake window after ~4.5 h of sleep, ' +
      'then MILD on return to bed. Drug peak (~1 h) was timed into the next REM period.',
    timing: 'Wake ~4.5 h after lights out; 30–40 min out of bed; MILD on return to sleep.',
    outcome: 'Lucid dreams in 14% (placebo), 27% (4 mg), 42% (8 mg) of nights — the strongest published induction rates, pharmacologically driven.',
    grade: 'A',
    gradeMinus: true,
    note: 'Grade A for efficacy, excluded from this app as a prescription acetylcholinesterase inhibitor. Its TIMING map (4.5 h wake point, 30–40 min window) is free and reusable — that is what our WBTB scheduler borrows.',
    source: 'LaBerge, LaMarca & Baird 2018, PLOS ONE 13(8):e0201246',
  },
  {
    id: 'study-haar-horowitz-2020-dormio',
    name: 'Dormio — targeted dream incubation at sleep onset (N1)',
    setup:
      'Short thematic audio cue played as the user crosses into N1 hypnagogia (tracked by a hand-worn sensor); ' +
      'serial repetitions with brief dream reports form Targeted Dream Incubation.',
    timing: 'Cue at sleep onset (first minutes of the night); N1 window is typically 1–7 min per entry.',
    outcome: 'Steered early dream content toward the cue theme; post-sleep creative performance on the theme improved (2023 follow-up).',
    grade: 'B',
    note: 'Content steering, not lucidity. Without a sensor, a fixed early-sleep timer is the honest proxy.',
    source: 'Haar Horowitz et al. 2020, Consciousness and Cognition 83:102938; Haar Horowitz et al. 2023, Scientific Reports',
  },
  {
    id: 'study-kueny-1985-tape',
    name: 'Early precedent — "You are dreaming" cassette tapes',
    setup:
      'A cassette recording of the phrase "You are dreaming" played during the night as a lucidity reminder.',
    timing: 'Overnight playback during sleep (1980s home protocols).',
    outcome: 'Increased lucid-dream frequency in small early samples; methods predated signal verification standards.',
    grade: 'C',
    note: 'Historical root of every modern cueing protocol; included for lineage, with its methodological limits stated.',
    source: 'Kueny 1985; LaBerge & Owens — discussed in Soffer-Dudek 2023, Somnologie 27:143–151',
  },
];

// ---------------------------------------------------------------------------
// 2. Government file — documented programs, graded honestly
// ---------------------------------------------------------------------------

export interface GovProgram {
  id: string;
  name: string;
  years: string;
  agency: string;
  /** What the record actually shows. */
  record: string;
  /** Connection (or absence of one) to audio/frequency work. */
  audioLink: string;
  /** Grade of the historical record itself. */
  recordGrade: Grade;
  /** Grade of the capability claims the program explored. */
  claimGrade: Grade;
  source: string;
}

export const GOV_PROGRAMS: readonly GovProgram[] = [
  {
    id: 'gov-gateway-1983',
    name: 'Analysis and Assessment of Gateway Process (Hemi-Sync)',
    years: 'Report dated 9 June 1983; declassified via FOIA, released 2003',
    agency: 'U.S. Army Intelligence and Security Command (INSCOM); filed in the CIA reading room',
    record:
      'Lt. Col. Wayne M. McDonnell assesses the Monroe Institute\'s Gateway Experience for Army intelligence. The report ' +
      'describes Hemi-Sync (per Melissa Jager: hemispheres "simultaneously equal in amplitude and frequency"), the Focus ' +
      '10/12/15/21 ladder, added "pink and white" noise at deeper levels, and recommends in §38 a phased approach: ' +
      'Hemi-Sync focus, then "strong REM sleep frequencies" for left-brain quiescence and deep relaxation, then hypnotic ' +
      'suggestion. Its holographic-universe synthesis (Bentov, Planck-scale torus) is the author\'s theoretical reading.',
    audioLink:
      'Direct: the assessed system is audio (binaural beat tapes). Tape contents are proprietary and were never published ' +
      'with exact frequencies; independent spectral analyses of Wave I recordings find mostly 4–7 Hz (theta) excursions with ' +
      'some 8–12 Hz content — consistent with, not proof of, the report\'s description. Our Focus-level presets are labeled ' +
      'reconstructions built from the report\'s text, not recovered tape settings.',
    recordGrade: 'A',
    claimGrade: 'D',
    source: 'CIA-RDP96-00788R001700210016-5 (cia.gov reading room); Wikisource transcript',
  },
  {
    id: 'gov-army-hemisync-eval',
    name: 'U.S. Army evaluation of Hemi-Sync presentations',
    years: '1980s (declassified)',
    agency: 'U.S. Army (INSCOM orbit)',
    record:
      'Declassified evaluators reported that exposure to a sleep recording appeared to aid sleep induction and stress ' +
      'reduction, while wakefulness applications were not convincingly demonstrated; broader claims were left for further ' +
      'evaluation. That is neither "confirmation" nor "debunking" — it is an institution observing some effects and asking ' +
      'for more data.',
    audioLink: 'Direct: evaluation of the Hemi-Sync audio tapes themselves.',
    recordGrade: 'C',
    claimGrade: 'C',
    source: 'Declassified Army Hemi-Sync evaluation records (CREST); secondary summary: thy-reality.com (2022, updated 2026)',
  },
  {
    id: 'gov-gantt-2017',
    name: 'Binaural beats for postdeployment stress (clinical trial)',
    years: '2017 (trial run over ~3 years prior)',
    agency: 'U.S. military treatment facilities; published in Journal of Nursing Scholarship',
    record:
      'Double-blind randomized trial (N=74): music with embedded theta-band binaural beats vs music alone, ≥30 min at ' +
      'bedtime, 3 consecutive nights/week for 4 weeks. The binaural group showed decreased low-frequency HRV and increased ' +
      'high-frequency HRV (p=.01) under an acute stressor, and reported less stress in daily diaries.',
    audioLink:
      'Direct: this is the strongest government-linked clinical audio dataset. Note what it does not show: EEG entrainment ' +
      'was not measured; the relaxation outcome matches what slow music alone often delivers.',
    recordGrade: 'A',
    claimGrade: 'B',
    source: 'Gantt et al. 2017, J Nurs Scholarsh 49(4):411–420, DOI 10.1111/jnu.12304',
  },
  {
    id: 'gov-stargate-1995',
    name: 'Stargate Project (remote viewing)',
    years: '1972–1995 (~$20M across SRI and SAIC)',
    agency: 'CIA → DIA; predecessors Grill Flame, Center Lane, Sun Streak',
    record:
      'Two decades of government-funded remote-viewing research and operations. The 1995 American Institutes for Research ' +
      'review (Utts & Hyman) agreed some lab effects were statistically anomalous but found no actionable intelligence ' +
      'value; the CIA terminated and declassified the program. Skip Atwater, its early overseer, later became president of ' +
      'the Monroe Institute — the institutional bridge between Stargate and Gateway.',
    audioLink:
      'None direct: remote viewing was not an audio protocol. Included because the Gateway assessment sat inside this ' +
      'same altered-states portfolio — and to show the government\'s own bar for "useful".',
    recordGrade: 'A',
    claimGrade: 'D',
    source: 'CIA-RDP96-00789R002800180001-2 (Star Gate overview, 1993); AIR final report 1995; Escolà-Gascón et al. 2023, Brain Behav 13:e3026',
  },
  {
    id: 'gov-onr-2014-spidey',
    name: 'ONR "Spidey sense" intuition program',
    years: '2014–2018 (~$3.85M)',
    agency: 'Office of Naval Research',
    record:
      'Four-year program exploring premonition/intuition in sailors and Marines — evidence that defense interest in ' +
      'anomalous cognition continued after Stargate\'s closure. Results were not operationally transformative.',
    audioLink: 'None. Context entry: the portfolio outlived the 1995 review.',
    recordGrade: 'B',
    claimGrade: 'D',
    source: 'History.com / Jacobsen reporting on the ONR program (2014 launch)',
  },
];

// ---------------------------------------------------------------------------
// 3. Octave portraits — math/physics-derived tones (A arithmetic / D meaning)
// ---------------------------------------------------------------------------

export interface OctavePortrait {
  id: string;
  label: string;
  /** The physical quantity used. */
  sourceQuantity: string;
  /** Its measured/defined value. */
  sourceValue: string;
  /** n in tone = source × 2^±n (sign per direction). */
  octaveN: number;
  direction: 'up' | 'down';
  /** Resulting tone in Hz (rounded to 0.01). */
  toneHz: number;
  /** Cousto's published table value when it differs from exact recomputation. */
  publishedHz?: number;
  note: string;
  citation: string;
}

export const OCTAVE_PORTRAITS: readonly OctavePortrait[] = [
  {
    id: 'octave-earth-year',
    label: 'Earth year (the "OM" tone)',
    sourceQuantity: 'Sidereal year orbital period',
    sourceValue: '365.256363004 d → 3.1688×10⁻⁸ Hz',
    octaveN: 32,
    direction: 'up',
    toneHz: 136.1,
    note: 'Matches Cousto\'s published 136.10 Hz (C♯). The arithmetic is exact; the "OM" naming is a 1978 cultural assignment.',
    citation: 'Cousto, Die Kosmische Oktave (1978); JPL orbital constants',
  },
  {
    id: 'octave-earth-day',
    label: 'Earth day (mean solar)',
    sourceQuantity: 'Mean solar day rotation period',
    sourceValue: '86,400 s → 1.1574×10⁻⁵ Hz',
    octaveN: 24,
    direction: 'up',
    toneHz: 194.18,
    note: 'Matches Cousto\'s 194.18 Hz (G). The sidereal day (86,164.0905 s) gives 194.71 Hz at the same n.',
    citation: 'Cousto (1978); SI day definition',
  },
  {
    id: 'octave-mercury',
    label: 'Mercury orbit',
    sourceQuantity: 'Mercury sidereal orbital period',
    sourceValue: '87.9691 d → 1.3157×10⁻⁷ Hz',
    octaveN: 30,
    direction: 'up',
    toneHz: 141.27,
    note: 'Matches Cousto\'s 141.27 Hz (C♯/D region).',
    citation: 'JPL planetary ephemeris constants; Cousto table',
  },
  {
    id: 'octave-venus',
    label: 'Venus orbit',
    sourceQuantity: 'Venus sidereal orbital period',
    sourceValue: '224.701 d → 5.1509×10⁻⁸ Hz',
    octaveN: 32,
    direction: 'up',
    toneHz: 221.23,
    publishedHz: 221.23,
    note: 'Cousto publishes the n=32 octave (221.23 Hz, A region); the n=31 octave (110.61 Hz) is equally exact. Octave choice is a convention, not physics.',
    citation: 'JPL constants; Cousto table',
  },
  {
    id: 'octave-mars',
    label: 'Mars orbit',
    sourceQuantity: 'Mars sidereal orbital period',
    sourceValue: '686.980 d → 1.6848×10⁻⁸ Hz',
    octaveN: 33,
    direction: 'up',
    toneHz: 144.72,
    note: 'Matches Cousto\'s 144.72 Hz (D).',
    citation: 'JPL constants; Cousto table',
  },
  {
    id: 'octave-jupiter',
    label: 'Jupiter orbit',
    sourceQuantity: 'Jupiter sidereal orbital period',
    sourceValue: '4,332.589 d → 2.6714×10⁻⁹ Hz',
    octaveN: 36,
    direction: 'up',
    toneHz: 183.58,
    note: 'Matches Cousto\'s 183.58 Hz (F♯ region).',
    citation: 'JPL constants; Cousto table',
  },
  {
    id: 'octave-saturn',
    label: 'Saturn orbit',
    sourceQuantity: 'Saturn sidereal orbital period',
    sourceValue: '10,759.22 d → 1.0757×10⁻⁹ Hz',
    octaveN: 37,
    direction: 'up',
    toneHz: 147.85,
    note: 'Matches Cousto\'s 147.85 Hz (D region).',
    citation: 'JPL constants; Cousto table',
  },
  {
    id: 'octave-moon-synodic',
    label: 'Synodic Moon',
    sourceQuantity: 'Synodic month (new moon to new moon)',
    sourceValue: '29.530588853 d → 3.9194×10⁻⁷ Hz',
    octaveN: 29,
    direction: 'up',
    toneHz: 210.42,
    note: 'Matches Cousto\'s 210.42 Hz (G♯/A region); n=28 gives 105.21 Hz.',
    citation: 'Meeus astronomical constants; Cousto table',
  },
  {
    id: 'octave-platonic-year',
    label: 'Platonic year (axial precession)',
    sourceQuantity: 'Earth axial precession period',
    sourceValue: '≈25,771.5 yr → 1.2296×10⁻¹² Hz',
    octaveN: 47,
    direction: 'up',
    toneHz: 173.04,
    publishedHz: 172.06,
    note: 'Cousto publishes 172.06 Hz from the traditional 25,920-yr figure; the modern IAU-consistent value recomputes to 173.04 Hz. Both are shown so the table is checkable.',
    citation: 'IAU precession constant; Cousto table',
  },
  {
    id: 'octave-hydrogen-21cm',
    label: 'Hydrogen 21 cm line',
    sourceQuantity: 'Neutral-hydrogen hyperfine transition (measured)',
    sourceValue: '1,420.405751768 MHz',
    octaveN: 21,
    direction: 'down',
    toneHz: 677.3,
    note: 'The most famous measured frequency in radio astronomy, octaved down into hearing. Photon energy at 21 cm is ~5.9 μeV — the audible portrait shares no physics with the line.',
    citation: 'Hellwig et al. 1970 / CODATA hyperfine value',
  },
  {
    id: 'octave-solar-pmode',
    label: 'Solar 5-minute oscillation (p-mode)',
    sourceQuantity: 'Dominant solar pressure-mode period (helioseismology)',
    sourceValue: '≈300 s → 3.33 mHz',
    octaveN: 17,
    direction: 'up',
    toneHz: 436.91,
    note: 'The Sun\'s measured global resonance (GONG/SOHO), octaved up 17 times to 436.91 Hz; octaved 13 times it lands at 27.31 Hz, used as the AM rate in the Solar p-Mode preset. This is the physics-honest replacement for the Cousto "Sun tone" (126.22 Hz), which has no orbital basis.',
    citation: 'GONG/SOHO p-mode spectrum (~3.3 mHz peak)',
  },
  {
    id: 'octave-cmb-peak',
    label: 'CMB monopole peak',
    sourceQuantity: 'Cosmic microwave background spectrum peak (FIRAS)',
    sourceValue: '160.4 GHz (2.725 K blackbody)',
    octaveN: 28,
    direction: 'down',
    toneHz: 597.54,
    note: 'The afterglow spectrum of the early universe, octaved down 28 times. Grade A measurement, Grade D meaning as a "healing" tone — included as a portrait, not a claim.',
    citation: 'Fixsen 2009, ApJ 707:916 (160.4 GHz peak)',
  },
  {
    id: 'octave-newton-red',
    label: 'Newton spectrum — red band',
    sourceQuantity: 'Visible-band edge divided in Dorian string proportions (Opticks 1704, I.II.VI)',
    sourceValue: 'Red band 666.7–750.0 nm → photon ~4.12×10¹⁴ Hz (band center)',
    octaveN: 40,
    direction: 'down',
    toneHz: 385.6,
    note: 'Newton divided the spectrum\'s length as a Dorian-mode musical string: tones 9/8 and semitones 256/243 from the red edge. The visible band spans 750→375 nm — almost exactly one octave of photon frequency (log₂ = 0.981–1.000), which is what made his musical mapping natural.',
    citation: 'Newton, Opticks (1704), Book I Part II Prop. VI; c = 299,792,458 m/s exact',
  },
  {
    id: 'octave-newton-violet',
    label: 'Newton spectrum — violet band',
    sourceQuantity: 'Violet band 375.0–421.9 nm (Dorian division)',
    sourceValue: 'Photon ~7.53×10¹⁴ Hz (band center)',
    octaveN: 40,
    direction: 'down',
    toneHz: 685.51,
    note: 'Band-center tones for the full Dorian walk: red 385.60, orange 419.79, yellow 457.01, green 514.13, blue 578.40, indigo 629.68, violet 685.51 Hz. Orange and indigo sit on the semitone segments — Newton\'s two narrow bands.',
    citation: 'Newton, Opticks (1704); Dorian division computed from 9/8 and 256/243',
  },
];

// ---------------------------------------------------------------------------
// 4. Hypothesis ledger — every experimental preset carries a falsifiable card
// ---------------------------------------------------------------------------

export interface LucidHypothesis {
  id: string;
  /** Preset this hypothesis belongs to. */
  presetId: string;
  title: string;
  statement: string;
  /** The falsifiable prediction, stated before any listening. */
  prediction: string;
  /** Home test protocol with durations. */
  homeTest: string;
  /** Prior confidence, honestly stated. */
  prior: string;
  grade: Grade;
  citations: string[];
}

export const LUCID_HYPOTHESES: readonly LucidHypothesis[] = [
  {
    id: 'hyp-theta-gamma-interleave',
    presetId: 'exp-theta-gamma-interleave',
    title: 'Theta–gamma interleave in the REM window',
    statement:
      'Lucid REM episodes correlate with fronto-temporal theta–gamma organization (correlational EEG work, 2009–2019). ' +
      'This preset alternates a 6 Hz theta binaural bed with quiet 40 Hz monaural AM blocks during the last third of the night.',
    prediction:
      'If the alternation matters, dream self-reference ratings (0–3) and lucid-count should rise on interleave nights vs ' +
      'theta-only control nights. A null result is the expected and honest outcome — the electrical version of this idea ' +
      'already failed direct replication.',
    homeTest:
      'Run 10 nights over 3 weeks: alternate interleave nights and lucid-rem-window-theta nights (coin flip), same bedtime, ' +
      'log lucidity 0–3 each morning in the Dream journal before checking which night it was.',
    prior: 'Low. Voss 2014 (electrical 40 Hz) null-replicated in 2020; audio envelopes are a weaker stimulus still.',
    grade: 'C',
    citations: [
      'Voss et al. 2009 (correlational frontal gamma in lucid REM)',
      'Blanchette-Carrière et al. 2020 (null tACS replication)',
      'Baird, Mota-Rolim & Dresler 2019, Neurosci Biobehav Rev (gamma-artifact discussion)',
    ],
  },
  {
    id: 'hyp-rem-gamma-whisper',
    presetId: 'exp-rem-gamma-whisper',
    title: 'Gamma whisper as a cue-incorporation amplifier',
    statement:
      'The 40 Hz auditory steady-state response is the strongest documented case of cortex following an audio envelope ' +
      '(Galambos 1981). This preset plays 40 Hz AM very quietly in the REM window — not to force gamma, but to test whether ' +
      'a faint rhythmic texture raises the odds that external sounds are incorporated into dreams.',
    prediction:
      'Incorporation ("I heard something in the dream") should rise vs silent control nights; lucidity itself is NOT ' +
      'predicted to change. Incorporation-without-lucidity matches the 36% / 6.7% split in the strict 2026 replication.',
    homeTest:
      '10 nights, whisper vs quiet-noise control, alternating; each morning log (a) any remembered sound in dreams, ' +
      '(b) lucid y/n. Compare incorporation rate only.',
    prior: 'Low-to-moderate for incorporation; low for lucidity.',
    grade: 'C',
    citations: [
      'Galambos et al. 1981 (40 Hz auditory steady-state response)',
      'IJoDR 19(1) 2026 replication: 36% incorporation, 6.7% strict lucidity',
    ],
  },
  {
    id: 'hyp-ssild-pacer-adherence',
    presetId: 'lucid-ssild-pacer',
    title: 'Paced sense-cycling improves practice adherence',
    statement:
      'SSILD cycles attention through vision, hearing and body sensations. The community failure mode is rushing or ' +
      'dropping cycles; a slow audible pacer (30 s per sense, 8 cycles) makes completion mechanical.',
    prediction:
      'Completion rate (all 8 cycles, self-logged) rises vs unpaced practice. This is an adherence hypothesis — it makes ' +
      'no claim that pacing raises lucidity itself beyond the single controlled SSILD result (16.9% week 2, ILDIS 2020).',
    homeTest: '7 nights: log whether all cycles were completed and whether any cue recognition occurred in dreams.',
    prior: 'Moderate for adherence; unchanged-low for direct lucidity effect.',
    grade: 'C',
    citations: ['Aspy 2020, Front Psychol 11:1746 (ILDIS, N=355, SSILD arm)', 'Origin: CosmicIron 2011 community protocol'],
  },
  {
    id: 'hyp-gateway-relaxation-null',
    presetId: 'gateway-focus-10-reconstruction',
    title: 'Gateway reconstructions — relaxation beyond expectancy?',
    statement:
      'The 1983 Army assessment describes theta-range Hemi-Sync with added noise for "mind awake, body asleep". ' +
      'Our Focus-level reconstructions are built from that text (tape frequencies were never published). The honest ' +
      'hypothesis is the null: state-relaxation after a Focus 10 session should NOT beat a plain alpha session by more ' +
      'than expectancy explains.',
    prediction:
      'No difference beyond ~1 point on a 0–10 state-relaxation scale vs relax-alpha-ease in a blind self-test. ' +
      'Finding a large repeatable difference would be the interesting anomaly worth writing up.',
    homeTest:
      '12 sessions over 2 weeks, alternating Focus 10 reconstruction and Alpha Ease, order randomized; rate relaxation ' +
      '0–10 immediately after each 20-min session; blind by having someone else load the preset.',
    prior: 'Null expected. The 2017 military trial measured HRV stress response (B), not consciousness states.',
    grade: 'C',
    citations: [
      'CIA-RDP96-00788R001700210016-5 (1983) — assessment text, not a trial',
      'Gantt et al. 2017, J Nurs Scholarsh 49(4):411–420 (theta binaural music, HRV endpoints)',
    ],
  },
  {
    id: 'hyp-110hz-chamber',
    presetId: 'relax-archaeo-110',
    title: '110 Hz chamber tone — subjective interiority',
    statement:
      'Neolithic chambers in England and Ireland share primary resonances of 95–120 Hz, mostly 110–112 Hz (Jahn/Devereux ' +
      '1996, JASA). A 30-person EEG pilot (Cook, Pajot & Leuchter 2008) found left-temporal cordance significantly lower ' +
      'at 110 Hz than at neighboring tones, with a prefrontal asymmetry shift.',
    prediction:
      'Listeners rate 110 Hz as more "interior/dreamy" than 100 Hz or 120 Hz in blind comparison. Physiological meaning ' +
      'is explicitly unresolved — the EEG pilot authors call their own finding open to speculation.',
    homeTest:
      'Blind A/B with the 100 Hz control phase inside the preset itself (the preset already alternates 110/100 Hz blocks ' +
      'for self-blinding): rate interiority 0–10 per block without watching the readout.',
    prior: 'Low-to-moderate for a subjective preference; unresolved for any physiology.',
    grade: 'C',
    citations: [
      'Jahn, Devereux & Ibison 1996, J. Acoust. Soc. Am. 99(2):649–658',
      'Cook, Pajot & Leuchter 2008, Time and Mind 1(1):95–110',
    ],
  },
  {
    id: 'hyp-octave-portrait-null',
    presetId: 'exp-planetary-octave-ascent',
    title: 'Octave portraits — aesthetic, not physiological',
    statement:
      'Planetary, photon and oscillation periods octaved into hearing are exact arithmetic wrapped in symbolic meaning. ' +
      'The stated hypothesis is deliberately weak: listeners will prefer some portraits over others, and preference will ' +
      'track musical consonance, not source identity.',
    prediction:
      'Blind preference rankings correlate with interval consonance of adjacent tones, not with which physical constant ' +
      'each tone was derived from. Any "planetary effect" beyond that would contradict the energy-scale arithmetic ' +
      '(an audible octave of an orbit shares no physics with the orbit).',
    homeTest:
      'Play the Planetary Octave Ascent and the Newton Spectrum Walk on separate evenings, blind to labels; rank segments ' +
      'by pleasantness; only then unblind and compare against the consonance order.',
    prior: 'High for the aesthetic-null; this card exists to keep meaning and arithmetic separate.',
    grade: 'D',
    citations: ['Cousto (1978) for the method; repo grading policy: arithmetic A / meaning D'],
  },
];

// ---------------------------------------------------------------------------
// 5. The preset pack — lucid practice, Gateway reconstructions, healing-range,
//    and physics portraits. All timings stated; all claims graded.
// ---------------------------------------------------------------------------

const GATEWAY_MIX = { ...CLEAN_PRESET_MIX, noiseOn: true, noiseDb: { pink: -30 } };

export const LUCID_LAB_PRESETS: readonly PresetSpec[] = [
  // ------------------------------------------------------- Lucid practice
  {
    id: 'lucid-tlr-training-bed',
    title: 'TLR Pairing Bed (20 min)',
    category: 'Lucid Dream',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'settle', durationSec: 300, carrierHz: 200, beatHz: 8, gainDbFs: -16, rampSec: 60 },
        { name: 'pairing-window', durationSec: 900, carrierHz: 180, beatHz: 6, gainDbFs: -20 },
      ],
    },
    grade: 'B',
    rationale:
      'Quiet theta-range bed for the 15–25 min pre-sleep cue-pairing exercise — the validated TLR setup (Carr 2023: 50% ' +
      'vs 17% signal-verified in cued naps). The cue→mindset association is the active ingredient; this bed is comfort ' +
      'and ritual, not the mechanism. Play it during pairing practice, then let auto-shutoff end it before sleep.',
    citations: [
      'Carr et al. 2023, Psychology of Consciousness 10(4):413–433',
      'Mallett/Paller 2024, Consciousness and Cognition (PMC11542932)',
    ],
  },
  {
    id: 'lucid-wbtb-return-descent',
    title: 'WBTB Return Descent (35 min)',
    category: 'Lucid Dream',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 're-settle', durationSec: 600, carrierHz: 160, beatHz: 8, gainDbFs: -16, rampSec: 90 },
        { name: 'descend', durationSec: 900, carrierHz: 140, beatHz: 6, gainDbFs: -18, rampSec: 120 },
        { name: 'rem-approach', durationSec: 600, carrierHz: 120, beatHz: 4.5, gainDbFs: -22, rampSec: 120 },
      ],
    },
    grade: 'C',
    rationale:
      'For the return-to-bed window of Wake-Back-To-Bed: wake 4.5–6 h after sleep onset, stay up 20–40 min with intention ' +
      'practice, then this 35-min alpha→theta descent accompanies falling back asleep into the REM-rich window. Timing ' +
      'evidence is strong (Aspy 2017 ~46% per attempt with MILD; the galantamine trial used the same 4.5 h mark); the ' +
      'audio itself is relaxation support, honestly graded.',
    citations: [
      'Aspy et al. 2017, Consciousness and Cognition (MILD+WBTB 46% per attempt)',
      'LaBerge, LaMarca & Baird 2018, PLOS ONE 13(8):e0201246 (4.5 h wake point, 30–40 min window)',
    ],
  },
  {
    id: 'lucid-rem-window-theta',
    title: 'REM Window Theta (45 min)',
    category: 'Lucid Dream',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'window-open', durationSec: 900, carrierHz: 160, beatHz: 5.5, gainDbFs: -20, rampSec: 120 },
        { name: 'hold', durationSec: 1500, carrierHz: 140, beatHz: 5, gainDbFs: -22 },
        { name: 'release', durationSec: 300, carrierHz: 120, beatHz: 4, gainDbFs: -26, rampSec: 90 },
      ],
    },
    grade: 'C',
    rationale:
      'A quiet theta bed sized to the last-third-of-night REM window (the no-EEG targeting heuristic used by home TLR). ' +
      'Use it as the backdrop under cue replay or intention practice. Evidence supports the WINDOW, not the beat: theta ' +
      'prominence in REM is physiology; a theta beat producing lucidity is unproven folklore we do not ship as a claim.',
    citations: [
      'Mallett/Paller 2024 (home TLR replay ~6 h after onset)',
      'Ingendoh et al. 2023, PLOS ONE (cortical entrainment hypothesis contradicted in 8 of 14 EEG studies)',
    ],
  },
  {
    id: 'lucid-n1-incubation',
    title: 'Sleep-Onset Incubation Window (15 min)',
    category: 'Lucid Dream',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'alpha-drift', durationSec: 360, carrierHz: 180, beatHz: 10, gainDbFs: -18, rampSec: 60 },
        { name: 'n1-theta', durationSec: 420, carrierHz: 150, beatHz: 7, gainDbFs: -22, rampSec: 90 },
        { name: 'fade-out', durationSec: 120, carrierHz: 120, beatHz: 5, gainDbFs: -28, rampSec: 60 },
      ],
    },
    grade: 'C',
    rationale:
      'A 15-min fading window for Dormio-style dream incubation at sleep onset: choose one theme, let this quiet ' +
      'alpha→theta descent mark the N1 border. Controlled evidence covers CONTENT steering (dreams biased toward the ' +
      'theme; post-sleep creativity gains), not lucidity — framed accordingly.',
    citations: [
      'Haar Horowitz et al. 2020, Consciousness and Cognition 83:102938',
      'Haar Horowitz et al. 2023, Scientific Reports (creativity composite)',
    ],
  },
  {
    id: 'lucid-ssild-pacer',
    title: 'SSILD Sense-Cycle Pacer (12 min)',
    category: 'Lucid Dream',
    spec: {
      autoShutoff: true,
      phases: Array.from({ length: 8 }, (_, cycle) => [
        { name: `cycle-${cycle + 1}-vision`, durationSec: 30, carrierHz: 392, beatHz: 0, gainDbFs: -20, rampSec: 5 },
        { name: `cycle-${cycle + 1}-hearing`, durationSec: 30, carrierHz: 493.88, beatHz: 0, gainDbFs: -20, rampSec: 5 },
        { name: `cycle-${cycle + 1}-body`, durationSec: 30, carrierHz: 329.63, beatHz: 0, gainDbFs: -20, rampSec: 5 },
      ]).flat(),
    },
    grade: 'B',
    rationale:
      'Eight paced SSILD cycles after a brief wake: 30 s each of vision (G4), hearing (B4) and body (E4) markers — the ' +
      'pitch change tells you when to shift attention without watching a clock. SSILD has one controlled result (16.9% ' +
      'week 2, ILDIS 2020 N=355); this pacer targets practice quality, the variable the strict 2026 replication showed ' +
      'is decisive.',
    citations: [
      'Aspy 2020, Front Psychol 11:1746 (ILDIS SSILD arm)',
      'IJoDR 19(1) 2026 (training quality drives cue-to-lucidity conversion)',
    ],
  },

  // ------------------------------------- Gateway reconstructions (unofficial)
  {
    id: 'gateway-focus-10-reconstruction',
    title: 'Gateway Focus 10 reconstruction (35 min, unofficial)',
    category: 'Meditate',
    spec: {
      autoShutoff: true,
      mix: GATEWAY_MIX,
      phases: [
        { name: 'settle', durationSec: 300, carrierHz: 200, beatHz: 10, gainDbFs: -16, rampSec: 60 },
        { name: 'body-asleep', durationSec: 1500, carrierHz: 180, beatHz: 4, gainDbFs: -16 },
        { name: 'return', durationSec: 300, carrierHz: 200, beatHz: 10, gainDbFs: -18, rampSec: 60 },
      ],
    },
    grade: 'C',
    rationale:
      'UNOFFICIAL reconstruction from the 1983 Army assessment text: theta-range binaural (4 Hz, the 4–7 Hz band ' +
      'independent spectral analyses find in Wave I recordings) plus a quiet pink-noise layer, framed as "mind awake, ' +
      'body asleep". Tape settings were never published; this is a meditation session inspired by the document, graded ' +
      'like any theta meditation aid. Army evaluators found sleep/stress support; expanded-consciousness claims unproven.',
    citations: [
      'CIA-RDP96-00788R001700210016-5 (McDonnell, 9 June 1983), §§29–30',
      'Gantt et al. 2017, J Nurs Scholarsh 49(4):411–420',
    ],
  },
  {
    id: 'gateway-focus-12-reconstruction',
    title: 'Gateway Focus 12 reconstruction (40 min, unofficial)',
    category: 'Meditate',
    spec: {
      autoShutoff: true,
      mix: GATEWAY_MIX,
      phases: [
        { name: 'settle', durationSec: 300, carrierHz: 200, beatHz: 10, gainDbFs: -16, rampSec: 60 },
        { name: 'expanded', durationSec: 1500, carrierHz: 180, beatHz: 6, gainDbFs: -16 },
        { name: 'deepen', durationSec: 480, carrierHz: 160, beatHz: 4.5, gainDbFs: -18, rampSec: 60 },
        { name: 'return', durationSec: 120, carrierHz: 200, beatHz: 12, gainDbFs: -18, rampSec: 30 },
      ],
    },
    grade: 'C',
    rationale:
      'UNOFFICIAL Focus 12 reconstruction: mid-theta hold (6 Hz) with a deeper 4.5 Hz close and a pink-noise layer — the ' +
      'report describes additional "pink and white noise" entering the sound stream at this level. Session length 40 min ' +
      'echoes Gateway tape sides (~30–45 min). A meditation aid built from a declassified description; the program\'s ' +
      'remote-perception claims remain unproven (see Government File on this page).',
    citations: ['CIA-RDP96-00788R001700210016-5 (1983), §30'],
  },
  {
    id: 'gateway-focus-15-reconstruction',
    title: 'Gateway Focus 15 reconstruction (45 min, unofficial)',
    category: 'Meditate',
    spec: {
      autoShutoff: true,
      mix: GATEWAY_MIX,
      phases: [
        { name: 'settle', durationSec: 420, carrierHz: 180, beatHz: 8, gainDbFs: -16, rampSec: 90 },
        { name: 'theta-hold', durationSec: 1200, carrierHz: 150, beatHz: 4, gainDbFs: -16 },
        { name: 'delta-excursion', durationSec: 420, carrierHz: 120, beatHz: 1.5, gainDbFs: -20, rampSec: 90 },
        { name: 'theta-return', durationSec: 480, carrierHz: 150, beatHz: 4, gainDbFs: -16, rampSec: 90 },
        { name: 'surface', durationSec: 180, carrierHz: 200, beatHz: 10, gainDbFs: -18, rampSec: 60 },
      ],
    },
    grade: 'C',
    rationale:
      'UNOFFICIAL reconstruction of the "no-time" level: the assessment says Focus 15 adds further sound levels over the ' +
      'Focus 12 base and that fewer than 5% of trainees fully reach it in a 7-day course. Rendered as theta hold with a ' +
      'single long delta excursion (1.5 Hz) and back. Meditation soundscape; the associated time-travel framing is the ' +
      'report\'s symbolism, not an effect we claim.',
    citations: ['CIA-RDP96-00788R001700210016-5 (1983), §30G and Focus-15 discussion'],
  },
  {
    id: 'gateway-focus-21-reconstruction',
    title: 'Gateway Focus 21 reconstruction (50 min, unofficial)',
    category: 'Meditate',
    spec: {
      autoShutoff: true,
      mix: GATEWAY_MIX,
      phases: [
        { name: 'descent', durationSec: 600, carrierHz: 180, beatHz: 7.5, gainDbFs: -16, rampSec: 120 },
        { name: 'threshold', durationSec: 1800, carrierHz: 140, beatHz: 4, gainDbFs: -16 },
        { name: 'bridge', durationSec: 420, carrierHz: 160, beatHz: 7.5, gainDbFs: -18, rampSec: 90 },
        { name: 'return', durationSec: 180, carrierHz: 200, beatHz: 12, gainDbFs: -18, rampSec: 60 },
      ],
    },
    grade: 'C',
    rationale:
      'UNOFFICIAL reconstruction of Focus 21 ("the edge of time-space" in the institute\'s own description): theta-alpha ' +
      'boundary (7.5 Hz) brackets around a long 4 Hz threshold hold, 50 min total — the deepest and longest of the four ' +
      'reconstructions, mirroring the documented progression. Deep-meditation soundscape only; all veridical-perception ' +
      'claims from the program era failed government review (Stargate closure, 1995).',
    citations: [
      'CIA-RDP96-00788R001700210016-5 (1983)',
      'AIR final evaluation 1995 (Stargate termination)',
    ],
  },

  // ------------------------------------------- Healing-range honest additions
  {
    id: 'relax-archaeo-110',
    title: 'Neolithic Chamber Tone (110 Hz, with blind 100 Hz blocks)',
    category: 'Relax',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'chamber-a', durationSec: 300, carrierHz: 110, beatHz: 0, gainDbFs: -14, rampSec: 30 },
        { name: 'control-100', durationSec: 300, carrierHz: 100, beatHz: 0, gainDbFs: -14, rampSec: 30 },
        { name: 'chamber-b', durationSec: 300, carrierHz: 110, beatHz: 0, gainDbFs: -14, rampSec: 30 },
        { name: 'control-100-b', durationSec: 300, carrierHz: 100, beatHz: 0, gainDbFs: -14, rampSec: 30 },
      ],
    },
    grade: 'C',
    rationale:
      'Six Neolithic chambers (incl. Newgrange, c.3200 BC) resonate at 95–120 Hz, mostly 110–112 Hz (Jahn/Devereux, JASA ' +
      '1996). A 30-adult EEG pilot found left-temporal cordance lowest at 110 Hz vs 90–130 Hz neighbors (Cook 2008) — the ' +
      'authors call the meaning open to speculation. Built-in 100 Hz control blocks let you self-blind a preference test. ' +
      '20 min total, in the measured chamber range.',
    citations: [
      'Jahn, Devereux & Ibison 1996, J. Acoust. Soc. Am. 99(2):649–658',
      'Cook, Pajot & Leuchter 2008, Time and Mind 1(1):95–110',
    ],
  },
  {
    id: 'relax-vat-40-analog',
    title: 'Vibroacoustic 40 Hz — audible analog (23 min)',
    category: 'Relax',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'ease-in', durationSec: 180, carrierHz: 80, beatHz: 40, mode: 'monaural', gainDbFs: -16, rampSec: 30 },
        { name: 'hold', durationSec: 1020, carrierHz: 80, beatHz: 40, mode: 'monaural', gainDbFs: -14 },
        { name: 'release', durationSec: 180, carrierHz: 80, beatHz: 40, mode: 'monaural', gainDbFs: -20, rampSec: 30 },
      ],
    },
    grade: 'C',
    rationale:
      'Vibroacoustic therapy delivers 40 Hz through the BODY (tactile transducers); clinical sessions ran 20–45 min — ' +
      'Naghdi 2015 used 23 min, twice weekly for 5 weeks, in fibromyalgia (pain and sleep improved; 25% discontinued pain ' +
      'medication). This is the AUDIBLE analog on an 80 Hz carrier; airborne sound is not the studied modality, so the ' +
      'clinical grade does not transfer — labeled accordingly.',
    citations: [
      'Naghdi et al. 2015, Pain Res Manag 20(1):e34–e39 (40 Hz, 23-min sessions)',
      'Kantor et al. 2022, BMJ Open scoping review (40 Hz predominant; 20–45 min sessions)',
    ],
  },

  // ------------------------------- Physics portraits & hypothesis probes
  {
    id: 'exp-theta-gamma-interleave',
    title: 'Theta–Gamma Interleave Probe — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: Array.from({ length: 5 }, (_, cycle) => [
        { name: `theta-${cycle + 1}`, durationSec: 240, carrierHz: 180, beatHz: 6, gainDbFs: -18, rampSec: 30 },
        { name: `gamma-${cycle + 1}`, durationSec: 240, carrierHz: 240, beatHz: 40, mode: 'monaural' as const, gainDbFs: -20, rampSec: 30 },
      ]).flat(),
    },
    grade: 'C',
    rationale:
      'Hypothesis probe (see ledger): alternating 4-min blocks of 6 Hz theta binaural and quiet 40 Hz monaural AM across ' +
      '40 min of the REM window. Prior is LOW — the electrical 40 Hz lucidity claim null-replicated (Blanchette-Carrière ' +
      '2020). Gamma-rate blocks use monaural AM because binaural beats fail above ~30 Hz. No lucidity claim; the test ' +
      'protocol is on the Lucid Audio Lab page.',
    citations: [
      'Blanchette-Carrière et al. 2020 (null replication of Voss 2014)',
      'Galambos et al. 1981 (40 Hz ASSR exists as a diagnostic response)',
    ],
  },
  {
    id: 'exp-rem-gamma-whisper',
    title: 'REM-Window Gamma Whisper — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'theta-bed', durationSec: 900, carrierHz: 160, beatHz: 5.5, gainDbFs: -20, rampSec: 120 },
        { name: 'gamma-whisper', durationSec: 1800, carrierHz: 200, beatHz: 40, mode: 'monaural', gainDbFs: -26 },
      ],
    },
    grade: 'C',
    rationale:
      'Hypothesis probe: 40 Hz AM at whisper level (−26 dBFS) for 30 min inside the REM window, after a 15-min theta bed. ' +
      'Tests cue-INCORPORATION, not lucidity — the strict 2026 replication found 36% incorporation but only 6.7% strict ' +
      'lucidity, so incorporation is the realistic endpoint. Very quiet by design; wakefulness beats effect-chasing.',
    citations: [
      'Galambos et al. 1981 (40 Hz ASSR)',
      'IJoDR 19(1) 2026 (incorporation vs strict-lucidity gap)',
    ],
  },
  {
    id: 'exp-newton-spectrum-dorian',
    title: 'Newton Spectrum Walk (Dorian division, 1704) — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'red', durationSec: 90, carrierHz: 385.6, beatHz: 0, gainDbFs: -16, rampSec: 15 },
        { name: 'orange', durationSec: 90, carrierHz: 419.79, beatHz: 0, gainDbFs: -16, rampSec: 15 },
        { name: 'yellow', durationSec: 90, carrierHz: 457.01, beatHz: 0, gainDbFs: -16, rampSec: 15 },
        { name: 'green', durationSec: 90, carrierHz: 514.13, beatHz: 0, gainDbFs: -16, rampSec: 15 },
        { name: 'blue', durationSec: 90, carrierHz: 578.4, beatHz: 0, gainDbFs: -16, rampSec: 15 },
        { name: 'indigo', durationSec: 90, carrierHz: 629.68, beatHz: 0, gainDbFs: -16, rampSec: 15 },
        { name: 'violet', durationSec: 90, carrierHz: 685.51, beatHz: 0, gainDbFs: -16, rampSec: 15 },
      ],
    },
    grade: 'D',
    rationale:
      'Newton divided the spectrum as a Dorian-mode string (Opticks 1704, I.II.VI): tones 9/8, semitones 256/243 from the ' +
      'red edge (750 nm) — which lands the violet edge at 375 nm because the visible band is almost exactly one octave of ' +
      'photon frequency (log₂(750/380) = 0.98). Band-center photon frequencies octaved down by 2⁻⁴⁰ (n=40). Arithmetic ' +
      'grade A; meaning grade D — audible light-octaves share no physics with photons.',
    citations: [
      'Newton, Opticks (1704), Book I Part II Prop. VI (Dorian color division)',
      'Computation: c = 299,792,458 m/s (exact); tones = c/λ × 2⁻⁴⁰',
    ],
  },
  {
    id: 'exp-planetary-octave-ascent',
    title: 'Planetary Octave Ascent (recomputed Cousto set) — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'earth-year-om', durationSec: 90, carrierHz: 136.1, beatHz: 0, gainDbFs: -16, rampSec: 10 },
        { name: 'mercury', durationSec: 90, carrierHz: 141.27, beatHz: 0, gainDbFs: -16, rampSec: 10 },
        { name: 'mars', durationSec: 90, carrierHz: 144.72, beatHz: 0, gainDbFs: -16, rampSec: 10 },
        { name: 'saturn', durationSec: 90, carrierHz: 147.85, beatHz: 0, gainDbFs: -16, rampSec: 10 },
        { name: 'jupiter', durationSec: 90, carrierHz: 183.58, beatHz: 0, gainDbFs: -16, rampSec: 10 },
        { name: 'earth-day', durationSec: 90, carrierHz: 194.18, beatHz: 0, gainDbFs: -16, rampSec: 10 },
        { name: 'moon-synodic', durationSec: 90, carrierHz: 210.42, beatHz: 0, gainDbFs: -16, rampSec: 10 },
        { name: 'venus', durationSec: 90, carrierHz: 221.23, beatHz: 0, gainDbFs: -16, rampSec: 10 },
      ],
    },
    grade: 'D',
    rationale:
      'The Cousto planetary set ascending by pitch (12 min), every value recomputed from orbital periods with f = (1/T) × ' +
      '2ⁿ and verified against the published table — the full derivation (n per tone, plus where Cousto used a different ' +
      'octave or the traditional 25,920-yr precession figure) is tabulated on the Lucid Audio Lab page. Arithmetic grade ' +
      'A; therapeutic meaning grade D. Planets emit no sound in vacuum; this is a cultural instrument.',
    citations: [
      'Cousto, Die Kosmische Oktave (1978); planetware.de/octave',
      'JPL/Meeus orbital periods; recomputation n values listed in the Octave Portraits table',
    ],
  },
  {
    id: 'exp-hydrogen-21cm-portrait',
    title: 'Hydrogen 21 cm Portrait (677.30 Hz) — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'line-portrait', durationSec: 1200, carrierHz: 677.3, beatHz: 0, gainDbFs: -16, rampSec: 60 },
      ],
    },
    grade: 'D',
    rationale:
      'The neutral-hydrogen hyperfine line (1,420.405751768 MHz — among the most precisely measured frequencies in ' +
      'science) octaved down by 2⁻²¹ to 677.30 Hz, 20 min. Physics-honest framing: the 21 cm photon carries ~5.9 μeV; ' +
      'no biological coupling exists or is claimed. A listening portrait of a real cosmic frequency, graded arithmetic A ' +
      '/ meaning D.',
    citations: ['Hellwig et al. 1970 / CODATA: 1,420.405751768 MHz hyperfine transition'],
  },
  {
    id: 'exp-solar-pmode-portrait',
    title: 'Solar p-Mode Portrait (measured helioseismology) — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'solar-tone', durationSec: 1200, carrierHz: 436.91, beatHz: 27.31, gainDbFs: -16, rampSec: 60 },
      ],
    },
    grade: 'D',
    rationale:
      'The Sun\'s dominant 5-minute pressure mode (~3.33 mHz, measured by GONG/SOHO) octaved up: ×2¹⁷ → 436.91 Hz carrier, ' +
      '×2¹³ → 27.31 Hz binaural beat, 20 min. The physics-honest Sun tone — unlike the Cousto table value (126.22 Hz), ' +
      'this one starts from a measured solar oscillation. Arithmetic A / meaning D; 27.31 Hz sits under the binaural ' +
      'domain ceiling.',
    citations: ['GONG/SOHO p-mode spectrum (dominant peak ~3.3 mHz, period ~300 s)'],
  },
  {
    id: 'exp-cmb-peak-portrait',
    title: 'CMB Peak Portrait (597.54 Hz) — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'afterglow', durationSec: 900, carrierHz: 597.54, beatHz: 0, gainDbFs: -18, rampSec: 60 },
      ],
    },
    grade: 'D',
    rationale:
      'The cosmic microwave background spectrum peaks at 160.4 GHz (FIRAS, 2.725 K blackbody; Fixsen 2009); octaved down ' +
      'by 2⁻²⁸ it is 597.54 Hz, 15 min. A portrait of the oldest measured light in the universe. Arithmetic A / meaning ' +
      'D — if a seller claims this frequency "heals", the energy-scale arithmetic is the refutation.',
    citations: ['Fixsen 2009, ApJ 707:916–920 (CMB monopole peak 160.4 GHz)'],
  },
];

// ---------------------------------------------------------------------------
// 6. Kepler's planet songs (Harmonices Mundi, 1619) — computed, not mythic
// ---------------------------------------------------------------------------

/**
 * Kepler found that the ratio of a planet's angular speeds at perihelion and
 * aphelion approximates a just musical interval. By the second law the ratio
 * is ((1+e)/(1-e))² from the orbital eccentricity alone. Tones here are the
 * absolute angular speeds (cycles/second) octaved up into Kepler's own choir
 * registers (Saturn bass → Mercury soprano); n stated per planet.
 */
export interface KeplerSong {
  planet: string;
  /** Modern eccentricity (JPL). */
  eccentricity: number;
  /** Aphelion / perihelion tones, Hz, rounded to 0.01. */
  aphelionHz: number;
  perihelionHz: number;
  /** Octave multiplier n used to reach the register. */
  octaveN: number;
  /** Measured ratio perihelion/aphelion. */
  ratio: number;
  /** Nearest just interval and its signed cents deviation. */
  interval: string;
  centsOff: number;
}

export const KEPLER_SONGS: readonly KeplerSong[] = [
  { planet: 'Saturn', eccentricity: 0.05415, aphelionHz: 66.43, perihelionHz: 82.51, octaveN: 36, ratio: 1.2421, interval: '5:4 major third', centsOff: -11.0 },
  { planet: 'Jupiter', eccentricity: 0.04839, aphelionHz: 83.41, perihelionHz: 101.24, octaveN: 35, ratio: 1.2137, interval: '6:5 minor third', centsOff: 19.7 },
  { planet: 'Mars', eccentricity: 0.09339, aphelionHz: 120.53, perihelionHz: 175.3, octaveN: 33, ratio: 1.4545, interval: '3:2 fifth', centsOff: -53.3 },
  { planet: 'Earth', eccentricity: 0.01671, aphelionHz: 263.28, perihelionHz: 281.48, octaveN: 33, ratio: 1.0691, interval: '16:15 semitone', centsOff: 4.0 },
  { planet: 'Venus', eccentricity: 0.00677, aphelionHz: 436.52, perihelionHz: 448.5, octaveN: 33, ratio: 1.0275, interval: '25:24 comma', centsOff: -23.8 },
  { planet: 'Mercury', eccentricity: 0.20563, aphelionHz: 380.46, perihelionHz: 876.37, octaveN: 32, ratio: 2.3035, interval: '12:5 octave + minor third', centsOff: -71.1 },
];

export const KEPLER_NOTE =
  'Kepler heard Earth sing "mi–fa–mi" (misery–famine) across its semitone slide. Honest counterweight: Hartmut Warm\'s ' +
  'probability analysis found Kepler\'s correspondences statistically indistinguishable from chance — the interval labels ' +
  'are nearest-fit assignments, and only Earth (4 cents) and Saturn (11 cents) sit inside perceptual tolerance. Arithmetic ' +
  'grade A; cosmic-harmony meaning grade D.';

// ---------------------------------------------------------------------------
// 7. Additional government-documented frequency programs (US / RF hearing)
// ---------------------------------------------------------------------------

export const GOV_FREY: GovProgram = {
  id: 'gov-frey-rf-hearing',
  name: 'Microwave auditory effect (Frey effect) & RF-hearing patents',
  years: '1961–present (physics); patents 1976–2003',
  agency: 'U.S. — GE/Cornell research; U.S. Air Force Research Laboratory patent (2002)',
  record:
    'Allan Frey documented in 1961/1962 (J. Applied Physiology) that pulsed microwave radiation is perceived as clicks, ' +
    'buzzes, or hisses inside the head — no acoustic pathway involved. The accepted mechanism is thermoelastic expansion: ' +
    'microsecond pulses deposit energy in tissue, launching a pressure wave that reaches the cochlea by bone conduction. ' +
    'Patents US3951134A (1976), US4858612A/US4877027A (1989), and AFRL\'s US6470214 (2002) show sustained engineering ' +
    'interest in RF-based audio delivery.',
  audioLink:
    'None inside this app — we never emit RF, and no audio speaker reproduces the mechanism. Included because "government ' +
    'frequency weapon" claims online usually trace to these documents. Verified: simple percepts (clicks/tones) under lab ' +
    'conditions. Unverified: reliable intelligible speech at distance, and every "voice-to-skull harassment" product claim.',
  recordGrade: 'A',
  claimGrade: 'C',
  source: 'Frey, J. Applied Physiology 17(4):689–692 (1962); Lin, "Microwave Auditory Effects and Applications" (1978); US6470214',
};

// ---------------------------------------------------------------------------
// 8. Round-2 preset pack: Kepler motet, five tones, Tesla folklore, GENUS hour
// ---------------------------------------------------------------------------

export const EXPEDITION_PRESETS: readonly PresetSpec[] = [
  {
    id: 'exp-kepler-motet',
    title: 'Kepler Motet 1619 (computed planet songs) — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: KEPLER_SONGS.map((s) => [
        { name: `${s.planet.toLowerCase()}-aphelion`, durationSec: 40, carrierHz: s.aphelionHz, beatHz: 0, gainDbFs: -16, rampSec: 8 },
        { name: `${s.planet.toLowerCase()}-perihelion`, durationSec: 40, carrierHz: s.perihelionHz, beatHz: 0, gainDbFs: -16, rampSec: 8 },
      ]).flat(),
    },
    grade: 'D',
    rationale:
      'Each planet sings its aphelion tone then its perihelion tone, bass Saturn (66→83 Hz) to soprano Mercury (380→876 Hz), ' +
      '8 min total. Ratios computed from modern eccentricities via ((1+e)/(1-e))²: Earth lands within 4 cents of a 16:15 ' +
      'semitone — Kepler\'s "mi–fa–mi". Nearest-fit interval labels and Warm\'s randomness critique are on the Lucid Audio ' +
      'Lab page. Arithmetic A; cosmic meaning D. 1619 staff notation, realized with 2026 orbital data.',
    citations: [
      'Kepler, Harmonices Mundi (1619), Book V',
      'JPL orbital elements; ratio = ((1+e)/(1-e))² by the second law',
      'Warm, Signature of the Celestial Spheres (randomness critique)',
    ],
  },
  {
    id: 'meditate-five-tones',
    title: 'Five Tones Pentatonic (gōng cycle, 25 min)',
    category: 'Meditate',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'gong-do', durationSec: 300, carrierHz: 261.63, beatHz: 0, gainDbFs: -16, rampSec: 30 },
        { name: 'shang-re', durationSec: 300, carrierHz: 293.66, beatHz: 0, gainDbFs: -16, rampSec: 30 },
        { name: 'jue-mi', durationSec: 300, carrierHz: 329.63, beatHz: 0, gainDbFs: -16, rampSec: 30 },
        { name: 'zhi-sol', durationSec: 300, carrierHz: 392, beatHz: 0, gainDbFs: -16, rampSec: 30 },
        { name: 'yu-la', durationSec: 300, carrierHz: 440, beatHz: 0, gainDbFs: -16, rampSec: 30 },
      ],
    },
    grade: 'B',
    rationale:
      'The five tones (宫 gōng, 商 shāng, 角 jué, 徵 zhǐ, 羽 yǔ) rendered as the C-major pentatonic steps they name, ' +
      '5 min per tone — the 30 min/day session norm of the clinical literature, trimmed to 25. Five-element music therapy ' +
      'has meta-analytic RCT support as MUSIC (21 trials, 1612 participants: post-stroke depression and sleep improved); ' +
      'the organ-element mapping is traditional correspondence, not Hz physiology. Grade B for music-as-therapy; no ' +
      'frequency-specific claim.',
    citations: [
      'Int. J. Nursing meta-analysis of 21 RCTs, N=1612 (Wiley, 2026): five-element music therapy post-stroke',
      'Huangdi Neijing tradition (five tones ↔ five elements), cultural origin',
    ],
  },
  {
    id: 'exp-tesla-369',
    title: 'Tesla 3-6-9 (folklore, honest label) — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: Array.from({ length: 3 }, (_, round) => [
        { name: `round-${round + 1}-three`, durationSec: 180, carrierHz: 120, beatHz: 3, gainDbFs: -16, rampSec: 30 },
        { name: `round-${round + 1}-six`, durationSec: 180, carrierHz: 150, beatHz: 6, gainDbFs: -16, rampSec: 30 },
        { name: `round-${round + 1}-nine`, durationSec: 180, carrierHz: 180, beatHz: 9, gainDbFs: -16, rampSec: 30 },
      ]).flat(),
    },
    grade: 'D',
    rationale:
      'Three rounds of 3 / 6 / 9 Hz beats, 27 min. The "magnificence of 3, 6 and 9" quote has no primary source in Tesla\'s ' +
      'writings — it surfaces in 20th-century retellings, and "vortex mathematics" is digit-root numerology, not physics. ' +
      'Tesla\'s DOCUMENTED frequency work (mechanical resonance demonstrations, 1893; resonant transformer coils) belongs ' +
      'to engineering history. Kept as labeled folklore: a pleasant theta-to-alpha walk, nothing more.',
    citations: [
      'Quote-audit: no primary Tesla source for the 3-6-9 claim (folklore assessment)',
      'Tesla, "Mechanical Therapy" / oscillator demonstrations (1890s engineering record)',
    ],
  },
  {
    id: 'exp-genus-daily-hour',
    title: 'GENUS Daily Hour (40 Hz AM, 60 min)',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'gamma-hour', durationSec: 3600, carrierHz: 250, beatHz: 40, mode: 'monaural', gainDbFs: -14, rampSec: 60 },
      ],
    },
    grade: 'B',
    rationale:
      'The full clinical-session duration: human GENUS-protocol studies dose 40 Hz light+sound 1 hour per day. Audio-only ' +
      'monaural AM on a 250 Hz carrier. Honest status: OVERTURE (N=76) missed its primary MADCOMS endpoint but showed ' +
      'significant secondary measures (ADCS-ADL, MMSE, whole-brain volume, corpus-callosum preservation); the pivotal ' +
      'HOPE trial (673 participants, 70 sites) reads out in 2026. Investigational; no disease claims.',
    citations: [
      'Hajós et al. 2024, Front Neurol (OVERTURE: primary miss, secondary signals)',
      'Cognito HOPE pivotal study NCT (673 enrolled, readout 2026)',
      'Cimenser et al. 2021, Front Syst Neurosci (sleep/daily-activity endpoints)',
    ],
  },
];

// ---------------------------------------------------------------------------
// 9. Pack artwork map — generated album covers under public/art/
// ---------------------------------------------------------------------------

/** Preset id → artwork path (public/art/*.jpg). Resolved via assetUrl at render. */
export const PRESET_ART: Record<string, string> = {
  'lucid-tlr-training-bed': 'art/lucid-dream.jpg',
  'lucid-wbtb-return-descent': 'art/lucid-dream.jpg',
  'lucid-rem-window-theta': 'art/lucid-dream.jpg',
  'lucid-n1-incubation': 'art/lucid-dream.jpg',
  'lucid-ssild-pacer': 'art/lucid-dream.jpg',
  'exp-theta-gamma-interleave': 'art/lucid-dream.jpg',
  'exp-rem-gamma-whisper': 'art/lucid-dream.jpg',
  'gateway-focus-10-reconstruction': 'art/gateway-file.jpg',
  'gateway-focus-12-reconstruction': 'art/gateway-file.jpg',
  'gateway-focus-15-reconstruction': 'art/gateway-file.jpg',
  'gateway-focus-21-reconstruction': 'art/gateway-file.jpg',
  'relax-archaeo-110': 'art/chamber-110.jpg',
  'relax-vat-40-analog': 'art/vibro-40.jpg',
  'exp-newton-spectrum-dorian': 'art/newton-spectrum.jpg',
  'exp-planetary-octave-ascent': 'art/planetary-octave.jpg',
  'exp-hydrogen-21cm-portrait': 'art/hydrogen-21cm.jpg',
  'exp-solar-pmode-portrait': 'art/solar-pmode.jpg',
  'exp-cmb-peak-portrait': 'art/cmb-afterglow.jpg',
  'exp-kepler-motet': 'art/kepler-motet.jpg',
  'meditate-five-tones': 'art/five-tones.jpg',
  'exp-tesla-369': 'art/tesla-369.jpg',
  'exp-genus-daily-hour': 'art/genus-40hz.jpg',
};

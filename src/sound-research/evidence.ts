/**
 * Search cut-off: 2026-10-16. These grades concern the narrow claim in each
 * summary, not the effectiveness of an OpenSync preset. Access limitations
 * remain visible because an abstract is not a full-paper review.
 */
export interface ResearchSource {
  id: string;
  title: string;
  year: string;
  kind: string;
  grade: 'A' | 'B' | 'C' | 'D';
  summary: string;
  limits: string;
  url: string;
  access: string;
}

export const EVIDENCE_SOURCES: readonly ResearchSource[] = [
  {
    id: 'mullen-2026-music-abs',
    title: 'Music, auditory beats and short-term anxiety',
    year: '2026',
    kind: 'Randomized trial · 144 adults',
    grade: 'B',
    summary: 'Music with auditory beats produced larger immediate reductions in self-reported anxiety than pink noise in adults reporting moderate trait anxiety and anxiolytic use.',
    limits: 'No music-only arm, so the contribution of beats is unresolved. Online, single-session outcomes; diagnosis was not independently verified. Authors disclosed LUCID employment, advisory roles and stock options. This does not validate our audio or establish a universal session duration.',
    url: 'https://journals.plos.org/mentalhealth/article?id=10.1371/journal.pmen.0000355',
    access: 'Open full text; methods, reported outcomes, limitations and competing interests checked.',
  },
  {
    id: 'venkatesan-2025-monaural',
    title: 'Monaural beats embedded in music',
    year: '2025',
    kind: 'Randomized online trial · 308 adults',
    grade: 'B',
    summary: 'A music-plus-beats condition showed immediate self-reported anxiety and mood improvements. The study compared it with beats alone and a pure tone.',
    limits: 'There was no music-only control. The results cannot establish that beats add benefit to music. One commercial song, self-report endpoints and uncontrolled home listening limit generalization; Universal Music Group funded the study and several authors were affiliated with the company.',
    url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1539823/full',
    access: 'Open full text; study design, results, affiliations and limitations checked.',
  },
  {
    id: 'mallik-2022-music-abs',
    title: 'Music, beats, music-plus-beats and pink noise',
    year: '2022',
    kind: 'Open-label randomized trial · 163 adults',
    grade: 'B',
    summary: 'The combined condition showed a cognitive-anxiety signal in the moderate-trait-anxiety subgroup. Music alone also improved somatic anxiety relative to pink noise; conditions were less distinct in the high-trait-anxiety subgroup.',
    limits: 'Single online session, open-label design and subgroup-dependent results. The music curation supplier had disclosed financial links to an author. A useful comparator design, not confirmation of a general beat-specific mechanism.',
    url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0259312',
    access: 'Open full text; abstract, trial arms and competing interests checked.',
  },
  {
    id: 'goldfine-2025-selected-music',
    title: 'Self-selected music in an emergency department',
    year: '2025',
    kind: 'Pilot randomized trial · 40 patients',
    grade: 'B',
    summary: 'Patients with acute musculoskeletal back pain reported lower immediate pain and anxiety after self-selected music than after noise cancellation, alongside usual emergency care.',
    limits: 'Small clinical pilot with a baseline imbalance in pain catastrophizing. Immediate self-reported symptom differences do not show tissue repair, lasting benefit or a special therapeutic pitch. The clinical setting does not validate a browser preset.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12342572/',
    access: 'Open full text; abstract, comparator, baseline differences and usual-care context checked.',
  },
  {
    id: 'yan-2024-bedtime-music',
    title: 'Bedtime music and reported sleep quality',
    year: '2024',
    kind: 'Assessor-blinded randomized trial · 75 students',
    grade: 'B',
    summary: 'Classical or jazz music added to a bedtime relaxation routine improved reported sleep quality and insomnia severity relative to relaxation instructions alone. Neither genre emerged as superior.',
    limits: 'A small student sample, combined relaxation routines and questionnaire outcomes limit inference. This is evidence about a routine, not proof that a specific carrier or beat rate improves sleep.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39053128/',
    access: 'PubMed abstract checked through indexed retrieval; publisher full text not reviewed.',
  },
  {
    id: 'aloulou-2025-personalized-sound',
    title: 'Personalized EEG-derived bedtime sound',
    year: '2025',
    kind: 'Single-blind crossover pilot · 13 adults',
    grade: 'B',
    summary: 'A small pilot compared personalized EEG-derived sounds with non-personalized sounds and reported differences in sleep duration, selected sleep measures and perceived sleep quality.',
    limits: 'Very small sample, short observation and several outcomes; independent replication is needed. An author disclosed a patent on sound conversion. Our synthesized sounds do not recreate the personalized EEG method.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40962569/',
    access: 'PubMed abstract and patent disclosure checked; full text not reviewed.',
  },
  {
    id: 'dos-anjos-2024-eeg',
    title: 'Auditory stimulation and measured EEG power',
    year: '2024',
    kind: 'Human EEG experiment · 28 participants',
    grade: 'B',
    summary: 'An experiment found different EEG power responses to intermittent tones, binaural beats and white noise. It supports studying stimulus-dependent responses with actual EEG measurements.',
    limits: 'Short exposures and an electrophysiological endpoint do not establish relaxation, cognitive improvement or medical benefit. An audio spectrum is not an EEG recording; a frequency match alone does not establish brain-wide entrainment.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39004412/',
    access: 'PubMed abstract checked through indexed retrieval; publisher full text was inaccessible.',
  },
  {
    id: 'rio-alamos-2023-bowls',
    title: 'Singing bowls and an acute relaxation comparison',
    year: '2023',
    kind: 'Randomized trial · 50 adults',
    grade: 'B',
    summary: 'Singing bowls and progressive muscle relaxation reduced self-reported anxiety relative to a waiting-list control. The study also reported differences in heart-rate variability and EEG measures.',
    limits: 'One session in a nonclinical sample. The whole experience was compared, not an isolated sacred frequency. Findings do not establish lasting benefits or validate a synthesized bowl model.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36826208/',
    access: 'PubMed abstract and figure descriptions checked; open full-text hosts were blocked during retrieval.',
  },
  {
    id: 'calamassi-2019-tuning',
    title: 'A=432 versus A=440 tuning: a small pilot',
    year: '2019',
    kind: 'Double-blind crossover pilot · 33 adults',
    grade: 'B',
    summary: 'A pilot reported a heart-rate difference between two tunings of the same music. Blood-pressure and breathing-rate differences did not meet the study\'s significance threshold.',
    limits: 'Exploratory findings do not establish a uniquely beneficial tuning. A=432 is a reference for an entire musical scale, not a single-tone treatment. The indexed record lists a 2020 corrigendum whose content was not reviewed.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31031095/',
    access: 'Indexed PubMed abstract checked; full paper and corrigendum not reviewed.',
  },
  {
    id: 'chan-2025-gamma-extension',
    title: 'Clinical audiovisual stimulation: an open-label follow-up',
    year: '2025',
    kind: 'Open-label extension · 5 patients',
    grade: 'C',
    summary: 'A long-term clinical follow-up reported feasibility and exploratory cognitive and biomarker observations with a dedicated audiovisual device in mild Alzheimer\'s disease.',
    limits: 'Only five participants, external comparison cohorts and no concurrent randomized control. Biomarker samples were available for two people. This cannot establish disease modification, and combined light-and-sound equipment is not equivalent to headphone audio.',
    url: 'https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.70792',
    access: 'Open full text; design, participant counts and exploratory outcomes checked.',
  },
  {
    id: 'fda-2025-focused-ultrasound',
    title: 'Medical focused ultrasound is a different technology',
    year: '2025',
    kind: 'FDA device approval record',
    grade: 'A',
    summary: 'The FDA record describes an MR-guided focused-ultrasound device for specific clinical indications and targeted thermal ablation. It documents a medical device category with anatomical targeting.',
    limits: 'This factual distinction carries the grade, not an efficacy claim for sound in general. Clinical hardware, imaging and specialist care cannot be reproduced by speakers, headphones or an audio export.',
    url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=P150038S037',
    access: 'Official FDA approval record checked.',
  },
  {
    id: 'nidcd-hearing',
    title: 'Listening level and duration affect hearing risk',
    year: 'Reference',
    kind: 'NIH / NIDCD hearing guidance',
    grade: 'A',
    summary: 'Loud sounds can damage hearing; risk depends on sound level, exposure duration and repetition. Lower volume and less exposure reduce risk.',
    limits: 'A digital gain value or waveform peak does not determine sound pressure at the ear. Device output, headphone sensitivity and fit matter, so the app cannot certify a listening level from dBFS alone.',
    url: 'https://www.nidcd.nih.gov/health/noise-induced-hearing-loss',
    access: 'Official NIDCD guidance checked.',
  },
];

export interface ResearchHypothesis {
  id: string;
  title: string;
  prediction: string;
  comparison: string;
  measure: string;
  confounds: string;
  status: 'Untested';
}

export const RESEARCH_HYPOTHESES: readonly ResearchHypothesis[] = [
  {
    id: 'choice-and-comfort',
    title: 'Does choosing a sound matter?',
    prediction: 'A personally selected sound will receive a higher comfort rating than a randomly assigned sound.',
    comparison: 'Chosen and assigned sessions of equal duration, with the same device and comfortable volume; counterbalance their order.',
    measure: 'Before/after calmness and listening comfort on 0–10 scales; record preference and interruptions.',
    confounds: 'Familiarity, agency, expectation, starting mood, loudness and time of day. This compares experiences, not medical outcomes.',
    status: 'Untested',
  },
  {
    id: 'beat-added-value',
    title: 'Does a beat add anything to the same sound bed?',
    prediction: 'Adding a quiet binaural layer will change perceived calmness relative to the same sound bed with a diotic tone layer.',
    comparison: 'Use equal-duration, level-matched versions of one original sound bed; present neutral A/B labels and randomize order.',
    measure: 'Paired change in calmness, comfort and preference; include an explicit no-difference response.',
    confounds: 'Detectable differences, headphone channel separation, baseline mood and expectation. A preference difference does not establish EEG entrainment.',
    status: 'Untested',
  },
  {
    id: 'tuning-preference',
    title: 'Does tuning preference survive hidden labels?',
    prediction: 'Preference for an A=432 version will differ from an A=440 version when the tuning labels are hidden.',
    comparison: 'Render the same original composition with the two tuning references; preserve tempo, duration, arrangement and level.',
    measure: 'A/B preference, comfort and ability to distinguish versions; retain ties rather than forcing a winner.',
    confounds: 'Pitch familiarity, instrument timbre, expectation and playback order. Simple speed conversion also changes tempo and would confound the test.',
    status: 'Untested',
  },
  {
    id: 'smooth-pulse-comfort',
    title: 'Which pulse shape is more comfortable?',
    prediction: 'A smooth modulation envelope will receive higher comfort ratings than a more abrupt envelope at the same nominal rate.',
    comparison: 'Compare original synthesized sounds with equal duration, carrier and digital RMS level; keep playback comfortably quiet.',
    measure: 'Comfort, perceived roughness and preference on short listening comparisons; record early stops.',
    confounds: 'Different envelopes change spectra and perceived loudness even at equal RMS. This is a sound-design hypothesis, not a biological response model.',
    status: 'Untested',
  },
];

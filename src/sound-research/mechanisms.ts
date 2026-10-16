/**
 * Mechanistic reading notes, reviewed 2026-10-16.
 * Equations describe observables or idealized signals, never predicted healing.
 * Access labels distinguish continuous full text from indexed sections/abstracts.
 */
export interface SoundMechanism {
  id: string;
  title: string;
  physics: string;
  equation: string;
  biology: string;
  measured: string;
  inferenceGap: string;
  alternative: string;
  test: string;
  sourceUrls: string[];
  access: string;
}

export const MECHANISMS: readonly SoundMechanism[] = [
  {
    id: 'air-ear-neural-response',
    title: 'Air pressure → ear → neural response',
    physics: 'A digital sample becomes pressure only through a speaker or headphone and its coupling to the ear. Frequency, spectral shape, amplitude and duration are distinct variables. The device, fit and environment change the delivered signal.',
    equation: 'P(f) = H(f)X(f); p_rms = √[(1/T)∫p(t)²dt]; Lp = 20 log10(p_rms/p_ref). H is the delivery transfer function; pressure units and a reference are required.',
    biology: 'NIDCD describes eardrum and middle-ear motion, cochlear fluid and basilar-membrane motion, hair-cell transduction and auditory-nerve signaling. This establishes a route to hearing. Later attention, interpretation and reported comfort require additional evidence.',
    measured: 'An exported waveform establishes sample values. A calibrated acoustic recording establishes pressure at its measurement location. Neural recordings and experience ratings are separate measurements; the app does not measure either.',
    inferenceGap: 'A frequency label, waveform plot or digital peak cannot establish pressure at the ear, a neural state, tissue repair or clinical benefit. Equal numerical frequency across two systems does not establish effective biological coupling.',
    alternative: 'A perceived change may reflect ordinary pitch, loudness, masking, familiarity, expectation or a different headphone response. A preferred sound can be valuable without validating a proposed cellular explanation.',
    test: 'Offline prediction: the delivered recording matches the specified spectrum within a declared measurement tolerance. A reproducible mismatch refutes that delivery claim. A match validates delivery only; it cannot confirm a health outcome.',
    sourceUrls: [
      'https://www.nidcd.nih.gov/health/how-do-we-hear',
      'https://www.nidcd.nih.gov/health/noise-induced-hearing-loss',
    ],
    access: 'Official NIDCD explanatory pages read in full. These describe hearing and exposure risk, not an efficacy trial of OpenSync.',
  },
  {
    id: 'rhythm-and-assr',
    title: 'Rhythm → auditory response → unproven outcome',
    physics: 'Amplitude modulation creates a carrier and sidebands. Two tones mixed in one channel produce physical beating; tones separated between ears can produce a binaural beat percept. These are different inputs even when their rate labels match.',
    equation: 'x(t) = A[1 + m cos(2πf_m t)]cos(2πf_c t); f_beat = |f₂ − f₁|. PLV = |mean(exp(iΔφ))| requires measured neural and stimulus phases.',
    biology: 'Auditory pathways can show a response timed to repeated sound, called an auditory steady-state response (ASSR). A driven response, ongoing EEG-band power, connectivity, experience and task performance are different endpoints.',
    measured: 'Orozco Pérez et al. (2020) recorded beat-related responses, stronger ASSR for monaural beats, and no mood modulation. López-Caballero and Escera (2017; n=14) found no corresponding EEG-band, heart-rate or skin-conductance change under their conditions.',
    inferenceGap: 'An ASSR does not establish a global brain state or a useful behavioral change. High phase consistency can reflect repeated evoked responses. EEG artifacts and shared input complicate interpretation of apparent connectivity.',
    alternative: 'Attention, sound salience, physical envelope strength and analysis choices can explain differences. A small null study also leaves uncertainty; it does not prove every beat stimulus ineffective.',
    test: 'For existing datasets, define the claimed neural and behavioral contrasts separately before analysis. A precise interval excluding a prespecified meaningful behavioral benefit counts against that benefit claim even if an ASSR is present. Imprecise estimates remain unresolved.',
    sourceUrls: [
      'https://www.eneuro.org/content/7/2/ENEURO.0232-19.2020',
      'https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2017.00557/full',
    ],
    access: '2017 publisher full text read. 2020 indexed full-text methods/results/discussion checked; continuous publisher/PMC retrieval was blocked. Neither study tested these presets.',
  },
  {
    id: 'music-context-autonomic',
    title: 'Music + context → reward, attention and body signals',
    physics: 'Music combines timing, timbre, loudness and learned structure. A single carrier frequency cannot represent this input. Preference and meaning change the listening situation without requiring a special physical resonance.',
    equation: 'Δ = mean(Y_post − Y_pre | music) − mean(Y_post − Y_pre | control). RMSSD = √mean[(RRᵢ₊₁ − RRᵢ)²], using measured heartbeat intervals.',
    biology: 'Auditory processing interacts with reward, attention and expectation. Ferreri et al. (2019; n=27 analyzed) found that a blinded pharmacological manipulation changed music pleasure and motivation. This supports a dopamine contribution to those endpoints, not a universal healing mechanism.',
    measured: 'Lunde et al. (2022; n=48) found that the tested dopamine/opioid antagonists did not abolish music-related pain relief; expectations were associated with ratings. Different outcomes can involve different or overlapping pathways.',
    inferenceGap: 'Pleasure is not clinical recovery. Heart-rate variability is a derived cardiac measure, not a direct reading of a particular nerve or neurotransmitter. A change in a proposed mediator does not by itself establish mediation.',
    alternative: 'Respiration, posture, movement, baseline state, demand effects and familiarity may influence physiological measures or reports. Expectation can contribute to a real experience without proving a frequency-specific mechanism.',
    test: 'In suitable existing data, compare acoustic-only predictions with models including preference, expectation and respiration using held-out observations. Failure of frequency to add predictive value challenges that specific explanatory model; predictive association still does not identify a causal pathway.',
    sourceUrls: [
      'https://www.pnas.org/doi/10.1073/pnas.1811878116',
      'https://www.frontiersin.org/journals/pain-research/articles/10.3389/fpain.2022.734999/full',
    ],
    access: 'Lunde publisher full text read. Ferreri indexed full-text methods/results checked; publisher access was intermittent. No drug instructions or proposed human intervention are provided.',
  },
  {
    id: 'sleep-feedback-vs-timer',
    title: 'Sleep feedback → timed response → uncertain benefit',
    physics: 'Closed-loop sound depends on a measured signal and a feedback decision. An open-loop timer plays independently of current EEG. Similar sound does not reproduce the timing relationship, sleep staging or feedback system of a laboratory study.',
    equation: 'e = wrap(φ_EEG(t_event) − φ_target). This is an observed phase error at a recorded event; no phase error can be established without EEG and reliable timestamps.',
    biology: 'Sleep research examines relationships among slow oscillations, spindles and memory. A sound-linked increase in an oscillatory feature is an intermediate response. Improved sleep or later memory is a separate outcome.',
    measured: 'Ngo et al. (2013) reported a positive memory result. Henin et al. (2019; n=12 and n=19) enhanced sleep oscillations without memory improvement. A 2025 Perrault et al. preprint (n=27) reported an acute slow-oscillation response without beneficial single-night sleep or memory effects.',
    inferenceGap: 'A browser envelope is not measured sleep EEG. Biomarker change alone cannot establish better sleep, restorative benefit or memory improvement. Population, timing accuracy and outcome selection limit transfer between studies.',
    alternative: 'State misclassification, delay, spontaneous sleep variation, task sensitivity and sound-related arousal can alter results. A single-night null does not rule out every longer-term effect.',
    test: 'Use archived EEG replay to test phase-estimation error and timestamp accuracy without exposing a listener. Separately assess existing controlled outcome data. Reliable neural enhancement with a precise absence of meaningful outcome benefit refutes the claim that this enhancement guarantees that benefit.',
    sourceUrls: [
      'https://pubmed.ncbi.nlm.nih.gov/23583623/',
      'https://www.eneuro.org/content/6/6/ENEURO.0306-19.2019',
      'https://www.medrxiv.org/content/10.1101/2025.03.04.25321710v1',
    ],
    access: 'Ngo: abstract checked. Henin: indexed full-text methods/discussion checked; continuous retrieval blocked. Perrault: abstract and indexed opening sections checked; cited version is a medRxiv preprint. OpenSync has no EEG feedback.',
  },
  {
    id: 'tactile-vibration',
    title: 'Contact vibration → somatosensation → uncertain comfort effect',
    physics: 'A contact actuator delivers displacement and acceleration through a mechanical interface. An air speaker delivers pressure through a different interface. Identical rate labels do not make these exposures interchangeable.',
    equation: 'a(t) = d²z(t)/dt²; a_rms = √mean[a(t)²]. Displacement z and acceleration a require physical measurement; browser audio samples are neither.',
    biology: 'Skin mechanoreceptors provide a plausible route to tactile perception and attention. A felt heartbeat-like rhythm may also affect interpretation of body signals. That second link is a hypothesis unless independently measured.',
    measured: 'Azevedo et al. (2017; n=52) reported lower arousal/anxiety with a wearable during speech anticipation. Lee et al. (2025 preprint) studied smartwatch feedback; its second study found no significant condition differences in heart rate, HRV, arousal or behavioral sleep-onset measures.',
    inferenceGap: 'The studies do not establish sleep treatment, a unique interoceptive pathway or equivalence to headphone audio. The 2025 sleep-onset proxy used tapping behavior, not a clinical sleep recording; nonsignificant trends are not demonstrated benefits.',
    alternative: 'Distraction, expectancy, contact comfort, motor noise and individual sensitivity may explain a response. A device-off control may differ in perceptibility as well as the proposed active mechanism.',
    test: 'First test the physical-equivalence claim with bench measurements of actual actuator motion. Different delivery refutes interchangeability even when rate labels match. For outcome claims, examine existing active-control results and intervals; a broad null leaves the effect uncertain.',
    sourceUrls: [
      'https://www.nature.com/articles/s41598-017-02274-2',
      'https://arxiv.org/html/2507.02432v1',
    ],
    access: 'Azevedo: indexed full-text methods/discussion checked; continuous Nature retrieval blocked. Lee: complete arXiv v1 text read; peer-reviewed status was not established. The wearable study is product-specific evidence.',
  },
  {
    id: 'ultrasound-modality-boundary',
    title: 'Medical ultrasound: a separate modality and evidence chain',
    physics: 'Medical ultrasound uses specialized transducers, acoustic coupling and device-specific control. An ideal wave equation describes propagation assumptions; it does not specify a real tissue field, a biological effect or a clinical result.',
    equation: '∂²p/∂t² = c²∇²p, for an ideal homogeneous linear medium. Geometry, boundaries and material behavior are additional inputs; this equation is not a treatment model.',
    biology: 'Mechanical and thermal interactions are studied in medical ultrasound. An FDA record documents a specific MR-guided focused-ultrasound device category. That regulatory evidence belongs to the named medical system and its indication.',
    measured: 'Kop et al. (2024) showed that auditory confounds could account for tested online effects attributed to transcranial ultrasound. Their control comparisons challenge a direct-neural interpretation in that setting, not every possible ultrasound effect.',
    inferenceGap: 'A response to specialized ultrasound cannot validate an audible preset. A physiological surrogate is not clinical benefit. Device authorization cannot be transferred to another signal, delivery system or intended use.',
    alternative: 'Audible by-products, expectation and other peripheral responses can mimic a proposed direct effect. Suitable controls must address these explanations before a direct mechanism is inferred.',
    test: 'Audit published claims for sensory-matched controls, preregistered endpoints and independent replication. Reproduction of the measured effect by a sound-only control refutes its claimed specificity to direct ultrasound action in that comparison. This is a literature-analysis question, not a home experiment.',
    sourceUrls: [
      'https://elifesciences.org/articles/88762',
      'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=P150038S037',
    ],
    access: 'FDA device record read. Kop: indexed full-text results/discussion checked; continuous eLife retrieval was blocked. No tissue targeting, exposure parameters or treatment instructions are included.',
  },
];

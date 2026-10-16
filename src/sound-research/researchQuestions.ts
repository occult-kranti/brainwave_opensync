/**
 * Proposed mechanism tests, not findings. Mathematical statements are
 * conditional model predictions; none establishes a biological outcome.
 * Links open existing tools that address only the stated software component.
 */
export interface DeepResearchQuestion {
  id: string;
  title: string;
  hypothesis: string;
  mathematicalPrediction: string;
  biologicalUnknown: string;
  nullModel: string;
  falsifier: string;
  control: string;
  simulationLink: '/sound-research' | '/quicklab' | '/nano-lab' | '/harmonics' | null;
  validationNeeded: string;
  status: 'Proposed';
  sourceUrls?: readonly string[];
}

export const DEEP_QUESTIONS: readonly DeepResearchQuestion[] = [
  {
    id: 'system-before-frequency',
    title: 'Does the response follow the system, or a named frequency?',
    hypothesis: 'A genuine linear resonance response should move with the system’s natural frequency and change with damping. A frequency label alone should not predict the same response across different systems.',
    mathematicalPrediction: 'For H(r,ζ) = [(1−r²)²+(2ζr)²]⁻¹ᐟ², H(0)=1 and H(1)=1/(2ζ). When ζ<1/√2, the displacement peak is at r=√(1−2ζ²). This is normalized displacement, not energy absorbed or healing.',
    biologicalUnknown: 'A tissue claim would additionally need measured coupling, geometry, boundary conditions, losses and a defined biological endpoint. A single mass–spring curve supplies none of those quantities.',
    nullModel: 'A flat transfer function, changes in input strength, or a playback-device resonance explains the apparent peak without a response specific to the object being studied.',
    falsifier: 'If a passive reference system with independently measured parameters fails the predicted peak shift within measurement uncertainty, reject this model for that system. A successful fit still does not establish a biological mechanism.',
    control: 'Compare the ideal curve with a flat-response model and altered damping; externally measure input and output separately. Include an instrument-only baseline so source or sensor peaks are not assigned to the object.',
    simulationLink: '/sound-research',
    validationNeeded: 'The bench can check algebra and parameter sensitivity. Physical validation needs calibrated measurements on a nonliving reference system. Biological inference would require separate qualified research and review; no tissue model is implemented.',
    status: 'Proposed',
  },
  {
    id: 'envelope-before-band-name',
    title: 'Does comfort follow the envelope rather than the band name?',
    hypothesis: 'Differences attributed to a named beat rate may instead depend on envelope shape, average power, spectrum and perceived loudness. These explanations should be tested before attributing a special state to the rate.',
    mathematicalPrediction: 'For x=A[(1−d/2)+(d/2)sin(2πfₘt)]sin(2πf꜀t), long-window mean square is A²[(1−d/2)²+d²/8]/2 when spectral components are distinct and cross terms average out. At d=1, RMS is A√3/4, versus A/√2 for an unmodulated tone.',
    biologicalUnknown: 'Equal digital RMS does not establish equal loudness, cochlear response, attention or comfort. A perceptual difference does not identify EEG entrainment or a clinical effect.',
    nullModel: 'Any preference is accounted for by loudness, roughness, detectability, order or expectation; the nominal rate contributes no independent explanation.',
    falsifier: 'A preregistered comparison that excludes a meaningful comfort difference after its stated controls would count against the proposed envelope effect. Conversely, a remaining difference would require replication, not a brain-state label.',
    control: 'Include zero modulation depth, a duplicate-audio condition and a carrier reference. Measure actual finite-buffer RMS and peaks; document remaining spectral differences rather than claiming that every acoustic property is matched.',
    simulationLink: '/nano-lab',
    validationNeeded: 'Existing tools compare digital constructions and spectra; they do not predict ratings. A dedicated matched-comparison interface and a reviewed adult listening study would be needed to test this proposal. No such result is recorded.',
    status: 'Proposed',
    sourceUrls: ['https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2017.00557/full'],
  },
  {
    id: 'tracking-versus-state',
    title: 'Can repeated responses explain an apparent EEG rhythm?',
    hypothesis: 'A spectral peak during rhythmic stimulation may be explained by repeated evoked responses, without an endogenous oscillator changing state. EEG tracking and changes in reported experience therefore need separate tests.',
    mathematicalPrediction: 'The linear null y(t)=Σh(t−tₙ)+ε(t) can have a peak at the repetition rate because Y(f)=H(f)Σexp(−i2πftₙ)+E(f). A matching peak alone does not select this model over an entrained-oscillator model.',
    biologicalUnknown: 'Recorded EEG depends on neural sources, measurement artifacts and analysis choices. Even evidence for an endogenous oscillation would not by itself identify relaxation, memory improvement or a disease outcome.',
    nullModel: 'Repeated sensory responses with an impulse response estimated independently from irregular events, stimulus leakage, or unrelated ongoing activity explain the frequency structure. An unconstrained response kernel could overfit either account.',
    falsifier: 'Held-out responses missed by the prespecified evoked-response model but predicted by an oscillator model would challenge this null. Persistence alone is insufficient: long response tails, omission responses and filter ringing must also be considered.',
    control: 'Include temporally irregular events, an unmodulated sound, stimulus-free intervals and equipment-artifact checks. Keep behavioral or comfort endpoints separate from EEG power and phase-locking measures.',
    simulationLink: null,
    validationNeeded: 'The current app has no EEG acquisition or validated neural-response model. Model comparison would need independently recorded data, prespecified preprocessing and trained neurophysiology oversight; prospective recordings need ethics review and consent.',
    status: 'Proposed',
    sourceUrls: [
      'https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2017.00557/full',
      'https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3001142',
    ],
  },
  {
    id: 'tuning-without-number-labels',
    title: 'Is there a special tuning effect beyond ordinary transposition?',
    hypothesis: 'Preferences attributed to a particular reference tuning may follow pitch familiarity or gradual changes in timbre and register, rather than a unique numerical value. A special-tuning claim must outperform that smoother explanation.',
    mathematicalPrediction: 'Multiplying every note by k preserves all frequency ratios: (kfᵢ)/(kfⱼ)=fᵢ/fⱼ. The shift is 1200log₂(k) cents; 432/440 gives about −31.77 cents. Neither expression contains a biological optimum.',
    biologicalUnknown: 'Pitch perception and preference can depend on hearing, musical training, memory and instrument response. Numerical symbolism does not specify a transduction mechanism or an independently measurable health endpoint.',
    nullModel: 'Ratings vary smoothly with transposition and individual familiarity. A special-value indicator adds no reliable prediction beyond that relation.',
    falsifier: 'A reproducible preference concentrated at the prespecified tuning, beyond nearby transpositions and surviving hidden labels, would challenge the smooth null. It would still be a preference result unless a different endpoint were independently tested.',
    control: 'Use nearby reference tunings and duplicate audio under neutral codes. Preserve tempo, arrangement and duration; simple playback-speed changes also alter tempo and cannot isolate tuning.',
    simulationLink: '/harmonics',
    validationNeeded: 'Harmonic Lab can inspect pitch ratios and generate original tones. It does not implement this complete blinded composition study, measure perception or validate a healing claim. The proposed comparison needs a documented renderer and a reviewed study design.',
    status: 'Proposed',
  },
  {
    id: 'difference-tone-accounting',
    title: 'Is the slow component in the signal, the equipment, or perception?',
    hypothesis: 'A perceived beat does not necessarily mean the pressure waveform contains a separate low-frequency tone. Some claimed difference-frequency effects may instead arise from envelopes, playback distortion or auditory processing.',
    mathematicalPrediction: 'A linear sum of tones at f₁ and f₂ has those two spectral lines. In the illustrative nonlinearity y=x+αx², the cross term creates components at |f₂−f₁| and f₁+f₂ proportional to αab. Setting α=0 removes these generated components, although beating remains perceptible.',
    biologicalUnknown: 'A polynomial demonstration does not identify the nonlinearity of air, a loudspeaker, an ear or tissue. Perceiving a slow beat does not establish delivery of a physical low-frequency stimulus elsewhere in the body.',
    nullModel: 'Linear superposition plus auditory perception explains the report; any measured extra line comes from the source, sensor or analysis rather than the claimed medium.',
    falsifier: 'A repeatable extra spectral component absent from the digital source and characterized playback/measurement controls would reject the purely linear account for that measured chain. It would not identify a therapeutic mechanism.',
    control: 'Compare each tone alone, the linear two-tone sum and the zero-nonlinearity calculation. Distinguish an envelope spectrum from the pressure-signal spectrum; check spectral leakage and instrument distortion before interpreting extra lines.',
    simulationLink: '/nano-lab',
    validationNeeded: 'NanoLab inspects synthesized signals; the current lab does not model nonlinear propagation or the ear. Independent calibrated acoustic measurements would be needed to locate a physical extra component. Any biological claim remains a separate question.',
    status: 'Proposed',
    sourceUrls: ['https://www.dsprelated.com/freebooks/pasp/Enhancing_Even_Harmonics.html'],
  },
  {
    id: 'expectation-versus-acoustics',
    title: 'Does the description change the experience of identical audio?',
    hypothesis: 'Descriptions, familiarity and perceived choice may influence comfort ratings even when the waveform is unchanged. Their contribution should be estimated alongside the acoustic contribution, rather than dismissed or attributed to a hidden frequency mechanism.',
    mathematicalPrediction: 'A proposed repeated-observation model is Δrating = βaudio·A + βlabel·L + βinteraction·A·L + βorder·O + ulistener + ε. Byte-identical audio has zero waveform difference; a label-associated rating difference cannot be caused by a changed waveform.',
    biologicalUnknown: 'A self-report difference could reflect experience, reporting expectations, memory or demand characteristics. It does not reveal which neural pathway changed or establish tissue recovery.',
    nullModel: 'βlabel=0 after the prespecified controls; variation reflects ordinary rating noise, order and listener differences. Another alternative is an acoustic effect that remains under neutral labels.',
    falsifier: 'An independently replicated label effect for identical audio would challenge the acoustic-only explanation. An uncertainty interval excluding the prespecified meaningful label effect would count against that label hypothesis; a nonsignificant result alone would not.',
    control: 'Include identical-audio repeats with neutral codes, an actual acoustic contrast, balanced order, initial preference and a no-difference option. Do not tell users that an unvalidated sound is a treatment to generate expectations.',
    simulationLink: null,
    validationNeeded: 'The app cannot simulate a person’s expectations or run this factorial study. A research version would need verified audio identity, randomized presentation and an analysis plan. Label manipulations or incomplete disclosure require prior ethics review and appropriate debriefing.',
    status: 'Proposed',
    sourceUrls: ['https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.873517/full'],
  },
];

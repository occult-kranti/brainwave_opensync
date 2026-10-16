/** Selected source relationships and our explicit model translations, checked 2026-10-16. */
export type NetworkDomain = 'Newton' | 'Tesla' | 'Physics' | 'Interpretation';
export type NetworkEdgeStatus = 'documented' | 'derived' | 'analogy' | 'unsupported';

export interface ResearchNetworkNode {
  id: string;
  label: string;
  domain: NetworkDomain;
  description: string;
}

export interface ResearchNetworkEdge {
  id: string;
  from: string;
  to: string;
  relation: string;
  status: NetworkEdgeStatus;
  explanation: string;
  missingBridge: string;
  sourceUrls: string[];
}

export interface NetworkExperiment {
  id: string;
  title: string;
  status: 'Proposed';
  setup: string;
  variables: string;
  prediction: string;
  control: string;
  falsifier: string;
  measurement: string;
  limits: string;
  sourceUrls: string[];
}

const SOURCES = {
  motion: 'https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00089',
  optics: 'https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00034',
  alchemy: 'https://newton.dlib.indiana.edu/text/ALCH00109/normalized',
  fluxions: 'https://www.newtonproject.ox.ac.uk/view/texts/diplomatic/NATP00100',
  hermetic: 'https://newton.dlib.indiana.edu/text/ALCH00017/normalized',
  theology: 'https://www.newtonproject.ox.ac.uk/view/texts/normalized/THEM00196',
  motor: 'https://patents.google.com/patent/US381968A/en',
  lecture: 'https://www.gutenberg.org/files/13476/13476-h/13476-h.htm',
  wireless: 'https://patents.google.com/patent/US645576A/en',
  radiant: 'https://patents.google.com/patent/US685957A/en',
  remote: 'https://patents.google.com/patent/US613809A/en',
  vedanta: 'https://www.ramakrishnavivekananda.info/vivekananda/volume_5/epistles_first_series/057_blessed_and_beloved.htm',
  oscillator: 'https://ocw.mit.edu/courses/18-034-honors-differential-equations-spring-2009/5143aa0eeba318f53ff7fc53c150b585_MIT18_034s09_lec07.pdf',
  kurs: 'https://www.sawaya.ecei.tohoku.ac.jp/common/item/pdf/doctor/091208.pdf',
  maxwell: 'https://jensen.thphys.uni-heidelberg.de/~ewerz/ps/Maxwell1865.pdf',
  sound: 'https://openstax.org/books/university-physics-volume-1/pages/17-2-speed-of-sound',
  schumann: 'https://ntrs.nasa.gov/api/citations/20120000051/downloads/20120000051.pdf',
  hearing: 'https://www.nidcd.nih.gov/health/how-do-we-hear',
  expectation: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.873517/full',
};

export const RESEARCH_NETWORK_SCOPE =
  'A selected, source-linked comparison checked 16 October 2026. Documented means a source states the relationship; it does not certify every claim in that source. Derived means our stated mathematical translation. Analogy preserves a limited comparison. Unsupported marks a proposed bridge not established by the inspected sources, not proof that no record could exist. Historical influence, device performance and biological outcomes require separate evidence. No entire-corpus or discovery claim is made.';

export const NETWORK_NODES: readonly ResearchNetworkNode[] = [
  { id: 'newton-motion', label: 'Motion and causes', domain: 'Newton', description: 'Newton’s geometrical work on motion supplies historical context for relating observed trajectories to forces. Modern oscillator equations below are our later translation.' },
  { id: 'newton-optics', label: 'Prisms and light', domain: 'Newton', description: 'Opticks compares refraction and mixtures through observations. A ray direction, spectrum and perceived colour are different observables.' },
  { id: 'newton-colour-music', label: 'Colour–music analogy', domain: 'Newton', description: 'Newton used musical proportions in a colour-circle construction. The printed analogy does not establish an acoustic-to-optical conversion law.' },
  { id: 'newton-alchemy', label: 'Chymical notebooks', domain: 'Newton', description: 'Selected manuscript entries record operations, masses and uncertain results. They are historical evidence of inquiry, not instructions or proof of transmutation.' },
  { id: 'newton-fluxions', label: 'Fluxions and inverses', domain: 'Newton', description: 'Newton’s working mathematics concerns quantities and their rates. Our modern inverse question asks what differentiation loses and which additional data identify a trajectory.' },
  { id: 'newton-interpretation', label: 'Interpretive texts', domain: 'Newton', description: 'An attributed Hermetic text copied by Newton and his theological interpretation are distinct source categories. Neither becomes a physical variable merely through shared vocabulary.' },
  { id: 'tesla-rotating-field', label: 'Rotating fields', domain: 'Tesla', description: 'Tesla’s motor patent describes independently supplied circuits producing progressive magnetic-pole motion. A normalized two-component plot illustrates only one idealization.' },
  { id: 'tesla-resonant-circuit', label: 'Resonant apparatus', domain: 'Tesla', description: 'Tesla’s 1892 lecture discusses capacitance, self-induction, tuning and losses. A linear RLC model omits much of that apparatus.' },
  { id: 'tesla-wireless', label: 'Wireless proposals', domain: 'Tesla', description: 'The transmission patent records a proposed source, path and receiver. A grant of a patent does not measure end-to-end efficiency.' },
  { id: 'tesla-radiant-storage', label: 'Radiant-input storage', domain: 'Tesla', description: 'A patent proposes collecting external input into a condenser and supplying a load. Storage and collection must remain separate from the source of energy.' },
  { id: 'tesla-remote-control', label: 'Commands versus power', domain: 'Tesla', description: 'The remote-vessel patent distinguishes received commands from onboard propulsion energy. Communication is not automatically power delivery.' },
  { id: 'tesla-vedanta', label: 'An anticipated proof', domain: 'Tesla', description: 'Vivekananda’s 1896 letter reports Tesla’s interest and an expected mathematical demonstration. It is a contemporary report of an expectation, not the missing demonstration itself.' },
  { id: 'mechanical-oscillator', label: 'Mechanical oscillator', domain: 'Physics', description: 'A mass, linear restoring force and velocity-dependent damping produce a second-order equation with specified units and initial conditions.' },
  { id: 'rlc-oscillator', label: 'Series RLC model', domain: 'Physics', description: 'Charge, current, capacitance, inductance and resistance define an electrical oscillator. The chosen output determines which response peak is being discussed.' },
  { id: 'coupled-resonators', label: 'Coupled resonators', domain: 'Physics', description: 'Two modes exchange stored energy through a coupling coefficient while source, internal loss and load have separate roles.' },
  { id: 'energy-loss', label: 'Energy and loss', domain: 'Physics', description: 'An energy balance accounts for supplied power, changing stored energy, useful output and dissipated or radiated power.' },
  { id: 'maxwell-wave', label: 'Electromagnetic waves', domain: 'Physics', description: 'Electric and magnetic fields obey electromagnetic constitutive relations. Vacuum wave speed is not the speed of acoustic pressure disturbances.' },
  { id: 'acoustic-wave', label: 'Acoustic waves', domain: 'Physics', description: 'Small pressure disturbances propagate through a material medium. Their speed depends on mechanical material properties.' },
  { id: 'schumann-cavity', label: 'Earth–ionosphere modes', domain: 'Physics', description: 'Lightning-excited electromagnetic modes depend on a spherical cavity and its lossy, variable boundaries. They are not an exact universal tuning constant.' },
  { id: 'phase-circle', label: 'Phase geometry', domain: 'Physics', description: 'Equal-amplitude orthogonal sinusoidal components trace a circle only in quadrature; other phase differences generally give an ellipse or line.' },
  { id: 'perception', label: 'Perception and context', domain: 'Interpretation', description: 'Sensory input, expectation, preference and measured experience require their own evidence. No node represents a predicted health response.' },
  { id: 'numerology-claims', label: 'Number-based claims', domain: 'Interpretation', description: 'Claims of special numbers or universal vibration are candidate assertions to define and test, not extra physical laws.' },
  { id: 'evidence-controls', label: 'Controls and tests', domain: 'Interpretation', description: 'Specified observables, negative controls, uncertainty and failed predictions constrain which connections survive.' },
];

export const NETWORK_EDGES: readonly ResearchNetworkEdge[] = [
  {
    id: 'motion-to-oscillator', from: 'newton-motion', to: 'mechanical-oscillator', relation: 'Modern force-law specialization', status: 'derived',
    explanation: 'With a fixed mass and assumed forces −kx and −bẋ, the modern equation is mẍ + bẋ + kx = F(t). This is our specialization, not a quotation from the selected Newton manuscript.',
    missingBridge: 'An actual object requires measured stiffness, damping and force; a trajectory alone need not identify them uniquely.', sourceUrls: [SOURCES.motion, SOURCES.oscillator],
  },
  {
    id: 'mechanical-to-rlc', from: 'mechanical-oscillator', to: 'rlc-oscillator', relation: 'Equivalent normalized differential equations', status: 'derived',
    explanation: 'Lq̈ + Rq̇ + q/C = V(t) has the same linear form under x↔q, m↔L, b↔R and k↔1/C. Corresponding coefficients have different physical units.',
    missingBridge: 'The map preserves equation structure, not material identity or a device-independent conversion of energy.', sourceUrls: [SOURCES.oscillator],
  },
  {
    id: 'mechanical-energy', from: 'mechanical-oscillator', to: 'energy-loss', relation: 'Mechanical energy balance', status: 'derived',
    explanation: 'For E = mẋ²/2 + kx²/2, differentiation gives dE/dt = Fẋ − bẋ². Without input, positive damping cannot increase total stored energy.',
    missingBridge: 'Real friction, nonlinear stiffness and other modes must be included when they are not negligible.', sourceUrls: [SOURCES.oscillator],
  },
  {
    id: 'rlc-energy', from: 'rlc-oscillator', to: 'energy-loss', relation: 'Electrical energy balance', status: 'derived',
    explanation: 'With i=q̇ and E = Li²/2 + q²/(2C), dE/dt = Vi − Ri². A large capacitor voltage at resonance does not imply net energy creation.',
    missingBridge: 'A hardware claim additionally needs calibrated input/output power and all loss channels.', sourceUrls: [SOURCES.oscillator],
  },
  {
    id: 'tesla-rlc-reduction', from: 'tesla-resonant-circuit', to: 'rlc-oscillator', relation: 'Limited lumped-circuit reconstruction', status: 'analogy',
    explanation: 'A single linear RLC mode illustrates tuning and damping discussed in the lecture. It does not reproduce distributed coils, discharge behavior or every component.',
    missingBridge: 'A historical-device replica would require a circuit reconstruction, material data and measured validation beyond this model.', sourceUrls: [SOURCES.lecture, SOURCES.oscillator],
  },
  {
    id: 'motor-phase-model', from: 'tesla-rotating-field', to: 'phase-circle', relation: 'Ideal quadrature projection', status: 'derived',
    explanation: 'Our idealization Bx=B₀cosθ, By=B₀sinθ has constant magnitude B₀ and rotates. The patent documents progressive pole motion, not this complete modern motor model.',
    missingBridge: 'Torque, rotor slip, winding geometry, magnetic saturation and load are not established by a circle animation.', sourceUrls: [SOURCES.motor],
  },
  {
    id: 'phase-circuit-language', from: 'phase-circle', to: 'rlc-oscillator', relation: 'Shared sinusoidal representation', status: 'analogy',
    explanation: 'Phasors can describe both orthogonal components and voltage/current phase. A geometric angle is a representation; it does not make these two systems the same apparatus.',
    missingBridge: 'The represented observable and its reference must be identified before comparing phases.', sourceUrls: [SOURCES.motor, SOURCES.oscillator],
  },
  {
    id: 'tesla-tuned-receiver', from: 'tesla-resonant-circuit', to: 'tesla-wireless', relation: 'Patent describes synchronized circuits', status: 'documented',
    explanation: 'US645576A describes transmitting and receiving arrangements adjusted for synchronism. This documents the proposed mechanism in the patent.',
    missingBridge: 'The document alone does not establish delivered power, efficiency or success over its proposed propagation path.', sourceUrls: [SOURCES.wireless],
  },
  {
    id: 'tesla-kurs-comparison', from: 'tesla-wireless', to: 'coupled-resonators', relation: 'Explicit historical comparison in a later paper', status: 'documented',
    explanation: 'Kurs et al. (2007) mention Tesla’s earlier wireless-power work and cite a Tesla patent before presenting their own near-field system.',
    missingBridge: 'A citation is not replication of Tesla’s architecture or confirmation of every earlier transmission claim.', sourceUrls: [SOURCES.kurs],
  },
  {
    id: 'rlc-coupling-reduction', from: 'rlc-oscillator', to: 'coupled-resonators', relation: 'Add a second mode and explicit coupling', status: 'derived',
    explanation: 'A two-mode reduction adds a coupling rate κ and separate decay rates. Matching isolated resonance frequencies is insufficient if coupling is negligible.',
    missingBridge: 'The coupling and loss coefficients must be derived or measured for an actual geometry; this network does not supply a hardware design.', sourceUrls: [SOURCES.kurs],
  },
  {
    id: 'transfer-loss-boundary', from: 'coupled-resonators', to: 'energy-loss', relation: 'Transfer efficiency has a declared boundary', status: 'documented',
    explanation: 'Kurs distinguishes resonator-to-load transfer from wall-to-load efficiency; its example gives about 40–50% for transfer and 15% overall. Source losses cannot be omitted from an overall claim.',
    missingBridge: 'Performance cannot be transferred to another device without its input, load, losses and measurement uncertainty.', sourceUrls: [SOURCES.kurs],
  },
  {
    id: 'maxwell-to-coupled', from: 'maxwell-wave', to: 'coupled-resonators', relation: 'Electromagnetic mode reduction', status: 'derived',
    explanation: 'Localized electromagnetic modes can motivate reduced coupling equations under stated assumptions. Near fields do not generally obey a far-field plane-wave E/H relationship.',
    missingBridge: 'A two-number mode model cannot recover spatial fields without geometry, constitutive properties and boundary conditions.', sourceUrls: [SOURCES.maxwell, SOURCES.kurs],
  },
  {
    id: 'light-sound-wave-form', from: 'maxwell-wave', to: 'acoustic-wave', relation: 'Similar wave-equation form, different fields', status: 'analogy',
    explanation: 'Vacuum electromagnetism gives c=1/√(ε₀μ₀). A small longitudinal disturbance in an ideal fluid has cₛ=√(B/ρ). Both permit λ=speed/f; their fields and constitutive quantities differ.',
    missingBridge: 'A shared frequency or differential-equation form does not provide a physical transducer or common biological interaction.', sourceUrls: [SOURCES.maxwell, SOURCES.sound],
  },
  {
    id: 'maxwell-schumann', from: 'maxwell-wave', to: 'schumann-cavity', relation: 'Electromagnetic cavity modes observed', status: 'documented',
    explanation: 'Simões, Pfaff and Freudenreich report electromagnetic resonance signatures with electric-field measurements from C/NOFS. The cavity is associated with Earth and the ionosphere.',
    missingBridge: 'An ideal closed cavity cannot describe the reported leakage without realistic upper-boundary properties.', sourceUrls: [SOURCES.schumann],
  },
  {
    id: 'schumann-loss', from: 'schumann-cavity', to: 'energy-loss', relation: 'Finite conductivity and boundary leakage', status: 'documented',
    explanation: 'The paper distinguishes thin, lossless-cavity frequencies from lower observed peaks and finite bandwidths. It discusses losses, boundary variability and ionospheric leakage.',
    missingBridge: 'A quantitative local prediction requires current geophysical conditions and instrument response; 7.8 Hz is not an exact universal constant.', sourceUrls: [SOURCES.schumann],
  },
  {
    id: 'schumann-to-experience', from: 'schumann-cavity', to: 'perception', relation: 'Frequency overlap would imply a mental state', status: 'unsupported',
    explanation: 'An Earth-cavity frequency near an EEG-band label does not identify a causal pathway or demonstrate an experience. The cited atmospheric study does not test that claim.',
    missingBridge: 'Measured exposure, biological coupling, a prespecified endpoint and controlled outcome evidence are absent from this proposed bridge.', sourceUrls: [SOURCES.schumann, SOURCES.hearing],
  },
  {
    id: 'sound-to-hearing', from: 'acoustic-wave', to: 'perception', relation: 'Auditory transduction pathway', status: 'documented',
    explanation: 'NIDCD describes mechanical transmission through the ear and conversion into neural signals. That pathway supports hearing, not a prediction of mood or treatment benefit.',
    missingBridge: 'A specific experience or outcome still requires its own measurements and comparison.', sourceUrls: [SOURCES.hearing],
  },
  {
    id: 'oscillator-to-acoustics', from: 'mechanical-oscillator', to: 'acoustic-wave', relation: 'Continuum generalization needs new assumptions', status: 'analogy',
    explanation: 'A vibrating mechanical source can excite pressure waves, but one displacement coordinate does not describe a propagating spatial field. Distributed inertia and compressibility add degrees of freedom.',
    missingBridge: 'Geometry, medium, coupling and boundary conditions are needed to predict acoustic radiation.', sourceUrls: [SOURCES.oscillator, SOURCES.sound],
  },
  {
    id: 'newton-to-maxwell', from: 'newton-optics', to: 'maxwell-wave', relation: 'Later model of an overlapping observable', status: 'analogy',
    explanation: 'Newton’s refraction observations and Maxwell’s electromagnetic account concern light. Comparing their predictions is legitimate; assigning Maxwell’s theory to Newton is not.',
    missingBridge: 'Agreement in a geometric-optics limit does not equate the authors’ ontologies or prove a direct historical transmission path.', sourceUrls: [SOURCES.optics, SOURCES.maxwell],
  },
  {
    id: 'newton-musical-circle', from: 'newton-optics', to: 'newton-colour-music', relation: 'Musical proportions printed in Opticks', status: 'documented',
    explanation: 'Book I, Part II, Proposition VI uses musical proportions in a colour-circle construction and estimates a mixture through a weighted centre.',
    missingBridge: 'The historical construction is not a calibrated modern colour space or a universal colour-to-pitch law.', sourceUrls: [SOURCES.optics],
  },
  {
    id: 'colour-to-audio', from: 'newton-colour-music', to: 'acoustic-wave', relation: 'Designer-chosen sonification', status: 'analogy',
    explanation: 'A software designer may map a colour coordinate to pitch using an explicit rule. Many rules fit the same data; the selected mapping is an artistic or analytical choice.',
    missingBridge: 'No unique map from optical wavelength to audible pitch follows from the historical proportion scheme.', sourceUrls: [SOURCES.optics, SOURCES.sound],
  },
  {
    id: 'colour-mixture-limit', from: 'newton-colour-music', to: 'perception', relation: 'Historical model includes an observed limit', status: 'documented',
    explanation: 'Newton qualifies his mixture rule and reports that two-colour combinations can disagree with it. A source can document both a proposal and its counterexample.',
    missingBridge: 'Modern perceptual accuracy would require calibrated light spectra and observer measurements, not a rendered colour wheel alone.', sourceUrls: [SOURCES.optics],
  },
  {
    id: 'alchemy-to-tesla', from: 'newton-alchemy', to: 'tesla-wireless', relation: 'Alchemical transmission to Tesla is alleged', status: 'unsupported',
    explanation: 'The selected Newton notebook and Tesla patent establish separate records. Neither inspected record supplies a chain of influence between them.',
    missingBridge: 'Dated correspondence, ownership/reading evidence or an explicit attributable citation connecting the ideas is missing.', sourceUrls: [SOURCES.alchemy, SOURCES.wireless],
  },
  {
    id: 'numbers-to-tesla', from: 'numerology-claims', to: 'tesla-resonant-circuit', relation: 'Special integers would determine resonance', status: 'unsupported',
    explanation: 'The circuit model sets frequency through components and damping. The inspected lecture does not establish a universal 3–6–9 rule. This is a bounded source conclusion, not an exhaustive quotation audit.',
    missingBridge: 'A traceable primary statement and a physical model with a discriminating numerical prediction are required.', sourceUrls: [SOURCES.lecture, SOURCES.oscillator],
  },
  {
    id: 'numbers-to-energy', from: 'numerology-claims', to: 'energy-loss', relation: 'A resonance label would imply free energy', status: 'unsupported',
    explanation: 'Changing a name or selecting an integer does not add a source term to an energy balance. Increased amplitude under continuous driving is compatible with ordinary energy input.',
    missingBridge: 'A contrary device claim needs a complete independently measured energy balance, including storage changes and hidden inputs.', sourceUrls: [SOURCES.oscillator],
  },
  {
    id: 'numbers-to-controls', from: 'numerology-claims', to: 'evidence-controls', relation: 'Translate a claim into a matched null', status: 'derived',
    explanation: 'Our test separates a number label from the encoded waveform. Identical samples imply identical digital spectra regardless of the label; perception would require a separate study.',
    missingBridge: 'Label effects cannot be inferred from sample equality. The existing format-label study is a methodological example, not a test of these particular claims.', sourceUrls: [SOURCES.expectation],
  },
  {
    id: 'controls-to-experience', from: 'evidence-controls', to: 'perception', relation: 'Expectation is a competing explanation', status: 'documented',
    explanation: 'Enstroem and Schmaltz varied actual music format and claimed format in a listening study. Their result motivates separating signal properties from labels and expectations.',
    missingBridge: 'A result about format judgments does not establish a universal placebo effect, a health benefit or the outcome of the proposed number-label experiment.', sourceUrls: [SOURCES.expectation],
  },
  {
    id: 'fluxions-inverse-motion', from: 'newton-fluxions', to: 'newton-motion', relation: 'Our inverse-information comparison', status: 'derived',
    explanation: 'In modern notation, all trajectories y=x²+C have derivative 2x. Integrating a rate requires an initial value; inferring motion from an outline also requires a time parametrization.',
    missingBridge: 'The manuscript connection motivates this example; it is not evidence that one observed derivative uniquely reconstructs every physical cause.', sourceUrls: [SOURCES.fluxions, SOURCES.motion],
  },
  {
    id: 'fluxions-error-control', from: 'newton-fluxions', to: 'evidence-controls', relation: 'Differentiate with an error model', status: 'derived',
    explanation: 'Our forward difference [y(t+h)−y(t)]/h has noise variance 2σ²/h² for independent equal-variance measurement errors. A smaller step can amplify noise even as smooth-function truncation bias decreases.',
    missingBridge: 'This variance formula needs the stated independence model; correlated samples or uncertain time require a different error calculation.', sourceUrls: [SOURCES.fluxions],
  },
  {
    id: 'correspondence-identifiability', from: 'newton-interpretation', to: 'mechanical-oscillator', relation: 'Turn correspondence into an explicit map', status: 'analogy',
    explanation: 'Our operational question replaces a broad correspondence with named observables. Scaling k and m equally preserves √(k/m) while changing static compliance 1/k.',
    missingBridge: 'The historical Hermetic text supplies no such parameter map. Matching a frequency does not identify a whole system or validate its metaphysics.', sourceUrls: [SOURCES.hermetic, SOURCES.oscillator],
  },
  {
    id: 'interpretation-vedanta-comparison', from: 'newton-interpretation', to: 'tesla-vedanta', relation: 'Compare interpretive roles without merging traditions', status: 'analogy',
    explanation: 'These records permit a methodological comparison: what is an attributed text, an interpretive dictionary or an anticipated proof? Hermetic writing, Newton’s theology and Vedanta remain distinct.',
    missingBridge: 'No inspected source establishes Newton-to-Tesla transmission, a shared doctrine or equivalence between these religious/philosophical traditions.', sourceUrls: [SOURCES.hermetic, SOURCES.theology, SOURCES.vedanta],
  },
  {
    id: 'radiant-storage-budget', from: 'tesla-radiant-storage', to: 'energy-loss', relation: 'Patent names an external input and stored charge', status: 'documented',
    explanation: 'US685957A describes external radiation, accumulation in a condenser and a local output circuit. The source document does not describe energy appearing without input.',
    missingBridge: 'Actual input current, leakage, conversion mechanism and load energy need independent measurement; the proposed microscopic explanation is not certified.', sourceUrls: [SOURCES.radiant],
  },
  {
    id: 'remote-battery-budget', from: 'tesla-remote-control', to: 'energy-loss', relation: 'Patent separates control from propulsion energy', status: 'documented',
    explanation: 'US613809A describes received control disturbances and a propulsion motor powered by onboard storage batteries. A command channel and an energy supply perform different jobs.',
    missingBridge: 'Range, command reliability, battery capacity and delivered mechanical work are separate measurements, absent from a state-machine illustration.', sourceUrls: [SOURCES.remote],
  },
  {
    id: 'vedanta-proof-status', from: 'tesla-vedanta', to: 'evidence-controls', relation: 'A letter records expectation rather than completion', status: 'documented',
    explanation: 'Vivekananda’s letter of 13 February 1896 reports an anticipated mathematical demonstration. The letter does not contain that demonstration or the proposed confirming measurements.',
    missingBridge: 'A completed attributable derivation, operational definitions and independent tests would be required to advance the physical claim.', sourceUrls: [SOURCES.vedanta],
  },
];

export const EXPERIMENTS: readonly NetworkExperiment[] = [
  {
    id: 'experiment-rlc-loss-detuning', title: 'Which resonance peak are we plotting?', status: 'Proposed',
    setup: 'Inspect the digital series-RLC model first. A separate teaching analogue can use an isolated, current-limited signal source at ≤1 V RMS, passive resistor/inductor/capacitor in series, a capacitor-voltage probe and a known series current-sense resistor. This is a proposed bench comparison, not a patent replica.',
    variables: 'r=ω/ω₀ and ζ=R√(C/L)/2 are dimensionless; ω₀=1/√(LC) is in rad/s. Record R, L, C, their tolerances, calibrated open-circuit source amplitude, source impedance, inductor resistance and probe loading.',
    prediction: 'Capacitor gain H=[(1−r²)²+(2ζr)²]⁻¹/² peaks at r=√(1−2ζ²) only for ζ<1/√2. Current magnitude is proportional to rH and peaks at r=1 for positive damping.',
    control: 'Use the analytic limits H(0)=1 and H(1)=1/(2ζ); compare numerical peaks with analytic locations and refine the grid around each peak.',
    falsifier: 'Persistent disagreement beyond the declared sampling/integration tolerance rejects the numerical implementation; it does not refute the historical author.',
    measurement: 'Compare measured capacitor RMS voltage and current inferred from the sense-resistor voltage against the same model, including source and winding resistance in total R. Export output name, units and uncertainty; gain is not efficiency.',
    limits: 'Use an isolated low-energy circuit and measurements within component/probe ratings; no mains, high voltage, radiating transmitter or body connection. The digital model omits parasitics beyond stated lumped values. No bench measurements have been performed here.',
    sourceUrls: [SOURCES.oscillator],
  },
  {
    id: 'experiment-phase-circle-line', title: 'Circle, ellipse or line?', status: 'Proposed',
    setup: 'Sample two normalized orthogonal components x=cosθ and y=cos(θ−φ) over one complete cycle in a digital phase plot.',
    variables: 'θ and φ in radians internally; display degrees with an explicit conversion. Component amplitudes are dimensionless, not measured magnetic flux density.',
    prediction: 'φ=π/2 gives x²+y²=1; φ=0 gives y=x. Signed enclosed area is πsinφ, so reversing phase reverses orientation without changing the equal-amplitude scale.',
    control: 'Include zero phase, ±π/2 and amplitude imbalance. Test periodic endpoint closure and compare polygon area at increasing sample counts.',
    falsifier: 'A nonzero enclosed area at zero phase, or failure to converge toward π at quadrature, rejects the chosen plot/area calculation.',
    measurement: 'Track radius variation, signed area and phase; distinguish mathematical orientation from a measured motor rotation.',
    limits: 'This is a phasor illustration, not a motor replica. Rotor dynamics, torque, load and real field geometry remain unmodeled.',
    sourceUrls: [SOURCES.motor],
  },
  {
    id: 'experiment-refraction-null', title: 'Refraction with and without dispersion', status: 'Proposed',
    setup: 'Start with the implemented single-interface ray model; a two-interface dispersive prism is a proposed extension. A separate passive tabletop analogue uses a diffuse visible LED, slit, transparent prism, angle scale and matte screen to compare incident and emergent ray directions.',
    variables: 'Refractive index n is dimensionless; incidence and refraction angles are measured from the interface normal. Wavelength units must be recorded when a dispersion function is used.',
    prediction: 'At each transparent interface n₁sinθ₁=n₂sinθ₂. Setting all colour channels to the same index removes dispersive angular separation in the geometric model.',
    control: 'Check normal incidence and identical media. Reverse a transmitted ray to test reciprocity; reject rather than invent a real angle if the sine condition exceeds one.',
    falsifier: 'Residual angular splitting with a constant index, or a nonzero Snell residual beyond tolerance, rejects the implementation or its stated assumptions.',
    measurement: 'Record outgoing angle and n₁sinθ₁−n₂sinθ₂. An RGB illustration is not a spectrometer measurement or a perceptually calibrated spectrum.',
    limits: 'Geometric optics omits diffraction, polarization, Fresnel power and absorption. Use diffuse low-intensity illumination, without lasers or focused sunlight. Dispersion and tabletop measurements remain proposed; this is a teaching analogue, not Newton’s complete apparatus.',
    sourceUrls: [SOURCES.optics, SOURCES.maxwell],
  },
  {
    id: 'experiment-wave-medium', title: 'Same rate, different physical wave', status: 'Proposed',
    setup: 'Compare digital wave calculations for ideal air and vacuum electromagnetism. Keep frequency symbolic or bounded within the educational model; do not emit electromagnetic fields.',
    variables: 'Frequency f in Hz, speed v in m/s and wavelength λ in m. The waveform vertical axis must identify pressure or field rather than an unspecified energy.',
    prediction: 'Both have period 1/f, while λ=v/f differs by the speed ratio. An audio amplitude envelope at a cavity-like rate does not recreate the Earth’s electromagnetic mode.',
    control: 'Double f with speed fixed: period and wavelength must both halve. Change only speed: period must stay fixed. Include the thin-sphere estimate f₁=c√2/(2πR), without fitting it to 7.8 Hz.',
    falsifier: 'Failure of the scaling identities rejects the calculation. The ideal Earth-radius result near 10.6 Hz, compared with an observed peak near 7.8 Hz, rejects treating that ideal cavity as an exact Earth model.',
    measurement: 'Export medium, speed assumption, radius if used, frequency, period and wavelength separately. Compare geophysical observations with their own instrument metadata.',
    limits: 'No acoustic–electromagnetic transduction, local field strength or biological response is simulated. The ideal cavity comparison is a proposed calculation, not a new geophysical measurement.',
    sourceUrls: [SOURCES.sound, SOURCES.maxwell, SOURCES.schumann],
  },
  {
    id: 'experiment-coupled-loss', title: 'Exchange energy without creating it', status: 'Proposed',
    setup: 'A proposed offline two-mode solver starts with energy in one mode, then evolves freely with real reciprocal coupling and nonnegative decay rates. Treat this as an extension unless the solver is present.',
    variables: 'Complex amplitudes a₁,a₂ have units √J; |a|² is stored energy. Coupling κ, detuning and amplitude decay rates γ have units s⁻¹. Set external forcing to zero for this test.',
    prediction: 'For ȧ₁=(iω₁−γ₁)a₁+iκa₂ and ȧ₂=(iω₂−γ₂)a₂+iκa₁, d(|a₁|²+|a₂|²)/dt=−2γ₁|a₁|²−2γ₂|a₂|². Mode energy can rise while total energy falls.',
    control: 'Set κ=0, then set both γ to zero. Compare equal and detuned modes at fixed coupling; independently reduce the integration step and check the energy residual.',
    falsifier: 'Total energy growth beyond numerical tolerance in the unforced passive model rejects the implementation. Resonance matching with κ=0 cannot transfer energy.',
    measurement: 'Store each mode energy, total energy, accumulated dissipated energy and conservation residual. A later driven/load model must declare its efficiency boundary.',
    limits: 'This equation test does not specify coils, voltage, radiated fields or hardware. Experimental transfer efficiencies belong to the cited apparatus, not to this proposed solver.',
    sourceUrls: [SOURCES.kurs],
  },
  {
    id: 'experiment-number-label-null', title: 'Separate the label from the signal', status: 'Proposed',
    setup: 'First make two offline copies of the same synthesized sample array with different descriptive metadata. Audit equality before considering any separate, ethically reviewed perception study.',
    variables: 'Audio bytes, sample rate, gain and duration are fixed; only the proposed descriptive label differs. Any later rating endpoint and smallest meaningful difference must be specified in advance.',
    prediction: 'Identical arrays have identical digital RMS and spectra. They cannot test whether labels change experience. A later blinded/balanced design could separate acoustic and expectation hypotheses.',
    control: 'Include an identical neutral-label pair and a deliberately altered-signal check that the analysis should detect. Randomization or permitted masking belongs to a reviewed future study, not the current app.',
    falsifier: 'A spectral difference between byte-identical arrays rejects the analysis. For a future label-effect claim, a precise interval excluding its prespecified meaningful effect would count against that claim.',
    measurement: 'Record array hashes, maximum sample difference and spectrum residual. Keep hypothetical experience ratings separate from those digital checks.',
    limits: 'No participant results are generated. A label effect would not establish special-number physics, a historical Tesla attribution or a health outcome.',
    sourceUrls: [SOURCES.expectation, SOURCES.lecture],
  },
];

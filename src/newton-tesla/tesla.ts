export type TeslaRecord = {
  id: string;
  title: string;
  date: string;
  kind: string;
  locator: string;
  documented: string;
  modernModel: string;
  missingBridge: string;
  counterexample: string;
  experimentIdea: string;
  url: string;
  access: string;
};

export const TESLA_SURVEY_SCOPE =
  'Nine selected records checked 16 October 2026: six U.S. patents, one lecture, one contemporary letter and one retrospective account. These are documents, not an invention count or an exhaustive Tesla corpus. Equations are modern teaching models; experiments are digital proposals.';

export const TESLA_RECORDS: readonly TeslaRecord[] = [
  {
    id: 'tesla-rotating-field',
    title: 'Phase and the rotating magnetic field',
    date: '1888-05-01 · patent grant',
    kind: 'Patent · generator-powered motor',
    locator: 'US381968A · description of Figs. 1–9; claims 1–3',
    documented: 'Corresponding generator and motor circuits shift the magnetic poles progressively. The generator supplies energy; the shaft carries a mechanical load.',
    modernModel: 'Equal orthogonal components Bx = B0 cos(ωt), By = B0 sin(ωt) trace a circle. Real shaft output also depends on rotor dynamics, winding heat, core losses and friction.',
    missingBridge: 'A rotating field diagram alone predicts neither motor efficiency nor biological effects. The patent includes different motor arrangements; one ideal circle does not reproduce them all.',
    counterexample: 'Make the components in phase: the path becomes a line. Reverse one component: the rotation reverses.',
    experimentIdea: 'Plot the field vector while varying phase and amplitude; compare its minimum and maximum magnitude.',
    url: 'https://patents.google.com/patent/US381968A/en',
    access: 'Selected description and claims read; original first drawing sheet checked. Patent OCR contains errors; no performance measurements independently verified.',
  },
  {
    id: 'tesla-lighting',
    title: 'Stored energy and coupled coils',
    date: '1891-06-23 · patent grant',
    kind: 'Patent · electrical lighting system',
    locator: 'US454622A · Figs. 1–3; claims 1–6',
    documented: 'An external supply charges a condenser; its changing current acts through coupled coils to power lighting. The description explicitly addresses energy dissipation.',
    modernModel: 'A coupled-circuit model uses mutual inductance M = k√(L1L2). Stored energy changes by source work minus heating, dielectric loss and energy delivered to the load.',
    missingBridge: 'Voltage buildup is not energy creation. A linear circuit omits discharge behavior, parasitic capacitance and lamp physics; no efficiency figure is established here.',
    counterexample: 'With zero coupling and an initially empty receiver, this model transfers no energy to that receiver.',
    experimentIdea: 'Compare two virtual oscillators with coupling enabled and disabled; display supplied, stored, dissipated and delivered energy.',
    url: 'https://patents.google.com/patent/US454622A/en',
    access: 'Description, selected claims and original drawing sheet read. Historical operating instructions are not reproduced.',
  },
  {
    id: 'tesla-resonant-circuit',
    title: 'Tuning requires losses and measurement',
    date: '1892-02 · London lecture',
    kind: 'Contemporary lecture · selected passages',
    locator: 'Experiments with Alternate Currents of High Potential and High Frequency · coil adjustment and gaseous losses',
    documented: 'Tesla discusses changing capacitance and self-induction, empirical adjustment and energy losses. He explicitly leaves a proposed loss law awaiting experimental confirmation.',
    modernModel: 'For charge q: Lq″ + Rq′ + q/C = V(t). With E = L(q′)²/2 + q²/(2C), E′ = Vq′ − R(q′)². Resonant buildup requires input energy.',
    missingBridge: 'This linear RLC model is our reconstruction, not a complete model of the historical apparatus or a sound-healing mechanism.',
    counterexample: 'Switch off the drive with positive resistance: stored energy decays. Increasing loss changes the response even at the same nominal tuning.',
    experimentIdea: 'Sweep drive frequency and damping in a virtual oscillator, then compare forced response with free decay.',
    url: 'https://www.gutenberg.org/files/13476/13476-h/13476-h.htm',
    access: 'Public-domain transcription: selected tuning and loss passages read. The entire lecture and every demonstration were not audited.',
  },
  {
    id: 'tesla-wireless',
    title: 'Wireless power: a propagation proposal',
    date: '1900-03-20 · patent grant',
    kind: 'Patent · proposed natural-media transmission',
    locator: 'US645576A · transmitter/receiver drawing; claims 1–4 and 6–9',
    documented: 'The proposal includes a generator, elevated terminals, earth connections and receiving loads. It assumes a sufficiently conducting atmospheric path and coordinated transmitter/receiver response.',
    modernModel: 'Account for source power, propagation loss, stored field energy and load power. A pair of coupled oscillators is only a local analogy, not an Earth-propagation calculation.',
    missingBridge: 'The patent does not supply independently verified global delivery efficiency. Atmospheric coupling, grounding, leakage and receiver loading require measurement; no universal Earth frequency follows.',
    counterexample: 'Matching two frequencies cannot compensate for a zero transfer path. An unloaded voltage peak does not establish useful delivered power.',
    experimentIdea: 'In a virtual transfer model, vary attenuation and receiver load separately from tuning; compare voltage with load power.',
    url: 'https://patents.google.com/patent/US645576A/en',
    access: 'Selected description, specified claims and original drawing read. Historical claims are attributed; field performance is not certified.',
  },
  {
    id: 'tesla-radiant-energy',
    title: 'Radiant input, stored charge and a load',
    date: '1901-11-05 · patent grant',
    kind: 'Patent · proposed energy collection',
    locator: 'US685957A · Figs. 1–4; claims 2–6',
    documented: 'Radiation acts on an exposed conductor connected to a condenser; accumulated charge operates a local circuit. The patent names external sources and slow charging.',
    modernModel: 'A charge-budget model is C dV/dt = Iexternal − V/Rleak − Iload, with stored energy CV²/2. The external input and any auxiliary supply belong in the energy budget.',
    missingBridge: 'This circuit abstraction does not validate Tesla’s microscopic explanation or provide a measured input current. It is not a source-free generator or a modern solar-cell specification.',
    counterexample: 'Set external input to zero after discharging the capacitor: a passive model cannot sustain load output.',
    experimentIdea: 'Simulate intermittent input, leakage and load draw; compare charging time with delivered energy.',
    url: 'https://patents.google.com/patent/US685957A/en',
    access: 'Description, selected claims and original drawing sheet read. No radiation source or physical apparatus is proposed for recreation.',
  },
  {
    id: 'tesla-remote-control',
    title: 'Remote commands and local power',
    date: '1898-11-08 · patent grant',
    kind: 'Patent · remote vessel control',
    locator: 'US613809A · Fig. 1 and propulsion description; claims 2–4 and 12–13',
    documented: 'A received disturbance operates control circuits. The described propulsion motor draws power from onboard storage batteries; command transmission and propulsion have different roles.',
    modernModel: 'A digital state machine separates command reception from battery energy, motor work and drag. Reception can fail while onboard energy remains available.',
    missingBridge: 'Sending a command does not transmit all propulsion energy. The patent alone does not establish modern reliability, autonomy or unlimited range.',
    counterexample: 'A valid command with an empty virtual battery produces no propulsion; a charged battery cannot decode a missing command.',
    experimentIdea: 'Use a simulated boat with independent command-loss and battery controls; track requested versus completed turns.',
    url: 'https://patents.google.com/patent/US613809A/en',
    access: 'Selected control, battery and claim passages read; original first drawing sheet checked. This audit excludes weapon applications and construction details.',
  },
  {
    id: 'tesla-mechanical-oscillator',
    title: 'A powered oscillator and its linear range',
    date: '1894-02-06 · patent grant',
    kind: 'Patent · reciprocating engine',
    locator: 'US514169A · drawing and spring discussion; claims 1–5',
    documented: 'Pressurized fluid supplies work to a piston coupled to an elastic restoring system. The constant-period argument is explicitly limited to force approximately proportional to displacement.',
    modernModel: 'A local approximation is mx″ + bx′ + kx = Fdrive − Fload, with ω0 = √(k/m). Source work must cover heat, friction and extracted load work.',
    missingBridge: 'An ideal spring omits gas nonlinearity, valve behavior and thermal losses. This patent is not evidence of a limitless oscillator or a demonstrated building-destruction device.',
    counterexample: 'Add a cubic restoring term: period can depend on amplitude. Remove input with positive damping: motion decays.',
    experimentIdea: 'Compare a linear and a nonlinear virtual spring over several amplitudes; record the period and energy loss.',
    url: 'https://patents.google.com/patent/US514169A/en',
    access: 'Description, selected claims and original drawing read. No pressurized or structural experiment is specified.',
  },
  {
    id: 'tesla-vedanta-letter',
    title: 'Vivekananda’s report of an anticipated proof',
    date: '1896-02-13 · letter date',
    kind: 'Contemporary correspondence · Vedanta',
    locator: 'Vivekananda to E. T. Sturdy · Complete Works V, letter LVII in this edition',
    documented: 'Vivekananda reports Tesla’s interest in prana, akasha and kalpas, and an expected mathematical demonstration relating force and matter to potential energy.',
    modernModel: 'An operational proposal would need defined variables, units, governing equations and an independently testable prediction. The letter does not supply them.',
    missingBridge: 'This is Vivekananda’s report and expectation, not Tesla’s completed derivation. Vedanta is a philosophical and religious tradition; it is not interchangeable with all occultism.',
    counterexample: 'A shared word such as energy does not establish identical measurable quantities or equivalent theories.',
    experimentIdea: 'Build a claim ledger separating the letter’s words, a modern interpretation and the measurement that would test it.',
    url: 'https://www.ramakrishnavivekananda.info/vivekananda/volume_5/epistles_first_series/057_blessed_and_beloved.htm',
    access: 'Complete published letter transcription read; autograph manuscript and any promised mathematical demonstration were not obtained.',
  },
  {
    id: 'tesla-visualization-369',
    title: 'Mental rehearsal and the 3–6–9 attribution gap',
    date: '1919-02 · article publication',
    kind: 'Retrospective autobiography · provenance check',
    locator: 'My Inventions I: My Early Life · Electrical Experimenter, pp. 696–697 and 743–747',
    documented: 'Tesla describes mentally revising and operating inventions before construction, and personal repetitions divisible by three. These are retrospective first-person reports.',
    modernModel: 'Mental rehearsal can motivate an inspectable model. Decimal digit sums follow arithmetic modulo nine; changing number base changes that pattern.',
    missingBridge: 'The checked account supplies no 3–6–9 physical law or validated claim of infallible simulation. No authenticated primary derivation was found in this selected survey.',
    counterexample: 'A digit pattern that changes with notation cannot by itself identify a physical resonance. Imagined success can omit load or dissipation.',
    experimentIdea: 'Predict a phase plot before running it, then compare prediction and result. Separately compare digit patterns across number bases.',
    url: 'https://teslauniverse.com/nikola-tesla/articles/my-inventions-i-my-early-life',
    access: 'Public transcription read, including visualization and habits passages. Original magazine facsimile download was member-gated and not accessed.',
  },
];

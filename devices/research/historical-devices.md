# Historical devices: from evocative claims to bounded experiments

Reviewed 16 October 2026. This is a selected audit of fourteen historical, patent and institutional records. It is not a census of government programs, a review of every occult book, or a claim that unpublished technology has been recovered. The companion `src/history-sources.mjs` provides machine-readable titles, dates, publishers, URLs, reading scopes and limitations. Historical material supplies questions and engineering lessons; the equations below are modern reconstructions or proposed tests, not equations attributed retroactively to Newton or Tesla.

The useful connection is often methodological. A notebook suggests what to measure. A patent makes a proposed mechanism explicit. A government assessment shows why an apparently promising signal remained ambiguous. An alchemical analogy exposes a question about similarity. These records do not all have the same evidential role, and their shared use of words such as energy, vibration or levitation does not establish a shared mechanism.

## What was read and what each record can support

| Record | Evidence role | What is admitted into this project | What is not inferred |
| --- | --- | --- | --- |
| `newton-opticks` | Selected primary optical text | Observations followed by a testable explanatory model | Every Query is an established law |
| `newton-vegetation` | Alchemical manuscript | A documented historical analogy and its admitted differences | A modern biological or quantum field |
| `newton-emerald` | Hermetic text preserved in manuscript | Historical correspondence language | A hidden engineering blueprint |
| `tesla-wireless` | Patent proposal | Source, receiver, tuning and propagation assumptions | Verified global transfer efficiency |
| `tesla-radiant` | Patent proposal | External energy collection and storage | Energy without an external source |
| `tesla-colorado` | Public notebook transcription | Assumptions, tuning and loss bookkeeping | Independently replicated performance |
| `nasa-bpp` | Historical program assessment | Discriminating tests and distinct outcome categories | A successful antigravity program |
| `nasa-capacitor` | Selected experimental report | An environment-dependent force observation | Gravity cancellation |
| `gateway-1983` | Released memorandum, mirror OCR | An author's proposed explanatory connections | Controlled validation or agency endorsement |
| `pais-inertia` | Government-assigned patent | A traceable extraordinary proposal | Demonstrated inertial-mass reduction |
| `china-elf` | Official institutional account | Containerless processing in orbital microgravity | A device that creates microgravity |
| `china-acoustic-sensor` | University patent application | Acoustic support coupled to displacement sensing | Calibrated performance or far-field trap validation |
| `russia-hts-maglev` | Funded-project record | A planned coupled electromagnetic/thermal study | Independent confirmation of every reported advantage |
| `russia-track-maglev` | University patent | An offboard-powered support concept | Zero total energy input |

Status is attached to a claim rather than inherited from the prestige of its host. The same document can accurately establish who filed a proposal while providing insufficient evidence that the proposal works. A scan can authenticate a sentence without authenticating the experiment described by that sentence. Conversely, a failed experiment can still supply useful constraints when its sensitivity and environmental conditions are known.

## Newton, alchemy and the boundary of analogy

The [1718 *Opticks*, Book III](https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00051) was inspected in its opening observations and closing Query 31 discussion. The closing passage distinguishes inference from experiments and subsequent explanatory synthesis, and leaves further hints for examination. This is a useful precedent for keeping observations separate from proposed causes. It does not turn Newton's exploratory microscopic language into a present-day theory of electromagnetic healing or gravity control.

[Dibner MS. 1031B](https://newton.dlib.indiana.edu/text/ALCH00081/normalized) was read in selected opening and concluding passages. Newton compares mineral transformations with living processes, proposes a latent organizing agency, and records dissimilarities as well as similarities. The manuscript establishes historical reasoning within chymistry. Its terms do not supply measured units, a modern field equation, or a validated biological intervention. The modern modeling lesson here is to specify the correspondence and preserve the counterexamples.

The [Emerald Tablet text in Keynes MS. 28](https://newton.dlib.indiana.edu/text/ALCH00017/normalized), folios 2r–2v, supplies the selected Hermetic primary text. The English passage and catalogue metadata were read; the Latin commentary was not translated in full. Its correspondence language can motivate a question about scale or transformation. A text copied or translated in Newton's manuscript is not evidence that its cosmology is correct or that Newton built a levitating apparatus.

Our operational replacement for a loose correspondence is a map between defined variables. Suppose two experiments obey the dimensionless equation

\[
u''+2\zeta u'+u=s(\tau).
\]

Their responses can be compared after specifying how displacement, charge, time and forcing were normalized. That mathematical correspondence does not mean displacement is charge. Different materials, boundary conditions, nonlinearities and noise may make the reduced equations cease to match. The map is useful only over a declared regime.

For an inverse problem, write measured data as \(y=F(\theta)+\epsilon\), where \(\theta\) contains model parameters and \(\epsilon\) represents measurement error. A fit may leave many parameter combinations indistinguishable. One spectrum peak, for example, need not identify damping, coupling and detector response separately. A second observable or a changed boundary condition may discriminate them. This is a modern analysis/synthesis workflow: infer cautiously, predict a new observation, and test that prediction without refitting to its answer.

The occult connection therefore remains historical and generative. A symbolic phrase may inspire an experiment, but it is not counted as evidence for its result. No historical chemical recipe is reproduced, and no metaphysical term is silently replaced by a quantum-field variable.

## Tesla: tuning, collection and system boundaries

[US645576A](https://patents.google.com/patent/US645576A/en), published 20 March 1900, names a supply, transmitting and receiving arrangements, synchronized circuits and assumptions about the intervening medium. Those selected description passages were read in OCR. This supports studying a source-to-load chain. A small coupled-resonator model is an analogy to one engineering idea; it does not reproduce the patent's proposed atmospheric transmission channel or establish its large-scale efficiency.

[US685957A](https://patents.google.com/patent/US685957A/en), published 5 November 1901, describes accumulation and discharge associated with external radiation. Some embodiments also contain a local supply. Those inputs cannot disappear when calculating output energy. The historical account of microscopic action is not adopted here as a modern explanation. The useful experiment is an accounting exercise: compare incident input, storage changes, delivered work and loss over the same time interval.

The [Colorado Springs notebook transcription, page 43](https://teslauniverse.com/nikola-tesla/books/nikola-tesla-colorado-springs-notes-1899-1900/43), records assumptions used in estimates and sharp tuning of interacting oscillations. The page separates Tesla's text from later editorial annotations; their energy equation is not silently assigned to him. This reading used a specialist public transcription, not an independently authenticated notebook image. It is a lead for traceable modeling, not a replication certificate.

Our modern two-loop example uses RMS phasors. Let

\[
Z_1=R_1+i(\omega L_1-1/\omega C_1),\qquad
Z_2=R_2+R_L+i(\omega L_2-1/\omega C_2).
\]

With reciprocal mutual inductance \(M\), a source voltage \(V\), and the indicated sign convention,

\[
I_1=\frac{V}{Z_1+(\omega M)^2/Z_2},\qquad
I_2=-\frac{i\omega M I_1}{Z_2}.
\]

For positive resistances and passive coupling, the steady-state real-power identity is

\[
\operatorname{Re}(VI_1^*)=R_1|I_1|^2+(R_2+R_L)|I_2|^2.
\]

The load receives \(P_L=R_L|I_2|^2\). The remaining real input becomes modeled resistive loss. This equality is an implementation check independent of whether a displayed resonance curve looks plausible. It also makes the role of the source explicit. If peak rather than RMS phasors are used, all average-power terms need the corresponding factor of one half; mixing conventions creates a fictitious efficiency error.

Stored magnetic energy includes a cross term. A physically admissible linear inductance matrix requires \(M^2\leq L_1L_2\), with strict inequality for a positive-definite nondegenerate model. A slider that permits arbitrary mutual inductance can generate an unphysical parameter set even when the algebra runs without an exception. The experiment should reject such inputs or explicitly display the singular limit.

This model omits radiative propagation, detailed coil geometry, frequency-dependent material properties and nonlinear losses. Its output is a calculation conditional on that simplification. A larger resonant amplitude is compatible with conservation: energy accumulates from a continuing source, and the load changes both the response and dissipation. With no continuing input, a passive model cannot deliver indefinite positive average output without exhausting stored energy.

## Government records: proposals, experiments and archived claims

The [NASA BPP assessment](https://ntrs.nasa.gov/citations/20040070788), NASA/TM-2004-213082, covers a historical program supported from 1996 through 2002. Selected methods and task reports were read. In particular, RF interference prevented an interpretable Cavendish-style result; NASA's full Podkletnov replication was unfinished; a separately sponsored replication reported a null. These must not be collapsed into one NASA success or one universal disproof. The report advocates useful incremental knowledge rather than a guaranteed breakthrough.

The [NASA asymmetrical-capacitor report](https://ntrs.nasa.gov/citations/20040171466), NASA/TM-2004-213283, states that its apparatus produced force in air and no observed performance in hard vacuum. This pass inspected the abstract and printed conclusion page, not all apparatus data. The authors interpret performance using ordinary momentum and charged-particle mechanisms. The relevant distinction is between lacking onboard propellant and lacking any external momentum exchange. The atmosphere can be part of the system.

[US10144532B2](https://patents.google.com/patent/US10144532B2/en) records Pais's proposed inertial-mass device and its original Navy assignment. Metadata and selected mechanism passages were inspected. Neither the grant nor the assignee supplies a measured inertial reduction. The inspected material did not provide an independently verified performance dataset. The website therefore treats the proposed effect as unverified, and makes no statement about current legal status based on a patent mirror's automated label.

The [1983 Gateway memorandum](https://archive.org/details/cia-readingroom-document-cia-rdp96-00788r001700210016-5) was read through an identified OCR mirror for its cover and sections 6–10. Direct CIA URLs redirected during this audit. The author draws links among auditory stimulation, bodily resonance and consciousness. The inspected text is an explanatory assessment, not a controlled demonstration of those links. The release marking establishes a released record; it does not convert its analogies into agency-confirmed physics.

Our evidential test for an extraordinary force starts with a conservation boundary. The platform, support, field source, cables, surrounding medium and radiation crossing the boundary must be identified. A measured force on one component is not automatically net thrust on the complete apparatus. Mechanical vibration, thermal drift, electrostatic attraction and detector pickup can produce correlated signals without changing inertia. The useful question is which observation separates those alternatives.

A hypothetical additional-force coefficient could be introduced as \(F_{\mathrm{extra}}=\alpha q(t)\), where \(q(t)\) is a specified driver observable. This is a statistical test term, not a known physical interaction. Estimating \(\alpha\) requires calibrated force data, a known transfer function and nuisance regressors. If the same driver also heats the balance, then a nonzero fitted coefficient may simply absorb thermal drift. Orthogonal controls, blinded analysis and independent sensors are needed before assigning a causal interpretation.

A finite null result should report the tested range and an uncertainty interval. It need not assert that every conceivable variation is impossible. An inconclusive measurement is also not evidence that the effect exists below the noise. The two statements are logically different, and the interface should preserve that difference.

## China and Russia: actual force mechanisms and careful translation

The [CAS account dated 28 April 2023](https://csu.cas.cn/gb/zyxw/202305/t20230505_6748857.html) describes containerless alloy work aboard the China Space Station, including electrostatic positioning. The original Chinese article and captions were read. The station's microgravity environment and the sample-positioning mechanism are separate conditions. This institutional report is not a raw-data audit of every material-property claim. Its existence does not support a device that switches gravity off.

[CN102384983A](https://patents.google.com/patent/CN102384983A/zh) is a university patent application for an ultrasonic levitation accelerometer. Selected Chinese description, force balances and claims were read. It proposes near-field acoustic support and capacitive sensing; its equilibrium explicitly retains gravity. Near-field squeeze-film support differs from a far-field standing-wave particle trap. The latter cannot be validated by citing the former. The OCR of complicated algebra was not treated as a verified transcription.

The [Russian Science Foundation project 17-19-01527](https://www.rscf.ru/project/17-19-01527/) describes proposed superconductor–magnet systems using flexible HTS tapes. Metadata and the Russian application abstract were read. The page explicitly identifies its narrative as author-provided. It proposes coupled magnetic, electrical and thermal modeling, including losses. This is evidence of a funded research topic and declared aims, not independent confirmation of all outcomes or continuing funding in 2026.

[RU2539304C2](https://patents.google.com/patent/RU2539304C2/ru) relocates driven magnetic elements from a vehicle to its track. Selected Russian description and operating passages were read. Avoiding onboard power for levitation leaves the track's power requirement inside the complete energy budget. This is a Russian Federation patent, not a Soviet program. The present audit contains no separately verified performance data or current legal opinion.

English descriptions of Chinese and Russian sources here are careful paraphrases, not certified translations. Technical terms were interpreted in their local mechanism: electrostatic positioning, near-field sound support, superconducting magnetic response, or driven-track induction. Neither country label is a mechanism. Public institutional documents do not imply access to classified programs, and a university's government relationship does not make every patent a deployed government technology.

One instructive sensor reconstruction can be derived without copying uncertain OCR algebra. Assume a simplified near-field support law \(F=A/h^2\), where \(A>0\) is constant for a restricted operating regime. At equilibrium \(A/h_0^2=mg\). In a frame accelerating upward at \(a\), the corresponding static balance is \(A/h^2=m(g+a)\), giving

\[
h(a)=\frac{h_0}{\sqrt{1+a/g}},\qquad a>-g.
\]

For small acceleration, \(h(a)\simeq h_0(1-a/2g)\). This predicts an incremental displacement, not unlimited dynamic bandwidth. The effective local restoring stiffness is \(2mg/h_0\), but damping, gas dynamics, plate geometry and readout noise remain unspecified. Approaching \(a=-g\) makes the static formula diverge, exposing the model's breakdown instead of predicting infinite usable travel. This derivation is an optional modeling example, not a claim that this website has calibrated or built the patented sensor.

## Proposed experiment contracts

The following are original test designs for simulation or later professionally supervised measurement. They are not new laws, certified inventions, patentability opinions, or claims of hardware already built. They use passive components, analytic signals and synthetic observations at the simulation stage. No high-voltage, radiation or chemical construction procedure is included.

### H1 — A transfer peak is not necessarily the best operating point

**Question:** Under a fixed source convention, does the frequency maximizing load power also maximize efficiency or tolerance to detuning?

**Setup:** Use the two-resonator equations above. Hold resistance, coupling and the source boundary fixed while sweeping frequency and load. Record source power, load power and both losses separately. Report whether the source is an ideal voltage source or constrained by available power; those optimization questions differ.

**Control:** Set coupling to zero, increase internal loss, and compare equal total input where appropriate. The uncoupled receiver must receive zero modeled source power. In the passive domain the calculated efficiency must remain between zero and one.

**Falsifier:** A claimed operating advantage disappears when source power is matched, or the numerical conservation residual exceeds the chosen tolerance. **Use case:** Selecting robust parameter regions before a more detailed field model. **Limit:** No inference about atmospheric wireless transfer or free energy.

### H2 — An apparent extra force can arise from omitted drift

**Question:** Can a deliberately omitted thermal or mechanical nuisance term produce a false driver-correlated force?

**Setup:** Generate synthetic measurements from a known zero-anomaly model with explicit noise and a delayed nuisance response. Fit once with and once without that nuisance term. Keep the random seed, time units, sample interval and generating coefficients in the export.

**Control:** Use a withheld driver sequence and a reversed or shuffled sequence appropriate to the model. Compare uncertainty coverage across repeated synthetic runs, not just one attractive trace.

**Falsifier:** The alleged discovery depends on a fitting omission or disappears on held-out data. **Use case:** Auditing force-measurement analysis before any apparatus is built. **Limit:** Recovering an inserted synthetic effect only verifies the analysis pipeline under its assumptions; it does not establish a physical anomaly.

### H3 — Near-field sensor linearity has a limited window

**Question:** Over what fractional acceleration range does the linearized displacement remain close to the nonlinear static expression?

**Setup:** Compare \(h_0(1-a/2g)\) with \(h_0/\sqrt{1+a/g}\) for a declared domain. Use an error normalized to \(h_0\), avoiding relative errors that blow up when displacement approaches zero. Treat contact boundaries as exclusions rather than silently clipping the output.

**Control:** Compare the exact equilibrium residual against the approximated solution. Change \(h_0\) and verify that the normalized discrepancy follows the dimensionless variable \(a/g\).

**Falsifier:** A claim of broad linearity exceeds the declared error tolerance. **Use case:** Explaining sensitivity versus travel in a virtual displacement sensor. **Limit:** This test has no time-dependent gas model and makes no bandwidth or fabrication claim.

### H4 — Shared differential equations do not identify the physical carrier

**Question:** Can two systems with matched dimensionless response still be distinguished by a physical observable?

**Setup:** Compare a normalized mechanical oscillator and a normalized electrical resonator. Match the damping ratio and drive ratio. Then restore their dimensional coordinates and compute the distinct energy expressions and transduction variables.

**Control:** Change one physical parameter while preserving a visible normalized curve. Observe that a matching screen trace alone cannot identify mass, inductance, coupling or detector gain.

**Falsifier:** A proposed cross-domain identity lacks a mapping that preserves units and measured observables. **Use case:** A disciplined replacement for vague historical correspondence arguments. **Limit:** Mathematical analogy cannot establish equivalence between consciousness, acoustic pressure and electromagnetic fields.

### H5 — Offboard power changes the apparent efficiency

**Question:** How does the reported efficiency change when the system boundary includes both a receiver and its remote source?

**Setup:** Use an explicit ledger with source input, conversion loss, channel loss, storage change and receiver output. Allow the display to toggle between the receiver boundary and the complete installation, while keeping every physical term unchanged.

**Control:** Integrate the complete cycle, including charging or spin-up. Compare a transient high output with the corresponding decrease in stored energy. Require nonnegative passive losses.

**Falsifier:** An apparent efficiency above unity is explained by omitted supply or storage terms. **Use case:** Interpreting energy-harvesting and offboard-powered transport claims. **Limit:** A bookkeeping example is not a performance prediction for a particular patented machine.

### H6 — A field maximum does not prove stable levitation

**Question:** Does a visually striking amplitude pattern imply a stable equilibrium for a specified object?

**Setup:** Begin with a declared field model, then separately calculate the appropriate interaction potential or force for a stated material and size regime. Include gravity. A candidate position must satisfy force balance and the required local stability conditions in every modeled direction.

**Control:** Change the material interaction parameters, remove the driving field and examine directions omitted by a one-dimensional plot. A positive curvature along one axis does not establish three-dimensional confinement.

**Falsifier:** The purported trap is unstable in an omitted direction or requires a force beyond the model's range. **Use case:** Preventing acoustic, magnetic and electrostatic pictures from being mislabeled as antigravity. **Limit:** Field visualization alone is not a particle dynamics solver or a demonstrated apparatus.

## Connections that survive scrutiny

The robust network contains typed relationships. Newton's analysis/synthesis discussion informs a testing workflow. Tesla's tuning notes inform coupled-response bookkeeping. The NASA reports inform controls and outcome categories. The Chinese and Russian records supply examples of ordinary support forces and complete system boundaries. The Hermetic and Gateway texts supply historical claims to examine, not coefficients to insert into a physics solver.

There is no evidential edge from “an archive contains this proposal” to “the effect has been demonstrated.” There is no physical edge from a repeated frequency number to a new interaction without a coupling mechanism. There is no causal edge from an AI system generating a plausible design to that design working in matter. An AI-assisted search or optimizer may propose parameters; the solver, unit checks, controls, independent replication and experimental uncertainties remain separate responsibilities.

A useful future connection must identify both endpoints and its warrant. “Uses the same mathematical response” means a declared approximation relates equations. “Historically influenced” requires documentary evidence. “Experimentally supports” requires observations that discriminate the stated mechanism. “Analogy” is a legitimate category with limited inferential power. Preserving these labels makes the research more useful than a graph whose every line appears equally certain.

## Access and coverage gaps

The selected primary-host CIA record and PDF addresses redirected to the CIA reading-room homepage on the review date. The identified Internet Archive citizen mirror provided OCR with visible release markings and document identity; exact scan symbols and every page were not authenticated. The FBI Tesla catalogue and Part 03 PDF link were reached, but the available browsing extraction exposed no readable page text. No substantive claim was inferred from that unread scan. The larger Part 01 file exceeded the browsing fetch limit; a direct download attempt was rejected. These are retrieval limitations, not evidence of suppression or hidden performance.

Patent descriptions were read through Google Patents, a convenient mirror of primary publications. Original legal registers, prosecution histories and current ownership were not fully checked. OCR can corrupt formulas. NASA's reports were read only in the specified sections; their cited papers were not all independently retrieved. Russian project publications and Chinese raw materials datasets were outside this bounded pass. This audit makes no claim of access to classified archives, paid collections or unpublished laboratory records.

The strongest next work would be narrower: select one proposed use case, acquire an appropriate modern benchmark dataset, compare the reduced model with a higher-fidelity solver, and preregister a discriminating test. A generated image can communicate that setup, but it must remain labeled as a concept illustration. The evidence for a working device would come from calibrated measurements and a reproducible result, not from the image, the age of an idea, the identity of an inventor, or the institutional logo on a document.

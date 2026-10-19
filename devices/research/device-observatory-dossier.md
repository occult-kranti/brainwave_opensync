# Fieldwork: Device Observatory

Research snapshot: 16 October 2026. Selected primary sources, three virtual instruments, and proposed experiments. No physical prototype was built or measured.



---

<!-- ai-frontier.md -->

# AI research and scientific software: device-method audit

Audit date: 16 October 2026. This is a selected, current-source investigation for a browser-based experimental-device observatory, not an exhaustive review of AI, physics, conferences, or patents. The purpose is to identify useful research methods and decide what can be implemented honestly in a small simulation. Original source links are included below. A company release, a submitted paper, a published conference paper, a numerical reproduction, and an observed hardware result occupy different evidence levels.

## 1. What the current AI releases contribute

### OpenAI mathematics release

The [6 October announcement, updated 15 October](https://openai.com/index/sharing-ai-progress-in-mathematics/) leads to [openai/math](https://github.com/openai/math). Its README acknowledges differing verification stages and possible problems with unformalized results. At the observed repository head `1581d4cbdd69a0faf34b2089614fe2a814316a6a`, the catalogue description reports 719 manuscripts in 372 families and approximately 42 percent of top-level results formalized. These are repository-reported counts, not results independently certified by this audit. No individual mathematical manuscript or Lean build was checked here. The useful practice is a versioned relationship among claim, assumptions, supporting artifact, and verification state. No theorem from this collection is used as a new physical law in the device simulations.

### OpenAI research acceleration report

The [6 September report](https://openai.com/index/research-acceleration-view-inside-openai/) describes internal changes in agent use and experimental activity. Its methods and main discussion identify interpretation limits: growing compute is a confound, code volume is an imperfect outcome, and longer tasks still involve human intervention. The report supports studying research workflow, not a causal numerical prediction of how much faster this project will invent useful hardware. A practical adaptation is to count reproducible runs and resolved errors, record failed candidates, and distinguish experiment throughput from validated knowledge. Private underlying logs were unavailable to this audit.

### Anthropic quantum circuit research, released today

Anthropic’s [16 October announcement](https://www.anthropic.com/research/designing-efficient-quantum-circuits) links to [Gu and colleagues, arXiv:2610.22367v1](https://arxiv.org/abs/2610.22367v1), submitted 15 October. The inspected abstract, introduction, evaluator formulation, and design principles describe an external program checking candidate circuits and scoring resources. The paper reports simultaneous qubit and Toffoli improvements in seven tasks; the eighth improves a trade-off. This is more precise than reading the announcement as eight simultaneous improvements. The evaluator benefits from a restricted circuit class that permits efficient basis-state simulation. The paper is a preprint, and its complete appendices and implementations were not reproduced here. The transferable method is evaluator-guided search; it is not proof of a new force, a running quantum computer, or a physical device designed by this site.

### Claude Science

The [30 June workbench announcement](https://www.anthropic.com/news/claude-science-ai-workbench) describes a beta product integrating scientific tools, computing resources, and auditable artifacts. It was not installed or benchmarked for this project. Its useful design inspiration is to keep the code, inputs, and processing history attached to a figure. A lab interface can adopt that principle without depending on the product or implying affiliation. A reusable simulation export should identify its equation, parameter values, units, numerical assumptions, and date. Reviewer agents can identify mistakes, but their agreement does not replace external observations or independent numerical checks.

### Model Hardware Standard

The [27 August MHS announcement](https://www.anthropic.com/news/model-hardware-standard-research-preview) describes a partner research preview and planned open sourcing. Its overview includes discoverable device capabilities, command interfaces, metadata, and constraints. The report also describes failures of model reasoning about physical equipment. This audit inspected the interface description and limitations, not an SDK or real instrument. The defensible adaptation is a virtual-instrument contract with named readouts, valid ranges, units, and a declared simulation mode. The observatory should not claim MHS compatibility or autonomous control of real equipment merely because it adopts similar metadata ideas.

### Genesis Mission participation

The [8 October Anthropic announcement](https://www.anthropic.com/news/genesis-mission-commitment) describes a three-year company commitment to support scientific projects in the US Genesis Mission. It is evidence of a participant’s stated commitment, not audited expenditure, completed research, or validation of any unconventional propulsion concept. The relationship to this project is organizational: funded programs can make AI tools available to scientists. Such provenance must remain separate from the experimental evidence for a particular mechanism. A NASA, DOE, or other agency association does not by itself upgrade a conjecture into a measurement.

## 2. Conference evidence and its actual reading depth

Two 2026 proceedings papers were selected because they directly address the temptation to trust a convincing physics surrogate. Official publication metadata was checked first. Although PDF retrieval through the browsing service failed, the publisher-linked files were subsequently downloaded from the PMLR GitHub repository. Selected methods and limitations were then read locally. This is a section-level audit, not a complete proof or benchmark reproduction.

[Learning Physical Operators using Neural Operators](https://proceedings.mlr.press/v300/gopakumar26a.html), by Gopakumar and colleagues, appears in the proceedings of AISTATS 2026, PMLR volume 300, pages 3223–3231. The abstract, weaknesses section, and Appendix D were read. A useful correction appears in that appendix: the method adds spatial operator contributions within one ODE right-hand side; it does not execute sequential fractional time steps as in classical Strang splitting. The authors also state that the tested boundaries are periodic and that choosing a decomposition requires expertise. Publication in proceedings and reproduction here remain distinct statuses.

[Physics-informed Neural Operator Learning for Nonlinear Grad-Shafranov Equation](https://proceedings.mlr.press/v306/ding26w.html), by Ding and colleagues, appears in ICML 2026, PMLR volume 306, pages 25305–25332. The abstract, conclusion, operational comparison, and Appendix E were read. Reported agreement is with an operational equilibrium solver, not direct measurement of the internal flux field. The limitations explicitly restrict the study to static, fixed-boundary equilibria; free-boundary coil coupling and transient closed-loop control need further work. Several deployment shifts are untested. This observatory neither reproduces the plasma benchmark nor infers a successful fusion-energy device.

An ICLR workshop search also returned relevant acoustic-training leads, but the selected OpenReview page presented a verification barrier. An inaccessible search result is not sufficient evidence of acceptance or of the paper’s detailed findings, so it was not promoted to a source card. “Latest” here means sources checked through the audit date, not a claim that every conference submission has been surveyed.

## 3. Open-source software: capability, license, and inspection status

| Software | Observed repository head | License inspection | Actual audit depth |
|---|---|---|---|
| [j-Wave](https://github.com/ucl-bug/jwave) | `d1918f4e6adbf3822108e0af8034063efed1d581` | pyproject declares LGPL-3.0-only | README, package metadata (0.2.1), selected time_harmonic.py functions; no runtime benchmark |
| [Meep](https://github.com/NanoComp/meep) | `e1ff04e62514c4860f917c52ca33977180dfdaee` | Repository lists GPL-2.0 | README plus selected adjoint tutorial sections; no solver run |
| [MuJoCo](https://github.com/google-deepmind/mujoco) | `9f035384db1a0f023c68fb8388e736f8ff811f73` | Source Apache-2.0; documentation/media CC BY 4.0 | README capability and licensing sections; no dynamics benchmark |
| [Cirq](https://github.com/quantumlib/Cirq) | `501345094cb1c2a7eff4f7e83e0a3e303702a6bc` | Repository lists Apache-2.0 | README capabilities and license listing; no quantum circuit executed |

Heads were observed through GitHub’s repository/commit endpoints on the audit date. They identify a reproducible place for a later implementation audit; they are not claims that the whole trees were inspected. Package version and repository head are different identifiers. No third-party code from these repositories is copied into the browser models by this research task.

The pinned j-Wave angular-spectrum function explicitly excludes absorption. Its Helmholtz wrapper selects GMRES or BiCGSTAB and returns the solution without exposing the solver status; integration should therefore calculate an independent residual. These are source-code observations, not executed results. The package metadata says LGPL-3.0-only while the inspected file header permits later versions, so licensing needs resolution before code redistribution. Automatic differentiation does not remove omitted physics.

Meep supplies electromagnetic FDTD and an [adjoint design tutorial](https://meep.readthedocs.io/en/latest/Python_Tutorials/Adjoint_Solver/). The inspected sections distinguish objectives and demonstrate derivative convergence. That is especially useful when a bright field plot is mistaken for high transmitted power: a field-intensity objective and a port-power objective need not be the same. A reduced circuit model should remain labeled as such until compared with an appropriately resolved field calculation.

MuJoCo is useful for articulated mechanics and contact. Its role in a future device would be mounts, positioning, or mechanical motion. Acoustic or electromagnetic forces would need a separately justified model; a physics-engine animation does not discover those forces. Cirq is useful for quantum circuits, noise models, and small simulation checks. Neither package converts a conceptual rendering into experimental hardware evidence.

## 4. An implementable research loop for this observatory

The following workflow is this project’s proposed design, rather than a reported result of the cited companies. A candidate is a bounded set of parameters within one declared physical model. A run evaluates those parameters, produces numerical observables, and checks constraints. A search chooses candidates according to an objective fixed before viewing the results. A separate validation pass examines conservation, reference cases, and sensitivity. Every accepted candidate remains a candidate in a model until measured independently.

This separation is important even for an inexpensive browser simulation. If a program maximizes field amplitude at one pixel, it may place a source arbitrarily close to that pixel. If it maximizes an efficiency ratio while its input denominator approaches zero, it can produce a large meaningless number. If a search is allowed to change its evaluation range after seeing results, it can hide unwanted side lobes or off-resonance losses. Domain limits, normalization, and the comparison baseline must therefore be explicit parts of the experiment.

The simplest useful run record is a structured object containing a model identifier, version, input parameters with units, chosen objective, output values with units, valid-domain checks, numerical tolerances, and a plain-language limitation. Include the full parameter set even when most controls remain at defaults. A screenshot alone is insufficient because a visually similar chart can result from different assumptions. Exported numbers should remain distinguishable from real sensor readings.

For a search, retain the baseline, best candidate, objective history, and evaluation budget. Report whether “best” means best among a finite grid, best among seeded samples, or a local optimum. Do not silently call any of these a global optimum. If multiple designs have nearly equal scores, report their sensitivity: a slightly lower nominal score may be a better experiment when it survives manufacturing tolerance or parameter uncertainty.

## 5. Concrete mathematical checks for passive device concepts

### Coupled resonators

For a linear mechanical system, write the dynamics as

\[
M\ddot q+C\dot q+Kq=f(t).
\]

The variables must refer to actual positions or generalized coordinates, with consistent masses, damping, stiffness, and forcing. For constant symmetric matrices, the stored energy is

\[
E=\tfrac12\dot q^T M\dot q+\tfrac12 q^T Kq,
\qquad \dot E=\dot q^T f-\dot q^T C\dot q.
\]

This identity is a useful evaluator. With a passive damping matrix, dissipation cannot be a source of power. A resonator can increase displacement relative to a static response while consuming externally supplied work. If a load extracts energy, it must be included in the damping or coupling model. Excluding the load and then reporting its imagined output creates a false energy budget.

A candidate experiment can sweep drive frequency and coupling while holding the forcing convention fixed. Compare a tuned baseline, a detuned configuration, and the zero-drive case. Evaluate delivered load power, peak amplitude, and bandwidth separately. A narrower resonance may improve the peak but worsen robustness. The simulation should not call that free energy. Where reactive power or energy storage is present, distinguish instantaneous power, cycle-averaged power, and stored energy; they have different meanings and units.

### Phased acoustic arrays

A simple monochromatic model can use complex pressure

\[
p(\mathbf r)=\sum_n a_n G(\mathbf r,\mathbf r_n;k)e^{i\phi_n},
\qquad k=2\pi f/c.
\]

The kernel must specify geometry and propagation assumptions. A far-field array factor is not a near-field solution. A point-source Green function is not a calibrated finite transducer. Normalize comparisons to a fixed convention, for example fixed sum of source-amplitude squares, while stating that this proxy does not automatically equal total radiated power when source coupling matters.

Useful tests include all sources off, equal phases in a symmetric geometry, phase reversal, and a withheld observation region. An optimizer should balance focal concentration against unwanted side lobes rather than select the brightest pixel anywhere. A pressure field alone does not establish a stable particle trap. A claim about trapping additionally needs a force model, particle assumptions, equilibrium, and stability in all relevant directions. A one-dimensional trace cannot certify three-dimensional stability.

### Passive wave filters and layers

A transfer model can predict a frequency-dependent response for a specified material sequence or lumped network. The relevant evaluator compares reflection, transmission, absorption, and the energy convention used to define each. Equal-amplitude waves in different impedances can carry different power, so amplitude coefficients should not be labeled power efficiencies without the conversion. An ideal lossless passive reference should satisfy its conservation relation within numerical tolerance.

A useful hypothetical experiment compares a single resonant section with several weakly coupled sections under a fixed material or size budget. Ask whether a broader stop band survives damping and fabrication uncertainty. This is a testable engineering question, unlike an unspecified claim that “frequency changes gravity.” The result is a model prediction tied to a frequency range, dimensions, and constitutive assumptions. It remains possible for a real prototype to disagree because mounting, finite size, temperature, or material dispersion were omitted.

## 6. How to test novelty without manufacturing a breakthrough

The current AI sources motivate a richer search process, but novelty must be assessed at the level of a particular construction and comparison set. Changing a slider is a parameter variation. Combining a known array with a known resonator may be an engineering proposal. Neither automatically constitutes a patentable invention or a new physical principle. A source network should connect a borrowed method to its use in the model with an explicit relationship such as “evaluation pattern,” “governing equation,” or “historical inspiration.” Mere shared vocabulary is a weaker relationship.

For each hypothetical device, name one observation that would count against the idea. If the proposal says a geometry improves transmission, specify the baseline geometry and a held-out frequency band. If it says a controller improves robustness, compare the same disturbances with the controller disabled. If it predicts an unusual force, first calculate ordinary acoustic, electromagnetic, thermal, aerodynamic, mechanical, and measurement-system contributions. A residual is not automatically a new interaction; uncertainty and systematic error remain alternative explanations.

AI can assist with candidate generation, code inspection, and literature organization. The code must still be checked against equations, units, and reference cases. Independent implementations offer more evidence than two agents reading the same output, and independently obtained measurements offer a different kind of evidence again. The most valuable output of this website is therefore a reproducible, inspectable experiment proposal with a clear route to being wrong, not a visually compelling assertion that a hypothetical machine works.

## 7. Scope and update rules

This audit deliberately excludes operational biological protocols and treats quantum research as computation and modeling. It does not infer therapeutic efficacy, human levitation, gravity cancellation, or net energy production from the reviewed AI work. No physical device was built, and no listed external simulator was benchmarked by this source-research task. The browser implementation and its own tests must report their separate execution status.

Future updates should preserve older source versions, record corrections, and distinguish a new publication from a changed company webpage. If a preprint becomes a conference or journal paper, update the status only after verifying the venue record. If a package is adopted, pin the actual installed version and dependencies, retain its license requirements, and attach the executed benchmark. These practices let the observatory remain useful as tools improve without turning changing headlines into unsupported physics.


---

<!-- historical-devices.md -->

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


---

<!-- model-specification.md -->

# Device Observatory: model specification

Scope checked 16 October 2026. The three browser models are original educational implementations of standard linear mechanisms. They are virtual devices, not completed hardware. Historical ideas and contemporary AI tools can suggest experiments; they do not establish a physical effect. These models do not predict healing, free energy, or cancellation of gravity.

All code is dependency-free JavaScript in `src/models.mjs`. Inputs use SI units. Harmonic phasors use the convention `Re(sqrt(2) X exp(i ωt))`: voltage, current, force and displacement amplitudes are **RMS**. Consequently average real power has no extra factor of one half. Screen charts convert frequency to kHz or displacement to mm only where the axis says so. All fields are validated; non-finite values, invalid passive parameters and unknown wrapper keys are rejected. No browser audio or physical actuator is driven.

## 1. Loaded coupled resonators

Two series RLC loops have a mutual inductance `M = k sqrt(L1 L2)`. The external source drives loop 1. Loop 2 contains winding resistance R2 and an explicit resistive load RL. With `Z1 = R1 + i(ωL1 − 1/(ωC1))` and `Z2 = R2 + RL + i(ωL2 − 1/(ωC2))`, Kirchhoff’s laws give:

```text
Z1 I1 + iωM I2 = Vs
iωM I1 + Z2 I2 = 0
I1 = Vs / (Z1 + ω²M²/Z2)
I2 = −iωM I1/Z2
```

The coupling sign is a winding-orientation convention; reversing both mutual terms changes the secondary phase, not real delivered power. The accepted domain `0 ≤ k < 1` makes the inductance matrix positive definite. A strictly positive R1 and positive total secondary resistance exclude ideal singular lossless circuits. The source can be zero.

```text
Pin = Re(Vs conjugate(I1))
PL = RL |I2|²
Pwindings = R1 |I1|² + R2 |I2|²
Pin − PL − Pwindings = 0
η = PL / Pin       (displayed as 0 for a source-off state)
```

Units are consistent: `ωM` is ohms, current is amperes, `R|I|²` is watts. Stored magnetic/electric energy is periodically exchanged; its cycle-average derivative is zero. Increasing source voltage multiplies powers by voltage squared but does not improve this linear circuit efficiency. Strong coupling can split response peaks; a nominal isolated resonance need not maximize delivered power. Efficiency and maximum output power are different objectives.

Defaults are 100 μH per coil, capacitances chosen for 100 kHz isolated resonance, 0.5 Ω winding resistance per coil, 5 Ω load, coupling 0.15 and a 1 V RMS ideal source. These are model parameters, not a construction recipe. The 20–180 kHz sweep keeps these lumped parameters fixed. It omits frequency-dependent winding resistance, ferrite saturation, distributed capacitance, electromagnetic radiation, rectification, drive-electronics losses and temperature changes.

The [2025 SeMA comparison](https://link.springer.com/article/10.1007/s40324-025-00405-8) supplies an independent series-series efficiency formula and shows why distributed eddy currents can make fixed lumped models inaccurate. Our power balance is necessary for internal correctness; it does not validate a physical coil geometry.

**Experiment concept:** characterize two passive coils and a resistive receiver with calibrated low-voltage instruments, record source and load real power simultaneously, and sweep frequency at fixed geometry. The useful control is a decoupled receiver or rotated coil. A discrepancy that grows with frequency suggests missing parasitics or loss, not energy creation. Source-side voltage/current phase and instrument uncertainty belong in the comparison. No high-voltage Tesla apparatus is specified.

## 2. Phase-conjugate planar acoustic array

An 8 × 8 square grid of equal ideal monopoles lies at z = 0. Default pitch is 4.2875 mm. At 40 kHz in a homogeneous medium with sound speed 343 m/s, this is half the 8.575 mm wavelength. The centre-to-centre aperture is 30.0125 mm. There is no finite piston, housing, reflector or scatterer in this model.

For source j at position rj and target rt, the phase setting is `φj = k |rt − rj|`. With the same positive-time convention as above, propagation contributes a negative phase:

```text
q(r) = Σj exp(i[φj + εj − k |r − rj|]) / |r − rj|
Qref = Σj 1 / |rt − rj|
S(r) = |q(r)|² / Qref²
```

The coefficient multiplying each source is omitted, so q is a proxy in inverse metres, **not pressure in pascals**. S is a dimensionless **normalized mean-square pressure proxy**. The legacy API property `relativeIntensity` contains S; it does not represent net acoustic energy flux. Interfering, non-collinear waves require a pressure–particle-velocity calculation to recover the intensity vector. Neither total radiated power nor electrical-to-acoustic efficiency is calculated.

Perfect continuous phases give S(rt) = 1 by construction. For fixed geometry the triangle inequality ensures S(rt) ≤ 1 after phase-only errors. The denominator stays fixed when phase error or quantization changes, so the display cannot normalize away a degraded target. Points nearer the source plane can exceed one because the reference is the ideal target, not a global maximum or total power. Apparent global maxima near the array must not be described as the intended focus.

Phase errors are deterministic uniform offsets in the interval ± the selected bound, using an explicit reproducible seed. Nonzero phase-bit count rounds to `2^bits` levels; zero means continuous phases. These are illustrative calibration errors, not a fitted device noise distribution. The x–z cross-section uses the exact point-source sum at every sample; it is a visualization sample, not a finite-difference PDE mesh. The transverse curve passes through the target depth. The axial output samples a line at the target x coordinate; it is a selected line, not a full 3D stability analysis.

**Experiment concept:** compare an array’s measured phase map and target-plane pressure pattern against the calculation, using an appropriate calibrated microphone and isolated test enclosure. First measure individual elements, then coherent, quantized and deliberately perturbed phases. Keep total drive conditions and geometry fixed. Transducer directivity, reflection, heating, amplitude mismatch or scattering can falsify the point-source prediction. Do not infer human exposure safety from a normalized plot.

The [2015 holographic-array paper](https://www.nature.com/articles/ncomms9661) separates a phase-aligned focusing element from trap structure and reports that a simple focal point can repel dense particles. Our simulator implements the lens, not a stable particle trap. A levitation extension would require calibrated fields, material-dependent radiation forces, gravity, object geometry, equilibrium and all stability directions. A positive scalar trace is insufficient to establish a stable three-dimensional equilibrium.

[SMART (2025)](https://pubmed.ncbi.nlm.nih.gov/40394256/) and the [September 2026 rigid-body study](https://doi.org/10.1063/5.0348018) are extension leads, not methods reproduced here: the latter reports force/torque boundary-element modelling and semidefinite field translation. Our review of that 2026 item was limited to official publisher-retrieved metadata, abstract and selected passages. [k-Wave](https://www.k-wave.org/documentation.php) is a possible propagation upgrade for media and boundary effects, but has not been executed or cross-validated in this release.

## 3. Two-mode vibration absorber

Primary mass m1 connects to a fixed support through spring k1 and damper c1. Absorber mass m2 connects to the primary through spring k2 and damper c2. Coordinates x1 and x2 are **absolute** displacements; the attachment dashpot responds to the relative velocity. An external force drives only m1.

```text
m1 x1'' + c1 x1' + k1 x1 + c2(x1'−x2') + k2(x1−x2) = F
m2 x2'' + c2(x2'−x1') + k2(x2−x1) = 0

D11 = k1+k2 − ω²m1 + iω(c1+c2)
D22 = k2 − ω²m2 + iωc2
D12 = D21 = −(k2+iωc2)
X1 = F D22 / det(D)
X2 = −F D12 / det(D)
```

Every D entry has units N/m, so inversion gives displacement in metres. The undamped tuned system, with μ = m2/m1 and `k2/m2 = k1/m1`, has squared-frequency ratios satisfying `s² − (2+μ)s + 1 = 0`. This predicts two split modes, not elimination of the structure’s dynamics. The browser requires strictly positive primary damping so its bare-primary comparison remains finite at resonance; attachment damping may be zero.

```text
Pin = Re(F conjugate(iωX1))
Pprimary = c1 ω² |X1|²
Pattachment = c2 ω² |X2−X1|²
Pin − Pprimary − Pattachment = 0
```

Both stored spring energy and kinetic energy have zero cycle-average derivative in this steady harmonic solution. There is no generator in the implemented device. Replacing a damper with a generator would require an electromechanical load model and would redistribute the same externally supplied energy.

Defaults are m1 = 1 kg, primary natural frequency 16 Hz, primary damping ratio 0.025, mass ratio 0.1, tuning ratio 1, attachment damping ratio 0.12, and force 1 N RMS. The `tuningRatio` defines the absorber’s isolated frequency divided by the primary’s isolated frequency. The displayed ratio-one reference is not labelled a globally optimal design. The sweep compares configured, ratio-one, deliberately detuned and bare-primary responses under the same force.

The [MIT lecture transcript](https://ocw.mit.edu/courses/2-003sc-engineering-dynamics-fall-2011/db987263c6a2ae62499088ef7ecb7b8f_fK9AGvLf3yw.pdf), pp. 13–22, provides the static/antiresonance interpretation and stroke tradeoff. Our viscous-damping matrix follows the displayed force balance rather than a generic diagonal damping assumption. The [2017 inerter paper](https://openaccess.city.ac.uk/id/eprint/17700/) and [FAST manual record](https://arxiv.org/abs/2008.02650) are abstract-level extension leads; neither additional model has been implemented.

**Experiment concept:** use a restrained tabletop structure, a small attached passive mass, measured force and displacement sensors, and compare frequency response with and without the attachment. Repeat with deliberate detuning. Keep drive force measured rather than assuming actuator voltage fixes it. Record absorber stroke and mount flexibility: friction, collisions, nonlinear springs and moving supports can invalidate the model. Improvement at one frequency does not establish improvement over the full operating band.

## Verification and interpretation

Executable analytic fixtures test a hand-solvable coupled circuit and damped two-mass system. Other tests verify an independent closed-form RLC efficiency relation, source-off and decoupled controls, voltage-squared scaling, static and high-frequency mechanical limits, exact undamped-attachment antiresonance, passive power budgets across parameters, global acoustic phase invariance, the one-monopole inverse-square pressure law and the target-coherence triangle bound. Nine preset configurations produce finite model outputs. These checks establish agreement with the stated equations, not measured device performance.

Model comparisons and an evaluator-guided parameter search can generate **conditional hypotheses**: for example, a chosen tuning/damping pair may reduce a selected band’s worst response in this model. Such a result must retain its objective, sampled band, fixed mass budget, held-out evaluations and excluded physics. A browser sweep is not a proof of global optimality. Hardware validation would require independent measurements and a predeclared uncertainty tolerance.


---

<!-- independent-review.md -->

# Independent technical review — Device Observatory

Review date: 2026-10-16. Reviewer: a separate AI review worker (`device_review`), not a human peer reviewer. This is a bounded engineering and source review; it is not a novelty certification, regulatory approval, or hardware validation.

## Scope and frozen checks

The accepted target is three browser models: two loaded coupled RLC loops, a phased monopole array, and a two-degree-of-freedom vibration absorber. Their intended observables are currents and a power budget, relative pressure-squared patterns, and harmonic displacements and a mechanical power budget. None of these observables establishes gravity cancellation, energy creation, medical efficacy, or an operational device from an illustration.

The fixture calculations below were derived before reading the model implementation. The model worker subsequently specified RMS phasors with time convention `exp(+iωt)` for the electrical and mechanical solvers. The first mechanical fixture was initially communicated in peak units and is explicitly converted to the agreed RMS convention below. This conversion prevents a hidden factor-of-two mismatch.

### Coupled RLC: independent impedance reduction

At angular frequency 1000 rad/s, choose L1 = L2 = 0.01 H and C1 = C2 = 0.0001 F. The reactances cancel exactly. Let coupling k = 0.1, R1 = R2 = RL = 1 Ω, and the source be 1 Vrms. Then M = 0.001 H and ωM = 1 Ω. The secondary impedance is 2 Ω; it reflects 1/2 Ω into the primary. Thus the source sees 3/2 Ω.

Expected values: I1 = 2/3 A; I2 = −i/3 A for the agreed winding convention; source input = 2/3 W; useful load power = 1/9 W; primary loss = 4/9 W; secondary loss = 1/9 W. The efficiency to the load is 1/6. Input equals load plus both losses. With zero coupling the secondary current and load power vanish. These checks would catch a missing load, a wrong mutual-impedance sign, and the common peak/RMS power mismatch.

### Vibration absorber: force-balance substitution

Choose m1 = 1 kg, m2 = 0.1 kg, k1 = 100 N/m, k2 = 10 N/m, c1 = 2 N·s/m, c2 = 0.2 N·s/m, and ω = 10 rad/s. A 1 Nrms force on the primary has the exact harmonic solution X1 = −0.002 − 0.014i m and X2 = −0.072 − 0.004i m. Substitution into the two separate force balances, rather than inversion of the production matrix, verifies these numbers. Mean input is 0.14 W. Losses are 0.04 W in the primary dashpot and 0.10 W in the relative-velocity dashpot. With the same numerical force specified as a peak amplitude instead, each power would be halved; that is not the solver's convention.

When the secondary mass and its attachment are removed, the baseline amplitude is 0.05 m at this frequency. With the tuned secondary spring retained but c2 = 0, X1 = 0 and X2 = −0.1 m. An antiresonance at one frequency does not imply broadband suppression, zero internal motion, or elimination of excitation energy. Adjacent resonances and absorber travel must remain visible.

### Array: phase and normalization

For equal driven monopoles, phase-conjugating the propagation path aligns every contribution at the requested target. Dividing squared pressure amplitude by the squared ideal target sum must yield exactly one there, with numerical tolerance. The denominator must remain fixed when phase errors are applied; otherwise normalization would hide the error being tested. A uniform phase shift must leave every squared magnitude unchanged. Zero-aperture/equal-path and symmetric-target cases provide controls independent of a plotted image.

The plotted quantity is a normalized mean-square pressure proxy. In a superposition of waves travelling in different directions, it is not the net acoustic energy-flux vector, electrical efficiency, or a force/stability calculation. A pressure maximum does not establish levitation. The source idealization omits element directivity, finite apertures, measured source strength, nonlinear propagation, scattering, and boundaries.

## Source audit recorded so far

The reviewer opened the following sources independently. Reading scope is intentionally narrower than claiming an entire literature review.

| Source | Reading scope | Review use and limit |
| --- | --- | --- |
| [MIT Physics II, Chapter 11: Inductance and Magnetic Energy](https://ocw.mit.edu/courses/8-02-physics-ii-electricity-and-magnetism-spring-2007/f5c35823a7faac0d893754ab42804e7e_chap11inductance.pdf) | PDF contents and mutual-inductance/self-inductance sections, including the reciprocity and SI-unit definitions | Confirms the coupled-inductor framework; does not certify the app's component values, efficiency, or hardware. |
| [MIT Engineering Dynamics, Lecture 26](https://ocw.mit.edu/courses/2-003sc-engineering-dynamics-fall-2011/resources/lecture-26-response-of-2-dof-systems-by-the-use-of-transfer-functions/) | Official lecture description, not the full video transcript | Confirms the instructional scope of harmonic transfer functions and a dynamic absorber. Numerical fixtures above are independent force-balance calculations, not purported quotations from this lecture. |
| [Kelly and McGough: phased-array pressure calculation](https://www.egr.msu.edu/~mcgough/research/jfk/jfkarrays.htm) | Authors' university-hosted methods, results, and normalization description | Shows that delays and superposition can focus a specified source model and that numerical error must be compared to a reference. The app's simpler monopoles are not a reproduction of the finite-piston method or its error guarantees. |
| [Euphonics 9.4.3](https://euphonics.org/9-4-3-the-tuned-mass-damper/) | Equations 1–11 and topology discussion | Rejected as an equation-copying authority for this implementation: the displayed K11 has `1+ε`, but the subsequent determinant has `1−ε`; the printed damping matrix also does not represent a relative-velocity attachment dashpot. Independent force balance avoids propagating those apparent errors. |

### Current research and historical source cross-check

The reviewer inspected all source-card wording and the two companion research dossiers. The following priority originals were reopened independently; this does not imply that every bibliography item or cited experiment was reread.

| Source | Independent reading scope | Finding |
| --- | --- | --- |
| [OpenAI mathematics announcement](https://openai.com/index/sharing-ai-progress-in-mathematics/) and [repository](https://github.com/openai/math) | Announcement including its October 15 update, repository README | The records distinguish verification stages. The website does not claim that this review compiled Lean proofs or that mathematical manuscripts establish device performance. |
| [Anthropic quantum-circuit announcement](https://www.anthropic.com/research/designing-efficient-quantum-circuits) and [paper v1](https://arxiv.org/abs/2610.22367v1) | Company article and preprint abstract/metadata | The paper's distinction is retained: seven tasks improve both resource counts; the eighth improves a trade-off. This is a preprint, and algorithm-resource estimates are not hardware measurements. |
| [AISTATS operator paper](https://proceedings.mlr.press/v300/gopakumar26a.html) and [ICML equilibrium paper](https://proceedings.mlr.press/v306/ding26w.html) | Official proceedings metadata and abstracts | Both are proceedings records. The source researcher subsequently read selected publisher-PDF sections; that deeper reading is attributed to the source researcher, not repeated here. Neither paper certifies these browser models. |
| [Model Hardware Standard announcement](https://www.anthropic.com/news/model-hardware-standard-research-preview) | Preview, interface description and limitations | Correctly classified as a partner preview. No claim of installed SDK compatibility, real-instrument access or autonomous physical control appears in the reviewed cards. |
| [Tesla US685957A](https://patents.google.com/patent/US685957A/en) | Description of collection, external radiation and auxiliary-supply embodiments | The complete input boundary matters. The dossier does not reinterpret accumulated external energy as an energy source without input. |
| [CN102384983A](https://patents.google.com/patent/CN102384983A/zh) | Chinese mechanism description, equations 1, 7, 8 and claims | The proposal retains gravity and describes near-field support. Its static inverse-square illustration is not substituted into the far-field monopole model. |
| [RU2539304C2](https://patents.google.com/patent/RU2539304C2/ru) | Russian operating description and claim | The driven equipment is moved to the track. The reviewed interpretation retains offboard input instead of describing energy-free levitation. |
| [NASA BPP report](https://ntrs.nasa.gov/api/citations/20040070788/downloads/20040070788.pdf) | Abstract, methods, findings and section 3.1.4 | The report separates unresolved and nonviable tasks and warns against broad extrapolation. An interference-limited test is not a detected anomalous force. Other task details retain the source researcher's narrower reading attribution. |
| [Newton's Emerald Tablet manuscript edition](https://newton.dlib.indiana.edu/text/ALCH00017/normalized) | Catalogue description and English text on folios 2r–2v | This supports a historical manuscript connection. It supplies no operational field equation or evidence of a constructed levitation device. |

The historical dossier's modern reconstruction `h(a) = h0 / sqrt(1 + a/g)` was checked directly against its two stated force balances, with `a > −g`. Its derivative at zero gives the stated linear response; its local restoring stiffness is `2mg/h0`. These checks validate algebra under an assumed static force law, not a patented accelerometer. The proposed experiments H1–H6 remain explicitly unbuilt proposals, with controls and observations that could count against their claims.

## Critique and fix round

1. **Acoustic label:** The initial API name `relativeIntensity` could imply calibrated acoustic power. The model worker revised displayed labels and comments to a fixed-reference pressure-squared proxy and explicitly states that target coherence is not power efficiency. The legacy internal property name remains documented.
2. **Source precision:** The quantum-circuit abstract distinguishes seven joint improvements from an eighth trade-off. The source worker retained that distinction instead of generalizing a broad company-announcement phrase.
3. **Absorber comparison domain:** The first raw solver accepted zero primary damping, but computing the bare-primary comparison could throw at its resonance even when the coupled solution was finite. The model worker tightened the raw primary-damping domain to strictly positive values and documented that boundary. This preserves a finite baseline over the admitted domain; it does not claim that undamped systems are physically impossible.
4. **Historical formula copying:** A source-page inconsistency in the tuned-mass derivation was raised before implementation. The worker used independent force balance, and the exact fixtures verify the resulting signs and topology.
5. **Hypothesis controls:** An initial coupling-calibration proposal changed spacing while keeping a single fitted coupling fixed. The proposal now holds spacing and alignment fixed for its withheld-load check, and explicitly requires a separate geometry-to-coupling model for a spacing prediction. The phase-calibration hypothesis also acknowledges that one error realization can partly cancel quantization error; repeated-seed comparisons are distinguished from the single displayed seed.
6. **Native control consistency:** The acoustic pitch default was initially outside the numeric input's step grid, allowing a native slider to snap away from the modeled value. The metadata now uses an aligned pitch step. A similar endpoint issue was raised for the phase-error control: its 3.14-radian maximum should align with its step. The numerical model itself is unaffected; final native-input behavior belongs in the browser check.
7. **Search provenance in the interface:** The first integration applied a search result immediately and omitted its full comparison record from export. The revised interface shows the candidate count, objective, frequency band, training/withheld sample counts, baseline comparison and limits. Applying a candidate requires a separate click. A dedicated search JSON retains every trial, the original baseline, both evaluation grids and build provenance.

The executed review command is `node --test tests/review.test.mjs` from the `device-observatory` directory. Seven independent tests pass: exact loaded-loop accounting, disconnected receiver and drive scaling, exact damped absorber response, a notch with internal travel, the vanishing-mass limit, fixed-reference destructive array interference, and global-phase/mirror symmetry. Passing numerical checks is evidence about these reduced models and their implementation, not about omitted physical effects.

### Bounded design-search check

The added `src/search.mjs` implementation evaluates 81 tuning/damping pairs against the largest response over 31 frequencies from 0.8 to 1.2 times the primary natural frequency. It then evaluates the chosen design and baseline on 30 interleaved frequencies. Mass, driving force and primary damping remain fixed. The search correctly says that it calls no AI model and establishes only a best sampled candidate from this grid. Interleaved frequencies test numerical sampling, not physical model fidelity. No stroke or thermal constraint is optimized.

For the default configuration, a separate 6,001-point evaluation over 12.8–19.2 Hz was executed after selection. The selected tuning ratio 0.9 and damping ratio 0.2 gave a maximum primary response of approximately 0.386279 mm RMS, versus 0.636858 mm RMS for the default baseline. The original training and interleaved maxima were approximately 0.386001 and 0.386231 mm, respectively: finite sampling slightly understated the denser maximum, but the default comparison's improvement survived this check. This is not a proof of the continuous maximum, robustness to uncertain parameters, or real apparatus performance.

All 34 source records were checked for unique identifiers and the required title, URL, publisher, date, status, reading-scope, claim, limitation and application fields. The rendered-interface source was inspected for RMS units, the pressure-squared proxy, disclosed color clipping with its actual maximum, explicit concept-art captions, and selected-source scope. These labels are present. Browser rendering and deployed-resource verification remain the integration owner's separate checks.

## Review status

Model implementation, source-card wording and interface-code review: **PASS within the stated reduced-model scope**, after the critique/fix round above and seven executed independent tests. The design-search comparison also survived the additional default-case dense sampling check. Browser rendering, interaction testing and final deployment are the integration owner's separate checks. No hardware was built or measured by this reviewer; no external simulator benchmark, full literature census, original-proof audit or legal patent examination was performed.


---

<!-- integration-checks.md -->

# Integration verification

Performed 16 October 2026, separately from the source and mathematical review.

- `npm run check`: 21 passing Node tests; isolated static build succeeds.
- Chromium integration checks at 1440 × 1000 and 390 × 844: all three benches and nine presets render with finite outputs; native numeric controls are valid; CSV/JSON downloads contain their parameters and data; search exports contain all 81 candidate records and withheld comparisons; a candidate changes controls only after an explicit apply action.
- Clipboard parameter links restore the selected model and controls. Invalid numeric input is rejected. Keyboard tabs, source text/type filters, all nine hypothesis contracts, all nine connection records, both images, the dossier and source-register downloads were checked.
- No browser exceptions, failed local resource requests, or document-level horizontal overflow were observed. On small screens the scientific chart intentionally scrolls horizontally to retain legible axis labels.
- Both workflow YAML files parse. An actual `rsync --delete --exclude /devices/` fixture preserves an existing device page while removing an unrelated stale file.
- Application source in master/archive, existing audio assets, and frozen editions are outside the new site's changes. Master receives only a deployment-directory preservation rule. The new workflow shares the existing Pages concurrency lock and stages only the `devices` directory.

The repeatable browser check is `scripts/browser-check.cjs`. Install Playwright in a separate development environment and run it against `dist`; set `DEVICE_CHROMIUM` when using a custom Chromium binary. The public website has no Playwright or npm runtime dependency. `research/browser-check.json` records the local viewport checks.

This file records local verification before the new-branch release. A successful push, successful workflow, and matching live `deployment.json` are distinct publication checks; the release response reports those only after they complete. No physical apparatus or external high-fidelity simulator was operated.

## Actual delegated work

Six software agents were delegated distinct file ownership: `ai_frontier_sources`, `historical_devices`, `device_physics`, `device_interface`, `device_review`, and `device_illustrations`. The root integration agent wrote the catalog, bounded design search, build/deployment scripts and integration checks. The independent reviewer derived numerical fixtures before inspecting the model implementation. These are AI-agent reviews, not human peer review, independent experimental replication, or proof that agent agreement is corroborating evidence.

The research workflow used six local bounded task contracts with a pinned scope and actual agent receipts. Artifacts were reviewed before integration; important changes from review are documented in `independent-review.md`. No claims of reviewing every paper, patent, government file, or occult text are made.


---

<!-- image-provenance.md -->

# Device Observatory image provenance

Generated 16 October 2026 using the built-in `image_gen` tool in default built-in mode. Two separate generation calls were made. No API keys or CLI fallback were used. The selected original PNG outputs were copied without editing into this repository; original outputs remain at their tool-generated paths. Images were visually inspected before inclusion.

These are AI-generated editorial concept illustrations of hypothetical equipment. They are not photographs, engineering drawings, bills of materials, numerical simulations, measured results, or evidence of built or working prototypes. Apparatus geometry, wiring details, transducer count, enclosure boundaries, and spring connections are illustrative and must not be used to infer model parameters or to construct equipment. In particular, the tiny suspended point in the hero image is a conceptual visual cue, not a claim of stable three-dimensional levitation. The website's deterministic diagrams, equations, controls, and limitations govern interpretation.

## Hero asset

- Project path: `public/assets/device-observatory-concept.png`
- Original output: `/workspace/scratch/c230cc629529/generated_images/exec-3a1e4719-3513-4ca9-9286-2a1fd9dad2a9.png`
- Dimensions: 1774 × 887 pixels.
- Content: powered coil source and receiver/load, enclosed planar acoustic array, spring-mass vibration-absorber concept.
- Inspection: three distinct apparatus groups, visible external source/load electronics, warm off-white/deep teal/copper palette, no text or numerical claims.

### Exact prompt

```text
Use case: stylized-concept
Asset type: wide editorial hero illustration for a scientific Device Observatory website.
Primary request: A tasteful industrial-design concept illustration showing three distinct hypothetical benchtop devices together on a spacious off-white studio work surface. Left: two upright copper wireless power-transfer coils, a visible cable leading from an external dark teal source electronics box to the first coil, and a separate receiver coil connected by cable to a small dark teal load box. Middle: a planar acoustic transducer array lying horizontally inside a transparent protective enclosure, a tiny point-sized focal region above its face, and external electronics connected by cable. Right: a mechanical vibration absorber showing one large mass on springs with a smaller auxiliary mass attached through its own spring, all mounted on a tidy benchtop frame. Emphasize plausible scientific instruments and careful measurement, with no extraordinary physical effects.
Style/medium: refined editorial 3D illustration, believable copper, matte dark teal powder-coated metal, brushed aluminum, glass and clear acrylic materials; not a blueprint or technical diagram.
Composition/framing: wide panoramic composition, three devices readable as separate groups, eye-level three-quarter view, plenty of negative space and soft shadows, all subjects comfortably inside the frame.
Lighting/mood: quiet natural studio lighting, sophisticated and curious rather than futuristic spectacle.
Color palette: warm off-white background, deep teal instruments, muted copper accents, soft charcoal cables.
Constraints: Absolutely no text, labels, numbers, logos, watermark, fabricated plots or scientific measurements. No people, no human levitation, no antigravity visual, no glowing energy beams, no free energy imagery. This is explicitly a hypothetical concept illustration, not evidence of built or working hardware. Landscape aspect ratio approximately 2:1.
```

## Detail asset

- Project path: `public/assets/device-detail-concept.png`
- Original output: `/workspace/scratch/c230cc629529/generated_images/exec-dd7b6f13-d1e9-4fa8-a2d7-b95d489b3fdd.png`
- Dimensions: 1536 × 1024 pixels.
- Content: acoustic-array concept with translation-stage probe and external electronics.
- Inspection: probe attached to carriage, cable connections visible, protective enclosure shown, no floating objects or fabricated measurements.

### Exact prompt

```text
Use case: stylized-concept
Asset type: editorial device-detail concept illustration for a scientific Device Observatory website.
Primary request: A close three-quarter view of a hypothetical acoustic-array measurement bench. A horizontal square planar array of small circular ultrasonic transducers sits inside a transparent protective acrylic enclosure. Above the array is a fine point microphone probe mounted on a small precision translation stage with orthogonal rails, positioned to scan the sound field. The probe is slender and clearly attached to its rail carriage; no floating objects. External dark teal drive and measurement electronics connect to the array and probe through visible cables. The apparatus rests on a tidy off-white benchtop.
Style/medium: refined editorial 3D industrial-design illustration, physically believable materials and quiet detail, not a technical schematic or blueprint.
Composition/framing: landscape composition approximately 3:2, closer framing emphasizing the array, probe, translation rails and external electronics, everything comfortably inside the frame. Consistent palette: warm off-white studio, matte deep teal instrument boxes and frame, subtle copper transducer accents, brushed aluminum rails, clear acrylic, soft charcoal cables. Soft studio daylight and gentle shadows.
Constraints: No text, labels, logos, numbers, watermark, displays with fabricated measurements, plotted curves, pressure-field colors, glowing sound waves or energy beams. No people, no levitation of humans, no antigravity, no magic effects. This is a hypothetical/AI-generated concept illustration rather than a real prototype or evidence of performance. Emphasize measurement and reproducible experiment geometry, not a decorative futuristic machine.
```

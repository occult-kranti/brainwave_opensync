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

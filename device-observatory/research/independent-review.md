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

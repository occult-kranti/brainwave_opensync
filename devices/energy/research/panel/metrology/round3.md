# Metrology panel: Round 3 final review

Review date: 22 October 2026 UTC. This closes the third metrology round. The original Round1 contract and all Round2 records are preserved. Earlier reference metadata use 21 October, the local date during preparation; the reference file hashes, frozen artifacts and recorded access order establish the sequence, not a claim of externally witnessed timing.

**Verdict: accept the bounded simulation and measurement-design package. It contains no measured excess-energy result.** The new tests in this round are a separately authored quantum reconstruction, a frozen blind diagnosis of three synthetic records, and integration checks that protect the meaning of each calculator. The earlier arithmetic controls alone were not counted again as independent evidence.

## Criticism → response → decision

| Criticism | Response and evidence | Decision |
|---|---|---|
| A work formula agreeing with itself would not independently check the quantum module. | Before first reading `quantum.mjs`, this reviewer froze complex density matrices, matrix Kraus channels, Hermitian eigendecomposition, explicit unitary rotations and 648 expected outputs. Only then was the producer inspected and compared. | Accept the tested ideal two-level work calculation. Do not infer apparatus efficiency or practical control accessibility. |
| A diagnostic agent that already knows the injection assignment could simply repeat it. | The quantum agent independently integrated only raw cards, froze its script and diagnoses, and supplied hashes. This reviewer verified all three artifact and four input hashes before opening the separate key for scoring. General failure modes were known from Round1. | Accept assignment-blind diagnosis of these selected cards, with the limited independence described below. |
| A plausible explanation for an energy residual can be mistaken for an identified cause. | Card 19 has a 0.04 J gap and an unmetered controller. The diagnostician explicitly said 0.04 J is conditional missing energy, not a measurement of controller energy, and retained competing explanations. | Appropriate abstention is part of success. The injection key does not retroactively make the raw channels identifiable. |
| Near-zero model closure might be presented as extraordinary instrumental precision. | Fifteen direct API checks retain user-supplied uncertainty, numerical covariance tolerance, omitted boundaries, null efficiencies at zero input, and finite-grid qualifications. | Numerical agreement validates these calculations under their assumptions. Instrument uncertainty still requires calibration and provenance. |
| Joining six research tracks could add the same energy twice or compare incompatible efficiencies. | The boundary audit below separates terminal, receiver, state, apparatus and documentary evidence. | Integrate through explicit boundaries and source links; do not combine those quantities into an overall generation score. |

## Independent quantum reconstruction

The prepared state was represented directly as

\[
\rho=\begin{pmatrix}1-p&c\\c^*&p\end{pmatrix},\qquad
c=\kappa\sqrt{p(1-p)}e^{i\phi},\qquad H=\operatorname{diag}(0,hf).
\]

Amplitude damping was computed using two Kraus matrices; dephasing used weighted identity and Pauli-Z conjugations. A numerical Hermitian eigendecomposition returned the state eigenvalues and eigenvectors. Placing the larger state eigenvalue in the ground-energy eigenvector constructs a passive state and an explicit unitary achieving its energy. Extractable work is the original energy minus this rotated-state energy. This method does not reuse the producer's scalar determinant expression.

The frozen grid contains six populations, four coherence magnitudes, three damping probabilities, three retained-coherence fractions and three complex phases: **648 cases**. The density matrices were checked for unit trace and positive semidefiniteness. Work bounds and damping-channel energy were checked before producer comparison. The largest producer/reference difference is **2.7756 × 10⁻¹⁶ of the energy gap**. Three additional direct two-angle unitary searches each evaluated a 181 × 361 grid. The largest sampled energy above the exact passive bound is **3.6153 × 10⁻⁶ of the gap**; the other differences are floating-point roundoff. The sorting construction supplies the bound; the finite grids corroborate selected states, without proving a global optimum by sampling.

The module retains `apparatusEfficiency: null`. A passive mixed state with positive stored energy and zero unitary extractable work rejects the wrong estimator “all state energy is accessible work.” Phase invariance here follows from the specified diagonal Hamiltonian and unrestricted unitary optimization. It does not imply that a restricted laboratory control set has no phase dependence or cost.

Reproduce the comparison:

```sh
python3 -B analysis/metrology_quantum_check.py --compare research/panel/metrology/round3-independent-quantum-fixtures.json --output research/panel/metrology/round3-quantum-results.json
```

`round3-independent-reference.py` preserves the exact source used before producer inspection. `round3-independent-freeze.json` identifies that file and the fixtures; `round3-quantum-results.json` records the checked producer and checker hashes. The producer was authored by a different agent. Both agents use the same underlying model family; this is independence of implementation and information sequence, not a guarantee of statistically independent reasoning errors.

## Frozen blind-card review

The diagnostician's freeze hash is `815331506d2be16ebb208f927e32d11bb4a8b97e8c6a699a548eda6e5bd3bb37`. Its original diagnosis remains in `research/panel/quantum/blind-diagnosis.md` and `.json`. `round3-blind-review.json` records the rubric, hashes, key-opening order and per-card assessment. Raw cards and the original manifest are archived in `round3-blind-cards/`; `round3-blind-key-revealed.json` is now disclosed after diagnosis freezing.

| Card | Ground-truth construction | Frozen diagnosis | Assessment |
|---|---|---|---|
| 41 | Differential current-channel delay of 1 μs at 1 kHz; an in-phase calibration reference is supplied. | Estimated principal delay 1.00000000000036 μs. Corrected phase 85°, with closure within numerical roundoff, conditional on common transfer paths. Noted delay ambiguity modulo a period. | Detectable calibration effect recovered; no unsupported claim of a unique hardware fault. |
| 72 | A constant 0.02 F capacitor releases 0.1 J. | Endpoint storage change −0.10000000000000002 J accounts for the apparent surplus. Requests recharge and reset accounting. | Detectable omitted storage recovered. |
| 19 | Unrecorded controller input of 0.04 J; no controller energy channel is supplied. | Reports a 0.04 J conditional budget gap and an incomplete boundary. Does not call the injected value a measured or uniquely identified controller input. | Appropriate abstention; no invented cause asserted. |

There were no missed detectable issues and no unsupported causes asserted under this rubric. This is a **small selected test of three deterministic synthetic cards**, not a reliability benchmark, population estimate or physical experiment. The reviewer authored the cards, the diagnostician knew the general failure-mode taxonomy, and the test contains no realistic random instrument errors. Those limitations prevent extrapolation to autonomous scientific discovery or experimental anomaly detection reliability.

## Six-track energy-boundary audit

| Track | Admitted quantity and boundary | Excluded inference / integration rule |
|---|---|---|
| Electromagnetic / Tesla mechanism | RMS phasor real power at an ideal AC terminal; separate electrical and mechanical load ports; fixed mutual inductance. | Converter and controller supplies lie outside this efficiency. Changing mutual inductance needs its work port. Sampled fixed-voltage and matched-input optima have different constraints; neither is a source discovery. |
| Acoustic receiver | Mean mechanical force–velocity work into a reciprocal piezoelectric receiver; AC resistive load output. | A microphone SPL and reference plane-wave flux do not identify captured device power. Speaker/amplifier electricity is upstream. Select one apparatus boundary so upstream electrical work and downstream acoustic work are not counted as separate inputs to the same ledger. |
| Quantum work | Prepared two-level state energy and ideal work under arbitrary cyclic unitary controls, with specified damping/dephasing channels. | Preparation, control supply, measurement/memory, refrigeration and reset remain unmetered. A Hamiltonian-norm control metric is not measured wall-plug energy. Ergotropy and environmental state-energy release must not be added as if the same state energy were available twice. |
| Metrology | Signed non-overlapping transfers, storage endpoints and a supplied covariance/uncertainty budget for a declared interval and boundary. | A chosen uncertainty is not a compensating energy term. Including zero in the interval does not prove completeness or equivalence. Numerical residual, solver tolerance and PSD threshold do not estimate instrument uncertainty. |
| Systems / identifiability | Exact electrical scaling ambiguity of a separate four-state reciprocal model; selected local rank tests and an added calibrated velocity observable. | A passive fit does not certify unmeasured hardware. The rank3→rank4 change removes the demonstrated local scaling ambiguity under its model and selected measurements, not every possible hidden input or alternative model. |
| Government, historical and patent records | Dated documents, program objectives, reported demonstrations and claim provenance. | Funding, official custody, a patent or repeated records do not validate a mechanism. The independently checked MARRS picobarn/unit discrepancy concerns the published unit statement; it does not establish intended program values or physical success/failure. Upstream energy and award-performance evidence remain unavailable where marked. |

The earlier copper-position protocol contributes calibration, return/ABBA sequences, shams and a fixed observable definition. It supplies no measured energy balance for this branch.

Run the final semantic checks:

```sh
node research/panel/metrology/round3-semantic-guards.mjs > research/panel/metrology/round3-semantic-results.json
```

All **15 checks passed** against the module hashes recorded in that result. These are selected direct API checks, not new independent validations of the EM or acoustic equations; the systems scientist owns those independent reconstructions. They verify zero-input semantics, the state/apparatus distinction, local-identifiability scope, signed real versus apparent power, finite-grid scope, and matched-input constraint ordering. Documentary provenance is reviewed above rather than pretended to be validated by executable physics tests.

## Final disposition

The branch can publish its established derivations, clearly labeled simulations, source network, false-positive controls and proposed measurement protocol. No result in this review supports free energy, net energy creation, a completed quantum device, or a measured full-cycle efficiency. A real experimental claim would need synchronized signed port measurements, independently calibrated gain/phase and timebase, storage endpoints, an auditable uncertainty covariance, preparation/reset accounting and replicated raw data. Those are missing measurements, not optional fit variables.

The project synthesis is a measurable, nested-boundary energy ledger with explicit ambiguity tests. Its originality as a scientific method has not been established. The three metrology rounds are complete; publication claims should remain within the bounded verdict above.

# Final research round — skeptic admission

Date: 2026-10-29. Read the frozen R3 contract, final producer model/results/report/revision notes, independent verification report/results/freeze, observation source ledgers and current dashboard source. Independent inverse/nuisance checks were executed in `round3-counterchecks.py` before producer source inspection. This closes R3; no fourth research round was executed.

**Accept the repaired implementation within the declared calibrated single-mode and metadata-only scopes.** Parameter recovery, selected wrong-model failures and the receiver counterexample agree with independent derivation. No current Schumann anomaly, Earth inverse solution, new theorem or energy source is established. The separate `prior-art-gate.md` rejects novelty claims for the core formulas and conditions any next research cycle on a distinct question.

## Restricted identification and its boundaries

For known positive mass m and probe omega, calibrated complex H in m/N, and the convention q=Re(Q exp(i omega t)), define Z=1/H. The model's identity is

`Z=m(omega0^2−omega^2)+i 2m gamma omega`.

Real and imaginary parts therefore uniquely determine positive omega0 and gamma inside this exact two-parameter model. That is conditional parameter identification, not validation of the model or receiver. Conjugating H while retaining the inversion convention gives negative gamma; this tests a convention mismatch, not a physical claim that choosing exp(−i omega t) consistently would invalidate damping.

My independent tests used the actual R2 physical parameter sets, a 6.4 Hz probe and untouched 3.2/12.6 Hz responses. Exact recovery and held-out complex predictions agree to less than 2.7e-17 relative. A 1.25 gain incorrectly treated as calibrated unity, with true mass still assumed, produces held-out discrepancies from approximately 7.4% to 31.7%. A declared two-mode mixture fitted by one mode produces 7.0% and 23.1%. These checks discriminate the declared cases; arbitrary incorrect models can still interpolate finitely many observations.

The producer uses a different 5 Hz probe and held-outs at 2.5,10.7,16.4 Hz, and the verifier uses its own fixtures and held-outs. Their counts and error values should not be merged as if they were repeated measurements. A deterministic complex perturbation is a sensitivity example; failing a stringent arithmetic tolerance is not evidence that an actual noisy experiment would be statistically rejected.

For clarity about conditioning, if an additive complex perturbation obeys abs(delta)<=eta<abs(H), then

`abs(1/(H+delta)−1/H)<=eta/[abs(H)(abs(H)−eta)]`.

This elementary bound follows from the reciprocal difference identity and triangle inequality. My separate perturbation checks satisfy it. It does not include unknown calibration, mass uncertainty, model discrepancy or estimated noise statistics; no experimental confidence interval follows.

## Constant gain versus an unconstrained receiver

With H_meas=A H and positive constant A, inverse response has slope −m/A against omega^2. Two distinct frequencies recover effective mass m/A, omega0 and gamma; if m is known, they also recover A. My 1.25-gain examples recover the original poles and effective masses0.2/0.32 kg. The producer and verifier independently exercise this qualification. Thus failure under an assumed unity gain must not be reported as impossibility under every constant-gain model.

For frequency-dependent complex G=H2/H1, the output G H1 equals H2 on every nonzero-response band. The producer's additional **same-known-mass** control is essential: the original R2 pair has unequal masses and alone would mix receiver and mass assumptions. The added m=0.25 kg control produces the apparent different pole set and passes held-outs while retaining the true physical mass.

The stronger rational statement in the final report is correct: the ratio of these positive-damped oscillator responses is proper, real rational and stable, with stable zeros and an allowable direct feedthrough in a causal state-space realization. Stability and causality alone therefore do not remove this particular nuisance ambiguity. This is a system-theory realization, not a demonstrated passive physical sensor or actual calibration record. Dividing by a total multimode response at an interference zero remains excluded. Neither finite-band equality nor a finite held-out pass establishes real instrument validity.

## Concrete defects found and resolved

1. The verifier's H=(1−i)×10^308 m/N countercase was initially accepted even though representable recovered parameters could not reproduce the input within the supported forward range. The repaired inverse forwards its recovered parameters through the supported model and rejects an unsupported range or relative complex replay mismatch above10^-10. The original failing producer and comparison bytes are preserved, and the final regression rejects the case. A forward replay gate catches that inconsistency; it is not a universal accuracy or conditioning theorem.
2. I found the assessment cutoff incorrectly substituted for actual retrieval timestamps. The final quick-look packets now use null retrieval times where the image ledger lacks them. NOAA uses its manifest time2026-10-29T04:56:14.803554+00:00, preserves that original precision and explicitly truncates to milliseconds for the parser. The assessment cutoff remains a separate field. All three actual packets still abstain; the correction neither creates nor disproves an event.

## Metadata readiness is not anomaly detection

The inspected intake checks strict station/channel/observable/record fields, UTC consistency, declared coverage, calibration/QC/baseline/decision metadata and global child-record requirements. Global checks reject duplicate IDs, incomplete child records and inconsistent common intervals. The independent verifier exercises46 metadata cases: two synthetic readiness passes and44 insufficient-evidence results. The source packet's Tomsk/Nagycenk quick-looks and NOAA Kp context yield insufficient evidence.

The function does not inspect numeric bytes, authenticate calibration, establish independent instruments, validate the statistical method or compute an anomaly statistic. Two different station names may still be aliases; two complete metadata packets may still contain false assertions. `anomalyEstablished:false` means the code establishes no anomaly; it is not a statistical finding that nature had no anomaly. A successful metadata fixture is explicitly synthetic and only ready for separately specified analysis.

No station numerical record, matched baseline or uncertainty analysis was supplied by these tests. Dependence, selected time windows/modes, multiple comparisons, source geometry and receiver nuisance still require an actual observational study.

## Final source bindings and public language

Producer revision2 reports58 assertions. The independent verifier reports82 API requests and340 assertions, with maximum nonzero numerical discrepancy3.21e-13 under its predeclared tolerance. Actual bytes match:

- Model: `c59e7b5d2489294c897a641a767fce25d5c743ea49e4236dcfebdc35ea1bec30`.
- Producer results: `5cdfff4035371cbc162899474f8e6f98130331b2f9a8d767d2b4d5782c5cb399`.
- Producer runner: `f4e298713d797a706a3f5bd2fb10c1c08306e171a006d45b31cd6706c767cfd0`.
- Independent comparison: `e1d165e3e91109c320a27d9e29d45b785354df57b4bdb0ac592a50d7cbe6f182`.

I reviewed `schumann-pages.mjs`, `src/schumann-ui.mjs` and `data/october-update.json`, without editing them. The two requested wording corrections are present: E1 is a **qubit** partial-dephasing bound, encompassing mixed states; the spectral chart says **Normalized PSD** and does not compare absolute PSD levels. The draft distinguishes unresolved Schumann evidence from geomagnetic context, announced physics from checked proofs, density from power, and synthetic models from observations. Final round counts and result tables are the advisor's integration responsibility; this review does not certify a later uninspected rendered build.

No additional research round is recommended merely to rerun these known formulas. The next decision is the separate prior-art/data gate: choose an unambiguously specified contribution and acquire or justify its required calibrated evidence.

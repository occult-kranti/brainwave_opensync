# Round 1 implementation feasibility — prospective only

Owner: `contact_engineer`, a model-agent implementation worker. Date: 2026-10-29. Status: **planning only; no synthetic experiment or later-round calculation executed**. Await the advisor's selected Round 2 contract after the independent source and skeptical reviews.

## Preserved architecture

Read the Observatory `AGENTS.md`, `README.md`, `package.json`, the build's copy/render sections, and the October study receipt and release-checker. Existing scientific code and all frozen reports remain untouched. The October receipt binds `package.json`, `build-schumann.mjs`, `schumann-pages.mjs`, and the existing Schumann modules. An added page should therefore use a separately invoked additive build overlay or an explicitly versioned integration decision; silently changing these bound files would invalidate the old gate. The original builder already copies the `research/` tree into `dist/`, so new standalone research files are available without changing the scientific code.

Implementation ownership is this study's `analysis/` directory only. A future accepted implementation should have separate per-round directories containing a model/runner, frozen parameter contract, deterministic fixture/output JSON, report, and SHA-256 manifest. Failed variants stay in a revision directory. Root owns integration and release decisions; a separate verifier must derive and run its own oracle.

## Smallest useful computational question

Can an ordinary, prespecified dependence structure produce an apparently strong association between a geophysical feature and a reported contact-event score when the analyst scans lags or omits coverage controls? Conversely, does a frozen test recover a deliberately injected association in a declared synthetic model?

This is a software/method benchmark, not a new theorem and not a simulation of actual extraterrestrial communication. No paired calibrated Schumann series and independently locked contact-event dataset is available to this worker. The old Kp series is not a substitute for an ELF Schumann measurement. Synthetic outcome labels must never be displayed as an observed anomaly or a participant's actual report.

## Candidate null benchmark for advisor selection

1. **Exact specification first.** Freeze sample count, cadence, PRNG algorithm/seed, Gaussian transform, burn-in, all coefficients, missingness process, candidate lags, statistic, sidedness, alpha, number of replications and uncertainty summary. Make this public before evaluating the generated fixtures. Use a modest bounded grid rather than tuning until a dramatic result appears.
2. **Independent autocorrelated null.** Generate two independent stationary AR(1) sequences with known coefficients of magnitude less than one. A scaled innovation can fix marginal variance. The test statistic can be the maximum absolute Pearson correlation over a declared finite lag set, recomputed identically for every null replicate. Compare fixed-lag and scanned-lag behavior. Ordinary sample-wise shuffling destroys autocorrelation and is an intentionally misspecified comparison, not the recommended null.
3. **Separate ordinary common-cause control.** Add a shared calendar/diurnal term and/or a measured covariate to two otherwise independent series. This is a counterexample to causal interpretation of correlation; it is not the same null as unconditional independence. An astronomy calculator can supply timestamps or prespecified celestial covariates, but astrological labels do not establish an electromagnetic coupling.
4. **Missingness controls.** Run complete coverage, independent censoring, contiguous outage, and outcome-dependent availability as separately labeled scenarios. Carry pairwise-valid counts per lag; no interpolation of contact reports, no zero-filling of unavailable sensor values. An apparent effect from selective availability should be reported as selection bias in this generator. Reject lags with fewer than a frozen minimum of valid pairs; that threshold alone does not correct selection bias.
5. **False-alarm assessment.** For a fully known synthetic generator, an independently generated Monte Carlo maximum-statistic null can account for the declared lag search. Report `(b+1)/(B+1)` for a Monte Carlo p-value and binomial uncertainty for repeated rejection rates. These numerical p-values are conditional on the chosen generator and tested search space. They do not validate a general real-world null model. Do not call a single lucky seed an empirical false-positive rate.
6. **Positive control.** Inject one frozen synthetic lagged response at a declared effect size; measure sensitivity on independent fixtures. Association recovery does not identify its cause or an extraterrestrial agent.

Circular shifts or block permutations are possible follow-ups only if the source panel and advisor justify stationarity, exchangeability, boundary handling and block length. They are not automatically exact under trends, missingness or diurnal structure. More complicated source/noise models must be selected from an actual unresolved objection, not precomputed as later rounds.

## Candidate information-score endpoint

A contact test should measure a preregistered, mechanically scored target-information task. For example, exactly one concealed uniformly randomized target among a fixed number of alternatives could produce a categorical correctness score, with independent custody, masking and complete attempt accounting. The binomial baseline requires genuinely independent, uniform target assignment and a fixed scoring rule; repeated subjects, hints, unequal target probabilities and selective reporting can invalidate it. Rank or free-text scoring needs its own blinded procedure and null. An ordinary information leak is a distinct control and alternative explanation, not a minor nuisance to be subtracted after seeing results.

Linking such an endpoint to a geophysical trace would require independent timestamp locking, a predeclared sensor feature and window, target randomization independent of the environment, and a held-out analysis. A positive association would still not establish contact, consciousness-mediated coupling, or source identity. A null result would constrain the declared protocol and effect range, not all spiritual interpretations.

## Candidate classical EM calculation

An ideal fixed planar single-turn loop of area `A` in a spatially uniform sinusoidal magnetic flux density with RMS magnitude `B_rms`, frequency `f` and angle `theta` to its normal has `V_rms = 2*pi*f*A*B_rms*abs(cos(theta))`. An `N`-turn ideal coil multiplies this open-circuit EMF by `N`, subject to the declared lumped-model assumptions. This follows Faraday's law, not an occult-specific mechanism.

The calculation would be a dimensioned arithmetic and scaling check only: zero frequency/field/area and orthogonal orientation controls, RMS versus peak convention, and a separate finite-difference flux derivative check. A finite passive load requires impedance, thermal/noise bandwidth and an explicit source/loading energy budget. The open-circuit voltage is neither delivered power nor evidence of neural stimulation. A human body is not automatically this ideal wire-loop geometry, and an assumed field amplitude is not a contemporaneous station measurement. Numerical parameter values should be chosen only in the selected contract after source review.

## Paired input schema proposal

| Record | Required fields before analysis | Purpose |
| --- | --- | --- |
| Provenance | Record ID, public source URL or controlled acquisition ID, SHA-256, retrieved UTC, event UTC, license/consent scope, read-depth, real/synthetic tag | Prevent mixing source assertions, simulated values and measured records |
| ELF channel | Station, position, component/orientation, observable and SI units, cadence/sample rate, clock basis and error, calibration revision, noise floor/bandwidth, acquisition/filter settings | Define what was actually measured |
| Spectral feature | Frozen estimator/version, physical window, frequency band, mode identity assumptions, uncertainty, QC flags, missingness mask | Separate an apparent peak from an intrinsic pole or amplitude change |
| Contact attempt | Pseudonymous attempt ID, locked start/end UTC, target randomization/custody record, locked response hash/time, score rule, scorer masking, all attempts and exclusions | Define information outcome and detect selective reporting/leakage |
| Context | Lightning/source proxy, local interference, station maintenance, solar/geomagnetic covariates, calendar/astronomy covariates if preregistered | Test ordinary alternatives without retrospectively expanding the model |
| Pairing contract | UTC alignment, maximum clock uncertainty, window/lag family, minimum coverage, exclusion rules, analysis population, independent held-out split | Prevent post hoc window and subject selection |
| Decision | Exact null/alternative, primary statistic, familywise scope, alpha, power/effect-size target, uncertainty method, rejection and stopping rules | Make the eventual result falsifiable |

Missing metadata must remain null/unknown, never replaced with an invented retrieval time, calibration or observational result. Schema completeness can authorize analysis readiness only; it cannot certify custody, independence, instrument accuracy or successful contact.

## Proposed completion test after admission

The selected round should deliver an executable deterministic runner, small human-inspectable fixtures, exact formula/assumption note, negative and positive controls, numerical tolerances frozen before comparison, and an independent-verifier report. The same source must replay without network access or external dependencies beyond the declared standard runtime. No code execution, synthetic data generation, physical-data download, or future-round result is claimed in this Round 1 note.

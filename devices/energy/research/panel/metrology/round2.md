# Metrology panel: Round 2 debate, implementation and controls

Date: 21 October 2026 (America/New_York). The Round1 contract remains unchanged. Tesla, acoustic and quantum Round1 reports were read after freezing that contract; none of their producer code was read before these results. This reviewer authored both metrology.mjs and the Python reference, so the cross-formulation checks here are **same-agent**, not independent authorship. Independence from the other panel producers and the prior frozen contract is preserved.

## Criticism → response → decision

| Received proposition | Criticism / response | Decision |
|---|---|---|
| Tesla: coupled inductors and electromechanical conversion | Fixed-M passivity identity is well posed. Varying M without the induced voltage and mechanical-work port changes the problem. Tesla's epsilon is opposite in sign to this metrology residual. | Retain fixed parameters during each run. Define R>0 as apparent excess consistently in the interface; never compare residuals without their sign convention. Charge motion, bias and active-controller work explicitly. |
| Acoustic: pressure gain and plane-wave aperture estimate | Pressure-only p²/(rho*c) is a conditional progressive-wave expression. A resonator's geometric face is not a universal capture bound, and nested boundaries can count the same speaker/acoustic energy twice. | Accept reference flux only with its stated assumptions. Distinguish amplifier-to-load and acoustic-port-to-load efficiencies. Use net p*u flux or validated tube wave decomposition for physical energy claims. |
| Acoustic: load backaction | Open-circuit voltage and fixed-velocity optimum omit the coupled mechanical response. | Require measured load power and loading-aware model. Keep output, dissipative heat and stored-energy change non-overlapping. |
| Quantum: ergotropy of a prepared qubit | Extractable state work is not new input energy. Control-Hamiltonian norm and measured apparatus energy are different quantities even when they have matching formal units. | Keep the state calculator separate from device energy closure. Any physical claim needs preparation, controls, readout, bath and reset boundary accounting. |
| Prior copper-position comparison | ABBA, phase calibration, fixed readout and shams transfer as controls; an unchanged or shifted peak does not measure an energy balance. | Preserve the earlier version as methodological context, not evidence of generation. |

## Executed evidence

`python3 -B analysis/metrology_reference.py --output research/panel/metrology/round2-results.json`

- **105 declared phase/frequency/skew cells:** direct waveform-product trapezoidal integration agrees with the browser cosine calculation to a maximum absolute difference of about **4.80e-15 W**. Some valid signed estimates become negative when a strongly reactive signal is measured with adverse channel skew. This is a measurement-model effect, not a new physical source.
- **16 hidden-input/storage cells:** complete ledgers close within floating-point rounding. Omitting an environmental input produces exactly its missing energy in the residual; also omitting storage release adds that amount. Both wrong estimates are retained in the result rows.
- **Aliasing wrong-model control:** the 700-Hz voltage and 300-Hz current have zero true mean product over one second. Sampling both at 1000 Hz produces an apparent 1 J, because their sampled sequences coincide. Sampling at 10000 Hz returns numerical zero. The first record violates its waveform-bandwidth contract and must never be interpreted as evidence of generation.
- **Six covariance cases:** a common gain, independent gains, correlated storage endpoints, zero covariance, a factor-generated semidefinite covariance and an invalid full matrix were checked by NumPy Hermitian eigenvalues and the browser matrix calculation. Pairwise correlations alone would miss the invalid matrix. Shared gain cancellation is conditional on the stated shared coefficients; it is not assumed for arbitrary meters.
- **Identifiability:** the toy matrix [1,1,1] has rank1, nullity2 and the two frozen kernel witnesses. Many distinct hidden-input/storage/bias allocations fit one residual; brute force does not cure that structural ambiguity.
- **API controls:** seven invalid input cases rejected. Zero supplied uncertainty is explicitly unestablished measurement uncertainty, and the relative phase-bias ratio is suppressed near zero true power. Positive/negative residual interpretations were exercised.

The frozen Round1 request for an independently reconstructed passive dynamical model is assigned to the system producers/verifier, not falsely counted as completed by the above arithmetic controls. No real apparatus calibration, power waveform or physical energy measurement exists here.

## Browser API

`energyClosure({sourceJ,environmentJ,loadJ,lossJ,initialStorageJ,finalStorageJ,standardUncertaintyJ,coverageFactor=2})`

Returns `residualJ`, `storageChangeJ`, `totalInputJ`, `accountedOutputJ`, `expandedUncertaintyJ`, `intervalJ:[lower,upper]`, `status`, `interpretation`, and scope text. Source, environment and load fields are signed net transfers. Modeled loss and storage endpoints are nonnegative. The supplied combined standard uncertainty is not computed automatically from independent instruments. The factor2 default is a scenario choice, not an asserted exact95% interval. This API does not claim equivalence or physical boundary completeness.

`phasePower({voltageRmsV=1,currentRmsA=1,phaseDeg=85,frequencyHz=1000,delayUs=1})`

Returns `apparentVA`, `truePowerW`, `measuredPowerW`, `biasW`, `reactiveVar`, `delayPhaseRad`, `delayPhaseDeg`, `phaseSensitivityWPerRad`, `relativeBias`, and the current-delay convention. All wave amplitudes are RMS.

`closureUncertainty({covarianceJ2})`

Optional full6×6 covariance API in the frozen order `[load,loss,finalStorage,initialStorage,source,environment]`. Rejects nonfinite, materially asymmetric or non-positive-semidefinite matrices. A relative numerical tolerance1e-12 handles floating-point matrix roundoff; it is not a physical covariance uncertainty. Outputs the signed quadratic-form variance and its square root. Zero covariance does not validate zero hardware uncertainty.

## Blind diagnostic cards

Three deterministic raw-waveform cards and a manifest were frozen in a separate scratch directory, with the injection key held outside that directory. The advisor has the raw-card path and should give only those records to the diagnostician. Diagnostic success requires recognizing when the channels do not uniquely identify a cause. Do not show the generating script or injection key before the diagnosis is frozen. Scoring belongs to Round3; this round does not pre-claim that result.

## Thesis update and limitations

Adopt a **nested-boundary, phase-aware energy ledger** as a project synthesis of established methods. Proposed variables remain measurable or explicitly user-supplied: phase skew, calibration gains, covariance, storage endpoints and separate environment/control inputs. None is a free parameter allowed to force closure. The new deliverable is a reproducible false-positive detection suite and a bounded experimental contract. Its scientific novelty is unverified, and its practical sensitivity awaits actual calibration and data.

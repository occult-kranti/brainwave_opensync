# Seat 3 — Round 1: inverse problems and experimental statistics

**Decision:** retain both apps as explicitly synthetic forward-model/experiment-design tools. Neither identifies physical location from frequency. A consolidated app should make observability, design identifiability, and conditional power executable, and preserve the current distinction between a calculated response, a candidate spectral peak, and a fitted physical mode. No physical experiment has been supplied, so a location-associated residual is unresolved.

This is one independent model-agent review, not human peer review. I used Newton analysis → synthesis (name the observable, expose the inverse kernel, reconstruct a discriminating forward test) and paired-physics methods (freeze assumptions, retain wrong-model controls). I did not read other integration-panel reports or precompute later panel rounds. No app source was changed.

## Scope and inspected evidence

Reviewed source commits were `sphere-lab-repo` **07e57b446a9f480216ad1aa555088bc361006d9c** and `position-review` **a8913c825d24299283c9379282ae3876e2a0c0cd**. “Locate app” here means `position-review/device-observatory/position/`.

Inspected actual source and rendered-text construction: sphere `src/models.mjs`, `src/acquisition.mjs`, `src/acquisition-ui.mjs`; locate `src/model.mjs`, `src/app.mjs`, `analysis/analyze.py`; their protocol, model, acquisition, analysis-readme and contract records; selected producer tests. Source hashes for four core files are in the fixture JSON. This seat did not conduct a browser visual audit, hardware calibration or literature novelty review.

Execution evidence:

- Sphere acquisition suite: **11/11 passed** (`node --test tests/acquisition.test.mjs`).
- Locate analysis suite: **11/11 passed** (`python tests/analysis_test.py`).
- New independent finite fixtures execute in normal and optimized Python with **byte-identical JSON**. Explicit `require` conditions survive `python -O`.
- Actual app API executions confirm the two exact inverse ambiguities below. These are rejection controls, not software defects: the original apps already disclaim unique location inference.

## What the apps actually do

| App / source | Supported calculation | Inference boundary to preserve |
|---|---|---|
| Sphere `models.mjs` | Selected elastic breathing mode; passive sphere–fixture two-coordinate system; geometric projection; thermal sensitivity | Chosen fixture mode shape, spring, damping and receiver projection are assumptions. They do not determine a real table or a universal frequency of a place. |
| Sphere `acquisition.mjs` | Seeded finite ringdowns, FFT bins, Hann/rectangular normalization, aliasing, covariance arithmetic | Known input frequencies are simulated inputs. `dominantBinHz` is not a fit, mode identity, uncertainty, or location estimator. |
| Locate `src/model.mjs:81–117` | Three free-sphere radial roots; prescribed path weights or added-spring toy | `position` controls stipulated coefficients. The contact case uses whole-sphere mass as an explicit illustrative effective mass; it is not an experimentally calibrated contact model. |
| Locate `analysis/analyze.py:46–117` | Stationary velocity/force H1 FRF, coherence, table PSD, at most five candidate response-bin maxima | This does not fit mechanical poles. The numerical force-PSD guard is explicitly not a measured excitation SNR gate. High coherence does not identify a unique physical cause. |
| Locate `analysis/analyze.py:120–177` | Balanced ABBA/BAAB contrasts and ordinary Student-t interval on user-entered same-mode frequency estimates | Mode identity, independent normal block errors, fit validity and calibration are input assumptions. Temperature is reported, not corrected; systematic uncertainty and multiplicity are omitted explicitly. |

The current documents handle these boundaries unusually well. Consolidation should not erase them by renaming plotted data “measured frequency,” “resolved location,” or “validated effect.”

## Exact inverse obstructions and counterexamples

### 1. Whole responses can be identical at different modeled locations

In the sphere model, `phi(p)=sin(pi*p)` and the fixed-receiver factor is `0.5/sqrt(0.25+(p-0.5)^2)`. Both are invariant under `p -> 1-p`. With all other inputs matched, `p=0.25` and `p=0.75` give the same dynamic matrices, poles, and full projected response. Actual app execution returned maximum pole difference **0 Hz** and maximum response difference **0**. Additional FFT resolution cannot recover a coordinate that this map does not distinguish.

This is a global two-to-one ambiguity in the declared model, stronger than a noisy fit. An inverse UI must return an ambiguity class or reject unique localization. A local derivative/Jacobian at one branch does not remove the other branch.

### 2. “Position” is confounded with contact stiffness in the locate toy

`responseComparison` uses `k_added = position * supportStiffnessNPerM` and shifts each mode using `f_B^2=f_A^2+k_added/(4*pi^2*m_eff)`. Therefore `(position=0.5, stiffness=1e8)` and `(position=1, stiffness=5e7)` have identical B poles and B response curves. Actual execution returned **0 Hz** maximum pole difference and **0 dB** maximum curve difference.

If stiffness were independently known and the toy validated, inversion within that one family could estimate its position parameter. If stiffness is unknown, only the product is identifiable. A coefficient that was prescribed from position cannot then count as discovered evidence for location. The path-only case similarly prescribes residue weights; learning its mapping from its own generated examples would reproduce the generator.

### 3. Frequency alone cannot identify all specimen properties

In a fixed isotropic radial family, `f_j = C_j(nu)*sqrt(E/rho)/R`. At fixed `nu`, even all selected radial frequencies constrain a scale combination, not independent `E`, `rho` and `R`. Replacing `E,rho` by `a*E,a*rho` leaves every frequency unchanged. Independent dimensions, mass, texture and support information can add constraints; the frequency list alone cannot establish copper purity, a complete object identity, or absolute position.

### 4. More observations are not necessarily independent information

For a finite known linear model `z_dot=A*z+B*u`, `y=C*z`, use the **temporal** observability matrix `[C; C*A; ...; C*A^(d-1)]` and controllability matrix `[B,A*B,...,A^(d-1)*B]`. Instantaneous sensor-count or rank(C) alone is not the right test: distinct known modes may be observed over time by one generic sensor.

My independent three-mode, six-state sine-basis fixture gives:

| Design | Observability rank / 6 | Controllability rank / 6 |
|---|---:|---:|
| Center drive, center sensor; second mode has an exact node | 4 | 4 |
| Same drive, add independent quarter-point sensor | 6 | 4 |
| Add independent quarter-point drive as well | 6 | 6 |

Thus a new sensor can reveal a state but cannot excite a mode absent from every drive. Full structural rank concerns only this known six-dimensional generator. Finite time, damping, noise, transfer calibration and near-degeneracy can still make estimation ill conditioned. This fixture is not a Lamb-sphere mode shape, copper prediction or apparatus certificate.

### 5. Balanced timing does not identify a position coefficient by itself

For one equally spaced ABBA block at times 0,1,2,3, the B-minus-A contrast kills an intercept and a linear drift. For quadratic drift `c*t^2`, it equals `-2*c`; BAAB gives `+2*c`. Balanced reversal cancels this only with the extra equality of the relevant curvature across the reversed blocks. Temperature or contact preload permanently correlated with B survives either ordering.

The executable design fixture declares `f = b0+b_t*t+beta*x+c_T*T` with `T=0.2*x`. Its design matrix has rank **3**, nullity **1**, and exact null vector `(0,0,0.2,-1)`: replacing `beta` by `beta+0.2*a` and `c_T` by `c_T-a` leaves all fitted values unchanged. Repeating these rows forever cannot separate the location and temperature terms. Independent thermal-control variation gives rank **4** in this specific linear family. Full rank is a necessary finite-model gate, not proof that all confounders were included.

## Statistical gates still needed

**Covariance:** preserve the sphere helper's correct `u_D^2=u_A^2+u_B^2-2*cov(A,B)` and common-clock cancellation. Its between-category independence is an assumption, and the UI fixes independent A/B fit and temperature errors. A consolidated measurement model should accept either a declared full positive-semidefinite covariance matrix or an explicitly justified restricted structure. It should keep estimated sampling variation, calibration uncertainty and unmodeled bias distinct and avoid adding the same fit/repeatability noise twice. Changing a correlation slider is sensitivity analysis, not evidence for that correlation. JCGM 100 sections 5.2 and 6 support covariance propagation and the distinction between standard and expanded uncertainty. [BIPM primary source](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf/cb0ef43f-baa5-11cf-3f85-4dcd86f77bd6).

**Power:** the sphere protocol's twelve pilot blocks and locate protocol's example schedule are correctly labeled planning choices. Under *independent normal block contrasts*, a fixed true shift `delta=0.5*sigma_d`, a two-sided paired-t alpha of .05 and target power .80, the independent noncentral-t fixture needs **34 blocks** (power .8078; 33 gives .7954). Twelve gives **.3528**. These are conditional illustrations; no physical `sigma_d` has been measured. Serial dependence changes the calculation: for 12 blocks with stationary AR(1) covariance rho=.6, the exact mean-variance inflation over IID with the same marginal SD is **3.3764**, an SE factor **1.8375**. This does not validate simply rescaling the ordinary t test. NIST's paired-observation and sample-size guidance provides the standard starting point; the AR(1) numbers are our direct covariance sum. [Paired analysis](https://www.itl.nist.gov/div898/handbook/prc/section3/prc311.htm); [planning assumptions](https://www.itl.nist.gov/div898/handbook/prc/section2/prc222.htm).

**Selection and holdout:** freeze one primary mode or matched modal subspace, estimator, band, acceptance rule, smallest relevant effect and exclusion policy using pilot data. If twenty independent null modes are tested at .05 and only a favorable one reported, the probability of at least one false positive is **.6415**. This number assumes independent tests; real correlation does not excuse undisclosed search. Keep exploratory mode screening separate, or use a declared familywise/FDR procedure appropriate to the question. Failed fits and dark modes are missing evidence, not zeros. Hold out complete blocks/days and instrument configurations; adjacent FFT bins or overlapping Welch segments are not independent experimental holdouts.

**Decision language:** an interval containing zero is inconclusive about a sufficiently small effect. For bounded equivalence, require the entire appropriately constructed interval to lie inside a preregistered equivalence margin and use a separately powered equivalence design. A significant contrast establishes a conditional measured-system association before causal attribution. A finite experiment cannot prove a universal absence of location effects.

## Proposed acceptance contracts for the consolidated experiment branch

| Gate | Acceptance evidence | Rejecting control / consequence |
|---|---|---|
| **C1 Observable and provenance** | Every result includes units, channel, drive, specimen/fixture identity, position frame, geometry, raw-data hash, calibration references, analysis version and `synthetic` / `measurement-input-unverified` status. | Synthetic arrays cannot transition to “measured” by export/import or metadata omission; no complete-object or unique-place spectrum claim. |
| **C2 Finite inverse scope** | Name the unknown parameter family, fixed inputs and nuisance parameters; compute target estimability/rank and singular values with recorded scaling/tolerance. Check stated parameter bounds for global aliases. | Symmetric-position and contact-product fixtures must return ambiguity, not a unique location. Full local rank must not be labeled global uniqueness. |
| **C3 Sensor and input design** | In a declared finite modal model, report temporal observability, reachability and noisy finite-time conditioning separately; show candidate geometry and retained modes. | Center-node fixture must lose the second mode. Adding only a sensor must not claim it becomes excitable. No extrapolation to all physical modes. |
| **C4 Acquisition admission** | Independent analog bandwidth/filter/timebase/phase calibration, drive-noise record, adequate excitation band, clipping/saturation record, linearity and stationary-settled acquisition checks. | Aliased pairs and zero sensor/drive participation must remain unresolved. Nyquist, a fine drawing grid or high coherence alone cannot pass physical admission. |
| **C5 Estimator and mode identity** | Either implement a validated common-pole complex FRF or ringdown fit with fit residuals and uncertainty, or keep outputs explicitly “candidate peaks.” Track modes using fixed band, damping and multiple-point mode shape/subspace where needed. | Path-only residue changes must not count as intrinsic pole shifts. Holdout predictive residuals must distinguish shared-pole/path-change from changed-pole models under matched nuisance flexibility. |
| **C6 Prospective design and power** | Saved randomization schedule, independent blocks/days, target effect in Hz or fractional units, pilot-derived variance with uncertainty/sensitivity range, alpha, target power, serial-correlation and missingness model. | Locked-temperature fixture rejects beta attribution. Twelve blocks cannot acquire a power label without assumptions. No outcome-dependent stopping or exclusions unless prespecified. |
| **C7 Controls and attribution** | Return-to-A, handling sham, empty-holder, reference resonator, intentional temperature and contact/receiver perturbations; at least one later day or apparatus configuration reserved for replication. | Residual that follows contact, receiver or table coordinates cannot be labeled an intrinsic property of room position. Movement is a separate observable and protocol. |
| **C8 Uncertainty and decisions** | Sampling interval and systematic covariance budget shown separately or combined by a justified coverage model; independent-fit calibration and nuisance-sensitivity analyses retained. Report no-shift-resolved / bounded-equivalence / residual-follow-up with scope. | Common-clock control must cancel correctly; nuisance covariance must be PSD. Zero-in-interval cannot pass equivalence. Many-mode search cannot pass an unadjusted primary claim. |

Prioritize **C2 + C3 + C6** as new interactive computations. They add discriminating scientific utility beyond placing the existing plots on one page. C5 is worthwhile only if implemented and validated; until then preserve the honest manual matched-mode prerequisite of the existing offline tool.

## Reproduction and next premise

From `/workspace/scratch/c230cc629529`:

```sh
python integration-panel/inverse/independentlycomputedfixtures.py
python -O integration-panel/inverse/independentlycomputedfixtures.py --output integration-panel/inverse/independentlycomputedfixtures-optimized.json
cmp integration-panel/inverse/independentlycomputedfixtures.json integration-panel/inverse/independentlycomputedfixtures-optimized.json
```

The fixture producer writes only this seat's files and executes app functions read-only. Sources, outputs and assumptions are bound in `independentlycomputedfixtures.json`.

**Novelty statement:** regression identifiability, state observability/controllability, covariance propagation, paired-t power and blinded heldout design are established methods applied to these apps. These counterexamples are useful application-specific checks; no scientific discovery, new theory of location or physical effect is claimed. The next missing premise is a prospectively recorded calibrated experiment with independently constrained nuisance changes, not a larger synthetic spectrum.

Round 1 complete. Waiting for root's Round 2 challenge.

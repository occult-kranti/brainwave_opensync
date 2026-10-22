# Finite design diagnostics and their inference boundary

The new module `src/design-diagnostics.mjs` applies established finite linear algebra to declared synthetic examples. It is not a sphere solver, location estimator, physical measurement, noisy inverse fit or claim of scientific novelty. Node verification: `node --test tests/design-diagnostics.test.mjs`.

## The declared three-mode/six-state model

In dimensionless time, `q'' + diag(1,4,9)q = B_q u`; the state is `z=(q1,q2,q3,q1',q2',q3')`. The generator is `[0 I; -diag(1,4,9) 0]`. A drive or displacement sensor at normalized coordinate `p` has participation `[sin(pi*p),sin(2*pi*p),sin(3*pi*p)]`. Inputs at different positions are assumed independently commandable. This is an illustrative one-dimensional sine basis, not the radial elastic-sphere eigenfunctions, a fit to a table or a calibrated sensor geometry.

Temporal observability uses `O=[C;CA;...;CA^5]`; controllability uses `K=[B,AB,...,A^5B]`. The code analyzes `K^T` so its returned kernel directly represents state directions orthogonal to the reachable span. Both returned `stateNullity` values therefore have state dimension six; controllability does not label the much larger kernel of free input-history coefficients as missing states.

| Independent channel design | Observability rank / 6 | Controllability rank / 6 |
|---|---:|---:|
| Center drive, center sensor | 4 | 4 |
| Center drive, center plus quarter sensors | 6 | 4 |
| Center plus quarter drives, same two sensors | 6 | 6 |

At the center, the second mode has an exact node. Adding only a sensor repairs observability but cannot excite that missing mode. A generic single sensor/drive at the quarter point has full temporal structural rank for this known distinct-frequency model. Counting instantaneous sensors or rows of C is not the observability test. Duplicate channels do not increase rank. A physical frequency family can contain degenerate and omitted modes absent here.

## Rank, tolerance, scaling and kernels

Each nonzero matrix column is divided by its Euclidean norm before row-pivoted Gauss-Jordan elimination. The default absolute pivot cutoff is `1e-10` after that normalization; accepted tolerance is bounded to `1e-14` through `1e-4`. The output records the algorithm, tolerance, per-column norms and zero columns. Kernel vectors are mapped back to the original coordinates, then normalized to maximum absolute entry one; the maximum unscaled matrix/kernel residual is returned. Zero participation is assigned only at canonical represented nodes: endpoints, the second mode's midpoint, and the third mode's one-third/two-third points. All other sine values are retained, however small; no hidden amplitude threshold turns nearby positions into exact nodes.

This scaling is an algebraic convention, not a sensor-noise whitening or physical normalization. Rank can depend on numerical tolerance near degeneracy. Column scaling can assign full structural rank to an arbitrarily weak nonnodal mode; that is not an amplitude detection statement. Full rank does **not** certify useful finite-time estimation: no sensor transfer calibration, noise covariance, finite-time observability Gramian, Fisher information, damping uncertainty or empirical condition estimate is supplied. Report the structural result together with this limit rather than labelling it “experiment observable” or “identified location.”

## Nuisance design and target estimability

The eight illustrative acquisitions have ABBA/BAAB position indicators and centered dimensionless time. The four-column linear response is `f=b0+b_t*t+beta*x+c_T*T`, where `T` is temperature departure divided by one kelvin. In the locked design `T=.2*x`, the matrix has rank three and nullity one. A coefficient change proportional to `(0,0,.2,-1)` leaves every fitted value unchanged while changing beta; the location coefficient is not estimable. Additional repetitions of that same design do not remove this exact kernel.

The independent-temperature example adds a separately varied thermal-control contrast and gives rank four. The returned target check requires the location coefficient to remain constant along **every** kernel direction. This establishes target estimability only within the declared linear family. It does not prove randomized allocation, absence of omitted contact/thermal/nonlinear drift terms, valid physical mode fits or a causal location effect.

The module's fixed examples are design demonstrations. A future general experiment importer should freeze its proposed coefficient family and units prospectively; adding nuisance columns after seeing favorable results can hide rather than resolve the hypothesis test.

## Exact global alias in the actual Location core

`globalAliasDiagnostics()` imports the retained `simulateComparison` read-only. It evaluates positions `.25` and `.75` at matched temperature, nonzero coupling `.08`, and a fixed receiver. The model has `phi(p)=sin(pi*p)` and receiver projection `.5/sqrt(.25+(p-.5)^2)`, both invariant under `p -> 1-p`. Consequently the dynamic matrices, poles and complete calculated responses coincide. The function returns both positions, pole/response differences and the precise forward-model scope; it returns no selected coordinate.

This is a global ambiguity even where a local sensitivity derivative on one branch is nonzero. A local full-rank test cannot remove a different global solution. More Fourier bins or repeated samples of an identical map add no identifying information.

The earlier locate toy has another exact ambiguity: it uses `addedStiffness=position*supportStiffness`. Pairs `(.5,1e8)` and `(1,5e7)` produce the same B response. This remains a documented property of the preserved toy rather than a claim that a real contact must follow that law.

## Conditional power fixture, deliberately offline

The independent Round 1 Python fixture remains the calculation of record: under independent normal block contrasts, a fixed true shift of `.5*sigma_d`, a two-sided paired-t alpha of `.05` and target power `.80`, exact noncentral-t power first crosses target at **34 blocks** (power `.8077775013`; 33 gives `.7953658415`). **Twelve blocks** gives `.3528241493`. This is a conditional illustration with a true planning SD, not measured apparatus power, a justified universal trial count or an equivalence test. Actual design needs a prespecified smallest relevant shift, pilot uncertainty, serial dependence, missingness, nuisance controls and a declared analysis/stopping rule. No new browser power engine is implemented.

The source fixture and immutable evidence are preserved in the panel Round 1 inverse record (`independentlycomputedfixtures.py/.json`); they include an exact AR(1) variance illustration and the assumptions. The numerical method is standard paired-t power. Primary background checked in Round 1: [NIST paired observations](https://www.itl.nist.gov/div898/handbook/prc/section3/prc311.htm), [NIST sample-size assumptions](https://www.itl.nist.gov/div898/handbook/prc/section2/prc222.htm), and [JCGM 100 sections 5.2/6](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf/cb0ef43f-baa5-11cf-3f85-4dcd86f77bd6). No independent search for scientific novelty was performed; novelty is not claimed.

## Contact ratios and proposed shared-pole fits

Mode ratios can reject a common multiplicative scale change. A ratio residual alone cannot select contact as its cause: Poisson ratio, anisotropy, mistaken mode identity and model discrepancy are other candidates. Changing source/readout participation alone leaves correctly matched natural-frequency ratios unchanged, but can change visible peaks or bias an invalid estimator. Any contact comparison needs the physical coordinate/mass normalization and a nuisance sensitivity/estimability check. The independent-spring normalized toy is not the passive multimode rank-one contact matrix.

A common-pole multichannel fit is a **proposal**, not implemented by this module or the current H1 peak picker. To become a discriminating comparison, fix equal model order, calibration, frequency band, nuisance treatment and residual model; compare complete heldout records or configurations. Unconstrained geometry-specific residues do not predict an unseen geometry without a separately calibrated participation map. Rejection of a fixed-dynamics common-pole family would not identify an absolute-location cause.

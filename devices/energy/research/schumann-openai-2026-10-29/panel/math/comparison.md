# Comparison panel — mathematical physics

Date: 2026-10-29. Initial reports were frozen in initial-panels-freeze.json before this comparison. Read: the prior math-crosswalk report, E1 novelty-audit README, current Yang–Mills Round33 HANDOFF.md, selected exact findings.json records and roadmap.json; current source, observation and skeptic panel reports. Upstream Yang–Mills pin: f9364d617015e803fda9465aefddd9cbe41854a4. This is a bounded comparison, not a replay or revalidation of all Round33 proofs and gates.

## Does the new release improve or disprove our work?

| Actual project artifact | New release comparison | Admitted impact |
|---|---|---|
| Round33 BA1–BB2: locality, finite-box dynamics and whole-sequence reduced-state convergence for the zero-selected patterned SU(2) family | The October 26 announcement concerns constructive continuum existence, but its physics artifacts are withheld | Different theorem scope. No contradiction or usable lemma established |
| Round33 BC2: uniform Kogut–Susskind route B, strong bare coupling, one named family of boxes | Existence could eventually supply a relevant continuum construction, if the actual theorem and its hypotheses match | Potential future bridge only; it does not supply the missing weak-coupling/cutoff-uniform estimate now |
| Prior finite reciprocal oscillator/RLC energy identity | Public local smoothing is a Euclidean half-wave estimate with positive epsilon loss and distinct function spaces | No automatic transfer to forced dissipative cavity dynamics; energy accounting remains unchanged |
| Copper sphere finite-mode inverse examples | A frequency spectrum already fails to identify some material parameters without calibrated extra data | Schumann source/readout ambiguity is a related inverse-problem lesson, not the same inverse theorem |
| E1 partial-dephasing ergotropy bound | No inspected new result changes its reduction to the prior general passive-energy bound | Preserve established-theory/application verdict; no restored novelty |
| Prior ordinary finite search/simulation | Public ETH result has fixed-width asymptotic counting bounds; formalization and manuscript exponents differ | No demonstrated practical speedup, new numerical accuracy, or PDE solver |

The old crosswalk's statement that the continuum parent goal was not located as an exact catalogue target was explicitly bounded to the October 21 snapshot. The new October 26 official physics announcement is now a relevant parent-goal connection, but it is not an additional public mathematical proof in that catalogue. Update the dated connection without rewriting the old snapshot.

The present project does attempt the broad Yang–Mills problem, but its admitted results are restricted models and estimates. No evidence reviewed here establishes that the project independently solved the new public local-smoothing or SAT theorem targets.

## Exact Yang–Mills scope and coupling obstruction

Round33 distinguishes the zero-selected patterned family F1/F2 from the uniform route-B family FB. BA1 coefficients are initially in on-site cutoff spaces; BB1/BB2 supply separately scoped state conclusions. The common F1/F2 limit is the limit of those named constructions, not uniqueness of every infinite-volume ground state. BA2 dynamics use the normalized clock θ=αt/ℏ only on |θ|≤8. The correlation-rate headline has the stated 5≤N≤14000 range. BC2 does not identify its route-B limit with the patterned limit or admit route-B dynamics.

Crucially, the route-B entry itself gives the AL1 dictionary
\[
 \tau={96\over g^4},\qquad 0<\tau\le10^{-8}
 \quad\Longrightarrow\quad
 g^4\ge9.6\times10^9,\quad g\ge313.016916\ldots
\]
for positive real bare g. Exact rational arithmetic rechecked the threshold: g=313 fails and g=314 passes. A trajectory g(a)→0 necessarily exits this admitted regime. Negative τ is the stated unitary mirror; it is not another real-g branch under this dictionary. Changing energy units cannot alter the dimensionless inequality. This is a limitation of this sufficient certificate, not a disproof of a physical mass gap.

Uniformity in finite volume or in an on-site representation cutoff is not uniformity in lattice spacing a. N10 remains open. A thermodynamic limit at fixed spacing cannot be relabeled a continuum construction. The announcement's existence claim would not, even if verified, automatically provide the separate positive mass gap required by Clay. Nothing here imports a claim about the uniform theory into the patterned model.

The unexecuted Round33 roadmap remains meaningful: route-B dynamics, O1b uniqueness beyond named constructions, finite-box certificates, an extended correlation rate and a Z2 chain. This Schumann update has not executed those goals, promoted constants-only 2+1D recounting to a theorem, or repaired the continuum obligation.

## Import and novelty gates

1. Obtain an actual public theorem, version and proof artifact; announcement wording is insufficient. For physics, record dimension, gauge group, regularization, action/Hamiltonian, boundary conditions, axioms, observable normalization, topology of convergence and coupling trajectory.
2. Map each imported lemma to a specific project obligation. Require estimates uniform in the limit actually taken, plus a justified order of limits. Distinguish existence, nontriviality, symmetry/reconstruction, uniqueness and a positive mass gap.
3. For Lean artifacts, bind manuscript statement to declaration, dependencies, axioms, pinned toolchain and a successful checker receipt. The repository's target placeholders are not solution defects; reading wrappers is not executing proofs. Local Lean runs remain zero.
4. For local smoothing, prove the missing boundary/geometry/loss/forcing bridge before using its estimate in a cavity. For SAT, prove an encoding and size bound and benchmark finite constants before claiming computational benefit.
5. Reassess novelty against matching mathematical statements, not a topic graph. E1 remains contained in earlier theory. Schumann peak/source dependence is established; an implementation or newly assembled dashboard is not a new physical theorem.

## Three model recommendations for advisor selection

**R1 candidate:** implement ideal-shell frequency/wavelength calculations and the driven one-mode transfer function. Include analytic white-force displacement and velocity maxima. The wrong common-speed fit must be tested on other modes, not only its fitted fundamental. Changing damping while keeping ω0 fixed changes complex poles; call it fixed undamped frequency, not unchanged cavity poles.

**R2 candidate, conditional on R1:** hold the entire transfer function H fixed while changing source color or receiver weighting, then construct distinct H1,H2 with equal output PSD using S_F2=S_F1|H1/H2|². On a finite band require nonzero finite responses and integrable nonnegative source spectra. Compare a peak-only estimator to these controls. This establishes a declared-model ambiguity, not a terrestrial anomaly.

**R3 candidate, conditional on R2:** test a predeclared calibrated additional observable, such as input–output transfer or a shared-source two-channel ratio, under explicit gain and noise assumptions; then deliberately release those assumptions to see ambiguity return. Check forced energy balance and load power with the same normalization. If current station records still lack calibrated series and baselines, the intake result must remain insufficient evidence.

No model round was executed in this comparison. The only new computation here is the elementary exact coupling-threshold check above. There is no new measured field, anomaly, source-free energy result, or continuum theorem.


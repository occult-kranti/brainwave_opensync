# Skeptic — second and final research round

The selected comparisons do **not** evidence an exact OpenAI theorem solved by this project. They do support restricted model overlap, useful mathematical methods and sharper measurement requirements. Neither a research-network edge, a successful numerical test nor a family-level formalization link establishes theorem equivalence.

This round executes the advisor-selected controls and reviews the producers against explicit, narrower claims. It does not repeat the entire corpus proof audit, revalidate the historical Yang–Mills dependency chain, run Lean, or introduce experimental data. Execution date: 22 October 2026 UTC; the advisor's comparison cutoff remains 21 October. OpenAI source revision remains `1581d4cbdd69a0faf34b2089614fe2a814316a6a`.

## Independence and evidence boundaries

`independent-gate.md` was frozen before new panel reports. Its SHA-256 is `5f4226309fd04f975f066c54eeed96ac605f8d0651acd948f3e65d576b346d55`. The second-round expected cases were frozen before reading peer second-round producer code or results: `round2-independent-fixtures.json`, SHA-256 `262582bed704ce59014937557cc678ee0931ea609296d2e7bb4a7f8aadb0e657`.

The advisor admission and the energy/acoustics first-round contracts were available before this second freeze. Independence therefore means separately specified expected cases and implementation, not ignorance of shared premises, external human review or independence from a common model architecture. Producer API mappings and source inspection happened after the freeze. The cross-review records those exact source bytes.

The comparison contract keeps mathematical objects, state space, assumptions, observations, physical scale, limit topology and conclusion separate. Automatic record matching checks only these curated fields. It is not a semantic proof checker, an assessment of all hypotheses, or verification of a formalization's dependencies.

## Exact countermodels

For positive integers n, take

\[
H_n=\operatorname{diag}(0,1/n,1),\qquad
K_n=\operatorname{diag}(0,1,2).
\]

Both families have the same ground-state projector. Every finite gap of H is positive, but for every epsilon>0 an integer n>1/epsilon gives gap(H_n)<epsilon. Thus its gap has infimum zero. K has a uniform gap of one. Exact rational checks at six predeclared n values and three constructive epsilon witnesses agree with this all-n argument. The finite samples do not prove the limit; the explicit argument does. These are elementary matrices, not proposed Yang–Mills regulators or counterexamples to the repository's additional fixed-spacing hypotheses.

For the information-loss control, let A=diag(1,2,3), B=diag(1,2,4), and let P retain the first two coordinates. For every z>0,

\[
P(zI+A)^{-1}P^*=P(zI+B)^{-1}P^*
 =\operatorname{diag}\big((z+1)^{-1},(z+2)^{-1}\big),
\]

but the omitted diagonal entries differ by

\[
\frac1{z+3}-\frac1{z+4}=\frac1{(z+3)(z+4)}>0.
\]

Five exact rational z values check the implementation. This proves non-injectivity of the declared partial readout, even across all positive z. It is a finite-dimensional information-loss example; it does not refute OpenAI family 372, which requires a full static boundary operator.

## Documentary gate controls

The seven synthetic/curated controls deliberately test what a claim record is allowed to say. They are not complete encodings of the source theorems.

| Control | Observed outcome | Meaning |
|---|---|---|
| Identical narrow algebraic records | Eligible for proof review | Agreement alone is not proof verification. |
| Family 365 companion attached to headline | Scope mismatch | Measurable-conductivity nonuniqueness cannot certify a different smooth metric/connection uniqueness statement. |
| Entropy area law attached to Wilson-loop area law | Scope mismatch | State/observable/hypothesis/conclusion differ. |
| Ideal circuit identity attached to apparatus energy claim | Scope mismatch | The boundary, measured reservoirs and conclusion differ. |
| Fixed-spacing construction attached to continuum mass gap | Scope mismatch | Model, scale, limits and hypotheses differ. |
| Missing statement evidence | Insufficient evidence | Abstain. |
| Same title without a statement | Insufficient evidence | Abstain. |

Four explicit mismatches, two abstentions and the positive documentary control returned the intended classifications. This is record validation. It neither proves nor disproves the underlying source results, and it cannot automatically recognize equivalent mathematical statements written differently.

## Independent producer comparisons

`cross_review.py` calls the actual thermal and acoustic producers and imports the exact algebraic checks without executing their file-writing entry points. It writes only inside this skeptic directory. The expected cases were frozen first; the table states precisely what is accepted.

| Producer | Independently frozen comparison and observed result | Narrow acceptance and remaining boundary |
|---|---|---|
| Thermal qubit | Six states: ground-state heating, diagonal Gibbs fixed point, inverted bath, zero-temperature damping, and coherent quarter-excited state with/without dephasing. Maximum normalized expected-value error 1.11×10⁻¹⁶; direct Hermitian eigenvalues agree within floating-point precision. | Signed bath heat and state ergotropy match. The bath-heated ground state gains 1/8 of a gap and receives exactly that heat; it has zero ergotropy. The inverted bath is labeled a resource. No capacity, device efficiency or complete implementation cost is certified. |
| Acoustic fixture | Frozen M=diag(2,1), K=[[5,−1],[−1,3]], C=diag(0.2,0.1), angular frequency 2, scales 1 and 4. Mapping into the producer preserves these matrices. Largest complex FRF absolute discrepancy from an independent NumPy solve is 5.12×10⁻¹⁶. | Scaling all M,C,K preserves modal frequencies and divides calibrated displacement/force response by the scale. The analytic frequency sensitivity (1/2,−1/2) has kernel (1,1); calibrated mass or nonzero static traction breaks this particular two-parameter ambiguity. No general material reconstruction or translation-induced intrinsic frequency law is established. |
| Exact oscillator | Independently frozen E=(3q²+2v²)/2, qdot=v, vdot=(u−5v−3q)/2. The peer's general Laurent expression at m=2,k=3,b=5 and p=2v reduces exactly to Edot=uv−5v². | Exact identity and specified wrong-port, negative-damping, perturbed-Gram, factor-order and between-grid controls are supported. Positive storage/dissipation requires the declared m,k>0,b≥0 domain. This is not a Lean/NSPI reproduction, full verifier audit or apparatus result. |
| Yang–Mills arithmetic | The separate 2×2 implementation agrees with the frozen positive-gap/common-projector logic. Tau=96/g⁴ at cap 10⁻⁸ rejects g⁴=9,599,999,999 and admits 9,600,000,000 and 9,600,000,001 exactly. | Fixed-a admission arithmetic and the missing continuum premise are correctly distinguished. Failure of the sufficient strong-coupling certificate does not show the actual physical gap vanishes outside that regime. No historical theorem dependency was revalidated here. |

The independent oscillator control also evaluates a polynomial positive at the sampled endpoints but negative between them: x²−x+3/16 has values 3/16 at x=0,1 and −1/16 at x=1/2. A grid pass alone does not supply a global sign certificate.

For acoustics, the scaled candidates are hypothetical material parameters. They do not mean copper changes density when moved across a table. Static traction means local surface stress or calibrated force on a known patch; net hydrostatic force integrated over the closed sphere is zero. An unknown sensor gain can hide the FRF amplitude change. These conditions must stay beside any measurement recommendation.

## Cross-review corrections and source caveats

The corpus panel's second parser found a real first-round metadata defect: the family 337 URL was truncated at `CAT(0)`. The corrected `panel/corpus/inventory-round2.json` reconciles the Markdown and TeX catalogues while preserving the frozen first-round error. The count remains 372 families and 719 linked manuscripts; highest identifier 377 is not a count of solved problems. These counts are a census, not 719 proof verifications.

A separate provenance defect was found in `panel/corpus/scope-records.json`: it called agent annotations “Human-reviewed.” The corpus author corrected it to “Agent-reviewed,” refreshed the affected freeze binding, and the skeptic verified the corrected bytes. This review does not attribute any human review that has not occurred. The correction receipt is recorded in `peer-review-findings.json`.

The comparator challenge files contain intentional target-template `sorry` placeholders. Their JSON configurations name separate solution modules. A challenge placeholder must not be reported as a failed solution proof. First-round inspection of the top-level family 365/372 solution exports found no such holes in those particular modules; it did not audit their dependency closure or execute Lean.

The acoustics and methods panels also reported narrow notation inconsistencies in inspected versions of two papers. This skeptic did not independently inspect those PDFs in round 2. Their primary-source visual checks remain attributable to those reviewers; they are not additional independent findings here. A preprint equation issue must not be promoted to failure of an uninspected implementation or every result in the paper.

## Handoff

The useful accepted changes are explicit heat accounting, observability/calibration conditions, exact finite certificates and source-statement provenance. Keep the overlap labels as restricted model, useful method, thematic link or insufficient evidence as appropriate. No inspected match justifies an exact-solved edge, a continuum Yang–Mills solution, source-free energy or capture of an object's complete spectrum.

Reproduce the skeptic controls with `python round2_checks.py` and the scoped producer comparisons with `python cross_review.py` from this directory; both accept `--output` for a separate replay destination. `round2-results.json`, `cross-review-results.json` and the hash manifest distinguish exact arithmetic, analytic arguments, floating-point comparisons, documentary gates and unreviewed claims. This completes the second research round; no third round is proposed or executed.

# Methods panel: round 1

Research cutoff: 21 October 2026. Role: formal verification and scientific-computing methods, guided by the paired-physics and Newton analysis/synthesis skills. This is one model-agent's source and method review, not human peer review. Round 2 has not been executed.

## Decision

The useful transfer is a stricter chain from **intended statement → exact hypotheses → candidate certificate → independent check → supported claim**. Neither our successful numerical tests nor a publisher's Lean badge identifies an exact OpenAI problem as solved by our project. This review establishes methodological overlap and practical next tests, not priority or a new mathematical discovery.

The actual local energy release implements reciprocal EM and acoustic solvers, a one-qubit work calculation, measured-channel error controls and a four-parameter identifiability example. Its 613 separate-author EM/acoustic checks and 648 separate-author quantum cases are finite software comparisons; the release explicitly has no apparatus data. The preserved sphere review independently derives a traction-free radial mode and a two-mode contact model. It does not reconstruct arbitrary material fields from a full boundary operator. These scope statements are present in `research/advisor.md`, `research/verification.json`, `location-spectrum/research/independent-review.md` and the source register.

## OpenAI statement-level checks

Pinned source: `openai/math@1581d4cbdd69a0faf34b2089614fe2a814316a6a`.

| Source | What was actually read | Consequence for this project |
|---|---|---|
| `lean/docs/372.md` | Entire short scope page | Its claimed static smooth isotropic-elasticity uniqueness result assumes a complete displacement-to-traction map. It supplies no reconstruction algorithm. A finite set of resonance peaks does not meet that data contract. |
| `lean/docs/365.md` | Entire short scope page | Despite the family heading, the selected formalized result is scalar-conductivity nonuniqueness for bounded measurable coefficients. It cannot certify the different joint metric/connection recovery headline. |
| `lean/ComparatorChallenges/README.md` | Entire short instruction page | It explicitly lists several supporting-result checks that are not the corresponding main theorems. Attach proof status to a manuscript and declaration, not an entire family. |
| `lean/README.md` | Entire short build note | Recommends compiling small library portions and describes environment constraints. No Lean or Comparator build was run by this reviewer. |

The exact theorem-to-observation dictionary is therefore the first useful deliverable. A comparison should carry domain, model, regularity, boundary conditions, quantifier order, conclusion, artifact and actual verification action. Matching words such as “gap,” “energy,” or “frequency” are discovery cues, not equivalence tests.

## Selected conference methods

This is a selected primary-source scan, not a ranking of every current approach. The three 2026 papers below appear in the official ICML proceedings, held 6–11 July; the graph paper is ICLR 2025. No unaccepted submission has been promoted to a conference result.

| Publication | Useful practice | What it does not establish here |
|---|---|---|
| **Faults in Our Formal Benchmarking** (ICML 2026) | Separate semantic fidelity, proof acceptance and version maintenance. Inspect declared axioms, vacuity, missing conclusions and changed domains in addition to a successful checker exit. | The reported benchmark audit is not reproduced here. Its warning is a method to apply, not evidence that our or OpenAI's particular proofs are defective. |
| **Decompose, Structure, and Repair** (ICML 2026) | Record hypotheses and conclusions separately, with explicit nested scope; make local repairs without silently changing the target. | Its own limitations say an incorrect initial semantic decomposition can propagate errors; it focuses on statements, not complete proof verification. We did not train or execute DSR. |
| **NSPI: Automated Polynomial Inequality Proving via Sum-of-Squares Certificates** (ICML 2026) | Separate heuristic candidate search from exact rational recovery and a formal checker. An exact SOS identity can establish a finite polynomial's nonnegativity over its declared domain. | SOS is a sufficient certificate, not a complete test of all nonnegative polynomials. Our proposed small certificate would neither reproduce the paper's learned system nor prove a continuum spectral theorem. |
| **Port-Hamiltonian Architectural Bias for Long-Range Propagation in Deep Graph Networks** (ICLR 2025) | Shows a structured use of conservation and dissipation in graph learning. | Neural embedding dynamics are not calibrated apparatus dynamics. It is a lower-priority graph-model analogy; adding this architecture to the source network would not prove physical passivity. |

Reading depth and exact URLs are in `sources.json`. Selected PDF sections were downloaded and read; all PDFs remain in scratch, not redistributed. We use no benchmark superiority numbers from abstracts as our own outcomes.

## A source notation issue worth retaining

NSPI PDF page 4, Equation (6), declares `L ∈ Z^(m×k)` and `D ∈ R^(k×k)` but prints `G = LᵀDL`. For general `m ≠ k`, those declared shapes do not multiply. The PDF was visually checked, so this is not solely a text-extraction artifact. With the stated shapes, the usual valid factorization is `G = LDLᵀ`; alternatively one can change the declared shape of L and retain the printed product. We would implement the former as an explicit local correction, not silently attribute the correction to the paper. This notation issue does not invalidate every reported result.

## Proposed adoptions and priority

1. **Statement and proof-scope register, first.** Small implementation effort: add structured assumptions, conclusion, exact source declaration and execution status to each crosswalk entry. A full formalization still requires qualified mathematical review. Discriminator: deliberately attach family 365's conductivity companion to its metric/connection headline; the registry must reject that attachment. Also reject a finite-observation claim as equivalent to family 372's full-boundary-data claim.
2. **Exact finite energy certificates, next.** Moderate effort: represent the declared linear storage and dissipation forms with exact rational coefficients, verify matrix shapes, symmetry, factor identities and nonnegative weights. Freeze coordinates and power-conjugate output. Discriminator: a wrong output normalization, negative dissipation or a perturbed certificate must fail. This would strengthen a finite model identity, not establish hardware conservation or a Yang–Mills continuum limit.
3. **Validated remainder work only after the actual operator contract is selected.** Larger and currently unspecified effort: bound spectral truncation and omitted modes with a documented theorem and rigorous arithmetic. An eigenvalue estimate, fitted decay or dense grid alone cannot replace that remainder. This review does not claim to have selected or run a certified infinite-dimensional solver.

## Frozen proposal for advisor-selected round 2

The suggested executable test is an exact-rational energy-certificate demonstrator, defined in `round2-proposal.json`. For dimensionless canonical coordinates `z=(q,p)`, positive mass and stiffness, nonnegative damping, known source u, and `H=kq²/2+p²/(2m)`, the declared equations are `q̇=p/m`, `ṗ=−kq−bp/m+u`. The output conjugate to u is `y=p/m`. Direct expansion gives `Ḣ=uy−b(p/m)²` for every state and input under this finite model.

This identity should be checked by separate symbolic polynomial and rational matrix paths, with no result inferred from sampled trajectories. A wrong port `y=p` at mass different from one must leave a nonzero residual; negative damping must fail passivity admission. A coarse grid should also be shown to miss a negative interval of a simple polynomial, to demonstrate why “all tested points positive” is insufficient. All variables are dimensionless model coordinates, coefficients or input/output ports; no new physical constant is introduced.

Awaiting advisor selection and peer objections. No round-2 run or new proof certificate is claimed in this report.

# Round 5 producer — hidden-information score and leakage sensitivity

Status: **repaired PASS, 314 assertions executed**. The advisor's N=100, K=4, hit-count lattice, epsilon=0.2 and contamination grid were frozen before outcomes. No human sessions, scored testimony or physical data were used. This is a standard conditional binomial benchmark, not a new theorem or a probability of extraterrestrial contact.

## Preserved failure and numerical repair

The initial bounded binary64 implementation returned an unqualified zero for N=1000, p=1/4, h=1000, although the exact tail is 4⁻¹⁰⁰⁰>0. The parent and independent reviewer flagged that range defect before final admission. `revisions/v1/` preserves its source, outputs, reproduced failing request and hash manifest. The original input vectors were not changed, and the numerical tolerance was not loosened.

The repaired scalar `tail` API rejects a positive tail that underflows binary64. The `tailInfo` API, `score`, contamination bounds and threshold reports expose a finite log probability with status `positive-underflow` and null numerical probability. For the failing case, log P is approximately −1386.2943611198862, consistent with −1000 log 4. The K=1,000,000, N=h=100 case also returns a marked positive-underflow result. Exact impossible events retain probability zero with status `exact-zero`; they are not conflated with rounding. The public `pmf` API marks underflow entries null with finite logs and lists their indices. Independent reviewer feedback was received before the repair; verifier output files were not read before the final freeze.

## Null model and score

Under the explicit model, every target is independent and uniform over K alternatives **conditional on the response and prior history**, with fixed N and objective scoring. Then H is binomial with success probability 1/K. Mere marginal target balance is insufficient. Optional stopping, hints, target predictability, correlated responses/targets or selective exclusions would require a different model.

| Correct responses h out of 100 | One-sided tail P(H≥h), K=4 |
| --- | --- |
| 0 | 1 |
| 25 | 0.5383288679185886 |
| 30 | 0.14954104656657344 |
| 35 | 0.016426740673885554 |
| 40 | 0.0006865922079629907 |
| 50 | 6.638502483476644e-8 |
| 100 | 6.223015277861116e-61 |

At alpha 0.05, the smallest attainable rejection count is **33**: P(H≥33)=0.04459632521268151, while P(H≥32)=0.06934888914174187. This is a discrete conditional test, not an estimated probability that the source is nonhuman. The full tail lattice is retained, not only these selected rows.

## Ordinary information leak and likelihood identity

Independently on each trial, suppose a perfect ordinary leak occurs with probability epsilon; otherwise an independent blind guess succeeds with probability 1/K. The resulting hit probability is q=epsilon+(1−epsilon)/K. With epsilon=0.2 and K=4, q=0.4. A separate per-trial dynamic convolution of these ordinary leak/guess alternatives agrees with the binomial q=0.4 probability for every one of the 101 hit counts, maximum absolute difference 8.881784197001252e-16.

Any posited independent information mechanism with the same q has the identical binomial hit-count likelihood. This analytic distributional identity follows from the stipulated independent Bernoulli trials; the numerical convolution checks its implementation. Hit counts alone cannot label the mechanism. This is neither an allegation that any named person leaked nor proof that all hypothetical mechanisms are impossible.

## Two different contamination assumptions

For illustrative h=40, the declared sensitivity results are:

| Assumed maximum m | Preselected compromised subset, all correct: Bin(100−m,1/4) tail at 40−m | Arbitrary after-outcome corruption: Bin(100,1/4) upper bound at 40−m |
| --- | --- | --- |
| 0 | 0.000686592207963 | 0.000686592207963 |
| 5 | 0.006927712584309 | 0.016426740673886 |
| 10 | 0.047283885540445 | 0.149541046566573 |
| 20 | 0.542836253940725 | 0.900469589894686 |
| 100 | 1 | 1 |

The first column requires a fixed/preselected compromised subset independent of the remaining outcomes; treating all m compromised trials as correct is its worst case. The second follows because arbitrary changes to at most m entries of an underlying N-trial guess vector can increase hits by at most m. It remains the appropriate conservative bound for the stated after-outcome model. These are different assumptions. The first must not be substituted for the second. The real m is unknown; this code neither estimates nor certifies it. All seven h values and all five m values are reported in the full grid, including threshold≤0 and N−m=0 cases.

## Execution and supported scope

Run `node analysis/round5/run.mjs` from the study directory. `api.mjs` accepts one JSON request per line with kinds `score` (default), `tail`, `tailInfo`, `pmf`, `threshold`, `leak` or `contamination`. Inputs use lowercase `n`, `k`, `h`, `p`, `alpha`, `epsilon`, `m` as applicable. Integer n is bounded to 0–1000; integer K to 2–1,000,000; probabilities are finite in [0,1], alpha strictly between 0 and 1. For ordinary score/contamination h is integer 0–n, m integer 0–n; raw tail thresholds may lie outside support to express exact-zero/one cases. N=0 is valid and an unattainable rejection threshold is represented by h=n+1 with `attainable:false`.

The exact-test sum is approximated in binary64 using mode-centered recurrence and compensated sums, with log-space range reporting. This is not arbitrary-precision arithmetic, an interval certificate or an exhaustive verification of every admissible numeric input. The independent oracle uses exact integer/rational sums. Declared comparison tolerances remain relative 1e-10 or absolute 1e-14; they cannot excuse hiding a mathematically positive tail as an exact zero. Invalid fractional/nonfinite/out-of-domain inputs are rejected.

The next discriminating task is an evidence-admission/prospective-protocol gate separating document completeness from actual verification of target randomness, custody, timing, calibration and whole-attempt accounting. A complete metadata packet would still not establish information transfer or its source. No next-round protocol outcome has been precomputed.

# Round 4 producer — finer phase resolution and a shared-driver counterexample

Status: **PASS, 2,077 assertions executed**. The two 256-point integer fixtures were frozen before result calculation using explicitly recorded LCG seeds and mapping, without an outcome search. All outcomes are retained. No verifier output was read before the producer freeze. No producer execution failed.

## Preserved limitation and additive implementation

Round 3's seven-lag maximum has a minimum attainable exact p-value at least 7/32, above alpha 0.05. Its lack of rejection therefore did not show useful sensitivity at that level. This limitation is retained; the old code, fixtures and results are unchanged. The original instruction to reuse that implementation directly also encountered a real implementation constraint: its group size is hardcoded at 32. The advisor approved a written contract clarification before computing new outcomes. The new module generalizes the same algorithm to a declared input length, imports the frozen Round 3 tie tolerance, binds its source hash and checks exact 32-point parity of every original offset statistic/count/p-value and rejection summary.

Run `node analysis/round4/run.mjs` from the study directory. The JSON-lines API `api.mjs` accepts ordinary phase requests `{x,y,lags,alpha}`; `kind:"rank"` selects `{z,u}` for the exact shared-driver calculation. The generalized phase API supports group sizes 2–2048 and keeps the conservative absolute score-tie rule 1e-12; independent score comparison tolerance remains 1e-11.

## Part A: 256 phases

| Fixture | Fixed-lag rejection fraction | Correct seven-lag maximum fraction | Invalid selected-minimum fraction | Zero-offset adjusted p |
| --- | --- | --- | --- | --- |
| Identical shape, uniformly random phase | 11/256 | 7/256 | 77/256 | 7/256 = 0.02734375 |
| Distinct shapes, uniformly random phase | 12/256 | 7/256 | 75/256 | 121/256 = 0.47265625 |

The valid phase-null fractions stay below the discrete bound `floor(256*0.05)/256 = 12/256`. The identical-shape zero-offset case now has enough resolution to reject the stipulated uniform-phase null at alpha 0.05. It is one targeted aligned alternative, not an estimate of power for a population of real phenomena. The distinct-shape aligned case is not significant and is retained. Its seven most extreme phase positions still comprise a 7/256 rejection fraction under the complete null enumeration. The invalid minimum of individual-lag p-values remains uncalibrated for selection. All 256 offsets and all-lag negative controls are in `results.json`; when all 256 lags are searched, every adjusted maximum p-value is 1.

The randomization premise is conditional uniform phase of fixed shapes. No missingness, drift, shared-calendar, report-selection or leakage claim is repaired by increasing the group size. The examples establish neither an observed Schumann anomaly nor contact.

## Part B: identical observations, distinct causal models

For `z=[-2,-1,0,1,2]`, both the direct model `Y=2X` with `X=z` and the common-driver model `Y=2z` predict `[-4,-2,0,2,4]`. The centered design with columns `[X,z]` is 5×2, has exact rank 1 and nullity 1, and the vector `(1,-1)` maps exactly to zero. Adding a duplicate sensor column produces a 5×3 matrix of rank 1 and nullity 2. Explicit kernel vectors `(1,-1,0)` and `(0,1,-1)` remain zero; copying an observation does not identify its cause.

Under the **additional hypothetical intervention assumption** `u=[1,0,-1,0,1]`, independently set `X'=z+u` while leaving z fixed. The direct model predicts `[-2,-2,-2,2,6]`; the common-driver model predicts `[-4,-2,0,2,4]`. Their difference is exactly `2u=[2,0,-2,0,2]`. The centered `[X',z]` design is 5×2, rank 2, nullity 0. To avoid numerical rank ambiguity, the implementation multiplies centered columns by sample count 5 and calculates their Gram matrix/determinant using integer arithmetic. The scaled Gram determinant is 17,500; dividing by 5⁴ gives the ordinary centered Gram determinant 28. A specified 2×2 row minor is −30, independently certifying rank 2.

This is a finite linear identifiability example, not a novel causal theorem or an executed human/planetary intervention. It assumes two exact model classes, known driver z and an independently adjustable u. Those premises are additional information. Extra passive stations, calendar adjustment, a fitted coefficient or an unexplained residual do not automatically supply such an intervention or identify an extraterrestrial sender. More physical models or unidentified channels could remain observationally equivalent.

The rank API supports small bounded integer vectors and reports exact Gram entries as strings; no numerical rank tolerance is used. Invalid nonfinite, unequal-length or noninteger rank inputs and invalid phase requests are rejected. The next useful review question is whether a concealed-information/locked-attempt protocol can supply independently discriminating evidence without leakage or selective reporting. No such experiment has been performed here, and no later round was precomputed.

# Round 3 independent verdict

**PASS for the declared finite synthetic null.** Independent integer-dot fixtures were frozen before reading the producer model. The verifier then compared nine independent fixture families and four producer families: 416 offset rows, 16 invalid-input cases and 3,451 checks. All discrete ranks, inclusive tail counts, p-values and rejection counts agreed exactly. Maximum absolute score discrepancy was 4.440892098500626e-16, below 1e-11. There were no initial failures or repairs.

The oracle avoids floating ties by ranking centered integer dot products. The producer uses an inclusive absolute 1e-12 score tolerance. All positive score gaps in the finite fixtures exceed that tolerance; exact ties remain included. This comparison does not certify arbitrary near-tie/extreme floating-point inputs.

## What the enumerated results show

At alpha 0.05, the independent identical and distinct shape pairs each reject at one of 32 offsets for a fixed lag. Selecting the minimum individual-lag p over seven lags rejects at seven of 32 offsets (21.875%), whereas recomputing the entire maximum inside the shift group rejects at zero. Selecting among all 32 individual-lag p-values rejects at every offset for those two shapes, but the correct all-lag maximum statistic has p=1 at every offset. The period-two tied fixture has p=1 throughout. The producer's distinct-shape fixture has a tied highest score and zero fixed-lag rejections; it was retained rather than filtered out to favor a dramatic result.

These are exact proportions over a stipulated uniform relative-offset distribution, not estimated false-alarm rates from real Schumann/contact observations. They do not establish a valid circular-shift null for gaps, seasonal drift, time-of-day, retrospective reports or other selection.

## A material power limitation

The seven-lag test cannot reject at alpha 0.05 with this 32-element group, even for a stronger injected alignment. Let `a(s)` be the fixed-lag score and `L` contain seven distinct residues. If `a(s*)` is the largest orbit score, then each of the seven offsets `s*−l`, for `l in L`, attains that maximum in `T(s)=max_l a(s+l)`. Consequently the smallest inclusive max-statistic p is at least `7/32=0.21875`. Ties can only increase that floor. All 32 lags make T invariant and force p=1.

This is an elementary property of the declared group/statistic, not a new theorem. Zero corrected rejections cannot be presented as absence of an effect or evidence that this design is a sensitive detector. For a fixed k-lag search using this orbit, the necessary resolution condition for any alpha-level rejection is `k/n <= alpha`, which is not sufficient for practical power or empirical validity.

## Next discriminating task

The advisor should select a power/resolution audit before any field claim: specify a larger independent randomization unit or fewer precommitted lags, and test injection recovery under its exact admissible null. In parallel, expose a common calendar/environmental driver or nonuniform observation-selection counterexample. Merely increasing n without establishing the null assumptions does not justify an empirical p-value. Actual contact attribution still needs blinded information predictions and leakage controls separate from field association.

Replay: `python3 -B verification/round3/check.py` from the study directory. `comparison.json` binds the model, fixtures and contract; `freeze.json` binds this verification record. This is separate model-agent implementation review, not an independent laboratory experiment or human peer review.

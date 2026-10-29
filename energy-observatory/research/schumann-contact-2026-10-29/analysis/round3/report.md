# Round 3 producer — exact cyclic null and selected lags

Status: **PASS, 407 assertions executed**. Two manually specified integer-vector fixtures were frozen in `fixtures.json` and hash-bound by `input-freeze.json` before result computation. Every specified fixture is reported, including the less striking distinct-shape result. There was no outcome search, tuning, physical data acquisition or failed producer run. Independent verifier outputs were not read before this freeze.

Run `node analysis/round3/run.mjs` from the study directory. For independent requests, `node analysis/round3/api.mjs` accepts one JSON object per line with `x`, `y`, `lags` and optional `alpha`; it emits `{ok:true,result:...}` or `{ok:false,error:...}`. Both vectors must be finite, nonconstant and length 32. Lags are safe integers with distinct residues modulo 32. The model uses absolute Pearson correlation between `x[i]` and `y[(i+offset+lag) mod 32]`; this is a synthetic phase index, not an observed timestamp or signed causal delay.

## Exact stipulated null

Conditional on both fixed shapes, the relative cyclic offset is uniformly distributed over all 32 offsets. The full cyclic group, including identity, is enumerated. Stationarity alone does not establish this conditional null for arbitrary real data. The locked statistic is the maximum absolute correlation over lags −3 through +3. The complete maximum is recomputed after every group action; its exact p-value is the number of null statistics at least as large as the observed statistic divided by 32. Because the full group includes the observed identity, there is no Monte Carlo plus-one adjustment.

Scores within absolute 1e-12 are counted as ties in the upper tail, using `nullScore + 1e-12 >= observedScore`. This conservative convention can only add upper-tail counts relative to a strict numerical rank. Correlation calculations rescale each input vector, center it and normalize the centered Euclidean norm; returned magnitudes are clamped at 1 to absorb roundoff. Score comparison tolerance for independent verification is 1e-11; discrete p-values/counts should match exactly with the declared tie rule.

| Fixture | Fixed-zero-lag rejection fraction | Correct locked-max rejection fraction | Deliberately invalid selected-minimum fraction |
| --- | --- | --- | --- |
| Identical shape, uniformly random relative offset | 1/32 = 0.03125 | 0/32 | 7/32 = 0.21875 |
| Distinct shapes, uniformly random relative offset | 0/32 | 0/32 | 0/32 |

All fractions enumerate every possible observed offset at alpha 0.05; they are exact for these shapes and this stipulated null, not Monte Carlo estimates or empirical contact false-alarm rates. The valid fixed and locked-max rejection fractions stay below `floor(32*0.05)/32 = 1/32`. Ties and the seven-lag search can make the exact test conservative. The invalid comparison takes the smallest individually calibrated p-value over the selected lags without calibrating that selection. Its failure in the identical-shape fixture illustrates selection bias; its lack of rejection in the distinct-shape fixture is retained and does not rehabilitate the procedure generally.

When the candidate family includes all 32 lags, its maximum score is invariant under every cyclic shift. Every exact max-statistic p-value therefore equals 1, and the valid test has no discriminatory power. This is a useful degeneracy control: a search that already includes the entire transformation group cannot detect a special observed phase through that maximum.

## Interpretation and next objection

These are established finite-group randomization calculations, not a novel probability theorem or an ET/contact test. Control is demonstrated under the complete stipulated uniform-offset null only; strong familywise control under arbitrary partial nulls is not claimed. The code rejects constant/nonfinite/unequal-sized vectors, invalid or empty lag families, aliased lag entries and invalid alpha values. Unknown timestamps, masks, seasonal behavior and information leakage are outside this model rather than silently accepted.

The exact p-values do not justify cyclic shifting of a recent Schumann record against retrospective testimony. Contiguous outages, nonrandom missingness, local-time/seasonal structure, clock uncertainty, source-event versus upload time, shared calendar drivers and report selection can violate the model. A significant association would not identify an extraterrestrial sender. The next selected task should test an explicit version of one of these unmodeled ordinary alternatives or construct a strict acquisition/attempt-intake gate. No later-round result was precomputed.

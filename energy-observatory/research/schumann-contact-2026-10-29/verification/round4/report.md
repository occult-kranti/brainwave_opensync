# Round 4 independent verdict

**PASS for the selected synthetic resolution and identifiability benchmark.** The independent integer/rational oracle and additional fixtures were frozen before producer inspection. Final comparison covered eight 256-offset families (2,048 rows, half independently chosen), two matrix fixtures, exact N32 parity across nine previous independent families, and five post-inspection rank-input rejection controls: 16,590 checks, no mismatches. Maximum absolute score discrepancy was 2.498001805406602e-16. Integer ranks/p-values and rational matrix properties agreed exactly. No calculation failures or repairs occurred.

The advisor contract's literal reuse of a hardcoded-32 module was caught before execution and clarified. R4 supplies a separate generalization, imports the unchanged R3 tie rule, and binds its source hash. Original R3 behavior and the no-power result remain intact.

## Resolution, sensitivity example and limits

With seven locked lags and 256 offsets, the necessary minimum p is 7/256=0.02734375. The producer and verifier's independently chosen identical shapes attain that value at aligned offset0. This is one deterministic matched-shape alternative per fixture, **not an estimate of population power**. The corresponding uniform-offset conditional null rejects at seven offsets; fixed-lag tests reject at eleven because of symmetric ties. The maximum-statistic rejection fraction is below floor(256*.05)/256=12/256. All-256-lag statistics are invariant and give p=1.

The independent distinct-shape fixture gives p=.265625 at offset0, and the producer's distinct-shape fixture gives p=.47265625. Neither was suppressed to present only detection examples. The full seven-lag max statistic rejects at seven of 256 offsets in each distinct fixture. Deliberately invalid selected-minimum individual-lag tests reject at 77/256 for the identical shapes, 73/256 for the independent distinct shapes and 75/256 for the producer's distinct shapes. These figures describe the exact stipulated orbit, not the calibration of empirical station/contact records.

Larger n resolves the R3 granularity problem; it does not establish shift invariance of real observations, eliminate common drivers, correct retrospective sampling or produce an ET mechanism. No measured geophysical or human data were introduced.

## Shared driver and explicit null spaces

For X=z and Y=2z, direct model Y=2X and common-driver model Y=2z make identical observational predictions. The centered five-by-two design has rank1/nullity1 with kernel(1,-1). The five-by-three duplicated-sensor design has rank1/nullity2; both reported kernel witnesses independently multiply to zero and are linearly independent. A duplicated measurement therefore adds columns, not identifying variation.

Under the separately stipulated perturbation X'=z+u with z fixed, the direct and common-driver predictions differ by2u. The centered five-by-two design becomes rank2/nullity0, with exact unscaled Gram determinant28. A second independently chosen four-row case has determinant161 and the same rank transition. The producer represents centering with an integer scale n; determinants therefore scale by n^4, giving17,500 and41,216 respectively. The verifier checked that conversion rather than comparing unlike matrices.

The perturbation is hypothetical. Its independence and exclusion from the second equation are assumptions, not established controls for human behavior or planetary fields. A full-rank chosen model does not rule out additional unmeasured causes or establish extraterrestrial agency.

## Next objection and decision input

The remaining gap is operational evidence, not more null-model algebra. A useful next round should validate a prospective paired-record contract: independent acquisition times, calibration/QC, all-attempt denominator, precommitted endpoint/lag family, astronomical calendar variables treated as potential confounders, and blinding/leakage controls for information claims. An observational analysis can be eligible without being causally or agent-identifying. A metadata checker must not certify facts merely because an uploader sets them true.

Replay with `python3 -B verification/round4/check.py` from the study root. `comparison.json` records exact dependency hashes and runtime. This is independent code review by a separate model-agent, not independent laboratory or human peer review.

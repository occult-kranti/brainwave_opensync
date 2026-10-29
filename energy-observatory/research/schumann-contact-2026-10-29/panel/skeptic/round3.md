# Round 3 — exact selection audit and a zero-power limitation

Incoming objection: Round 2's physical receiver calculations establish no timing association; a selected lag needs its own valid null. The advisor froze a finite cyclic-offset test, adopting identity/tie handling, restricted lags and a global-null scope.

## Verdict

**Accept numerical calibration for the stipulated synthetic null; do not deploy this 32-offset, seven-lag version as an anomaly detector.** I inspected the producer implementation and outputs, wrote an independent integer arithmetic oracle, and checked all 192 fixed/maximum/selected-minimum rank counts across both fixtures and all offsets. Every count agrees exactly. The two specified fixtures were retained; the second does not show inflation at this threshold and is not hidden.

| Frozen fixture | Fixed-lag rejections | Invalid selected-minimum rejections | Correct maximum rejections | Smallest maximum-test p |
| --- | ---: | ---: | ---: | ---: |
| Identical shapes, uniformly random relative offset | 1/32 | 7/32 | 0/32 | 7/32 |
| Distinct shapes, uniformly random relative offset | 0/32 | 0/32 | 0/32 | 14/32 |

These are exact conditional orbit fractions, not Monte Carlo estimates, measurements or population prevalence. The selected-minimum comparator is invalid by design; it must never be offered as the preferred field-data result.

## Critical power finding

The corrected test's zero rejections are structurally unavoidable here, not an empirical demonstration of a powerful detector.

Let c(j) be the absolute correlation at cyclic offset j, and T(s)=max over l∈L of c(s+l). For any offset j* attaining the global maximum of c, each s=j*−l with l∈L attains that same maximum in T. Distinct lag residues give at least |L| such offsets. Thus the conservative full-orbit p-value for **every** observed offset is at least |L|/n. Here |L|=7 and n=32, so p≥7/32=0.21875. No dataset can reject at α=0.05 under this exact design. Searching every lag gives p=1 throughout.

This elementary design consequence is useful for protocol engineering, not a novel statistical theorem. It should be prominent beside any chart of false positives. A future protocol must demonstrate resolution and power before collecting data; increasing the sample count after viewing results is not an acceptable repair of a confirmatory test.

## Why the rank comparison is independent

For the frozen integer vectors, define q(s)=n∑x_i y_(i+s)−(∑x)(∑y). Pearson correlation divides q by one denominator common to all cyclic shifts. Therefore absolute integer q values give exact ranks without floating-point ties. The independent Python script imports no producer implementation. Producer's conservative 10⁻¹² score tie convention agrees with exact ranks for these fixtures; this does not certify every near-tied floating input.

The established null-invariance precedent is Hemerik–Goeman, *TEST* (2018), online 2017, §2.1 Definition1/Theorem1 [round3-source.json]. Our finite group is one specialization of that known framework. Uniform relative offset is assumed, not established for real Schumann or diary records. “Exact” means exact enumeration with conservative level under that null, not equality of type-I error to nominal α.

## Next discriminating question

The next useful objection is **ordinary common timing**, not a more elaborate occult interpretation. Freeze a simple structural model with observed common calendar driver z and independent or orthogonal residuals: X=a z+u and Y=b z+v, with no X→Y arrow. Compare its raw association with the residual association after projecting on the predeclared intercept and z. Include a direct-coupling positive control in a separately declared model. This can demonstrate that shared timing produces large correlations without an agent or direct field effect.

Do not claim that adjustment for one known z removes arbitrary confounding. Do not fit the nuisance set after inspecting significance. If a cyclic null rejects a shared-driver or nonstationary construction, that is a violation of the uniform-relative-offset hypothesis; it is not a failure of the valid theorem and not evidence of physical coupling. Astrology-sim-ant's time/ephemeris covariates would enter such a model only as predeclared numerical calendar variables, with UTC and version pins.

No future-round construction was executed by this reviewer. The report supplies a proposal for the advisor to accept or change after all Round 3 reviews.

## Execution and scope

Executed reviewer script: `round3_exact_rank.py`; output: `round3-exact-ranks.json`; 192 exact producer comparisons pass. Source and artifact hashes are in `round3-freeze.json`. No new physical dataset, calibrated cross-domain measurement, causal mechanism or ET attribution has been established.

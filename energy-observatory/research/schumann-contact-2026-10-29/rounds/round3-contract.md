# Round 3 contract — selected lags and an exact synthetic null

Input: round2 reviewer objection that timing/lag selection can create apparent links. Exact established finite-group randomization benchmark, not a new theorem or empirical SR/contact test.

Use finite nonconstant vectors of length32 and the cyclic shift group of all32 offsets. State the synthetic null explicitly: conditional on the two fixed shapes, relative offset is uniformly random. This is NOT guaranteed by stationarity of arbitrary real records. Preserve identity and ties; exact p is count(T_shift >= T_observed)/32, with no Monte Carlo +1 since the full group including identity is enumerated. Float tie convention must be conservative and explicit.

Statistic: absolute Pearson correlation at a fixed zero lag; separately max absolute correlation over locked lags−3..3. Recompute the entire maximum within each shift. Compare a deliberately invalid selected-minimum individual-lag p-value with the valid maximum-statistic p-value. Evaluate rejection fractions over all32 possible observed offsets at alpha0.05; global-null level <=floor(32alpha)/32 (ties may reduce power). Do not claim strong FWER across arbitrary partial nulls.

Producer chooses and freezes explicit finite integer vectors before results. Independent verifier first freezes its own additional fixtures and exact enumeration oracle. Include identical-shape/random-offset and distinct-shape fixtures; all32-lag family must yield p1 for every offset; reject constant/nonfinite/unequal length data, invalid/empty lag families. Report every fixture, not only a striking example. Discrete ranks/p-values must match exactly after documented tie handling; score tolerance1e-11.

No invented timestamps or measured data. No claim that cyclic shifts repair missingness, seasonal drift, a shared calendar driver, or leakage. Those are next-round objections. Preserve a failure if any, and ask four reviewers to select the next discriminating task.

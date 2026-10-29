# R3 revision record

The initial frozen packet remains byte-for-byte in `revisions/v1/`, including its model, runner, results, report and freeze receipt. It is superseded, not admitted as the final result. Its runner used paths relative to the original round folder; replay it only after restoring those files to that layout in a separate copy. The final runner remains self-contained with its own model and the hashed earlier input packets.

Independent verifier counterexample against model `06d1ecae6eddd1752b3f7e9ae5f0c4d173ed0d0578dad83824f7351d8311a8fa`:

```js
calibratedModeInverse({frequencyHz:6.4,massKg:0.25,
  realMPerN:1e308,imagMPerN:-1e308})
```

The old inverse accepted f₀=6.4 Hz and γ≈2.4867959858109×10⁻³¹⁰ s⁻¹, even though the represented parameters could not reproduce the datum within the forward model's supported response/PSD range. The final inverse replays its output through `modeResponse`, rejecting unsupported derived ranges or relative complex mismatch above 10⁻¹⁰. The failing input is retained as an expected-rejection assertion. Original held-out and independent comparison tolerances are unchanged.

The skeptic found that the initial actual-data intake conflated assessment cutoff with retrieval. Final image retrieval values are null because the ledger lacks a precise timestamp. NOAA retrieval now comes from the hashed download manifest: the full 2026-10-29T04:56:14.803554+00:00 is retained, with explicit millisecond truncation to 2026-10-29T04:56:14.803Z for the strict parser. The assessment cutoff remains a separate 2026-10-29T04:57:39Z. All actual packets continue to return insufficient evidence; this correction does not create or reject an anomaly finding.

These are corrections within the frozen R3 contract, not a fourth research round. Final admission remains contingent on the independent verifier and four actual panel reviews.

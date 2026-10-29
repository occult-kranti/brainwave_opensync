# Observational metrology review — final round 3

**Accept the final implementation within its synthetic, calibrated single-mode and metadata-only scope. No October Schumann anomaly is established.** This review was finalized after reading the actual producer and independent verifier results, reports, revision records and freezes. It does not authorize another research round.

## Bound receipt and repairs

Final producer module SHA-256: `c59e7b5d2489294c897a641a767fce25d5c743ea49e4236dcfebdc35ea1bec30`. The producer reports 58 executed assertions. The independent Python-oracle replay reports 82 API requests and 340 assertions, eight invalid numerical rejections, and largest nonzero compared relative discrepancy approximately 3.21×10⁻¹³. These are bounded arithmetic checks, not measurement uncertainty or uniform numerical certification.

Three material improvements are visible in the final artifacts:

1. The original R2 receiver example changed both mass and receiver. The added receiver-only control holds the actual known mass at 0.25 kg for both models. An unconstrained complex receiver maps the 7.8-Hz transfer to the 10.3-Hz target and passes three independent held-out frequencies (2.3, 11.7 and 17.1 Hz; maximum relative mismatch approximately 4.31×10⁻¹⁶). This removes the mass confound without deleting the earlier example.
2. Independent verification caught an accepted extreme response H=(1−i)×10³⁰⁸ m/N whose inverse lost representable detuning and could not be forward replayed. The original failure and source are preserved. The corrected inverse rejects unsupported forward range or excessive replay mismatch; the oracle thresholds were not relaxed.
3. Image retrieval times that were not recorded are now null. The actual NOAA retrieval timestamp is retained at microsecond precision in provenance, with explicit millisecond truncation only for the parser. The assessment cutoff is separate from retrieval time.

## What the inverse establishes

For a known positive mechanical mass, calibrated complex force/displacement H in m/N, a positive probe frequency, and the exp(+iωt) convention, taking real and imaginary parts of 1/H reconstructs ω₀² and γ within the assumed single-mode model. Positivity, supported range, forward replay and held-out checks are necessary safeguards. A pass does not validate the physical model class.

Conjugated phase, an unmodeled constant gain, a two-mode response and a small deterministic complex perturbation behave as the declared negative controls require. The perturbation is not a noise distribution or a confidence interval. Probe placement can be poorly conditioned; numerical replay does not supply a calibration uncertainty budget.

The same-mass receiver counterexample shows why finite held-out success does not remove arbitrary receiver ambiguity. For the specific rational oscillator ratio, stability and a causal realization with direct feedthrough can hold; passive sensor hardware is not established. Conversely, constant positive real gain is a restricted nuisance: two exact distinct-frequency impedance values recover pole parameters and mass/gain scale. It would be incorrect to claim all unknown gain prevents pole inference.

These are controlled mechanical calculations. A copper-ball bench could measure a known excitation, calibrated displacement/velocity, geometry and environmental changes and use a suitable system-identification model. Earth-ionosphere observations have distributed lightning, multiple overlapping modes, orientation-dependent coupling and uncertain propagation. Mechanical mass and force normalization cannot be assigned to that cavity by analogy.

## Metadata admission and the October packet

The verifier executed 46 metadata cases: two synthetic packets were ready for analysis, and 44 invalid or incomplete packets were insufficient. Every outcome retains `metadataOnly:true` and `anomalyEstablished:false`. Strict UTC/calendar, interval order, completed coverage assertions, record type/URL/hash format, calibration, QC, baseline, uncertainty and station-child consistency are useful schema checks.

They do not fetch or authenticate record bytes, compare their digest, establish traceable calibration, execute QC, validate independence or calculate an anomaly. Two different station IDs plus complete metadata do not prove independent instruments or errors. A self-asserted complete interval also cannot establish complete coverage of an unstated larger target window.

| Actual evidence | Admitted statement | Remaining measurement |
|---|---|---|
| Tomsk October 27–29 quick-look images | A visual feed was inspected; UTC mapping remains unconfirmed | Timestamped calibrated numeric SR channel record, response/orientation, QC and a matched baseline |
| Nagycenk October 29 quick-look image | Short qualitative display, not a multiday anomaly test | Comparable numeric record and baseline with extraction uncertainty |
| Saved NOAA/GFZ Kp | Separate geomagnetic context, 49 completed three-hour bins from October 23 00:00 through October 29 03:00 UTC | Kp cannot supply missing SR frequency data |

The October 27–29 subset contains only 17 completed three-hour Kp bins through the same endpoint. No all-day October 29 coverage is claimed. No retained complete Kp interval reaches 5; this neither proves nor disproves an SR change. Black pixels or absent feeds cannot be converted into zero field or a shifted frequency.

## Dashboard source check

The four previously reported source issues are corrected in the current files: colored spectral weight uses the numeric API return; E1 is labeled a partial-dephasing ergotropy bound; Tomsk UTC wording says unconfirmed; and GFZ provider/license links are clickable. Root owns browser validation and deployment.

The plotted NOAA estimated and GFZ preliminary series remain separate, with UTC labels, completed-bin filtering, a partial-day table entry, and an explicit interpolation/resolution warning. The model calculator labels synthetic response, distinguishes peak/ringdown/cavity concepts, and does not turn its frequency grid spacing into a confidence interval. Shared publication files still require root's final snapshot integration.

## Stop and next requirement

The three contracted research rounds close here. A new numerical agreement would not resolve the remaining observational gap. Before a new inference cycle, select an obtainable, licensed numeric dataset and a specific matched baseline/uncertainty procedure; then check exact prior art. The accompanying prior-art gate identifies already published source-geometry and multistation event studies and separates replication from an unverified novelty proposal.

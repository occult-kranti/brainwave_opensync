# Research round 1 — source, attribution and readiness review

Reviewer: /root/oct_sources. Date: 2026-10-29. Decision: **admit the stated synthetic reference-model results; do not admit an October Schumann anomaly, an Earth-field normalization or novel physics.** This report follows inspection of the actual producer and independent verifier artifacts, not their planned contracts alone.

## Evidence inspected and bound

| Artifact | SHA-256 |
| --- | --- |
| analysis/round1/results.json | 46dea2f66433bbeff4d2a1ddfa578ca3dd6f5faf0857f45c90906065428fd808 |
| analysis/round1/model.mjs | 86f92e1d90ee7b7b4ac5d8286c830d915a360f0c634fdeae4c2f3798c1443cc8 |
| analysis/round1/run.mjs | ba3c79925cd1ebb116ea285cd44738c0aa8d10926f1b2b01ea4c4a21ac669245 |
| analysis/round1/report.md | 5b2262891375e9865949e45a3b1184f0d5cfcbb6e7f5a4362b9373e2f8779395 |
| analysis/round1/attribution.md | 8bcba50585ba7c110961027d466c4b27fed3eaf9ca3c84b1082f47a5b7056b46 |
| verification/round1/comparison-results.json | 27fa97f8a673ed508556f88e1f3544b2aea51e4e0b73979cec2dd25402bc43fb |
| verification/round1/report.md | e78d81d125782a0d74ea2cee536db432cb4a659afd9e39e5a3044b78a8f83e80 |

Hashes were recomputed from current bytes. Producer results bind the listed model and runner; producer freeze agrees. Verifier source bindings match the inspected model, oracle, fixtures, bridge and comparison script. I read the model, numerical results, both derivations/reports and attribution supplement; I did not rerun their calculations.

The producer records 91 checks. The separate verifier records 79 API requests, 169 scalar comparisons, 15 invalid-input rejections, nine real quadratures and three resolution-aware peak grids, with maximum nonzero relative discrepancy approximately 8.99e-16. Those counts establish bounded implementation checks; the written derivations carry the all-real-parameter statements. Neither is a physical experiment.

## Attribution and interpretation

I independently opened [NASA NTRS 20120000051](https://ntrs.nasa.gov/api/citations/20120000051/downloads/20120000051.pdf), printed pages 3–4. Page 3 supplies the ideal thin-shell equation and approximate historical sequence 7.8, 14.3, 20.8, 27.3, 33.8 Hz, citing Sentman (1995). Page 4 gives different peaks from the authors' May 31, 2008 satellite observation. The producer's attribution supplement correctly separates these. The historical comparison has no joint uncertainty model here and is **not October 2026 measurement data**.

The fitted common-speed example misses the fifth historical reference by about -3.59 Hz. This is a disclosed limitation of that deliberately simplified fit, not statistical evidence of a changing Earth resonance. The horizontal modal scale and c/f vacuum reference remain distinct definitions.

At f0=7.8 Hz and Q=5, the producer's fixed-pole displacement maximum is about 7.721606 Hz, velocity maximum 7.8 Hz and ringdown frequency 7.760902 Hz. These are a known oscillator distinction. The derivative arguments also cover the DC maximum and nonoscillatory boundaries. The verifier independently uses f0=8 Hz, so its different numerical peaks are expected.

The 50 microtesla static example and 1 picotesla zero-mean RMS perturbation are illustrative amplitudes. Their energy-density calculations are not station readings, extractable watts, total terrestrial energy or evidence of surplus cycle energy. The physical-force/mechanical-displacement model cannot be relabeled as an electromagnetic Earth mode without a normalization and coupling model. Changing damping changes poles; only readout changes or positive constant PSD scaling are the stated fixed-pole controls.

## Remaining nuisance and Round 2 recommendation

Unknown **source spectrum**, frequency-dependent receiver response and additive noise remain unresolved. A peak shift in the output can arise without a changed cavity pole. Freeze a finite frequency band and admissible nonnegative integrable source spectra; construct two different damped transfers with identical output PSD via the compensating source ratio, then independently check the equality and a wrong white-source inference.

For an added observable, displacement and velocity of the same coordinate are redundant: their ideal PSD ratio is omega squared and eliminates the entire transfer function. Require a calibrated input–output complex response, a separately justified ringdown or genuinely nonredundant channel assumptions. Do not label any constructed source spectrum an observed lightning history.

Novelty/readiness: this round provides reproducible applications and controls for established formulas. It supplies no new fundamental theorem, no validation of OpenAI proofs and no recent-event detection. It is ready for the dashboard if the synthetic/historical/current-observation labels above remain visible.


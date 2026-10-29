# Round 5 — information scores, contamination and a repaired numeric defect

Incoming objection: Round4 distinguished two declared causal models only under a hypothetical intervention. A hit count alone needs its own no-information assumptions and cannot label a source as extraterrestrial. The advisor selected a fixed-trial probability and leakage benchmark.

## Verdict

**Accept the repaired probability API for the stated contract and checked range.** Independently computed exact-rational tails and mass functions match 273 producer values; the discrete rejection threshold agrees exactly. A genuine numeric defect was found, preserved and repaired before this acceptance. This is software verification, not an observed information-transfer result.

For N=100, K=4, fixed one-sided α=0.05, the minimum rejection count is 33. Its exact-tail value is approximately0.0445963; at32 hits it is0.0693489. Named examples: 25hits→0.538329; 30→0.149541; 35→0.0164267; 40→0.000686592; 50→6.63850×10⁻⁸. These numbers are conditional tail probabilities, not probabilities that contact is genuine or that the null is true.

## Assumptions determine the distribution

H is binomial only under the stated trial contract: each target is uniform and unpredictable conditional on the response and prior history, objective scoring is fixed, and the complete N-trial record is retained. Marginally balanced target labels alone do not establish that condition. Adaptive guessing based on previous revealed targets is compatible with the null only if the next target remains conditionally uniform and independent of that information.

A fixed-N test cannot simply be reused after watching interim scores and deciding when to stop. Post-hoc target categories, alternative subjective match scores, selective sessions and discarded unsuccessful trials change the tested procedure. These problems require a prospective protocol and independently auditable chronology, not an extra decimal place in the p-value.

In the declared independent leak model, ε=0.2 and K=4 produce q=0.4. Any other independently repeated information model having the same q produces the identical binomial likelihood for each hit count. Consequently this score cannot discriminate those mechanisms. This does not accuse a participant of leakage, prove a particular alternative, or rule out every hypothetical effect.

## Two contamination calculations must remain distinct

For 40 observed hits among100 trials:

| Assumed maximum compromised count m | Fixed/preselected subset, remaining100−m blind trials | Arbitrary post-outcome corruption of100 latent blind trials |
| --- | ---: | ---: |
| 0 | 0.000686592 | 0.000686592 |
| 5 | 0.00692771 | 0.0164267 |
| 10 | 0.0472839 | 0.149541 |
| 20 | 0.542836 | 0.900470 |
| 100 | 1 | 1 |

Column2 assumes the compromised locations are fixed/preselected independently of outcomes and makes all m correct, leaving a Binomial(100−m,1/4) remainder. Column3 uses H′≤H+m for an underlying100-trial blind vector, so the event H′≥h implies H≥h−m. Its bound therefore uses Binomial(100,1/4). Substituting the second column for arbitrary corruption gives a falsely reassuring result: m10 lies on different sides of0.05. In actual records, m remains unknown unless separately justified; the calculator neither estimates nor certifies it.

## Preserved failure and repair

The first producer model accepted N1000,K4,h1000 and N100,K1,000,000,h100 but returned a zero tail with no underflow status. The exact probabilities are positive (4⁻¹⁰⁰⁰ and10⁻⁶⁰⁰). The initial model hash and executed outputs remain in `round5-initial-underflow-failure.json`; producer history is retained under `analysis/round5/revisions/v1/`.

The repaired public API returns a null numeric probability, an explicit `positive-underflow` status and a finite log-probability. A numeric-only tail request rejects that unsupported result. Independent stress checks confirm log values approximately−1386.29436112 and−1381.55105580, within10⁻⁸ of the analytic values. Contamination results preserve the same distinction, and exact structural zero events remain distinguishable. The broad absolute-error tolerance was not used to hide the defect.

This is not an arbitrary-precision certification of every supported floating input. The accepted ordinary fixture comparisons have maximum absolute error1.11×10⁻¹⁶ and maximum relative error6.48×10⁻¹⁵; separate stress receipts cover the named extreme cases.

## Round6 admission recommendation

Require target assignment/custody, response-before-reveal evidence, complete counts, locked scoring and stopping, UTC provenance, and declared analysis families. For any Schumann association, additionally require calibrated synchronized numerical fields, station/QC records, baseline and nuisance model. A metadata gate can test completeness and contradictions but cannot authenticate the truth of a calibration or prove the absence of leakage.

Even an apparently complete packet should return **eligible for independent review**, not `contact validated`, `ET supported`, or a measured-coupling certificate. Source hashes identify bytes, not truthful timestamps. Independent auditors must inspect custody and the declared null before an empirical analysis is admitted. No fictional complete fixture may be displayed as a real session.

## Execution record

Executed: `round5_exact_binomial.py`, `round5_compare.py`, and the two-case underflow stress/recheck recorded in JSON. Producer numeric outputs and repaired model are bound in `round5-freeze.json`. No human sessions, physiological intervention, field acquisition or ET-contact procedure occurred.

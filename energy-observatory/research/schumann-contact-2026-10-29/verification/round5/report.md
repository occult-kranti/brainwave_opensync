# Round 5 independent verdict

**PASS after the preserved positive-tail underflow repair.** The independently frozen oracle uses exact rational binomial sums. Final checks covered27 tails, five rejection thresholds,37 contamination cases,101 probability masses for each of two equivalent leakage calculations,28 invalid cases and1,001 positivity/status checks on the extreme-N PMF. Total1,671 checks passed. Maximum absolute probability error was8.881784197001252e-16, maximum relative error on nonzero representable probabilities1.565361905246957e-14, and maximum absolute log-probability error4.547473508864641e-12. Discrete thresholds agreed exactly.

## Conditional score, not source identification

For100 fixed trials with four unpredictable equiprobable targets under the conditional no-information assumption, rejection at alpha.05 first occurs at33 correct: tail at33 is.0445963252, while tail at32 is.0693488891. This exact-distribution calculation does not verify that any actual session had the necessary randomization, blinding, conditional independence or complete reporting.

| Hypothetical hits | No-information upper tail |
| --- | ---: |
|25|.5383288679|
|30|.1495410466|
|35|.01642674067|
|40|.000686592208|
|50|6.638502483e-8|
|100|6.223015278e-61|

The target must remain uniform and independent **conditional on the response and prior history**. Marginally balanced targets, fixed numbers of each target or an investigator's statement that selection was random do not by themselves establish this model. No optional stopping or post-hoc scoring rule is covered. Neither a low p-value nor this code outputs an ET/contact probability.

## Why contamination assumptions matter

At35 hits, allowing m=5 in a **preselected** perfectly successful subset gives tail.08880474738 for the remaining95 blind trials. Allowing arbitrary outcome-dependent alteration of up to five entries instead uses the conservative bound.1495410466 from the underlying100 blind trials. At m=10, the respective values are.3078188457 and.5383288679. Both reach1 at m=100. The code keeps these two models separate and retains the requirement that actual m is unknown; it is supplied for sensitivity analysis, not estimated or certified.

For independent perfect leakage on20% of trials and blind guessing otherwise, q=.4. All101 hit-count probabilities match the independent Binomial(100,.4) law. Any posited independent mechanism with the same q has that same likelihood for counts. This exact distributional identity shows an attribution limitation; it does not allege leakage by a particular person or refute every hypothetical information mechanism.

## Preserved failure and repair

The original producer returned numeric0 for N1000,p=.25,h1000, although the exact probability is(1/4)^1000>0. Its source and failure are preserved in `analysis/round5/revisions/v1/`. The verifier independently replayed that archived failure after repair and recorded the chronology in `initial-failure-replay.json`.

The repaired scalar-tail API rejects positive underflow. The qualified score/tail/PMF paths use null probability plus finite log probability and an explicit `positive-underflow` status. For this fixture log probability is approximately−1386.29436112. The verifier confirmed every PMF entry at n1000,p.25 is either strictly positive in floating point or marked as positive underflow; no such entry is advertised as an exact zero. Exact impossible-event and certain-event boundary cases remain distinct. The numerical implementation is binary64, not arbitrary precision, even though it evaluates the exact-test formulas.

## Next evidence gate

Before any empirical use, require a fixed target-generation/response-sealing chronology, independent custody/blinding, scoring and exclusions committed in advance, all-attempt counts, a leakage audit and untouched replication. A metadata checklist can identify absent records; it cannot authenticate these facts or estimate m. Paired Schumann observations still require their own calibrated numeric data and statistical null. The binomial test alone supplies no electromagnetic pathway or ET-source discriminator.

Replay with `python3 -B verification/round5/check.py` from the study root. The dependency hashes and runtime are in `comparison.json`. No human sessions or physical measurements occurred. This is separate model-agent verification rather than human peer review or laboratory replication.

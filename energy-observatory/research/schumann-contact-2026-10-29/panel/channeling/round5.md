# Round 5 — information score and indistinguishable sources

Reviewer: `/root/contact_channeling`. Read `rounds/round5-contract.md` before outputs. Producer results inspected: `analysis/round5/results.json`, SHA-256 `8e2804ba86ea15cac4c90ba6583e92768417fbe2578407ba4ba3af05d5585801`, reporting 304 assertions. This domain review does not substitute for the dedicated verification replay.

## Accepted calculation

Independent Python integer binomial sums with `Fraction` reproduced the fixed N=100, K=4 benchmark. The smallest one-sided rejection count at alpha0.05 is33; its null tail is0.0445963252127, while32 gives0.0693488891417. A hypothetical40/100 score has null tail0.000686592207963. These are **example counts, not observed participant performance**.

The no-information assumption is conditional: each target must be independent and uniform given the response and available history. Equal marginal target counts, a promise of blinding, a low p-value or a filed protocol do not establish that premise. Optional stopping, silent exclusions, chosen-afterward scoring or selection of the best session invalidate this particular fixed-test interpretation.

## Objection → response → decision

**Objection:** A strong information score might be interpreted as identifying the claimed source.

**Response:** In the specified independent ordinary-leak model, probability0.2 of a perfect leak and otherwise a1/4 blind hit gives q=0.4. Any separately stipulated independent source model with the same q produces exactly the same hit-count distribution. The producer's full likelihood vectors agree to floating precision (maximum reported difference8.88e-16). This is a mathematical identity under stated assumptions, not a finding that any particular channeler leaked information.

**Decision:** Accept the calculation and leakage-equivalence demonstration as standard probability/experimental-design work. No `ET probability`, `confirmed contact` or `confirmed Schumann coupling` follows. A future score can reject its specified no-information model only after the design assumptions are audited; agency needs additional distinguishing evidence.

## Contamination assumptions materially change the result

For the illustrative40hits and m=10 possibly compromised trials, the preselected-subset model gives0.0472838855404, while the conservative bound allowing arbitrary outcome-dependent changes gives0.149541046567. At m=20 these become0.542836253941 and0.900469589895. The assumed m is not measured or estimated here. The smaller preselected-subset tail must not be used when compromised trials could be chosen after observing their outcomes. A sensitivity curve does not certify that the actual m is small.

## Required next admission boundary

R6 should check a prospective packet for objective target/response definitions, fixed K/N, complete trial IDs and counts, response-lock-before-reveal timestamps, randomization description, custody/blinding roles, artifact commitments and analysis-plan identity. Include explicit missing values, contradictory times, duplicate or missing trials, changed plans and absent evidence as rejection cases.

**A schema validator authenticates none of these claims.** Passing metadata can still describe a fictional experiment. Separate `structurally complete` from independent audit, actual execution and scientific interpretation. A hash identifies bytes when those bytes are supplied; it does not prove when they existed, that the schedule was secret, or that the randomization was independent. An unsalted hash of a target drawn from just four known options can be reversed by four guesses, so it is not a secrecy mechanism. A protocol needs an appropriate secret-nonce commitment or independently protected schedule and records of disclosure timing; this round implements neither custody system nor human collection.

An optional environmental packet must separately identify source site, calibrated channel/component, UTC event time, sampling, baseline, missingness and analysis family. A subjective narrative, an upload timestamp or a spectrogram image cannot silently fill those fields. Official frequency assertions corrected in R1 remain attributed assertions, not outcomes of these probability calculations.

Novelty: reproducible known-law benchmark and protocol clarification. No new corpus, human trials, contact result or calibrated environmental record was obtained.

## Final producer binding — underflow repair

The initial review above is retained with its original result binding. The skeptic subsequently identified a positive-probability underflow defect outside the displayed N100/K4 examples. Final producer model SHA-256 is `3eb54483c494c969ac692c66abdfbd9a7620cd095298258bbfb49c2033544889`; final results are `b4e02fba49ce50a4d486e1431eae16421a746420692be2bf923c605acdcb2f1f`, reporting314 assertions. The original candidate/failure remains preserved.

I inspected the repaired underflow records: the positive tail 4^-1000 now has `probability:null`, finite log probability approximately−1386.29436 and `status:positive-underflow`, rather than an unqualified zero; a large-K case also carries this distinction. The strict numeric API rejects the unsupported positive underflow value. Thus numerical representability is no longer presented as logical impossibility. The central N100/K4 scores and this report's information-versus-source interpretation remain unchanged. Dedicated verifier results are separate from this domain check.

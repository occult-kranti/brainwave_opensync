# Skeptic Round 2 — adversarial execution

**Outcome: admitted within the stated model and finite numerical scope.** Incoming Round 1 issues were clipped loss ratios, exact versus tolerance-based positivity, omitted degeneracies, and an unexecuted withheld control. Read the advisor decision, producer proof/module and verifier Round 1 report; Round 1 skeptic artifacts remain unchanged.

## Withheld model control

Executed `python3 research/dephasing-work-bound/panel/skeptic/check_skeptic.py > research/dephasing-work-bound/panel/skeptic/round2-results.json`; exit **0**, no failed checks. The checker performs exact rational complex-matrix multiplication for the frozen unitary and states. It obtains true work loss **9/20**, bound **9/20**, and d→d² loss **9/16**, exceeding the intended bound by **9/80**. Both corresponding producer inputs are valid and accepted. The rejection occurs only at an independent work-difference comparison against the original d's bound. Thus the mutation represents the wrong channel for the declared d, not a forbidden state.

The implemented work differences are 0.44999999999999996 and 0.5625. The decisive comparison uses `workBeforeJ − workAfterJ`, checked against the exact matrix result, rather than the clipped `lossRatio` or the same-code identity `loss≤bound`. The producer clipping therefore cannot force this control to pass.

## Proof and input audit

The operational minimization follows from the minimum-eigenvalue Rayleigh bound and an attaining eigenbasis unitary. The explicit phase-dependent unitary has the correct convention for ρ₀₁=c. The separate dr=0, z≥0/z<0, and R_d=0 branches cover undefined phase and zero denominators. Lower equality is exactly r=0 or d=1. Triangle-equality necessity correctly includes the zero first vector at p=1/2,d=0; upper equality is exactly r=0, d=1, or p=1/2. A balanced coherent family establishes nontrivial sharpness.

Eleven targeted input cases agree with independent exact `Fraction` PSD/range checks. In particular, p=0 or 1 with the smallest positive float coherence is rejected despite squared-underflow temptations; p=0.1 with r=0.3 is accepted, while its next larger float is rejected. Eight helper outputs are exactly admissible and their next floats are not. The exact-input policy is narrower than a tolerance-admitted boundary sample; neither should be relabeled as the other.

## Precision scope and remaining publication condition

Five 800-digit Decimal spectral/work-subtraction comparisons independently audit the stable loss expression. Normal-range Joule relative errors are below 6.46×10⁻¹⁷. Two cases retain representable Joule losses when normalized loss underflows. A subnormal Joule result has **2.93% relative error**, within one minimum-subnormal absolute unit: classification is useful but does not imply accurate relative digits. The proof already says this explicitly; retain that caveat in the calculator.

The theorem is algebraically supported; these finite checks do not prove universal floating-point accuracy. The clipping is openly documented as a rounding safeguard, not verification. Final presentation must preserve exact equality predicates, positive-loss underflow warnings, and apparatus limits. The results bind the actual executed source, checker and frozen controls by SHA-256. No additional research round was executed.

# Skeptic Round 3 — final claim and interface audit

**Verdict:** the scoped mathematical claim is supported; no unresolved mathematical objection remains. Final release still requires the root's frozen-source replay and publication checks below. Exactly three research rounds have been performed.

Read the Round 2 decision, current proof, evaluator/UI and page source, summary/network, and release checker. The public bound, necessary/sufficient equality cases, sharpness and fixed-energy meaning match the accepted argument. Attribution separates established ergotropy/coherent ergotropy from the local corollary and implementation; novelty is unverified. Numerical counts remain finite checks, not exhaustive floating-point certification. Neither apparatus efficiency, hardware evidence nor proof-assistant certification is claimed. Typed `tests`, `proves`, `non-transfer`, and `does-not-establish` relations retain distinct scopes.

## Actual incoming objection and repair

The advisor identified possible positive-coherence conversion underflow. I reproduced the precise case p=1/2, κ=5e−324, d=1/4, ε=1: the admissible maximum is 1/2, but κ times that maximum rounds to |c|=0. The original UI consequently displayed exact zero-loss equality with no warning. A separate input string `1e-324` parsed to zero before multiplication and produced the same misleading result.

`check_ui_conversion.mjs` independently executes the actual input handler in a minimal DOM harness. The archived `round3-ui-before.json` records both failures. The integrator now rejects nonzero text parsed to zero and positive multiplication results that underflow before calling the evaluator. The UI clears result/equality displays, disables export and gives a precise conversion error. Literal zero and the physical p=0/1 zero-coherence endpoints remain valid.

Executed `node research/dephasing-work-bound/panel/skeptic/check_ui_conversion.mjs > research/dephasing-work-bound/panel/skeptic/round3-ui-results.json`; exit **0**, all six targeted cases pass. The tested UI SHA-256 is `697ada688c21d9fef058fb18beb41bb6927d27ff69bde2d5c9688e60f7ef50d2`. This harness does not certify native browser validity, layout, export downloads or deployment. The misleading “continuum statement” fallback wording was also changed to “all-parameter statement.”

## Final gates and preserved limits

The revised release checker requires an accepted receipt with explicit coverage of the contract, proof, evaluator, checkers/bridge/control, all eighteen reports and publication sources; it then executes independent checks on a temporary copy. That closes the earlier possibility of an empty or selectively incomplete hash list passing integrity checks. A hash or consensus alone still cannot establish the theorem or implementation accuracy.

Before claiming completion, the root must bind final source bytes (including this report and UI regression artifacts), run the complete replay successfully, reconcile final summary/graph/advisor status, and check the built and live page plus linked artifacts at the deployment base. Remote-source and live-deployment evidence are separate. These are final execution/publication gates, not a fourth research round.

Preserve the Round 2 exact wrong-channel failure and precision limits: subnormal output showed 2.93% relative error despite acceptable absolute rounding; normal range is not an error certificate. The all-parameter proof, finite implementation evidence, requested-to-representable input conversion and physical limitations must remain separate in the final release.

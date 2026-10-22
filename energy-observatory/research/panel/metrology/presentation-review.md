# Metrology release presentation review

Date: 22 October 2026 UTC. This is a final-round publication check, not a fourth research round. No shared files were edited. Browser functional and visual inspection belongs to the advisor.

**Disposition: two release corrections requested.**

1. **M-UI-01 — zero-input sweep efficiency.** `emSweep({driveVrms:0})` and `acousticSweep({forceRmsN:0})` both return a best feasible zero-response cell with `inputW = 0` and `efficiency = null`. The sweep renderer multiplies the null by 100 and displays **0%**, then calls the result an optimum. Preserve **Undefined** and explain that there is no positive-input transfer at this drive. This is the same meaning already used correctly by the main calculator.
2. **M-UI-02 — measured versus computed.** The homepage CONVERT card says “equal measured input power.” Use “equal model input power”; the branch contains no hardware measurements.

Two nonblocking alignment edits are useful: the identity-scale HTML range should match the API’s 0.01–100, and “Independent uncertainty” in the metrology role could become “Covariance-aware uncertainty” to avoid suggesting independent instrument errors.

The rest of the reviewed scientific copy preserves the required meanings: J versus W and VA; RMS conventions; signed ledger with user-supplied combined uncertainty and a chosen interval; no automatic exact-95% claim; separate EM terminal/acoustic receiver/whole-apparatus boundaries; prepared-state quantum work rather than apparatus efficiency; and no physical replication inferred from independent model formulations. The selected three-card diagnostic test is explicitly not a reliability benchmark. The SVGs are declared conceptual/topology drawings and contain no measured traces. The acoustic drawing illustrates upstream pressure-wave separation; an actual two-port protocol must add transmission measurements as the page text requires.

`presentation-review.json` records the exact reviewed source hashes, API reproduction, accepted checks and limits. Corrected files require a targeted reread of these findings, not a new scientific review cycle.

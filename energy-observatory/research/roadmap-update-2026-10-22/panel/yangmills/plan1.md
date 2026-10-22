# Planning round 1 — YM-P1

**Class:** bounded mathematical attempt. **Novelty:** candidate effective bound in an existing project model; scientific priority unverified. This is a plan, with no new proof or code execution.

**Question.** For the zero-selected patterned SU(2) model at fixed spacing, |τ|≤10⁻⁸, F1/F2 named boxes, R={0,e_z}, A∈B(H_R) and |θ|≤8, can we prove an explicit finite C such that

\[
|c_A^{F,N}(\theta)-c_A^\infty(\theta)|\le C N^{-1/4}\|A\|^2
\]

for every integer N≥5? Named-state convergence and a rate restricted to N≤14000 already exist; the distinct objective is an effective all-size certificate. No continuum or physical mass claim follows.

**Frozen schedule and expression.** Set r_N=2 for 5≤N<16 and r_N=floor(N^(1/4)) for N≥16; V_N=(2r_N+1)³. Use integer fourth-root comparisons. Split finite verification at 5≤N≤255 and the analytic tail at N≥256. Starting from the BB2 four-term decomposition, re-establish

\[
B_N=\frac{C_d}{r_N-1}+c_sV_Ne^{V_N/10^8}q^{N-r_N}+2C_sq^{N-1},
\]

with q=1/64, C_d=78057/622883200000000, c_s=2/984375 and C_s=4/984375. These are inherited candidate inputs, pending source-gate reconciliation. The new radius does not inherit the old frozen theorem merely by substitution.

**Prerequisite gate.** Re-read the pinned BB2/BA2 gates and relevant proofs; verify BB1's discharge, exact constants, common state, clock, complete-factor support, cutoff-removal order and hypotheses of the dynamics estimate. Prove r_N≥2, R⊂Λ_r⊂Λ_N, the actual support of A*X_r, and the F2 comparison inequality for this schedule. Missing evidence means abstention before arithmetic.

**Proof work.** Bound each term separately. For the finite interval, use rational enclosures of exponentials and fourth roots, with documented remainder. For the tail, prove bounds on r_N−1, V_N and the **combined** V_N exp(V_N/10⁸)q^(N−r_N), rather than claiming the exponential prefactor is bounded. Construct C by a predeclared rule: maximum of a certified finite-range coefficient and a proved tail coefficient. All-N acceptance requires an analytic argument, not an enlarged grid.

**Controls.** Recover the original BB2 bracket at its original radius as a positive regression. The half-box radius must reject an unrestricted decay assertion but retain its valid finite range. Substituting |R| for V_N must fail support accounting. Both failures must be shown in the actual proof/checker review, not only flagged by text matching. Changing τ's sign is a mirror, not independent confirmation.

**Artifacts, if execution is later authorized.** Under `research/roadmap-update-2026-10-22/attempts/ym-p1/`: `contract.json`, `source-map.json`, `lemma.md`, `verify.py`, `results.json`, `independent-review.md`, `receipt.json`. The source map pins upstream f9364d6: Round33 BB2 report/gate, BA2 report/gate and BB1 gate. OpenAI215 is a methodological reference only; no external theorem is a premise.

**Cap and review.** Estimate/cap: five producer agent-hours plus three separate reviewer agent-hours; ≤10 CPU-minutes, one core, 512 MiB for exact arithmetic. The reviewer independently reconstructs the support and tail inequalities before inspecting produced constants. Stop early on an unsupported source premise or failed bound; stop at the cap with an obstruction report. Do not retune the radius, split or claim after failure.

**Conditional fallback only.** YM-P2 may replace this attempt after advisor selection if the prerequisite gate fails: a ≤2 agent-hour source preflight for route-B finite-box dynamics, explicitly retaining selected-face groups and norm 2349|τ|. It is not automatically executed, and correlation consequences are excluded until its own comparison is proved. Small-box signs remain deferred.

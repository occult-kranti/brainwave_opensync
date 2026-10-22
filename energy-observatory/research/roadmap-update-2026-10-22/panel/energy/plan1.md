# Energy planning round 1

**Decision:** attempt E1, then E2; defer E3. Both apply established finite-dimensional theory. Their new contribution is a project proof/ledger artifact, not a new thermodynamic law or OpenAI theorem solution. This is planning only.

**E1 target.** For every qubit with fixed gap ε>0, population p∈[0,1], |c|²≤p(1−p), and retained energy-basis coherence d∈[0,1], prove

\[
0\le W(1)-W(d)\le\epsilon|c|(1-d),\quad
W(d)=\tfrac\epsilon2[2p-1+\sqrt{(1-2p)^2+4d^2|c|^2}].
\]

Loss is strictly positive iff c≠0 and d<1. Handle c=0 and p=1/2,d=0 without division by zero. Unlike the completed numerical grid, acceptance requires an all-parameter algebraic proof and equality cases. The population remains fixed only during dephasing; damping is a different step.

**E2 target.** For 0<ν<1/2, define τ=diag(1−ν,ν), H=diag(0,ε), and βε=log[(1−ν)/ν]. Use d=1 and a two-qubit endpoint Hamiltonian H⊗I+I⊗H. The planned cycle is τ⊗τ → ρ⊗τ → excitation exchange → local unitary extraction → joint reset to τ⊗τ. Work supplied is positive. Prove the conditional bound ΣW_on≥0 when every operation meets the thermal-resource premises, including joint reset and auxiliary closure.

Do not assume this work inequality as a gate and then advertise its sum as a physical derivation. First derive the operation identity

\[
\beta(W_{on}-\Delta F_X)=D(\omega'_B\|\tau_B)+I(X:B)'\ge0
\]

for an initially uncorrelated system/thermal bath, global unitary evolution, and vanishing endpoint interactions. A classical drive's work is the total endpoint energy change. Then telescope the admissible operations. Finite-bath models need not attain the lower bound.

Retain F(ω_SB)=F(ω_S)+F(ω_B)+β⁻¹I(S:B). Reset-work bounds are signed; recovering remaining free energy can give a negative lower bound. Mathematical bounds, simulated work and measured hardware costs are separate fields. Missing controllers, references, bath restoration or measurements cause “incomplete ledger,” not an efficiency number.

**Planned artifacts and sequence.** Under the proposed `research/thermal-cycle-v1/`: (1) freeze `contracts/E1.json` and write `derivations/dephasing.md`; (2) independently review that proof; (3) freeze `contracts/E2.json`, endpoint/port definitions and `derivations/cycle.md`; (4) implement `src/cycle-ledger.mjs` and `checks/operator_check.py`; (5) save results and a narrowly scoped review receipt. These paths are proposed, not created.

**Controls.** E1 positive controls include a diagonal passive state and p=1/2, where the upper bound is attained. Reject W=E and a derivative that divides by zero. E2 includes the unchanged Gibbs cycle and nontrivial exchange. Reject an omitted reset, marginal-only closure that discards correlations, an inverted/second-temperature resource labeled single-bath, and equality between a lower bound and measured preparation cost. The checker must reject or abstain on these actual fixtures.

**Review and cap.** Request the methods agent's independently frozen operator/entropy cases and the skeptic's premise/closure review before producer results. Cap E1 at 3 agent-hours, E2 at 10, independent review at 3; at most five CPU-minutes, 512 MiB, and 8×8 matrices. Existing Node/Python/NumPy and source hashes are prerequisites. Stop on failed assumptions, unresolved proof steps or exhausted cap; preserve the partial result and missing premise. No implementation, experiment or further research round occurs during this planning stage.

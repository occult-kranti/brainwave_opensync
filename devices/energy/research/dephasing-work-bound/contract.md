# E1 execution contract — revision 1

Frozen 2026-10-22 before producer work. Source branch baseline: 8e9f131cb8f9da82532812a66e144b67e969cb0d. Latest master inspected: a0cdefd. This is a new execution of the historical E1 roadmap, not a rewrite of its planning records.

## Target

Let H = diag(0, ε), ε > 0. Let ρ = [[1−p,c],[c*,p]], p∈[0,1], |c|²≤p(1−p). Let D_d preserve p and multiply c by real d∈[0,1]. Define W(d) as Tr(H D_d(ρ)) minus the minimum of Tr(H U D_d(ρ) U†) over all qubit unitaries U.

Prove or refute 0 ≤ W(1)−W(d) ≤ ε|c|(1−d), characterize both equality conditions and sharpness, and independently verify the implementation by matrix/unitary calculations. Keep p,c,H fixed. Arbitrary cyclic unitary control is an ideal operation class, not an implemented extraction apparatus. No damping or heat-bath cycle is included.

## Team and rounds

Root is advisor; six model-agent roles are proof worker, independent verification worker, source/novelty auditor, physical-assumptions reviewer, knowledge/workflow integrator and skeptic. The first two are the dedicated workers. All six start in separate contexts; both workers freeze their independent round-1 artifacts before exchange. Same model family and shared inputs can still produce correlated mistakes. This is not human peer review.

Round 1 derives the statement and freezes independent checks; support roles inspect the contract and build admission criteria. Advisor reads all six reports and freezes Round 2 from actual objections. Round 2 exchanges/revises/tests those artifacts; advisor then freezes Round 3. Round 3 closes remaining objections and audits proof, implementation and presentation. Exactly three rounds; stage-0 source/skill preparation and deployment are not extra research rounds.

## Admission gates

- Derive the operational work quantity and an attaining unitary from the state spectrum.
- Cover all parameters and necessary/sufficient equality cases algebraically, including zero denominators.
- Independently assemble complex matrix/unitary checks; include a discriminating wrong-model control and distinguish normalized residuals from Joules.
- Explain numerical cancellation and representability; preserve original models and historical records.
- Link each accepted claim to exact source sections or local proof/code/executed output. A graph edge or provider paper title does not transfer a theorem.
- Present established theory, project corollary, numeric evidence and apparatus limitations separately. No novelty or formal-verification claim without evidence.
- Publish a calculator, readable proof, typed evidence graph, six reports per round and reproducible gates; verify site links and actual deployment separately.

## Ownership and stop rule

Proof worker owns panel/proof/, proof.md and src/dephasing-bound.mjs. Verification worker owns panel/verification/ and check files there. Support roles own their panel subdirectories; integrator may later own dephasing-page.mjs and src/dephasing-ui.mjs plus approved route wiring. Root owns round decisions, summary/network/receipts, workflow gates and final integration. No role modifies others' files without explicit handoff.

Reports should be concise and cite artifacts. A failed premise or unresolved defect is an explicit obstruction; do not expand to E2, Yang–Mills, acoustic experiments or unconstrained brute force.

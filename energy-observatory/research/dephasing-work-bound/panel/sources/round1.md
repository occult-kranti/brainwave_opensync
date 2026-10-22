# Source auditor — round 1

**Admission recommendation:** admit the contract to Round 2 as a known-theory application requiring local proof and independent implementation checks. Do not admit the inequality, its equality classification or the calculator as established by this source audit alone.

Reviewed contract revision 1 and the updated `qubit-panel.md` guidance. Did not read the proof worker's or verification worker's artifacts. Stage-0 records remain unchanged. `mapping.json` binds the exact claim categories to source sections and prospective local evidence.

The contract correctly fixes H, p and c while varying the retained-coherence factor d. Its physical-state constraint, ε>0, d∈[0,1], ideal arbitrary-unitary operation class and exclusion of damping/heat cycles fit the source application. “Cyclic” concerns the control Hamiltonian's endpoints, not restoration of the supplied qubit state. This distinction should appear in publication because a restored state would change the work-extraction question.

The precise source mapping is:

- **Established functional:** Allahverdyan–Balian–Nieuwenhuizen, arXiv:cond-mat/0401574v1, pp. 1–2, Eqs. (2), (5)–(9), supplies spectral minimization and an attaining unitary under ideal cyclic driving.
- **Established qubit specialization:** W(d)=ε[2p−1+sqrt((1−2p)²+4d²|c|²)]/2 follows by diagonalizing the declared state and applying that functional. The project must show this short derivation explicitly.
- **Established full-dephasing interpretation:** Francica et al., arXiv:2006.05424v2, Eqs. (4), (5), (12), identifies W(1)−W(0) with coherent ergotropy and supplies the equivalent qubit expression.
- **Local obligation:** the partial-dephasing inequality, complete equality conditions, sharpness and singular-endpoint treatment require the project's proof. The exact bound was not located verbatim in the checked portions. This is no evidence of novelty.
- **Non-transfer:** family 276 concerns generalized-amplitude-damping communication capacity. Its channel overlap does not prove this work functional or bound; its formalization scope is not a certificate for E1.

Retain two publication limits. First, coherent ergotropy is not monotone under every incoherent channel: Francica explicitly discusses a counterexample, so the fixed-population hypothesis cannot be dropped. Second, Li et al. (2025) is contemporary experimental context only; this panel has not reproduced that experiment or audited its whole cost boundary.

For Round 2, require an explicit local proof of all equality cases, division-free endpoint handling, and a source-to-local-claim distinction next to the displayed result. Keep c as the actual matrix entry; a normalized slider must define its conversion. No source search expansion is needed unless a new attribution claim appears. No production or verification outputs were inspected this round.

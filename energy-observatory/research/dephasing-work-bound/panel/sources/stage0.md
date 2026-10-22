# Stage 0 — source and novelty audit

Date: 2026-10-22. Role: source/novelty auditor. Applied `paired-physics-research` and its known-theorem/project-derivation distinction. This is a bounded primary-source comparison, not a comprehensive novelty search or independent audit of all source proofs.

**Recommendation:** admit E1 as a project proof and assurance task using established ergotropy theory. Do not call it a new thermodynamic law or an OpenAI theorem transfer.

## Frozen meaning and source connection

The model is a single qubit with fixed Hamiltonian H = diag(0, ε), ε > 0; density matrix [[1−p,c],[c*,p]], 0 ≤ p ≤ 1 and |c|² ≤ p(1−p); energy-basis dephasing retains c ↦ dc, 0 ≤ d ≤ 1, and leaves p unchanged. Work means ideal ergotropy under arbitrary cyclic unitary controls. The implementation's `coherence` input κ is a normalized preparation fraction, whereas c in E1 is the actual off-diagonal entry at the comparison stage. After damping it is c = sqrt(1−γ) κ sqrt(p_initial(1−p_initial)); the comparison population is likewise the post-damping population. Use either an arbitrary physical input state or this explicit map, never mix the two parameter conventions.

## Checked primary literature

1. [Allahverdyan, Balian and Nieuwenhuizen, arXiv:cond-mat/0401574v1](https://arxiv.org/pdf/cond-mat/0401574v1), *Maximal work extraction from quantum systems* (2004 preprint; published title includes “finite”). Read pp. 1–2, model and Eqs. (2), (5)–(9), including the attaining-unitary construction. Fixed endpoint Hamiltonian and thermal isolation make the reachable set a unitary orbit. Pairing the largest state eigenvalue with the smallest energy minimizes energy; the difference from initial mean energy is ergotropy. This supports the work functional, not an apparatus efficiency claim.
2. [Francica et al., arXiv:2006.05424v2](https://arxiv.org/pdf/2006.05424v2), *Quantum Coherence and Ergotropy*, Phys. Rev. Lett. 125, 180603 (2020), [DOI](https://doi.org/10.1103/PhysRevLett.125.180603). Read sections II–III and the qubit part of V.A, specifically Eqs. (4), (5), (12), plus the stated Appendix-A limitation. Eq. (4) identifies incoherent ergotropy with that of the fully energy-dephased state. Eq. (12) gives qubit coherent ergotropy through purity and l1 coherence, equivalent to ε/2[sqrt((1−2p)²+4|c|²)−|1−2p|]. The paper explicitly warns coherent ergotropy is not a monotone under all incoherent operations; generalized amplitude damping can violate that broader assertion. E1 must retain fixed populations and the specific dephasing family.
3. [Li et al., arXiv:2506.16881v2](https://arxiv.org/html/2506.16881v2), *Experimental Extraction of Coherent Ergotropy and Its Energetic Cost in a Superconducting Qubit*, Phys. Rev. Research 7, 043236 (2025), [DOI](https://doi.org/10.1103/ptr1-59tv). Read abstract, metadata, introduction and Fig. 1 caption only. Relevant contemporary experiment on coherent/incoherent work extraction and competing relaxation/dephasing effects. It is contextual motivation only: its experiments, calibration and cost definitions are not reproduced or independently audited here.

All accessed 2026-10-22. Exact URLs and explicit reading depths are in `sources.json`.

## Attribution decisions

| Candidate statement | Classification | Admission limit |
|---|---|---|
| Ergotropy is initial energy minus passive energy on the same unitary orbit | Established result applied here | Credit ABN; arbitrary ideal controls and fixed endpoint Hamiltonian |
| W(d) = ε/2[2p−1+sqrt((1−2p)²+4d²|c|²)] | Elementary specialization of established result | A local derivation is project assurance, not a new physical law |
| W(1)−W(0) is coherent ergotropy | Established identification | Francica Eqs. (4), (5), (12); same energy eigenbasis |
| 0 ≤ W(1)−W(d) ≤ ε|c|(1−d) for all physical p,c,d | Project-derived corollary pending panel proof | The exact inequality was not identified verbatim in the checked source portions; novelty remains unverified |
| Complete equality classification and division-free p=1/2,d=0 treatment | Project derivation and assurance | Must be independently proved; sampled grids cannot establish completeness |
| Numerical unitary/orbit checks or browser comparisons | Project implementation assurance | Finite calculations do not replace the all-parameter proof |
| Dephasing energy loss equals ergotropy loss | Rejected | Mean qubit energy is unchanged by this channel |
| Every incoherent channel decreases coherent ergotropy | Rejected generalization | Francica explicitly gives a contrary example |

The local corollary can be approached without differentiation at the origin: write the Bloch vector as (2d Re c, −2d Im c, 1−2p) and apply the reverse triangle inequality to the difference of lengths at d and 1. This is a proof suggestion, not source attribution or a completed independent proof in this lane. Equality cases must be checked separately by the derivation/reconstruction roles.

## OpenAI family 276 boundary

Read the existing project crosswalk and locally available `lean/docs/276.md` in full. The local scope document concerns unassisted classical capacity of generalized amplitude damping, repeated-use Holevo additivity and an attained scalar maximum. Its scope expressly excludes arbitrary different partner-channel additivity and separate-measurement decoding. No Lean execution or kernel verification was performed.

The earlier project's source-bound paper inspection records p′=(1−γ)p+γν and c′=sqrt(1−γ)c, with ν the stationary excited population. The present lane did not independently retrieve that manuscript's TeX; this mapping remains inherited source evidence from `research/math-crosswalk/panel/energy/round1.md` and its manifest. Optional d-dephasing is a following channel. Capacity and ergotropy are distinct functionals. Neither the capacity theorem nor its formalization supplies E1, extraction work, a reset cost or apparatus efficiency.

## Stage-0 next request

Have the proof and reverse roles independently establish all-parameter inequality and both equality conditions, including c=0, d=1, p=1/2, d=0 and p endpoints. Have the numerical role compare actual unitary energies with the passive optimum while respecting c versus κ. Preserve the evidence label “known theory; new project assurance; novelty unverified.”

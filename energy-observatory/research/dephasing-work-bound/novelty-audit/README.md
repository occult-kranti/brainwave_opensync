# E1: correctness, significance and novelty audit

Audit date: 2026-10-22. Audited source commit: `2bf9252f17f38db500b1e920612ddb43565c4fe7`.

**Verdict: mathematically correct; already implied by an earlier general theorem; useful as a verified benchmark, with no defensible claim of a new physical discovery.** This supplement supersedes the earlier dossier's provisional “novelty unverified” assessment for the upper bound. The original proof, panel reports and receipts remain historical records.

Three fresh agent reviews independently checked the proof, close qubit literature and general continuity results. The advisor inspected the decisive primary-source equations and reconciled their conclusions. This is an AI-assisted audit, not external human peer review or proof-assistant certification.

## What was already established?

| E1 component | Earlier evidence | Audit classification |
| --- | --- | --- |
| Maximum work obtained by passively ordering the state spectrum | Allahverdyan, Balian and Nieuwenhuizen (2004), Eqs. (5)–(9) | Established ergotropy theory |
| Exact qubit coherent-work formula | Francica et al. (2020), Eq. (12) | Established; E1's loss follows by evaluating it twice |
| Upper bound on partial-dephasing loss | Hovhannisyan, Simon and Anders (2024), Appendix A, Eq. (A13) | Direct specialization of an explicitly proved, more general bound |
| Complete-dephasing endpoint and phase-flip expression | Arjmandi (2026), Eqs. (16), (18), Appendix A | Explicit prior result |
| Equal-population saturation | Francica et al. after Eq. (12); Arjmandi Appendix A | The saturation mechanism was already described |
| Full endpoint bookkeeping and stable calculator | This project's proof and implementation | Local exposition and implementation assurance; priority of the exact package is not established |

The decisive prior source is [*Concentration of ergotropy in many-body systems*](https://arxiv.org/pdf/2412.19801v1), publicly submitted on 27 December 2024. Cite **PDF Eq. (A13), printed page 9**; the HTML conversion calls it Eq. (69). It bounds passive-energy differences by the Hamiltonian norm times trace distance. The [general-theorem review](general-theorem.md) gives the exact substitution and an independent proof. The main theorem's generic factor 2 must not be mistaken for the sharper passive-energy intermediate bound.

For our model the two mean energies agree and

\[
D_{\mathrm{Tr}}(\rho,\rho_d)=\tfrac12\|\rho-\rho_d\|_1=|c|(1-d),
\qquad \|H\|_{\mathrm{op}}=\varepsilon.
\]

Therefore that prior inequality yields exactly our upper bound. This is mathematical containment, not merely a related topic. A search for every possible earlier wording is unnecessary to establish that containment. This audit does not claim to have found the earliest historical proof of every equality case.

## Correctness and reproduced evidence

For all stated admissible qubit states, gaps and dephasing parameters, the independent derivation confirms

\[
W(d)=\frac{\varepsilon}{2}\left(\sqrt{(1-2p)^2+4d^2|c|^2}-(1-2p)\right),
\qquad 0\le W(1)-W(d)\le\varepsilon|c|(1-d).
\]

Lower equality holds exactly when `c=0` or `d=1`. Upper equality holds exactly when `c=0`, `d=1` or `p=1/2`. Nonzero coherence with balanced populations and `d<1` attains the upper bound, so the coefficient cannot be reduced in this model.

The fresh release replay passed all six check groups and checked 95 original source hashes and 18 panel reports. It reproduced 3,780 admitted matrix comparisons with maximum normalized error about `2.94e-16`, plus separate high-precision and negative controls. See [correctness.md](correctness.md) and the exact [replay.json](replay.json). Numerical samples support the implementation; the algebra establishes the all-parameter result. No uniform floating-point accuracy guarantee follows, especially for subnormal outputs.

## Significance

E1 gives a simple ceiling on how much ideal, average extractable work can be lost when coherence decreases at fixed populations. Its balanced-population states provide exact calibration cases. That is useful for checking simulation code, explaining coherence's role, and detecting mismatches between a claimed pure-dephasing model and its implementation. The exact formula is available, so the bound does not unlock an otherwise unsolved numerical optimization.

The contribution delivered here is an inspectable proof, explicit edge cases and a reproducible calculator. The theorem alone does not establish a new effect or a research breakthrough. Coherent ergotropy has also been studied experimentally: see [Li et al. (2025)](https://arxiv.org/html/2506.16881v2). That paper's reported population decay during dephasing illustrates why our fixed-population assumption needs experimental checking. We did not independently audit its raw data or complete energetic-cost accounting.

The state energy remains `epsilon*p`. The result describes access to already stored energy under ideal unitary controls. It supplies no net-energy cycle, apparatus, power output, copper-object frequency law or Yang–Mills result. Preparation, control, reset and environmental costs are outside its scope.

## Research decision

Retain E1 as a completed, verified benchmark and label the bound an **application of established theory**. Do not spend further panel rounds attempting to establish novelty of this same inequality. A subsequent project would need a distinct claim—for example, a rigorously specified restriction on available controls or an inference method with experimental uncertainty—and its own prior-art comparison before calling it novel.

The [prior-art review](prior-art.md) records source reading depth and a minor equality-text inconsistency in the inspected 2026 preprint. That correction does not turn E1 into a new physical discovery. The review was targeted, not an exhaustive literature survey or a legal patent-novelty opinion.

## Primary references

- Allahverdyan, Balian, Nieuwenhuizen, [*Maximal work extraction from quantum systems* (2004)](https://arxiv.org/pdf/cond-mat/0401574v1).
- Francica et al., [*Quantum Coherence and Ergotropy* (2020)](https://arxiv.org/pdf/2006.05424v2), Physical Review Letters 125, 180603.
- Hovhannisyan, Simon, Anders, [*Concentration of ergotropy in many-body systems* (2024 preprint)](https://arxiv.org/pdf/2412.19801v1).
- Arjmandi, [*Frozen and Growing Quantum Work under Noise* (2026 preprint)](https://arxiv.org/html/2602.18860v1); [publisher record](https://journals.aps.org/pra/abstract/10.1103/43vv-521p), Physical Review A 113, 032220, 26 March 2026. Equation comparison used the preprint body.
- Li et al., [*Experimental Extraction of Coherent Ergotropy and Its Energetic Cost in a Superconducting Qubit* (2025)](https://arxiv.org/html/2506.16881v2).

# E1 prior-art audit

Audit date: 2026-10-22. Role: independent literature reviewer. This report appends evidence; it does not change the frozen E1 proof or verification receipts.

## Verdict

The mathematical claim is sound within its declared single-qubit model, but the physical content and the exact underlying formula were established before this project. The complete-dephasing endpoint of the upper bound has also been stated and proved explicitly in prior literature. The partial-dephasing loss bound is a short corollary of the known formula. A verbatim earlier statement of that full increment inequality with all endpoint equality cases was not located in this bounded search. That absence does not establish novelty or priority.

Recommended classification: **verified elementary corollary and reproducible implementation of established ergotropy theory; no established new scientific discovery**.

## Source comparison

### Allahverdyan, Balian, Nieuwenhuizen (2004)

[Maximal work extraction from quantum systems](https://arxiv.org/pdf/cond-mat/0401574), arXiv:cond-mat/0401574v1, 28 January 2004.

The paper derives the maximal cyclic-unitary work functional using the ordered spectrum of the state and Hamiltonian. The passive-state minimization and an attaining unitary are established results, not new E1 claims. Reading depth: retrieved original five-page PDF and inspected the opening statement; detailed attribution to Eqs. (2), (5)–(9) is already present in the frozen project dossier. No independent priority claim is made here for dates before 2004.

### Francica et al. (2020)

[Quantum Coherence and Ergotropy](https://arxiv.org/pdf/2006.05424), arXiv:2006.05424v2; Physical Review Letters 125, 180603, DOI [10.1103/PhysRevLett.125.180603](https://doi.org/10.1103/PhysRevLett.125.180603).

Inspected Secs. II–III and Sec. V.A, especially Eqs. (1), (4), (5), and (12), plus the following equal-population discussion. Their coherent ergotropy is total ergotropy minus ergotropy after complete energy-basis dephasing. Equation (12), converted using purity and l1 coherence, is

\[
E_c(\rho_d)=\frac{\varepsilon}{2}\left(\sqrt{z^2+4d^2r^2}-|z|\right).
\]

Since incoherent ergotropy is unchanged at fixed populations, subtracting this established expression at d=1 and d gives E1's exact loss. The equal-population relation E_c=epsilon C_l1/2, and its saturation, are already described immediately after Eq. (12). Thus neither the qubit expression nor the equatorial saturation mechanism is new. Reading depth does not include independently auditing every result in the paper.

### Arjmandi (2026): closer explicit bound

[Frozen and Growing Quantum Work under Noise: Coherence and Correlations as Key Resources](https://arxiv.org/html/2602.18860v1), 21 February 2026. The [publisher record](https://journals.aps.org/pra/abstract/10.1103/43vv-521p) confirms Physical Review A 113, 032220, published 26 March 2026.

Inspected Sec. 4, Eqs. (16), (18)–(19), and Appendix A, Eqs. (39)–(43). The paper proves E_c<=C_l1/2 for a unit-gap qubit. Restoring epsilon and using C_l1=2r gives E1's complete-dephasing endpoint L(d=0)<=epsilon r. Its phase-flip formula, with q=1-d and n3=z, is also exactly the coherent component needed for general E1 loss. Appendix A recognizes equality at n3=0.

Source caution: the paragraph after Eq. (19) says phase-flip saturation occurs only at q=1; this is inconsistent with its own formula and Appendix A when n3=0. This audit checked the preprint text, not the subscription-only journal body. The inconsistency does not invalidate the bound.

### Li et al. (2025): physical significance already demonstrated

[Experimental Extraction of Coherent Ergotropy and Its Energetic Cost in a Superconducting Qubit](https://arxiv.org/html/2506.16881v2), 29 September 2025 version.

Inspected the introduction, model, extraction protocols, Figs. 1–3 discussion, and the stated source of experimental discrepancy. This reports superconducting-qubit coherent/incoherent extraction and models unwanted population decay during dephasing. It establishes relevant experimental precedent; E1's simulations are not the first physical demonstration. Raw data, supplemental information, and energetic-cost accounting were not independently audited. The practical lesson for E1 is that fixed populations must be measured, not assumed in a laboratory comparison.

## Independent mathematical comparison

Let r=|c|, z=1-2p, and F(x)=sqrt(z²+4x²). For r>0,

\[
L/\varepsilon=\tfrac12[F(r)-F(dr)].
\]

The reverse triangle inequality gives |F(r)-F(dr)|<=2r(1-d); the nonnegative sign follows because r>=dr. This is an elementary norm inequality, without a new thermodynamic premise. Equivalently, where the derivative exists, F'(x)=4x/sqrt(z²+4x²)<=2 and integration from dr to r gives the result. The zero-radius endpoint is directly continuous.

The upper equality classification follows from parallel vectors in the triangle inequality: besides zero coherence or identity dephasing, z=0 is necessary and sufficient. This is rigorous and useful, but not by itself evidence of a research-level conceptual advance.

Do not obtain the partial-d result by subtracting two separate inequalities E_c(1)<=epsilon r and E_c(d)<=epsilon dr: subtracting upper bounds is not valid. The known exact formula plus a norm argument is the correct route.

For the source caution above, take p=1/2, r=1/4, d=1/2 (q=1/2). Then E_c(rho_d)=epsilon/8 and epsilon C_l1(rho_d)/2=epsilon/8, so equality occurs before complete dephasing. This is a counterexample to the preprint's isolated restrictive sentence, not a counterexample to its theorem.

## Search scope and limits

Queries covered qubit ergotropy, dephasing loss, l1-coherence upper bounds, partial dephasing, and continuity/Lipschitz bounds. Both available search engines were used. Primary papers were used for conclusions; secondary search hits served only as discovery leads.

A further relevant primary source was identified: [Hovhannisyan, Simon, Anders, Concentration of ergotropy in many-body systems](https://arxiv.org/html/2412.19801v1), 27 December 2024. Theorem 1 and Appendix A address trace-distance continuity and separate mean-energy and passive-energy terms. That route is being checked independently by the general-theorem reviewer; this report does not duplicate their conclusion.

This search is sufficient to reject a broad claim that E1 discovers coherent ergotropy, qubit dephasing work loss, or equatorial saturation. It is not an exhaustive priority search for every wording of the finite-increment inequality. The defensible contribution is the local proof exposition, edge-case completeness, and audited calculator. Publication-level novelty would require a genuinely new extension or experimentally resolved limitation beyond these established results.

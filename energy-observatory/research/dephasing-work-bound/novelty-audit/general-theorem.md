# E1 general-theorem and prior-art audit

Audit date: 2026-10-22. Reviewer: `novelty_general`. This report supplements the frozen E1 dossier; it does not alter its original receipts.

## Verdict

The E1 upper bound is an immediate specialization of an explicitly proved pre-existing passive-energy continuity bound. It should be classified as **an independently checked application of established mathematics**, rather than a new general theorem. The complete qubit equality classification is correct elementary local derivation; this audit did not establish first publication of that classification.

## Decisive source and exact mapping

Karen V. Hovhannisyan, Rick P. A. Simon and Janet Anders, *Concentration of ergotropy in many-body systems*, [arXiv:2412.19801v1](https://arxiv.org/abs/2412.19801v1), submitted 27 December 2024. [PDF](https://arxiv.org/pdf/2412.19801v1), Appendix A, **Eq. (A13), printed page 9**. The [HTML](https://arxiv.org/html/2412.19801v1) auto-renumbers the same display as Eq. (69). The arXiv record inspected lists no journal reference; this audit treats it as a prior public preprint.

For a Hamiltonian with ground energy zero, that display proves

\[
\left|\operatorname{Tr}[(\rho^\downarrow-\sigma^\downarrow)H]\right|
\leq \|H\|_{\rm op}\,D_{\rm Tr}(\rho,\sigma),
\qquad D_{\rm Tr}=\tfrac12\|\rho-\sigma\|_1.
\]

Here the arrows denote passive rearrangements. Reading depth: Sec. II definitions/Theorem 1; Appendix A proof, especially Eqs. (A1), (A3)–(A4), and (A11)–(A13); arXiv submission record. **Theorem 1 alone has factor 2 for arbitrary ergotropy differences; the sharper passive-energy statement A13 is the relevant result.**

For E1, mean energies coincide. Thus its work loss is precisely the passive-energy increase. Also \(\|H\|_{\rm op}=\varepsilon\), while the difference of its two states has eigenvalues \(\pm(1-d)|c|\). Substitution into A13 therefore yields exactly

\[
|W(\rho)-W(\rho_d)|\leq\varepsilon|c|(1-d).
\]

This is a direct mathematical subsumption, not a similarity of keywords or an inference from an abstract.

## Independent derivation and constant check

For any bounded finite-dimensional Hamiltonian define
\(P_H(\rho)=\min_U\operatorname{Tr}(HU\rho U^\dagger)\), and let \(\Delta_H=E_{\max}-E_{\min}\). Center the Hamiltonian at its spectral midpoint, obtaining \(\|H_0\|_{\rm op}=\Delta_H/2\). For any common unitary \(U\), trace-norm duality gives

\[
|\operatorname{Tr}[H_0 U(\rho-\sigma)U^\dagger]|
\leq\frac{\Delta_H}{2}\|\rho-\sigma\|_1.
\]

The difference of two minima is bounded by the uniform difference of their objectives. Hence

\[
|P_H(\rho)-P_H(\sigma)|\leq\Delta_H D_{\rm Tr}(\rho,\sigma).
\]

Equal mean energies allow \(|W(\rho)-W(\sigma)|=|P_H(\rho)-P_H(\sigma)|\). Without that restriction, the ordinary estimate for ergotropy contains two terms and is \(2\Delta_H D_{\rm Tr}\); silently using the one-term constant for arbitrary states would be wrong.

For the nonnegative sign in E1, put \(Z=\operatorname{diag}(1,-1)\) and \(q=(1+d)/2\). Then \(\rho_d=q\rho+(1-q)Z\rho Z\). The function \(P_H\) is concave (a minimum of linear functionals) and invariant under unitary conjugation. Therefore \(P_H(\rho_d)\geq P_H(\rho)\). The channel preserves mean energy because \([H,Z]=0\), so \(L\geq0\).

An earlier source for this ordering is Allahverdyan, Balian and Nieuwenhuizen, [*Maximal work extraction from quantum systems* (2004)](https://arxiv.org/pdf/cond-mat/0401574v1), Eq. (12), printed page 3: at fixed mean energy the majorization ordering gives the ergotropy ordering. Reading depth: that equation and surrounding majorization argument, plus the introduction. For this qubit, \(R_1\geq R_d\) directly supplies the required spectral majorization.

## Equality cases and significance

Set \(r=|c|\), \(z=1-2p\). The exact radii are norms of \((z,2r)\) and \((z,2dr)\). Their difference is nonnegative and no greater than the distance between those vectors. The lower equality requires \(r=0\) or \(d=1\). For the upper equality, if the displacement is nonzero the two vectors must point along that displacement, which requires \(z=0\). Therefore the asserted upper equality cases are exactly \(r=0\), \(d=1\), or \(p=1/2\). Taking \(p=1/2,r>0,d<1\) verifies sharpness.

E1 is useful as a transparent qubit benchmark, a regression target for numerical ergotropy calculators, and a bound on ideal work accessibility under coherence loss. Its value here is explicit assumptions, endpoints, stable evaluation and verification. The prior general theorem removes a defensible claim of a new physical bound. No apparatus cost, net-positive complete cycle, many-body advantage, Yang–Mills result, or free-energy source follows from E1. Establishing a genuinely new contribution would require a distinct, literature-compared question, such as constrained implementable controls or experimentally certified estimates with complete uncertainty and energy accounting.

Search coverage was targeted to passive energy, ergotropy, trace distance, Lipschitz continuity, dephasing and majorization. It establishes an explicit prior result sufficient to subsume E1's upper bound; it does not establish the earliest historical appearance of every equality case or algorithm.

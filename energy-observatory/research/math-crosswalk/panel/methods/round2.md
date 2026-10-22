# Round 2 — exact finite certificates and independent checks

The admitted oscillator contract passed **26/26 checks**. Its general energy identity was expanded with exact rational Laurent coefficients; three separately assembled rational matrix cases agreed. Every declared wrong control failed for its intended reason. This is an executable algebra certificate for a stated finite model, not a Lean proof, a certified continuum spectrum, an experiment, or an OpenAI problem solution.

The optional thermal-channel check passed **63/63 comparisons across three independently chosen cases**, with maximum dimensionless discrepancy `3.3306690738754696e-16` against tolerance `1e-12`. A separate source review confirmed the acoustics reviewer’s narrow concern about a printed SVD rescaling in an ICASSP-linked preprint. Neither result changes a crosswalk entry to “exact same problem solved.”

## Frozen model and exact result

`round2-contract.json` was saved at `2026-10-22T03:58:16Z`, before implementation or execution. Its SHA256 is `18b28800a7663fbf86e45988efb00860ef65d2036dcfbfa282f2622c2221c60a`. This instantiates the advisor-approved Round 1 proposal. The model is dimensionless, with arbitrary real state/input and **m>0, k>0, b≥0**:

\[
H=\frac{kq^2}{2}+\frac{p^2}{2m},\qquad
\dot q=\frac p m,\qquad
\dot p=-kq-\frac{bp}{m}+u,\qquad y=\frac p m.
\]

The exact coefficient expansion in `exact_certificate.py` gives

\[
\dot H-uy+b(p/m)^2\equiv0.
\]

The script uses Laurent powers of nonzero m and rational coefficients, so this coefficient identity is not inferred from sampled parameter values. The positive storage and nonnegative dissipation statements still depend on the declared domain: for nonzero (q,p), H>0 because both quadratic coefficients are positive; b(p/m)²≥0 because b≥0. These elementary sign arguments are recorded explicitly and were not delegated to a formal proof kernel.

For the independently assembled matrix check, z=(q,p), Q=diag(k,1/m), and A is read directly from the state equations. The identity is

\[
\frac{QA+A^TQ}{2}=-G,\qquad
G=Q\operatorname{diag}(0,b)Q=LDL^T,
\quad L=\begin{pmatrix}0\\1/m\end{pmatrix},\quad D=(b).
\]

The tested cases were `(m,k,b)=(2,3,1/5)`, `(7/3,5/2,0)`, and `(1/4,11/7,9/13)`. Matrix products, leading minors, the supply vector QB, and the weighted-square factor agree exactly using `fractions.Fraction`. These three matrix cases are finite witnesses; they do not establish a theorem by sampling.

| Deliberately wrong or insufficient input | Observed discriminator |
|---|---|
| Supply output y=p at m=2 | Exact identity residual −1/2 at q=0,p=u=1 |
| Damping b=−1/5 | Domain rejected; unforced storage derivative +1/20 at m=2,q=0,p=1 |
| Add 1/7 to the Gram matrix’s lower-right entry | Still positive, but fails equality to the intended dissipation polynomial |
| Form LᵀDL with L of shape 2×1, D of shape 1×1 | Explicit matrix dimension rejection |
| m=0 or k=0 | Strict-storage domain rejected before inversion |
| f(x)=(x−11/20)²−1/1000 | All 11 grid points j/10 positive (minimum 3/2000), while f(11/20)=−1/1000 |

The factor check follows the declared matrix dimensions rather than copying the incompatible order printed in p.4 Eq.6 of the [NSPI conference paper](https://proceedings.mlr.press/v306/zuo26f.html). We did not run NSPI, Lean or Comparator. The skeptic independently froze a velocity-coordinate case before reading this implementation, then confirmed that m=2,k=3,b=5,p=2v reduces our derivative to uv−5v². That is a limited independent check of this identity, not independent validation of every routine.

## Independent acoustics source review

I opened the [primary preprint](https://arxiv.org/html/2602.03398v1), inspected PDF p.2 visually, and checked the [official ICASSP 2026 program](https://www.cmsworkshops.com/ICASSP2026/view_paper.php?PaperNum=4067&bare=1). The program confirms the presentation; the equation review applies specifically to **arXiv v1**, whose PDF hash is recorded in `sources.json`. Sections 2.1 and 3.1 retain x as the plane-wave coefficient vector. Equations 6–7 pair U_K* y with Σ_K⁻¹V_K* x; no compensating coefficient redefinition appears in the inspected surrounding sections.

Our algebraic check, omitting noise for clarity, is:

\[
y=U\Sigma V^*x
\Longrightarrow U_K^*y=\Sigma_KV_K^*x.
\]

For nonzero retained singular values, two consistent alternatives are the direct pair `(U_K* y, Σ_K V_K*)` or normalized pair `(Σ_K⁻¹ U_K* y, V_K*)`. To retain the printed dictionary instead, the observation would need the different transformation `Σ_K⁻² U_K* y`. Rescaling x could also change the algebra, but would change its declared coefficient meaning and generally its sparsity structure. Thus a hypothetical unstated rescaling does not resolve the displayed definitions as written.

The scalar sanity case H=2, x=1, y=2 gives 2 on the printed constraint’s left and 1/2 on its right. This establishes only a discrepancy among the displayed formulas. It does **not** diagnose the authors’ implementation, refute their experiments, or claim that the final proceedings version has the same issue. The transferred lesson is to verify the precise forward operator before adopting an inverse solver.

## Three-case thermal-channel cross-check

The separate `energy-crosscheck-contract.json` was frozen at `2026-10-22T04:02:39Z`, after receiving API conventions but before reading producer code or outputs. Its SHA256 is `efc31402f1ccba3288ba19cfa7211d8b5ef2f9da8befc654333a2f36c290cf4f`.

`energy_reference.py` constructs a system–bath density matrix, applies an excitation-preserving 4×4 unitary, takes both partial traces, and applies an explicit probabilistic I/Z dephasing channel. It obtains passive energy and entropy from `numpy.linalg.eigvalsh`. Heat comes from changes of operator expectations in the system and bath, not from copying the producer’s population update or heat expression. The producer’s same-author checker also uses a standard dilation: our independence is separate authorship, frozen cases and separate execution, not a claim that this physical representation is unique to our check.

The reference was computed at `04:05:55Z`; the producer was first imported at `04:05:59Z`. Producer source SHA256 was `cc3a6011d89ab2ad2904d216064a32e4af26bec56c54fd1718244165012727be`. No producer source text or own-checker output was used to construct the oracle.

| Frozen case | Initial excited fraction | Bath excited fraction | Damping | Heat into system / gap | Final ergotropy / gap |
|---|---:|---:|---:|---:|---:|
| Cold release | 0.70 | 0.08 | 0.37 | −0.2294 | 0.169023 |
| Warm absorption | 0.12 | 0.31 | 0.61 | +0.1159 | 0.00443149 |
| Inverted reservoir | 0.22 | 0.76 | 0.82 | +0.4428 | 0.377910 |

The full frozen contract also specifies frequency, coherence, phase and dephasing. All 63 comparisons passed: density matrices, energy, passive energy, ergotropy, entropy, system/bath heat, entropy production and reference operator invariants. Energies were compared after division by the independently constructed gap h f; a loose absolute-joule tolerance cannot mask errors. The inverted case deliberately uses an energetic population-inverted resource, not a passive positive-temperature reservoir. These finite checks do not establish channel capacity, optimal collective extraction, family 276, or a device claim.

## Reproduction and retained limits

From this directory, run:

```bash
python exact_certificate.py --output exact-results.json
python energy_reference.py reference
node run_energy_producer.mjs
python energy_reference.py compare
```

Reruns create new execution timestamps. `artifact-hashes.json` preserves the hashes of the original Round 2 artifacts. `round1.md` remains unchanged at its advisor-frozen hash.

The useful adoptions are now concrete: dimension-checked exact certificate admission, retained counterexamples to sampled “proof,” and independent operator/eigensolver spot checks. A future full formalization would still require a reviewed target statement, trusted dependency/toolchain inventory, an actual kernel run and a separate argument connecting finite models to continuum or measured systems. No further research round was started.

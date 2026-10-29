# Mathematical physics panel — public-paper round

Reviewer: math; frozen independent first round, 2026-10-29. Skills used: Newton analysis–synthesis and paired physics research. No other panel report was consulted. This is source and scope review, not independent verification of an external theorem.

## Release and proof availability

The October 26 OpenAI announcement reports advances in local smoothing, subexponential SAT/counting, and constructive quantum field theory. Its physics group explicitly deferred releasing its AI artifacts. It describes Yang–Mills existence as part of the Millennium problem; it does not announce a mass-gap proof. Consequently there is no public physics proof artifact from that announcement for this reviewer to check or transfer into the project. Public mathematics materials are available in openai/math, pinned here to commit 7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a (2026-10-26). [P1, P2]

The Clay formulation separately requires a nontrivial four-dimensional quantum Yang–Mills theory on Euclidean R4 for every compact simple gauge group, the requisite axioms, and a strictly positive spectral gap. Existence alone does not supply the gap. A proof confined to a finite lattice, or with constants allowed to deteriorate with the cutoff or volume, does not establish those continuum conclusions. [P3]

**Decision:** neither treat the withheld existence claim as a checked proof nor infer that it disproves the project's fixed-spacing results. A mathematical comparison needs the actual construction, assumptions, observables, uniform estimates, limiting argument, and accepted theorem statement.

## Public local-smoothing statement

The public document and manuscript state, for n ≥ 2, finite p ≥ 2 and ε > 0,
\[
 \|e^{-it|D|}f\|_{L^p(\mathbb R^n\times[1,2])}
 \le C_{n,p,\epsilon}
 \|(1-\Delta)^{(s_+(p)+\epsilon)/2}f\|_{L^p(\mathbb R^n)},
 \qquad
 s_+(p)=\max\{0,(n-1)/2-n/p\},
\]
for Schwartz data; the p = 2 case permits ε = 0. Do not remove the positive loss at other exponents. At the critical exponent p_c = 2n/(n−1), the manuscript states a frequency-localized bound with a factor (log(2+N))^(2/p_c), not a uniform constant. [P4, P5]

The introduction describes a quaternionic Hessian/Monge–Ampère auxiliary potential and a corrected energy with boundary flux in the proof. These are mathematical devices in an analysis of the Euclidean half-wave propagator. Their names do not create a physical energy source or new material field. The proof's preservation of interference before squaring is a useful modeling discipline, already standard in wave mechanics. [P5]

The repository maps six comparator targets to a solution module that delegates to the internal mathematical development. The challenge/reference file intentionally contains target placeholders; those are not the submitted proof. I inspected the solution wrapper, mapping and comparator configuration, but did not audit every dependency, build Lean, or independently check the claimed proof. [P6]

**Extension hypotheses required for this project:** replace the Euclidean translation-invariant propagator with a spherical, dispersive, dissipative boundary-value operator; specify its domain and conductivity profile; establish the appropriate functional calculus and estimates; control the forcing and observation operators. The released Euclidean estimate does not supply those bridges. Nor does it imply Yang–Mills construction, a mass gap, copper location-dependent intrinsic frequency, or net energy production.

## Public ETH/counting statement

For fixed k ≥ 2, the manuscript states an exact k-CNF counting algorithm with polynomial space and bit time
\[
 (n+m)^{O_k(1)}
 2^{O_k(n\log\log n/\sqrt{\log n})}.
\]
Its sparse-input consequence improves the exponent. The formalization documentation explicitly states a weaker general bound,
\[
 (L+1)^{O_k(1)}
 2^{O_k(n(\log\log n)^2/\sqrt{\log n})},
\]
where L is encoded input length. Both are asymptotically subexponential in the variable parameter under the stated fixed-k regime; their distinct exponents must remain visible. [P7, P8]

The formalization defines a concrete machine/counting target with polynomial space and uses an explicit solution module, rather than treating the target's reference placeholder as a proof. I read the principal theorem statement and its delegation to supporting lemmas, not the entire machine construction or proof dependency graph. No Lean run was performed. [P9]

**Practical scope:** this is not a polynomial-time claim, an implemented speed benchmark, or a numerical solver for arbitrary PDEs. Any use here first needs a faithful finite encoding, a reduction with controlled size, fixed k, and measured constants. A small brute-force inverse-model search can be useful without depending on this claimed asymptotic breakthrough.

## Admission and next evidence

- Admit the exact public mathematical statements as **source claims with available artifacts**, keeping manuscript and formalized bounds distinct.
- Keep the new physics claims at **announced; artifacts withheld; locally unverified**.
- Use source/readout identifiability and energy accounting as immediate tractable research targets. They do not require accepting any new external theorem.
- Do not change the project's existing novelty or proof status during this independent source round. The comparison panel follows the freeze.

Source keys, pinned paths, reading depth and verification limits are in sources.json.


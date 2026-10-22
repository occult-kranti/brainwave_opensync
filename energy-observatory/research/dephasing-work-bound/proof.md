# E1: work accessibility lost under fixed-population qubit dephasing

## Scope and quantified statement

For every energy gap ε>0 (Joules), population p∈[0,1], complex coherence c with |c|²≤p(1−p), and d∈[0,1], set H=diag(0,ε), ρ=[[1−p,c],[c*,p]], and ρ_d=[[1−p,dc],[dc*,p]]. The permitted controls are all 2×2 unitaries, with the Hamiltonian restored to H at the endpoints. This is ideal cyclic-unitary work accessibility (ergotropy), without an apparatus, damping, bath, feedback, or complete preparation cycle.

The dephasing map preserves mean energy exactly: Tr(Hρ_d)=εp for every d. The loss below concerns extractable work, not a change of mean qubit energy.

Write r=|c|, z=1−2p, and R_d=√(z²+4d²r²). Then

**E1.1 (operational value).** W(d)=ε(R_d−z)/2.

**E1.2 (loss bound).** 0≤L:=W(1)−W(d)≤εr(1−d).

The lower equality holds **if and only if** r=0 or d=1. The upper equality holds **if and only if** r=0, d=1, or p=1/2. Thus the constant 1 is sharp: any p=1/2, r∈(0,1/2], d∈[0,1) attains a strictly positive upper bound. These are elementary consequences of the stipulated finite-dimensional model, not a novelty claim.

## Attribution and relation to established results

The operational work functional, passive spectral ordering, and attaining unitary are established ergotropy theory: Allahverdyan, Balian and Nieuwenhuizen, [*Maximal work extraction from quantum systems*](https://arxiv.org/pdf/cond-mat/0401574v1), pp. 1–2, Eq. (2) and Eqs. (5)–(9). The derivation below specializes that result to the declared qubit.

Francica et al., [*Quantum Coherence and Ergotropy*](https://arxiv.org/pdf/2006.05424v2), Sec. III, Eqs. (4)–(5), identify coherent ergotropy as total minus fully dephased ergotropy. Thus W(1)−W(0)=ε(R_1−|z|)/2 is that known quantity. Their Sec. V.A, Eq. (12), gives the same qubit coherent component: 2 Tr(ρ²)−1=R_1² and the squared l₁ coherence is 4r². Eq. (12) concerns this component, not verbatim total W(d). For fixed populations, subtracting coherent components before and after partial dephasing also yields L.

The partial-d inequality, complete equality classification, and stable implementation are local corollary/proof/assurance work here. The cited sections do not supply these conclusions verbatim, and novelty remains unverified. Capacity results for other channel functionals are not invoked.

## Spectrum, optimality, and an attaining unitary

The state has eigenvalues λ±=(1±R_d)/2. Positivity follows from the stated determinant constraint, and 0≤R_d≤1. For any unitary U, the final energy equals ε⟨1|Uρ_dU†|1⟩≥ελ− by the minimum eigenvalue bound. Choose normalized eigenvectors v± and let U=|0⟩⟨v+|+|1⟩⟨v−|. This maps the larger eigenvalue to the ground state, attains ελ−, and proves E1.1 because the initial energy is εp.

For an explicit choice, when dr>0 let c=re^{iφ}, a=√[(R_d+z)/(2R_d)] and b=√[(R_d−z)/(2R_d)]. Then v+=(a,e^{−iφ}b)ᵀ, v−=(−e^{iφ}b,a)ᵀ, and

U = [[a,e^{iφ}b],[−e^{−iφ}b,a]].

Direct multiplication gives Uρ_dU†=diag(λ+,λ−). When dr=0 and z≥0, U=I suffices; when dr=0 and z<0, the swap U=[[0,1],[1,0]] suffices. If R_d=0, ρ_d=I/2 and every unitary attains the same zero work. This also treats d=0 and r=0 without an undefined phase or denominator. For R_d>0 the full attaining set consists of maps taking its two eigenvectors to their assigned energy eigenvectors, with arbitrary phases.

## Complete proof of both inequalities and equality cases

Because R_1²−R_d²=4r²(1−d²)≥0 and both radii are nonnegative, R_1≥R_d. Equality occurs exactly when r=0 or d=1. Multiplication by ε/2 proves the lower statement and its necessary and sufficient condition.

For the upper statement apply the Euclidean triangle inequality to

(z,2r)=(z,2dr)+(0,2r(1−d)).

This gives R_1≤R_d+2r(1−d). If r=0 or d=1 the second summand vanishes, giving equality. Otherwise its second component is strictly positive. Equality in the triangle inequality then requires the first vector to be a nonnegative multiple of this vertical vector (including the zero vector), which is equivalent to z=0: its second component is already nonnegative. Conversely z=0 makes R_d=2dr and gives equality. Thus p=1/2 supplies precisely the remaining equality cases, including d=0.

At p=0 or p=1, positivity forces r=0; W(d)=0 or ε respectively, and both loss equalities hold. At p=1/2,r=0 both radii vanish and W=L=0. At d=1 the channel is the identity; at d=0 the post-channel work is ε max(0,2p−1). These endpoints exhaust the possible zero denominators.

## Stable numerical evaluation and implementation contract

Directly subtracting R_1−R_d loses precision when the loss is small. For r>0,d<1, rationalization instead gives

L/ε = r(1−d) q,
q = (2r/R_1) (1+d)/(1+R_d/R_1),  0<q≤1.

No coherence is squared in this computation, and R_1>0 in the active branch. The zero branch covers r=0 or d=1. The implementation clips q at 1 solely to remove a possible upward rounding error in an analytically bounded ratio; this is not an independent inequality test. Numerical verification must compute its own residuals.

For z>0, use W(d)/ε=(rd)[(2r/R_d)d/(1+z/R_d)] to avoid cancellation; for z=0 use rd; for z<0 use (R_d−z)/2. The z>0,r d=0 branch gives zero before division. Products for Joules are regrouped starting with εr, since normalized underflow can coexist with a representable Joule answer for large ε. Conversely a tiny Joule result is flagged rather than interpreted as physical equality.

`src/dephasing-bound.mjs` exports `dephasingWorkBound`, alias `evaluateDephasingBound`, and `maxCoherenceMagnitude`. Inputs are `{population,coherenceMagnitude,dephasing,gapJ}`; coherence is the actual dimensionless magnitude |c|, not a normalized fraction. Finite ranges and a strictly positive finite Joule gap are checked. The PSD constraint is compared exactly on the supplied binary64 values using integer significands, without a hidden positivity tolerance. Consequently a decimal boundary pair rounded outside the state set is rejected; the helper returns the greatest representable admissible magnitude for a supplied population.

The function returns normalized and Joule work, loss, upper bound, equality predicates from the exact parameter conditions, and `representability` statuses (`exact-zero`, `normal`, `subnormal`, `underflow`). “Normal” describes range, not exactness or an error bound. Arithmetic remains binary64 with rounding; subnormal relative accuracy can be poor, and underflow is explicitly reported. Algebra is the all-parameter proof; executable examples are numerical evidence only.

## Exact input boundary and independent numerical comparison

The theorem quantifies over real admissible states. The calculator instead receives already-rounded binary64 numbers; exact positivity of those supplied numbers is its admission rule. For example, the real decimal pair p=0.2,r=0.4 is a pure-state boundary, but its two binary64 encodings have a strictly negative exact determinant. Rejecting that encoded pair does not refute the real theorem. `maxCoherenceMagnitude(0.2)` returns 0.39999999999999997, a nearby admitted state. This helper changes the state and is therefore an explicit UI choice; the evaluator never repairs an invalid state silently. An independently constructed complex matrix may likewise change magnitude slightly when its real/imaginary components are rounded.

The independent Round 1 verifier allowed a small positivity residual for its matrix grid, whereas the producer rejects every strictly negative determinant. Round 2 comparisons must either start with exactly admitted supplied values or record rejection. A rounded inadmissible boundary must not be counted as an implementation error or silently substituted. The verifier’s 400-digit examples correctly reconstruct binary64 inputs with `Decimal.from_float`; comparing short decimal text instead would compare different states.

Rationalized evaluation can return a positive loss even when separately rounded W(1) and W(d) coincide. Likewise a normalized result below binary64 range can coexist with a representable Joule answer after regrouping. Subtracting displayed work values, reading zero as an equality witness, or clipping oracle residuals would therefore be invalid checks. The independently computed matrix energy/rotation and high-precision values, with declared normalized or Joule units, are the relevant comparison evidence. Range statuses make no uniform relative-error or correctly-rounded guarantee.

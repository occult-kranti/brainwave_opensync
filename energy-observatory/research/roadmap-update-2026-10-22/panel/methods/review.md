# Methods roadmap review — 22 October 2026

**Recommend one primary problem: an exact certificate for the existing six-state two-coil/mechanical model.** This extends the project beyond its already-checked scalar oscillator and directly tests the mutual-inductance storage, reciprocal transducer signs and distinct source ports used by the current solver. Defer model reduction until somebody needs its output. A tiny Lean receipt is a conditional verification stage, not a promised proof of an OpenAI headline.

This is the requested REVIEW stage only. No candidate has been implemented or counted as passed. I reused the paired-physics and Newton analysis/synthesis instructions, read the consolidated report, and revisited the actual EM implementation and independent systems equations. The previous records remain unchanged.

## Primary candidate: six-state certificate

Use z=(q₁,q₂,x,i₁,i₂,v), input u=(Vₛ,F), output y=(i₁,v). The actual fixed-parameter circuit/mechanical model has storage

\[
H=\frac12\left(\frac{q_1^2}{C_1}+\frac{q_2^2}{C_2}+kx^2
+L_1i_1^2+2Mi_1i_2+L_2i_2^2+mv^2\right).
\]

Charge and displacement derivatives are i₁,i₂,v. The inductance matrix multiplies the two current derivatives, with right-hand side `(Vₛ−R₁i₁−q₁/C₁, −(R₂+R_L)i₂−q₂/C₂−gv)`. Mechanical momentum balance is `m v̇=g i₂−(b+b_L)v−kx+F`.

The finite target is a separately assembled exact rational A,B,C,Q and checked certificate

\[
Q=Q^T\succ0,\qquad QA+A^TQ=-2LDL^T,\quad D\succeq0,
\qquad QB=C^T.
\]

Freeze units, reference scales, state ordering and the finite rational instance before calculation. Positivity needs actual witnesses: an invertible rational storage factor with strictly positive diagonal weights, explicit dimensions and exact rank checks. The domain is C₁,C₂,L₁,L₂,m,k>0, L₁L₂−M²>0, and nonnegative dissipative coefficients. All parameters are fixed. A zero-loss case can pass an energy identity without yielding asymptotic stability or a positive spectral gap.

For a supplied valid instance the certificate checks the directional storage rate

\[
\dot H=V_si_1+Fv-R_1i_1^2-(R_2+R_L)i_2^2-(b+b_L)v^2.
\]

The mathematical statement and its connection to the ODE are separate review items. Instance checking must not be relabeled a proof for every admissible real parameter. The browser currently exposes voltage drive only; it binds to the **F=0 specialization**, while the earlier independent reference also contains a mechanical force port. RMS versus peak conventions must remain explicit when comparing steady-state results.

Useful wrong controls are a single reversed reciprocal sign, missing mutual-inductance energy, singular/indefinite inductance, negative loss, a rank-deficient storage factor, a perturbed Gram factor and omission of Fv when F is nonzero. Correct controls include nonzero M and g, the lossless limit and a fully transformed invertible state-coordinate change. Every mutation must be rejected for a named equality, sign, rank or boundary failure; a small floating-point residual is not the acceptance rule.

Why this is feasible: the six-state storage and independent three-by-three impedance formulation already exist. The previous exact checker supplies rational arithmetic experience, but the new certificate must be tied to this coupled model instead of copying its scalar identity. Six-state exact linear algebra needs ordinary CPU resources, not a neural solver or brute-force search. Estimate one to two focused implementation days plus a separately authored review. Deliver the contract, model matrices, factor witnesses, mutation results, hashes and precise solver binding.

This is new project coverage of known passive-network mathematics. It establishes neither missing apparatus ports nor measurement calibration, switching work, unmodeled modes, thermal drift or a source of energy.

## Conditional proof-checker stage

The corpus lane should own the typed statement/evidence record; methods should consume it rather than create a second competing metadata framework. After the exact finite certificate is accepted, a very small pinned Lean project could check its selected matrix equalities and quadratic-form statement. The encoded claim, trusted axioms, toolchain, dependency revisions, complete build command and build log would be required. A theorem about a finite matrix must not inherit a family-level theorem badge.

Neither `lean` nor `lake` was found on PATH during this review. Bootstrap feasibility is therefore an unresolved dependency, not completed work. Keep it a bounded optional gate and retain the independent rational receipt if the build environment is unavailable. No Lean claim should appear without an executed kernel check. No solver, exact-arithmetic receipt, kernel proof or hardware experiment should be presented as interchangeable evidence.

The [ICML benchmark-audit paper](https://proceedings.mlr.press/v306/ammanamanchi26a.html) motivates reviewing the exact statement separately from acceptance. The [NSPI paper](https://proceedings.mlr.press/v306/zuo26f.html) motivates exact certificate checking after proposal. Reading depth is limited to the previously inspected sections: benchmark-audit PDF pp.2–4; NSPI pp.2–4 including the visually checked factor-order issue. No benchmark, NSPI model or library-wide proof build was reproduced. This review adds no broad literature search or novelty claim.

## Deferred candidate: reduction with preserved energy accounting

If a concrete consumer needs a smaller coupled model, admit a rational full-rank V∈Q⁶ˣ⁴ and define

\[
Q_r=V^TQV,\quad A_r=Q_r^{-1}V^TQAV,\quad
B_r=Q_r^{-1}V^TQB,\quad C_r=CV.
\]

Exact checks should establish `Q_r A_r+A_rᵀQ_r=−2VᵀGV` and `Q_r B_r=C_rᵀ`, with G=LDLᵀ, before accepting the reduction. Full rank and positive storage are required before inversion. A useful negative fixture is Q=diag(1,4), A=[[0,4],[-1,0]], V=(1,1)ᵀ: naive Euclidean projection produces A_r=3/2 and energy growth, whereas the energy-metric projection gives zero. This is an elementary analytic planning discriminator, not an executed test or new discovery.

The deliverable would retain a ledger of discarded states and observations. Passivity preservation does not prove response accuracy, identifiability or spectral completeness. A selected-frequency error table would remain sampled unless an independent uniform error bound were established. Defer this approximately one-day extension until the advisor names its consumer and the full-order certificate has passed.

`candidates.json` contains exact premises, dependencies, controls, deliverables, reading depth and stop rules. The next action is the advisor’s first planning decision; no implementation or additional agent work has started.

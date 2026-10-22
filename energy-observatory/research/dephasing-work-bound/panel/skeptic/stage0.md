# Skeptic Stage 0 — frozen before producer exchange

Date: 2026-10-22. Reading scope: the E1 target in `research/roadmap-update-2026-10-22/advisor.md`, `src/quantum.mjs`, and the paired-physics-research skill. No producer report or new calculation has been read. This is an independent skeptical admission contract, not an acceptance verdict.

## Target and falsification criteria

Fix a finite positive gap ε, Hamiltonian H = diag(0, ε), and physical state ρ = [[1−p,c],[c*,p]], with p∈[0,1], |c|²≤p(1−p). Dephasing multiplies c by retained fraction d∈[0,1] at unchanged p and H. W(d) must mean maximum extractable work over arbitrary cyclic qubit unitaries, not mean energy, coherence alone, restricted-control work, or apparatus efficiency.

Admission requires an all-parameter argument for 0≤W(1)−W(d)≤ε|c|(1−d), including a derivation or explicit justified theorem application connecting W to passive-state energy. An inequality for a guessed expression for W alone is insufficient. Any division by a Bloch length, |c|, 1−d, or spectral difference requires separate treatment of its zero case. Any admissible counterexample, omitted equality family, phase-dependent work prediction, or changed population invalidates an unrestricted claim.

Equality claims must be necessary and sufficient under the stated positive-gap domain, and must distinguish the lower bound from the upper bound. Sharpness needs a nontrivial saturating physical family; checking d=1 alone cannot establish the best constant. A derivative-only proof cannot skip its nondifferentiable endpoint.

## Frozen boundary cases and controls

Check p=0,1; c=0; d=0,1; p=1/2 with d=0; maximally mixed state; pure coherent states; mixed coherent states; population below and above one half; complex phases; and approach to degeneracy from both sides. Include near-zero coherence and near-endpoint d without replacing the theorem domain with a numerical cutoff. Frequency/energy conversion must retain ε>0 and consistent units.

An independent unitary construction must actually minimize final energy or exhibit the passive arrangement. Generic sampled rotations only supply upper estimates of the minimum, never a proof of exhaustive optimization. At least one wrong-model control must fail for the intended scientific reason, rather than through input rejection or an unrelated provenance guard.

## Numerical versus mathematical scope

Numerical evidence may test implementation, unitary reconstruction, equality cases and discriminating controls. It cannot prove completeness, sharpness for all inputs, or unrestricted optimality. Tolerances must distinguish dimensionless arithmetic residuals from Joules; tiny physical gaps cannot make a wrong result appear correct under an absolute tolerance. Record conditioning and cancellation risks near the maximally mixed state. The existing determinant clamp must not be promoted to evidence of density-matrix positivity.

## Interpretation risks

The application input `coherence` is κ, whereas the theorem c is the actual off-diagonal entry. With damping enabled, the correct fixed-p comparison uses the post-damping population and coherence; comparing initial to damped/dephased work confounds two channels. A zero phase implementation supports complex-phase claims only with a mathematical invariance argument or an independent complex-state check. The result is a known-theory application with project assurance; no novel physics, thermodynamic cycle closure, measured control efficiency, or hardware performance follows.

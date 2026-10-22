# Round 2 — Cross-critique and bounded modal implementation

Seat 2; AI-agent research/review, no human or historical-scientist participation. Round 2 was selected after all Round 1 reports and the advisor decision. No Round 3 review has been precomputed.

## Objection, response and revision

Read inverse/round1.md, measurement/round1.md and copper-experiment/research/panel/round1-advisor.md before implementation. I accept the inverse seat's objection that an instantaneous sensor-count or rank(C) argument cannot establish temporal observability, excitation reachability, finite-noise conditioning or global position uniqueness. The mirror-position alias and position-times-stiffness ambiguity remain exact failures of unique localization in the earlier models. Adding this modal module does not repair those inverse maps.

My Round 1 ratio proposal was too easy to overread as an attribution test. Revised statement: free radial ratios remove the common E/rho/R frequency scale at fixed Poisson ratio and matched mode identity; they are only conditional forward diagnostics. They do not separately recover E, rho or R, identify position, or uniquely distinguish contact from changing Poisson ratio, anisotropy or wrong mode identity. A fixed contact stiffness does not transform with a rescaled specimen automatically, so invariance of the free ratios is not claimed for arbitrarily loaded ratios. Shared-denominator ratio uncertainties are correlated. Ratios of tallest spectral bins are not matched-mode ratios.

I accept the measurement seat's separation of undamped natural frequencies, complex poles, damped oscillation, derivative-channel maxima and FFT maxima. This module returns only undamped eigenfrequencies of a conservative projected M,K system; it does not fit poles, simulate recorder data, estimate uncertainty or turn N/m stiffness into N preload. Stationary H1 and transient analysis remain separate work.

The root accepted these revisions and the bounded finite-model implementation. Exact API and input-domain messages were sent to root and software seat before implementation was complete.

## Implemented files and outcome

Owned implementation files under copper-experiment:

- src/modal-diagnostics.mjs
- tests/modal-diagnostics.test.mjs
- research/modal-diagnostics.md

No other app files were edited by this seat. The module imports the copied src/models.mjs. A byte comparison confirms it remains identical to Location's pinned core (SHA-256 2371578a26dba7cdb580940c8cd64b7fa361a3ec2ee2d52581a6fa8fba2445fe).

Exports are solidRadialModes(params), groundedPointSpringDiagnostics(params), and MODAL_DIAGNOSTIC_DOMAIN. Inputs use strict SI keys radiusM, youngPa, poisson, densityKgM3, and contactNpm for the contact function. The finite material bounds match Position's prior bounded calculator domain in SI. Contact is nonnegative, capped at 1e12 N/m and at k/(m1 omega1²)<=100. These are declared numerical bounds, not calibrated physical ranges. Unknown unit keys and requested mode counts are rejected. Defaults match Location's core radius 0.04445 m; the documented comparison fixture explicitly uses radius 0.0125 m.

Three surface-displacement-normalized modal masses are preserved in original M. The single point spring has energy k(sum q_n)²/2 and adds k*ones(3,3), including all cross terms. Positive free masses and stiffnesses plus nonnegative k establish positive conservative energy. A scaled symmetric 3x3 Jacobi eigensolver is bounded to 64 rotations. It returns original mass-coordinate eigenvectors and checks both symmetric and generalized eigenproblem residuals, Euclidean orthogonality and positive eigenvalues. It rejects unresolved output. The legacy three-diagonal-spring whole-mass toy is returned separately with an explicit illustrative label.

## Executed validation

Command: node --test tests/modal-diagnostics.test.mjs

Result: **8/8 pass**, 0 failures. Cases include independent direct-traction/quadrature fixtures, free scale cancellation and changed-Poisson counterexample, every point-spring cross term, the spring-energy kernel versus a wrong diagonal model, independent SciPy generalized-eigenvalue fixtures at k=1e8 and 1e10, trace/determinant update identities, rank-one spectral interlacing, original M-orthogonality, zero contact, legacy distinction, domain edges and invalid/wrong-unit/resource controls.

For radius 0.0125 m copper reference inputs, the point-spring first-mode shift at k=1e8 is 91.894643 Hz. The explicitly different legacy toy gives 103.705322 Hz. Coupled frequencies match independently computed SciPy eigh values at weak and stronger contact. These values are synthetic model comparisons, not copper measurements or detection limits.

Source hashes at handoff:

- src/modal-diagnostics.mjs: 8be4f095c62d19e4742844efc0965c6cf7726b21587c3d2ab0811a2d10daf510
- tests/modal-diagnostics.test.mjs: a886f4bc52697ab019a0ca4ae4661f9df1deae8c64a5bd8a97bbbf45eb67200c
- research/modal-diagnostics.md: e1cf6381b947ca91b3d8eab8a9386a6eebe83360846777dddd09ffb53c13ac66

## Self-critique and next admission premise

The implementation is a three-coordinate projection, not a convergence study of a complete sphere. A real point support also couples rigid/nonradial motion; finite area, prestress, seam, air, texture, damping and fixture dynamics are omitted. No real contact law or material specimen has been fitted. Sorted coupled frequencies are spectral order, not experimental mode identities. Residual checks are binary64 numerical backward checks, not interval enclosures; a sub-ulp contact shift can round to zero. No physical attribution follows from positive energy or low numerical residuals.

The SciPy reconstruction used a different stress/root/mass/eigenvalue formulation but was performed by this same seat. Its source independence is numerical/formulation independence, not independent human or experimental replication. The eight tests are implementation evidence only. Round 3 must independently inspect and challenge the actual module, including cross-term, original-mass and scaling claims. UI integration, broader app gates and publication are owned elsewhere and have not been asserted complete here. No new physical theory or scientific novelty is claimed.

Round 2 complete; awaiting the advisor's Round 3 assignment.

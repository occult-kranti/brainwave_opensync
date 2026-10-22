# Three radial modes and one projected point spring

Round 2 implementation, 22 October 2026. This is an original project integration of established elastic-mode and finite-matrix methods, not a new physical theory or a scientific-novelty claim. All outputs are synthetic model calculations. No physical sphere, support or fixture has been calibrated.

## Model and coordinates

`src/modal-diagnostics.mjs` imports the copied Location model's `solidBreathing` API. It computes the first three positive radial `l=0` modes of a homogeneous isotropic traction-free **solid** sphere. These are not the three lowest modes of the full sphere. The solid model is distinct from the thin-shell model elsewhere in this workspace.

The radial displacement field is

\[
u_r(r,t)=\sum_{n=1}^3 q_n(t)\frac{j_1(x_n r/R)}{j_1(x_n)},\qquad
m_n=4\pi\rho\int_0^R\left[\frac{j_1(x_n r/R)}{j_1(x_n)}\right]^2r^2\,dr.
\]

Each `q_n` is a surface radial displacement in metres. Its generalized mass `m_n` is returned by the copied solver; it must not be replaced by whole-sphere mass without changing the coordinate model. Orthogonality of the free modes gives

\[
M=\operatorname{diag}(m_n),\qquad K_0=\operatorname{diag}(m_n\omega_n^2).
\]

A single point on the surface has radial displacement `q_1+q_2+q_3` in this radial-only projection. Attach **one grounded linear point spring** of prescribed stiffness `k >= 0` there:

\[
V_c=\tfrac12 k(q_1+q_2+q_3)^2,\qquad
\Delta K=k\mathbf 1\mathbf 1^T,\qquad K=K_0+\Delta K.
\]

Every entry of `Delta K`, including every off-diagonal entry, is `k`. The vector `(1,-1,0)` is in the contact contribution's kernel; three independent springs would instead give it positive contact energy. That distinction is tested. The full energy is

\[
T=\tfrac12\dot q^T M\dot q,\qquad
V=\tfrac12\sum_n m_n\omega_n^2q_n^2+\tfrac12 k(\sum_nq_n)^2.
\]

Positive modal masses and free stiffnesses plus nonnegative `k` give a positive conservative energy. There is no damping or actuator in this calculation; this passivity statement is not a claim about whole-apparatus electrical efficiency. A dynamic fixture would add coordinates and use its actual participation in the contact vector. Rigid translation/rotation and nonradial elastic motion are omitted here even though a real point contact can excite them.

## API and units

```js
import {
  solidRadialModes, groundedPointSpringDiagnostics, MODAL_DIAGNOSTIC_DOMAIN,
} from './src/modal-diagnostics.mjs';

const specimen = {
  radiusM: .0125, youngPa: 123.5e9, poisson: .35, densityKgM3: 8960,
};
const free = solidRadialModes(specimen);
const contact = groundedPointSpringDiagnostics({ ...specimen, contactNpm: 1e8 });
```

Both functions are synchronous and always retain exactly three modes. Unknown keys are rejected, so `radiusMm`, `E_GPa`, a requested mode count or a position coefficient cannot silently select an unintended model. Defaults match the copied Location core: radius 0.04445 m and its copper reference constants. The example above deliberately uses Position's original 0.0125 m radius for comparison.

| Input | Declared numerical domain | Meaning |
|---|---|---|
| `radiusM` | 0.00001 to 1 | Solid sphere radius, m |
| `youngPa` | 1e6 to 1e12 | Effective isotropic Young modulus, Pa |
| `poisson` | -0.9 to 0.49 | Effective Poisson ratio |
| `densityKgM3` | 1 to 30000 | Density, kg/m³ |
| `contactNpm` | 0 to 1e12, also `k/(m_1 omega_1²) <= 100` | Grounded spring stiffness, N/m; not preload N |

These are numerical demonstration bounds, not a validated physical applicability domain or a contact design recommendation. Nonfinite, wrong-type and out-of-domain values are rejected. No root-count or solver-iteration input can create unbounded CPU work.

`solidRadialModes` returns `parameters`, three-element `frequencyHz`, `roots`, `modalMassKg`, `ratiosToFirst`, full copied `modes`, total `massKg`, and coordinate/limit metadata. `frequencyHz` is undamped natural cyclic frequency in Hz.

`groundedPointSpringDiagnostics` returns the `free` result, original `massMatrixKg`, `freeStiffnessNpm`, `contactStiffnessNpm`, `stiffnessNpm`, `massNormalizedStiffnessPerS2`, and `eigenvaluePerS2`. It also returns sorted `coupledFrequencyHz`, `frequencyShiftHz`, `fractionalShift`, `coupledRatiosToFirst`, and `ratioChange` (loaded ratio minus free ratio). Sorting is spectral order, not proof that an experimentally observed peak has retained mode identity.

`massNormalizedEigenvectors` and `physicalCoordinateEigenvectors` are arrays of **column vectors**. The former have Euclidean unit norm; the latter are `u=M^(-1/2)v` and satisfy `u_i^T M u_j=delta_ij`. The original mass coordinate is retained rather than implicitly assigned a unit or whole-sphere mass.

The returned `legacyIndependentSpring` is explicitly a **different illustrative toy**: three separate diagonal springs each using total sphere mass, as in the original Position demonstration. It is provided only for comparison. Its shifts must not be described as the one-point contact prediction.

## Ratios are conditional diagnostics

For the free isotropic radial model,

\[
f_n=\frac{x_n(\nu)}{2\pi R}\sqrt{\frac{E(1-\nu)}{\rho(1+\nu)(1-2\nu)}},\qquad
\frac{f_n}{f_1}=\frac{x_n(\nu)}{x_1(\nu)}.
\]

At fixed Poisson ratio, changing `E`, `rho` or `R` changes a common scale and leaves the **free** ratios unchanged. Fixed-Poisson, mass-conserving uniform thermal scaling and one truly common multiplicative clock error cancel for the same reason. A fixed grounded stiffness does not scale with the specimen automatically; these cancellation statements do not apply to loaded ratios while arbitrarily holding `k` fixed.

There are only two nontrivial ratios among three frequencies; the first returned ratio is one. Ratios sharing a denominator have correlated uncertainty. Different clocks, changing timebase drift, incorrect mode identity and state-dependent biases do not necessarily cancel. Ratios must be calculated from valid matched natural-frequency estimates, not whichever FFT or FRF peak is tallest. This module fits no poles and accepts no measured spectra.

A changed ratio can arise from contact, changing Poisson ratio, anisotropy, imperfect geometry or mode misassignment. Neither unchanged nor changed ratios uniquely identify an absolute position or a physical cause. The companion inverse-design work must separately assess temporal observability, drive reachability, finite-time noise conditioning, nuisance estimability and global aliases. An instantaneous sensor-count/rank argument cannot substitute for those gates.

## Bounded numerical solver and checks

The generalized eigenproblem `K u = lambda M u` is transformed to the symmetric matrix `A=M^(-1/2) K M^(-1/2)`. A scaled largest-off-diagonal Jacobi solver uses at most **64 rotations**, and rejects nonconvergence, nonpositive/nonfinite eigenvalues or failed residual/orthogonality checks. Scaling prevents needlessly large intermediate matrix entries. The relative-contact bound avoids an extreme rank-one update erasing the free stiffness numerically.

The returned `eigensolver` record includes the iteration count, orthogonality error, and

\[
\max_j\frac{\lVert A v_j-\lambda_jv_j\rVert_2}{\lVert A\rVert_F+|\lambda_j|},\qquad
\max_j\frac{\lVert K u_j-\lambda_j M u_j\rVert_2}{\lVert K\rVert_F\lVert u_j\rVert_2+|\lambda_j|\lVert M u_j\rVert_2}.
\]

The acceptance threshold is `2e-12` for these dimensionless residuals and orthogonality. These are numerical backward checks, not rigorous interval enclosures or physical-model accuracy bounds. Binary64 can round a sufficiently tiny positive spring shift to zero; a zero displayed change does not prove exact equality or an experimental detection limit.

Run the focused gate from this directory:

```sh
node --test tests/modal-diagnostics.test.mjs
```

The eight tests check independent direct-traction/quadrature mode fixtures; common-scale invariance and a changed-Poisson counterexample; all contact cross-terms and an independent-spring wrong-model energy control; independent SciPy generalized eigenvalues; matrix determinant/trace identities and rank-one eigenvalue interlacing; original mass-coordinate orthogonality; zero contact and legacy separation; domain edges and rejection controls.

For the example specimen above, independent direct-traction root solving and volume quadrature give free frequencies `166551.050481, 367096.793727, 558432.058016 Hz` and modal masses `0.082702449660, 0.104345875959, 0.107531517140 kg`. SciPy `eigh(K0 + k*ones((3,3)), diag(m))` independently gives:

| k / N/m | First / Hz | Second / Hz | Third / Hz |
|---:|---:|---:|---:|
| 1e8 | 166642.945123 | 367129.861224 | 558453.154122 |
| 1e10 | 175236.816154 | 370436.591777 | 560589.361740 |

At `k=1e8`, first-mode shift is 91.894643 Hz in the projected point-spring model, versus 103.705322 Hz in the legacy whole-mass diagonal toy. This difference is a model comparison, not observed copper behavior. Eight targeted Node tests passed on implementation; independent review of the actual source remains a separate Round 3 gate.

## Sources and review scope

The copied `models.mjs` and its archived model specification retain the original traction equation, mass derivation and provenance. [Saviot and Murray, Section II, equations 1–4 and the l=0 condition](https://arxiv.org/html/cond-mat/0506353v3) supplies primary free-sphere family/boundary and mass-inner-product context. It does not validate the present contact model or ratios as an attribution method. The rank-one spring update follows directly from the declared quadratic potential, and the scaling cancellation follows from the displayed equation. No novelty search or physical experiment establishes new theory here.

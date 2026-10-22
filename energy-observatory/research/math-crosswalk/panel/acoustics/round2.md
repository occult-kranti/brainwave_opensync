# Acoustics specialist — round 2

The admitted test confirms a specific obstruction: **frequency-only data cannot separate common stiffness/density scaling**, while a calibrated static boundary observation distinguishes the scaled candidates. This sharpens the measurement plan; it does not solve OpenAI family 372 or refute its uniqueness claim.

The contract was written and hashed before implementation and computation: `round2-contract.json`, SHA-256 `1dcd784898d0cff9a4585d1bcf60eba773ce61c0f5959f66c23e63a0f1d0276f`. It follows the advisor's second-round admission. No production model was edited.

## Analytic statement and its domain

For a linear elastic free-vibration problem on fixed geometry,

\[
Kq=\omega^2Mq,
\qquad (K,M)\mapsto(aK,aM),\quad a>0,
\]

the eigenvalues are unchanged. The same algebra applies to continuum linear-elastic operators when all elastic moduli and density are multiplied by the same constant and the homogeneous boundary conditions remain unchanged. The computation below checks selected radial sphere modes and a finite fixture; it does not numerically enumerate the continuum spectrum.

For the production sphere at fixed radius and Poisson ratio,

\[
f_j=\frac{x_j(\nu)}{2\pi R}
\sqrt{\frac{E(1-\nu)}{\rho(1+\nu)(1-2\nu)}}.
\]

In log parameters \(z=(\log E,\log\rho)\), each frequency row has derivative \((1/2,-1/2)\). Any number of such frequencies retains the kernel \(\operatorname{span}\{(1,1)\}\). Known-radius mass supplies derivative \((0,1)\); nonzero calibrated static traction under the fixed boundary input below supplies \((1,0)\). Either breaks this particular two-parameter degeneracy. Static traction alone has no density sensitivity.

The static distinguishing input is the affine displacement \(u(x)=Sx\), with symmetric, dimensionless strain \(S\). Constant stress has zero divergence, and on outward unit normal \(n\),

\[
t(n)=[\lambda\operatorname{tr}(S)I+2\mu S]n.
\]

Scaling \(E\) by \(a\) at fixed \(\nu\) scales both Lamé moduli and this traction by \(a\). More generally, multiplying both moduli by a constant leaves the static Dirichlet solution unchanged and multiplies the complete displacement-to-traction map by that constant: \(\Lambda_a=a\Lambda\). Thus the required equality of boundary maps in family 372 is absent even when resonance frequencies agree. One differing calibrated boundary response suffices to show two maps differ; this test does not measure or reconstruct a complete map.

Here traction means resolved surface stress or force on a known patch. The net force integrated over the whole closed sphere for uniform hydrostatic loading is zero and is not the proposed observable.

## Computation and controls

`production-probe.mjs` imports the existing `solidBreathing`, `coupledSystem` and `responseAt` functions. `verify_scaling.py` independently computes radial roots using SciPy spherical Bessel functions, separate dense bracketing and Brent's method; it also uses a generalized symmetric eigensolver and direct complex matrix solve for the finite fixture. It uses the producer's actual material-parameter inputs, rather than a replacement sphere formula presented as production integration.

The predeclared held-out cases use scale factors 0.37, 1.73 and 3.1; Poisson ratios 0.11 and 0.417; radii 0.023 and 0.061 m; radial root indices 4 and 7. Held-out log directions include (1,1), (1,-1), (2,-3) and (-1,4), and the static check uses separate normals and a shear-containing strain tensor. “Held out” means excluded from the development grid; there is no fitting or tuning here.

| Check | Result |
| --- | --- |
| Production sphere versus independent Bessel roots/frequencies | 144 case triples, including 24 held-out triples; maximum relative frequency discrepancy 2.71×10⁻¹⁵ and absolute root discrepancy 3.38×10⁻¹⁴ |
| Common E/rho scaling | Maximum relative frequency change 2.30×10⁻¹⁶; total and modal mass scale as predicted |
| Fixed-density positive control | E-only scaling changes frequency by sqrt(a); maximum relative discrepancy 3.45×10⁻¹⁶ |
| Log sensitivities and held-out directions | Rank 1, nullity 1, kernel (1,1); maximum directional-derivative error 5.10×10⁻¹¹ |
| Frequency plus known-radius mass or calibrated traction | Rank 2 for the declared two-parameter model; static alone remains rank 1 |
| Affine static traction | 72 cases; maximum relative discrepancy 2.18×10⁻¹⁶ |
| Separately labeled two-mode fixture | Eight scales, four response frequencies; independent eigensolver/FRF and common-scale checks agree within 7.39×10⁻¹⁶ relative error |
| Wrong-inference controls | All four rejected using explicit evaluated counterexamples |

There were 604 production sphere calls including controls and central differences. All eight final gates passed. These numerical tolerances check implementation agreement; they are not bounds on laboratory uncertainty.

A concrete witness uses \(E=123.5\) GPa, \(\rho=8960\) kg/m³, \(\nu=0.34\), and \(R=0.04445\) m. Doubling both \(E\) and \(\rho\) leaves the first computed radial frequency at **45,495.33482365279 Hz**. For \(S=10^{-6}I\), the local traction magnitude changes from **385,937.5 Pa** to **771,875 Pa**. The two candidates therefore defeat “equal frequencies imply equal stiffness/density” and “equal frequencies imply equal static response.” Changing density alone preserves the static response, rejecting density identification from static data alone.

The finite fixture additionally verifies that scaling all \(M,C,K\) by \(a\) divides calibrated displacement/force response by \(a\). A sensor gain also multiplied by \(a\) hides that change. The recorded unknown-gain control evaluates this cancellation; raw amplitude is insufficient without force/readout calibration. This fixture scaling changes all its modeled elements, not just the sphere.

These scaled materials are hypothetical parameter candidates. They are not a claim that a copper sphere doubles its density when translated. If density is independently known—as it often can be from composition or calibrated mass and volume—this specific ambiguity is removed. A radial frequency then fixes E within the homogeneous fixed-radius/fixed-Poisson model. It still does not prove general inverse uniqueness for unknown geometry, anisotropy, spatially varying coefficients, supports, or hidden modes.

## ICASSP source algebra recheck

The inspected version is [arXiv:2602.03398v1](https://arxiv.org/pdf/2602.03398v1), PDF p.2, equations (4)–(7). Rechecking sections 2.1 and 3.1–3.2 found no modal redefinition of x: it remains the plane-wave coefficient vector. With the declared \(H=U\Sigma V^*\), projected noiseless data obey

\[
U_K^*y=\Sigma_K V_K^*x,
\]

whereas the printed equation pairs \(U_K^*y\) with \(\Sigma_K^{-1}V_K^*x\). Consistent whitening would instead give \(\Sigma_K^{-1}U_K^*y=V_K^*x\). Retaining the printed dictionary could pair it with \(\Sigma_K^{-2}U_K^*y\), but that is not the displayed data definition. An undeclared rescaling of x would change its stated meaning and sparsity penalty.

The exact scalar case \(H=2,x=1,y=2\) gives printed left side 2 and right side 1/2. The methods specialist independently read the primary text and visually checked the PDF, confirming this narrow inconsistency. This is a gate on copying the displayed **preprint** equations, not a verdict on the conference paper as a whole, the authors' software, or empirical claims. No new SVD implementation was required.

## Reproduction and final limits

Run `python energy-observatory/research/math-crosswalk/panel/acoustics/verify_scaling.py` from the repository, or invoke that script by absolute path. Results, environment versions and exact producer/checker/contract/source digests are in `round2-results.json` and `round2-hashes.json`. The final run exited 0. An intermediate strengthened-control run hit a NumPy-boolean JSON serialization error; it was corrected before the final artifacts were generated. No physical check failed, and the frozen contract was unchanged.

The result is an elementary identifiability demonstration and implementation check, not a novel general theorem, complete object spectrum, experimental measurement, free-energy result, or Yang–Mills solution. The practical update is to specify the data operator and calibration first, and report parameter kernels before interpreting resonance changes. This completes the admitted second research round.

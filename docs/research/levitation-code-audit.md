# Independent levitation code cross-check

Checked 16 October 2026. The implemented 1D acoustic potential and force agree with selected numerical routines from two pinned open-source references on the cases below. This is a bounded implementation comparison, **not** validation of a complete library, real trap, material model or apparatus. No reference source was copied into the app, no dependencies were added, and no hardware module was imported or controller called.

## Pinned sources and inspected scope

| Reference | Revision | Inspected or executed scope |
|---|---|---|
| [Levitate](https://github.com/AppliedAcousticsChalmers/levitate/tree/d71ae895f3f02b649781ddd047cff7dc7d4d5988) | `d71ae895f3f02b649781ddd047cff7dc7d4d5988` | `levitate/fields/_implementations.py`: actual `GorkovPotential`, `GorkovGradient`, `GorkovLaplacian` initialization and `values` methods; wrapper and dependency imports inspected |
| [AcousTools](https://github.com/JoshuaMukherjee/AcousTools/tree/bb1c522952c516aa734ba0e1cca6c2adab0e87cc) | `bb1c522952c516aa734ba0e1cca6c2adab0e87cc` | `acoustools/src/acoustools/Gorkov.py`: active `get_gorkov_constants` function executed in isolation; its use in `gorkov_analytical` inspected |
| [AcousTools paper, arXiv v7](https://arxiv.org/pdf/2511.07336v7) | 30 January 2026 | PDF page 4, equations 8–11; page 5 discussion of stiffness |

Both clone commit IDs were checked with Git. The downloaded paper has 14 pages and SHA-256 `115c91374ab7954ff7a17ff5e4e73bf469fa401c6f009bef26c2e75fb009670b`. Page 4 was rendered and visually inspected, so the sign finding below is not based only on HTML or PDF text extraction.

## Numerical comparison method

The app's actual TypeScript model was bundled in memory with the repository's existing esbuild and imported by Node. Its row and summary outputs were exported as temporary JSON. No alternate transcription of the app's potential was substituted for the implemented function.

For Levitate, namespace packages were created in the temporary Python process to load only the inspected mathematical modules, avoiding its top-level package initialization. Actual implementation instances were initialized directly through `__new__` and `__init__`, bypassing the public metaclass wrapper. The supplied array contained only medium properties and angular frequency; the supplied particle contained density and compressibility. No real array, geometry solver, transducer or hardware object was created. The process asserted that no `levitate.hardware` module had been imported.

The analytical standing wave was supplied as complex pressure derivatives. For $p=p_A\cos(kz+\phi)$, the nonzero derivative slots were

| Levitate slot | Supplied value |
|---:|---|
| 0 | $p_A\cos(kz+\phi)$ |
| 3 | $-kp_A\sin(kz+\phi)=\partial_z p$ |
| 6 | $-k^2p_A\cos(kz+\phi)=\partial_{zz}p$ |
| 12 | $k^3p_A\sin(kz+\phi)=\partial_{zzz}p$ |

All derivatives involving $x$ or $y$ were zero. The returned potential was compared to the app's `acousticPotentialJ`; minus the returned $z$ gradient was compared to `acousticForceN`. The returned $zz$ curvature at the app's stable root was compared to `restoringStiffnessNPerM`. Gravity was excluded from the potential comparison: Levitate's constructor stores a weight using $g=9.82$, but the inspected potential/gradient `values` functions do not add it. The app separately includes $g=9.80665$ and buoyancy in its total force and potential.

For AcousTools, Python's AST selected and executed the unchanged, pure arithmetic `get_gorkov_constants` definition with explicit parameters. Its enclosing Torch/utility modules were not imported. Particle sound speed was supplied as $c_p=1/\sqrt{\rho_p\kappa_p}$, matching the app's compressibility input. The returned constants were used in $U=K_1|p|^2-K_2|\nabla p|^2$. This tests the constants and expression, not the complete AcousTools propagator, autodifferentiation, optimization or device path.

NumPy 2.3.5 was used. Four cases each used 61 positions over $0\le z\le\lambda/2$, totaling **244 samples**:

| Case | Changes from app acoustic defaults |
|---|---|
| Positive contrast | None: 40 kHz, 700 Pa peak, radius 0.15 mm, density 50 kg/m³, compressibility $10^{-9}$ Pa⁻¹, phase 0° |
| Negative contrast | Pressure 1,500 Pa peak; compressibility $2\times10^{-5}$ Pa⁻¹ |
| Translated wave | 80 kHz; radius 0.05 mm; pressure 1,000 Pa peak; spatial phase 73° |
| Zero drive | Pressure 0 Pa; spatial phase −110° |

The comparison assertions used relative tolerance $10^{-12}$ and absolute tolerance $10^{-25}$ in the applicable SI unit. Absolute tolerance handles zeros. These observed errors were smaller:

| Comparison | Largest observed discrepancy |
|---|---:|
| Levitate potential versus app | $2.585\times10^{-26}$ J absolute |
| Levitate acoustic force versus app | $2.647\times10^{-23}$ N absolute |
| AcousTools constants/expression potential versus app | $6.462\times10^{-26}$ J absolute |
| AcousTools $K_1$ versus Levitate pressure coefficient | $5.400\times10^{-16}$ relative |
| AcousTools $K_2$ versus Levitate gradient coefficient | $1.743\times10^{-16}$ relative |
| Levitate vertical curvature versus app restoring stiffness | $3.487\times10^{-16}$ relative |

Both transverse curvatures were zero for every evaluated stable vertical root. All zero-drive potential and force discrepancies were zero. These results establish agreement on this analytic field family at ordinary floating-point precision; the compared implementations share the same ideal small-particle theory and are not independent physical measurements.

## Paper equation 10 differs from active code

The visually inspected v7 PDF gives

$$K_{2,\mathrm{PDF}}=\frac{3V}{4}\frac{\rho_0-\rho_p}{\omega^2\rho_0(\rho_0+2\rho_p)}.$$

The pinned active `get_gorkov_constants` instead uses

$$K_{2,\mathrm{code}}=\frac{3V}{4}\frac{\rho_p-\rho_0}{\omega^2\rho_0(\rho_0+2\rho_p)}.$$

Both the paper's equation 8 and the active `gorkov_analytical` expression subtract the $K_2|\nabla p|^2$ term. Thus the numerator difference is consequential, not removed by that outer sign. The code coefficient agrees with Levitate and the app. Expanding the standard dipole factor $f_2=2(\rho_p-\rho_0)/(2\rho_p+\rho_0)$ and using $|v|^2=|\nabla p|^2/(\omega^2\rho_0^2)$ gives the active-code expression.

**Finding:** a specific document/code sign discrepancy is confirmed. Its cause and any author correction were not established here. Do not reproduce equation 10 as if it documented the exact active-code coefficient. No claim is made that the entire AcousTools library is wrong or that every calling path was audited. Commented-out expressions in the source are not treated as executed code.

## A positive trace is insufficient for a three-dimensional trap

Our counterexample is the quadratic potential

$$U(x,y,z)=\frac{k_*}{2}(3x^2-y^2-z^2),\qquad k_*>0.$$

At its stationary point, the Hessian is $k_*\operatorname{diag}(3,-1,-1)$, with positive trace $k_*$ but two negative eigenvalues. It restores in $x$ and is unstable in $y$ and $z$. Numerical evaluation gives eigenvalues $k_*[-1,-1,3]$. Therefore a positive Laplacian, the trace of the Hessian, does not certify a local minimum. Even positive diagonal entries alone would not generally suffice without checking mixed terms.

For a conservative smooth potential, a positive-definite Hessian at an equilibrium is sufficient for a strict nondegenerate local minimum. Negative eigenvalues identify unstable directions. Zero eigenvalues require additional analysis; they do not establish confinement. The implemented ideal plane standing wave has no transverse dependence at all, so its vertical restoring root coexists with neutral transverse directions. It is explicitly labeled a **local 1D** result. Damping, nonconservative forces, time-dependent control and full 3D dynamics require further analysis.

## Separate mechanical source clarification

OpenStax's forced-oscillation amplitude equation supports the implemented linear response. The displayed displacement-peak formula $f_0\sqrt{1-2\zeta^2}$ for $\zeta<1/\sqrt2$ is **our differentiation of that amplitude equation**, not a quotation of its prose, which describes the peak as occurring at the natural frequency. The app distinguishes natural frequency, displacement-response maximum and cycle-mean source/loss power.

No release-blocking disagreement with the app's implemented model was found in this bounded numerical comparison. Real-air validity, boundary-layer corrections, streaming, multi-particle forces, finite geometry and apparatus behavior remain outside its scope.

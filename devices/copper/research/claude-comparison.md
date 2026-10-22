# Claude frequency-of-place branch: numerical comparison and integration

Research date: 22 October 2026. Source: `occult-kranti/bashar-index`, branch `experiment-frequency-of-place`, commit `e628974ba018c775da41de304bd55afafd16b426`, parent `457dc2f2da10399bda2786573b7a77ec3fe34f62`. Review target: the integrated Copper Experiment at `6cb8662`, preserving Location 1.0, Location 1.1 and Position 1.0.

The import adds a fuller free hollow-sphere spectrum and apparatus studies. The shared membrane breathing equation agrees when the material and midsurface radius agree. It does not supply physical data or an established absolute-position coupling. This is one Codex integration review with several numerical formulations, not a newly convened independent panel, external peer review or reproduction of an experiment.

## What was inspected and preserved

The source commit changes 22 files. All 22 plus its MIT LICENSE are copied without edits to `imports/bashar-index-e628974/`. The source models, generated results, full experiment page, two renders, research notes, source network, plate series and page-building code are retained. The import manifest records each original SHA-256.

The public viewer at `experiments/frequency-of-place/` adds a review banner and redirects its two Index links to the imported Bashar Index snapshot. These are the only viewer HTML edits; their hash is recorded. `original-index.html` and the import directory retain the exact original HTML. The upstream branch and its main branch are not modified by this integration.

The original corpus and AI-paper research map remain attributed source material. This review checked selected mechanics and primary references; it did not independently verify every transcript, paper, date or graph edge. Those imported assertions are not automatically added to the existing reviewed factual graph.

## Common equations and specimen conventions

For an isotropic membrane shell undergoing uniform radial breathing,

`f_S0 = sqrt(2 E / [rho (1 - nu)]) / (2 pi R_mid)`.

The membrane mass is `4 pi rho R_mid^2 h`; the exact geometric mass is `4 pi rho (R_outer^3 - R_inner^3)/3`. The approximations must not exchange their radius or mass conventions silently.

| Input | Existing default | Claude default |
|---|---:|---:|
| Midsurface radius | 44.45 mm | 43.95 mm |
| Outer radius | 44.70 mm | 44.45 mm |
| Wall | 0.5 mm | 1 mm |
| Young's modulus | 123.5 GPa | 127.34781459 GPa |
| Poisson's ratio | 0.35 | 0.3460123161 |
| Density | 8,960 kg/m³ | 8,930 kg/m³ |

The existing source uses a declared engineering reference. Claude derives an isotropic Hill average from cubic copper constants, with a distinct temperature model. Neither represents a measured certificate for the proposed specimen. A difference between those defaults is not an implementation contradiction.

Claude solves the traction-free isotropic elastodynamic equation at the inner and outer surfaces using spherical Bessel determinants. The source supplies a separate radial Legendre Ritz formulation and membrane limits. This structure is consistent with the classical hollow-sphere boundary-value formulation described by Coccia et al., *A hollow sphere as a detector of gravitational radiation*, section II: https://arxiv.org/pdf/gr-qc/9707059 . That paper establishes the stated classical boundary-value model, not a frequency-of-place law.

For this integration an additional l=0 calculation starts from radial displacement `u(r) = A j1(k_L r) + B y1(k_L r)` and sets `(lambda + 2 mu) du/dr + 2 lambda u/r = 0` at both surfaces. This is a separately expressed check of the same radial boundary-value problem, not an independent experiment.

## Quantified comparison

| Quantity | Result | Interpretation |
|---|---:|---|
| Existing default membrane S0 | 23,317.724126 Hz | Uniform shell breathing, existing parameters |
| Full radial shell at those same existing inputs | 23,318.130751 Hz | Membrane is lower by 0.406625 Hz |
| Claude lowest S2 | 9,943.394475 Hz | Nonradial spheroidal deformation; a different mode from S0 |
| Claude T2 | 16,667.670626 Hz | Torsional mode; absent from the existing breathing reduction |
| Claude full radial S0 | 23,916.177402 Hz | Uniform radial shell mode |
| Existing membrane formula at Claude's exact inputs | 23,914.509850 Hz | Identical to Claude's membrane S0 calculation |
| Membrane minus full radial at Claude inputs | −1.667556 Hz, −69.725 ppm | Finite-thickness model discrepancy, not a position shift |
| Solid radial at matched Claude material and 44.45 mm radius | 47,080.392769 Hz | Existing JS and Claude solid l=0 determinant agree within the recorded numerical tolerance |

The unmodified full upstream `fp_model.py` was executed with NumPy 2.3.5 and SciPy 1.17.0. All 32 reported free frequencies reproduced with maximum difference 0 Hz. The coupled bounce differed by 0.00007625 Hz between numerical runs. Agreement should be tolerance based for generalized eigenvalues, not forced bit identity. The full integration receipt contains 75 passed numerical checks.

The reported 32 frequencies are computed multiplets within the selected search, with 682 angular eigenfunctions when degeneracies are counted. Perfect-sphere degeneracy does not create 682 separate observed peaks. A sign-change grid, finite frequency band, finite angular cutoff and a particular source/sensor channel do not prove completeness of a measured spectrum.

## Response functions cannot be overlaid by label alone

Under `exp(i omega t)`, for a matched linear system and input/output geometry,

`H_vF = i omega H_xF`, and `H_aF = -omega^2 H_xF`.

Receptance has units m/N, mobility m/(N·s), and accelerance m/(N·s²). The existing mechanical UI calculates displacement per force; its offline force-channel analyzer calculates velocity per force. Claude's empty-table example is accelerance, mass-normalized through its Ritz basis. Normalized magnitude plots do not restore calibration, phase or matching sensor geometry.

Claude uses the denominator `omega_n^2 - omega^2 + i eta omega_n^2` for its table curves, a structural loss-factor model. The existing toy uses viscous damping `i 2 zeta omega_n omega`. Equating eta to twice zeta only matches the damping term at the modal frequency; it does not make the two entire response functions identical.

Claude's mirror points A=(-0.8,0) and B=(0.8,0) have the same driving-point magnitude in its symmetric free-plate model. The checked arrays agree to a relative maximum difference below 1e-7. C=(0.6,0.4) changes modal residues and visibility. These examples reinforce the distinction between an observed response change and a new free pole.

## Findings that constrain use

### Contact and angular convergence

The source's m=0 shell modes are coupled to a radial point spring against rigid ground. It includes the spring cross terms and does not make the independent-spring error repaired in the earlier integrated lab. However, it is not the complete interaction of a flexible plate, a contact patch, tangential slip, air and a sphere.

From angular cutoff 34 to 44, S2 changes by −0.966930 Hz (−96.619 ppm of the preceding value) and bounce by −6.889489 Hz (−0.984981%). These are last-truncation differences. The stated 0.01% / about 1% convergence descriptions are not certified error bounds on the infinite-order point-contact problem. Hertz half-space contact and the first-order m=1 estimate add separate physical approximations. The original source itself flags double counting if its Reissner series stiffness is added to an already compliant Ritz shell.

### The table is not thin relative to its short span

The proposed plate is 2.4 × 1.2 × 0.25 m. Thickness/long span is 0.1042; thickness/short span is 0.2083. Its free Kirchhoff calculation reproduces the quoted square-plate reference values within their tabulated precision. This tests implementation of that thin-plate model; it does not establish a quantitative error for this thick specimen.

Leissa's NASA SP-160 is the classical plate reference: https://ntrs.nasa.gov/api/citations/19700009156/downloads/19700009156.pdf . The original “a few percent lower” prediction requires a matching Mindlin or 3D calculation with actual supports, or measurements. This integration supplies no such error estimate. Point-mass loading expressions are conditional below the contact bounce scale, as the source notes; entries near or above bounce must not be treated as validated mounted-sphere shifts.

### Precision needs a declared noise convention

The source uses `sqrt(6 / [(2 pi)^2 SNR N T^2])`, labels it a constant-amplitude bound and notes looser performance for a decaying record. The meaning of SNR must be specified before treating the coefficient as comparable across conventions.

The new executable check uses a real sinusoid sampled with independent additive Gaussian noise, initial signal-power SNR `A0^2/(2 sigma_noise^2)`, and unknown amplitude and phase. It constructs the finite Fisher matrix from the actual derivatives and adds an unknown decay rate in the decaying case. At the source's 40 dB initial SNR, 204,800 Hz sampling, T=0.04350261844 s, N=8,909 and S2 frequency:

| Ideal calculation | Conditional sigma_f |
|---|---:|
| Source coefficient | 0.0009494185 Hz |
| Explicit real-signal, constant amplitude | 0.0013429213 Hz |
| Real decaying sinusoid, unknown decay rate | 0.0022443449 Hz |

The constant-amplitude ratio is 1.41447, close to sqrt(2); the decaying/source ratio is 2.36392. The latter is consistent with the source's broad 2–3 multiplier under this chosen example. This is a clarification of a convention and idealization, not a claim that every original uncertainty estimate is wrong. The 2 ppm design floor elsewhere in the source is an assumption, not a calibrated measurement or combined uncertainty budget. Timing calibration, colored noise, mode overlap, thermal drift, support changes and model bias remain outside these Fisher bounds.

### A common assembled model and physical dataset remain absent

The contact spectrum, empty-table FRF, first-order air loading and force budgets are separate calculations. Near an acoustic cavity pole, a first-order correction can fail; the source marks those cases for a coupled solve. Thermal, NMR, cavity, acoustic and mechanical frequencies refer to different channels and cannot be substituted for one universal scalar frequency. No translation-dependent intrinsic coupling is derived or measured.

## Reproduction

From the `copper-experiment` directory, install the two pinned requirement files and run:

```sh
npm run check
```

The comparison gate checks the free mode search, a separately expressed radial-shell calculation, the shipped JavaScript at matched inputs, geometric/membrane mass conventions, mirror-plate arrays and a finite real-signal Fisher calculation. It leaves the recorded full-rerun receipt intact.

For the entire upstream script and a new receipt, choose a temporary output directory and run:

```sh
mkdir -p /tmp/claude-frequency-rerun
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 FP_OUT=/tmp/claude-frequency-rerun \
  python3 -B imports/bashar-index-e628974/experiments/frequency-of-place/fp_model.py
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 python3 -B scripts/verify_claude.py \
  --rerun /tmp/claude-frequency-rerun/fp_results.json \
  --output /tmp/claude-frequency-rerun/comparison.json
```

The site build validates every imported original hash, the exact original page, the annotated viewer and all previously frozen snapshot hashes. It packages the import, verifier and requirements with the existing source bundle. The dedicated publisher updates only `devices/copper/` in the existing Pages branch. Master, archive, the source repository and sibling published labs remain outside this deployment's write boundary.

# Round 1 — Elastic mechanics and branch comparison

Seat 2. This is an AI-agent review using source-grounded analysis and independent numerical reconstruction. No human panelist or historical scientist participated. Round 1 ends with the findings and proposed tests below; no Round 2 work has been executed.

## Frozen scope and evidence

- **L** = `/workspace/scratch/c230cc629529/sphere-lab-repo/location-spectrum`, repository commit `07e57b446a9f480216ad1aa555088bc361006d9c`.
- **P** = `/workspace/scratch/c230cc629529/position-review/device-observatory/position`, repository commit `a8913c825d24299283c9379282ae3876e2a0c0cd`, branch `research/copper-position-spectroscopy`.
- Both HEADs were checked. No `AGENTS.md` was found under the workspace. Source files were not edited. Model and parser SHA-256 values are recorded in `cases.json`.
- Read Newton analysis-synthesis, its research reference, and paired-physics research skills. The review applies backward inference, forward prediction, explicit domain/normalization, and independent wrong-model controls; it makes no historical-authority argument.
- Executed before ownership coordination: P `npm test` **6/6 pass**; P `python3 -B tests/analysis_test.py` **11/11 pass**; L `npm test` **28/28 pass**. No build was run by this seat. Passing baseline tests does not cover the damaging duplicate-header case below.
- Independently reconstructed direct radial stress roots, quadrature modal masses, a two-boundary 3D radial shell determinant, and generalized eigenvalues using SciPy. Isolated Node imports supplied producer outputs only. Full numeric inputs/results are in `cases.json`.

## Decisions

**Retain the location lab's physical-coordinate mechanics; import the position branch's three-root presentation and offline calibrated trace/block analysis through an explicit units adapter.** Both free-solid solvers implement the same correct l=0 boundary problem over their common input domain. The position support demonstration is intentionally a normalized toy; it is not an interchangeable implementation of the location lab's passive coupled system. One confirmed parser bug should be fixed before accepting imported measurement files.

| Finding | Classification | Exact evidence | Consequence |
|---|---|---|---|
| Duplicate required CSV headers silently overwrite the earlier channel | **Confirmed input-validation bug** | P `analysis/analyze.py:24–30`: `csv.DictReader`, then set-based header inclusion; downstream `numbers` at 34–40 cannot detect the lost duplicate | A second `force_N=1000×force_N` column is accepted; inferred mobility becomes exactly 0.001 times the original while median coherence remains 0.9998969. Reject duplicate header names before reading rows. This affects the common parser for traces and blocks. |
| Whole-sphere mass used separately for all three support coordinates | **Disclosed illustrative assumption**, not an algebra bug | P `src/model.mjs:81–85,93–98,113–117`; P `research/derivation.md:107–113` | If promoted to real point-contact prediction, it overstates the default first-mode weak spring shift by about 12.8% and later-mode shifts more. Use derived coordinate-normalized masses for physical comparisons. |
| A single real point spring is not three independent diagonal modal springs | **Omitted physical coupling**, explicitly outside P's toy scope | P `src/model.mjs:95–96` applies the same independent `k/m_eff` correction to each pole. L `src/models.mjs:116–126` retains one sphere coordinate and one table coordinate with spring cross-terms | Extending L to three sphere coordinates requires a rank-one contact matrix, not copying P's pole shift three times. A contact also excites rigid and nonradial motion; the three radial modes still are a truncation. |
| L receptance, P mobility, and P table acceleration PSD are different observables | **Intentional units difference / integration hazard**, not a current bug | L `src/models.mjs:129–135,144–149,168`; L `src/app.mjs:35`; P `analysis/analyze.py:50–53,75,87–92`; P `analysis/README.md:18–26` | Apply complex derivative conversion and match source/readout geometry; renaming headers cannot make the channels equivalent. A table acceleration PSD without force cross-spectrum is not an FRF. |
| Thin-shell cutoff is not an error guarantee | **Model approximation, correctly disclosed** | L `src/models.mjs:92–101`; L `research/model-specification.md:47–58` | At the preferred boundary t/R=.05 the membrane frequency differs from the full radial 3D result by about 344 ppm for the stated copper inputs; at .1 by 1376 ppm. The model may be pedagogically useful but cannot be an absolute sub-Hz shell calibration. |
| L thermal coefficient fixes Poisson ratio; P keeps its possible derivative | **Declared assumption / no contradiction** | L `src/models.mjs:103–108,178`; L `research/model-specification.md:91–97`; P `research/derivation.md:90–97` | Both conserve mass. Preserve P's general derivative when importing L's numerical sensitivity; an actual specimen needs mode-specific thermal calibration. |

## Independent reconstruction and numerical cases

### Same solid boundary problem, different defaults

For a homogeneous isotropic sphere, let `mu=E/[2(1+nu)]`, `lambda=E nu/[(1+nu)(1−2nu)]`, and `cL²=(lambda+2mu)/rho`. Regular radial displacement is `u(r)=A j1(omega r/cL)`. The traction-free condition is

`(lambda+2mu) u'(R)+2lambda u(R)/R=0`.

Using `j1'(x)=j0(x)−2j1(x)/x` gives `x j0(x)−4q j1(x)=0`, `q=mu/(lambda+2mu)`, and `f=x cL/(2 pi R)`. This is the same equation in L `src/models.mjs:43–90` and P `src/model.mjs:16–57`. P converts mm and GPa to SI at 36; L core inputs are already SI and the comparison wrapper converts mm at 155. There is no factor-of-two radius/diameter or radians/Hz defect in these producers.

The independent solver used the stress derivative `x*j1'(x)+2lambda/(lambda+2mu)*j1(x)` directly, rather than either producer's regularized trigonometric expression. Five fixtures (three material/geometry cases, nu=−.9, nu=.49) each compared three radial roots. Maximum relative frequency error for **either** producer was **3.51e−14**. L modal masses agreed with independent quadrature within **9.86e−14** relative across the same 15 modes.

For common copper values E=123.5 GPa, nu=.35, rho=8960 kg/m³ and **R=12.5 mm**, both give roots 2.78117692164, 6.13001916095, 9.32505887880 and frequencies 166551.050481, 367096.793727, 558432.058016 Hz. L's 44.45 mm solid default gives 46836.628369 Hz by the expected 1/R scaling; L's default **shell** is a different geometry and gives 23317.724126 Hz. These defaults must not be compared as disagreeing predictions for the same specimen.

The l=0 first root is not the lowest root of all elastic families. Both producers state this limit (L lines 172; P lines 1–3,56–57). The primary Saviot–Murray paper's Section II separately gives a determinant for l>0 and T11=0 for l=0; it does not support treating radial calculations as the entire spectrum.

### Modal mass matters before physical support inference

With surface displacement as modal coordinate,

`m_n=4 pi rho integral_0^R [j1(x_n r/R)/j1(x_n)]² r² dr`.

For the 12.5 mm copper sphere, physical mass is **0.07330382858 kg**, but the first three derived modal masses are **0.08270244966**, **0.10434587596**, **0.10753151714 kg**, or **1.128214600**, **1.423471024**, **1.466929071** times physical mass. L derives the exact integral (82–90); P explicitly chooses total mass (81–85,114).

For grounded spring k=10^8 N/m, P's independent-spring shifts are **103.7053, 47.0625, 30.9386 Hz**. Replacing only the masses by the derived values gives **91.9231, 33.0624, 21.0909 Hz**. A single surface point spring projected onto all three radial modes has potential `k(sum_n q_n)²/2` and hence `Delta K=k 1 1^T`; the full generalized eigenproblem gives **91.8946, 33.0675, 21.0961 Hz**. The residual difference from diagonal correction is small here because the example is weak and modes are separated, but it is not identically zero or guaranteed small near degeneracy/strong support.

For one fixture mode, the integrated matrix should instead use `b=(psi_1,...,psi_N,−phi_table)` and `Delta K=k b b^T`, alongside diagonal free modal masses/stiffness. This is the multi-mode extension of L's nonnegative contact energy at 116–126. Preserve both diagonal and off-diagonal terms. This statement is an exact finite-model construction, not validation of a real Hertzian contact or table. Rigid translations/rotations and nonradial elastic modes remain missing if only the radial block is retained.

### Shell and thermal scope

The thin membrane derivation uses midsurface radius, equal tangential strain u/R, plane stress, and unpressurized free shell conditions. It yields `omega²=2E/[rho(1−nu)R²]`. Thickness cancels at that order; this is not a solid-sphere law. L returns membrane mass `4 pi rho R²t` plus geometric mass `4 pi rho R²t[1+t²/(12R²)]`. Its coordinate/mass convention is internally consistent.

I solved `u=A j1(kr)+B y1(kr)` with zero radial traction at **both** `R−t/2` and `R+t/2`. At L's copper default, full radial 3D frequency is **23318.130751 Hz**, versus **23317.724126 Hz** for the membrane model, a **−0.406625 Hz / −17.4382 ppm** membrane bias. At t/R=.05 and .1 it is −8.03343 and −32.12491 Hz. These are model-to-model differences; they exclude seam, air, texture and support. The absolute-model bias is substantially common to unchanged A/B geometry and should not automatically be inserted as independent A/B noise.

For mass-conserving uniform expansion `s=1+alpha DeltaT`, `rho/rho0=s^−3`, `R/R0=s`, `E/E0=1+beta DeltaT`, fixed nu gives `f/f0=sqrt[s(1+beta DeltaT)]`. Both branches agree. The chosen coefficients imply **−231.75 ppm/K** linear slope and a +1 K shift of **−5.404601 Hz** for the shell or **−38.603339 Hz** for the 12.5 mm solid first radial mode. A hypothetical `dnu/dT=10^−5/K` adds **+7.6923 ppm/K** for the membrane shell; this is an illustrative sensitivity, not a measured copper coefficient. P's more general formula contains that missing direction. Geometrically similar finite-thickness corrections remain constant under uniform scaling at fixed nu, so finite thickness alone does not invalidate the shared fractional thermal scaling.

### Point response and channel conversion

L's empty-table local driving-point receptance is `H_xF=phi²/[m(omega_t²−omega²+i2zeta omega_t omega)]` (144–149). The two phi factors are correct: force participation and displacement readout. Endpoint nodes vanish exactly. L's coupled `responseAt` table output is the table **modal coordinate** (`H_ts`), whereas the empty response is a **local point coordinate**; multiplying by phi is required to compare local table motion under matching excitation. L's docs distinguish these channels at `research/model-specification.md:73,79–83`.

P's trace analyzer returns `H_vF=S_Fv/S_FF` with `csd(force,velocity)=conj(F)V`. With the declared `exp(i omega t)` convention, matching mechanical channels obey

`H_vF=i omega H_xF`, `H_aF=−omega² H_xF`, and `S_aa=omega^4 S_xx`.

At 23317.724126 Hz, mobility/receptance magnitude is **146509.58 s−1**, with a **+pi/2** phase difference. Direct overlay without conversion would therefore create a huge artificial amplitude disagreement. Conversely, comparing peaks across derivative observables can move response maxima even with identical poles. At f=0 inverse derivative conversion is undefined; omit/reject DC instead of dividing by zero. P's table acceleration PSD lacks the complex force cross-spectrum needed to reconstruct table receptance, so an integrated acquisition schema should additionally preserve raw synchronized channels or the appropriate cross spectra.

## Best integration and proposed project synthesis

These are original **project-integration proposals**, not claims of scientific novelty or validated physical discovery.

1. **One mechanics API, explicit observation adapters.** Retain L's SI mechanics, modal mass, passive spring energy, empty-table point model, and thermal implementation. Expose the first three solid radial roots through that API; retain P's normalized peak-switch toy as a separate teaching example. Import P's offline H1/ABBA analysis and its existing provenance records without recasting velocity as displacement. Define geometry (`solid` / shell, midsurface versus outer radius), modal normalization, input point/direction, output derivative order, cyclic-frequency axis, and unit metadata in one exchange contract. First fix duplicate required headers and reject ambiguous/ragged data before scientific calculation. Avoid silently converting the old normalized dB toy to calibrated m/N.
2. **Scale-invariant multi-mode diagnostic.** In the fixed-nu free radial family, `f_n/f_1=x_n(nu)/x_1(nu)` removes R and the common `sqrt(E/rho)` factor, hence also fixed-nu uniform thermal scaling and common multiplicative clock error. The default ratios are **2.204109747** and **3.352918258**. The declared single-point spring case shifts modes by **551.75, 90.08, 37.78 ppm**, producing first-order log-ratio shifts of **−461.67, −513.97 ppm**. This is a quantitative discriminator between common scaling and this contact model. It cannot uniquely attribute a residual: changing nu, anisotropy, mode misidentification and model discrepancy can also change ratios. A future acceptance gate should compare nuisance sensitivity rank and held-out support/temperature conditions before inference.
3. **Model-to-analysis closure case.** Generate calibrated force and velocity traces from the shared passive mechanics with known damping, phase and a withheld perturbation; run P's H1 pipeline; convert back to receptance; compare complex residuals against the same declared channels. Include an intentionally wrong derivative unit and duplicate-force-header control. This directly checks interoperability that neither current test suite establishes. It is a proposed next experiment, not executed in Round 1.

## Primary sources checked for this seat

- Saviot & Murray, *Longitudinal versus transverse spheroidal vibrational modes of an elastic sphere*, arXiv `cond-mat/0506353v3`, original version metadata 22 November 2005. Live Section II, equations 1–4 and l=0 sentence read: https://arxiv.org/html/cond-mat/0506353v3 . The generated HTML also displays an August 2026 date; do not use it as the original publication date. Supports free-sphere family/boundary/normalization context, not novel integration claims. Retrieval refs: `turn414view0`, `turn427view0`.
- SciPy official `csd` reference, parameters and Notes on conjugate-X times Y and spectral scaling read: https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.csd.html . Live page is v1.18; producer execution dependencies remain the versions recorded by that repository. Supports cross-spectrum convention, not physical calibration. Retrieval ref: `turn414view1`.

## Round 1 completion boundary

Required comparison, baseline tests, independent cases, evidence classifications, and integration/thesis candidates are complete. No free-sphere formula error, SI conversion error, mass-conserving thermal-bookkeeping error, or phi-squared driving-point-response error was found. The confirmed duplicate-header parser defect and physical-model limitations above remain distinct. No physical measurements or full-spectrum validation were supplied. Await root's Round 2 instructions before further debate or calculations.

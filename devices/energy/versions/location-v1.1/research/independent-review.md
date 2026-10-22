# Independent physics and inverse-inference review

Prepared 22 October 2026 UTC (21 October in the user's time zone). This is an independent AI-agent derivation and computational review, not human peer review or a physical experiment. The producer's implementation had not been read when the fixtures were derived and run.

## Decision and scope

The scientifically meaningful question is: **Do calibrated, bandwidth-limited response functions or fitted modal parameters of the same specimen differ between positions A and B after controlling material state, support, excitation and readout?**

There is no operational definition of an object's single complete or true frequency. A continuum elastic sphere has many eigenmodes; electrical, thermal, optical and quantum observables have different spectra. A measurement must name its channel, units, sampling, window, excitation and transfer function. A point on the table likewise has a local response and participation in global table modes, rather than one intrinsic frequency.

Uniform translation of an isolated system through a homogeneous environment does not change its internal elastic eigenvalues. Translating the ball relative to a fixed table, room, laser and electromagnetic environment can change its coupled response. This is an ordinary, testable position dependence and does not by itself establish an absolute position code.

## Solid sphere: independent forward derivation

For homogeneous isotropic linear elasticity, define Lamé moduli μ=E/[2(1+ν)], λ=Eν/[(1+ν)(1−2ν)], density ρ and radius R. Longitudinal and transverse speeds are cL=√[(λ+2μ)/ρ] and cT=√(μ/ρ). The spherically symmetric displacement is u(r)=A j1(kr), k=ω/cL.

The normal surface stress is σrr=(λ+2μ)u′+2λu/r. With σrr(R)=0 and j1′(x)=j0(x)−2j1(x)/x, the characteristic equation is

**x j0(x)−4(cT/cL)²j1(x)=0, x=ωR/cL.**

The equivalent scalar equation is (x²−4q)sin(x)+4qx cos(x)=0, q=(cT/cL)². The algebraic root x=0 must not be returned as a breathing resonance. Torsional and other spheroidal families are omitted from this one-family calculation. It is therefore incorrect to call its first root the sphere's lowest overall resonance or to call several radial roots its whole spectrum.

Independent Python/SciPy bracketing, checked against the equivalent stress equation, gives for the illustrative values E=110 GPa, ν=.34, ρ=8960 kg/m³ and R=10 mm:

- cL=4346.9727445 m/s; cT=2140.3014255 m/s.
- First radial root x=2.7586362948830208.
- First radial breathing frequency 190854.1002633 Hz.
- Next radial-family frequencies: 423545.335790, 644793.034515 and 863999.893539 Hz.
- Mass 0.0375315602 kg.

These are model outputs with illustrative inputs, not predicted exact frequencies for an uncertified copper specimen. Real polycrystalline texture, residual strain, dimensions and material constants require calibration. A 48 kHz audio interface cannot measure the first radial mode of this 20 mm model without aliasing; it could record lower apparatus modes while missing the desired mode entirely.

## Hollow sphere: distinguish the transcript proposal

The source team's located claim describes a thin hollow copper sphere approximately three to four inches across. That is mechanically different from a solid sphere and must be a separate model and setup.

Let R denote the **mid-surface** radius, t the wall thickness and u a uniform small radial displacement. The two equal membrane strains are u/R. Under plane stress, membrane stress is σ=E u/[(1−ν)R]. Normal restoring force per unit area is 2tσ/R. Equating it to −ρt ü gives

**ω²=2E/[ρ(1−ν)R²].**

This is a membrane approximation for the uniform radial breathing mode, with t/R much smaller than one, negligible fluid loading, negligible prestress and no seam/port/mount asymmetry. Thickness cancels from this leading mode's frequency, but does not cancel from mass, loading, damping or other modes. Neither cancellation nor high Q demonstrates anomalous energy or motion.

For a shell with inner/outer radii R∓t/2, exact geometry gives m=4πρR²t[1+t²/(12R²)]. The familiar 4πρR²t is the thin-shell approximation. If a UI labels diameter as *outer* diameter, it must convert to R=(Douter−t)/2 before using the membrane equation. Calling an outer diameter a mid-surface diameter can produce a larger error than the membrane approximation itself.

An independent full three-dimensional radial check uses u=A j1(kr)+B y1(kr) and sets σrr=0 at both inner and outer surfaces. Its 2×2 stress determinant is implemented in `independent_fixtures.py`. For E = 110 GPa, ν = .34, ρ = 8960, t=.5 mm, mid-surface diameter 3.5 in:

- Membrane frequency 21839.0495745 Hz.
- Full linear-elastic radial-shell frequency 21839.4089420 Hz.
- Difference about 0.36 Hz (16.5 ppm), before material, seam, fluid and support errors.
- Exact shell mass .1112335987 kg; membrane mass .1112324258 kg.

The same membrane model gives 25.479 kHz for 3 in and19.109 kHz for 4 in mid-surface diameters. The numeric precision in this file is for software comparison; public presentation should use fewer significant figures and show input assumptions.

## Position-dependent coupling and transfer functions

A passive illustrative two-mode system may use physical generalized coordinates u_s and u_t, effective masses m_s and m_t, and table mode shape φ(x). Its coupling potential is κ[u_s−φ(x)u_t]²/2. Thus

M=diag(m_s,m_t),
K=[[m_sω_s²+κ, −κφ], [−κφ, m_tω_t²+κφ²]].

The diagonal coupling terms are necessary for this particular spring model. Omitting them defines another effective model and must be labeled accordingly. Positive masses, stiffnesses and nonnegative κ give a positive stiffness matrix. Nonnegative viscous damping is required for passive loss.

The observed force-normalized response is H(ω,x)=c(x)ᵀ[K(x)−ω²M+iωC]⁻¹b(x), optionally followed by a calibrated detector transfer function. Moving only the receiver can change c(x) and peak amplitudes without changing any eigenvalue. Moving the coupled specimen can change K(x). Modal nodes may make a mode invisible; a visible-peak list is not the full eigenvalue list. Magnitude maxima also shift with damping, interference and sampling and need not equal undamped eigenfrequencies.

The fixtures use SciPy's generalized symmetric eigensolver and direct complex linear solve, with physical modal masses and an explicit contact spring. They also verify average sinusoidal input power equals viscous loss, with peak phasors and the factor 1/2 retained. They are intentionally a separately formulated check, not a copy of the web solver.

## Temperature and clock comparisons

For a geometrically similar sphere of unchanged mass, ρ(T)=ρ0/[1+αΔT]³ and R(T)=R0[1+αΔT]. At fixed ν, with E(T)=E0[1+βEΔT], both radial models obey

f(T)/f0=√{[1+βEΔT][1+αΔT]},
(d ln f/dT) at the reference point = (βE+α)/2.

A common wrong model changes radius and modulus while holding density constant; it does not conserve the specimen's mass. Fixed ν is an explicit approximation. For a shell, a changing ν contributes +(1/[2(1−ν)])dν/dT. For a solid, changing ν affects both cL and the root. Thermal gradients, equilibration and specimen-specific coefficients require measurement.

With the illustrative α=16.5 ppm/K and the reference-data polycrystal βE≈−480 ppm/K, a 0.1 K shift gives about −23.175 ppm at fixedν, roughly −0.506 Hz for the 3.5 in shell example. This is already enormous compared with a gravitational clock comparison across a level laboratory table.

General relativity predicts the fractional rate comparison Δf/f≈gΔh/c² for small vertical separations. For 1 mm, this is1.0911×10⁻¹⁹; at 22 kHz it corresponds to2.4005×10⁻¹⁵Hz. A local co-moving clock and specimen do not acquire an independently observable absolute frequency stamp. The effect is a comparison between clocks at different gravitational potentials, not a mechanism for driving a ball sideways. The cited optical-clock experiment demonstrates the metrology principle; it does not demonstrate feasibility with copper mechanical resonances.

## Inverse problem and non-identifiability

1. A finite set of input/output spectra cannot identify all modes. A mode that is unexcited or lies in the readout nullspace can be changed without changing measured data.
2. Any out-of-band behavior is unobserved. A finite-duration record also gives a windowed, noisy estimate. Δf_bin=1/T is Fourier grid spacing, not automatically a confidence interval or a hard universal frequency-estimation limit. Model-based estimators can achieve sub-bin estimates with adequate SNR and valid assumptions.
3. An object spectrum is not an injective map of location. Two otherwise identical, isolated spheres at different points in the same uniform environment have the same modeled internal spectrum.
4. Environmental spectra can sometimes identify positions after a calibration survey. The resulting map encodes that environment and its stability, not universal absolute position.
5. Matching a measured spectrum atA to one seen atB does not supply a force law or momentum transfer that takes the object toB. A motion claim requires displacement, force, energy and momentum measurements in addition to spectra.
6. A residual A/B difference cannot be called new physics until material state, support changes, excitation, readout geometry, time drift and statistical selection are bounded.

## Acceptance tests before publication

- Free translation test: identical specimen state and boundary conditions give identical isolated frequencies.
- Radius, E andρ scaling: f scales as1/R, √E and1/√ρ for fixedν.
- Root residual, bracket and independent formulation agree; x=0 excluded.
- Shell dimensions are explicitly inner, outer or mid-surface; invalid thicknesses rejected.
- Thin-shell outputs are labeled approximate and outside-thin-domain inputs flagged or blocked.
- Zero coupling separates sphere and table modes; receiver changes do not change K eigenvalues.
- Passive damping gives nonnegative average dissipated power and consistent input/loss accounting.
- Frequency grid refinement changes sampled maxima but converges; avoid reporting grid quantization as a physical shift.
- Temperature expansion conserves mass, and fixedν approximation is disclosed.
- Known injected small shift is recovered by the analysis pipeline, whereas A/A sham moves do not produce a systematic residual.
- No measured-looking random dataset is presented without a visible simulated label and seed.
- No claim of capturing all frequencies, proving a coordinate code or moving matter by spectral matching.

## Minimum useful physical protocol

Preregister one mode family, one bandwidth and one primary comparison. Measure the specimen's dimensions, mass, temperature and orientation. Use the same transport support atA/B and record air pressure if using an air bearing. Low tangential friction does not eliminate normal support loading, vibration or acoustic coupling.

Record both a co-moving/local sphere readout and a fixed table/reference channel. A calibrated LDV avoids an attached sensor's added mass but introduces optical alignment and surface-readout effects that must be controlled. Place any excitation consistently relative to the sphere. Repeat using a second excitation and readout position to detect missing modes. Copper's low IR emissivity makes uncalibrated IR temperature readings a poor sole thermometer.

Acquire an A/A sham-move series and randomized balanced A/B returns; counterbalance time order, then repeat after swapping the measurement chain's positions. Include empty-support and table-only spectra. Let motion settle before stationary spectral comparison; separately record the translation trajectory if testing motion. Rolling can change a shell seam's orientation and polycrystal coupling, so retain fiducials.

Use known small temperature changes and known support-loading changes as positive controls. Use analog anti-alias filtering and sufficient digitizer bandwidth for the selected modes; document the usable calibrated passband. Save raw waveforms, force/reference channels and environmental metadata, not only peak lists.

Fit complex FRFs or decaying sinusoids with uncertainty. Report within-position repeatability and uncertainty of the paired A/B contrast, including correlated calibration terms and drift. A failure to see a shift supports only an upper bound within this channel, state, range and precision. It cannot exclude every metaphysical interpretation, and no physical run has been performed by this website.

## Sources inspected

- Ledbetter & Naimon, *Elastic Properties of Metals and Alloys. II. Copper*, JPCRD 3, 897 (1974), doi:10.1063/1.3253150, https://srd.nist.gov/jpcrdreprint/1.3253150.pdf . Read sections 8–10 and Tables 10/12. The compilation documents substantial material-condition dependence. Table 10 polycrystal averages include E = 123.5 GPa and ν = .350; Table 12 gives reference thermal slopes. A literature average is not a certificate for the proposed specimen.
- Galstyan, Pak & Stone, *A note on the breathing mode of an elastic sphere in Newtonian and complex fluids*, arXiv1506.09212 (2015), https://arxiv.org/pdf/1506.09212 . Read elasticity derivation and equations 16–19: the vacuum-limit equation is equivalent to the solid-sphere boundary condition derived here. Fluid loading changes resonance and damping; this review uses only its mechanical sphere result.
- *Determination of elastic moduli for a spherical specimen by resonant ultrasound spectroscopy* (2005), https://www.sciencedirect.com/science/article/abs/pii/S0963869505000368 . Abstract/search excerpt inspected; publisher full page was access blocked. Supports the need for free-surface approximation and enough modes sensitive to fitted parameters; not treated as a fully read derivation.
- Bothwell etal., *Resolving the gravitational redshift across a millimetre-scale atomic sample*, Nature 602, 420–424 (2022), doi:10.1038/s41586-021-04349-7; NIST author-institution record https://www.nist.gov/publications/resolving-gravitational-redshift-across-millimetre-scale-atomic-sample . Abstract and institutional description inspected; publisher session was blocked. Used only for the demonstrated clock-comparison scale.
- Baker, *The axisymmetric modes of vibration of thin spherical shell* (1960), https://www.osti.gov/biblio/4027361 . Search record only; full retrieval timed out. Background lead, not the source of an allegedly verified equation. The shell formula above was independently derived from membrane force balance and checked against the3D radial determinant.

## Reproduction

Run `python independent_fixtures.py` with NumPy and SciPy. It writes `independent-fixtures.json`. Tests executed successfully: independent stress-root identity, radius and modulus scaling, exact shell radial determinant comparison, mass-conserving thermal identity and passive harmonic power balance. These tests verify the declared reduced models; they do not validate an unbuilt apparatus.

## Implemented JavaScript audit

After freezing and executing the independent fixtures, the producer's `physics/models.mjs` was read and checked with `compare_producer.mjs`. Forty-three numerical, scaling and invariance comparisons passed. The maximum relative difference was 4.79×10⁻¹² against the independent Python outputs and direct numerical modal-mass integration. The report records the producer-file SHA256. No blocking physics error was found within the declared models.

Publication conditions: display the exploratory shell warning when thickness/radius exceeds .05; call the real generalized-eigenvalue frequencies *undamped natural frequencies*, distinguish them from damped response maxima, and preserve the table/contact model's illustrative status. The simulator does not include a validated experimental apparatus or establish anomalous location encoding.

## Empty-table local response extension

A separate control channel should show what the table alone contributes. For the assumed one-mode table, write local displacement y(x)=φ(x)q and the local force's generalized input as φ(x)F. The modal equation is

m_t q̈+2ζ_t m_tω_t q̇+m_tω_t²q=φ(x)F.

Therefore the local driving-point displacement per local force is

**H_tt(ω,x)=φ(x)²/[m_t(ω_t²−ω²+i2ζ_tω_tω)].**

The two occurrences of φ have different meanings: one projects the applied force into the mode; the other projects modal displacement back to the same physical point. Missing either factor would describe a different input/output measurement. Units are metres per newton. It is an empty-table FRF, not the table coordinate's response to a force on the coupled sphere.

At a true modal node φ=0 this particular mode is invisible to a local driving-point experiment. That does not mean the table has no vibrations or no other modes. At two non-node positions, this single-mode magnitude response has exactly the ratio φ_A²/φ_B² for every frequency. Its natural frequency and complex poles do not change with measurement position. For viscous damping below 1/√2, the displacement-response maximum is at ω_t√(1−2ζ_t²), which differs slightly from the undamped natural frequency and is also position independent within this model.

Numerical controls use a one-degree-of-freedom complex matrix solve with a projected input and projected output at positions 0, .1, .25, .5, .75, 1. They include zero-frequency compliance, off-resonance response and exact drive at the undamped natural frequency. Positive mass and damping make the latter finite. Additional properties must verify nodes, modal-shape amplitude ratios and unchanged peak location on a common plotting grid. No physical measurement is represented by these calculations.

## Final admission decision

The empty-table extension and all previous model checks were executed together. **127 counted numerical and property checks passed**, with maximum relative discrepancy **4.79054×10⁻¹²**. Checks cover independent complex FRF fixtures, exact zero response for the modeled mode at both endpoint nodes, modal-shape amplitude ratios, shared peak location, finite response with positive damping, passivity and invalid-input rejection. The direct passive-power assertions are also retained.

Reviewed final producer SHA256: `5bdf26177c864bc70948178d81e1e917137fa4960bfaeab5d523decf2c63ed9c`. The executable `compare_producer.mjs` records its current source hash on every run in `producer-comparison.json`. This admission applies to the declared reduced-model equations and implementation. It reports zero physical experimental results.

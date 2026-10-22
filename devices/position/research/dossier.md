# Fieldwork: Copper sphere position spectroscopy

Research cutoff: 21 October 2026. No physical experiment has been executed.


---

# Independent experimental-design review

Status: proposed apparatus and independently executed synthetic controls. No copper-ball data have been measured. Prepared 21 October 2026 (America/New_York). The reviewer did not inspect the producer's files before freezing this report.

## The question that can be answered

For one identified mechanical mode of the same copper sphere, does its fitted modal frequency change between two surveyed positions after accounting for support loading, temperature, orientation, excitation and sensor geometry? Separately, how do the local table vibration and acoustic-pressure transfer functions differ between those positions?

The measurand is a difference in a specified modal parameter, not the sphere's “entire frequency.” A sphere has multiple spheroidal and torsional modes, generally not an integer harmonic series. A finite observation has a stated bandwidth, time window, sensor direction and noise floor. Chemical purity does not imply elastic isotropy, perfect sphericity or identical grain structure. A table point is a coordinate at which a field or transfer function is measured; it does not have a universal intrinsic frequency.

The useful null is conditional translation invariance: the same specimen and complete boundary conditions in a sufficiently uniform environment give the same intrinsic elastic eigenproblem. A changed support is a changed physical problem. A nonzero result first establishes position dependence of the measured system under the tested protocol, not an unknown property of space.

## Channels and apparatus

Use two experimental tiers so a phone microphone or audio interface is not represented as an ultrasonic sphere-mode instrument.

| Channel | Measurand and units | Measurement role |
|---|---|---|
| Laser Doppler vibrometer on sphere | Surface velocity component, m/s | Non-contact receiver for selected elastic modes; record beam direction and the same surface fiducial |
| Drive monitor | Applied drive voltage, V; force, N, only if independently calibrated over the band | A voltage-normalized response is m/s/V. Call it mechanical mobility only when actual force is measured in the relevant band |
| Table reference accelerometer | Acceleration, m/s² | Record table/background motion at fixed coordinates; sensor mounting and bandwidth remain part of the response |
| Calibrated microphone | Acoustic pressure, Pa | Map airborne sound within its calibrated band, independently of sphere displacement |
| Temperature/geometry log | Sphere and ambient temperature, K; position, m; orientation, degrees | Identify drift, gradients and relocation changes; do not leave a contact thermometer attached during a nominal free-boundary run |
| Timebase and trigger | Sample rate and timestamp | Synchronous velocity/drive channels; document clock calibration and any differential drift |

Schematic requirements for a faithful drawing:

1. A rigid table/rail with surveyed A and B locations (illustrative x=0.2 m and 0.8 m on a 1.2 m table, not required dimensions), a ruler and a level/height reference.
2. A low-friction air-bearing carriage carrying the same compliant cradle and weak drive contact throughout translation. The sphere is supported vertically: draw the contacts and air supply explicitly. The apparatus is not frictionless or contact-free.
3. Translate the carriage, stop, allow a predefined settling period, and measure while stationary. A continuously moving test needs a separate Doppler and nonstationarity model.
4. A laser receiver on an independent stable support, steered/repositioned to the same sphere fiducial and incidence angle. The LDV beam measures one projected velocity component. Include a beam-direction arrow, not a generic “frequency scanner.”
5. A low-amplitude piezo drive and monitored drive voltage for ultrasonic RUS; measure the contact preload. A miniature impact hammer is a separate low-band option only within its force calibration. Do not assume an ordinary hammer excites or measures 250 kHz forces accurately.
6. A fixed table accelerometer, microphone, ambient temperature logger and stationary reference resonator. Show receiver/controller and drive monitor connected to a common-clock acquisition unit and computer. Low-rate environmental channels may use aligned timestamps.
7. Retain cables with repeatable strain relief and air pressure. Cable/airflow changes are controlled inputs, not invisible details. Non-contact reception avoids receiver mass loading but does not remove support or drive loading.

An illustrative initial ultrasonic survey is 10–250 kHz with a receiver and analogue anti-alias chain calibrated through 250 kHz and simultaneous sampling at 1 MS/s. This is a proposed specification, not a guaranteed band for a particular sphere or a product recommendation. Confirm the specimen's predicted modes and all component bandwidths before purchase. For audio/table mapping, use a separately declared band such as 20 Hz–20 kHz with a suitable anti-alias filter and 96 kS/s acquisition. Consumer audio alone cannot exclude an ultrasonic resonance shift.

## Measurement model

For harmonic excitation at angular frequency omega, write

`H(x,omega) = C(x) [K(x) - omega² M(x) + i omega D(x)]⁻¹ B(x)`.

M, K and D describe the complete linearized sphere/support system. B describes the drive projection; C describes the observed component. Translation labels alone do not change its eigenvalues. Different B or C can change which peak is largest while all poles remain fixed. Different K due to contact stiffness can move the actual coupled poles. Our independent script demonstrates both cases.

For measured force F and velocity v, with the cross-spectrum convention `S_Fv = E[conj(F) v]`, use `H1 = S_Fv / S_FF`, units (m/s)/N. For a voltage-monitored piezo, replace F by V and report (m/s)/V. With the same convention, magnitude-squared coherence is `gamma² = |S_Fv|² / (S_FF S_vv)`. The H1 interpretation assumes negligible input measurement noise relative to output noise; other noise arrangements require another estimator or an errors-in-variables fit. Never divide by an input spectrum at its noise floor.

Coherence is a diagnostic, not proof of the physical interpretation. A prospective engineering gate could require gamma² ≥ 0.9 in a fitted resonance neighborhood with adequate drive SNR, but this threshold must be declared before the final run and need not hold at antiresonances. Fit poles across multiple response points and compare residuals/stabilization, not just FFT-bin maxima. Match the same mode using frequency neighborhood, damping, spatial mode shape and a Modal Assurance Criterion. Nearly degenerate modes may require a matched modal subspace rather than one-to-one vector matching.

For a weakly damped isolated mode, the amplitude ringdown time is `tau_A = Q/(pi f_n)`. The ordinary frequency-grid spacing is `1/T` for record duration T. Grid spacing is not a frequency-estimator uncertainty, and zero padding adds no independent information. At an illustrative 80 kHz with Q=500, tau_A≈1.99 ms; recording seconds of post-decay noise does not create equivalent seconds of useful ringdown. Use a calibrated swept/stepped drive or a validated decay fit when the target shift requires it.

## Prospective sequence and controls

1. Characterize diameter/sphericity, mass, copper grade, surface state and temperature. Select a primary mode, analysis band, target smallest relevant difference delta_min, exclusion criteria and estimator before final acquisitions. Use pilot data to select amplitude, settling time and number of blocks. Verify response linearity by changing drive amplitude.
2. Map the empty table and carriage at A and B. Add the sphere and retain the complete assembly, orientation and contact preload. Record a stationary reference resonator to identify timebase and environmental drift.
3. Use equally spaced four-acquisition blocks ABBA and BAAB, balanced in number and randomized in order using a saved seed. A and B appear twice per block. Return acquisitions are mandatory. Our example schedule has 20 blocks; this is an executable illustration, not a justified sample-size recommendation.
4. A block contrast is `d_i = (f_B1 + f_B2 - f_A1 - f_A2)/2`. For equal timing, both ABBA and BAAB cancel a linear temporal drift exactly. AABB does not. Curvature survives an individual block; balanced reversal cancels it only under the extra assumption of matched curvature, so retain actual timestamps and inspect drift.
5. Run the same movement without changing location (handling/sham control), repeated lift/remount trials, deliberate sphere rotation, a contact-preload perturbation, and a small independently measured thermal perturbation. These identify sensitivities. Reversal alone cannot identify a confound that is permanently correlated with position.
6. Separate experiments can exchange sensor configurations or reverse the table orientation while retaining surveyed room coordinates. This tests whether a difference follows the specimen, fixture, receiver or room coordinate. Repeat on another day before interpreting a persistent residual.
7. Retain raw voltage/time traces, calibration records, saturation/double-hit flags, all excluded runs with reasons, fit outputs/residuals, environmental logs, mode identities and the preregistered schedule. Publish both matched-mode results and full in-band spectra.

## Uncertainty and decisions

Let `Delta = mean(d_i)` over n independent blocks, with sample standard deviation s_d. The random standard uncertainty is `s_d/sqrt(n)` only if block dependence is negligible; otherwise use a model that accounts for autocorrelation or a suitably blocked resampling scheme. Do not treat all overlapping Welch segments as independent experiments.

For a frequency difference, `u²(f_B-f_A) = u²(f_B)+u²(f_A)-2 cov(f_A,f_B)`. The same constant clock-scale error acts on the difference, so it should not be counted as two independent full-frequency errors. Drift in the clock between acquisitions remains. Include uncertainty from fitted mode frequency, nonshared support effects, temperature corrections and calibration through the relevant covariance model. Do not count the same repeatability term again as an independent Type B component.

For an isotropic sphere model `f = C(nu) sqrt(E/rho)/R`, the differential bookkeeping is

`d ln f/dT = (1/2) d ln E/dT - (1/2) d ln rho/dT - alpha + (d ln C/dnu)(dnu/dT)`.

Under constant mass and isotropic thermal expansion, `d ln rho/dT = -3 alpha`, giving an expansion contribution `+alpha/2` when E and nu are artificially fixed. The actual copper coefficient must include E(T) and nu(T); a geometry-only `-alpha` approximation assumes wave speed is held fixed. Estimate the mode's thermal slope empirically when precision requires it.

Choose an expanded interval `Delta ± U` from a defensible coverage method. A coverage factor near 2 is an approximation whose suitability depends on degrees of freedom and distribution; it is not automatically an exact 95% interval. If zero is included, report “no shift resolved at this uncertainty” with the interval. If the entire interval is inside a preregistered equivalence range `[-delta_min,+delta_min]`, the experiment supports that bounded equivalence claim for this mode, band and configuration. A positive residual requires replication and confound discrimination. Exploratory screening of many modes needs multiplicity control or clearly exploratory labels.

## Independent executable evidence

`python -B independent_checks.py --output independent-results.json`

Eight executed controls verify: linear-drift cancellation; the AABB failure case; quadratic-drift limitation; reproducible balanced scheduling; a >90 Hz apparent peak shift with zero pole shift; a true support-induced coupled-mode shift; covariance-aware uncertainty; common-clock behavior; and thermal bookkeeping (some share one grouped check). Normal and optimized Python produce byte-identical output. These examples test the reasoning and software, not the physical copper apparatus.

## Source support and boundaries

- Balakirev et al., Review of Scientific Instruments 90, 121401 (2019), DOI 10.1063/1.5123165: RUS methods and specimen/model dependence. Tutorial abstract and introduction read. It does not establish the proposed location experiment.
- Theuss et al., Physical Review Letters 132, 066003 (2024), DOI 10.1103/PhysRevLett.132.066003, arXiv:2303.03473v2: methods and uncertainty sections read. Finite contact loading and orientation affect fitted results, motivating explicit controls. Its specimens are not the proposed copper sphere.
- Sorbello et al., Journal of the Acoustical Society of America 107, 808–818 (2000), DOI 10.1121/1.428264: abstract read. The study measured pressure/gas effects on a silica sphere and found mode-dependent agreement. It supports checking environmental loading, not transferring its numerical shifts to copper at ambient pressure.
- Renken et al., IEEE Ultrasonics Symposium (1997), NIST publication record: abstract read. An independent velocity comparison assessed RUS accuracy for fused silica. The stated accuracy belongs to that experiment, not this page's proposed setup.
- JCGM 100:2008, sections 4 and 5: accessible standard text read. The covariance and uncertainty framework supports the budget; repeatability alone is not the entire uncertainty.
- ARTeMIS Modal official EMA documentation: full short page read. It describes FRF, modal validation and coherence checks. Vendor documentation supports tool capabilities, not independent evidence for an unexplained position effect.

## Acceptance limits for the page

Accept a simulator/calculator page when all synthetic results are labeled, the instrument band and modes are explicit, the protocol includes return/sham/remount/thermal controls, and no statistic is described as captured real data. Keep the location-dependent intrinsic-frequency hypothesis unresolved until actual calibrated repeated data exist. Do not label a conceptual rendering or an AI literature suggestion an experimental discovery.


---

# Copper sphere: a reproducible, bounded spectral model

This package verifies a calculation and supplies synthetic controls. No copper sphere has been measured. The new work applies established elastic-sphere theory; scientific novelty is not asserted.

## The measurable question

At two marked positions A and B, does the fitted frequency of the *same identified mechanical mode* change after accounting for temperature, support, orientation, excitation, optical geometry and clock drift? A material point on a table has a frequency-dependent response to excitation, rather than one context-free “true frequency.” A finite measurement can report a calibrated channel over a specified bandwidth and noise floor; it cannot capture every mechanical, electromagnetic, atomic and other degree of freedom.

Translation in a homogeneous environment does not change the ideal free object's elastic eigenvalues. In the model, translating both its domain and displacement coordinates preserves the elastic differential operator and traction boundary condition. Real spatial gradients and changed contacts can break those premises. Ordinary changed spectral amplitude is also possible without changed eigenvalues.

## Scope frozen for the calculator

The material is an effective homogeneous isotropic linear elastic solid, with Young's modulus E, Poisson ratio nu, density rho and radius R. The surface has zero imposed traction. The calculator returns the first three positive roots in the spherically symmetric spheroidal family, angular index l=0. These are radial breathing modes. They are neither the three lowest modes of the entire sphere nor integer harmonics. Torsional and other spheroidal families, anisotropy, damping-dependent complex eigenvalues, oxide layers, air loading and support effects are outside this calculation.

Chemical purity does not ensure elastic isotropy. A single copper crystal is anisotropic; a polycrystal can have texture, large grains and residual stress. E, nu and rho in this model need sample-specific measurement or justified effective values before precision predictions.

## Derivation

Use SI units. The Lamé constants and sound speeds are

\[
\mu=\frac{E}{2(1+\nu)},\qquad
\lambda=\frac{E\nu}{(1+\nu)(1-2\nu)},\qquad
c_T=\sqrt{\mu/\rho},\quad c_L=\sqrt{(\lambda+2\mu)/\rho}.
\]

The elastodynamic equation is

\[
\rho\,\partial_t^2\mathbf u=(\lambda+\mu)\nabla(\nabla\cdot\mathbf u)+\mu\nabla^2\mathbf u.
\]

A regular radial solution has \(u_r=A j_1(k_Lr)e^{i\omega t}\), with \(k_L=\omega/c_L\). The radial traction is

\[
\sigma_{rr}=(\lambda+2\mu)\partial_r u_r+2\lambda u_r/r.
\]

Using \(j'_1(z)=j_0(z)-2j_1(z)/z\), zero traction at R gives

\[
xj_0(x)-4qj_1(x)=0,\quad x=\omega R/c_L,\quad q=(c_T/c_L)^2.
\]

For positive x this is equivalently

\[
(x^2-4q)\sin x+4qx\cos x=0.
\]

The apparent root x=0 of the multiplied equation is excluded. Code uses the regularized characteristic \(g(x)=\sin(x)/x-4q[\sin(x)-x\cos(x)]/x^3\), with its analytic small-x series. The browser bisects one positive root in each of the first three intervals \((n\pi,(n+1)\pi)\), n=0,1,2. The independent Python calculation uses SciPy's spherical Bessel functions and Brent's method.

The cyclic frequencies and sphere mass are

\[
f_n=\frac{x_nc_L}{2\pi R},\qquad m=\frac43\pi R^3\rho.
\]

These equations agree with the l=0 reduction of Saviot and Murray's free-sphere boundary condition (2005, Section II). The separate l>0 determinant must not be treated as a breathing-mode equation. The CNRS calculator also warns that a commonly cited textbook's l=0 expression is incorrect.

## Illustrative copper input and output

R=12.5 mm, E=123.5 GPa, nu=0.35, rho=8960 kg/m³. E and nu are rounded literature averages from Ledbetter and Naimon (1974), Table 10; density is an illustrative ordinary copper value consistent with sample values in that compilation. They are not a certificate for an unknown purchased ball. Independently averaged E, G, bulk modulus and nu in the source need not satisfy one exact identity; this implementation uses only E and nu and derives the other moduli consistently.

| Quantity | Model result |
|---|---:|
| Mass | 0.07330382858 kg |
| Longitudinal speed | 4703.364541 m/s |
| Transverse speed | 2259.423242 m/s |
| First radial root | 2.78117692164 |
| First radial breathing frequency | 166551.0505 Hz |
| Second radial family frequency | 367096.7937 Hz |
| Third radial family frequency | 558432.0580 Hz |

An ordinary 48 kHz audio interface cannot acquire these bulk-mode frequencies. A declared 200 kHz analysis band covers the first listed mode only. Capturing all three requires a higher verified analog bandwidth, sampling rate and suitable excitation/detection; the strict Nyquist inequality is necessary but does not establish an adequate instrument chain.

## Sampling and uncertainty

For declared band f_max and rate f_s, require f_s>2 f_max and a suitable anti-alias filter. The selected target mode must also lie inside f_max. With duration T, Fourier-bin spacing is 1/T. It is not a universal bound on fitted-frequency uncertainty; noise, damping, model fit, clocks and repeated observations matter. For the oscillator convention Q=1/(2 zeta), the amplitude ringdown e-folding time is Q/(pi f_n), where f_n is the undamped natural frequency. The usual linewidth estimate f_n/Q assumes weak damping.

At fixed nu, \(f\propto R^{-1}E^{1/2}\rho^{-1/2}\). First-order independent-input propagation gives

\[
(u_f/f)^2=(u_R/R)^2+(u_E/2E)^2+(u_\rho/2\rho)^2+
\left(\partial_\nu\ln f\;u_\nu\right)^2.
\]

The calculator's Poisson sensitivity includes the changing characteristic root, not just c_L. It is checked against implicit differentiation. Add covariance terms when inputs are correlated. This propagated model uncertainty excludes anisotropy and support bias, and is distinct from a paired A/B experimental uncertainty where common calibrations can cancel.

For thermal drift,

\[
\frac{d\ln f}{dT}=-\alpha_R+\tfrac12\frac{d\ln E}{dT}
-\tfrac12\frac{d\ln\rho}{dT}+\partial_\nu\ln f\frac{d\nu}{dT}.
\]

If mass is constant and thermal expansion is isotropic, \(d\ln\rho/dT=-3\alpha_R\), so the geometric/density contribution together is +alpha_R/2. Reporting only -alpha_R as copper's frequency temperature coefficient would be incorrect. Use measured mode-specific thermal coefficients for the actual specimen and temperature range.

## Synthetic spectra and falsifiers

The plotted illustrative transfer is a complex sum

\[
H(f)=\sum_j\frac{a_j}{1-(f/f_j)^2+i f/(Qf_j)}.
\]

These normalized modal responses have no calibrated displacement units. In the observation-path scenario, only residues a_j change: the highest peak can jump from one mode to another while every f_j remains fixed. In the support scenario, a deliberately simplified independent spring model uses

\[
f'_j=\frac1{2\pi}\sqrt{(2\pi f_j)^2+k/m_{\rm eff}}.
\]

Here m_eff is explicitly chosen to equal the sphere's total mass for illustration. A real Lamb mode has a mode-shape-dependent effective mass and contact coupling. This toy does not predict the measured frequency shift of a copper sphere on a table. No experimental data are implied. k=0 is an exact null control; positive k shifts the toy modes upward. Changing residues at k=0 must leave intrinsic poles unchanged.

## Experimental interpretation

An air-bearing carriage reduces horizontal sliding resistance; it does not remove sphere support forces, air pressure, acoustic coupling or damping. Transport the same marked cradle and ball without rolling the sphere, hold orientation and optical incidence fixed, stop and settle before acquisition, and monitor temperature. Moving while recording introduces nonstationarity and potential Doppler effects.

Separate a low-frequency tabletop survey from ultrasonic sphere-mode measurements. Map table acceleration or velocity spectra and force-normalized response at A/B with the object absent; then measure the supported ball; then repeat with a second mounting condition. Fit an identified mode and its shape/polarization rather than comparing the tallest raw FFT peak. A voltage-to-velocity transfer is not a force-to-velocity mechanical mobility unless the excitation force is calibrated.

Use a position sequence that includes returns, remounts and reference observations. If A/B changes disappear after support or optical-path matching, the data support a coupling explanation. A persistent residual requires an explicit uncertainty budget and independent replication. A null result reports the detectable shift threshold in the selected band, not proof that all possible frequencies are identical.

## Reproduction

`python -B verify_physics.py --model /absolute/path/model.mjs --check /absolute/path/physics-verification.json`

The verifier runs 29 material/geometry cases against an independent spherical-Bessel formulation, scaling identities, invalid inputs, sampling limits, synthetic null/perturbation controls and an independent implicit derivative. The maximum observed relative frequency difference is about 3.2e-14. That number measures implementation agreement for this model, not the prediction's accuracy for a real copper specimen.


---

# Copper sphere position spectroscopy: source review

Research cut-off: **21 October 2026** (America/New_York client date). Source review by the `position_sources` model-agent. This is a selected primary-source review, not an exhaustive literature search or human peer review. `evidence.json` is the UI-ready record: 19 sources, 10 topic nodes and 27 typed edges.

## What the sources change about the design

The defensible target is **the same object's measured modal response at two controlled positions**, within named sensor channels and bandwidths. RUS already measures material-dependent elastic modes, and spatial modal response changes with source and receiver positions. A point on the table therefore needs a specified local acceleration/displacement spectrum or a transfer function, not a purported single intrinsic point frequency.

The strongest material-specific precedent is Reese et al., IEEE TUFFC (2008), which reports noncontact laser RUS on high-purity polycrystalline copper. It measured 40 of the first 50 modes. This directly supports an optical modal-measurement approach while illustrating incomplete mode visibility. Its reported agreement is not an accuracy guarantee for our proposed apparatus.

Tian, Ogi and Hirao, JAP (2004), explicitly models an elastic sphere with contacts and compares measured resonance shifts. This means support stiffness, contact area and preload must be tracked before interpreting A/B differences. A low-friction translation platform addresses motion along the table; it does not automatically make the sphere's elastic boundary traction-free. A stationary acquisition after settling avoids confusing translational motion, changing optical speckle and friction transients with internal modes.

Pastor-Cintas et al., Measurement (2024), measures temperature-dependent modes and optical-path limitations. Log sphere/support temperature and preserve sensor angle and optical path. The paper's polymer coefficients must not be copied to copper. Li et al., Applied Optics (2025), demonstrates simultaneous multipoint phase-sensitive LDV, which is useful for mode shapes; its 25 kHz upper band is an explicit limitation, not a promise to capture high-frequency copper modes.

Practical inference should use the same force/response convention at A and B. SciPy `csd(force, response)` uses conjugate(force FFT) × response FFT; `H1 = Pxy/Pxx` therefore retains the intended phase. Record phase, coherence, mode shape and repeated estimates, not merely the largest spectral bin. A coherence close to one is not by itself a causal test.

## Recent AI releases and leading conferences

The requested OpenAI release is identifiable: **Sharing AI progress in mathematics**, 6 October 2026, updated 15 October. Official repository `openai/math` was checked at commit `1581d4cbdd69a0faf34b2089614fe2a814316a6a`, dated 12 October. The README at that snapshot describes 719 manuscripts in 372 families and varying verification states. This review did not audit all manuscripts.

Family **372, Global Uniqueness for the Smooth Isotropic Elasticity Inverse Problem**, is specifically relevant to inverse identifiability. The authors report uniqueness from the **full static boundary displacement-to-traction map** for smooth isotropic Lamé moduli under positivity assumptions. Their scope note explicitly does not supply a reconstruction algorithm. A finite-band pair of spectra is not that data object. The mathematical proof and Lean build were not checked in this task, and the claim is not a premise for the calculator.

No comparable single Anthropic bulk mathematics release was established by this targeted search. The page instead includes specific official recent work: September 4 FLT formalization and October 16 quantum-circuit design (arXiv submission October 15). Dependency graphs, independent statement checking and executable evaluators inform this project's method. Neither provides copper measurements or a physical location law.

Two accepted leading-ML-conference sources are included with their actual venues:

- **PI-DION, ICLR 2025 main conference**: a PDE inverse-operator method with measurement and physics residuals and problem-specific stability assumptions. The checked theory examples are not a theorem about finite copper spectra. It is a future modeling option, not a shortcut around identifiability.
- **LNO, NeurIPS 2024 main conference**: a latent forward/inverse PDE surrogate that can evaluate at requested spatial points. A copper application would require a validated forward simulator and held-out geometry/support/temperature tests.

Direct experimental papers in specialist journals are prioritized over less relevant conference novelty. There is no universal cross-field “Tier A” label; venue, peer-review status, reading depth and limits are explicit.

## Tools and scope of verification

- **SciPy**: spectral estimation API and complex convention inspected; the production calculator should pin its numerical environment.
- **pyFRF** (`ladisk/pyFRF`, MIT): structural FRF estimators. Repository/API reviewed; not installed or benchmarked in this source task.
- **pyOMA2** (`dagghe/pyOMA2`, MIT code; JOSS paper CC BY 4.0): ambient modal analysis. Assumptions about excitation and stationarity still apply.
- **SfePy** (`sfepy/sfepy`, BSD-3-Clause): future anisotropic sphere/cradle/table finite-element model. No completed FEM run is implied.

No equipment purchase, external message, public upload or repository mutation was performed by this agent. No physical A/B experiment has been run. The page should label simulator outputs as simulations and the residual position hypothesis as unresolved.

## Access and verification notes

Direct full-text sections were inspected for RUS theory (2004), sphere contact (2004), ceramic ball conference setup (2008), climatic modal testing (2024) and PI-DION (2025). The copper-specific source was read through its institutional abstract. The 2025 multibeam LDV source was read through publisher abstract/history/data availability. The September 2026 plate-FRF preprint is retained as a recent lead with search-indexed abstract only because direct retrieval failed. Its dataset was not replayed.

OpenReview browser challenges and some raw-GitHub fetch failures were recorded through the narrower reading-depth fields, not silently treated as full-text reads. Official ICLR/NeurIPS proceedings replaced challenged OpenReview pages. Sources contain paraphrases and links, not republished paper PDFs.

The evidence graph's edges mean “supports a method,” “provides a control,” or “informs verification.” They do not assert that a topic has been newly discovered by this project. Established methods, reported preprints, proposed work and unresolved hypotheses have different labels.


---

# Advisor decision: position spectroscopy

Research cutoff: 21 October 2026. This is a new bounded experiment-design page, not an additional Yang–Mills research loop. The historical Tesla and Newton skills guided mechanism specification and inverse-inference criticism. Separate model agents produced the mathematical implementation, source review, experimental skepticism and analysis tools. The coordinating agent implemented the interface and integrated the outputs. No historical scientist participated; no human peer review or hardware experiment is claimed.

## Accepted scope

1. **A defined observation.** Measure finite-band surface velocity, calibrated force-to-velocity transfer where a force reference exists, table acceleration, and separate environmental channels. A point on a table has a spatial transfer function for a specified source and sensor configuration. No universal scalar “frequency of the location” is assumed.
2. **A checked ideal model.** The first three positive radial breathing roots of a homogeneous, isotropic, traction-free sphere are computed from the radial stress boundary condition. For representative copper inputs, the first is about 166.551 kHz. It is not necessarily the lowest mode of the sphere. Numerical agreement does not remove specimen anisotropy, support loading or uncertain material constants.
3. **A discriminating counterexample.** The synthetic readout can switch its tallest peak while all poles remain unchanged. A separate added-spring example changes poles, using an explicitly assumed effective mass. It does not calibrate a real contact.
4. **A testable protocol.** Stationary acquisitions after translation, balanced randomized ABBA/BAAB blocks, return, sham, remount, rotation, thermal and reference controls. A low-friction carriage still supports the sphere; it is not a traction-free boundary. A difference must survive known confounds before a new physical interpretation is considered.
5. **Reproducible analysis.** H1, coherence and table PSD from synchronized calibrated input channels; matched-mode block differences and a Student-t sampling interval. The tools do not acquire hardware or fit the entire sphere spectrum. The relative force-PSD division guard is not an instrument noise-floor test.

## Review-driven changes

The skeptic's derivation and control examples were frozen before producer inspection. Subsequent review found two concrete software issues: low-Q plotting neighborhoods could include negative frequencies, and the sampling plan did not separately check whether the chosen mode lay within the declared band. Both were repaired and independently checked. The analyst's excitation flag was clarified to distinguish numerical validity from physical SNR. The simple sampling checker is therefore described as a numerical planning aid, not a calibration approval.

For the default specimen, the 200 kHz analysis band covers only the first displayed radial mode. The three-mode response illustration extends beyond it and remains synthetic. Ordinary audio microphones cannot measure these illustrative bulk radial modes. In the ultrasonic tier, voltage-normalized piezo response has units (m/s)/V; it becomes mechanical mobility only with a valid force calibration. Excitation contact and preload must be modeled or measured.

## Source interpretation

Direct elastic-sphere, copper RUS, contact, thermal and metrology sources guide the apparatus. Actual venues and reading depths are recorded. Selected accepted ICLR/NeurIPS papers inform future inverse modeling under their own assumptions; they are not validation of this apparatus. The official October OpenAI mathematics release is identified, including a reported full-boundary-data elasticity uniqueness result. That data class is far richer than two spectra, and its proof has not been audited here. Specific Anthropic mathematics and quantum-circuit reports illustrate independently evaluated computational workflows. No unspecified equivalent Anthropic paper dump is invented.

## What has and has not been resolved

The numerical implementation, parameter conversions, scaling and wrong-inference examples are reproducible within their declared models. They are applications and demonstrations of established mechanics and statistical methods, not asserted new laws or verified scientific priority. The page's contribution is the integrated apparatus contract, executable controls, calculators, source network and data-analysis workflow.

No position-dependent intrinsic frequency effect has been measured. Full elastic-tensor recovery, complete modal reconstruction, calibrated achievable precision, experimental sample size and any residual unexplained position effect remain open. A null result must be reported with its interval and scope; absence of a statistically resolved shift is not automatically proof of equivalence.

## Verification record

`physics-verification.json` records the producer's independent-formula numerical checks; `postreview-model-results.json` records the separate skeptic's 312-root sweep. The `initial-review/` directory preserves the pre-comparison evidence. `analysis/verification.json` records synthetic CLI runs and tests. Final interface and release checks are recorded separately in `verification.json`; source hashes bind the reviewed files. This distinction prevents a passing calculation from being described as a completed physical experiment.

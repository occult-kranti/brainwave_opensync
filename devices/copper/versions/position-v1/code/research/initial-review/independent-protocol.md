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

# Copper sphere: a position-comparison measurement protocol

Status: proposed experiment, not built or measured. Research snapshot: 21 October 2026. The drawings are deterministic engineering schematics, not photographs, scale drawings, approved apparatus plans or evidence of a working device. All apparatus dimensions and trial counts below are design choices unless explicitly attributed.

## Define the observation before building

The target is a position contrast in an identified mechanical mode, measured in hertz, with a declared uncertainty. Also retain response amplitude, phase and damping. There is no defined instrument that captures the “entire frequency” of a material object or the “true frequency” of a point. A finite set of sensors sees selected channels over finite time and bandwidth. A table location can have a local mechanical mobility or acoustic transfer function, but this depends on the drive, boundaries and receiver.

Keep three questions separate:

1. **Intrinsic-mode comparison:** does the same sphere's fitted elastic mode change between A and B after matched boundary conditions and environmental corrections?
2. **Coupled-response mapping:** how does the measured sphere-plus-support-plus-table response vary with placement and detector geometry?
3. **Directed-motion claim:** does an applied signal associated with B produce reproducible movement from A toward B after ordinary forces and drift are controlled?

A positive result in question 2 does not answer question 1 or 3. A null result bounds only the tested observable, frequency interval and apparatus conditions.

## Specimens and geometry

The located Bashar transcript describes a thin hollow copper sphere roughly 3–4 inches in diameter on a very flat 6–10 foot table. Its relocation claim remains a source assertion. The user's solid copper ball is a separate reference geometry. Keep a specimen ledger with material certificate or supplier description, mass, measured outer diameter, roundness, wall thickness if known, seam locations, dents, finish and orientation marks. “Pure copper” specifies composition only; it does not establish isotropy, absence of residual stress, perfect geometry or one vibration frequency.

For the thin-shell calculation, the radius is the **midsurface radius**. An illustrative shell may use R = 44.45 mm and t = 0.5 mm; these are model inputs, not dimensions measured from a Bashar demonstration. For a solid reference, choose a separate measured radius and mass. Do not compare a hollow shell against a solid-sphere formula.

## Setup A: matched stationary modal measurements

The `setup.svg` drawing shows one sphere at two successive positions on an illustrative 2 m table. A and B are never two simultaneous specimens. Use a portable carrier with three low-contact-area compliant supports; move the same carrier, support pieces and specimen orientation together. Record support geometry and preload. Supports perturb modes, so confirm that their influence is small in the selected band by deliberately changing support compliance in a separate run. A separate direct-on-table run tests contact coupling; do not merge it with the carrier data.

The primary optical receiver is a laser Doppler vibrometer (LDV). A fixture preserving relative beam spot, direction and working distance moves between stations with the measurement arrangement. The LDV measures velocity projected along its beam, not all components of motion. A laboratory-fixed, re-aimed LDV provides a separate geometry-sensitivity control. Use the same validated optical finish at both positions; adding reflective tape changes the specimen and must be documented. An instrumented excitation channel measures the delivered input. A low-level impact can be useful only where its force spectrum and calibration cover the selected mode. For ultrasonic modes beyond that range, use an appropriate calibrated transducer or specialist noncontact excitation; the presence of an electrical drive command alone is not a calibrated force measurement.

Record table vibration with a reference accelerometer. Its mass belongs on the table, not the sphere. Keep the optical instrument support mechanically quiet and characterize any reference-head motion. Record specimen temperature before and after each block without silently adding a new attached sensor load. Ambient temperature alone is insufficient to prove specimen temperature. Thermometry method and uncertainty must be documented, especially for reflective copper. Record humidity, room airflow, table height and clock/timebase checks.

Soft support, an air bearing and a low-friction track are different boundary conditions. An air bearing can add stiffness, pressure variations, airflow and noise. It cannot be assumed to reproduce a freely vibrating isolated sphere. Low friction is relevant primarily to the separate motion test, not a guarantee of unperturbed elastic spectra.

## Acquisition and analysis

Select the band after predicting the relevant mode and checking excitation and receiver bandwidth. The thin-shell breathing example is in the ultrasonic or near-ultrasonic region; a small solid copper sphere can have a much higher breathing frequency. A phone microphone cannot be assumed to measure either model completely. Use calibrated sensors, analog anti-alias filtering and a shared clock. Require sampling above twice the highest retained frequency, with a practical transition-band margin from the actual anti-alias filter. For example, a 0–250 kHz target band could use a 1 MS/s acquisition **if** its calibrated analog chain supports that band; this is an engineering example, not a universal purchase specification.

Choose duration from the expected linewidth, decay time and desired estimator uncertainty. The FFT bin spacing is 1/T for record length T. Zero-padding creates more displayed points without adding measurement information; bin spacing is not a complete frequency-uncertainty estimate. Store raw synchronized signals, calibration factors, units, windows, sampling rate, record length, signal levels and rejection reasons.

Where force F and velocity v are calibrated, estimate mechanical mobility H(f) = V(f)/F(f), in (m/s)/N, using an appropriate cross-spectral estimator for the noise assumptions. Report input spectral coverage and coherence alongside magnitude and phase. If only actuator voltage is known, report V(f)/U(f) in (m/s)/V and identify the unknown actuator transfer. If a microphone is used, its calibrated pressure spectrum has units Pa or a stated PSD unit; it incorporates acoustic propagation. Never label all such channels “object frequency.”

Fit matched modes and damping across repeat records; compare fitted poles and mode-shape participation, not simply the tallest FFT bin. A different sensor position can suppress one mode and promote another. Extend measurements to several surface points if mode identity is ambiguous. An LDV is noncontact, but it still measures a projection and requires line-of-sight and adequate optical return.

## Order, controls and uncertainty

A pilot block establishes repeatability and usable bands. Freeze mode-selection and data-rejection rules before the confirmatory comparison. A practical pilot is 12 ABBA blocks, with block direction randomized and paired records close in time; 12 is a proposed starting count, not a statistical power calculation. Use the pilot variance and a predefined smallest effect of interest to plan the confirmatory sample size. ABBA cancels a linear drift only under matched timing and the appropriate paired contrast; it does not remove nonlinear drift or position-correlated temperature.

Use controls that distinguish explanations:

- Keep A fixed and repeat after the same handling and waiting time. This estimates drift and repositioning error without changing location.
- Move the entire portable sphere/support/sensor geometry. Then repeat with the receiver fixed in the room. A change confined to the second arrangement implicates measurement geometry or propagation.
- Rotate the sphere while keeping the station fixed. Repeat with altered support compliance in separate blocks. This tests orientation, seams, anisotropy and loading.
- Swap A and B labels, reverse order, and if feasible rotate or translate the table relative to the room. A “table coordinate” and a “room coordinate” are different claims.
- Introduce a small measured temperature change as a positive control for spectral sensitivity. Model it with specimen-specific elastic-temperature data where available. Do not treat an illustrative coefficient as a calibrated copper constant.
- Measure the empty table and the support alone. These spectra help identify apparatus modes, but subtracting them does not automatically uncouple the loaded system.

For each matched mode, report the paired A–B contrast, uncertainty interval, repeatability, temperature sensitivity, clock uncertainty, fit sensitivity, repositioning variability and known correlations. Shared-clock error may cancel in a close ratio more than in an absolute frequency; do not count correlated errors twice or assume perfect cancellation. A statistically detectable change is not automatically a new force or a universal location signature. Unexplained residuals are candidates for replication with a new apparatus.

## Setup B: independent motion test

Use `movementtest.svg` only after the stationary spectral measurements are reproducible. Track position x(t) and velocity with a calibrated overhead camera. The modal carrier is removed or replaced by a separately characterized low-friction arrangement; that changes the experiment and must be recorded. Predefine target coordinates, endpoint tolerance, observation duration and drift rejection rules. The laboratory-fixed source must have recorded direction and amplitude.

Randomize sham/off, proposed target signal and detuned signals at matched delivered input; blind the analyst to the destination and condition. Reverse source direction, measure residual slope, reduce and monitor airflow, and rotate the apparatus relative to the room. Acoustic radiation force, contact vibration, air currents, residual incline, electromagnetic force and handling impulses can all move a sphere. Recording movement alone does not identify the mechanism. No motion data have been collected for this project.

## Practical tool tiers

**Exploratory:** a documented copper object, stable table, basic thermometer, measurement microphone or piezo pickup and audio interface can teach contact/room/receiver confounds in the audible band. They do not validate ultrasonic breathing modes or a complete object signature. Attached pickups alter mass and boundary loading.

**Laboratory:** characterized specimen, calibrated LDV or suitable ultrasonic receiver, excitation appropriate to the band, synchronized multichannel DAQ, analog filters, force/drive reference, table accelerometer, thermometry, positioning fixtures and timebase validation. Ordinary calibration certificates and bandwidth checks matter more than a marketing frequency label. Specialist EMAR provides one established route to noncontact excitation of conducting specimens, but its field geometry selects modes and changes the full measurement system.

**Software:** archive lossless raw channels and machine-readable metadata. Standard FFT/cross-spectrum and curve-fitting tools are sufficient for an initial analysis; neural inverse methods are optional and require held-out validation. The website is a forward-model demonstrator and does not claim to be a calibrated DAQ or a validated full elastic-mode solver.

## Sources and reading depth

- **M1: Polytec, Laser Doppler vibrometry**, official instrument-principle documentation. Read the velocity/displacement and Doppler/interferometer descriptions. Supports the single-channel optical readout concept, not a complete spectrum or destination mapping. https://www.polytec.com/en/vibrometry/know-how/laser-doppler-vibrometry
- **M2: Brüel & Kjær, Structural Testing Part 1: Mechanical Mobility Measurements, br0458**, official technical primer. Read the source/path/receiver distinction, signal versus system analysis and impact-bandwidth passages. Supports measured input and frequency-response analysis. https://www.bksv.com/doc/br0458.pdf
- **M3: H. Ogi, H. Ledbetter, S. Kim and M. Hirao (1999), Contactless Mode-Selective Resonance Ultrasound Spectroscopy: Electromagnetic Acoustic Resonance, JASA 106(2)**. Read the NIST publication abstract, not the full paper. It reports noncontact excitation/detection and comparison with ordinary RUS for a copper monocrystal; it does not test absolute position. https://www.nist.gov/publications/contactless-mode-selective-resonance-ultrasound-spectroscopy-electromagnetic-acoustic
- **M4: X. Ma, X. Tang, Z. Wang and D. Gao (2017), Investigation of natural frequencies of laser inertial confinement fusion capsules using resonant ultrasound spectroscopy, Fusion Engineering and Design**, doi:10.1016/j.fusengdes.2016.12.007. Publisher search-index excerpt and bibliographic metadata located; direct publisher text returned HTTP403, so full equations and measurements were not independently inspected. Search excerpt identifies a hollow copper sphere. This is a relevant reading lead, not a validated fixture for our thin-shell calculation. https://doi.org/10.1016/j.fusengdes.2016.12.007

The source-specific summaries above are deliberately narrow. The experimental design, controls and acceptance criteria are this project's proposal and have not undergone physical validation.

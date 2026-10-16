# Magnetic support, quantum motion and institutional media

Audit date: 16 October 2026. This is a selected primary-source review, not an exhaustive corpus or an independent replication. The seven source records in `src/levitation/quantum-media.ts` identify what was actually read. A `measured` label means that the authors report a measurement; it does not mean OpenSync performed it.

## What the mechanism must explain

Levitation means a specified object is supported without an ordinary contact support. A claim must identify the upward force, reaction path, equilibrium and stability. A material can remain subject to gravity while another force balances its weight. Reduced mechanical contact does not establish lossless motion, an unlimited energy source or gravitational shielding.

For the browser's small, isotropic, weak-susceptibility approximation, with upward coordinate z:

\[
U=\rho Vgz-\frac{\chi V B^2}{2\mu_0},\qquad
F_z=\frac{\chi V}{2\mu_0}\partial_z B^2-\rho Vg.
\]

Here χ is dimensionless, ρ is kg/m³, V is m³, B is T, its squared gradient is T²/m, U is J and F is N. With χ<0 an upward magnetic force requires a negative squared-field gradient. Volume cancels from the force-to-weight ratio under these assumptions. At equilibrium, a positive-definite Hessian of U is a sufficient nondegenerate local stability condition. The current local-gradient calculator does not supply that Hessian or a complete field geometry. [Berry & Geim, sections 2–3](https://www.physics.umd.edu/grt/taj/411c/FlyingFrogs.pdf).

Superconducting response needs a separate model. Flux expulsion and history-dependent pinned flux cannot be replaced indiscriminately by the weak-χ approximation. In the reviewed disk calculation, force follows spatial currents and magnetic field; the magnitude law E=Ec(|J|/Jc)^n models creep. E is V/m, J is A/m² and n is dimensionless; the vector direction/sign must be restored in a numerical implementation. Local stiffness is −∂Fz/∂z in N/m. This nonlinear, history-dependent model is not implemented in the browser. [Qin et al., v2, sections II and III D–E](https://arxiv.org/abs/cond-mat/0111316v2).

The [Wang et al. experiment](https://arxiv.org/abs/1810.08748v5) supplies an instructive counterexample: positional trapping by pinned flux may hinder the nearly free precession desired for sensing. A stable position is not automatically a useful force sensor.

## What makes an observed result quantum

An optically trapped particle can first behave as a classical oscillator. A quantum claim requires a calibrated observable, not the word “levitated.” For a harmonic motional mode, Ē=ℏΩ(n̄+1/2), with Ω in rad/s. Its zero-point position scale is √(ℏ/(2mΩ)), in metres. Neither expression changes the gravitational force term. Mean occupation below one does not imply every realization is exactly in the ground state.

The source set samples different endpoints:

| Primary source | Endpoint and inspected scope | Critical boundary |
| --- | --- | --- |
| [Delić et al., author manuscript; Science 2020](https://arxiv.org/abs/1911.04406) | One motional mode; opening force argument and sideband/noise analysis | Correct cavity response and noise before inferring occupation. |
| [Tebbenjohanns et al., Nature 2021 author manuscript](https://arxiv.org/abs/2103.03853) | Feedback cooling; sideband and cross-correlation thermometry, figures 2–3 | An independent readout matters because feedback can suppress its own measured error. |
| [Kamba et al., arXiv v1 / Science 2025](https://arxiv.org/abs/2504.17944v1) | Mechanical velocity variance; main-text result and position calibration | Quadrature squeezing is distinct from cooling both conjugate variables. |
| [Pontin et al., arXiv v1](https://arxiv.org/abs/2604.26790v1) | Optical covariance; main-text measurement and phase-noise model | Optical squeezing is a different endpoint from mechanical squeezing; analysis reuses an earlier dataset. |

For calibrated, background-corrected sideband powers, P_AS/P_S=n̄/(n̄+1). Raw detector asymmetry alone is insufficient. A variance ratio uses 10 log10(V/Vref) dB, not the amplitude-ratio 20 log10 rule. Position and momentum satisfy ΔxΔp≥ℏ/2; a squeezed quadrature must be interpreted with its conjugate, state preparation and calibration. These mathematical statements specify observables, not a source of extractable free energy.

Kamba's publication date and DOI were checked separately in the [bibliographic record](https://pubmed.ncbi.nlm.nih.gov/40966342/); the inspected HTML is arXiv v1, not a line-by-line audit of the journal article. The [APS accepted-paper page](https://journals.aps.org/pra/accepted/10.1103/hms3-yb2h) lists Pontin et al. as accepted on 13 October 2026. Acceptance was verified, but the inspected full text remains the April author version. Generated date strings inside rendered manuscripts were not substituted for archive submission metadata.

## Media access ledger

### NASA/JPL Cold Atom Lab explainer

[Official video page](https://www.jpl.nasa.gov/videos/how-atoms-are-defying-gravity-in-nasas-cold-atom-lab/), 12 August 2024; NASA/JPL-Caltech; YouTube W52uRtFLBts. The narrator is unnamed. The entire official English transcript was read, including wave/particle discussion, the orbital laboratory, Bose–Einstein condensates and proposed applications. It is untimed: no timestamps were invented, and no audio/frame viewing is claimed.

Its “defying gravity” framing is outreach shorthand. [NASA's microgravity explanation](https://www.nasa.gov/centers-and-facilities/glenn/what-is-microgravity/) identifies free fall as the reason an orbiting laboratory experiences near weightlessness. It does not say the Earth's gravitational field is removed. Official custody establishes provenance, not a new force.

An additional [JPL upgrade video](https://www.jpl.nasa.gov/videos/working-remotely-how-astronauts-upgraded-a-complex-experiment-in-space/), 12 May 2020, has a complete official untimed transcript that was also read. It credits NASA/JPL-Caltech–ISS and identifies astronauts Christina Koch and Jessica Meir. The atom-interferometer upgrade concerns measurement of gravity. The anonymous ground speaker was not assigned a guessed identity.

### TU Delft levitation course: actual caption retrieval

[Official course page](https://ocw.tudelft.nl/course-lectures/1-3-2-video-levitation/) embeds [YouTube aJFHXhWMRio](https://www.youtube.com/watch?v=aJFHXhWMRio). Extracted metadata reports upload 27 January 2021, duration 581 s, and an asset title containing 2018; production date remains uncertain. The speaker introduces himself as Bas and a former Delft Hyperloop drivetrain engineer. A surname, professorship or NASA role was not inferred.

Using open-source **yt-dlp 2026.08.19**, the supplied `en` WebVTT caption track was downloaded successfully on the audit date. It identifies English and contains 12,020 bytes. The entire caption span **00:03.420–09:36.080** was read. This is retrieval of supplied captions, not a new speech-recognition transcript, and no audio comparison was performed.

| Caption segment | Paraphrased subject |
| --- | --- |
| 00:03.420–00:22.420 | Speaker introduction and teaching scope |
| 04:13.020–06:24.660 | Motion-induced currents, lift dependence and drag in the described EDS arrangement |
| 06:25.800–07:30.659 | Attractive electromagnetic suspension with feedback |
| 07:31.380–08:53.580 | Air bearings and their pressure/flow supply |

The raw VTT is a scratch research intermediate at `/tmp/opensync-media-audit/aJFHXhWMRio.en.vtt`, not a public asset. The lecture's transport examples do not cover every magnetic levitation mechanism. Its economic projections and historical speed claims were not audited and are not adopted as research conclusions.

### Ethan Schaler's FLOAT lecture: provenance only

[Caltech/KISS event page](https://www.kiss.caltech.edu/lectures/2022_Schaler.html), lecture held 11 July 2022. The biography identifies Ethan W. Schaler, PhD, as a JPL robotics mechanical engineer and NIAC Fellow at that time. The lecture abstract and biography were read. No spoken segment was inspected. A standard yt-dlp attempt followed the public redirect and returned **Unsupported URL**; no speech audio or captions were obtained. Whisper was not run without an input recording.

The inspected [JPL FLOAT project description](https://www-robotics.jpl.nasa.gov/what-we-do/research-tasks/flexible-levitation-track-float/) separates magnetic support over graphite from powered track propulsion. The proposed lunar system is not evidence of an operational lunar railway or antigravity.

For completeness, [NTRS record 20000069801](https://ntrs.nasa.gov/citations/20000069801) describes a 2000 MSFC electrostatic-levitation video, but lists no available downloads. Only its abstract/metadata were read. A mentioned video was not treated as an inspected video.

No account login, cookie borrowing, restriction bypass or paid-content access was attempted. Public outputs contain our summaries and provenance rather than full third-party transcripts. Official captions took precedence over unnecessary ASR; the unsuccessful lecture extraction was not relabeled as transcription.

## Two proposed tests and their limits

1. **Balance versus stability.** Hold the local vertical force fixed while comparing a saddle and a minimum. An unstable transverse direction falsifies a static-trap claim even at exact vertical balance. Arbitrary quadratic examples teach this distinction; a realizable magnetic trap additionally needs a Maxwell-consistent field map and material measurements.
2. **Quantum-signature null audit.** In future synthetic-data or licensed open-data analysis, inject response asymmetry, background and phase drift into known null states, then use fixed fitting rules and independent calibration. Test estimator bias and uncertainty coverage. This challenges an inference method; it does not allege that the cited measurements are artifacts.

Both experiments are proposals. Current local force calculations do not reproduce flux pinning, optomechanical cooling, detector noise, quantum-state tomography or the video's devices. Specialist replication would require an appropriate institution and validated equipment; no cryogenic, high-field or laser construction procedure is supplied here.

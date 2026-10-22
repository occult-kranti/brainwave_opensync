# Measuring a spectrum: expansion experiment plan

22 October 2026. Proposed physical experiments and executed numerical controls are distinguished below. No physical apparatus was built, no copper-sphere measurements were collected, and no scientific novelty is claimed. The three generated apparatus images are illustrations; the deterministic diagrams specify signal topology.

## What can actually be captured

The target is a calibrated, finite-band input/output response and a fitted set of mode parameters with uncertainty. A solid or hollow sphere has different modal families. Their normal-mode frequencies generally are not integer multiples, so “harmonics” is not a synonym for its entire spectrum. Chemistry alone does not specify crystal texture, seams, residual stress, geometry or boundary conditions.

For a linear model, the measured response is

\[H_{ab}(\omega)=c_a^T(K-\omega^2M+i\omega D)^{-1}b_b.\]

The source vector \(b_b\), sensor direction \(c_a\), damping and support are part of the experiment. A mode can be unexcited or invisible in one channel. A finite response curve therefore cannot certify complete state capture. The inverse scaling \(K\to aK,M\to aM\) leaves eigenfrequencies unchanged; extra mass and geometry measurements are necessary for material inference. The independent review also records the rank-one log-sensitivity of one radial mode and explicit kernel directions.

## Proposed setups and discriminators

| Setup | Question and recorded observable | Control and failure criterion | Implemented preparation |
|---|---|---|---|
| Light-contact RUS reference | Which repeatable poles and damping values occur in a declared band? Record calibrated input and surface velocity. | Change contact preload gently within instrument limits; a shift reveals fixture loading. Empty-fixture and reference-specimen records identify spurious peaks. | Existing passive support model; proposed apparatus image. |
| Portable A/B frame | Does a preselected mode change after translating the whole matched source/support/readout assembly? | Balanced randomized ABBA blocks, A-to-A handling, shared timebase, temperature records and repeated days. A residual must exceed a justified uncertainty budget and survive held-out locations. | Mechanical comparison plus new covariance calculator. |
| Surface visibility scan | Does a missing peak appear at another measurement point or excitation direction? | Several documented points, fixed support and temperature, return to initial point. Fit common poles jointly; amplitude changes alone are not pole shifts. | Zero-readout-amplitude acquisition preset; precise visibility diagram. |
| Orientation versus position | Does an apparent A/B shift follow sphere orientation or a different member of a split mode group? | Rotate at A without translation; then translate at fixed orientation. Track the same modal family rather than a maximum bin. | Patent-informed hypothesis H8; no fabricated anisotropic simulation. |
| Sampling/reference check | Can the electronics reproduce a known in-band tone and reject out-of-band contamination? | Calibrated source, valid sensor range and analog filtering. Change sampling settings only within hardware specifications. | Exact numerical aliases, FFT against NumPy, record-length and window controls. |
| Linear-range check | Are fitted poles independent of drive strength over the chosen operating range? | Randomized safe amplitude order, measured input, temperature and baseline recovery. A shift requires a richer model before A/B interpretation. | Linear-model null prediction; nonlinear physical test remains proposed. |
| Independent input design | Do multiple source channels add identifiable information? | Check excitation spectral matrix rank and singular values, then use genuinely independent inputs. A perfect output fit from duplicate inputs does not identify their separate transfer functions. | pyFRF duplicate-input rank/nullity counterexample. |
| File and analysis repeatability | Are units, channel IDs and irregular frequency axes preserved through export/import? | Compare parsed values and metadata with the original; reject silent truncation or axis rounding. | pyuff roundtrip checks and documented adapter. |

## Acquisition contract

The browser generates \(x_n=\sum_j A_j e^{-\alpha_j n/f_s}\cos(2\pi f_jn/f_s+\phi_j)+\epsilon_n\). These are chosen damped oscillations in arbitrary sensor units, not a fitted elastic model. Seeded Gaussian noise is added after sampling. Analog filtering, ADC clipping, sensor transfer functions, colored noise and nonlinear response are not simulated.

It applies a rectangular or periodic Hann window and computes a one-sided amplitude FFT. The duration is \(N/f_s\), bin spacing \(f_s/N\), and noise bandwidth is \(f_s\sum w_n^2/(\sum w_n)^2\). These are different quantities. Zero padding would not improve the underlying information. Hann weighting can suppress the early part of a rapid ring-down; longer records can add little signal after decay. The largest FFT bin is not a fitted pole.

The comparison budget uses \(u^2(B-A)=u_A^2+u_B^2-2r u_Au_B\) within each named error category. Common clock effects can partly cancel; independent drift cannot be assumed to cancel. Cross-category independence is an explicit approximation. Do not count the same repeatability twice or convert an unknown deterministic bias into a random uncertainty without justification. The selected \(k u\) comparison threshold has no automatic confidence or power interpretation.

## Decisions after review

1. Keep the simple elastic model, with its selected modal family clearly labeled. Add the acquisition demonstration rather than pretending a smooth analytical curve is a measured spectrum.
2. Repair the small-root and small-argument modal-mass cancellation at extreme auxetic Poisson ratios. Copper defaults remain unchanged; the independent review records the additional high-precision fixtures.
3. Implement and independently test the FFT and covariance calculations. Add the fast-ringdown warning after the reviewer showed Hann-onset suppression.
4. Execute three external packages through a reproducible offline bench. The FEM result is a one-dimensional radial reduction with a convergence study, not a full three-dimensional anisotropic sphere model.
5. Preserve tool failures and adapters. Do not infer truth from a high coherence score, a successful pseudoinverse, or an apparently written data file.
6. Leave neural operators as documented optional methods until validated data and a costly forward model justify them. None replaces missing measurements.

## Source trail

The searchable register contains historical/patent links, reading depth and limitations. The most direct new sources are US4976148A (instrument artifacts), US5062296A (bounded-band signatures), US5355731A (split sphere modes), Tesla US517900A (temperature and source regulation), Theuss et al. PRL 132,066003 (measured geometry RUS), and JCGM100 covariance guidance. Links are in `data/sources.json`; the graph marks document, method and analogy edges separately. The name “Freidman” remains unresolved and is not silently replaced with Friedmann or Feynman.

This is a selected research expansion. Full books, every patent family and every available software package have not been reviewed or executed.

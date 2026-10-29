# Mathematical physics panel — Schumann round

Reviewer: math; frozen independent first round, 2026-10-29. Skills used: Newton analysis–synthesis and paired physics research. No other panel report was consulted. The calculations below are model calculations, not October 2026 station measurements.

## Model and wavelength definitions

For an ideal, thin, lossless spherical Earth–ionosphere cavity, the angular eigenfunctions have eigenvalue l(l+1), with l ≥ 1. Thus
\[
 k_l={\sqrt{l(l+1)}\over R},\qquad
 f_l={c\over2\pi R}\sqrt{l(l+1)},\qquad
 \lambda_{h,l}={2\pi R\over\sqrt{l(l+1)}}.
\]
Here λ_h is a characteristic horizontal modal wavelength; a global spherical harmonic is not a plane wave traveling along one selected loop. NASA's primary observation paper gives this ideal limit and explains that the conducting, lossy real cavity has lower modal frequencies. Its approximate observed mean values are 7.8, 14.3, 20.8, 27.3 and 33.8 Hz, with broad resonances. Those historical values are not a current station baseline. [S1]

Using c = 299,792,458 m/s and illustrative mean radius R = 6,371,000 m, independently executed arithmetic gives:

| l | Ideal frequency, Hz | Horizontal scale λ_h, km |
|---|---:|---:|
| 1 | 10.591275 | 28,305.607 |
| 2 | 18.344626 | 16,342.250 |
| 3 | 25.943218 | 11,555.716 |
| 4 | 33.492551 | 8,951.019 |
| 5 | 41.019830 | 7,308.476 |

The vacuum comparison c/(7.83 Hz) is 38,287.670 km, while 2πR is 40,030.174 km. These are different definitions, not evidence of an inconsistency. Real effective phase velocity is frequency-dependent and affected by conductivity. Replacing c by one constant fitted to a 7.8 Hz fundamental predicts 13.510, 19.106, 24.666 and 30.209 Hz for the next four modes. Its failure against the approximate historical sequence demonstrates the limitation of that simple common-speed model, not an anomaly.

## Eigenfrequency, ringdown and spectral maximum

For a normalized one-mode coordinate,
\[
 \ddot q+2\gamma\dot q+\omega_0^2q=F(t),\qquad
 H(\omega)={1\over\omega_0^2-\omega^2+2i\gamma\omega}.
\]
ω_0 is the undamped oscillator parameter, not automatically an observed peak. With white forcing and displacement readout,
\[
 \omega_{\rm peak}^2=\omega_0^2-2\gamma^2
\]
if positive; otherwise the maximum occurs at zero. The underdamped ringdown oscillation has
\[
 \omega_d^2=\omega_0^2-\gamma^2.
\]
For Q = ω_0/(2γ) = 5, the respective ratios to ω_0 are 0.9899495 and 0.9949874. Velocity readout multiplies the white-force displacement spectrum by ω² and peaks at ω_0. The electric and magnetic field channels in a real cavity require their actual transfer functions; this oscillator example is only a transparent discriminating control.

Koloskov et al. (published September 18, 2026) explicitly distinguish forced spectral maxima from cavity eigenvalues. Their specified source families and conductivity profile connect peak shifts to source–observer geometry; interference and nodal regions matter. Their inference is model-conditional, not a proof that one station's peak uniquely identifies a changed cavity. [S2]

A source-quality issue blocks copying their empirical formulas directly: the inspected HTML around Eq. (1) first defines Y as ln W but later duplicates the definition of X for Y. Eq. (2)'s distance-unit presentation also needs reconciliation before numerical reuse. These are limited formula-transcription/interpretation concerns, not a claim that the whole paper fails. The PDF was opened, but its corresponding equation typography was not independently resolved. [S2]

## Exact ambiguity of an output spectrum

For a scalar linear measurement on a chosen frequency band,
\[
 S_y=|G|^2|H_\theta|^2 S_F+S_N.
\]
Here G is sensor/readout response, θ contains cavity parameters, S_F is source power spectral density and S_N is additive noise power. Even with known G and zero noise, distinct transfer functions can yield exactly the same output:
\[
 S_{F,2}=S_{F,1}\left|{H_{\theta_1}\over H_{\theta_2}}\right|^2.
\]
This construction assumes nonzero finite transfer functions on the band and admissible nonnegative, integrable source spectra. It proves non-identifiability in that stated model class. It does not show that actual lightning adopted the constructed spectrum.

The corresponding reverse check is to restrict or independently measure forcing and calibrate G. Multiple outputs help only with explicit shared-source, transfer and noise assumptions. A sufficiently constrained input–output experiment, calibrated field ratios, or a measurable ringdown may separate parameters; availability of a natural cavity ringdown is itself an experimental question. Searching a finite grid is not a global uniqueness proof.

## Energy boundary

Frequency alone supplies no field amplitude and therefore no energy estimate. For a zero-mean ELF magnetic perturbation b around a static background B_0, the average magnetic energy increment is b_rms²/(2μ_0) when the cross term averages to zero. Earth's quasi-static field and Schumann ELF fields are distinct quantities. A standing, lossy cavity does not justify replacing the energy flux by the free-space traveling-wave formula without field and phase measurements.

The oscillator energy balance, in normalized units, is
\[
 E={1\over2}(\dot q^2+\omega_0^2q^2),\qquad
 \dot E=F\dot q-2\gamma\dot q^2.
\]
For physical mass m, multiply E by m and use physical applied force in the power term. Dissipation and any extracted load power require external input or depletion of stored energy. A fixed coil in a static magnetic field has no changing flux; motion or time variation introduces a drive whose energy must be included.

## Proposed adaptive research targets, not yet executed rounds

1. **Geometry and dispersion baseline:** implement the ideal shell and a deliberately wrong common-speed fit; test held-out modal ratios and distinguish λ_h from c/f. Require a real conductivity model before fitting station frequencies. Null: all modes retain the same cavity parameters.
2. **Forced-peak controls:** keep ω_0 fixed while varying γ, source color and measurement transfer. Compare analytic white-force displacement/velocity peaks and ringdown with computed spectra. Different nulls: unchanged forcing with changed readout; unchanged cavity with changed forcing. Neither is a detected terrestrial event.
3. **Reverse identifiability and energy:** construct equal output spectra for different θ by the formula above, then test which calibrated extra observable breaks the construction. Check energy-budget residuals under forcing and load. A failed inverse estimator is evidence about that estimator/model class, not universal impossibility.

Recent-event admission still requires station, UTC interval, calibrated observable, coverage and baseline. This mathematical review supplies no such October 23–29 observations and therefore confirms no recent anomaly. Source keys and reading depth are in sources.json.


# Acquisition and paired-frequency uncertainty

Research snapshot: 22 October 2026. This is an original, finite synthetic signal model. It extends the existing elastic-sphere and two-mode fixture model with an observation layer. No new physical sphere measurement, hardware calibration or complete-spectrum capture is claimed.

## What the earlier model did not test

The earlier response plot evaluated a chosen analytic frequency response on a dense grid. That is useful for showing coupling and projection, but it bypasses the actual recorder. It did not simulate sampling, a finite record, aliasing, windowing, measurement noise or a peak estimator. Dense plotted points were not experimental frequency resolution. The new acquisition sandbox exposes these limitations rather than identifying the previous ideal response curve with measured data.

The original elastic solver still omits nonradial sphere families, anisotropy, shell seams, fluid load, multiple support/table modes, frequency-dependent loss and nonlinear contact. This acquisition model does not repair those material assumptions. Input mode frequencies are specified independently; importing a sphere reference into this sandbox is a lightweight signal demonstration, not a validated transient solution of the complete fixture.

## Frozen signal and estimator contract

For n=0,…,N−1, t_n=n/f_s, the synthetic real signal is

    x[n] = Σ_j A_j exp(−γ_j t_n) cos(2π f_j t_n + φ_j) + ε[n].

Here A is in arbitrary sensor units, γ is a nonnegative decay rate in s⁻¹, f is the **damped oscillation frequency** in Hz, and ε is seeded Gaussian noise added after sampling. For a single second-order underdamped mechanical oscillator, the undamped natural angular frequency would satisfy ω_n²=(2πf)²+γ². The sandbox does not silently identify these two frequencies, fit damping, or infer a physical mass/stiffness from this signal.

The recorder is explicitly unfiltered. There is no analog anti-alias filter, transducer response, ADC quantization, clipping, analog noise aliasing, clock jitter or drift. Those omissions are warnings, not assumed perfect instrument characteristics. A mode at or beyond Nyquist cannot generally be reconstructed uniquely. The folded frequency is min(r,f_s−r), where r=f mod f_s. At exactly Nyquist, phase can even make a real sinusoid vanish.

The computational contract allows 1–8 modes, 256–65,536 samples in powers of two, f_s from 1 kS/s to 2 MS/s, and input oscillation frequencies from 0 to 5 MHz. These are UI resource bounds, not recommended DAQ specifications. All inputs are checked for finite values and valid ranges before allocation.

The observation length used for FFT spacing is T=N/f_s, while the last sample occurs at (N−1)/f_s. No zero padding or resampling is performed. An in-place radix-2 FFT evaluates the weighted data. The two window options are a rectangular window and the periodic Hann window

    w[n] = 1/2 − (1/2) cos(2πn/N).

With W=Σ_n w[n], the one-sided amplitude is |FFT(w x)[k]|/W, doubled only for bins strictly between DC and Nyquist. Thus an undamped, bin-centred sinusoid of amplitude A has amplitude A under the stated coherent-gain normalization. Window leakage, overlapping modes and damping alter that convenient special case. This is an **amplitude spectrum, not PSD**. A PSD needs a different normalization and units.

The interface returns:

- FFT spacing Δf=f_s/N and Nyquist f_s/2;
- window coherent gain W/N;
- window equivalent noise bandwidth ENBW=f_s Σw²/(Σw)², equal to Δf for rectangular and 1.5Δf for periodic Hann;
- the largest sampled FFT bin, explicitly named `dominantBinHz`;
- raw synthetic samples and spectrum arrays, folded input-mode frequencies, and warnings.

The largest bin is not a fitted complex pole, resonance-frequency confidence interval, or universal detectability bound. Between-bin fitting can estimate frequency more precisely under a valid parametric/noise model. Conversely, arbitrarily long records do not guarantee two-mode identification if signal decay, drift, sensor nodes or inadequate SNR eliminate information. ENBW describes a window's noise bandwidth; it is not a guarantee that two nearby modes can be separated.

A periodic Hann window has zero weight at the first sample. A fast ring-down begins at that sample and can therefore be strongly suppressed. Coherent-gain normalization does not reconstruct its initial amplitude. In the limiting onset-only sample example, the Hann-weighted spectrum is entirely zero although the unwindowed record contains a signal. The interface warns when an active mode has γT≥3 with Hann; this is an explanatory trigger, not a rigorous validity boundary. Window selection for a real transient must be justified, or the unwindowed time record should be analyzed with a validated decay model.

## Six demonstrations

1. A finite single-mode ring-down with small noise.
2. An unfiltered 44.1 kS/s recorder folding a nominal 46.84 kHz oscillation into the audio band.
3. Two modes separated by 50 Hz recorded for only 1,024 samples at 250 kS/s.
4. The same pair observed for 32,768 samples, changing the observation rather than the underlying frequencies.
5. A weak, faster-decaying mode in sampled noise.
6. A mode with zero readout amplitude, demonstrating non-observability in one channel.

The nominal 23.32 and 46.84 kHz values connect to the existing hollow and solid reference calculations. These specified oscillation frequencies do not certify real fabricated copper specimens. The six presets are numerical experiments, not six physical observations.

## A/B uncertainty comparison

For D=f_B−f_A and standard uncertainties u_A,u_B with correlation r,

    u_D² = u_A² + u_B² − 2 r u_A u_B.

The implementation uses the equivalent noncancelling expression (u_A−u_B)²+2u_Au_B(1−r). It applies this separately to frequency-fit estimates, temperature effects under a shared local coefficient c_T, and clock errors. A separately provided paired-repeatability standard uncertainty is then added in quadrature. Independence **between** these categories is assumed. If a fit uncertainty already includes repeatability, adding it again would double-count it.

For a common fractional clock uncertainty u_c and equal clock coefficients, the difference contribution is |f_B−f_A|u_c. It is not sqrt(f_A²+f_B²)u_c; the latter corresponds to independent clocks. Common errors only cancel when coefficients and correlation justify cancellation. The default covariance values are illustrative choices, not measured properties of a DAQ or apparatus.

Temperature propagation is first-order with the same local sensitivity c_T at A and B. It describes uncertainty after any declared correction. It does not automatically subtract temperature drift or estimate that coefficient from data. A calibrated experiment may need separate coefficients, covariance between categories and nonlinear propagation.

The helper reports a declared k×u threshold and D±k u interval. It does **not** label this automatically as a 95% confidence interval, statistical significance, or a power calculation. A coverage interpretation requires a justified distribution, degrees of freedom and treatment of bias. The estimated uncertainties must come from calibration, fit validation and repeatability, not merely from Δf.

## Acceptance and stress tests

The producer tests establish DC/Nyquist conventions, exact-bin amplitude, periodic Hann coherent gain/ENBW, agreement with a direct DFT at selected bins, indistinguishable alias pairs, short/long two-mode behavior, seeded noise reproducibility, null readout, bounded maximum-size/mode execution and invalid-input rejection. Covariance tests distinguish common from independent clock error and test perfect common-temperature cancellation.

Independent numerical comparisons are recorded separately by the reviewer; repeatedly executing this implementation is not independent verification. Run the producer tests with:

    node --test tests/acquisition.test.mjs

The analytic spectrum is finite-energy only for a decaying free response extended to positive time. The acquisition simulator does not define a drive force or calculate input work, stored mechanical energy, support energy or heat. It therefore cannot infer energy efficiency, propulsion, levitation, or energy production. A real experiment must add its calibrated source and complete load/loss budget before making those claims.

## Standard references and closest methods

- NumPy discrete Fourier transform conventions: https://numpy.org/doc/stable/reference/routines.fft.html
- SciPy periodic Hann window definition: https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.windows.hann.html
- SciPy periodogram scaling and window normalization: https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.periodogram.html
- JCGM 100:2008, sections 5.1–5.2, propagation of uncertainty and correlated input quantities: https://www.bipm.org/en/committees/jc/jcgm/publications

Documentation reading on 22 October 2026 checked NumPy's FFT definition and endpoint conventions, SciPy's periodic/symmetric window distinction and periodogram scaling, and the BIPM publication register. The register also lists JCGM 100:2008/Amd.1:2026 on nonlinearity; this sandbox deliberately retains a first-order budget rather than asserting that it handles a nonlinear measurement model.

These are established methods applied here. The FFT, sampling theorem and covariance formulas are not claimed as new discoveries. Novelty of any future location-associated residual remains unestablished and would require controlled physical measurements and independent replication.

# Round 2 independent verification

The independent oracle and preregistration were frozen before reading the producer's Round 2 implementation. The comparison imports the frozen `analysis/round2/model.mjs`, SHA-256 `bc31ad2d8d95ffc6152bdb80ac408c3b277b1669f07fc182f9bcac38760b359d`. All calculations below are synthetic mechanical models on 1–20 Hz. There is no station fit or current Schumann anomaly claim.

## Exact ambiguity and its scope

For two stable single-mode transfers with positive finite mass, damping and natural frequency, each transfer is continuous, finite and nonzero on a real compact frequency band. For any continuous strictly positive input PSD S1, define

`S2(f)=S1(f)*abs(H1(f)/H2(f))^2`.

The ratio is continuous and positive; compactness provides finite upper and strictly positive lower bounds. Hence S2 is finite, positive and integrable on the band. Direct cancellation gives `abs(H1)^2*S1=abs(H2)^2*S2` pointwise. This is an algebraic all-band identity under the stated assumptions. Numerical residuals test its implementation; they do not prove it. No Earth-like lightning spectrum or outside-band source law is implied. A transfer with an interference zero needs a new argument before division is valid.

The pair uses natural frequencies 8 and 10 Hz and different damping and masses. Their output PSDs, and therefore their output maxima, are identical after the prescribed source change. A single-output peak rule cannot uniquely recover which pole set generated the trace when input PSD is unrestricted in this class. A faster search or a more accurate FFT cannot resolve this exact non-injectivity. Adding the velocity PSD of the same coordinate is redundant because it multiplies both candidate output spectra by the known factor omega^2.

## Source and receiver controls

At fixed natural frequency 8 Hz and Q=5, the source is `0.02*exp(t*(f-8)/8)` N^2/Hz. For t=-3,0,3, the independently computed grid maxima are 7.792, 7.920 and 8.041 Hz on the declared 0.001 Hz grid. Both physical poles remain fixed. A receiver squared gain with that same shape produces the same output shifts. Multiplication by a constant positive factor 17 preserves all three maxima. All selected maxima are interior to the band.

This demonstrates a controlled inference failure: a spectral maximum can move because of the forcing or receiver even when the oscillator does not change. The chosen exponential is bounded only on the declared finite band; no globally integrable exponential PSD is asserted. The grid locations are sampled maxima, not certificates of exact continuous extrema.

## Coherent versus uncorrelated sources

For a common coherent source the readout PSD is `S_F*abs(a1*H1+a2*exp(i*phi)*H2)^2`. Its expansion contains the real cross term `2*S_F*Re(a1*H1*conj(a2*exp(i*phi)*H2))`. Separate uncorrelated sources of equal PSD instead yield the sum of their individual PSDs. The assumptions are different.

The independent phase cases produced cross terms of both signs. Identical modes at phase zero give twice the uncorrelated PSD; at phase pi they cancel to numerical phase precision, with a coherent/uncorrelated ratio about 7.50e-33. A calculation that simply adds powers would miss that cancellation. This is a displacement-readout comparison, not an assertion that the squared sum is total system energy or harvested power.

## Executed checks

```sh
python3 -B research/schumann-openai-2026-10-29/verification/round2/compare_producer.py
```

The independent replay passed 96 API requests, including 211 scalar comparisons and nine invalid-input rejections. Nine grids each contained 19,001 points. Maximum nonzero relative discrepancy was 3.77e-14, within the predeclared 2e-12 relative / 1e-22 absolute PSD limits. The wrong reciprocal compensation ratio failed a frozen case with about 0.9996 relative discrepancy. Exact source bindings, tolerances and outputs are in `comparison-results.json` and `freeze.json`.

The verifier found no outstanding Round 2 defect in this declared finite-band scope. It makes no universal floating-point guarantee, experimental validation or scientific-priority claim. The natural next discriminator is a calibrated complex transfer referenced to known input, with the assumptions about phase, gain and single-mode structure stated and tested. That is a proposed Round 3 question, not an executed result here.

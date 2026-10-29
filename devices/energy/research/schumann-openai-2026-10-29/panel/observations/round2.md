# Research round 2 — source and receiver identifiability

Date: 29 October 2026. Reviewed the actual producer results, runner, report and frozen model; the independent comparison, report and preregistration; both final freeze manifests; and the mathematical role's independent derivation. No current station series was fitted or modified. No third-round experiment was executed by this review.

## Admission

**Accept the declared finite-band synthetic countermodels.** The producer reports 36 checks; the independent verifier reports 96 API requests, 211 scalar comparisons, nine invalid-input rejections and nine 19,001-point grid cases. Its maximum nonzero relative error is about `3.76e-14`, below its declared normal relative tolerance `2e-12`. Counts refer to different units. Both receipts bind producer source SHA-256 `bc31ad2d8d95ffc6152bdb80ac408c3b277b1669f07fc182f9bcac38760b359d`.

The added result is a useful demonstration of an established inverse-problem limitation: even the entire output PSD, not only its largest peak, can be identical for different stable oscillators when the source spectrum is unconstrained within the specified positive continuous class. This does not establish that actual lightning realizes the constructed source spectra, nor invalidate inference under stronger source/calibration assumptions.

## Results and metrological meanings

The producer keeps natural frequency 7.8 Hz, damping `4.9008845396 s⁻¹` and mass 0.25 kg fixed while scanning 1–20 Hz at 0.001 Hz spacing.

| Scenario | Sampled maximum | What changes |
| --- | ---: | --- |
| Flat source and unit receiver gain | 7.722 Hz | Reference synthetic output |
| Source weight tilted downward with frequency | 7.598 Hz | Source PSD only; physical poles remain fixed |
| Source weight tilted upward with frequency | 7.840 Hz | Source PSD only; physical poles remain fixed |
| Frequency-dependent receiver squared gain with the same upward shape | 7.840 Hz | Receiver response only; physical poles remain fixed |
| Positive constant factor 49 | 7.722 Hz | Amplitude only; maximum unchanged |
| Strongly upward source weight | 20 Hz, band endpoint | Largest value in the scanned band; not an identified interior resonance |

Source weighting and receiver weighting with the same multiplicative PSD shape produce the same output here. A single output spectrum cannot distinguish their origins without extra information. A `20 Hz` band-edge maximum is censored by the analysis band; no maximum outside the band was evaluated. The exponential source shapes are defined as examples on a compact band, not physically asserted all-frequency spectra.

All reported peak locations are grid maxima of analytic response functions, not FFT estimates from a noisy recorder. The retained display samples are decimated to 0.1 Hz while peak searches use 0.001 Hz; a plotted curve should not silently become the calculation's independent evidence. Neither spacing supplies measurement uncertainty. The independent worker uses different masses and an 8 Hz reference; its 7.792/7.920/8.041 Hz maxima are independent fixtures, not disagreement with the producer's 7.8 Hz fixture.

The unknown-input pair has natural frequencies 7.8 and 10.3 Hz and different masses/damping. Constructed forcing makes both output spectra have the same sampled peak, 7.722 Hz. Across the grid their maximum relative PSD residual is `5.56e-16`. The alternative forcing is positive and finite, with sampled values approximately `1.056e-6` to `5.149e-5 N²/Hz`. The compact-band proof, not sampled extrema, establishes continuous bounded integrability and exact equality under the stated assumptions:

`S₂=S₁|H₁/H₂|²` implies `|H₂|²S₂=|H₁|²S₁`.

Continuity, a compact band and nonzero finite transfer functions are material premises. A coherent multimode response with a zero cannot simply replace `H₂` across that zero. A brute-force search over model parameters cannot restore uniqueness within this admitted non-injective model class.

## Units, interference and redundant channels

Force PSD has units N²/Hz, each mechanical transfer has units m/N, physical displacement PSD has units m²/Hz, and velocity PSD has units `(m/s)²/Hz`. Receiver squared gain is dimensionless. After that weighting, `outputPsdM2PerHz` is an equivalent-displacement output, not necessarily the actual physical displacement PSD. A real volt-output receiver would require its dimensional calibration and transfer function. These amplitudes are not measured ELF field strengths.

For a common coherent source, complex transfer amplitudes are summed before squaring. At 10 Hz, changing the declared relative phase changes the producer's output PSD from approximately `4.13e-12` to `7.87e-12 m²/Hz`, while the uncorrelated equal-source-PSD comparison remains `6.00e-12 m²/Hz`. The cross term has both signs and total PSD remains nonnegative. These are different source-correlation models, not two interchangeable ways to process one experiment.

Identical opposing signed responses cancel exactly in the control. The separately matched **distinct-mode** responses cancel only at the specified 9 Hz; that result is not a broadband disappearance of the modes. The independent worker's phase-π cancellation residual reflects numerical phase precision. A dark spectral feature or a receiver node does not show that source energy vanished. No source-free output, power surplus or terrestrial field normalization is established.

The derivative channel obeys `S_v/S_q=ω²`; the producer's maximum relative residual is about `6.47e-16`. This supplies no independent separation of unknown forcing from response. Differently calibrated/noisy displacement and velocity instruments would require an extended model, not an automatic uniqueness claim.

## Specific added information for a later test

A bounded next test could measure complex displacement response to a known coherent force with independently calibrated input/output amplitude and phase. For known positive mass and nonzero drive frequency, the ideal model gives

`ω₀² = ω² + Re(1/H)/m`,

`γ = Im(1/H)/(2mω)`,

using `q=Re(Q exp(iωt))` and `H=Q/F`. Admit only reconstructed `ω₀²>0` and `γ>0`. Additional held-out frequencies test consistency with the one-mode model, readout convention and calibration. With unknown mass, frequency diversity supplies a separate slope/intercept problem; it is not the same one-frequency inverse.

Unknown **arbitrary frequency-dependent** receiver gain can mimic a different transfer and needs a discriminating control. Do not overstate this as “every unknown gain prevents pole inference”: an unknown constant real gain can leave mass/gain confounded while multiple frequencies still identify normalized pole parameters from response shape. The precise nuisance class determines the inference claim.

This proposed source-controlled mechanical test is feasible in principle for the existing copper/transducer bench model. It is not already supplied by two Earth-station spectra. Calibrating an ELF receiver does not measure the unknown distributed lightning forcing, and two station channels do not automatically share one scalar source with known participation. A terrestrial extension would need a source/propagation model, station geometry, independent calibration, cross-spectral uncertainties and an explicit rank or identifiability argument.

## Remaining observational gap

The original recent-event question remains unresolved: numerical calibrated October 23–29 station records, quality flags, coverage and matched baselines are still missing. These countermodels show why a peak-only anomaly narrative is insufficient; they do not prove that no anomaly occurred. Historical approximate mode values, synthetic spectra, NOAA/GFZ geomagnetic context and live station quick-looks must remain separate in the dashboard.

Recommend that the advisor select the calibrated complex-transfer discrimination and a deliberately uncalibrated receiver countermodel for the final round, together with an evidence-intake rule that returns insufficient evidence for the current station packet. This is a recommendation from R2's actual results, not an executed third round or a claim that arbitrary sensor calibration solves Earth-cavity inversion.

## Evidence

- [Producer results](../../analysis/round2/results.json), [runner](../../analysis/round2/run.mjs), [frozen model](../../analysis/round2/model.mjs).
- [Independent comparison](../../verification/round2/comparison-results.json), [independent preregistration](../../verification/round2/preregistered.md).
- [Analytic derivation](../math/round2-derivation.md), [frozen round contract](../../rounds/round2-contract.md).

Earlier observation data, initial reports and R1 records were preserved.

# Research round 1 — observational metrology review

Date: 29 October 2026. Reviewed after `analysis/round1/results.json` and `verification/round1/comparison-results.json` became available. Inputs also include the frozen round contract, producer model/runner, independent verification contract and the mathematical role's independent derivation. This review does not acquire or fit station data, rerun Lean, or certify all floating-point inputs.

## Admission

**Accept the round as a bounded synthetic model and implementation check.** The producer reports 91 checks; the independent receipt reports 79 API requests, 169 scalar comparisons, 15 invalid-input rejections and nine real-period quadratures. Its maximum nonzero relative error is approximately `8.99e-16`. These are different counting units and should remain separate. The independent comparison binds the producer source hash `86f92e1d90ee7b7b4ac5d8286c830d915a360f0c634fdeae4c2f3798c1443cc8`, matching the producer receipt.

The all-domain conclusions follow from the explicit oscillator/shell derivations, not these finite counts. The declared positive-parameter physics model has a more restricted finite machine implementation; numerical rejection at extreme inputs is not a physical-domain theorem.

## What the results demonstrate

| Check | Actual result | Measurement interpretation |
| --- | --- | --- |
| Ideal shell, radius 6,371 km and speed c | First mode 10.59127458 Hz; horizontal scale 28,305.607 km | Ideal geometry reference, not the observed terrestrial fundamental. |
| Separate wavelength reference at 7.8 Hz | `c/f = 38,434.931 km` | Vacuum-speed reference. This is not the ideal shell's horizontal eigenmode scale or a measured propagation wavelength. |
| One-speed fit at historical approximate 7.8 Hz | Higher predictions 13.5100, 19.1060, 24.6658 and 30.2093 Hz versus approximate references 14.3, 20.8, 27.3 and 33.8 Hz | Calibration at one mode does not validate the nondispersive model. The residuals are descriptive model mismatch, with no statistical significance or current-event implication. |
| Fixed mass, natural frequency and damping; displacement versus velocity readout | At natural frequency 7.8 Hz and Q=5, analytic displacement peak 7.72160605 Hz, velocity peak 7.8 Hz; same physical poles | Different observable maxima do not imply changed cavity parameters. This is the clean fixed-pole control. |
| Constant positive PSD scaling | Multiplying by 49 preserves sampled displacement maximum 7.722 Hz | Scalar gain changes amplitude, not this ideal spectral maximum. Frequency-dependent gain remains untested in R1. |
| Q=0.6 | Displacement maximum at DC; oscillatory ringdown 4.31161223 Hz; velocity maximum 7.8 Hz | An oscillatory ringdown need not yield a positive-frequency displacement-PSD maximum. |
| Q=0.4 | Displacement maximum at DC; no oscillatory ringdown; velocity maximum 7.8 Hz | A velocity maximum alone does not establish oscillatory free motion or a sharp resonance. |
| Harmonic source/loss accounting | Nine cases close analytic and real-quadrature input/loss budgets | Known source work supplies loss. The synthetic mechanical mode is not a calibrated terrestrial electromagnetic energy model. |

Changing Q by changing damping changes the poles. Thus the three-Q series is a domain/observable comparison, while the displacement-to-velocity switch at fixed parameters is the unchanged-pole demonstration. The source code and receipts preserve this distinction.

## Peak extraction, resolution and uncertainty

The producer's illustrative scan evaluates the analytic response on 0–20 Hz with 0.001 Hz spacing. Its 7.722 Hz displacement maximum is a sampled maximum, compared with the analytic maximum using a 0.0011 Hz tolerance. The independent worker uses an 8 Hz natural-frequency fixture and 0.0002 Hz grid spacing; its differing numerical peak values are deliberate independent cases, not a discrepancy. Both identify DC boundary maxima in the nonresonant displacement cases.

These are samples of an exact frequency-response function. There is no sampled time record, FFT, finite duration, window, leakage, noise, timebase error, frequency fit or confidence interval in this scan. Grid spacing is therefore neither a measured instrument resolution nor an estimator uncertainty. An interactive plot must label it as a model response, keep `natural frequency`, `ringdown frequency` and `spectral maximum` distinct, and identify an endpoint maximum as such. Replacing the label with “Earth frequency” would overstate the evidence.

Similarly, Tomsk's nominal 0.02 Hz FFT spacing and Nagycenk's quick-look traces do not acquire uncertainties from agreement with this model. The recent observation conclusion remains unchanged: calibrated multi-day station spectra, quality flags and a matched baseline were not obtained. No October 2026 Schumann-frequency values were inferred or simulated as observations.

## Units and physical interpretation

The model keeps physical mass and force explicit. Displacement transfer has units m/N, velocity transfer has units (m/s)/N, and harmonic input/loss are watts. Spectral ratios are not the same units as absolute output PSD; a force PSD and a declared PSD convention would be needed for the latter. The white-force idealization establishes response-shape maxima; it does not assert that lightning is white or supply a finite broadband source-power budget.

The magnetic examples give `9.94718e-4 J/m³` for a constant 50 μT reference and `3.97887e-19 J/m³` for a 1 pT RMS perturbation, using the stated approximate permeability. A constant field has RMS magnitude equal to its magnitude. For a zero-mean perturbation, the average cross term with a static field vanishes; no extra sinusoidal factor of one-half is needed after using RMS. These are magnetic energy densities, not total Earth-field energies or watts. No physical collection volume, coupling, load or replenishment mechanism has been measured.

The wavelength, oscillator and energy formulas are established physics applied transparently. The round adds a checked educational implementation and an inference counterexample, not a new law, mass-gap proof or source-free energy result. None of these computations imports the new local-smoothing or ETH theorem.

## Actual remaining gap and round 2 recommendation

R1 establishes that changing the measured observable can move a peak while the physical poles stay fixed. It does **not** yet demonstrate how a changed unknown forcing spectrum or receiver transfer can move the same channel's peak, nor whether two different cavity-parameter candidates can produce exactly the same observed spectrum. That is the relevant inference gap before any claim that a local spectral peak identifies a change in the cavity.

Recommend a frozen finite-band R2 contract with three discriminating cases:

1. Hold the full transfer function and channel fixed while changing a positive, finite source spectrum; separately hold forcing fixed and change a frequency-dependent receiver response. Keep all case parameters, band and grid limits explicit, and retain constant scaling as a no-shift control.
2. Construct two different stable oscillator responses with strictly positive finite source spectra that give the same output PSD. State the equality algebraically, including nonzero-transfer and finite-band assumptions; numerical residuals check implementation only. Do not imply that an arbitrary constructed spectrum is observed lightning.
3. Ask a peak-only rule to distinguish those cases and record its failure. Identify a specific extra calibrated observable and its assumptions for a later discrimination test, rather than claim that more spectral pixels resolve the ambiguity.

Do not add a real-data cavity fit or anomaly threshold until the missing calibration, baseline and source/noise assumptions are supplied. Brute-force parameter searches would not resolve exact non-identifiability; they could merely choose one of multiple equivalent candidates.

## Reviewed evidence

- [Producer results](../../analysis/round1/results.json), [frozen model](../../analysis/round1/model.mjs), [runner](../../analysis/round1/run.mjs).
- [Independent comparison](../../verification/round1/comparison-results.json), [preregistered verification scope](../../verification/preregistered.md).
- [Analytic derivation](../math/round1-derivation.md), [round contract](../../rounds/round1-contract.md).

No initial-panel or other-role file was changed by this review.

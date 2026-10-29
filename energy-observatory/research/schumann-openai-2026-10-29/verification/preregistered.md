# Independent verification contract

Reviewer: `oct_verifier`; date: 2026-10-29. This record is written before reading the producer's model implementation or fixtures. Research-model executions await the advisor's frozen round contracts. The observation-packet audit is separately authorized immediately.

## Evidence separation

Algebra establishes the scope of model formulas. Independent numerical checks test implementation at declared cases. Neither establishes historical priority or a measured Earth anomaly. Source hashes establish byte identity, not physical accuracy. NOAA estimated Kp and GFZ preliminary Kp are distinct products; equality between them is not an acceptance condition.

## Prospective model controls

1. **Geometry and units.** Independently evaluate ideal thin-shell frequencies from angular eigenvalues `l(l+1)` at degrees 1–5, radii 6371 km and a changed-radius control. Verify linear speed scaling and inverse-radius scaling. Compare `omega/(2*pi)` to frequency, `c/f` to vacuum wavelength, and `2*pi*R/sqrt(l(l+1))` to the ideal horizontal scale. They coincide only for the corresponding ideal speed/frequency relationship, not for an arbitrary observed peak. Reject degree zero as an oscillatory mode, nonpositive radius/speed/frequency, and nonfinite inputs. Normal finite-case relative tolerance: `5e-13`; near-zero comparisons use an explicitly stated absolute scale.
2. **Damped dynamics.** Derive roots from the quadratic characteristic polynomial independently of the producer. Compare natural angular frequency, damped free-oscillation frequency and white-force displacement-power maximum. Verify the overdamped/nonresonant endpoint instead of taking an invalid square root. A grid extremum is compared only to its grid resolution; it is not an all-frequency proof. Wrong use of the ringdown peak as the driven-displacement peak must fail a discriminating example.
3. **Inverse ambiguity.** Construct positive source spectra for two different stable oscillators that yield the same output PSD over a declared frequency interval. The equality follows algebraically from transfer-function ratios; sampled residuals are implementation evidence. A fixed-pole, changed-source example must move the observed maximum. Any proposed calibration reconstruction must state known gain, phase, force and readout assumptions and face held-out frequencies or an explicit wrong-readout control.
4. **Energy accounting.** For `q''+2*gamma*q'+omega0^2*q=F`, independently use `E=(q'^2+omega0^2*q^2)/2` and `E'=F*q'-2*gamma*q'^2` for a unit-mass normalized oscillator. Magnetic `B^2/(2*mu0)` is an energy-density reference, not available power; a static B value supplies no frequency or energy-extraction rate. If an RMS amplitude is used, do not apply an extra sinusoidal factor of two.

Model parameter grids and output names may be narrowed prospectively by each advisor contract. Any changed tolerance or post-freeze interpretation must be recorded, not silently substituted.

## Observation-packet checks

Read only the saved source bytes and retrieval manifests. Verify SHA-256 and byte counts; parse timestamps as UTC (NOAA's unqualified product timestamps explicitly assigned UTC); reject duplicate/non-increasing times and invalid Kp values. Report raw, in-window, completed and excluded bin counts separately. For three-hour bins, retain a completed observation only when `start + 3h <= retrieval_time`. Preserve preliminary/estimated status and partial October 29 coverage.

Summarize October 23–29 and October 27–29 separately, with exact exclusive coverage end and daily count. Kp >= 5 is a geomagnetic threshold, not a Schumann threshold. No interpolation, missing-day imputation, post-selection of a baseline or event-proxy substitution is permitted. A gap or absent calibrated Schumann time series yields unresolved Schumann anomaly status.

Negative controls: duplicate timestamp, Kp outside [0,9], stale packet with no requested-window points, and inclusion of a still-open three-hour bin. A boundary bin ending exactly at retrieval is completed. These are validator controls, not changes to original source records.

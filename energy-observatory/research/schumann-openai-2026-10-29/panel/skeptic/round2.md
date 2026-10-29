# Research round 2 — skeptic admission

Date: 2026-10-29. Read the frozen R2 contract; independently executed `round2-counterchecks.py` before reading producer source; then read the producer's actual model/results and the independent verifier's report/results. No R3 execution occurred.

**Decision: accept the finite-band source/readout countermodels and coherent-versus-uncorrelated controls.** They disprove the claimed general implication “output peak, or even complete output PSD, uniquely determines oscillator poles with unknown forcing” within the declared model class. They do not disprove identification under stronger measured-input assumptions, establish that actual lightning changed, or detect a current Schumann event.

## Exact non-identifiability and the peak rule

For positive mass, damping and natural frequency, the stable single-mode response H is finite, continuous and nonzero on the compact positive-frequency band [1,20] Hz. The denominator's imaginary term is nonzero there, and the numerator is constant nonzero. If S1 is continuous and strictly positive, compactness gives positive finite bounds for S1 and abs(H1/H2)^2. Hence

`S2=S1*abs(H1/H2)^2`

is positive, finite and integrable on that band. Direct substitution proves abs(H1)^2 S1=abs(H2)^2 S2 at every band frequency. This is an exact algebraic construction, not a conclusion inferred from a finite frequency scan. No outside-band continuation or global exponential PSD is needed for the stated comparison.

The two parameter sets have different poles but identical observations. Any deterministic rule applied only to that identical output PSD must return the same result for both; it therefore cannot recover both true parameter sets. Peak-only rules discard still more information. More FFT precision, denser brute-force searches or a faster SAT algorithm cannot remove this non-injectivity. The result depends on admitting this class of unknown forcing spectra: an independently measured or defensibly constrained source can exclude the compensating S2. It is not universal impossibility of inverse physics.

The producer's f0=7.8 and 10.3 Hz pair agrees within 5.56e-16 relative. My separate f0=7.8 and 9.1 Hz, Q=5 and 4 pair, using S1=1+0.1 cos(f), agrees within 1.95e-16 over 9,501 grid points. The sampled S2/S1 range is approximately 0.456–6.317; sampled bounds are not its exact extrema. The verifier's wrong reciprocal-ratio control fails by about 0.9996 relative, showing that the check detects the direction of compensation rather than just reproducing a trivial constant scaling.

This construction must not be copied through arbitrary multimode transfer zeros. If H2 vanishes while the target output does not, division can fail and S2 can cease to be bounded or integrable. The current single-mode hypotheses avoid that obstruction.

## Fixed poles, source color and receiver response

Producer peaks on the inclusive 1–20 Hz, 0.001 Hz grid are 7.722 Hz for white forcing, 7.598 Hz for its red source, and 7.840 Hz for its blue source. The corresponding frequency-dependent receiver squared gain yields the same blue output. A positive constant factor 49 leaves 7.722 Hz unchanged. The physical natural frequency and damping stay fixed in these cases. The deliberately steeper source places its maximum at the 20 Hz band boundary; that is correctly flagged and cannot be called an interior resonance estimate.

The independent verifier uses different physical parameters, f0=8 Hz, and gets 7.792, 7.920 and 8.041 Hz for its three colors, with factor-17 invariance. These numbers are not conflicting estimates of the same test. My own fixed-pole color gives 7.722 to 7.844 Hz on a 0.002 Hz grid. All are synthetic sampled maxima. The exponential source/gain is strictly positive and bounded on the declared band; it is not measured source physics. Constant scalar gain invariance is not invariance to frequency-dependent gain.

The velocity/displacement PSD ratio omega^2 is redundant for the same coordinate under the corresponding calibrated readouts. Both indistinguishable candidates retain this ratio. Labeling velocity as a second channel does not make it an independent parameter discriminator.

## Interference and energy interpretation

A common source gives S_F abs(a1 H1+a2 H2)^2, including 2 S_F Re(a1 H1 conjugate(a2 H2)). Independent uncorrelated forces of equal PSD instead yield S_F(abs(a1 H1)^2+abs(a2 H2)^2). The cross term can have either sign, while the full coherent PSD stays nonnegative. The producer and verifier exercise both signs and cancellation; they explicitly separate the source models.

My distinct-mode control at 8.3 Hz uses a declared complex coefficient a2=-H1/H2, giving coherent readout power about 9.4e-37 against uncorrelated power 8.83e-5 in its stated units. Reversing that coefficient aligns the contributions and doubles the uncorrelated value. This checks complex summation independently of the producer's identical-mode and distinct-mode controls. Cancellation is at the selected readout/frequency; it does not cancel each oscillator's stored energy or external work. No squared readout sum is substituted for total energy or harvested watts.

## Receipts, limits and next target

Producer results report 36 checks and eight invalid-input rejections. The independent verifier reports 96 API requests, 211 scalar comparisons, nine invalid rejections and nine grids of 19,001 points, with maximum nonzero relative discrepancy 3.77e-14 under its preregistered tolerances. The inspected model and verifier bind SHA-256 `bc31ad2d8d95ffc6152bdb80ac408c3b277b1669f07fc182f9bcac38760b359d`; the producer results bind runner `92d178a9968da283ad15442e3649d5c17b0efa735f2ba9746c483837ef133668`, matching the inspected bytes. These are finite normal-range checks, not a uniform floating-point theorem or physical calibration.

Recommend R3 test the concrete missing information: a **calibrated complex input-to-displacement response** H at a known positive drive frequency, with known mass and an exact single-mode model. The algebraic candidate is omega0^2=omega^2+Re(1/H)/m and gamma=Im(1/H)/(2m omega). Before admission, test gain/phase errors, noise sensitivity, physical positivity, redundant-channel false confidence and failure under model mismatch. Obtaining H requires an actual input reference and receiver calibration; an ambient output PSD supplies neither. The claim would be conditional identification for a laboratory model, not a general inversion of Earth's multimode cavity. No such R3 tests have been executed here.

Novelty remains an application and reproducible explanation of established inverse-problem principles. The current station-data gap and the unresolved continuum Yang–Mills obligations remain unchanged.

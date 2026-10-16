# Sound research: numerical model contracts

This module is an educational comparison of digital signals and one ideal mechanical oscillator. It does not model brain activity, cells, pathogens, disease, recovery, or therapeutic dose. Normalized digital sample amplitude is not sound pressure level (SPL). Playback hardware, fit, device gain and acoustic calibration determine physical exposure; none is inferred here.

Source: `src/sound-research/model.ts`. It is deterministic, contains no DOM or audio graph, and leaves the existing DSP engine untouched. The page uses the shared session provider for optional audio previews.

## Signal definitions

Let the left/first carrier be `fc`, the nonnegative frequency difference or modulation rate be `fb`, time be `t`, and modulation depth be `d` in `[0, 1]`.

| Column | Definition | Interpretation |
| --- | --- | --- |
| Carrier / binaural left | `sin(2π fc t)` | One sinusoid in the left channel |
| Binaural right | `sin(2π (fc + fb) t)` | Another sinusoid in a separate right channel |
| Monaural two-tone sum | `(left + right) / 2` | Both frequencies averaged into one channel |
| AM envelope | `1 − d/2 + (d/2) sin(2π fb t)` | Nonnegative envelope, range `1−d` to `1` |
| AM signal | `envelope × carrier` | A physically amplitude-modulated digital signal |

Binaural channels are separate signals. The model does not add them into a physical beat envelope or predict the listener's perception. The monaural sum satisfies the exact identity

`(sin(2π fc t) + sin(2π (fc + fb) t))/2 = sin(2π (fc + fb/2)t) cos(π fb t)`.

Its magnitude envelope is `abs(cos(π fb t))`; the magnitude maxima repeat at `fb`. This differs from the nonnegative sinusoidal AM envelope. AM contains a carrier and two sidebands, whereas the two-tone sum contains two frequencies. At zero frequency difference, the two-tone sum equals the carrier. At zero modulation rate, the chosen sine-phase AM envelope is a constant `1−d/2`; it does not automatically become unit gain. At zero depth, AM becomes the original carrier.

The existing offline renderer's mode named `monaural` implements full-depth sinusoidal AM. It is not a renderer for this model's two-tone sum. Live Studio instead uses two-tone summation for this mode; the new preset cards disclose this existing difference. The comparison page may preview carrier, binaural and full-depth AM through the existing session provider, with explicit preview gain and fades. The plotted signals remain normalized references: they omit that playback gain and those fades. Arbitrary-depth AM must not be presented as a matching engine preview unless the preview supports that depth.

## Display sampling and bounds

All input fields are validated before allocating rows. NaN, infinities, nonnumeric values, invalid objects and fractional sample counts are rejected. Plot arrays contain 2–1200 rows including both endpoints. Carrier range is 60–1000 Hz, beat/modulation range is 0–40 Hz, and depth is 0–1. The short signal plot accepts 0.002–1 seconds only when its effective sample rate `(N−1)/duration` is at least eight times `fc+fb`, which also covers the upper AM sideband. This display criterion limits misleading aliasing; it is not a production audio sample rate.

The independent slow envelope plot accepts 0.05–10 seconds and uses the same eight-points-per-modulation-cycle criterion. Slow envelopes therefore remain inspectable without drawing an undersampled carrier. It does not show a binaural physical envelope. Exported rows contain the exact configured endpoints and numbers, with no random noise or physiological mapping.

## Dimensionless resonator

The mechanical example is the steady sinusoidal response of the ideal linear equation

`m x'' + c x' + k x = F0 sin(ωt)`.

Define `ω0 = sqrt(k/m)`, `r = ω/ω0`, and damping ratio `ζ = c/(2 sqrt(km))`. Divide the displacement amplitude by the static displacement `F0/k`. The normalized response is

`H(r, ζ) = 1 / sqrt((1−r²)² + (2ζr)²)`.

The displacement phase lag is `atan2(2ζr, 1−r²)` in radians. This assumes a stable, linear, single-degree-of-freedom oscillator, steady-state forcing, and constant parameters. It excludes transients, nonlinearities, material breakdown, coupling to other modes and biological response. There is no mapping from the frequency ratio to an audible or ultrasonic treatment frequency.

Checks: `H(0)=1`; `H(1)=1/(2ζ)`; for large `r`, `H≈1/r²`. For `ζ < 1/sqrt(2)`, the amplitude maximum occurs at `sqrt(1−2ζ²)`, slightly below the undamped natural frequency. At stronger damping there is no positive-frequency displacement peak above the static value. A graph peak is a property of this idealized response, not evidence of healing or selective biological effects.

Damping is bounded to 0.01–2, excluding the undamped resonant singularity. Plotted frequency ratio spans zero to a configurable endpoint in 1–10. The scalar response helper accepts ratios through one million to permit asymptotic verification. Sensitivity scenarios use half, selected and double damping, bounded to the valid range; duplicate scenarios at boundaries are omitted. They compare model assumptions and are not dose searches or biological optimization.

## Reproducibility and verification

`waveformCsv`, `envelopeCsv` and `resonanceCsv` export a version marker, interpretation notice, complete validated configuration, named columns and all numerical rows. Lines beginning with `#` are metadata; consumers should skip those lines before reading the CSV table. Time is in seconds, frequencies in hertz, phase in radians, and oscillator ratios and amplitudes are dimensionless. These files contain calculations, not measurements.

`src/sound-research/model.test.ts` verifies the independent sum/product identity; zero-beat and zero-depth limits; envelope extrema; channel separation; amplitude bounds; exact endpoints; deterministic output; display sampling rejection; allocation limits; static/resonant/asymptotic oscillator values; analytical resonance peak; phase limits; damping sensitivity; nonfinite/invalid input rejection; and numeric CSV contracts.

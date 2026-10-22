# Systems scientist: round 2 criticism, implementation and independent fixtures

21 October 2026 (America/New_York). This round follows the advisor's acceptance of the exact impedance ambiguity. All five other round-1 reports were read before this response. No EM or acoustic producer JavaScript was inspected before the independent fixtures were frozen. Physical measurements: zero.

## Debate and changes after round 1

| Peer proposal | Criticism or agreement | Action in this round |
|---|---|---|
| Tesla: six-state reciprocal converter | Accept the energy identity. A moving mutual inductance is a work port; a frequency sweep at fixed coupling must not be labeled a moving-coil simulation. | Independently reconstructed its three-variable phasor matrix with explicit electrical and force drives. Kept it separate from the four-state identifiability demonstration. |
| Acoustic: conversion and load matching | Accept the pressure/velocity boundary and loading backaction. The plane-wave flux through a chosen area is not a universal capture-area bound. | Independently solved the coupled velocity/voltage matrix. Did not identify force from microphone pressure or reuse a reduced fixed-velocity load optimum. |
| Quantum: state energy versus ergotropy | Accept ideal unitary extraction from a prepared state as a distinct resource question. Same numerical Hz supplies no electrical/acoustic coupling Hamiltonian. | Keep the classical impedance calculator separate; no quantum gain term is appended. Initial state resources belong in preparation and reset accounting. |
| Metrology: residual and covariance | Agree that one residual cannot identify hidden input, released storage and bias. Passive dynamics and calibrated measurements are separate obligations. | Added an exact structural ambiguity and calibrated-velocity discriminator, complementing the scalar residual example. |
| Records: official-source unit flag | Government custody and program requirements do not certify numerical correctness or achieved performance. | Independently inspected MARRS page4 and BIPM Tables7/8; confirmed the source's picobarn/cm² mismatch without guessing the intended cross section. |

## Executed identifiability result

The demonstration fixes known electrical `L=0.01 H`, `C=2.533 μF`, `R=12 Ω` and baseline mechanical `m=0.02 kg`, `b=0.4 N s/m`, `k=20000 N/m`, `g=2 N/A`. It has no independent mechanical force drive. The browser permits scale `a` from 0.01 to 100 and applies

`(m,b,k,g) -> (a m,a b,a k,sqrt(a) g)`.

The driving-point impedance `Ze+g²/Zm` is analytically invariant. The measured `v/i=g/Zm` changes by `1/sqrt(a)`. In the 201-frequency grid from25 to4000Hz, the independent Python reference tested six scales (1,206 scale-frequency cases). At `a=4`, the electrical impedance is unchanged while the velocity-to-current response is halved.

For local numerical identifiability, seven frequencies50–3200Hz produce real/imaginary reflected-impedance observations normalized by fixed baseline magnitudes. Centered differences with log-parameter step `1e-5` give a14×4 Jacobian. Independent NumPy SVD reports rank3/nullity1 at relative threshold `1e-7`; the analytic log-coordinate null vector is `(1,1,1,1/2)`. Appending calibrated velocity produces rank4/nullity0 for these same baseline parameters and sample frequencies. That numerical rank is local, not a proof about every parameter choice. The exact scaling equation, rather than a dense search, establishes the continuous ambiguity. Zero coupling or insufficient frequency information creates further degeneracy.

`src/identifiability.mjs` computes the browser result using elementary complex arithmetic and complete-pivot elimination. Independent Python comparisons cover eight scale values including both admitted endpoints,3,216 scalar curve values, and five invalid inputs. Maximum relative curve difference was `1.5744826957433457e-16`. The source-bound receipt is `browser-comparison.json`. Counts refer to computational comparisons, not independent experiments.

## Independently frozen phasor checks

Before producer-code inspection, `analysis/systems_reference.py` assembled and solved the following matrices using NumPy complex linear algebra:

Electromagnetic six-state model reduced to steady phasors `(I1,I2,Vmechanical)`:

`[[Z1, s M, 0], [s M, Z2, g], [0, -g, Zm]] * [I1,I2,V] = [Vs,0,Fext]`.

Piezoelectric force-input model reduced to `(Vmechanical,Velectrical)`:

`[[Zm, theta], [-theta, Gd+1/R+s Cp]] * [V,Ve] = [F,0]`.

Here `s=iω`; phasors use peak amplitudes, so cycle-mean products have factor1/2. `independent-reference.json` stores every parameter and complex output. For the selected fixtures, the mean-power residual `Pload+Ploss-Pin` was `-1.734723475976807e-18 W` (EM) and `-4.404571325722362e-20 W` (piezo). These near-zero residuals test arithmetic within specified models; they are not instrumental uncertainties or hardware observations. Normal and `python -O` reference runs produced byte-identical JSON. The hash record `independent-freeze.json` predates any comparison against peer JavaScript. Cross-comparison remains the next advisor-selected review action.

## Independent check of the MARRS unit inconsistency

The records agent's downloaded official `HR001126S0007.pdf` has SHA256 `af99ec0fa3bb94f7a520e0b92f7e57e864e1800afa9089bf03e7343dd6434733`. Its supplied page4 image was independently viewed; the source pairs the word picobarn with a parenthesis containing `10^-12 cm²`. The web reader could not parse the official attachment's octet-stream content type, so this review used the already downloaded source bytes, not an independently acquired copy.

The current [BIPM SI Brochure,9th edition,V4.01,June2026](https://www.bipm.org/documents/20126/41483022/SI-Brochure-9-EN.pdf) was separately opened. Table7, printed p138/PDF p28, defines pico as `10^-12` and centi as `10^-2`; Table8, printed p140/PDF p30, defines barn as `10^-28 m²`. Thus

`1 pb = 10^-12 × 10^-28 m² = 10^-40 m² = 10^-36 cm²`.

Exact decimal arithmetic confirms a factor `10^24` discrepancy with the printed parenthesis. This is a source-version unit error, not a physical reaction-rate calculation. No intended cross section is substituted; no nuclear experiment or entire government program is validated or refuted by this correction.

## Can passivity-constrained fitting certify hardware?

No. The energy inequality holds conditionally when the adopted Hamiltonian is bounded below, the interconnection is skew, dissipation is positive semidefinite, the ports are complete and correctly calibrated, and time-varying controls are accounted for. Constraining a fitted model to that class proves a property of the fitted equations. An excellent fit over a finite dataset does not prove that an unseen input, stored reservoir, active element, nonlinear regime or sensor error is absent from hardware.

A useful acceptance plan requires both: (1) independent boundary measurements with an explicit uncertainty and storage budget, and (2) held-out predictions sufficient to challenge the chosen model family. Learning and brute-force search can explore hypotheses or detect bad models; they cannot resolve an exact input-output equivalence without new identifying observations.

## Reproduce this round

From `energy-observatory/`:

```sh
python3 -B analysis/systems_reference.py --output /tmp/energy-systems-reference.json
cmp research/panel/systems/independent-reference.json /tmp/energy-systems-reference.json
python3 -B research/panel/systems/compare_identifiability.py
```

No round3 review is pre-executed. Current results are ready for independent cross-comparison and advisor decision.

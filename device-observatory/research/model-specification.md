# Device Observatory: model specification

Scope checked 16 October 2026. The three browser models are original educational implementations of standard linear mechanisms. They are virtual devices, not completed hardware. Historical ideas and contemporary AI tools can suggest experiments; they do not establish a physical effect. These models do not predict healing, free energy, or cancellation of gravity.

All code is dependency-free JavaScript in `src/models.mjs`. Inputs use SI units. Harmonic phasors use the convention `Re(sqrt(2) X exp(i ωt))`: voltage, current, force and displacement amplitudes are **RMS**. Consequently average real power has no extra factor of one half. Screen charts convert frequency to kHz or displacement to mm only where the axis says so. All fields are validated; non-finite values, invalid passive parameters and unknown wrapper keys are rejected. No browser audio or physical actuator is driven.

## 1. Loaded coupled resonators

Two series RLC loops have a mutual inductance `M = k sqrt(L1 L2)`. The external source drives loop 1. Loop 2 contains winding resistance R2 and an explicit resistive load RL. With `Z1 = R1 + i(ωL1 − 1/(ωC1))` and `Z2 = R2 + RL + i(ωL2 − 1/(ωC2))`, Kirchhoff’s laws give:

```text
Z1 I1 + iωM I2 = Vs
iωM I1 + Z2 I2 = 0
I1 = Vs / (Z1 + ω²M²/Z2)
I2 = −iωM I1/Z2
```

The coupling sign is a winding-orientation convention; reversing both mutual terms changes the secondary phase, not real delivered power. The accepted domain `0 ≤ k < 1` makes the inductance matrix positive definite. A strictly positive R1 and positive total secondary resistance exclude ideal singular lossless circuits. The source can be zero.

```text
Pin = Re(Vs conjugate(I1))
PL = RL |I2|²
Pwindings = R1 |I1|² + R2 |I2|²
Pin − PL − Pwindings = 0
η = PL / Pin       (displayed as 0 for a source-off state)
```

Units are consistent: `ωM` is ohms, current is amperes, `R|I|²` is watts. Stored magnetic/electric energy is periodically exchanged; its cycle-average derivative is zero. Increasing source voltage multiplies powers by voltage squared but does not improve this linear circuit efficiency. Strong coupling can split response peaks; a nominal isolated resonance need not maximize delivered power. Efficiency and maximum output power are different objectives.

Defaults are 100 μH per coil, capacitances chosen for 100 kHz isolated resonance, 0.5 Ω winding resistance per coil, 5 Ω load, coupling 0.15 and a 1 V RMS ideal source. These are model parameters, not a construction recipe. The 20–180 kHz sweep keeps these lumped parameters fixed. It omits frequency-dependent winding resistance, ferrite saturation, distributed capacitance, electromagnetic radiation, rectification, drive-electronics losses and temperature changes.

The [2025 SeMA comparison](https://link.springer.com/article/10.1007/s40324-025-00405-8) supplies an independent series-series efficiency formula and shows why distributed eddy currents can make fixed lumped models inaccurate. Our power balance is necessary for internal correctness; it does not validate a physical coil geometry.

**Experiment concept:** characterize two passive coils and a resistive receiver with calibrated low-voltage instruments, record source and load real power simultaneously, and sweep frequency at fixed geometry. The useful control is a decoupled receiver or rotated coil. A discrepancy that grows with frequency suggests missing parasitics or loss, not energy creation. Source-side voltage/current phase and instrument uncertainty belong in the comparison. No high-voltage Tesla apparatus is specified.

## 2. Phase-conjugate planar acoustic array

An 8 × 8 square grid of equal ideal monopoles lies at z = 0. Default pitch is 4.2875 mm. At 40 kHz in a homogeneous medium with sound speed 343 m/s, this is half the 8.575 mm wavelength. The centre-to-centre aperture is 30.0125 mm. There is no finite piston, housing, reflector or scatterer in this model.

For source j at position rj and target rt, the phase setting is `φj = k |rt − rj|`. With the same positive-time convention as above, propagation contributes a negative phase:

```text
q(r) = Σj exp(i[φj + εj − k |r − rj|]) / |r − rj|
Qref = Σj 1 / |rt − rj|
S(r) = |q(r)|² / Qref²
```

The coefficient multiplying each source is omitted, so q is a proxy in inverse metres, **not pressure in pascals**. S is a dimensionless **normalized mean-square pressure proxy**. The legacy API property `relativeIntensity` contains S; it does not represent net acoustic energy flux. Interfering, non-collinear waves require a pressure–particle-velocity calculation to recover the intensity vector. Neither total radiated power nor electrical-to-acoustic efficiency is calculated.

Perfect continuous phases give S(rt) = 1 by construction. For fixed geometry the triangle inequality ensures S(rt) ≤ 1 after phase-only errors. The denominator stays fixed when phase error or quantization changes, so the display cannot normalize away a degraded target. Points nearer the source plane can exceed one because the reference is the ideal target, not a global maximum or total power. Apparent global maxima near the array must not be described as the intended focus.

Phase errors are deterministic uniform offsets in the interval ± the selected bound, using an explicit reproducible seed. Nonzero phase-bit count rounds to `2^bits` levels; zero means continuous phases. These are illustrative calibration errors, not a fitted device noise distribution. The x–z cross-section uses the exact point-source sum at every sample; it is a visualization sample, not a finite-difference PDE mesh. The transverse curve passes through the target depth. The axial output samples a line at the target x coordinate; it is a selected line, not a full 3D stability analysis.

**Experiment concept:** compare an array’s measured phase map and target-plane pressure pattern against the calculation, using an appropriate calibrated microphone and isolated test enclosure. First measure individual elements, then coherent, quantized and deliberately perturbed phases. Keep total drive conditions and geometry fixed. Transducer directivity, reflection, heating, amplitude mismatch or scattering can falsify the point-source prediction. Do not infer human exposure safety from a normalized plot.

The [2015 holographic-array paper](https://www.nature.com/articles/ncomms9661) separates a phase-aligned focusing element from trap structure and reports that a simple focal point can repel dense particles. Our simulator implements the lens, not a stable particle trap. A levitation extension would require calibrated fields, material-dependent radiation forces, gravity, object geometry, equilibrium and all stability directions. A positive scalar trace is insufficient to establish a stable three-dimensional equilibrium.

[SMART (2025)](https://pubmed.ncbi.nlm.nih.gov/40394256/) and the [September 2026 rigid-body study](https://doi.org/10.1063/5.0348018) are extension leads, not methods reproduced here: the latter reports force/torque boundary-element modelling and semidefinite field translation. Our review of that 2026 item was limited to official publisher-retrieved metadata, abstract and selected passages. [k-Wave](https://www.k-wave.org/documentation.php) is a possible propagation upgrade for media and boundary effects, but has not been executed or cross-validated in this release.

## 3. Two-mode vibration absorber

Primary mass m1 connects to a fixed support through spring k1 and damper c1. Absorber mass m2 connects to the primary through spring k2 and damper c2. Coordinates x1 and x2 are **absolute** displacements; the attachment dashpot responds to the relative velocity. An external force drives only m1.

```text
m1 x1'' + c1 x1' + k1 x1 + c2(x1'−x2') + k2(x1−x2) = F
m2 x2'' + c2(x2'−x1') + k2(x2−x1) = 0

D11 = k1+k2 − ω²m1 + iω(c1+c2)
D22 = k2 − ω²m2 + iωc2
D12 = D21 = −(k2+iωc2)
X1 = F D22 / det(D)
X2 = −F D12 / det(D)
```

Every D entry has units N/m, so inversion gives displacement in metres. The undamped tuned system, with μ = m2/m1 and `k2/m2 = k1/m1`, has squared-frequency ratios satisfying `s² − (2+μ)s + 1 = 0`. This predicts two split modes, not elimination of the structure’s dynamics. The browser requires strictly positive primary damping so its bare-primary comparison remains finite at resonance; attachment damping may be zero.

```text
Pin = Re(F conjugate(iωX1))
Pprimary = c1 ω² |X1|²
Pattachment = c2 ω² |X2−X1|²
Pin − Pprimary − Pattachment = 0
```

Both stored spring energy and kinetic energy have zero cycle-average derivative in this steady harmonic solution. There is no generator in the implemented device. Replacing a damper with a generator would require an electromechanical load model and would redistribute the same externally supplied energy.

Defaults are m1 = 1 kg, primary natural frequency 16 Hz, primary damping ratio 0.025, mass ratio 0.1, tuning ratio 1, attachment damping ratio 0.12, and force 1 N RMS. The `tuningRatio` defines the absorber’s isolated frequency divided by the primary’s isolated frequency. The displayed ratio-one reference is not labelled a globally optimal design. The sweep compares configured, ratio-one, deliberately detuned and bare-primary responses under the same force.

The [MIT lecture transcript](https://ocw.mit.edu/courses/2-003sc-engineering-dynamics-fall-2011/db987263c6a2ae62499088ef7ecb7b8f_fK9AGvLf3yw.pdf), pp. 13–22, provides the static/antiresonance interpretation and stroke tradeoff. Our viscous-damping matrix follows the displayed force balance rather than a generic diagonal damping assumption. The [2017 inerter paper](https://openaccess.city.ac.uk/id/eprint/17700/) and [FAST manual record](https://arxiv.org/abs/2008.02650) are abstract-level extension leads; neither additional model has been implemented.

**Experiment concept:** use a restrained tabletop structure, a small attached passive mass, measured force and displacement sensors, and compare frequency response with and without the attachment. Repeat with deliberate detuning. Keep drive force measured rather than assuming actuator voltage fixes it. Record absorber stroke and mount flexibility: friction, collisions, nonlinear springs and moving supports can invalidate the model. Improvement at one frequency does not establish improvement over the full operating band.

## Verification and interpretation

Executable analytic fixtures test a hand-solvable coupled circuit and damped two-mass system. Other tests verify an independent closed-form RLC efficiency relation, source-off and decoupled controls, voltage-squared scaling, static and high-frequency mechanical limits, exact undamped-attachment antiresonance, passive power budgets across parameters, global acoustic phase invariance, the one-monopole inverse-square pressure law and the target-coherence triangle bound. Nine preset configurations produce finite model outputs. These checks establish agreement with the stated equations, not measured device performance.

Model comparisons and an evaluator-guided parameter search can generate **conditional hypotheses**: for example, a chosen tuning/damping pair may reduce a selected band’s worst response in this model. Such a result must retain its objective, sampled band, fixed mass budget, held-out evaluations and excluded physics. A browser sweep is not a proof of global optimality. Hardware validation would require independent measurements and a predeclared uncertainty tolerance.

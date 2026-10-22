# Systems panel: final independent review

Research cutoff: 21 October 2026. Round 3 of 3 is complete. **Verdict: pass for the declared synthetic models, cases and source hashes below.** This is independent AI-agent mathematical and software review, not human peer review or experimental confirmation. No physical measurements were made.

The model equations and original NumPy fixtures were frozen in round 2 before the systems reviewer read the electromagnetic or acoustic JavaScript. In round 3, the reviewer inspected those APIs, wrote an adapter and selected additional cases, and compared both implementations with separate complex matrix solves. These later cases are outside the original fixtures and defaults; they are not blinded experimental data. No peer implementation was edited by this reviewer.

## Debate and binding decisions

| Objection | Response and decision |
|---|---|
| A fixed-voltage or fixed-force power maximum can draw more input than the comparison point. | Accept the new fixed-input modes. Compare actual mean input power at the same stated boundary, then enforce constraints on the final scaled response. Retain the original modes with their distinct interpretation. |
| A passive fitted model might be presented as a hardware energy certificate. | Reject that inference. The equation's power identity and a good fit certify neither unmeasured ports nor calibration, initial/final storage, sensor phase, missing modes or parameter drift. |
| The frozen electromagnetic fixture contains a second source port absent from the browser API. | Preserve the original result. It used external mechanical force peak 0.01 N as well as electrical drive. The voltage-only API cannot reproduce that exact two-input fixture. Compare its explicitly derived **Fext=0 specialization**, with all other parameters retained. Do not call that an exact reproduction of the original fixture. |
| The acoustic reference used peak phasors while the browser uses RMS phasors. | Divide the frozen force and response amplitudes by square root of two. Powers are unchanged. The original acoustic fixture then compares exactly within tolerance. |
| Numerical rank might be mistaken for a universal uniqueness proof. | Retain the analytic scaling family as the proof of ambiguity; label rank and nullity as local numerical checks for the declared model, frequencies and tolerance. Absolute velocity needs calibration, orientation and phase information. |

## Independent calculation

The EM comparison solves the three-by-three complex impedance matrix for primary current, secondary current and mechanical velocity. Its entries and reciprocal signs come from the round-2 reference, with the external force restricted to zero for the browser comparison. The acoustic comparison separately solves a two-by-two matrix for mechanical velocity and piezoelectric voltage. Both use RMS inputs and reconstruct each dissipative power directly.

EM stored energy receives a separate check. Form the six-component RMS phasor vector `(i1,i2,q1,q2,v,x)`, where `q=i/(j omega)` and `x=v/(j omega)`. Let K be the physical storage matrix, including mutual inductance in its off-diagonal magnetic entries, and let B contain the real and negative imaginary parts of the phasor vector. The cycle mean is half the trace of `BᵀKB`; its largest eigenvalue is the cycle maximum. This NumPy eigenvalue formulation agrees with the browser's complex second-harmonic expression, including held-out signed and asymmetric cases.

For a linear response to a real drive amplitude a, all phasors scale with a, while mean powers and quadratic energy scale with a squared. Thus a positive target input can be achieved in the model by `a=sqrt(Ptarget/Punit)`. The cross-check recomputes the matrix solution at that amplitude. It checks actual target power and the final source, current/motion, voltage and stored-energy limits. A zero mean unit-input response cannot be normalized to positive mean input.

## Executed checks

`analysis/panel_crosscheck.py` passed **613 explicit software checks**, covering 12 phasor/energy cases, 14 fixed-input sweep scenarios, two rejected zero targets, the conditional load derivative and a further identifiability scale. The check count includes repeated matrix closure and field comparisons; it is not a count of independent experiments. Normal and optimized Python runs produced byte-identical result JSON, so Python's assertion optimization does not remove the gates.

| Cases | Result |
|---|---|
| Seven EM solves | Frozen-equation zero-force specialization; signed/detuned and asymmetric circuits; zero drive, coil coupling, transducer and electrical load. Phasors, powers, mean and peak storage agree. |
| Five acoustic solves | Exact frozen peak-to-RMS fixture; positive dielectric loss; zero mechanical damping, force and piezo coupling. Phasors, powers and mean storage agree. |
| EM 27-cell unordered grid | 18 feasible, nine rejected for no useful response. Best-point fields and true minimum/maximum boundary flags agree. |
| EM postscale constraints | Independent single-cell cases reject drive, current and cycle-peak storage limits separately. A positive target overrides an initial zero drive option as documented. |
| EM zero-response controls | No coil coupling gives zero useful output; no dissipative primary input cannot be rescaled. Rejection reasons agree. |
| Acoustic 99-cell lossy grid | All 99 cells feasible under the declared broad constraints; best-point fields and target input agree. |
| Acoustic postscale constraints | Separate four-cell repeated-parameter cases reject force, velocity and voltage limits. A positive target overrides an initial zero force option as documented. |
| Acoustic zero-response controls | Damped, uncoupled motion can absorb mechanical power with zero electrical output. An uncoupled, undamped off-resonance response has zero mean input and is rejected from positive-input normalization. |

The default comparison tolerance is `2e-12 + 2e-9*abs(reference)`, with tighter stated absolute tolerances for target power, the derivative and velocity scaling. The maximum observed fraction of an allowed comparison tolerance was `6.58e-7`. This is floating-point agreement between implementations, not a measurement uncertainty or error bound over untested parameter ranges.

The optimizers deliberately have different zero-output selection policies. EM excludes useful output at or below a declared 1e-15 W unit-probe floor; acoustic may retain a finite, dissipative zero-output candidate. Both conserve power in the tested cases. That distinction must remain visible and must not be described as different physics or sensor sensitivity. The ideal singular zero-loss resonance is not assigned a physical finite steady state by this review.

## Conditional identifiability and analytic synthesis

For the separate **four-state** RLC–mass model, with known electrical L, C and R, no independent mechanical force and nonzero coupling,

`Zin = Ze + g²/(m s + b + k/s)`.

Changing `(m,b,k,g)` to `(a m,a b,a k,sqrt(a) g)` leaves every electrical impedance unchanged. The analytic log-parameter null vector is `(1,1,1,1/2)`. The declared electrical Jacobian has numerical rank 3 and nullity 1; adding calibrated complex velocity gives rank 4 and nullity 0 at the stated operating point. A further scale 7.3 reproduces this result and changes `v/i` by `1/sqrt(7.3)`.

This does not establish global identification of a hardware device, or identification of Tesla's different six-state coupled-coil model. Unknown electrical coefficients, an unmeasured force input or unknown velocity-sensor gain can add ambiguities. Speed magnitude alone does not determine the sign of the reciprocal coupling. Orientation, phase and sign conventions need separate controls. The quantum panel independently reviewed these qualifications and found no defect in the scaling argument.

The acoustic panel's positive-input efficiency formula also passes independent differentiation. At fixed frequency, with load conductance gL, dielectric conductance Gd, capacitance Cp, damping b and reciprocal coupling theta,

`eta = theta² gL / [b((Gd+gL)²+(omega Cp)²)+theta²(Gd+gL)]`.

For b>0, theta nonzero and unconstrained amplitudes, its stationary maximum satisfies

`gL² = Gd² + (omega Cp)² + theta² Gd/b`.

A positive-dielectric-loss case gives load 3254.868 ohms and efficiency 0.732114 in the reduced model; nearby conductances give lower efficiency. This is a conditional algebraic consequence, not a literature-priority claim. Active force, velocity or voltage constraints can exclude that load; zero damping and zero coupling need separate limits.

## Contract, variables and version integration

The meaningful design thesis is to specify the resource and boundary before optimizing resonance. For the same positive input and feasible set, output power equals efficiency times that input, so the two objectives order candidates identically. This is established energy accounting applied to this project. It adds no unexplained energy term.

| Variable | Classification | Required interpretation |
|---|---|---|
| `q,x` and phases | State coordinates | A coordinate choice does not create another source. |
| Voltage, current, force, velocity, load power | Observables | Require magnitude, phase, sign, bandwidth and calibration. |
| Mutual inductance M and reciprocal g/theta | Coupling parameters | Fixed within these solvers; time variation requires a work port. |
| Target input power and drive/current/voltage limits | Design constraints | Declared numerical controls, not measured component ratings. |
| Sensor gain, phase offset, temperature, mount stiffness and unmodeled losses | Nuisance or omitted parameters | Measure, control or bound them; do not fit them as free energy. |

Keep the original research pages and round-2 receipts as historical versions. Link the current equal-input comparison alongside the old fixed-drive results and expose the boundary used by each. Retain the separate four-state identifiability page rather than presenting all calculators as one physically validated apparatus. The government unit inconsistency remains only a source-quality issue; the round-2 BIPM/MARRS audit does not validate or refute an entire program and is not used as a device equation.

No additional source, universal constant, quantum-to-acoustic mechanism or free-energy discovery is established. Experiments would require independently measured ports, stored-energy changes, source-off controls, calibration uncertainty and held-out replication. Source-terminal EM efficiency excludes upstream supply losses; receiver mechanical efficiency excludes speaker/amplifier power and acoustic capture. Internal transfers must not be counted again in a larger system budget.

## Frozen review scope and reproduction

| Reviewed artifact | SHA-256 |
|---|---|
| `src/em.mjs` | `09ee1be95fe4586b1633fb39dae11fdc7f6a5dc3604461632c320d1e91193984` |
| `src/acoustic.mjs` | `d14db2f4843f328e016dd1f7f29b16612a910b1362599a4bbc74c9cca1f8dff3` |
| `src/identifiability.mjs` | `fa6e497e275d10c1656060883e8fb1b9c865d4686e25bb012e8cde4887683b29` |

The checker also verifies hashes of the untouched round-2 reference and fixture JSON before and after execution. Changed producer bytes require a new review receipt; the old verdict cannot silently follow them. Full parameters and counts are in `round3-results.json`; the review's own source and document hashes are in `round3-freeze.json`.

```sh
python analysis/panel_crosscheck.py --output research/panel/systems/round3-results.json
```

The three research rounds end here. Integration and publication checks do not imply another scientific round or an expanded validation claim.

# Round 2: passive electromagnetic converter implemented and challenged

Research date: 21 October 2026. This round was selected by the advisor after Round 1. Read the acoustic, metrology and systems Round-1 reports before implementing. The systems producer's implementation has not been inspected; independent cross-review remains for Round 3. JS and Python here were written by the same electromagnetic model-agent using distinct formulations, so this is computational cross-formulation evidence, not independent authorship or physical validation.

## Debate and decisions

| Objection from Round 1 | Response | Decision implemented |
|---|---|---|
| Acoustic: peak/RMS ambiguity can produce a factor-of-two error. | All browser phasors are RMS. Time simulation uses sqrt(2) times RMS drive amplitude and signed instantaneous source power. | RMS convention is present in API documentation and result metadata; time-average powers are compared against the phasor result. |
| Acoustic and systems: speaker electrical input and delivered acoustic input can lie on nested boundaries. | The selected lane has one ideal AC electrical input and no external mechanical drive. Its internal transducer is a transfer, not a second source. | Report ideal AC-terminal efficiency; upstream amplifier/control/DAQ losses are explicitly excluded. Never label this wall-to-load efficiency. |
| Metrology: integration of ledger states in the same ODE can conceal correlated errors. | Only six physical state coordinates are integrated. Source work and losses are reconstructed afterward from sampled states and externally integrated. | Publish separate quadrature refinement and ODE-tolerance checks. |
| Metrology: initial energy and differential phase errors can fake surplus. | A source-off run starts with a declared 50 microjoules of magnetic storage. Ideal source phasors do not simulate instrument calibration. | Preserve initial/final energy; do not report measured efficiency. Phase calibration belongs to the separately modeled metrology lane. |
| Systems: electrical input impedance may leave mechanical parameters unidentifiable. | Defaults are declared assumptions, not fits. The velocity channel is an explicit modeled output. | No parameter-recovery or new coupling-discovery claim is made; the independent systems lane carries the identifiability demonstration. |
| Advisor: varying M naively would omit mechanical work. | Both solvers hold M fixed. The exact moving-M derivation remains in Round 1. | No moving-coil gain simulation or unmodeled motion-work claim. |
| Self-review: a stored-energy constraint was ambiguous between cycle mean and peak. | Compute the harmonic energy maximum as well as its mean; verify the maximum with an independent 2×2 quadratic-form eigenvalue calculation. | The sweep's energy constraint applies to cycle-maximum stored energy. |

## Implemented model and API

Files: `src/em.mjs` and `analysis/em_reference.py`. The equations are the fixed-parameter six-state model in Round 1 with Fext=0. Electromechanical force g*i2 and electrical back-emf g*v are reciprocal. Positive `residualW` means output plus internal dissipation minus source input, matching the metrology panel's sign convention.

`emSolve({frequencyHz:1000,coupling:0.3,loadOhm:20,driveVrms:1})` returns source power, electrical-load power, mechanical-load power, internal loss, residual, RMS currents and velocity, cycle-average/maximum stored energy, efficiency, complete parameters and scope. `efficiency` is null when source power does not exceed a stated 1e-15 W numerical denominator floor. Nonpositive storage parameters, negative losses, nonfinite inputs and |coupling|>=1 are rejected. Ideal singular frequency-domain systems are rejected instead of manufacturing a finite result.

The defaults are illustrative linear parameters: L1=L2=10 mH, C1=C2=2.533029591 microfarads, R1=R2=2 ohms, m=1 g, k=39478.4176 N/m, internal mechanical damping 0.05 N s/m, mechanical load 0.1 N s/m, reciprocal coupling 0.5 N/A. The uncoupled electrical and mechanical frequencies are 1 kHz. These are not measured copper-sphere parameters.

For harmonic state z(t)=sqrt(2) Re[z_RMS exp(i omega t)], storage is quadratic. Its cycle mean and harmonic modulation supply a maximum; Python independently constructs the 2×2 cosine/sine Gram matrix and obtains the peak from its largest eigenvalue. This bounds the harmonic steady-state storage only; it does not bound every startup transient.

## Executed evidence

At the default point, input is 58.778860 mW, electrical output is 43.832916 mW, mechanical-load output is 2.435162 mW and internal loss is 12.510781 mW. The useful total is 46.268078 mW and ideal terminal efficiency is 78.7155%. These are synthetic model values.

- Eleven cases compared the browser complex elimination against NumPy's impedance solve. The maximum numerical field difference was 2.22e-16 across the recorded SI-valued fields. This is not a measurement uncertainty.
- Independently reconstructed time-domain mean powers agree with the harmonic solution within 8.91e-13 W for the default periodic initial condition.
- Startup external-quadrature residual decreases from 2.9464e-8 J at 25 samples/cycle to 1.1453e-10 J at 400 samples/cycle. The ODE and quadrature errors are checked separately.
- With source off and initial energy 50 microjoules, output plus dissipation accounts for the depleted storage; the residual is 1.1474e-12 J. Stored energy decreases throughout the sampled trajectory. This is a discharge, not self-supply.
- The zero-drive zero-state control remains zero. M=0 removes downstream response, g=0 removes mechanical response, reversing the mutual-coupling sign preserves powers, and tripling drive RMS voltage multiplies powers by nine.
- The undriven lossless control has a maximum sampled energy drift of 3.3885e-15 J. The algebraic identity establishes model conservation; finite checks test implementations.

## Declared finite search

`emSweep` evaluates 1,395 cells: 31 frequencies from 300 to 2100 Hz in 60-Hz steps; coupling coefficients [0,0.1,0.3,0.6,0.8]; loads [1,2,5,10,20,40,60,80,100] ohms. All use 1 Vrms. Input power is consequently variable, and this is **not an equal-input-energy comparison**. The objective can be total useful power or terminal efficiency. Current constraint: both coil RMS currents <=0.5 A. Storage constraint: cycle-maximum energy <=0.01 J. All baseline cells are feasible. A tighter 0.05-A constraint rejects 215 cells and retains 1,180; the independent NumPy calculation reproduces these counts.

The sampled maximum-power point is 1020 Hz, coupling 0.3, load 100 ohms: 94.601622 mW output for 150.200365 mW input, efficiency 62.9836%. It is at the load-grid boundary; it is not a global optimum. The sampled efficiency objective instead reaches 94.5759% with only 9.819585 mW output. The distinction between power and efficiency is material. A 1379-Hz, coupling-0.45, 13-ohm case is outside the selection grid and is checked separately.

## Updated thesis and limitations

The numerical result supports a practical design thesis: objective selection, loading, constraints and complete boundaries matter more than the largest resonant amplitude. Higher efficiency and greater useful power need not select the same operating point. This applies established circuit/energy methods; scientific novelty is unverified. No anomalous energy, quantum input, unmeasured environment term or physical apparatus result has been established.

Actual device work still needs measured inductance/mutual coupling, reciprocal force/back-emf calibration, frequency-dependent losses, source/converter power, sensor gain/phase covariance, thermal states, calibrated loads and blind replication. The lumped linear model omits eddy-current geometry, radiation, magnetic hysteresis, saturation, rectification and controller dynamics.

Reproduce with `python3 -B analysis/em_reference.py --output research/panel/tesla/em-results.json`. NumPy and SciPy are required. `--check` reruns the checks and verifies the recorded source hashes without rewriting the receipt. The full grid and source-bound results are in `em-results.json`.

Round 3 requested: independent systems/metrology review of sign conventions, transducer reciprocity, stored-energy extrema, sweep denominator and residual interpretation; advisor then selects only supported claims for the website.

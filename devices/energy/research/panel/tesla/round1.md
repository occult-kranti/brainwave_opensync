# Round 1: electromagnetic systems and resonant power engineering

Research cutoff: 21 October 2026. Panel member 1 of 6. Method: Tesla mechanism-resonance skill, with its complete-readout reference. This is a contemporary model-agent engineering perspective, not Tesla's participation or external human peer review. No other panel member's work was read before this report.

## Recommendation and literature boundary

Test a **passive, reciprocally coupled electrical–mechanical converter** with a complete energy ledger. Resonance can improve transfer, conversion and selectivity; a high voltage or a larger local oscillation is not a demonstrated energy source. Treat active negative resistance, feedback and clock circuits as powered ports.

Five primary technical/historical items were selected, with a separate author-institution record used to verify publication metadata. The 2025 WPTCE author manuscript describes passive compensation of adjacent-resonator detuning [EM-1]. A 2025 Reports on Progress in Physics paper implements dispersive gain using a generalized impedance converter and nonlinear resistance [EM-2]. The 2025 clock-pulling preprint adds PLL feedback to select a transfer state [EM-3]. A 2026 Scientific Reports analytical study explicitly joins amplifier, combiner and coupling-dependent link efficiencies [EM-4]. These motivate a full-system denominator, not a self-powered claim. Tesla's US649621A specifies a current source in the transmitting primary and receiving loads [EM-5]. Its grant is documentary evidence of a proposal, not a performance certificate.

Reading limits and URLs are in sources.json. The 2025 clock-pulling v1 HTML displays a later 2026 rendering date; the recorded version remains arXiv:2507.22907v1, 15 July 2025. A 2026 hierarchical-resonator Nature page could not be retrieved and is not admitted as a read source. No exhaustive SOTA claim is made.

## Explicit model and units

States: primary/secondary charges q1,q2 [C], currents i1,i2 [A], transducer displacement x [m], velocity v [m/s]. Fixed positive inductances L1,L2 [H], capacitances C1,C2 [F], mass m [kg], spring k [N/m]. Mutual inductance M [H] obeys |M| < sqrt(L1 L2). R1,R2 >= 0 [ohm] are internal electrical loss, RL >= 0 [ohm] is the delivered electrical load, b >= 0 [N s/m] is internal mechanical damping. A separate bL >= 0 [N s/m] can represent a mechanical load. The reciprocal transducer constant g [N/A = V s/m] is a calibrated coupling, not a free fitted energy term.

q1dot=i1; q2dot=i2; xdot=v,

L1 i1dot + M i2dot + R1 i1 + q1/C1 = Vs(t),

M i1dot + L2 i2dot + (R2+RL)i2 + q2/C2 + g v = 0,

m vdot + (b+bL)v + k x = g i2 + Fext(t).

Vs [V] and Fext [N] are explicit external drives. The mechanical force and electrical back-emf have matched signs: g i2 v leaves the secondary circuit and enters the mechanical subsystem. The model is a linear lumped analog, not a calibrated copper-sphere ultrasonic model.

Stored energy [J]:

U = (L1 i1² + 2 M i1 i2 + L2 i2²)/2 + q1²/(2 C1) + q2²/(2 C2) + m v²/2 + k x²/2.

Multiplying the circuit equations by their currents and the mechanical equation by v gives the exact constant-parameter identity:

dU/dt = Vs i1 + Fext v − (R1 i1² + R2 i2² + b v²) − (RL i2² + bL v²).

Therefore Ein + U(0) = Eout + Eloss + U(T). All terms are joules. With drives off, U is nonincreasing. A finite-window Eout/Ein can exceed one while stored energy is being depleted; no cyclic efficiency follows. For a periodic settled cycle, DeltaU=0 and nonnegative losses give Eout <= Ein when all input ports are counted. Define efficiency only for a strictly positive denominator and state its measurement boundary.

## Position-dependent coupling is an additional work port

A useful connection to the earlier A/B sphere experiment is that translating a coil can change M. The above ODE is explicitly restricted to fixed M during each acquisition. For M=M(x), Faraday voltages include Mdot i2 and Mdot i1. The magnetic storage derivative contains one Mdot i1 i2 term, whereas electrical port power contains two. Their difference is mechanical conversion power P_motion = Mdot i1 i2. Omitting the motion work while varying M is an avoidable false-energy mechanism. Do not implement time-varying M by simply substituting M(t) into the fixed-M equations. Translate, settle and compare fixed configurations first.

## Proposed simulation and acceptance contract

1. Implement the six-state constant-parameter ODE, integrate signed source work, both load works and internal losses. Cross-check against independent quadrature of stored state samples rather than trusting extra ODE ledger states alone.
2. Also solve the harmonic steady state by a complex impedance matrix. Compare cycle-averaged input and output powers with long-time dynamics after transients decay; verify RMS/peak conventions explicitly.
3. Run null controls: M=0 decouples primary from secondary when Fext=0 and initial energy vanishes; g=0 removes mechanical conversion; all drives off dissipates initial energy; all resistances and damping zero conserves U.
4. Reject negative losses, nonfinite values, nonpositive L/C/m/k, and singular or indefinite inductance matrices. Preserve nonzero initial energy in every budget.
5. Converge timestep and integration tolerances. Record the largest *absolute* residual in joules and a relative residual against a declared nonzero energy scale; a tiny input denominator must not manufacture an impressive normalized result.
6. Brute-force a finite, declared grid of drive frequency, mutual coupling and RL. Select useful **load power or full-system efficiency**, with current and stored-energy constraints. Report the grid, boundaries, feasible count and sampled optimum; no claim of global optimization or undiscovered physics.

A manageable illustrative domain is L1=L2=10 mH, C1=C2=2.533 microfarad (isolated electrical resonance about 1 kHz), R1=R2=2 ohm, RL=1–100 ohm, coupling M/sqrt(L1 L2)=0–0.8, g=0–2 N/A. Mechanical parameters must be separately declared and calibrated for any hardware translation. Use modest model drive amplitudes and display currents/voltages; these are simulation inputs, not a construction recipe.

## Measurement traps and falsifiers

Measure instantaneous signed v(t)i(t), not Vrms Irms alone. Count source resistance, amplifier supply, feedback supply, rectifier, DAQ loading and any externally applied vibration; a source-output meter is not wall-input efficiency. Test input-channel phase skew on a known reactive dummy and reconstruct power with a common clock. Do not add apparent powers in VA as if they were joules. Repeat with a dummy resistive load, detuned resonators and the coupling removed. Inspect thermal change and initial/final capacitor/inductor states.

A sustained positive closure residual larger than a predeclared combined uncertainty budget is an anomaly to investigate; it does not identify a new energy source. Reject a proposed self-supply mechanism if the effect disappears when amplifier/control/actuation power or initial stored energy is included.

## Candidate thesis and variables

**Project thesis, novelty unverified:** robust useful power under varying coupling should be optimized jointly with full-boundary energy closure and sensor identifiability. The practical question is whether passive compensation gives better worst-case delivered power per measured input than an active tuning scheme once control power is charged.

Keep new variables operational: M is a measurable inductive coupling [H]; g is reciprocal force/back-emf coupling [N/A]; DeltaU is storage change [J]; epsilon_E = Ein − Eout − Eloss − DeltaU is an accounting residual [J], not energy discovery; uncertainty on epsilon_E remains an experimental obligation. No undocumented vacuum, consciousness or quantum gain term is admitted.

Next-round decision requested: prioritize the passive fixed-M baseline and the missing-motion-work counterexample, then decide whether an active-controller model adds discriminating value within the three-round budget.

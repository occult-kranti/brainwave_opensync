# Acoustic panel: Round 2 response and implementation

Research cutoff: 21 October 2026. Round 2 follows the advisor's choice after six independent Round-1 proposals. This acoustic agent read the Tesla, metrology and systems Round-1 reports, then implemented the accepted acoustic model. No other producer's code or results were inspected before this implementation was frozen. Mathematical/numerical formulations below share this agent's authorship; they are not independent human review.

## Criticism, response and decision

| Incoming criticism | Response | Decision |
|---|---|---|
| Tesla: resonance amplitude is not power gain; source work and stored energy must be complete. | Implemented reciprocal piezoelectric backaction and a source-off decay example with nonzero initial displacement, velocity and voltage. | Accepted. Keep every source/load/loss/storage term. |
| Metrology: define the residual sign and calibrated waveform phase; retain stored endpoints. | All phasors are RMS. Mean input is Re[F conjugate(u)]. Residual is output plus loss plus storage change minus input, positive for apparent excess. External sampled quadrature includes initial/final stored energy. | Accepted. Do not use amplitude products as real power without phase. |
| Systems: speaker electrical input and receiver acoustic input are nested boundaries. | The force-driven calculator reports receiver mechanical efficiency only; no SPL-to-force assignment or wall-power efficiency is invented. A separate plane-wave reference widget never feeds the mechanical force automatically. | Accepted. Display separate boundaries and denominators. |
| Advisor: geometric area is not a universal effective capture area. | Reference-flux function explicitly excludes device-output and capture-bound interpretations, and excludes near/standing fields and dBA substitution. | Accepted. A device efficiency needs measured control-surface power. |
| Acoustic R1: the familiar electrical load optimum assumes prescribed motion. | Implemented coupled frequency/load sweep, plus a separate fixed-velocity optimum and evaluation of that load in the coupled model. | Accepted. Compare hypotheses under the same stated force input. |

## Implemented contract

`src/acoustic.mjs` exports `acousticSolve`, `planeWaveReference` and `acousticSweep` without runtime dependencies. Positive mass, stiffness, capacitance, load and frequency are required; damping, coupling, force amplitude and dielectric conductance are nonnegative. Nonfinite inputs and overflow are rejected. The model is linear, time-invariant and passive, with a resistive AC load. It includes no acoustic radiation/scattering model, rectifier, harvested DC-storage circuit or quantum coupling.

The frozen R1 equations are unchanged. Using **RMS** complex displacement X, velocity U=i omega X and voltage V,

\[
V=\frac{\theta U}{G+i\omega C_p},\quad
X=\frac{F}{k-m\omega^2+i\omega b+i\omega\theta^2/(G+i\omega C_p)},\quad G=G_d+1/R.
\]

Thus `Pin=Re(F conjugate(U))`, `Pload=|V|^2/R`, `Pmech=b|U|^2`, `Pdiel=Gd|V|^2`. No factor 1/2 appears in these RMS mean-power formulas. Time-domain forcing is `sqrt(2)*F_rms*cos(omega*t)`, and stored energy remains `(m*u²+k*x²+Cp*V²)/2`.

For a *prescribed mechanical velocity*, differentiate load power proportional to `gL/[(Gd+gL)^2+(omega Cp)^2]` with respect to gL=1/R. The optimum is

\[
R_{\mathrm{prescribed\ velocity}}=1/\sqrt{G_d^2+(\omega C_p)^2}.
\]

For Gd=0 this reduces to `1/(omega Cp)`. In the force-driven coupled problem, U itself changes with R, invalidating that reduced derivative. This is an application of established reciprocal transduction and load matching, not an assertion of new theory.

## Executed results

Default illustrative parameters: m=0.005 kg, k=0.005(2 pi 200)^2 N/m, b=0.2 N s/m, theta=0.01 N/V, Cp=100 nF, Gd=0, F_rms=1 mN, f=200 Hz, R=10 kohm. They are not identified from a real sample.

- Mean mechanical input: **1.0084234723 microW**.
- Useful resistive AC output: **0.6652627546 microW**.
- Receiver mechanical-to-load efficiency: **0.6597057416**. This excludes speaker/amplifier supply and is not whole-device efficiency.
- A finite grid of **61 frequencies × 81 loads = 4,941 cells**, 100–300 Hz and 100 ohm–1 Mohm, at fixed RMS force found maximum sampled load power **1.2306112691 microW**, at **200 Hz and 1995.2623 ohm**.
- At that sampled point, input is **2.5416925861 microW** and efficiency **0.4841699881**. More delivered load power here comes with more input and lower efficiency than the default: the optimization criterion matters.
- The prescribed-velocity formula predicts **7957.7472 ohm** at 200 Hz. It does not optimize the full force-driven response.
- Maximum absolute harmonic closure residual across the grid: **2.5411e-21 W**. This measures arithmetic consistency of the declared equations, not the accuracy of real instruments.

The grid maximum is a sampled optimum, not a proof of a global optimum. `producer-results.json` contains the input grid, selected-frequency load profile, optimal load at each sampled frequency and full default outputs. The selected-frequency profile is separately evaluated and need not belong to the grid for arbitrary user parameters.

## Verification and failed assertion retained

The reference in `analysis/acoustic_reference.py` solves the full complex **three-state matrix**, whereas the browser implementation uses scalar mechanical-impedance elimination. Four frozen cases include a held-out f=237.5 Hz, R=17321 ohm, changed damping, force and nonzero dielectric loss; zero coupling; and zero drive. The reference was written and executed before reading browser outputs, and `precomparison-freeze.json` binds the corresponding bytes.

Time-domain DOP853 integrates only physical states. Independent Simpson quadrature of sampled force-times-velocity and squared voltage/velocity reconstructs work and losses at 32, 64 and 128 samples/cycle, retaining stored endpoints. Finest relative residuals were **9.96e-10** for startup, **2.10e-9** for the held-out case and **2.77e-9** for source-off decay; refinement reduced each residual. Zero drive with zero initial state produced exactly zero. The undriven example did not output more than admitted initial storage.

Five Node test groups passed. The initial run reported four passes and one failure because a strict JavaScript assertion distinguished signed `-0` from `0` in a zero-input power. The assertion was changed to mathematical zero equality; no producer or reference physics code changed. This test-only repair is retained here rather than described as an energy-balance defect.

Reproduction:

```sh
python3 -B analysis/acoustic_reference.py --output /tmp/acoustic-reference-replay.json
node --test research/panel/acoustic/test_acoustic.mjs
```

## Thesis update and next discriminating task

The original thesis now has a concrete numerical example: **at a fixed applied force, the load maximizing delivered electrical power can differ substantially from a fixed-velocity impedance estimate, and can have lower conversion efficiency.** This is narrow model knowledge that improves this lab's optimization contract; novelty in the literature is not claimed.

For Round 3, ask the independent metrology agent to reconstruct the reciprocal signs and RMS balance, test an off-grid parameter set without importing producer internals, and examine whether UI labels ever combine nested inputs or present reference aperture flux as a universal bound. A real experiment still needs calibrated acoustic intensity/control-surface flux, coupling identification, temperature/phase calibration, storage endpoints, repeatability and held-out measurements. No physical free-energy effect is established.

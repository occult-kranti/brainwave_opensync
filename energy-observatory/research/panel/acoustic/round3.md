# Acoustic panel: Round 3 matched-input decision and peer review

Research cutoff: 21 October 2026. This final authorized research round responds to the advisor's objection that Round 2 maximized power at fixed force while input power changed. The agent reviewed the Tesla member's frozen Round-2 derivation and implementation; the systems member separately reviews this acoustic implementation against its own frozen reference. No physical measurements exist.

## Debate, change and boundary

**Objection:** The 1.2306 microW sampled output in Round 2 cannot be compared as a conversion improvement against the 0.6653 microW default without accounting for their different mechanical inputs.

**Response:** Preserve the original `mode: 'fixed-force'` result and add `mode: 'fixed-input'`. For each candidate frequency/load pair, compute the linear response to one newton RMS, then choose

\[
F_{\mathrm{rms}}=\sqrt{P_{\mathrm{target}}/P_{\mathrm{in}}(1\ \mathrm{N}_{\mathrm{rms}})}.
\]

The numerator and denominator share the same receiver mechanical-input boundary. This is amplitude scaling in a linear model, not a free source of energy. Nonpositive input cannot be rescaled to a positive target and is explicitly rejected. The final response is computed with the required force, then checked against **force, velocity and terminal-voltage constraints**. Unit-force probes are never compared to those final hardware-like limits.

**Decision:** Compare feasible candidates at equal receiver mechanical input. Keep speaker/amplifier consumption outside that reduced boundary and measure it separately for full-system efficiency. Neither acoustic capture efficiency nor room-plane-wave power is implied by this matched-input calculator.

## API extension and constraints

```js
acousticSweep({
  mode: 'fixed-input', targetInputW: 1e-6,
  maxForceRmsN: .01, maxVelocityRmsMps: .05, maxVoltageRmsV: 10
})
```

The existing frequency/load grids and model inputs remain available. Default mode is still fixed force. Returns include feasible/rejected counts, rejection reasons, actual rescaled force and input for each returned point, best feasible candidate, source boundary and constraint scope. If every candidate fails, `best` is null. Source-free reactive responses cannot be assigned a positive real input merely by changing amplitude. A mechanically damped zero-coupling system can accept mechanical power while delivering zero electrical output.

Limits are declared numerical constraints on harmonic steady-state RMS quantities. They are not calibrated component ratings and do not bound startup peaks. The original R2 source/test files were copied into `round2-source/` before extension; `round2-preservation.json` maps the original source paths, and the original freeze/results/reports remain unchanged.

## Executed finite-grid results

All rows use the same 61 × 81 = 4,941-cell grid, 100–300 Hz and 100 ohm–1 Mohm.

| Comparison | Feasible / rejected | Maximum sampled load | Frequency / load | Required RMS force |
|---|---:|---:|---:|---:|
| Original fixed force, 1 mN | 4941 / 0 | 1.230611 microW | 200 Hz / 1995.262 ohm | 1.000000 mN |
| Matched receiver input, 1 microW | 4083 / 858 | 0.793770 microW | 103.333 Hz / 15848.932 ohm | 9.905916 mN |
| Matched input with tighter limits | 848 / 4093 | 0.680455 microW | 186.667 Hz / 8912.509 ohm | 1.838412 mN |

Broad limits are 10 mN, 0.05 m/s and 10 V RMS. Tight limits are 2 mN, 0.003 m/s and 0.3 V RMS. The fixed-force row has 2.541693 microW input at its selected point; the other rows have 1 microW input within rounding. Do not compare the rows as if input were identical. At fixed 200 Hz and matched 1 microW input, the best sampled load is 7943.282 ohm, giving 0.665488 microW output. The optimum changes when the objective and admitted force range change.

The matched-input maximum is a sampled optimum near a force constraint. It is not a global unconstrained optimum or evidence of an additional energy source. All rejected cases remain counted. Maximum absolute matched-input harmonic residual across solved cells was 8.47e-22 W; this is numerical consistency, not hardware uncertainty.

Seven Node test groups passed. The initial extra test wrongly expected the tight limits to reject a load at exactly 200 Hz; in fact rejection occurred at other frequencies. The test was corrected to separately exercise binding force, velocity and voltage limits with six-cell cases. No producer physics change was made in response to that test-fixture correction. Independent systems review is recorded separately by that member.

## Conditional analytic interpretation

At fixed frequency, define gL=1/R, a=omega Cp and G=Gd+gL. The modeled ratio at positive receiver input is

\[
\eta(g_L)=\frac{\theta^2 g_L}{b[(G_d+g_L)^2+a^2]+\theta^2(G_d+g_L)}.
\]

For b>0, theta nonzero and unconstrained force/velocity/voltage, differentiating yields

\[
g_{L,\mathrm{opt}}^2=G_d^2+a^2+\theta^2G_d/b.
\]

Thus the default Gd=0 case has the familiar 1/(omega Cp) optimum under matched input, even though the fixed-force optimum differs. Nonzero dielectric loss generally changes the matched-input optimum relative to the prescribed-velocity formula. Zero damping/coupling cases and active constraints need separate analysis. This is conditional algebra within the declared passive model, not a new law or a claim of literature novelty.

## Matched-input baseline/resonator experiment recipe

1. Use one physical receiver and load, first with a documented baseline inlet and then the candidate passive resonator. Keep support, wiring, readout geometry and temperature comparable. Randomize or balance run order and repeat removal/reinstallation so fixture changes are measured.
2. Choose the **incident acoustic control plane** and valid tube band before comparing devices. Determine incident, reflected and (if present) transmitted wave powers with calibrated phase-sensitive measurements. Match measured incident power between configurations using the source controller; do not match a pressure antinode inside different resonators.
3. Report `Pload/Pin_incident` and `Pload/(Pin_incident-Pr-Pt)` separately, with the uncertainty of the subtraction. The latter is conditional on positive resolved net input. A large absorption coefficient need not mean high electrical conversion.
4. To test this particular lumped force-driven calculator, independently identify the mechanical input `mean(F*velocity)`, for example in a separately calibrated mechanical excitation test. Acoustic input does not automatically equal that single modal mechanical input: acoustic losses, scattering and additional modes need their own allocation.
5. Enforce the source, force, velocity, voltage and temperature limits after matching. Compare a chosen load range and retain infeasible settings, rather than reporting only a high-output point. Freeze the chosen operating point before a held-out repeat.
6. For a whole speaker-to-load budget, use measured electrical supply work and all relevant initial/final storage plus escaping acoustic/thermal outputs. The receiver acoustic/mechanical work is internal to that larger boundary and must not be added again as an independent input.
7. Source-off decay, mechanically isolated dummy, detuned resonator, known resistive load and channel-swap/phase controls remain required. Report AC load energy separately from rectified/storage energy. A positive unexplained residual starts an investigation; it does not identify vacuum or quantum power.

The plane-wave reference widget stays separate. Its area is an explicitly selected flux aperture, not a universal effective capture area for every scatterer.

## Tesla lane peer review

The frozen R1/R2 electromagnetic model has consistent reciprocal signs: g*i2 supplies mechanical power while g*v is an electrical back-emf. The RMS source/load formulas and cycle-average/peak stored-energy expression are consistent with its harmonic convention and constant mutual inductance.

For a prescribed changing mutual inductance, `P_motion=Mdot*i1*i2` is **mechanical power leaving the electromagnetic subsystem** under the stated sign convention. An actuator's input has the opposite sign when no other mechanical storage/loss is included. This is a missing-port diagnostic; the fixed-M implementation does not simulate motion.

One actionable metadata issue was sent to the Tesla author: a sweep accepting unsorted arrays must detect grid extrema using numerical min/max, not the first and last entries. The author accepted the correction for its Round-3 extension. No additional blocking R2 issue was identified in this source-level review; other numerical cross-checks belong to the respective independent reviewers.

## Final acoustic thesis and remaining obligations

**Admitted model finding:** the optimal load and useful output depend on whether force, mechanical input power, or efficiency is held fixed, and on admissible motion/voltage constraints. The practical contribution is the source-bound comparison method, its executable counterexamples and explicit experimental discriminator.

No new constant, free-energy mechanism or quantum/acoustic coupling has been established. Parameter identification, acoustic capture, nonlinear rectification, full supply energy, calibration uncertainty, thermal drift and independent hardware replication remain open. Three authorized acoustic research rounds are complete; publication verification is not an additional research round.

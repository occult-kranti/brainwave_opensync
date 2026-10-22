# Acoustic panel: Round 1 proposal

Research cutoff: 21 October 2026. Role: acoustics and piezoelectric energy harvesting model-agent. Skill: resonance-research-advisor, including measurement contracts. No hardware data were acquired. No other panel report was read before this proposal.

## Decision proposed to the advisor

Investigate whether impedance/load matching increases **useful conversion of a measured acoustic input**, with a source-to-load energy ledger. This is an engineering hypothesis. It does not assume energy creation or that equal numerical frequencies couple unrelated systems. Use a sealed low-power impedance-tube experiment rather than an arbitrary room-pressure reading as the first observable contract.

The strongest practical inference from the reviewed literature is that bandwidth, absorption and electrical conversion are separate design objectives. A high pressure gain or open-circuit voltage is not a power efficiency. Resonators can gather energy from an effective capture region larger than their face: `p_rms^2 A/(rho c)` is a specified plane-wave reference flux through A, **not a universal geometric-area upper bound**.

## Source findings and exact access limits

Five source records are in `sources.json`; the selected coverage is not an exhaustive SOTA claim.

- **Peng, Li and Cummer, APL 2023, DOI 10.1063/5.0158079:** primary PDF read, printed pp. 073903-1 through -5. A tube-based loudspeaker harvester distinguishes incident power, load power and absorption; matching and mechanical loss change usable bandwidth/efficiency. Equations (7)-(8) contain a factor 1/2 while the text says output power “RMS”: implement an explicit peak-phasor convention, or use RMS amplitudes without 1/2. Do not silently transfer that ambiguous wording. The author-page date says August 14; the PDF says online August 16. Only year is used in the graph.
- **Ren et al., PRApplied 2024, 22, 024023:** publisher abstract read. Reports experimentally enhanced acoustic transmission across air/water through impedance coupling and energy harvesting. A transmission enhancement is not an energy-creation result; detailed energy accounting was not inspected.
- **Feng et al., Device 2025, 100756:** indexed publisher summary read; direct HTML/PDF blocked. Its absorption, insulation and generation figures occur at different frequencies/conditions. They cannot be combined into one simultaneous efficiency result.
- **Che et al., Advanced Science 2025, 2409063:** PubMed abstract and figure captions read; full PMC request encountered a browser check. Reported capacitor charging is a useful energy observable. From 47 microfarads, 0 to 2 V in 20 s, ideal capacitor storage is 94 microjoules and mean stored-power increase 4.7 microwatts; this arithmetic does not reproduce the device or quantify source efficiency.
- **Ibrahim and Park, Micromachines 2026, 685:** indexed publisher/abstract text read; full publisher/PDF access failed. Reports an active-learning/FEM cavity design and piezoelectric output. Treat this as a design-method lead; its normalization and hardware claims have not been independently reproduced here.

The sole locally retrieved paper PDF is kept in scratch `downloads/` for reading, not for publication. Its SHA-256 is `7b92930eae915d61b7279d0e6feaed6f25da0b8df5d3c370e49da4a91f38ede5`. Do not publish the downloaded PDF or text extracts.

## Frozen mathematical proposal

Use a lumped passive piezoelectric model with mechanical displacement x [m], velocity u [m/s], terminal voltage V [V], force F [N], mass m [kg], mechanical damping b [N s/m], stiffness k [N/m], coupling theta [N/V = C/m], capacitance Cp [F], load resistance R [ohm], and optional dielectric conductance Gd [S]:

\[
 m\ddot x+b\dot x+kx+\theta V=F(t),\qquad C_p\dot V+(G_d+1/R)V=\theta\dot x.
\]

All m,k,Cp,R are positive; b,Gd are nonnegative. Constant parameters and linear motion are assumed. Multiplying the first equation by velocity and the second by voltage gives

\[
 E=\tfrac12m\dot x^2+\tfrac12kx^2+\tfrac12C_pV^2,\qquad
 \dot E=F\dot x-b\dot x^2-G_dV^2-V^2/R.
\]

This is an exact identity of the stated ODE, not a new physical law. The coupling cancels because it transfers energy between modeled domains. No quantum term is inferred. For a finite record, initial/final stored energy must be retained; for periodic steady state, average source work equals average mechanical, dielectric and load dissipation.

With peak-amplitude phasors, omega=2 pi f, G=Gd+1/R and D=k-m omega^2+i omega b:

\[
 V=\frac{i\omega\theta X}{G+i\omega C_p},\qquad
 X=\frac{F}{D+i\omega\theta^2/(G+i\omega C_p)}.
\]

Mean load power is |V|^2/(2R); mean input power is Re[F conjugate(i omega X)]/2. RMS phasors remove both factors 1/2. The load changes mechanical response through backaction, so the common R=1/(omega Cp) optimum holds only in the reduced fixed-velocity, lossless-capacitor model. A coupled force-driven load sweep must optimize the full solution.

Acoustic port input is `integral_A <p u_n> dA` [W], with particle velocity u_n normal to the boundary. For uniform progressive plane waves only, intensity is p_rms^2/(rho c). A phase-resolved standing/near field does not permit pressure-only substitution. Mechanical input F xdot is not interchangeable with acoustic face pressure times area unless the pressure difference, modal projection and coupling geometry justify it.

## Numerical scale check (arithmetic only)

With rho=1.204 kg/m^3, c=343 m/s and reference pressure 20 microPa, a selected uniform plane-wave aperture A=0.01 m^2 gives:

| Unweighted SPL | RMS pressure | Reference power through aperture |
|---|---:|---:|
| 40 dB | 0.002 Pa | 0.09686 nW |
| 60 dB | 0.020 Pa | 9.6859 nW |
| 80 dB | 0.200 Pa | 0.96859 microW |
| 100 dB | 2.000 Pa | 96.8589 microW |

These are not site measurements, expected device outputs, free-field capture bounds, or recommendations to raise sound level. Weighted dBA measurements cannot be substituted for calibrated band-resolved pressure without a correction.

## Proposed apparatus and controls

Use an enclosed tube below its first transverse-mode cutoff, a low-power driven speaker, calibrated phase-matched microphones at two longitudinal stations, a removable passive resonator/transducer, a measured resistive load, and synchronous voltage/current DAQ. Mount the receiver mechanically apart from the drive; record a structure-borne vibration witness and temperature. The tube geometry, microphone spacing and calibration determine the valid band. Draw all energy ports, including amplifier supply and instrument feeds.

Measure incident/reflected waves to obtain `Pin` and `Pr`. For a one-port rigidly backed device, absorbed acoustic power is `Pin-Pr`; include transmitted power `Pt` for a two-port setup. Compare load power against that net delivered flux, including the uncertainty of subtraction. Separately report overall electrical conversion `Pload/Pspeaker_supply`; it is a different denominator. With rectification/storage, measure capacitor change `C(Vf^2-Vi^2)/2`, leakage, rectifier loss and initial charge; resistive AC output is not automatically net DC storage.

Controls: source-off before and after drive; acoustically blocked but electrically active source; dummy electrical load/transducer; detuning; load sweep including open circuit; microphone swap/calibration; equal incident-power comparison of resonator and baseline; thermal settling; reposition/rotate to probe cable pickup; repeat with mechanically isolated mount. Use a source-off decay tail to expose stored-energy release.

## Round 2 proposal, not yet executed

Implement (1) plane-wave reference-flux calculator with its scope displayed, (2) passive piezoelectric frequency/load sweep from the phasor equations, and (3) independent time-domain integration and external work/loss quadrature. Compare phasor load optimum with the reduced fixed-velocity prediction. Stress tests: zero coupling gives zero electrical load power; zero drive and zero initial energy give zero response; finite initial energy decays without output exceeding stored energy; increasing grid/time resolution converges; output never exceeds supplied work plus storage release within numerical tolerance. Use a held-out frequency/load combination after optimizing the training grid.

Suggested thesis: **Loading-aware resonance design can improve useful acoustic conversion while a measured control-surface budget prevents pressure gain and stored-energy release from being misread as excess generation.** This is a testable engineering synthesis, with novelty unverified. It has no new constant. Candidate variables are measurable coupling theta, dielectric conductance Gd, complex pressure/velocity phase, and observed storage change; each must be identified rather than tuned to manufacture positive residuals.

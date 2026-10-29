# Research round 1 — skeptic admission

Date: 2026-10-29. Read the frozen R1 contract, producer model/report/results/freeze and attribution supplement, independent verifier report/comparison results, and independently executed `round1-counterchecks.py` before reading producer code. This is the first research round only.

**Decision: accept the stated reference-model claims within scope.** The geometry, peak/ringdown distinctions and energy identities are established mathematics, correctly applied in the inspected implementation. They neither detect an Earth event nor verify an OpenAI theorem. Unknown forcing and readout remain an actual inference obstruction for R2.

## Independent domain checks

For the ideal shell, the angular Laplacian eigenvalue l(l+1)/R^2 and assumed nondispersive speed v give omega_l=v sqrt(l(l+1))/R. Thus f_l lambda_h=v and frequency scales as 1/R. This domain assumes R,v>0 and integer l>=1. The real-valued mathematical domain is broader than the API's maximum of 1,000 enumerated degrees and finite representable output range. The approximate historical modal sequence lacks a joint uncertainty model; the common-speed mismatch is a model limitation, not a statistical anomaly test. The NASA printed-page attribution is explicitly separate from its satellite observation date.

For a positive-mass oscillator with omega0,gamma>0, set x=omega^2>=0 and

`D(x)=x^2+(4 gamma^2-2 omega0^2)x+omega0^4`.

The displacement PSD is proportional to 1/D. Strict convexity of D puts its constrained minimum at max(0,omega0^2-2 gamma^2). The velocity PSD is proportional to x/D, whose derivative has numerator omega0^4-x^2. Its positive-frequency maximum is therefore omega0 for **every** gamma>0, including overdamping. The characteristic poles are -gamma +/- sqrt(gamma^2-omega0^2); their imaginary part exists only for gamma<omega0. The two thresholds differ: a positive displacement maximum requires Q>1/sqrt(2), while oscillatory ringdown requires Q>1/2. At the respective equalities the peak is DC or the homogeneous system is critically damped; neither equality permits a positive ringing frequency.

Independent results at f0=7.8 Hz, normalized to omega0:

| Q | Displacement maximum | Velocity maximum | Ringdown frequency | Poles / omega0 |
| --- | ---: | ---: | ---: | --- |
| 5 | 0.989949494 | 1 | 0.994987437 | -0.1 +/- 0.994987437 i |
| 0.6 | 0 | 1 | 0.552770798 | -0.833333333 +/- 0.552770798 i |
| 0.4 | 0 | 1 | none | -0.5, -2 |

This rejects the wrong inference that DC displacement peak means no ringing, and the wrong inference that a positive velocity peak proves oscillatory free motion. Changing displacement to velocity readout changes the numerator but preserves the underlying oscillator poles. Changing gamma changes those poles, even if omega0 is held fixed. A **strictly positive constant** source-PSD or squared-gain scale preserves maxima; zero scale makes every frequency tied. Frequency-dependent gain or source color is outside that invariance claim. No colored-forcing result was executed in this round.

## Energy and dimensional checks

Multiplying the physical-force equation by qdot yields E'=F qdot-2m gamma qdot^2 with E=m(qdot^2+omega0^2 q^2)/2. Independent real-time quadratures at the three Q values used m=2.3 kg, force amplitude 0.73 N and driving frequency 0.87 omega0, separately from producer fixtures. Mean input equals viscous loss within 2.17e-15 relative, under a prospectively coded 1e-12 tolerance. Numerical agreement tests arithmetic; the equation establishes the all-parameter identity. It describes a driven mechanical mode, with no conversion to an electromagnetic cavity amplitude or apparatus output.

The magnetic examples correctly evaluate B^2/(2 mu0): 50 microtesla gives about 9.94718e-4 J/m^3; 1 picotesla RMS gives about 3.97887e-19 J/m^3. There is no additional sinusoidal half factor when B is already RMS. A zero-mean perturbation removes the mean background cross term; a nonzero-mean perturbation would not. Field density is not watts, accessible cycle energy, replenishment or an estimated total terrestrial reservoir.

## Evidence reconciliation and numerical limits

Producer results report 91 checks and 16 invalid/range rejections. The independent verifier reports 79 API requests, 169 scalar comparisons, 15 invalid rejections, nine independently computed real quadratures and three PSD grids; maximum nonzero relative disagreement is 8.99e-16. Different check counts reflect different test sets. The skeptic's three quadratures and boundary checks are additional, not added to those workers' totals.

The admitted model SHA-256 is `86f92e1d90ee7b7b4ac5d8286c830d915a360f0c634fdeae4c2f3798c1443cc8`, matching the verifier and actual frozen producer bytes. The final results' runner hash matches actual `run.mjs` (`ba3c79925cd1ebb116ea285cd44738c0aa8d10926f1b2b01ea4c4a21ac669245`). Initial results were read while finalization was underway; the final matching bindings are the basis of this admission.

The model rejects nonfinite and detected underflow/overflow scales. That does not supply interval-certified or uniformly accurate binary64 results over all admissible real inputs. Exact mathematical thresholds should not be marketed as experimental classification tolerances. The verifier's resolution-aware grid maximum is not a global proof. No complete station record, sensor calibration, contemporary baseline or experimental uncertainty enters these checks.

## Specific next missing premise

R1 assumes white forcing and constant known readout. A station PSD has unknown forcing and instrumental response, so the verified forward formulas do not identify its poles. Recommend R2 freeze a finite frequency band and physically admissible nonnegative forcing spectra, then:

1. Hold omega0 and gamma fixed while separately changing source color and frequency-dependent readout; include positive constant scaling as the no-shift control.
2. Construct two different responses with exactly equal PSDs using S_F2=S_F1 abs(H1/H2)^2. Require finite nonzero responses and integrable spectra on the declared band. Establish equality algebraically, not by grid agreement alone.
3. Test one additional **calibrated complex input-output** observable under a known shared source, and explicitly document what unknown gain/phase restores. A small candidate search cannot establish general inverse uniqueness.

A multimode extension must retain complex interference or explicitly justify an uncorrelated-source covariance. None of these proposed R2 tasks has been executed by this review. The recent Schumann anomaly question remains unresolved for lack of admitted station data, independently of the successful synthetic baseline.

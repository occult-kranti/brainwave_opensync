# Round 1: independent energy-closure and reverse-inference contract

Research date: 21 October 2026 (America/New_York). Role: independent metrology skeptic model-agent, using Newton analysis/synthesis and observable-inference skills. No human physicist participated. No other panel report or producer code was read before this contract. This round freezes proposed tests; it does not claim an executed device experiment or a completed parameter sweep.

## Measurand, boundary and sign

Choose a physical control boundary, time interval [t0,t1], and non-overlapping ports before acquisition. Define **positive R as apparent excess output**:

`R = E_load + E_loss + U(t1) - U(t0) - E_source - E_environment`, all in joules.

For a passive model with every admitted channel accounted for, R = 0. Environmental input can include measured incident vibration, acoustic work, light, heat or RF; it must not be assigned by fitting a residual to zero. E_source includes drive, bias, feedback, controller and switching supply energy that crosses the selected boundary. Useful output and dissipative outflow are separate destinations; never count the same load heat in both E_load and E_loss.

The boundary determines what U and loss mean. In a reduced electromechanical model, U may contain only electrical and mechanical storage and dissipation feeds an excluded thermal reservoir. For a whole-device calorimetric boundary, include changing internal thermal energy in U and count heat only when it crosses that boundary. An internal resistor's heat and the same heat later measured leaving an enclosure cannot both be added as losses.

Use signed port work: electrical `E = integral v(t)i(t)dt`; mechanical `E = integral F(t)v(t)dt`; acoustic `E = integral integral_A p(t,r)u_n(t,r)dA dt`. Voltage alone, displacement alone or sound pressure alone is insufficient. The plane progressive-wave approximation for acoustic intensity is conditional and is not assumed near a resonator.

For fixed linear components, storage includes `C V^2/2`, `L I^2/2`, `m v^2/2`, and `k x^2/2`. Coupled inductors add mutual energy `M I1 I2` with a consistent dot convention and positive-definite inductance matrix. Externally changing C, L, M or k adds a parameter-work port; treating the changing coefficient as free silently introduces energy. Chemical storage, magnetic hysteresis, temperature and preload must be covered by the actual apparatus model, not represented by arbitrary corrections.

## Real power, phase and timebase

For synchronous sine waves, with RMS amplitudes V and I and current lag phi,

`P = V I cos(phi)`, `S = V I`, and `Q = V I sin(phi)`.

Only P is mean work rate. Q is a reactive-power convention for this sinusoidal case, not an independent continuous output-energy stream. For distorted/nonstationary waveforms use the calibrated signed time-product integral; a single fundamental phase factor does not characterize all harmonics.

If measured current is `i_m(t)=sqrt(2) I cos(omega*t-phi-delta)`, then `P_m=V I cos(phi+delta)` and `dP/d(delta)=-V I sin(phi)`. A positive channel-delay error delta_t gives delta=omega*delta_t under this stated convention. Relative small-error sensitivity is `delta P/P approximately -tan(phi)*delta`; it becomes ill-conditioned near 90 degrees. Report an absolute uncertainty there, not a spectacular ratio with a near-zero denominator. Common time-scale error and differential voltage-current skew are different parameters. A common clock can reduce one covariance contribution without eliminating channel transfer-function phase error.

Both acquisition channels need gain and phase calibration through the actual waveform band. Anti-alias filtering, simultaneous sampling, offsets, saturation, shunt burden, common-mode pickup and channel cross-talk are part of the measurement model. State integration endpoints and include startup/ringdown. Steady-state formulas must not be applied to a charging or discharging interval.

## Covariance and acceptance

With `x=(E_load,E_loss,U1,U0,E_source,E_environment)` and `c=(1,1,1,-1,-1,-1)`, the linear energy-ledger variance is exactly `u_R^2=c^T Sigma c` when Sigma is a valid covariance matrix for those estimates. For nonlinear calibration-to-energy calculations, propagate the primitive calibrated parameters with their Jacobian or a justified distribution method. Require Sigma symmetric positive semidefinite; do not accept individually plausible correlations forming an impossible covariance matrix.

A common calibration gain g contributes through the actual shared coefficient `dR/dg`, not by adding every channel's full uncertainty independently. Nor may one assume perfect cancellation between independently calibrated input and output meters. Estimate drift separately; repeatability terms are not duplicated as additional Type B terms. Uncertainty describes a justified knowledge distribution and does not supply missing physical energy.

A proposed screening statistic is `z=R/u_R` only when u_R>0 and the uncertainty model supports that use. A chosen expanded interval `R +/- k*u_R` is not automatically an exact 95% confidence interval. Freeze coverage method and a practical equivalence tolerance epsilon before final data. If the whole interval is inside [-epsilon,+epsilon], support bounded closure for that apparatus and interval; if it contains zero, say no residual resolved. A positive interval excluding zero calls for an unexplained-residual investigation and independent replication, not a new-energy claim. Searching many settings requires a held-out confirmation set or multiplicity handling.

## Reverse reconstruction and identifiability

From an observed residual, work backward through concrete alternatives: omitted input port; stored energy depletion; phase/gain error; unequal integration window; double-counted output; aliasing; thermal drift; and genuine model inadequacy. One scalar R cannot identify those causes. In a toy model `R_app=h+s+b`, where h is omitted input, s is uncounted released storage and b is signed measurement bias (all J), the observation matrix is [1,1,1], rank 1, nullity 2, with kernel witnesses (1,-1,0) and (1,0,-1). Brute-force fitting cannot resolve this non-identifiability. Independent storage endpoints, calibrated phase injection and port isolation supply additional observations.

A useful thesis is therefore conditional: **an apparent surplus that follows differential channel delay or initial stored energy should disappear under independent phase calibration and a closed preparation/run/reset energy cycle.** This is an application of established metrology, not an asserted new physical law. A second prospective result is an instrument-design map of absolute closure uncertainty versus power factor, bandwidth and storage scale.

## Frozen adversarial tests proposed for Round 2

1. **Analytic passivity:** independently solve a linear passive circuit/oscillator by matrix exponential or frequency-domain admittance, while checking work/loss using independent quadrature. Keep integration error and measurement uncertainty separate. Include no drive, detuning, zero coupling, nonzero initial storage and valid positive losses. A finite sweep is not proof of all parameter space.
2. **Phase/skew grid:** phi in {0,30,60,80,85,88,89} degrees; frequency in {100,1000,10000} Hz; differential delay in {-10,-1,0,1,10} microseconds. Compare exact cosine and direct waveform-product estimates (105 declared cells). Include the low-power-factor region and absolute residuals.
3. **Aliasing wrong model:** v=sqrt(2)cos(2*pi*700t) V, i=sqrt(2)cos(2*pi*300t) A over 1 s. True integral is zero. At fs=1000 Hz the two sampled cosines coincide, generating a false 1 J result. At fs=10000 Hz, integer-cycle numerical sampling reconstructs zero within rounding. The invalid 1000-Hz acquisition must be flagged by its bandwidth contract, not called a physical anomaly.
4. **Storage and hidden-port grid:** E_source=1 J, loss=0.2 J, released storage s and hidden input h independently in {0,0.01,0.1,0.5} J. Set E_load=0.8+s+h and Delta U=-s. Complete closure is zero; omitting h yields h, and omitting both yields s+h. Preserve the deliberately wrong reports alongside repaired ones.
5. **Covariance controls:** evaluate the signed quadratic form directly and by a factor-based construction; include perfectly shared gain, independent meter gains, endpoint correlations, and an invalid non-PSD matrix. Reject impossible covariance inputs. Monte Carlo (if used) corroborates a known model, not unknown hardware calibration.
6. **Held-out blind anomaly cards:** before exchanging producer results, freeze exact synthetic raw waveforms and an answer key for one phase error, one storage omission and one missing-input case. Analyst output must label ambiguity when channels do not identify a cause. Do not let a scalar energy solver certify its own model as experimentally complete.

## Transfer from the earlier copper-position page

Read the actual prior protocol. Transfer its fixed input/readout calibration, common-clock treatment, sham/return/remount tests, temperature logs, raw-record retention and separation of fitted poles from largest bins. Balanced ABBA/BAAB can remove an equal-time linear drift from a comparison; it cannot rule out a constant hidden power source or a confound locked to position. That older experiment never measured energy generation and provides no positive premise for such a claim.

## Source and access record

Five primary items support bounded method choices; sources.json records exact URLs and reading depth. NIST TN1297 Appendix A and JCGM100 section5.2 support covariance propagation. NPL's power page describes synchronous sample-product averaging and individual channel calibration. The archived NIST power-service page explicitly warns it is no longer updated: its historical uncertainty figures are not a quote or a performance specification for this lab. Hughes et al. (arXiv:2404.10530v2, submitted IMEKO2024 proceeding) is a recent methodological lead: selected sections 3.1-3.3 and conclusion were read. Its virtual-experiment equivalence assumes a specified model class and known Gaussian fluctuation variance; it does not make arbitrary simulations metrologically valid.

NBS TN1221 was a further lead: web PDF metadata opened, direct download returned HTTP403, so its detailed content was not used. No paid equipment or calibration service has been ordered. No actual voltage, current, acoustic or calorimetric data have been supplied.

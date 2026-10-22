# Acoustics planning round 1

**Admission:** bounded verification/protocol work, not new mathematics or hardware evidence. Baseline: the earlier sphere/fixture tests established common-scale invariance and a two-parameter kernel. The distinct objective is a gain-aware uncertainty budget, then a nuisance-aware pole benchmark. No implementation runs in this planning stage.

## Primary calibration task

Use the existing homogeneous radial-sphere mode with fixed nominal R=0.04445 m, nu=0.34, damping ratio 0.002, E=123.5 GPa and rho=8960 kg/m³. Let

\[
Y(\omega)=\frac{g e^{i\phi}}{m_{eff}(\omega_0^2-\omega^2+2i\zeta\omega_0\omega)}.
\]

The principal parameters are z=(log E,log rho,log g). The combined positive gain g includes input/readout scale; those individual factors are not identifiable separately. Constant phase phi is an additional nuisance when complex data are used. Unknown delay or frequency-dependent gain/phase is outside the baseline and requires declared stress tests or abstention.

At ideal fixed ratio r=omega/omega0, the observables log f0, log|Y| and log specimen mass have sensitivity rows (1/2,-1/2,0), (-1,0,1) and (0,1,0). Without mass the common-scale kernel is (1,1,1); with mass the ideal three-parameter map is full rank. This is conditional finite-model identification, not the full-boundary theorem of OpenAI372.

Steps/artifacts, after separate execution admission:

1. Freeze `future/acoustics/calibration-contract.json`: units, geometry/mode, gain/phase assumptions, frequency design, covariance, seeds, fit bounds and abstention.
2. Produce `calibration-derivation.md` and `calibration-benchmark.py`, importing existing production functions but using an independent reference formula and eigensolver.
3. Record `calibration-results.json`, including failed fits, kernels, whitened sensitivities and interval coverage. Independent skeptic checks frozen adversarial cases; methods reviewer checks algebra and covariance.

Proposed synthetic ranges: E/rho each 0.8–1.2 times baseline; g in {0.5,1,2}; constant phase in {-30,0,30} degrees; complex response SNR {30,40,60} dB; relative frequency SD {10,100} ppm; mass SD {0.1,0.5}%; radius SD {0.05,0.2}%; Poisson SD {0.001,0.005}; shared clock SD 10 ppm. These are benchmark design choices, not instrument specifications. Geometry/calibration uncertainty must be propagated as shared nuisance, not independent noise per bin.

Pre-execution gates: exact ideal rank/kernel derivation; independent noiseless relative agreement <=1e-9; rank tolerance 1e-10 times largest singular value; noise-whitened, parameter-scaled Jacobian condition number <=100 using parameter scales (0.01,0.01,0.05). Otherwise abstain. For predeclared accepted scenarios, 200 replicates must give 90–99% coverage of nominal 95% intervals; report widths rather than promise precision. Zero excitation, duplicate channels and the uncalibrated common-scale witness must fail admission.

**Required PLAN2 correction:** one off-resonance magnitude cannot detect arbitrary frequency-dependent gain. Candidate replacement is four fit ratios {0.65,0.8,1.2,1.4}, two held-out ratios {0.72,1.32}, and a separating log-linear gain-slope family. PLAN2 must freeze fixed laboratory frequencies versus estimated-pole adaptive ratios and propagate their induced covariance. Gain functions agreeing at all sampled points remain untestable. Phase/delay bounds also remain to be frozen.

## Dependent pole benchmark

Only after calibration admission, freeze a two-mode ABBA synthetic benchmark with support/gain/drift changes, nodal suppression, an omitted mode and known intrinsic perturbations. Require nuisance-only alternatives to trigger ambiguity; no tallest-bin classifier. Freeze effect sizes and scoring in PLAN2. Target null false-positive rate <=5%, with 95% Wilson upper bound <=10% over 200 null replicates; report power only for the declared identifiable positive control. Output `pole-contract.json` and `pole-results.json`, never an intrinsic position law.

Cap: eight agent-hours calibration, six pole benchmark; total <=2,000 simulated records, <=60 CPU minutes and <=1 GB memory. Stop on unresolved covariance, structural ambiguity, failed reference controls or cap; retain failure and park hardware. Sensor optimization is deferred.

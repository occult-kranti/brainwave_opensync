# Acoustics final planning round

**Decision:** conditionally admit A1 as a bounded synthetic calibration/verification attempt. A2 pole comparison and sensor optimization remain parked. No implementation, simulation or hardware measurement occurred in planning.

**Objection → revision.** One response magnitude absorbs arbitrary gain at that frequency. Freeze absolute fit frequencies **30, 36, 54, 63 kHz**, and withheld frequencies **33, 59 kHz**, independent of any estimated pole. Fit the constant-gain model from Plan1; evaluate withheld complex responses without refitting. Inject only the declared alternative

\[
G(f)=g_0(f/45000)^s\exp[i\phi_0-2\pi i f\tau].
\]

The baseline has s=tau=0; separate stresses use s=±0.25 or tau=±1 microsecond. They differ on the fixed samples. Arbitrary gain functions agreeing at those samples remain indistinguishable: no universal gain-detection claim is admitted. Constant phase is fitted on (-pi,pi], with circular differences and equivalent phases identified.

**Observable/covariance contract.** Use the declared sphere/receptance, calibrated specimen mass, radius and Poisson reference, and a separately acquired pole estimate. With shared clock error b, actual drive frequencies are (1+b) times commanded frequencies and reported pole frequency is f0/(1+b) plus its independent error. Never reuse the pole estimate to select drives or manufacture independent response ratios. Joint inference includes b, R, nu and constant phase as nuisance parameters; any later pole reuse requires its joint covariance, otherwise abstain. Damping remains exactly 0.002 in this model.

Complex noise has independent real/imaginary SD |Y|10^(-SNR/20)/sqrt(2), with its known synthetic variance declared. Tight calibration SDs: frequency 10 ppm, mass 0.1%, radius 0.05%, nu 0.001. Wide: 100 ppm, 0.5%, 0.2%, 0.005. Shared clock SD is 10 ppm in both. Calibration errors are independent Gaussian draws conditional on the shared clock; clock draws are truncated at five SD. These are proposed synthetic uncertainties, not instrument specifications.

**Finite allocation.** Nine scenarios ×200 records=1,800; at most200 deterministic controls; total cap2,000 multichannel records, each containing six complex samples. Five baseline scenarios are reference/tight/60dB, reference/tight/40dB, reference/wide/30dB, (E,rho,g)/reference=(0.8,1.2,0.5), phase−30°/wide/40dB, and (1.2,0.8,2), phase+30°/wide/40dB. Four reference/tight/60dB scenarios individually inject the slopes/delays above. No Cartesian expansion, retry-derived exclusion or adaptive frequency selection is allowed.

**Acceptance before execution.** Derive the fixed-frequency Jacobian afresh; Plan1’s response row applies only to fixed true-frequency ratios. Noiseless independent agreement must be ≤1e−9 relative. For log(E),log(rho),log(g), whiten the real-stacked joint observations using declared covariance, profile nuisance directions, and scale columns by (0.01,0.01,0.05). Require rank3 at relative tolerance1e−10, condition number≤100 and minimum singular value≥1; otherwise abstain. Also require nominal95% interval coverage90–99% per baseline scenario, with relative interval half-widths≤5%,5%,10% for accepted records. Publish coverage both before and after abstention.

Use a predeclared parametric-bootstrap held-out residual test at alpha0.05, with500 bootstrap draws per scenario from a separate seed stream. Baseline false-positive fraction must be≤5% and Wilson95% upper bound≤10%; each specified stress requires ≥90% rejection. Failure downgrades that scenario; thresholds remain unchanged. Bootstrap draws are algebraic likelihood draws, included in the CPU cap, not additional acquisition records.

**Remaining gates and handoff.** Freeze exact likelihood, interval method, bootstrap statistic and seed manifest before implementation; independent methods review must approve covariance/profiling. Skeptic freezes wrong controls, including common-scale gain symmetry, duplicate channels, zero excitation and sample-matching gain. Produce the four calibration artifacts named in Plan1 plus an acceptance/abstention ledger. Cap eight producer hours plus two reviewer hours,60 CPU minutes,1GB. Stop on structural ambiguity, unresolved covariance, failed controls or cap. A2 requires a separate future contract; no intrinsic-location law or complete-spectrum claim follows.

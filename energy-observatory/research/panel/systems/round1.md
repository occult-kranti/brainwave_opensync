# Systems scientist: round 1 independent proposal

Research cutoff: 21 October 2026 (America/New_York). Role: applied mathematics, experimental systems and thesis synthesis. Dedicated methods: Newton analysis/synthesis and paired forward/reverse physics. This is one model-agent report, not human peer review or participation by a historical scientist. No other current panel report was read. No new physical data exist. Proposed new simulations below have not yet run.

## Recovered baseline and unresolved obligations

Read the copper-position contract and advisor decision at `a8913c825d24299283c9379282ae3876e2a0c0cd`, the location-spectrum expansion review/validation at `07e57b446a9f480216ad1aa555088bc361006d9c`, and the inherited `research-atlas/research/round1/{contract.md,README.md,interpretation.md}`. These are distinct versions and scopes.

The old atlas already provides a passive two-mass benchmark with input work, damping and stored energy. Its scalar time-domain solver integrated work/loss alongside motion; the independent phasor comparison and convergence checks provide additional evidence, but a tiny self-integrated closure alone is not an independent certificate. Its reported numbers were read, not rerun in this round. The copper-position page adds matched readout geometry, covariance and controlled A/B acquisitions, not an energy-generation result. The newer location version adds acquisition/aliasing and explicit inverse nullspaces. Its broader Poisson-ratio edge repair must not be presented as a discovered error in the position calculator, whose admitted domain is narrower. Both experiments have zero physical measurements.

**Transferable lesson:** a response peak, a good fit, a frequency match, and a model's internally exact conservation law are four different claims. None closes an experimental energy budget.

## Proposed explicit mixed-domain baseline

Choose a small linear reciprocal electromagnetic transducer driving a supported mass through a series electrical RLC circuit. Acoustic excitation may enter only as a separately calibrated force on the moving surface. This is an illustrative model, not an identification of a particular real apparatus.

State: electrical charge `q` [C], current `i` [A], mechanical displacement `x` [m], velocity `v` [m/s]. Fixed positive `L,C,m,k`; nonnegative internal resistance `Ri`, load resistance `RL`, and mechanical dissipation `b`. Reciprocal coupling `g` has units N/A = V s/m. External voltage `u` [V] and external acoustic/mechanical force `Fa` [N] are declared inputs.

\[
\dot q=i,\qquad L\dot i=u-(R_i+R_L)i-q/C-gv,
\]
\[
\dot x=v,\qquad m\dot v=gi-bv-kx+F_a.
\]

\[
H=\tfrac12Li^2+\frac{q^2}{2C}+\tfrac12mv^2+\tfrac12kx^2,
\qquad \dot H=ui+F_av-(R_i+R_L)i^2-bv^2.
\]

The `-giv` and `+giv` contributions cancel algebraically. With measured signed boundary work `Win=∫(ui+Fa v)dt`, useful load energy `Wload=∫RL i²dt`, and internal dissipation `D=∫(Ri i²+bv²)dt`,

\[
\mathcal R=\Delta H+W_{\rm load}+D-W_{\rm in}=0.
\]

This is an exact identity of this fixed linear model; it is not a measured law for the proposed device. With no drive, `H(t)+Wload(t)+D(t)=H(0)`. A finite output with zero current input may be discharge of initial storage. Load energy divided by signed net work is not a stable universal efficiency when that denominator approaches zero or becomes negative. Report energies first and define a cycle/charging protocol before ratios.

An acoustic pressure port uses pressure difference `Δp` [Pa] and volume velocity `Q` [m³/s], with power `Δp Q`. Replacing it by `Fa=Δp A` and `Q=A v` requires a uniformly driven piston approximation. A microphone pressure alone does not determine net acoustic energy flux in a general near field. If electrical power into a speaker and acoustic power arriving at the harvester are both measured, they belong to nested boundaries; adding both as independent inputs double-counts an internal transfer.

The equivalent port-Hamiltonian form is `zdot=(J-R)∇H+Bu`, `y=Bᵀ∇H`, with `J=-Jᵀ`, `R≥0`. Then `Hdot=uᵀy-∇HᵀR∇H`. A fitted state/output needs a calibration map before `uᵀy` can be interpreted as physical watts. For time-dependent material/control parameters `λ(t)`, include `∂H/∂λ · λdot` and the actuator/control supply that implements the variation. Do not change a resonance parameter without paying its work cost.

## An exact reverse-inference obstruction

For the fixed linear model, with `Fa=0`, define mechanical and electrical impedances

\[
Z_m(s)=ms+b+k/s,\qquad Z_e(s)=Ls+R_i+R_L+1/(Cs).
\]

The measured electrical driving-point impedance is

\[
Z_{\rm in}(s)=Z_e(s)+g^2/Z_m(s).
\]

For any `a>0`, the transformation

\[
(m,b,k,g)\mapsto(am,ab,ak,\sqrt a\,g)
\]

leaves **all** of this electrical transfer function unchanged. Electrical data alone can at most identify the three combinations `b/m`, `k/m`, and `g²/m` in this ideal known-electrical-parameter family. The four-parameter log-space sensitivity has null vector `(1,1,1,1/2)`; generic full-transfer identification has rank 3 and nullity 1 in this subproblem, with additional discrete ambiguity in the sign of `g`. Degenerate/no-coupling cases lose more information. A finite noisy trace cannot improve that upper bound.

A calibrated mechanical velocity channel adds `v/i=g/Zm`, which changes by `1/√a` under this transformation. An independent absolute mass measurement also breaks the positive scaling ambiguity. Blindly brute-forcing four parameters will return equally fitting families, not discover a hidden energy coefficient. This is a model-specific application of established structural-identifiability reasoning; scientific novelty is not claimed.

## Variables and proposed thesis

| Symbol | Classification | Units | How admitted |
|---|---|---|---|
| `x,q` | State coordinates | m, C | Fixed declared circuit/mechanical realization |
| `u,i,Fa,v` | Measured port observables | V, A, N, m/s | Independent calibration, phase and common timebase |
| `g` | Reciprocal constitutive coupling | N/A | Joint electrical/mechanical identification; no frequency-only assignment |
| `Ri,RL,b,L,C,m,k` | Constitutive/storage/load parameters | SI | Independently measured or explicitly fitted in identifiable model family |
| `λ(t)` | External control coordinate | Declared per parameter | Control law and modulator energy port required |
| `τvi,τFv` | Timing nuisance parameters | s | Calibrated channel delay; not fitted freely to force closure |
| `H0,HT` | Boundary stored-energy estimates | J | Initial/final state measurements and material calibration |
| `Rcal` | Observed closure residual | J | Report covariance and systematic uncertainty; not a new power source |
| `a` | Nonidentifiability coordinate | dimensionless | Labels indistinguishable models; not a new physical constant |

**Proposed thesis:** Joint energy closure and observability should be prerequisites for reporting resonant conversion gains. A device may pass an energy-conservation test while its internal parameters remain unidentifiable; it may fit spectra while its energy boundary is incomplete. The planned contribution is a reproducible experiment-design criterion and adversarial demonstration, not a new conservation law or an energy source.

## Falsifiable hypotheses and next-round acceptance proposal

1. Reciprocal passive baseline closes the independently reconstructed budget, and the undriven system cannot deliver more energy than its independently established initial storage. Check both exact frequency-domain power and time integration, with separate sampled-power quadrature and refinement.
2. A model with deliberately mismatched force/back-emf constants gains a residual `(gt-ge) i v`. This should be rejected unless an active/control energy port is specified. A nonreciprocal physical device is not automatically impossible; this two-port passive model is insufficient for it.
3. Test electrical transfer invariance across a finite declared `a` grid, then show that a calibrated velocity channel breaks it. Publish the analytic invariance, actual tested grid and singular-value/rank thresholds separately. A dense grid is not a completeness proof; the equation supplies the continuum statement here.
4. Vary load and frequency jointly. Optimize **delivered load energy at fixed measured source energy and constraints**, not voltage alone. Preregister hold-out drive frequencies, load values and a second initial condition; fit only on training runs.
5. Use synthetic channel delay, unmeasured initial charge, and omitted acoustic input as distinct wrong-model controls. A detected residual identifies incompatibility with the admitted accounting, not which speculative mechanism caused it.

Do not add a neural inverse model until enough calibrated data exist to distinguish this small passive family from the proposed alternative. Modern structure-preserving ML is useful as a future method; training on simulated passive data cannot establish passivity of a hardware device by itself.

## Selected primary source use

- Karsai et al., [arXiv:2409.06256v2](https://arxiv.org/html/2409.06256v2), revised 16 April 2025: introductory passivity and pH equations inspected. Supplies the energy-port framework; equivalence claims have hypotheses and do not validate a device.
- Cherifi et al., [ISO-pHNN v3](https://arxiv.org/html/2501.06118v3), revised 20 August 2026: introduction and sections 2.1–2.2 inspected. Uses input-state-output data and structured `J,R,H,B`. Its stated Hamiltonian lower-bound treatment is local to a compact training neighborhood; do not advertise a global hardware certificate.
- Hagelaars et al., [pH-DAE identification v1](https://arxiv.org/html/2601.16827v1), 23 January 2026: abstract/introduction inspected. Reports constrained IO identification and a DC network simulation. No algorithm was run here, and no general uniqueness result is imported.
- Ortega and Yin, [Learnability of Linear Port-Hamiltonian Systems](https://arxiv.org/abs/2303.15779), 2023: abstract only. Useful uniqueness/coordinate lead; this report does not claim to have verified its theorem or applied its algorithm.
- [Modelica TranslationalEMF documentation](https://doc.modelica.org/om/Modelica.Electrical.Analog.Basic.TranslationalEMF.html): complete short official component description read, generated 2020. Relevant implementation building block; current build-host timeout and raw-source retrieval failure are recorded. No Modelica simulation executed.

HAL's 2021 structural-identifiability PDF was blocked by an access challenge and remains an excluded lead, not a read source. These selected records are not an exhaustive SOTA review. Exact dates, versions and reading depths are in `sources.json`.

## Version integration recommendation

Use an energy hub with distinct pages for electrical conversion, acoustic harvesting, quantum work, experimental accounting, evidence network and three-round debate. Preserve immutable version routes for the earlier atlas passive benchmark, copper position release and location v1/v1.1. Store source commit, subdirectory, license, original scope, later patches and new deployment hash separately. Link the original version pages and import their tools under dedicated relative paths; do not relabel their numbers as an executed new energy experiment. Preserve master/archive routes and their deployment exclusions. Keep new code and changed contracts in the new branch; make the earlier byte inventories inspectable.

Root advisor selects round 2 after all independent round-1 reports. No second or third round is pre-executed here.

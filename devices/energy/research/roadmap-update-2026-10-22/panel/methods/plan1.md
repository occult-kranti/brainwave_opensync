# METHODS-1 — planning round 1

**Class: engineering/verification attempt.** Certify the existing six-state two-coil/mechanical model using exact rational matrices. The new project contribution is coupled-block coverage and source binding; the energy law is established mathematics. The previous scalar identity and floating-point phasor checks are baseline evidence, not new outcomes here.

## Frozen target

Use z=(q₁,q₂,x,i₁,i₂,v), u=(Vₛ,F), y=(i₁,v), with the instantaneous equations and quadratic storage from `review.md`. All coefficients are constant. Require positive C₁,C₂,L₁,L₂,m,k, positive L₁L₂−M², and nonnegative losses.

Proposed exact SI fixture: L₁=1/100 H, L₂=1/25 H, M=1/200 H; C₁=1/10⁶ F, C₂=1/(2·10⁶) F; m=1/100 kg, k=10⁴ N/m; R₁=2 Ω, R₂=3 Ω, R_L=7 Ω; b=1/5 and b_L=3/10 Ns/m; g=1 N/A. These choices include nonzero mutual inductance and transduction. Freeze them before implementation.

Check Q symmetry, `Q=Tᵀdiag(d)T`, exact rank(T)=6, strictly positive d, and

`QA+AᵀQ=−2L_loss D_loss L_lossᵀ`, `QB=Cᵀ`.

Here A,Q,T are 6×6; B is 6×2; C is 2×6; L_loss is 6×3; D_loss is nonnegative diagonal. The storage witness has `T[i₁,i₂]=M/L₁`, otherwise identity, and `d=(1/C₁,1/C₂,k,L₁,L₂−M²/L₁,m)`. The loss selector retains i₁,i₂,v.

An independent reviewer must inspect the general fixed-parameter differentiation argument. The executable certificate proves only its supplied rational instance; passing several instances does not establish the general parameter family.

## Sequence and controls

1. Freeze source hashes, physical equations, units, state ordering and both ports. Record q in coulombs, x in metres, i in amperes and v in metres/second; both Vₛi₁ and Fv have power units. SI reference scales produce a dimensionless numerical contract.
2. Build the equation assembler and independently authored certificate checker. The checker consumes witnesses rather than calling producer reconstruction functions.
3. Admit the coupled fixture, its zero-loss specialization and a consistently transformed invertible rational coordinate change. Zero dissipation does not imply asymptotic stability.
4. Reject a single reversed reciprocal sign, missing mutual-storage term, singular/indefinite inductance, omitted Fv, negative resistance, rank-deficient storage factor, perturbed loss factor and an unconverted mA/A field. Record exact failure reasons.
5. Compare the **F=0 specialization** with the existing browser solver at angular frequencies 100, 1000 and 5000 rad/s, drive 1 Vrms and coupling 1/4. Convert to `frequencyHz=omega/(2*pi)` and preserve RMS conventions. This is a separate floating-point adapter check, with normalized tolerance `1e-11+1e-9|reference|`, not the exact certificate.

## Acceptance, artifacts and stop

The skeptic independently checks frozen mutations and mathematical semantics; the energy/systems reviewer checks physical port and unit binding. Corpus records the precise statement and evidence class. Acceptance requires every declared positive/wrong control to behave as specified, source-bound hashes and explicit independent review. Missing review means pending, not pass.

Planned artifacts under `execution/methods/` are the model contract, source binding, assembler, checker, certificate, control results, browser-adapter results, hashes and independent review. Full names are in `plan1.json`.

Cap base work at 14 agent-hours including review; exact runs use ordinary CPU, at most five minutes and 1 GiB each. Optional Lean bootstrap gets two additional hours; if unavailable, stop. If available, a pinned finite matrix/quadratic-form proof gets four further hours, with build log and axiom inventory. No kernel claim without execution.

Stop after the frozen cases or an unreconciled semantic/domain failure; preserve failures instead of widening scope. No implementation occurs in planning. No hardware, continuum, spectral-gap or energy-surplus conclusion is admitted.

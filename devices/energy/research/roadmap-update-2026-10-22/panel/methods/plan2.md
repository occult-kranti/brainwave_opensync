# METHODS-1 — final planning round

**Conditional admission: engineering verification of a known six-state model.** No implementation or result is produced by this plan. REVIEW and PLAN1 remain unchanged.

## Objection → revision → remaining acceptance

**Defaults would test another circuit.** The adapter must supply every `emSolve` parameter explicitly:

| Parameter | Supplied value |
|---|---|
| `frequencyHz` | ω/(2π), ω=100,1000,5000 rad/s |
| `coupling` | 1/4 |
| `loadOhm` | 7 |
| `driveVrms` | 1 |
| `L1H` | 1/100 |
| `L2H` | 1/25 |
| `C1F` | 1/1000000 |
| `C2F` | 1/2000000 |
| `R1Ohm` | 2 |
| `R2Ohm` | 3 |
| `massKg` | 1/100 |
| `stiffnessNpm` | 10000 |
| `dampingNsPm` | 1/5 |
| `mechanicalLoadNsPm` | 3/10 |
| `transducerNA` | +1 base; −1 signed control |

The adapter checks the complete key set, every echoed parameter and derived M=1/200 H before comparing outputs. Omission of a nondefault parameter must fail before execution. Rational inputs convert once to browser doubles. F=0 exactly: the browser has no force-input parameter. Phasors are RMS, with a phase-zero voltage source. Retain the separately normalized tolerance `1e-11+1e-9|reference|`; this is a three-frequency floating-point adapter check.

**A consistent sign convention is not broken reciprocity.** Add z=S z′, u=P u′, y′=Pᵀy with S=diag(1,1,−1,1,1,−1), P=diag(1,−1). Transform A′=S⁻¹AS, B′=S⁻¹BP, C′=PᵀCS, Q′=SᵀQS. Both transducer signs then correspond to g′=−g; supply and storage remain invariant. This positive control must pass. For F=0, browser currents/powers remain unchanged while the complex velocity reverses. Reversing only one reciprocal term must still fail.

**Time-varying storage requires additional accounting.** Admit constant coefficients only. For varying Q,

`dH/dt=zᵀQ ż + ½zᵀQ̇z`.

The second term cannot be dropped. Physical varying-inductance equations also contain `d(Li)/dt=L i̇+L̇i`; inserting only the storage term into the old ODE is insufficient. Any extension needs rederived dynamics and a signed actuator/control-work port. Reject time-dependent model coefficients as outside this certificate; arbitrary time-dependent source inputs u(t) remain permitted with fixed coefficients.

## Evidence, gates and caps

Preserve exact checks of positive storage/factor rank, dissipative matrix equality and `QB=Cᵀ` for the rational fixture, lossless specialization and coordinate controls. Keep wrong mutual-storage, nonpositive magnetic determinant, missing nonzero Fv, negative loss, deficient factor, perturbed Gram and mA/A controls. The state/port unit ledger remains mandatory.

Separate four outcomes: fixed rational certificate, independently reviewed general fixed-parameter derivation, floating browser agreement and optional Lean receipt. Instance tests prove neither the entire parameter family nor physical hardware correctness. The skeptic checks mutations and semantics; the energy/systems reviewer checks units and ports; corpus records exact evidence scope.

Retain `execution/methods/` contract, matrices, assembler/checker, controls, adapter results, source hashes and independent review. Base effort remains capped at 14 agent-hours, with five-minute/1-GiB exact runs. Optional Lean bootstrap gets two hours; stop if unavailable. A successful bootstrap permits at most four further proof hours, requiring pinned dependencies, build log and axiom inventory.

Stop at the frozen gates, unresolved contradiction or resource cap. Report incomplete work honestly. No extra research round, reduction project, continuum claim or energy-surplus claim is admitted.

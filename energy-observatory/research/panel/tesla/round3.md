# Round 3: equal-input comparison and final peer criticism

Research cutoff: 21 October 2026. This is the third and final authorized research round. The advisor selected a new comparison after Round 2 demonstrated that the fixed-voltage maximum-power point and maximum-efficiency point draw different input power. Earlier round documents, results and hashes are retained; pre-change code is in `round2-source/`.

## Objection → response → decision

| Critic or evidence | Response | Executed decision |
|---|---|---|
| Advisor: fixed voltage does not hold the source-power budget fixed. | Linear response permits an exact amplitude normalization at each fixed parameter point. | Add optional `mode:'fixed-input'`, with target terminal input power and a maximum required RMS drive. Preserve default fixed-voltage behavior. |
| Advisor/metrology: constraints must hold after normalization. | Increasing drive increases currents linearly and storage quadratically. Testing only a unit-drive reference would admit infeasible candidates. | Recompute the scaled solution and enforce current and cycle-peak storage limits; enforce the required drive limit. Add cases that pass unit-drive limits but fail after scaling. |
| Acoustic peer: grid arrays may be unordered, so first/last elements do not identify extrema. | The accepted API does not require sorted arrays. | Boundary labels now compare against actual minimum/maximum grid values. An unordered-grid control passes. |
| Acoustic peer: sign of moving-M work must identify its boundary. | `P_motion=Mdot*i1*i2` is mechanical power **out of the electromagnetic subsystem**. For prescribed motion with no other mechanical storage/loss, actuator work into the system has the opposite sign. | Clarify this interpretation here; no naive moving-M simulation is added. |
| Tesla review of quantum Round 2: energy-dimensional Hamiltonian norms can be mistaken for consumed power or source work. | Joule dimensions do not establish that a norm equals an integrated energy transfer. The admitted qubit state is itself a preparation resource. | Accept the quantum lane's fixed-H, ideal-state calculation with `apparatusEfficiency:null`. Retain explicit preparation, control, readout and reset obligations; no acoustic-to-qubit coupling or apparatus efficiency is inferred. |

## Fixed-input calculation

For a 1 Vrms reference at a declared frequency/coupling/load point, let `P1` be positive real source-terminal power. The required voltage is

`V_required = sqrt(P_target/P1) × 1 Vrms`.

All complex currents and velocity scale with `V_required/(1 Vrms)`; powers and quadratic stored energies scale with its square. The implementation re-solves at the required drive instead of attaching a new gain term. Only the source amplitude changes; mutual inductance, material parameters and reciprocal coupling remain fixed. This is a steady-state comparison, not a dynamic controller or a charging/reset protocol.

API:

```js
emSweep({
  mode: 'fixed-input', targetInputW: 0.05, maxDriveVrms: 5,
  maxCurrentRmsA: 0.5, maxStoredEnergyJ: 0.01,
  objective: 'outputW'
})
```

The existing frequency/coupling/load arrays can be supplied unchanged. `driveVrms` is replaced by the required drive only in fixed-input mode. Metadata exposes the normalization reference, 1e-15 W numerical floor, rejection reasons, actual drive, target mismatch, declared grid and boundary flags. `maxDriveVrms` constrains fixed-input normalization; the default fixed-voltage behavior is retained.

Reference input or useful output at/below 1e-15 W is excluded from the fixed-input optimization. A zero-transfer passive configuration is physically valid and remains a conservation control; it is not a useful conversion candidate and cannot be normalized into a claimed discovery. This numerical floor does not measure hardware SNR. Invalid mode/target/drive-limit inputs are rejected.

For exactly equal positive input power, `Pout=eta*P_target`, so maximizing useful power and maximizing efficiency order candidates identically over the same feasible set. That conditional identity explains the comparison; it is not a new energy law or a scientific-priority claim.

## Executed results and constraint failures

The original 1,395-cell grid is unchanged. At a 50 mW ideal AC-terminal target and a 5 Vrms drive limit, 667 cells are feasible. Of 728 rejected cells, 279 have no useful transfer at the reference floor and 449 require excessive drive. All admitted cells satisfy the post-normalization current and peak-storage bounds. Maximum target mismatch is 3.47e-17 W in this numerical run.

The sampled best is 2100 Hz, coupling 0.8 and electrical load 100 ohms. Required drive is 2.19446561 Vrms. Model source input is 50 mW; electrical load is 47.28785705 mW, mechanical load is 0.00011354 mW, and internal loss is 2.71202941 mW. Total useful output is 47.28797059 mW, corresponding to 94.57594% **ideal AC-terminal** efficiency. The point is on all three grid boundaries. Neither the fixed grid nor constant resistance model establishes a global physical optimum.

Nine fixed-input test scenarios were reconstructed with a separate NumPy complex matrix implementation, including the complete grid, a singleton default point, a held-out 1379-Hz/coupling-0.45/13-ohm point, an unordered grid and explicit rejection controls. A 0.2 W target at the default circuit fails a 0.08-A current limit after normalization, although its 1 Vrms reference would pass. The same target fails a 0.00015 J peak-storage limit after normalization. A 0.5 Vrms voltage cap rejects the required drive. Zero-transfer and zero-real-input controls are rejected without division by zero. All counts and best-point fields match the independent formulation within the declared tolerances. Existing Round-2 dynamics, storage, conservation and 11 phasor checks still pass.

## Peer review and evidence status

The acoustic peer separately checked the reciprocal signs, RMS power definitions and cycle mean/peak storage formula, identifying the boundary-label issue repaired above. The systems peer received the code freeze and exact parameter mapping for independent final checks. Its review record is maintained by that peer and the advisor; this report does not predeclare its outcome.

This producer wrote both the browser implementation and its alternative NumPy/SciPy reconstruction. They are distinct calculations with correlated authorship. Separate panel review must not be described as human peer review. The quantum peer review here concerns mathematical/experimental scope, not a rerun of every quantum grid case.

## Final thesis, variables and limits

**Supported project synthesis:** specify the comparison resource before optimizing resonance. At fixed voltage, a higher-power point can simply draw more input; an equal-input comparison removes that confound but still requires source-voltage, current, storage and loss constraints. This is an application of established linear-response and passivity results. The source-budget target [W], voltage ceiling [Vrms] and measured constitutive coefficients are design/measurement quantities, not new universal constants.

The passive model provides no evidence of energy from nothing. It does not include an amplifier's supply efficiency, active-control overhead, magnetic hysteresis, frequency-dependent eddy losses, rectifiers, actual hardware calibration, acoustic environmental input, quantum work extraction or finite-time preparation/reset costs. No apparatus was operated. A high modeled terminal efficiency is not a measured wall-plug result.

Reproduce the current frozen implementation with:

```sh
python3 -B analysis/em_reference.py --check
```

The default current receipt is `em-round3-results.json`; `em-results.json` remains the original Round-2 receipt. Current source bindings are in `round3-freeze.json`. Stop after this third round; any further model or hardware expansion requires a newly selected research contract.

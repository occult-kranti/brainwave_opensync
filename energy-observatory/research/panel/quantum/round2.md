# Quantum panel — round 2: criticism, implementation and evidence

Research cutoff: 21 October 2026. Advisor accepted the one-qubit model after round 1. This round reads the frozen metrology, systems and Tesla round-1 reports, revises the observation contract, and implements that selected scope. It does not simulate QET or a Casimir device.

## Debate and decisions

| Critic | Objection | Response / actual change |
|---|---|---|
| Metrology | A closed residual cannot identify a physical cause, and a model cannot certify its own hardware boundary. | The returned residual is only the ideal channel balance. `apparatusEfficiency` is explicitly null; missing preparation, control, refrigeration, readout and reset channels are returned in provenance. |
| Systems | Shared numerical frequency does not identify a cross-domain coupling; additional observables are needed. | `frequencyHz` is explicitly a quantum energy gap through Delta=h f. No sound-to-qubit or copper-sphere coupling is present or implied. A changed UI value is a new fixed-H model, not a free time-varying gap protocol. |
| Tesla | Parameter modulation and controller supplies require work ports. | The model fixes H during damping and dephasing. It does not implement a driven frequency sweep, time-dependent gap, feedback engine or self-supply cycle. |
| Quantum source criticism | Published control-cost notation can be mistaken for a measured apparatus input. | The 2025 Hamiltonian-norm proxy keeps its source definition. It has energy dimensions if H is in joules, but it is not a measured source-energy transfer or wall-plug consumption. No calculator efficiency is built from it. |

## Implemented calculation

`src/quantum.mjs` exports `qubitWork({frequencyHz=5e9,population=.25,coherence=1,damping=0,dephasing=1})`. Basis is ground/excited, and phase is fixed to zero only because the admitted work quantities are phase-independent. Coherence is the initial fraction of the maximal allowed off-diagonal magnitude. Damping is a zero-temperature amplitude-damping probability. Dephasing is the fraction of coherence retained after damping; 1 means none, 0 means complete dephasing.

The scalar formula uses the state determinant to calculate the smaller eigenvalue stably. For initial population p, coherence fraction kappa, damping gamma and retained coherence d, p_f=(1-gamma)p and

`det(rho_f) = p_f [(1-p)(1-d² kappa²) + gamma p]`.

This nonnegative factorization avoids cancellation between nearly equal squared entries near a pure state. It is an algebraic implementation improvement in the declared model, not a new physical law.

`analysis/quantum_reference.py` separately constructs complex density matrices, applies amplitude-damping Kraus operators and a random-unitary phase-flip map, diagonalizes the matrices, and calculates trace energies. Complex phases differing from the browser convention check phase invariance. This second formulation was written by the same model-agent; it must not be labeled independent authorship. The other panel reviewers supply separate review.

## Executed results

- 5,775 declared grid cases: 21 populations × 11 coherence fractions × 5 damping probabilities × 5 dephasing retentions.
- 512 seeded random cases, with transition frequencies sampled from 10^6 to 10^12 Hz; 8 additional near-boundary cases.
- All 6,295 cases satisfy the compared matrix/scalar quantities, positivity, trace, work bounds and ideal channel energy balance within the declared arithmetic tolerances.
- 10 invalid input cases rejected.
- Bounded two-angle SU(2) search: 20 states × 257 polar angles × 128 phase angles = 657,920 rotations. The best sampled energy never falls below the passive-state bound beyond roundoff and approaches it within the declared 10^-5 gap-unit tolerance. This finite search corroborates, but does not prove, the continuous optimum.
- Negative control `W_wrong=stored energy` fails for population .25 with zero coherence: positive stored energy, zero ergotropy.

The exact maxima, grid, seed, SHA-256 bindings and rotation-search results are in `round2-results.json`. Arithmetic errors are normalized to the nonzero gap Delta, not reported against a misleading joule tolerance. No physical input/output data were used.

Reproduce from the energy-observatory directory:

```sh
python3 -B analysis/quantum_reference.py --output /tmp/quantum-round2-replay.json
```

## Schema for interface integration

Top-level: `schema`, `status`, validated `parameters`, `gapJ`, `initial`, `final`, `environmentalEnergyJ`, `energyClosureResidualJ`, `apparatusEfficiency:null`, `provenance`.

Both states expose `population`, `coherenceMagnitude`, `densityMatrix` (separate 2×2 real/imag arrays), `eigenvaluesDescending`, `purity`, `energyJ`, `passiveEnergyJ`, `ergotropyJ`, `diagonalErgotropyJ`, `coherentErgotropyJ`.

The environmental term is the battery energy released through the chosen damping channel, not the whole apparatus heat. These are expectation energies and ideal work bounds, not measured output watts. The code returns no duration, power, measured rate, recharge cost, cyclic device efficiency or discovery claim.

## Round-3 review request

A separate reviewer should reconstruct the qubit eigenvalue argument from its own frozen derivation, compare selected degeneracies and phase choices, and audit whether the UI preserves the scope. Keep the current code and results frozen before that exchange. Only repair a concrete defect exposed by the third-round review; do not add an unsolicited QET simulator or extend the research beyond the requested three rounds.

# Energy Observatory: advisor decision

Research cutoff: 21 October 2026. Six model-agent specialists completed three adaptive rounds. These are simulated scientific roles guided by named skills, not human scientists or historical figures. All numerical records are synthetic; no apparatus was built or measured.

The release supports a reproducible investigation of energy conversion, transfer, storage and measurement. It does not establish source-free power. A resonant amplitude, patent, funded program, unexplained residual or quantum work bound alone cannot establish net apparatus energy.

## Question and admission rule

Can a specified electromagnetic, acoustic or quantum mechanism deliver usable energy after accounting for every supplied resource, storage change and loss? The project's proposed thesis is to require **joint energy closure and identifiability**: a claim must survive a matched-input comparison, a separate energy ledger, and sufficient calibrated observations to distinguish competing explanations. This is a protocol synthesis; its novelty is unverified.

The signed accounting convention is

`R = E_load + E_loss + U_final − U_initial − E_source − E_environment`.

All terms are in joules, share one time window and boundary, and must avoid double counting. Positive R is an apparent surplus that requires investigation. It is not a uniquely identified energy source. Report covariance-aware combined standard uncertainty, the chosen coverage factor and its assumptions. A coverage factor of two alone does not establish 95% coverage.

## Three rounds and the decisions they changed

| Round | Objection | Implemented response | Remaining limit |
|---|---|---|---|
| 1: independent proposals | Resonant peaks and broad claims omit source/load boundaries; pressure alone may not determine acoustic flux. | Freeze units, reciprocal energy identities, source-reading depth and disproof controls before peer exchange. Admit fixed-coupling EM, a loaded piezo receiver, one-qubit work and metrology/inference lanes. | No physical observations. |
| 2: construction and criticism | Fixed voltage or force does not hold input power constant as load changes. Producer agreement with its own equations is limited evidence. | Preserve bounded fixed-drive sweeps, external energy quadrature, deliberately wrong controls and separately authored matrix fixtures. | Finite grids do not find a global optimum. |
| 3: reverse verification | Rescaling can violate response limits; a residual may admit many causes. | Add equal-input sweeps with constraints checked after rescaling. Cross-compare implementations, independently reconstruct quantum states and diagnose raw blind cases before revealing their key. | One blind case correctly remains unresolved because an input channel is unmetered. |

See [panel records](../data/panel.json) and each specialist's three reports in `panel/`. Round 2 code/results remain preserved where Round 3 changed the implementation. Release UI review and its targeted correction are subsequent verification, not a fourth research round.

## Accepted model results

**Electromagnetic conversion.** The six-state fixed-mutual-inductance model includes two RLC circuits and a reciprocal mechanical transducer. With RMS phasors its default ideal-terminal input is about 58.779 mW, useful electrical plus mechanical load power 46.268 mW, and dissipation 12.511 mW. The 1,395-cell equal-input search at 50 mW admits 667 cells and finds a sampled best output of about 47.288 mW. That point lies on grid boundaries; its 94.576% efficiency excludes upstream amplifier and control losses. Varying mutual inductance in time requires extra electromechanical work terms and is outside this implementation.

**Acoustic conversion.** The loaded piezoelectric receiver includes reciprocal electrical backaction. The 4,941-cell fixed-force grid maximizes output at a different operating point from maximum efficiency. At a matched 1 µW mechanical input, 4,083 cells meet the declared response limits; sampled best electrical load power is about 0.794 µW. These are receiver-boundary results. They do not include sound generation, acoustic capture, amplification or rectification. The plane-wave calculator is a conditional flux reference, not a universal capture ceiling: actual boundary power requires the integral of mean pressure times normal particle velocity.

**Quantum work.** For H = diag(0, hf), a state with excited population p and coherence c has ideal ergotropy `W = hf[2p − 1 + sqrt((1 − 2p)^2 + 4|c|^2)]/2`. The coherent p = 0.25 state and its dephased version have equal mean energy but different extractable work. State preparation, control, reset and readout resources remain unmodeled. A control-Hamiltonian norm with energy units is not measured wall-plug work. The browser therefore leaves apparatus efficiency undefined.

**Identifiability.** In the declared linear model, `(m,b,k,g) → (a m,a b,a k,sqrt(a) g)` preserves electrical impedance. A calibrated complex velocity channel breaks this positive scaling family. This exact model result assumes known electrical parameters, nonzero coupling and the declared inputs. It is not a universal uniqueness theorem.

**Measurement controls.** Waveform timing error, aliasing and omitted storage each create misleading readings in recorded synthetic controls. Three blind diagnostic cards test specific inference mechanisms: phase correction, capacitor discharge and a missing supply channel. Correct abstention on the last case is part of the result. Three selected cases do not estimate general diagnostic reliability.

## Variables to carry into an actual study

| Variable | Unit | Role and observation |
|---|---|---|
| Source and load waveform products | W | Measure synchronized v(t)i(t), including DC and relevant bandwidth; RMS magnitudes alone are insufficient. |
| Initial/final stored energy | J | Account for capacitor, inductor, mechanical, thermal and chemical storage where present. |
| Timing skew and phase | s, rad | Calibrate channel delay across the spectrum; uncertainty can dominate low-power-factor readings. |
| Pressure and normal particle velocity | Pa, m/s | Jointly estimate acoustic boundary flux; map spatial field dependence. |
| Mechanical velocity and force | m/s, N | Resolve transducer power and the declared electrical scaling ambiguity. |
| Coupling and load | dimensionless, Ω | Controlled sweep variables, with response limits reevaluated after input normalization. |
| State population/coherence and gap | dimensionless, J | Quantum state-resource coordinates, not a device energy meter. |
| Environmental influx and covariance | J, J² | Separately identify environmental resources and correlated measurement errors. |

New project variables are operational refinements and inference coordinates, not newly discovered physical entities.

## Evidence and record discipline

The typed source network contains 38 records, eight topics and 64 links. It combines selected recent primary papers, older foundations, official program/patent documents and preserved project provenance. Each source carries reading depth and limitations. A graph edge describes relevance or a methodological connection; it does not prove the connected claim. Coverage is selected, not exhaustive, and no conference ranking substitutes for source assessment.

DARPA POWER reports externally supplied optical power transfer; its long-distance power result and shorter-distance efficiency statement must not be combined. ARPA-E LENR and DARPA MARRS records describe program scope and aims; funding or a solicitation is not a demonstrated energy result. NASA Breakthrough Propulsion Physics material is historical. Tesla patents identify apparatus and external resources; patent publication is not performance validation. Gateway custody establishes a historical record, not its physical claims.

The MARRS solicitation's picobarn-to-square-centimeter parenthesis conflicts with the BIPM unit definition by 10^24. The source text and independent check are preserved. That notation discrepancy does not determine the proposed reaction's performance or refute all cited work. It is excluded from numerical models.

## Verification and next experiment

Separately authored checks pass 613 EM/acoustic/inference comparisons and 648 quantum matrix cases. Same-author alternate-formulation metrology checks cover 105 phase/skew cells, 16 storage cases, aliasing, covariance and API edges. The root also reran all 47 Node tests across the three preserved applications. [The verification receipt](verification.json) distinguishes these levels of independence and binds reviewed files to hashes.

The next useful result is a calibrated, preregistered low-power bench dataset: fixed geometry and boundary; source-off and known-load controls; repeated matched-input trials; synchronized raw channels; measured storage before and after; and uncertainty propagation including covariance. Use the proposed EM and acoustic diagrams on the Experiments page as measurement topology, not a completed wiring specification. Advance a residual only after independent replication and discrimination among hidden input, storage, bias and model error. Current hardware efficiency, nonlinear behavior, temperature drift, full quantum cycle cost and physical excess-energy claims remain open or unmeasured.

Three earlier source versions are pinned and hosted with scientific source hashes checked. Added host navigation and metadata are disclosed. Their old results are historical records, not new measurements in this release.

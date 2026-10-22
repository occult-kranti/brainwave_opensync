# Quantum thermodynamics panel — round 1

Research cutoff: 21 October 2026 (America/New_York). Author: separate model-agent `energy_quantum`, scientist 3/6. Skills applied: paired-physics-research and historical-physics-panel, including its lenses-and-evidence reference. This is a source-led proposal, not hardware work or human peer review. No other panel report was read before this record.

## Recommendation

Accept a one-qubit **stored energy versus extractable work** calculator as the first quantum investigation. Treat collective quantum batteries, quantum energy teleportation (QET) and dynamical Casimir emission as distinct research mechanisms. They cannot be combined merely because all involve frequency or quantum states.

The useful project thesis is: **at the same mean stored energy, coherence can change the maximum work available under a specified control class; source and control accounting decides whether that advantage is useful at device level.** This applies an established result. It is not a new law, a free-energy discovery, or evidence of unexplained power.

## Primary-source findings and critical distinctions

- **Q-ERG-2004** derives ergotropy by minimizing the final energy over a unitary orbit. The initial nonequilibrium state is a resource, and the cyclic condition applies to the external control, not necessarily to the system state.
- **Q-NV-2024** reports coherent-ergotropy measurements in an NV-center spin system using an ancilla. Its model Hamiltonian and measured expectation values are not a calorimetric wall-plug output measurement.
- **Q-COST-2025** studies a superconducting qubit and preparation/extraction protocols. Its Eq. (4), Sigma=(1/tau) integral ||H_d(t)|| dt, is an average Hamiltonian-norm control cost. The reported eta=DeltaE/(DeltaE+Sigma) must retain that definition: it is not measured microwave-generator, cryogenic, readout or computer energy consumption.
- **Q-OPTICAL-2026** reports light-to-current conversion in an organic optical microcavity. Incident illumination supplies energy. Superlinear output scaling with system size is different from efficiency above unity. Publisher abstract and introductory passages were accessible; later retrieval failed, so no efficiency number or complete metrology audit is claimed here.
- **Q-QET-2024** studies entanglement-assisted local extraction and constraints relating energy and information teleportation. Entanglement alone does not specify a pump, reset protocol or practical power source. Its general trade-off proofs were not independently audited.
- **Q-DCE-2011** reports driven SQUID-boundary photon emission. The paper explicitly includes a high-frequency modulation drive; paired photon frequencies sum to the drive frequency. This is driven conversion and does not show usable energy extracted by a static passive circuit from vacuum. The arXiv HTML displays a 2026 rendering date, but the actual work is from 2011.

## Frozen candidate mathematical contract

State space is a single two-level system. Set the ground energy to zero and use

H = diag(0, Delta),  Delta = h f > 0,

rho = [[1-p, c], [c*, p]],  c = kappa sqrt[p(1-p)] exp(i phi).

Here p in [0,1] is the excited-state population (observable/state preparation); kappa in [0,1] is a dimensionless coherence fraction (state descriptor); phi is a phase coordinate; f is a transition frequency in Hz; Delta and all reported energies are in joules. This is not the acoustic drive frequency of a copper sphere. An audio/EM/quantum coupling requires a separately specified transducer and Hamiltonian.

The Bloch-vector length and state eigenvalues are

r = sqrt[(1-2p)^2 + 4|c|^2],  lambda_plus/minus = (1 +/- r)/2.

A unitary preserves these eigenvalues. The least-energy arrangement assigns lambda_plus to the ground state, giving

E = Delta p,
E_passive = Delta(1-r)/2,
W_erg = E - E_passive = Delta(2p-1+r)/2.

The dephased-state ergotropy is W_diag = Delta max(0, 2p-1). Therefore W_coherent = W_erg - W_diag >= 0. These quantities concern ideal cyclic unitary work extraction from the specified prepared state; restricted controls may attain less.

An exact discriminating example is p=1/4: the pure coherent state kappa=1 has E=W_erg=Delta/4. The fully dephased state kappa=0 has the same E=Delta/4 but W_erg=0. No new energy was created by choosing the coherent state. Preparation and entropy resources differ.

### Dissipation proposal

Add a zero-temperature amplitude-damping channel with probability gamma in [0,1], followed by energy-basis dephasing that multiplies off-diagonal entries by d in [0,1]:

p' = (1-gamma)p,  c' = d sqrt(1-gamma)c.

Recompute the eigenvalues and ergotropy from rho'. For constant H, the battery's energy decrease is Q_out = gamma Delta p; dephasing changes its work accessibility while leaving mean energy unchanged in this ideal channel. A microscopic bath or controller model is needed for a full apparatus audit. Do not label gamma or d as empirical decay rates without a time/channel calibration.

### Complete accounting boundary

For the battery alone, dE = Tr[rho dH] + Tr[H d rho] is a bookkeeping identity. Interpreting terms as work and heat requires the declared weak-coupling/control assumptions; interactions and switching matter in more general models.

For a whole apparatus, use one non-overlapping ledger:

external electrical/optical work + net environmental heat input
= useful load work + outgoing heat/radiation + change of total internal stored energy.

Battery, charger, drive, coupler, reset mechanism, measurement electronics and memory are inside this boundary when reporting net device performance. Do not add a Hamiltonian norm to measured wall-plug energy as if they were separate observed transfers.

A strictly illustrative preparation scenario starts from the ground state and ideally prepares a pure state with energy Delta p. Dephasing and amplitude damping are then applied before ideal extraction. Initial preparation work = Delta p; extraction <= remaining stored energy; leftover passive energy must be removed or retained explicitly. Cooling/reset and hardware overhead are unmodeled, so no full-cycle device efficiency is returned. User-supplied overhead can show an accounting scenario, but cannot establish an attainable device.

## Experimental concept and missing prerequisites

Simulation is appropriate now. A real superconducting or NV-center implementation requires specialized quantum-control hardware, calibrated state tomography, preparation/extraction pulses, and independent calibration of the reference Hamiltonian. A browser or classical simulator does not execute a quantum-hardware experiment.

Proposed procedure: prepare pairs of states with matched p and different kappa; infer density matrices with uncertainty; execute the same restricted control family; measure energy expectations before/after; separately acquire source/control/reset consumption. Use passive diagonal, ground-state, fully excited and maximally mixed controls. Compare measured extraction with both the state-theoretic upper bound and a complete device budget. A discrepancy first challenges tomography, Hamiltonian calibration, control restrictions or omitted transfers.

## Proposed implementation and acceptance tests for the advisor

1. A browser pure function `qubitWork({frequencyHz, population, coherence, damping, dephasing})` returns initial/final states, E, passive energy, ergotropy, diagonal/coherent contributions and released-to-environment energy. It rejects nonfinite or out-of-domain inputs.
2. Independently reconstruct rho using complex matrices in Python; compute its Hermitian eigenvalues and trace energy without reusing the scalar formula.
3. Enumerate a reproducible p/kappa/gamma/d grid plus random physical states; require positivity, trace one, 0 <= W <= E, correct pure/passive limits, unchanged energy under dephasing, and E_initial = E_final + Q_out.
4. For selected states, search two-angle SU(2) rotations to lower final energy; compare the best sampled result with the exact passive bound, documenting finite-grid error. A brute-force search supplies a cross-check, not a proof of global optimality; eigenvalue ordering supplies the mathematical bound.
5. Include a deliberately wrong estimator W_wrong=E, which fails on the passive mixed-state control. This catches the central overclaim instead of merely checking code against itself.
6. Preserve the definition of preparation, apparatus boundary and cost variables. No fitted external-driver variable can silently enter the Hamiltonian to force net gain.

Optional later extension, not executed: a resonant excitation-preserving two-qubit swap illustrates a battery gaining energy while its initially charged partner loses the same energy. It is unnecessary to establish the current calculator and should wait unless the advisor selects it.

## Round-1 decision request

Select the one-qubit model for implementation. Keep QET and DCE as source-linked mechanism cards with explicit inputs and unsupported-inference warnings. Ask a fresh verifier to derive the passive-state benchmark before reading implementation code. No future round has been pre-executed.

References and exact access status are in `sources.json`.

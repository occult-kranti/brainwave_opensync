# Quantum panel: third and final review

Date: 2026-10-22. This closes the third advisor-directed round. Physical measurements: zero. The accepted one-qubit producer and reference code remain unchanged because the separate review found no concrete defect.

## Blind diagnosis before peer-result access

I first analyzed the three synthetic raw records without reading the key or metrology reference implementation. `blind-freeze.json` binds the four admitted inputs, diagnostic script, Markdown response and JSON response. Its SHA-256 is `815331506d2be16ebb208f927e32d11bb4a8b97e8c6a699a548eda6e5bd3bb37`. Only after this freeze did I read the systems round-two report and the metrology quantum comparison result.

The independent diagnoses were: card 41 closes under a reference phase correction conditional on common transfer paths; card 72 closes after including capacitor depletion; card 19 has an unresolved 0.04 J residual and an unmetered controller port. I did not turn the last residual into a measured controller input or a quantum-energy claim. The metrology reviewer subsequently verified the seven input/output hashes against the frozen response, opened its withheld key, and reported that all three diagnoses meet the selected controls. No revision of the frozen diagnosis was requested or made. Three selected synthetic controls do not estimate field detection rates, validate arbitrary apparatus, or establish complete uncertainty coverage.

## Peer criticism → response → decision

| Reviewer or target | Criticism | Response and decision |
|---|---|---|
| Metrology, reviewing quantum | A scalar closed-form implementation needs a separately authored matrix/channel check; arithmetic closure alone does not validate an experimental boundary. | A separate agent froze 648 matrix/Kraus/unitary cases before reading the producer. All comparisons passed with maximum absolute difference divided by the energy gap of 2.7755575615628914 × 10⁻¹⁶. Preserve the model and its explicit apparatus-efficiency null. |
| Tesla, reviewing quantum | State preparation, implementing extraction, reset and apparatus supplies remain resource ports. A Hamiltonian-norm proxy with energy units is not a measured source transfer. | Accepted. Ergotropy stays an ideal unitary work bound for the supplied state. No efficiency, output watts, recharge rate, or vacuum-power inference is added. |
| Quantum, reviewing systems | A local numerical rank at one parameter point must not be promoted to global identifiability. Unknown sensor gain, independent force drive or missing phase information can reintroduce ambiguities. | The exact impedance scaling proves the continuous electrical ambiguity. The reported finite-frequency SVD is explicitly local. Accept the result under the stated known-electrical-parameter, nonzero-coupling and no-independent-force assumptions; retain calibrated complex velocity including orientation and phase as the extra observable. |
| Quantum, reviewing metrology cards | A plausible omitted port is not a measured cause. A reference phase discrepancy is not sufficient to prove shared transfer paths. | Frozen diagnoses retain both qualifications. The reviewer scored the selected controls as passed without requiring stronger causal language. |

## Independent check of the systems claim

For the systems model, with known electrical impedance and no independent mechanical drive,

\[
Z_{\rm in}=Z_e+\frac{g^2}{Z_m},\qquad
Z_m=ms+b+k/s,\qquad \frac{v}{i}=\frac{g}{Z_m}.
\]

Under `(m,b,k,g) → (a m,a b,a k,√a g)` for positive `a`, both `Z_m` and `g²` acquire the same factor `a`; electrical impedance is therefore exactly unchanged. Meanwhile `v/i` acquires `1/√a`. In positive log coordinates the continuous null direction is `(1,1,1,1/2)`. These identities establish the claimed invariance without relying on a finite search.

The reported 14 × 4 numerical Jacobian has rank 3 under its chosen normalization, finite-difference step, relative threshold, baseline parameters and frequency samples. Its extra calibrated complex velocity observations give local rank 4 in that case. This is consistent with the exact transformation. It is not a universal result at zero coupling, for too few frequencies, or with additional unknown parameters. A magnitude-only speed measurement does not resolve the discrete sign of `g`; an unknown velocity-sensor gain can mask the scaling. The report's calibrated velocity requirement must therefore survive interface summaries. A successful fit or full local rank also does not certify that the physical energy boundary is complete.

## What the separate quantum review establishes

The metrology result is recorded in `../metrology/round3-quantum-results.json`, with the pre-inspection matrix fixtures and freeze receipt beside it. The result binds producer SHA-256 `ec9320c28560f80b11e65cb6eb1e08f43bed68ffdf3fd97efacd7109b2cc7b91`, matching the accepted round-two producer. It includes three phase coordinates per parameter case and direct unitary angle sweeps for three selected states, as well as the passive mixed-state negative control against the wrong estimator `W = E`. Small sampled excursions below the analytical bound are within floating-point roundoff. Finite angle sweeps are checks, not a proof of a continuous optimum.

This separate authorship check complements the round-two same-author scalar-versus-matrix comparison; neither creates independent physical data. The exact passive-state eigenvalue ordering supplies the mathematical optimum within the stipulated arbitrary cyclic unitary class.

## Final thesis and limitations

The admitted, testable model thesis is that at a fixed nonzero transition energy and fixed excited-state population, changing coherence can change ideal extractable work while leaving stored expectation energy unchanged. The calculator can falsify an incorrect implementation of this statement and expose the erroneous identification of stored energy with ergotropy. This is an application of established quantum thermodynamics, not a newly discovered energy source.

The Hamiltonian is fixed during each calculation. Dephasing can reduce accessible work with zero expectation-energy change in this model; that does not make the physical dephasing apparatus free. Damping represents a stipulated zero-temperature channel and reports energy leaving the modeled battery, not total environmental or refrigeration energy. Probabilities are not measured rates. Arbitrary optimal controls may be unavailable in hardware. Numerical frequency equality supplies no acoustic, electrical or object-location coupling Hamiltonian.

A hardware cycle would additionally require preparation, source and control-port work, timing, calibrated readout, memory handling, refrigeration where applicable, load work, and repeatable reset/storage endpoints. Those are unmeasured here, so `apparatusEfficiency` remains null. QET and dynamical-Casimir source cards remain mechanism references with explicit entangled-state/measurement resources or external pumps; neither is simulated as a self-powered device.

## Advisor decision

Accept the bounded calculation and independently checked numerical outputs for the research interface. Keep the provenance and limitations attached to every result. Preserve the frozen code; make no new quantum simulator, hardware performance claim, or fourth debate round. The current evidence supports a useful work-accessibility calculator and synthetic accounting exercises. Net apparatus energy gain remains unestablished.

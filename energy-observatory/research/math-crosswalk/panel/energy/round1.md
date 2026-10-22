# Energy specialist — round 1

**Verdict:** None of the four selected OpenAI theorem targets below was solved or attempted by the current energy branch. The strongest overlap is an exact **channel special case**: our qubit calculator applies zero-temperature amplitude damping; OpenAI family 276 studies classical communication capacity of generalized amplitude-damping channels. Our objective is ergotropy, not capacity. This is useful model overlap, not a shared solved problem.

Reviewed 22 October 2026. Project baseline: `4574d16bbf489a4f505baee7b0653486fcc94ff6`; OpenAI source snapshot: `1581d4cbdd69a0faf34b2089614fe2a814316a6a`. File hashes, exact source paths, reading depth and row-level applicability appear in `crosswalk.json` and `sources.json`. This lane does not determine collection-wide counts or independently verify the manuscripts' complete proofs. The corpus specialist supplies the collection denominator; a highest family identifier must not be read as a solved-problem count.

Applied the Tesla-mechanism-resonance and resonance-research-advisor skills: identify the source and measurement boundary, separate model identities from physical results, and propose a discriminating test before adding a new claim.

## What our branch actually establishes

`src/quantum.mjs` computes a prepared single qubit under a fixed Hamiltonian, zero-temperature amplitude damping and optional dephasing. Its ergotropy is energy minus the energy of the passive state with the same spectrum. It contains no communication coding, Holevo-information optimization, bosonic channel or many-body ground-state calculation. Earlier independent metrology checked 648 Kraus/eigensolver cases; that is numerical verification of this small model, not a general theorem or hardware result. The calculator explicitly leaves apparatus efficiency unknown.

`src/em.mjs` is a finite, linear RLC–mechanical system with fixed mutual inductance and reciprocal transduction. Its energy identity includes the source, resistive losses and mechanical/electrical loads. It excludes the amplifier/controller from its source-terminal boundary. It is not a plasma kinetic equation or Maxwell field solver. Position-dependent mutual inductance would require its mechanical work port to be included.

`src/identifiability.mjs` has a separate four-state model. The electrical transfer function is unchanged by simultaneously scaling mechanical mass, damping and stiffness by a factor and the coupling by its square root. Calibrated velocity measurements break that particular ambiguity under the stated model. This is not a general inverse-boundary uniqueness theorem.

## Exact crosswalk

| Family | External target and material hypotheses | Existing overlap | Transfer and limit |
|---|---|---|---|
| 276 | Memoryless generalized amplitude damping of a qubit, with arbitrary input blocks and collective decoding; claimed unrestricted classical capacity/additivity | Same channel at zero stationary excited population, before our optional dephasing; different functional and no same-target attempt | Add a thermal reservoir parameter and signed heat ledger. Do not claim our ergotropy tests prove capacity/additivity. |
| 273 | Entropy photon-number inequality for a passive beam splitter, finite-mean-number bosonic inputs independent across its two ports; within-port multimode entanglement allowed | No bosonic implementation in our code | A future bosonic receiver noise bound needs a physical mode map, independence, and cutoff/tail control. Entropy photon number is not energy produced. |
| 362 | Global smooth relativistic Vlasov–Maxwell evolution for nonnegative smooth compact phase-space density and smooth bounded-derivative, square-integrable Maxwell fields satisfying Gauss constraints | Our lumped RLC model has neither the distribution nor this initial-value problem | Keep as a separate mathematical-physics node. Global existence is not a conversion-efficiency or surplus-power result. |
| 265 | Area law for unique ground states of finite-range bounded square-lattice Hamiltonians, **assuming** a uniform positive global spectral gap | One prepared qubit is not this many-body family | Potential future tensor-network guidance after the assumptions are established. The assumed gap cannot supply the missing Yang–Mills gap. |

The family-276 map is precise. With excited population \(p\), coherence \(c\), damping probability \(\gamma\), and stationary **excited** population \(\nu\),

\[
p'=(1-\gamma)p+\gamma\nu,\qquad
c'=\sqrt{1-\gamma}\,c.
\]

Our current model is \(\nu=0\), followed by \(c'\mapsto d c'\). A generalized channel's classical capacity asks how much information encodings and decoding can communicate reliably. Ergotropy asks how much work an ideal cyclic unitary could extract from a specified state with a specified Hamiltonian. One does not calculate the other.

Two proof-scope distinctions matter. Family 276's paper claims additivity with an arbitrary finite-dimensional partner channel, but `lean/docs/276.md` explicitly excludes arbitrary different partners from its selected formalization. Family 273's formalization scope selects EPnI and excludes its thermal-attenuator and broadcast-capacity consequences. A family-wide formalization badge would erase those distinctions. This lane read the scope documents; it did not execute Lean or audit all associated proofs.

## Current primary literature relevant to our next step

The 26 May 2026 preprint [Vetrano, Giovannetti and Cavina](https://arxiv.org/abs/2605.27369) studies multilevel amplitude-damping channels coupled to thermal environments and ergotropic work functionals. The abstract supports prioritizing a finite-temperature noise model. Its detailed claims have not been reproduced here, and the retrieved record lists no journal publication.

[Li et al.](https://arxiv.org/abs/2506.16881), *Physical Review Research* **7**, 043236 (2025), experimentally study coherent ergotropy in a superconducting qubit. This is relevant physical evidence for separating coherence-dependent extractability from energy. The experiment's control-cost metric is not a complete meter reading for preparation, refrigeration, electronics and reset; the earlier project review already records that boundary. This round rechecked the abstract and publication metadata.

[Hymas et al.](https://www.nature.com/articles/s41377-026-02240-6), *Light: Science & Applications* **15**, 168 (13 March 2026), report a microcavity battery converting incident light to electrical current with collective scaling. Incident light is an energy input. The paper provides a current experimental conversion example, not support for source-free power. This lane read its publisher abstract and introduction, not a complete raw-data audit.

These are selected, directly relevant 2025–2026 publications, not an exhaustive ranking of all current research. “Tier A” is not assigned retrospectively from a publication's title or publisher.

## Proposed round 2: thermal amplitude damping and a signed heat ledger

The useful adaptation is elementary and independently testable. Let the fixed energy gap be \(\epsilon=hf>0\). For the generalized map above,

\[
E'-E=Q_{\mathrm{bath}\to\mathrm{qubit}}
=\epsilon\gamma(\nu-p).
\]

The sign distinguishes heating from cooling. Ordinary nonnegative-temperature qubit baths have \(0\le\nu\le1/2\); \(\nu>1/2\) represents an inverted population resource and must be labeled accordingly. Optional energy-basis dephasing changes coherence without changing mean energy in this model. Neither simplified channel supplies the real apparatus cost of implementing it.

The proposed test uses a direct four-Kraus matrix construction and an independent Hermitian eigensolver to check a scalar implementation. It must recover the existing code at \(\nu=0\), retain trace and positivity, close the signed energy ledger, and give zero ergotropy for diagonal thermal fixed points with \(\nu\le1/2\). For strictly positive finite temperature, test the dimensionless entropy-production inequality \(\Delta S-\log[(1-\nu)/\nu]Q/\epsilon\ge0\); zero-temperature endpoints need separate handling.

Three frozen wrong-model controls make the check informative:

1. Start from the ground state with \(\gamma=1/2,\nu=1/4\). The qubit gains \(\epsilon/8\), exactly the reservoir input. Omitting that input creates an apparent surplus.
2. A diagonal stationary state with \(\nu=1/4\) stores \(\epsilon/4\) but has zero ergotropy. The shortcut “work equals stored energy” must fail.
3. Reusing the existing zero-temperature environmental-loss formula for a finite-temperature channel miscloses the ledger by \(\epsilon\gamma\nu\). The updated implementation must detect this error.

`proposed-round2.json` records the acceptance criteria before execution. The advisor should select this limited transfer, ask metrology to review it independently, and keep any implementation within this lane until integration. **No round-2 simulation has been run by this specialist yet.** Success would establish a more complete ideal-channel accounting example, not prove the OpenAI capacity theorem, discover a new thermodynamic law, measure apparatus efficiency, or establish source-free energy.

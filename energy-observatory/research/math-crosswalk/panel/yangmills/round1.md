# Round 1 — Yang–Mills specialist

Date: 2026-10-22. This is one model-agent review using the paired-physics and Newton analysis/synthesis skills, not participation by historical scientists or external human peer review. Round 2 has not been executed.

**Decision:** no exact solved or exact attempted OpenAI problem is evidenced by the selected theorem-level comparisons. Families **215, 265 and 270** have useful connections, but their mathematical objects and hypotheses differ from our work. The continuum Yang–Mills problem is an exact prior target of our repository and remains open; it was not found as a literal problem in the OpenAI catalogue. This is a scoped finding, not a proof that all 372 families have no possible overlap.

## Recovered baseline

The current public `occult-kranti/yang_mills_workbench` main is **f9364d617015e803fda9465aefddd9cbe41854a4**, reporting Round33. The conversation's release **514f2aa** remains the historical Round30 branch tip. The newer evidence must therefore govern the comparison. I read the current README, Round33 handoff and roadmap, result summaries, selected BA2/BB2 theorem clauses, the Round32 AZ1 gate, and the current network. I did not rerun the historical proof programs or independently audit all proof dependencies.

The network contains **489 nodes and 785 edges**. A text search of all node records found no OpenAI references. Existing edges explicitly distinguish source dependencies, proposed transfers and scope boundaries. The `open-continuum` node says that missing mathematical hypotheses are not supplied by graph connectivity. Relevant nodes are `r29-al1`, `r29-aq2`, `r32-az1`, `r33-bb2` and `r33-bc2`.

Round33 BB2's named model is the zero-selected patterned SU(2) Kogut–Susskind form on spatial Z³, at fixed lattice spacing, with 24-link coarse factors and 21 omitted faces per anchor. In units δ=α/8, those faces enter as −(τ/3)W; |τ|≤10⁻⁸, separately at each sign. The two construction families are centered whole-star boxes F1 and padded all-contained-face boxes F2. BB2 reports a common whole-sequence reduced-state limit for these families and coarse translation invariance. Its inherited AQ2 inequality is

\[
H_{\mathrm{phys}}\ge (\alpha/16)(I-P_\Omega).
\]

The statement concerns the specified representation; the full-GNS strengthening relies on AM2's separately reviewed full-Hilbert finite gap. BB2 explicitly excludes uniqueness of every thermodynamic ground state and uniformity in lattice spacing. The clock is θ=αt/ℏ; the correlation comparison uses |θ|≤8. These inherited results are stronger than the old conversation's “AQ data uncomputed” summary, but they still do not identify a measured particle mass or solve continuum Yang–Mills.

## Exact comparisons

| Family | Actual mathematical target | Closest work here | Classification and missing bridge |
|---|---|---|---|
| **215** | A 2D nearest-neighbor O(3) model of S² spins; β→∞ together with vanishing spacing, normalized fields, Schwinger-distribution convergence, reconstruction and positive continuum gap | BB2 fixed-spacing state convergence; AQ2 representation gap; AZ1 scale-admission audit | **Related model / method transfer.** Different fields, action and dimension. Neither our fixed-spacing result nor this spin-model result implies the other's continuum conclusion. No exact O(3) attempt found in inspected evidence. |
| **265** | Entanglement-entropy area law for finite induced square-lattice domains, fixed finite on-site dimension q, bounded finite-range terms and a unique ground vector with an **assumed global gap** | Local reduced-density bounds and Wilson-loop parity | **Method transfer.** Our Z³ gauge Hilbert space has infinitely many local electric levels. A finite-q planar truncation and controlled removal would be separate work. Entanglement area law, Wilson area law and area parity are different statements. |
| **270** | One-dimensional zero kernel of the undeformed relative SU(N) BFSS operator for each finite N≥2 | Gauge-invariant domain and vacuum-sector analysis | **Related model.** Supersymmetric matrix quantum mechanics has nine matrix coordinates plus fermions and continuous spectrum beginning at zero. A unique threshold eigenstate supplies no positive spectral gap. |

The comparison is pinned to OpenAI commit **1581d4cbdd69a0faf34b2089614fe2a814316a6a**. The corpus specialist reports **372 headings and 719 unique paper paths**; 377 is the highest family identifier, not the count of solved problems. The selected OpenAI papers are manuscript claims here: full proofs and their external review status were not independently established in this round.

### Family 215 is the most useful bridge, with a precise limitation

The O(3) main theorem claims a trajectory a_N=L⁻ᴺ and β_N=H+(log L/2π)N+O(log N), with explicit field renormalization. Its canonical construction uses susceptibility and second-moment correlation length to fix length and field units. The decisive review idea is to require **the gap, reconstructed theory and nontrivial correlations to concern the same limiting fields and physical scale**.

The official `lean/docs/215.md` scope is much narrower than the family heading: finite square-lattice subgraphs with free boundary, nonnegative edge couplings bounded by β, and exponential spin correlations for classical O(n), n≥3. It explicitly excludes the infinite-volume limit and separate O(4) spectral-gap claim. That scope must not become a badge saying the O(3) continuum construction is formally verified. I did not execute Lean.

Our own AZ1 gate already identifies a concrete obstruction to importing continuum language. In the **uniform route-B model**, distinct from the patterned model above,

\[
\alpha=\frac{g^2}{2a},\qquad\lambda=\frac{2}{g^2a},\qquad
\tau=\frac{24\lambda}{\alpha}=\frac{96}{g^4}.
\]

The admitted τ≤10⁻⁸ regime therefore requires g⁴≥9.6×10⁹. A trajectory with g(a)→0 eventually leaves that regime. Changing length units at fixed g changes neither admission ratio. Thus a volume-uniform fixed-a certificate cannot be treated as a cutoff-uniform continuum estimate. This is failure of the present sufficient certificate, not proof that the actual gap vanishes or that another strategy cannot succeed.

## Recent primary-source additions

| Source and status | Concrete use | Transfer limit |
|---|---|---|
| Laurence G. Yaffe, *Resurrecting the coherent state variational algorithm for large N gauge theories*, arXiv:2601.20150v2, revised 2026-02-03; preprint, journal acceptance not verified | Candidate variational benchmark implementation; abstract reports initial infinite-volume Hamiltonian Yang–Mills results on a 2D spatial lattice | Large-N and spatial dimension differ from current SU(2) Z³ model; variational energies do not automatically certify a lower gap |
| Falzetti, Lombardi, Papinutto, Scardino, *Update on the computation of the quenched SU(6) Yang–Mills lattice spectrum*, arXiv:2603.13138v1, 2026-03-13; LATTICE2025 contribution (event 2025-11-02–08) | Multilevel correlator sampling and smeared Wilson-loop operator bases are concrete candidates for future spectral measurement design | Numerical SU(6) spectroscopy is not the patterned SU(2) model and not a continuum existence proof |

These two additions were read at abstract and metadata depth. They are selected recent relevant leads, not a comprehensive ranking of all 2026 conferences or a “Tier A” proof endorsement. Clay's current official page still marks Yang–Mills and the mass gap unsolved. New preprint claims do not override that status without assessment.

## Advisor recommendation for the adaptive second round

**Preserve the current result and change the comparison strategy:** build a small typed transfer ledger before attempting numerical reuse. An edge should carry model, dimension, state space, observable, scales, limit order, boundary family, logical direction and source reading depth. The proposed new edges are `215 → continuum-obligations` (method template), `265 → finite-q-planar-entropy-study` (conditional proposal), and `270 → domain-and-threshold-audit` (analogy). None is a solved-equivalence edge. This is an audit improvement, not a new physical discovery.

Two bounded tests are proposed for the advisor to select or modify:

1. **Premise-transfer validator.** Admit an exact identity and a consistent unit conversion; reject changing dimension, action, local dimension, boundary family, assumed/derived gap direction, cutoff-uniformity or formalization scope. This tests the most consequential false matches exposed above.
2. **Independent exact negative controls.** Compute the rational spectrum and ground projector of H_N=diag(0,1/N), whose state is unchanged while its gap closes; independently replay the AZ1 τ=96/g⁴ admission inequalities and unit rescaling. The toy model would show why state convergence alone is insufficient, not refute BB2/AQ2, which have additional gap premises.

No Round2 test has yet run. The mathematical correspondence remains a proposal until the advisor supplies feedback and the selected test passes. Sources, exact commit links, reading depth and machine-readable crosswalk are in `sources.json` and `crosswalk.json` beside this report.

# Literature expansion: measurement before interpretation

Review date: 22 October 2026. This is a selected primary-source review, not an exhaustive literature or patent search. Twelve records were added without duplicating the current microphone, phase-tracking and temperature papers. Publication in ICML, ICLR, PRL, or a specialist journal describes its venue; it does not establish universal superiority or applicability to this apparatus. No new physical result or scientific novelty is claimed.

## Decisions for the current lab

| Existing limitation | Evidence-informed change | Experimental acceptance test |
|---|---|---|
| One idealized sphere family and nominal geometry | Keep the reduced model, but record measured dimensions, seam, density and orientation; reserve measured-geometry models for the next stage. | Compare forward predictions with a reference specimen and convergence study before fitting an unknown sample. |
| A single readout can hide modes | Record several surface points with the same calibrated excitation and a table reference. | A feature missing at one sensor but visible at another remains a visibility effect until a common pole fit shows otherwise. |
| A smooth plotted response bypasses acquisition | Add finite duration, sample rate, leakage, damping, noise and alias demonstrations. | Reproduce an exact alias pair and show why a larger plot grid does not recover missing information. |
| Peak displacement is easily confused with an eigenfrequency shift | Compare fitted common poles against maximum-bin estimates under changed sensor mixtures. | Hold the mechanics fixed while changing modal residues and test whether the apparent maximum moves. |
| An A/B numerical difference lacks a full measurement budget | Include correlated timebase and temperature corrections in a predeclared uncertainty model. | Same-position handling repeats and blinded A/B blocks must meet the chosen detectable-effect threshold. |
| “AI uncertainty” can sound like physical calibration | Keep neural operators optional until there is costly validated forward physics and held-out data. | Test unseen supports, geometries and acquisition grids; report calibration failure, not only average error. |

These are project inferences and proposed controls synthesized from the selected records, rather than claims that any paper has validated the copper-location hypothesis.

## A concrete inverse-problem obstruction

For a linear elastic discretization,

\[ K(C)q=\omega^2M(\rho)q. \]

If geometry and boundary conditions are fixed and both stiffness tensor and density are multiplied by the same positive factor, both matrices scale equally. The eigenfrequencies are unchanged. Frequencies alone therefore do not generally identify both stiffness and density. Weighing the specimen and measuring geometry supply information not present in the spectrum. This elementary scaling argument is our explanatory derivation, not a novelty claim.

A second obstruction concerns readout: for modal coordinates \(q\), a sensor records \(y=Sq\). A nonzero vector in \(\ker S\) is invisible instantaneously. Dynamic observability requires the actual evolution and repeated measurements; the rank of \(S\) alone does not settle the full time-series problem. Modal nodes, unexcited modes and finite bandwidth can still remove spectral evidence. A successful fit to one channel cannot certify complete modal capture.

## Selected reading and what it changes

- [Theuss et al., PRL 2024](https://doi.org/10.1103/PhysRevLett.132.066003): inspected methods and uncertainty sections support measured-geometry validation. The paper's CT and multi-method comparison are a useful next-stage template, not a requirement to claim that every laboratory owns CT equipment.
- [Beardslee et al., 2024](https://doi.org/10.1016/j.ndteint.2023.103000): the institution-hosted abstract motivates a sensor-position study. Full methodology remains unreviewed.
- [Tayyib and Svilainis, 2025](https://doi.org/10.1016/j.ndteint.2025.103386): abstract-only excitation-shaping lead. The transferable question is whether calibrated, equal-energy drive choices improve mode visibility.
- [Rembe et al., 2026](https://doi.org/10.1038/s43586-026-00487-2): an LDV methods review discovered in this pass. Only its metadata and author-repository abstract were read; no instrument specifications were inferred from broad field-wide ranges.
- [Wang et al., RUS-HL](https://doi.org/10.1093/jge/gxaf122): selected opening sections motivate multiple inversion starts and spectrum-based objectives. Online 2025 and issue 2026 dates are both preserved.
- [Wang, Li and Kuok, SHM 2025](https://www.dpi-proceedings.com/index.php/shm2025/article/download/37321/35895): the separated-mode, small-damping and long-record assumptions must accompany uncertainty formulas. Closely spaced modes require a different analysis.
- [JCGM 100](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf): §§5.2 and 6 support covariance-aware uncertainty reporting. The actual correlations still need evidence from the apparatus.
- The five machine-learning records are optional-method connections. [CROP](https://proceedings.iclr.cc/paper_files/paper/2025/hash/313829757739365201b5adb3a1cbd9bd-Abstract-Conference.html) motivates resolution tests; [LUNO](https://proceedings.mlr.press/v267/magnani25a.html) concerns approximate predictive covariance; [PILE](https://proceedings.iclr.cc/paper_files/paper/2026/hash/d5a84b5c2d49bccdabed32098085fe65-Abstract-Conference.html) concerns diagnostics within a kernel/linear-PDE setting; [active operator UQ](https://arxiv.org/abs/2503.03178v4) shows calibration/runtime tradeoffs; [OOD UQ](https://proceedings.mlr.press/v235/mouli24a.html) is an abstract-level lead for held-out conditions. None establishes an absolute-location spectrum. PILE's “free energy” is a statistical quantity, not an apparatus energy source.

## Reproduction and access boundaries

- CROP: author repository README inspected. Source/data/checkpoint links exist; license was not verified, and no code was copied, built or trained by this literature task.
- LUNO: author repository README and Apache 2.0 license listing inspected. Its code is described by the authors as refactored experiment code. No benchmarks were reproduced by this task.
- The physical tooling team's actual executions are a separate evidence stream. They should not mark these paper implementations “tested.”
- Four primary PDFs were downloaded and text-extracted locally (CROP, LUNO, PILE, JCGM). PRL and SHM PDFs were readable through web extraction but direct downloads returned 403. The failed direct downloads are preserved in retrieval-log.json.
- The Nature full text redirected to an inaccessible login endpoint. Penn State/KTU/imec institutional abstracts were used where publisher access failed. No access controls were bypassed.
- Only the identified sections were read. No claim is made to have checked every proof, reference, book, manuscript, or source repository. Full source bytes are research inputs, not republished page assets.

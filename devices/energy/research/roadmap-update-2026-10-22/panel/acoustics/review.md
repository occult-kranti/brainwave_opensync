# Acoustics roadmap review

Date: 2026-10-22. Stage: REVIEW, before either adaptive planning round. Skills applied: resonance-research-advisor and newton-analysis-synthesis. No new simulation, implementation or measurement was performed. The earlier math-crosswalk artifacts remain unchanged.

**Recommendation:** prioritize gain-aware calibration, then validate pole comparison under nuisance changes. Treat minimum-port selection as a bounded optional extension. These are unresolved project subproblems; no global novelty or new inverse-elasticity theorem is claimed.

## What is already established

The consolidated math-crosswalk report and its acoustics/skeptic records support the common-scale identity and explicit parameter kernel. At fixed radius and Poisson ratio, E/rho controls radial frequencies; common E/rho scaling preserves them. Calibrated mass or static traction breaks that particular ambiguity. Unknown gain can hide response-amplitude scaling. The independent skeptic matched the production finite fixture to separately frozen matrices at two scales; this is narrow model evidence, not hardware validation.

The existing copper protocol already specifies randomized position blocks, handling shams, portable support/receiver geometry, thermal controls, bandwidth limits and raw-channel retention. Repeating that protocol in a new document would add little. Its unresolved dependencies are a validated pole estimator, a realistic gain/uncertainty model, and a defensible finite measurement design. The current tool integration reports accepted synthetic pyFRF and radial FEM checks, but explicitly no accepted pyEMA pole-fit benchmark. A finite trace, mesh or fitted inverse is not a complete object spectrum.

OpenAI family 372 concerns the **full static displacement-to-traction operator**, smooth real Lamé coefficients, a bounded connected smooth three-dimensional domain and positive elastic energy. Its selected scope is uniqueness, not a reconstruction algorithm. None of the following candidates supplies that complete data or proves the theorem. Density is absent from its static forward equation.

## Candidate A1 — smallest useful calibration for a gain-ambiguous mode

**Statement.** In a declared single-mode, homogeneous-sphere model with known radius, Poisson ratio and damping, determine which measured quantities identify z=(log E, log rho, log g), where g is an unknown positive, frequency-independent combined input/readout gain. Compare selected modal frequencies plus off-resonance response magnitude against the same data augmented by an independently calibrated mass.

**Unresolved gap.** The earlier exact scaling witness gives a null direction but no gain-aware uncertainty or calibration budget. In the ideal model, (E,rho,g)→(aE,a rho,a g) leaves frequency and measured response invariant. A known-radius mass can remove that direction; the practical question is how much uncertainty and gain drift this permits. Separate input and receiver gains are not individually identifiable from their product without another reference.

**Why feasible now.** The actual sphere parameter API, passive receptance and independent root/FRF checks already exist. This is a three-parameter problem with explicit symmetry, not a large inverse PDE. Use existing software and algebra before buying equipment.

**Decisive controls.** Retain the common-scale/gain family as a required failure for the uncalibrated design. Show that adding repeated copies of one channel does not increase rank. Inject frequency-dependent gain into the constant-gain fit and require a model-mismatch flag. Hold mass/radius calibration uncertainty separate from fitted frequency uncertainty; known density must remove only the declared density ambiguity.

**Deliverable.** A finite parameter/observable table, exact kernel and rank conditions, a predeclared noisy synthetic benchmark and a calibration-budget specification. The next planning rounds should select a noise model and tolerances, not assume them. Model acceptance would justify a proposed calibration procedure; it would not certify a physical sensor.

## Candidate A2 — does a position-comparison estimator survive nuisance changes?

**Statement.** For the existing passive two-mode sphere/fixture model, test whether a selected estimator can distinguish a controlled sphere-pole change from receiver-gain, support, temperature and mode-visibility changes across predeclared A/B/A or ABBA records. Restrict the target to a declared frequency band and matched model modes.

**Unresolved gap.** The repository has forward plots, finite FFT checks and a hardware proposal, but no accepted noisy pole-fitting benchmark for this comparison. A tallest-bin shift is not a pole shift; a support change can move the coupled poles themselves. If the selected observations cannot distinguish intrinsic and support parameters, the correct output is ambiguity, not an intrinsic shift.

**Why feasible now.** `coupledSystem`, `responseAt`, synthetic acquisition and independently checked spectral estimators provide the forward fixtures. A conventional low-order parametric estimator is sufficient for a first benchmark; a neural inverse and a full 3D simulation are unnecessary dependencies.

**Decisive controls.** Use gain-only changes, nodal suppression, an unchanged sphere with changed contact stiffness, and drift correlated with trial order as negative controls. Include a known sphere-parameter perturbation as a positive control, while checking whether a nuisance-only alternative gives indistinguishable data. Withhold positions/order and inject one omitted mode to test model mismatch. Freeze mode selection and rejection rules before scoring. Empty-table subtraction must not be treated as exact decoupling.

**Deliverable.** A model-estimator benchmark contract and result schema with confusion/abstention outcomes, followed by a revised preregistration for the already documented position protocol. No hardware effect size, sample count or “intrinsic position effect” should be promised before pilot repeatability and calibrated mode identity exist.

## Candidate A3 — minimum independent ports in a fixed finite model

**Statement.** For a fixed, explicitly truncated passive model and a finite menu of candidate source/receiver channels, find the smallest tested subset meeting a declared observability/conditioning requirement over a specified frequency band. Return rank, nullity, a kernel witness where present, and the worst retained singular value after unit/noise normalization. “Minimum” applies only to that finite candidate menu and criterion.

**Unresolved gap.** The prior duplicate-input example proves that more channels need not mean more information. The project has not selected or tested a sensor/drive layout that survives weak coupling, symmetry and gain uncertainty. A full-rank matrix may still be unusably ill-conditioned. A continuum inverse cannot be certified by finite matrix rank.

**Why feasible now.** Small matrices permit exhaustive subset enumeration and independent checks. Candidate A1 supplies the gain assumptions, and A2 supplies the observable/estimator target. This should remain optional until those are stable.

**Decisive controls.** Duplicate rows/columns, receivers on a model node, an unexcited mode, an unmodeled mode, and a poorly conditioned but full-rank subset must defeat overstrong admission. Hold out receiver/source configurations. Changing the source menu or mode truncation must invalidate an unqualified minimality claim.

**Deliverable.** A finite sensor-selection specification and a machine-readable port/rank/conditioning table, with a counterexample for each rejected layout. A successful model result only nominates a physical layout for later calibration and mode-shape checks.

## Source basis and reading depth

| Source | Inspected scope | Use and limit |
| --- | --- | --- |
| Project `math-crosswalk/report.md`, acoustics round2/results, skeptic peer findings | Consolidated report and selected complete numerical records; existing code inspected in earlier research round | Established starting point; no additional physical validation |
| Project `location-spectrum/research/protocol.md` and `tool-integration.md` | Current full protocol; tool-integration through listed unexecuted packages | Avoid duplicate planning; pole-fit benchmark remains unaccepted |
| [OpenAI family 372 manuscript](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Global-Uniqueness-for-the-Smooth-Isotropic-Elasticity-Inverse-Problem-September-24-2026/article.pdf) and [scope](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/lean/docs/372.md) | Previously read PDF pp.1–3, equations (1.1)–(1.3), Theorem 1.1 and complete short scope page; no full proof or Lean run | Measurement-operator boundary; does not license finite-data reconstruction |
| [Xu et al., ICASSP 2026 / arXiv:2602.03398v1](https://arxiv.org/html/2602.03398v1) | Current primary page re-opened; prior PDF §§1–4 and visual p.2 equations (4)–(7); [official program](https://www.cmsworkshops.com/ICASSP2026/view_paper.php?PaperNum=4067&bare=1) previously verified, May 5, 2026 | SVD transfer-matrix framing. Printed projection/dictionary inconsistency was independently confirmed; use correctly derived linear algebra, not uncritically copied equations. No author code or empirical results audited |
| [Chen et al., PI-PINN, arXiv:2601.19491v1](https://arxiv.org/html/2601.19491v1) | Current primary page re-opened; prior abstract and §§1–3.2, equations (1)–(6) | Reciprocity motivates a held-out swap check only under a reciprocal forward model and compatible calibration. No training or conference status asserted |

The three candidates are proposals for advisor selection. REVIEW stops here; the two adaptive planning rounds have not been executed by this specialist.

# Acoustics specialist — round 1

Research cutoff: 2026-10-21. Corpus: OpenAI/math `1581d4cbdd69a0faf34b2089614fe2a814316a6a`. This is a bounded review of physical acoustics and inverse measurements, using the resonance-research-advisor and newton-analysis-synthesis skills. No theorem proof, Lean build, physical experiment, or round-2 simulation was performed in this round.

## Comparison with work already in the repository

The strongest overlap is **inverse elasticity**, but it is a previously acknowledged connection, not a newly solved OpenAI problem. `location-spectrum/public/data/sources.json` already names families 372 and 365 and correctly distinguishes their data and verification scopes. The forward sphere model, contact/fixture model, receiver projection, and finite acquisition code answer narrower questions. The earlier source register and interpretation already disclose family 365's companion-formalization distinction.

| OpenAI family | Exact target inspected | Existing project evidence | Verdict |
| --- | --- | --- | --- |
| 372 | Theorem 1.1: full static displacement-to-traction data uniquely determine two smooth real Lamé moduli on a bounded connected smooth domain in R³, under positive elastic energy. | `location-spectrum/src/models.mjs`; `research/model-specification.md`; `research/interpretation.md`; prior source register. | Already cited; related forward calculations. No attempt at or solution of this global inverse theorem found in these artifacts. |
| 365 | Theorem 1.1: zero-frequency boundary measurements on a nonempty open proper patch recover a smooth metric and rank-two unitary connection, up to a patch-fixed diffeomorphism and gauge. | Prior source register and interpretation discuss coordinate/measurement ambiguity. | Already cited; conceptual connection. No implementation or proof of this theorem. The formalization scope page instead covers a bounded-measurable scalar-conductivity nonuniqueness companion. |
| 130 | Catalogue: deterministic exact-complex-arithmetic DFT below n log n with a specified model and explicit positive exponent improvement. | `location-spectrum/src/acquisition.mjs` uses a conventional floating-point radix-two FFT; the acquisition model checks finite synthetic records. | Same transform as a tool; not the same complexity problem or an attempted solution. |
| 075 | Catalogue: almost-everywhere convergence of ordinary symmetric Fourier partial sums for every function in L log L(T), along the full sequence. | Finite sampled signals, windows, FFT/DFT checks, alias examples. | General Fourier connection only; finite numerical checks do not establish this infinite-dimensional convergence statement. |

Families 075 and 130 were screened at catalogue level, not by reviewing their proofs. The two inverse-problem manuscripts were read through their statements and introductory assumptions (PDF pp.1–3), plus their complete short formalization-scope pages. Their full proofs and Comparator declarations were not audited. Publisher scope metadata is not a local verification log.

## What the existing code establishes

`location-spectrum/research/model-specification.md` defines displacement/force transfer functions in m/N, radial breathing modes, and a passive two-mode sphere/fixture model. For fixed Poisson ratio and radius, its frequencies scale as sqrt(E/rho)/R. `location-spectrum/reference/compare_producer.mjs` contains comparisons against frozen SciPy fixtures and controls for zero-coupling translation and receiver amplitude. This review inspected those assertions but did not rerun their artifact-writing test command.

The acquisition model is explicitly finite and synthetic. Its FFT bins, alias controls, and nodal receiver checks do not capture all object frequencies or a complete boundary operator. `energy-observatory/src/acoustic.mjs` is a force-driven passive piezoelectric oscillator, with modeled electrical load power. It supplies no experimental energy surplus. The sound roadmap's oscillator and signal-identity work likewise supplies no proof of a global inverse theorem.

An isolated body's spectrum remains invariant under rigid translation in an otherwise unchanged homogeneous environment. Location-dependent measured peaks can arise from changed support, source/receiver coupling, visibility, or environmental loading. A mathematical boundary patch is an extended set of controllable inputs and observations, not one microphone or one spatial point.

## Recent sources and useful transfers

The conference search produced a directly verified **ICASSP 2026** program entry, plus three clearly labeled 2026 preprints. This is a selective update, not a claim of exhaustive coverage or universal conference ranking. Full source URLs and reading limits are in `sources.json`.

- **Xu, Abhayapala and Jin, ICASSP 2026:** the official program schedules the hybrid spherical/linear microphone-array paper on May 5 in Barcelona (conference May 4–8). Its arXiv version models y=Hx+n and uses an SVD basis. Transfer: expose the actual measurement matrix, singular values, retained rank, nullity, and held-out prediction error. Its evaluation is simulated room acoustics; it does not recover arbitrary objects from finite peaks. **Implementation gate:** PDF p.2, equations (4)–(7), as printed, pairs projected data U* y with dictionary Sigma^-1 V*, although projection of H=U Sigma V* gives Sigma V*. This algebra was visually checked against the PDF; the discrepancy requires correction or clarification before porting. It is not a finding about the authors' unavailable implementation.
- **Chen, Jiang, Liu and Tao, September 17 preprint:** Theorems 1.1–1.3 give inverse-static-elasticity results under structured shear-modulus assumptions. The torsional data in Theorem 1.1 determine shear modulus but are independent of the first Lamé parameter; full elastic data enter the stronger conclusion. This is a concrete warning that a selected measurement channel can have an exact invisible parameter. No peer-reviewed venue was verified.
- **Chen et al., January 27 PI-PINN preprint:** Sections 2–3 impose acoustic reciprocity through a symmetric source/receiver representation and add Helmholtz residuals. Transfer: use reciprocal position swaps as a model check, and test predictions on withheld geometries. A symmetric architecture guarantees its symmetry, not correctness of an inferred field. No trained model was run and no conference acceptance is asserted here.
- **Oktav, September 18 preprint:** a frequency-ratio proposal targets support-condition changes in restricted beam/plate models. Sections 5.5–5.6 retain a nonunique tip-support case and identify experimental realization as future work. Transfer: add support as a nuisance parameter and preserve ambiguity. Uniform material scaling cancellation does not eliminate thickness/slenderness or arbitrary boundary uncertainty. No experimental validation or journal status is claimed by this review.

## Proposed round-2 test for advisor selection

**Question:** can identical modal frequencies justify applying the full-boundary-data uniqueness conclusion to our copper lab?

For a positive scalar a, replace (K,M,C) by (aK,aM,aC). The generalized eigenvalue equation has identical eigenfrequencies; under the same calibrated forcing and readout the transfer function becomes H/a. In homogeneous elasticity, scaling both E and rho by a preserves ideal frequencies at fixed radius and Poisson ratio. Static traction under a prescribed displacement scales by a, so the full static boundary map changes. Consequently this is an identifiability counterexample for frequency-only data, not a counterexample to family 372.

Proposed controls: compare the existing sphere implementation with an independently assembled generalized-eigenvalue calculation; include the wrong hypothesis that frequencies identify E and rho separately; include an E-only scaling control and a calibrated mass measurement. In log(E),log(rho), every frequency sensitivity row is [1/2,-1/2], with kernel span{(1,1)}. A mass measurement at known geometry adds row [0,1] and removes that ambiguity in this restricted model. Uncalibrated gain can reintroduce an amplitude ambiguity and must be reported.

`round2-proposal.json` freezes candidate inputs and expected outcomes for advisor/skeptic review. It is a proposal only. The derivation is elementary model analysis, not a novel general inverse theorem. Neither this proposal nor any cited acoustic reconstruction method establishes energy generation or the Yang–Mills mass gap.

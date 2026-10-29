# Round 3 source, attribution and readiness review

Reviewer: `/root/oct_sources`. Date: 2026-10-29. This review follows the final revised producer packet and final independent verifier receipt, not the superseded first freeze.

**Admit within the calibrated single-mode and metadata-readiness scopes.** The mathematics is established response theory, the checks are synthetic, and the current Schumann evidence remains insufficient. No new physical theorem, observed anomaly, external Lean proof or fourth research round is admitted.

## Final evidence inspected

I read the frozen contract, final producer report/results, final verifier report/results and their source bindings. I recomputed every hash in the producer freeze (5 files) and verifier freeze (15 files); all 20 match. I did not independently rerun the numerical suites in this source review.

| Artifact | Final SHA-256 |
| --- | --- |
| `analysis/round3/model.mjs` | `c59e7b5d2489294c897a641a767fce25d5c743ea49e4236dcfebdc35ea1bec30` |
| `analysis/round3/run.mjs` | `f4e298713d797a706a3f5bd2fb10c1c08306e171a006d45b31cd6706c767cfd0` |
| `analysis/round3/results.json` | `5cdfff4035371cbc162899474f8e6f98130331b2f9a8d767d2b4d5782c5cb399` |
| `analysis/round3/report.md` | `2d0c747a47203d2735cf6dc0a134940396b888a9fc850b20662bb2d6224845e4` |
| `analysis/round3/freeze.json` | `d022604d2a880b067f720383104dc4fc5b9132f2289fcd9149e1a5bb7366c62d` |
| `verification/round3/comparison-results.json` | `e1d165e3e91109c320a27d9e29d45b785354df57b4bdb0ac592a50d7cbe6f182` |
| `verification/round3/report.md` | `4c99ca1de6d080cdccbdb03df25a5d026a8fd687000c4258fdb64a0837ef46e5` |
| `verification/round3/freeze.json` | `bae36a9425252f536f429737fc34dd4762125d62a282946da183622cf1886ab5` |

The final producer records 58 passing assertions. Independent verification records 82 API requests, 340 assertions, eight malformed/extreme numeric rejections and a separately rejected conjugated-phase case. Its largest nonzero compared relative discrepancy is 3.20677×10⁻¹³, below the preregistered 2×10⁻¹¹ tolerance. These are bounded implementation checks, not experimental error bars.

The earlier extreme-range acceptance defect is preserved rather than erased: H=(1−i)10³⁰⁸ at the declared probe lost representable detuning and had unsupported forward range. The corrected inverse adds forward replay/range checks; the unchanged independent countercase now rejects. That repair does not establish uniform conditioning. High-frequency cancellation and measurement uncertainty remain separate problems.

## Attribution and calibration boundary

With the declared exp(+iωt) convention, known positive physical mass and calibrated force/displacement response, H⁻¹=m(ω₀²−ω²+2iγω). The two reconstruction equations follow by separating its real and imaginary parts. [Kim–Eun (2013), §2.1](https://www.extrica.com/article/14434) explicitly gives the parent matrix FRF; the exact scalar compliance also appears in [Scalzo–Vaglio (2025), Eq. 4](https://link.springer.com/article/10.1007/s11340-025-01201-1). This is prior-art containment, not merely thematic similarity. The detailed proposition map is in [the prior-art gate](prior-art-gate.md).

The actual R2 models recover 7.8 and 10.3 Hz under their known masses and pass three held-out complex-response checks. Selected gain-error, multimode and deterministic perturbation cases fail. These examples do not prove every wrong model must fail a finite test set. The API correctly retains `modelValidityEstablished:false`.

The receiver-only same-known-mass control removes the earlier mass-confound interpretation. Its G=H₂/H₁ still makes a different pole pair pass the held-outs. For these specific stable quadratics, G is proper stable real rational with stable zeros; causality or stability alone does not remove ambiguity. No passive sensor hardware is established. In contrast, constant positive real gain is identifiable jointly with poles from two frequencies when mass is known; only the mass/gain scale remains confounded if neither is known. These qualifications are necessary and present in the final reports.

## Actual October evidence and provenance

I inspected the three actual packets in the final results. Both image retrieval times are correctly unknown (`null`), rather than being inferred from the assessment cutoff. NOAA's recorded microsecond timestamp is preserved separately from its explicit parser normalization. The cutoff is 2026-10-29T04:57:39Z, not the end of October 29, and the numeric Kp interval ends at 03:00 UTC.

Tomsk and Nagycenk quick looks lack the calibrated numeric SR series and associated metrology needed by this workflow. Kp is a different observable. All three return `insufficient-evidence`, `synthetic:false`, `metadataOnly:true`, `anomalyEstablished:false`. The independent 46-case metadata suite admits only two explicitly synthetic ready-for-analysis fixtures; 44 incomplete/invalid cases fail.

The fictional fixture URLs/hashes, syntactic metadata validity and distinct station IDs authenticate nothing. Calibration traceability, waveform integrity, independent errors, matched baselines, selection and multiplicity remain external requirements. No actual October frequency shift, global anomaly or cause is inferred. Historical reference frequencies and synthetic parameters must remain separate from the observation timeline.

## Publication language and links

The source review of `schumann-pages.mjs` and `data/october-update.json` found the five release URLs pinned to the audited OpenAI revision or official announcement. Direct links to the MUB execution receipt and bounded recipe are now rendered. The important scope distinctions are present: 032 is a new formalization of an existing manuscript; 079 separates epsilon-loss Lean scope from the critical frequency-localized manuscript logarithmic loss; 378 states fixed-k/encoded-input conditions and the weaker formal runtime; 266 separates the Lean ≤5 target from the separate ≤3 numerical work and our narrow saved-record receipt.

No new external theorem is imported by the inverse. Local smoothing does not supply missing calibration; SAT search does not separate identical observations; Hodge and MUB have no checked mechanism-level transfer to this experiment. The Yang–Mills announcement remains distinct from a mass gap and from locally verified proof artifacts.

The final roadmap should retain the calibrated-data and uncertainty requirements, along with the prior-art gate before any proposed next cycle. This source review closes the third contracted round only.

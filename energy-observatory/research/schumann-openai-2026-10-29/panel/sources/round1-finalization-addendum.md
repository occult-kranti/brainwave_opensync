# Round 1 verifier finalization addendum

Reviewer: /root/oct_sources. Date: 2026-10-29.

The frozen source review `round1.md` captured an intermediate verifier report/result before its final replay-path and prose finalization. It must not be read as binding the final verifier bytes. The original source report is preserved unchanged; this addendum supplies the corrected final bindings.

| Artifact | Earlier captured SHA-256 | Final SHA-256 |
| --- | --- | --- |
| verification/round1/comparison-results.json | 27fa97f8a673ed508556f88e1f3544b2aea51e4e0b73979cec2dd25402bc43fb | e7a89b9aa9aa5173c2dbbd6b036a6b7d6a2b6eb905ba62e3f5895b6130ccf5d5 |
| verification/round1/report.md | e78d81d125782a0d74ea2cee536db432cb4a659afd9e39e5a3044b78a8f83e80 | 2fee0edd5e332025a4918e0d7dd98b2d7148144f681a04f5229391f2abf64857 |
| verification/round1/compare_producer.py | f60d029cc73ce704fb475ea5e7d1286b86e823ede6cbb9c7b3c75702168230c6 | 61de7327e06b226052b4335b2f93699812548f22bc0099aa8a6bc66743986372 |
| verification/round1/producer-bridge.mjs | 358ee18d7b0e388889db2de77c8268504187bd29e785ee5aef4e37f4a9465007 | b49d2def1e5f067e1a808526fd5698fd52cf6ceb0dbf23b70ab782d075b5a8fb |

I read the final report/results and recomputed all six file hashes listed in `verification/round1/freeze.json`; all match. The verifier confirmed the reason: the bridge/comparator now imports immutable `analysis/round1/model.mjs` instead of the live `src/schumann-model.mjs`, and its report clarifies the underflow guards already present in the compared producer bytes.

The producer SHA-256 remains `86f92e1d90ee7b7b4ac5d8286c830d915a360f0c634fdeae4c2f3798c1443cc8`. Independent oracle and fixture hashes remain `4567675f673a1049e23cfc06e9045db811b5c740110725d51312c7c0b26b3549` and `ebd2ff8e1b4149e610b974f2bc327250967073ce9801ba149fd9759f7d91b6f0`.

Scientific outcomes and thresholds are unchanged: 79 requests, 169 scalar comparisons, 15 invalid rejections, nine real quadratures, three peak grids and maximum relative discrepancy approximately 8.99e-16. The finalization improves reproducible replay; it does not add mathematical or physical evidence. The source review's scoped acceptance, attribution and novelty conclusions remain unchanged. I did not rerun the numerical comparison in this addendum.


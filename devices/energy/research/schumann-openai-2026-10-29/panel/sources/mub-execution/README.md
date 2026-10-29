# Bounded MUB record-checker reproduction

This folder retains a reproducible download recipe, source/input hashes and execution receipts for the released OpenAI saved-record checker. The numerical data themselves are stored outside this repository. The first-round source report remains frozen; these later receipts update only its execution status.

Upstream: openai/math at `7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a`, under `preprints/The-maximum-number-of-mutually-unbiased-bases-in-dimension-six-September-24-2026/verification/saved-run`. Root license: Apache-2.0; the downloaded LICENSE retains the full notice. These scripts use the Python standard library and do not need credentials.

Reproduce from this folder, using an empty external destination:

```sh
python3 download_records.py /absolute/path/outside/repository
python3 run_checker.py
```

The second command executes the upstream instruction `python3 execution/check_records.py` in that destination. It verifies the checker SHA-256 against the download receipt and saves stdout, stderr, return code, runtime, Python version and all receipt hashes. The downloader verifies file sizes and Git blob identities supplied by the pinned GitHub contents listings; VERIFY.md and LICENSE receive SHA-256/Git hashes but had no independently retrieved expected Git blob in this recipe.

The entire 18,229-byte checker and its instructions were inspected before execution. Its imports are argparse, json, math, pathlib, re, struct and sys. It parses numerical binary/text records, validates bounds and exact file membership, compares recorded stage coverage/counts and follows unresolved records through the fallback. It neither invokes archived programs nor accesses a network.

A successful exit admits only consistency and coverage of these saved numerical records under the checker's own logic. It does **not** authenticate the original computation, prove the C++ implementation, verify compiler/hardware behavior, run Lean, establish the full dimension-six MUB theorem, or transfer a new theorem into our physics models. Git hashes authenticate the fetched repository objects, not the historical computation that purportedly produced their contents.

The machine-readable status belongs to `download-receipt.json` and `execution-receipt.json`, with full checker output in `checker.stdout.json`. No favorable result should be inferred if those receipts are absent or indicate failure.


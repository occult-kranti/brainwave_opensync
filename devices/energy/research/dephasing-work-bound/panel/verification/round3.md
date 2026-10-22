# Verification Round 3 — final scope and release-gate audit

**Finite verification scope accepted; final release remains conditional on the advisor's completed manifest and successful full replay.** This is the third and final research round. No new scientific grid was added. Round 1/2 files remain frozen.

The summary accurately reports **2,555** independent states, **5,110** extraction unitaries, **3,780** producer comparisons, **315** boundary-helper cases, **600+17** input rejections and **eight** high-precision comparisons. An executed receipt-count cross-check passed. The matrix tolerance is **5e-13 normalized absolute error**. Round 2's high-precision comparisons use **2e-14 relative tolerance for normal values**, with **two minimum subnormals absolute tolerance** for subnormal/underflow values. These tolerances are acceptance criteria for finite cases, not universal error bounds. No float64 equality or producer clipping establishes the theorem.

The earlier reports' phrase “repository root” means the **`energy-observatory` subdirectory**, not its parent Git checkout. Reproduction from that directory is:

```sh
python3 -B research/dephasing-work-bound/panel/verification/check_independent.py
python3 -B research/dephasing-work-bound/panel/verification/compare_producer.py
python3 -B research/dephasing-work-bound/check_release.py --output /tmp/e1-release-replay.json
```

Node.js, Python and NumPy are required; high precision uses standard-library Decimal. The release gate copies the dossier and necessary source modules to a disposable directory. It actually executes both verifier checkers, producer/skeptic/physics checks and UI boundary controls, parses their JSON, requires successful exit and PASS, and records stdout hashes. The verifier import paths resolve in that copied layout. Existing receipts are not rewritten.

I found that the initial gate permitted an empty source-hash manifest. The advisor repaired this before final freeze: an accepted receipt and **40 required source paths**, including all **18** reports, are now mandatory. `check_release_coverage.py` executes a synthetic admitted-but-empty-manifest case in a disposable copy. The corrected gate rejects it before numerical replay with `Receipt omits required sources`; the control itself passes. The real gate also correctly rejected the still-unadmitted summary. Neither control constitutes completed release replay.

SHA-256 bindings:

- Reviewed final gate: `6740dc1fef2e4d74ce8d5a42521e63d1d802e84a7e95a2d99a6a907c5f526a83`
- Unchanged scientific module: `05b2ad552c3bb0c1812dd3553163a59f28bc77b9bc55861c96d673fd85afb78b`
- Round 1 results: `8cab7cf918c89342faffdcbb956579cac5a2252db02af71c6211211309cac272`
- Round 2 results: `b1eb21420d851b1b1485e8bfc32633caec11c0a02a7a3db4394a613670867e43`
- Gate-control receipt: `62a90b7cd64a3a23080b63447c33e2f78b6b63deb3070db2d2a81f06f6e9824a`

The analytic proof supplies the all-parameter claim; these checks support finite implementation assurance. They do not establish formal verification, all-binary64 accuracy, experimental performance, or live deployment. Final admission must bind the completed sources and record the advisor's actual six-check replay result separately.

# MUB saved-record execution result

**Pass within the checker's numerical-consistency scope.** On 2026-10-29 at 05:08:22–05:08:27 UTC, CPython 3.12.14 executed the upstream command `python3 execution/check_records.py` in 4.37 seconds, exit code 0, with empty stderr.

Inputs were pinned to openai/math `7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a`. All 300 requested files downloaded: 82,438,501 bytes including instructions and license. All 298 files with expected Git blob identities matched. The checker source SHA-256 is `565f4ee47ab7b7c4bf1c224981eb86ec94ef5f75a9487347a53af407eee45734`.

The checker validated 196 numerical data files and 100 result files against 100 recorded child stages. It accepted the recorded 249,878-center coverage count and 151,744,086-pair counter; **this run did not regenerate those centers or recompute those pairs**. It checked 22,379 fine records partitioned into 88 batches. The 163 initially unresolved records enter the saved fallback, producing 1,127 final records across four final shards whose saved unresolved counts are zero.

What we actually established: these fetched records pass the released parser, bounds, stage-linkage, ordered-subsequence, partition and final-coverage consistency checks. This supplies a concrete local artifact receipt and a useful evidence-workflow example. It does not validate the full MUB theorem, the numerical C++ implementation, original computation history, compiler or hardware arithmetic. No Lean proof was run and no new physics claim follows.

Full evidence: execution-receipt.json, checker.stdout.json, checker.stderr.txt, download-receipt.json, download-manifest.json. The two small Python scripts document acquisition and exact execution. Raw numerical inputs remain outside this repository; no 82 MB data bundle is published by this review. The root Apache-2.0 license was inspected and retained with the external download.


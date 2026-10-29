#!/usr/bin/env python3
"""Execute the inspected pinned checker, saving an honest bounded execution receipt."""
import datetime
import hashlib
import json
from pathlib import Path
import platform
import subprocess
import sys
import time

here = Path(__file__).resolve().parent
download = json.loads((here / "download-receipt.json").read_text())
if download["status"] != "complete":
    raise SystemExit("All pinned inputs must download and verify first.")
root = Path(download["root"])
checker = root / "execution/check_records.py"
expected = next(item for item in download["files"] if item["path"] == "execution/check_records.py")
actual_sha256 = hashlib.sha256(checker.read_bytes()).hexdigest()
if actual_sha256 != expected["sha256"]:
    raise SystemExit("Checker changed after inspected pinned acquisition.")
command = ["python3", "execution/check_records.py"]
start = datetime.datetime.now(datetime.timezone.utc).isoformat()
clock = time.monotonic()
try:
    result = subprocess.run(command, cwd=root, text=True, capture_output=True, timeout=120, check=False)
    code, stdout, stderr, timed_out = result.returncode, result.stdout, result.stderr, False
except subprocess.TimeoutExpired as exc:
    code, timed_out = None, True
    stdout = (exc.stdout or b"").decode() if isinstance(exc.stdout,bytes) else (exc.stdout or "")
    stderr = (exc.stderr or b"").decode() if isinstance(exc.stderr,bytes) else (exc.stderr or "")
(here / "checker.stdout.json").write_text(stdout)
(here / "checker.stderr.txt").write_text(stderr)
parsed = None
try:
    parsed = json.loads(stdout)
except json.JSONDecodeError:
    pass
receipt = {
    "schema": "mub-checker-execution/1", "revision": download["revision"],
    "command": command, "workingDirectory": str(root), "startedUTC": start,
    "endedUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "elapsedSeconds": time.monotonic()-clock, "python": platform.python_version(),
    "implementation": platform.python_implementation(), "returnCode": code, "timedOut": timed_out,
    "checkerSha256": actual_sha256,
    "downloadReceiptSha256": hashlib.sha256((here/"download-receipt.json").read_bytes()).hexdigest(),
    "stdoutSha256": hashlib.sha256(stdout.encode()).hexdigest(),
    "stderrSha256": hashlib.sha256(stderr.encode()).hexdigest(),
    "output": parsed,
    "admission": "Saved numerical-record consistency only" if code==0 and parsed else "No positive execution admission",
    "notVerified": ["MUB theorem", "C++ source correctness", "original execution provenance",
                    "compiler behavior", "hardware arithmetic", "Lean declarations"]
}
(here / "execution-receipt.json").write_text(json.dumps(receipt,indent=2)+"\n")
print(json.dumps(receipt,indent=2))
sys.exit(0 if code==0 and parsed else 1)


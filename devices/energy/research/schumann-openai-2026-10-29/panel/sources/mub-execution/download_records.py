#!/usr/bin/env python3
"""Download pinned public numerical records; verify Git blob identities and save SHA-256.
Usage: python3 download_records.py /absolute/path/outside/repository
No credentials, external dependencies, retries, or archive extraction.
"""
import concurrent.futures
import datetime
import hashlib
import json
from pathlib import Path
import sys
import time
import urllib.request

HERE = Path(__file__).resolve().parent
manifest = json.loads((HERE / "download-manifest.json").read_text())
root = Path(sys.argv[1]).resolve()
root.mkdir(parents=True, exist_ok=True)
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
clock = time.monotonic()
deadline = clock + 420

def download(item):
    if time.monotonic() > deadline:
        raise TimeoutError("Seven-minute acquisition budget exhausted")
    relative = Path(item["path"])
    if relative.is_absolute() or ".." in relative.parts:
        raise ValueError("Unsafe relative path")
    required_prefix = "https://raw.githubusercontent.com/openai/math/" + manifest["revision"] + "/"
    if not item["url"].startswith(required_prefix):
        raise ValueError("Unpinned or non-public source URL")
    request = urllib.request.Request(item["url"], headers={"User-Agent": "research-record-reproduction/1"})
    with urllib.request.urlopen(request, timeout=35) as response:
        body = response.read()
    if item["expectedBytes"] is not None and len(body) != item["expectedBytes"]:
        raise ValueError("Length mismatch: " + item["path"])
    git_blob = hashlib.sha1(b"blob " + str(len(body)).encode() + b"\0" + body).hexdigest()
    if item["expectedGitBlob"] is not None and git_blob != item["expectedGitBlob"]:
        raise ValueError("Git blob mismatch: " + item["path"])
    target = root / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(body)
    return {"path": item["path"], "url": item["url"], "bytes": len(body),
            "sha256": hashlib.sha256(body).hexdigest(), "gitBlob": git_blob,
            "gitBlobMatchedAPI": item["expectedGitBlob"] is not None}

completed, failed = [], []
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    jobs = {pool.submit(download, item): item for item in manifest["files"]}
    for future in concurrent.futures.as_completed(jobs):
        item = jobs[future]
        try:
            completed.append(future.result())
        except Exception as exc:
            failed.append({"path": item["path"], "type": type(exc).__name__, "error": str(exc)})
            for pending in jobs:
                pending.cancel()
            break
completed.sort(key=lambda item: item["path"])
receipt = {"schema": "mub-download-receipt/1", "revision": manifest["revision"],
           "startedUTC": started, "completedUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
           "elapsedSeconds": time.monotonic()-clock, "root": str(root),
           "expectedFiles": len(manifest["files"]), "completedFiles": len(completed),
           "downloadedBytes": sum(item["bytes"] for item in completed),
           "status": "complete" if not failed and len(completed)==len(manifest["files"]) else "incomplete",
           "files": completed, "errors": failed}
(HERE / "download-receipt.json").write_text(json.dumps(receipt, indent=2)+"\n")
print(json.dumps({key: value for key,value in receipt.items() if key != "files"}, indent=2))
sys.exit(0 if receipt["status"]=="complete" else 1)


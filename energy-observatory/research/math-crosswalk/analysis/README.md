# Reproducing the two-round comparison

From `energy-observatory/`, with Node 22+, Python 3.12+, NumPy and SciPy (versions pinned in `analysis/requirements.txt`):

```sh
python3 -B research/math-crosswalk/analysis/check_release.py --output /tmp/math-crosswalk-replay.json
npm run check
```

The runner copies the source into a temporary directory, executes all four model studies and both independent producer comparisons, and leaves reviewed results unchanged. It uses the archived location-v1.1 model, whose SHA-256 is identical to the producer inspected in the main repository. The source ZIP contains this dependency. The method's independent reference is produced before importing the thermal producer. This replay preserves the original freeze records; it is not a new independent author or a new research round.

For a fresh catalogue source recount, also install PyYAML and retrieve the exact files listed in `panel/corpus/snapshot-manifest.json`, `round2-sources.json` and `round2-git-expected.json` at OpenAI commit `1581d4cbdd69a0faf34b2089614fe2a814316a6a`. Preserve paths below an `openai-snapshot/` directory, then add:

```sh
python3 -B research/math-crosswalk/analysis/check_release.py \
  --snapshot /path/to/openai-snapshot --output /tmp/math-crosswalk-full-replay.json
```

The metadata gate alone runs in ordinary CI without a network download. The optional source recount was executed by the advisor with a pinned snapshot; it verifies hashes before parsing. Complete third-party paper texts are not redistributed. Catalogue facts, titles and links retain their upstream attribution in `../ATTRIBUTION.md`.

Read each lane's `round2.md` for assumptions, tolerances, individual commands and exact-vs-numerical distinctions. A passing run establishes only the declared controls. It does not execute Lean, prove the external theorems, collect physical data or establish a new energy source.

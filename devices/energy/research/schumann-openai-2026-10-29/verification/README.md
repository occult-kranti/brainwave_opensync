# Reproduce the bounded checks

Run from `energy-observatory/` with Node ≥22, Python 3.12 and the repository's analysis dependencies (including NumPy).

```sh
npm run check
python3 -B research/schumann-openai-2026-10-29/check_release.py --output /tmp/schumann-check.json
```

The first command checks source bindings, existing models and preserved versions, and builds the website. The second checks the final receipt and copies the new study into a temporary directory before replaying the observation checker and both workers' three frozen model runners. Reviewed outputs are not overwritten. Each independent oracle/fixture was frozen before that round's producer implementation was read. Reports explain the tolerances, finite cases and all-domain derivations separately.

Browser behavior can be reproduced with Playwright and a compatible Chromium executable:

```sh
ENERGY_CHROMIUM=/path/to/chromium node scripts/schumann-browser-check.cjs
```

The browser check exercises desktop/mobile rendering, different readouts and forcing, low-Q behavior, zero-field density, model export and all local new-page links. It is not an instrument test. Its screenshots and result receipt are under `browser/`. Initial browser testing caught a test-harness SVG link representation issue; the harness resolves literal href attributes against document.baseURI. The independent review also corrected early dashboard terminology and a numeric API return-type use before publication.

## What is and is not verified

- Raw NOAA/GFZ source hashes, timestamps, completed-bin coverage and negative controls are checked. Their physical measurements are not recalibrated here. Kp is not Schumann frequency.
- Finite numerical comparisons test code. Written algebra establishes the specified exact model identities. No universal floating-point accuracy proof is claimed.
- R3 uses noiseless calibrated synthetic response and deterministic perturbations. Its held-out numerical tolerance is not experimental uncertainty, and passing finite frequencies does not certify the model at every frequency.
- Evidence intake checks supplied metadata structure and consistency. It does not authenticate calibration, compute an anomaly statistic or prove independence of observations.
- OpenAI MUB saved records were checked separately; see [its exact execution receipt](../panel/sources/mub-execution/execution-receipt.json) and [reproduction recipe](../panel/sources/mub-execution/README.md). The large original C++ computation was not rerun. This release gate checks that receipt, without redownloading the external 82 MB packet.
- **Local Lean executions: zero.** No Lean theorem or full OpenAI dependency closure was independently executed here. The required toolchain and comparator targets are documented in the source release manifest.
- Novelty is assessed by a bounded primary-source comparison, not certified by tests or model-agent agreement.

The source role's original R1 report preceded the final switch from a live module path to the frozen snapshot. The [append-only finalization addendum](../panel/sources/round1-finalization-addendum.md) records the final receipt hashes and unchanged numerical outcomes. Earlier source bytes remain intact.

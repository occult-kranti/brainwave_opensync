# Fieldwork / Location Spectrum Lab

An independent page for the copper-sphere A/B location experiment.

- Live route: https://occult-kranti.github.io/brainwave_opensync/devices/location/
- Source branch: `research/location-spectrum`
- Research snapshot: **22 October 2026**, UTC. Version **1.1.0**.
- Physical measurements: **none**. Curves, poles and sensitivities are simulated.

The lab compares thin hollow and solid copper spheres, a passive contact-coupled fixture, and an empty table's local response. It provides five mechanical scenarios, six synthetic acquisition scenarios, a covariance-aware comparison calculator, 80 selected source records, 82 network nodes with 84 typed relationships, five deterministic diagrams, three generated apparatus illustrations, twelve hypotheses, raw CSV/JSON exports and reproducible reference calculations. A finite-band measured spectrum is not an object's complete frequency signature.

## Run

Requires Node 22 or newer. No runtime npm dependencies.

```sh
cd location-spectrum
npm run check
npm run serve
```

Open http://localhost:4175/ . The deployed page uses relative assets beneath `/brainwave_opensync/devices/location/`.

## Reproduce independent calculations

```sh
python reference/independent_fixtures.py
node reference/compare_producer.mjs
```

The recorded environment uses Python with NumPy 2.3.5 and SciPy 1.17.0. The reference derives spherical-Bessel roots, a 3D radial shell determinant, symmetric generalized eigenvalues and complex frequency responses independently of the browser implementation. Numerical agreement validates the stated calculation, not the actual apparatus. Source-derived material constants remain reference assumptions.

Optional actual-browser verification uses externally installed `playwright-core` and Chromium:

```sh
SPHERE_CHROMIUM=/path/to/chromium node scripts/browser-check.cjs
```

Use `NODE_PATH` if Playwright is installed outside this directory. Browser automation is development tooling and is not shipped as a runtime dependency.

## Evidence and code

- `research/model-specification.md`: derivations, units and assumptions.
- `research/independent-review.md`: independent checks and limitations.
- `research/protocol.md`: apparatus, controls, acquisition and motion-test design.
- `research/bashar-provenance.md`: corpus search, transcript timestamps and source variants.
- `research/literature-review.md`: selected recent papers and their actual relevance.
- `research/interpretation.md`: forward/inverse distinction and research questions.
- `research/expansion-experiments.md`: measurement targets, eight proposed setups and review decisions.
- `research/history-expansion.md`: selected patents, books and historical sources; identity and reading limits.
- `research/literature-expansion.md`: selected recent physical and machine-learning methods.
- `research/acquisition-model.md` and `research/expansion-review.md`: FFT, window, alias, covariance and independent stress checks.
- `research/tool-integration.md`: actually executed pyFRF, scikit-fem and pyuff integrations, including retained failures.
- `research/image-provenance.md`: generated-image prompts and illustration limitations.
- `public/data/`: source register and typed research connections.
- `reference/`: independently executed calculations and reproducible retrieval/drawing scripts.

The Bashar Index is pinned to `457dc2f2da10399bda2786573b7a77ec3fe34f62`; the selected OpenAI mathematics corpus is pinned to `1581d4cbdd69a0faf34b2089614fe2a814316a6a`. The audit searched the available index text; it did not listen to every indexed recording. One related caption retrieval succeeded; the exact follow-up video's original is removed and its third-party transcript remains an explicitly labeled fallback. Raw third-party captions and research PDFs are not redistributed.

## Deployment boundary

The branch workflow publishes only `devices/location/` on `gh-pages`, using the shared Pages concurrency lock. The parent Device Observatory workflow excludes `/location/` when it refreshes `devices/`. Master already preserves the entire `/devices/` directory. No master or archive application code is modified by this page.

The browser uses original project code with no runtime dependencies. The optional offline benchmark executes pinned pyFRF, scikit-fem, pyuff, SciPy and NumPy packages. Its FEM model imposes radial symmetry; no full 3D anisotropic solver, trained neural operator, Lean proof or physical acquisition was executed. Packages, licenses, hashes, exact reproduction commands and failed cases are documented.

The 22 October expansion fixes two small-argument cancellation problems near the auxetic material stability boundary. Copper defaults remain unchanged. Historical validation reports are retained with their original date; the expansion review records the current calculation checks. Research selection is bounded: not every patent, book or available package has been reviewed. “Freidman” remains an unresolved author name.

# Fieldwork / Location Spectrum Lab

An independent page for the copper-sphere A/B location experiment.

- Live route: https://occult-kranti.github.io/brainwave_opensync/devices/location/
- Source branch: `research/location-spectrum`
- Research snapshot: **21 October 2026**, America/New_York.
- Physical measurements: **none**. Curves, poles and sensitivities are simulated.

The lab compares thin hollow and solid copper spheres, a passive contact-coupled fixture, and an empty table's local response. It provides five scenarios, source and paper connections, three deterministic setup diagrams, six hypotheses, an experimental protocol, raw CSV/JSON exports and reproducible reference calculations. A finite-band measured spectrum is not an object's complete frequency signature.

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
- `public/data/`: source register and typed research connections.
- `reference/`: independently executed calculations and reproducible retrieval/drawing scripts.

The Bashar Index is pinned to `457dc2f2da10399bda2786573b7a77ec3fe34f62`; the selected OpenAI mathematics corpus is pinned to `1581d4cbdd69a0faf34b2089614fe2a814316a6a`. The audit searched the available index text; it did not listen to every indexed recording. One related caption retrieval succeeded; the exact follow-up video's original is removed and its third-party transcript remains an explicitly labeled fallback. Raw third-party captions and research PDFs are not redistributed.

## Deployment boundary

The branch workflow publishes only `devices/location/` on `gh-pages`, using the shared Pages concurrency lock. The parent Device Observatory workflow excludes `/location/` when it refreshes `devices/`. Master already preserves the entire `/devices/` directory. No master or archive application code is modified by this page.

The implemented solver uses original project code. Optional external tools and repositories are cited with their role and access limits; no external trained neural operator, Lean proof or full finite-element solver was executed for the browser page.

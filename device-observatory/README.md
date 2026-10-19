# Fieldwork / Device Observatory

A separate, browser-based research website with three numerical instruments, nine grouped configurations, nine proposed experiment contracts, and a selected 34-record evidence library. Research snapshot: **16 October 2026**. Source ownership: `research/device-observatory`; public path: `/brainwave_opensync/devices/`.

## What is implemented

| Instrument | Calculation | Observable | Main exclusion |
| --- | --- | --- | --- |
| Resonant transfer | Loaded, coupled series RLC frequency response | RMS currents, real source/load/loss power, circuit efficiency | No field solution or full generator efficiency |
| Acoustic focus | Complex superposition of phase-conjugated monopoles | Pressure-squared proxy relative to an ideal target | No calibrated pressure, force, particle dynamics or levitation stability |
| Vibration absorber | Complex two-degree-of-freedom response | RMS primary/internal motion and damping power | No nonlinear, transient or mounting model |

The absorber bench also runs an **81-candidate deterministic grid search**. It minimizes the worst sampled primary displacement on 31 frequencies, then evaluates the selected candidate on 30 interleaved frequencies excluded from optimization. It reports baseline and candidate scores separately. This is a finite numerical search, not a call to an AI service, a proof of global optimality, or a measured prototype result.

Each bench offers reset, presets, numerical CSV/JSON exports, and parameterized share links. JSON exports include model version and the deployed source commit. The full research dossier and machine-readable source register are built into the public website.

## Run and verify

Requires Node 22 or newer; there are no npm dependencies to install.

```sh
cd device-observatory
npm run check
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080/`. Relative assets also work at the production `/devices/` base. `npm test` runs analytic limiting cases, independent rational fixtures, energy-accounting checks, a seeded acoustic comparison, provenance validation, and design-search checks. `build.mjs` copies the application and source records without a bundler. The model files are importable ES modules with no browser requirement. The public `code/` snapshot supports `npm test`; use this repository for the complete website build.

## Research and the role of AI

The review covers selected official OpenAI/Anthropic releases, 2026 AISTATS/ICML publications, current acoustic research, open scientific software, Newton manuscripts, Tesla patents, and selected US/Chinese/Russian records. Exact access dates, reading depths, software hashes when retrieved, and retrieval gaps are recorded in the dossiers. A source listed in the register has not necessarily been fully read or independently replicated; its `readScope` and `status` fields state the boundary.

The new AI research informs **method**: separate candidate generation from evaluation, freeze assumptions, retain failed checks, and test withheld conditions. The website uses classical reduced physical models. It does not claim to implement a frontier AI model, quantum hardware, or the high-fidelity external solvers listed for future work. Historical correspondences motivate questions but supply no measured device performance. A patent establishes a published proposal; government custody establishes provenance. Neither establishes the claimed physical effect.

The two images are generated concept illustrations. Their exact prompts and caveats appear in `research/image-provenance.md`. They are not photographs of working apparatus. No hardware was constructed or driven by this application.

## Deployment isolation

`.github/workflows/device-observatory.yml` tests and builds this folder on pushes to `research/device-observatory`, then updates **only** `gh-pages/devices/`. It shares the `pages` concurrency group with the master coordinator. The master coordinator excludes `/devices/` from its root sync so subsequent master/archive deployments preserve this site. Master application source, archive source, audio assets, and frozen editions are not changed by this branch.

Publication verification should inspect `/devices/deployment.json`, the exact source commit embedded in `src/build-info.mjs`, successful workflow runs, and the live document/assets. A local build alone is not proof of deployment.

## Reuse and limitations

Original application code follows the repository MIT license. Research records paraphrase and link to third-party sources; the source works retain their own terms. No external simulator code is bundled. Software status and conference claims are a dated selection, not an exhaustive “entire SOTA” survey or a novelty/patentability opinion. Device and experiment suggestions are hypotheses with explicit controls and falsifiers, not therapeutic recommendations or claims of free energy or gravity cancellation.

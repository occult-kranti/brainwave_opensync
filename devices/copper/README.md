# Fieldwork: integrated copper experiment

A dedicated multipage workspace for the copper-sphere A/B position experiment, source-controlled Gateway analysis, explicit model limitations and reproducible diagnostics.

- Source branch: `research/copper-experiment-integrated`.
- Route: https://occult-kranti.github.io/brainwave_opensync/devices/copper/
- Version 2.1.0. Research snapshot 22 October 2026 UTC.
- Physical measurements: **zero**. No location law, healing effect, consciousness mechanism, complete-spectrum capture or scientific novelty is established.

## Run and reproduce

Node 22 or newer; Python 3.12+ recommended. The browser has no runtime dependencies. Python packages are optional offline analysis/build dependencies, not code sent to the browser.

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r analysis/requirements.txt -r requirements-build.txt
npm run check
npm run serve
```

Open http://localhost:4178/ . `npm test` runs the JavaScript gates with checked-in independent fixtures. `npm run test:analysis` runs the corrected Python analyzer tests. `scripts/build_documents.py` renders original project reports using pinned Mistune 3.4.0. The optional pyFRF/scikit-fem/pyuff benchmark has separate dependency instructions in `research/tool-integration.md`; those packages are not required for the ordinary website build.

The downloadable `source.zip` contains this app, source pins, LICENSE, fixtures, reports, tools, skill copy and three frozen version snapshots. Extract it outside a Git checkout and run the same commands. `BUILD_ORIGIN.json` retains the original source commit and component hashes even without `.git`; a rebuild also computes the actual current component hashes. The generated `deployment.json` and `build-manifest.json` bind the published artifacts to their source. A source hash proves identity, not physical validity.

## Pages

| Page | Job |
|---|---|
| Overview | State the question, status and useful next action. |
| Models | Shell/solid reference, three radial modes, mode ratios and a declared rank-one point-spring projection. |
| Claude comparison | Matched-input shell/solid checks, imported hollow-sphere spectrum, limitations, exact original page and source records. |
| Design | Finite temporal observability, excitation reachability, nuisance estimability and exact global aliases. |
| Acquisition | Synthetic finite records, FFT/window/alias/noise examples and covariance arithmetic. |
| Protocol | Declared force/velocity channel, corrected analyzer, sidecar, closure fixture and proposed physical controls. |
| Gateway | Detailed available-corpus audit, primary-page mapping, invalid bridges and an explicitly unspecified measured-coupling gate. |
| Sources | Conservatively deduplicated source identities, retained per-version observations and typed evidence-linked graph. |
| Versions | Three frozen earlier snapshots and their known issues, plus current reproducibility and panel records. |

## Important interfaces

- `comparison.html` and `src/claude-comparison.mjs`: checked reference cases alongside the preserved Claude experiment. The browser selects precomputed cases; it does not run the offline full-shell solver.
- `imports/bashar-index-e628974/`: all 22 changed files from `occult-kranti/bashar-index` at e628974ba018c775da41de304bd55afafd16b426, plus its MIT LICENSE, copied byte for byte. `imports/claude-source.json` records every hash and the viewer's two disclosed annotations.
- `scripts/verify_claude.py`: re-executes the free spectrum, compares the shipped JS to matched upstream material/geometry, checks an independently expressed radial-shell equation, and audits a declared real-signal Fisher precision convention. `npm run test:comparison` does not overwrite the full-rerun receipt. See `research/claude-comparison.md` for full upstream reproduction commands.

- `src/models.mjs`: Location 1.1 mechanics copied byte-for-byte from 07e57b4; SI core and explicit physical reductions.
- `src/acquisition.mjs`: original synthetic sampler/FFT/covariance implementation; arbitrary sensor amplitudes and no analog filter or fitted pole estimator.
- `src/modal-diagnostics.mjs`: three radial coordinate masses and full rank-one spring cross-terms; not a real calibrated support, complete mode set or localization engine.
- `src/design-diagnostics.mjs`: declared finite sine-basis model and nuisance design, with ranks, scaling, kernels and limits. Full finite rank is not global or physical uniqueness.
- `analysis/analyze.py`: force-only synchronized trace and matched-mode block analysis with byte-bound metadata. Candidate peaks are not fitted poles. Measured input calibration is not authenticated by a JSON file.
- `scripts/merge_sources.py`: conservative identity/alias merge with per-origin reading-depth and implementation observations. A failed endpoint, unread book lead, patent proposal and numerical test are different evidence categories.

Mobility and receptance are related by `H_vF=iωH_xF` under the declared complex-time convention. A table acceleration PSD is not itself a force-referenced response. Never overlay or rename these channels without the required conversion and matching geometry. The main UI's mechanical, acquisition and data-import states keep synthetic data and unauthenticated measurement input distinct.

## Versions and rights

Snapshots preserve Location 1.0 at f9927a6, Location 1.1 at 07e57b4 and Position 1.0 at a8913c8. Their original file hashes are recorded in `data/versions.json`. The only original-page modification is a recorded archive-navigation banner in each `index.html`; exact original HTML remains as `original-index.html`. Historic bugs/assumptions are deliberately retained and disclosed; their receipts do not validate newer code. The current tools repair selected defects without rewriting history.

The new `gateway-evidence-audit` skill is saved separately in the user's Skills workspace; a review copy is included in this source tree. The pinned Gateway repository contains 10 tracked files. All were read, but source-transcript fidelity, missing media and the inaccessible Kimi deployment are not certified. The original 1977 workbook/transcript and commercial recordings are not republished here. Read the detailed audit for copyright, access and section-reading limits.

Original project code and included earlier project code retain their MIT licenses. External packages retain their own licenses; no third-party numerical package is vendored into the browser. The generated apparatus images are conceptual illustrations, not photographs of built equipment. Their prompts and limitations are retained in `research/image-provenance.md`.

## Panel and publication boundary

Six AI agents apply dedicated skills in three actual sequential critique/revision rounds. Reports identify the incoming evidence, objections, response, executed checks and admission scope. This is not human peer review or participation by historical scientists. See `research/panel/charter.md` and the advisor decisions.

The new workflow publishes only `devices/copper/`, sharing the Pages concurrency lock. The active Device Observatory publisher must preserve `/location/`, `/position/` and `/copper/`. Existing source branches and live pages are preserved. Numerical checks, source review, browser verification, remote source publication, Pages success and live-byte checks are separate gates.

## Independent numerical reconstructions

After installing the pinned Python requirements, run these portable tools from the app directory with fresh output paths:

```sh
python3 scripts/verify_modal_independent.py --output /tmp/copper-modal-review.json
python3 scripts/verify_design_independent.py --output /tmp/copper-design-review.json
```

These reconstruct the finite equations through independent SciPy/NumPy formulations. The original review scripts, results and portability-only adaptations are retained in `research/panel/independent/`. Repeating them reproduces existing computational evidence; it is not a new independent experiment.

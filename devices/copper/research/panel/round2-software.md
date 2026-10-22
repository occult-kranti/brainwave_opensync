# Round 2 — interface/state/provenance cross-critique and revision

Seat 6; actual AI model-agent. 22 October 2026 UTC. Internal computational review, not human peer review. Round 1 findings, elasticity/inverse/Gateway reports and the advisor decision were read before this revision. No original app or core mechanics/acquisition engine was edited by this seat.

## First objection and response

The advisor's shared-schema direction is insufficient if it encourages overlaying Location displacement receptance in m/N with Position H1 velocity mobility in (m/s)/N, or treating table acceleration PSD as an FRF. A matching CSV header cannot make these observables equivalent. I sent this objection before implementation. The new UI keeps the quantities and observation assumptions visible. It links the corrected offline analysis and its independent unit/closure work rather than claiming the browser itself has fitted or validated measured poles.

Elasticity's grounded multimode spring and the dynamic fixture remain separate explicitly named reductions. Inverse design ranks carry the finite three-mode/six-state scope, nullity/kernel, column scaling/tolerance and the explicit absence of noisy finite-time conditioning. The global symmetric-position example is labeled unresolved localization. Gateway remains a historical/source exhibit with a linked full analysis; no audio, physiological intervention or body-to-sphere coupling was implemented.

## Implementation owned by this seat

Created only the assigned current-workspace surfaces under `sphere-lab-repo/copper-experiment`:

- Eight HTML pages: Overview, Models, Design, Acquisition, Protocol, Gateway, Sources and Versions.
- `src/app.mjs`, `src/styles.css`, adapted `src/acquisition-ui.mjs`, original `src/run-export.mjs`.
- Optional external-Playwright `scripts/browser-check.cjs`.

The visual identity preserves the existing Fieldwork paper/green/copper/Georgia palette and typography. Native multipage links, keyboard focus, accessible labels, reduced-motion support, mobile navigation scrolling and bounded scientific SVG plots are used. No generated art or broad frontend dependency was added. Impeccable's unavailable context/craft reference was not invented; the existing source identity and already-read PRODUCT/DESIGN text were used directly. Actual browser layout verification belongs to Round 3 after the integration build.

### Validated state contract

The Models form has explicit Apply. Any field input immediately marks the stored draft dirty and disables exports and the modal action. Failed validation retains the old chart with a visible last-applied/invalid explanation. No retained value is authorized as current. An applied run is immutable and contains the parameters that produced its arrays. A generation token is checked after asynchronous hashing so changed inputs cannot publish an older run as current.

The Acquisition page reads only an applied valid same-build model record, recomputes the intrinsic frequency from its saved parameters and verifies equality before import. Dirty/invalid/different-build records block the bridge. The synthetic bridge records model run ID, parameters, build and the approximation that an undamped intrinsic frequency is being used as a lightly damped oscillation. It does not imply full channel closure or hardware acquisition.

Capture edits immediately disable exports before the bounded debounce. Once valid, synthetic parameters and arrays are copied/frozen. Window, random seed, decay, phase, input/folded frequencies and normalization are retained. Generation guards also reject a changed capture or budget while export hashes are being made.

### Export and provenance contract

`createRun` recursively rejects nonfinite numbers, undefined and non-JSON primitives before cloning; NaN/Infinity cannot silently become null. A canonical-content SHA256 run identity binds kind, status, build/source pins, code hashes, parameters, raw result, units, notes and bridge context. The timestamp is separate from the content-derived identity. The resulting object and nested content are frozen.

JSON downloads retain the run. CSV actions automatically download a valid uncompressed ZIP built by original browser code with no new dependency. Each bundle contains `run.json`, quantity-bearing raw CSV, and `manifest.json` listing SHA256 for each content file. Every CSV row carries the same run ID. Mechanics exports raw sphere and empty-table m/N arrays; acquisition exports the full waveform and coherent-gain-normalized amplitude spectrum in explicitly arbitrary synthetic sensor units. The acquisition uncertainty budget is labeled as supplied/assumed; invalid budgets are recorded as unavailable, never reused silently. Final guards run after package hashing and before download.

### Evidence and preserved versions

The Sources page consumes root's canonical source array and observation records; it does not assign a blanket publication/reading status to a merged work. Recursive source searching includes reading-depth aliases, original IDs, per-version claims and limits. Observation details retain their origin and code/source metadata. The selected-node SVG uses a bounded neighbor view with a complete typed text-list alternative. Evidence links reset filters, open the target observation record and move focus. Project interpretations are shown through their explicit canonical record.

The Versions page renders root's exact three snapshot routes, commits, branches, known issues, current build/source hashes, source pins and actual six-agent/round records. Preservation/build/publisher code and snapshot bytes are root-owned. No claim of live publication or completed Round 3 is added by this interface implementation.

## Executed checks and remaining gate

- Syntax checks passed for `src/app.mjs`, `src/acquisition-ui.mjs`, `src/run-export.mjs` and `scripts/browser-check.cjs`.
- Bounded direct Node contract check passed: NaN, positive infinity, negative infinity and undefined are rejected; a valid run has a 64-hex SHA256 identity, nested freeze and imported source pins.
- Root owns the first integrated build and current test suite. No complete browser or visual result is claimed in this Round 2 report.

The prepared browser gate will exercise all eight direct routes at 1440×1000 and 390×844, model invalid/dirty state across navigation, valid provenance bridge, finite JSON, ZIP sidecar/hash identity, capture rejection/recovery, rank/nuisance controls, searchable reading depth, keyboard network interaction, all three snapshots and the rendered Gateway report. It captures a bounded screenshot batch, then supports one correction/confirmation pass for observed defects.

## Admission position

The architecture resolves the Round 1 state/export defects in implementation without changing the frozen sources. Admission remains conditional on root's integrated build, actual Round 3 browser/output verification, and separate publication verification. Neither synthetic agreement nor these interface changes establishes a physical location effect, complete-object spectrum or new body/material mechanism.

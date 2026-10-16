# Newton–Tesla Laboratory — release verification

Verified on 16 October 2026. These checks validate software behavior and stated mathematical identities. They do not establish device performance, historical influence or health effects.

## Isolated branch integration

- Archive source parent: `0a885871c4a5258b2b3b654ddd034d0759f435bc` on `archive/dark-landscapes`.
- Master source parent: `3842217329f9f93b133eaba9c5672633d8287baf` on `master`.
- Shared modules were integrated into separate worktrees. The archive branch was not merged into master, and each edition retains its existing shell.
- The core engine, audio transport, session provider, safety subsystem, Home page and global stylesheet have no changes in this release.

## Delivered scope

- 15 selected primary-record readings: six Newton records and nine Tesla-related records, including six U.S. patent grants.
- 23 concepts and 34 classified connections: 12 documented, 10 derived, eight analogies and four unsupported bridges.
- Three interactive teaching models: ideal rotating components, passive series RLC and single-interface refraction. CSV exports retain parameters, units and assumptions.
- Six proposed investigations with setup, variables, controls, measurement, falsifier and limits. Physical experiments have not been performed.
- Four original grade-D listening recipes, increasing the preview catalog from 151 to 155.
- A downloadable 8,311-word network dossier with four source/model/preset appendices; UTF-8 file size 63,339 bytes.

The source audit distinguishes a patent claim from a measured result, a reported philosophical discussion from a completed proof, and a mathematical analogy from a physical mechanism. Passage locators and access limitations are retained. This is an expandable selected audit, not an exhaustive review of either author's complete corpus.

## Automated checks

| Edition | Command | Test files | Tests | Result |
| --- | --- | ---: | ---: | --- |
| Archive | `VITE_BASE=/brainwave_opensync/archive/ npm run check` | 109 | 1,436 | Lint, typecheck, tests and production build passed |
| Master | `VITE_BASE=/brainwave_opensync/ npm run check` | 99 | 1,373 | Lint, typecheck, tests and production build passed |

The extension adds 28 mathematical tests, four preset/render tests and six page integration tests. They cover analytical identities, invalid inputs and limits, phase degeneracies, resonance and power accounting, total internal reflection, CSV metadata, spectral channel comparisons, deterministic quiet rendering, graph selection, routing that clears unrelated nodes, silent preset loading and preview gates/cleanup. An independent model review also checked 265 boundary combinations without a blocker.

Production route shells were generated for 36 archive routes and 30 master routes, plus 404 fallbacks.

## Production browser review

Both editions were served with their actual deployment base paths and checked in Chromium at 1440 × 1000 and 390 × 844. All four direct lab URLs returned HTTP 200. All six sections opened, with no JavaScript page errors or horizontal document overflow. Desktop/mobile screenshots and a circuit-bench screenshot were inspected.

The browser review exercised concept-family selection, unsupported-connection filtering, field circle-to-line behavior, selected-parameter CSV download, a change in circuit current, and total internal reflection without an impossible transmitted ray. Each edition served the complete combined dossier. Reading, patent, experiment and preset panels contained six, nine, six and four records respectively.

## Preservation and resource budget

All 151 pre-existing WAV previews were compared against each branch's parent commit and remained byte-identical. Four newly rendered previews bring the total to 155 WAV files and 59,526,820 audio bytes, within the 60 MB preview budget. New research modules, presets, dossier and audio are shared across the editions.

The existing Sound Research Laboratory remains available in both editions. Its 151-preset release count is historical; the current manifest is authoritative.

## Publication verification

Publish archive before master so the existing deployment coordinator builds both source updates. After its workflow finishes, compare the deployed `deployments.json` source SHAs to the published commits, confirm the archive preset count is 155, and check both `/newton-tesla/` routes, dossier downloads and representative new WAV assets. The generated deployment manifest records publication identities without requiring a self-referential commit in this file.

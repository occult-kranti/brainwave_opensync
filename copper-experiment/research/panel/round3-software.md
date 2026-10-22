# Round 3 — actual browser, race, export and standalone-package verification

Seat 6; actual AI model-agent. 22 October 2026 UTC. This is local computational/interface evidence, not human peer review or a physical experiment. All checks below were executed. Physical sphere measurements: zero.

## Verdict

**Pass within the declared local scope.** The first integrated browser pass passed 24 checks. Cross-seat criticism then produced one bounded correction batch. The actual confirmation passed **30/30** checks with **no JavaScript or HTTP errors**. A final plot-only readability repair was followed by **7/7 targeted checks**, rather than repeating unrelated work. A fresh current source ZIP, extracted outside Git, passed **46 Node tests + 24 Python tests + document/site build**. Both actual browser run ZIPs passed independent Python ZIP/CRC/SHA256/CSV inspection.

No remaining frontend or export blocker was found. Exact committed-source stamping, remote workflow success, Pages publication and live byte comparison remain root's separate publication gate. The prepublication artifacts inspected here currently identify checkout HEAD `07e57b446a9f480216ad1aa555088bc361006d9c` while binding the current component hashes; they must not be represented as already stamped with the eventual integrated commit.

## Actual environment and artifacts

- Chromium **153.0.8010.0**, headless, with the externally supplied Playwright runtime.
- Built deployment prefix: `/brainwave_opensync/devices/copper/` served locally by the QA server.
- Desktop **1440×1000** and mobile **390×844**.
- Standalone check: Node v24.19.0; Python 3.12.14; NumPy 2.3.5; SciPy 1.17.0. Build used `PYTHONPATH=/tmp/copper-document-runtime` for the already-installed pinned document renderer. No npm runtime dependency was installed.
- Machine receipt: `integration-panel/software/round3-results.json`.
- Full browser report: `integration-panel/software/evidence/report.json`.
- Targeted final report: `integration-panel/software/evidence/targeted-final-report.json`.
- Independent ZIP receipt: `integration-panel/software/evidence/independent-zip-verification.json`.
- Exact standalone command log: `integration-panel/software/evidence/standalone-source-check.log`.

The main browser script is the committed original `copper-experiment/scripts/browser-check.cjs`. It was actually executed against the integrated build. Final targeted plot/links verification used a separate local Playwright probe; its executed outcomes are preserved in the targeted JSON receipt.

## Browser confirmation: 30 passing checks

All eight pages were opened directly at both viewport sizes: Overview, Models, Design, Acquisition, Protocol, Gateway, Sources and Versions. Each has one h1, a current navigation item, the physical-measurement status, no body overflow and no initialization error. Native mobile navigation scroll is contained within its own row.

The behavior checks actually verified:

1. Mechanical JSON binds finite raw arrays, the exact applied parameters, quantity units, model hash and imported source pins.
2. Mechanical CSV ZIP includes `run.json`, `responses.csv`, `manifest.json`; row values and run IDs agree with the JSON; member hashes match.
3. Dirty/invalid mechanical fields immediately block export, and navigating to Acquisition cannot import the retained prior result.
4. A valid applied model can bridge its explicit intrinsic frequency with model run ID/build/parameters. This is labeled a synthetic lightly damped approximation.
5. Invalid capture input immediately blocks export, recovers on Reset, and exports the full waveform/spectrum with provenance.
6. NaN, positive infinity, negative infinity, undefined and a sparse missing array value are rejected before JSON conversion.
7. An actual delayed `crypto.subtle.digest` was held while an Apply input changed. Releasing the digest did not publish the old run as valid; the store remained dirty and export remained blocked.
8. Changing conditions during actual mechanical ZIP hashing prevented a download.
9. Changing capture input during actual asynchronous JSON hashing prevented a download.
10. Both `Storage.setItem` and `removeItem` were forced to throw after a valid run. The negative control confirmed that the old localStorage record still said valid, yet the per-tab failure marker blocked the bridge after navigation.
11. A stored run missing its 64-hex run identity was rejected without an initialization exception.
12. Center/center, extra sensor and extra drive/sensor presets produced the intended 4/6→6/6 observability/reachability distinctions. Locked temperature remained confounded; independent variation restored estimability only in the finite declared family. The global symmetric alias remained unresolved.
13. The canonical register rendered all works, searching actual `readingDepth` text found its record, and keyboard activation inspected network nodes.
14. All three source-pinned snapshot routes returned HTTP200 with archive context. The full rendered Gateway analysis also returned HTTP200.

This gate checks synthetic state and interface behavior. It does not establish calibration, estimator uncertainty, physical mode identity or global localization.

## Cross-seat corrections and targeted final checks

Seat 3 identified the storage-failure edge case and missing run-ID guard. The current bridge now blocks same-tab transfer after a failed save even if a previous valid record cannot be deleted, and accepts only a properly formed saved identity from the same current model build.

Seats 4 and 5 identified quantity/source-label ambiguities. The current mechanics export explicitly names **magnitudes in m/N**, with **no phase exported**; the headers use `_magnitude_m_per_N`. The Protocol commands now require `--metadata`, show preparation of `measurement-input-unverified` sidecars, and explain that browser arbitrary-unit waveforms and mechanical magnitudes are different schemas from force/velocity analysis input. The model omission statement now specifies finite-area/nonlinear contact and real fixture calibration beyond the prescribed spring. Source cards for unread books visibly say that their link opens a report's attribution locator, not the book. Typed relationships display type, label, scope, original origin and evaluation notes with their evidence pointers.

Visual inspection of the actual mobile response screenshot found that my original fixed 800-unit Models SVG made the axis text too small. The final repair uses the rendered chart width, fewer mobile frequency ticks and a width observer. Actual final measurements were:

| Viewport | SVG viewBox width | Rendered width | All axis-text screen sizes |
|---|---:|---:|---:|
| 1440×1000 | 978 | 978 px | 10 px |
| 390×844 | 324 | 324 px | 10 px |

The final seven checks cover both responsive plots, actual visible graph type/scope/origin, the unread-book attribution warning, and successful HTTP access to `documents/gateway-analysis.html`, `data/corpus-gateway.json` and `skills/gateway-evidence-audit/SKILL.md`. No JavaScript or HTTP errors occurred. A separate local link-resolution check found all eight local Gateway-report links present.

## Independent run-ZIP verification

Actual saved browser downloads:

| Archive | SHA256 | Contents |
|---|---|---|
| `/tmp/copper-browser-qa/mechanics-run.zip` | `2e0c933513e76444f03283f43119aad819feeaeae42b1607d3b0879b24b45a82` | run JSON, magnitude-response CSV, manifest |
| `/tmp/copper-browser-qa/acquisition-run.zip` | `b5ec7138cdedaa7f6a9d3815625d9d3bd5a0059e27f44195131c62e8d64a8f12` | run JSON, spectrum CSV, waveform CSV, manifest |

Python standard-library `zipfile.testzip`, `hashlib.sha256` and `csv.reader` independently extracted the actual bytes, checked CRC, checked every manifest member hash, and checked every CSV row's run identity. This is distinct from the browser's original ZIP writer and the QA script's JavaScript stored-ZIP reader.

The independent measurement seat additionally checked the same two exact archive hashes, every numerical CSV value against its JSON array, source pins and acquisition seed42. Its verdict is **PASS for the declared synthetic units/status/schema boundary**. It executed analyzer rejection of both browser sidecars as unsupported schemas; even a typed force-trace sidecar could not make the missing force/velocity channels valid. That separate receipt is `integration-panel/measurement/round3-browser-exports.json`.

## Fresh standalone source archive

The final code package was extracted to `/tmp/copper-published-code-check-h602f2sw/copper-experiment`, outside any Git repository. Before execution, the four current UI/export files were hash-compared against the source ZIP: `src/app.mjs`, `src/run-export.mjs`, `src/acquisition-ui.mjs`, `src/styles.css`; all matched exactly, including the final responsive plot repair.

Executed command:

```sh
PYTHONPATH=/tmp/copper-document-runtime npm run check
```

Result: **exit0; 46/46 Node tests; 24/24 Python tests; 13 documents rendered; site build succeeded.** The standalone build used `embedded-source-origin`, retained the exact source commit and all four imported pins, and reported that current component hashes matched the embedded origin. The no-Git archive therefore no longer depends on a checkout's undeclared research directory or loses its source origin.

The numerical tests here are repeated package-admission gates, not new independent scientific implementations or extra research rounds. The independent scientific reconstructions and source reading remain the other seats' separately scoped work.

## Visual review and screenshot paths

I inspected the actual desktop Overview/Sources/Design and mobile Versions/Design/Models/Acquisition/Network views, plus the corrected mobile Models response. No additional layout correction was needed after the axis repair. Selected retained images:

- `integration-panel/software/evidence/index-1440.png`
- `integration-panel/software/evidence/responsive-model-390.png`
- `integration-panel/software/evidence/capture-spectrum-390.png`
- `integration-panel/software/evidence/design-rank-1440.png`
- `integration-panel/software/evidence/attribution-locator-390.png`

All route screenshots and eight detailed tool screenshots remain under `/tmp/copper-browser-qa/`; their exact 24 paths are listed in the main browser report. The targeted receipt adds corrected desktop/mobile Models screenshots and the attribution-card screenshot. Original pre-repair model-detail images are historical observations, not final appearance.

## Admission limits

This is Chromium desktop/mobile coverage, not a cross-engine or screen-reader certification. The forced-storage protection was tested for same-tab navigation; storage is not an authenticity mechanism for data provenance. The offline analyzer's declared force/velocity channel remains distinct from the browser's synthetic export schemas. No hardware was acquired, no physical pole fit was performed, no full spectrum or unique physical position was established, and no historical/biological interpretation was validated by a browser check.

After root copies the final reports and panel status, an informational rebuild is appropriate. Root must then stamp the actual integrated commit and independently verify the final source publication, Pages job, deployment manifest and live content. No further frontend edits or optional polishing are proposed.

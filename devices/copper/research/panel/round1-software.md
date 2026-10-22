# Round 1 — software, computational reproducibility and interface state

Panel seat: 6. Prepared by an actual computational software/interface model-agent on 22 October 2026 UTC. This is an internal AI-agent review, not human peer review. No application source was edited. This round reviews implementation and evidence packaging; it does not re-validate external papers or a physical apparatus.

## Decision

Use the two preserved subapps as source-pinned references and bring their useful tools into a separate multipage workspace. Both local repository checks pass. The strongest integration need is a shared scientific run/provenance contract, rather than a new numerical engine. Preserve Position's offline H1/coherence/ABBA analysis and Location's shell, passive coupled-mode, empty-table, synthetic-acquisition and covariance tools. Do not merge their distinctly scoped toy support models into a single purported apparatus prediction.

Fix three concrete problems in the new workspace: a broken standalone source-test package, stale results crossing an invalid-input boundary, and exports that lose the information needed to reproduce their values. Keep numerical verification distinct from historical source review, browser behavior and publication.

## Frozen inventories and executed evidence

| Item | Location Spectrum | Position Spectroscopy |
|---|---|---|
| Reviewed source | `07e57b446a9f480216ad1aa555088bc361006d9c` | `a8913c825d24299283c9379282ae3876e2a0c0cd` |
| App path | `sphere-lab-repo/location-spectrum` | `position-review/device-observatory/position` |
| Declared version | 1.1.0 | 1.0.0 |
| Research date | 2026-10-22 | 2026-10-21; later verification receipt is dated 2026-10-22 |
| Runtime | Browser ES modules; no npm runtime dependencies | Browser ES modules; no npm runtime dependencies |
| Numerical implementation | Free radial solid mode; membrane shell; passive 2-DOF contact coupling; empty-table point response; thermal and clock examples; bounded sampled signals/FFT; covariance | Three free radial solid modes; normalized residue-switching example; illustrative independent added springs; sampling budget; independent-input material uncertainty |
| Sources/network | 80 source records; 82 nodes; 84 edges | 28 source records; 10 topics; 38 edges |
| Offline tools | SciPy fixtures; NumPy acquisition/covariance reference; optional pyFRF/scikit-fem/pyuff benchmark | Pinned NumPy/SciPy CLI for H1, coherence, table PSD and balanced matched-mode contrasts |
| This round's source gate | `npm run check`: 28 Node tests pass; build passes | `npm run check`: 6 Node tests + 11 Python tests pass; build passes |
| Additional replay | Current Node gate replays 127 mechanical comparisons and 15,395 acquisition/covariance comparisons against checked-in fixtures | `verify_physics.py --check`: 29 material/geometry cases, 6 check groups, maximum relative difference 3.1824e-14. Fresh `independent_checks.py`: 8 controls; byte-identical to recorded result |
| Fresh output-package test | **Fails:** copied `dist/code/` has 27 passing tests and one ENOENT failure | No additional extracted-archive test in this round; the existing receipt claims such a test and the build includes a deterministic ZIP |

Environment actually used: Node v24.19.0, Python with NumPy 2.3.5 and SciPy 1.17.0. A targeted headless Chromium 153.0.8010.0 probe ran against both freshly built local sites. It produced no page errors and confirmed the stale-input findings below. This was a targeted state/export probe, not a new full visual regression pass. Existing committed desktop/mobile reports remain historical evidence, not this agent's newly executed visual review.

## Concrete findings

### SW-01 — shipped Location code package cannot run its declared test command

**Priority: high for the new reproduction bundle.** Location `build.mjs:14` copies `src`, `tests` and `reference` into `dist/code`, and creates a package declaring `npm test`. `tests/acquisition-independent.test.mjs:40` writes `../research/acquisition-review-results.json`, but the code package contains no `research` directory. A fresh copy to `/tmp/location-code-audit-vlKeHI` fails exactly this test with ENOENT; the other 27 pass. The ordinary repository gate passes because its research directory exists.

New-workspace acceptance: extract the downloadable source bundle into a directory without Git metadata and execute its advertised instructions. Tests should use temporary output or create a specified receipt directory; they should not require an undeclared directory or mutate frozen review receipts. Include source origin, license, dependency pins, reference fixtures and reproduction instructions in the bundle.

### SW-02 — invalid mechanical inputs do not block the acquisition bridge

**Priority: high for scientific state integrity.** Location's `update()` preserves the last valid result after an invalid input and disables the mechanical exports (`src/app.mjs:29`). However, initialization passes `getSphereFrequency:()=>result?.intrinsicHzA` (`src/app.mjs:48`), and the acquisition bridge only checks whether that retained frequency is positive (`src/acquisition-ui.mjs:71`).

Chromium reproduction: set `radiusMm=0`; the input error is visible and mechanical JSON is disabled. Open Capture and click Use current sphere mode. The interface reports “Current sphere mode,” copies 23317.724125641158 Hz from the old valid run, and shows a success toast. This is an actual stale-state transfer, despite the invalid current conditions.

Position uses an explicit Calculate form, so unapplied changes can legitimately leave the last calculated view intact. But after an invalid radius submission, Export model remains enabled, no inline model error appears, and the JSON contains the earlier 12.5 mm radius (`src/app.mjs:7–8`). A new shared interface should either block derived actions while displayed inputs are invalid/dirty, or visibly identify the last applied run before export or transfer. All derived tools should consume one immutable validated run object.

### SW-03 — CSV and Position JSON exports lose important provenance

**Priority: medium; required for the combined run contract.** Location mechanical CSV has quantity-bearing column names in Hz and m/N, but no simulation status, geometry, parameters, commit or run identifier (`src/app.mjs:35`). Acquisition CSV has only `frequency_Hz,synthetic_amplitude`: no sample rate, duration, window, coherent-gain normalization, seed, input components, arbitrary amplitude-unit description, model commit or uncertainty settings (`src/acquisition-ui.mjs:73`). Matching JSON exports contain most of this information, but the CSV does not point to a mandatory matching sidecar.

Position's browser JSON records parameters, selected-family outputs and synthetic comparison, but no exact source commit, code hash, application/model version, creation time or sampling-plan settings (`src/app.mjs:8`). Its source ZIP contains no origin/deployment/build manifest; a standalone rebuild falls back to `unversioned-source-bundle` (`build.mjs`). It can therefore reproduce the calculation while losing the exact source origin unless a user separately retains the deployed manifest.

New-workspace acceptance: a run download contains `run.json` plus raw numerical CSV files, with a shared run ID and hashes. The JSON declares quantity/unit, synthetic-versus-input status, parameters, time convention, FFT/window normalization, seed, uncertainty convention, source revisions and code hashes. Give simple CSV users a sidecar automatically; avoid silently injecting non-CSV comment syntax. Preserve exact frozen origin metadata inside source archives independently of Git availability.

### SW-04 — six graph evidence pointers do not resolve

**Priority: medium.** Every Location edge has a `sourceId`, but six resolve to `project-design`, which is absent from the 80-record source ledger. The six edges are measurement→location, uncertainty→location, Bashar→location, breathing-model→location, coupling-model→location, and sphericity→signature. Build validation checks edge endpoints and relations, but does not check evidence `sourceId` (`build.mjs:25–29`). These are reasonable project-authored interpretations; they need an explicit project interpretation record, not a source-looking unresolved evidence pointer.

Position's graph test is stronger here: every edge's `evidence` must resolve to an actual source record. Use the stronger gate for the combined graph. Accept project interpretations as their own documented evidence class and display their authoring/source-version provenance.

### SW-05 — source search omits much of the displayed reading-depth evidence

**Priority: low; fix during normalization, not a separate redesign.** Location `sourceText()` includes `readingDepth` but omits `readDepth`; 54 of 80 records have only the latter. The list displays those fields correctly, but searching text unique to those reading-depth descriptions cannot find them. Normalize reading-depth/limit/status fields once when importing, then index the normalized text. This also prevents schema aliases leaking into display logic.

### SW-06 — version provenance exists in files but lacks a shared visible contract

**Priority: medium for integration.** Location embeds exact commit/model/acquisition hashes in generated BUILD_INFO and JSON exports. Position emits exact source commit and full file hashes in deployment/build manifests. Neither UI renders an exact source-version header, and the new workspace will contain material from both dates. Historic numerical reviews already coexist with newer model hashes; their original dates and hashes must remain visible instead of being relabeled as a single current approval.

Use concise current-page status: “Simulations and analysis tools · no physical sphere measurements. Integrated workspace [version / commit].” On the versions/reproduction page explain: “Location 1.1.0 at 07e57b4 and Position 1.0.0 at a8913c8 are preserved research snapshots. Each snapshot's assumptions and review receipts apply to that snapshot's code.” Never present an internal AI-agent report as external human peer review.

## Numerical independence and output meaning

The checks are substantially better than self-comparing a solver to its own outputs. Location's mechanical fixtures use spherical-Bessel/Brent roots, a radial thick-shell determinant, generalized symmetric eigenvalues and complex matrix solves. Its passive harmonic budget checks input power against dissipation. Acquisition fixtures use NumPy FFT and separate covariance expressions, with explicit alias and kernel examples. The modal-mass midpoint check in `compare_producer.mjs` still calls the producer's Bessel helper: that particular check is a distinct integration formula, not fully independent special-function code. The later near-boundary Decimal/quadrature checks are recorded separately in the expansion materials.

Position's current physics replay compares the actual JavaScript model against SciPy spherical-Bessel/Brent solutions and a separate implicit derivative. Its independent counterexample script imports no producer code; however, that script proves mathematical controls on its own toy systems rather than verifying every implementation branch. The initial blind/frozen review is supported by stored hashes; the historical statement that it was blind is provenance reported by that earlier agent, not independently reconstructible proof of a workflow from code alone.

Both apps correctly distinguish cyclic Hz from characteristic roots, selected radial families from a complete spectrum, response maxima from natural frequencies, synthetic data from measurements, and bin spacing from fitted-frequency uncertainty. Location raw mechanics arrays have m/N units; its display uses a shared maximum and says so in JSON. Position's toy response uses dB relative to a fixed normalized modal-response unit, not calibrated mobility. Position's offline H1 is velocity/force in (m/s)/N, and table acceleration PSD is (m/s²)²/Hz. Do not silently compare these differently defined arrays or relabel normalized plots as calibrated measurements.

The offline CLI already rejects missing/nonfinite columns, nonuniform sampling beyond its tolerance, nonincreasing times, Nyquist-reaching bands, constant force, too few Welch segments, invalid block sequences/timing, imbalance and existing output files. It records input SHA256 and NumPy/SciPy versions, and marks real input provenance unverified. Retain this behavior. A metadata sidecar should add calibration/channel quantities and analysis-code identity; the existing CLI cannot establish calibration, anti-alias performance, same-mode identity or independence from CSV values alone.

## Source merge and hardcoded claims

There are 108 raw source records across the two registers, with at least eight directly shared primary URLs after conservative URL normalization: copper reference, Lamb sphere paper, Saviot calculator, RUS loading paper, pyFRF, SciPy CSD, pinned OpenAI elasticity manuscript and OpenAI release. A combined list must not advertise 108 distinct works or experiments.

Canonicalize bibliographic identity by DOI where supplied, otherwise conservative URL identity; use repository plus release/commit/package hash for software. Lowercase host and DOI, not case-sensitive URL paths. Retain both imported IDs as aliases and retain per-snapshot observations: reading depth, access result, source assessment, implementation status and date. A newer “executed” software record must not erase an older “documentation only” assessment. Different manuscript versions, patent families and software releases must remain separate where their identity or claim scope differs.

Derive source/node/edge/preset counts from the built data and distinguish unique works, observations and graph nodes. Location deployment currently hardcodes preset/image counts; its existing browser script hardcodes version-appropriate counts. These are acceptable frozen-release assertions, but should not be copied as universal current values. Position's default-band wording is now explicitly limited to the default specimen, so the previously reported unconditional claim is not an open bug at a8913c8.

## Proposed bounded multipage architecture

| Page | One main job | Reuse |
|---|---|---|
| Overview | State the question, measurement status and next useful action | Short shared scientific contract |
| Model comparison | Compare shell/solid and explicitly scoped support/readout effects | Location mechanics; Position radial-family comparison as a separately labeled model |
| Synthetic acquisition | Explore finite record, FFT/window/alias behavior and a declared uncertainty budget | Location acquisition and covariance code |
| Protocol and data analysis | Select calibrated channels; download schema/demo/CLI; interpret matched-mode contrasts | Position analysis/protocol plus Location control diagrams |
| Sources and network | Search canonical works and inspect typed, evidence-linked relationships | Both registers; aliases and per-version observations preserved |
| Reproduce and versions | Download source/run packages; inspect commits, hashes, commands and frozen versions | Both existing verification records and exact source pins |

Keep the existing `/devices/location/` and `/devices/position/` versions live and unchanged. A new `/devices/copper/` workspace can link to them and preserve immutable build/source snapshots under commit-named routes if required. Preserve MIT/license records and distinguish source commits from deployment commits. Freeze snapshots as data; never execute their historical publisher workflows during the new build. Keep relative assets and direct HTTP deep links; the parent audio app/service worker must not capture imported lab routes.

The frozen publisher files have a historical ownership defect: at a8913c8 the parent Device Observatory rsync excludes neither child; at 07e57b4 it excludes only `/location/`. **This is not the latest parent state.** I independently read current parent `b4586102eb4a7cbe7eb02542d7adaa39c1060d9d`: it preserves both `/location/` and `/position/`. Root plans an additional `/copper/` exclusion and navigation link on that current parent. Preserve the shared Pages lock and test actual rsync behavior; the lock prevents concurrent writes but does not itself protect child ownership. Local tests/builds do not prove remote Actions success or live byte matching, which remain separate publication gates.

## Small set of integration acceptance gates

1. Current app: all mandatory model/analysis checks pass; independently replay the material, passive response, FFT/covariance and analytical transfer/contrast fixtures relevant to changed code. Do not count repeated adapter runs as new independent implementations.
2. Build: all internal references and evidence pointers resolve; canonical-source aliases are total; exact source revisions/licenses/model hashes are emitted; derived counts match actual arrays.
3. Downloads: extract a source archive without `.git`, run advertised commands, and preserve origin metadata. Export one mechanics run and one acquisition run; verify every raw CSV corresponds to its sidecar and parameters.
4. State and routes: one desktop/mobile browser batch verifies invalid/dirty-state behavior, blocked stale transfer, finite exports, direct links to every page, keyboard-accessible navigation/network, and no failed local asset requests. One correction/confirmation batch is sufficient for observed defects.
5. Preservation/publication: byte/hash-check frozen snapshots; run an rsync fixture preserving all three independently owned subtrees; after publication verify exact workflow commit, emitted deployment manifest and live bytes separately.

## Round 2 questions for the other seats

- Physics: retain two distinct support toys, or admit a single chosen reduced model with explicit effective-mass/observation assumptions? Do not unify by appearance alone.
- Experimental design: which calibration and same-mode metadata should be mandatory before the offline CLI accepts a record as measurement input, while keeping its provenance explicitly unverified?
- Source/evidence: confirm canonical aliases for the eight obvious overlaps and provide the explicit project-design interpretation record. Do not discard different reading depths during deduplication.
- Interface: apply the shared validated/applied run contract; avoid a standalone redesign effort beyond the six bounded jobs above.

Ready for Round 2 cross-critique. No implementation ownership accepted and no app files changed in Round 1.

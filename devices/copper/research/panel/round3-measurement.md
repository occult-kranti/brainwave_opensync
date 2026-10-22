# Measurement / DSP seat — Round 3 actual integration review

Status: complete, 22 October 2026. This is an internal model-agent cross-review, not a human specialist consultation or external peer review. No hardware or copper measurements. Reviewed actual files under `sphere-lab-repo/copper-experiment`, including built `dist/` and actual Chromium-generated bundles, instead of repeating the Round 2 proposal.

## Cross-review and decisions

Read the implemented modal/design diagnostic source contracts, integrated protocol/thesis/comparison, browser export implementation, acquisition bridge and analyzer package. The current boundary is appropriate: mechanics exports synthetic displacement/force response magnitudes in m/N; acquisition exports a separately prescribed damped signal and coherent-gain amplitude spectrum in arbitrary sensor units; offline H1 expects actual force/velocity channels in N and m/s. No automatic equivalence between these channels is implemented or justified.

The new three-mode contact module uses derived surface-displacement modal masses and the rank-one `k·11ᵀ` stiffness projection. This is a stronger finite physical-coordinate model than three independent total-mass springs, but the value of k is prescribed, not measured preload or a calibrated contact law. Its grounded boundary is a different apparatus from the moving dynamic fixture. Rigid/nonradial motion, realistic contact, seams, anisotropy and loading remain omissions. Free ratios cancel common scale at fixed ν; loaded ratios need not cancel when fixed k breaks that scaling. Shared-denominator uncertainty and mode matching remain obligations.

The design laboratory states temporal observability and controllability for a known dimensionless six-state sine basis, includes scaling/tolerance/kernel and distinguishes finite structural rank from noisy finite-time conditioning. The nuisance example identifies an exact locked-temperature kernel. None of these computations authenticates a physical sensor placement, experimental mode estimator or causal position coefficient. The global symmetric alias remains explicitly unresolved.

The acquisition bridge transfers only a valid applied intrinsic undamped model frequency, records the originating run/build/parameters, and labels its use as a lightly damped-oscillation approximation with independently chosen amplitude and decay. It is not a transient solution of the full sphere/fixture model. The covariance budget is supplied arithmetic, not an uncertainty estimate learned from the synthetic waveform. No validated pole fitter is present, and no physical fitted-mode claim should be inferred from the input labels.

## Actual findings sent to owners

1. **Protocol CLI omission — fixed by owner and verified in source.** The initial `protocol.html` examples omitted mandatory `--metadata` arguments, so both copied analysis commands would fail. The old “omit --synthetic for real input” guidance also missed the now-required conservative run contract. The page now supplies explicit trace/block sidecar arguments and the metadata command for `measurement-input-unverified` records.
2. **Mechanics CSV quantity naming — fixed by owner and verified in source.** Initial headers such as `sphere_A_m_per_N` contain magnitudes only, not signed displacement or a complex FRF. They now say `*_magnitude_m_per_N`; matching run-unit wording explicitly says no phase is exported. The plot declares a common relative normalization while stored arrays retain absolute model magnitudes. No silent numeric unit conversion was found.
3. **Browser / analyzer schema boundary — fixed by owner and verified in source.** Browser sidecars use `fieldwork-copper-run/1`; the force-only analyzer requires `copper-run-contract/1`. The Protocol page now explains that neither browser export is an admitted force/velocity trace and says not to rename columns to imply calibrated hardware channels. This is an intentional boundary, not an unfinished automatic converter.
4. **Contact scope wording — fixed by owner and verified in source.** The solid diagnostic includes a prescribed spring while its short scope sentence said contact effects are omitted. It now names finite-area/nonlinear contact and actual fixture calibration as omissions, preserving the distinction between a prescribed spring and a calibrated apparatus.
5. **Natural versus estimated ratios — elasticity cross-critique accepted and protocol corrected.** Readout weighting alone cannot change natural eigenfrequency ratios. It can change visibility/peak selection or bias estimated ratios. `research/protocol-integrated.md` now distinguishes those cases from true ratio changes due to contact, Poisson ratio or anisotropy. No mechanics module changed.

These are concrete interface/interoperability findings. The mechanics equations and analyzer source were not changed by this seat in Round 3. The protocol clarification should be included in the parent's next generated-document build. No new parser attack was invented just to rerun unchanged tests: the remaining risk inspected was whether the actual package/export boundary preserved the Round 2 admission contract.

## Executed package interoperability check

Extracted the actual first-build `dist/source.zip` into a clean temporary directory. Confirmed the package includes analyzer, imported MIT license, source-provenance register, blank run-contract template, and actual passive closure CSV/sidecar. Ran the **packaged** analyzer on the **packaged** CSV and sidecar using a new output path. The command passed; raw hash, analyzer hash and both source pins matched. The result remained `synthetic`, calibration status remained `not authenticated by this software`, and peak status remained **CANDIDATES: response-bin maxima, no pole fitting or mode identification implemented**.

Exact receipt: `round3-source-package.json`. The reviewed source ZIP SHA-256 was `81c04390df2b3368aa0a7417e4060108963661c5930b376bae34c87bc6f66427`; packaged analyzer SHA-256 was `c6d6acb89ca0bd34724bbf76467f53e8aa1adeee8e3e6dde6b55adc9cc7e188b`. Later rebuilds may change the ZIP as reports/UI are added; this receipt identifies the bytes actually inspected. The unchanged 24-case suite was not rerun by this seat.

## Physical admission limitations

Passing a CSV/schema/hash gate means only that declared bytes, quantities and code are consistent. Calibration references may remain unknown; the tool cannot authenticate a user's physical declarations or distinguish real and simulated signals from waveform appearance. The current result is therefore never automatically admitted as a calibrated causal location test.

A physical result still needs independently characterized force and receiver transfer functions, supported analog bandwidth/anti-alias attenuation, channel phase/timebase, excitation noise floor, clipping/linearity/stationarity, fixture/preload/temperature/orientation records and valid common-mode estimates. H1 requires its input-noise assumption; coherence cannot validate units or reject shared pickup. Table acceleration PSD is not a table FRF. A short free decay is not automatically a stationary Welch record. Matching mobility to receptance needs the complex `iω` conversion for the same ports; inverse conversion is undefined at DC.

ABBA retains its equal-time linear-drift cancellation and Student-t assumptions but cannot separate a position-locked nuisance. Systematic covariance and externally validated per-run mode fits are not supplied by the block interval. Phase reversal preserves higher odd-order response and potentially reversing electrical pickup, so amplitude and independent-readout/dummy controls remain necessary. No frequency ratio, finite rank, fitted synthetic example or archival audio analogy supplies the missing copper/location coupling.

## Browser-export inspection

Software seat supplied actual Chromium downloads from the correction build: `/tmp/copper-browser-qa/mechanics-run.zip` and `/tmp/copper-browser-qa/acquisition-run.zip`. This seat independently inspected those exact files using Python `zipfile`/CSV/JSON and the actual analyzer API. It did not drive the browser or claim independent visual/hardware verification.

| Actual export | Checked contents and admission outcome |
|---|---|
| Mechanics | ZIP SHA-256 `2e0c933513e76444f03283f43119aad819feeaeae42b1607d3b0879b24b45a82`; 1,097 response rows. All quantity-bearing magnitude headers, run IDs, frequency values and four response arrays match `run.json` exactly. Units explicitly state magnitude m/N and no exported phase. |
| Acquisition | ZIP SHA-256 `b5ec7138cdedaa7f6a9d3815625d9d3bd5a0059e27f44195131c62e8d64a8f12`; 8,192 waveform samples and 4,097 one-sided spectral rows. Every time/frequency/amplitude value and row run ID matches the JSON arrays. Seed is 42 in both run parameters and normalized acquisition parameters. Units are arbitrary sensor units; coherent-gain amplitude is explicitly not PSD. |

Both ZIPs pass CRC inspection and all manifest content SHA-256 checks. Both retain `synthetic-model; no physical measurements`, `physicalMeasurements:0`, current component hashes and the expected Location/Position source pins. No normalization or unit conversion was applied by this inspection. Full machine receipt: `round3-browser-exports.json`.

Concrete rejecting checks: the analyzer rejects either browser `run.json` with `Unsupported metadata schema`. Even preparing a hash-bound force-trace contract for the unchanged browser CSV does not bypass channel admission: Mechanics lacks time/force/velocity/table-acceleration columns; Acquisition lacks force/velocity/table-acceleration columns. These are intended rejections. No code automatically upgrades arbitrary samples or receptance magnitudes into calibrated channels.

## Admission decision

Accept the integrated measurement/export surfaces as a bounded synthetic laboratory and conservative local analysis tool, with the final protocol wording included in the next parent build. The actual exported quantities/status/provenance agree with their declared contracts, and the four observed UI issues are corrected. Preserve all physical admission limitations above. No calibrated specimen result, fitted physical pole, identified position law, or body-to-copper mechanism is admitted.

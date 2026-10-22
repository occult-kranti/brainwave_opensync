# Local response analysis and run contracts

Derived from the MIT-licensed Position Spectroscopy analysis at commit `a8913c825d24299283c9379282ae3876e2a0c0cd`. Original file hashes, source paths and the Location mechanics pin are in [SOURCE_PROVENANCE.json](SOURCE_PROVENANCE.json); the copied notice is [LICENSE](LICENSE). Changes harden CSV admission, require explicit quantity/unit metadata, bind inputs and code by SHA-256, and add a passive-mechanics interoperability fixture. Dependencies remain NumPy 2.3.5 and SciPy 1.17.0; Python 3.12.14 was used for checks.

These tools operate on local files. They do not acquire hardware, authenticate calibration, fit poles, identify a material/location, or establish causation. Trace peaks remain **CANDIDATES**. Raw data are labeled `synthetic` or `measurement-input-unverified`; no result is automatically called calibrated or measured.

## Reproduce the bundled synthetic examples

Run from the `analysis` directory after installing `requirements.txt` in an isolated Python environment. All output paths/directories must be fresh. Existing output files are rejected and are opened exclusively to prevent overwriting a prior result.

```sh
python make_demo.py --output /tmp/copper-demo-new
python analyze.py trace /tmp/copper-demo-new/synthetic-trace.csv --metadata /tmp/copper-demo-new/synthetic-trace.metadata.json --f-min 100 --f-max 3000 --nperseg 512 --output /tmp/copper-demo-new/trace-analysis.json
python analyze.py blocks /tmp/copper-demo-new/synthetic-blocks.csv --metadata /tmp/copper-demo-new/synthetic-blocks.metadata.json --output /tmp/copper-demo-new/block-analysis.json
python closure_fixture.py --output /tmp/copper-closure-new
python ../tests/analysis_test.py
```

The original trace demo is a bilinear-discretized 700 Hz toy support oscillator with receiver noise, not a copper bulk-mode prediction. Bilinear warping changes its digital peak. The new `closure_fixture.py` instead synthesizes a steady periodic multisine using an independent analytical passive mass–spring–damper impedance in the frequency domain. It tests complex H1 against `H_vF=iωH_xF` on 28 driven lines. It includes a periodic mechanical source-power/dissipation check. It is noiseless synthetic closure, not estimator uncertainty, hardware validation or a pole fit. Table acceleration is explicitly zero as a placeholder. Executed records are in `fixtures/passive-closure/`.

## Admit a new input with its sidecar

```sh
python analyze.py metadata my-trace.csv --record-type trace --data-kind measurement-input-unverified --output my-trace.metadata.json
python analyze.py trace my-trace.csv --metadata my-trace.metadata.json --f-min 100 --f-max 3000 --nperseg 1024 --output my-trace.analysis.json
```

Choose `--record-type blocks` for matched-mode block records. Choose `--data-kind synthetic` for simulated records; do not relabel them as measurements. The optional analysis flag `--synthetic` only checks that the sidecar already says synthetic. It cannot change the sidecar kind.

The metadata command prepares declarations, not a certificate. Review specimen/fixture/run identity, calibration references, actual analog passband/filter, channel timing, and independently varied nuisance conditions in the sidecar. They default to unknown. `run-contract-template.json` is a blank illustrative trace contract; its null raw hash is deliberately inadmissible. Use the command to bind actual bytes. Any analyzer change invalidates the old analyzer hash: review the new code and prepare a new sidecar and new result rather than silently updating a prior record.

The analyzer requires matching schema, record type, raw-byte hash, analyzer code hash, both imported source commit pins and exact quantity/unit pairs. The output preserves the sidecar and its hash, input hash, code hash, source registry hash, dependency versions and a fixed statement that calibration is not authenticated. Hashes bind declared records and software; they cannot authenticate who generated the physical signal or validate a user's claims. A missing sidecar cannot silently turn a simulation into measured data.

## Force-only stationary trace contract

| CSV column | Quantity | Unit |
|---|---|---|
| `time_s` | Common uniformly sampled time | s |
| `force_N` | Actual force component at declared input port | N |
| `sphere_velocity_m_s` | Observed surface velocity component | m/s |
| `table_acceleration_m_s2` | Table reference acceleration component | m/s² |

Voltage records are rejected. No voltage-to-force conversion is implemented. A monitored piezo voltage cannot be renamed `force_N`; a velocity/voltage transfer is `(m/s)/V`, not mechanical mobility. Displacement or acceleration records also cannot be renamed velocity. Match input/output points and directions before comparing mechanical models.

H1 uses SciPy's `csd(force,velocity)=conj(F)V`: `H1=S_Fv/S_FF`, units `(m/s)/N`. With `exp(+iωt)`, mobility equals `iω` times the corresponding receptance in m/N; conversion back is undefined at DC. The table PSD in `(m/s²)²/Hz` is not a table FRF. Preserve raw synchronized channels if that FRF is needed.

Welch uses periodic Hann windows, 50% overlap, mean detrending and density scaling. At least three overlapping segments are required; those segments are not independent experimental replicates. Bin spacing is `fs/nperseg`, ENBW is 1.5 times that spacing, and neither is a frequency-fit uncertainty. A short free decay requires separate justified transient treatment; this pipeline assumes approximately stationary records. It does not fit modal frequencies or match modes.

`usable_excitation` passes a relative numerical division guard, not a measured drive-noise/SNR gate. Candidate bins additionally pass a coherence screen of 0.8, which is not a metrology acceptance criterion or proof of causality. Force-channel noise must be negligible for this H1 interpretation. High coherence can survive incorrect force scaling or shared pickup. Analog bandwidth, out-of-band filtering, calibration, phase alignment, saturation, sensor loading and linearity require independent apparatus evidence. Numeric Nyquist checks cannot detect previously aliased data.

CSV headers are stripped once; blank names and duplicate names after whitespace/case normalization are rejected before any row can overwrite a channel. Rows must have exactly the header's field count. Missing required columns, malformed quoting, nonfinite numbers, irregular timing, zero force variance, Nyquist-reaching bands and insufficient segments are rejected. Extra named non-voltage columns are ignored; their presence does not establish calibration.

## Matched-mode block contract

Required columns are `block,order,position,time_s,frequency_hz,temperature_c`. Metadata declares identifier/order/position units `1`, midpoint time `s`, externally supplied matched-mode frequency `Hz`, and temperature `degC`. Four ordered rows per block must follow ABBA or BAAB with unique acquisition midpoints and equal within-block spacing to 0.1%. Both sequences must be balanced in count; at least three blocks are required. Randomize the schedule prospectively and retain it: the file alone cannot prove randomization or independence.

Each row must estimate the same identified mode or declared modal subspace using an externally validated estimator. Do not feed the trace tool's tallest candidate peaks directly into the block tool. The equal-weight B-minus-A block mean and ordinary Student-t sampling interval assume independent approximately normal block errors. Calibration systematics, per-run fit uncertainty, mode misidentification, thermal effects and support bias are not added. Avoid double-counting repeatability when combining uncertainty budgets.

ABBA/BAAB cancels an intercept and linear drift at equal spacing. Curvature, hysteresis, remounting, or temperature/preload/receiver geometry permanently locked to position survives the design. Repetition cannot separate confounded coefficients. Metadata and every result carry this warning; the tool does not automatically infer a causal position effect. Independently vary or constrain the nuisance factors. A zero-containing interval does not prove equivalence, a significant contrast does not identify its cause, and multiple modes require a prospective multiplicity strategy.

## Verification boundary

The test suite retains the imported gain/delay, Student-t, timing and invalid-input fixtures, and adds duplicate/blank/ragged header controls, wrong quantities/units, raw/code/source hash binding, kind conflict, candidate/calibration wording, output preservation and the independent passive closure. These checks establish finite software properties. They do not establish physical apparatus accuracy or scientific novelty.

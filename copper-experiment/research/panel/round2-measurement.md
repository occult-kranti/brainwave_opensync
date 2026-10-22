# Measurement / DSP seat — Round 2 implementation

Status: implemented and checked, 22 October 2026. Internal model-agent work, not a human specialist consultation or external peer review. No hardware measurements. Scope owned: `analysis/`, `tests/analysis_test.py`, and `research/protocol-integrated.md`; parent owns UI, build and packaging.

## Objection → decision after the first discussion

I read the elasticity and inverse Round 1 reports and the advisor's Round 1 decision before implementing. The objection is that improved ratios or a successful synthetic tail fit can look like new identifying evidence while still fitting a restricted generator. Matched frequency ratios cancel a common multiplicative scale; contact, Poisson-ratio changes, anisotropy and mode misidentification can change ratios too. My Round 1 tail fit used essentially noiseless data from its assumed oscillator and was self-checked. It cannot validate a physical pole estimator or its uncertainty.

Decision: retain ratios as bounded diagnostics; implement **no pole fitter**. Keep every trace peak a **CANDIDATE response-bin maximum**. Require an external validated same-mode estimator before block inference. Close the units/data path using an independently constructed passive frequency-domain fixture instead of relabeling a generated frequency as an estimated mode.

Gateway seat's additional challenge is accepted: phase reversal isolates odd response, including cubic/higher odd terms. It does not establish linearity and can preserve source-proportional electrical pickup. The integrated protocol now requires amplitude-scaling, measured input, independent optical/dummy and drive-off controls. No proprietary audio reproduction or consciousness/material coupling is inferred.

## Implemented decisions

| Requirement | Concrete implementation / evidence |
|---|---|
| Preserve imported source and rights | Position source copied from `a8913c825d24299283c9379282ae3876e2a0c0cd`; `SOURCE_PROVENANCE.json` records original paths/hashes, repository origin and Location pin `07e57b446a9f480216ad1aa555088bc361006d9c`. MIT notice preserved in `analysis/LICENSE`. README describes modifications. |
| Fix destructive CSV ambiguity | `csv.reader(strict=True)` inspects raw header before dictionaries. Names are stripped; blank/whitespace names and case/whitespace-normalized duplicates are rejected. Every data row must have exactly the header's field count. Missing columns and malformed CSV are rejected. Tests include the damaging duplicate force field and duplicate block time. |
| Force / voltage and sensor units | Sidecar requires explicit exact quantity/unit pairs. Trace is force N, surface velocity m/s, table acceleration m/s² and time s. Voltage columns and voltage-as-force/displacement-as-velocity declarations are rejected. No V→N calibration or derivative rename is implemented. |
| Conservative status and provenance | Required sidecar schema `copper-run-contract/1` binds raw SHA-256, analyzer SHA-256, source pins, record type and `synthetic` or `measurement-input-unverified`. Output adds sidecar and source-registry hashes, dependencies and a fixed `calibration_status: not authenticated by this software`. The metadata command fills unknown apparatus/calibration fields, not a calibrated label. |
| Preserve validation and prior records | Existing finite-value, uniform-time, nonconstant-input, Nyquist, segment, block/order/balance and Student-t checks retained. Existing output paths are rejected; CLI uses exclusive `open('x')` after serialization. Fixture/demo generators require a fresh directory. |
| Actual units closure | `closure_fixture.py` constructs analytical passive mechanical impedance independently of the imported bilinear demo, generates a periodic multisine force/velocity CSV, then runs H1. Tests compare `H_vF=iωH_xF` on actual driven lines and check periodic supplied power versus viscous loss. Retained fixture includes raw CSV, hash-bound sidecar, H1 JSON and verification receipt. |
| No new estimator/causal claim | `peak_status` is CANDIDATES with explicit no-pole-fitting/no-mode-identification wording. Block assumptions remain; every result and sidecar carries a locked-confound warning. Protocol says ABBA does not distinguish a permanently position-correlated nuisance. |

## Executed checks

- `python copper-experiment/tests/analysis_test.py`: **24/24 pass**.
- `python -O copper-experiment/tests/analysis_test.py`: **24/24 pass**; admission uses explicit exceptions and survives optimized Python.
- Actual `make_demo.py` → `analyze.py trace --metadata …` and `analyze.py blocks --metadata …` CLI roundtrip passed. Kind remained `synthetic`, peak status remained CANDIDATES and the known block mean was 3.0 Hz.
- Python syntax compilation passed for the three analysis scripts.
- Passive closure at `analysis/fixtures/passive-closure/closure-verification.json`: 8,192 samples at 8,192 S/s, 28 driven lines; maximum relative complex mobility error `2.70854e−15`; inverse derivative/receptance error `2.70806e−15`; minimum driven-line coherence `0.9999999999999989`; positive real mobility on all driven lines.
- Mean mechanical source power `1.755304848761002e−7 W`, matching viscous dissipation to `1.51e−16` relative. This is a steady periodic energy identity for the stated toy, not whole-apparatus efficiency.

This closure excludes unexcited/leakage bins and uses noiseless periodic in-model data. It supplies no sensor calibration, analog filter test, ADC/noise model, pole-fit uncertainty, physical copper result or scientific novelty. Zero table acceleration is explicitly a placeholder. High coherence does not validate unit declarations: those require the separate contract and external calibration history.

## CLI handed to the parent UI

```sh
python analysis/analyze.py metadata INPUT.csv --record-type trace --data-kind measurement-input-unverified --output INPUT.metadata.json
python analysis/analyze.py trace INPUT.csv --metadata INPUT.metadata.json --f-min 100 --f-max 3000 --nperseg 1024 --output TRACE.analysis.json
python analysis/analyze.py blocks BLOCKS.csv --metadata BLOCKS.metadata.json --confidence 0.95 --output BLOCKS.analysis.json
python analysis/closure_fixture.py --output FRESH_DIRECTORY
```

Generate a block sidecar with `--record-type blocks`. Simulations use `--data-kind synthetic`. Optional analysis `--synthetic` checks an existing synthetic sidecar and cannot relabel it. All outputs must be fresh. Code changes invalidate analyzer hashes; review and regenerate a new sidecar/result rather than silently changing prior records.

Direct-download targets are `analysis/README.md`, `analysis/analyze.py`, `analysis/make_demo.py`, `analysis/closure_fixture.py`, `analysis/requirements.txt`, `analysis/run-contract-template.json`, `analysis/SOURCE_PROVENANCE.json`, `analysis/LICENSE`, `tests/analysis_test.py`, `research/protocol-integrated.md`, and retained closure records. The blank template's null raw hash deliberately cannot pass admission. The metadata command generates an admissible binding to actual bytes while leaving physical calibration unverified.

## Remaining physical boundary and next round

A user can make a false declaration; no local file parser authenticates the experiment. Mandatory hashes prevent accidental silent mismatches and preserve declared status, not physical truth. The protocol requires external calibration, identifiable nuisance variation, same-mode estimates, independent blocks and holdouts. The Student-t interval remains a sampling interval that omits systematic calibration/support/thermal terms; it is not a causal test or equivalence certificate.

Parent UI must keep these distinctions visible and package the imported license/provenance alongside the scripts. This seat has not verified parent build downloads or browser integration. Round 2 owned implementation is complete; wait for actual parent implementation before Round 3.

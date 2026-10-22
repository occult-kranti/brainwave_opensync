#!/usr/bin/env python3
"""Stationary response and balanced-position analysis. No acquisition hardware is controlled."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
import sys

import numpy as np
import scipy
from scipy import signal, stats

SCHEMA = "copper-spectroscopy-analysis/2"
METADATA_SCHEMA = "copper-run-contract/1"
KINDS = ("synthetic", "measurement-input-unverified")
TRACE_UNITS = {
    "time_s": {"quantity": "time", "unit": "s"},
    "force_N": {"quantity": "force", "unit": "N"},
    "sphere_velocity_m_s": {"quantity": "velocity_component", "unit": "m/s"},
    "table_acceleration_m_s2": {"quantity": "acceleration_component", "unit": "m/s^2"},
}
BLOCK_UNITS = {
    "block": {"quantity": "identifier", "unit": "1"},
    "order": {"quantity": "order", "unit": "1"},
    "position": {"quantity": "position_label", "unit": "1"},
    "time_s": {"quantity": "acquisition_midpoint", "unit": "s"},
    "frequency_hz": {"quantity": "matched_mode_frequency_estimate", "unit": "Hz"},
    "temperature_c": {"quantity": "temperature", "unit": "degC"},
}
SOURCE_PINS = {
    "position": "a8913c825d24299283c9379282ae3876e2a0c0cd",
    "location": "07e57b446a9f480216ad1aa555088bc361006d9c",
}
LOCKED_CONFOUND_WARNING = (
    "ABBA/BAAB does not separate position from temperature, preload, receiver geometry or another nuisance "
    "locked to position. Repetition cannot identify their separate coefficients; independently vary or constrain them."
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def rows_from_csv(path, columns):
    with Path(path).open(newline="", encoding="utf-8-sig") as stream:
        reader = csv.reader(stream, strict=True)
        try:
            header = next(reader, None)
            require(header is not None, "CSV needs a header")
            header = [name.strip() for name in header]
            require(all(header), "CSV header names cannot be blank or whitespace")
            folded = [name.casefold() for name in header]
            require(len(set(folded)) == len(folded), "Duplicate CSV header after whitespace/case normalization")
            require(set(columns) <= set(header), "Missing CSV columns: " + ", ".join(sorted(set(columns) - set(header))))
            if "force_N" in columns:
                require(not any("voltage" in name.casefold() or name.casefold().endswith("_v") for name in header),
                        "Voltage input is unsupported: supply actual force_N with a declared force quantity in N; renaming voltage is invalid")
            rows = []
            for number, values in enumerate(reader, 2):
                require(len(values) == len(header), f"Ragged CSV row {number}: expected {len(header)} fields, found {len(values)}")
                rows.append(dict(zip(header, values)))
        except csv.Error as error:
            raise ValueError(f"Malformed CSV: {error}") from error
    require(bool(rows), "CSV has no records")
    return rows


def numbers(rows, column):
    try:
        values = np.asarray([float(row[column]) for row in rows], dtype=float)
    except (ValueError, TypeError, KeyError) as error:
        raise ValueError(f"{column} must contain numeric values") from error
    require(bool(np.all(np.isfinite(values))), f"{column} contains NaN or infinity")
    return values


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def contract_template(path, record_type, kind):
    require(kind in KINDS, "data_kind must be synthetic or measurement-input-unverified")
    require(record_type in ("trace", "blocks"), "record_type must be trace or blocks")
    return {"schema": METADATA_SCHEMA, "record_type": record_type, "data_kind": kind,
            "raw_file": Path(path).name, "raw_sha256": sha256(path),
            "analysis_code_sha256": sha256(__file__), "source_pins": dict(SOURCE_PINS),
            "channels": {name: dict(definition) for name, definition in
                         (TRACE_UNITS if record_type == "trace" else BLOCK_UNITS).items()},
            "run_id": None, "specimen_id": None, "fixture_id": None,
            "calibration_references": {}, "hardware_bandwidth_and_filter": None,
            "clock_and_channel_phase_reference": None,
            "nuisance_design": {"position_locked_covariates": "unknown", "independent_variation_record": None},
            "warning": "Unit declarations and hashes do not authenticate calibration or physical provenance. " + LOCKED_CONFOUND_WARNING}


def unique_json(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, f"Duplicate metadata key: {key}")
        result[key] = value
    return result


def read_contract(path, metadata_path, record_type, data_kind=None):
    require(metadata_path is not None, "A metadata sidecar is required; use the metadata command")
    try:
        metadata = json.loads(Path(metadata_path).read_text(encoding="utf-8"), object_pairs_hook=unique_json)
    except (json.JSONDecodeError, UnicodeError) as error:
        raise ValueError(f"Invalid metadata JSON: {error}") from error
    require(isinstance(metadata, dict), "Metadata must be an object")
    require(metadata.get("schema") == METADATA_SCHEMA, "Unsupported metadata schema")
    require(metadata.get("record_type") == record_type, "Metadata record_type does not match the command")
    kind = metadata.get("data_kind")
    require(kind in KINDS, "data_kind must be synthetic or measurement-input-unverified")
    require(data_kind is None or kind == data_kind, "Requested data kind conflicts with metadata")
    require(metadata.get("raw_sha256") == sha256(path), "Metadata raw_sha256 does not match the input bytes")
    require(metadata.get("analysis_code_sha256") == sha256(__file__), "Metadata analysis_code_sha256 does not match this analyzer; review and regenerate the sidecar")
    require(metadata.get("source_pins") == SOURCE_PINS, "Metadata source_pins do not match the imported source versions")
    channels = metadata.get("channels")
    require(isinstance(channels, dict), "Metadata channels must be an object")
    expected = TRACE_UNITS if record_type == "trace" else BLOCK_UNITS
    for name, definition in expected.items():
        require(channels.get(name) == definition, f"Unsupported quantity/unit for {name}; expected {definition}. Voltage-to-force conversion is not implemented")
    return metadata


def provenance(path, metadata_path, metadata):
    return {"schema": SCHEMA, "input_file": Path(path).name,
            "input_sha256": sha256(path), "analysis_code_sha256": sha256(__file__),
            "source_pins": dict(SOURCE_PINS),
            "source_provenance_sha256": sha256(Path(__file__).with_name("SOURCE_PROVENANCE.json")),
            "metadata_sha256": sha256(metadata_path), "run_contract": metadata,
            "data_kind": metadata["data_kind"], "calibration_status": "not authenticated by this software",
            "numpy_version": np.__version__, "scipy_version": scipy.__version__,
            "status": "computed; interpretation requires the stated measurement assumptions"}


def analyze_trace(path, *, metadata_path=None, f_min=0.0, f_max=None, nperseg=None, data_kind=None):
    metadata = read_contract(path, metadata_path, "trace", data_kind)
    columns = ["time_s", "force_N", "sphere_velocity_m_s", "table_acceleration_m_s2"]
    rows = rows_from_csv(path, columns)
    t, force, velocity, acceleration = [numbers(rows, name) for name in columns]
    require(len(t) >= 128, "Need at least 128 samples")
    dt = np.diff(t)
    require(bool(np.all(dt > 0)), "time_s must be strictly increasing")
    step = float(np.median(dt))
    require(float(np.max(np.abs(dt - step))) <= step * 1e-4, "Unequal sample spacing exceeds 0.01%; resampling is not performed")
    fs = 1.0 / step
    upper = 0.45 * fs if f_max is None else float(f_max)
    lower = float(f_min)
    require(np.isfinite(lower) and np.isfinite(upper) and 0 <= lower < upper < fs / 2,
            "Require finite 0 <= f_min < f_max < inferred Nyquist frequency")
    segment = min(1024, len(t) // 2) if nperseg is None else int(nperseg)
    require(64 <= segment <= len(t), "nperseg must be between 64 and sample count")
    overlap = segment // 2
    count = 1 + (len(t) - segment) // (segment - overlap)
    require(count >= 3, "At least three overlapping Welch segments are required; one-segment coherence is uninformative")
    require(float(np.var(force)) > 0, "Force input is constant; a transfer function cannot be estimated")
    settings = dict(fs=fs, window="hann", nperseg=segment, noverlap=overlap,
                    detrend="constant", scaling="density")
    f, pff = signal.welch(force, **settings)
    _, pvv = signal.welch(velocity, **settings)
    _, paa = signal.welch(acceleration, **settings)
    _, pfv = signal.csd(force, velocity, **settings)  # conj(F) * V
    selected = (f >= lower) & (f <= upper)
    require(int(np.count_nonzero(selected)) >= 3, "Analysis band must contain at least three frequency bins")
    threshold = float(np.max(pff)) * 1e-12
    valid = (pff > threshold) & (pvv > 0)
    h1 = np.full(f.shape, np.nan + 1j * np.nan)
    coherence = np.full(f.shape, np.nan)
    h1[valid] = pfv[valid] / pff[valid]
    coherence[valid] = np.clip(np.abs(pfv[valid]) ** 2 / (pff[valid] * pvv[valid]), 0, 1)
    require(bool(np.any(valid & selected)), "No usable excited frequency bins in requested band")
    records = []
    for i in np.flatnonzero(selected):
        records.append({"frequency_hz": float(f[i]), "h1_real_m_s_per_N": float(h1[i].real) if valid[i] else None,
                        "h1_imag_m_s_per_N": float(h1[i].imag) if valid[i] else None,
                        "h1_magnitude_m_s_per_N": float(abs(h1[i])) if valid[i] else None,
                        "coherence": float(coherence[i]) if valid[i] else None,
                        "force_psd_N2_per_Hz": float(pff[i]),
                        "table_psd_m2_s4_per_Hz": float(paa[i]), "usable_excitation": bool(valid[i])})
    magnitudes = np.where(valid & selected, np.abs(h1), -np.inf)
    candidates, _ = signal.find_peaks(magnitudes)
    candidates = [int(i) for i in candidates if selected[i] and valid[i] and coherence[i] >= 0.8]
    candidates.sort(key=lambda i: float(magnitudes[i]), reverse=True)
    result = provenance(path, metadata_path, metadata)
    result.update({"analysis": "stationary force-to-velocity H1 and table acceleration PSD",
                   "sample_count": len(t), "sample_rate_hz": fs, "time_span_s": float(t[-1] - t[0]),
                   "welch": {"window": "periodic Hann", "nperseg": segment, "noverlap": overlap,
                             "segment_count": count, "bin_spacing_hz": fs / segment,
                             "window_enbw_hz": 1.5 * fs / segment, "detrend": "constant per segment"},
                   "band_hz": [lower, upper],
                   "excitation_numerical_guard": {"relative_to_max_force_psd": 1e-12, "threshold_N2_per_Hz": threshold, "meaning": "Numerical division guard only; not a measured force-noise floor or an excitation-SNR acceptance criterion"},
                   "candidate_response_peaks": [
                       {"frequency_bin_hz": float(f[i]), "coherence": float(coherence[i]),
                        "h1_magnitude_m_s_per_N": float(abs(h1[i]))} for i in candidates[:5]],
                   "spectrum": records,
                   "peak_status": "CANDIDATES: response-bin maxima, no pole fitting or mode identification implemented",
                   "locked_confound_warning": LOCKED_CONFOUND_WARNING,
                   "limits": ["Candidate response peaks are bin maxima, not fitted natural poles or measured mode identities.",
                              "H1 assumes calibrated synchronized channels, a stationary approximately linear system, and force measurement noise small relative to excitation.",
                              "A high coherence is not proof of causation; averaging and shared interference can affect it.",
                              "usable_excitation means only the relative numerical guard passed. Establish actual excitation SNR using a separately measured force-channel noise floor and a declared acceptance threshold.",
                              "The CSV cannot establish hardware bandwidth, analog anti-alias filtering, force/velocity calibration, or sensor loading.",
                              "Nyquist acceptance cannot detect already aliased inputs. The analog front end and excitation must be band limited.",
                              "Hann equivalent noise bandwidth exceeds bin spacing; zero padding would not improve physical resolution.",
                              "Only this channel, excitation geometry, and analyzed band are represented; dark modes and other physical spectra may remain unobserved."]})
    return result


def analyze_blocks(path, *, metadata_path=None, confidence=0.95, data_kind=None):
    metadata = read_contract(path, metadata_path, "blocks", data_kind)
    columns = ["block", "order", "position", "time_s", "frequency_hz", "temperature_c"]
    rows = rows_from_csv(path, columns)
    require(np.isfinite(confidence) and 0 < confidence < 1, "confidence must lie strictly between zero and one")
    groups = {}
    for row in rows:
        require(bool(row["block"].strip()), "Block identifiers cannot be empty")
        groups.setdefault(row["block"].strip(), []).append(row)
    require(len(groups) >= 3, "Need at least three independent four-run blocks")
    blocks = []
    all_times = []
    for block, records in groups.items():
        require(len(records) == 4, f"Block {block}: expected four runs")
        orders = numbers(records, "order")
        require(sorted(orders.tolist()) == [1, 2, 3, 4], f"Block {block}: order must be exactly 1,2,3,4")
        ordered = [records[int(i)] for i in np.argsort(orders)]
        sequence = "".join(row["position"].strip().upper() for row in ordered)
        require(sequence in ("ABBA", "BAAB"), f"Block {block}: sequence must be ABBA or BAAB")
        t, f, temperature = [numbers(ordered, name) for name in ("time_s", "frequency_hz", "temperature_c")]
        require(bool(np.all(f > 0)), f"Block {block}: frequencies must be positive")
        spacing = np.diff(t)
        require(bool(np.all(spacing > 0)), f"Block {block}: time_s must increase with order")
        require(float(np.max(np.abs(spacing - np.mean(spacing)))) <= max(1e-9, float(np.mean(spacing)) * 1e-3),
                f"Block {block}: acquisition midpoint spacing must agree within 0.1%")
        at_a = np.asarray([position == "A" for position in sequence])
        difference = float(np.mean(f[~at_a]) - np.mean(f[at_a]))
        temperature_difference = float(np.mean(temperature[~at_a]) - np.mean(temperature[at_a]))
        blocks.append({"block": block, "sequence": sequence, "difference_B_minus_A_hz": difference,
                       "temperature_B_minus_A_c": temperature_difference, "spacing_s": float(np.mean(spacing))})
        all_times.extend(t.tolist())
    require(len(set(all_times)) == len(all_times), "Acquisition midpoint time_s values must be unique across blocks")
    patterns = {block["sequence"] for block in blocks}
    require(patterns == {"ABBA", "BAAB"}, "Include both ABBA and BAAB blocks to balance the order pattern")
    counts = [sum(block["sequence"] == pattern for block in blocks) for pattern in ("ABBA", "BAAB")]
    require(abs(counts[0] - counts[1]) <= 1, "ABBA and BAAB block counts must be balanced (difference at most one)")
    differences = np.asarray([block["difference_B_minus_A_hz"] for block in blocks])
    mean = float(np.mean(differences))
    sd = float(np.std(differences, ddof=1))
    se = sd / np.sqrt(len(blocks))
    critical = float(stats.t.ppf((1 + confidence) / 2, len(blocks) - 1))
    halfwidth = float(critical * se)
    result = provenance(path, metadata_path, metadata)
    result.update({"analysis": "equal-weight balanced-block paired contrast B minus A",
                   "block_count": len(blocks), "blocks": blocks,
                   "mean_difference_hz": mean, "between_block_sd_hz": sd,
                   "standard_error_hz": float(se), "confidence_level": confidence,
                   "student_t_degrees_of_freedom": len(blocks) - 1, "student_t_critical": critical,
                   "confidence_interval_hz": [mean - halfwidth, mean + halfwidth],
                   "zero_in_interval": bool(mean - halfwidth <= 0 <= mean + halfwidth),
                   "temperature_mean_B_minus_A_c": float(np.mean([block["temperature_B_minus_A_c"] for block in blocks])),
                   "locked_confound_warning": LOCKED_CONFOUND_WARNING,
                   "interpretation": "This interval describes the paired estimate under the assumptions below. It does not attribute a difference to position or prove equivalence when zero is included.",
                   "limits": ["One preregistered matched mode and channel is assumed. Frequencies must be valid fit estimates of that same mode, not whichever peak is largest.",
                              "ABBA/BAAB cancels linear time drift at equal acquisition midpoint spacing; nonlinear drift, hysteresis and remounting can survive.",
                              "Student-t coverage assumes independent block contrasts and approximately normal block errors; neither is established by the file format.",
                              "Calibration systematic uncertainty, per-run fit uncertainty, temperature effects and support changes are not added to this sampling interval.",
                              "Temperature contrasts are reported, not corrected. Record sample and fixture temperatures and use a separately measured thermal coefficient before attribution.",
                              "Repeated modes, bands or comparisons need a predeclared multiplicity correction. No correction is applied here.",
                              "A null interval is not an equivalence test. Predeclare the smallest meaningful shift and use a suitable equivalence/power analysis."]})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    trace = sub.add_parser("trace", help="Estimate H1 and coherence from a synchronized stationary CSV")
    trace.add_argument("input", type=Path)
    trace.add_argument("--f-min", type=float, default=0)
    trace.add_argument("--f-max", type=float)
    trace.add_argument("--nperseg", type=int)
    blocks = sub.add_parser("blocks", help="Estimate B-A across balanced independent ABBA/BAAB blocks")
    blocks.add_argument("input", type=Path)
    blocks.add_argument("--confidence", type=float, default=0.95)
    for command in (trace, blocks):
        command.add_argument("--output", required=True, type=Path)
        command.add_argument("--metadata", required=True, type=Path, help="Hash-bound run-contract JSON")
        command.add_argument("--synthetic", action="store_true", help="Optional extra check: metadata must already declare synthetic")
    metadata = sub.add_parser("metadata", help="Prepare a conservative hash-bound sidecar; does not authenticate sensors or data")
    metadata.add_argument("input", type=Path)
    metadata.add_argument("--record-type", choices=("trace", "blocks"), required=True)
    metadata.add_argument("--data-kind", choices=KINDS, required=True)
    metadata.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    try:
        require(not args.output.exists(), "Output exists; choose a fresh output path to preserve earlier results")
        if args.command == "metadata":
            result = contract_template(args.input, args.record_type, args.data_kind)
        else:
            kind = "synthetic" if args.synthetic else None
            if args.command == "trace":
                result = analyze_trace(args.input, metadata_path=args.metadata, f_min=args.f_min, f_max=args.f_max, nperseg=args.nperseg, data_kind=kind)
            else:
                result = analyze_blocks(args.input, metadata_path=args.metadata, confidence=args.confidence, data_kind=kind)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        serialized = json.dumps(result, indent=2, allow_nan=False) + "\n"
        with args.output.open("x", encoding="utf-8") as stream:
            stream.write(serialized)
        print(json.dumps({"output": str(args.output), "analysis": result.get("analysis", "sidecar prepared; provenance unverified"), "data_kind": result["data_kind"]}))
    except (ValueError, OSError) as error:
        parser.exit(2, f"Input rejected: {error}\n")


if __name__ == "__main__":
    main()

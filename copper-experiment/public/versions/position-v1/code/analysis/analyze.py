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

SCHEMA = "position-spectroscopy-analysis/1"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def rows_from_csv(path, columns):
    with Path(path).open(newline="", encoding="utf-8-sig") as stream:
        reader = csv.DictReader(stream)
        require(reader.fieldnames is not None, "CSV needs a header")
        require(set(columns) <= set(reader.fieldnames), "Missing CSV columns: " + ", ".join(sorted(set(columns) - set(reader.fieldnames))))
        rows = list(reader)
    require(bool(rows), "CSV has no records")
    return rows


def numbers(rows, column):
    try:
        values = np.asarray([float(row[column]) for row in rows], dtype=float)
    except (ValueError, TypeError, KeyError) as error:
        raise ValueError(f"{column} must contain numeric values") from error
    require(bool(np.all(np.isfinite(values))), f"{column} contains NaN or infinity")
    return values


def provenance(path, kind):
    return {"schema": SCHEMA, "input_file": Path(path).name,
            "input_sha256": hashlib.sha256(Path(path).read_bytes()).hexdigest(),
            "data_kind": kind, "numpy_version": np.__version__, "scipy_version": scipy.__version__,
            "status": "computed; interpretation requires the stated measurement assumptions"}


def analyze_trace(path, *, f_min=0.0, f_max=None, nperseg=None, data_kind="measurement-input"):
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
    result = provenance(path, data_kind)
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
                   "limits": ["Candidate response peaks are bin maxima, not fitted natural poles or measured mode identities.",
                              "H1 assumes calibrated synchronized channels, a stationary approximately linear system, and force measurement noise small relative to excitation.",
                              "A high coherence is not proof of causation; averaging and shared interference can affect it.",
                              "usable_excitation means only the relative numerical guard passed. Establish actual excitation SNR using a separately measured force-channel noise floor and a declared acceptance threshold.",
                              "The CSV cannot establish hardware bandwidth, analog anti-alias filtering, force/velocity calibration, or sensor loading.",
                              "Nyquist acceptance cannot detect already aliased inputs. The analog front end and excitation must be band limited.",
                              "Hann equivalent noise bandwidth exceeds bin spacing; zero padding would not improve physical resolution.",
                              "Only this channel, excitation geometry, and analyzed band are represented; dark modes and other physical spectra may remain unobserved."]})
    return result


def analyze_blocks(path, *, confidence=0.95, data_kind="measurement-input"):
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
    result = provenance(path, data_kind)
    result.update({"analysis": "equal-weight balanced-block paired contrast B minus A",
                   "block_count": len(blocks), "blocks": blocks,
                   "mean_difference_hz": mean, "between_block_sd_hz": sd,
                   "standard_error_hz": float(se), "confidence_level": confidence,
                   "student_t_degrees_of_freedom": len(blocks) - 1, "student_t_critical": critical,
                   "confidence_interval_hz": [mean - halfwidth, mean + halfwidth],
                   "zero_in_interval": bool(mean - halfwidth <= 0 <= mean + halfwidth),
                   "temperature_mean_B_minus_A_c": float(np.mean([block["temperature_B_minus_A_c"] for block in blocks])),
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
        command.add_argument("--synthetic", action="store_true", help="Mark generated inputs as synthetic; never use this to relabel real data")
    args = parser.parse_args()
    try:
        require(not args.output.exists(), "Output exists; choose a fresh output path to preserve earlier results")
        kind = "synthetic-demonstration" if args.synthetic else "measurement-input-unverified-provenance"
        if args.command == "trace":
            result = analyze_trace(args.input, f_min=args.f_min, f_max=args.f_max, nperseg=args.nperseg, data_kind=kind)
        else:
            result = analyze_blocks(args.input, confidence=args.confidence, data_kind=kind)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2, allow_nan=False) + "\n")
        print(json.dumps({"output": str(args.output), "analysis": result["analysis"], "data_kind": result["data_kind"]}))
    except (ValueError, OSError) as error:
        parser.exit(2, f"Input rejected: {error}\n")


if __name__ == "__main__":
    main()

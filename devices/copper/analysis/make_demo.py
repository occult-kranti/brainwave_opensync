#!/usr/bin/env python3
"""Create small, deterministic synthetic fixtures. These are not copper-ball measurements."""
import argparse
import csv
import json
from pathlib import Path

import numpy as np
from scipy import signal
from analyze import contract_template


def write_csv(path, header, rows):
    with path.open("x", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(header)
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    if args.output.exists():
        parser.error("Choose a fresh output directory")
    args.output.mkdir(parents=True)
    rng = np.random.default_rng(210626)
    fs, n = 8192.0, 4096
    # A 700 Hz toy support oscillator; not a free copper sphere's bulk mode.
    omega, mass, quality = 2 * np.pi * 700, 0.0733, 30
    numerator, denominator = signal.bilinear([1 / mass, 0], [1, omega / quality, omega**2], fs=fs)
    # Burn in the state before recording, to reduce the initial transient.
    force_all = rng.normal(0, 0.1, n + 2048)
    velocity_all = signal.lfilter(numerator, denominator, force_all)
    force = force_all[2048:]
    velocity = velocity_all[2048:] + rng.normal(0, 2e-5, n)
    table = 0.15 * force + rng.normal(0, 0.005, n)
    write_csv(args.output / "synthetic-trace.csv",
              ["time_s", "force_N", "sphere_velocity_m_s", "table_acceleration_m_s2"],
              zip(np.arange(n) / fs, force, velocity, table))
    contrasts = [2.5, 3.0, 3.5, 2.6, 3.4, 3.0]
    rows = []
    for block, difference in enumerate(contrasts, 1):
        pattern = "ABBA" if block % 2 else "BAAB"
        for order, position in enumerate(pattern, 1):
            time_s = (block - 1) * 200 + order * 30
            drift = 0.02 * time_s
            frequency = 700 + drift + (difference if position == "B" else 0)
            temperature = 20 + 1e-4 * time_s
            rows.append([block, order, position, time_s, frequency, temperature])
    write_csv(args.output / "synthetic-blocks.csv",
              ["block", "order", "position", "time_s", "frequency_hz", "temperature_c"], rows)
    for name, kind in (("synthetic-trace.csv", "trace"), ("synthetic-blocks.csv", "blocks")):
        raw = args.output / name
        with raw.with_suffix(".metadata.json").open("x", encoding="utf-8") as stream:
            json.dump(contract_template(raw, kind, "synthetic"), stream, indent=2)
            stream.write("\n")
    manifest = {"status": "synthetic", "measured": False, "seed": 210626,
                "trace": "Bilinear-discretized force-to-velocity response of a toy 700 Hz support oscillator, with additive receiver noise; not a copper sphere bulk-mode prediction.",
                "trace_model": {"continuous_frequency_hz": 700, "mass_kg": mass, "Q": quality,
                                "sample_rate_hz": fs, "samples": n,
                                "discrete_peak_note": "Bilinear frequency warping changes the digital response peak; the CLI reports response bins, not the continuous input parameter."},
                "blocks": {"injected_contrasts_hz": contrasts, "mean_contrast_hz": 3.0,
                           "linear_time_drift_hz_per_s": 0.02, "equal_spacing_s": 30},
                "warning": "These records only exercise analysis code. They are not evidence of a location effect, a built apparatus, or a complete spectrum."}
    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({"created": str(args.output), "status": manifest["status"]}))


if __name__ == "__main__":
    main()

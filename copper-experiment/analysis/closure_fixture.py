#!/usr/bin/env python3
"""Independent frequency-domain, periodic passive-mechanics closure fixture.

No pole fitting; no hardware or measured copper data. Generates steady periodic
force/velocity via an analytical mechanical impedance, then runs the imported
Welch H1 analyzer. Compare only driven lines, not neighboring leakage bins.
"""
import argparse
import csv
import json
from pathlib import Path

import numpy as np

from analyze import analyze_trace, contract_template, sha256


def generate(directory):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=False)
    fs, period, repeats = 8192., 2048, 4
    mass, fn, quality = .1, 700., 30.
    stiffness = mass*(2*np.pi*fn)**2
    damping = mass*2*np.pi*fn/quality
    bins = np.arange(80, 297, 8)  # 320...1184 Hz, separated by 32 Hz
    frequencies = np.fft.rfftfreq(period, 1/fs)
    omega = 2*np.pi*frequencies
    # Independent analytic impedance, not the producer's biquad/transient code.
    receptance = 1/(stiffness-mass*omega**2+1j*damping*omega)
    mobility = 1j*omega*receptance
    spectrum = np.zeros(period//2+1, dtype=complex)
    rng = np.random.default_rng(20261022)
    spectrum[bins] = .002*period/2*np.exp(1j*rng.uniform(-np.pi, np.pi, len(bins)))
    force = np.tile(np.fft.irfft(spectrum, n=period), repeats)
    velocity = np.tile(np.fft.irfft(spectrum*mobility, n=period), repeats)
    displacement = np.tile(np.fft.irfft(spectrum*receptance, n=period), repeats)
    raw = directory / "passive-force-velocity.csv"
    with raw.open("x", newline="", encoding="utf-8") as stream:
        writer = csv.writer(stream)
        writer.writerow(["time_s", "force_N", "sphere_velocity_m_s", "table_acceleration_m_s2"])
        # Zero table channel is a declared fixture placeholder, no table model.
        writer.writerows(zip(np.arange(len(force))/fs, force, velocity, np.zeros(len(force))))
    metadata_path = directory / "passive-force-velocity.metadata.json"
    metadata = contract_template(raw, "trace", "synthetic")
    metadata["fixture_id"] = "passive-periodic-single-coordinate-frequency-domain/1"
    metadata["fixture_generation"] = {
        "script_sha256": sha256(__file__), "seed": 20261022,
        "mass_kg": mass, "natural_frequency_hz": fn, "Q": quality,
        "source": "finite periodic multisine force, 2 mN amplitude per driven line",
        "response": "analytical steady-state impedance; no initial transient",
        "table_channel": "zero placeholder; no modeled table dynamics",
        "admission": "synthetic mathematical quantities; no hardware calibration implied"}
    metadata_path.write_text(json.dumps(metadata, indent=2)+"\n")
    result = analyze_trace(raw, metadata_path=metadata_path, f_min=300, f_max=1200, nperseg=period)
    measured = {round(row["frequency_hz"], 7): row for row in result["spectrum"]}
    relative_errors, recovered_receptance_errors, coherence = [], [], []
    for k in bins:
        row = measured[round(float(frequencies[k]), 7)]
        actual = row["h1_real_m_s_per_N"]+1j*row["h1_imag_m_s_per_N"]
        relative_errors.append(abs(actual/mobility[k]-1))
        recovered_receptance_errors.append(abs((actual/(1j*omega[k]))/receptance[k]-1))
        coherence.append(row["coherence"])
    # Independent periodic energy identity: input average power equals c<v²>.
    supplied_power = float(np.mean(force*velocity))
    dissipated_power = float(damping*np.mean(velocity**2))
    receipt = {
        "status": "executed synthetic interoperability closure, not apparatus validation",
        "input_sha256": sha256(raw), "metadata_sha256": sha256(metadata_path),
        "analyzer_sha256": sha256(Path(__file__).with_name("analyze.py")),
        "generator_sha256": sha256(__file__), "samples": len(force),
        "sample_rate_hz": fs, "driven_line_count": len(bins),
        "max_relative_complex_mobility_error_on_driven_lines": float(max(relative_errors)),
        "max_relative_receptance_error_after_i_omega_conversion": float(max(recovered_receptance_errors)),
        "minimum_driven_line_coherence": float(min(coherence)),
        "mechanical_average_source_power_W": supplied_power,
        "mechanical_average_dissipation_W": dissipated_power,
        "relative_periodic_energy_balance_error": abs(supplied_power-dissipated_power)/supplied_power,
        "max_displacement_m": float(np.max(np.abs(displacement))),
        "passivity_real_mobility_min": float(np.min(mobility[bins].real)),
        "comparison": "H_vF = i*omega*H_xF with exp(+i*omega*t); nonzero driven lines only",
        "limits": ["Deterministic in-model steady periodic data; not a noisy fit or an uncertainty estimate.",
                   "Unexcited/leakage bins are excluded from the closure comparison.",
                   "Candidate peaks are not fitted modes; no pole fitter is implemented.",
                   "No analog filtering, force calibration, ADC, sensor loading or physical copper measurement."]}
    for name, value in (("h1-analysis.json", result), ("closure-verification.json", receipt)):
        with (directory/name).open("x", encoding="utf-8") as stream:
            json.dump(value, stream, indent=2, allow_nan=False)
            stream.write("\n")
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path, help="Fresh directory; existing paths are rejected")
    args = parser.parse_args()
    try:
        print(json.dumps(generate(args.output), indent=2))
    except (ValueError, OSError) as error:
        parser.exit(2, f"Fixture rejected: {error}\n")


if __name__ == "__main__":
    main()

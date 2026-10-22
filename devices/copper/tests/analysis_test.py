#!/usr/bin/env python3
"""Independent numerical invariants and damaging-input controls for the analysis CLI."""
import csv
import json
import subprocess
import sys
import importlib.util
from pathlib import Path
import tempfile
import unittest

import numpy as np

BASE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("position_analysis", BASE / "analysis/analyze.py")
analysis = importlib.util.module_from_spec(spec)
spec.loader.exec_module(analysis)


class AnalysisTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.directory = Path(self.temporary.name)

    def tearDown(self):
        self.temporary.cleanup()

    def csv(self, name, header, rows):
        path = self.directory / name
        with path.open("w", newline="") as stream:
            writer = csv.writer(stream)
            writer.writerow(header)
            writer.writerows(rows)
        return path

    def metadata(self, path, kind="trace", data_kind="synthetic"):
        sidecar = path.with_suffix(".metadata.json")
        sidecar.write_text(json.dumps(analysis.contract_template(path, kind, data_kind)))
        return sidecar

    def analyze_trace(self, path, **kwargs):
        return analysis.analyze_trace(path, metadata_path=self.metadata(path), **kwargs)

    def analyze_blocks(self, path, **kwargs):
        return analysis.analyze_blocks(path, metadata_path=self.metadata(path, "blocks"), **kwargs)

    def trace(self, *, jitter=False, nan=False, constant=False):
        rng = np.random.default_rng(14139)
        n, fs, gain, delay = 8192, 4096, 0.02, 3
        t = np.arange(n) / fs
        force = np.ones(n) if constant else rng.normal(size=n)
        velocity = gain * np.roll(force, delay) + rng.normal(0, 0.0005, n)
        acceleration = 0.1 * force + rng.normal(0, 0.001, n)
        if jitter:
            t[100] += 1e-5
        if nan:
            velocity[100] = np.nan
        return self.csv("trace.csv", ["time_s", "force_N", "sphere_velocity_m_s", "table_acceleration_m_s2"],
                        zip(t, force, velocity, acceleration))

    def blocks(self, *, pattern_error=False, time_error=False, nblocks=6):
        differences = [2.5, 3, 3.5, 2.6, 3.4, 3]
        rows = []
        for index in range(nblocks):
            pattern = "ABBA" if index % 2 == 0 else "BAAB"
            if pattern_error and index == 0:
                pattern = "AABB"
            for order, position in enumerate(pattern, 1):
                t = index * 300 + order * 20
                frequency = 1000 + 7 * t + (differences[index] if position == "B" else 0)
                if time_error and index == 0 and order == 2:
                    t += 1
                rows.append([index, order, position, t, frequency, 20 + t * 0.001])
        return self.csv("blocks.csv", ["block", "order", "position", "time_s", "frequency_hz", "temperature_c"], rows)

    def test_known_gain_delay_with_independent_frequency_formula(self):
        result = self.analyze_trace(self.trace(), f_min=100, f_max=1700, nperseg=1024)
        usable = result["spectrum"]
        measured = np.asarray([row["h1_real_m_s_per_N"] + 1j * row["h1_imag_m_s_per_N"] for row in usable])
        f = np.asarray([row["frequency_hz"] for row in usable])
        expected = 0.02 * np.exp(-2j * np.pi * f * 3 / 4096)
        self.assertLess(float(np.median(np.abs(measured - expected) / 0.02)), 0.01)
        self.assertGreater(float(np.median([row["coherence"] for row in usable])), 0.99)
        self.assertEqual(result["welch"]["bin_spacing_hz"], 4)
        self.assertEqual(result["welch"]["window_enbw_hz"], 6)

    def test_band_at_nyquist_rejected(self):
        with self.assertRaisesRegex(ValueError, "Nyquist"):
            self.analyze_trace(self.trace(), f_max=2048)

    def test_bad_sampling_rejected(self):
        with self.assertRaisesRegex(ValueError, "spacing"):
            self.analyze_trace(self.trace(jitter=True))

    def test_nonfinite_rejected(self):
        with self.assertRaisesRegex(ValueError, "NaN"):
            self.analyze_trace(self.trace(nan=True))

    def test_constant_excitation_rejected(self):
        with self.assertRaisesRegex(ValueError, "constant"):
            self.analyze_trace(self.trace(constant=True))

    def test_single_welch_segment_rejected(self):
        with self.assertRaisesRegex(ValueError, "three"):
            self.analyze_trace(self.trace(), nperseg=8192)

    def test_balanced_contrast_cancels_large_linear_drift(self):
        result = self.analyze_blocks(self.blocks())
        # Independent hand calculation: differences have mean 3 and sum of squared deviations .82.
        sd = np.sqrt(0.82 / 5)
        halfwidth = 2.570581835636314 * sd / np.sqrt(6)
        self.assertAlmostEqual(result["mean_difference_hz"], 3, places=10)
        self.assertAlmostEqual(result["confidence_interval_hz"][0], 3 - halfwidth, places=9)
        self.assertAlmostEqual(result["confidence_interval_hz"][1], 3 + halfwidth, places=9)
        self.assertAlmostEqual(result["temperature_mean_B_minus_A_c"], 0, places=12)
        self.assertIn("does not attribute", result["interpretation"])

    def test_aabb_rejected(self):
        with self.assertRaisesRegex(ValueError, "ABBA"):
            self.analyze_blocks(self.blocks(pattern_error=True))

    def test_unequal_block_time_rejected(self):
        with self.assertRaisesRegex(ValueError, "midpoint spacing"):
            self.analyze_blocks(self.blocks(time_error=True))

    def test_too_few_blocks_rejected(self):
        with self.assertRaisesRegex(ValueError, "three"):
            self.analyze_blocks(self.blocks(nblocks=2))

    def test_missing_time_rejected(self):
        path = self.csv("missing.csv", ["block", "order", "position", "frequency_hz", "temperature_c"], [[1, 1, "A", 700, 20]])
        with self.assertRaisesRegex(ValueError, "time_s"):
            self.analyze_blocks(path)

    def test_duplicate_headers_rejected_before_channel_overwrite(self):
        for duplicate in ("force_N", " force_N ", "FORCE_n"):
            with self.subTest(duplicate=duplicate):
                path = self.csv("duplicate.csv", ["time_s", "force_N", "sphere_velocity_m_s", "table_acceleration_m_s2", duplicate],
                                [[0, 1, .01, 0, 1000]])
                with self.assertRaisesRegex(ValueError, "Duplicate CSV header"):
                    self.analyze_trace(path)

    def test_duplicate_block_headers_also_rejected(self):
        path = self.csv("duplicate-block.csv", ["block", "order", "position", "time_s", "frequency_hz", "temperature_c", " time_s "],
                        [[1, 1, "A", 0, 700, 20, 5]])
        with self.assertRaisesRegex(ValueError, "Duplicate CSV header"):
            self.analyze_blocks(path)

    def test_blank_or_whitespace_header_rejected(self):
        for blank in ("", "  ", "\t"):
            with self.subTest(blank=blank):
                path = self.csv("blank.csv", ["time_s", "force_N", "sphere_velocity_m_s", "table_acceleration_m_s2", blank], [[0, 1, .01, 0, 2]])
                with self.assertRaisesRegex(ValueError, "blank or whitespace"):
                    self.analyze_trace(path)

    def test_ragged_short_long_and_blank_rows_rejected(self):
        for row in ([0, 1, .01], [0, 1, .01, 0, 5], []):
            with self.subTest(row=row):
                path = self.csv("ragged.csv", ["time_s", "force_N", "sphere_velocity_m_s", "table_acceleration_m_s2"], [row])
                with self.assertRaisesRegex(ValueError, "Ragged CSV row"):
                    self.analyze_trace(path)

    def test_unique_whitespace_headers_normalized_explicitly(self):
        path = self.trace()
        content = path.read_text().replace("time_s,force_N", " time_s , force_N ", 1)
        path.write_text(content)
        self.assertEqual(self.analyze_trace(path, f_min=100, f_max=1700)["data_kind"], "synthetic")

    def test_wrong_force_quantity_or_velocity_units_rejected(self):
        for name, invalid in (("force_N", {"quantity": "voltage", "unit": "V"}),
                              ("sphere_velocity_m_s", {"quantity": "displacement", "unit": "m"})):
            with self.subTest(name=name):
                path = self.trace()
                sidecar = self.metadata(path)
                metadata = json.loads(sidecar.read_text())
                metadata["channels"][name] = invalid
                sidecar.write_text(json.dumps(metadata))
                with self.assertRaisesRegex(ValueError, "Unsupported quantity/unit"):
                    analysis.analyze_trace(path, metadata_path=sidecar)

    def test_voltage_column_never_treated_as_force(self):
        path = self.csv("voltage.csv", ["time_s", "force_N", "sphere_velocity_m_s", "table_acceleration_m_s2", "drive_voltage_V"], [[0, 1, .01, 0, 3]])
        with self.assertRaisesRegex(ValueError, "Voltage input is unsupported"):
            self.analyze_trace(path)

    def test_sidecar_required_and_raw_code_hashes_checked(self):
        path = self.trace()
        with self.assertRaisesRegex(ValueError, "sidecar is required"):
            analysis.analyze_trace(path)
        sidecar = self.metadata(path)
        path.write_text(path.read_text()+"\n")
        with self.assertRaisesRegex(ValueError, "raw_sha256"):
            analysis.analyze_trace(path, metadata_path=sidecar)
        sidecar = self.metadata(path)
        metadata = json.loads(sidecar.read_text())
        metadata["analysis_code_sha256"] = "0"*64
        sidecar.write_text(json.dumps(metadata))
        with self.assertRaisesRegex(ValueError, "analysis_code_sha256"):
            analysis.analyze_trace(path, metadata_path=sidecar)

    def test_source_pins_and_data_kind_cannot_silently_change(self):
        path = self.trace()
        sidecar = self.metadata(path, data_kind="measurement-input-unverified")
        with self.assertRaisesRegex(ValueError, "conflicts"):
            analysis.analyze_trace(path, metadata_path=sidecar, data_kind="synthetic")
        metadata = json.loads(sidecar.read_text())
        metadata["source_pins"]["position"] = "unknown"
        sidecar.write_text(json.dumps(metadata))
        with self.assertRaisesRegex(ValueError, "source_pins"):
            analysis.analyze_trace(path, metadata_path=sidecar)

    def test_cli_rejects_existing_output_without_modifying_it(self):
        path = self.trace()
        sidecar = self.metadata(path)
        output = self.directory / "existing.json"
        output.write_text("preserve me")
        completed = subprocess.run([sys.executable, str(BASE/"analysis/analyze.py"), "trace", str(path),
                                    "--metadata", str(sidecar), "--output", str(output)], capture_output=True, text=True)
        self.assertEqual(completed.returncode, 2)
        self.assertIn("Output exists", completed.stderr)
        self.assertEqual(output.read_text(), "preserve me")

    def test_output_remains_candidate_and_calibration_unverified(self):
        result = self.analyze_trace(self.trace(), f_min=100, f_max=1700)
        self.assertIn("CANDIDATES", result["peak_status"])
        self.assertEqual(result["calibration_status"], "not authenticated by this software")
        self.assertIn("locked to position", result["locked_confound_warning"])
        self.assertEqual(result["analysis_code_sha256"], analysis.sha256(BASE/"analysis/analyze.py"))

    def test_locked_confound_warning_survives_valid_block_interval(self):
        result = self.analyze_blocks(self.blocks())
        self.assertIn("Repetition cannot identify", result["locked_confound_warning"])
        self.assertIn("systematic", " ".join(result["limits"]))

    def test_independent_passive_frequency_domain_closure(self):
        sys.path.insert(0, str(BASE/"analysis"))
        try:
            import closure_fixture
            receipt = closure_fixture.generate(self.directory/"closure")
        finally:
            sys.path.pop(0)
        self.assertLess(receipt["max_relative_complex_mobility_error_on_driven_lines"], 1e-9)
        self.assertLess(receipt["max_relative_receptance_error_after_i_omega_conversion"], 1e-9)
        self.assertLess(receipt["relative_periodic_energy_balance_error"], 1e-12)
        self.assertGreater(receipt["passivity_real_mobility_min"], 0)
        self.assertGreater(receipt["minimum_driven_line_coherence"], .999999)


if __name__ == "__main__":
    unittest.main()

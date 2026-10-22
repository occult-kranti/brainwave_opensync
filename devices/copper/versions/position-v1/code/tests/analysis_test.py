#!/usr/bin/env python3
"""Independent numerical invariants and damaging-input controls for the analysis CLI."""
import csv
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
        result = analysis.analyze_trace(self.trace(), f_min=100, f_max=1700, nperseg=1024)
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
            analysis.analyze_trace(self.trace(), f_max=2048)

    def test_bad_sampling_rejected(self):
        with self.assertRaisesRegex(ValueError, "spacing"):
            analysis.analyze_trace(self.trace(jitter=True))

    def test_nonfinite_rejected(self):
        with self.assertRaisesRegex(ValueError, "NaN"):
            analysis.analyze_trace(self.trace(nan=True))

    def test_constant_excitation_rejected(self):
        with self.assertRaisesRegex(ValueError, "constant"):
            analysis.analyze_trace(self.trace(constant=True))

    def test_single_welch_segment_rejected(self):
        with self.assertRaisesRegex(ValueError, "three"):
            analysis.analyze_trace(self.trace(), nperseg=8192)

    def test_balanced_contrast_cancels_large_linear_drift(self):
        result = analysis.analyze_blocks(self.blocks())
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
            analysis.analyze_blocks(self.blocks(pattern_error=True))

    def test_unequal_block_time_rejected(self):
        with self.assertRaisesRegex(ValueError, "midpoint spacing"):
            analysis.analyze_blocks(self.blocks(time_error=True))

    def test_too_few_blocks_rejected(self):
        with self.assertRaisesRegex(ValueError, "three"):
            analysis.analyze_blocks(self.blocks(nblocks=2))

    def test_missing_time_rejected(self):
        path = self.csv("missing.csv", ["block", "order", "position", "frequency_hz", "temperature_c"], [[1, 1, "A", 700, 20]])
        with self.assertRaisesRegex(ValueError, "time_s"):
            analysis.analyze_blocks(path)


if __name__ == "__main__":
    unittest.main()

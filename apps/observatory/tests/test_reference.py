"""Independent arithmetic, edge case and conditional invariance checks; stdlib only."""
import importlib.util
import json
import math
from pathlib import Path
import subprocess
import sys
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "reference.py"
spec = importlib.util.spec_from_file_location("numerical_reference", SCRIPT)
reference = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reference)


class NumericalReferenceTests(unittest.TestCase):
    def test_average_ranks_handle_ties_and_original_order(self):
        self.assertEqual(reference.average_ranks([30, 10, 10, 20]), [4, 1.5, 1.5, 3])
        self.assertEqual(reference.average_ranks([]), [])

    def test_spearman_known_ties(self):
        self.assertAlmostEqual(reference.spearman([1, 2, 2, 4], [4, 1, 1, 3]), -1/3, places=14)

    def test_spearman_monotonic_and_reversed(self):
        self.assertAlmostEqual(reference.spearman([1, 2, 3, 4], [1, 4, 9, 16]), 1.0, places=14)
        self.assertAlmostEqual(reference.spearman([1, 2, 3, 4], [16, 9, 4, 1]), -1.0, places=14)

    def test_undefined_correlations_are_null(self):
        for x, y in [([], []), ([1], [2]), ([1, 1], [2, 3]), ([0, 0], [1, 2])]:
            self.assertIsNone(reference.spearman(x, y))
        self.assertEqual(json.dumps(reference.spearman([1, 1], [2, 3])), "null")

    def test_nonfinite_and_mismatched_inputs_rejected(self):
        for value in [math.nan, math.inf, -math.inf]:
            with self.assertRaises(ValueError):
                reference.spearman([1, value], [2, 3])
        with self.assertRaises(ValueError):
            reference.spearman([1, 2], [3])

    def test_pearson_finite_large_values_no_overflow(self):
        self.assertAlmostEqual(reference.pearson([-1e308, 0, 1e308], [1e308, 0, -1e308]), -1.0)

    def test_counterexample_same_descriptors_different_function(self):
        r = reference.reference_results()
        self.assertEqual(r["observations"]["region_count"], 82)
        self.assertTrue(r["observations"]["vectors_identical"])
        self.assertTrue(r["observations"]["descriptors_identical"])
        self.assertEqual(r["observations"]["max_absolute_difference"], 0.0)
        self.assertAlmostEqual(r["states"]["A"]["F"], 1.008, places=14)
        self.assertAlmostEqual(r["states"]["B"]["F"], 0.576, places=14)
        self.assertTrue(r["states"]["A"]["above_threshold"])
        self.assertFalse(r["states"]["B"]["above_threshold"])

    def test_transition_agrees_with_threshold_substitution(self):
        tau = reference.transition_time(.72, 1.4, .8, .1)
        self.assertAlmostEqual(tau, 2.311117209633865, places=13)
        s = reference.substrate_at_time(.72, .1, tau)
        self.assertAlmostEqual(s * 1.4, .8, places=14)
        self.assertGreater(reference.substrate_at_time(.72, .1, tau - .01) * 1.4, .8)
        self.assertLess(reference.substrate_at_time(.72, .1, tau + .01) * 1.4, .8)
        self.assertEqual(reference.transition_time(.72, .8, .8, .1), 0.0)
        self.assertEqual(reference.transition_time(.8, 1, .8, .1), 0.0)
        self.assertEqual(reference.transition_time(0, 1, .8, .1), 0.0)

    def test_same_baseline_output_different_rate_different_clock(self):
        slow = reference.transition_time(.72, 1.4, .8, .1)
        fast = reference.transition_time(.72, 1.4, .8, .2)
        self.assertAlmostEqual(slow, 2 * fast, places=14)
        self.assertEqual(reference.substrate_at_time(.72, .1, 0), reference.substrate_at_time(.72, .2, 0))

    def test_assay_separation_scale_and_equal_efficacy_control(self):
        self.assertAlmostEqual(reference.predicted_separation(1.008, .576, .1), 4.32, places=14)
        self.assertAlmostEqual(reference.predicted_separation(1.008, .576, .2), 2.16, places=14)
        self.assertEqual(reference.predicted_separation(1.008, 1.008, .1), 0)
        r = reference.reference_results()["assays"]
        self.assertEqual(r["structural_observation"]["delta_over_sigma"], 0)
        self.assertEqual(r["molecular_descriptor"]["delta_over_sigma"], 0)

    def test_invalid_model_parameters(self):
        for sigma in [0, -.1, math.nan, math.inf]:
            with self.assertRaises(ValueError):
                reference.predicted_separation(1, 0, sigma)
        for rate in [0, -.1, math.inf]:
            with self.assertRaises(ValueError):
                reference.transition_time(.72, 1.4, .8, rate)
        for threshold in [0, -.1]:
            with self.assertRaises(ValueError):
                reference.transition_time(.72, 1.4, threshold, .1)
        with self.assertRaises(ValueError):
            reference.functional_output(-1, 1)
        with self.assertRaises(ValueError):
            reference.substrate_at_time(.72, .1, -1)

    def test_json_cli_is_deterministic_and_valid(self):
        first = subprocess.check_output([sys.executable, str(SCRIPT)], text=True)
        second = subprocess.check_output([sys.executable, str(SCRIPT)], text=True)
        self.assertEqual(first, second)
        parsed = json.loads(first)
        self.assertIn("synthetic", parsed["status"])
        self.assertEqual(parsed["observations"]["descriptors_A"], parsed["observations"]["descriptors_B"])


if __name__ == "__main__":
    unittest.main()

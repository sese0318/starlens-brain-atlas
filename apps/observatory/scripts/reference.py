#!/usr/bin/env python3
"""Portable numerical reference for a synthetic conditional identifiability demo.

No patient data, biological parameter estimation, or clinical prediction occurs.
All temporal rates and outputs use arbitrary normalized model units.
"""
from __future__ import annotations

import argparse
import json
import math
from collections.abc import Iterable


def finite_number(value: float, name: str) -> float:
    value = float(value)
    if not math.isfinite(value):
        raise ValueError(f"{name} must be finite")
    return value


def finite_vector(values: Iterable[float], name: str) -> list[float]:
    return [finite_number(value, name) for value in values]


def average_ranks(values: Iterable[float]) -> list[float]:
    """One based average ranks; exact equal values are ties. Empty input is valid."""
    values = finite_vector(values, "rank input")
    order = sorted(range(len(values)), key=values.__getitem__)
    ranks = [0.0] * len(values)
    start = 0
    while start < len(order):
        stop = start + 1
        while stop < len(order) and values[order[stop]] == values[order[start]]:
            stop += 1
        mean_rank = (start + 1 + stop) / 2.0
        for position in range(start, stop):
            ranks[order[position]] = mean_rank
        start = stop
    return ranks


def pearson(x: Iterable[float], y: Iterable[float]) -> float | None:
    """Pearson correlation, or None when fewer than two values or zero variance.

    Inputs must have equal lengths and finite values. Scaling before centering
    prevents overflow for finite high magnitude values. None becomes JSON null.
    """
    x, y = finite_vector(x, "x"), finite_vector(y, "y")
    if len(x) != len(y):
        raise ValueError("correlation inputs must have equal lengths")
    if len(x) < 2:
        return None
    sx, sy = max(abs(v) for v in x), max(abs(v) for v in y)
    if sx == 0 or sy == 0:
        return None
    x, y = [v / sx for v in x], [v / sy for v in y]
    mx, my = math.fsum(x) / len(x), math.fsum(y) / len(y)
    dx, dy = [v - mx for v in x], [v - my for v in y]
    xx, yy = math.fsum(v * v for v in dx), math.fsum(v * v for v in dy)
    if xx == 0 or yy == 0:
        return None
    value = math.fsum(a * b for a, b in zip(dx, dy)) / math.sqrt(xx * yy)
    return max(-1.0, min(1.0, value))


def spearman(x: Iterable[float], y: Iterable[float]) -> float | None:
    """Raw Spearman rho with average ties, without Fisher transformation."""
    return pearson(average_ranks(x), average_ranks(y))


def functional_output(substrate: float, efficacy: float) -> float:
    """Toy useful circuit output S*C; neither factor is a measured cell count."""
    substrate = finite_number(substrate, "substrate")
    efficacy = finite_number(efficacy, "efficacy")
    if substrate < 0 or efficacy < 0:
        raise ValueError("substrate and efficacy must be nonnegative")
    return finite_number(substrate * efficacy, "functional output")


def substrate_at_time(initial: float, rate: float, time: float) -> float:
    initial = finite_number(initial, "initial substrate")
    rate = finite_number(rate, "rate")
    time = finite_number(time, "time")
    if initial < 0 or rate <= 0 or time < 0:
        raise ValueError("initial substrate and time must be nonnegative; rate must be positive")
    return initial * math.exp(-rate * time)


def transition_time(substrate: float, efficacy: float, threshold: float, rate: float) -> float:
    """First threshold attainment, with 0 for states already at/below threshold.

    Rate uses arbitrary inverse model time, never years or clinical estimates.
    """
    threshold = finite_number(threshold, "threshold")
    rate = finite_number(rate, "rate")
    if threshold <= 0 or rate <= 0:
        raise ValueError("threshold and rate must be positive")
    output = functional_output(substrate, efficacy)
    if output <= threshold:
        return 0.0
    # Log difference avoids overflow in a ratio of finite inputs.
    return (math.log(output) - math.log(threshold)) / rate


def predicted_separation(signal_a: float, signal_b: float, noise_sd: float) -> float:
    """Absolute mean difference / per-measurement SD, not a p-value.

    This is not the SD of the difference of two independent measurements, which
    would be sqrt(2)*noise_sd when both have that same noise variance.
    """
    signal_a = finite_number(signal_a, "signal A")
    signal_b = finite_number(signal_b, "signal B")
    noise_sd = finite_number(noise_sd, "noise SD")
    if noise_sd <= 0:
        raise ValueError("noise SD must be positive")
    return finite_number(abs(signal_a - signal_b) / noise_sd, "separation")


def synthetic_maps() -> tuple[list[float], dict[str, list[float]]]:
    """Deterministic arbitrary 82 region example; no anatomical data or templates."""
    observation = [1 + 0.18 * math.sin(i * 0.43) + 0.003 * i for i in range(82)]
    references = {
        "synthetic_reference_A": [math.cos(i * 0.21) + i * 0.007 for i in range(82)],
        "synthetic_reference_B": [math.sin(i * 0.37 + 0.8) for i in range(82)],
    }
    return observation, references


def descriptors(observation: Iterable[float], references: dict[str, list[float]]) -> dict[str, float | None]:
    observation = list(observation)
    return {name: spearman(observation, reference) for name, reference in references.items()}


def reference_results() -> dict:
    substrate, efficacy_a, efficacy_b, threshold = 0.72, 1.40, 0.80, 0.80
    rate, alternative_rate, noise_sd = 0.10, 0.20, 0.10
    observation, references = synthetic_maps()
    # Both states expose exactly the same observation. C and k are absent from O.
    observed_a, observed_b = observation.copy(), observation.copy()
    scores_a, scores_b = descriptors(observed_a, references), descriptors(observed_b, references)
    fa, fb = functional_output(substrate, efficacy_a), functional_output(substrate, efficacy_b)
    return {
        "status": "synthetic conditional demonstration; not clinical or biological data",
        "units": {"substrate": "normalized latent model units, not MRI or neuronal count",
                  "efficacy": "dimensionless toy response efficacy",
                  "functional_output": "normalized useful output, not firing rate",
                  "time": "arbitrary model time", "rate": "inverse arbitrary model time"},
        "parameters": {"S": substrate, "C_A": efficacy_a, "C_B": efficacy_b,
                       "threshold": threshold, "k": rate, "alternative_k": alternative_rate,
                       "per_measurement_noise_sd": noise_sd},
        "observations": {"region_count": len(observation), "vectors_identical": observed_a == observed_b,
                         "max_absolute_difference": max(abs(a-b) for a,b in zip(observed_a, observed_b)),
                         "descriptors_A": scores_a, "descriptors_B": scores_b,
                         "descriptors_identical": scores_a == scores_b},
        "states": {
            "A": {"label": "compensation compatible under toy assumptions", "F": fa,
                  "above_threshold": fa > threshold,
                  "transition_time": transition_time(substrate, efficacy_a, threshold, rate)},
            "B": {"label": "below stipulated useful-output threshold", "F": fb,
                  "above_threshold": fb > threshold,
                  "transition_time": transition_time(substrate, efficacy_b, threshold, rate)}},
        "same_baseline_alternative_rate": {
            "F_A": fa, "k": alternative_rate,
            "transition_time_A": transition_time(substrate, efficacy_a, threshold, alternative_rate)},
        "assays": {
            "structural_observation": {"delta": 0.0, "delta_over_sigma": 0.0},
            "molecular_descriptor": {"delta": 0.0, "delta_over_sigma": 0.0},
            "functional_output": {"delta": abs(fa-fb),
                                  "delta_over_sigma": predicted_separation(fa, fb, noise_sd)},
            "equal_efficacy_control": {"delta_over_sigma": predicted_separation(fa, fa, noise_sd)}},
        "interpretation": "A deterministic score cannot distinguish identical inputs. An independent functional observation may separate this constructed pair; it does not identify a transition clock.",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pretty", action="store_true", help="Indent JSON output")
    args = parser.parse_args()
    print(json.dumps(reference_results(), indent=2 if args.pretty else None, allow_nan=False, sort_keys=True))

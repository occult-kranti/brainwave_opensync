#!/usr/bin/env python3
"""Exact finite checks for YM-T2; standard library only.

These arithmetic checks do not prove a Yang--Mills theorem. The all-N
counterexample is justified analytically in round2.md. No floating-point
eigensolver or theorem prover is used. Fractions retain exact values.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from fractions import Fraction as F
from math import isqrt
from pathlib import Path


def frac(x):
    x = F(x)
    return {"numerator": x.numerator, "denominator": x.denominator}


def matrix(values):
    return [[F(x) for x in row] for row in values]


def mul(a, b):
    return [[sum(a[i][k] * b[k][j] for k in range(2))
             for j in range(2)] for i in range(2)]


def sub(a, b):
    return [[a[i][j] - b[i][j] for j in range(2)] for i in range(2)]


def scale(a, x):
    return [[F(x) * y for y in row] for row in a]


def psd2(a):
    # For a real symmetric 2x2 matrix, nonnegative principal minors
    # are necessary and sufficient for positive semidefiniteness.
    return (a[0][1] == a[1][0] and a[0][0] >= 0 and a[1][1] >= 0
            and a[0][0] * a[1][1] - a[0][1] ** 2 >= 0)


def check(name, predicate):
    if not predicate:
        raise AssertionError(name)
    return {"name": name, "passed": True}


def first_failure_search(g0_fourth, threshold):
    n = 1
    while F(g0_fourth, n ** 4) >= threshold:
        n += 1
    return n


def first_failure_integer_root(g0_fourth, threshold):
    # Largest admitted n satisfies n^4 <= g0^4 / threshold.
    q = F(g0_fourth) / threshold
    largest = isqrt(isqrt(q.numerator // q.denominator))
    return largest + 1


def bare_coupling_admitted(g_fourth, tau_max):
    if g_fourth <= 0:
        raise ValueError("A positive real bare coupling requires g^4 > 0")
    return F(96) / g_fourth <= tau_max


def physical_values(g, a, e_star):
    if g <= 0 or a <= 0 or e_star <= 0:
        raise ValueError("g, a and the fixed reference E_star must be positive")
    alpha = g ** 2 / (2 * a)
    magnetic = F(2) / (g ** 2 * a)
    tau = 24 * magnetic / alpha
    return {
        "alpha": alpha, "lambda": magnetic, "tau": tau,
        "alpha_over_E_star": alpha / e_star,
        "gap_lower_over_E_star_if_admitted": alpha / (16 * e_star),
        "dictionary_product": alpha * magnetic * a ** 2,
    }


def encoded(d):
    return {k: frac(v) for k, v in d.items()}


def run():
    checks = []
    eye = matrix([[1, 0], [0, 1]])
    zero = matrix([[0, 0], [0, 0]])
    projector = matrix([[1, 0], [0, 0]])
    complement = sub(eye, projector)
    checks += [check("P is a projector", mul(projector, projector) == projector)]
    e_star = F(7)
    candidate_gap = F(1, 16)
    spectral = []
    for n in [1, 2, 16, 17, 100, 10000]:
        h = matrix([[0, 0], [0, F(1, n)]])
        fixed = matrix([[0, 0], [0, 1]])
        checks += [
            check(f"H_{n} P = 0", mul(h, projector) == zero),
            check(f"H_{n} exact gap identity", h == scale(complement, F(1, n))),
            check(f"H_{n} positive", psd2(h)),
            check(f"K_{n} positive uniform-gap control", psd2(sub(fixed, complement))),
            check(f"H_{n} candidate-bound verdict", psd2(sub(h, scale(complement, candidate_gap))) == (n <= 16)),
        ]
        # A change of energy units rescales both H and E_star. Multiplying
        # only H while holding E_star fixed changes the physical family.
        s = F(n)
        original_ratio = F(1, n) / e_star
        unit_conversion_ratio = s * F(1, n) / (s * e_star)
        changed_h_ratio = s * F(1, n) / e_star
        checks += [check(f"consistent energy-unit invariance at N={n}", unit_conversion_ratio == original_ratio)]
        if n > 1:
            checks += [check(f"holding E_star while multiplying H is a different ratio at N={n}", changed_h_ratio != original_ratio)]
        spectral.append({
            "N": n, "eigenvalues": [frac(0), frac(F(1, n))],
            "ground_projector": [[1, 0], [0, 0]],
            "gap_over_fixed_E_star": frac(original_ratio),
            "candidate_gap_1_over_16_valid": n <= 16,
            "consistent_unit_conversion_gap_ratio": frac(unit_conversion_ratio),
            "Hamiltonian_multiplied_by_N_fixed_reference_gap_ratio": frac(changed_h_ratio),
        })
    # Arbitrary positive candidate c: N=floor(1/c)+1 gives 1/N < c.
    arbitrary_bound_controls = []
    for c in [F(1, 16), F(1, 1000003), F(3, 7), F(7, 2)]:
        inv = 1 / c
        n = inv.numerator // inv.denominator + 1
        checks += [check(f"candidate lower-bound counterexample c={c}", F(1, n) < c)]
        arbitrary_bound_controls.append({"candidate": frac(c), "N": n, "gap": frac(F(1, n))})

    cap = F(1, 10 ** 8)
    bridge_cap = F(3)
    g4_cap = F(96) / cap
    g4_bridge = F(96) / bridge_cap
    checks += [check("AM2/AX1 cap equivalence", g4_cap == 9600000000),
               check("AL1 bridge equivalence", g4_bridge == 32)]
    boundary = []
    for tau_max, threshold, label in [(cap, g4_cap, "admitted route-B cap"),
                                      (bridge_cap, g4_bridge, "weaker AL1 bridge")]:
        for offset in [-1, 0, 1]:
            g4 = threshold + offset
            verdict = bare_coupling_admitted(g4, tau_max)
            checks += [check(f"{label} threshold offset {offset}", verdict == (offset >= 0))]
            boundary.append({"condition": label, "g_fourth": frac(g4),
                             "tau": frac(F(96) / g4), "tau_max": frac(tau_max),
                             "admitted": verdict})

    thresholds = []
    for g0_fourth, label in [(9600000000, "starts at admitted-cap equality"),
                             (1000000000000, "g_0=1000")]:
        for threshold, tau_max, rule in [(g4_cap, cap, "route-B cap"),
                                         (g4_bridge, bridge_cap, "AL1 bridge")]:
            n = first_failure_search(g0_fourth, threshold)
            root_n = first_failure_integer_root(g0_fourth, threshold)
            checks += [check(f"independent integer-root threshold {label}/{rule}", n == root_n),
                       check(f"last-admitted exact threshold {label}/{rule}", F(g0_fourth, (n-1)**4) >= threshold),
                       check(f"first-rejected exact threshold {label}/{rule}", F(g0_fourth, n**4) < threshold)]
            thresholds.append({
                "trajectory": label, "g0_fourth": frac(g0_fourth),
                "g_n_fourth_definition": "g0_fourth / N^4", "rule": rule,
                "tau_max": frac(tau_max), "g_fourth_min": frac(threshold),
                "last_admitted_N": n - 1, "first_rejected_N": n,
                "tau_last_admitted": frac(F(96 * (n-1)**4, g0_fourth)),
                "tau_first_rejected": frac(F(96 * n**4, g0_fourth)),
                "two_independent_threshold_methods_agree": n == root_n,
            })

    # Keep E_star fixed during the physical length-parameter changes below.
    # Admissibility depends on g only, whereas alpha/E_star changes with a.
    rescalings = []
    for g, expected in [(F(1000), True), (F(250), False)]:
        a = F(3, 5)
        original = physical_values(g, a, e_star)
        for s in [F(1, 1000), F(1), F(1000)]:
            rescaled = physical_values(g, a/s, e_star)
            checks += [
                check(f"dictionary exact for g={g},s={s}", rescaled["dictionary_product"] == 1),
                check(f"tau unchanged under a->a/s, g={g},s={s}", rescaled["tau"] == original["tau"]),
                check(f"alpha scales at fixed E_star, g={g},s={s}", rescaled["alpha_over_E_star"] == s * original["alpha_over_E_star"]),
                check(f"length scaling does not repair admission, g={g},s={s}", (rescaled["tau"] <= cap) == expected),
            ]
            rescalings.append({"g": frac(g), "a": frac(a/s), "length_scale_factor": frac(s),
                               "fixed_E_star": frac(e_star), "admitted_routeB_cap": expected,
                               "values": encoded(rescaled),
                               "gap_formula_status": "inherited certificate applies" if expected else "formal expression only; certificate inapplicable"})

    rejected_domains = []
    for g, a, e, label in [(F(1000), F(1), F(0), "zero reference energy"),
                           (F(0), F(1), F(7), "zero coupling"),
                           (F(1000), F(0), F(7), "zero lattice spacing in finite-a formula")]:
        try:
            physical_values(g, a, e)
        except ValueError:
            checks += [check(f"reject invalid domain: {label}", True)]
            rejected_domains.append(label)
        else:
            raise AssertionError(f"Domain accepted: {label}")

    return {
        "test_id": "YM-T2", "round": 2, "arithmetic": "exact fractions and integer comparisons",
        "comparison_cutoff": "2026-10-21", "execution_date_utc": "2026-10-22",
        "status": "all declared finite arithmetic checks passed",
        "number_of_checks": len(checks), "checks": checks,
        "spectral_counterexample": {
            "family": "H_N=diag(0,1/N), N positive integer",
            "positive_control": "K_N=diag(0,1)", "fixed_E_star": frac(e_star),
            "finite_fixtures": spectral, "candidate_gap_counterexamples": arbitrary_bound_controls,
            "analytic_all_N_argument": "The common ground projector P is fixed. H_N=(I-P)/N, so gap=1/N. For every c>0, N=floor(1/c)+1 gives gap<c. Thus no positive N-uniform gap follows from common ground projector. K_N=I-P has uniform gap 1.",
        },
        "AZ1_dictionary": {
            "alpha": "g^2/(2a)", "lambda": "2/(g^2*a)", "tau": "96/g^4",
            "domain": "a>0, g>0, E_star>0, hbar fixed; positive real bare coupling branch",
            "inherited_gap_if_admitted": "alpha/16 = g^2/(32a)",
            "boundary_checks": boundary, "trajectory_thresholds": thresholds,
            "length_rescaling_fixed_reference": rescalings, "rejected_domains": rejected_domains,
            "claim_boundary": "Failure of a sufficient certificate says nothing about the actual spectral gap outside its admitted domain.",
        },
        "limitations": [
            "No new Yang--Mills estimate is proved; the existing AX1/AQ2 gap is inherited and not rerun.",
            "No floating-point eigensolver, measured data, continuum simulation, Lean or OpenAI manuscript proof was executed.",
            "The exact 2x2 example refutes a bare implication from state convergence to uniform gap; it does not refute BB2/AQ2 with their additional gap hypotheses.",
            "The algebraic g_N=g0/N path is a toy, not a derived asymptotic-freedom trajectory. Any positive g(a)->0 eventually violates the fixed g^4 threshold by the definition of convergence.",
            "Entropy area law, Wilson-loop area law and area parity remain distinct. Family215 finite-domain Lean scope supplies no continuum formalization.",
        ],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("round2-results.json"))
    args = parser.parse_args()
    result = run()
    result["source_code_sha256"] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"checks": result["number_of_checks"], "status": result["status"], "output": str(args.output)}))


if __name__ == "__main__":
    main()

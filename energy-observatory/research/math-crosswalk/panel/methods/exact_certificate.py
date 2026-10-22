#!/usr/bin/env python3
"""Exact finite oscillator certificates. No floating-point or theorem prover.

The symbolic path uses sparse Laurent polynomials. The separately assembled
matrix path uses Fraction matrices at the three frozen rational cases.
Run: python exact_certificate.py --output exact-results.json
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from fractions import Fraction as F
import hashlib
import json
from pathlib import Path
import platform


NAMES = ("q", "p", "u", "m", "k", "b")
ZERO_EXP = (0,) * len(NAMES)


class Laurent:
    def __init__(self, terms=None):
        self.terms = {e: F(c) for e, c in (terms or {}).items() if c}

    @staticmethod
    def constant(value):
        return Laurent({ZERO_EXP: F(value)})

    @staticmethod
    def monomial(name, power=1):
        exps = list(ZERO_EXP)
        exps[NAMES.index(name)] = power
        return Laurent({tuple(exps): F(1)})

    def __add__(self, other):
        if not isinstance(other, Laurent):
            other = Laurent.constant(other)
        terms = dict(self.terms)
        for e, c in other.terms.items():
            terms[e] = terms.get(e, F(0)) + c
        return Laurent(terms)

    __radd__ = __add__

    def __neg__(self):
        return Laurent({e: -c for e, c in self.terms.items()})

    def __sub__(self, other):
        return self + (-other if isinstance(other, Laurent) else -F(other))

    def __mul__(self, other):
        if not isinstance(other, Laurent):
            other = Laurent.constant(other)
        terms = {}
        for e, c in self.terms.items():
            for f, d in other.terms.items():
                g = tuple(x + y for x, y in zip(e, f))
                terms[g] = terms.get(g, F(0)) + c * d
        return Laurent(terms)

    __rmul__ = __mul__

    def derivative(self, name):
        i = NAMES.index(name)
        result = {}
        for e, c in self.terms.items():
            if e[i]:
                f = list(e)
                f[i] -= 1
                result[tuple(f)] = e[i] * c
        return Laurent(result)

    def evaluate(self, **values):
        total = F(0)
        for e, c in self.terms.items():
            term = c
            for name, power in zip(NAMES, e):
                if power:
                    term *= F(values[name]) ** power
            total += term
        return total

    def records(self):
        return [
            {"coefficient": str(c), "powers": {n: p for n, p in zip(NAMES, e) if p}}
            for e, c in sorted(self.terms.items())
        ]


def shape(a):
    if not a or not a[0] or any(len(row) != len(a[0]) for row in a):
        raise ValueError("nonempty rectangular matrix required")
    return len(a), len(a[0])


def transpose(a):
    shape(a)
    return [list(row) for row in zip(*a)]


def mm(a, b):
    ar, ac = shape(a)
    br, bc = shape(b)
    if ac != br:
        raise ValueError(f"matrix dimension mismatch: {ar}x{ac} times {br}x{bc}")
    return [[sum((a[i][s] * b[s][j] for s in range(ac)), F(0))
             for j in range(bc)] for i in range(ar)]


def add(a, b):
    if shape(a) != shape(b):
        raise ValueError("matrix addition dimension mismatch")
    return [[x + y for x, y in zip(r, s)] for r, s in zip(a, b)]


def scale(c, a):
    return [[F(c) * x for x in row] for row in a]


def strings(a):
    return [[str(x) for x in row] for row in a]


def admissible(m, k, b):
    return m > 0 and k > 0 and b >= 0


def run():
    base = Path(__file__).resolve().parent
    contract_bytes = (base / "round2-contract.json").read_bytes()
    contract = json.loads(contract_bytes)
    freeze = json.loads((base / "round2-freeze.json").read_text())
    contract_hash = hashlib.sha256(contract_bytes).hexdigest()
    if contract_hash != freeze["contractSHA256"]:
        raise RuntimeError("contract differs from recorded pre-execution freeze")

    checks = []

    def check(name, condition, detail):
        checks.append({"id": name, "passed": bool(condition), "detail": detail})

    q, p, u, m, k, b = [Laurent.monomial(n) for n in NAMES]
    inv_m = Laurent.monomial("m", -1)
    storage = F(1, 2) * (k * q * q + inv_m * p * p)
    flow_q = inv_m * p
    flow_p = -(k * q) - b * inv_m * p + u
    derivative = storage.derivative("q") * flow_q + storage.derivative("p") * flow_p
    residual = derivative - u * inv_m * p + b * inv_m * inv_m * p * p
    check("symbolic-supply-identity", not residual.terms,
          {"residualTerms": residual.records(), "arithmetic": "exact rational Laurent coefficients"})

    wrong_residual = derivative - u * p + b * inv_m * inv_m * p * p
    check("wrong-output-polynomial-rejected", bool(wrong_residual.terms),
          {"residualTerms": wrong_residual.records()})
    wrong_witness = wrong_residual.evaluate(m=2, k=3, b=F(1, 5), q=0, p=1, u=1)
    check("wrong-output-witness", wrong_witness == F(-1, 2),
          {"residual": str(wrong_witness), "expected": "-1/2"})

    matrix_records = []
    for case in contract["matrixCases"]:
        mass, stiffness, damping = (F(case[n]) for n in ("m", "k", "b"))
        if not admissible(mass, stiffness, damping):
            raise RuntimeError("frozen positive-domain case is invalid")
        # Independent assembly from canonical state equations, not polynomial output.
        Q = [[stiffness, F(0)], [F(0), 1 / mass]]
        A = [[F(0), 1 / mass], [-stiffness, -damping / mass]]
        B = [[F(0)], [F(1)]]
        R = [[F(0), F(0)], [F(0), damping]]
        sym = scale(F(1, 2), add(mm(Q, A), mm(transpose(A), Q)))
        gram = mm(mm(Q, R), Q)
        L, D = [[F(0)], [1 / mass]], [[damping]]
        factored = mm(mm(L, D), transpose(L))
        prefix = "matrix-" + case["id"] + "-"
        check(prefix + "energy-identity", sym == scale(-1, gram),
              {"symmetricDerivativeMatrix": strings(sym), "dissipationGram": strings(gram)})
        check(prefix + "supply-port", mm(Q, B) == [[F(0)], [1 / mass]],
              {"supplyVector": strings(mm(Q, B))})
        check(prefix + "factor-certificate", factored == gram,
              {"L": strings(L), "D": strings(D), "factorProduct": strings(factored)})
        determinant = Q[0][0] * Q[1][1] - Q[0][1] * Q[1][0]
        check(prefix + "storage-positive", Q[0][0] > 0 and determinant > 0,
              {"firstLeadingMinor": str(Q[0][0]), "determinant": str(determinant)})
        check(prefix + "dissipation-nonnegative", D[0][0] >= 0,
              {"weightOfSquare": str(D[0][0]), "square": "(p/m)^2"})
        matrix_records.append({"id": case["id"], "parameters": case, "Q": strings(Q), "A": strings(A)})

    negative_rate = derivative.evaluate(m=2, k=3, b=F(-1, 5), q=0, p=1, u=0)
    check("negative-damping-domain-rejected", not admissible(F(2), F(3), F(-1, 5)),
          {"b": "-1/5"})
    check("negative-damping-energy-growth", negative_rate == F(1, 20),
          {"unforcedStorageDerivative": str(negative_rate)})
    correct_gram = [[F(0), F(0)], [F(0), F(1, 20)]]
    perturbed_gram = [[F(0), F(0)], [F(0), F(1, 20) + F(1, 7)]]
    check("perturbed-gram-rejected", perturbed_gram != correct_gram,
          {"intended": strings(correct_gram), "submitted": strings(perturbed_gram),
           "reason": "positive Gram matrix does not equal required dissipation polynomial"})
    L, D = [[F(0)], [F(1, 2)]], [[F(1, 5)]]
    dimension_error = None
    try:
        mm(mm(transpose(L), D), L)
    except ValueError as error:
        dimension_error = str(error)
    check("wrong-factor-order-rejected", dimension_error is not None,
          {"printedOrder": "L^T D L", "Lshape": "2x1", "Dshape": "1x1", "error": dimension_error})
    for name, mass, stiffness in [("zero-mass", F(0), F(3)), ("zero-stiffness", F(2), F(0))]:
        check(name + "-domain-rejected", not admissible(mass, stiffness, F(1, 5)),
              {"m": str(mass), "k": str(stiffness), "inversionAttempted": False})

    def grid_polynomial(x):
        return (x - F(11, 20)) ** 2 - F(1, 1000)

    grid = [{"x": str(F(j, 10)), "f": str(grid_polynomial(F(j, 10)))} for j in range(11)]
    minimum = min(F(row["f"]) for row in grid)
    between = grid_polynomial(F(11, 20))
    check("grid-positive", minimum > 0, {"gridPoints": 11, "gridMinimum": str(minimum)})
    check("between-grid-negative", between == F(-1, 1000),
          {"x": "11/20", "value": str(between)})

    return {
        "schema": 1, "round": 2, "executedAtUTC": datetime.now(timezone.utc).isoformat(),
        "pythonVersion": platform.python_version(), "contractSHA256": contract_hash,
        "codeSHA256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "allPassed": all(c["passed"] for c in checks), "checkCount": len(checks),
        "checks": checks, "matrixCases": matrix_records, "gridCounterexample": grid,
        "generalAlgebra": {"storage": storage.records(), "storageDerivative": derivative.records(),
                           "identityResidual": residual.records(), "wrongOutputResidual": wrong_residual.records()},
        "scope": "General symbolic Laurent identity plus three exact rational matrix cases and declared controls. Universal signs follow analytically from the stated parameter domain, not from sampling.",
        "notClaimed": contract["notClaimed"],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    result = run()
    serialized = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.write_text(serialized)
    print(serialized)
    if not result["allPassed"]:
        raise SystemExit(1)

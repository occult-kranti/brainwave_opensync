#!/usr/bin/env python3
"""Three frozen operator-based checks, authored before reading producer code.

Uses a joint 4x4 unitary and partial traces. This is a standard dilation also
used by the producer's own checker; independence is authorship and case choice,
not a claim to a uniquely different physical representation.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

import numpy as np

BASE = Path(__file__).resolve().parent
H_PLANCK = 6.62607015e-34


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def metrics(rho, gap):
    eigenvalues = np.linalg.eigvalsh(rho)
    if eigenvalues[0] < -1e-12:
        raise ValueError("nonpositive density matrix")
    energy = float(np.trace(np.diag([0.0, gap]) @ rho).real)
    passive = float(eigenvalues[0] * gap)
    nonzero = eigenvalues[eigenvalues > 0]
    return {
        "densityMatrix": {"real": rho.real.tolist(), "imag": rho.imag.tolist()},
        "energyJ": energy, "passiveEnergyJ": passive,
        "ergotropyJ": energy - passive,
        "entropyNats": float(-np.sum(nonzero * np.log(nonzero))),
    }


def reference(case):
    p, nu, gamma, d = (case[x] for x in ("population", "bathPopulation", "damping", "dephasing"))
    gap = H_PLANCK * case["frequencyHz"]
    offdiag = case["coherence"] * np.sqrt(p * (1 - p)) * np.exp(1j * case["phaseRadians"])
    rho = np.array([[1 - p, offdiag], [np.conj(offdiag), p]], dtype=complex)
    bath = np.diag([1 - nu, nu])
    joint = np.kron(rho, bath)
    c, s = np.sqrt(1 - gamma), np.sqrt(gamma)
    unitary = np.array([[1, 0, 0, 0], [0, c, s, 0], [0, -s, c, 0], [0, 0, 0, 1]], dtype=complex)
    joint_after = unitary @ joint @ unitary.conj().T
    four_axes = joint_after.reshape((2, 2, 2, 2))
    system_after_exchange = np.trace(four_axes, axis1=1, axis2=3)
    bath_after_exchange = np.trace(four_axes, axis1=0, axis2=2)
    Z = np.diag([1, -1])
    final = (1 + d) / 2 * system_after_exchange + (1 - d) / 2 * Z @ system_after_exchange @ Z
    hamiltonian = np.diag([0, gap])
    q_system = float(np.trace(hamiltonian @ (system_after_exchange - rho)).real)
    q_bath = float(np.trace(hamiltonian @ (bath_after_exchange - bath)).real)
    initial_metrics, final_metrics = metrics(rho, gap), metrics(final, gap)
    beta_gap = float(np.log((1 - nu) / nu))
    return {
        "id": case["id"], "gapJ": gap,
        "initial": initial_metrics, "final": final_metrics,
        "heatIntoQubitJ": q_system, "heatIntoBathJ": q_bath,
        "betaGap": beta_gap,
        "entropyProductionNats": final_metrics["entropyNats"] - initial_metrics["entropyNats"] - beta_gap * q_system / gap,
        "operatorChecks": {
            "unitarityError": float(np.max(np.abs(unitary.conj().T @ unitary - np.eye(4)))),
            "jointTraceError": float(abs(np.trace(joint_after) - 1)),
            "systemTraceError": float(abs(np.trace(final) - 1)),
            "heatClosureOverGap": (q_system + q_bath) / gap,
            "dephasingEnergyChangeOverGap": float(np.trace(hamiltonian @ (final - system_after_exchange)).real / gap),
        },
    }


def build_reference():
    contract = json.loads((BASE / "energy-crosscheck-contract.json").read_text())
    freeze = json.loads((BASE / "energy-crosscheck-freeze.json").read_text())
    if digest(BASE / "energy-crosscheck-contract.json") != freeze["contractSHA256"]:
        raise RuntimeError("contract freeze changed")
    return {
        "computedAtUTC": datetime.now(timezone.utc).isoformat(),
        "referenceBeforeProducerImport": True,
        "contractSHA256": freeze["contractSHA256"],
        "referenceCodeSHA256": digest(Path(__file__)),
        "numpyVersion": np.__version__,
        "cases": [reference(c) for c in contract["cases"]],
    }


def compare():
    reference_data = json.loads((BASE / "energy-reference.json").read_text())
    producer_data = json.loads((BASE / "energy-producer-output.json").read_text())
    checks = []
    tolerance = 1e-12

    def check(case_id, metric, actual, expected, normalization=1.0):
        error = float(np.max(np.abs(np.asarray(actual) - np.asarray(expected))) / normalization)
        checks.append({"case": case_id, "metric": metric, "dimensionlessError": error,
                       "passed": bool(np.isfinite(error) and error <= tolerance)})

    for expected, actual_case in zip(reference_data["cases"], producer_data["cases"], strict=True):
        case_id, actual = expected["id"], actual_case["output"]
        if case_id != actual_case["id"]:
            raise RuntimeError("case order mismatch")
        gap = expected["gapJ"]
        check(case_id, "gapJ", actual["gapJ"], gap, gap)
        for state in ("initial", "final"):
            for part in ("real", "imag"):
                check(case_id, state + ".densityMatrix." + part,
                      actual[state]["densityMatrix"][part], expected[state]["densityMatrix"][part])
            for metric in ("energyJ", "passiveEnergyJ", "ergotropyJ"):
                check(case_id, state + "." + metric, actual[state][metric], expected[state][metric], gap)
            check(case_id, state + ".entropyNats", actual[state]["entropyNats"], expected[state]["entropyNats"])
        for metric in ("heatIntoQubitJ", "heatIntoBathJ"):
            check(case_id, metric, actual[metric], expected[metric], gap)
        check(case_id, "entropyProductionNats", actual["entropyProductionNats"], expected["entropyProductionNats"])
        for metric, error in expected["operatorChecks"].items():
            check(case_id, "oracle." + metric, error, 0.0)
    return {
        "comparedAtUTC": datetime.now(timezone.utc).isoformat(),
        "allPassed": all(c["passed"] for c in checks), "checkCount": len(checks),
        "maximumDimensionlessError": max(c["dimensionlessError"] for c in checks),
        "tolerance": tolerance,
        "contractSHA256": reference_data["contractSHA256"],
        "referenceSHA256": digest(BASE / "energy-reference.json"),
        "producerOutputSHA256": digest(BASE / "energy-producer-output.json"),
        "producerCodeSHA256": producer_data["producerCodeSHA256"],
        "checks": checks,
        "scope": "Three frozen cases only, independent author and inputs; no full software audit, channel-capacity result or experiment.",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("phase", choices=("reference", "compare"))
    args = parser.parse_args()
    if args.phase == "reference":
        result = build_reference()
        output = BASE / "energy-reference.json"
    else:
        result = compare()
        output = BASE / "energy-crosscheck-results.json"
    output.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({k: v for k, v in result.items() if k != "cases" and k != "checks"}, indent=2))
    if result.get("allPassed") is False:
        raise SystemExit(1)

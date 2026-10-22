#!/usr/bin/env python3
"""Independent E1 matrix/unitary checker; no producer module imports.

Run from repository root:
  python research/dephasing-work-bound/panel/verification/check_independent.py
"""
from __future__ import annotations

import hashlib
import json
from decimal import Decimal, localcontext
from pathlib import Path

import numpy as np

TOL = 5e-13
RNG = np.random.default_rng(2718281828)
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
H0 = np.diag([0.0, 1.0]).astype(complex)
MAX = {}
COUNTS = {"states": 0, "extraction_unitaries": 0, "sampled_unitaries": 0,
          "epsilon_rescalings": 0}


def require(name, error, tol=TOL):
    error = float(error)
    MAX[name] = max(MAX.get(name, 0.0), error)
    if not np.isfinite(error) or error > tol:
        raise AssertionError(f"{name}: {error} > {tol}")


def scalar_work(p, c, d):
    z = 1.0 - 2.0 * p
    return (np.hypot(z, 2.0 * d * abs(c)) - z) / 2.0


def extraction(p, c, d, sampled=False):
    rho = np.array([[1.0 - p, d * c], [d * c.conjugate(), p]], complex)
    require("hermiticity", np.linalg.norm(rho-rho.conj().T, ord=2))
    require("trace", abs(np.trace(rho)-1.0))
    eig, vec = np.linalg.eigh(rho)
    require("positivity_violation", max(0.0, -eig[0]))
    u = vec[:, ::-1].conj().T
    passive = u @ rho @ u.conj().T
    COUNTS["extraction_unitaries"] += 1
    require("unitarity", np.linalg.norm(u @ u.conj().T-np.eye(2), ord=2))
    require("passive_diagonalization", np.linalg.norm(passive-np.diag(eig[::-1]), ord=2))
    require("spectrum_preservation", np.max(abs(np.linalg.eigvalsh(passive)-eig)))
    require("passive_order", max(0.0, passive[1,1].real-passive[0,0].real))
    before = np.trace(H0 @ rho)
    after = np.trace(H0 @ passive)
    require("energy_imaginary", max(abs(before.imag), abs(after.imag)))
    require("minimum_energy", abs(after.real-eig[0]))
    work = (before-after).real
    require("work_nonnegative", max(0.0, -work))
    require("characteristic_polynomial_work", abs(work-scalar_work(p,c,d)))
    for eps in (1.0, 1e-23, 1e23):
        actual_joules = np.trace((eps*H0) @ rho)-np.trace((eps*H0) @ passive)
        require("normalized_joule_accounting", abs(actual_joules/eps-work))
        COUNTS["epsilon_rescalings"] += 1
    if sampled:
        for _ in range(7):
            random_matrix = RNG.normal(size=(2,2)) + 1j*RNG.normal(size=(2,2))
            q, _ = np.linalg.qr(random_matrix)
            require("sampled_unitarity", np.linalg.norm(q @ q.conj().T-np.eye(2),ord=2))
            energy = np.trace(H0 @ q @ rho @ q.conj().T).real
            require("random_unitary_beats_passive", max(0.0, after.real-energy))
            COUNTS["sampled_unitaries"] += 1
    return float(work)


def check_state(p, c, d, sampled=False):
    COUNTS["states"] += 1
    c = complex(c)
    require("input_positivity_violation", max(0.0, abs(c)**2-p*(1-p)))
    w1 = extraction(p,c,1.0,sampled)
    wd = extraction(p,c,d,sampled)
    loss, bound = w1-wd, abs(c)*(1-d)
    require("loss_nonnegative", max(0.0,-loss))
    require("upper_bound_violation", max(0.0,loss-bound))
    if c == 0 or d == 1:
        require("trivial_lower_equality", abs(loss))
    if c == 0 or d == 1 or p == 0.5:
        require("predicted_upper_equality", abs(loss-bound))
    return {"p":p,"c_real":c.real,"c_imag":c.imag,"d":d,
            "work1":w1,"workd":wd,"loss":loss,"bound":bound}


def decimal_extraction(p, c, d):
    """400-digit real-symmetric special cases, including explicit rotation.

    Decimal replaces unavailable mpmath. Complex-phase coverage remains in
    numpy tests. The two scalar eigenvalues determine a normalized eigenvector;
    the explicit orthogonal extraction matrix is applied in energy accounting.
    """
    a, b, q = 1-p, p, c*d
    delta = ((a-b)**2+4*q*q).sqrt()
    lp, lm = (1+delta)/2, (1-delta)/2
    # Choose a component pair that avoids subtracting the larger diagonal
    # entry from its nearby eigenvalue when coherence is tiny.
    x, y = (lp-b, q) if a >= b else (q, lp-a)
    norm = (x*x+y*y).sqrt()
    x, y = x/norm, y/norm
    # U = [[x,y],[-y,x]]; row 1 maps v_plus to the ground state.
    assert abs(x*x+y*y-1) < Decimal("1e-390")
    assert abs(a*x+q*y-lp*x) < Decimal("1e-390")
    assert abs(q*x+b*y-lp*y) < Decimal("1e-390")
    passive_ground = x*x*a+2*x*y*q+y*y*b
    passive_excited = y*y*a-2*x*y*q+x*x*b
    assert abs(passive_ground-lp) < Decimal("1e-390")
    assert abs(passive_excited-lm) < Decimal("1e-390")
    return p-passive_excited, delta


def high_precision_cases():
    results = []
    with localcontext() as ctx:
        ctx.prec = 400
        for ptxt, ctxt, dtxt in [("0.25","1e-150","0.2"),
                                 ("0.5","1e-150","0.2"),
                                 ("0.25","0.3",str(np.nextafter(1.0,0.0)))]:
            # Reconstruct the *same* binary64 inputs exactly, avoiding the
            # common error of comparing a printed decimal with another real.
            p,c,d = [Decimal.from_float(float(t)) for t in (ptxt,ctxt,dtxt)]
            w1,r1 = decimal_extraction(p,c,Decimal(1))
            wd,rd = decimal_extraction(p,c,d)
            loss, bound = w1-wd, c*(1-d)
            stable = 2*c*c*(1-d*d)/(r1+rd)
            assert loss > 0 and loss <= bound
            assert abs(loss-stable) < abs(stable)*Decimal("1e-80")
            floating = check_state(float(p),float(c),float(d))
            results.append({"p":ptxt,"c":ctxt,"d":dtxt,
                            "uses_exact_binary64_input_values":True,
                            "decimal_matrix_loss":format(loss,".30E"),
                            "decimal_upper_bound":format(bound,".30E"),
                            "float64_matrix_loss":floating["loss"]})
    assert results[0]["float64_matrix_loss"] == 0.0
    assert results[1]["float64_matrix_loss"] == 0.0
    return results


def main():
    fixed = 0
    populations = [0.,np.nextafter(0.,1.),1e-12,.01,.25,
                   np.nextafter(.5,0.),.5,np.nextafter(.5,1.),.75,
                   1-1e-12,1.]
    damping = [0.,.2,.8,np.nextafter(1.,0.),1.]
    phases = [0.,.37,np.pi/2,np.pi,3*np.pi/2]
    for p in populations:
        cap = np.sqrt(p*(1-p))
        mags = sorted(set([0.,min(1e-150,cap),min(1e-12,cap),
                           cap*.37,np.nextafter(cap,0.),cap]))
        for r in mags:
            for phase in phases:
                for d in damping:
                    check_state(p,r*np.exp(1j*phase),d)
                    fixed += 1
    for _ in range(1200):
        p = float(RNG.uniform())
        c = np.sqrt(p*(1-p))*RNG.uniform()*np.exp(1j*RNG.uniform(-np.pi,np.pi))
        check_state(p,c,float(RNG.uniform()),sampled=True)

    # Two plausible incorrect physical/mathematical substitutions must fail.
    off_equator = check_state(.25,.3*np.exp(.73j),.2)
    balanced = check_state(.5,.3*np.exp(.73j),.2)
    false_exact_bound_error = abs(off_equator["loss"]-off_equator["bound"])
    assert false_exact_bound_error > 1e-3
    assert abs(balanced["loss"]-balanced["bound"]) < TOL
    swap_only_work = max(0.,2*off_equator["p"]-1.)
    restricted_control_error = abs(off_equator["work1"]-swap_only_work)
    assert restricted_control_error > 1e-3
    precision = high_precision_cases()
    manifest = {}
    for rel in ["research/dephasing-work-bound/contract.md",
                "research/dephasing-work-bound/panel/verification/predeclared.md",
                "research/dephasing-work-bound/panel/verification/check_independent.py"]:
        manifest[rel] = hashlib.sha256((ROOT/rel).read_bytes()).hexdigest()
    result = {"status":"PASS", "numpy_version":np.__version__,"seed":2718281828,
              "normalized_absolute_tolerance":TOL,"fixed_grid_states":fixed,
              "counts":COUNTS,"maximum_normalized_residuals":MAX,
              "wrong_model_controls":{
                  "false_exact_upper_bound_rejected_by":false_exact_bound_error,
                  "balanced_symmetry_preserved":True,
                  "swap_only_control_rejected_by":restricted_control_error},
              "high_precision":precision,"source_sha256":manifest,
              "limitations":["Numerical samples do not prove the all-parameter theorem.",
                              "Float64 zeros cannot identify exact equality.",
                              "High-precision cases reconstruct binary64 input values exactly; unrepresentable distinctions must be specified before float conversion."]}
    print(json.dumps(result,indent=2,sort_keys=True))


if __name__ == "__main__":
    main()

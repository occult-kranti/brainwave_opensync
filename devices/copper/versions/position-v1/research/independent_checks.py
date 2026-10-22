#!/usr/bin/env python3
"""Independent counterexamples for position spectroscopy; synthetic, not lab data.

No producer files are imported. Python standard library only. Run:
  python independent_checks.py --output independent-results.json
"""
import argparse
import cmath
import json
import math
import random
from fractions import Fraction
from pathlib import Path


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def contrast(sequence, values):
    a = [v for p, v in zip(sequence, values) if p == 'A']
    b = [v for p, v in zip(sequence, values) if p == 'B']
    require(len(a) == len(b) == 2, 'Two observations per position required')
    return sum(b) / 2 - sum(a) / 2


def fixed_poles_response(f, residues, modes=(1000.0, 1100.0), q=80.0):
    # Generalized displacement / generalized force, normalized modal masses=1.
    # Residues encode position-dependent forcing/observation projections.
    w = 2 * math.pi * f
    return sum(r / ((2 * math.pi * f0) ** 2 - w*w
                    + 1j*w*(2 * math.pi*f0)/q)
               for r, f0 in zip(residues, modes))


def support_modes(coupling):
    # M=diag(m_s,m_t), K=[[k_s+k_c,-k_c],[-k_c,k_t+k_c]].
    # Positive masses and stiffnesses imply a positive definite passive model.
    ms, mt = 0.01, 0.05  # kg: illustrative modal masses, not a copper fit
    ks = ms * (2 * math.pi * 1000.0) ** 2
    kt = mt * (2 * math.pi * 900.0) ** 2
    aa = (ks + coupling) / ms
    dd = (kt + coupling) / mt
    bb = -coupling / math.sqrt(ms*mt)
    disc = math.hypot(aa-dd, 2*bb)
    eigs = ((aa+dd-disc)/2, (aa+dd+disc)/2)
    return [math.sqrt(v)/(2*math.pi) for v in eigs]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--output', type=Path, required=True)
    args = ap.parse_args()
    checks = []

    delta, drift = Fraction(3, 8), Fraction(7, 13)
    estimates = {}
    for seq in ('ABBA', 'BAAB', 'AABB'):
        values = [Fraction(1000) + delta*(p == 'B') + drift*t
                  for t, p in enumerate(seq)]
        estimates[seq] = contrast(seq, values)
    require(estimates['ABBA'] == delta == estimates['BAAB'], 'Balanced reversal must cancel linear drift')
    require(estimates['AABB'] - delta == 2*drift, 'AABB negative control must expose drift')
    checks.append({'name':'linear_drift_and_wrong_order_control','passed':True,
                   'true_shift_Hz':float(delta),'ABBA_Hz':float(estimates['ABBA']),
                   'BAAB_Hz':float(estimates['BAAB']),
                   'AABB_bias_Hz':float(estimates['AABB']-delta)})

    qdrift = Fraction(1, 9)
    quadratic = {}
    times = [Fraction(2*t-3, 2) for t in range(4)]
    for seq in ('ABBA','BAAB'):
        values = [Fraction(1000)+delta*(p=='B')+qdrift*t*t
                  for t,p in zip(times,seq)]
        quadratic[seq] = contrast(seq, values)-delta
    require(quadratic['ABBA'] == -2*qdrift and quadratic['BAAB'] == 2*qdrift,
            'A single reversal block does not cancel curvature')
    checks.append({'name':'quadratic_drift_limitation','passed':True,
                   'ABBA_bias_Hz':float(quadratic['ABBA']),
                   'BAAB_bias_Hz':float(quadratic['BAAB']),
                   'scope':'Opposite signs cancel only for matched curvature and symmetric timing; inspect actual timestamps.'})

    rng = random.Random(20261021)
    order = ['ABBA']*10+['BAAB']*10
    rng.shuffle(order)
    require(order.count('ABBA') == order.count('BAAB') == 10, 'Unbalanced block schedule')
    checks.append({'name':'prospective_example_schedule','passed':True,
                   'seed':20261021,'blocks':order,
                   'scope':'Illustrative 20-block schedule. Choose sample size from a pilot before final data.'})

    grid = [900.0+i*0.01 for i in range(30001)]
    peaks = []
    for residues in ((1.0,0.10),(0.10,1.0)):
        peak=max(grid,key=lambda f:abs(fixed_poles_response(f,residues)))
        peaks.append(peak)
    require(peaks[1]-peaks[0] > 90, 'Residue-switch counterexample lost')
    checks.append({'name':'largest_peak_is_not_mode_identity','passed':True,
                   'same_undamped_poles_Hz':[1000,1100], 'Q':80,
                   'residues_A':[1,0.1],'residues_B':[0.1,1],
                   'largest_peak_A_Hz':peaks[0],'largest_peak_B_Hz':peaks[1],
                   'apparent_peak_shift_Hz':peaks[1]-peaks[0],
                   'intrinsic_pole_shift_Hz':0,
                   'scope':'Synthetic two-mode observation. The frequency grid determines peak display precision.'})

    first = support_modes(1000)
    unchanged = support_modes(1000)
    changed = support_modes(10000)
    require(first == unchanged, 'Coordinate labels cannot change eigenvalues')
    require(max(abs(a-b) for a,b in zip(first,changed)) > 1,
            'Changed support stiffness should change coupled modes')
    checks.append({'name':'translation_vs_boundary_change','passed':True,
                   'coupling_A_N_per_m':1000,'coupling_B_N_per_m':10000,
                   'modes_A_Hz':first,'same_system_translated_Hz':unchanged,
                   'changed_support_modes_B_Hz':changed,
                   'scope':'Synthetic 2-DOF passive model, not fitted copper or table data.'})

    # GUM covariance check for the difference of two frequency estimates.
    ua=ub=0.5
    r=0.9
    independent_var=ua*ua+ub*ub
    correlated_var=independent_var-2*r*ua*ub
    require(0 < correlated_var < independent_var, 'Covariance term sign wrong')
    require(abs(correlated_var-0.05)<1e-14, 'Covariance arithmetic wrong')
    checks.append({'name':'covariance_in_frequency_difference','passed':True,
                   'u_A_Hz':ua,'u_B_Hz':ub,'correlation':r,
                   'u_difference_Hz':math.sqrt(correlated_var),
                   'uncorrelated_assumption_Hz':math.sqrt(independent_var),
                   'scope':'Assumed example correlation, not measured instrument uncertainty.'})

    # Shared frequency-scale calibration error acts on the difference.
    fa, fb, epsilon = 100000.0, 100000.3, 1e-6
    measured_difference=(1+epsilon)*fb-(1+epsilon)*fa
    expected=(1+epsilon)*(fb-fa)
    require(abs(measured_difference-expected)<2e-11, 'Shared-clock propagation failed')
    checks.append({'name':'shared_clock_correlation','passed':True,
                   'scale_error':epsilon,'true_difference_Hz':fb-fa,
                   'observed_difference_Hz':measured_difference,
                   'scope':'Same constant clock error during both records. Differential clock drift remains a separate input.'})

    # f=C(nu)/R * sqrt(E/rho). With fixed nu/E and isotropic expansion at
    # constant mass, rho scales R^-3, so f scales sqrt(R); this checks that
    # a geometry-only -alpha formula is not silently mixed with density change.
    radius_ratio = 1.0001
    density_ratio = radius_ratio**-3
    frequency_ratio = (1/radius_ratio)*math.sqrt(1/density_ratio)
    require(abs(frequency_ratio-math.sqrt(radius_ratio))<1e-14,'Thermal bookkeeping inconsistent')
    checks.append({'name':'thermal_scaling_bookkeeping','passed':True,
                   'radius_ratio':radius_ratio,'frequency_ratio_if_E_and_nu_fixed':frequency_ratio,
                   'scope':'Bookkeeping control only. Actual copper E(T), nu(T), and thermal state must be measured or sourced.'})

    result={'status':'passed','provenance':'Independent skeptic; no producer imports',
            'kind':'synthetic mathematical controls; no physical experiment has been run',
            'checks_count':len(checks),'checks':checks}
    args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'status':result['status'],'checks_count':len(checks),'output':str(args.output)}))


if __name__=='__main__':
    main()

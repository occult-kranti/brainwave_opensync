#!/usr/bin/env python3
"""Executed software adapters for the Location Spectrum Lab.

Synthetic fixtures only. Install the pinned optional dependencies documented in
research/tool-integration.md; nothing here drives hardware. External libraries
are imported, not copied into the website. Run from any directory.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.metadata
import json
from pathlib import Path
import platform
import tempfile
import warnings

import numpy as np
import scipy
from scipy import linalg, optimize, signal, special
import pyFRF
import pyuff
from skfem import MeshLine, Basis, ElementLineP1, BilinearForm, asm

ROOT = Path(__file__).resolve().parents[1]
CHECKS = []
RUNS = []


def check(name, passed, observed, criterion):
    CHECKS.append(dict(id=name, pass_=bool(passed), observed=observed, criterion=criterion))


def safe_frf(fs, excitation, response):
    """Lab input contract; do not treat missing input energy as a measured FRF."""
    ex, re = np.asarray(excitation, dtype=float), np.asarray(response, dtype=float)
    if not np.isfinite(fs) or fs <= 0:
        raise ValueError('sampling frequency must be positive and finite')
    if ex.shape != re.shape or ex.ndim not in (1, 2) or ex.shape[-1] < 16:
        raise ValueError('matching real arrays with at least 16 samples are required')
    if not np.isfinite(ex).all() or not np.isfinite(re).all() or not np.any(ex):
        raise ValueError('finite channels and nonzero excitation are required')
    return pyFRF.FRF(fs, ex, re, exc_type='f', resp_type='d', window='none',
                     nperseg=ex.shape[-1], noverlap=0, fft_len=ex.shape[-1], copy=True)


def frf_bench():
    rng = np.random.default_rng(20261022)
    fs, n, records = 192000, 4096, 48
    f = np.fft.rfftfreq(n, 1 / fs)
    w = 2 * np.pi * f
    f0, zeta, modal_mass = 23317.724126, 0.008, 0.111233599
    wn = 2 * np.pi * f0
    known = 1 / (modal_mass * (wn**2 - w**2 + 2j * zeta * wn * w))
    excitation = rng.normal(size=(records, n))
    # Periodic steady-state fixtures: no startup transient, nonlinear response,
    # leakage, sensor dynamics or analog antialias filter is being simulated.
    response = np.fft.irfft(np.fft.rfft(excitation) * known, n=n)
    obj = safe_frf(fs, excitation, response)
    recovered = obj.get_FRF(frf_estimator='H1', frf_form='receptance')[0, 0]
    band = (f > 1000) & (f < 80000)
    relative = float(np.max(np.abs(recovered[band] / known[band] - 1)))
    check('frf_known_complex_transfer', relative < 2e-12, relative, 'max relative complex error < 2e-12, 1–80 kHz')

    noisy = response + 0.35 * np.std(response) * rng.normal(size=response.shape)
    nobj = safe_frf(fs, excitation, noisy)
    h1 = nobj.get_FRF(frf_estimator='H1', frf_form='receptance')[0, 0]
    coh = nobj.get_coherence()[0]
    opts = dict(fs=fs, window='boxcar', nperseg=n, noverlap=0, nfft=n, detrend='constant')
    _, pxy = signal.csd(excitation, noisy, **opts)
    _, pxx = signal.welch(excitation, **opts)
    _, pyy = signal.welch(noisy, **opts)
    independent = pxy.mean(axis=0) / pxx.mean(axis=0)
    independent_coh = abs(pxy.mean(axis=0))**2 / (pxx.mean(axis=0) * pyy.mean(axis=0))
    herror = float(np.max(abs(h1[band] - independent[band])) / np.max(abs(independent[band])))
    cerror = float(np.max(abs(coh[band] - independent_coh[band])))
    check('frf_scipy_crosscheck', herror < 1e-12, herror, 'normalized max complex difference < 1e-12')
    check('coherence_scipy_crosscheck', cerror < 1e-12, cerror, 'absolute difference < 1e-12')
    check('coherence_bounds', bool(np.min(coh[band]) >= -1e-12 and np.max(coh[band]) <= 1 + 1e-12),
          [float(np.min(coh[band])), float(np.max(coh[band]))], 'averaged magnitude-squared coherence in [0,1], allowing roundoff')
    one = safe_frf(fs, excitation[0], noisy[0]).get_coherence()[0]
    unity_error = float(np.max(abs(one[band] - 1)))
    check('single_record_false_assurance', unity_error < 1e-12, unity_error,
          'one unaveraged periodogram has unity coherence even with independent output noise')
    check('averaging_exposes_noise', float(np.median(coh[band])) < .9, float(np.median(coh[band])),
          '48-record median coherence < 0.9 for this noise fixture')
    RUNS.append(dict(id='frf', title='Known transfer and coherence trap', tool='pyFRF + SciPy', status='executed',
                     result=f'Known complex transfer recovered to {relative:.2e}; a single record still reports unity coherence despite added noise.',
                     metrics=dict(sampleRateHz=fs, samplesPerRecord=n, records=records, selectedModeHz=f0,
                                  maxRelativeComplexError=relative, scipyFRFDifference=herror,
                                  scipyCoherenceDifference=cerror, averagedMedianCoherence=float(np.median(coh[band])),
                                  singleRecordUnityError=unity_error),
                     limit='Periodic synthetic linear response. No measured sphere data; unity coherence is not a calibration or validity certificate.'))

    # Duplicate excitation channels span rank 1, though an API returns two coefficients.
    mimo = pyFRF.FRF(fs, np.stack([excitation, excitation], axis=1), response[:, None, :],
                    exc_type='f', resp_type='d', window='none', nperseg=n, noverlap=0, copy=True)
    hm = mimo.get_FRF(frf_estimator='H1', frf_form='receptance')[0]
    sum_error = float(np.max(abs((hm[0, band] + hm[1, band]) / known[band] - 1)))
    check('duplicate_inputs_predict_sum', sum_error < 2e-12, sum_error, 'sum of two fitted transfers recovers known response < 2e-12')
    kernel_residual = float(np.linalg.norm(np.stack([excitation[0], excitation[0]], axis=1) @ np.array([1., -1.])))
    check('duplicate_inputs_have_kernel', kernel_residual == 0, kernel_residual, 'explicit kernel witness [1,-1] for rank-one two-input design')
    RUNS.append(dict(id='rank', title='A good fit can hide an unidentifiable input', tool='pyFRF + NumPy', status='executed',
                     result='Two duplicate drive channels fit the output, but only their summed transfer is identifiable: rank 1, nullity 1.',
                     metrics=dict(inputDimension=2, rank=1, nullity=1, kernel=[1,-1], kernelResidual=kernel_residual,
                                  sumRelativeError=sum_error),
                     limit='The pseudoinverse selects one coefficient pair; it does not recover a physically unique pair.'))
    for name, ex, re in [('zero_excitation', np.zeros(n), response[0]),
                         ('nonfinite_response', excitation[0], np.full(n, np.nan)),
                         ('mismatched_lengths', excitation[0, :-1], response[0])]:
        rejected = False
        try:
            safe_frf(fs, ex, re)
        except ValueError:
            rejected = True
        check('input_contract_' + name, rejected, rejected, 'lab wrapper rejects invalid records before estimator')
    return f, recovered


def radial_fem(elements, radius=.04445, young=123.5e9, poisson=.35, rho=8960.):
    """Radial-only 3D isotropic strain energy, assembled on a 1D radial mesh."""
    mu = young / (2 * (1 + poisson))
    lam = young * poisson / ((1 + poisson) * (1 - 2 * poisson))
    mesh = MeshLine(np.linspace(0, radius, elements + 1))
    basis = Basis(mesh, ElementLineP1(), intorder=4)

    @BilinearForm
    def stiffness(u, v, w):
        r = w.x[0]
        du, dv = u.grad[0], v.grad[0]
        return 4 * np.pi * (lam * (r * du + 2 * u) * (r * dv + 2 * v)
                           + 2 * mu * (r*r * du * dv + 2 * u * v))

    @BilinearForm
    def mass(u, v, w):
        return 4 * np.pi * rho * w.x[0]**2 * u * v

    # u(0)=0 follows radial regularity; no outer displacement constraint means
    # the variational natural boundary is zero radial traction at r=R.
    k, m = asm(stiffness, basis).toarray()[1:, 1:], asm(mass, basis).toarray()[1:, 1:]
    eigen, vec = linalg.eigh(k, m, subset_by_index=(0, 2))
    residual = np.linalg.norm(k @ vec[:,0] - eigen[0] * m @ vec[:,0]) / (
        np.linalg.norm(k @ vec[:,0]) + abs(eigen[0]) * np.linalg.norm(m @ vec[:,0]))
    return np.sqrt(eigen) / (2 * np.pi), float(residual)


def fem_bench():
    young, poisson, rho, radius = 123.5e9, .35, 8960., .04445
    cl = np.sqrt(young * (1-poisson) / (rho * (1+poisson) * (1-2*poisson)))
    ratio = (1-2*poisson) / (2*(1-poisson))
    equation = lambda x: x * special.spherical_jn(0, x) - 4*ratio*special.spherical_jn(1, x)
    xs = np.linspace(.01, 12, 2000)
    brackets = [(a,b) for a,b in zip(xs[:-1],xs[1:]) if equation(a)*equation(b)<0]
    roots = np.array([optimize.brentq(equation,a,b,xtol=1e-14) for a,b in brackets[:3]])
    truth = roots * cl / (2*np.pi*radius)
    convergence = []
    for elements in (16, 32, 64, 128, 256):
        computed, residual = radial_fem(elements)
        convergence.append(dict(elements=elements, frequenciesHz=computed.tolist(),
                                relativeErrors=(computed/truth-1).tolist(), equationResidual=residual))
    errors = np.array([r['relativeErrors'] for r in convergence])
    check('fem_first_three_radial_modes', float(np.max(abs(errors[-1]))) < 7e-5,
          float(np.max(abs(errors[-1]))), '256-element first-three radial relative errors < 7e-5')
    check('fem_refinement_convergence', bool(np.all(np.diff(abs(errors),axis=0)<0)),
          abs(errors).tolist(), 'each of first three radial errors decreases at each refinement')
    check('fem_ritz_upper_approach', bool(np.all(errors > -1e-10)), errors.tolist(),
          'conforming radial Ritz frequencies approach analytic values from above')
    double_radius,_ = radial_fem(64, radius=2*radius)
    four_stiffness,_ = radial_fem(64, young=4*young)
    base = np.array(convergence[2]['frequenciesHz'])
    scale_error = float(max(np.max(abs(double_radius/base-.5)),np.max(abs(four_stiffness/base-2))))
    check('fem_physical_scaling', scale_error < 1e-9, scale_error, 'doubling R halves f; quadrupling E doubles f, fixed nu and rho')
    check('fem_eigen_equation', max(r['equationResidual'] for r in convergence) < 1e-9,
          max(r['equationResidual'] for r in convergence), 'normalized Kq−lambda Mq residual < 1e-9')
    RUNS.append(dict(id='fem', title='Radial elastic finite-element convergence', tool='scikit-fem + SciPy', status='executed',
                     result=f'First three radial modes converge over 16–256 elements; finest maximum relative error {np.max(abs(errors[-1])):.2e}.',
                     metrics=dict(analyticFrequenciesHz=truth.tolist(), radialMeshLevels=convergence,
                                  maxFinestRelativeError=float(np.max(abs(errors[-1]))), scaleError=scale_error),
                     limit='Radial symmetry is imposed. This is not a full 3D mesh or a spectrum of torsional, quadrupolar, support, seam or anisotropic modes.'))


def uff_bench(freq, transfer):
    sel = slice(1, -1)
    x, y = freq[sel].copy(), transfer[sel].copy()
    results = []
    for binary in (0, 1):
        with tempfile.TemporaryDirectory(prefix='sphere-uff-') as tmp:
            path = Path(tmp) / 'synthetic-frf.uff'
            data = pyuff.prepare_58(binary=binary, func_type=4, rsp_node=1, rsp_dir=1,
                ref_node=2, ref_dir=1, data=y, x=x, id1='SIMULATED sphere benchmark',
                id2='displacement per input force; not measured', rsp_ent_name='sphere', ref_ent_name='drive',
                abscissa_spacing=1, abscissa_spec_data_type=18, abscissa_axis_units_lab='Hz',
                ordinate_spec_data_type=8, ordinate_len_unit_exp=1, ordinate_axis_units_lab='m',
                orddenom_spec_data_type=13, orddenom_force_unit_exp=1, orddenom_axis_units_lab='N')
            # Fresh temporary path + add avoids the 2.5.8 binary overwrite path,
            # which reopens wb and wt and truncates the header/data in this run.
            # Do not silently patch the installed third-party library.
            pyuff.UFF(str(path)).write_sets(data, mode='add')
            restored = pyuff.UFF(str(path)).read_sets(0)
            rel = float(np.max(abs(restored['data']-y))/np.max(abs(y)))
            axis_error = float(np.max(abs(restored['x']-x)))
            labels = restored['abscissa_axis_units_lab'].strip()=='Hz' and restored['ordinate_axis_units_lab'].strip()=='m' and restored['orddenom_axis_units_lab'].strip()=='N'
            check(f'uff58_{binary}_roundtrip', rel < 1e-10 and axis_error < 1e-9 and labels,
                  dict(relativeComplexError=rel,frequencyAxisErrorHz=axis_error,unitLabelsPreserved=labels),
                  'complex relative error < 1e-10, axis error < 1e-9 Hz and Hz/m/N metadata preserved')
            results.append(dict(binary=bool(binary),relativeComplexError=rel,frequencyAxisErrorHz=axis_error,unitLabelsPreserved=labels))
    RUNS.append(dict(id='uff',title='Calibrated-channel exchange format',tool='pyuff',status='executed',
                     result='ASCII and binary UFF58 roundtrips preserve the synthetic complex FRF and explicit Hz, m, N labels.',
                     metrics=dict(points=len(x),formats=results),
                     limit='Uniform frequency grid explicitly encoded. Uneven-grid ASCII rounded high frequencies in the initial run; use binary or audit precision for irregular grids. No sensor calibration or cross-vendor compatibility test.'))


def provenance():
    import skfem
    items = [
        ('pyFRF','MIT','Complex H1 transfer and coherence from paired excitation/response records.',pyFRF.__file__),
        ('scikit-fem','BSD-3-Clause','Radial elastic weak-form assembly.',skfem.__file__),
        ('pyuff','MIT','UFF58 measurement-data interchange.',pyuff.__file__),
        ('numpy','BSD-3-Clause','Array operations, FFTs and rank witness.',np.__file__),
        ('scipy','BSD-3-Clause','Independent CSD/coherence, roots and eigenproblem.',scipy.__file__),
    ]
    out=[]
    for name,license,role,source in items:
        out.append(dict(name=name,version=importlib.metadata.version(name),license=license,status='executed',role=role,
                        limitation='Executed on the declared synthetic fixtures only.',
                        installedModuleSHA256=hashlib.sha256(Path(source).read_bytes()).hexdigest()))
    return out


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,default=ROOT/'research'/'tool-bench.json')
    args=parser.parse_args()
    with warnings.catch_warnings(record=True) as emitted:
        warnings.simplefilter('always')
        f,h=frf_bench()
        fem_bench()
        uff_bench(f,h)
    checks=[{'id':c['id'],'pass':c['pass_'],'observed':c['observed'],'criterion':c['criterion']} for c in CHECKS]
    report=dict(snapshot='2026-10-22',scope='Synthetic software-adapter and radial-model benchmarks; no physical measurements.',
                environment=dict(python=platform.python_version(),numpy=np.__version__,scipy=scipy.__version__),
                summary=dict(checksPassed=sum(c['pass'] for c in checks),checksTotal=len(checks),physicalMeasurements=0),
                tools=provenance(),runs=RUNS,checks=checks,
                warnings=sorted(set(('ResourceWarning: pyuff binary writer left a temporary-file handle unclosed; captured during cleanup.'
                                     if 'unclosed file' in str(w.message) else str(w.message)) for w in emitted)),
                limitations=['No full-spectrum capture or absolute-location inference.',
                             'No full 3D sphere/contact/air model; FEM is an explicitly radial subspace.',
                             'pyFRF and SciPy checks share FFT foundations; analytic transfer and FEM/Bessel comparisons provide additional distinct formulations.',
                             'No third-party code is vendored; Python tools run offline, not in the browser.',
                             'No exhaustive software audit, hardware validation, neural-operator training, or measured-data fit.'],
                failuresAndRepairs=[
                    {'stage':'optional isolated installation','observation':'--no-deps installation of pyFRF required sdypy-sep005; installed 1.0.1 before running the bench.','status':'resolved'},
                    {'stage':'pyEMA inspection','observation':'pyEMA 0.31.0 redirects to sdypy-ema; importing the latter first lacked tqdm. Import succeeded after adding it, but this package is not part of these accepted benchmark results.','status':'imported, not benchmarked'},
                    {'stage':'UFF58 binary overwrite','observation':'pyuff 2.5.8 mode=overwrite produced a 7-byte terminator-only file; source reopens wb and wt. Fresh temporary file with mode=add passes the roundtrip without changing vendor code.','status':'adapter workaround tested'},
                    {'stage':'UFF58 uneven ASCII frequency precision','observation':'Default uneven-grid ASCII writes frequencies with 6 significant digits; initial roundtrip failed the 1e-9 Hz axis contract. This fixture is uniform, so the adapter now explicitly sets abscissa_spacing=1. Binary remains preferred for irregular precise axes.','status':'uniform-grid encoding tested; irregular ASCII limitation retained'}])
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(report,indent=2,allow_nan=False)+'\n')
    print(json.dumps(report['summary']))
    for r in RUNS: print(r['title']+': '+r['result'])
    failed=[c['id'] for c in checks if not c['pass']]
    if failed: raise SystemExit('FAILED: '+', '.join(failed))


if __name__=='__main__': main()

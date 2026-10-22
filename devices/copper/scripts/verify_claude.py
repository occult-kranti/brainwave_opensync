#!/usr/bin/env python3
"""Source-pinned cross-formulation checks; numerical agreement is not physical validation."""
from pathlib import Path
import argparse
import hashlib
import importlib.util
import json
import math
import subprocess
import sys

import numpy as np
from scipy.optimize import brentq
from scipy.special import spherical_jn, spherical_yn

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'imports/bashar-index-e628974/experiments/frequency-of-place'
spec = importlib.util.spec_from_file_location('claude_sphere_modes', SOURCE / 'sphere_modes.py')
claude = importlib.util.module_from_spec(spec)
spec.loader.exec_module(claude)


def fingerprint(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def radial_shell_frequency(ri, ro, young, nu, rho):
    """Independent l=0 displacement ansatz, u=A*j1(kr)+B*y1(kr), free radial traction."""
    mu = young / (2 * (1 + nu))
    lam = young * nu / ((1 + nu) * (1 - 2 * nu))
    speed = math.sqrt((lam + 2 * mu) / rho)
    def residual(f):
        k = 2 * math.pi * f / speed
        rows = [[(lam + 2 * mu) * k * fun(1, k*r, derivative=True)
                 + 2 * lam * fun(1, k*r) / r for fun in [spherical_jn, spherical_yn]]
                for r in [ri, ro]]
        matrix = np.array(rows)
        matrix /= np.linalg.norm(matrix, axis=0)
        return np.linalg.det(matrix)
    membrane = math.sqrt(2 * young / (rho * (1 - nu))) / (2 * math.pi * ((ri + ro)/2))
    return brentq(residual, membrane*.8, membrane*1.2, xtol=1e-8)


def fisher_frequency_sigma(frequency, duration, fs, snr_db, decaying=False):
    """Real samples; initial signal-power SNR=A^2/(2 sigma^2), iid Gaussian noise.

    Unknown amplitude and phase; the decaying case also has unknown decay rate.
    The frequency parameter is f*T so all derivative columns remain scaled.
    """
    t = np.arange(int(duration * fs)) / fs
    q = t / duration
    angle = 2 * math.pi * frequency * t + .37
    envelope = np.exp(-q) if decaying else np.ones_like(q)
    columns = [envelope*np.cos(angle), -envelope*np.sin(angle),
               -2*math.pi*q*envelope*np.sin(angle)]
    if decaying:
        columns.append(-q*envelope*np.cos(angle))
    derivatives = np.stack(columns, axis=1)
    noise_variance = .5 / (10**(snr_db/10))
    covariance = noise_variance * np.linalg.inv(derivatives.T @ derivatives)
    return math.sqrt(covariance[2, 2]) / duration


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, help='Write a new receipt; ordinary checks leave the full-rerun receipt intact')
    parser.add_argument('--rerun', type=Path, help='fp_results.json from an unmodified full-model rerun')
    args = parser.parse_args()
    original = json.loads((SOURCE/'fp_results.json').read_text())
    imported = json.loads((ROOT/'imports/claude-source.json').read_text())
    source_root = SOURCE.parents[1]
    for item in imported['originals']:
        assert fingerprint(source_root/item['path']) == item['sha256'], item['path']
    checks = []
    def check(name, actual, expected, rtol=1e-8, atol=1e-8):
        delta = abs(actual-expected)
        passed = delta <= atol + rtol*abs(expected)
        checks.append({'name': name, 'actual': float(actual), 'expected': float(expected),
                       'absoluteError': float(delta), 'relativeTolerance': rtol,
                       'absoluteTolerance': atol, 'passed': bool(passed)})
        assert passed, f'{name}: {actual} != {expected}'

    # Use the shipped JS, with both explicitly matched parameter sets.
    script = """import {shellBreathing,solidBreathing,COPPER_REFERENCE} from './src/models.mjs';
      const cm=JSON.parse(process.argv[1]);
      const common={youngPa:cm.E,poisson:cm.nu,densityKgM3:cm.rho};
      console.log(JSON.stringify({reference:COPPER_REFERENCE,
      existingDefault:shellBreathing(),
      matchedClaude:shellBreathing({...common,radiusM:.04395,thicknessM:.001}),
      matchedSolid:solidBreathing({...common,radiusM:.04445}),
      solidDefault:solidBreathing()}));"""
    material = claude.copper()
    js = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', script,
                                          json.dumps(material)], cwd=ROOT))
    modes = original['modes']
    by_label = {row['label']: row for row in modes}
    fresh = claude.exact_modes(.04345, .04445, material, 60000, lmax=28, df=2)
    check('32 distinct computed free frequency multiplets', len(fresh), len(modes), 0, 0)
    check('682 angular eigenfunctions including degeneracies', sum(x['deg'] for x in fresh), 682, 0, 0)
    for a, b in zip(fresh, modes):
        assert (a['family'],a['l'],a['n']) == (b['family'],b['l'],b['n'])
        check(f"recomputed free {b['label']}", a['f'], b['f'], 1e-8)
    membrane = next(x['f'] for x in claude.membrane_modes(.04395, material, 4)
                    if x['family']=='S' and x['l']==0)
    check('identical shell breathing reduction after matching inputs',
          js['matchedClaude']['frequencyHz'], membrane, 1e-12)
    independent = radial_shell_frequency(.04345,.04445,material['E'],material['nu'],material['rho'])
    check('independent l=0 shell traction ansatz vs Claude S0', independent, by_label['S0']['f'], 1e-8)
    solid_roots = claude.find_roots(lambda w: claude.spheroidal_det(0,w,0,.04445,material)[0],
                                  1000,100000,5,1)
    check('JS solid radial root vs Claude elastodynamics', js['matchedSolid']['frequencyHz'],solid_roots[0],1e-8)
    reference = js['reference']
    legacy_exact = radial_shell_frequency(.04420,.04470,reference['youngPa'],reference['poisson'],reference['densityKgM3'])
    mass = 4*math.pi/3*(.04445**3-.04345**3)*material['rho']
    check('exact shell geometric mass', mass,original['sphere']['mass_g']/1000,1e-12)
    check('membrane mass matches the declared midsurface convention',js['matchedClaude']['massKg'],4*math.pi*.04395**2*.001*material['rho'],1e-12)
    # A position change that changes only observation residues leaves all free poles fixed.
    series = np.load(ROOT/'imports/bashar-index-e628974/data/experiments/frequency-of-place/fp_series.npz')
    frf_relative = np.max(np.abs(series['HA']-series['HB']))/np.max(series['HA'])
    check('mirror-symmetric plate A/B driving-point magnitude',frf_relative,0,0,1e-7)
    convergence = original['contact']['convergence_in_Lmax']
    c34, c44 = convergence['34'],convergence['44']
    contact = {'S2LastStepHz':c44['S2_m0']-c34['S2_m0'],
               'bounceLastStepHz':c44['bounce']-c34['bounce'],
               'S2LastStepPpm':(c44['S2_m0']/c34['S2_m0']-1)*1e6,
               'bounceLastStepPercent':(c44['bounce']/c34['bounce']-1)*100,
               'meaning':'Last truncation difference, not a certified error bound; contact model is rigid-ground, radial, m=0 only.'}
    precision = original['precision']
    duration, fs = precision['record_s'],precision['fs']
    sigma_constant = fisher_frequency_sigma(by_label['S2']['f'],duration,fs,40)
    sigma_decay = fisher_frequency_sigma(by_label['S2']['f'],duration,fs,40,True)
    sigma_original = precision['sigma_f_Hz_snr40dB']
    check('real-sinusoid long-record power-SNR Fisher coefficient',sigma_constant/sigma_original,math.sqrt(2),.003)
    precision_audit = {'initialSignalPowerSNRdB':40,'samples':int(duration*fs),
        'durationSeconds':duration,'originalSigmaHz':sigma_original,
        'realConstantAmplitudeSigmaHz':sigma_constant,'realUnknownDecaySigmaHz':sigma_decay,
        'constantToOriginalRatio':sigma_constant/sigma_original,'decayToOriginalRatio':sigma_decay/sigma_original,
        'assumptions':'Real samples; iid additive Gaussian noise; SNR=A0^2/(2 sigma_noise^2); unknown amplitude and phase; unknown decay rate in the decaying case. No systematic uncertainties or physical calibration included.',
        'meaning':'Different noise conventions change the bound. The imported factor 6 is not an uncertainty certificate for this declared real-signal power-SNR convention.'}
    rerun = {'performed':False,'note':'Use --rerun after running unmodified imports/.../fp_model.py with FP_OUT set to a temporary directory.'}
    if args.rerun:
        fresh_result = json.loads(args.rerun.read_text())
        for label,row in by_label.items():
            value=next(x['f'] for x in fresh_result['modes'] if x['label']==label)
            check(f'full-script rerun {label}',value,row['f'],1e-8)
        for name in ['bounce','S2_m0']:
            check('full-script contact '+name,fresh_result['contact']['convergence_in_Lmax']['44'][name],c44[name],2e-6)
        rerun = {'performed':True,'freeModes':len(fresh_result['modes']),
                 'maximumFreeModeDifferenceHz':max(abs(a['f']-b['f']) for a,b in zip(fresh_result['modes'],modes)),
                 'bounceDifferenceHz':fresh_result['contact']['bounce_mode_coupled_Hz']-original['contact']['bounce_mode_coupled_Hz'],
                 'scope':'Unmodified full fp_model.py, single-thread numerical run. Small eigenvalue-roundoff differences are recorded rather than requiring bit identity.'}
    result = {'schema':'fieldwork-claude-comparison/1','sourceCommit':imported['commit'],
        'physicalMeasurements':0,'reviewer':'Single Codex integration review; cross-formulation numerical checks, no independent panel or human peer review',
        'codeHashes':{'sourceModes':fingerprint(SOURCE/'sphere_modes.py'),'sourceModel':fingerprint(SOURCE/'fp_model.py'),'existingModels':fingerprint(ROOT/'src/models.mjs')},
        'claudeGeometry':{'outerRadiusMm':44.45,'innerRadiusMm':43.45,'midsurfaceRadiusMm':43.95,'wallMm':1},
        'claudeMaterial':{'youngPa':material['E'],'poisson':material['nu'],'densityKgM3':material['rho']},
        'comparison':{'existingDefaultMembraneHz':js['existingDefault']['frequencyHz'],
                      'existingDefaultExactRadialShellHz':legacy_exact,
                      'claudeLowestS2Hz':by_label['S2']['f'],'claudeT2Hz':by_label['T2']['f'],
                      'claudeBreathingS0Hz':by_label['S0']['f'],'matchedMembraneHz':membrane,
                      'matchedMembraneDifferenceHz':membrane-independent,
                      'matchedMembraneErrorPpm':(membrane/independent-1)*1e6,
                      'matchedSolidHz':js['matchedSolid']['frequencyHz'],
                      'sourceModeCount':len(modes),'angularEigenfunctionCount':sum(x['deg'] for x in modes)},
        'contactConvergence':contact,'plateSymmetryRelativeDifference':float(frf_relative),
        'plateThicknessToShortSpan':.25/1.2,'precisionAudit':precision_audit,
        'fullModelReproduction':rerun,'checks':checks,'passed':all(x['passed'] for x in checks),
        'limits':['Finite frequency/angular-order search is not a complete measured spectrum.',
                  'The rigid-ground contact projection and free-table FRF are separate calculations, not one fully coupled sphere/table/air model.',
                  'Plate thickness/short span = 0.2083. No computed Mindlin or 3D error bound supports a universal few-percent correction.',
                  'No absolute-position coupling, calibrated measurement floor or physical evidence has been established.']}
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    print(json.dumps({'passed':result['passed'],'checks':len(checks),'comparison':result['comparison'],
                      'contact':contact,'precision':precision_audit,'fullRerun':rerun},indent=2))


if __name__=='__main__':
    main()

#!/usr/bin/env python3
"""Independent SciPy checks of the browser free-sphere calculation.

Run with Python 3, NumPy and SciPy. This is numerical/model verification,
not an experiment. No experimental records are generated.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys

import numpy as np
from scipy.optimize import brentq
from scipy.special import spherical_jn

ROOT = Path(__file__).resolve().parent


def need(condition, text):
    if not condition:
        raise RuntimeError(text)


def independent_modes(p):
    radius = p['radiusMm'] * 1e-3
    young = p['E_GPa'] * 1e9
    nu, density = p['nu'], p['rhoKgM3']
    bulk = young / (3 * (1 - 2 * nu))
    shear = young / (2 * (1 + nu))
    longitudinal = math.sqrt((bulk + 4 * shear / 3) / density)
    transverse = math.sqrt(shear / density)
    ratio2 = (transverse / longitudinal) ** 2
    # Direct spherical Bessel boundary traction, independently evaluated by
    # SciPy, rather than the trigonometric browser expression.
    def traction(x):
        return x * spherical_jn(0, x) - 4 * ratio2 * spherical_jn(1, x)
    roots = [brentq(traction, max(1e-4, n * math.pi), (n + 1) * math.pi,
                    xtol=5e-15, rtol=1e-14) for n in range(3)]
    return dict(massKg=4 * math.pi * radius**3 * density / 3,
                cL=longitudinal, cT=transverse, roots=roots,
                frequenciesHz=[x*longitudinal/(2*math.pi*radius) for x in roots])


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--model',type=Path,help='Path to model.mjs; defaults to beside this script or ../src/model.mjs')
    mode=ap.add_mutually_exclusive_group()
    mode.add_argument('--output',type=Path,help='Fresh absolute JSON output path outside or inside the workspace')
    mode.add_argument('--check',nargs='?',type=Path,const=ROOT/'physics-verification.json',help='Replay and compare an existing receipt without writing it')
    args=ap.parse_args()
    model=(args.model or (ROOT/'model.mjs' if (ROOT/'model.mjs').exists() else ROOT.parent/'src/model.mjs')).resolve()
    need(model.is_file(),'Missing browser model: '+str(model))
    if args.output:
        need(args.output.is_absolute() and not args.output.exists(),'--output must name a fresh absolute file')
    base = dict(radiusMm=12.5, E_GPa=123.5, nu=.35, rhoKgM3=8960)
    cases = [base]
    for nu in [-.9, -.5, 0, .2, .35, .45, .49]:
        for radius in [.01, 1, 12.5, 1000]:
            cases.append({**base, 'nu':nu, 'radiusMm':radius})
    js = """
const {sphereModes,samplingBudget,responseComparison,relativeUncertainty,radialCharacteristic}=await import(process.argv[1]);
const cases=JSON.parse(process.argv[2]);
const invalid=[{radiusMm:0},{E_GPa:-1},{nu:.5},{rhoKgM3:0},{radiusMm:NaN},{nu:Infinity},{radiusMm:1001},{E_GPa:1001}];
const rejected=invalid.map(p=>{try{sphereModes(p);return false}catch{return true}});
const samplingInvalid=[{durationS:0},{sampleRateHz:-1},{Q:.5}].map(p=>{try{samplingBudget(p);return false}catch{return true}});
const path0=responseComparison({position:0});
const path1=responseComparison({position:1});
const contact=responseComparison({position:1,scenario:'contact'});
const contact0=responseComparison({position:1,scenario:'contact',supportStiffnessNPerM:0});
const lowQ=responseComparison({Q:.51});
console.log(JSON.stringify({modes:cases.map(sphereModes),rejected,samplingInvalid,
  sample:samplingBudget({}),audio:samplingBudget({sampleRateHz:48000}),
  outOfBand:samplingBudget({fMaxHz:100000,frequencyHz:166551.05048081328}),
  nyquistBoundary:samplingBudget({sampleRateHz:400000}),
  path0,path1,contact,contact0,lowQ,uncertainty:relativeUncertainty({})}));
"""
    observed = json.loads(subprocess.check_output(['node','--input-type=module','-e',js,model.as_uri(),json.dumps(cases)],cwd=ROOT,text=True))
    checks = []
    max_difference = 0.
    for i,(p,actual) in enumerate(zip(cases, observed['modes'])):
        expected = independent_modes(p)
        for key in ['massKg','cL','cT']:
            need(math.isclose(actual[key],expected[key],rel_tol=2e-13),f'case {i}: {key}')
        for a,b in zip(actual['frequenciesHz'],expected['frequenciesHz']):
            err=abs(a-b)/b
            max_difference=max(max_difference,err)
            need(err<2e-13,f'case {i}: mode mismatch')
        need(actual['roots'][0]>0,'Nonphysical zero root retained')
    checks.append({'name':'29 material/geometry cases, independent spherical-Bessel/Brent formulation','passed':True,'max_relative_frequency_difference':max_difference})
    base_out=independent_modes(base)
    for variable,multiplier,expected_ratio in [('radiusMm',2,.5),('E_GPa',4,2),('rhoKgM3',4,.5)]:
        modified=independent_modes({**base,variable:base[variable]*multiplier})
        need(np.allclose(np.asarray(modified['frequenciesHz'])/base_out['frequenciesHz'],expected_ratio,rtol=1e-13),'Dimensional scaling failure')
    checks.append({'name':'Radius inverse scaling; modulus square-root and density inverse-square-root scaling','passed':True})
    need(all(observed['rejected']) and all(observed['samplingInvalid']),'Invalid input accepted')
    checks.append({'name':'11 invalid/domain controls','passed':True})
    need(observed['sample']['validNyquist'] and not observed['audio']['validNyquist'] and not observed['nyquistBoundary']['validNyquist'],'Sampling edge failure')
    need(not observed['outOfBand']['modeWithinBand'] and not observed['outOfBand']['validPlan'],'Out-of-band mode treated as measurable')
    need(math.isclose(observed['sample']['ringdownS'],1000/(math.pi*base_out['frequenciesHz'][0]),rel_tol=1e-13),'Ringdown convention error')
    checks.append({'name':'Sampling, strict Nyquist boundary, ordinary-audio rejection and ringdown','passed':True})
    p0,p1,ct,c0=(observed[x] for x in ['path0','path1','contact','contact0'])
    need(p0['polesAHz']==p0['polesBHz']==p1['polesBHz'],'Path change moved intrinsic poles')
    need(p0['aDb']==p0['bDb'],'Same-position null failed')
    need(p1['peakAHz']!=p1['peakBHz'],'Observation-path wrong-inference control not discriminating')
    need(c0['polesAHz']==c0['polesBHz'] and c0['aDb']==c0['bDb'],'Zero support control failed')
    need(all(f>0 for f in observed['lowQ']['frequencyHz']),'Low-Q plot contains negative frequency')
    for a,b in zip(ct['polesAHz'],ct['polesBHz']):
        independent=math.sqrt((2*math.pi*a)**2 + 1e8/base_out['massKg'])/(2*math.pi)
        need(b>a and math.isclose(b,independent,rel_tol=1e-13),'Toy spring perturbation error')
    checks.append({'name':'Translation null, residue-only peak switching, zero spring, positive-spring perturbation','passed':True})
    # Implicit characteristic differentiation independently verifies the
    # browser's finite-difference Poisson-ratio sensitivity.
    x,nu=base_out['roots'][0],base['nu']
    q=(1-2*nu)/(2*(1-nu)); qprime=-1/(2*(1-nu)**2)
    h=(math.sin(x)-x*math.cos(x))/x**3
    gx=(x*math.cos(x)-math.sin(x))/x**2-4*q*(x*x*math.sin(x)-3*(math.sin(x)-x*math.cos(x)))/x**4
    xprime=4*h*qprime/gx
    s_nu=xprime/x+.5*(-1/(1-nu)-1/(1+nu)+2/(1-2*nu))
    need(math.isclose(observed['uncertainty']['sensitivityNu'],s_nu,rel_tol=1e-8),'Poisson derivative wrong')
    checks.append({'name':'Independent implicit derivative of Poisson-ratio sensitivity','passed':True})
    result={'status':'passed','scope':'Numerical model and synthetic controls only; no physical experiment has run.',
        'source_sha256':hashlib.sha256(model.read_bytes()).hexdigest(),
        'default_inputs':base,'default_model':base_out,
        'sampling_example':observed['sample'],'uncertainty_example':observed['uncertainty'],
        'synthetic_path_example':{k:p1[k] for k in ['polesAHz','polesBHz','peakAHz','peakBHz','disclaimer']},
        'synthetic_contact_example':{k:ct[k] for k in ['polesAHz','polesBHz','addedStiffnessNPerM','effectiveModalMassKg','disclaimer']},
        'checks':checks}
    if args.check:
        recorded=json.loads(args.check.read_text())
        def compare(a,b,path='receipt'):
            if isinstance(a,bool) or isinstance(b,bool):
                need(type(a) is type(b) and a==b,'Changed Boolean: '+path)
            elif isinstance(a,(float,int)) and isinstance(b,(float,int)):
                need(math.isfinite(a) and math.isfinite(b) and math.isclose(a,b,rel_tol=2e-12,abs_tol=1e-12),'Changed numeric evidence: '+path)
            elif isinstance(a,dict) and isinstance(b,dict):
                need(a.keys()==b.keys(),'Changed evidence keys: '+path)
                for k in a: compare(a[k],b[k],path+'.'+k)
            elif isinstance(a,list) and isinstance(b,list):
                need(len(a)==len(b),'Changed evidence length: '+path)
                for i,(x,y) in enumerate(zip(a,b)):compare(x,y,path+f'[{i}]')
            else: need(type(a) is type(b) and a==b,'Changed evidence: '+path)
        compare(result,recorded)
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'status':result['status'],'checks':len(checks),'cases':len(cases),'max_relative_difference':max_difference,'receipt_compared':bool(args.check)}))


if __name__=='__main__':
    main()

#!/usr/bin/env python3
"""Independent review of the JS model. Does not write producer files."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import subprocess
import numpy as np
from scipy.optimize import brentq
from scipy.special import spherical_jn


def need(value, why):
    if not value:
        raise RuntimeError(why)


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--model',required=True,type=Path)
    ap.add_argument('--output',required=True,type=Path)
    a=ap.parse_args()
    model=a.model.resolve()
    # Includes both domain endpoints and closely spaced values near the stiff
    # incompressible end. Parameters independently supplied by this reviewer.
    nus=sorted(set([float(x) for x in np.linspace(-.9,.49,101)]+[.489,.4899,.48999]))
    js='''
const m=await import(process.argv[1]);
const nus=JSON.parse(process.argv[2]);
const modes=nus.map(nu=>m.sphereModes({nu,radiusMm:9,E_GPa:110,rhoKgM3:8960}));
const lowQ=m.responseComparison({Q:.51,points:50});
const outside=m.samplingBudget({fMaxHz:1000,sampleRateHz:10000,frequencyHz:5000});
const inside=m.samplingBudget({fMaxHz:10000,sampleRateHz:100000,frequencyHz:5000});
const zero=m.relativeUncertainty({uRadiusMm:0,uE_GPa:0,uNu:0,uRhoKgM3:0});
const invalid=[()=>m.sphereModes({nu:-.9001}),()=>m.sphereModes({nu:.4901}),()=>m.relativeUncertainty({uNu:-1}),()=>m.responseComparison({scenario:'measured'}),()=>m.responseComparison({supportStiffnessNPerM:-1})].map(f=>{try{f();return false}catch{return true}});
console.log(JSON.stringify({modes,lowQmin:Math.min(...lowQ.frequencyHz),lowQfinite:lowQ.aDb.every(Number.isFinite)&&lowQ.bDb.every(Number.isFinite),outside,inside,zero,invalid}));
'''
    obs=json.loads(subprocess.check_output(['node','--input-type=module','-e',js,model.as_uri(),json.dumps(nus)],text=True))
    checks=[]
    max_relative=0.
    max_traction=0.
    scan_roots=0
    for nu,actual in zip(nus,obs['modes']):
        # Derive radial stress with Lamé constants and j1'(x), independently
        # of the producer's simplified trigonometric expression.
        E=110e9; rho=8960; R=.009
        mu=E/(2*(1+nu)); lam=E*nu/((1+nu)*(1-2*nu))
        c=math.sqrt((lam+2*mu)/rho)
        def traction(x):
            # Normalize by E to keep values well conditioned.
            return ((lam+2*mu)*x*spherical_jn(1,x,derivative=True)
                    +2*lam*spherical_jn(1,x))/E
        for j in range(3):
            lo=max(1e-5,j*math.pi); hi=(j+1)*math.pi
            scan=np.linspace(lo,hi,1001)
            vals=traction(scan)
            crossings=np.where(vals[:-1]*vals[1:]<0)[0]
            need(len(crossings)==1,f'Dense scan found unexpected root count at nu={nu}, interval={j}')
            scan_roots+=len(crossings)
            expected=brentq(traction,lo,hi,xtol=1e-14)
            reported=actual['roots'][j]
            max_traction=max(max_traction,abs(traction(reported)))
            f=expected*c/(2*math.pi*R)
            err=abs(actual['frequenciesHz'][j]-f)/f
            max_relative=max(max_relative,err)
            need(err<2e-12,'Independent radial-stress mode mismatch')
    checks.append({'name':'104 Poisson values, 312 positive roots, independent radial stress formulation',
                   'passed':True,'poisson_values':len(nus),'roots_checked':scan_roots,
                   'max_relative_frequency_error':max_relative,'max_normalized_traction_residual':max_traction,
                   'scope':'Numerical root-count sampling over the declared domain, not a proof of continuum completeness.'})
    need(obs['lowQmin']>0 and obs['lowQfinite'],'Low-Q drawing contains nonpositive frequencies or nonfinite output')
    checks.append({'name':'Q=0.51 positive-frequency drawing and finite response','passed':True,'minimum_frequency_Hz':obs['lowQmin']})
    # The producer's final property is agreed in follow-up; accepting aliases
    # here does not bypass the required semantic distinction.
    field='modeWithinBand' if 'modeWithinBand' in obs['outside'] else 'selectedModeWithinBand'
    need(obs['outside'].get(field) is False and obs['inside'].get(field) is True,
         'Sampling budget fails to distinguish a mode outside the declared analysis band')
    need(obs['outside']['validNyquist'] is True,'Control must show that Nyquist alone passes while selected mode is out of band')
    checks.append({'name':'Nyquist alone does not ensure selected-mode coverage','passed':True,'field':field})
    need(obs['zero']['uHz']==0 and all(obs['invalid']),'Uncertainty-zero or invalid-domain control failed')
    checks.append({'name':'Zero uncertainty input and five invalid-domain controls','passed':True})
    result={'status':'passed','reviewer':'Independent skeptic','producer_files_mutated':False,
            'model_sha256':hashlib.sha256(model.read_bytes()).hexdigest(),
            'checks':checks,'scope':'Mathematical and numerical model review; not a lab measurement or full elastic spectrum.'}
    a.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'status':'passed','checks':len(checks),'roots_checked':scan_roots,'max_relative_error':max_relative}))


if __name__=='__main__':
    main()

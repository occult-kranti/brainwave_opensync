#!/usr/bin/env python3
"""R2: independent exact-domain admission and operator comparison of producer."""
import hashlib
import json
import subprocess
from decimal import Decimal, localcontext
from fractions import Fraction as F
from pathlib import Path

import numpy as np

import check_independent as independent

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
TOL=5e-13
rng=np.random.default_rng(1618033988)


def admissible(p,r):
    return F(r)**2 <= F(p)*(1-F(p))


def matrix_admissible(p,c):
    return F(c.real)**2+F(c.imag)**2 <= F(p)*(1-F(p))


def dec(value):
    return Decimal.from_float(float(value))


def precision_oracle(case):
    # Independent Decimal characteristic polynomial and explicit rotation;
    # same exact input reals as JS, with sufficient precision for r^2 at MIN_VALUE.
    with localcontext() as ctx:
        ctx.prec=800
        p,r,d,e=[dec(case[k]) for k in ('population','coherenceMagnitude','dephasing','gapJ')]
        w1,_=independent.decimal_extraction(p,r,Decimal(1))
        wd,_=independent.decimal_extraction(p,r,d)
        loss=w1-wd
        bound=r*(1-d)
        assert 0 <= loss <= bound
        return {'workBeforeNormalized':w1,'workAfterNormalized':wd,
                'lossNormalized':loss,'boundNormalized':bound,
                'workBeforeJ':e*w1,'workAfterJ':e*wd,'lossJ':e*loss,'boundJ':e*bound}


def main():
    states=[]
    repaired=0
    max_steps=0
    max_magnitude_difference=0.0
    rejected_original=[]
    pops=[0.,np.nextafter(0.,1.),1e-300,1e-12,.01,.1,.2,.25,
          np.nextafter(.5,0.),.5,np.nextafter(.5,1.),.75,.9,1-1e-12,1.]
    pops += list(rng.uniform(size=300))
    for p in pops:
        for fraction in (0.,.37,1.):
            for phase in (0.,.37,np.pi/2,2.17):
                r=float(np.sqrt(p*(1-p))*fraction)
                original=r
                c=complex(r*np.exp(1j*phase))
                steps=0
                while not (admissible(p,r) and matrix_admissible(p,c)):
                    r=float(np.nextafter(r,0.))
                    c=complex(r*np.exp(1j*phase))
                    steps+=1
                if steps:
                    repaired+=1
                    max_steps=max(max_steps,steps)
                    if not admissible(p,original):
                        rejected_original.append(dict(population=float(p),coherenceMagnitude=original,dephasing=.5,gapJ=1.))
                max_magnitude_difference=max(max_magnitude_difference,abs(abs(c)-r))
                d=float(rng.choice([0.,.2,.8,np.nextafter(1.,0.),1.]))
                states.append((dict(population=float(p),coherenceMagnitude=r,dephasing=d,gapJ=1.),c))

    special=[
        dict(population=.25,coherenceMagnitude=1e-150,dephasing=.2,gapJ=1.),
        dict(population=.5,coherenceMagnitude=1e-150,dephasing=.2,gapJ=1.),
        dict(population=.25,coherenceMagnitude=.3,dephasing=float(np.nextafter(1.,0.)),gapJ=1.),
        dict(population=.2,coherenceMagnitude=1e-200,dephasing=.5,gapJ=1e300),
        dict(population=.5,coherenceMagnitude=float(np.nextafter(0.,1.)),dephasing=.5,gapJ=1e300),
        dict(population=.25,coherenceMagnitude=.3,dephasing=.2,gapJ=1e-320),
        dict(population=.5,coherenceMagnitude=.5,dephasing=.5,gapJ=float(np.nextafter(0.,1.))),
        dict(population=.25,coherenceMagnitude=.3,dephasing=.2,gapJ=1e300),
    ]
    assert all(admissible(v['population'],v['coherenceMagnitude']) for v in special)
    all_inputs=[s[0] for s in states]+special+rejected_original
    request={'inputs':all_inputs,'populations':[float(p) for p in pops]}
    bridge=subprocess.run(['node',str(HERE/'producer_bridge.mjs')],input=json.dumps(request),
                          text=True,capture_output=True,check=True,cwd=ROOT)
    output=json.loads(bridge.stdout)
    assert all(not r['accepted'] for r in output['invalid'])
    assert all(not r['accepted'] for r in output['outputs'][len(states)+len(special):])
    helper_checks=0
    for v in output['helpers']:
        p,r=v['population'],v['boundary']
        assert admissible(p,r)
        assert not admissible(p,float(np.nextafter(r,np.inf)))
        helper_checks+=1

    maxerr=0.
    max_raw_bound_residual=0.
    for (case,c),got in zip(states,output['outputs']):
        assert got['accepted'],(case,got)
        got=got['result']
        p,d=case['population'],case['dephasing']
        before=independent.extraction(p,c,1.)
        after=independent.extraction(p,c,d)
        independent_loss=before-after
        independent_bound=case['coherenceMagnitude']*(1-d)
        # These residuals derive from the independent matrix oracle, not q clipping.
        max_raw_bound_residual=max(max_raw_bound_residual,independent_loss-independent_bound)
        assert independent_loss >= -TOL and independent_loss <= independent_bound+TOL
        for key,expected in [('workBeforeNormalized',before),('workAfterNormalized',after),('lossNormalized',independent_loss)]:
            err=abs(got[key]-expected)
            maxerr=max(maxerr,err)
            assert err<=TOL,(case,key,got[key],expected)
        lower=case['coherenceMagnitude']==0 or d==1
        assert got['lowerEquality']==lower
        assert got['upperEquality']==(lower or p==.5)

    precision_results=[]
    min_normal=Decimal(2)**-1022
    min_sub=dec(np.nextafter(0.,1.))
    for case,response in zip(special,output['outputs'][len(states):]):
        assert response['accepted']
        got=response['result']
        expected=precision_oracle(case)
        record={'input':case,'outputs':{},'lowerEquality':got['lowerEquality'],'upperEquality':got['upperEquality']}
        assert not got['lowerEquality']
        assert got['upperEquality']==(case['population']==.5)
        for key,exact in expected.items():
            value=dec(got[key])
            error=abs(value-exact)
            # Normal quantities: 2e-14 relative. Subnormal/underflow quantities:
            # up to 2 MIN_VALUE absolute, explicitly not a relative-accuracy claim.
            tolerance=max(abs(exact)*Decimal('2e-14'),2*min_sub)
            assert error<=tolerance,(case,key,value,exact,error,tolerance)
            status=got['representability'][key]
            expected_status='exact-zero' if exact==0 else ('underflow' if value==0 else ('subnormal' if value<min_normal else 'normal'))
            assert status==expected_status,(key,status,expected_status)
            record['outputs'][key]={'producer':got[key],'oracle':format(exact,'.25E'),'status':status}
        precision_results.append(record)

    paths=['src/dephasing-bound.mjs','research/dephasing-work-bound/proof.md',
           'research/dephasing-work-bound/rounds/round1-decision.json',
           'research/dephasing-work-bound/panel/verification/check_independent.py',
           'research/dephasing-work-bound/panel/verification/compare_producer.py',
           'research/dephasing-work-bound/panel/verification/producer_bridge.mjs']
    result={'status':'PASS','matrix_cases':len(states),'exact_helper_boundary_checks':helper_checks,
            'invalid_cases_rejected':len(output['invalid']),
            'rounding_repairs':repaired,'max_nextafter_repair_steps':max_steps,
            'inadmissible_original_api_pairs_rejected':len(rejected_original),
            'maximum_phase_assembly_magnitude_difference':max_magnitude_difference,
            'maximum_normalized_matrix_producer_error':maxerr,
            'maximum_independent_upper_residual':max_raw_bound_residual,
            'matrix_normalized_absolute_tolerance':TOL,
            'high_precision':precision_results,
            'source_sha256':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in paths}}
    print(json.dumps(result,indent=2,sort_keys=True))


if __name__=='__main__':
    main()

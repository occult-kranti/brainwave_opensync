#!/usr/bin/env python3
"""Read-only producer comparison to pre-code-inspection skeptic fixtures.
Writes only in panel/skeptic. Does not run a peer script's file-writing main.
"""
from pathlib import Path
from fractions import Fraction as F
import argparse, hashlib, importlib.util, json, math, subprocess, datetime, sys
sys.dont_write_bytecode = True
import numpy as np

HERE=Path(__file__).resolve().parent
PANEL=HERE.parent
REPO=HERE.parents[4]
FIXTURE=HERE/'round2-independent-fixtures.json'
expected_sha='262582bed704ce59014937557cc678ee0931ea609296d2e7bb4a7f8aadb0e657'
assert hashlib.sha256(FIXTURE.read_bytes()).hexdigest()==expected_sha
fixtures=json.loads(FIXTURE.read_text())

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def import_module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def node_calls(module,export,inputs):
    program=f"import fs from 'node:fs'; import {{{export}}} from {json.dumps(module.as_uri())}; console.log(JSON.stringify(JSON.parse(fs.readFileSync(0,'utf8')).map(x=>{export}(x))));"
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',program],input=json.dumps(inputs).encode()))

thermal=PANEL/'energy/thermal-channel.mjs'
# Bind the exact producer revision announced for independent review.
assert sha(thermal)=='cc3a6011d89ab2ad2904d216064a32e4af26bec56c54fd1718244165012727be'
inputs=[]
for x in fixtures['peerReviewIndependentCases']['energy']['cases']:
    inputs.append({'frequencyHz':5e9,'population':float(F(x['p'])),'coherence':1 if x['c']=='sqrt(3)/4' else 0,
                   'phaseRadians':0,'damping':float(F(x['gamma'])),'dephasing':float(F(x['d'])),'bathPopulation':float(F(x['nu']))})
output=node_calls(thermal,'thermalQubitWork',inputs)
thermal_rows=[]
for frozen,inp,out in zip(fixtures['peerReviewIndependentCases']['energy']['cases'],inputs,output):
    expected=np.array([float(F(frozen[k])) for k in ['expectedP','expectedQ','expectedW']])
    actual=np.array([out['final']['population'],out['heatIntoQubitJ']/out['gapJ'],out['final']['ergotropyJ']/out['gapJ']])
    matrix=np.array(out['final']['densityMatrix']['real'])+1j*np.array(out['final']['densityMatrix']['imag'])
    eig=np.linalg.eigvalsh(matrix)
    err=float(np.max(abs(actual-expected)))
    eigerr=float(np.max(abs(eig-np.array(out['final']['eigenvaluesAscending']))))
    assert err<1e-14 and eigerr<1e-14 and abs(np.trace(matrix)-1)<1e-14 and eig[0]>-1e-14
    assert out['apparatusEfficiency'] is None
    assert abs(out['heatIntoQubitJ']+out['heatIntoBathJ'])<1e-38
    if frozen['name']=='inverted-bath':assert out['bathResource']=='population-inverted resource'
    thermal_rows.append({'id':frozen['name'],'maxExpectedError':err,'eigenvalueError':eigerr,'valuesP_Q_W':actual.tolist(),'resource':out['bathResource']})

# Map the frozen generic M,K,C to the actual two-coordinate producer API.
# phi=1, contact1, intrinsic stiffness(4,2) and masses(2,1) realize K=[[5,-1],[-1,3]].
bridge=PANEL/'acoustics/production-probe.mjs'
requests=[]
for scale in [1,4]:
    params={'sphereHz':math.sqrt(2)/(2*math.pi),'tableHz':math.sqrt(2)/(2*math.pi),
            'sphereModalMassKg':2*scale,'tableModalMassKg':scale,'contactNpm':scale,'position':.5,
            'sphereDamping':1/(20*math.sqrt(2)),'tableDamping':1/(20*math.sqrt(2))}
    requests.append({'kind':'coupled','params':params,'frequenciesHz':[2/(2*math.pi)]})
aoutput=json.loads(subprocess.check_output(['node',str(bridge)],input=json.dumps(requests).encode()))
M=np.diag([2.,1.]);K=np.array([[5.,-1.],[-1.,3.]]);C=np.diag([.2,.1]);omega=2
reference=np.linalg.solve(K-omega*omega*M+1j*omega*C,np.array([1.,0.]))
expected_freq=np.sort(np.sqrt(np.linalg.eigvals(np.linalg.solve(M,K)))/(2*math.pi))
acoustic_rows=[]
for scale,out in zip([1,4],aoutput):
    response=out['responses'][0]
    actual=np.array([complex(response['sphereRe'],response['sphereIm']),complex(response['tableRe'],response['tableIm'])])
    frf_error=float(np.max(abs(actual-reference/scale)))
    frequency_error=float(np.max(abs(np.sort(out['system']['frequencyHz'])-expected_freq)))
    assert frf_error<1e-13 and frequency_error<1e-13
    acoustic_rows.append({'scale':scale,'FRFAbsoluteError':frf_error,'frequencyAbsoluteErrorHz':frequency_error})

methods=import_module('skeptic_reviewed_methods',PANEL/'methods/exact_certificate.py')
mr=methods.run()
# Independently reduce actual producer's symbolic derivative at m2,k3,b5,p=2v.
coefficients={}
for term in mr['generalAlgebra']['storageDerivative']:
    coefficient=F(term['coefficient']); powers=dict(term['powers'])
    for name,value in [('m',2),('k',3),('b',5)]:coefficient*=F(value)**powers.pop(name,0)
    if 'p' in powers:
        p_power=powers.pop('p'); coefficient*=F(2)**p_power;powers['v']=p_power
    monomial=tuple(sorted(powers.items()))
    coefficients[monomial]=coefficients.get(monomial,F(0))+coefficient
coefficients={k:v for k,v in coefficients.items() if v}
expected_coeffs={(('u',1),('v',1)):F(1),(('v',2),):F(-5)}
assert coefficients==expected_coeffs
assert mr['generalAlgebra']['identityResidual']==[]
method_control_ids=['wrong-output-witness','negative-damping-domain-rejected','negative-damping-energy-growth','perturbed-gram-rejected','wrong-factor-order-rejected','between-grid-negative']
method_controls={c['id']:c['passed'] for c in mr['checks'] if c['id'] in method_control_ids}
assert set(method_controls)==set(method_control_ids) and all(method_controls.values())

ym=import_module('skeptic_reviewed_yangmills',PANEL/'yangmills/verify_round2.py')
yr=ym.run()
threshold=F(9600000000)
y_boundary=[]
for offset in [-1,0,1]:
    actual=ym.bare_coupling_admitted(threshold+offset,F(1,100000000))
    assert actual==(offset>=0)
    y_boundary.append({'gFourth':str(threshold+offset),'admitted':actual})
for n in fixtures['ownCases']['finiteGap']['n']:
    common=[[F(1),F(0)],[F(0),F(0)]]
    h=[[F(0),F(0)],[F(0),F(1,n)]]
    assert ym.mul(h,common)==[[0,0],[0,0]]
    assert ym.psd2(h)
    assert ym.psd2(ym.sub(h,[[F(0),F(0)],[F(0),F(1,16)]]))==(n<=16)

bound=[FIXTURE,thermal,PANEL/'energy/round2-results.json',bridge,PANEL/'acoustics/verify_scaling.py',PANEL/'acoustics/round2-results.json',REPO/'location-spectrum/src/models.mjs',PANEL/'methods/exact_certificate.py',PANEL/'methods/exact-results.json',PANEL/'yangmills/verify_round2.py',PANEL/'yangmills/round2-results.json']
result={'schema':1,'createdUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
'independence':'Expected math cases frozen before producer code/results inspection; producer API mappings and code inspection occurred afterwards. This is separate-agent checking, not external human peer review.',
'fixturesSha256':expected_sha,
'energy':{'frozenCaseComparisons':thermal_rows,'accepted':'Signed heat and passive-energy/ergotropy values for the six declared states; inverted resource labeled; apparatus efficiency withheld.','notReviewed':'No communication capacity theorem, all device costs, exhaustive floating-point domain or general proof.'},
'acoustics':{'frozenCaseComparisons':acoustic_rows,'accepted':'Producer realizes the frozen 2DOF matrix fixture; common mass/stiffness/damping scale leaves modal frequencies and divides calibrated FRF by scale.','notReviewed':'No general inverse elasticity theorem, full-spectrum recovery, noise-stability guarantee or empirical location effect.'},
'methods':{'frozenExpectedDerivative':'u*v-5*v^2','actualReducedCoefficients':[{'powers':dict(k),'coefficient':str(v)} for k,v in coefficients.items()],'observedWrongControls':method_controls,'accepted':'Exact producer Laurent identity matches independently frozen velocity formulation after p=2v. Matrix signs admitted only for m,k>0,b>=0.','notReviewed':'No independent complete Laurent-library verification, NSPI execution, Lean build or hardware energy certification.'},
'yangmills':{'thresholdControls':y_boundary,'ownFrozenNCompared':fixtures['ownCases']['finiteGap']['n'],'accepted':'Exact fixed-projector countermodel and tau admission arithmetic; reports distinguish fixed-a/volume uniformity from continuum uniformity.','notReviewed':'No historical Yang-Mills proof dependency revalidation or statement about true gap outside sufficient certificate.'},
'boundFiles':{str(p.relative_to(REPO)):sha(p) for p in bound},'codeSha256':sha(Path(__file__))}
parser=argparse.ArgumentParser()
parser.add_argument('--output',type=Path,default=HERE/'cross-review-results.json')
args=parser.parse_args()
args.output.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'energyMaxExpectedError':max(x['maxExpectedError'] for x in thermal_rows),'acousticMaxFRFError':max(x['FRFAbsoluteError'] for x in acoustic_rows),'methodExactDerivativeMatches':True,'yangMillsThresholdControls':y_boundary,'output':'cross-review-results.json'},indent=2))

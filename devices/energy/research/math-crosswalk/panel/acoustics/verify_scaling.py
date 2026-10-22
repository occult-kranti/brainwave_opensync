"""Bounded round-2 physical-model identifiability checks, not a theorem prover.

Run from any directory: python path/to/verify_scaling.py
Uses real production sphere calls and independent SciPy/NumPy formulations.
"""
from __future__ import annotations

import hashlib
import itertools
import json
import math
import platform
import subprocess
from functools import lru_cache
from pathlib import Path

import numpy as np
import scipy
from scipy.linalg import eigh
from scipy.optimize import brentq
from scipy.special import spherical_jn

HERE=Path(__file__).resolve().parent
REPO=HERE.parents[4]
CONTRACT=json.loads((HERE/'round2-contract.json').read_text())
TOL=CONTRACT['tolerances']
E0=CONTRACT['base']['youngPa']
RHO0=CONTRACT['base']['densityKgM3']


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def probe(requests):
    raw=subprocess.check_output(['node',str(HERE/'production-probe.mjs')],input=json.dumps(requests).encode())
    return json.loads(raw)


def sphere(young=E0,rho=RHO0,nu=.34,radius=.04445,index=0):
    return {'kind':'sphere','params':{'youngPa':young,'densityKgM3':rho,'poisson':nu,'radiusM':radius,'rootIndex':index}}


def relative(actual,expected):
    return float(abs(actual-expected)/max(abs(expected),1e-300))


@lru_cache(None)
def reference_root(nu,index):
    # Independent special functions, denser bracket and Brent solver; no production import.
    q=(1-2*nu)/(2*(1-nu))
    def residual(x): return x*spherical_jn(0,x)-4*q*spherical_jn(1,x)
    grid=np.arange(1e-5,(index+3)*np.pi,np.pi/180)
    values=residual(grid)
    brackets=np.flatnonzero(values[:-1]*values[1:]<0)
    assert len(brackets)>index
    j=brackets[index]
    return float(brentq(residual,grid[j],grid[j+1],xtol=2e-14,rtol=1e-14))


def reference_frequency(params):
    e,rho,nu,r,index=(params[k] for k in ['youngPa','densityKgM3','poisson','radiusM','rootIndex'])
    longitudinal=math.sqrt(e*(1-nu)/(rho*(1+nu)*(1-2*nu)))
    root=reference_root(nu,index)
    return root*longitudinal/(2*math.pi*r),root


def static_traction(young,nu,strain,normal):
    # Direct isotropic stress expression; independent of producer lambda/shear values.
    stress=young/(1+nu)*(strain+nu/(1-2*nu)*np.trace(strain)*np.eye(3))
    return stress@normal


def rank_record(matrix):
    a=np.array(matrix,dtype=float)
    singular=np.linalg.svd(a,compute_uv=False)
    rank=int(np.count_nonzero(singular>TOL['rankSingularValueCutoff']))
    return {'matrix':a.tolist(),'singularValues':singular.tolist(),'rank':rank,'nullity':a.shape[1]-rank}


def run():
    checks=[]
    def check(name,passed,evidence):
        checks.append({'name':name,'pass':bool(passed),'evidence':evidence})

    requests=[]
    cases=[]
    for split in ['development','heldOut']:
        group=CONTRACT[split]
        for nu,r,index,a in itertools.product(group['poisson'],group['radiusM'],group['rootIndices'],group['commonScales']):
            start=len(requests)
            requests.extend([sphere(nu=nu,radius=r,index=index),sphere(E0*a,RHO0*a,nu,r,index),sphere(E0*a,RHO0,nu,r,index)])
            cases.append({'split':split,'scale':a,'poisson':nu,'radiusM':r,'rootIndex':index,'offset':start})
    output=probe(requests)
    case_results=[]
    maxima={key:0.0 for key in ['frequencyRelative','rootAbsolute','commonScaleFrequencyRelative','massScaleRelative','modalMassScaleRelative','fixedDensityScaleRelative']}
    for c in cases:
        baseline,scaled,fixed=output[c['offset']:c['offset']+3]
        a=c['scale']
        errors={}
        for offset in range(3):
            reference,root=reference_frequency(requests[c['offset']+offset]['params'])
            maxima['frequencyRelative']=max(maxima['frequencyRelative'],relative(output[c['offset']+offset]['frequencyHz'],reference))
            maxima['rootAbsolute']=max(maxima['rootAbsolute'],abs(output[c['offset']+offset]['root']-root))
        errors['commonScaleFrequencyRelative']=relative(scaled['frequencyHz'],baseline['frequencyHz'])
        errors['massScaleRelative']=relative(scaled['massKg'],a*baseline['massKg'])
        errors['modalMassScaleRelative']=relative(scaled['modalMassKg'],a*baseline['modalMassKg'])
        errors['fixedDensityScaleRelative']=relative(fixed['frequencyHz'],math.sqrt(a)*baseline['frequencyHz'])
        for key,value in errors.items(): maxima[key]=max(maxima[key],value)
        case_results.append({**{k:v for k,v in c.items() if k!='offset'},'baselineHz':baseline['frequencyHz'],'commonScaledHz':scaled['frequencyHz'],'fixedDensityHz':fixed['frequencyHz'],'errors':errors})
    check('independent_sphere_roots_and_frequencies',maxima['frequencyRelative']<TOL['frequencyRelative'] and maxima['rootAbsolute']<TOL['rootAbsolute'],maxima)
    check('common_scale_invariance_in_real_sphere_code',max(maxima[k] for k in ['commonScaleFrequencyRelative','massScaleRelative','modalMassScaleRelative'])<TOL['frequencyRelative'],{'cases':len(cases),'heldOutCases':sum(c['split']=='heldOut' for c in cases)})
    check('fixed_density_positive_control',maxima['fixedDensityScaleRelative']<TOL['frequencyRelative'],{'maxRelativeError':maxima['fixedDensityScaleRelative'],'claim':'Only this homogeneous two-parameter scaling ambiguity is removed by fixing density.'})

    # Central differences use production calls. The kernel itself has an exact analytic derivation.
    h=TOL['logDifferenceStep']
    directions=CONTRACT['heldOut']['logDirections']
    sensitivity_requests=[]
    sensitivity_meta=[]
    for nu,r,index in [(0.34,.04445,0),(.417,.061,7)]:
        for direction in [[1,0],[0,1]]+directions:
            sensitivity_meta.append((nu,r,index,direction))
            for sign in [-1,1]:
                sensitivity_requests.append(sphere(E0*math.exp(sign*h*direction[0]),RHO0*math.exp(sign*h*direction[1]),nu,r,index))
    sensitivity_output=probe(sensitivity_requests)
    sensitivities=[]
    for i,(nu,r,index,direction) in enumerate(sensitivity_meta):
        low,high=sensitivity_output[2*i:2*i+2]
        numerical=(math.log(high['frequencyHz'])-math.log(low['frequencyHz']))/(2*h)
        exact=(direction[0]-direction[1])/2
        sensitivities.append({'poisson':nu,'radiusM':r,'rootIndex':index,'direction':direction,'numerical':numerical,'analytic':exact,'absoluteError':abs(numerical-exact)})
    frequency_jacobian=[[sensitivities[0]['numerical'],sensitivities[1]['numerical']],[sensitivities[6]['numerical'],sensitivities[7]['numerical']]]
    frequency_rank=rank_record(frequency_jacobian)
    frequency_mass_rank=rank_record(frequency_jacobian+[[0,1]])
    frequency_traction_rank=rank_record(frequency_jacobian+[[1,0]])
    kernel_residual=float(np.linalg.norm(np.array(frequency_jacobian)@np.array([1.,1.])))
    check('explicit_kernel_and_heldout_directions',max(s['absoluteError'] for s in sensitivities)<TOL['sensitivityAbsolute'] and kernel_residual<TOL['sensitivityAbsolute'] and frequency_rank['rank']==1,{'kernel':[1,1],'kernelResidual':kernel_residual,'rank':frequency_rank})
    check('independent_observable_removes_this_kernel',frequency_mass_rank['rank']==2 and frequency_traction_rank['rank']==2,{'withMass':frequency_mass_rank,'withCalibratedStaticTraction':frequency_traction_rank,'staticAlone':rank_record([[1,0]])})

    # Exact affine solution u(x)=Sx: constant stress has zero divergence and prescribed boundary trace.
    # Selected traces distinguish scaled materials; a full boundary map is never reconstructed here.
    development_strains=[np.eye(3)*1e-6,np.diag([1.,-1.,0.])*1e-6]
    static_results=[]
    static_requests=[]
    static_metadata=[]
    for split in ['development','heldOut']:
        group=CONTRACT[split]
        normals=[[1,0,0],[0,1,0]] if split=='development' else group['normalsBeforeNormalization']
        strains=development_strains if split=='development' else [np.array(group['strainMatrix'])]
        for nu,a,n,s in itertools.product(group['poisson'],group['commonScales'],normals,strains):
            normal=np.array(n,dtype=float); normal/=np.linalg.norm(normal)
            static_metadata.append((split,nu,a,normal,s))
            static_requests.extend([sphere(nu=nu),sphere(E0*a,RHO0*a,nu)])
    static_production=probe(static_requests)
    static_max=0.0
    for i,(split,nu,a,normal,strain) in enumerate(static_metadata):
        base,scaled=static_production[2*i:2*i+2]
        def from_lame(p): return (p['lambdaPa']*np.trace(strain)*np.eye(3)+2*p['shearPa']*strain)@normal
        t0,ta=from_lame(base),from_lame(scaled)
        tref=static_traction(E0*a,nu,strain,normal)
        errors=[float(np.linalg.norm(ta-a*t0)/np.linalg.norm(a*t0)),float(np.linalg.norm(ta-tref)/np.linalg.norm(tref))]
        static_max=max(static_max,*errors)
        static_results.append({'split':split,'scale':a,'poisson':nu,'normal':normal.tolist(),'strain':strain.tolist(),'baselineTractionPa':t0.tolist(),'scaledTractionPa':ta.tolist(),'relativeErrors':errors})
    check('calibrated_static_traction_distinguishes_scale',static_max<TOL['staticRelative'],{'cases':len(static_results),'maxRelativeError':static_max,'densityInStaticFormula':False})

    # Distinct finite two-coordinate fixture check: all stiffness, damping and mass terms scale.
    base_sphere=probe([sphere()])[0]
    ms=base_sphere['modalMassKg']; fs=base_sphere['frequencyHz']; ft=.83*fs
    base_params={'sphereHz':fs,'tableHz':ft,'sphereModalMassKg':ms,'tableModalMassKg':7*ms,'contactNpm':.07*ms*(2*math.pi*fs)**2,'position':.37,'sphereDamping':.004,'tableDamping':.018}
    frequencies=[0,.47*fs,.91*fs,1.23*fs]
    matrix_scales=CONTRACT['development']['commonScales']+CONTRACT['heldOut']['commonScales']
    matrix_requests=[]
    for a in matrix_scales:
        params={**base_params,'sphereModalMassKg':ms*a,'tableModalMassKg':7*ms*a,'contactNpm':base_params['contactNpm']*a}
        matrix_requests.append({'kind':'coupled','params':params,'frequenciesHz':frequencies})
    matrix_production=probe(matrix_requests)
    matrix_records=[]
    baseline_response=None
    baseline_eigenfrequencies=None
    matrix_max=0.0
    for a,p in zip(matrix_scales,matrix_production):
        phi=math.sin(math.pi*base_params['position']); masses=np.array([ms,7*ms])*a
        mass=np.diag(masses); wc=np.array([fs,ft])*2*math.pi
        k=np.diag(masses*wc**2)+base_params['contactNpm']*a*np.outer([1,-phi],[1,-phi])
        damping=np.diag(2*np.array([.004,.018])*masses*wc)
        eigenfrequencies=np.sqrt(eigh(k,mass,eigvals_only=True))/(2*math.pi)
        eig_error=float(np.max(abs(eigenfrequencies-np.array(p['system']['frequencyHz']))/eigenfrequencies))
        if baseline_eigenfrequencies is None: baseline_eigenfrequencies=eigenfrequencies
        eig_scale_error=float(np.max(abs(eigenfrequencies-baseline_eigenfrequencies)/baseline_eigenfrequencies))
        response_errors=[]
        complex_responses=[]
        for f,response in zip(frequencies,p['responses']):
            w=2*math.pi*f
            reference=np.linalg.solve(k-w*w*mass+1j*w*damping,np.array([1.,0.]))
            actual=np.array([complex(response['sphereRe'],response['sphereIm']),complex(response['tableRe'],response['tableIm'])])
            response_errors.append(float(np.linalg.norm(actual-reference)/np.linalg.norm(reference)))
            complex_responses.append(actual)
        normalized=np.array(complex_responses)*a
        if baseline_response is None: baseline_response=normalized
        scale_error=float(np.linalg.norm(normalized-baseline_response)/np.linalg.norm(baseline_response))
        matrix_max=max(matrix_max,eig_error,eig_scale_error,max(response_errors),scale_error)
        matrix_records.append({'scale':a,'eigenfrequenciesHz':eigenfrequencies.tolist(),'eigenRelativeError':eig_error,'commonScaleEigenRelativeError':eig_scale_error,'responseRelativeErrors':response_errors,'scaledResponseRelativeError':scale_error})
    check('finite_fixture_independent_eigensolver_and_frf',matrix_max<TOL['matrixResponseRelative'],{'maxRelativeError':matrix_max,'scales':matrix_scales,'responseFrequenciesHz':frequencies,'label':'Finite two-mode model; not a continuum reconstruction'})

    witness_base,witness_scaled,witness_rho_only=probe([sphere(),sphere(E0*2,RHO0*2),sphere(E0,RHO0*3)])
    strain=np.eye(3)*1e-6; normal=np.array([1.,0.,0.])
    t0=static_traction(E0,.34,strain,normal); ta=static_traction(2*E0,.34,strain,normal)
    t_rho_only=(witness_rho_only['lambdaPa']*np.trace(strain)*np.eye(3)+2*witness_rho_only['shearPa']*strain)@normal
    same_frequency=relative(witness_base['frequencyHz'],witness_scaled['frequencyHz'])<TOL['frequencyRelative']
    different_static=bool(np.linalg.norm(ta-t0)>1)
    same_static_distinct_rho=relative(np.linalg.norm(t_rho_only),np.linalg.norm(t0))<TOL['staticRelative']
    unit_scale_response=matrix_production[matrix_scales.index(1)]['responses'][2]
    double_scale_response=matrix_production[matrix_scales.index(2)]['responses'][2]
    h1=complex(unit_scale_response['sphereRe'],unit_scale_response['sphereIm'])
    h2=complex(double_scale_response['sphereRe'],double_scale_response['sphereIm'])
    gain0=.5; gain_scaled=1.
    gain_error=relative(gain_scaled*h2,gain0*h1)
    gain_hides_scale=gain_error<TOL['matrixResponseRelative'] and relative(h2,h1)>.1
    wrong_controls={
        'frequencyOnlyUniqueEAndRho':{'claimAccepted':not same_frequency,'counterexampleVerified':same_frequency,'distinctParameters':[[E0,RHO0],[2*E0,2*RHO0]],'frequenciesHz':[witness_base['frequencyHz'],witness_scaled['frequencyHz']]},
        'equalFrequenciesImplyEqualStaticTraction':{'claimAccepted':not(same_frequency and different_static),'counterexampleVerified':same_frequency and different_static,'tractionNormPa':[float(np.linalg.norm(t0)),float(np.linalg.norm(ta))]},
        'staticTractionIdentifiesDensity':{'claimAccepted':not same_static_distinct_rho,'counterexampleVerified':same_static_distinct_rho,'fixedYoungDistinctRho':[RHO0,3*RHO0],'tractionNormPa':[float(np.linalg.norm(t0)),float(np.linalg.norm(t_rho_only))]},
        'unknownGainBreaksScaleAmbiguity':{'claimAccepted':not gain_hides_scale,'counterexampleVerified':gain_hides_scale,'formula':'H_a=H/a and gain_a=a*gain, hence gain_a*H_a=gain*H','a':2,'gain':[gain0,gain_scaled],'measuredResponseRelativeDifference':gain_error,'uncalibratedResponseFrequencyHz':frequencies[2]}
    }
    check('wrong_inference_controls_rejected',all(item['counterexampleVerified'] and not item['claimAccepted'] for item in wrong_controls.values()),wrong_controls)

    result={
        'schemaVersion':1,'round':2,'kind':'floating-point checks of analytic model identities','allPassed':all(c['pass'] for c in checks),
        'noPhysicalMeasurements':True,'noGeneralInverseTheoremProved':True,'contractSha256':digest(HERE/'round2-contract.json'),
        'environment':{'python':platform.python_version(),'numpy':np.__version__,'scipy':scipy.__version__,'node':subprocess.check_output(['node','--version'],text=True).strip()},
        'checks':checks,'maxErrors':maxima,'caseCounts':{'sphere':len(cases),'productionSphereCalls':len(requests)+len(sensitivity_requests)+len(static_requests)+4,'heldOutSphere':sum(c['split']=='heldOut' for c in cases),'static':len(static_results),'finiteFixture':len(matrix_scales)},
        'sphereCases':case_results,'sensitivities':sensitivities,'staticCases':static_results,'finiteFixtureCases':matrix_records,
        'limits':['Homogeneous isotropic material, fixed geometry and Poisson ratio in each comparison','Selected radial modes do not exhaust a sphere spectrum','Common scaling is an analytic counterexample to frequency-only identification, not a counterexample to family 372','Added mass or traction gives rank two only within the declared two-parameter model','No reconstruction or noise-stability theorem, no laboratory data, no free energy']
    }
    result_path=HERE/'round2-results.json'
    result_path.write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    bound_paths=[HERE/'round2-contract.json',HERE/'production-probe.mjs',HERE/'verify_scaling.py',result_path,REPO/'location-spectrum/src/models.mjs']
    manifest={'scope':'Exact producer, independent checker, frozen contract, results and imported production source bytes; no unrelated repository files certified','files':{str(p.relative_to(REPO)):digest(p) for p in bound_paths}}
    (HERE/'round2-hashes.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps({'allPassed':result['allPassed'],'checks':len(checks),'caseCounts':result['caseCounts'],'maxErrors':maxima,'output':str(result_path)},indent=2))
    if not result['allPassed']: raise SystemExit(1)


if __name__=='__main__': run()

#!/usr/bin/env python3
"""Independent Round 3 traction/quadrature/generalized-eigenproblem review.

Uses SciPy direct radial stress roots, volume quadrature, and generalized eigh;
does not copy the producer's trigonometric root formula, analytic mass integral,
or Jacobi eigensolver. The declared rank-one contact potential is shared physics,
not independent empirical evidence. Binary64 finite grid, no interval enclosure.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import subprocess

import numpy as np
import scipy
from scipy.integrate import quad
from scipy.linalg import eigh
from scipy.optimize import brentq
from scipy.special import spherical_jn


def require(condition, message):
    if not condition:
        raise ValueError(message)


def relative_error(actual, expected):
    a, b = np.asarray(actual,dtype=float), np.asarray(expected,dtype=float)
    return float(np.max(np.abs(a-b)/np.maximum(np.maximum(np.abs(a), np.abs(b)), 1e-300)))


def radial_reference(nu):
    # Divide only the material coefficients by lambda+2mu. The root equation
    # remains direct radial stress, using SciPy's spherical-Bessel derivative.
    normalized_lambda = nu/(1-nu)
    stress = lambda x: x*spherical_jn(1, x, derivative=True)+2*normalized_lambda*spherical_jn(1, x)
    roots = np.array([brentq(stress, max(1e-12, j*np.pi), (j+1)*np.pi,
                            xtol=5e-15, rtol=4*np.finfo(float).eps) for j in range(3)])
    integrals, errors = [], []
    for x in roots:
        integral, error = quad(lambda y: (spherical_jn(1, x*y)/spherical_jn(1, x))**2*y*y,
                               0, 1, epsabs=2e-14, epsrel=2e-14)
        integrals.append(integral)
        errors.append(error)
    return roots, np.array(integrals), max(errors), max(abs(stress(x)) for x in roots)


def specimen_reference(parameters, radial):
    r, e, nu, rho = [parameters[k] for k in ('radiusM','youngPa','poisson','densityKgM3')]
    roots, integrals, _, _ = radial[nu]
    mu=e/(2*(1+nu)); lam=e*nu/((1+nu)*(1-2*nu))
    speed=np.sqrt((lam+2*mu)/rho)
    frequencies=roots*speed/(2*np.pi*r)
    masses=4*np.pi*rho*r**3*integrals
    mass=4*np.pi*rho*r**3/3
    return frequencies,masses,mass


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2])
    parser.add_argument('--output',type=Path,default=Path(__file__).with_name('round3-independent-results.json'))
    args=parser.parse_args()
    app=args.root/'sphere-lab-repo/copper-experiment'
    nus=[-.9,-.5,0,.3,.35,.45,.49]
    radii=[1e-5,.0125,.04445,1]
    materials=[(1e6,1),(1e6,30000),(123.5e9,8960),(1e12,1),(1e12,30000)]
    radial={nu:radial_reference(nu) for nu in nus}
    cases=[]
    for nu in nus:
        for radius in radii:
            for young,density in materials:
                p=dict(radiusM=radius,youngPa=young,poisson=nu,densityKgM3=density)
                f,m,_=specimen_reference(p,radial)
                first_stiffness=m[0]*(2*np.pi*f[0])**2
                ks=sorted(set(min(1e12,factor*first_stiffness) for factor in [0,1e-8,.001,.1,1,99]))
                cases.extend(dict(p,contactNpm=k) for k in ks)
    # Explicit defaults and the original Position-size reference at fixed k.
    for radius in [.04445,.0125]:
        for k in [0,1e8,1e10]:
            cases.append(dict(radiusM=radius,youngPa=123.5e9,poisson=.35,densityKgM3=8960,contactNpm=k))
    node=r"""
import fs from 'node:fs';
import {groundedPointSpringDiagnostics} from './sphere-lab-repo/copper-experiment/src/modal-diagnostics.mjs';
const cases=JSON.parse(fs.readFileSync(0,'utf8'));
console.log(JSON.stringify(cases.map(p=>{try{return {ok:true,value:groundedPointSpringDiagnostics(p)}}catch(e){return {ok:false,error:e.message}}})));
"""
    process=subprocess.run(['node','--input-type=module','-e',node],input=json.dumps(cases),
                           cwd=args.root,text=True,capture_output=True,check=True)
    produced=json.loads(process.stdout)
    require(len(produced)==len(cases),'Producer case count mismatch')
    maxima=dict(frequency_relative=0.,modal_mass_relative=0.,total_mass_relative=0.,
                coupled_frequency_relative=0.,original_generalized_residual=0.,
                mass_orthogonality_error=0.,producer_reported_residual=0.,trace_relative=0.)
    rows=[]
    for index,(p,got) in enumerate(zip(cases,produced)):
        require(got['ok'],f'Valid finite grid case {index} rejected: {got.get("error")}')
        result=got['value']; f,m,mass=specimen_reference(p,radial)
        mmat=np.diag(m); k0=np.diag(m*(2*np.pi*f)**2)
        contact=p['contactNpm']*np.ones((3,3)); stiffness=k0+contact
        eigen,vec=eigh(stiffness,mmat,driver='gvd')
        expected=np.sqrt(eigen)/(2*np.pi)
        diagonal_same_mass=np.sqrt(f*f+p['contactNpm']/(4*np.pi*np.pi*m))
        legacy=np.sqrt(f*f+p['contactNpm']/(4*np.pi*np.pi*mass))
        errs=dict(frequency_relative=relative_error(result['free']['frequencyHz'],f),
                  modal_mass_relative=relative_error(result['free']['modalMassKg'],m),
                  total_mass_relative=relative_error(result['free']['massKg'],mass),
                  coupled_frequency_relative=relative_error(result['coupledFrequencyHz'],expected),
                  producer_reported_residual=result['eigensolver']['maxRelativeResidual'])
        u=np.asarray(result['physicalCoordinateEigenvectors'],dtype=float).T
        lam=np.asarray(result['eigenvaluePerS2'],dtype=float)
        residual=stiffness@u-mmat@u@np.diag(lam)
        denominators=np.linalg.norm(stiffness)*np.linalg.norm(u,axis=0)+lam*np.linalg.norm(mmat@u,axis=0)
        errs['original_generalized_residual']=float(np.max(np.linalg.norm(residual,axis=0)/denominators))
        errs['mass_orthogonality_error']=float(np.max(np.abs(u.T@mmat@u-np.eye(3))))
        errs['trace_relative']=relative_error(np.sum(lam),np.trace(np.diag(1/np.sqrt(m))@stiffness@np.diag(1/np.sqrt(m))))
        for key,value in errs.items():maxima[key]=max(maxima[key],value)
        require(errs['modal_mass_relative']<5e-11,f'Modal mass mismatch at {index}')
        require(errs['frequency_relative']<5e-12,f'Free frequency mismatch at {index}')
        require(errs['coupled_frequency_relative']<2e-11,f'Coupled spectrum mismatch at {index}')
        require(errs['original_generalized_residual']<2e-12,f'Original-coordinate residual failed at {index}')
        require(errs['mass_orthogonality_error']<2e-11,f'Mass orthogonality failed at {index}')
        require(np.all(eigen>0),f'Nonpositive independent eigenvalues at {index}')
        require(relative_error(result['legacyIndependentSpring']['frequencyHz'],legacy)<5e-12,'Legacy toy mismatch')
        require(np.max(np.abs(np.asarray(result['contactStiffnessNpm'])-contact))==0,'Missing contact cross term')
        require(abs(np.array([1.,-1.,0.])@contact@np.array([1.,-1.,0.]))==0,'Rank-one contact kernel failed')
        rows.append({'parameters':p,'free_frequency_hz':f.tolist(),'modal_mass_kg':m.tolist(),
                     'scipy_coupled_hz':expected.tolist(),'errors':errs,
                     'full_minus_correct_mass_diagonal_hz':(expected-diagonal_same_mass).tolist(),
                     'full_minus_legacy_whole_mass_diagonal_hz':(expected-legacy).tolist(),
                     'producer_iterations':result['eigensolver']['iterations']})
    require(maxima['producer_reported_residual']<2e-12,'Producer admitted excessive residual')
    # Rejection examples are executed, not inferred from documented bounds.
    invalid=[{'contactNpm':-1},{'radiusMm':12.5},{'poisson':.5},
             {'radiusM':1e-5,'youngPa':1e6,'densityKgM3':1,'poisson':-.9,'contactNpm':1e12}]
    badproc=subprocess.run(['node','--input-type=module','-e',node],input=json.dumps(invalid),
                           cwd=args.root,text=True,capture_output=True,check=True)
    rejected=json.loads(badproc.stdout)
    require(all(not r['ok'] for r in rejected),'Invalid or excessive-relative-contact case accepted')
    bounds_node=r"""
import {solidRadialModes,groundedPointSpringDiagnostics} from './sphere-lab-repo/copper-experiment/src/modal-diagnostics.mjs';
const p={radiusM:1e-5,youngPa:1e6,poisson:.35,densityKgM3:1};
const free=solidRadialModes(p),k1=free.modalMassKg[0]*(2*Math.PI*free.frequencyHz[0])**2;
const boundary=[99,100,101].map(r=>{try{const v=groundedPointSpringDiagnostics({...p,contactNpm:r*k1});return {requestedRatio:r,accepted:true,actualRatio:v.contactToFirstModalStiffness}}catch(e){return {requestedRatio:r,accepted:false,error:e.message}}});
const d=groundedPointSpringDiagnostics();
console.log(JSON.stringify({relativeContactBoundary:boundary,defaults:{parameters:d.free.parameters,contactNpm:d.contactNpm,massKg:d.free.massKg,modalMassKg:d.free.modalMassKg,coupledFrequencyHz:d.coupledFrequencyHz}}));
"""
    bounds_process=subprocess.run(['node','--input-type=module','-e',bounds_node],
                                 cwd=args.root,text=True,capture_output=True,check=True)
    bounds=json.loads(bounds_process.stdout)
    require([r['accepted'] for r in bounds['relativeContactBoundary']]==[True,True,False],
            'Relative-contact boundary controls failed')
    require(relative_error(bounds['defaults']['coupledFrequencyHz'],rows[-5]['scipy_coupled_hz'])<2e-11,
            'No-argument defaults differ from explicit independently reconstructed defaults')
    require(relative_error(bounds['defaults']['modalMassKg'],rows[-5]['modal_mass_kg'])<5e-11,
            'No-argument default modal masses mismatch')
    paths=['src/modal-diagnostics.mjs','src/models.mjs','models.html','src/app.mjs','src/acquisition-ui.mjs','src/run-export.mjs']
    output={'schema':'seat3-round3-independent-modal/1',
            'status':'executed finite-grid binary64 numerical review; no physical validation',
            'independence':'Direct SciPy j1 stress derivative roots, numerical volume quadrature and generalized eigh independently reconstruct the equations. Shared model premises are not independent experimental evidence. Producer Node output is used only as the comparison target.',
            'versions':{'numpy':np.__version__,'scipy':scipy.__version__},
            'source_sha256':{p:hashlib.sha256((app/p).read_bytes()).hexdigest() for p in paths},
            'grid':{'poisson':nus,'radius_m':radii,'young_density_pairs':materials,
                    'relative_contact_levels_before_absolute_cap':[0,1e-8,.001,.1,1,99],
                    'absolute_contact_cap_N_per_m':1e12,'cases':len(cases)},
            'maxima':maxima,'quadrature_reported_absolute_error_max':max(v[2] for v in radial.values()),
            'direct_traction_residual_max':max(v[3] for v in radial.values()),
            'invalid_controls':[{'parameters':p,**r} for p,r in zip(invalid,rejected)],
            'default_and_relative_contact_bound_controls':bounds,
            'reference_cases':rows[-6:],'case_results':rows,
            'limits':['Finite parameter grid does not prove the entire continuous input domain.',
                      'SciPy and producer use binary64, not rigorous outward interval arithmetic.',
                      'Residuals check numerical backward agreement, not the adequacy of a radial-only point-contact truncation.',
                      'No damping, rigid/nonradial motion, finite contact area, fixture, sensor or actual specimen calibration is tested.',
                      'Mode-ratio changes do not identify contact, absolute position or a unique cause.']}
    args.output.write_text(json.dumps(output,indent=2,allow_nan=False)+'\n')
    print(json.dumps({'output':str(args.output),'cases':len(cases),'maxima':maxima,'invalid_controls_rejected':len(invalid)}))


if __name__=='__main__':
    main()

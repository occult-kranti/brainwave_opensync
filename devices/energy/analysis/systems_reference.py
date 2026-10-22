#!/usr/bin/env python3
"""Independent round-2 impedance-identifiability and cross-domain phasor references.

Derived from the panel's frozen round-1 equations before reading producer JS.
NumPy complex matrix solves are independent of their scalar complex implementations.
No hardware data, no physical parameter identification, no nuclear-device model.
"""
from __future__ import annotations
import argparse
from decimal import Decimal
import hashlib
import json
from pathlib import Path
import numpy as np

BASE = dict(L=.01, C=2.533e-6, R=12., m=.02, b=.4, k=20000., g=2.)
LOG_PARAMETERS = ('m', 'b', 'k', 'g')
SCALES = [.25, .5, 1., 2., 4., 10.]
FREQUENCIES = np.geomspace(25., 4000., 201)
JAC_FREQUENCIES = np.array([50., 100., 200., 400., 800., 1600., 3200.])


def response(p, frequencies):
    s = 2j * np.pi * np.asarray(frequencies)
    zm = p['m'] * s + p['b'] + p['k'] / s
    ze = p['L'] * s + p['R'] + 1. / (p['C'] * s)
    return ze + p['g']**2 / zm, p['g'] / zm, p['g']**2 / zm


def scaled(p, a):
    if not np.isfinite(a) or not .01 <= a <= 100.:
        raise ValueError('scale must lie in [0.01, 100]')
    return {**p, 'm': a*p['m'], 'b': a*p['b'], 'k': a*p['k'], 'g': np.sqrt(a)*p['g']}


def jacobian(include_velocity=False):
    h = 1e-5
    _, base_v, base_reflected = response(BASE, JAC_FREQUENCIES)
    def vector(p):
        _, v, reflected = response(p, JAC_FREQUENCIES)
        a = reflected / np.abs(base_reflected)
        rows = [a.real, a.imag]
        if include_velocity:
            b = v / np.abs(base_v)
            rows += [b.real, b.imag]
        return np.concatenate(rows)
    columns = []
    for name in LOG_PARAMETERS:
        plus, minus = dict(BASE), dict(BASE)
        plus[name] *= np.exp(h); minus[name] *= np.exp(-h)
        columns.append((vector(plus)-vector(minus))/(2*h))
    return np.array(columns).T


def complex_json(z):
    return {'real': float(z.real), 'imag': float(z.imag)}


def em_fixture():
    p = dict(L1=.01, L2=.01, C1=2.533e-6, C2=2.533e-6,
             R1=2., R2=2., RL=10., M=.005, g=1., m=.01,
             b=.2, bL=.1, k=15791.367041742973,
             frequencyHz=1000., voltagePeak=1., forcePeak=.01)
    w = 2*np.pi*p['frequencyHz']; s = 1j*w
    z1 = p['R1']+s*p['L1']+1/(s*p['C1'])
    z2 = p['R2']+p['RL']+s*p['L2']+1/(s*p['C2'])
    zm = p['b']+p['bL']+s*p['m']+p['k']/s
    a = np.array([[z1,s*p['M'],0],[s*p['M'],z2,p['g']],[0,-p['g'],zm]],complex)
    drive = np.array([p['voltagePeak'],0,p['forcePeak']],complex)
    i1,i2,v = np.linalg.solve(a,drive)
    source = .5*np.real(p['voltagePeak']*np.conjugate(i1)+p['forcePeak']*np.conjugate(v))
    output = .5*(p['RL']*abs(i2)**2+p['bL']*abs(v)**2)
    loss = .5*(p['R1']*abs(i1)**2+p['R2']*abs(i2)**2+p['b']*abs(v)**2)
    residual = float(output+loss-source)
    if abs(residual)>1e-14: raise RuntimeError('Independent EM power closure failed')
    return {'model':'six-state fixed-mutual-inductance model; independent frequency-domain reference',
            'convention':'peak phasors, real source amplitudes at phase zero','parameters':p,
            'phasors':dict(i1=complex_json(i1),i2=complex_json(i2),velocity=complex_json(v)),
            'inputW':float(source),'loadW':float(output),'lossW':float(loss),'closureW':residual}


def acoustic_fixture():
    p = dict(m=.01,b=.2,k=4000.,theta=.02,Cp=1e-6,R=10000.,Gd=1e-7,
             frequencyHz=100.,forcePeak=.01)
    w=2*np.pi*p['frequencyHz'];s=1j*w
    a=np.array([[p['b']+s*p['m']+p['k']/s,p['theta']],[-p['theta'],p['Gd']+1/p['R']+s*p['Cp']]],complex)
    velocity,voltage=np.linalg.solve(a,np.array([p['forcePeak'],0],complex))
    source=.5*np.real(p['forcePeak']*np.conjugate(velocity))
    output=.5*abs(voltage)**2/p['R']
    loss=.5*(p['b']*abs(velocity)**2+p['Gd']*abs(voltage)**2)
    residual=float(output+loss-source)
    if abs(residual)>1e-14:raise RuntimeError('Independent acoustic power closure failed')
    return {'model':'linear piezoelectric force-input model; not an acoustic-pressure-to-force calibration',
            'convention':'peak phasors','parameters':p,
            'phasors':dict(velocity=complex_json(velocity),voltage=complex_json(voltage)),
            'inputW':float(source),'loadW':float(output),'lossW':float(loss),'closureW':residual}


def run():
    z0,v0,r0=response(BASE,FREQUENCIES)
    cases=[]
    for a in SCALES:
        z,v,r=response(scaled(BASE,a),FREQUENCIES)
        zd=float(np.max(abs(z-z0)/abs(z0)))
        rd=float(np.max(abs(r-r0)/abs(r0)))
        vr=float(np.max(abs(v/v0-1/np.sqrt(a))))
        if max(zd,rd,vr)>1e-12:raise RuntimeError('Scaling witness failed')
        cases.append({'scale':a,'maxElectricalRelativeDifference':zd,'maxReflectedRelativeDifference':rd,
                      'expectedVelocityRatio':float(1/np.sqrt(a)),'maxVelocityRatioError':vr})
    j=jacobian();aug=jacobian(True);sv=np.linalg.svd(j,compute_uv=False);asv=np.linalg.svd(aug,compute_uv=False)
    threshold=1e-7*sv[0];rank=int(np.sum(sv>threshold));arank=int(np.sum(asv>1e-7*asv[0]))
    witness=np.array([1.,1.,1.,.5]);nr=float(np.max(abs(j@witness)))
    if rank!=3 or arank!=4 or nr>1e-7:raise RuntimeError('Jacobian identifiability gate failed')
    # Exact decimal unit arithmetic. No rate, apparatus or nuclear calculation.
    barn_m2=Decimal('1e-28');pico=Decimal('1e-12');cm2_m2=Decimal('1e-4')
    pb_cm2=barn_m2*pico/cm2_m2;printed_cm2=Decimal('1e-12')
    return {'schema':1,'status':'passed within declared synthetic models','date':'2026-10-21',
            'provenance':'Independent equations and NumPy reference frozen before producer-code inspection',
            'physicalMeasurements':0,'independence':{'emJsRead':False,'acousticJsRead':False},
            'identifiability':{'parameters':BASE,'frequencyGridHz':FREQUENCIES.tolist(),'scales':SCALES,
                'comparisons':len(FREQUENCIES)*len(SCALES),'cases':cases,'jacobianFrequenciesHz':JAC_FREQUENCIES.tolist(),
                'jacobian':'real and imaginary reflected impedance divided by fixed baseline magnitude; centered log-parameter differences',
                'logParameterOrder':list(LOG_PARAMETERS),'logStep':1e-5,'rankRelativeTolerance':1e-7,
                'singularValues':sv.tolist(),'rank':rank,'nullity':4-rank,'analyticNullVector':witness.tolist(),
                'maxNumericNullResidual':nr,'withCalibratedVelocity':{'rank':arank,'nullity':4-arank,'singularValues':asv.tolist()},
                'limits':'Exact scaling proof supplies the continuous-family claim. Sampled numerical rank is local to the stated parameters and frequencies. Electrical L,C,R known; no independent force input.'},
            'electromagneticFixture':em_fixture(),'acousticFixture':acoustic_fixture(),
            'marrsUnitCheck':{'barn_m2':str(barn_m2),'pico':str(pico),'cm2_m2':str(cm2_m2),
                'onePicobarn_cm2':str(pb_cm2),'printedParenthesis_cm2':str(printed_cm2),'factorMismatch':str(printed_cm2/pb_cm2),
                'source':'BIPM SI Brochure 9th ed. V4.01 June2026, Tables7 and8; MARRS HR001126S0007 printed/PDF p4',
                'scope':'Unit inconsistency only. No intended cross section guessed; no experiment or program validated/refuted.'}}

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path,required=True);args=ap.parse_args()
    result=run();result['sourceSha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    print(json.dumps({'status':result['status'],'frequencyScaleCases':result['identifiability']['comparisons'],
        'rank':result['identifiability']['rank'],'rankWithVelocity':result['identifiability']['withCalibratedVelocity']['rank'],
        'emClosureW':result['electromagneticFixture']['closureW'],'acousticClosureW':result['acousticFixture']['closureW'],
        'unitFactor':result['marrsUnitCheck']['factorMismatch']}))

#!/usr/bin/env python3
"""Independent formulation, same acoustic panel author: state matrix + time ODE.
RMS phasors, independent sampled Simpson work/loss quadrature. No hardware data.
Run: python3 -B analysis/acoustic_reference.py --output research/panel/acoustic/results.json
"""
import argparse
import hashlib
import json
from pathlib import Path
import numpy as np
from scipy.integrate import solve_ivp, simpson

DEFAULT = dict(frequencyHz=200., loadOhm=10000., forceRmsN=.001, massKg=.005,
               stiffnessNPerM=.005*(2*np.pi*200)**2, dampingNsPerM=.2,
               couplingNPerV=.01, capacitanceF=1e-7, dielectricConductanceS=0.)

def matrix(p):
    m,k,b,theta,C = (p[n] for n in ('massKg','stiffnessNPerM','dampingNsPerM','couplingNPerV','capacitanceF'))
    G=p['dielectricConductanceS']+1/p['loadOhm']
    return np.array([[0.,1.,0.],[-k/m,-b/m,-theta/m],[0.,theta/C,-G/C]])

def energy(y,p):
    return .5*(p['stiffnessNPerM']*y[0]**2+p['massKg']*y[1]**2+p['capacitanceF']*y[2]**2)

def harmonic(p):
    # Solve the full first-order complex state matrix; no scalar elimination.
    h=np.linalg.solve(1j*2*np.pi*p['frequencyHz']*np.eye(3)-matrix(p),
                      [0.,p['forceRmsN']/p['massKg'],0.])
    pin=p['forceRmsN']*h[1].real;load=abs(h[2])**2/p['loadOhm']
    mech=p['dampingNsPerM']*abs(h[1])**2;diel=p['dielectricConductanceS']*abs(h[2])**2
    return h,dict(inputW=float(pin),loadW=float(load),mechanicalLossW=float(mech),dielectricLossW=float(diel),
                  residualW=float(load+mech+diel-pin),voltageRmsV=float(abs(h[2])),velocityRmsMps=float(abs(h[1])))

def time_audit(p,initial=None,cycles=40,drive=True):
    # ODE contains states only, not cumulative work/loss states.
    A=matrix(p);w=2*np.pi*p['frequencyHz'];T=cycles/p['frequencyHz']
    y0=np.zeros(3) if initial is None else np.asarray(initial,dtype=float)
    def force(t):return np.sqrt(2)*p['forceRmsN']*np.cos(w*t) if drive else np.zeros_like(t)
    def rhs(t,y):
        result=A@y;result[1]+=force(t)/p['massKg'];return result
    solution=solve_ivp(rhs,(0.,T),y0,method='DOP853',rtol=2e-11,atol=1e-14,dense_output=True,max_step=1/(p['frequencyHz']*12))
    if not solution.success:raise RuntimeError(solution.message)
    result=[]
    for per_cycle in (32,64,128):
        t=np.linspace(0.,T,cycles*per_cycle+1);y=solution.sol(t);x,u,V=y
        work=float(simpson(force(t)*u,x=t));load=float(simpson(V*V/p['loadOhm'],x=t))
        mech=float(simpson(p['dampingNsPerM']*u*u,x=t));diel=float(simpson(p['dielectricConductanceS']*V*V,x=t))
        du=float(energy(y[:,-1],p)-energy(y[:,0],p));res=load+mech+diel+du-work
        scale=max(abs(work),float(energy(y[:,0],p)),load+mech+diel,1e-30)
        result.append(dict(samplesPerCycle=per_cycle,inputJ=work,loadJ=load,mechanicalLossJ=mech,dielectricLossJ=diel,
                           initialStoredJ=float(energy(y[:,0],p)),finalStoredJ=float(energy(y[:,-1],p)),storageChangeJ=du,
                           residualJ=res,relativeResidual=abs(res)/scale))
    return result

def run():
    fixtures=[]
    cases=[('default',{}),('held-out',dict(frequencyHz=237.5,loadOhm=17321.,forceRmsN=.0007,dampingNsPerM=.31,dielectricConductanceS=2e-6)),
           ('zero-coupling',dict(couplingNPerV=0.)),('zero-drive',dict(forceRmsN=0.))]
    for name,patch in cases:
        p={**DEFAULT,**patch};h,powers=harmonic(p)
        fixtures.append(dict(name=name,parameters=p,**powers))
        if abs(powers['residualW'])>1e-12*max(powers['inputW'],1e-12):raise AssertionError(name+' harmonic closure')
    startup=time_audit(DEFAULT)
    held=time_audit({**DEFAULT,**cases[1][1]})
    initial=[2e-5,.001,.2];decay=time_audit(DEFAULT,initial=initial,drive=False)
    zero=time_audit({**DEFAULT,'forceRmsN':0.},cycles=4)
    for name,rows in [('startup',startup),('held-out',held),('decay',decay)]:
        if rows[-1]['relativeResidual']>=3e-7:raise AssertionError(name+' time closure '+str(rows[-1]['relativeResidual']))
        if abs(rows[-1]['residualJ'])>=abs(rows[0]['residualJ']):raise AssertionError(name+' refinement did not improve')
    if any(x['loadJ'] or x['inputJ'] or x['initialStoredJ'] or x['finalStoredJ'] for x in zero):raise AssertionError('zero-drive nonzero output')
    if fixtures[2]['loadW']!=0:raise AssertionError('zero-coupling output')
    if decay[-1]['loadJ']+decay[-1]['mechanicalLossJ']+decay[-1]['dielectricLossJ']>decay[-1]['initialStoredJ']*(1+3e-7):raise AssertionError('undriven energy exceeds initial storage')
    return {'status':'passed','scope':'Two numerical formulations and external quadrature by the same acoustic panel author; not independent human review or hardware validation.',
            'amplitudeConvention':'RMS phasors; time forcing sqrt(2)*F_rms*cos(omega*t)',
            'fixtures':fixtures,'timeChecks':{'startup':startup,'heldOut':held,'sourceOffDecay':decay,'zeroDrive':zero},
            'controls':['full state-matrix harmonic solution','held-out off-grid frequency and load','external Simpson quadrature refinement','zero coupling','zero drive/zero initial state','source-off stored-energy decay'],
            'sourceSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path);args=ap.parse_args();data=run()
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(data,indent=2)+'\n')
    print(json.dumps({'status':data['status'],'fixtures':len(data['fixtures']),'controls':len(data['controls']),
                      'finestRelativeResiduals':{k:v[-1]['relativeResidual'] for k,v in data['timeChecks'].items()}}))

#!/usr/bin/env python3
"""Independent NumPy impedance and SciPy time-domain checks of src/em.mjs.
No hardware observations. Work/loss quadrature is external to the state ODE.
Run: python3 -B analysis/em_reference.py --output research/panel/tesla/em-results.json
"""
from pathlib import Path
import argparse, hashlib, json, math, subprocess
import numpy as np
from scipy.integrate import solve_ivp

ROOT=Path(__file__).resolve().parents[1]
DEFAULT=dict(frequencyHz=1000.,coupling=.3,loadOhm=20.,driveVrms=1.,L1H=.01,L2H=.01,C1F=2.5330295910584444e-6,C2F=2.5330295910584444e-6,R1Ohm=2.,R2Ohm=2.,massKg=.001,stiffnessNpm=39478.41760435743,dampingNsPm=.05,mechanicalLoadNsPm=.1,transducerNA=.5)

def ensure(condition,message):
    if not condition: raise RuntimeError(message)

def phasor(options):
    p=DEFAULT|options; w=2*np.pi*p['frequencyHz']; M=p['coupling']*math.sqrt(p['L1H']*p['L2H']);g=p['transducerNA']
    A=np.array([[p['R1Ohm']+1j*(w*p['L1H']-1/(w*p['C1F'])),1j*w*M,0],[1j*w*M,p['R2Ohm']+p['loadOhm']+1j*(w*p['L2H']-1/(w*p['C2F'])),g],[0,-g,p['dampingNsPm']+p['mechanicalLoadNsPm']+1j*(w*p['massKg']-p['stiffnessNpm']/w)]],complex)
    i1,i2,v=np.linalg.solve(A,np.array([p['driveVrms'],0,0],complex)) if p['driveVrms'] else np.zeros(3,complex)
    inputW=p['driveVrms']*i1.real;out1=p['loadOhm']*abs(i2)**2;out2=p['mechanicalLoadNsPm']*abs(v)**2;loss=p['R1Ohm']*abs(i1)**2+p['R2Ohm']*abs(i2)**2+p['dampingNsPm']*abs(v)**2
    z=np.array([i1/(1j*w),i2/(1j*w),i1,i2,v/(1j*w),v]); K=np.diag([1/p['C1F'],1/p['C2F'],p['L1H'],p['L2H'],p['stiffnessNpm'],p['massKg']]);K[2,3]=K[3,2]=M; ab=np.array([z.real,-z.imag]); gram=ab@K@ab.T;peakStoredJ=float(np.linalg.eigvalsh(gram)[-1]);averageStoredJ=float(np.trace(gram)/2)
    return dict(peakStoredJ=peakStoredJ,averageStoredJ=averageStoredJ,inputW=float(inputW),electricalLoadW=float(out1),mechanicalLoadW=float(out2),lossW=float(loss),outputW=float(out1+out2),residualW=float(out1+out2+loss-inputW),primaryCurrentRmsA=float(abs(i1)),secondaryCurrentRmsA=float(abs(i2)),velocityRmsMps=float(abs(v)),phasors=np.array([i1,i2,v]),parameters=p)

def storage(y,p):
    q1,q2,i1,i2,x,v=y;M=p['coupling']*math.sqrt(p['L1H']*p['L2H'])
    return .5*(p['L1H']*i1*i1+2*M*i1*i2+p['L2H']*i2*i2+q1*q1/p['C1F']+q2*q2/p['C2F']+p['massKg']*v*v+p['stiffnessNpm']*x*x)

def integrate(options=None,y0=None,cycles=80,rtol=1e-10):
    p=DEFAULT|(options or {}); w=2*np.pi*p['frequencyHz']; M=p['coupling']*math.sqrt(p['L1H']*p['L2H']);Linv=np.linalg.inv([[p['L1H'],M],[M,p['L2H']]])
    def fun(t,y):
        q1,q2,i1,i2,x,v=y
        di=Linv@np.array([math.sqrt(2)*p['driveVrms']*math.cos(w*t)-p['R1Ohm']*i1-q1/p['C1F'],-(p['R2Ohm']+p['loadOhm'])*i2-q2/p['C2F']-p['transducerNA']*v])
        return [i1,i2,di[0],di[1],v,(p['transducerNA']*i2-(p['dampingNsPm']+p['mechanicalLoadNsPm'])*v-p['stiffnessNpm']*x)/p['massKg']]
    initial=np.zeros(6) if y0 is None else np.asarray(y0,float)
    sol=solve_ivp(fun,(0,cycles/p['frequencyHz']),initial,method='DOP853',rtol=rtol,atol=np.array([1e-13,1e-13,1e-11,1e-11,1e-13,1e-11])*rtol/1e-10,max_step=1/(20*p['frequencyHz']),dense_output=True)
    ensure(sol.success,'Time integration failed')
    return p,sol

def ledger(p,sol,samples_per_cycle):
    duration=sol.t[-1];n=round(duration*p['frequencyHz']*samples_per_cycle);t=np.linspace(0,duration,n+1);y=sol.sol(t);q1,q2,i1,i2,x,v=y
    input_power=np.sqrt(2)*p['driveVrms']*np.cos(2*np.pi*p['frequencyHz']*t)*i1
    el=p['loadOhm']*i2*i2;mech=p['mechanicalLoadNsPm']*v*v;loss=p['R1Ohm']*i1*i1+p['R2Ohm']*i2*i2+p['dampingNsPm']*v*v
    U=storage(y,p);Ein=float(np.trapezoid(input_power,t));Eel=float(np.trapezoid(el,t));Emech=float(np.trapezoid(mech,t));Eloss=float(np.trapezoid(loss,t));delta=float(U[-1]-U[0]);res=Eel+Emech+Eloss+delta-Ein
    return dict(samples=int(n+1),samplesPerCycle=samples_per_cycle,durationS=float(duration),inputJ=Ein,electricalLoadJ=Eel,mechanicalLoadJ=Emech,lossJ=Eloss,initialStoredJ=float(U[0]),finalStoredJ=float(U[-1]),deltaStoredJ=delta,residualJ=float(res),largestEnergyIncreaseJ=float(np.max(np.diff(U))))

def js_values(cases):
    script="import {emSolve,emSweep} from './src/em.mjs';let data='';for await(const c of process.stdin)data+=c;const cases=JSON.parse(data);console.log(JSON.stringify({cases:cases.map(emSolve),sweep:emSweep(),efficiencySweep:emSweep({objective:'efficiency'}),constrainedSweep:emSweep({maxCurrentRmsA:.05})}));"
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',script],input=json.dumps(cases),text=True,cwd=ROOT))

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=ROOT/'research/panel/tesla/em-results.json');parser.add_argument('--check',action='store_true');args=parser.parse_args()
    cases=[{},dict(coupling=0),dict(coupling=-.3),dict(transducerNA=0),dict(driveVrms=0),dict(loadOhm=0),dict(frequencyHz=1379,coupling=.45,loadOhm=13),dict(frequencyHz=400,coupling=.8,loadOhm=100),dict(frequencyHz=2100,coupling=.1,loadOhm=2),dict(driveVrms=3),dict(coupling=.98)]
    js=js_values(cases);fields=['inputW','electricalLoadW','mechanicalLoadW','lossW','outputW','residualW','primaryCurrentRmsA','secondaryCurrentRmsA','velocityRmsMps','peakStoredJ','averageStoredJ'];maxabs=0.;case_rows=[]
    for index,(options,actual) in enumerate(zip(cases,js['cases'])):
        expected=phasor(options);error=max(abs(actual[k]-expected[k]) for k in fields);maxabs=max(maxabs,error)
        ensure(error<1e-11,'JS/NumPy phasor disagreement')
        ensure(abs(expected['residualW'])<1e-11,'NumPy steady-state power failed')
        case_rows.append(dict(options=options,maxAbsoluteFieldDifference=error,inputW=expected['inputW'],outputW=expected['outputW']))
    ensure(js['cases'][1]['secondaryCurrentRmsA']==0 and js['cases'][1]['velocityRmsMps']==0,'M=0 must decouple downstream')
    ensure(js['cases'][3]['velocityRmsMps']==0,'g=0 must decouple mechanics')
    ensure(js['cases'][4]['inputW']==0 and js['cases'][4]['efficiency'] is None,'Zero drive must not report efficiency')
    ensure(abs(js['cases'][2]['outputW']-js['cases'][0]['outputW'])<1e-12,'Coupling orientation power invariance failed')
    ensure(abs(js['cases'][9]['outputW']/js['cases'][0]['outputW']-9)<1e-10,'Voltage-squared scaling failed')
    # Exactly periodic initial condition permits an independent average-power comparison.
    ref=phasor({});i1,i2,v=ref['phasors'];w=2*np.pi*DEFAULT['frequencyHz'];z=np.array([i1/(1j*w),i2/(1j*w),i1,i2,v/(1j*w),v]);steady_initial=np.sqrt(2)*z.real
    p,steady=integrate(y0=steady_initial,cycles=20);steady_ledger=ledger(p,steady,200)
    steady_errors={k:abs(steady_ledger[j]/steady_ledger['durationS']-ref[k]) for k,j in [('inputW','inputJ'),('electricalLoadW','electricalLoadJ'),('mechanicalLoadW','mechanicalLoadJ'),('lossW','lossJ')]}
    ensure(max(steady_errors.values())<1e-8,'Time-domain average vs phasor failed')
    # Startup transient: separate sampled-power quadrature convergence, not ledger ODE states.
    p,transient=integrate(cycles=80);quadratures=[ledger(p,transient,n) for n in [25,50,100,200,400]]
    ensure(abs(quadratures[-1]['residualJ'])<abs(quadratures[0]['residualJ'])/100,'External quadrature failed refinement')
    ensure(abs(quadratures[-1]['residualJ'])<2e-9,'Refined transient budget not closed')
    coarse_p,coarse=integrate(cycles=20,rtol=1e-7);fine_p,fine=integrate(cycles=20,rtol=1e-12);test_t=np.linspace(0,coarse.t[-1],2001)
    # State errors normalized by fixed physical scales; not an energy-uncertainty estimate.
    scales=np.array([1e-4,1e-4,1.,1.,1e-3,1.])[:,None];trajectory_error=float(np.max(np.abs(coarse.sol(test_t)-fine.sol(test_t))/scales));ensure(trajectory_error<1e-6,'Integrator tolerance refinement disagreement')
    # Source-off with known nonzero stored energy, and source-off zero state.
    initial=[0,0,.1,0,0,0];p,decay=integrate(dict(driveVrms=0),initial,cycles=100);decay_ledger=ledger(p,decay,800)
    ensure(decay_ledger['largestEnergyIncreaseJ']<1e-12,'Undriven storage increased')
    ensure(decay_ledger['electricalLoadJ']+decay_ledger['mechanicalLoadJ']<=decay_ledger['initialStoredJ']+1e-10,'Undriven output exceeded initial storage')
    ensure(abs(decay_ledger['residualJ'])<2e-9,'Stored-energy decay budget failed')
    p,zero=integrate(dict(driveVrms=0),cycles=2);ensure(np.max(np.abs(zero.y))==0,'Undriven zero state changed')
    conservative=dict(driveVrms=0,R1Ohm=0,R2Ohm=0,loadOhm=0,dampingNsPm=0,mechanicalLoadNsPm=0)
    p,cons=integrate(conservative,initial,cycles=40,rtol=1e-12);sample=cons.sol(np.linspace(0,cons.t[-1],8001));energies=storage(sample,p);drift=float(np.max(np.abs(energies-energies[0])));ensure(drift<1e-12,'Conservative storage changed')
    # Reconstruct every sweep cell through the independent NumPy matrix.
    sweep=js['sweep'];grid=sweep['grid'];rows=[];maxres=0.;best=None
    for f in grid['frequenciesHz']:
      for coupling in grid['couplings']:
       for load in grid['loadsOhm']:
        r=phasor(dict(frequencyHz=f,coupling=coupling,loadOhm=load));maxres=max(maxres,abs(r['residualW']));rows.append(r)
        if best is None or r['outputW']>best['outputW']:best=r
    ensure(len(rows)==1395 and sweep['totalCount']==1395,'Grid count changed')
    ensure(abs(sweep['best']['outputW']-best['outputW'])<1e-12,'Independent grid optimum disagrees')
    ensure(all(r['outputW']<=r['inputW']+1e-12 for r in rows),'Passive output exceeds input in grid')
    independent_feasible=sum(max(r['primaryCurrentRmsA'],r['secondaryCurrentRmsA'])<=.5 and r['peakStoredJ']<=.01 for r in rows);ensure(independent_feasible==sweep['feasibleCount'],'Independent feasibility count disagrees')
    independent_tight=sum(max(r['primaryCurrentRmsA'],r['secondaryCurrentRmsA'])<=.05 and r['peakStoredJ']<=.01 for r in rows);ensure(independent_tight==js['constrainedSweep']['feasibleCount'],'Tighter independent constraint count disagrees')
    ensure(js['constrainedSweep']['rejectedCount']>0 and js['constrainedSweep']['feasibleCount']>0,'Current constraint does not discriminate')
    # Exact analytic no-supply identity is distinct from finite-grid observations.
    record={'status':'passed-within-declared-model','researchDate':'2026-10-21','hardwareMeasurements':0,'authorship':'EM producer wrote JS and a separate NumPy/SciPy formulation; separate-agent review is required in round 3.','sourceSha256':{'src/em.mjs':hashlib.sha256((ROOT/'src/em.mjs').read_bytes()).hexdigest(),'analysis/em_reference.py':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},'convention':'RMS phasors; positive residual = outputs + internal loss + storage change - source work.','scope':'Fixed mutual inductance and fixed reciprocal coupling; external mechanical drive is zero in this lane.','checks':{'phasorComparison':{'cases':case_rows,'maxAbsoluteFieldDifference':maxabs},'periodicTimeDomain':{'ledger':steady_ledger,'meanPowerErrorsW':steady_errors},'startupQuadratureRefinement':quadratures,'odeToleranceRefinement':{'relativeTolerances':[1e-7,1e-12],'fixedScales':[1e-4,1e-4,1,1,1e-3,1],'maximumScaledStateDifference':trajectory_error},'storedEnergyDecay':decay_ledger,'conservativeDriftJ':drift,'zeroDriveZeroState':True,'zeroMutualDownstream':True,'zeroTransducerMechanical':True,'couplingSignPowerInvariance':True,'driveSquaredPowerScaling':True},'sweep':{'grid':grid,'totalCount':sweep['totalCount'],'feasibleCount':sweep['feasibleCount'],'constraints':sweep['constraints'],'objective':'outputW','best':sweep['best'],'maximumIndependentResidualW':maxres,'efficiencyObjectiveBest':js['efficiencySweep']['best'],'tighterCurrentConstraint':{'maxCurrentRmsA':.05,'feasibleCount':js['constrainedSweep']['feasibleCount'],'rejectedCount':js['constrainedSweep']['rejectedCount']},'boundaryWarning':'The maximum-output sampled point uses the largest tested load. This is not a global optimum.','holdout':case_rows[6]},'limits':['No actual power source or load was measured.','Ideal AC-source efficiency excludes upstream amplifier, controller and DAQ power.','Both delivered electrical and mechanical load power enter outputW; compare each separately as needed.','Numerical closure does not bound experimental calibration uncertainty.','Time-varying mutual inductance needs motion work and is not simulated here.']}
    if args.check:
        old=json.loads(args.output.read_text());ensure(old['sourceSha256']==record['sourceSha256'],'Recorded source hashes differ; review required')
        print(json.dumps({'status':record['status'],'sourceHashesMatch':True,'gridCells':len(rows),'phasorCases':len(cases)}))
    else:
        args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({'status':record['status'],'output':str(args.output),'phasorCases':len(cases),'gridCells':len(rows),'maximumPhasorDifference':maxabs,'transientResidualJ':quadratures[-1]['residualJ'],'conservativeDriftJ':drift}))

if __name__=='__main__':main()

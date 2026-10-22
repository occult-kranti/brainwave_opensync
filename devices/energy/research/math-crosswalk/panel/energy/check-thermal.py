#!/usr/bin/env python3
"""Same-author numerical cross-check, not the independent panel review.
Checks complex Kraus matrices and an energy-conserving qubit/bath dilation.
"""
from pathlib import Path
import hashlib,json,math,platform,subprocess
import numpy as np
HERE=Path(__file__).resolve().parent
BASE=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
contract=json.loads((HERE/'round2-inputs.json').read_text())
assert contract['frozenBeforeFirstExecution']
old=BASE/'src/quantum.mjs'
assert sha(old)==contract['baselineQuantumSha256'], 'Accepted calculator changed'
tol=contract['tolerance']['dimensionlessAbsolute']
slack=contract['tolerance']['entropyProductionNegativeSlack']
raw=subprocess.check_output(['node',str(HERE/'emit-thermal-grid.mjs')],cwd=BASE)
payload=json.loads(raw)
assert len(payload['cases'])==contract['expectedCases']
maxerr={}; maxcase={}
counts={'cases':0,'zeroTemperatureCompatibility':0,'fullRankEntropyProduction':0,
        'ordinaryBathEntropyProduction':0,'invertedBathEntropyProduction':0,
        'ordinaryFixedPointPassivity':0,'invertedFixedPointWork':0,
        'zeroDampingIdentityBeforeDephasing':0,'fullDampingReplacement':0,
        'phaseInvariantComparisons':0}
minprod={'ordinary':math.inf,'inverted':math.inf}; phase_anchor={}
I=np.eye(2,dtype=complex); Z=np.diag([1,-1]).astype(complex); H=np.diag([0.,1.]).astype(complex)
def check(name,error,index,limit=tol):
    error=float(abs(error))
    if error>maxerr.get(name,-1): maxerr[name],maxcase[name]=error,index
    assert error<=limit, (name,index,error,limit)
def entropy(rho):
    ev=np.linalg.eigvalsh(rho); vals=ev[ev>0]
    return float(-np.sum(vals*np.log(vals)))
def state_values(rho):
    ev=np.linalg.eigvalsh(rho); energy=float(np.trace(H@rho).real)
    return np.array([float(rho[1,1].real),energy,float(ev[0]),energy-float(ev[0]),
                     entropy(rho),float(rho[0,1].real),float(rho[0,1].imag)])
for idx,row in enumerate(payload['cases']):
    p=row['parameters']; pop=p['population']; k=p['coherence']; g=p['damping']
    nu=p['bathPopulation']; d=p['dephasing']; phase=p['phaseRadians']
    z=k*np.sqrt(pop*(1-pop))*np.exp(1j*phase)
    rho=np.array([[1-pop,z],[z.conjugate(),pop]],dtype=complex)
    q=np.sqrt(1-g); s=np.sqrt(g)
    Ks=[np.sqrt(1-nu)*np.array([[1,0],[0,q]],dtype=complex),
        np.sqrt(1-nu)*np.array([[0,s],[0,0]],dtype=complex),
        np.sqrt(nu)*np.array([[q,0],[0,1]],dtype=complex),
        np.sqrt(nu)*np.array([[0,0],[s,0]],dtype=complex)]
    check('krausCompleteness',np.max(np.abs(sum(K.conj().T@K for K in Ks)-I)),idx)
    damped=sum(K@rho@K.conj().T for K in Ks)
    Ds=[np.sqrt((1+d)/2)*I,np.sqrt((1-d)/2)*Z]
    final=sum(D@damped@D.conj().T for D in Ds)
    iv=state_values(rho); fv=state_values(final)
    check('initialStateValues',np.max(np.abs(iv-row['initial'])),idx)
    check('finalStateValues',np.max(np.abs(fv-row['final'])),idx)
    check('traceOne',abs(np.trace(final)-1),idx)
    check('hermitian',np.max(np.abs(final-final.conj().T)),idx)
    check('negativeEigenvalue',max(0,-float(np.linalg.eigvalsh(final)[0])),idx)
    check('dephasingEnergyNeutral',np.trace(H@(final-damped)),idx)
    # Equal-gap ancilla initially diag(1-nu,nu); rotate |01>,|10>.
    bath=np.diag([1-nu,nu]).astype(complex)
    U=np.eye(4,dtype=complex); U[1:3,1:3]=np.array([[q,s],[-s,q]])
    Htotal=np.kron(H,I)+np.kron(I,H)
    check('dilationUnitarity',np.max(np.abs(U.conj().T@U-np.eye(4))),idx)
    check('dilationEnergyCommutator',np.max(np.abs(U@Htotal-Htotal@U)),idx)
    joint=U@np.kron(rho,bath)@U.conj().T; block=joint.reshape(2,2,2,2)
    reduced=np.trace(block,axis1=1,axis2=3); bathout=np.trace(block,axis1=0,axis2=2)
    check('dilationEqualsKraus',np.max(np.abs(reduced-damped)),idx)
    qsystem=float(np.trace(H@(final-rho)).real)
    qbath=float(np.trace(H@(bathout-bath)).real)
    check('signedSystemHeat',qsystem-row['heatIntoQubit'],idx)
    check('signedBathHeat',qbath-row['heatIntoBath'],idx)
    check('jointEnergyClosure',qsystem+qbath,idx)
    check('reportedEnergyClosure',row['closure'],idx)
    if 0<nu<1:
        beta=math.log((1-nu)/nu); prod=fv[4]-iv[4]-beta*qsystem
        logbath=np.diag([math.log1p(-nu),math.log(nu)])
        Dinitial=-iv[4]-float(np.trace(rho@logbath).real)
        Dfinal=-fv[4]-float(np.trace(final@logbath).real)
        check('entropyProductionAgreement',prod-row['entropyProduction'],idx)
        check('entropyRelativeEntropyIdentity',prod-(Dinitial-Dfinal),idx)
        check('betaGapAgreement',beta-row['betaGap'],idx)
        assert prod>=-slack, ('entropyProductionNegative',idx,prod)
        kind='ordinary' if nu<=0.5 else 'inverted'; minprod[kind]=min(minprod[kind],prod)
        counts['fullRankEntropyProduction']+=1
        counts['ordinaryBathEntropyProduction' if kind=='ordinary' else 'invertedBathEntropyProduction']+=1
    else: assert row['entropyProduction'] is None and row['betaGap'] is None
    if nu>0.5: assert row['bathResource']=='population-inverted resource'
    if row['legacy'] is not None:
        expected=np.array([*row['initial'][1:4],*row['final'][1:4],row['heatIntoBath']])
        check('zeroTemperatureCompatibility',np.max(np.abs(expected-row['legacy'])),idx)
        counts['zeroTemperatureCompatibility']+=1
    if g==0 and d==1:
        check('zeroDampingIdentity',np.max(np.abs(final-rho)),idx)
        counts['zeroDampingIdentityBeforeDephasing']+=1
    if g==1:
        check('fullDampingReplacement',np.max(np.abs(final-bath)),idx)
        counts['fullDampingReplacement']+=1
    if pop==nu and k==0:
        if nu<=0.5:
            check('ordinaryFixedPointPassivity',row['final'][3],idx)
            counts['ordinaryFixedPointPassivity']+=1
        else:
            check('invertedFixedPointErgotropy',row['final'][3]-(2*nu-1),idx)
            counts['invertedFixedPointWork']+=1
    key=(pop,k,g,nu,d); quantities=np.array([*row['initial'][:5],*row['final'][:5],row['heatIntoQubit']])
    if key in phase_anchor:
        check('phaseInvariantEnergyWorkEntropy',np.max(np.abs(quantities-phase_anchor[key])),idx)
        counts['phaseInvariantComparisons']+=1
    else: phase_anchor[key]=quantities
    counts['cases']+=1
controls=[]
for c in payload['controls']:
    r=c['result']; gap=r['gapJ']
    if c['id']=='omitted-bath':
        bad=(r['final']['energyJ']-r['initial']['energyJ'])/gap; correct=r['energyClosureResidualJ']/gap
    elif c['id']=='energy-equals-work':
        bad=(r['final']['energyJ']-r['final']['ergotropyJ'])/gap; correct=r['final']['ergotropyJ']/gap
    else:
        bad=(r['final']['energyJ']+r['parameters']['damping']*r['initial']['energyJ']-r['initial']['energyJ'])/gap
        correct=r['energyClosureResidualJ']/gap
    assert abs(bad-c['expected'])<=tol and abs(bad)>contract['tolerance']['wrongControlMinimumMargin']
    assert abs(correct)<=tol
    controls.append({'id':c['id'],'wrongModelErrorInGapUnits':bad,'expectedErrorInGapUnits':c['expected'],
                     'correctModelErrorInGapUnits':correct,'detected':True})
assert sha(old)==contract['baselineQuantumSha256']
files=['round2-inputs.json','thermal-channel.mjs','emit-thermal-grid.mjs','check-thermal.py']
result={'schema':'thermal-channel-round2-results/1','status':'PASS','date':'2026-10-22',
    'authorship':'Producer and numerical alternate formulations have the same author; independent panel cross-review is separate.',
    'scope':'Finite-grid ideal channel tests and explicit qubit/bath model; not a general capacity proof or hardware evidence.',
    'counts':counts,'invalidInputsRejected':payload['invalidInputsRejected'],
    'tolerances':contract['tolerance'],'maximumAbsoluteDimensionlessErrors':maxerr,
    'maximumErrorCaseIndices':maxcase,'minimumEntropyProductionNats':minprod,'wrongModelControls':controls,
    'frozenInputsSha256':sha(HERE/'round2-inputs.json'),'replayOutputSha256':hashlib.sha256(raw).hexdigest(),
    'filesSha256':{n:sha(HERE/n) for n in files},'acceptedQuantumSha256':sha(old),
    'versions':{'python':platform.python_version(),'numpy':np.__version__,
                'node':subprocess.check_output(['node','--version'],text=True).strip()},
    'replayCommand':'python energy-observatory/research/math-crosswalk/panel/energy/check-thermal.py',
    'apparatusEfficiency':None,
    'limitations':['Floating-point sampled verification, not a continuous-domain theorem proof.',
       'The heat ledger assumes a fixed system Hamiltonian and equal-gap thermal ancilla interaction.',
       'Bath re-preparation, physical dephasing, measurement, controls and refrigeration are omitted.',
       'Negative-temperature references are labeled inverted resources; rank-deficient references skip the finite-beta entropy expression.',
       'No classical channel capacity/additivity calculation or physical surplus-power measurement.']}
(HERE/'round2-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'status':result['status'],'counts':counts,'maximumError':max(maxerr.values()),
                 'minimumEntropyProductionNats':minprod,'wrongModelControls':controls,
                 'resultSha256':sha(HERE/'round2-results.json')},indent=2))

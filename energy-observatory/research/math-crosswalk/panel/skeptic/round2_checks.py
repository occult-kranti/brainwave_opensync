#!/usr/bin/env python3
"""Bounded skeptic controls; metadata admission is not theorem proof.
Main countermodels use exact Fraction arithmetic. Floating-point peer fixtures
have independently frozen expected values and never imply a universal theorem.
"""
from fractions import Fraction as F
from pathlib import Path
import argparse, datetime, hashlib, json, math
import numpy as np

HERE = Path(__file__).resolve().parent
FIXTURE = HERE / 'round2-independent-fixtures.json'
EXPECTED_FIXTURE_SHA = '262582bed704ce59014937557cc678ee0931ea609296d2e7bb4a7f8aadb0e657'
assert hashlib.sha256(FIXTURE.read_bytes()).hexdigest() == EXPECTED_FIXTURE_SHA
fixture = json.loads(FIXTURE.read_text())


def exact_gap(values):
    values = sorted(set(values))
    return values[1] - values[0]


def finite_gap_controls():
    rows = []
    for n in fixture['ownCases']['finiteGap']['n']:
        h = [F(0), F(1,n), F(1)]
        gap = exact_gap(h)
        assert gap == F(1,n) and gap > 0
        assert exact_gap([F(0),F(1),F(2)]) == 1
        rows.append({'n': n, 'gapH': str(gap), 'gapK': '1', 'sameGroundProjector': True})
    # Constructive Archimedean witnesses, not a numerical limit fit.
    witnesses = []
    for eps in [F(1), F(1,7), F(1,1000000)]:
        n = (1 // eps) + 1
        assert F(1,n) < eps
        witnesses.append({'epsilon': str(eps), 'n': n, 'gap': str(F(1,n))})
    return {'exactSamples': rows, 'epsilonWitnesses': witnesses,
            'allNArgument': 'For every epsilon>0, choose integer n>1/epsilon. Then 0<1/n<epsilon. The ground projector is constant, yet no common positive gap exists.',
            'narrowVerdict': 'finite positive gaps and a common vacuum projector alone do not entail a uniform gap',
            'notEstablished': 'No H_n is identified with a Yang-Mills regulator; no physical counterexample is asserted.'}


def partial_observation_controls():
    rows = []
    for raw in fixture['ownCases']['partialResolvent']['positiveZ']:
        z = F(raw)
        a = [1 / (z+v) for v in (1,2,3)]
        b = [1 / (z+v) for v in (1,2,4)]
        assert a[:2] == b[:2] and a != b
        omitted = a[2]-b[2]
        assert omitted == 1/((z+3)*(z+4)) and omitted > 0
        rows.append({'z': str(z), 'observedA': list(map(str,a[:2])),
                     'observedB': list(map(str,b[:2])), 'fullDifference33': str(omitted)})
    return {'exactSamples': rows,
            'allZArgument': 'For z>0, retained entries are 1/(z+1),1/(z+2) for both diagonal operators. The omitted entry differs by 1/((z+3)(z+4))>0.',
            'narrowVerdict': 'The declared compressed resolvent readout is non-injective.',
            'notEstablished': 'This is not a counterexample to full-static-boundary-data elasticity uniqueness.'}


AXES = ['object','domain','hypotheses','observations','scale','topology','conclusion']

def documentary_gate(left, right):
    """Compare explicitly curated scope identifiers only. Not a proof checker."""
    missing = [side + ':' + key for side,record in [('left',left),('right',right)]
               for key in ['statementEvidence']+AXES if record.get(key) is None]
    if missing:
        return {'classification':'insufficient-evidence','missing':missing,'mismatchedAxes':[]}
    differing = [key for key in AXES if left[key] != right[key]]
    if differing:
        return {'classification':'scope-mismatch','missing':[],'mismatchedAxes':differing}
    return {'classification':'eligible-for-proof-review','missing':[], 'mismatchedAxes':[],
            'warning':'Agreement of curated fields is not semantic equivalence or proof verification.'}


def documentary_controls():
    base = dict(object='finite real symmetric positive-definite matrix',domain='R^2',
                hypotheses='fixed entries and positive definiteness',observations='full entries',
                scale='fixed dimension',topology='none; algebraic identity',
                conclusion='exact equality of the same quadratic forms',
                statementEvidence='synthetic positive control; identical statement supplied')
    cases=[]
    def add(name,a,b,expected):
        actual=documentary_gate(a,b)
        assert actual['classification']==expected,(name,actual)
        cases.append({'id':name,'left':a,'right':b,'expected':expected,'actual':actual})
    add('identicalAlgebraic',base,dict(base),'eligible-for-proof-review')
    a=dict(base, object='smooth Riemannian metrics and connections',conclusion='uniqueness from complete boundary data',statementEvidence='OpenAI365 headline paper')
    b=dict(base, object='bounded measurable scalar conductivities',conclusion='nonuniqueness with same weak DN map',statementEvidence='OpenAI365 Lean companion declaration')
    add('companionFormalization',a,b,'scope-mismatch')
    a=dict(base, object='local finite-dimensional lattice spins',hypotheses='uniform gap assumed',observations='region entanglement entropy',conclusion='entropy bounded by boundary area',statementEvidence='OpenAI265 catalogue abstract')
    b=dict(base, object='Yang-Mills gauge fields',hypotheses='confinement target not presumed',observations='Wilson-loop expectation',conclusion='loop logarithm scales with enclosed area',statementEvidence='YM Wilson-loop research target')
    add('entropyWilson',a,b,'scope-mismatch')
    a=dict(base,object='ideal RLC mechanical state',domain='closed selected model boundary',observations='analytic stored energy and modeled ports',conclusion='energy balance identity',statementEvidence='project ideal transducer model')
    b=dict(base,object='laboratory apparatus and environment',domain='all material energy reservoirs and calibration',observations='measured calibrated input/output and reservoir changes',conclusion='apparatus net energy claim',statementEvidence='hypothetical broader claim, not asserted by repository')
    add('circuitApparatus',a,b,'scope-mismatch')
    a=dict(base,object='regulated gauge Hamiltonian',scale='fixed lattice spacing, admitted strong coupling',topology='fixed-spacing volume limit',hypotheses='admitted restricted boundary family',conclusion='restricted fixed-spacing local construction',statementEvidence='YM Round33 HANDOFF')
    b=dict(base,object='continuum gauge quantum field',scale='a approaches 0 at physical renormalized scale',topology='continuum constructive limit',hypotheses='continuum reconstruction hypotheses',conclusion='nontrivial continuum field with positive physical mass gap',statementEvidence='continuum Yang-Mills goal')
    add('finiteContinuum',a,b,'scope-mismatch')
    add('noStatement',base,dict(base,statementEvidence=None),'insufficient-evidence')
    add('sameTitleOnly',{'title':'spectral bounds'},{'title':'spectral bounds'},'insufficient-evidence')
    return {'cases':cases,'narrowVerdict':'Five explicit nonmatching or absent-scope controls are rejected/abstained; one additional title-only control abstains; the identical algebraic record is only admitted to proof review.',
            'notEstablished':'No software decision here proves equivalence, truth, formalization dependency closure, or relevance.'}


def state(p,c):
    return np.array([[1-p,c],[np.conjugate(c),p]],dtype=complex)

def ergotropy(rho):
    vals=np.linalg.eigvalsh(rho)
    return float(rho[1,1].real-vals[0])

def entropy(rho):
    vals=np.linalg.eigvalsh(rho)
    return -sum(float(v)*math.log(float(v)) for v in vals if v>0)

def independent_energy():
    cases=[]
    max_err=0.
    for row in fixture['peerReviewIndependentCases']['energy']['cases']:
        p=float(F(row['p'])); gamma=float(F(row['gamma'])); nu=float(F(row['nu'])); d=float(F(row['d']))
        c=math.sqrt(3)/4 if row['c']=='sqrt(3)/4' else float(F(row['c']))
        initial=state(p,c)
        # Explicit independent generalized-amplitude-damping Kraus map.
        K=[math.sqrt(1-nu)*np.diag([1,math.sqrt(1-gamma)]),
           math.sqrt(1-nu)*np.array([[0,math.sqrt(gamma)],[0,0]]),
           math.sqrt(nu)*np.diag([math.sqrt(1-gamma),1]),
           math.sqrt(nu)*np.array([[0,0],[math.sqrt(gamma),0]])]
        final=sum((k@initial@k.conj().T for k in K),np.zeros((2,2),dtype=complex))
        final[0,1]*=d; final[1,0]*=d
        expected_p=float(F(row['expectedP'])); expected_q=float(F(row['expectedQ'])); expected_w=float(F(row['expectedW']))
        Q=float(final[1,1].real-initial[1,1].real)
        w=ergotropy(final)
        err=max(abs(final[1,1].real-expected_p),abs(Q-expected_q),abs(w-expected_w))
        max_err=max(max_err,err)
        assert err<1e-14 and abs(np.trace(final)-1)<1e-14 and min(np.linalg.eigvalsh(final))>=-1e-14
        sigma=None
        if 0<nu<.5:
            sigma=entropy(final)-entropy(initial)-math.log((1-nu)/nu)*Q
            assert sigma>=-1e-14
        cases.append({'id':row['name'],'population':float(final[1,1].real),'signedBathHeatPerGap':Q,'ergotropyPerGap':w,'entropyProduction':sigma,'expectedMaxError':err,'minEigenvalue':float(min(np.linalg.eigvalsh(final)))})
    return {'cases':cases,'maxExpectedError':max_err,'method':'Independent NumPy Kraus matrices and Hermitian eigensolver, fixed before peer producer code inspection.'}


def independent_acoustics():
    M=np.diag([2.,1.]); K=np.array([[5.,-1.],[-1.,3.]]); C=np.diag([.2,.1]); a=4; omega=2
    poles=np.linalg.eigvals(np.linalg.solve(M,K)); scaled=np.linalg.eigvals(np.linalg.solve(a*M,a*K))
    H=np.linalg.inv(K-omega**2*M+1j*omega*C)
    Hscaled=np.linalg.inv(a*K-omega**2*a*M+1j*omega*a*C)
    mode_err=float(np.max(np.abs(np.sort(poles)-np.sort(scaled))))
    frf_err=float(np.max(np.abs(Hscaled-H/a)))
    assert mode_err<1e-13 and frf_err<1e-13
    sensitivity=[F(1,2),F(-1,2)]
    kernel=sum(sensitivity)==0
    det=sensitivity[0]*1-sensitivity[1]*0
    assert kernel and det==F(1,2)
    # Homogeneous isotropic static affine displacement, no inverse solver.
    E=110.; rho=8.96; nu=.34
    lam=E*nu/((1+nu)*(1-2*nu)); mu=E/(2*(1+nu))
    S=np.array([[.01,.002,0],[.002,-.003,0],[0,0,.004]])
    normal=np.array([0.,1.,0.])
    traction=(lam*np.trace(S)*np.eye(3)+2*mu*S)@normal
    traction_scaled=(a*lam*np.trace(S)*np.eye(3)+2*a*mu*S)@normal
    assert np.linalg.norm(traction)>0
    static_err=float(np.max(np.abs(traction_scaled-a*traction)))
    assert static_err<1e-13
    return {'generalizedEigenvalues':sorted(poles.tolist()),'scaledEigenvalueError':mode_err,'calibratedFRFScalingError':frf_err,
            'frequencySensitivityKernel':[1,1],'augmentedMassDeterminant':str(det),
            'staticTraction':traction.tolist(),'scaledStaticTraction':traction_scaled.tolist(),'staticScalingError':static_err,
            'narrowVerdict':'Common-scale mode ambiguity survives; calibrated force response or static traction distinguishes this family. No general inverse reconstruction is claimed.'}


def exact_methods():
    # Coefficients of monomials q*v, u*v, v*v in dE, computed by exact arithmetic.
    coeffs={'q*v':F(3)+F(2)*F(-3,2),'u*v':F(2)*F(1,2),'v*v':F(2)*F(-5,2)}
    assert coeffs=={'q*v':0,'u*v':1,'v*v':-5}
    wrong_damping_derivative=F(2)*F(5,2)
    assert wrong_damping_derivative==5
    f=lambda x:x*x-x+F(3,16)
    values=[f(F(x)) for x in ['0','1/2','1']]
    assert values==[F(3,16),F(-1,16),F(3,16)]
    threshold=F(96)/F(1,100000000)
    assert threshold==9600000000
    return {'energyDerivativeCoefficients':{k:str(v) for k,v in coeffs.items()},'negativeDampingAtZeroInput':str(wrong_damping_derivative),
            'gridCounterexample':{'points':['0','1/2','1'],'values':list(map(str,values))},
            'tauThreshold':{'tauMax':'1/100000000','necessaryAndSufficientGFourth':'9600000000','conditions':'g>0, tau=96/g^4'},
            'narrowVerdict':'Exact finite algebra, including sign and sampling controls; no NSPI/Lean execution or continuum inference.'}


result={'schema':1,'createdUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frozenFixturesSha256':EXPECTED_FIXTURE_SHA,
        'finiteGap':finite_gap_controls(),'partialObservation':partial_observation_controls(),
        'documentaryGate':documentary_controls(),'independentEnergyFixtures':independent_energy(),
        'independentAcousticFixture':independent_acoustics(),'independentExactAlgebra':exact_methods()}
result['codeSha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
parser=argparse.ArgumentParser()
parser.add_argument('--output',type=Path,default=HERE/'round2-results.json')
args=parser.parse_args()
args.output.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'resultFile':'round2-results.json','codeSha256':result['codeSha256'],'fixtureSha256':EXPECTED_FIXTURE_SHA,
                  'finiteGapSamples':len(result['finiteGap']['exactSamples']),'partialReadoutSamples':len(result['partialObservation']['exactSamples']),
                  'documentaryControls':{x['id']:x['actual']['classification'] for x in result['documentaryGate']['cases']},
                  'energyFixtureMaxError':result['independentEnergyFixtures']['maxExpectedError'],'acousticFRFScalingError':result['independentAcousticFixture']['calibratedFRFScalingError']},indent=2))

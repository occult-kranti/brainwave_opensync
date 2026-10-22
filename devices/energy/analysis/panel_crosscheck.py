#!/usr/bin/env python3
"""Round-3 independent NumPy checks of frozen browser converters.

The governing complex matrices were frozen in round 2 before producer-code
inspection. This adapter and the held-out cases were written in round 3 after
API inspection. It does not validate hardware or the full numerical domain.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_HASHES = {
    'src/em.mjs': '09ee1be95fe4586b1633fb39dae11fdc7f6a5dc3604461632c320d1e91193984',
    'src/acoustic.mjs': 'd14db2f4843f328e016dd1f7f29b16612a910b1362599a4bbc74c9cca1f8dff3',
    'src/identifiability.mjs': 'fa6e497e275d10c1656060883e8fb1b9c865d4686e25bb012e8cde4887683b29',
    'analysis/systems_reference.py': '0ac8d7ae3535f2714c0195a4682f164abe2dc100ca542e50023f8b46a8c7d2b9',
    'research/panel/systems/independent-reference.json': 'ae84d7291729b9490771f5dd5fe5d112d0a3a8585489a1662c24c61cfaf573a7',
}
EM = dict(frequencyHz=1000., coupling=.3, loadOhm=20., driveVrms=1.,
          L1H=.01, L2H=.01, C1F=2.5330295910584444e-6, C2F=2.5330295910584444e-6,
          R1Ohm=2., R2Ohm=2., massKg=.001, stiffnessNpm=39478.41760435743,
          dampingNsPm=.05, mechanicalLoadNsPm=.1, transducerNA=.5)
AC = dict(frequencyHz=200., loadOhm=10000., forceRmsN=.001, massKg=.005,
          stiffnessNPerM=.005*(2*np.pi*200)**2, dampingNsPerM=.2,
          couplingNPerV=.01, capacitanceF=1e-7, dielectricConductanceS=0.)
CHECKS = 0
MAX_SCALED_ERROR = 0.


def require(condition, message):
    global CHECKS
    CHECKS += 1
    if not condition:
        raise RuntimeError(message)


def close(actual, expected, label, rtol=2e-9, atol=2e-12):
    global MAX_SCALED_ERROR
    a, e = np.asarray(actual), np.asarray(expected)
    error = np.max(abs(a-e)/(atol+rtol*abs(e)))
    MAX_SCALED_ERROR = max(MAX_SCALED_ERROR, float(error))
    require(bool(np.all(np.isfinite(a))) and bool(error <= 1),
            f'{label}: got {actual}; expected {expected}; tolerance fraction {error}')


def hashes():
    got = {p: hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in EXPECTED_HASHES}
    require(got == EXPECTED_HASHES, 'Reviewed source hash changed; a new review is required')
    return got


def em_reference(options):
    """RMS 3x3 impedance solve; voltage-only restriction of frozen R2 matrix."""
    p = {**EM, **options}
    w = 2*np.pi*p['frequencyHz']; s = 1j*w
    mutual = p['coupling']*np.sqrt(p['L1H']*p['L2H'])
    a = np.array([
        [p['R1Ohm']+s*p['L1H']+1/(s*p['C1F']), s*mutual, 0],
        [s*mutual, p['R2Ohm']+p['loadOhm']+s*p['L2H']+1/(s*p['C2F']), p['transducerNA']],
        [0, -p['transducerNA'], p['dampingNsPm']+p['mechanicalLoadNsPm']+s*p['massKg']+p['stiffnessNpm']/s],
    ], complex)
    i1, i2, v = np.linalg.solve(a, np.array([p['driveVrms'], 0, 0], complex))
    source = float(np.real(p['driveVrms']*np.conj(i1)))
    electrical = p['loadOhm']*abs(i2)**2
    mechanical = p['mechanicalLoadNsPm']*abs(v)**2
    loss = p['R1Ohm']*abs(i1)**2+p['R2Ohm']*abs(i2)**2+p['dampingNsPm']*abs(v)**2
    # Independent quadratic energy form. For RMS z, y(t)=sqrt(2) Re(z exp(iwt));
    # H=.5 y^T K y. Eigenvalues of B^T K B give exact extrema over phase.
    z = np.array([i1, i2, i1/s, i2/s, v, v/s])
    k = np.diag([p['L1H'], p['L2H'], 1/p['C1F'], 1/p['C2F'], p['massKg'], p['stiffnessNpm']])
    k[0, 1] = k[1, 0] = mutual
    b = np.column_stack([z.real, -z.imag]); reduced = b.T@k@b
    mean_energy = float(np.trace(reduced)/2)
    peak_energy = float(np.linalg.eigvalsh(reduced)[-1])
    require(abs(source-electrical-mechanical-loss) < 1e-11*(1+abs(source)), 'Independent EM energy closure')
    return dict(inputW=source, electricalLoadW=float(electrical), mechanicalLoadW=float(mechanical),
                outputW=float(electrical+mechanical), lossW=float(loss),
                primaryCurrentRmsA=float(abs(i1)), secondaryCurrentRmsA=float(abs(i2)),
                velocityRmsMps=float(abs(v)), averageStoredJ=mean_energy, peakStoredJ=peak_energy,
                efficiency=float((electrical+mechanical)/source) if source > 1e-15 else None,
                phasors={'primaryCurrentRmsA':i1, 'secondaryCurrentRmsA':i2, 'velocityRmsMps':v}, parameters=p)


def acoustic_reference(options):
    """RMS 2x2 matrix from the independently frozen R2 velocity equations."""
    p = {**AC, **options}; w = 2*np.pi*p['frequencyHz']; s = 1j*w
    a = np.array([[p['dampingNsPerM']+s*p['massKg']+p['stiffnessNPerM']/s, p['couplingNPerV']],
                  [-p['couplingNPerV'], p['dielectricConductanceS']+1/p['loadOhm']+s*p['capacitanceF']]], complex)
    v, voltage = np.linalg.solve(a, np.array([p['forceRmsN'], 0], complex)); x = v/s
    source = float(np.real(p['forceRmsN']*np.conj(v)))
    output = abs(voltage)**2/p['loadOhm']
    mechanical = p['dampingNsPerM']*abs(v)**2
    dielectric = p['dielectricConductanceS']*abs(voltage)**2
    require(abs(source-output-mechanical-dielectric) < 1e-11*(1+abs(source)), 'Independent acoustic energy closure')
    return dict(inputW=source, loadW=float(output), mechanicalLossW=float(mechanical), dielectricLossW=float(dielectric),
                velocityRmsMps=float(abs(v)), voltageRmsV=float(abs(voltage)), displacementRmsM=float(abs(x)),
                meanStoredJ=float(.5*(p['massKg']*abs(v)**2+p['stiffnessNPerM']*abs(x)**2+p['capacitanceF']*abs(voltage)**2)),
                efficiency=float(output/source) if source > 0 else None,
                phasorsRms={'velocityMps':v, 'voltageV':voltage, 'displacementM':x}, parameters=p)


def browser_calls(requests):
    js = """import {emSolve,emSweep} from './src/em.mjs';
import {acousticSolve,acousticSweep} from './src/acoustic.mjs';
import {identifiabilityDemo} from './src/identifiability.mjs';
let input=''; for await (const chunk of process.stdin) input+=chunk;
const methods={emSolve,emSweep,acousticSolve,acousticSweep,identifiabilityDemo};
console.log(JSON.stringify(JSON.parse(input).map(r=>{try{return {ok:true,value:methods[r.method](r.options)}}catch(e){return {ok:false,name:e.name,message:e.message}}})));"""
    completed = subprocess.run(['node', '--input-type=module', '-e', js], cwd=ROOT,
                               input=json.dumps(requests), text=True, capture_output=True, check=True)
    return json.loads(completed.stdout)


def compare_response(actual, reference, label, acoustic=False):
    for key, expected in reference.items():
        if key in ('parameters', 'phasors', 'phasorsRms'):
            continue
        if expected is None:
            require(actual[key] is None, f'{label}: expected undefined {key}')
        else:
            close(actual[key], expected, label+':'+key)
    phasorkey = 'phasorsRms' if acoustic else 'phasors'
    for name, z in reference[phasorkey].items():
        close(actual[phasorkey][name], [z.real, z.imag], label+':'+name)
    require(abs(actual['residualW']) < 1e-11*(1+abs(actual['inputW'])), label+': browser closure')


def em_sweep_reference(options):
    counts = dict(zeroInputResponse=0, zeroUsefulResponse=0, driveLimit=0, currentLimit=0, storageLimit=0, undefinedObjective=0)
    best = None; feasible = 0
    for f in options['frequenciesHz']:
        for c in options['couplings']:
            for load in options['loadsOhm']:
                p = {**options, 'frequencyHz':f, 'coupling':c, 'loadOhm':load, 'driveVrms':1.}
                unit = em_reference(p)
                if unit['inputW'] <= 1e-15: counts['zeroInputResponse'] += 1; continue
                if unit['outputW'] <= 1e-15: counts['zeroUsefulResponse'] += 1; continue
                drive = np.sqrt(options['targetInputW']/unit['inputW'])
                if drive > options['maxDriveVrms']: counts['driveLimit'] += 1; continue
                r = em_reference({**p, 'driveVrms':float(drive)})
                if max(r['primaryCurrentRmsA'], r['secondaryCurrentRmsA']) > options['maxCurrentRmsA']:
                    counts['currentLimit'] += 1; continue
                if r['peakStoredJ'] > options['maxStoredEnergyJ']: counts['storageLimit'] += 1; continue
                feasible += 1
                if best is None or r['outputW'] > best['outputW']: best = r
    return dict(best=best, feasible=feasible, counts=counts)


def acoustic_sweep_reference(options):
    fs = np.linspace(options['frequencyMinHz'], options['frequencyMaxHz'], options['frequencyPoints'])
    rs = np.exp(np.linspace(np.log(options['loadMinOhm']), np.log(options['loadMaxOhm']), options['loadPoints']))
    best = None; feasible = 0; counts = {}
    for f in fs:
        for load in rs:
            p = {**options, 'frequencyHz':float(f), 'loadOhm':float(load), 'forceRmsN':1.}
            unit = acoustic_reference(p)
            if unit['inputW'] <= 0:
                reason = 'nonpositive-unit-input'; counts[reason] = counts.get(reason, 0)+1; continue
            force = np.sqrt(options['targetInputW']/unit['inputW'])
            r = acoustic_reference({**p, 'forceRmsN':float(force)})
            if (force > options['maxForceRmsN'] or r['velocityRmsMps'] > options['maxVelocityRmsMps']
                    or r['voltageRmsV'] > options['maxVoltageRmsV']):
                reason = 'constraint-limit'; counts[reason] = counts.get(reason, 0)+1; continue
            feasible += 1
            if best is None or r['loadW'] > best['loadW']: best = r
    return dict(best=best, feasible=feasible, counts=counts)


def run():
    reviewed = hashes()
    frozen = json.loads((ROOT/'research/panel/systems/independent-reference.json').read_text())
    e = frozen['electromagneticFixture']['parameters']; a = frozen['acousticFixture']['parameters']
    em_frozen_specialization = dict(frequencyHz=e['frequencyHz'], coupling=e['M']/np.sqrt(e['L1']*e['L2']),
        loadOhm=e['RL'], driveVrms=e['voltagePeak']/np.sqrt(2), L1H=e['L1'], L2H=e['L2'], C1F=e['C1'], C2F=e['C2'],
        R1Ohm=e['R1'], R2Ohm=e['R2'], massKg=e['m'], stiffnessNpm=e['k'], dampingNsPm=e['b'], mechanicalLoadNsPm=e['bL'], transducerNA=e['g'])
    ac_frozen_exact = dict(frequencyHz=a['frequencyHz'], loadOhm=a['R'], forceRmsN=a['forcePeak']/np.sqrt(2),
        massKg=a['m'], stiffnessNPerM=a['k'], dampingNsPerM=a['b'], couplingNPerV=a['theta'], capacitanceF=a['Cp'], dielectricConductanceS=a['Gd'])
    # Bind the RMS adapter to the exact frozen acoustic fixture before comparison.
    exact = acoustic_reference(ac_frozen_exact)
    for key in ['inputW','loadW']: close(exact[key], frozen['acousticFixture'][key], 'Frozen acoustic '+key)
    for old, new in [('velocity','velocityMps'), ('voltage','voltageV')]:
        z = frozen['acousticFixture']['phasors'][old]
        close(exact['phasorsRms'][new], complex(z['real'],z['imag'])/np.sqrt(2), 'Frozen peak/RMS '+old)
    em_cases = [
        ('frozen-equation-Fext-zero-specialization', em_frozen_specialization),
        ('heldout-detuned-signed', dict(frequencyHz=1379., coupling=-.45, loadOhm=13., driveVrms=.73, transducerNA=-.81, mechanicalLoadNsPm=.07)),
        ('heldout-asymmetric', dict(frequencyHz=477., coupling=.61, loadOhm=7.5, L1H=.017, L2H=.006, C1F=4.8e-6, C2F=1.3e-6, R1Ohm=.7, R2Ohm=3.2, driveVrms=.21, massKg=.004, stiffnessNpm=9012.)),
        ('zero-drive', dict(driveVrms=0.)),
        ('zero-coil-coupling', dict(coupling=0., frequencyHz=1173.)),
        ('zero-mechanical-transducer', dict(transducerNA=0., frequencyHz=941.)),
        ('zero-electrical-load', dict(loadOhm=0., frequencyHz=783.)),
    ]
    ac_cases = [
        ('exact-frozen-peak-to-RMS', ac_frozen_exact),
        ('heldout-dielectric-loss', dict(frequencyHz=173.4, loadOhm=7312., forceRmsN=.0017, massKg=.008, stiffnessNPerM=11620., couplingNPerV=.019, dielectricConductanceS=2.3e-5, capacitanceF=2.1e-7, dampingNsPerM=.34)),
        ('heldout-zero-mechanical-damping', dict(frequencyHz=239.3, dampingNsPerM=0., dielectricConductanceS=1e-6)),
        ('zero-force', dict(forceRmsN=0., frequencyHz=189.)),
        ('zero-piezo-coupling', dict(couplingNPerV=0., frequencyHz=121.)),
    ]
    requests = [{'method':'emSolve','options':p} for _,p in em_cases]+[{'method':'acousticSolve','options':p} for _,p in ac_cases]
    results = browser_calls(requests); cases = []
    for n, ((label,p), reply) in enumerate(zip(em_cases+ac_cases, results)):
        acoustic = n >= len(em_cases); require(reply['ok'], label+': solve must succeed')
        ref = acoustic_reference(p) if acoustic else em_reference(p)
        compare_response(reply['value'], ref, label, acoustic)
        if label.startswith('zero-'):
            if label in ['zero-drive','zero-force']:
                close(reply['value']['inputW'], 0., label+' input'); require(reply['value']['efficiency'] is None, label+' efficiency')
            if label in ['zero-coil-coupling','zero-piezo-coupling']:
                close(reply['value']['loadW' if acoustic else 'outputW'], 0., label+' output')
        cases.append({'label':label,'model':'acoustic' if acoustic else 'em','parameters':p,'status':'passed'})
    em_grid = dict(mode='fixed-input', targetInputW=.03, maxDriveVrms=10., maxCurrentRmsA=.7, maxStoredEnergyJ=.01,
                   frequenciesHz=[1500.,700.,1000.], couplings=[-.2,0.,.5], loadsOhm=[30.,5.,15.])
    probe = em_reference(dict(frequencyHz=1379., coupling=.45, loadOhm=13., driveVrms=1.))
    needed = np.sqrt(.017/probe['inputW']); rescaled = em_reference(dict(frequencyHz=1379.,coupling=.45,loadOhm=13.,driveVrms=float(needed)))
    one = {**em_grid, 'frequenciesHz':[1379.], 'couplings':[.45], 'loadsOhm':[13.], 'targetInputW':.017}
    em_sweeps = [('heldout-unsorted-grid',em_grid), ('heldout-single-cell',{**one,'driveVrms':0.}),
        ('postscale-drive-limit',{**one,'maxDriveVrms':float(.9*needed)}),
        ('postscale-current-limit',{**one,'maxCurrentRmsA':.9*max(rescaled['primaryCurrentRmsA'],rescaled['secondaryCurrentRmsA'])}),
        ('postscale-peak-storage-limit',{**one,'maxStoredEnergyJ':.9*rescaled['peakStoredJ']}),
        ('no-coupling-no-useful-response',{**one,'couplings':[0.]}),
        ('no-dissipative-input-response',{**one,'couplings':[0.],'R1Ohm':0.})]
    ac_grid = dict(mode='fixed-input',targetInputW=1.7e-6,maxForceRmsN=.02,maxVelocityRmsMps=.02,maxVoltageRmsV=.5,
        frequencyMinHz=113.,frequencyMaxHz=269.,frequencyPoints=9,loadMinOhm=330.,loadMaxOhm=82000.,loadPoints=11,
        dielectricConductanceS=2.3e-5,couplingNPerV=.019,capacitanceF=2.1e-7)
    aprobe = acoustic_reference({**ac_grid,'frequencyHz':173.4,'loadOhm':7312.,'forceRmsN':1.})
    aneed = np.sqrt(ac_grid['targetInputW']/aprobe['inputW'])
    arescaled = acoustic_reference({**ac_grid,'frequencyHz':173.4,'loadOhm':7312.,'forceRmsN':float(aneed)})
    aone = {**ac_grid,'frequencyMinHz':173.4,'frequencyMaxHz':173.4,'frequencyPoints':2,'loadMinOhm':7312.,'loadMaxOhm':7312.,'loadPoints':2}
    ac_sweeps = [('heldout-lossy-grid',ac_grid), ('heldout-repeated-cell',{**aone,'forceRmsN':0.}),
        ('postscale-force-limit',{**aone,'maxForceRmsN':float(.9*aneed)}),
        ('postscale-velocity-limit',{**aone,'maxVelocityRmsMps':.9*arescaled['velocityRmsMps']}),
        ('postscale-voltage-limit',{**aone,'maxVoltageRmsV':.9*arescaled['voltageRmsV']}),
        ('no-coupling-damping-only',{**aone,'couplingNPerV':0.}),
        ('zero-mean-input-not-rescalable',{**aone,'couplingNPerV':0.,'dampingNsPerM':0.})]
    requests = [{'method':'emSweep','options':p} for _,p in em_sweeps]+[{'method':'acousticSweep','options':p} for _,p in ac_sweeps]
    replies = browser_calls(requests); sweep_results = []
    for n, ((label,p), reply) in enumerate(zip(em_sweeps+ac_sweeps,replies)):
        acoustic = n >= len(em_sweeps); require(reply['ok'], label+': sweep must succeed'); got = reply['value']
        ref = acoustic_sweep_reference(p) if acoustic else em_sweep_reference(p)
        require(got['feasibleCount'] == ref['feasible'], label+': feasible count')
        require(got['rejectionCounts' if acoustic else 'rejectionReasons'] == ref['counts'], label+': rejection counts')
        require((got['best'] is None) == (ref['best'] is None), label+': best existence')
        if ref['best'] is not None:
            best = got['best']; truth = ref['best']
            for key in ['inputW','loadW' if acoustic else 'outputW','velocityRmsMps']:
                close(best[key], truth[key], label+':best '+key)
            close(best['inputW'], p['targetInputW'], label+':target', atol=1e-15)
            params = best if acoustic else best['parameters']
            for key in ['frequencyHz','loadOhm','forceRmsN' if acoustic else 'driveVrms']:
                close(params[key], truth['parameters'][key], label+':best parameter '+key)
            if acoustic:
                require(best['forceRmsN']<=p['maxForceRmsN'] and best['velocityRmsMps']<=p['maxVelocityRmsMps'] and best['voltageRmsV']<=p['maxVoltageRmsV'], label+': postscale constraints')
            else:
                require(params['driveVrms']<=p['maxDriveVrms'] and max(best['primaryCurrentRmsA'],best['secondaryCurrentRmsA'])<=p['maxCurrentRmsA'] and best['peakStoredJ']<=p['maxStoredEnergyJ'], label+': postscale constraints')
                expected_boundary = {key:truth['parameters'][name] in [min(p[grid]),max(p[grid])] for key,name,grid in [('frequency','frequencyHz','frequenciesHz'),('coupling','coupling','couplings'),('load','loadOhm','loadsOhm')]}
                require(got['bestAtGridBoundary']==expected_boundary,label+': true boundary extrema')
        sweep_results.append({'label':label,'model':'acoustic' if acoustic else 'em','status':'passed','parameters':p,
                              'feasibleCount':ref['feasible'],'rejections':ref['counts']})
    invalid = [{'method':m,'options':{'mode':'fixed-input','targetInputW':0}} for m in ['emSweep','acousticSweep']]
    for reply in browser_calls(invalid): require(not reply['ok'] and reply['name']=='RangeError','Zero fixed-input target explicitly rejected')
    # Independent derivative check, positive dielectric loss, with unconstrained amplitudes.
    w=2*np.pi*173.4; b=.2; theta=.019; gd=2.3e-5; cp=2.1e-7
    gstar=np.sqrt(gd*gd+(w*cp)**2+theta*theta*gd/b)
    eta=lambda g: theta*theta*g/(b*((gd+g)**2+(w*cp)**2)+theta*theta*(gd+g))
    close(b*(gd*gd+(w*cp)**2-gstar*gstar)+theta*theta*gd, 0., 'Conditional load derivative numerator', atol=1e-20)
    require(eta(gstar)>eta(gstar*.99) and eta(gstar)>eta(gstar*1.01),'Conditional load optimum local comparison')
    identity=browser_calls([{'method':'identifiabilityDemo','options':{'scale':7.3}}])[0]
    require(identity['ok'],'Identifiability held-out scale'); identity=identity['value']
    require(identity['rank']==3 and identity['nullity']==1 and identity['rankWithVelocity']==4 and identity['nullityWithVelocity']==0,'Conditional numerical ranks')
    close(identity['velocityratio'],1/np.sqrt(7.3),'Held-out velocity scaling',atol=1e-13)
    require(identity['electricalrelativeDifference']<1e-12 and identity['numericNullResidual']<1e-7,'Held-out exact-family witness')
    hashes()
    return {'schema':1,'round':3,'status':'passed for reviewed hashes and stated synthetic cases','physicalMeasurements':0,
        'reviewedSha256':reviewed,'referenceOrigin':'Complex matrix equations and original fixtures frozen in round2; API adapter and held-out cases authored in round3 after code inspection.',
        'fixtureScope':{'acoustic':'Exact frozen parameters and drive, with explicit peak-to-RMS conversion.',
            'em':'Original frozen fixture has external mechanical forcePeak=0.01 and cannot be passed to voltage-only emSolve. Compared its Fext=0 specialization; original two-input fixture remains independently solved but not cross-compared.'},
        'solveCases':cases,'fixedInputSweepCases':sweep_results,'zeroTargetRejections':2,
        'conditionalAcousticLoadOptimum':{'loadOhm':float(1/gstar),'efficiency':float(eta(gstar)),
            'assumptions':'Fixed frequency and positive matched receiver mechanical input; b>0, theta nonzero; unconstrained amplitudes. Does not imply feasibility under force/velocity/voltage caps.'},
        'identifiability':{'scale':7.3,'rank':identity['rank'],'nullity':identity['nullity'],'rankWithVelocity':identity['rankWithVelocity'],
            'scope':'Four-state known electrical model, nonzero coupling, no independent force input, calibrated complex velocity and fixed orientation/phase. Unknown sensor gain or unmeasured force can reintroduce ambiguity; speed magnitude does not determine coupling sign.'},
        'checksPassed':CHECKS,'maximumToleranceFraction':MAX_SCALED_ERROR,
        'tolerance':{'relative':2e-9,'absolute':2e-12,'overrides':'Input matching1e-15W; conditional derivative1e-20; velocity scaling1e-13.'},
        'limits':['No hardware certification, global optimum, new energy source or full floating-point-domain proof.',
                  'Fixed input means ideal AC terminal (EM) or receiver mechanical work (acoustic), not upstream wall-supply input.',
                  'No measured finite bandwidth, sensor response, radiation capture, transients, nonlinearities or temperature dependence modeled.',
                  'EM rejects useful response below its declared1e-15W unit-probe floor; acoustic may retain a dissipative zero-output cell. These are distinct selection policies, not different conservation laws.']}


if __name__ == '__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--output',type=Path,required=True); args=parser.parse_args()
    result=run(); result['crosscheckSha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    args.output.parent.mkdir(parents=True,exist_ok=True); args.output.write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    print(json.dumps({k:result[k] for k in ['status','checksPassed','maximumToleranceFraction','crosscheckSha256']}))

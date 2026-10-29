"""Independent Python-complex R3 fixtures; no producer code imports or reads."""
import copy
import hashlib
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
TAU = 2 * math.pi
RTOL, ATOL = 2e-10, 1e-15

def h(f, p):
    w, w0 = TAU*f, TAU*p['naturalFrequencyHz']
    return 1 / (p['massKg'] * complex(w0*w0-w*w, 2*p['gammaPerS']*w))

def inverse(f, m, value):
    z = 1/value
    w = TAU*f
    w02, gamma = w*w+z.real/m, z.imag/(2*m*w)
    if not all(math.isfinite(v) and v > 0 for v in [w02, gamma, m, f]):
        raise ValueError('nonpositive or nonfinite reconstructed parameter')
    return dict(naturalFrequencyHz=math.sqrt(w02)/TAU, gammaPerS=gamma,
                massKg=m, probeFrequencyHz=f)

def measurement(f, v):
    return dict(frequencyHz=f, realMPerN=v.real, imagMPerN=v.imag)

def heldout(estimate, points):
    errors = [abs(h(x['frequencyHz'], estimate)-complex(x['realMPerN'], x['imagMPerN']))
              /abs(complex(x['realMPerN'], x['imagMPerN'])) for x in points]
    passed = all(abs(h(x['frequencyHz'], estimate)-complex(x['realMPerN'], x['imagMPerN']))
                 <= ATOL+RTOL*abs(complex(x['realMPerN'], x['imagMPerN'])) for x in points)
    return dict(passed=passed, relativeErrors=errors, maxRelativeError=max(errors))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    inherited_path=ROOT/'analysis/round2/results.json'
    inherited=json.loads(inherited_path.read_text())['sameOutput']
    models=[inherited['first'], inherited['second'],
            dict(naturalFrequencyHz=8, gammaPerS=TAU*8/(2*.6), massKg=.75),
            dict(naturalFrequencyHz=2.5, gammaPerS=TAU*2.5/(2*.4), massKg=2)]
    probes=[6.4,8.8,3.7,1.3]
    positive=[]
    for i,(p,probe) in enumerate(zip(models,probes)):
        v=h(probe,p)
        estimate=inverse(probe,p['massKg'],v)
        measurements=[measurement(f,h(f,p)) for f in [2.3,11.7,17.1]]
        expected=heldout(estimate,measurements)
        assert expected['passed']
        positive.append(dict(id=f'known-mass-{i+1}', truth=p,
                             input=dict(**measurement(probe,v),massKg=p['massKg']),
                             estimate=estimate,measurements=measurements,expected=expected))
    first,second=models[:2]
    probe=6.4
    controls=[]
    for name,fn in [
        ('conjugated-phase',lambda f:h(f,first).conjugate()),
        ('uncalibrated-gain-1.35',lambda f:1.35*h(f,first)),
        ('two-mode-fit-by-one',lambda f:h(f,first)+.8*h(f,second)),
        ('small-complex-perturbation',lambda f:(1+1e-4+2e-4j)*h(f,first))]:
        # Perturb only the identifying datum to measure its propagation to clean held-outs.
        points=[measurement(f,h(f,first) if name=='small-complex-perturbation' else fn(f))
                for f in [2.3,11.7,17.1]]
        case=dict(id=name,input=dict(**measurement(probe,fn(probe)),massKg=first['massKg']),
                  measurements=points)
        try:
            estimate=inverse(probe,first['massKg'],fn(probe))
            case.update(rejected=False,estimate=estimate,expected=heldout(estimate,points),
                        relativeNaturalFrequencyShift=estimate['naturalFrequencyHz']/first['naturalFrequencyHz']-1,
                        relativeGammaShift=estimate['gammaPerS']/first['gammaPerS']-1)
            assert not case['expected']['passed']
        except ValueError:
            case['rejected']=True
        controls.append(case)
    receivers=[]
    for f in [1,2.3,6.4,7.8,10.3,11.7,20]:
        a,b=h(f,first),h(f,second)
        g=b/a
        receivers.append(dict(frequencyHz=f,first=first,second=second,
                              gainReal=g.real,gainImag=g.imag,
                              firstReal=a.real,firstImag=a.imag,
                              secondReal=b.real,secondImag=b.imag,
                              transformedReal=(g*a).real,transformedImag=(g*a).imag,
                              relativeResidual=abs(g*a-b)/abs(b),
                              reciprocalRatioWrongResidual=abs((a/b)*a-b)/abs(b)))
    assert max(x['relativeResidual'] for x in receivers)<2e-14
    assert max(x['reciprocalRatioWrongResidual'] for x in receivers)>.1
    gain=3.7
    fa,fb=2.3,11.7
    za,zb=1/(gain*h(fa,first)),1/(gain*h(fb,first))
    a=-(zb.real-za.real)/((TAU*fb)**2-(TAU*fa)**2)
    recovered=dict(naturalFrequencyHz=math.sqrt((TAU*fa)**2+za.real/a)/TAU,
                   gammaPerS=za.imag/(2*a*TAU*fa),massGainRatioKg=a)
    assert math.isclose(recovered['naturalFrequencyHz'],first['naturalFrequencyHz'],rel_tol=2e-14)
    assert math.isclose(recovered['gammaPerS'],first['gammaPerS'],rel_tol=2e-14)

    asof='2026-10-29T04:57:39Z'
    complete=dict(stationId='synthetic-A',channel='BNS-mode1',observable='schumann-mode-frequency',units='Hz',
                  record=dict(kind='calibrated-numeric',url='https://example.org/synthetic.json',sha256='0'*64),
                  interval=dict(startUtc='2026-10-23T00:00:00Z',endUtc='2026-10-29T03:00:00Z'),
                  retrievedUtc='2026-10-29T04:57:39Z',coverageComplete=True,
                  calibration=dict(id='synthetic-calibration',valid=True),qc=dict(method='synthetic QC',status='passed'),
                  baseline=dict(id='synthetic-matched-baseline',matched=True),
                  decision=dict(method='synthetic predeclared procedure',uncertainty='synthetic numeric error model and coverage'),
                  scope='station',synthetic=True)
    metadata=[dict(id='synthetic-complete-station',packet=complete,asOfUtc=asof,expectedStatus='ready-for-analysis')]
    globalpacket=copy.deepcopy(complete)
    globalpacket.update(scope='global',independentStationIds=['synthetic-A','synthetic-B'],
                        independenceJustification='Synthetic different calibrated station chains; assertion only',
                        sharedObservableModel='Synthetic matched mode and common comparison model; assertion only')
    metadata.append(dict(id='synthetic-complete-global',packet=globalpacket,asOfUtc=asof,expectedStatus='ready-for-analysis'))
    for field in ['stationId','channel','observable','units','record','interval','retrievedUtc','coverageComplete',
                  'calibration','qc','baseline','decision','scope','synthetic']:
        p=copy.deepcopy(complete); del p[field]
        metadata.append(dict(id='missing-'+field,packet=p,asOfUtc=asof,expectedStatus='insufficient-evidence'))
    mutations=[('kp-proxy','observable','planetary-kp'),('wrong-units','units','nT'),
               ('quicklook-record','record.kind','quicklook'),('bad-hash','record.sha256','not-a-hash'),
               ('non-https','record.url','http://example.org/raw'),('incomplete','coverageComplete',False),
               ('invalid-calendar-day','interval.startUtc','2026-02-30T00:00:00Z'),
               ('missing-UTC','interval.startUtc','2026-10-23T00:00:00'),
               ('non-UTC-offset','interval.startUtc','2026-10-23T00:00:00+01:00'),
               ('future-end','interval.endUtc','2026-10-29T06:00:00Z'),
               ('future-retrieval','retrievedUtc','2026-10-30T00:00:00Z'),
               ('zero-duration','interval.startUtc','2026-10-29T03:00:00Z'),
               ('reversed-duration','interval.startUtc','2026-10-29T04:00:00Z'),
               ('unvalidated-calibration','calibration.valid',False),('failed-QC','qc.status','failed'),
               ('unmatched-baseline','baseline.matched',False),('blank-uncertainty','decision.uncertainty','')]
    for name,path,value in mutations:
        p=copy.deepcopy(complete); keys=path.split('.'); target=p
        for key in keys[:-1]:target=target[key]
        target[keys[-1]]=value
        metadata.append(dict(id=name,packet=p,asOfUtc=asof,expectedStatus='insufficient-evidence'))
    for name,key,value in [('duplicate-stations','independentStationIds',['synthetic-A','synthetic-A']),
                           ('focal-station-absent','independentStationIds',['synthetic-B','synthetic-C']),
                           ('unjustified-independence','independenceJustification',''),
                           ('no-shared-model','sharedObservableModel','')]:
        p=copy.deepcopy(globalpacket);p[key]=value
        metadata.append(dict(id=name,packet=p,asOfUtc=asof,expectedStatus='insufficient-evidence'))
    metadata.append(dict(id='missing-assessment-time',packet=complete,asOfUtc=None,expectedStatus='insufficient-evidence'))
    actual=dict(stationId='',channel='',observable='schumann-mode-frequency',units='Hz',
                record=dict(kind='quicklook-inventory'),
                interval=dict(startUtc='2026-10-23T00:00:00Z',endUtc='2026-10-29T03:00:00Z'),
                retrievedUtc=asof,coverageComplete=False,scope='station',synthetic=False,
                context='Saved NOAA/GFZ Kp is geomagnetic context; Schumann quicklooks lack calibrated numeric series and matched baseline')
    metadata.append(dict(id='actual-october-inventory',packet=actual,asOfUtc=asof,expectedStatus='insufficient-evidence'))
    bindings={str(p.relative_to(ROOT)):sha(p) for p in [inherited_path,ROOT/'rounds/round3-contract.md',
              ROOT/'panel/observations/schumann.md',ROOT/'panel/observations/noaa-kp.json',ROOT/'panel/observations/gfz-kp.json',
              ROOT/'panel/observations/download-manifest.json',ROOT/'panel/observations/gfz-download.json']}
    result=dict(schema='independent-schumann-round3/1',status='pass',
                provenance='Frozen before reading R3 producer code; Python native complex arithmetic',
                tolerances=dict(relative=2e-11,responseAbsolute=1e-15,parameterAbsolute=1e-12,heldoutRelative=RTOL,heldoutAbsolute=ATOL),
                positiveCases=positive,negativeControls=controls,receiverCases=receivers,
                constantGain=dict(gain=gain,frequenciesHz=[fa,fb],truth=first,recovered=recovered,
                                  qualification='Poles recovered; mass/gain confounded under constant positive real gain'),
                metadataCases=metadata,sourceBindings=bindings,oracleSha256=sha(Path(__file__)))
    (HERE/'independent-fixtures.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(dict(status='pass',positiveCases=len(positive),negativeControls=len(controls),metadataCases=len(metadata),
                          fixtureSha256=sha(HERE/'independent-fixtures.json'),oracleSha256=result['oracleSha256'])))

if __name__=='__main__':main()

"""Replay frozen Python oracle fixtures against the final R3 JavaScript snapshot."""
import copy
import hashlib
import json
import math
import subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
FIXTURE_SHA='07cc3ffc86db87d724ee995846ad80db028350dad157c1042fc08f87d89a4f1a'
SUPPLEMENT_SHA='fee29af7dc52a51e9e1a5d2bce3f9ad5190a4318beb821cc8f306b0b5af18a89'
RECEIVER_SUPPLEMENT_SHA='50ccb75c4474e56f7671f5976357db251aa163a47eb035a2243de8ac8cc97901'
MODEL_SHA='c59e7b5d2489294c897a641a767fce25d5c743ea49e4236dcfebdc35ea1bec30'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(HERE/'independent-fixtures.json')==FIXTURE_SHA
assert sha(HERE/'schema-supplement.json')==SUPPLEMENT_SHA
assert sha(HERE/'receiver-supplement.json')==RECEIVER_SUPPLEMENT_SHA
fixtures=json.loads((HERE/'independent-fixtures.json').read_text())
supplement=json.loads((HERE/'schema-supplement.json').read_text())
receiver_supplement=json.loads((HERE/'receiver-supplement.json').read_text())
requests=[]
def request(id,fn,args,options=None):
    requests.append(dict(id=id,fn=fn,args=args,options=options))
def heldout_input(case):
    return dict(estimate=case['estimate'],measurements=case['measurements'],
                relativeTolerance=fixtures['tolerances']['heldoutRelative'],
                absoluteTolerance=fixtures['tolerances']['heldoutAbsolute'])
for case in fixtures['positiveCases']+fixtures['negativeControls']:
    request('inverse-'+case['id'],'calibratedModeInverse',case['input'])
    if not case.get('rejected'):
        request('heldout-'+case['id'],'validateModeAtFrequencies',heldout_input(case))
receiver_cases=fixtures['receiverCases']+receiver_supplement['points']
for i,case in enumerate(receiver_cases):
    request('receiver-'+str(i),'receiverAmbiguity',{k:case[k] for k in ['frequencyHz','first','second']})
same_mass_points=receiver_supplement['points']
same_mass_probe=next(x for x in same_mass_points if x['frequencyHz']==6.4)
request('same-mass-impostor-inverse','calibratedModeInverse',dict(frequencyHz=6.4,massKg=same_mass_probe['first']['massKg'],
        realMPerN=same_mass_probe['transformedReal'],imagMPerN=same_mass_probe['transformedImag']))
request('same-mass-impostor-heldout','validateModeAtFrequencies',dict(estimate=receiver_supplement['estimate'],
        measurements=[dict(frequencyHz=x['frequencyHz'],realMPerN=x['transformedReal'],imagMPerN=x['transformedImag'])
                      for x in same_mass_points if x['frequencyHz']!=6.4],
        relativeTolerance=fixtures['tolerances']['heldoutRelative'],absoluteTolerance=fixtures['tolerances']['heldoutAbsolute']))
metadata=copy.deepcopy(fixtures['metadataCases'])+copy.deepcopy(supplement['cases'])
for case in metadata:
    case['expectedStatus']=supplement['originalExpectedStatusOverrides'].get(case['id'],case['expectedStatus'])
    request('intake-'+case['id'],'evidenceIntake',case['packet'],dict(asOfUtc=case['asOfUtc']))
base=fixtures['positiveCases'][0]
invalids=[]
for name,change in [('zero-frequency',dict(frequencyHz=0)),('zero-mass',dict(massKg=0)),
                    ('zero-transfer',dict(realMPerN=0,imagMPerN=0)),
                    ('extreme-large-transfer',dict(realMPerN=1e308,imagMPerN=-1e308)),
                    ('extreme-tiny-transfer',dict(realMPerN=1e-320,imagMPerN=-1e-320))]:
    args=copy.deepcopy(base['input']);args.update(change)
    id='invalid-'+name;request(id,'calibratedModeInverse',args);invalids.append(id)
for name,points in [('one-point',base['measurements'][:1]),
                    ('duplicated-point',[base['measurements'][0]]*2),
                    ('includes-probe',[base['input'],base['measurements'][0]])]:
    args=heldout_input(base);args['measurements']=points
    id='invalid-'+name;request(id,'validateModeAtFrequencies',args);invalids.append(id)
module=ROOT/'analysis/round3/model.mjs'
before=sha(module)
assert before==MODEL_SHA
run=subprocess.run(['node',str(HERE/'producer-bridge.mjs')],input=json.dumps(requests),text=True,capture_output=True,check=True)
assert sha(module)==before,'module changed during comparison'
responses=json.loads(run.stdout);by_id={x['id']:x for x in responses}
assert len(by_id)==len(requests)
checks=[];maxrel=0
def check(label,passed,detail=None):
    checks.append(dict(label=label,passed=bool(passed),detail=detail))
def equal(label,actual,expected,absolute=1e-12):
    global maxrel
    finite=isinstance(actual,(float,int)) and math.isfinite(actual)
    error=abs(actual-expected) if finite else float('inf')
    relative=error/abs(expected) if expected else None
    if relative is not None and abs(expected)>absolute:maxrel=max(maxrel,relative)
    check(label,finite and error<=absolute+fixtures['tolerances']['relative']*abs(expected),
          dict(actual=actual,expected=expected,absoluteError=error,relativeError=relative))
def value(id):
    r=by_id[id];check(id+'-executed',r['ok'],r.get('error'))
    return r.get('value',{})
for case in fixtures['positiveCases']+fixtures['negativeControls']:
    id='inverse-'+case['id']
    if case.get('rejected'):
        check(id+'-positivity-rejection',not by_id[id]['ok'],by_id[id]);continue
    actual=value(id)
    for key in ['naturalFrequencyHz','gammaPerS','massKg','probeFrequencyHz']:
        equal(id+'-'+key,actual.get(key),case['estimate'][key])
    held=value('heldout-'+case['id'])
    check('heldout-'+case['id']+'-decision',held.get('passed')==case['expected']['passed'])
    # The frozen oracle's measured-norm discriminator remains unchanged. The
    # API reports a symmetric relative residual with max(predicted, measured)
    # norm; compute that output independently rather than conflate conventions.
    api_relative=[]
    for point in case['measurements']:
        w=2*math.pi*point['frequencyHz'];p=case['estimate'];w0=2*math.pi*p['naturalFrequencyHz']
        prediction=1/(p['massKg']*complex(w0*w0-w*w,2*p['gammaPerS']*w))
        measured=complex(point['realMPerN'],point['imagMPerN'])
        api_relative.append(abs(prediction-measured)/max(abs(prediction),abs(measured)))
    # Near-zero residuals are governed by the absolute numerical tolerance.
    equal('heldout-'+case['id']+'-maximum',held.get('maxRelativeError'),max(api_relative),1e-12)
for case in metadata:
    actual=value('intake-'+case['id'])
    check('intake-'+case['id']+'-status',actual.get('status')==case['expectedStatus'],actual)
    check('intake-'+case['id']+'-no-anomaly',actual.get('anomalyEstablished') is False)
    check('intake-'+case['id']+'-metadata-only',actual.get('metadataOnly') is True)
for id in invalids:
    check(id+'-rejected',not by_id[id]['ok'],by_id[id])
receiver_results=[]
for i,case in enumerate(receiver_cases):
    actual=value('receiver-'+str(i))
    for key in ['gainReal','gainImag']:
        equal('receiver-'+str(i)+'-'+key,actual.get(key),case[key],1e-15)
    for actual_key,expected_key in [('observedRealMPerN','transformedReal'),('observedImagMPerN','transformedImag'),
                                    ('targetRealMPerN','secondReal'),('targetImagMPerN','secondImag')]:
        equal('receiver-'+str(i)+'-'+actual_key,actual.get(actual_key),case[expected_key],1e-15)
    receiver_results.append(dict(expected=case,actual=actual))
impostor=value('same-mass-impostor-inverse')
for key in ['naturalFrequencyHz','gammaPerS','massKg','probeFrequencyHz']:
    equal('same-mass-impostor-'+key,impostor.get(key),receiver_supplement['estimate'][key])
impostor_held=value('same-mass-impostor-heldout')
check('same-mass-impostor-heldout-passes',impostor_held.get('passed') is True,impostor_held)
bindings={str(p.relative_to(ROOT)):sha(p) for p in [module,HERE/'independent-oracle.py',HERE/'independent-fixtures.json',
          HERE/'preregistered.md',HERE/'schema-supplement.py',HERE/'schema-supplement.json',
          HERE/'receiver-supplement.py',HERE/'receiver-supplement.json',HERE/'producer-bridge.mjs',Path(__file__)]}
for name,expected in fixtures['sourceBindings'].items():
    check('source-binding-'+name,sha(ROOT/name)==expected)
result=dict(schema='independent-schumann-round3-comparison/1',status='pass' if all(x['passed'] for x in checks) else 'fail',
            apiRequests=len(requests),checks=len(checks),maxNonzeroRelativeDifference=maxrel,invalidRejections=len(invalids),
            checksDetail=checks,receiverResults=receiver_results,sourceBindings=bindings,
            scope='Synthetic numerical and metadata-schema checks, not experimental validation or an anomaly detector')
(HERE/'comparison-results.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['checksDetail','receiverResults','sourceBindings']}))
if result['status']!='pass':
    print(json.dumps([x for x in checks if not x['passed']],indent=2));raise SystemExit(1)

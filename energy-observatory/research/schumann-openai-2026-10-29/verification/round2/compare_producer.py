#!/usr/bin/env python3
import hashlib
import json
import math
from pathlib import Path
import subprocess

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
MODULE=HERE.parents[1]/'analysis'/'round2'/'model.mjs'
EXPECTED_FIXTURE_SHA='725075026c5a46c9bb3e04e1e3e6e596027d460c5e30dae5826cfbd6ab0beea8'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    assert sha(HERE/'independent-fixtures.json')==EXPECTED_FIXTURE_SHA
    fixture=json.loads((HERE/'independent-fixtures.json').read_text())
    original_sha=sha(MODULE)
    first=fixture['first'];second=fixture['second']
    requests=[];expected=[]
    def add(name,args,fields=None,kind='normal'):
        requests.append({'name':name,'args':args});expected.append({'fields':fields,'kind':kind})
    for x in fixture['responseCases']:
        f=x['frequencyHz']
        add('positiveSpectralWeight',{'frequencyHz':f,'referenceHz':8,'scaleHz':8,'tilt':x['tilt']},x['weight'],'scalar')
        add('mechanicalPsd',{**first,'frequencyHz':f,'forcePsdN2PerHz':x['firstForcePsdN2PerHz'],
                             'receiverGainSquared':x['receiverGainSquared']},
            {'displacementPsdM2PerHz':x['firstOutputPsd'],'outputPsdM2PerHz':x['receiverOutputPsd'],
             'velocityPsdM2PerS2PerHz':x['velocityPsd']})
        add('sameOutputForcing',{'frequencyHz':f,'first':first,'second':second,
                                 'firstForcePsdN2PerHz':x['firstForcePsdN2PerHz']},
            {'secondForcePsdN2PerHz':x['secondForcePsdN2PerHz'],
             'firstOutputPsdM2PerHz':x['firstOutputPsd'],'secondOutputPsdM2PerHz':x['secondOutputPsd']})
    for x in fixture['modeCases']:
        add('coherentModesPsd',{'frequencyHz':x['frequencyHz'],'forcePsdN2PerHz':.02,
                                'modes':[{**first,'amplitude':1,'phaseRad':0},
                                         {**second,'amplitude':.8,'phaseRad':x['phaseRad']}]},
            {'coherentPsdM2PerHz':x['coherentPsd'],'uncorrelatedPsdM2PerHz':x['uncorrelatedPsd'],
             'crossTermM2PerHz':x['crossTerm']})
    for phase in [0,math.pi]:
        add('coherentModesPsd',{'frequencyHz':8,'forcePsdN2PerHz':.02,
                                'modes':[{**first,'amplitude':1,'phaseRad':0},
                                         {**first,'amplitude':1,'phaseRad':phase}]},phase,'equal_modes')
    add('gridMaxima',first,fixture['maxima'],'grid')
    invalid=[('positiveSpectralWeight',{'frequencyHz':1,'scaleHz':0}),
             ('positiveSpectralWeight',{'frequencyHz':-1}),
             ('positiveSpectralWeight',{'frequencyHz':20,'tilt':1e308}),
             ('mechanicalPsd',{**first,'frequencyHz':8,'forcePsdN2PerHz':0}),
             ('mechanicalPsd',{**first,'frequencyHz':8,'receiverGainSquared':-1}),
             ('sameOutputForcing',{'frequencyHz':8,'first':first,'second':{**second,'gammaPerS':0}}),
             ('coherentModesPsd',{'frequencyHz':8,'modes':[]}),
             ('coherentModesPsd',{'frequencyHz':8,'modes':[{**first,'phaseRad':'pi'}]}),
             ('coherentModesPsd',{'frequencyHz':8,'modes':[first],'forcePsdN2PerHz':-1})]
    for name,args in invalid:add(name,args,kind='invalid')
    proc=subprocess.run(['node',str(HERE/'producer-bridge.mjs')],input=json.dumps(requests),
                        text=True,capture_output=True,check=True,cwd=ROOT)
    outputs=json.loads(proc.stdout);assert len(outputs)==len(requests)
    checks=0;max_relative=0;invalid_count=0;maxima=None;cancellation=None;phase_signs=[]
    def compare(got,want):
        nonlocal checks,max_relative
        checks+=1; assert math.isfinite(got)
        if want:
            max_relative=max(max_relative,abs(got-want)/abs(want))
        assert math.isclose(got,want,rel_tol=2e-12,abs_tol=1e-22),(got,want)
    for req,exp,out in zip(requests,expected,outputs):
        kind=exp['kind']
        if kind=='invalid':assert not out['ok'],req;invalid_count+=1;continue
        assert out['ok'],(req,out)
        value=out['value']
        if kind=='scalar':compare(value,exp['fields'])
        elif kind=='grid':
            maxima=value
            for row in value:
                reference=next(x for x in exp['fields'] if x['tilt']==row['tilt'])
                assert abs(row['frequencyHz']-reference['gridMaximumHz'])<=.001
                assert not row['endpoint']
        elif kind=='equal_modes':
            ratio=value['coherentPsdM2PerHz']/value['uncorrelatedPsdM2PerHz']
            if exp['fields']==0:compare(ratio,2)
            else:
                cancellation=ratio
                assert 0<=ratio<=1e-28
        else:
            for key,want in exp['fields'].items():compare(value[key],want)
            if req['name']=='coherentModesPsd':
                assert value['coherentPsdM2PerHz']>=0
                phase_signs.append(value['crossTermM2PerHz'])
            if req['name']=='sameOutputForcing':assert value['relativeResidual']<2e-12
    assert min(phase_signs)<0<max(phase_signs)
    assert fixture['wrong_ratio_max_relative_mismatch']>.1
    assert sha(MODULE)==original_sha,'Producer changed during verification.'
    result={'schema':'schumann-round2-independent-comparison/1','status':'pass',
            'API_requests':len(requests),'scalar_comparisons':checks,'invalid_inputs_rejected':invalid_count,
            'maximum_nonzero_relative_error':max_relative,'grid_points_per_case':19001,
            'grid_cases':len(maxima),'grid_maxima':maxima,
            'equal_mode_phase_pi_coherent_to_uncorrelated_ratio':cancellation,
            'interference_term_has_both_signs':True,
            'wrong_ratio_max_relative_mismatch':fixture['wrong_ratio_max_relative_mismatch'],
            'source_bindings':{'producer':original_sha,'oracle':sha(HERE/'independent-oracle.py'),
                               'fixtures':sha(HERE/'independent-fixtures.json'),'bridge':sha(HERE/'producer-bridge.mjs'),
                               'comparison':sha(Path(__file__))},
            'tolerances':fixture['tolerances'],
            'scope':'Finite-band synthetic countermodels; no Earth calibration, source identification or anomaly claim.'}
    (HERE/'comparison-results.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))

if __name__=='__main__':main()

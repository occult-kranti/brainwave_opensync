#!/usr/bin/env python3
"""Compare a separately frozen Python oracle with the JavaScript public API."""
import hashlib
import json
import math
from pathlib import Path
import subprocess
import numpy as np

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
MODULE=HERE.parents[1]/'analysis'/'round1'/'model.mjs'
EXPECTED_PRODUCER_SHA='86f92e1d90ee7b7b4ac5d8286c830d915a360f0c634fdeae4c2f3798c1443cc8'
EXPECTED_FIXTURE_SHA='ebd2ff8e1b4149e610b974f2bc327250967073ce9801ba149fd9759f7d91b6f0'
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    assert sha(HERE/'independent-fixtures.json')==EXPECTED_FIXTURE_SHA
    fixture=json.loads((HERE/'independent-fixtures.json').read_text())
    module_before=sha(MODULE)
    assert module_before==EXPECTED_PRODUCER_SHA
    requests=[]; expectations=[]
    def add(name,args,expected=None,invalid=False):
        requests.append({'name':name,'args':args})
        expectations.append({'expected':expected,'invalid':invalid})
    for x in fixture['geometry']:
        add('idealCavityModes',{'radiusM':x['radiusM'],'speedMps':x['speedMps'],'maxDegree':x['degree']},
            {'index':x['degree']-1,'fields':{'frequencyHz':x['frequencyHz'],'omegaPerS':x['angularFrequencyRadS'],
                                          'horizontalWavelengthM':x['horizontalScaleM']}})
        add('wavelengthReference',{'frequencyHz':x['frequencyHz']},{'fields':{'wavelengthM':x['vacuumReferenceM']}})
    for x in fixture['dynamics']:
        add('dampedMode',{'naturalFrequencyHz':x['naturalFrequencyHz'],'gammaPerS':x['gammaPerS']},
            {'fields':{'omega0PerS':x['omega0RadS'],'qualityFactor':x['qualityFactor'],
                       'displacementPeakHz':x['whiteDisplacementPeakHz'],'velocityPeakHz':x['whiteVelocityPeakHz'],
                       'ringdownFrequencyHz':x['ringdownFrequencyHz']}})
    for x in fixture['responses']:
        add('modeResponse',{'naturalFrequencyHz':x['naturalFrequencyHz'],
                            'gammaPerS':math.pi*x['naturalFrequencyHz']/x['qualityFactor'],
                            'frequencyHz':x['frequencyHz'],'massKg':x['massKg']},
            {'fields':{'realMPerN':x['real'],'imagMPerN':x['imag'],
                       'displacementPsdPerForcePsd':x['displacementPsd'],
                       'velocityPsdPerForcePsd':x['velocityPsd']}})
    for x in fixture['power']:
        add('harmonicEnergyBudget',{'naturalFrequencyHz':x['naturalFrequencyHz'],
                            'gammaPerS':math.pi*x['naturalFrequencyHz']/x['qualityFactor'],
                            'frequencyHz':x['frequencyHz'],'massKg':x['massKg'],'forcePeakN':x['forcePeakN']},
            {'fields':{'averageInputW':x['inputMeanW'],'averageDissipationW':x['dampingMeanW']},'power':True})
        assert x['instantaneousBalanceMaxAbsW']<1e-15
    for x in fixture['magneticEnergy']:
        add('magneticEnergyReference',{'fieldRmsT':x['fieldT']},
            {'fields':{'energyDensityJPerM3':x['energyDensityJm3']}})
    invalid=[('idealCavityModes',{'radiusM':0}),('idealCavityModes',{'radiusM':-1}),
             ('idealCavityModes',{'speedMps':0}),('idealCavityModes',{'maxDegree':0}),
             ('idealCavityModes',{'maxDegree':1.5}),('idealCavityModes',{'radiusM':'6371000'}),
             ('wavelengthReference',{'frequencyHz':0}),('wavelengthReference',{'frequencyHz':-1}),
             ('magneticEnergyReference',{'fieldRmsT':-1}),
             ('magneticEnergyReference',{'fieldRmsT':1,'permeabilityHpm':0}),
             ('dampedMode',{'naturalFrequencyHz':0,'gammaPerS':1}),
             ('dampedMode',{'naturalFrequencyHz':8,'gammaPerS':0}),
             ('modeResponse',{'frequencyHz':-1,'naturalFrequencyHz':8,'gammaPerS':1}),
             ('modeResponse',{'frequencyHz':1,'naturalFrequencyHz':8,'gammaPerS':1,'massKg':0}),
             ('harmonicEnergyBudget',{'frequencyHz':1,'naturalFrequencyHz':8,'gammaPerS':1,'forcePeakN':-1})]
    for name,args in invalid:add(name,args,invalid=True)
    bridge=subprocess.run(['node',str(HERE/'producer-bridge.mjs')],input=json.dumps(requests),
                          text=True,capture_output=True,check=True,cwd=ROOT)
    responses=json.loads(bridge.stdout)
    assert len(responses)==len(requests)
    count=0; errors=[]; rejection_count=0; max_relative=0
    for request,expect,response in zip(requests,expectations,responses):
        if expect['invalid']:
            assert not response['ok'],request
            rejection_count+=1;continue
        assert response['ok'],(request,response)
        expected=expect['expected']; value=response['value']
        if 'index' in expected:value=value[expected['index']]
        for key,want in expected['fields'].items():
            got=value[key]; count+=1
            if want is None:
                assert got is None,(request,key,got);continue
            assert math.isfinite(got)
            absolute=1e-15 if expected.get('power') else (1e-20 if request['name']=='modeResponse' else 0)
            if want==0:
                assert got==0,(request,key,got)
            else:
                relative=abs(got-want)/abs(want); max_relative=max(max_relative,relative)
                assert math.isclose(got,want,rel_tol=5e-13,abs_tol=absolute),(request,key,got,want)
            errors.append({'operation':request['name'],'field':key,'absolute_error':abs(got-want)})
    # Independent grid extrema of the physical denominator verify analytic classification.
    grid=np.linspace(0,16,80001); omega=2*np.pi*grid; w0=16*np.pi
    maxima=[]
    for x in fixture['dynamics']:
        gamma=x['gammaPerS']; mass=x['massKg']
        psd=1/(mass*mass*((w0*w0-omega*omega)**2+4*gamma*gamma*omega*omega))
        vpsd=omega*omega*psd
        displacement=float(grid[int(np.argmax(psd))]);velocity=float(grid[int(np.argmax(vpsd))])
        assert abs(displacement-x['whiteDisplacementPeakHz'])<=.0002
        assert abs(velocity-x['whiteVelocityPeakHz'])<=.0002
        maxima.append({'Q':x['qualityFactor'],'displacementGridHz':displacement,'velocityGridHz':velocity,'gridStepHz':.0002})
    for control in fixture['wrong_model_controls'].values():assert control['rejected']
    assert sha(MODULE)==module_before,'Producer changed during comparison; replay required.'
    result={'schema':'schumann-round1-independent-comparison/1','status':'pass',
            'public_api_requests':len(requests),'scalar_field_comparisons':count,
            'invalid_inputs_rejected':rejection_count,'maximum_nonzero_relative_error':max_relative,
            'real_quadratures':len(fixture['power']),'quadrature_points_per_period':32768,
            'grid_extrema':maxima,'wrong_model_controls':fixture['wrong_model_controls'],
            'source_bindings':{'producer':module_before,'oracle':sha(HERE/'independent-oracle.py'),
                               'fixtures':sha(HERE/'independent-fixtures.json'),'bridge':sha(HERE/'producer-bridge.mjs'),
                               'comparison':sha(Path(__file__))},
            'tolerances':fixture['tolerances'],
            'scope':'Finite normal-range implementation comparison and model controls; no experimental validation or universal numerical bound.'}
    (HERE/'comparison-results.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))

if __name__=='__main__':main()

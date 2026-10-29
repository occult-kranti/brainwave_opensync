#!/usr/bin/env python3
"""Independent packet fixtures written after schema freeze, before model read."""
import copy
import hashlib
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
def ref(label):return {'uri':'https://example.invalid/verifier/'+label,'sha256':hashlib.sha256(('FABRICATED-'+label).encode()).hexdigest()}
def at(hour,minute=0,second=0):return f'2026-10-27T{hour:02}:{minute:02}:{second:02}.000Z'
trials=[]
for i,status in enumerate(['hit','abstain','miss','hit','abstain']):
    h=10+i
    trials.append({'id':f'FAKE-V-{i}','status':status,'eventTimeBasis':'original-event','eventUtc':at(h),
                   'responseLockedUtc':at(h,2),'revealUtc':at(h,5),
                   'commitment':{'sha256':hashlib.sha256(f'FAKE-COMMIT-{i}'.encode()).hexdigest(),
                                 'committedUtc':at(8),'nonceBits':256,'nonceRevealUtc':at(h,6)}})
BASE={'schemaVersion':1,'origin':'observational','asOfUtc':'2026-10-28T00:00:00.000Z',
      'fixtureLabel':'ALL METADATA FABRICATED FOR SOFTWARE VERIFICATION; NO OBSERVATIONS',
      'documentary':{'source':ref('text'),'readDepth':'selected-primary-passage','assertionStatus':'attributed'},
      'environment':{'kind':'calibrated-numeric','component':'By','units':'T','sampleRateHz':200,'bandHz':[3,45],
                     'startUtc':at(9),'endUtc':at(18),'clockUncertaintyMs':0.5,
                     **{k:ref(k) for k in ['numericRecords','calibration','responseNoise','qc','baseline']},
                     'estimator':'locked-estimator-v1','missingnessRule':'all gaps retained; no interpolation'},
      'information':{'K':4,'N':5,**{k:ref(k) for k in ['targetCustody','responseArchive','scoringPlan','generationAudit']},
                     'generationAssumption':'independent-uniform-conditional','stoppingRule':'fixed-N',
                     'commitmentScheme':'salted-domain-separated-sha256','trials':trials},
      'paired':{'crosswalk':ref('crosswalk'),'protocolLockedUtc':'2026-10-26T00:00:00.000Z',
                'lagRule':'zero lag only','nullAssumption':'prospectively declared, not established by this string',
                'calendarControls':'UTC/local-hour/season covariates predeclared','maxClockUncertaintyMs':1},
      'selfAttestations':{'calibrationVerified':True,'independenceVerified':True,'custodyVerified':True,'contactVerified':True}}

def setpath(p,path,value):
    target=p
    for key in path[:-1]:target=target[key]
    target[path[-1]]=value

def main():
    cases=[]
    def add(cid,flags,mutations=None,remove=None,special=None,base=None):
        p=copy.deepcopy(BASE if base is None else base)
        for path,value in mutations or []:setpath(p,path,value)
        for key in remove or []:p.pop(key,None)
        cases.append({'id':cid,'packet':p,'expectedFlags':flags,'special':special,
                      'always':{'evidenceAuthenticated':False,'empiricalResult':None,'couplingEstablished':False,'etContactEstablished':False}})
    T=[True]*4;D=[False,True,True,True];E=[True,False,True,False];I=[True,True,False,False];P=[True,True,True,False];F=[False]*4
    add('fabricated_observational_complete',T)
    add('complete_synthetic',P,[(['origin'],'synthetic')])
    add('complete_electric_component',T,[(['environment','component'],'Ez'),(['environment','units'],'V/m')])
    add('documentary_only',[True,False,False,False],remove=['environment','information','paired'])
    add('environment_only',[False,True,False,False],remove=['documentary','information','paired'])
    add('information_only',[False,False,True,False],remove=['documentary','environment','paired'])
    add('no_documentary_independent_lanes',D,remove=['documentary'])
    add('spoofed_verification_fields_ignored',T,[(['evidenceAuthenticated'],True),(['empiricalResult'],{'contact':'confirmed'}),(['couplingEstablished'],True),(['etContactEstablished'],True)])
    for cid,path,val in [
        ('schema_string',['schemaVersion'],'1'),('invalid_origin',['origin'],'channelled'),
        ('invalid_calendar_asof',['asOfUtc'],'2026-02-30T00:00:00.000Z'),
        ('noncanonical_asof',['asOfUtc'],'2026-10-28T00:00:00Z')]:add(cid,F,[(path,val)])
    for cid,path,val in [
        ('http_reference',['documentary','source','uri'],'http://example.invalid/text'),
        ('empty_https_hostname',['documentary','source','uri'],'https://'),
        ('bad_digest',['documentary','source','sha256'],'z'*64),
        ('validated_assertion_label',['documentary','assertionStatus'],'validated'),
        ('blank_read_depth',['documentary','readDepth'],' ')]:add(cid,D,[(path,val)])
    for cid,path,val in [
        ('wrong_magnetic_units',['units'],'V/m'),('unknown_component',['component'],'Kp'),
        ('image_kind',['kind'],'spectrogram-image'),('kp_kind',['kind'],'planetary-index'),
        ('constant_lookup',['kind'],'constant-7.83-Hz-lookup'),('nyquist_equality',['bandHz'],[3,100]),
        ('descending_band',['bandHz'],[40,3]),('negative_band',['bandHz'],[-1,40]),
        ('sample_rate_zero',['sampleRateHz'],0),('boolean_sample_rate',['sampleRateHz'],True),
        ('invalid_february_date',['startUtc'],'2026-02-30T09:00:00.000Z'),
        ('future_environment_end',['endUtc'],'2026-10-29T00:00:00.000Z'),
        ('noncanonical_environment_start',['startUtc'],'2026-10-27T09:00:00Z'),
        ('equal_environment_times',['endUtc'],at(9)),('negative_clock',['clockUncertaintyMs'],-1),
        ('missing_calibration',['calibration'],None),('missing_noise',['responseNoise'],None),
        ('missing_baseline',['baseline'],None),('blank_estimator',['estimator'],'')]:add(cid,E,[(['environment']+path,val)])
    for key in ['sampleRateHz','clockUncertaintyMs']:
        for val in ['NaN','Infinity','-Infinity']:
            add('environment_'+key+'_'+val,E,special={'path':['environment',key],'value':val})
    for cid,path,val in [
        ('K_one',['K'],1),('fractional_K',['K'],2.5),('N_zero',['N'],0),('N_mismatch',['N'],4),
        ('duplicate_trial_id',['trials',1,'id'],'FAKE-V-0'),('unknown_status',['trials',0,'status'],'unclear'),
        ('upload_time_basis',['trials',0,'eventTimeBasis'],'upload-date'),
        ('event_after_lock',['trials',0,'eventUtc'],at(10,3)),
        ('early_target_reveal',['trials',0,'revealUtc'],at(10,1)),
        ('future_reveal',['trials',0,'revealUtc'],'2026-10-29T00:00:00.000Z'),
        ('unsalted_commitment',['commitmentScheme'],'unsalted-sha256'),
        ('early_nonce_reveal',['trials',0,'commitment','nonceRevealUtc'],at(10,4)),
        ('late_commitment',['trials',0,'commitment','committedUtc'],at(10,2)),
        ('short_nonce',['trials',0,'commitment','nonceBits'],127),
        ('bad_commitment_hash',['trials',0,'commitment','sha256'],'0'*63),
        ('nonfixed_stopping',['stoppingRule'],'until-significant'),
        ('marginally_uniform_only',['generationAssumption'],'marginally-uniform'),
        ('missing_response_archive',['responseArchive'],None)]:add(cid,I,[(['information']+path,val)])
    for cid,path,val in [
        ('late_protocol',['protocolLockedUtc'],at(9)),('missing_crosswalk',['crosswalk'],None),
        ('clock_limit_too_small',['maxClockUncertaintyMs'],.1),('negative_clock_limit',['maxClockUncertaintyMs'],-1),
        ('blank_null',['nullAssumption'],''),('blank_calendar_controls',['calendarControls'],'')]:add(cid,P,[(['paired']+path,val)])
    for val in ['NaN','Infinity','-Infinity']:add('paired_clock_'+val,P,special={'path':['paired','maxClockUncertaintyMs'],'value':val})
    add('event_outside_environment',P,[(['information','trials',0,'eventUtc'],at(8,30))])
    # The frozen schema explicitly chose inclusive event boundaries.
    add('event_on_start_boundary',T,[(['information','trials',0,'eventUtc'],at(9))])
    add('event_on_end_boundary',T,[(['environment','endUtc'],at(14))])
    for label,descriptor in [('actual_quicklook','Current Schumann quick-look image; calibrated paired numerical data unavailable in supplied material'),
                             ('actual_kp','Saved Kp is a separate geomagnetic index, not an SR Bx/By/Ez record'),
                             ('actual_corpus','Attributed occult/channeling text is not a timed controlled-information trial')]:
        add(label,F,base={'schemaVersion':1,'origin':'observational','asOfUtc':'2026-10-28T00:00:00.000Z',
                          'availabilityDescriptor':descriptor,'dataSupplied':False})
    producer_targets=['copper','silver','gold','iron']
    crypto={'encoding':'UTF-8 literal no newline','targets':producer_targets,
            'sha256':{s:hashlib.sha256(s.encode()).hexdigest() for s in producer_targets},'selectedTarget':'gold',
            'selectedDigest':hashlib.sha256(b'gold').hexdigest()}
    crypto['recovered']=next(s for s,h in crypto['sha256'].items() if h==crypto['selectedDigest'])
    output={'schema':'r6-independent-adversarial-packets-v1','frozenProducerSchemaSha256':'f6679aae36c2d4146466e7b564c3f19eebcd50b216ec6f7ad17f42e3a89263a8',
            'flagOrder':['documentaryMetadataReady','environmentMetadataReady','informationMetadataReady','pairedMetadataReady'],
            'cases':cases,'crypto':crypto,'scope':'fabricated metadata fixtures; no sensor, human or contact measurements'}
    (HERE/'fixtures.json').write_text(json.dumps(output,indent=2,allow_nan=False)+'\n')
    print(json.dumps({'cases':len(cases),'hash':hashlib.sha256((HERE/'fixtures.json').read_bytes()).hexdigest()}))

if __name__=='__main__':main()

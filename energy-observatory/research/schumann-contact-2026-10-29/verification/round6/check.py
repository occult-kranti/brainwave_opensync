#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
import platform
import subprocess

HERE=Path(__file__).resolve().parent
f=json.loads((HERE/'fixtures.json').read_text())
own=json.loads((HERE/'hash-dictionary-oracle.json').read_text())
a=json.loads(subprocess.run(['node',str(HERE/'bridge.mjs')],check=True,capture_output=True,text=True).stdout)
failures=[];checks=0;summaries=[]
def check(ok,detail):
    global checks
    checks+=1
    if not ok:failures.append(detail)
check(len(a['cases'])==len(f['cases']),{'field':'case_count'})
for e,g in zip(f['cases'],a['cases']):
    check(e['id']==g['id'],{'field':'case_identity'})
    check('error' not in g,{'id':e['id'],'field':'unexpected_exception','error':g.get('error')})
    if 'error' in g:continue
    result=g['actual']
    for i,key in enumerate(f['flagOrder']):
        check(result.get(key) is e['expectedFlags'][i],{'id':e['id'],'field':key,'expected':e['expectedFlags'][i],'actual':result.get(key)})
    for key,value in e['always'].items():
        check(result.get(key) is value,{'id':e['id'],'field':key,'expected':value,'actual':result.get(key)})
    for i,lane in enumerate(['documentary','environment','information','paired']):
        reasons=result.get('reasons',{}).get(lane)
        check(isinstance(reasons,list) and (len(reasons)==0)==e['expectedFlags'][i],{'id':e['id'],'field':lane+'_reason_consistency'})
    check(result.get('origin')==e['packet']['origin'],{'id':e['id'],'field':'origin_retained'})
    if e['id'] in ['fabricated_observational_complete','complete_synthetic','spoofed_verification_fields_ignored','complete_electric_component']:
        check(result.get('declaredAttemptCounts')=={'declaredTrials':5,'hits':2,'misses':1,'abstentions':2,'nonhits':3},{'id':e['id'],'field':'abstentions_retained'})
    summaries.append({'id':e['id'],'flags':[result.get(k) for k in f['flagOrder']],
                      'authenticated':result.get('evidenceAuthenticated'),'contactEstablished':result.get('etContactEstablished')})
d=a['dictionary'];check(d['targets']==f['crypto']['targets'],{'field':'crypto_target_set'})
check(d['publishedDigest']==f['crypto']['selectedDigest'],{'field':'crypto_selected_digest'})
check(d['matches']==['gold'] and d['evaluatedCandidates']==4,{'field':'crypto_recovery'})
for entry in d['dictionary']:
    expected=hashlib.sha256(entry['target'].encode('utf-8')).hexdigest()
    check(entry['sha256']==expected==f['crypto']['sha256'][entry['target']],{'field':'crypto_hash','target':entry['target']})
for target,digest in own['sha256'].items():check(a['ownDictionary'][target]==digest,{'field':'additional_dictionary_hash','target':target})
paths=[HERE/'make_fixtures.py',HERE/'fixtures.json',HERE/'hash-dictionary-oracle.json',HERE/'bridge.mjs',
       HERE.parent.parent/'analysis/round6/model.mjs',HERE.parent.parent/'analysis/round6/schema.json',
       HERE.parent.parent/'rounds/round6-contract.md']
report={'status':'PASS' if not failures else 'FAIL','independentPacketCases':len(f['cases']),'checks':checks,
        'nodePythonSha256Comparisons':8,'failures':failures,'summaries':summaries,
        'crypto':{'recovered':'gold','candidates':4,'scope':'unsalted known four-element dictionary only; no salted-security proof'},
        'inputs_sha256':{str(p.relative_to(HERE.parent.parent)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths},
        'runtime':{'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip()},
        'scope':'schema and chronology declarations only; no authentication, physical observations, contact confirmation or seventh round'}
(HERE/'comparison.json').write_text(json.dumps(report,indent=2,allow_nan=False)+'\n')
print(json.dumps({k:report[k] for k in ['status','independentPacketCases','checks','nodePythonSha256Comparisons']}))
raise SystemExit(bool(failures))

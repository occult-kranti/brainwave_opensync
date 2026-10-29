#!/usr/bin/env python3
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import platform
import subprocess
from oracle import orbit,rank

HERE=Path(__file__).resolve().parent
fixture=json.loads((HERE/'fixtures.json').read_text())
actual=json.loads(subprocess.run(['node',str(HERE/'bridge.mjs')],check=True,capture_output=True,text=True).stdout)
frozen={c['id']:c['expected'] for c in fixture['cases']}
failures=[];checks=0;max_error=0.0;summaries=[]
def check(ok,detail):
    global checks
    checks+=1
    if not ok:failures.append(detail)

for c in actual['cases']:
    inp=c['input'];a=c['actual'];e=frozen[c['id']] if c['origin']=='independent' else orbit(inp['x'],inp['y'],inp['lags'])
    check(a['groupSize']==256 and len(a['offsets'])==256,{'id':c['id'],'field':'groupSize'})
    check(e['minimumNonzeroScoreGap']>a['tieTolerance'],{'id':c['id'],'field':'gap'})
    for er,ar in zip(e['rows'],a['offsets']):
        for k in ['offset','fixedCount','maximumCount','fixedP','maximumP','invalidSelectedMinimumP']:
            check(er[k]==ar[k],{'id':c['id'],'offset':er['offset'],'field':k,'expected':er[k],'actual':ar[k]})
        for k in ['fixedScore','maximumScore']:
            delta=abs(er[k]-ar[k]);max_error=max(max_error,delta)
            check(math.isfinite(ar[k]) and delta<=fixture['scoreTolerance'],{'id':c['id'],'offset':er['offset'],'field':k,'expected':er[k],'actual':ar[k]})
    for ek,ak in [('fixedRejectionCount','fixed'),('maximumRejectionCount','lockedMaximum'),('invalidRejectionCount','invalidSelectedMinimum')]:
        check(e[ek]==a['rejections'][ak]['count'],{'id':c['id'],'field':ek})
    check(a['rejections']['fixed']['count']<=12 and a['rejections']['lockedMaximum']['count']<=12,{'id':c['id'],'field':'global_null_level'})
    check(min(r['maximumP'] for r in a['offsets'])>=e['necessaryMinP'],{'id':c['id'],'field':'p_floor'})
    if len(inp['lags'])==256:
        check(all(r['maximumP']==1 for r in a['offsets']),{'id':c['id'],'field':'all_lags_p1'})
    summaries.append({'id':c['id'],'origin':c['origin'],'offsetZeroMaximumP':a['offsets'][0]['maximumP'],'rejections':a['rejections']})

matrix_summaries=[]
for ecase,acase in zip(fixture['matrices'],actual['matrices']):
    e=ecase['expected'];a=acase['actual'];n=len(e['z']);cid=ecase['id']
    check(cid==acase['id'],{'id':cid,'field':'matrix_id'})
    for ek,part,ak in [('x','root','x'),('yDirect','observational','modelA'),('yCommon','observational','modelB'),
                       ('xPerturbed','hypothetical','xPrime'),('yDirectIntervention','hypothetical','modelA'),
                       ('yCommonIntervention','hypothetical','modelB'),('predictionDifference','hypothetical','difference')]:
        obtained=a[ak] if part=='root' else a[part][ak]
        check(e[ek]==obtained,{'id':cid,'field':ek})
    for ek,part in [('original',a['observational']['design']),('duplicate',a['duplicateSensor']),('intervention',a['hypothetical']['design'])]:
        ee=e[ek];m=[[Fraction(col[i],n) for col in part['columns']] for i in range(n)]
        check(part['dimensions']==[n,ee['columns']],{'id':cid,'field':ek+'_dimensions'})
        check(rank(m)==ee['rank']==part['rank'],{'id':cid,'field':ek+'_rank'})
        check(part['nullity']==ee['nullity']==ee['columns']-rank(m),{'id':cid,'field':ek+'_nullity'})
        for i,row in enumerate(m):
            for j,v in enumerate(row):check(abs(float(v)-ee['matrix'][i][j])<=fixture['matrixTolerance'],{'id':cid,'field':ek+'_entry','i':i,'j':j})
    for part,kernels in [(a['observational']['design'],[a['observational']['kernelWitness']]),(a['duplicateSensor'],a['duplicateSensor']['kernelWitnesses'])]:
        for k in kernels:
            for i in range(n):check(sum(v*part['columns'][j][i] for j,v in enumerate(k))==0,{'id':cid,'field':'kernel_image'})
        check(rank(kernels)==len(kernels),{'id':cid,'field':'kernel_independence'})
    unscaled=Fraction(e['intervention']['exactGramDeterminant']);scaled=unscaled*n**4
    check(scaled.denominator==1 and int(a['hypothetical']['design']['gramDeterminant'])==scaled.numerator,{'id':cid,'field':'exact_scaled_gram_determinant'})
    check(int(a['observational']['design']['gramDeterminant'])==0,{'id':cid,'field':'observational_gram_determinant'})
    matrix_summaries.append({'id':cid,'originalRank':1,'originalNullity':1,'duplicateRank':1,'duplicateNullity':2,'perturbedRank':2,'perturbedNullity':0,'unscaledGramDeterminant':str(unscaled),'scaledGramDeterminant':str(scaled)})
for c in actual['parity']:
    check(c['offsetsEqual'] and c['rejectionsEqual'] and c['count']==32,{'id':c['id'],'field':'N32_original_parity'})
for c in actual['invalid']:check(c['rejected'],{'id':c['id'],'field':'postinspection_rank_validation'})
paths=[HERE/'oracle.py',HERE/'fixtures.json',HERE/'bridge.mjs',HERE.parent.parent/'analysis/round4/model.mjs',HERE.parent.parent/'analysis/round4/fixtures.json',HERE.parent.parent/'analysis/round3/model.mjs',HERE.parent.parent/'rounds/round4-contract.md']
report={'status':'PASS' if not failures else 'FAIL','orbit_families':len(actual['cases']),'offset_rows':256*len(actual['cases']),
        'independent_offset_rows':256*len(fixture['cases']),'matrix_fixtures':len(actual['matrices']),
        'N32_parity_families':len(actual['parity']),'postinspection_invalid_rank_cases':len(actual['invalid']),
        'checks':checks,'max_absolute_score_error':max_error,'failures':failures,'summaries':summaries,'matrices':matrix_summaries,
        'inputs_sha256':{str(p.relative_to(HERE.parent.parent)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths},
        'runtime':{'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip()},
        'scope':'synthetic null resolution and linear identifiability only; no estimated population power, empirical p-value validity or agency'}
(HERE/'comparison.json').write_text(json.dumps(report,indent=2,allow_nan=False)+'\n')
print(json.dumps({k:report[k] for k in ['status','orbit_families','offset_rows','matrix_fixtures','N32_parity_families','checks','max_absolute_score_error']}))
raise SystemExit(bool(failures))

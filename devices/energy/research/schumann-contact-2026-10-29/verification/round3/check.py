#!/usr/bin/env python3
import hashlib
import json
import math
from pathlib import Path
import platform
import subprocess
from oracle import oracle

HERE=Path(__file__).resolve().parent
fixture=json.loads((HERE/'fixtures.json').read_text())
raw=subprocess.run(['node',str(HERE/'bridge.mjs')],check=True,capture_output=True,text=True)
actual=json.loads(raw.stdout)
frozen={x['id']:x['expected'] for x in fixture['cases']}
failures=[]; comparisons=0; max_score_error=0.0; summaries=[]

def check(ok,detail):
    global comparisons
    comparisons+=1
    if not ok:failures.append(detail)

for case in actual['cases']:
    inp=case['input']; got=case['actual']
    expected=frozen[case['id']] if case['origin']=='independent' else oracle(inp['x'],inp['y'],inp['lags'])
    check(len(got['offsets'])==32,{'id':case['id'],'field':'length'})
    gap=expected['minimumNonzeroScoreGap']
    if gap is not None:
        check(gap>got['tieTolerance'],{'id':case['id'],'field':'positive_gap_exceeds_tie_tolerance'})
    check(got['tieTolerance']<=fixture['producer_acceptable_tie_tolerance'],{'id':case['id'],'field':'tieTolerance'})
    for e,g in zip(expected['rows'],got['offsets']):
        for ek,gk in [('offset','offset'),('fixedP','fixedP'),('maximumP','maximumP'),
                      ('invalidSelectedMinimumP','invalidSelectedMinimumP'),('fixedTailCount','fixedCount'),('maximumTailCount','maximumCount')]:
            check(e[ek]==g[gk],{'id':case['id'],'offset':e['offset'],'field':ek,'expected':e[ek],'actual':g[gk]})
        for ek,gk in [('fixedScore','fixedScore'),('selectedScore','maximumScore')]:
            delta=abs(e[ek]-g[gk]);max_score_error=max(max_score_error,delta)
            check(math.isfinite(g[gk]) and delta<=fixture['floating_score_tolerance'],
                  {'id':case['id'],'offset':e['offset'],'field':ek,'expected':e[ek],'actual':g[gk]})
    for ek,gk in [('fixedRejectionsAt005','fixed'),('maximumRejectionsAt005','lockedMaximum'),('invalidSelectedMinimumRejectionsAt005','invalidSelectedMinimum')]:
        check(expected[ek]==got['rejections'][gk]['count'],{'id':case['id'],'field':ek})
    check(got['rejections']['fixed']['count']<=1,{'id':case['id'],'field':'fixed_level'})
    check(got['rejections']['lockedMaximum']['count']<=1,{'id':case['id'],'field':'global_max_level'})
    if len(inp['lags'])==32:
        check(all(g['maximumP']==1 for g in got['offsets']),{'id':case['id'],'field':'all_lags_p_one'})
    summaries.append({'id':case['id'],'origin':case['origin'],'rejections':got['rejections'],'minimumNonzeroScoreGap':gap})
check(len(actual['invalid'])==len(fixture['invalid_cases']),{'field':'invalid_count'})
for e,g in zip(fixture['invalid_cases'],actual['invalid']):
    check(e['id']==g['id'] and g['rejected'],{'id':e['id'],'field':'invalid_rejection'})
hashes={str(p.relative_to(HERE.parent.parent)):hashlib.sha256(p.read_bytes()).hexdigest()
        for p in [HERE/'oracle.py',HERE/'fixtures.json',HERE/'bridge.mjs',
                  HERE.parent.parent/'analysis/round3/model.mjs',HERE.parent.parent/'analysis/round3/fixtures.json',
                  HERE.parent.parent/'rounds/round3-contract.md']}
report={'status':'PASS' if not failures else 'FAIL','case_families':len(actual['cases']),
        'offset_rows':32*len(actual['cases']),'independent_case_families':len(fixture['cases']),
        'invalid_cases':len(actual['invalid']),'comparisons':comparisons,'max_absolute_score_error':max_score_error,
        'exact_ranks_and_pvalues':not failures,'failures':failures,'summaries':summaries,'inputs_sha256':hashes,
        'runtime':{'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip()},
        'scope':'conditional uniform-offset synthetic global null only; not empirical validity or strong FWER'}
(HERE/'comparison.json').write_text(json.dumps(report,indent=2,allow_nan=False)+'\n')
print(json.dumps({k:report[k] for k in ['status','case_families','offset_rows','invalid_cases','comparisons','max_absolute_score_error']}))
raise SystemExit(bool(failures))

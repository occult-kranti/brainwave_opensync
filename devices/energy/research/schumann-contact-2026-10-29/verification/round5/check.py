#!/usr/bin/env python3
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import platform
import subprocess
from oracle import tail

HERE=Path(__file__).resolve().parent
f=json.loads((HERE/'fixtures.json').read_text())
a=json.loads(subprocess.run(['node',str(HERE/'bridge.mjs')],check=True,capture_output=True,text=True).stdout)
failures=[];checks=0;maxabs=0.0;maxrel=0.0;maxlog=0.0
def check(ok,detail):
    global checks
    checks+=1
    if not ok:failures.append(detail)
def numeric(expected,actual,label):
    global maxabs,maxrel
    ok=type(actual) in (int,float) and math.isfinite(actual)
    if ok:
        delta=abs(expected-actual);maxabs=max(maxabs,delta)
        if expected: maxrel=max(maxrel,delta/abs(expected))
        ok=delta<=max(f['absoluteTolerance'],f['relativeTolerance']*abs(expected))
    check(ok,{'field':label,'expected':expected,'actual':actual})
def info_check(expected,info,label):
    global maxlog
    rational=Fraction(int(expected['numerator']),int(expected['denominator']))
    if expected['positiveBelowFloatRange']:
        check(info['probability'] is None and info['status']=='positive-underflow',{'field':label+'_underflow','actual':info})
    else:numeric(expected['value'],info['probability'],label)
    if rational>0:
        logvalue=math.log(rational.numerator)-math.log(rational.denominator)
        ok=type(info['logProbability']) in (int,float) and math.isfinite(info['logProbability'])
        if ok:
            delta=abs(logvalue-info['logProbability']);maxlog=max(maxlog,delta);ok=delta<=1e-10
        check(ok,{'field':label+'_log','expected':logvalue,'actual':info['logProbability']})
        check(info['status']!='exact-zero',{'field':label+'_positive_not_zero'})

for e,g in zip(f['tailCases'],a['tails']):
    check(e['id']==g['id'],{'field':'tail_id'})
    info_check(e['expected'],g['actual']['upperTailInfo'],e['id'])
    check(g['actual']['upperTail']==g['actual']['upperTailInfo']['probability'],{'field':e['id']+'_public_status'})
for e,g in zip(f['thresholdCases'],a['thresholds']):
    value=g['actual']['h'] if g['actual']['attainable'] else None
    check(value==e['expected'],{'field':'threshold','n':e['n'],'k':e['k'],'expected':e['expected'],'actual':value})
    check(g['actual']['attainable']==(e['expected'] is not None),{'field':'threshold_attainable'})
for i,(e,g) in enumerate(zip(f['contaminationCases'],a['contaminations'])):
    r=g['actual'];aa=r['preselectedSubset'];bb=r['arbitraryOutcomeCorruption']
    info_check(e['fixedSubset'],{'probability':aa['tail'],'status':aa['numericStatus'],'logProbability':aa['logTail']},f'contamination_{i}_A')
    info_check(e['postOutcomeBound'],{'probability':bb['upperBound'],'status':bb['numericStatus'],'logProbability':bb['logUpperBound']},f'contamination_{i}_B')
    check(aa['tail']<=bb['upperBound']+1e-14,{'field':'A_not_B','case':i})
numeric(f['leak']['q']['value'],a['leak']['q'],'leak_q')
for h,e in enumerate(f['leak']['pmf']):
    numeric(e['value'],a['leak']['mixturePmf'][h],f'leak_mixture_{h}')
    numeric(e['value'],a['leak']['sameQBinomialPmf'][h],f'leak_same_q_{h}')
for e,g in zip(f['leak']['tails'],a['leakTails']):info_check(e['expected'],g['actual'],f'leak_tail_{e["h"]}')
for e,g in zip(f['invalidCases'],a['invalid']):check(e['id']==g['id'] and g['rejected'],{'field':'invalid','id':e['id']})
check(a['underflow']['rawTailRejected'],{'field':'raw_tail_positive_underflow_must_reject'})
u=a['underflow']['pmf'];indices=set(u['positiveUnderflowIndices'])
check(1000 in indices and u['probabilities'][1000] is None,{'field':'pmf_extreme_positive_underflow'})
for h,p in enumerate(u['probabilities']):
    # With 0<p<1 every one of these 1001 probabilities is strictly positive.
    check((p is None and h in indices and math.isfinite(u['logProbabilities'][h])) or (type(p) in (int,float) and p>0),{'field':'pmf_no_unlabelled_zero','h':h})
for b in a['boundary']:
    inp=b['input'];value=tail(inp['n'],Fraction(str(inp['p'])),inp['h']);info=b['actual']
    check(info['probability']==float(value),{'field':'boundary','input':inp})
    check(info['status']==('exact-one' if value==1 else 'exact-zero'),{'field':'boundary_status','input':inp})
paths=[HERE/'oracle.py',HERE/'fixtures.json',HERE/'bridge.mjs',HERE.parent.parent/'analysis/round5/model.mjs',HERE.parent.parent/'analysis/round5/api.mjs',HERE.parent.parent/'rounds/round5-contract.md']
report={'status':'PASS' if not failures else 'FAIL','tailCases':len(f['tailCases']),'thresholdCases':len(f['thresholdCases']),
        'contaminationCases':len(f['contaminationCases']),'leakPmfEntries':len(f['leak']['pmf']),
        'invalidCases':len(f['invalidCases']),'postrepairPmfPositivityChecks':len(u['probabilities']),
        'checks':checks,'max_absolute_probability_error':maxabs,'max_relative_nonzero_probability_error':maxrel,
        'max_absolute_log_error':maxlog,'failures':failures,
        'thresholdN100K4':next(g['actual'] for g in a['thresholds'] if g['n']==100),
        'underflow':{'status':a['underflow']['info']['status'],'logProbability':a['underflow']['info']['logProbability'],'rawTailRejected':a['underflow']['rawTailRejected'],'pmfPositiveUnderflowCount':len(indices)},
        'inputs_sha256':{str(p.relative_to(HERE.parent.parent)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths},
        'runtime':{'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip()},
        'scope':'known conditional probability and leakage-sensitivity arithmetic; no actual human/contact data or inferred m'}
(HERE/'comparison.json').write_text(json.dumps(report,indent=2,allow_nan=False)+'\n')
print(json.dumps({k:report[k] for k in ['status','checks','max_absolute_probability_error','max_relative_nonzero_probability_error','max_absolute_log_error']}))
raise SystemExit(bool(failures))

"""Independent E1 skeptic controls: exact matrices, exact PSD, Decimal spectrum."""
from pathlib import Path
from fractions import Fraction as F
from decimal import Decimal as D, localcontext
import hashlib, json, math, subprocess
ROOT=Path(__file__).resolve().parents[4]
HERE=Path(__file__).resolve().parent
SOURCE=ROOT/'src/dephasing-bound.mjs'
source_hash=hashlib.sha256(SOURCE.read_bytes()).hexdigest()
failures=[]
def require(condition,message):
    if not condition: failures.append(message)
def C(a=0,b=0): return (F(a),F(b))
def add(x,y): return (x[0]+y[0],x[1]+y[1])
def mul(x,y): return (x[0]*y[0]-x[1]*y[1],x[0]*y[1]+x[1]*y[0])
def adj(a): return [[(a[j][i][0],-a[j][i][1]) for j in range(2)] for i in range(2)]
def matmul(a,b): return [[add(mul(a[i][0],b[0][j]),mul(a[i][1],b[1][j])) for j in range(2)] for i in range(2)]
def divide(a,n): return [[(v[0]/n,v[1]/n) for v in row] for row in a]
def transformed(a):
    rho=[[C(F(1,2)),C(0,a)],[C(0,-a),C(F(1,2))]]
    M=[[C(0,-1),C(1)],[C(0,1),C(1)]]
    return divide(matmul(matmul(M,rho),adj(M)),2)
exact_work=[]
for a in [F(3,10),F(3,40),F(3,160)]:
    output=transformed(a)
    require(output==[[C(F(1,2)+a),C()],[C(),C(F(1,2)-a)]],f'exact matrix identity failed for {a}')
    exact_work.append(F(1)-2*output[1][1][0])
loss=exact_work[0]-exact_work[1]
wrong_loss=exact_work[0]-exact_work[2]
bound=F(2)*F(3,10)*(1-F(1,4))
require(loss==bound==F(9,20),'rational bound equality failed')
require(wrong_loss-bound==F(9,80),'rational wrong-model excess failed')

main=[{'population':.5,'coherenceMagnitude':.3,'dephasing':d,'gapJ':2} for d in [.25,.25**2]]
psd=[{'population':p,'coherenceMagnitude':r,'dephasing':.5,'gapJ':1} for p,r in [
    (0.,math.ulp(0.)),(1.,math.ulp(0.)),(.5,0.),(.3,math.sqrt(.3*.7)),
    (.25,math.sqrt(.25*.75)),(math.ulp(0.),math.sqrt(math.ulp(0.))),
    (.1,.3),(.1,math.nextafter(.3,math.inf)),(.5,math.nextafter(.5,math.inf)),
    (.1,math.nan),(-.1,0.)]]
# JSON cannot express NaN portably; finite-input rejection uses string sentinel.
psd[9]['coherenceMagnitude']='NaN'
numeric=[
    {'population':.25,'coherenceMagnitude':1e-200,'dephasing':.5,'gapJ':1e300},
    {'population':.25,'coherenceMagnitude':1e-150,'dephasing':.2,'gapJ':1e-23},
    {'population':math.nextafter(.5,1.),'coherenceMagnitude':1e-150,'dephasing':.2,'gapJ':1e23},
    {'population':.5,'coherenceMagnitude':math.ulp(0.),'dephasing':.5,'gapJ':1e300},
    {'population':.25,'coherenceMagnitude':.2,'dephasing':math.nextafter(1.,0.),'gapJ':1.},
]
helpers=[math.ulp(0.),1e-300,.1,.25,.3,.5,math.nextafter(.5,1.),math.nextafter(1.,0.)]
js=r'''
import fs from 'node:fs';
import {dephasingWorkBound,maxCoherenceMagnitude} from './src/dephasing-bound.mjs';
const input=JSON.parse(fs.readFileSync(0,'utf8'));
const attempt=x=>{try{return {accepted:true,value:dephasingWorkBound(x)}}catch(e){return {accepted:false,error:e.message}}};
const b=new ArrayBuffer(8),v=new DataView(b);
const next=x=>{v.setFloat64(0,x);v.setBigUint64(0,v.getBigUint64(0)+1n);return v.getFloat64(0)};
const result={main:input.main.map(attempt),psd:input.psd.map(attempt),numeric:input.numeric.map(attempt),helpers:input.helpers.map(p=>{let r=maxCoherenceMagnitude(p);return {p,r,next:next(r)}})};
process.stdout.write(JSON.stringify(result));
'''
proc=subprocess.run(['node','--input-type=module','-e',js],input=json.dumps({'main':main,'psd':psd,'numeric':numeric,'helpers':helpers}),text=True,capture_output=True,cwd=ROOT)
require(proc.returncode==0,'node evaluator failed: '+proc.stderr)
out=json.loads(proc.stdout)
require(hashlib.sha256(SOURCE.read_bytes()).hexdigest()==source_hash,'producer changed during execution')
for i,res in enumerate(out['main']): require(res['accepted'],f'withheld valid input {i} rejected')
base,mut=[x['value'] for x in out['main']]
# Work differences, independently supplied bound: do not test clipped lossRatio.
base_difference=base['workBeforeJ']-base['workAfterJ']
mutated_difference=mut['workBeforeJ']-mut['workAfterJ']
require(abs(base_difference-float(loss))<1e-12,'true model misses exact matrix work')
require(abs(mutated_difference-float(wrong_loss))<1e-12,'mutated model misses exact matrix work')
require(mutated_difference-float(bound)>0.1,'wrong model not rejected by work-difference upper bound')
psd_results=[]
for item,actual in zip(psd,out['psd']):
    p,r=item['population'],item['coherenceMagnitude']
    valid=isinstance(r,(int,float)) and math.isfinite(r) and 0<=p<=1 and 0<=r<=.5 and F(r)**2<=F(p)*(1-F(p))
    require(valid==actual['accepted'],f'exact PSD mismatch {item}')
    psd_results.append({'input':item,'exact_admissible':valid,'module_accepted':actual['accepted'],'error':actual.get('error')})
for h in out['helpers']:
    p,r,n=map(F,(h['p'],h['r'],h['next']))
    require(r*r<=p*(1-p) and n*n>p*(1-p),'max coherence helper not greatest admissible float')

decimal_results=[]
with localcontext() as ctx:
    ctx.prec=800
    for item,actual in zip(numeric,out['numeric']):
        require(actual['accepted'],'numeric stress unexpectedly rejected')
        a=actual['value']; p,r,d,e=[D.from_float(item[k]) for k in ['population','coherenceMagnitude','dephasing','gapJ']]
        z=1-2*p
        rb=(z*z+4*r*r).sqrt(); ra=(z*z+4*r*r*d*d).sqrt()
        # Independent high-precision spectrum and work subtraction, no rationalized/clipped q.
        expected=((rb-z)/2-(ra-z)/2)*e
        got=D.from_float(a['lossJ'])
        relative=abs(got-expected)/expected if expected else D(0)
        status=a['representability']['lossJ']
        if status=='normal': require(relative<D('1e-12'),'normal-range loss misses Decimal spectrum')
        elif status=='subnormal': require(abs(got-expected)<=D.from_float(math.ulp(0.)),'subnormal loss exceeds one minimum subnormal absolute error')
        elif status=='underflow': require(expected<D.from_float(math.ulp(0.)),'reported Joule underflow not genuinely subnormal')
        decimal_results.append({'input':item,'expected_lossJ':str(expected),'module_lossJ':a['lossJ'],'relative_error':str(relative),'representability':a['representability']})
result={
 'schema':'e1-skeptic-round2/1','passed':not failures,'failures':failures,
 'source_sha256':source_hash,'checker_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
 'control_sha256':hashlib.sha256((HERE/'controls.json').read_bytes()).hexdigest(),
 'exact_matrix_control':{'initial_work':str(exact_work[0]),'dephased_work':str(exact_work[1]),'loss':str(loss),'bound':str(bound),'wrong_dephased_work':str(exact_work[2]),'wrong_loss':str(wrong_loss),'wrong_excess':str(wrong_loss-bound),'module_base_difference':base_difference,'module_mutated_difference':mutated_difference,'wrong_model_rejection_stage':'independent work-difference comparison after both valid inputs accepted'},
 'exact_psd_cases':psd_results,'max_coherence_cases':out['helpers'],'decimal_spectrum_cases':decimal_results,
 'limits':'Finite implementation audit only. 800-digit Decimal spectrum and exact rational control independently assess the clipped producer expression. Subnormal accuracy is assessed absolutely; range classification alone does not certify an error bound.'
}
print(json.dumps(result,indent=2))
raise SystemExit(bool(failures))

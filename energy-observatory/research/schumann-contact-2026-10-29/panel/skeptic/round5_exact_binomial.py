"""Independent exact-rational checks for the fixed-round probability contract."""
from math import comb
from fractions import Fraction
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[2]
def tail(n,h,p=Fraction(1,4)):
 if h<=0:return Fraction(1)
 if h>n:return Fraction(0)
 return sum((Fraction(comb(n,j))*p**j*(1-p)**(n-j) for j in range(h,n+1)),Fraction(0))
N=100;K=4
rows=[{'h':h,'tail':float(tail(N,h)),'exact':str(tail(N,h))}for h in [25,30,35,40,50,100,0]]
threshold=next(h for h in range(N+2) if tail(N,h)<=Fraction(1,20))
sensitivity=[{'h':h,'m':m,'fixedPreselectedTail':float(tail(N-m,h-m)),'arbitraryCorruptionUpperBound':float(tail(N,h-m))} for h in [35,40,50] for m in [0,5,10,20,100]]
q=Fraction(1,5)+(1-Fraction(1,5))/4
out={'method':'Fraction+integer binomial coefficients; no producer import','N':N,'K':K,'rows':rows,'threshold':threshold,'thresholdTail':str(tail(N,threshold)),'priorCountTail':str(tail(N,threshold-1)),'leakQ':str(q),'sensitivity':sensitivity,'contractSha256':hashlib.sha256((root/'rounds/round5-contract.md').read_bytes()).hexdigest(),'humanTrials':0}
(root/'panel/skeptic/round5-exact-binomial.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({'rows':[{k:v for k,v in r.items() if k!='exact'} for r in rows],'threshold':threshold,'leakQ':str(q),'sensitivity_h40':[r for r in sensitivity if r['h']==40]},indent=2))

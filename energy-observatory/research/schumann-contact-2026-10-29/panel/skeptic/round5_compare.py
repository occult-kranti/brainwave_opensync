from pathlib import Path
from fractions import Fraction
from math import comb,isclose
import json,hashlib
root=Path(__file__).resolve().parents[2];actual=root/'analysis/round5/results.json';data=json.loads(actual.read_text())
def tail(n,h,p):
 if h<=0:return Fraction(1)
 if h>n:return Fraction(0)
 return sum((Fraction(comb(n,j))*p**j*(1-p)**(n-j) for j in range(h,n+1)),Fraction(0))
comparisons=[]
def check(name,a,b):
 b=float(b);assert isclose(a,b,rel_tol=1e-10,abs_tol=1e-14),(name,a,b)
 comparisons.append({'name':name,'absoluteError':abs(a-b),'relativeError':abs(a-b)/abs(b) if b else None})
for row in data['fullTails']:check('full-tail-'+str(row['h']),row['tail'],tail(100,row['h'],Fraction(1,4)))
for row in data['contaminationGrid']:
 n,h,m=row['n'],row['h'],row['m'];p=Fraction(1,row['k'])
 check(f'preselected-{h}-{m}',row['preselectedSubset']['tail'],tail(n-m,h-m,p))
 check(f'arbitrary-{h}-{m}',row['arbitraryOutcomeCorruption']['upperBound'],tail(n,h-m,p))
assert data['threshold']['h']==33
assert tail(100,33,Fraction(1,4))<=Fraction(1,20)<tail(100,32,Fraction(1,4))
for h,a in enumerate(data['leak']['sameQBinomialPmf']):check('q2over5-pmf-'+str(h),a,Fraction(comb(100,h))*Fraction(2,5)**h*Fraction(3,5)**(100-h))
result={'scope':'N100,K4 named contract only; separate underflow stress receipt governs wider API','scalarComparisons':len(comparisons),'exactThreshold':33,'maxAbsError':max(x['absoluteError']for x in comparisons),'maxRelativeError':max(x['relativeError']or 0 for x in comparisons),'resultsSha256':hashlib.sha256(actual.read_bytes()).hexdigest()}
(root/'panel/skeptic/round5-comparison.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))

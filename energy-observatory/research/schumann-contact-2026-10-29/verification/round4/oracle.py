#!/usr/bin/env python3
"""Independent exact integer orbit and rational matrix oracle."""
from fractions import Fraction
import json
import math
from pathlib import Path


def orbit(x,y,lags):
    n=len(x)
    if n!=len(y) or not lags or not all(type(v) is int for v in x+y+lags):
        raise ValueError('integer equal-length fixtures and nonempty lags required')
    a=[n*v-sum(x) for v in x];b=[n*v-sum(y) for v in y]
    den2=sum(v*v for v in a)*sum(v*v for v in b)
    if not den2:raise ValueError('constant series')
    den=math.sqrt(den2)
    dots=[abs(sum(a[i]*b[(i+s)%n] for i in range(n))) for s in range(n)]
    selected=[max(dots[(s+l)%n] for l in lags) for s in range(n)]
    fixedcounts=[sum(v>=d for v in dots) for d in dots]
    maxcounts=[sum(v>=d for v in selected) for d in selected]
    badcounts=[min(fixedcounts[(s+l)%n] for l in lags) for s in range(n)]
    rows=[dict(offset=s,fixedScore=dots[s]/den,maximumScore=selected[s]/den,
               fixedCount=fixedcounts[s],maximumCount=maxcounts[s],
               fixedP=fixedcounts[s]/n,maximumP=maxcounts[s]/n,
               invalidSelectedMinimumP=badcounts[s]/n) for s in range(n)]
    unique=sorted(set(dots));gaps=[(b-a)/den for a,b in zip(unique,unique[1:])]
    return {'groupSize':n,'rows':rows,'minimumNonzeroScoreGap':min(gaps) if gaps else None,
            'fixedRejectionCount':sum(c/n<=.05 for c in fixedcounts),
            'maximumRejectionCount':sum(c/n<=.05 for c in maxcounts),
            'invalidRejectionCount':sum(c/n<=.05 for c in badcounts),
            'floorBoundCount':math.floor(n*.05),'necessaryMinP':len(set(l%n for l in lags))/n}


def centered(values):
    avg=sum(Fraction(v) for v in values)/len(values)
    return [Fraction(v)-avg for v in values]


def rank(matrix):
    a=[[Fraction(v) for v in row] for row in matrix]
    m,n=len(a),len(a[0]);r=0
    for c in range(n):
        pivot=next((j for j in range(r,m) if a[j][c]),None)
        if pivot is None:continue
        a[r],a[pivot]=a[pivot],a[r]
        p=a[r][c];a[r]=[v/p for v in a[r]]
        for j in range(m):
            if j!=r:
                factor=a[j][c];a[j]=[a[j][k]-factor*a[r][k] for k in range(n)]
        r+=1
        if r==m:break
    return r


def matrix_case(z,u):
    n=len(z);x=z[:];xp=[a+b for a,b in zip(z,u)]
    c=centered(x);cz=centered(z);cp=centered(xp)
    original=[list(v) for v in zip(c,cz)]
    duplicate=[list(v) for v in zip(c,c,cz)]
    intervention=[list(v) for v in zip(cp,cz)]
    gram00=sum(v*v for v in cp);gram11=sum(v*v for v in cz);gram01=sum(a*b for a,b in zip(cp,cz))
    determinant=gram00*gram11-gram01*gram01
    assert all(row[0]-row[1]==0 for row in original)
    assert all(row[0]-row[1]==0 and row[0]-row[2]==0 for row in duplicate)
    assert rank(original)==1 and rank(duplicate)==1 and rank(intervention)==2 and determinant>0
    serial=lambda a:[[float(v) for v in row] for row in a]
    return {'z':z,'u':u,'x':x,'xPerturbed':xp,'yDirect':[2*v for v in x],
            'yCommon':[2*v for v in z],'yDirectIntervention':[2*v for v in xp],
            'yCommonIntervention':[2*v for v in z],'predictionDifference':[2*v for v in u],
            'original':{'matrix':serial(original),'rows':n,'columns':2,'rank':1,'nullity':1,'kernel':[[1,-1]]},
            'duplicate':{'matrix':serial(duplicate),'rows':n,'columns':3,'rank':1,'nullity':2,'kernel':[[1,-1,0],[1,0,-1]]},
            'intervention':{'matrix':serial(intervention),'rows':n,'columns':2,'rank':2,'nullity':0,
                            'gramDeterminant':float(determinant),'exactGramDeterminant':str(determinant)}}


def main():
    x=[((19*i*i+7*i+11)%263)-131 for i in range(256)]
    y=[((13*i*i*i+17*i+5)%269)-134 for i in range(256)]
    cases=[]
    for label,b in [('identical',x),('distinct',y)]:
        for family,lags in [('seven',list(range(-3,4))),('all',list(range(256)))]:
            e=orbit(x,b,lags)
            assert e['fixedRejectionCount']<=12 and e['maximumRejectionCount']<=12
            if family=='all':assert all(row['maximumP']==1 for row in e['rows'])
            cases.append({'id':label+'_'+family,'x':x,'y':b,'lags':lags,'expected':e})
    matrices=[{'id':'contract_five_rows','expected':matrix_case([-2,-1,0,1,2],[1,0,-1,0,1])},
              {'id':'independent_four_rows','expected':matrix_case([-3,0,2,5],[2,-1,0,1])}]
    output={'schema':'r4-independent-orbit-matrix-oracle-v1','scoreTolerance':1e-11,
            'matrixTolerance':1e-10,'oracleRank':'exact rational row reduction',
            'oracleOrbitRanking':'exact centered integer dot products','cases':cases,'matrices':matrices,
            'scope':'synthetic conditional offset benchmark and synthetic intervention; no empirical source attribution'}
    Path(__file__).with_name('fixtures.json').write_text(json.dumps(output,indent=2,allow_nan=False)+'\n')


if __name__=='__main__':main()

#!/usr/bin/env python3
"""Exact-rational binomial and contamination calculations, independently written."""
from fractions import Fraction
from math import comb
import json
from pathlib import Path


def tail(n,p,h):
    if type(n) is not int or n<0 or type(h) is not int or not 0<=p<=1:
        raise ValueError('invalid binomial parameter')
    if h<=0:return Fraction(1)
    if h>n:return Fraction(0)
    a,b=p.numerator,p.denominator
    return Fraction(sum(comb(n,k)*a**k*(b-a)**(n-k) for k in range(h,n+1)),b**n)


def threshold(n,p,alpha=Fraction(1,20)):
    return next((h for h in range(n+1) if tail(n,p,h)<=alpha),None)


def emit(v):
    return {'numerator':str(v.numerator),'denominator':str(v.denominator),
            'value':float(v),'positiveBelowFloatRange':v>0 and float(v)==0.0}


def main():
    tests=[]
    for n,k,hs in [(100,4,[0,25,30,35,40,50,100]),(0,4,[0]),(1,2,[0,1]),
                   (8,3,list(range(9))),(12,2,[0,6,9,10,12]),
                   (1000,4,[250,500,1000])]:
        p=Fraction(1,k)
        for h in hs:
            tests.append({'id':f'n{n}_k{k}_h{h}','n':n,'k':k,'h':h,'expected':emit(tail(n,p,h))})
    thresholds=[{'n':n,'k':k,'alphaNumerator':1,'alphaDenominator':20,'expected':threshold(n,Fraction(1,k))}
                for n,k in [(0,4),(1,2),(8,3),(12,2),(100,4)]]
    contaminants=[]
    for h in [0,25,30,35,40,50,100]:
        for m in [0,5,10,20,100]:
            a=tail(100-m,Fraction(1,4),h-m)
            b=tail(100,Fraction(1,4),h-m)
            assert a<=b
            contaminants.append({'n':100,'k':4,'h':h,'m':m,
                                 'fixedSubset':emit(a),'postOutcomeBound':emit(b)})
    degenerate=[{'n':0,'k':4,'h':0,'m':0,'fixedSubset':emit(Fraction(1)),'postOutcomeBound':emit(Fraction(1))},
                {'n':8,'k':3,'h':5,'m':8,'fixedSubset':emit(Fraction(1)),'postOutcomeBound':emit(Fraction(1))}]
    epsilon=Fraction(1,5);q=epsilon+(1-epsilon)*Fraction(1,4)
    mass=[Fraction(comb(100,h))*q**h*(1-q)**(100-h) for h in range(101)]
    assert sum(mass)==1 and q==Fraction(2,5)
    leak={'n':100,'k':4,'epsilon':0.2,'epsilonExact':'1/5','q':emit(q),
          'likelihoodIdentity':'Any independent Bernoulli hit model with identical q has identical hit-count law',
          'pmf':[emit(v) for v in mass],
          'tails':[{'h':h,'expected':emit(tail(100,q,h))} for h in [0,25,30,35,40,50,100]]}
    invalid=[{'id':'negative_n','patch':{'n':-1}}, {'id':'fractional_n','patch':{'n':3.5}},
             {'id':'k_one','patch':{'k':1}},{'id':'fractional_k','patch':{'k':2.5}},
             {'id':'fractional_h','patch':{'h':2.5}},{'id':'negative_observed_h','patch':{'h':-1}},
             {'id':'observed_h_over_n','patch':{'h':101}},
             {'id':'negative_m','patch':{'m':-1}},{'id':'fractional_m','patch':{'m':2.5}},
             {'id':'m_over_n','patch':{'m':101}}, {'id':'range_n1001','patch':{'n':1001}},
             {'id':'negative_epsilon','patch':{'epsilon':-0.1}},{'id':'epsilon_over_one','patch':{'epsilon':1.1}}]
    for key in ['n','k','h','m','epsilon']:
        for value in ['NaN','Infinity','-Infinity']:
            invalid.append({'id':key+'_'+value,'special':{'field':key,'value':value}})
    output={'schema':'r5-independent-exact-binomial-v1','relativeTolerance':1e-10,'absoluteTolerance':1e-14,
            'tailCases':tests,'thresholdCases':thresholds,'contaminationCases':contaminants+degenerate,
            'leak':leak,'invalidCases':invalid,
            'tailConvention':'inclusive P(H>=h); effective h<=0 is1, h>n is0',
            'observationConvention':'observed integer h is within0..n; effective contamination thresholds may be negative',
            'scope':'conditional known-law probability benchmark, no human sessions'}
    Path(__file__).with_name('fixtures.json').write_text(json.dumps(output,indent=2,allow_nan=False)+'\n')


if __name__=='__main__':main()

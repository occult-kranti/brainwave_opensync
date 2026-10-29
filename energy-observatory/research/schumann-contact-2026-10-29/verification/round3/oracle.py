#!/usr/bin/env python3
"""Exact integer-dot ranking oracle for the conditional cyclic-offset null."""
import json
import math
from pathlib import Path


def oracle(x, y, lags):
    n = len(x)
    if n != len(y) or n < 2:
        raise ValueError('unequal or insufficient lengths')
    if not all(type(v) is int for v in x + y):
        raise ValueError('exact oracle requires integer fixture vectors')
    if not lags or not all(type(v) is int for v in lags):
        raise ValueError('nonempty integer lag set required')
    xc = [n * v - sum(x) for v in x]
    yc = [n * v - sum(y) for v in y]
    norm2 = sum(v*v for v in xc) * sum(v*v for v in yc)
    if norm2 == 0:
        raise ValueError('constant vector')
    denominator = math.sqrt(norm2)
    dots = [abs(sum(xc[i]*yc[(i+s) % n] for i in range(n))) for s in range(n)]
    maximums = [max(dots[(s+lag) % n] for lag in lags) for s in range(n)]
    fixed_counts = [sum(v >= d for v in dots) for d in dots]
    max_counts = [sum(v >= d for v in maximums) for d in maximums]
    selected_counts = [min(fixed_counts[(s+lag) % n] for lag in lags) for s in range(n)]
    # Integer dot ranking avoids floating point comparisons entirely. Scores
    # are converted to floats only for agreement against the producer API.
    rows = [dict(offset=s, fixedScore=dots[s]/denominator,
                 selectedScore=maximums[s]/denominator,
                 fixedP=fixed_counts[s]/n, maximumP=max_counts[s]/n,
                 invalidSelectedMinimumP=selected_counts[s]/n,
                 fixedTailCount=fixed_counts[s], maximumTailCount=max_counts[s])
            for s in range(n)]
    distinct = sorted(set(dots))
    gaps = [(b-a)/denominator for a,b in zip(distinct,distinct[1:])]
    return dict(rows=rows, exactIntegerRanking=True,
                minimumNonzeroScoreGap=min(gaps) if gaps else None,
                fixedRejectionsAt005=sum(c/ n <= .05 for c in fixed_counts),
                maximumRejectionsAt005=sum(c/n <= .05 for c in max_counts),
                invalidSelectedMinimumRejectionsAt005=sum(c/n <= .05 for c in selected_counts),
                groupSize=n, levelBoundCount=math.floor(n * .05))


def main():
    x = [((i*i*11 + i*7 + 3) % 37) - 18 for i in range(32)]
    y = [((i*i*i*3 + i*13 + 17) % 41) - 20 for i in range(32)]
    alternating = [1 if i % 2 else -1 for i in range(32)]
    shapes = [('identical_integer_shape', x, x),
              ('distinct_integer_shapes', x, y),
              ('tied_periodic_shapes', alternating, alternating)]
    cases=[]
    for label, a, b in shapes:
        for family, lags in [('fixed',[0]), ('seven',list(range(-3,4))), ('all',list(range(32)))]:
            expected=oracle(a,b,lags)
            assert expected['fixedRejectionsAt005'] <= 1
            assert expected['maximumRejectionsAt005'] <= 1
            if family == 'all':
                assert all(row['maximumP'] == 1 for row in expected['rows'])
            cases.append(dict(id=label+'_'+family,x=a,y=b,lags=lags,expected=expected))
    invalid=[
        {'id':'constant_x','patch':{'x':[4]*32}},
        {'id':'constant_y','patch':{'y':[4]*32}},
        {'id':'unequal_lengths','patch':{'y':y[:-1]}},
        {'id':'empty_lags','patch':{'lags':[]}},
        {'id':'fractional_lag','patch':{'lags':[0,0.5]}},
        {'id':'string_lag','patch':{'lags':[0,'1']}},
        {'id':'null_lag','patch':{'lags':[0,None]}},
    ]
    for target in ['x','y','lags']:
        for value in ['NaN','Infinity','-Infinity']:
            invalid.append({'id':target+'_'+value,'special':{'target':target,'index':0,'value':value}})
    output={'schema':'r3-independent-cyclic-integer-oracle-v1',
            'null':'relative offset uniform conditional on fixed shapes; 32-element cyclic group',
            'floating_score_tolerance':1e-11,'oracle_ties':'exact integer dot ranking',
            'producer_acceptable_tie_tolerance':1e-12,
            'cases':cases,'invalid_cases':invalid,'base':{'x':x,'y':y,'lags':list(range(-3,4))}}
    Path(__file__).with_name('fixtures.json').write_text(json.dumps(output,indent=2,allow_nan=False)+'\n')


if __name__=='__main__':main()

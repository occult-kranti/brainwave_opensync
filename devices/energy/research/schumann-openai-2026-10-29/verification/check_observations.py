#!/usr/bin/env python3
"""Independent saved-packet validation; no network and no Schumann inference."""
from __future__ import annotations
from collections import defaultdict
from datetime import datetime, timedelta, timezone
import hashlib
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / 'panel' / 'observations'
UTC = timezone.utc
START = datetime(2026, 10, 23, tzinfo=UTC)
SHORT_START = datetime(2026, 10, 27, tzinfo=UTC)
STOP = datetime(2026, 10, 30, tzinfo=UTC)
H3 = timedelta(hours=3)

def stamp(value, allow_unqualified=False):
    x = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if x.tzinfo is None:
        if not allow_unqualified:
            raise ValueError('Timestamp lacks timezone')
        x = x.replace(tzinfo=UTC)
    return x.astimezone(UTC)

def iso(x):
    return x.isoformat().replace('+00:00', 'Z')

def validate(rows):
    previous = None
    for t, kp in rows:
        if previous is not None and t <= previous:
            raise ValueError('Non-increasing or duplicate timestamp')
        if not math.isfinite(kp) or not 0 <= kp <= 9:
            raise ValueError('Invalid Kp')
        previous = t

def summarize(rows, retrieval, start):
    validate(rows)
    window = [(t,k) for t,k in rows if start <= t < STOP]
    complete = [(t,k) for t,k in window if t+H3 <= retrieval]
    incomplete = [(t,k) for t,k in window if t+H3 > retrieval]
    if not complete:
        raise ValueError('No completed observations in requested interval')
    daily = defaultdict(list)
    for t,k in complete:
        daily[t.date().isoformat()].append(k)
    gaps = []
    for (a,_),(b,_) in zip(complete, complete[1:]):
        if b-a != H3:
            gaps.append({'after':iso(a),'before':iso(b),'seconds':(b-a).total_seconds()})
    return {
        'requested_start_utc':iso(start), 'requested_stop_exclusive_utc':iso(STOP),
        'raw_count':len(rows), 'in_window_count':len(window),
        'completed_count':len(complete), 'excluded_open_or_future_count':len(incomplete),
        'excluded_open_or_future_start_utc':[iso(t) for t,_ in incomplete],
        'coverage_start_utc':iso(complete[0][0]),
        'coverage_end_exclusive_utc':iso(complete[-1][0]+H3),
        'maximum_completed_kp':max(k for _,k in complete),
        'completed_bins_at_or_above_5':sum(k>=5 for _,k in complete),
        'daily':[{'date_utc':date,'completed_bins':len(values),'maximum_kp':max(values),
                  'full_utc_day':len(values)==8} for date,values in sorted(daily.items())],
        'gaps_between_completed_bins':gaps,
        'schumann_anomaly_inference':False,
    }

def main():
    manifests = json.loads((SOURCE/'download-manifest.json').read_text())
    gfz_manifest = json.loads((SOURCE/'gfz-download.json').read_text())
    manifests.append(gfz_manifest)
    bindings=[]
    for m in manifests:
        raw=(SOURCE/m['file']).read_bytes()
        digest=hashlib.sha256(raw).hexdigest()
        assert digest==m['sha256'], m['file']
        assert len(raw)==m['bytes'], m['file']
        bindings.append({'file':m['file'],'sha256':digest,'bytes':len(raw),
                         'url':m['url'],'retrieved_utc':m['retrieved_utc']})
    noaa=json.loads((SOURCE/'noaa-kp.json').read_text())
    gfz=json.loads((SOURCE/'gfz-kp.json').read_text())
    assert len(gfz['datetime'])==len(gfz['Kp'])==len(gfz['status'])
    datasets={
        'NOAA_estimated': ([(stamp(x['time_tag'],True),float(x['Kp'])) for x in noaa],
                           stamp(manifests[0]['retrieved_utc'])),
        'GFZ_preliminary': ([(stamp(t),float(k)) for t,k in zip(gfz['datetime'],gfz['Kp'])],
                            stamp(gfz_manifest['retrieved_utc']))
    }
    summaries={name:{'seven_calendar_dates':summarize(rows,ret,START),
                     'three_calendar_dates':summarize(rows,ret,SHORT_START),
                     'retrieved_utc':iso(ret)} for name,(rows,ret) in datasets.items()}
    # These tests mutate synthetic validator inputs, never source files.
    negative_controls=[]
    for label,rows in [('duplicate',[(START,1),(START,2)]),
                       ('negative_kp',[(START,-.01)]),
                       ('large_kp',[(START,9.01)]),
                       ('stale_no_window',[(START-timedelta(days=20),1)])]:
        try:
            summarize(rows,START+timedelta(days=1),START)
        except ValueError:
            negative_controls.append({'name':label,'rejected':True})
        else:
            raise AssertionError(label+' accepted')
    edge=summarize([(START,1),(START+H3,2)],START+H3,START)
    assert edge['completed_count']==1 and edge['excluded_open_or_future_count']==1
    negative_controls.append({'name':'open_bin_excluded_and_end_equal_retained','passed':True})
    noaa_map=dict(datasets['NOAA_estimated'][0]); gfz_map=dict(datasets['GFZ_preliminary'][0])
    shared=sorted(t for t in noaa_map.keys()&gfz_map.keys()
                  if START<=t and t+H3<=min(x[1] for x in datasets.values()))
    max_difference=max(abs(noaa_map[t]-gfz_map[t]) for t in shared)
    out={'schema':'schumann-observation-verifier/1','status':'pass',
         'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
         'source_bindings':bindings,'summaries':summaries,
         'cross_provider':{'shared_completed_bins':len(shared),
                           'maximum_absolute_kp_difference':max_difference,
                           'equality_required':False,
                           'scope':'Different estimated/preliminary products; not independent Schumann evidence.'},
         'negative_controls':negative_controls,
         'limitations':['Timestamped saved responses, not independent upstream instrument calibration.',
                        'All reported GFZ records are preliminary; NOAA records are estimates.',
                        'October 29 is incomplete; absence of Kp>=5 does not rule out local or Schumann events.',
                        'No calibrated multi-day Schumann spectrum is supplied or analyzed.']}
    (HERE/'observation-checks.json').write_text(json.dumps(out,indent=2)+'\n')
    print(json.dumps({'status':out['status'],'summaries':summaries,
                      'cross_provider':out['cross_provider'],'negative_controls':negative_controls},indent=2))

if __name__=='__main__':
    main()

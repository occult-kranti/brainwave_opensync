#!/usr/bin/env python3
"""Check bound artifacts, then replay only this study in an isolated copy."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

HERE=Path(__file__).resolve().parent
SITE=HERE.parent.parent

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    receipt=json.loads((HERE/'receipt.json').read_text())
    assert receipt['status']=='accepted-scoped' and receipt['rounds']==6
    assert receipt['panelReports']==24 and receipt['newPhysicalMeasurements']==0
    assert receipt['etContactEstablished'] is False
    for name,digest in receipt['files'].items():
        p=(SITE/name).resolve()
        assert p.is_relative_to(SITE),name
        assert hashlib.sha256(p.read_bytes()).hexdigest()==digest,name
    for number in range(1,7):
        assert (HERE/'rounds'/f'round{number}-decision.md').is_file()
        for role in ['history','geophysics','channeling','skeptic']:
            assert (HERE/'panel'/role/f'round{number}.md').is_file()
    replays=[]
    with tempfile.TemporaryDirectory(prefix='contact-release-') as temp:
        study=Path(temp)/HERE.name
        shutil.copytree(HERE,study,ignore=shutil.ignore_patterns('__pycache__','*.pyc'))
        for n in range(2,7):
            for role,cmd in [('producer',['node',f'analysis/round{n}/run.mjs']),('verifier',['python3','-B',f'verification/round{n}/check.py'])]:
                result=subprocess.run(cmd,cwd=study,text=True,capture_output=True,timeout=120)
                assert result.returncode==0,f'{n}/{role}: {result.stdout[-1800:]} {result.stderr[-1800:]}'
                replays.append({'round':n,'role':role,'exitCode':result.returncode,'output':result.stdout.strip()[-2200:]})
    report={'status':'PASS','filesBound':len(receipt['files']),'rounds':6,'panelReports':24,'isolatedReplays':replays,'scope':'Artifact identity, executed synthetic methods and metadata gates; no physical or contact validation.'}
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'status':'PASS','filesBound':len(receipt['files']),'rounds':6,'panelReports':24,'replays':len(replays)}))

if __name__=='__main__':main()

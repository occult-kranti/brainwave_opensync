#!/usr/bin/env python3
"""Targeted R3 empty-manifest control, isolated in a disposable copy."""
import ast
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

HERE=Path(__file__).resolve().parent
DOSSIER=HERE.parents[1]
ROOT=HERE.parents[3]
with tempfile.TemporaryDirectory(prefix='e1-empty-manifest-control-') as tmp:
    work=Path(tmp)
    dossier=work/'research/dephasing-work-bound'
    shutil.copytree(DOSSIER,dossier,ignore=shutil.ignore_patterns('__pycache__'))
    # Synthetic admission only in the disposable fixture isolates the manifest
    # guard; these placeholders do not constitute an approved real release.
    summary=json.loads((dossier/'summary.json').read_text())
    summary['accepted']=True
    (dossier/'summary.json').write_text(json.dumps(summary))
    for role in ('proof','verification','sources','physics','workflow','skeptic'):
        target=dossier/f'panel/{role}/round3.md'
        if not target.exists():
            target.write_text('Synthetic placeholder for isolated manifest-guard test.\n')
    (dossier/'receipt.json').write_text(json.dumps({'status':'accepted','sourceHashes':{}}))
    run=subprocess.run(['python3','-B',str(dossier/'check_release.py')],
                       cwd=work,text=True,capture_output=True)
    marker='AssertionError: Receipt omits required sources: '
    assert run.returncode!=0 and marker in run.stderr,run.stderr
    missing=ast.literal_eval(run.stderr.split(marker,1)[1].strip())
    assert 'src/dephasing-bound.mjs' in missing
    assert 'research/dephasing-work-bound/panel/verification/compare_producer.py' in missing
    assert len([p for p in missing if p.endswith(('/round1.md','/round2.md','/round3.md'))])==18
    result={'status':'PASS','control':'accepted empty source manifest must fail before numerical replay',
            'gate_exit_code':run.returncode,'required_paths_missing':len(missing),
            'required_report_paths_missing':18,'guard_message':'Receipt omits required sources',
            'source_sha256':{
                str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest()
                for p in (DOSSIER/'check_release.py',Path(__file__))}}
    print(json.dumps(result,indent=2,sort_keys=True))

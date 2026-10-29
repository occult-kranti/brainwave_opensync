#!/usr/bin/env python3
import hashlib
import json
import math
from pathlib import Path
import platform
import subprocess

HERE = Path(__file__).resolve().parent
fixture = json.loads((HERE / 'fixtures.json').read_text())
result = subprocess.run(['node', str(HERE / 'bridge.mjs')], check=True, capture_output=True, text=True)
actual = json.loads(result.stdout)
assert len(actual['valid']) == len(fixture['valid_cases'])
assert len(actual['invalid']) == len(fixture['invalid_cases'])
failures, comparisons, max_relative_error = [], 0, 0.0
for expected, obtained in zip(fixture['valid_cases'], actual['valid']):
    assert expected['id'] == obtained['id']
    for key, target in expected['expected'].items():
        value = obtained['actual'][key]
        comparisons += 1
        if target is None or isinstance(target, str):
            ok = value == target
        else:
            ok = isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)
            if ok:
                delta = abs(value - target)
                tolerance = fixture['absolute_zero_tolerance'] if target == 0 else fixture['relative_tolerance'] * abs(target)
                ok = delta <= tolerance
                if target != 0:
                    max_relative_error = max(max_relative_error, delta / abs(target))
        if not ok:
            failures.append({'id': expected['id'], 'field': key, 'expected': target, 'actual': value})
for expected, obtained in zip(fixture['invalid_cases'], actual['invalid']):
    assert expected['id'] == obtained['id']
    comparisons += 1
    if not obtained['rejected']:
        failures.append({'id': expected['id'], 'expected': 'reject', 'actual': 'accepted'})
inputs = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in [
    HERE / 'oracle.py', HERE / 'fixtures.json', HERE / 'bridge.mjs',
    HERE / '../../analysis/round2/model.mjs', HERE / '../../rounds/round2-contract.md']}
report = {'status': 'PASS' if not failures else 'FAIL', 'independent_valid_cases': len(actual['valid']),
          'independent_invalid_cases': len(actual['invalid']), 'comparisons': comparisons,
          'max_relative_error': max_relative_error, 'failures': failures, 'inputs_sha256': inputs,
          'runtime': {'python': platform.python_version(), 'node': subprocess.check_output(['node','--version'], text=True).strip()},
          'scope': 'finite synthetic fixture agreement under ideal receiver model; no physical/contact/biological validation'}
(HERE / 'comparison.json').write_text(json.dumps(report, indent=2, allow_nan=False) + '\n')
print(json.dumps({k: report[k] for k in ['status','independent_valid_cases','independent_invalid_cases','comparisons','max_relative_error']}))
raise SystemExit(bool(failures))

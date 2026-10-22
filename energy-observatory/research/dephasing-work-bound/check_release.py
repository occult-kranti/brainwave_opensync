#!/usr/bin/env python3
"""Replay E1 evidence on a temporary source copy; never rewrite frozen receipts."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]
DOSSIER = ROOT / 'research/dephasing-work-bound'
ROLES = ['proof', 'verification', 'sources', 'physics', 'workflow', 'skeptic']

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    summary = json.loads((DOSSIER / 'summary.json').read_text())
    assert summary['accepted'] is True, 'The advisor has not admitted this release'
    assert summary['physicalMeasurements'] == 0
    assert (summary['specialistAgents'], summary['dedicatedWorkers'], summary['researchRounds']) == (6, 2, 3)
    for role in ROLES:
        for round_id in range(1, 4):
            assert (DOSSIER / f'panel/{role}/round{round_id}.md').is_file()
    for round_id in [1, 2]:
        decision = json.loads((DOSSIER / f'rounds/round{round_id}-decision.json').read_text())
        assert set(decision['reports']) == set(ROLES)
        for report in decision['reports'].values():
            assert digest(DOSSIER / report['path']) == report['sha256'], report['path']
    receipt = json.loads((DOSSIER / 'receipt.json').read_text())
    assert receipt['status'] == 'accepted', 'Final source receipt is not admitted'
    prefix = 'research/dephasing-work-bound/'
    required = {
        'src/dephasing-bound.mjs', 'src/dephasing-ui.mjs', 'src/dephasing.css',
        'dephasing-page.mjs', 'site.mjs', 'build.mjs',
        *[prefix + p for p in ['contract.md', 'proof.md', 'summary.json', 'network.json',
                              'advisor.md', 'check_release.py',
                              'rounds/round1-decision.json', 'rounds/round2-decision.json',
                              'panel/proof/check-round1.mjs',
                              'panel/verification/check_independent.py',
                              'panel/verification/compare_producer.py',
                              'panel/verification/producer_bridge.mjs',
                              'panel/skeptic/check_skeptic.py',
                              'panel/skeptic/controls.json',
                              'panel/physics/round2-controls.mjs',
                              'panel/physics/round3-ui-controls.mjs']],
        *[prefix + f'panel/{role}/round{n}.md' for role in ROLES for n in [1, 2, 3]],
    }
    missing = required - set(receipt['sourceHashes'])
    assert not missing, f'Receipt omits required sources: {sorted(missing)}'
    for path, expected in receipt['sourceHashes'].items():
        assert digest(ROOT / path) == expected, f'Source receipt mismatch: {path}'
    graph = json.loads((DOSSIER / 'network.json').read_text())
    ids = {n['id'] for n in graph['nodes']}
    assert len(ids) == len(graph['nodes'])
    for n in graph['nodes']:
        if not n['href'].startswith('https://') and not n['href'].endswith('.html'):
            assert (ROOT / n['href']).is_file(), n['href']
    for edge in graph['edges']:
        assert edge['source'] in ids and edge['target'] in ids and edge['scope']
    commands = {
        'producer': ['node', 'research/dephasing-work-bound/panel/proof/check-round1.mjs'],
        'independent': ['python3', '-B', 'research/dephasing-work-bound/panel/verification/check_independent.py'],
        'comparison': ['python3', '-B', 'research/dephasing-work-bound/panel/verification/compare_producer.py'],
        'skeptic': ['python3', '-B', 'research/dephasing-work-bound/panel/skeptic/check_skeptic.py'],
        'physics': ['node', 'research/dephasing-work-bound/panel/physics/round2-controls.mjs'],
        'ui-boundaries': ['node', 'research/dephasing-work-bound/panel/physics/round3-ui-controls.mjs'],
    }
    checks = {}
    with tempfile.TemporaryDirectory(prefix='e1-replay-') as tmp:
        work = Path(tmp)
        shutil.copytree(DOSSIER, work / 'research/dephasing-work-bound', ignore=shutil.ignore_patterns('__pycache__'))
        (work / 'src').mkdir()
        for path in ['src/dephasing-bound.mjs', 'src/dephasing-ui.mjs', 'dephasing-page.mjs']:
            shutil.copy2(ROOT / path, work / path)
        for name, command in commands.items():
            run = subprocess.run(command, cwd=work, text=True, capture_output=True, timeout=120)
            assert run.returncode == 0, f'{name}: {run.stderr or run.stdout}'
            value = json.loads(run.stdout)
            assert value.get('status', '').lower() in ['pass', 'passed'] or value.get('passed') is True, name
            checks[name] = {'command': ' '.join(command), 'exitCode': run.returncode,
                            'result': value, 'stdoutSha256': hashlib.sha256(run.stdout.encode()).hexdigest()}
    result = {'schema': 'e1-release-replay/1', 'status': 'PASS', 'reports': 18,
              'sourceHashCount': len(receipt['sourceHashes']), 'checks': checks,
              'scope': 'Replayed finite implementation checks and record integrity; analytic proof is separately reviewed. No hardware or proof-assistant execution.'}
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'status': 'PASS', 'reports': 18, 'executed': list(checks), 'output': str(args.output) if args.output else None}))

if __name__ == '__main__':
    main()

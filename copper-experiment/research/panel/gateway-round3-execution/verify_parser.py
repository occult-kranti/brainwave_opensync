#!/usr/bin/env python3
"""Run the concrete Gateway inventory/parser regression fixtures (no network)."""
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile

BASE = Path(__file__).parent
SCRIPT = Path('/workspace/scratch/c230cc629529/sphere-lab-repo/copper-experiment/skills/gateway-evidence-audit/scripts/audit_corpus.py')
CANONICAL = Path('/root/.codex/skills/remote-skills/skill-6ad97178dff48191830dac4cb3b89446')
REAL = Path('/workspace/scratch/c230cc629529/gateway-review')
PIN = '075bbab71bd4c83946fac1c3180dbc9460ce32d2'
results = []


def run(name, repo, expected_ok, extra=()):
    result = subprocess.run(['python', str(SCRIPT), str(repo), *extra], text=True, capture_output=True)
    record = {'name': name, 'expected_ok': expected_ok, 'exit_code': result.returncode,
              'error': result.stderr.strip(), 'assertion_pass': (result.returncode == 0) == expected_ok}
    if result.returncode == 0:
        data = json.loads(result.stdout)
        record['returned'] = {'schema': data['schema'], 'fileCount': data['trackedFileCount'],
                              'totalBytes': data['totalBytes'], 'presetSummary': data['presetSummary'],
                              'presetArithmetic': data['presetArithmetic'],
                              'presetConstructions': data['presetConstructions']}
        if name == 'actual_pinned_corpus':
            assert data['trackedFileCount'] == 10 and data['totalBytes'] == 48846
            assert data['presetSummary'] == {'recordCount': 7, 'carrierPairArithmeticCount': 5,
                                              'nonCarrierPairCount': 2, 'unclassifiedCount': 0}
            assert len(data['presetArithmetic']) == 5 and all(x['arithmeticMatches'] for x in data['presetArithmetic'])
            assert [x['kind'] for x in data['presetConstructions']].count('pulse-train') == 1
            assert [x['kind'] for x in data['presetConstructions']].count('noise') == 1
            assert not data['indexHtmlPresent'] and data['audioFilesPresent'] == [] and data['pdfFilesPresent'] == []
        if name == 'symlink_not_followed':
            link = next(x for x in data['files'] if x['path'] == 'outside.md')
            assert link['bytes'] == 11 and link['status'] == 'symlink-target-text-only; not-followed'
    results.append(record)
    assert record['assertion_pass'], record


run('actual_pinned_corpus', REAL, True, ['--expect-commit', PIN])
run('wrong_pin', REAL, False, ['--expect-commit', '0'*40])
run('not_git_repository', BASE, False)
fixtures = {
    'not_list': ('{"id":"x"}', False),
    'not_object': ('[1]', False),
    'malformed_json': ('[{', False),
    'negative_carrier': ('[{"id":"neg","carriers":"-200 / 204 Hz","beat":"4 Hz"}]', False),
    'negative_beat': ('[{"id":"neg","carriers":"200 / 204 Hz","beat":"-4 Hz"}]', False),
    'zero_carrier': ('[{"id":"zero","carriers":"0 / 4 Hz","beat":"4 Hz"}]', False),
    'missing_fields': ('[{"id":"incomplete"}]', False),
    'numeric_typed_field': ('[{"id":"typed","carriers":200,"beat":"4 Hz"}]', False),
    'nonfinite_tokens': ('[{"id":"nan","carriers":NaN,"beat":Infinity}]', False),
    'nonfinite_unrelated_field': ('[{"id":"nan","carriers":"200 / 204 Hz","beat":"4 Hz","extra":NaN}]', False),
    'overflow_nested_numeric_token': ('[{"id":"overflow","carriers":"200 / 204 Hz","beat":"4 Hz","extra":{"nested":[1e400]}}]', False),
    'duplicate_keys': ('[{"id":"dupkey","carriers":"200 / 204 Hz","carriers":"200 / 210 Hz","beat":"10 Hz"}]', False),
    'duplicate_ids': ('[{"id":"same","carriers":"200 / 204 Hz","beat":"4 Hz"},{"id":"same","carriers":"200 / 210 Hz","beat":"10 Hz"}]', False),
    'arithmetic_mismatch': ('[{"id":"mismatch","carriers":"200 / 204 Hz","beat":"40 Hz"}]', False),
    'overflow': ('[{"id":"huge","carriers":"'+'9'*400+' / 204 Hz","beat":"4 Hz"}]', False),
    'unknown_format': ('[{"id":"unknown","carriers":"special energy","beat":"4 Hz"}]', False),
    'invalid_pulse_rate': ('[{"id":"pulse","carriers":"1 kHz pulses","beat":"-40 Hz rate"}]', False),
    'invalid_noise_beat': ('[{"id":"noise","carriers":"broadband","beat":"4 Hz"}]', False),
    'valid_reverse_carriers': ('[{"id":"reversed","carriers":"204 / 200 Hz","beat":"4 Hz"}]', True),
    'valid_pulse_noise': ('[{"id":"pulse","carriers":"1 kHz pulses","beat":"40 Hz rate"},{"id":"noise","carriers":"broadband","beat":"—"}]', True),
}
with tempfile.TemporaryDirectory(prefix='gateway-audit-fixed-') as directory:
    temp = Path(directory)
    for name, (payload, expected_ok) in fixtures.items():
        repo = temp/name
        (repo/'files/audio').mkdir(parents=True)
        (repo/'files/audio/presets.json').write_text(payload)
        subprocess.run(['git', 'init', '-q', str(repo)], check=True)
        subprocess.run(['git', '-C', str(repo), 'add', '.'], check=True)
        subprocess.run(['git', '-C', str(repo), '-c', 'user.name=Gateway audit fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'regression fixture'], check=True)
        run(name, repo, expected_ok)
    repo = temp/'symlink'
    repo.mkdir()
    (repo/'outside.md').symlink_to('/etc/passwd')
    (repo/'README.md').write_text('fixture\n')
    subprocess.run(['git', 'init', '-q', str(repo)], check=True)
    subprocess.run(['git', '-C', str(repo), 'add', '.'], check=True)
    subprocess.run(['git', '-C', str(repo), '-c', 'user.name=Gateway audit fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'symlink fixture'], check=True)
    run('symlink_not_followed', repo, True)
    existing = temp/'existing.json'
    existing.write_text('existing output\n')
    before = existing.read_bytes()
    run('output_already_exists', REAL, False, ['--output', str(existing)])
    assert existing.read_bytes() == before

for relative in ['SKILL.md', 'scripts/audit_corpus.py', 'references/evidence-contract.md', 'references/source-leads.md']:
    assert (CANONICAL/relative).read_bytes() == (SCRIPT.parent.parent/relative).read_bytes(), relative
report = {'script_sha256': hashlib.sha256(SCRIPT.read_bytes()).hexdigest(),
          'skill_sha256': hashlib.sha256((SCRIPT.parent.parent/'SKILL.md').read_bytes()).hexdigest(),
          'canonical_and_app_script_skill_and_references_identical': True,
          'canonical_service_metadata_note': 'agents/openai.yaml has service-added icons/policy; three human interface fields are semantically unchanged; not a script/source mismatch', 'case_count': len(results),
          'all_assertions_pass': True, 'results': results}
(BASE/'parser-fixed-results.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps({k: v for k, v in report.items() if k != 'results'}))

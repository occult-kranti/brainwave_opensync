#!/usr/bin/env python3
"""Import the exact 22-file Claude change without merging unrelated repository roots."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys

PIN = 'e628974ba018c775da41de304bd55afafd16b426'
ROOT = Path(__file__).resolve().parents[1]


def main():
    upstream = Path(sys.argv[1]).resolve()
    def git(*args):
        return subprocess.check_output(['git', '-C', str(upstream), *args])
    assert git('rev-parse', PIN).decode().strip() == PIN
    paths = git('diff-tree', '--no-commit-id', '--name-only', '-r', PIN).decode().splitlines()
    assert len(paths) == 22
    paths += ['LICENSE']
    target = ROOT / 'imports/bashar-index-e628974'
    originals = []
    for name in paths:
        data = git('show', f'{PIN}:{name}')
        file = target / name
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_bytes(data)
        originals.append({'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    viewer = ROOT / 'public/experiments/frequency-of-place'
    viewer.mkdir(parents=True, exist_ok=True)
    for file in (target / 'experiments/frequency-of-place').iterdir():
        (viewer / file.name).write_bytes(file.read_bytes())
    (viewer / 'LICENSE').write_bytes((target / 'LICENSE').read_bytes())
    original = (viewer / 'index.html').read_bytes()
    (viewer / 'original-index.html').write_bytes(original)
    page = original.decode()
    banner = '''<aside aria-label="Import review" style="background:#eeeae1;color:#183b35;padding:18px 24px;font:14px/1.6 Arial,sans-serif;border-bottom:2px solid #a64e2d"><strong>CLAUDE SOURCE SNAPSHOT · e628974</strong> · Numerical design, no physical measurements. Contact convergence, plate thickness and precision estimates have review limits. <a style="color:inherit;text-decoration:underline" href="../../comparison.html">Read the checked OpenSync comparison →</a> · <a style="color:inherit;text-decoration:underline" href="original-index.html">Exact original page</a></aside>'''
    import re
    page, count = re.subn(r'(<body\b[^>]*>)', lambda m: m.group(1) + banner, page, count=1)
    assert count == 1
    page = page.replace('href="../../index.html"', 'href="../../imports/bashar-index-e628974/index.html"')
    (viewer / 'index.html').write_text(page)
    record = {
        'schema': 'fieldwork-claude-import/1',
        'repository': 'https://github.com/occult-kranti/bashar-index',
        'branch': 'experiment-frequency-of-place', 'commit': PIN,
        'parent': git('rev-parse', PIN + '^').decode().strip(),
        'changedFiles': 22, 'additionalFiles': ['LICENSE'],
        'license': 'MIT; upstream copyright notice retained',
        'physicalMeasurements': 0, 'originals': originals,
        'viewer': {'path': 'experiments/frequency-of-place/index.html',
                   'sha256': hashlib.sha256(page.encode()).hexdigest(),
                   'changes': ['Add review banner with comparison and exact-original links',
                               'Point both Index links at the imported Bashar Index snapshot']},
        'scope': 'All 22 changed files plus the upstream LICENSE, preserved byte for byte. Original source claims are not automatically promoted into the reviewed evidence graph.'
    }
    (ROOT / 'imports/claude-source.json').write_text(json.dumps(record, indent=2) + '\n')
    print(f'Imported {len(originals)} source artifacts at {PIN[:7]}.')


if __name__ == '__main__':
    main()

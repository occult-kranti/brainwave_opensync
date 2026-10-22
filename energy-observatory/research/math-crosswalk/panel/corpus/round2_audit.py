"""Alternate-source census and documentary scope gate. No Lean execution.

This parser uses balanced TeX command arguments in overview.tex, independently
of Round 1's Markdown family-heading/paper-link regular expressions. Both are
authored by the same auditor, so this is algorithm/source-format independence,
not independent authorship. Scope records are manually reviewed annotations;
matching them verifies record consistency, not semantic equivalence or proofs.
"""
import argparse
import collections
import copy
import hashlib
import json
from pathlib import Path
import re
import yaml

COMMIT = '1581d4cbdd69a0faf34b2089614fe2a814316a6a'
HERE = Path(__file__).resolve().parent
DEFAULT_SNAPSHOT = Path('/workspace/scratch/f431d34f6f71/math-crosswalk-sources/openai')


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def braces(text, position):
    """Read one balanced argument, preserving TeX; skip escaped characters."""
    while position < len(text) and text[position].isspace():
        position += 1
    if position >= len(text) or text[position] != '{':
        raise ValueError('Expected braced argument')
    start = position + 1
    depth = 1
    position += 1
    while position < len(text):
        character = text[position]
        if character == '\\':
            position += 2
            continue
        if character == '{':
            depth += 1
        elif character == '}':
            depth -= 1
            if depth == 0:
                return text[start:position], position + 1
        position += 1
    raise ValueError('Unterminated argument')


def arguments(text, command, count, line_start=False):
    position = 0
    marker = '\\' + command
    while True:
        found = text.find(marker, position)
        if found < 0:
            return
        position = found + len(marker)
        if line_start and text[text.rfind('\n', 0, found) + 1:found].strip():
            continue
        values = []
        for _ in range(count):
            value, position = braces(text, position)
            values.append(value)
        yield found, values


def alternate_census(snapshot, frozen):
    text = (snapshot / 'overview.tex').read_text()
    entries = []
    for position, (family, title, description, links) in arguments(text, 'resultentry', 4, True):
        paths = []
        for _, (url, paper_title) in arguments(links, 'href', 2):
            prefix = 'https://github.com/openai/math/blob/main/'
            if not url.startswith(prefix + 'preprints/'):
                raise ValueError('Unexpected paper URL: ' + url)
            paths.append(url[len(prefix):])
        entries.append({'id': family, 'titleTex': title, 'paths': paths,
                        'overviewLine': text.count('\n', 0, position) + 1})
    by_id = {e['id']: e for e in entries}
    all_paths = [p for e in entries for p in e['paths']]
    assert len(by_id) == len(entries), 'Duplicate family ID'
    assert len(all_paths) == len(set(all_paths)), 'Duplicate manuscript'
    reference = {f['id']: {p['path'] for p in f['manuscripts']} for f in frozen['families']}
    mismatches = [fid for fid in set(reference) | set(by_id)
                  if reference.get(fid) != set(by_id.get(fid, {}).get('paths', []))]
    # Preserve the discovery instead of silently repairing Round 1's frozen bytes.
    # Its Markdown regex ended at the first ')' inside the literal CAT(0) path.
    assert mismatches == ['337'], mismatches
    errata = []
    for fid in mismatches:
        old = reference[fid] - set(by_id[fid]['paths'])
        new = set(by_id[fid]['paths']) - reference[fid]
        assert len(old) == len(new) == 1
        old_path, new_path = next(iter(old)), next(iter(new))
        assert old_path == 'preprints/Sharp-integral-fillings-in-CAT(0'
        assert new_path == 'preprints/Sharp-integral-fillings-in-CAT(0)-spaces-September-23-2026/paper.pdf'
        # Independently confirm the full link in original Markdown source as well.
        assert '](' + new_path + ')' in (snapshot / 'CONTENTS.md').read_text()
        errata.append({'family': fid, 'oldPath': old_path, 'correctedPath': new_path,
                       'cause': 'Round 1 regex truncated at a parenthesis inside a Markdown URL',
                       'effect': 'One manuscript URL corrected; no family/manuscript count change'})
    return {'source': 'overview.tex', 'algorithm': 'balanced TeX command argument scanner',
            'families': len(entries), 'manuscripts': len(all_paths),
            'highestFamilyIdentifier': max(map(int, by_id)),
            'absentIdentifiers': [f'{i:03}' for i in range(1, max(map(int, by_id)) + 1)
                                  if f'{i:03}' not in by_id],
            'allFamilyIdsMatchFrozenInventory': set(reference) == set(by_id),
            'allPaperPathSetsMatchFrozenInventory': not mismatches,
            'mismatches': mismatches, 'errata': errata, 'entries': entries}


def same_document_without_date(path):
    return re.sub(r'-(January|February|March|April|May|June|July|August|September|October|November|December)-\d{1,2}-\d{4}/', '-VERSION/', path)


def admit(request, record):
    """Check explicit documentary identity; absence never implies falsehood."""
    required = ('commit', 'family', 'paperPath', 'declaration', 'statement')
    dimensions = ('objects', 'domain', 'boundary', 'quantifiers', 'observable', 'limit', 'conclusion')
    missing = [key for key in required if request.get(key) is None]
    if isinstance(request.get('statement'), dict):
        missing += ['statement.' + key for key in dimensions
                    if request['statement'].get(key) is None]
    elif 'statement' not in missing:
        missing.append('statement dimensions')
    result = {'status': None, 'metadataAccepted': False, 'proofVerified': False,
              'leanExecuted': False, 'issues': [],
              'limit': 'Record matching only; manually annotated scope, no semantic theorem equivalence or proof execution.'}
    if missing:
        result.update(status='insufficient-evidence', issues=missing)
        return result
    for key in ('commit', 'family'):
        if request[key] != record[key]:
            result['issues'].append(key + '-mismatch')
    if request['paperPath'] != record['paperPath']:
        label = ('version-mismatch' if same_document_without_date(request['paperPath']) ==
                 same_document_without_date(record['paperPath']) else 'paper-mismatch')
        result['issues'].append(label)
    if request['declaration'] != record['declaration']:
        result['issues'].append('declaration-mismatch')
    for key in dimensions:
        if request['statement'][key] != record['statement'][key]:
            result['issues'].append('scope-mismatch:' + key)
    if result['issues']:
        result['status'] = 'metadata-match-rejected'
        return result
    result.update(status='metadata-accepted-not-proof-verified', metadataAccepted=True,
                  currentCataloguePath=record['currentCataloguePath'],
                  manifestDeclarationListed=record['manifestDeclarationListed'])
    return result


def verify_sources(snapshot):
    expected = json.loads((HERE / 'round2-git-expected.json').read_text())
    records = []
    for path, git_sha in sorted(expected.items()):
        data = (snapshot / path).read_bytes()
        actual = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        assert actual == git_sha, (path, actual, git_sha)
        records.append({'path': path, 'sha256': hashlib.sha256(data).hexdigest(),
                        'gitBlob': actual, 'bytes': len(data),
                        'url': f'https://github.com/openai/math/blob/{COMMIT}/{path}'})
    return records


def check_round1():
    freeze = json.loads((HERE / 'round1-freeze.json').read_text())
    for name, expected in freeze['files'].items():
        assert sha256(HERE / name) == expected, 'Round 1 changed: ' + name
    return {'unchanged': True, 'filesChecked': len(freeze['files']),
            'freezeSha256': sha256(HERE / 'round1-freeze.json')}


def run(snapshot, output):
    before = check_round1()
    frozen = json.loads((HERE / 'inventory.json').read_text())
    for source in frozen['sourceFiles']:
        assert sha256(snapshot / source['path']) == source['sha256'], source['path']
    census = alternate_census(snapshot, frozen)
    corrected = copy.deepcopy(frozen)
    for erratum in census['errata']:
        for family in corrected['families']:
            if family['id'] == erratum['family']:
                for paper in family['manuscripts']:
                    if paper['path'] == erratum['oldPath']:
                        paper['path'] = erratum['correctedPath']
                        paper['url'] = f'https://github.com/openai/math/blob/{COMMIT}/' + paper['path']
    corrected['round2Errata'] = census['errata']
    corrected['round2Status'] = 'Alternate TeX parser reconciled all 372 family IDs and 719 exact paper paths; metadata only.'
    all_corrected = {f['id']: {p['path'] for p in f['manuscripts']} for f in corrected['families']}
    assert all(all_corrected[e['id']] == set(e['paths']) for e in census['entries'])
    census['allPaperPathSetsMatchCorrectedInventory'] = True
    corrected_output = output.with_name('inventory-round2.json')
    corrected_output.write_text(json.dumps(corrected, ensure_ascii=False, indent=2) + '\n')
    records = json.loads((HERE / 'scope-records.json').read_text())['records']
    cases = json.loads((HERE / 'scope-controls.json').read_text())['cases']
    main_declarations = {r['declaration'] for r in yaml.safe_load(
        (snapshot / 'lean/formalization.yaml').read_text())['status']['main_results']}
    current_paths = {p['path'] for f in corrected['families'] for p in f['manuscripts']}
    yaml_sources = {s['id'].removeprefix('../') for s in yaml.safe_load(
        (snapshot / 'lean/formalization.yaml').read_text())['sources']}
    assert len(current_paths & yaml_sources) == frozen['counts']['yamlSourcePathsMatchedToCurrentCatalogue']
    census['yamlSourcePathsMatchedToCurrentCatalogueAfterCorrection'] = len(current_paths & yaml_sources)
    for record in records.values():
        config = json.loads((snapshot / record['comparatorConfig']).read_text())
        note = (snapshot / record['scopeNote']).read_text()
        challenge = (snapshot / record['comparatorStatement']).read_text()
        assert record['paperPath'] in note
        assert record['declaration'] in config['theorem_names']
        assert 'theorem ' + record['declaration'].rsplit('.', 1)[-1] in challenge
        assert record['currentCataloguePath'] == (record['paperPath'] in current_paths)
        assert record['manifestDeclarationListed'] == (record['declaration'] in main_declarations)
    tested = []
    for case in cases:
        request = copy.deepcopy(records[case['record']])
        for key, value in case.get('replace', {}).items():
            if key.startswith('statement.'):
                request['statement'][key.split('.', 1)[1]] = value
            else:
                request[key] = value
        for key in case.get('omit', []):
            if key.startswith('statement.'):
                del request['statement'][key.split('.', 1)[1]]
            else:
                del request[key]
        actual = admit(request, records[case['record']])
        assert actual['status'] == case['expectedStatus'], (case['id'], actual)
        assert actual['proofVerified'] is False and actual['leanExecuted'] is False
        for issue in case.get('expectedIssues', []):
            assert issue in actual['issues'], (case['id'], issue)
        tested.append({'id': case['id'], 'purpose': case['purpose'], 'expected': case['expectedStatus'],
                       'passed': True, 'actual': actual})
    result = {'schema': 'documentary-scope-audit/1', 'commit': COMMIT,
              'researchDate': '2026-10-21', 'hostRunDate': '2026-10-22',
              'round': 2, 'round1Before': before, 'census': census,
              'originalSnapshotFilesHashChecked': len(frozen['sourceFiles']),
              'correctedInventory': {'path': corrected_output.name, 'sha256': sha256(corrected_output)},
              'sources': verify_sources(snapshot), 'controls': tested,
              'controlCounts': dict(collections.Counter(x['actual']['status'] for x in tested)),
              'allControlsPassed': True, 'proofsExecuted': 0,
              'round1After': check_round1()}
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: result[k] for k in ('round', 'commit', 'controlCounts', 'allControlsPassed', 'proofsExecuted', 'round1After')}, indent=2))
    print(json.dumps({k: census[k] for k in ('families', 'manuscripts', 'highestFamilyIdentifier', 'absentIdentifiers', 'allFamilyIdsMatchFrozenInventory', 'allPaperPathSetsMatchFrozenInventory', 'allPaperPathSetsMatchCorrectedInventory', 'errata')}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--snapshot', type=Path, default=DEFAULT_SNAPSHOT)
    parser.add_argument('--output', type=Path, default=HERE / 'round2-results.json')
    args = parser.parse_args()
    run(args.snapshot, args.output)

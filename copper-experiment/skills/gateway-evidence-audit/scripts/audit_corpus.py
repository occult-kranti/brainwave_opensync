#!/usr/bin/env python3
"""Inventory committed Gateway-style source blobs, not missing media or effects."""
import argparse
import hashlib
import json
import math
import re
import subprocess
from pathlib import Path



def reject_duplicate_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f'Duplicate JSON key: {key}')
        result[key] = value
    return result


def reject_nonfinite_token(value):
    raise ValueError(f'Non-standard/non-finite JSON number: {value}')


def finite_json_float(raw):
    value = float(raw)
    if not math.isfinite(value):
        raise ValueError(f'JSON numeric token overflows finite float: {raw}')
    return value


def preset_metadata(payload):
    """Parse the documented legacy formats; never silently skip a record."""
    presets = json.loads(payload, object_pairs_hook=reject_duplicate_keys,
                         parse_constant=reject_nonfinite_token, parse_float=finite_json_float)
    if not isinstance(presets, list):
        raise ValueError('Preset metadata must be a list')
    checks, constructions, ids = [], [], set()
    number = r'(\d+(?:\.\d+)?)'

    def finite_number(raw, label, positive=True):
        value = float(raw)
        if not math.isfinite(value) or (value <= 0 if positive else value < 0):
            raise ValueError(f'{label} must be finite and {"positive" if positive else "nonnegative"}')
        return value

    for index, preset in enumerate(presets):
        if not isinstance(preset, dict):
            raise ValueError(f'Preset {index} must be an object')
        for field in ['id', 'carriers', 'beat']:
            if field not in preset or not isinstance(preset[field], str) or not preset[field].strip():
                raise ValueError(f'Preset {index}: {field} must be a nonempty string')
        identifier = preset['id']
        if identifier != identifier.strip() or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*', identifier):
            raise ValueError(f'Preset {index}: invalid id')
        if identifier in ids:
            raise ValueError(f'Duplicate preset id: {identifier}')
        ids.add(identifier)
        carriers, beat_text = preset['carriers'].strip(), preset['beat'].strip()
        pair = re.fullmatch(number+r'\s*/\s*'+number+r'\s*Hz', carriers)
        beat = re.fullmatch(number+r'\s*Hz', beat_text)
        if pair:
            if not beat:
                raise ValueError(f'{identifier}: carrier pair requires a nonnegative Hz difference')
            left = finite_number(pair[1], f'{identifier} left carrier')
            right = finite_number(pair[2], f'{identifier} right carrier')
            difference = finite_number(beat[1], f'{identifier} difference', positive=False)
            calculated = abs(right-left)
            if abs(calculated-difference) >= 1e-10:
                raise ValueError(f'{identifier}: stated difference {difference} Hz does not match {calculated} Hz')
            checks.append({'id': identifier, 'calculatedDifferenceHz': calculated,
                           'specifiedDifferenceHz': difference, 'arithmeticMatches': True,
                           'scope': 'Metadata subtraction only; no waveform, physiology or mechanical validation'})
            constructions.append({'id': identifier, 'kind': 'carrier-pair',
                                  'arithmeticStatus': 'carrier-subtraction-checked'})
            continue
        pulse = re.fullmatch(number+r'\s*(kHz|Hz)\s+pulses', carriers)
        rate = re.fullmatch(number+r'\s*Hz\s+rate', beat_text)
        if pulse:
            if not rate:
                raise ValueError(f'{identifier}: pulse construction requires a positive Hz rate')
            carrier = finite_number(pulse[1], f'{identifier} pulse carrier')
            carrier *= 1000 if pulse[2] == 'kHz' else 1
            if not math.isfinite(carrier):
                raise ValueError(f'{identifier}: converted pulse carrier must be finite')
            constructions.append({'id': identifier, 'kind': 'pulse-train',
                                  'carrierHz': carrier,
                                  'pulseRateHz': finite_number(rate[1], f'{identifier} pulse rate'),
                                  'arithmeticStatus': 'not-carrier-pair-arithmetic',
                                  'scope': 'Pulse metadata only; pulse shape and waveform not verified'})
            continue
        if carriers == 'broadband' and beat_text in ['—', '-']:
            constructions.append({'id': identifier, 'kind': 'noise',
                                  'arithmeticStatus': 'not-carrier-pair-arithmetic',
                                  'scope': 'Noise label only; generator, seed and filter not verified'})
            continue
        raise ValueError(f'{identifier}: unsupported or malformed carrier/beat format')
    return checks, constructions, {'recordCount': len(presets),
                                   'carrierPairArithmeticCount': len(checks),
                                   'nonCarrierPairCount': len(constructions)-len(checks),
                                   'unclassifiedCount': 0}

def inventory(repo, expected=None):
    def git(*args):
        return subprocess.check_output(['git', '-C', str(repo), *args])
    commit = git('rev-parse', 'HEAD').decode().strip()
    if expected and commit != expected:
        raise ValueError(f'Expected {expected}, found {commit}')
    files, text, preset_checks = [], {}, []
    for entry in git('ls-tree', '-rz', '--full-tree', 'HEAD').split(b'\0'):
        if not entry:
            continue
        meta, rawpath = entry.split(b'\t', 1)
        mode, kind, blob = meta.decode().split()
        if kind != 'blob':
            continue
        name = rawpath.decode('utf-8')
        data = git('cat-file', 'blob', blob)
        record = {'path': name, 'mode': mode, 'blob': blob, 'bytes': len(data),
                  'sha256': hashlib.sha256(data).hexdigest(), 'status': 'bytes-inventoried-not-content-validated'}
        if mode == '120000':
            record['status'] = 'symlink-target-text-only; not-followed'
        elif name.endswith(('.md', '.txt', '.json', '.html')):
            value = data.decode('utf-8')
            text[name] = value
            record['lines'] = len(value.splitlines())
        files.append(record)
    constructions, preset_summary = [], None
    if 'files/audio/presets.json' in text:
        preset_checks, constructions, preset_summary = preset_metadata(text['files/audio/presets.json'])
    names = {f['path'] for f in files}
    return {'schema': 'gateway-committed-corpus/2', 'commit': commit,
            'trackedFileCount': len(files), 'totalBytes': sum(f['bytes'] for f in files), 'files': files,
            'indexHtmlPresent': 'index.html' in names, 'presetArithmetic': preset_checks,
            'presetConstructions': constructions, 'presetSummary': preset_summary,
            'pdfFilesPresent': sorted(n for n in names if n.lower().endswith('.pdf')),
            'audioFilesPresent': sorted(n for n in names if n.lower().endswith(('.wav', '.mp3', '.flac'))),
            'limits': ['Committed tree only; local uncommitted files and hosted site not inspected',
                       'Hashes establish byte identity, not content accuracy, rights, efficacy or source fidelity',
                       'Manifest entries do not establish existence of missing binary files',
                       'No raw EEG, hardware, body–sphere coupling or health outcome is verified']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('checkout', type=Path)
    parser.add_argument('--expect-commit')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        result = inventory(args.checkout, args.expect_commit)
        payload = json.dumps(result, indent=2, ensure_ascii=False, allow_nan=False)+'\n'
        if args.output:
            with args.output.open('x', encoding='utf-8') as stream:
                stream.write(payload)
        else:
            print(payload, end='')
    except (ValueError, UnicodeError, OSError, subprocess.CalledProcessError) as error:
        parser.exit(2, f'audit failed: {error}\n')


if __name__ == '__main__':
    main()

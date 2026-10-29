"""Pre-producer-read API refinement; preserve the original independent fixture."""
import copy
import hashlib
import json
from pathlib import Path
HERE=Path(__file__).resolve().parent
original=HERE/'independent-fixtures.json'
assert hashlib.sha256(original.read_bytes()).hexdigest()=='07cc3ffc86db87d724ee995846ad80db028350dad157c1042fc08f87d89a4f1a'
base=json.loads(original.read_text())
local=copy.deepcopy(base['metadataCases'][0]['packet'])
globalpacket=copy.deepcopy(base['metadataCases'][1]['packet'])
second=copy.deepcopy(local);second['stationId']='synthetic-B';second['calibration']['id']='synthetic-B-calibration'
globalpacket['independentStations']=[copy.deepcopy(local),second]
cases=[dict(id='synthetic-full-global-records',packet=globalpacket,asOfUtc='2026-10-29T04:57:39Z',expectedStatus='ready-for-analysis')]
for name,change in [
    ('child-calibration-missing',lambda p:p['independentStations'][1].pop('calibration')),
    ('child-interval-mismatched',lambda p:p['independentStations'][1]['interval'].update(startUtc='2026-10-24T00:00:00Z')),
    ('child-incomplete',lambda p:p['independentStations'][1].update(coverageComplete=False)),
    ('child-missing',lambda p:p['independentStations'].pop()),
    ('aliased-station-identifiers',lambda p:p.update(independentStationIds=['synthetic-A',' SYNTHETIC-a '])),
    ('child-duplicate-id',lambda p:p['independentStations'][1].update(stationId='synthetic-A'))]:
    packet=copy.deepcopy(globalpacket);change(packet)
    cases.append(dict(id=name,packet=packet,asOfUtc='2026-10-29T04:57:39Z',expectedStatus='insufficient-evidence'))
result=dict(schema='round3-intake-refinement/1',
            timing='Producer communicated strengthened API after first fixture freeze but before any R3 producer source read. Original fixture preserved.',
            originalFixtureSha256=hashlib.sha256(original.read_bytes()).hexdigest(),
            originalExpectedStatusOverrides={'synthetic-complete-global':'insufficient-evidence'},
            rationale='A global ID list alone lacks independently calibrated station metadata. Full child records must satisfy local admission and exact common interval; names alone still do not prove independence.',
            cases=cases,scriptSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest())
output=HERE/'schema-supplement.json';output.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'supplementSha256':hashlib.sha256(output.read_bytes()).hexdigest(),'cases':len(cases)}))

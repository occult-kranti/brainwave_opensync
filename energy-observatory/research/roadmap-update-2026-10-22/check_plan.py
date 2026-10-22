#!/usr/bin/env python3
"""Validate planning records and frozen stage provenance, not mathematical truth."""
from pathlib import Path
import hashlib,json
B=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
c=read(B/'contract.json');assert c['stages']==['review','plan1','plan2'] and len(c['roles'])==6
for role in c['roles']:
 for stage in c['stages']:
  assert (B/f'panel/{role}/{stage}.md').stat().st_size>100
 for stage in ['plan1','plan2']:assert isinstance(read(B/f'panel/{role}/{stage}.json'),(dict,list))
for stage in [1,2]:
 a=read(B/f'planning{stage}-admission.json')
 for path,digest in a['filesSHA256'].items():assert sha(B/path)==digest,path
p=read(B/'data/plan.json');ids={t['id'] for t in p['tasks']};assert len(ids)==len(p['tasks'])
for t in p['tasks']:
 for k in ['target','premises','acceptance','negativeControl','stopRule','effort','novelty','deliverable']:assert t[k],(t['id'],k)
 assert t['status']!='solved' and t['category'] in ['math','engineering','experiment']
for dep in p['dependencies']:
 assert dep['from'] in ids and dep['to'] in ids
assert p['newScientificImplementation'] is False and p['newPhysicalMeasurements']==0
print(json.dumps({'status':'passed','scope':'Planning metadata and frozen provenance only','reports':18,'tasks':len(ids),'dependencies':len(p['dependencies']),'newResultsClaimed':False},indent=2))

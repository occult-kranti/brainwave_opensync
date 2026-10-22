#!/usr/bin/env python3
"""Replay bounded studies in a disposable copy; never rewrite reviewed records."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import argparse, hashlib, json, shutil, subprocess, tempfile, time
HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
ENERGY=ROOT.parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def metadata():
 inv=read(ROOT/'panel/corpus/inventory-round2.json');fs=inv['families']
 assert len(fs)==372 and len({f['id'] for f in fs})==372
 assert sum(len(f['manuscripts']) for f in fs)==719
 assert max(int(f['id']) for f in fs)==377
 assert {f'{i:03d}' for i in range(1,378)}-{f['id'] for f in fs}=={'045','061','070','123','163'}
 assert any('CAT(0)-spaces-' in m['path'] for f in fs if f['id']=='337' for m in f['manuscripts'])
 for path,digest in read(ROOT/'round2-admission.json')['frozenRound1'].items():assert sha(ROOT/path)==digest,path
 for path,digest in read(ROOT/'panel/corpus/round1-freeze.json')['files'].items():assert sha(ROOT/'panel/corpus'/path)==digest,path
 d=read(ROOT/'data/crosswalk.json');n=read(ROOT/'data/network.json');ids={x['id'] for x in n['nodes']}
 assert all(e['source'] in ids and e['target'] in ids and not e['sameTheoremEstablished'] for e in n['edges'])
 assert len(d['roles'])==6 and len(d['rounds'])==2
 for r in d['roles']:
  for i in (1,2):assert (ROOT/f"panel/{r['id']}/round{i}.md").is_file()
 assert not any(c['family'] and c['classification'] in ('same-claim-solved','same-claim-attempted') for c in d['claims'])
 assert all('Catalogue only' in c['readingDepth'] for c in d['claims'] if c['family'] in ('075','130'))
 expected={'em.mjs':'09ee1be95fe4586b1633fb39dae11fdc7f6a5dc3604461632c320d1e91193984','acoustic.mjs':'d14db2f4843f328e016dd1f7f29b16612a910b1362599a4bbc74c9cca1f8dff3','quantum.mjs':'ec9320c28560f80b11e65cb6eb1e08f43bed68ffdf3fd97efacd7109b2cc7b91','identifiability.mjs':'fa6e497e275d10c1656060883e8fb1b9c865d4686e25bb012e8cde4887683b29'}
 for name,digest in expected.items():assert sha(ENERGY/'src'/name)==digest,name
 return {'families':372,'manuscripts':719,'selectedComparisons':len(d['claims']),'reports':12,'networkNodes':len(ids),'networkEdges':len(n['edges']),'frozenRound1Preserved':True,'acceptedCoreModelsUnchanged':True}
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--snapshot',type=Path);ap.add_argument('--output',type=Path,required=True);args=ap.parse_args()
 meta=metadata()
 with tempfile.TemporaryDirectory(prefix='math-crosswalk-replay-') as temp:
  temp=Path(temp);project=temp/'energy-observatory'
  shutil.copytree(ENERGY,project,ignore=shutil.ignore_patterns('dist','node_modules','__pycache__','*.pyc'))
  # The archived v1.1 model is byte-identical to the inspected project producer.
  model=project/'versions/location-v1.1/src/models.mjs'
  assert sha(model)=='2371578a26dba7cdb580940c8cd64b7fa361a3ec2ee2d52581a6fa8fba2445fe'
  shutil.copytree(project/'versions/location-v1.1',temp/'location-spectrum',ignore=shutil.ignore_patterns('dist'))
  panel=project/'research/math-crosswalk/panel'
  jobs={
   'yangmills':[['python3','-B',str(panel/'yangmills/verify_round2.py'),'--output',str(temp/'ym.json')]],
   'energy':[['python3','-B',str(panel/'energy/check-thermal.py')]],
   'acoustics':[['python3','-B',str(panel/'acoustics/verify_scaling.py')]],
   'methods':[['python3','-B',str(panel/'methods/exact_certificate.py'),'--output',str(temp/'exact.json')]],
   'methods-thermal':[['python3','-B',str(panel/'methods/energy_reference.py'),'reference'],['node',str(panel/'methods/run_energy_producer.mjs')],['python3','-B',str(panel/'methods/energy_reference.py'),'compare']],
   'skeptic':[['python3','-B',str(panel/'skeptic/round2_checks.py'),'--output',str(temp/'skeptic.json')],['python3','-B',str(panel/'skeptic/cross_review.py'),'--output',str(temp/'cross.json')]]}
  if args.snapshot:jobs['corpus']=[['python3','-B',str(panel/'corpus/round2_audit.py'),'--snapshot',str(args.snapshot.resolve()),'--output',str(temp/'corpus.json')]]
  def execute(item):
   name,commands=item;start=time.monotonic();logs=[]
   for cmd in commands:
    r=subprocess.run(cmd,cwd=project,text=True,capture_output=True,timeout=180)
    if r.returncode:raise RuntimeError(name+' failed\n'+r.stdout+'\n'+r.stderr)
    logs.append({'returncode':r.returncode,'stdoutSha256':hashlib.sha256(r.stdout.encode()).hexdigest()})
   return name,{'passed':True,'commands':len(commands),'seconds':round(time.monotonic()-start,3),'logs':logs}
  with ThreadPoolExecutor(max_workers=6) as pool:results=dict(pool.map(execute,jobs.items()))
  summary={'yangMillsExactChecks':read(temp/'ym.json')['number_of_checks'],'thermalCases':read(panel/'energy/round2-results.json')['counts'],'acousticCases':read(panel/'acoustics/round2-results.json')['caseCounts'],'acousticAllPassed':read(panel/'acoustics/round2-results.json')['allPassed'],'exactOscillatorChecks':read(temp/'exact.json')['checkCount'],'independentThermalComparisons':read(panel/'methods/energy-crosscheck-results.json')['checkCount'],'independentThermalAllPassed':read(panel/'methods/energy-crosscheck-results.json')['allPassed']}
  if args.snapshot:summary['catalogueCensus']=read(temp/'corpus.json')['census'] | {'entries':'omitted from replay receipt; see frozen full results'}
  receipt={'status':'passed','scope':'Bounded model and documentary replays, not full proof verification or measurements','metadata':meta,'replays':results,'summary':summary,'catalogueSourceReplay':bool(args.snapshot),'noLeanRun':True,'scriptSHA256':sha(Path(__file__))}
  args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(receipt,indent=2)+'\n')
  print(json.dumps({'status':'passed','suites':list(results),'metadata':meta,'summary':{k:v for k,v in summary.items() if k!='catalogueCensus'}},indent=2))
if __name__=='__main__':main()

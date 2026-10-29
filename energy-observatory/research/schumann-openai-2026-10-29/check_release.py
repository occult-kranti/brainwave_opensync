#!/usr/bin/env python3
"""Verify the October dossier and replay bounded models in an isolated copy."""
import argparse,hashlib,json,pathlib,shutil,subprocess,tempfile
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',default='/tmp/schumann-release-check.json');args=parser.parse_args()
 receipt=json.loads((HERE/'receipt.json').read_text());assert receipt['status']=='accepted-scoped'
 for path,wanted in receipt['files'].items():assert sha(ROOT/path)==wanted,path
 roles=['sources','math','observations','skeptic'];phases=['papers','schumann','comparison','round1','round2','round3']
 for role in roles:
  for phase in phases:assert (HERE/f'panel/{role}/{phase}.md').stat().st_size>500
  assert (HERE/f'panel/{role}/prior-art-gate.md').stat().st_size>500
 assert receipt['panelReports']==24 and receipt['researchRounds']==3 and receipt['localLeanExecutions']==0
 data=json.loads((ROOT/'data/october-update.json').read_text());assert data['status']=='accepted' and len(data['rounds'])==3
 assert data['coverage']['completedThreeHourBinsPerProvider']==49
 assert not data['coverage']['schumannCalibratedSeriesObtained']
 assert data['priorArtGate']['nextThreeRoundCycleStarted'] is False
 mub=json.loads((HERE/'panel/sources/mub-execution/execution-receipt.json').read_text());assert mub['returnCode']==0
 summary=json.loads((HERE/'panel/observations/observation-summary.json').read_text())
 for source in ['NOAA','GFZ']:
  x=summary['sources'][source]['seven_day_window'];assert x['complete_interval_points']==49 and x['complete_intervals_kp_ge_5']==0
 replays=[]
 with tempfile.TemporaryDirectory(prefix='oct29-replay-') as tmp:
  dest=pathlib.Path(tmp)/'energy-observatory';study=dest/'research'/HERE.name;study.parent.mkdir(parents=True)
  shutil.copytree(HERE,study,ignore=shutil.ignore_patterns('browser','__pycache__'))
  rel='research/'+HERE.name+'/'
  commands=[['python3','-B',rel+'verification/check_observations.py']]
  for n in [1,2,3]:commands += [['node',rel+f'analysis/round{n}/run.mjs'],['python3','-B',rel+f'verification/round{n}/compare_producer.py']]
  for command in commands:
   proc=subprocess.run(command,cwd=dest,text=True,capture_output=True,timeout=120)
   assert proc.returncode==0,command+['FAILED',proc.stderr[-1800:]]
   replays.append({'command':command,'exitCode':proc.returncode,'stdoutSha256':hashlib.sha256(proc.stdout.encode()).hexdigest()})
 # Replays must not mutate the reviewed worktree.
 for path,wanted in receipt['files'].items():assert sha(ROOT/path)==wanted,'post-replay '+path
 result={'status':'PASS','boundFiles':len(receipt['files']),'panelReports':24,'priorArtReports':4,'researchRounds':3,'replays':replays,'localLeanExecutions':0,'MUB':'Saved-record checker receipt checked; not redownloaded or C++ recomputed by this gate.','schumannAnomaly':'unresolved','scope':'Source bindings and bounded model/data checks, not peer review, novelty certification or instrument calibration.'}
 pathlib.Path(args.output).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:result[k] for k in ['status','boundFiles','panelReports','priorArtReports','researchRounds','schumannAnomaly']}))
if __name__=='__main__':main()

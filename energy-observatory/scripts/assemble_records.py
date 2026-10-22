from pathlib import Path
import json, shutil
ROOT=Path(__file__).resolve().parents[1]
roles=['tesla','acoustic','quantum','metrology','systems','records']
for role in roles:
 for name in ['round1.md','sources.json','round1-freeze.json']:
  dest=ROOT/'research/panel'/role/name;src=Path('/workspace/scratch/f431d34f6f71/energy-panel')/role/name
  if not dest.exists() and src.exists():shutil.copy2(src,dest)
sources=[]
for role in roles:
 data=json.loads((ROOT/'research/panel'/role/'sources.json').read_text())
 for s in data:sources.append({**s,'discipline':role})
extra=json.loads((ROOT/'research/panel/systems/round2-sources.json').read_text())
for s in extra:sources.append({**s,'discipline':'systems'})
versions=json.loads((ROOT/'data/versions.json').read_text())
version_info={'location-v1.0':('Location Lab · v1.0','Original solid/shell sphere, fixture-coupling and receiver models with protocols and a research network.'),'location-v1.1':('Location Lab · v1.1','Expanded capture simulator, acquisition/aliasing controls, source network and software-benchmark record.'),'position-v1.0':('Position Spectroscopy · v1.0','Radial-mode calculator, A/B experiment design, sampling checks and offline measured-data analysis tools.')}
for v in versions:
 v['title'],v['summary']=version_info[v['id']]
 sources.append({'id':'legacy-'+v['id'],'title':v['title'],'url':f"https://github.com/occult-kranti/brainwave_opensync/tree/{v['sourceCommit']}/{v['sourcePath']}",'year':2026,'kind':'project-source','venue':'Pinned prior Fieldwork release','status':'computed models and proposed experiments; zero physical measurements','readingDepth':'Project contracts, model descriptions and recorded limitations inspected; imported source bytes inventoried. Current integration tests are recorded separately.','claim':v['summary'],'limits':'Prior calculations do not establish energy generation or supply a quantum coupling law. Source histories retain their original scope.','topics':['legacy','energy'],'discipline':'legacy'})
(ROOT/'data/versions.json').write_text(json.dumps(versions,indent=2)+'\n')
topics=[
 {'id':'energy','label':'Energy boundaries','status':'established methods','description':'A non-overlapping source, load, loss and storage ledger is required. Model closure does not establish boundary completeness in a device.'},
 {'id':'em','label':'EM conversion','status':'computed model','description':'Passive reciprocal transfer at fixed mutual inductance. Active controllers and moving couplers add energy ports.'},
 {'id':'acoustic','label':'Acoustic conversion','status':'computed model','description':'Loading changes motion. Receiver conversion, acoustic capture and speaker-system efficiency use different boundaries.'},
 {'id':'quantum','label':'Quantum work','status':'computed model','description':'Ergotropy describes extractable work from a specified prepared state. It is not a source-free apparatus power rating.'},
 {'id':'measurement','label':'Measurement errors','status':'computed controls','description':'Phase skew, aliasing, hidden storage and missing inputs produce distinct diagnostic problems. One residual cannot identify them all.'},
 {'id':'inference','label':'Identifiability','status':'conditional result','description':'Within a known model, different internal parameter sets can produce identical electrical spectra. Additional calibrated channels can resolve a declared ambiguity.'},
 {'id':'programs','label':'Programs & patents','status':'documented records','description':'Government custody, funding, program targets and patent grants have distinct evidential meanings. Demonstrated net energy is a separate claim.'},
 {'id':'legacy','label':'Earlier experiments','status':'preserved versions','description':'Earlier copper-sphere calculations and acquisition controls inform experimental design. Their source bytes and original limitations are preserved.'}
]
map_topic={'tesla':'em','acoustic':'acoustic','quantum':'quantum','metrology':'measurement','systems':'inference','records':'programs','legacy':'legacy'}
edges=[]
for s in sources:
 edges.append({'source':s['id'],'target':map_topic[s['discipline']],'relation':'preserves' if s['discipline']=='legacy' else 'documents' if s['discipline']=='records' else 'method or model source'})
 if s['discipline'] in ['tesla','acoustic','metrology','systems','legacy'] or s['id']=='Q-ERG-2004':edges.append({'source':s['id'],'target':'energy','relation':'boundary / inference context'})
 if s['id']=='systems-bipm-units-2026':edges.append({'source':s['id'],'target':'programs','relation':'checks reported units'})
assert len({s['id'] for s in sources})==len(sources)
for s in sources:
 for key in ['id','title','url','year','kind','venue','status','readingDepth','claim','limits']:
  assert key in s,(s['id'],key)
(ROOT/'data/evidence.json').write_text(json.dumps({'researchDate':'2026-10-21','scope':'Selected primary records; actual reading depths; source records are not independent replications.','sources':sources,'topics':topics,'edges':edges},indent=2)+'\n')
shutil.copy2(ROOT/'research/panel/records/programs.json',ROOT/'data/programs.json')
panel={'roles':[
 {'id':'tesla','name':'Electromagnetic','title':'Follow source and load','skill':'Tesla: mechanism, resonance and imagination','focus':'Coupled RLC networks, reciprocal transduction, full-system power boundaries.'},
 {'id':'acoustic','name':'Acoustic','title':'Match the actual input','skill':'Resonance research advisor + measurement contracts','focus':'Piezoelectric backaction, impedance matching and control-surface flux.'},
 {'id':'quantum','name':'Quantum','title':'Separate energy and work','skill':'Paired physics + historical physics panel','focus':'Prepared quantum states, ergotropy, damping and resource accounting.'},
 {'id':'metrology','name':'Metrology','title':'Try to break the reading','skill':'Newton: analysis, synthesis and observable inference','focus':'Covariance-aware uncertainty, phase/aliasing errors and blind diagnostics.'},
 {'id':'records','name':'Public records','title':'Verify what was claimed','skill':'Investigative evidence + historical panel + Gateway audit','focus':'Government programs, patent status, original documents and evidence limits.'},
 {'id':'systems','name':'Systems mathematics','title':'Test what can be inferred','skill':'Newton analysis + paired forward/reverse physics','focus':'Independent matrix fixtures, passivity, parameter ambiguity and calibrated channels.'}
], 'rounds':[
 {'number':1,'title':'Freeze the question before computing','summary':'Six separate proposals defined models, evidence limits and discriminating controls before peer exchange.','criticism':'Resonant peaks, patent grants, program funding and quantum terminology do not specify net energy. Pressure-only capture estimates and scalar residuals omit necessary information.','decision':'Admit fixed-coupling reciprocal conversion, a loaded piezoelectric receiver, one-qubit work, and independent metrology/identifiability controls. Freeze units, boundaries and tests.','result':'Six source-bound reports; complete energy identities and explicit inverse ambiguities; original version scopes recovered. No sweep or hardware trial was claimed in this round.'},
 {'number':2,'title':'Build the models and expose misleading comparisons','summary':'Producers implemented their admitted models while independent reviewers froze alternate formulations and fixtures.','criticism':'At fixed drive amplitude, input power varies with load. Maximum output can differ from maximum efficiency. Shared equations alone do not constitute independent authorship.','decision':'Use explicit RMS conventions, external work/loss quadrature, bounded grids, source-off/storage controls and matrix-based quantum reconstruction. Preserve both passing and deliberately wrong cases.','result':'1,395-cell electromagnetic and 4,941-cell acoustic grids; metrology phase/storage/aliasing controls; quantum state and unitary-search checks; an exact electrical-identifiability family.'},
 {'number':3,'title':'Match input power and challenge the inference','summary':'The advisor selected equal-input sweeps and independent reverse verification in response to Round 2 results.','criticism':'Rescaling a drive can violate current, storage, force or voltage constraints. An unexplained residual cannot be assigned to a new source without additional observations.','decision':'Check constraints after rescaling; compare producer implementations with independently frozen matrix formulations; diagnose three raw synthetic cards before revealing their key.','result':'613 cross-checks of EM/acoustic calculations and rescaling passed; 648 separately authored quantum cases passed; all three selected blind cases met the rubric, including abstention for the missing-input case. No physical surplus was established.'}
], 'findings':[
 {'status':'KNOWN METHODS APPLIED','title':'Equal-input comparisons change the engineering decision','detail':'The revised sweeps normalize model input, then enforce drive and response constraints. Fixed-voltage or fixed-force output rankings answer a different question.','limit':'Finite grids and illustrative linear models; efficiencies exclude named upstream hardware.'},
 {'status':'EXACT MODEL RESULT','title':'An electrical fit can leave a mechanical scaling ambiguity','detail':'The transformation (m,b,k,g) → (am,ab,ak,√a g) leaves the declared electrical impedance unchanged. Calibrated velocity breaks that positive scaling family.','limit':'Known electrical parameters, linear reciprocal model, nonzero coupling and specified inputs; not universal system identification.'},
 {'status':'COMPUTED CONTROL','title':'Stored energy and phase error can mimic an energy surplus','detail':'Synthetic tests preserve the wrong reading and its correction. A scalar residual also admits hidden inputs and bias; it does not select a unique cause.','limit':'Three blind examples are a selected mechanism check, not a reliability benchmark.'},
 {'status':'ESTABLISHED THEORY APPLIED','title':'Coherence changes extractable work at fixed mean energy','detail':'The one-qubit calculator contrasts a pure coherent state and its dephased counterpart, using the same energy reference.','limit':'Ideal cyclic-unitary bound; restricted controls may extract less. Device preparation and overhead remain unmodeled.'},
 {'status':'DOCUMENT CORRECTION','title':'An official unit statement required independent checking','detail':'The MARRS solicitation’s picobarn/cm² parenthesis differs from the BIPM conversion by 10²⁴. The original text is preserved and excluded from model inputs.','limit':'A source-notation inconsistency does not determine reaction performance or refute the cited studies.'},
 {'status':'PROPOSED / NOVELTY UNVERIFIED','title':'Joint energy closure and identifiability as an admission rule','detail':'Only promote a conversion claim when it survives a matched-input control, independent energy ledger and sufficient calibrated observations.','limit':'A project research thesis and protocol synthesis, not a newly proved law or an observed new energy source.'}
]}
(ROOT/'data/panel.json').write_text(json.dumps(panel,indent=2)+'\n')
print(f'{len(sources)} sources, {len(topics)} topics, {len(edges)} typed edges; six roles and three rounds.')

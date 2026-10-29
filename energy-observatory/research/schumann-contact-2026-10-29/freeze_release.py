"""Freeze the additive study's actual files; does not run or invent verification."""
import hashlib
import json
from pathlib import Path
HERE=Path(__file__).resolve().parent
SITE=HERE.parent.parent
assert len(list((HERE/'panel').glob('*/round[1-6].md')))==24
paths=[SITE/p for p in ['build-contact.mjs','contact-pages.mjs','src/contact.css','src/contact-ui.mjs','data/contact-review.json','scripts/contact-browser-check.cjs','tests/contact-integration.test.mjs']]
paths += [p for p in HERE.rglob('*') if p.is_file() and p.name!='receipt.json' and '__pycache__' not in p.parts and p.suffix!='.pyc']
files={str(p.relative_to(SITE)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(paths)}
receipt={'schema':'schumann-contact-release/1','status':'accepted-scoped','date':'2026-10-29','rounds':6,'panelists':4,'dedicatedWorkers':2,'panelReports':24,
 'priorArtAdmission':'Source audit and known-method engineering; no new fundamental theorem/effect admitted',
 'newPhysicalMeasurements':0,'humanTrials':0,'etContactEstablished':False,'calibratedRecentSchumannAnomalyEstablished':False,
 'novelFundamentalResultEstablished':False,'nextResearchRoundStarted':False,
 'producerAssertions':{'round2':65,'round3':407,'round4':2077,'round5':314,'round6':382},
 'independentVerification':{'round2':{'comparisons':151,'validCases':19,'invalidCases':37},'round3':{'checks':3451,'offsetRows':416},'round4':{'checks':16590,'offsetRows':2048},'round5':{'checks':1671,'repairedUnderflow':True},'round6':{'checks':1141,'independentPackets':75,'hashComparisons':8}},
 'preservedFailures':['Round3: seven searched lags/32offsets forces p>=7/32, preventing rejection at0.05','Round4: original fixed32 API required an additive generalized-N implementation','Round5: silent positive-tail underflow reproduced and repaired; original snapshot retained'],
 'publicationScope':'Public links, original summaries and synthetic/derived artifacts; no imported full proprietary corpus or private repository content',
 'files':files}
(HERE/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'boundFiles':len(files),'panelReports':24,'rounds':6}))

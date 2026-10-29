"""Independent exact integer-rank review for the frozen round-3 fixtures."""
import json,hashlib
from pathlib import Path
study=Path(__file__).resolve().parents[2]
fixture_path=study/'analysis/round3/fixtures.json'
fixtures=json.loads(fixture_path.read_text())
rows=[]
for fixture in fixtures['fixtures']:
    x,y=fixture['x'],fixture['y']; n=len(x); lags=fixtures['lags']
    q=[abs(n*sum(x[i]*y[(i+s)%n] for i in range(n))-sum(x)*sum(y)) for s in range(n)]
    ranks=[sum(b>=a for b in q) for a in q]
    maximum=[max(q[(s+l)%n] for l in lags) for s in range(n)]
    maximum_ranks=[sum(b>=a for b in maximum) for a in maximum]
    naive=[min(ranks[(s+l)%n] for l in lags) for s in range(n)]
    all_lag=[max(q[(s+l)%n] for l in range(n)) for s in range(n)]
    rows.append({'id':fixture['id'],'numerators':q,'fixedRanks':ranks,'maxRanks':maximum_ranks,'naiveSelectedRanks':naive,
        'fixedRejections':sum(r/n<=.05 for r in ranks),'maxRejections':sum(r/n<=.05 for r in maximum_ranks),
        'naiveSelectedRejections':sum(r/n<=.05 for r in naive),'minMaxP':min(maximum_ranks)/n,
        'allLagRanks':[sum(b>=a for b in all_lag) for a in all_lag]})
result={'method':'Exact integer cross-product ranks; denominator common under cyclic shifts; no producer imports',
        'fixtureSha256':hashlib.sha256(fixture_path.read_bytes()).hexdigest(),'rows':rows}
(study/'panel/skeptic/round3-exact-ranks.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps([{k:v for k,v in r.items() if k in ['id','fixedRejections','maxRejections','naiveSelectedRejections','minMaxP']} for r in rows],indent=2))

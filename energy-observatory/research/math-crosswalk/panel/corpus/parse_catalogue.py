"""Recount pinned OpenAI metadata; this does not verify mathematical proofs."""
import argparse, collections, hashlib, html, json, re
from pathlib import Path
import yaml

COMMIT='1581d4cbdd69a0faf34b2089614fe2a814316a6a'
DEFAULT=Path('/workspace/scratch/f431d34f6f71/math-crosswalk-sources/openai')

def digest(b): return hashlib.sha256(b).hexdigest()
def plain(s):
 s=html.unescape(re.sub(r'<[^>]+>','',s))
 return s.replace('$`','').replace('`$','').strip().rstrip('.')

def build(root):
 expected=json.loads((root/'git-expected.json').read_text())
 manifest=[]
 for path,sha in expected.items():
  b=(root/path).read_bytes();actual=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
  if actual!=sha: raise ValueError(f'Git object mismatch: {path}')
  manifest.append({'path':path,'bytes':len(b),'sha256':digest(b),'gitBlob':actual,'url':f'https://github.com/openai/math/blob/{COMMIT}/{path}'})
 s=(root/'CONTENTS.md').read_text(); overview=(root/'overview.tex').read_text()
 y=yaml.safe_load((root/'lean/formalization.yaml').read_text())
 formal_paths={x['id'].removeprefix('../') for x in y['sources']}
 subjects={};subject=None
 for line in overview.splitlines():
  sec=re.match(r'\\cataloguesection\{([^}]+)\}',line)
  if sec:subject=sec.group(1)
  ent=re.match(r'\\resultentry\{(\d{3})\}',line)
  if ent:subjects[ent.group(1)]=subject
 hits=list(re.finditer(r'^\*\*(\d{3})\. (.+?)\*\*',s,re.M));families=[]
 for i,m in enumerate(hits):
  fid,title=m.groups(); end=hits[i+1].start() if i+1<len(hits) else len(s);block=s[m.start():end]
  papers=[]
  for title,p in re.findall(r'&emsp;\[(.+?)\]\((preprints/[^)]+)\)',block):
   papers.append({'title':plain(title),'path':p,'url':f'https://github.com/openai/math/blob/{COMMIT}/{p}','listedInFormalizationYaml':p in formal_paths,'verificationByThisAudit':'not proof-checked'})
  lean=re.search(r'\[Lean\]\((lean/docs/\d+\.md)\)',block)
  families.append({'id':fid,'title':plain(m.group(2)),'originalTitle':m.group(2),'subject':subjects[fid], 'catalogueLine':s.count('\n',0,m.start())+1,'manuscripts':papers,'familyScopeNote':f'https://github.com/openai/math/blob/{COMMIT}/{lean.group(1)}' if lean else None,'status':'publisher catalogue claim; metadata screened, mathematical truth not certified here'})
 ids=[int(x['id']) for x in families]; paths=[p['path'] for f in families for p in f['manuscripts']]
 if len(ids)!=len(set(ids)) or len(paths)!=len(set(paths)):raise ValueError('Duplicate family or manuscript')
 result={'schema':'openai-catalogue-metadata-audit/1','researchDate':'2026-10-21','repository':'openai/math','commit':COMMIT,'sourceFiles':manifest,'coverage':'All family headings and constituent paper links parsed; full descriptions keyword-screened. Individual proof reading is recorded separately by specialist lanes. No Lean build was run by this auditor.','counts':{'parsedFamilies':len(families),'parsedManuscripts':len(paths),'highestFamilyIdentifier':max(ids),'absentIdentifiers':[f'{x:03}' for x in sorted(set(range(1,max(ids)+1))-set(ids))],'familiesWithScopeNoteLink':sum(x['familyScopeNote'] is not None for x in families),'formalizationYamlSourceEntries':len(y['sources']),'formalizationYamlMainResultDeclarations':len(y['status']['main_results']),'yamlSourcePathsMatchedToCurrentCatalogue':len(formal_paths&set(paths)),'publisherTopLineFormalized':300,'publisherTopLineDenominator':719},'formalizationMetadata':{'scope':y['status']['scope'],'review':y['review'],'interpretation':'Different metadata sets and counting units; 300/719 is publisher-reported, not independently reproduced as 300 verified main theorems. Family scope links do not certify all companion papers. YAML entries and theorem declarations do not certify successful builds.'},'subjectCounts':dict(collections.Counter(x['subject'] for x in families)),'literalScreen':{'patterns':['Yang[ –−-]*Mills','source[ -]*free energy','perpetual motion'],'counts':{p:len(re.findall(p,s,re.I)) for p in ['Yang[ –−-]*Mills','source[ -]*free energy','perpetual motion']},'scope':'Literal search over full CONTENTS.md, not a semantic proof of absence.'},'families':families}
 return result

if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--snapshot',type=Path,default=DEFAULT);a.add_argument('--output',type=Path,default=Path(__file__).with_name('inventory.json'));args=a.parse_args();r=build(args.snapshot);args.output.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'commit':r['commit'],'counts':r['counts'],'subjects':r['subjectCounts'],'literalScreen':r['literalScreen']},ensure_ascii=False,indent=2))

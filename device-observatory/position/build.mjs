import { cp, mkdir, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const out=join(root,'dist');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for (const name of ['index.html','src','assets','research','analysis','README.md']) await cp(join(root,name),join(out,name),{recursive:true});
await cp(join(root,'tests'),join(out,'code/tests'),{recursive:true});
await cp(join(root,'src'),join(out,'code/src'),{recursive:true});
await cp(join(root,'analysis'),join(out,'code/analysis'),{recursive:true});
await cp(join(root,'research'),join(out,'code/research'),{recursive:true});
await writeFile(join(out,'code/package.json'),JSON.stringify({name:'fieldwork-position-source',type:'module',private:true,scripts:{test:'node --test tests/*.test.mjs'}},null,2)+'\n');
await cp(join(root,'LICENSE'),join(out,'LICENSE'));
let commit='unversioned-source-bundle';
try { commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim(); } catch { /* Standalone downloaded source has no Git metadata. */ }
const deployment={site:'Fieldwork / Position spectroscopy',branch:'research/copper-position-spectroscopy',commit,path:'/brainwave_opensync/devices/position/',researchDate:'2026-10-21',hardwareMeasurements:0,status:'Proposed apparatus; verified numerical models; synthetic examples'};
await writeFile(join(out,'deployment.json'),JSON.stringify(deployment,null,2)+'\n');
const chapters=['protocol.md','derivation.md','sources-review.md','advisor-decision.md'];
let dossier='# Fieldwork: Copper sphere position spectroscopy\n\nResearch cutoff: 21 October 2026. No physical experiment has been executed.\n';
for(const chapter of chapters) dossier+='\n\n---\n\n'+await readFile(join(root,'research',chapter),'utf8');
await writeFile(join(out,'research/dossier.md'),dossier);
await writeFile(join(out,'.nojekyll'),'');
// Reproducible source bundle: the build output and local caches are excluded.
execFileSync('python3',['-c', `
from pathlib import Path
from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
import sys
root=Path(sys.argv[1]); target=Path(sys.argv[2])
with ZipFile(target,'w',compression=ZIP_DEFLATED) as z:
 for p in sorted(root.rglob('*')):
  rel=p.relative_to(root)
  if not p.is_file() or any(x in rel.parts for x in ['dist','node_modules','__pycache__']): continue
  info=ZipInfo('position-spectroscopy/'+str(rel),date_time=(2026,10,21,0,0,0))
  info.compress_type=ZIP_DEFLATED
  z.writestr(info,p.read_bytes())
`,root,join(out,'source.zip')]);
const hashes={};
async function walk(path){for(const e of await readdir(path,{withFileTypes:true})){const p=join(path,e.name);if(e.isDirectory())await walk(p);else hashes[relative(out,p)]=createHash('sha256').update(await readFile(p)).digest('hex');}}
await walk(out);
await writeFile(join(out,'build-manifest.json'),JSON.stringify({commit,files:hashes},null,2)+'\n');
console.log(`Built isolated position spectroscopy page: ${Object.keys(hashes).length} files; source ${commit}.`);

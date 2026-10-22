import {cp,mkdir,rm,readFile,writeFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,relative} from 'node:path';

const root=fileURLToPath(new URL('.',import.meta.url)),out=join(root,'dist');
const json=async p=>JSON.parse(await readFile(join(root,p),'utf8'));
const sha=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const filter=p=>!p.split(/[\\/]/).some(s=>['dist','node_modules','__pycache__','.git','generated','.venv','.venv-tools'].includes(s))&&!p.endsWith('.pyc');
let bundledOrigin;
try{bundledOrigin=await json('BUILD_ORIGIN.json')}catch(e){if(e.code!=='ENOENT')throw e}
const sourceCommit=bundledOrigin?.sourceCommit??execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const sourcePins={locationV1:'f9927a68fca491785bfca0a4782ffceeb37209dc',locationV11:'07e57b446a9f480216ad1aa555088bc361006d9c',positionV1:'a8913c825d24299283c9379282ae3876e2a0c0cd',gateway:'075bbab71bd4c83946fac1c3180dbc9460ce32d2',claude:'e628974ba018c775da41de304bd55afafd16b426'};
const sources=await json('data/sources.json'),graph=await json('data/graph.json'),versions=await json('data/versions.json');
const ids=new Set(sources.map(s=>s.id)),nodes=new Set(graph.nodes.map(n=>n.id));
if(ids.size!==sources.length||nodes.size!==graph.nodes.length)throw Error('Duplicate evidence/node identifiers');
for(const s of sources){if(!s.title||!s.url||!s.observations?.length)throw Error(`Source provenance missing: ${s.id}`);for(const o of s.observations)if(!o.origin||!o.status||!(o.readDepth||o.readingDepth||o.read_depth||o.access_read_depth))throw Error(`Incomplete source observation: ${s.id}`)}
for(const e of graph.edges){
 if(!nodes.has(e.source)||!nodes.has(e.target)||!(e.type||e.relation))throw Error('Invalid graph endpoint/relation');
 const evidence=e.sourceIds??[e.sourceId];if(!evidence.length||evidence.some(x=>!ids.has(x)))throw Error(`Unresolved evidence pointer: ${JSON.stringify(e)}`);
}
for(const v of versions){
 const directory=join(root,'public/versions',v.id);
 for(const [name,expected]of Object.entries(v.originalFiles)){
  const actual=await sha(join(directory,name==='index.html'?'original-index.html':name));
  if(actual!==expected)throw Error(`Changed frozen source artifact: ${v.id}/${name}`);
 }
 if(await sha(join(directory,'index.html'))!==v.annotation.annotatedIndexSHA256)throw Error(`Unrecorded snapshot annotation: ${v.id}`);
}
const imported=await json('imports/claude-source.json');
if(imported.commit!==sourcePins.claude||imported.changedFiles!==22||imported.originals.length!==23)throw Error('Unexpected Claude source pin or import size');
for(const file of imported.originals){if(await sha(join(root,'imports/bashar-index-e628974',file.path))!==file.sha256)throw Error(`Changed Claude source artifact: ${file.path}`)}
if(await sha(join(root,'public',imported.viewer.path))!==imported.viewer.sha256)throw Error('Unrecorded Claude viewer annotation');
const originalIndex=imported.originals.find(x=>x.path==='experiments/frequency-of-place/index.html');
if(await sha(join(root,'public/experiments/frequency-of-place/original-index.html'))!==originalIndex.sha256)throw Error('Changed exact original Claude page');
const comparison=await json('research/claude-comparison.json');
if(comparison.sourceCommit!==sourcePins.claude||!comparison.passed||!comparison.fullModelReproduction.performed||comparison.physicalMeasurements!==0)throw Error('Missing checked Claude full-model reproduction');
for(const [name,file]of Object.entries({sourceModes:'imports/bashar-index-e628974/experiments/frequency-of-place/sphere_modes.py',sourceModel:'imports/bashar-index-e628974/experiments/frequency-of-place/fp_model.py',existingModels:'src/models.mjs'})){
 if(comparison.codeHashes[name]!==await sha(join(root,file)))throw Error(`Stale Claude comparison component: ${name}`);
}
const componentFiles=['src/models.mjs','src/acquisition.mjs','src/modal-diagnostics.mjs','src/design-diagnostics.mjs','analysis/analyze.py','src/claude-comparison.mjs','scripts/verify_claude.py'];
const componentHashes={};for(const file of componentFiles)componentHashes[file]=await sha(join(root,file));
const embeddedComponentsMatch=!bundledOrigin||Object.entries(bundledOrigin.componentHashes??{}).every(([file,hash])=>componentHashes[file]===hash);
const info={version:'2.1.0',sourceCommit,branch:'research/copper-experiment-integrated',researchDate:'2026-10-22',physicalMeasurements:0,sourcePins,componentHashes,originMode:bundledOrigin?'embedded-source-origin':'repository-HEAD',embeddedComponentsMatch,sourceState:bundledOrigin&&!embeddedComponentsMatch?'components-modified-from-embedded-origin':'current-component-hashes-recorded',modelSHA256:componentHashes['src/models.mjs'],acquisitionSHA256:componentHashes['src/acquisition.mjs']};
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const file of ['index.html','models.html','comparison.html','design.html','acquisition.html','protocol.html','gateway.html','sources.html','versions.html','src','data','research','analysis','reference','scripts','skills','deployment','imports','README.md','LICENSE','package.json','tests','requirements-build.txt'])await cp(join(root,file),join(out,file),{recursive:true,filter});
await cp(join(root,'public'),out,{recursive:true,filter});
await writeFile(join(out,'src/build-info.mjs'),`export const BUILD_INFO = ${JSON.stringify(info,null,2)};\n`);
const manifest={site:'Fieldwork / Copper Experiment',...info,path:'/brainwave_opensync/devices/copper/',canonicalSources:sources.length,sourceObservations:sources.reduce((n,s)=>n+s.observations.length,0),graphNodes:graph.nodes.length,graphEdges:graph.edges.length,preservedVersions:versions.length,preservedOriginalFiles:versions.reduce((n,v)=>n+Object.keys(v.originalFiles).length,0),runtimeDependencies:0,status:'Numerical models and proposed protocols; no physical experiment or new law established'};
await writeFile(join(out,'deployment.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(join(out,'.nojekyll'),'');
execFileSync('python3',['-B',join(root,'scripts/build_documents.py'),root,out],{cwd:root,stdio:'inherit'});
// An extracted archive retains its exact origin without depending on an unrelated Git checkout.
const origin={...info,sourceSchema:'fieldwork-copper-source/2',provenance:'Embedded build origin; code hashes and source pins retained in standalone bundle'};
execFileSync('python3',['-B','-c',`
from pathlib import Path
from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
import json,sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);origin=json.loads(sys.argv[3])
with ZipFile(out/'source.zip','w',compression=ZIP_DEFLATED) as z:
 for p in sorted(root.rglob('*')):
  rel=p.relative_to(root)
  if not p.is_file() or any(x in rel.parts for x in ['dist','node_modules','__pycache__','.git','generated','.venv','.venv-tools']):continue
  if rel.name.endswith('.pyc') or str(rel)=='BUILD_ORIGIN.json':continue
  entry=ZipInfo('copper-experiment/'+rel.as_posix(),date_time=(2026,10,22,0,0,0));entry.compress_type=ZIP_DEFLATED;z.writestr(entry,p.read_bytes())
 entry=ZipInfo('copper-experiment/BUILD_ORIGIN.json',date_time=(2026,10,22,0,0,0));entry.compress_type=ZIP_DEFLATED;z.writestr(entry,json.dumps(origin,indent=2)+'\\n')
`,root,out,JSON.stringify(origin)],{cwd:root,stdio:'inherit'});
const hashes={};async function walk(p){for(const e of await readdir(p,{withFileTypes:true})){const q=join(p,e.name);if(e.isDirectory())await walk(q);else hashes[relative(out,q)]=await sha(q)}}await walk(out);
await writeFile(join(out,'build-manifest.json'),JSON.stringify({sourceCommit,files:hashes},null,2)+'\n');
console.log(`Built integrated Copper Experiment: ${sources.length} canonical sources; ${versions.length} preserved versions; ${Object.keys(hashes).length} files.`);

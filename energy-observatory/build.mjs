import {cp,mkdir,rm,readdir,readFile,writeFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,relative} from 'node:path';
import {pages} from './site.mjs';
const root=fileURLToPath(new URL('.',import.meta.url)),out=join(root,'dist'),hash=b=>createHash('sha256').update(b).digest('hex');
const exists=async p=>{try{await access(p);return true;}catch{return false;}};
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const name of ['src','assets','data','research','analysis','README.md','LICENSE'])if(await exists(join(root,name)))await cp(join(root,name),join(out,name),{recursive:true,filter:p=>!p.split(/[\\/]/).includes('__pycache__')&&!p.endsWith('.pyc')});
const nav=[['index.html','Overview'],['workbench.html','Workbench'],['quantum.html','Quantum'],['experiments.html','Experiments'],['evidence.html','Evidence'],['panel.html','Panel'],['versions.html','Versions'],['math.html','Math crosswalk'],['roadmap.html','Next tasks']];
for(const [name,page]of Object.entries(pages))await writeFile(join(out,name),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#eeeadf"><meta name="description" content="Fieldwork energy research: source-led models, explicit energy budgets, independent checks and proposed experiments."><title>${page.title} | Fieldwork</title><link rel="stylesheet" href="src/styles.css"><script type="module" src="src/app.mjs"></script>${name==='math.html'?'<script type="module" src="src/math-crosswalk-ui.mjs"></script>':name==='roadmap.html'?'<script type="module" src="src/roadmap-ui.mjs"></script>':''}</head><body><a class="skip" href="#main">Skip to content</a><header class="masthead"><a class="wordmark" href="index.html">fieldwork<span>ENERGY OBSERVATORY / 05</span></a><p>RESEARCH · MODELS · MEASUREMENTS</p><a class="backlink" href="../">Device observatory ↗</a></header><nav class="main-nav wrap" aria-label="Research pages">${nav.map(([href,label])=>`<a href="${href}"${href===name?' aria-current="page"':''}>${label}</a>`).join('')}</nav><main class="wrap" id="main"><div class="page-intro"><div><span class="eyebrow">${page.kicker}</span><h1>${page.heading}</h1></div><p>${page.lede}</p></div>${page.body}</main><footer class="footer wrap"><a href="index.html">fieldwork / Energy Observatory</a><p>Hruday N M / BUNZEEY · Model research cutoff 21 October 2026 · roadmap update 22 October<br>Model-agent panel · synthetic calculations · no physical measurements</p><a href="https://github.com/occult-kranti/brainwave_opensync/tree/research/energy-observatory/energy-observatory">Source branch ↗</a></footer><div id="toast" role="status" aria-live="polite"></div><noscript><p class="wrap">Calculators and source filters need JavaScript. Read the <a href="research/advisor.md">research dossier</a> or <a href="data/evidence.json">source register</a>.</p></noscript></body></html>`);
let commit='unversioned-source-bundle';try{commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}catch{}
const versions=JSON.parse(await readFile(join(root,'data/versions.json'),'utf8'));
await cp(join(root,'LICENSE'),join(root,'versions/LICENSE'));
for(const v of versions){
 const source=join(root,'versions',v.id),dest=join(out,'versions',v.id);
 for(const [name,sha]of Object.entries(v.sourceFiles))if(hash(await readFile(join(source,name)))!==sha)throw Error(`Preserved source mismatch: ${v.id}/${name}`);
 const originalBuilder=await readFile(join(source,'build.mjs'),'utf8');
 const adaptedBuilder=originalBuilder.replace("const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();",`const commit='${v.sourceCommit}';`);
 execFileSync('node',['--input-type=module','--eval',adaptedBuilder],{cwd:source,stdio:'pipe'});
 await cp(join(source,'dist'),dest,{recursive:true});
 const original=await readFile(join(dest,'index.html'),'utf8');
 const bar=`<aside aria-label="Preserved version" style="padding:12px 20px;background:#203e35;color:#fbf9f3;font:12px/1.7 Arial,sans-serif;position:relative;z-index:20"><a style="color:inherit" href="../../versions.html">← Energy Observatory versions</a> · ${v.title} · source ${v.sourceCommit.slice(0,7)} · hosted copy; no new hardware data</aside>`;
 await writeFile(join(dest,'index.html'),original.replace(/<body([^>]*)>/i,`<body$1>${bar}`));
 if(v.id.startsWith('location')){const info=JSON.parse(await readFile(join(dest,'deployment.json'),'utf8'));const modelVersion=v.id==='location-v1.0'?'1.0.0':'1.1.0';const buildInfo=`export const BUILD_INFO = ${JSON.stringify({modelVersion,researchDate:info.researchDate,sourceCommit:v.sourceCommit,branch:'research/location-spectrum',modelSHA256:info.modelSHA256,acquisitionSHA256:info.acquisitionSHA256})};\n`;for(const path of ['src/build-info.mjs','code/src/build-info.mjs'])await writeFile(join(dest,path),buildInfo);}
 const meta=JSON.parse(await readFile(join(dest,'deployment.json'),'utf8'));Object.assign(meta,{commit:v.sourceCommit,hostCommit:commit,path:`/brainwave_opensync/devices/energy/versions/${v.id}/`,hostAdaptation:'Added navigation; pinned original source metadata. Scientific code unchanged.'});await writeFile(join(dest,'deployment.json'),JSON.stringify(meta,null,2)+'\n');
 // Regenerate the host manifest for the adapted snapshot; the archived original source remains byte-identical.
 const map={};async function walk(p){for(const d of await readdir(p,{withFileTypes:true})){const x=join(p,d.name);if(d.isDirectory())await walk(x);else if(d.name!=='build-manifest.json')map[relative(dest,x)]=hash(await readFile(x));}}await walk(dest);await writeFile(join(dest,'build-manifest.json'),JSON.stringify({sourceCommit:v.sourceCommit,hostCommit:commit,files:map},null,2)+'\n');
}
await mkdir(join(out,'versions'),{recursive:true});await writeFile(join(out,'versions/index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><title>Fieldwork versions</title><meta http-equiv="refresh" content="0;url=../versions.html"><a href="../versions.html">Open the version catalogue</a></html>');
await writeFile(join(out,'.nojekyll'),'');
await writeFile(join(out,'deployment.json'),JSON.stringify({site:'Fieldwork / Energy Observatory',branch:'research/energy-observatory',commit,path:'/brainwave_opensync/devices/energy/',researchDate:'2026-10-21',specialistAgents:6,researchRounds:3,mathCrosswalk:{specialistAgents:6,researchRounds:2,openaiCommit:'1581d4cbdd69a0faf34b2089614fe2a814316a6a',yangMillsCommit:'f9364d617015e803fda9465aefddd9cbe41854a4'},roadmapUpdate:{date:'2026-10-22',specialistAgents:6,reviewStages:1,planningRounds:2,newImplementation:false},physicalMeasurements:0,preservedVersions:versions.map(v=>({id:v.id,sourceCommit:v.sourceCommit})),status:'Reviewed mathematical models and proposed experiments; no new energy source established'},null,2)+'\n');
execFileSync('python3',['-c',`from pathlib import Path
from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
import sys
root=Path(sys.argv[1])
with ZipFile(sys.argv[2],'w',compression=ZIP_DEFLATED) as z:
 for p in sorted(root.rglob('*')):
  rel=p.relative_to(root)
  if not p.is_file() or any(n in rel.parts for n in ['dist','node_modules','__pycache__']):continue
  info=ZipInfo('energy-observatory/'+str(rel),date_time=(2026,10,21,0,0,0));info.compress_type=ZIP_DEFLATED;z.writestr(info,p.read_bytes())`,root,join(out,'source.zip')]);
const files={};async function manifest(p){for(const d of await readdir(p,{withFileTypes:true})){const x=join(p,d.name);if(d.isDirectory())await manifest(x);else files[relative(out,x)]=hash(await readFile(x));}}await manifest(out);await writeFile(join(out,'build-manifest.json'),JSON.stringify({commit,files},null,2)+'\n');console.log(`Built ${Object.keys(pages).length} pages, ${versions.length} preserved apps and ${Object.keys(files).length} files; source ${commit}.`);

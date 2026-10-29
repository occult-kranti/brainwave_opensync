// Additive presentation overlay: historical E1 build sources and receipts stay intact.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,relative} from 'node:path';
import {updatePage,schumannPage} from './schumann-pages.mjs';
const out=new URL('./dist/',import.meta.url), data=JSON.parse(await readFile(new URL('./data/october-update.json',import.meta.url),'utf8'));
const template=await readFile(new URL('index.html',out),'utf8');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const menu=`<a href="updates.html">October update</a><a href="schumann.html">Schumann lab</a>`;
for(const [name,page] of [['updates.html',updatePage(data)],['schumann.html',schumannPage(data)]]){
 const main=`<main class="wrap" id="main"><div class="page-intro"><div><span class="eyebrow">${page.kicker}</span><h1>${page.heading}</h1></div><p>${page.lede}</p></div>${page.body}</main>`;
 let html=template.replace(/<title>[^<]*<\/title>/,`<title>${escape(page.title)} | Fieldwork</title>`).replace(/<main class="wrap" id="main">[\s\S]*?<\/main>/,main).replaceAll(' aria-current="page"','');
 html=html.replace('</head>','<link rel="stylesheet" href="src/schumann.css"><script type="module" src="src/schumann-ui.mjs"></script></head>');
 await writeFile(new URL(name,out),html);
}
const banner=`<aside class="notice"><strong>Research update · October 29</strong><p><a href="updates.html">OpenAI releases, Yang–Mills comparison and current novelty assessment ↗</a> · <a href="schumann.html">Schumann models and dated observation coverage ↗</a></p></aside>`;
for(const entry of await readdir(out,{withFileTypes:true})){
 if(!entry.isFile()||!entry.name.endsWith('.html'))continue;
 const path=new URL(entry.name,out);let html=await readFile(path,'utf8');
 if(html.includes('aria-label="Research pages"'))html=html.replace('</nav>',menu+'</nav>');
 if(['updates.html','schumann.html'].includes(entry.name))html=html.replace(`href="${entry.name}">`,`href="${entry.name}" aria-current="page">`);
 if(['index.html','math.html','roadmap.html','dephasing.html'].includes(entry.name))html=html.replace('<main class="wrap" id="main">','<main class="wrap" id="main">'+banner);
 html=html.replace('Model research cutoff 21 October 2026 · roadmap update 22 October','Historical models: October 21–22 · release & Schumann review: October 29').replace('Model-agent panel · synthetic calculations · no physical measurements','Model-agent panels · synthetic models · dated external geomagnetic records; no new station measurements');
 await writeFile(path,html);
}
const deployment=JSON.parse(await readFile(new URL('deployment.json',out),'utf8'));
deployment.octoberUpdate={date:data.date,openaiRevision:data.openaiRevision,yangMillsRevision:data.yangMillsRevision,reviewers:4,initialPanels:3,researchRounds:data.rounds.length,dedicatedWorkers:2,localLeanExecutions:0,status:data.status,schumannAnomaly:'unresolved',newHardwareMeasurements:0,externalObservationCoverage:data.coverage,overlay:'build-schumann.mjs; historical scientific sources preserved'};
await writeFile(new URL('deployment.json',out),JSON.stringify(deployment,null,2)+'\n');
const files={};async function walk(p){for(const e of await readdir(p,{withFileTypes:true})){const q=join(p,e.name);if(e.isDirectory())await walk(q);else if(relative(out.pathname,q)!=='build-manifest.json')files[relative(out.pathname,q)]=createHash('sha256').update(await readFile(q)).digest('hex');}}
await walk(out.pathname);await writeFile(new URL('build-manifest.json',out),JSON.stringify({commit:deployment.commit,files},null,2)+'\n');
console.log(`Added October review and Schumann dashboard; ${Object.keys(files).length} manifest files.`);

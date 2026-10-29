// Run after npm run build. Additive overlay preserves every earlier frozen source.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,relative} from 'node:path';
import {contactPage,methodsPage} from './contact-pages.mjs';
const out=new URL('./dist/',import.meta.url);
const data=JSON.parse(await readFile(new URL('./data/contact-review.json',import.meta.url),'utf8'));
const template=await readFile(new URL('index.html',out),'utf8');
for(const [name,page] of [['contact.html',contactPage(data)],['contact-methods.html',methodsPage(data)]]){
 let html=template.replace(/<title>[^<]*<\/title>/,`<title>${page.title} | Fieldwork</title>`).replace(/<main class="wrap" id="main">[\s\S]*?<\/main>/,`<main class="wrap contact" id="main">${page.body}</main>`).replaceAll(' aria-current="page"','');
 html=html.replace('</head>','<link rel="stylesheet" href="src/contact.css"><script type="module" src="src/contact-ui.mjs"></script></head>');
 await writeFile(new URL(name,out),html);
}
for(const e of await readdir(out,{withFileTypes:true})){
 if(!e.isFile()||!e.name.endsWith('.html'))continue;
 const p=new URL(e.name,out);let html=await readFile(p,'utf8');
 if(html.includes('aria-label="Research pages"'))html=html.replace('</nav>','<a href="contact.html">Occult & contact audit</a><a href="contact-methods.html">Measurement & controls</a></nav>');
 if(['contact.html','contact-methods.html'].includes(e.name))html=html.replace(`href="${e.name}">`,`href="${e.name}" aria-current="page">`);
 if(['index.html','updates.html','schumann.html','roadmap.html'].includes(e.name))html=html.replace('<main class="wrap" id="main">','<main class="wrap" id="main"><aside class="notice"><strong>Six-round cross-link review</strong><p><a href="contact.html">Occult sources, Schumann resonance and ET-attributed communications</a> · <a href="contact-methods.html">Executed controls and prospective protocol</a></p></aside>');
 await writeFile(p,html);
}
const deployment=JSON.parse(await readFile(new URL('deployment.json',out),'utf8'));
deployment.contactReview={date:data.date,status:data.status,rounds:data.rounds.length,panelists:4,dedicatedWorkers:2,physicalContactEvidence:'not established',newPhysicalMeasurements:0};
await writeFile(new URL('deployment.json',out),JSON.stringify(deployment,null,2)+'\n');
const files={};async function walk(p){for(const e of await readdir(p,{withFileTypes:true})){const q=join(p,e.name);if(e.isDirectory())await walk(q);else if(relative(out.pathname,q)!=='build-manifest.json')files[relative(out.pathname,q)]=createHash('sha256').update(await readFile(q)).digest('hex');}}
await walk(out.pathname);await writeFile(new URL('build-manifest.json',out),JSON.stringify({commit:deployment.commit,files},null,2)+'\n');
console.log(`Added two contact-review pages; ${data.rounds.length} rounds; ${Object.keys(files).length} manifest files.`);

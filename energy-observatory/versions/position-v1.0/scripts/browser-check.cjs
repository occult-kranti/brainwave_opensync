/* External QA dependency: Playwright. Set NODE_PATH or install it locally outside this project. */
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const prefix='/brainwave_opensync/devices/position/';
const out=process.env.POSITION_QA_OUTPUT||'/tmp/position-browser-qa';
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.md':'text/plain','.py':'text/plain','.zip':'application/zip'};
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(!u.pathname.startsWith(prefix)){res.writeHead(404);return res.end();}
 let p=path.resolve(root,decodeURIComponent(u.pathname.slice(prefix.length))||'index.html');
 if(!p.startsWith(root+path.sep)||!fs.existsSync(p)){res.writeHead(404);return res.end();}
 if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');
 if(!fs.existsSync(p)){res.writeHead(404);return res.end();}
 res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});res.end(fs.readFileSync(p));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${server.address().port}${prefix}`;
 const browser=await chromium.launch({executablePath:process.env.POSITION_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-vulkan','--no-zygote','--single-process']});
 const page=await browser.newPage({acceptDownloads:true}); const errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  await page.setViewportSize(viewport);await page.goto(url,{waitUntil:'networkidle'});
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'horizontal page overflow');
  assert.equal(await page.locator('img').evaluateAll(xs=>xs.some(x=>!x.complete||x.naturalWidth===0)),false,'broken diagram image');
  await page.screenshot({path:path.join(out,`home-${viewport.width}.png`)});
  const sections=await page.locator('section[id]').evaluateAll(xs=>xs.map(x=>x.id));
  for(const id of sections){await page.locator('#'+id).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:path.join(out,`${id}-${viewport.width}.png`)});}
  checks.push({viewport,sections,overflow:false});
 }
 const interactions=[];
 await page.setViewportSize({width:1440,height:1000});await page.goto(url,{waitUntil:'networkidle'});
 assert.equal(await page.locator('.source-record').count(),28);
 assert.match(await page.locator('#modes').innerText(),/166\.551/);
 await page.locator('#radius').fill('25');await page.locator('#model-form button[type=submit]').click();
 assert.match(await page.locator('#modes').innerText(),/83\.276/);
 await page.locator('#radius').fill('0');await page.locator('#model-form button[type=submit]').click();
 assert.equal(await page.locator('#radius').evaluate(el=>el.checkValidity()),false);
 assert.match(await page.locator('#modes').innerText(),/83\.276/);
 await page.locator('#reset').click();assert.match(await page.locator('#modes').innerText(),/166\.551/);interactions.push('radius scaling; invalid input rejected; reset');
 await page.locator('#position').fill('0');await page.locator('#position').dispatchEvent('input');
 assert.match(await page.locator('#spectrum-caption').innerText(),/166\.55 to 166\.55/);
 await page.locator('#position').fill('100');await page.locator('#position').dispatchEvent('input');
 assert.match(await page.locator('#spectrum-caption').innerText(),/166\.55 to 367\.10/);
 await page.locator('#scenario').selectOption('contact');
 assert.match(await page.locator('#spectrum-caption').innerText(),/Added-spring toy/);interactions.push('position and support scenario update spectrum');
 await page.locator('#sample-rate').fill('48');await page.locator('#sampling-form button').click();assert.match(await page.locator('#sampling-result').innerText(),/Revise/);
 await page.locator('#sample-rate').fill('1000');await page.locator('#band').fill('100');await page.locator('#sampling-form button').click();assert.match(await page.locator('#sampling-result').innerText(),/outside/);
 await page.locator('#reset').click();assert.match(await page.locator('#sampling-result').innerText(),/Numeric checks pass/);interactions.push('Nyquist and mode-band failures displayed');
 await page.locator('#source-search').fill('OpenAI');assert.equal(await page.locator('.source-record').count(),2);
 await page.locator('#source-search').fill('unmatchable-source-xyz');assert.equal(await page.locator('.source-record').count(),0);
 await page.locator('#source-search').fill('');await page.locator('#source-filter').selectOption('tools');assert.ok(await page.locator('.source-record').count()>0);
 await page.locator('#topic-select').selectOption('position-hypothesis');assert.match(await page.locator('#topic-detail').innerText(),/UNRESOLVED/);
 const graphNode=page.locator('.graph-node').first();const id=await graphNode.getAttribute('data-source');await graphNode.focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#source-'+id+' details').evaluate(el=>el.open),true);interactions.push('source search/filter; unresolved topic; keyboard graph navigation');
 const downloadEvent=page.waitForEvent('download');await page.locator('#export-model').click();const download=await downloadEvent;
 const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(exported.parameters.radiusMm,12.5);assert.match(exported.status,/synthetic/);assert.equal(exported.result.frequenciesHz.length,3);interactions.push('model JSON download parsed');
 await page.locator('#topic-select').selectOption('elastic-modes');await page.locator('#network-graph').screenshot({path:path.join(out,'graph-detail.png')});
 for(const name of ['src/evidence.json','src/model.mjs','research/protocol.md','research/derivation.md','analysis/analyze.py','analysis/README.md','source.zip','deployment.json']){
  const response=await page.request.get(url+name);assert.equal(response.status(),200,name);
 }
 assert.deepEqual(errors,[]);
 const report={status:'passed',mode:'render-routes-and-interactions',checks,interactions,errors,urlPrefix:prefix};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 await browser.close();await new Promise(resolve=>server.close(resolve));
})().catch(e=>{console.error(e);server.close();process.exit(1);});

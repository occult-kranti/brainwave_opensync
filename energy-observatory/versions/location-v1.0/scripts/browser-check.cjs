/* Optional browser integration test. Install playwright-core separately.
 * SPHERE_CHROMIUM can point to an existing Chromium executable.
 * This script tests the built site under its actual deployment prefix. */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const {chromium} = require('playwright-core');
const root = path.resolve(__dirname, '../dist');
const prefix = '/brainwave_opensync/devices/location/';
const out = process.env.SPHERE_TEST_OUTPUT || '/tmp/sphere-browser-check';
const mime = {'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.md':'text/markdown','.py':'text/plain'};
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/favicon.ico'){res.writeHead(204);return res.end();}
  if(!url.pathname.startsWith(prefix)){res.writeHead(404);return res.end();}
  let file=path.resolve(root,decodeURIComponent(url.pathname.slice(prefix.length))||'index.html');
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true,...(process.env.SPHERE_CHROMIUM?{executablePath:process.env.SPHERE_CHROMIUM}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({acceptDownloads:true,serviceWorkers:'block'});
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});
  const page=await context.newPage();
  page.setDefaultTimeout(10000);
  const runtimeErrors=[],checks=[],screenshots=[];
  page.on('pageerror',e=>runtimeErrors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)runtimeErrors.push(`${r.status()} ${r.url()}`);});
  async function check(name,fn){try{await fn();checks.push({name,passed:true});}catch(e){checks.push({name,passed:false,error:e.message});}}
  async function ready(){await page.waitForFunction(()=>document.querySelector('#frequency-a')?.textContent.trim()!=='—');}
  async function noOverflow(){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page has horizontal overflow');}
  async function readoutsFit(){
    const overflow=await page.locator('.readouts strong').evaluateAll(nodes=>nodes.flatMap(el=>{const range=document.createRange();range.selectNodeContents(el);const text=range.getBoundingClientRect(),cell=el.parentElement.getBoundingClientRect();return text.left<cell.left-1||text.right>cell.right+1?[el.id]:[]}));
    assert.deepEqual(overflow,[],'numeric readouts overflow their cells');
  }
  async function shot(name){const file=path.join(out,name+'.png');await page.screenshot({path:file});screenshots.push(file);}
  async function download(id,label){const [file]=await Promise.all([page.waitForEvent('download'),page.locator(id).click()]);const destination=path.join(out,label+'-'+file.suggestedFilename());await file.saveAs(destination);return fs.readFileSync(destination,'utf8');}
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
    const tag=`${viewport.width}`;
    await page.setViewportSize(viewport);
    await page.goto(origin+prefix,{waitUntil:'networkidle'});
    await ready();
    await check(`${tag}: first render`,async()=>{
      assert.ok(!(await page.locator('#frequency-a').innerText()).includes('NaN'));
      assert.equal(await page.locator('#response-chart svg').count(),1);
      await noOverflow();
      await readoutsFit();
      const chart=await page.locator('#response-chart').boundingBox(),svg=await page.locator('#response-chart svg').boundingBox();
      assert.ok(svg.x>=chart.x-1&&svg.x+svg.width<=chart.x+chart.width+1,'chart full frequency range is cropped');
    });
    await shot(`home-${tag}`);
    await check(`${tag}: five scenarios`,async()=>{
      const presets=await page.locator('#preset option').evaluateAll(els=>els.map(e=>e.value));
      assert.equal(presets.length,5);
      for(const preset of presets){await page.locator('#preset').selectOption(preset);await ready();assert.equal(await page.locator('#input-error').isVisible(),false,preset);assert.ok(!(await page.locator('.readouts').innerText()).includes('NaN'),preset);await readoutsFit();}
    });
    await check(`${tag}: invalid input and recovery`,async()=>{
      await page.locator('#radiusMm').fill('0');await page.locator('#radiusMm').blur();
      assert.ok(await page.locator('#input-error').isVisible() || Number(await page.locator('#radiusMm').inputValue())>0,'invalid radius was accepted');
      await page.locator('#reset').click();await ready();
      assert.equal(await page.locator('#input-error').isVisible(),false);
    });
    await check(`${tag}: thin-shell applicability warning`,async()=>{
      await page.locator('#geometry').selectOption('shell');
      await page.locator('#radiusMm').fill('10');await page.locator('#radiusMm').blur();
      await page.locator('#thicknessMm').fill('1');await page.locator('#thicknessMm').blur();
      assert.equal(await page.locator('#model-warning').isVisible(),true);
      assert.match(await page.locator('#model-warning').innerText(),/0\.05/);
      await page.locator('#reset').click();
    });
    await check(`${tag}: sphere and empty-table channels`,async()=>{
      await page.locator('#preset').selectOption('support');
      const sphere=await page.locator('#response-chart').innerHTML();
      await page.locator('#plot-channel').selectOption('table');
      assert.notEqual(await page.locator('#response-chart').innerHTML(),sphere);
      assert.match(await page.locator('#channel-explanation').innerText(),/table/i);
      assert.equal(await page.locator('#input-error').isVisible(),false);
      await page.locator('#plot-channel').selectOption('sphere');
    });
    await check(`${tag}: raw exports`,async()=>{
      const run=JSON.parse(await download('#export-json',tag));
      assert.ok(run.parameters,'run needs input parameters');
      assert.ok(run.result,'run needs outputs');
      assert.match(run.status,/simulation/);
      assert.equal(run.result.frequencyHz.length,run.result.responseA.length);
      assert.equal(run.result.frequencyHz.length,run.result.tablePointResponseA.length);
      const csv=await download('#export-csv',tag);
      assert.ok(csv.split('\n').length>100,'CSV contains spectrum samples');
      assert.match(csv,/frequency/i);
      assert.ok(!csv.includes('NaN')&&!csv.includes('Infinity'),'exports contain finite values');
      const row=csv.trim().split('\n')[1].split(',').map(Number);
      assert.equal(row.length,5);
      assert.equal(row[0],run.result.frequencyHz[0]);
      assert.equal(row[1],run.result.responseA[0]);
      assert.equal(row[3],run.result.tablePointResponseA[0]);
    });
    await check(`${tag}: share URL round trip`,async()=>{
      await page.locator('#preset').selectOption('temperature');
      const before=await page.locator('#tempDeltaK').inputValue();
      await page.locator('#share').click();
      const share=await page.evaluate(()=>navigator.clipboard.readText());
      assert.ok(share.startsWith(origin+prefix));
      await page.goto(share,{waitUntil:'networkidle'});await ready();
      assert.equal(await page.locator('#tempDeltaK').inputValue(),before);
    });
    await page.locator('#response-chart').scrollIntoViewIfNeeded();await shot(`spectrum-${tag}`);
    await check(`${tag}: keyboard tabs`,async()=>{
      await page.locator('#tab-experiment').focus();await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#tab-network').getAttribute('aria-selected'),'true');
    });
    await page.locator('#tab-network').click();
    await check(`${tag}: network and text fallback`,async()=>{
      await page.waitForFunction(()=>document.querySelector('#network-graph')?.children.length>0);
      await page.locator('.network-text summary').click();
      assert.ok((await page.locator('#network-list').innerText()).length>50);
      await page.locator('.network-text summary').click();
      for(const value of ['physics','ai','claim','all'])await page.locator('#graph-filter').selectOption(value);
      const first=page.locator('#network-graph [data-node]').first();
      const label=await first.getAttribute('aria-label');await first.click();
      assert.ok((await page.locator('#network-detail').innerText()).includes(label.replace(/^Inspect /,'')));
      await page.locator('#network-graph [data-node]').last().focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator('#network-graph .node.selected').count(),1);
      await noOverflow();
    });
    await page.locator('#network-graph').scrollIntoViewIfNeeded();await shot(`network-${tag}`);
    await page.locator('#tab-protocol').click();
    await check(`${tag}: protocol diagrams and source filter`,async()=>{
      await page.locator('#source-list').waitFor();
      const full=(await page.locator('#source-list').innerText()).length;assert.ok(full>100);
      await page.locator('#source-search').fill('OpenAI');assert.ok((await page.locator('#source-list').innerText()).length>10);
      await page.locator('#source-search').fill('nonexistent_zzzzzz');assert.ok((await page.locator('#source-list').innerText()).length<100);
      await page.locator('#source-search').fill('');
      for(const img of await page.locator('#panel-protocol img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());assert.ok(await img.evaluate(e=>e.naturalWidth>0));}
      await noOverflow();
    });
    await page.locator('.setup-figure').first().scrollIntoViewIfNeeded();await shot(`protocol-${tag}`);
  }
  const report={browser:await browser.version(),checks,runtimeErrors,screenshots,passed:checks.every(c=>c.passed)&&runtimeErrors.length===0};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
  process.exitCode=report.passed?0:1;
})().catch(error=>{console.error(error);server.close();process.exit(1);});

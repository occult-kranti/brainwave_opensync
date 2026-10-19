/* Optional integration check. Install Playwright separately, then set DEVICE_CHROMIUM
 * if using a non-default Chromium. No dependency is shipped to the public site. */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../dist');
const prefix = '/brainwave_opensync/devices/';
const mime = { '.html':'text/html', '.mjs':'text/javascript', '.css':'text/css', '.png':'image/png', '.json':'application/json', '.md':'text/markdown' };
const out = process.env.DEVICE_TEST_OUTPUT || '/tmp/device-observatory-browser';
fs.mkdirSync(out,{recursive:true});
const server = http.createServer((req,res)=>{
  const url = new URL(req.url,'http://localhost');
  if(!url.pathname.startsWith(prefix)){res.writeHead(404);return res.end();}
  let file = path.resolve(root,decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html');
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true,...(process.env.DEVICE_CHROMIUM?{executablePath:process.env.DEVICE_CHROMIUM}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({acceptDownloads:true,serviceWorkers:'block'});
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});
  const page=await context.newPage();
  const errors=[];const reports=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  async function download(action){
    const [file]=await Promise.all([page.waitForEvent('download'),page.locator(`[data-action="${action}"]`).click()]);
    const dest=path.join(out,file.suggestedFilename());await file.saveAs(dest);return fs.readFileSync(dest,'utf8');
  }
  async function noOverflow(label){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${label}: horizontal overflow`);}
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    await page.goto(origin+prefix,{waitUntil:'networkidle'});
    await page.locator('#model-metrics .metric').first().waitFor();
    assert.equal(await page.locator('.source-row').count(),34);
    assert.equal(await page.locator('.hypothesis').count(),9);
    assert.equal(await page.locator('.connection').count(),9);
    assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&i.naturalWidth>0).length),2);
    await noOverflow('home');
    await page.screenshot({path:path.join(out,`home-${viewport.width}.png`)});
    for(const device of ['rlc','array','absorber']){
      await page.locator(`[data-device="${device}"]`).click();
      const presets=await page.locator('#experiment-preset optgroup option').evaluateAll(options=>options.map(x=>x.value));
      assert.equal(presets.length,3);
      for(const preset of presets){
        await page.locator('#experiment-preset').selectOption(preset);
        assert.equal(await page.locator('.simulation-error').count(),0);
        assert.ok(!(await page.locator('#model-metrics').innerText()).includes('NaN'));
        assert.equal(await page.locator('#bench input').evaluateAll(inputs=>inputs.filter(i=>!i.validity.valid).length),0,`${preset} native validity`);
      }
      const json=JSON.parse(await download('json'));
      assert.equal(json.result.modelId,device);assert.equal(json.build.sourceCommit.length,40);
      const csv=await download('csv');assert.ok(csv.startsWith('type,name,x,y,value,unit_or_axis'));
      if(device==='array'){assert.ok(csv.includes('map,Relative pressure²'));assert.ok(json.result.map.values.length>4000);}
      await noOverflow(device);
      await page.locator('.visual-panel').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(out,`${device}-${viewport.width}.png`)});
    }
    await page.locator('[data-action="reset"]').click();
    const oldTuning=await page.locator('#number-tuningRatio').inputValue();
    await page.locator('[data-action="design-search"]').click();
    await page.locator('[data-action="apply-search"]').waitFor();
    assert.equal(await page.locator('#number-tuningRatio').inputValue(),oldTuning,'search must not apply silently');
    assert.ok((await page.locator('#search-output').innerText()).includes('81 candidates'));
    const search=JSON.parse(await download('export-search'));
    assert.equal(search.result.trials.length,81);assert.ok(search.result.heldOutImprovement);
    await page.locator('[data-action="apply-search"]').click();
    assert.equal(Number(await page.locator('#number-tuningRatio').inputValue()),search.result.best.parameters.tuningRatio);
    assert.equal(await page.locator('#bench input').evaluateAll(inputs=>inputs.filter(i=>!i.validity.valid).length),0);
    await page.locator('[data-action="share"]').click();
    const shareUrl=await page.evaluate(()=>navigator.clipboard.readText());
    await page.goto(shareUrl,{waitUntil:'networkidle'});
    assert.equal(await page.locator('[data-device="absorber"]').getAttribute('aria-selected'),'true');
    assert.equal(Number(await page.locator('#number-tuningRatio').inputValue()),search.result.best.parameters.tuningRatio);
    await page.locator('#number-tuningRatio').fill('99');await page.locator('#number-tuningRatio').blur();
    assert.equal(Number(await page.locator('#number-tuningRatio').inputValue()),search.result.best.parameters.tuningRatio);
    await page.locator('#source-search').fill('Newton');assert.ok(await page.locator('.source-row').count()>=3);
    await page.locator('#source-search').fill('nonexistent__needle');assert.equal(await page.locator('.source-row').count(),0);
    await page.locator('#source-search').fill('');
    await page.locator('#source-kind').selectOption('Patent');assert.ok(await page.locator('.source-row').count()>0);
    await noOverflow('filtered library');
    await page.locator('[data-device="rlc"]').click();await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[data-device="array"]').getAttribute('aria-selected'),'true');
    reports.push({viewport,checks:'3 models / 9 presets, source filters, 6 numerical exports, search record + optional apply, clipboard URL round trip, invalid input rejection, keyboard tabs, images, no overflow'});
  }
  for(const file of ['research/evidence.json','research/device-observatory-dossier.md','deployment.json','src/models.mjs','code/tests/review.test.mjs']){
    const response=await page.request.get(origin+prefix+file);assert.equal(response.status(),200,file);
  }
  assert.deepEqual(errors,[]);
  const report={reports,errors};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
})().catch(error=>{console.error(error);server.close();process.exit(1);});

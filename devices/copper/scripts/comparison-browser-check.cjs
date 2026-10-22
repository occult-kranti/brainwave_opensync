/* Optional Playwright gate for the new subpage under the real project base. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist'),prefix='/brainwave_opensync/devices/copper/';
const out=process.env.COMPARISON_QA_OUTPUT||'/tmp/copper-comparison-browser';
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.md':'text/plain','.py':'text/plain','.zip':'application/zip'};
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/favicon.ico'){res.writeHead(204);return res.end()}
 if(!pathname.startsWith(prefix)){res.writeHead(404);return res.end()}
 let file=path.resolve(root,decodeURIComponent(pathname.slice(prefix.length))||'index.html');
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end()}
 if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404);return res.end()}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`,base=origin+prefix;
 const browser=await chromium.launch({headless:true,...(process.env.COPPER_CHROMIUM?{executablePath:process.env.COPPER_CHROMIUM}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({acceptDownloads:true}),errors=[],checks=[];
 await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 page.on('pageerror',error=>errors.push(error.message));
 page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)errors.push(`${response.status()} ${response.url()}`)});
 page.setDefaultTimeout(15000);
 async function check(name,fn){try{await fn();checks.push({name,passed:true})}catch(error){checks.push({name,passed:false,error:error.message})}}
 const receipt=JSON.parse(fs.readFileSync(path.join(root,'research/claude-comparison.json')));
 const pin=JSON.parse(fs.readFileSync(path.join(root,'imports/claude-source.json')));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===390?844:1000});
  await check(`overview and matched reference case at ${width}px`,async()=>{
   await page.goto(base,{waitUntil:'networkidle'});
   await page.getByRole('link',{name:'Read the Claude comparison →',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('#comparison-status').textContent.includes('numerical checks passed'));
   assert.equal(await page.locator('#main-nav a[aria-current=page]').textContent(),'Claude comparison');
   assert.match(await page.locator('#comparison-status').innerText(),new RegExp(`${receipt.checks.length} numerical checks`));
   assert.match(await page.locator('#exact-hz').innerText(),/23,916\.18/);
   assert.match(await page.locator('#membrane-hz').innerText(),/23,914\.51/);
   assert.match(await page.locator('#comparison-chart svg').getAttribute('aria-label'),/deformation.*9,943/);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page-wide horizontal overflow');
   await page.screenshot({path:path.join(out,`comparison-${width}.png`),fullPage:true});
   await page.locator('#comparison-case').selectOption('existing');
   assert.match(await page.locator('#exact-hz').innerText(),/23,318\.13/);
   assert.match(await page.locator('#membrane-hz').innerText(),/23,317\.72/);
   assert.match(await page.locator('#difference-hz').innerText(),/0\.407/);
   assert.match(await page.locator('#case-inputs').innerText(),/89\.4 mm/);
  });
  await check(`preserved source viewer and return navigation at ${width}px`,async()=>{
   await page.goto(base+'experiments/frequency-of-place/',{waitUntil:'networkidle'});
   await page.locator('[aria-label="Import review"]').waitFor();
   assert.ok(await page.locator('img').evaluateAll(images=>images.every(x=>x.complete&&x.naturalWidth>0)));
   const before=await page.locator('html').getAttribute('data-theme');
   await page.locator('#themeBtn').click();
   assert.notEqual(await page.locator('html').getAttribute('data-theme'),before);
   await page.screenshot({path:path.join(out,`claude-viewer-${width}.png`)});
   await page.getByRole('link',{name:'Read the checked OpenSync comparison →',exact:true}).click();
   await page.locator('#comparison-case').waitFor();
  });
 }
 await check('all comparison links, exact original and download resolve under the project base',async()=>{
  await page.goto(base+'comparison.html',{waitUntil:'networkidle'});
  const links=await page.locator('main a[href]').evaluateAll(links=>links.map(x=>x.href));
  for(const link of new Set(links.filter(url=>url.startsWith(base))))assert.equal((await page.request.get(link)).status(),200,link);
  const original=await page.request.get(base+'experiments/frequency-of-place/original-index.html');
  const expected=pin.originals.find(x=>x.path==='experiments/frequency-of-place/index.html').sha256;
  assert.equal(crypto.createHash('sha256').update(await original.body()).digest('hex'),expected);
  const pending=page.waitForEvent('download');await page.getByRole('link',{name:'Download comparison data ↘',exact:true}).click();
  const download=await pending;
  assert.deepEqual(JSON.parse(fs.readFileSync(await download.path())),receipt);
 });
 assert.deepEqual(errors,[]);
 const report={browser:await browser.version(),prefix,checks,errors,passed:checks.every(x=>x.passed)&&errors.length===0};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
 await browser.close();await new Promise(resolve=>server.close(resolve));process.exitCode=report.passed?0:1;
})().catch(error=>{console.error(error);server.close();process.exitCode=1});

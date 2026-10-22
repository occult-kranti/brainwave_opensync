import { BUILD_INFO } from './build-info.mjs';
import { simulateComparison } from './models.mjs';
import { solidRadialModes, groundedPointSpringDiagnostics } from './modal-diagnostics.mjs';
import { finiteModalDiagnostics, nuisanceDesignDiagnostics, globalAliasDiagnostics } from './design-diagnostics.mjs';
import { initializeAcquisition } from './acquisition-ui.mjs';
import { createRun, downloadJSON, downloadRunBundle, csvText } from './run-export.mjs';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const text = value => typeof value === 'string' ? value : value == null ? '' : Array.isArray(value) ? value.map(text).join(' · ') : JSON.stringify(value);
const num = (x, digits = 3) => Number.isFinite(x) ? new Intl.NumberFormat('en-US', {maximumFractionDigits:digits}).format(x) : '—';
const hz = x => Number.isFinite(x) ? `${num(Math.abs(x) >= 1000 ? x / 1000 : x)} ${Math.abs(x) >= 1000 ? 'kHz' : 'Hz'}` : '—';
const safeURL = value => {try {const u = new URL(value, location.href); return ['https:','http:'].includes(u.protocol) ? u.href : '#';} catch {return '#';}};
let toastTimer;
function toast(message) {$('toast').textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').textContent = '', 4500);}
const pages = [['index','Overview'],['models','Models'],['comparison','Claude comparison'],['design','Design'],['acquisition','Acquisition'],['protocol','Protocol'],['gateway','Gateway'],['sources','Sources'],['versions','Versions']];
const page = document.documentElement.dataset.page;
$('main-nav').innerHTML = pages.map(([id,label]) => `<a href="./${id === 'index' ? 'index' : id}.html" ${id === page ? 'aria-current="page"' : ''}>${label}</a>`).join('');
$('version-tag').textContent = `${BUILD_INFO.version || BUILD_INFO.appVersion || BUILD_INFO.modelVersion || 'Integrated workspace'} · ${String(BUILD_INFO.sourceCommit || 'development').slice(0,12)} →`;

async function json(path) {const r = await fetch(path); if (!r.ok) throw Error(`Research record unavailable (${r.status}): ${path}`); return r.json();}
function paragraphs(value) {return (Array.isArray(value) ? value : value == null ? [] : [value]).map(p => `<p>${esc(text(p))}</p>`).join('');}
function links(value) {return (value || []).map(x => `<a href="${esc(safeURL(x.href || x.url || x.path || '#'))}">${esc(x.label || x.title || x.name || x.href || 'Read the record')} ↗</a>`).join('');}
function renderSections(value) {
  if (!value) return '<p>The linked research record provides the full scope and methods.</p>';
  const sections = value.sections || [];
  return paragraphs(value.body) + sections.map(s => `<section><h3>${esc(s.title || '')}</h3>${paragraphs(s.body)}${s.items?.length ? `<ul>${s.items.map(i => `<li>${esc(text(i))}</li>`).join('')}</ul>` : ''}${s.links?.length ? `<div class="link-list">${links(s.links)}</div>` : ''}</section>`).join('') + (value.links?.length ? `<div class="link-list">${links(value.links)}</div>` : '');
}
if ($('page-content')) {
  json('./data/content.json').then(data => {$('page-content').innerHTML = renderSections(data[$('page-content').dataset.content]);}).catch(e => {$('page-content').innerHTML = `<p class="error">${esc(e.message)}. The source archive remains linked on the Versions page.</p>`;});
}

const STORE = 'fieldwork-copper-applied-model/1';
const BRIDGE_BLOCKED = 'fieldwork-copper-bridge-storage-blocked/1';
let bridgeStorageBlocked = window.name === BRIDGE_BLOCKED;
const defaults = {geometry:'shell',radiusMm:44.45,thicknessMm:.5,positionA:.15,positionB:.75,coupling:0,tempDeltaK:0,receiver:'comoving',tableRatio:.9};
function readStored() {try {return JSON.parse(localStorage.getItem(STORE) || 'null');} catch {return null;}}
function store(record) {
  try {localStorage.setItem(STORE, JSON.stringify(record));bridgeStorageBlocked=false;if(window.name===BRIDGE_BLOCKED)window.name='';}
  catch {bridgeStorageBlocked=true;window.name=BRIDGE_BLOCKED;try{localStorage.removeItem(STORE);}catch{}toast('Browser storage is unavailable; cross-page model transfer is disabled until a new run can be saved.');}
}
function sameModelBuild(build) {return build?.sourceCommit === BUILD_INFO.sourceCommit && build?.modelSHA256 === BUILD_INFO.modelSHA256;}
function bridgeRecord() {
  const saved = readStored();
  if (bridgeStorageBlocked || window.name === BRIDGE_BLOCKED) return {valid:false,reason:'Saving the current model failed. Cross-page transfer is blocked until a valid run can be saved on the Models page.'};
  if (!saved || saved.state !== 'valid' || !sameModelBuild(saved.build)) return {valid:false,reason:saved?.state === 'dirty' || saved?.state === 'invalid' ? 'Model inputs changed or are invalid. Apply valid conditions on the Models page first.' : 'Apply a model on the Models page in this workspace version before importing it.'};
  try {
    if(typeof saved.runId!=='string'||!/^([a-f0-9]{64})$/.test(saved.runId))throw Error('Missing or malformed model run identity.');
    const result = simulateComparison(saved.parameters);
    if (!Number.isFinite(result.intrinsicHzA) || result.intrinsicHzA !== saved.frequencyHz) throw Error('Stored model does not match its parameters.');
    return {valid:true,frequencyHz:result.intrinsicHzA,runId:saved.runId,parameters:saved.parameters,build:saved.build};
  } catch {return {valid:false,reason:'The stored run is invalid. Apply valid model conditions again.'};}
}

function plotResponse(result, channel) {
  const table = channel === 'table', a = table ? result.tablePointResponseA : result.responseA, b = table ? result.tablePointResponseB : result.responseB;
  const frequency = result.frequencyHz, width = Math.max(280,Math.floor($('response-chart').clientWidth)), left = 48, right = width-14, top = 24, bottom = 240;
  const maximum = Math.max(...a,...b,Number.MIN_VALUE), low = frequency[0], high = frequency.at(-1);
  const x = f => left + (f-low)/(high-low)*(right-left), y = v => bottom - v/maximum*(bottom-top);
  const path = values => values.map((v,i) => `${i?'L':'M'}${x(frequency[i]).toFixed(2)},${y(v).toFixed(2)}`).join(' ');
  let grid = '';
  for (let i=0;i<=4;i++) {const yy=bottom-i*(bottom-top)/4;grid+=`<line x1="${left}" x2="${right}" y1="${yy}" y2="${yy}" stroke="#527463" stroke-width=".6"/><text x="${left-10}" y="${yy+4}" text-anchor="end" fill="#d6e2ce" font-size="10">${(i/4).toFixed(2)}</text>`;}
  const ticks=width<500?2:4;
  for (let i=0;i<=ticks;i++) {const f=low+(high-low)*i/ticks;grid+=`<text x="${x(f)}" y="263" text-anchor="middle" fill="#d6e2ce" font-size="10">${num(f/1000,1)}</text>`;}
  return `<svg viewBox="0 0 ${width} 295" role="img" aria-label="Simulated ${table?'empty-table':'sphere'} response at A and B; frequency kHz; shared relative amplitude"><title>Declared A/B response, simulations only</title>${grid}<path d="${path(a)}" fill="none" stroke="#a6d9b8" stroke-width="2"/><path d="${path(b)}" fill="none" stroke="#e7a373" stroke-width="2" stroke-dasharray="6 4"/><text x="${(left+right)/2}" y="286" text-anchor="middle" fill="#d6e2ce" font-size="10">Cyclic frequency (kHz)</text><text transform="translate(15 135) rotate(-90)" text-anchor="middle" fill="#d6e2ce" font-size="10">Shared relative amplitude</text></svg>`;
}
async function initializeModels() {
  let run = null, result = null, parameters = {...defaults}, valid = false, generation = 0;
  const form = $('mechanics-form'); form.noValidate = true;
  function draft() {return Object.fromEntries(Object.keys(defaults).map(key => [key,$(key).value]));}
  function fields(values) {for (const [key,value] of Object.entries(values)) if ($(key)) $(key).value=value; geometry();}
  function geometry() {$('thickness-field').hidden=$('geometry').value!=='shell';$('thicknessMm').disabled=$('geometry').value!=='shell';$('radius-kind').textContent=$('geometry').value==='shell'?'at mid-surface':'outer radius';}
  function mark(state,message) {valid=state==='valid';$('model-state').dataset.state=state;$('model-state').textContent=message;for(const id of ['model-export-json','model-export-zip','modal-apply'])$(id).disabled=!valid;}
  function values() {
    const next={};
    for(const [key,fallback] of Object.entries(defaults)) {
      if(key==='thicknessMm' && $('geometry').value==='solid') {next[key]=.5;continue;}
      const input=$(key);if(!input.checkValidity())throw Error(`Check ${input.labels?.[0]?.textContent.trim() || key}: ${input.validationMessage}`);
      next[key]=typeof fallback==='number'?Number(input.value):input.value;
    }
    return next;
  }
  function display() {
    $('frequency-a').textContent=hz(result.intrinsicHzA);$('frequency-b').textContent=hz(result.intrinsicHzB);$('frequency-delta').textContent=hz(result.intrinsicHzB-result.intrinsicHzA);$('delta-ppm').textContent=`${num((result.intrinsicHzB/result.intrinsicHzA-1)*1e6)} ppm`;
    const channel=$('plot-channel').value;$('response-chart').innerHTML=plotResponse(result,channel);
    $('channel-explanation').textContent=channel==='table'?'Empty-table local point-force/displacement receptance in m/N; the same assumed table pole is viewed through different modal weights. This is not the coupled table response to sphere force.':`Sphere projected displacement per generalized force in m/N. ${parameters.receiver==='fixed'?'Fixed-receiver projection changes visibility.':'The co-moving receiver has matched unit projection.'}`;
    $('mode-summary').innerHTML=`<table><thead><tr><th>Declared output</th><th>A</th><th>B</th></tr></thead><tbody><tr><td>Coupled natural modes</td><td>${result.coupledHzA.map(hz).join(' / ')}</td><td>${result.coupledHzB.map(hz).join(' / ')}</td></tr><tr><td>Geometric mass</td><td colspan="2">${num(result.geometricMassKg*1000)} g</td></tr></tbody></table>`;
    $('shell-warning').hidden=result.model.thinShellApplicable!==false;$('shell-warning').textContent='Exploratory thin-shell result: thickness/radius exceeds the preferred 0.05 range. This cutoff is not an absolute error guarantee.';
    $('model-notes').innerHTML=result.notes.map(n=>`<li>${esc(n)}</li>`).join('');
  }
  async function modal() {
    if(!valid)return;
    try {
      if(!$('contactNpm').checkValidity())throw Error('Enter a finite nonnegative contact stiffness in the stated range.');
      const m=groundedPointSpringDiagnostics({radiusM:parameters.radiusMm/1000,contactNpm:Number($('contactNpm').value)}),f=m.free;
      $('modal-error').hidden=true;
      $('modal-results').innerHTML=`<div class="table-scroll"><table><thead><tr><th>Radial mode</th><th>Free frequency</th><th>Modal mass</th><th>Free fₙ/f₁</th><th>Grounded contact</th><th>Shift</th><th>Ratio change</th></tr></thead><tbody>${f.frequencyHz.map((v,i)=>`<tr><td>l = 0 · ${i+1}</td><td class="numeric">${hz(v)}</td><td class="numeric">${num(f.modalMassKg[i]*1000)} g</td><td class="numeric">${num(f.ratiosToFirst[i],6)}</td><td class="numeric">${hz(m.coupledFrequencyHz[i])}</td><td class="numeric">${num(m.frequencyShiftHz[i])} Hz</td><td class="numeric">${num(m.ratioChange[i],8)}</td></tr>`).join('')}</tbody></table></div><p class="microcopy">Grounded point spring: k = ${num(m.contactNpm)} N/m. Contact stiffness is k·11ᵀ, not three independent springs. Eigenvalue residual: ${Number(m.eigensolver.maxRelativeResidual).toExponential(2)}. Frequencies are undamped natural values.</p><details><summary>Compare the earlier independent-spring teaching model</summary><p>${esc(m.legacyIndependentSpring.label)}</p><p>Its shifted frequencies: ${m.legacyIndependentSpring.frequencyHz.map(hz).join(' / ')}. This comparison uses the legacy illustrative mass assumption; it is not an alternate validated apparatus.</p></details>`;
    } catch(e) {$('modal-error').textContent=e.message;$('modal-error').hidden=false;}
  }
  async function apply(next=null,{keepDirty=false}={}) {
    const ticket=++generation; mark('pending','Calculating and binding the applied run…');
    try {
      const p=next || values(),r=simulateComparison(p);
      const made=await createRun({kind:'mechanical-comparison',parameters:p,result:r,units:{frequency:'Hz',sphereResponse:'magnitude in m/N; projected displacement per generalized force; no phase exported',emptyTableResponse:'magnitude in m/N; local point displacement per local point force; no phase exported',mass:'kg',radiusInput:'mm',wallThicknessInput:'mm',temperatureDifference:'K',position:'x/L dimensionless'},notes:['Raw response arrays retain units; the plot alone uses a common maximum.','No physical measurements. The table is a selected single-mode reduction.']});
      if(ticket!==generation)return;
      parameters={...p};result=r;run=made;display();$('model-error').hidden=true;
      if(keepDirty)mark('dirty','Displayed curves are the last applied run. Inputs have changed; apply valid conditions before export or transfer.');
      else {mark('valid',`Applied run ${run.runId.slice(0,12)} · raw quantities and source hashes are preserved.`);store({state:'valid',parameters,frequencyHz:r.intrinsicHzA,runId:run.runId,build:run.build});await modal();}
    } catch(e) {if(ticket!==generation)return;mark('invalid','Invalid conditions. The previous chart is retained for reference; export and model transfer are blocked.');$('model-error').textContent=e.message;$('model-error').hidden=false;store({state:'invalid',parameters,draft:draft(),build:BUILD_INFO});}
  }
  form.addEventListener('input',()=>{generation++;geometry();mark('dirty','Inputs changed. Apply valid conditions before exporting or transferring this model.');store({state:'dirty',parameters,draft:draft(),build:BUILD_INFO});});
  form.addEventListener('submit',e=>{e.preventDefault();apply();});
  $('plot-channel').addEventListener('change',()=>{if(result)display();});
  $('modal-form').addEventListener('submit',e=>{e.preventDefault();modal();});
  $('model-reset').addEventListener('click',()=>{fields(defaults);$('model-preset').value='null';apply();});
  $('model-preset').addEventListener('change',()=>{const presets={null:{},support:{coupling:.15,positionA:.08,positionB:.5},temperature:{tempDeltaK:1},receiver:{receiver:'fixed',positionA:.05,positionB:.5},solid:{geometry:'solid',radiusMm:10}};fields({...defaults,...presets[$('model-preset').value]});apply();});
  $('model-export-json').addEventListener('click',()=>{if(valid&&run)downloadJSON(`mechanics-${run.runId.slice(0,12)}.json`,run);});
  $('model-export-zip').addEventListener('click',async()=>{if(!valid||!run)return;try {const exporting=run,ticket=generation;await downloadRunBundle(exporting,{'responses.csv':csvText(['run_id','frequency_Hz','sphere_A_magnitude_m_per_N','sphere_B_magnitude_m_per_N','empty_table_A_magnitude_m_per_N','empty_table_B_magnitude_m_per_N'],result.frequencyHz.map((f,i)=>[run.runId,f,result.responseA[i],result.responseB[i],result.tablePointResponseA[i],result.tablePointResponseB[i]]))},'mechanics',()=>valid&&run===exporting&&ticket===generation);toast('Raw responses and their JSON provenance downloaded together.');}catch(e){toast(e.message);}});
  if('ResizeObserver' in window){let observedWidth=0;new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(result&&width>0&&Math.abs(width-observedWidth)>1){observedWidth=width;requestAnimationFrame(display);}}).observe($('response-chart'));}
  const saved=readStored();
  if(saved&&sameModelBuild(saved.build)&&saved.state!=='valid') {fields({...defaults,...saved.draft});await apply({...defaults,...saved.parameters},{keepDirty:true});}
  else {fields(saved&&sameModelBuild(saved.build)?{...defaults,...saved.parameters}:defaults);await apply();}
}

function initializeDesign() {
  function finite() {
    const which=$('design-preset').value,r=finiteModalDiagnostics({sensorPositions:which==='center'?[.5]:[.5,.25],drivePositions:which==='both'?[.5,.25]:[.5]});
    $('finite-results').innerHTML=`<div class="metric-grid"><div><span>TEMPORAL OBSERVABILITY</span><strong>${r.observability.rank} / ${r.stateDimension}</strong><p>${r.observability.stateNullity} unresolved state dimensions.</p></div><div><span>CONTROLLABILITY</span><strong>${r.controllability.rank} / ${r.stateDimension}</strong><p>${r.controllability.stateNullity} unreachable state dimensions.</p></div><div><span>RETAINED MODEL</span><strong>${r.modeCount} modes</strong><p>Dimensionless sine basis; not Lamb-sphere mode shapes.</p></div></div><p class="scope-copy">${esc(r.finiteModelScope)} ${esc(r.noisyConditioningLimit)}</p><p class="microcopy">Rank tolerance ${r.observability.tolerance}; scaling: ${esc(r.observability.scaling.method)}. This scaling is not physical noise weighting.</p>`;
    $('finite-kernels').innerHTML=`<p>Observability kernel directions in the declared state coordinates:</p><pre>${esc(JSON.stringify(r.observability.kernel,null,2))}</pre><p>Controllability: ${esc(r.controllability.kernelMeaning)}</p><pre>${esc(JSON.stringify(r.controllability.kernel,null,2))}</pre>`;
  }
  function nuisance() {
    const r=nuisanceDesignDiagnostics({design:$('nuisance-preset').value});
    $('nuisance-results').innerHTML=`<div class="metric-grid"><div><span>DESIGN RANK</span><strong>${r.rank} / ${r.columns.length}</strong><p>${r.nullity} unresolved coefficient directions.</p></div><div><span>POSITION TARGET</span><strong>${r.locationTargetEstimable?'Estimable':'Confounded'}</strong><p>Conditional on this named linear family.</p></div><div><span>SCALING AND TOLERANCE</span><strong>${r.tolerance.toExponential(0)}</strong><p>${esc(r.scaling.method)}</p></div></div><p class="scope-copy">${esc(r.finiteModelScope)} ${esc(r.noisyConditioningLimit)}</p>`;
    $('nuisance-kernel').innerHTML=`<p>Column order: ${esc(r.columns.join(', '))}. Kernel coefficients show changes that leave fitted values unchanged.</p><pre>${esc(JSON.stringify(r.kernel,null,2))}</pre><div class="table-scroll"><table><thead><tr>${r.columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.matrix.map(row=>`<tr>${row.map(x=>`<td class="numeric">${num(x,5)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  finite();nuisance();$('design-preset').addEventListener('change',finite);$('nuisance-preset').addEventListener('change',nuisance);
  const a=globalAliasDiagnostics();$('alias-results').innerHTML=`<div class="metric-grid"><div><span>MAXIMUM POLE DIFFERENCE</span><strong>${num(a.maxPoleDifferenceHz)} Hz</strong></div><div><span>MAXIMUM RESPONSE DIFFERENCE</span><strong>${num(a.maxResponseDifference)}</strong></div><div><span>UNIQUE LOCALIZATION</span><strong>Unresolved</strong></div></div><p class="scope-copy">${esc(a.reason)} ${esc(a.scope)} ${esc(a.inference)}</p>`;
}

async function initializeSources() {
  try {
    const [raw,g]=await Promise.all([json('./data/sources.json'),json('./data/graph.json')]),sources=Array.isArray(raw)?raw:raw.sources;
    const sourceMap=new Map(sources.map(s=>[s.id,s])),nodes=g.nodes||[],edges=g.edges||[],names=new Map(nodes.map(n=>[n.id,n.label||n.title||n.id]));
    const allText=s=>JSON.stringify(s).toLowerCase();
    function sourcesView() {
      const query=$('source-search').value.trim().toLowerCase(),group=$('source-group').value,shown=sources.filter(s=>(group==='all'||s.group===group)&&allText(s).includes(query));
      $('source-count').textContent=`${shown.length} / ${sources.length} works · ${sources.reduce((n,s)=>n+(s.observations?.length||0),0)} observations`;
      $('source-list').innerHTML=shown.map(s=>`<article class="source-record" id="source-${esc(s.id)}"><div class="source-meta">${esc((s.group||'source').toUpperCase())}<br>${s.observations?.length||0} preserved observations</div><div>${(s.observations||[]).some(o=>o.urlRole==='attribution-locator')?`<h3>${esc(s.title)}</h3><p><a href="${esc(safeURL(s.url))}" target="_blank" rel="noopener">Open the report attribution locator ↗</a> · Original work unread; this link is not the book itself.</p>`:`<h3><a href="${esc(safeURL(s.url))}" target="_blank" rel="noopener">${esc(s.title)} ↗</a></h3>`}${paragraphs(s.description)}<details><summary>Reading depth, claims and limits by version</summary>${(s.observations||[]).map(o=>`<div class="observation"><p class="microcopy">${esc(o.origin||o.sourceBranch||'Source observation')}</p><dl>${Object.entries(o).filter(([k,v])=>v!=null&&!['origin','originalRecord','rawRecord'].includes(k)).map(([k,v])=>`<dt>${esc(k.replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll('_',' '))}</dt><dd>${esc(text(v))}</dd>`).join('')}</dl></div>`).join('')}<p class="microcopy">Aliases: ${esc((s.aliases||[]).map(text).join(' · '))}</p></details></div></article>`).join('')||'<p class="empty">No works match these terms. Reading-depth and original-ID text are included in the search.</p>';
    }
    function graphView(id) {
      const n=nodes.find(n=>n.id===id)||nodes[0];if(!n)return;
      $('graph-select').value=n.id;
      const related=edges.filter(e=>e.source===n.id||e.target===n.id),neighbors=[...new Set(related.map(e=>e.source===n.id?e.target:e.source))],shown=neighbors.slice(0,12);
      $('graph-count').textContent=`${nodes.length} nodes · ${edges.length} typed edges`;
      const source=sourceMap.get(n.sourceId||n.id),svgRows=Math.max(1,Math.ceil(shown.length/2)),height=Math.max(360,svgRows*77+55),centerY=height/2;
      let paths='',buttons='';
      shown.forEach((other,i)=>{const left=i%2===0,x=left?15:455,y=25+Math.floor(i/2)*77,from=left?215:455;paths+=`<path d="M${from} ${y+27} C${left?265:405} ${y+27},${left?260:410} ${centerY},${left?275:395} ${centerY}" stroke="#91a38e" fill="none"/>`;const label=names.get(other)||other;buttons+=`<g class="graph-node" tabindex="0" role="button" data-graph-node="${esc(other)}" aria-label="Inspect ${esc(label)}"><title>${esc(label)}</title><rect x="${x}" y="${y}" width="200" height="55" fill="#faf8f2" stroke="#acb9a4"/><text x="${x+12}" y="${y+22}" fill="#244d40" font-size="11">${esc(label.length>29?label.slice(0,26)+'…':label)}</text><text x="${x+12}" y="${y+40}" fill="#8b5134" font-size="8">SELECT TO INSPECT CONNECTIONS</text></g>`;});
      $('network-graph').innerHTML=`<svg viewBox="0 0 670 ${height}" role="group" aria-label="Selected node with ${shown.length} neighboring nodes"><title>${esc(names.get(n.id))} relationships</title>${paths}<rect x="275" y="${centerY-41}" width="120" height="82" fill="#285644"/><text x="335" y="${centerY-5}" text-anchor="middle" fill="#f7f3e9" font-size="10">SELECTED NODE</text><text x="335" y="${centerY+16}" text-anchor="middle" fill="#d7e3cb" font-size="9">${esc(n.group||n.type||'topic')}</text>${buttons}</svg>`;
      const relationList=related.map(e=>{const other=e.source===n.id?e.target:e.source,evidence=(e.sourceIds||[e.sourceId]).filter(Boolean);return `<li><strong>${esc(e.relation||e.type||'connects')}</strong> · ${esc(names.get(other)||other)}<br><span class="microcopy">Type: ${esc(e.type||'declared relation')} · Origin: ${esc(text(e.originalOrigin||e.origin||'project graph'))}</span>${e.label?`<br>${esc(e.label)}`:''}${e.scope?`<br>Scope: ${esc(text(e.scope))}`:''}${e.evaluationNote?`<br>Evaluation: ${esc(text(e.evaluationNote))}`:''}${evidence.length?`<br>Evidence: ${evidence.map(id=>`<a href="#source-${esc(id)}">${esc(sourceMap.get(id)?.title||id)}</a>`).join('; ')}`:''}</li>`;}).join('');
      $('network-detail').innerHTML=`<p class="eyebrow">${esc((n.group||n.type||'topic').toUpperCase())}</p><h3>${esc(names.get(n.id))}</h3>${paragraphs(n.description||source?.description)}<p>${related.length} typed relationships. ${shown.length} neighboring nodes shown; the complete relationship list is below.</p>${source?`<a class="microcopy" href="#source-${esc(source.id)}">Read every source observation ↓</a>`:''}<p class="microcopy">${esc(g.scope||'Source relationships describe bounded uses, not universal physical support.')}</p>`;
      $('network-list').innerHTML=`<ul>${relationList||'<li>No edges for this node.</li>'}</ul>`;
      for(const el of $('network-graph').querySelectorAll('[data-graph-node]')){el.onclick=()=>graphView(el.dataset.graphNode);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();graphView(el.dataset.graphNode);$('graph-select').focus();}};}
    }
    $('graph-select').innerHTML=nodes.map(n=>`<option value="${esc(n.id)}">${esc(n.label||n.title||n.id)}</option>`).join('');
    $('source-search').addEventListener('input',sourcesView);$('source-group').addEventListener('change',sourcesView);$('graph-select').addEventListener('change',()=>graphView($('graph-select').value));
    const group=new URLSearchParams(location.search).get('group');if([...$('source-group').options].some(o=>o.value===group))$('source-group').value=group;
    document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#source-"]');if(!link)return;event.preventDefault();$('source-group').value='all';$('source-search').value='';sourcesView();const target=document.getElementById(link.getAttribute('href').slice(1));if(target){const details=target.querySelector('details');if(details)details.open=true;target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}});
    sourcesView();graphView(nodes.find(n=>/measurement|spectrum/i.test(n.label||''))?.id||nodes[0]?.id);
  } catch(e) {$('source-error').hidden=false;$('source-error').textContent=e.message;$('source-list').innerHTML='<p class="empty">Read the source register and archive through the Versions page.</p>';}
}

async function initializeVersions() {
  $('build-record').innerHTML=`<p class="eyebrow">CURRENT INTEGRATED BUILD</p><h3>${esc(BUILD_INFO.version||BUILD_INFO.appVersion||BUILD_INFO.modelVersion||'Copper experiment workspace')}</h3><p class="commit">Source commit: ${esc(BUILD_INFO.sourceCommit)}<br>Mechanics SHA256: ${esc(BUILD_INFO.modelSHA256||'See deployment manifest')}<br>Acquisition SHA256: ${esc(BUILD_INFO.acquisitionSHA256||'See deployment manifest')}</p><p class="microcopy">Imported source pins are retained below and in every run export.</p><pre>${esc(JSON.stringify(BUILD_INFO.sourcePins||{},null,2))}</pre>`;
  const results=await Promise.allSettled([json('./data/versions.json'),json('./data/issues.json'),json('./data/panel.json')]);
  if(results[0].status==='fulfilled') {const raw=results[0].value,versions=Array.isArray(raw)?raw:raw.versions||[];$('versions-list').innerHTML=versions.map(v=>`<article class="version-card"><p class="source-meta">${esc(v.id)} · ${esc(v.date||'')}</p><h3>${esc(v.title||v.id)}</h3><p class="commit">${esc(v.sourceBranch||'')}<br>${esc(v.sourceCommit||'See snapshot manifest')}</p>${v.issues?.length?`<ul>${v.issues.map(i=>`<li>${esc(text(i))}</li>`).join('')}</ul>`:''}<a class="button secondary" href="${esc(safeURL(v.path))}">Open this preserved version ↗</a></article>`).join('');}else $('versions-list').innerHTML='<p class="error">The version register could not be loaded.</p>';
  if(results[1].status==='fulfilled') {const raw=results[1].value,issues=Array.isArray(raw)?raw:raw.issues||[];$('issues-list').innerHTML=issues.map(i=>`<article class="issue-row"><p class="eyebrow">${esc(i.id)} · ${esc(i.status||'recorded')} · ${esc(i.severity||'')}</p><h3>${esc(i.title)}</h3>${paragraphs(i.detail||i.description)}<p class="microcopy">Origin: ${esc(text(i.origin||i.version||''))}</p></article>`).join('');}else $('issues-list').innerHTML='<p class="error">The issue register could not be loaded.</p>';
  if(results[2].status==='fulfilled') {const p=results[2].value;$('panel-record').innerHTML=paragraphs(p.status)+`<div class="table-scroll"><table><thead><tr><th>Seat</th><th>Actual role / provenance</th></tr></thead><tbody>${(p.seats||[]).map(s=>`<tr><td>${esc(s.id||s.seat||s.name||'')}</td><td>${esc(text(s.role||s.description||s))}<br><span class="microcopy">${esc(s.agent||'AI model-agent')}</span><br>${['round1','round2','round3'].filter(k=>s[k]).map(k=>`<a class="microcopy" href="${esc(safeURL(s[k]))}">${k.replace('round','Round ')} record</a>`).join(' · ')} </td></tr>`).join('')}</tbody></table></div>`+(p.rounds||[]).map(r=>`<section><h3>${esc(r.title||r.name||`Round ${r.round||r.id||''}`)}</h3>${paragraphs(r.summary||r.status||r.body)}${r.decision?`<a class="microcopy" href="${esc(safeURL(r.decision))}">Advisor decision ↗</a>`:''}</section>`).join('')+paragraphs(p.limits);}else $('panel-record').innerHTML='<p class="error">The panel record could not be loaded.</p>';
}

try {
  if(page==='models')await initializeModels();
  if(page==='design')initializeDesign();
  if(page==='acquisition')initializeAcquisition({getSphereRun:bridgeRecord,notify:toast});
  if(page==='sources')await initializeSources();
  if(page==='versions')await initializeVersions();
} catch(e) {const p=document.createElement('p');p.className='wrap error';p.setAttribute('role','alert');p.textContent=`This tool could not initialize: ${e.message}. Source and research records remain available on the Versions page.`;$('main').prepend(p);}

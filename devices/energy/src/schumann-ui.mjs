import {idealCavityModes,wavelengthReference,magneticEnergyReference,dampedMode,modeResponse,harmonicEnergyBudget,positiveSpectralWeight} from './schumann-model.mjs';
const $=id=>document.getElementById(id), root=new URL('../',import.meta.url);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(n,d=3)=>Number(n).toLocaleString('en-US',{maximumFractionDigits:d}), exp=n=>n===0?'0':n.toExponential(5);
const metric=(label,value,unit='')=>`<div><span class="sr-label">${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(unit)}</small></div>`;
const table=(heads,rows)=>`<div class="sr-table-scroll"><table class="sr-table"><thead><tr>${heads.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const colors=['#126b66','#bd4d28','#786689'];
function chart({title,series,xmin,xmax,ymax=1,xlabel='Frequency (Hz)',ylabel='Normalized PSD',xticks,threshold}){
 const W=850,H=310,L=66,T=25,R=24,B=56,x=v=>L+(v-xmin)/(xmax-xmin)*(W-L-R),y=v=>H-B-v/ymax*(H-B-T);
 const ticks=xticks??Array.from({length:6},(_,i)=>[xmin+(xmax-xmin)*i/5,num(xmin+(xmax-xmin)*i/5,1)]);
 let out=`<div class="sr-chart-scroll"><svg class="sr-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>`;
 for(let i=0;i<=5;i++){const v=ymax*i/5;out+=`<path d="M${L},${y(v)}H${W-R}" stroke="#dcded6"/><text x="${L-12}" y="${y(v)+4}" text-anchor="end">${num(v,2)}</text>`;}
 for(const [v,label] of ticks)out+=`<text x="${x(v)}" y="${H-B+22}" text-anchor="middle">${esc(label)}</text>`;
 if(threshold!==undefined)out+=`<path d="M${L},${y(threshold)}H${W-R}" stroke="#96422d" stroke-width="1.5" stroke-dasharray="6 5"/>`;
 for(const [i,s] of series.entries())out+=`<polyline points="${s.points.map(([a,b])=>`${x(a).toFixed(2)},${y(b).toFixed(2)}`).join(' ')}" fill="none" stroke="${colors[i%3]}" stroke-width="2.5" ${s.dashed?'stroke-dasharray="5 4"':''}/>`;
 out+=`<text x="${(L+W-R)/2}" y="${H-7}" text-anchor="middle">${esc(xlabel)}</text><text x="15" y="${(T+H-B)/2}" text-anchor="middle" transform="rotate(-90 15 ${(T+H-B)/2})">${esc(ylabel)}</text></svg></div><div class="sr-legend">${series.map((s,i)=>`<span><i class="sr-dot" style="background:${colors[i%3]}"></i>${esc(s.name)}</span>`).join('')}</div>`;
 return out;
}
async function json(path){const response=await fetch(new URL(path,root));if(!response.ok)throw new Error(`Could not load ${path} (${response.status})`);return response.json();}
function geometry(){const radiusM=Number($('sr-radius').value)*1000,frequencyHz=Number($('sr-reference-frequency').value),modes=idealCavityModes({radiusM});
 $('sr-geometry-metrics').innerHTML=metric('Ideal first mode',num(modes[0].frequencyHz,5),'Hz · lossless shell')+metric('Vacuum c/f reference',num(wavelengthReference({frequencyHz}).wavelengthM/1000,2),'km · speed-dependent')+metric('Circumference',num(2*Math.PI*radiusM/1000,2),'km');
 $('sr-mode-table').innerHTML=table(['Degree ℓ','Ideal frequency / Hz','Horizontal scale / km'],modes.map(m=>[m.degree,num(m.frequencyHz,4),num(m.horizontalWavelengthM/1000,2)]));
}
function response(){const naturalFrequencyHz=Number($('sr-f0').value),q=Number($('sr-q').value),gammaPerS=Math.PI*naturalFrequencyHz/q,readout=$('sr-readout').value,colored=$('sr-color').value==='colored';
 const mode=dampedMode({naturalFrequencyHz,gammaPerS}),end=Math.max(20,naturalFrequencyHz*2),count=4000,step=end/count;
 const base=[],changed=[];for(let i=0;i<=count;i++){const f=i*step,h=modeResponse({frequencyHz:f,naturalFrequencyHz,gammaPerS});const v=readout==='velocity'?h.velocityPsdPerForcePsd:h.displacementPsdPerForcePsd;base.push([f,v]);changed.push([f,v*(colored?positiveSpectralWeight({frequencyHz:f,referenceHz:naturalFrequencyHz,scaleHz:naturalFrequencyHz,tilt:2}):1)]);}
 const max=a=>a.reduce((m,p)=>p[1]>m[1]?p:m,a[0]),bmax=max(base),cmax=max(changed);
 $('sr-response-metrics').innerHTML=metric('Natural frequency',num(naturalFrequencyHz,4),'Hz · fixed in this comparison')+metric('Selected sampled maximum',num(cmax[0],4),`Hz · ${cmax[0]===0||cmax[0]===end?'band endpoint':'interior grid point'}`)+metric('Free ringdown',mode.ringdownFrequencyHz===null?'Nonoscillatory':num(mode.ringdownFrequencyHz,4),mode.ringdownFrequencyHz===null?'real characteristic poles':'Hz · same physical poles');
 $('sr-response-plot').innerHTML=chart({title:'Synthetic white and selected forcing response, each normalized to its own maximum',series:[{name:'Flat source',points:base.map(([f,v])=>[f,v/bmax[1]])},{name:colored?'Colored source':'Selected: flat source',points:changed.map(([f,v])=>[f,v/cmax[1]]),dashed:!colored}],xmin:0,xmax:end});
 $('sr-response-note').textContent=`Each curve is normalized separately to show shape; absolute PSD levels are not compared. Selected ${readout} readout. Full oscillator transfer stays fixed between curves; changing Q in the form changes its poles. Finite model scan: 0–${num(end)} Hz, ${num(step,6)} Hz steps; grid spacing is not experimental uncertainty. ${colored?'Source-PSD multiplier exp[2(f−f₀)/f₀], positive and bounded on this finite band.':'White-force analytic maximum: '+num(readout==='velocity'?mode.velocityPeakHz:mode.displacementPeakHz,6)+' Hz.'}`;
}
function energy(){const a=magneticEnergyReference({fieldRmsT:Number($('sr-static-b').value)*1e-6}),b=magneticEnergyReference({fieldRmsT:Number($('sr-elf-b').value)*1e-12});
 $('sr-energy-metrics').innerHTML=metric('Static magnetic density',exp(a.energyDensityJPerM3),'J/m³')+metric('Perturbation mean density',exp(b.energyDensityJPerM3),'J/m³ · zero-mean RMS');
 const budget=harmonicEnergyBudget({frequencyHz:8,naturalFrequencyHz:8,gammaPerS:Math.PI*8/5,massKg:1,forcePeakN:1});
 $('sr-budget-result').textContent=`Separate mechanical example: m = 1 kg, f₀ = drive = 8 Hz, Q = 5, force peak = 1 N. Mean input ${exp(budget.averageInputW)} W; viscous loss ${exp(budget.averageDissipationW)} W. This balance does not calibrate an ELF antenna or collector.`;
}
async function observations(){const [noaa,gfz,summary]=await Promise.all([json('research/schumann-openai-2026-10-29/panel/observations/noaa-kp.json'),json('research/schumann-openai-2026-10-29/panel/observations/gfz-kp.json'),json('research/schumann-openai-2026-10-29/panel/observations/observation-summary.json')]);
 const start=Date.parse('2026-10-23T00:00:00Z'),end=Date.parse('2026-10-29T03:00:00Z'),h=3600000;
 const filter=rows=>rows.filter(([t,v])=>t>=start&&t+3*h<=end&&Number.isFinite(v)).map(([t,v])=>[(t-start)/h,v]);
 const a=filter(noaa.map(r=>[Date.parse(r.time_tag+'Z'),r.Kp])),b=filter(gfz.datetime.map((t,i)=>[Date.parse(t),gfz.Kp[i]]));
 $('sr-kp-plot').innerHTML=chart({title:'Separate NOAA estimated and GFZ preliminary Kp snapshots, October 23–29, 2026; 49 completed intervals each',series:[{name:'NOAA estimated',points:a},{name:'GFZ preliminary',points:b,dashed:true}],xmin:0,xmax:(end-start)/h,ymax:6,threshold:5,xlabel:'UTC · 2026 · interval start',ylabel:'Kp',xticks:Array.from({length:7},(_,i)=>[i*24,'Oct '+(23+i)])});
 const days=summary.sources.NOAA.seven_day_window.days;
 $('sr-kp-table').innerHTML=table(['UTC date','Completed 3-hour bins','NOAA daily max','GFZ daily max'],days.map((d,i)=>[d.date+(!d.full_day?' (partial)':''),d.complete_bins,num(d.maximum,3),num(summary.sources.GFZ.seven_day_window.days[i].maximum,3)]))+`<p class="sr-small"><a href="https://kp.gfz.de/">GFZ Potsdam data</a>: <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Both saved series retain preliminary/estimated status. Snapshot cutoff ${esc(summary.cutoff_utc)}. Lines join interval estimates for readability; they do not add finer time resolution.</p>`;
}
function network(d){const filter=$('sr-edge-filter').value,edges=d.network.edges.filter(e=>filter==='all'||e.type===filter),active=new Set(edges.flatMap(e=>[e.from,e.to]));const nodes=new Map(d.network.nodes.map(n=>[n.id,n]));
 const color={supports:'#126b66',tests:'#786689','missing-bridge':'#bd4d28','context-only':'#78847c'};
 let svg='<div class="sr-chart-scroll"><svg class="sr-network" viewBox="0 0 1000 590" role="img" aria-label="Typed research relationships; full edge descriptions follow in the table"><defs><marker id="sr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#78847c"/></marker></defs>';
 for(const e of edges){const a=nodes.get(e.from),b=nodes.get(e.to);svg+=`<path d="M${a.x+200} ${a.y+30} C${a.x+260} ${a.y+30},${b.x-55} ${b.y+30},${b.x-7} ${b.y+30}" fill="none" stroke="${color[e.type]}" stroke-width="2" ${e.type==='missing-bridge'?'stroke-dasharray="7 5"':''} marker-end="url(#sr-arrow)"><title>${esc(e.reason)}</title></path>`;}
 for(const n of nodes.values())svg+=`<a href="${esc(n.url)}"><g opacity="${filter==='all'||active.has(n.id)?1:.35}"><rect x="${n.x}" y="${n.y}" width="200" height="62" rx="4" fill="#f7f5ed" stroke="#5c7970"/><text x="${n.x+13}" y="${n.y+26}" font-size="15" fill="#183f3b">${esc(n.label)}</text><text x="${n.x+13}" y="${n.y+46}" font-size="12" fill="#52645f">${esc(n.detail)}</text></g></a>`;
 $('sr-network-view').innerHTML=svg+'</svg></div>';
 $('sr-edge-table').innerHTML=table(['Source → target','Relationship','Bridge or limitation'],edges.map(e=>[`${esc(nodes.get(e.from).label)} → ${esc(nodes.get(e.to).label)}`,`<span class="sr-badge">${esc(e.type)}</span>`,esc(e.reason)]));
}
function guard(fn){return (...args)=>{try{fn(...args);if($('sr-error'))$('sr-error').hidden=true;}catch(e){if($('sr-error')){$('sr-error').textContent=e.message;$('sr-error').hidden=false;}else console.error(e);}};}
try{const d=await json('data/october-update.json');
 if($('sr-edge-filter')){$('sr-edge-filter').addEventListener('change',()=>network(d));network(d);}
 if($('sr-geometry-form')){
  for(const [id,fn] of [['sr-geometry-form',geometry],['sr-response-form',response],['sr-energy-form',energy]]){$(id).addEventListener('submit',e=>{e.preventDefault();guard(fn)();});guard(fn)();}
  await observations();
  $('sr-inverse-results').innerHTML=table(['Executed control','Result','Scope'],(d.inverseResults??[]).map(r=>[esc(r.case),esc(r.result),esc(r.scope)]));
  $('sr-export').addEventListener('click',()=>{const state={date:d.date,kind:'synthetic-model-state',units:{radius:'km',frequency:'Hz',background:'microtesla',perturbation:'picotesla RMS'},values:Object.fromEntries(['sr-radius','sr-reference-frequency','sr-f0','sr-q','sr-readout','sr-color','sr-static-b','sr-elf-b'].map(id=>[id,$(id).value])),scope:'No new station measurements, no verified recent Schumann anomaly, no power extraction claim.',evidenceCoverage:d.coverage,source:'Fieldwork Schumann dashboard'};const u=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='schumann-model-state.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
 }
}catch(e){if($('sr-error')){$('sr-error').textContent=e.message;$('sr-error').hidden=false;}console.error(e);}

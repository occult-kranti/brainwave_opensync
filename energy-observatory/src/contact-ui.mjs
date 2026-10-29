import {receiver} from '../research/schumann-contact-2026-10-29/analysis/round2/model.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=await fetch('data/contact-review.json').then(r=>{if(!r.ok)throw Error('Research data unavailable');return r.json()});
const graph=document.querySelector('#ct-network');
if(graph){
 const positions=new Map(data.network.nodes.map(n=>[n.id,{x:25+n.column*238,y:35+n.row*108}]));
 const render=()=>{const type=document.querySelector('#ct-edge-filter').value,edges=data.network.edges.filter(e=>type==='all'||e.type===type);
 const lines=edges.map(e=>{const a=positions.get(e.from),b=positions.get(e.to);return `<path class="ct-edge ${esc(e.type)}" d="M${a.x+102} ${a.y+30} L${b.x+102} ${b.y+30}"><title>${esc(e.reason)}</title></path>`}).join('');
 const nodes=data.network.nodes.map(n=>{const p=positions.get(n.id);return `<a href="${esc(n.href)}"><rect class="ct-node" x="${p.x}" y="${p.y}" width="205" height="62" rx="6"/><text x="${p.x+12}" y="${p.y+25}">${esc(n.label)}</text><text x="${p.x+12}" y="${p.y+45}" style="font-size:10px">${esc(n.kind)}</text></a>`}).join('');
 graph.innerHTML=`<svg class="ct-network" viewBox="0 0 970 465" role="img" aria-label="Typed evidence network; full edge explanations in the table below">${lines}${nodes}</svg>`;
 document.querySelector('#ct-edge-count').textContent=edges.length+' of '+data.network.edges.length+' documented relations';
 const name=id=>data.network.nodes.find(n=>n.id===id).label;
 document.querySelector('#ct-network-table').innerHTML=`<div class="ct-table-wrap"><table class="ct-table"><thead><tr><th>From → to</th><th>Relation</th><th>Evidence and limit</th></tr></thead><tbody>${edges.map(e=>`<tr><td>${esc(name(e.from))} → ${esc(name(e.to))}</td><td>${esc(e.type)}</td><td>${esc(e.reason)}<br><a href="${esc(e.source)}">Source / artifact ↗</a></td></tr>`).join('')}</tbody></table></div>`;
 };document.querySelector('#ct-edge-filter').addEventListener('change',render);render();
}
const form=document.querySelector('#ct-coil-form');let current;
if(form){const number=id=>Number(document.getElementById(id).value),fmt=(x,scale,unit)=>`${(x*scale).toPrecision(6)} ${unit}`;
 const calculate=event=>{event?.preventDefault();const error=document.querySelector('#ct-coil-error');error.textContent='';
 try{const inputs={frequencyHz:number('ct-f'),magneticRmsT:number('ct-b')*1e-12,turns:number('ct-n'),areaM2:number('ct-a'),angleDeg:number('ct-angle'),resistanceOhm:number('ct-r'),temperatureK:number('ct-t'),bandwidthHz:number('ct-bw')};const result=receiver(inputs);current={kind:'synthetic-ideal-receiver',inputs,result,physicalMeasurements:0,contactEstablished:false,scope:'Ideal acquisition arithmetic; metadata and simulated outputs do not establish detectability, biology or sender.'};
 document.querySelector('#ct-coil-results').innerHTML=[[fmt(result.signal.voltageRmsV,1e9,'nV'),'Ideal induced voltage / RMS'],[fmt(result.noise.voltageRmsV,1e9,'nV'),'Resistor-only thermal voltage / RMS'],[result.equivalentMagneticNoiseRmsT===null?'Undefined':fmt(result.equivalentMagneticNoiseRmsT,1e15,'fT'),'Equivalent field for this toy noise']].map(([value,label])=>`<div class="ct-result"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('');
 document.querySelector('#ct-coil-note').textContent=result.signal.sensitivityVPerT>0?'Nonzero ideal induction sensitivity. This is not a detection result or an identified environmental source.':'Zero ideal induction sensitivity at this geometry/frequency. Inverting the voltage to a field is undefined; this does not imply the ambient field is absent.';
 }catch(e){current=null;error.textContent=e.message;document.querySelector('#ct-coil-results').innerHTML='';}};
 form.addEventListener('submit',calculate);calculate();document.querySelector('#ct-export').addEventListener('click',()=>{if(!current)return;const u=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='schumann-ideal-receiver.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
}

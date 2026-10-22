import { ACQUISITION_PRESETS, DEFAULT_ACQUISITION, simulateAcquisition, compareFrequencyUncertainty } from './acquisition.mjs';

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const format=(value,digits=3)=>Number.isFinite(value)?new Intl.NumberFormat('en-US',{maximumFractionDigits:digits}).format(value):'—';
const hz=value=>Number.isFinite(value)?`${format(Math.abs(value)>=1000?value/1000:value)} ${Math.abs(value)>=1000?'kHz':'Hz'}`:'No nonzero bin';
const clone=value=>JSON.parse(JSON.stringify(value));

function exportFile(name,data,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

// Preserve extrema per screen bucket so a narrow FFT peak is not skipped.
function envelopePoints(xValues,yValues,min,max,pixels){
 const buckets=new Map();for(let i=0;i<xValues.length;i++){const x=xValues[i];if(x<min||x>max)continue;const bucket=Math.floor((x-min)/(max-min)*pixels);const prior=buckets.get(bucket);if(!prior)buckets.set(bucket,{lo:i,hi:i});else{if(yValues[i]<yValues[prior.lo])prior.lo=i;if(yValues[i]>yValues[prior.hi])prior.hi=i;}}
 return [...new Set([...buckets.values()].flatMap(({lo,hi})=>[lo,hi]))].sort((a,b)=>a-b).map(i=>[xValues[i],yValues[i]]);
}

export function initializeAcquisition({getSphereFrequency=()=>null,notify=()=>{},buildInfo={}}={}){
 let state=clone(DEFAULT_ACQUISITION),result=null,uncertainty=null,uncertaintyParameters=null;
 const fields={sampleRateHz:'acq-sample-rate',sampleCount:'acq-sample-count',window:'acq-window',noiseRms:'acq-noise'};
 $('acq-preset').innerHTML=ACQUISITION_PRESETS.map((p,i)=>`<option value="${esc(p.id)}">${String(i+1).padStart(2,'0')} · ${esc(p.title)}</option>`).join('');
 $('acq-sample-rate').step='any';$('acq-sample-rate').min='1000';$('acq-sample-rate').max='2000000';$('acq-noise').max='1000';$('acq-noise').step='any';
 function populate(){
  for(const[key,id]of Object.entries(fields))$(id).value=state[key];
  $('acq-mode-fields').innerHTML=state.modes.map((mode,i)=>`<fieldset class="acq-mode"><legend>Component ${i+1}</legend><label>Frequency (Hz)<input data-mode="${i}" data-parameter="frequencyHz" type="number" min="0" max="5000000" step="any" value="${mode.frequencyHz}" required></label><label>Amplitude<input data-mode="${i}" data-parameter="amplitude" type="number" min="0" max="1000" step="0.01" value="${mode.amplitude}" required></label><label>Decay rate (s⁻¹)<input data-mode="${i}" data-parameter="decayRatePerSecond" type="number" min="0" max="1000000" step="any" value="${mode.decayRatePerSecond}" required></label></fieldset>`).join('');
 }
 function read(){
  const values=clone(state);for(const[key,id]of Object.entries(fields)){const field=$(id);if(!field.checkValidity())throw Error(`Check ${field.labels?.[0]?.textContent.trim()||key}. ${field.validationMessage}`);values[key]=key==='window'?field.value:Number(field.value);}
  for(const field of $('acq-mode-fields').querySelectorAll('input')){if(!field.checkValidity())throw Error(`Check component ${Number(field.dataset.mode)+1}: ${field.labels?.[0]?.textContent.trim()}.`);values.modes[Number(field.dataset.mode)][field.dataset.parameter]=Number(field.value);}
  return values;
 }
 function drawSpectrum(){
  if(!result)return;const shell=$('acq-spectrum');if(shell.clientWidth===0)return;
  const width=Math.max(280,shell.clientWidth-14),left=48,right=width-15,top=25,bottom=237;
  let min=0,max=result.nyquistHz;
  if($('acq-view').value==='detail'){
   const modes=result.foldedModeHz.filter((f,i)=>state.modes[i].amplitude>0);const centers=modes.length?modes:[result.dominantBinHz??result.nyquistHz/2];
   const margin=Math.max(result.binSpacingHz*12,(Math.max(...centers)-Math.min(...centers))*.4,result.nyquistHz*.006);
   min=Math.max(0,Math.min(...centers)-margin);max=Math.min(result.nyquistHz,Math.max(...centers)+margin);if(max<=min){min=0;max=result.nyquistHz;}
  }
  const xx=f=>left+(f-min)/(max-min)*(right-left);
  let maxAmplitude=0;for(let i=0;i<result.frequencyHz.length;i++)if(result.frequencyHz[i]>=min&&result.frequencyHz[i]<=max)maxAmplitude=Math.max(maxAmplitude,result.spectrumAmplitude[i]);maxAmplitude=Math.max(maxAmplitude,1e-12)*1.08;
  const yy=a=>bottom-Math.max(0,a)/maxAmplitude*(bottom-top);
  const points=envelopePoints(result.frequencyHz,result.spectrumAmplitude,min,max,Math.floor(right-left));
  const line=points.map(([f,a],i)=>`${i?'L':'M'}${xx(f).toFixed(2)},${yy(a).toFixed(2)}`).join(' ');
  const ticks=width<500?2:4,scale=max>=1000?1000:1;let grid='';
  for(let i=0;i<=4;i++){const a=maxAmplitude*i/4,y=yy(a);grid+=`<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="#45655b" stroke-width=".7"/><text x="${left-7}" y="${y+4}" text-anchor="end" fill="#d2dfcf" font-size="10" font-family="monospace">${a<.01&&a>0?a.toExponential(1):format(a,2)}</text>`;}
  for(let i=0;i<=ticks;i++){const f=min+(max-min)*i/ticks;grid+=`<text x="${xx(f)}" y="${bottom+21}" text-anchor="middle" fill="#d2dfcf" font-size="11" font-family="monospace">${format(f/scale,2)}</text>`;}
  const markers=result.foldedModeHz.map((f,i)=>f>=min&&f<=max?`<line x1="${xx(f)}" x2="${xx(f)}" y1="${top}" y2="${bottom}" stroke="${state.modes[i].amplitude===0?'#8c9b90':'#eaa276'}" stroke-dasharray="4 4" stroke-width="1.2"><title>Component ${i+1}: sampled frequency ${format(f)} Hz; known input ${format(state.modes[i].frequencyHz)} Hz${state.modes[i].amplitude===0?'; zero amplitude in this channel':''}</title></line>`:'').join('');
  shell.innerHTML=`<svg viewBox="0 0 ${width} 290" role="img" aria-label="One-sided synthetic FFT amplitude spectrum; orange dashed markers show folded component frequencies"><title>Sampled amplitude spectrum</title>${grid}${markers}<path d="${line}" fill="none" stroke="#a5d9bd" stroke-width="1.8"/><text x="${(left+right)/2}" y="280" text-anchor="middle" fill="#d2dfcf" font-size="11" font-family="monospace">Frequency (${scale===1000?'kHz':'Hz'})</text><text transform="translate(12 135) rotate(-90)" text-anchor="middle" fill="#d2dfcf" font-size="9" font-family="monospace">Signal amplitude</text></svg>`;
 }
 function drawWaveform(){
  if(!result||!$('acq-waveform').clientWidth)return;const count=Math.min(256,result.timeSeries.length),width=Math.max(280,$('acq-waveform').clientWidth-14),left=38,right=width-15,top=17,bottom=125;
  const max=Math.max(...result.timeSeries.slice(0,count).map(Math.abs),1e-12)*1.05,tmax=result.timeSeconds[count-1];
  const path=result.timeSeries.slice(0,count).map((v,i)=>`${i?'L':'M'}${(left+result.timeSeconds[i]/tmax*(right-left)).toFixed(2)},${((top+bottom)/2-v/max*(bottom-top)/2).toFixed(2)}`).join(' ');
  $('acq-waveform').innerHTML=`<svg viewBox="0 0 ${width} 165" role="img" aria-label="The first ${count} sampled points of the synthetic waveform"><line x1="${left}" x2="${right}" y1="${(top+bottom)/2}" y2="${(top+bottom)/2}" stroke="#45655b"/><path d="${path}" fill="none" stroke="#a5d9bd" stroke-width="1.2"/><text x="${left}" y="147" fill="#d2dfcf" font-size="10" font-family="monospace">0</text><text x="${right}" y="147" text-anchor="end" fill="#d2dfcf" font-size="10" font-family="monospace">${format(tmax*1000)} ms</text></svg>`;
 }
 function render(){
  $('acq-peak').textContent=result.dominantBinHz===null?'None':hz(result.dominantBinHz);$('acq-spacing').textContent=hz(result.binSpacingHz);$('acq-duration').textContent=`${format(result.durationSeconds*1000,2)} ms`;
  $('acq-nyquist').textContent=`${hz(result.nyquistHz)} (fs / 2)`;$('acq-known').textContent=state.modes.map((m,i)=>`${hz(m.frequencyHz)}${m.amplitude===0?' · hidden in this channel':''}${result.foldedModeHz[i]!==m.frequencyHz?` → ${hz(result.foldedModeHz[i])}`:''}`).join(' / ');
  $('acq-seed').textContent=`Seed ${state.seed}`;
  $('acq-chart-note').textContent=`${state.window==='hann'?'Periodic Hann':'Rectangular'} window; coherent gain ${format(result.windowCoherentGain,4)}. ${result.frequencyHz.length.toLocaleString()} FFT bins; the plot preserves within-pixel extrema. Equivalent noise bandwidth ${hz(result.windowEquivalentNoiseBandwidthHz)}.`;
  $('acq-warnings').innerHTML=result.warnings.length?`<p>INTERPRET WITH THESE LIMITS</p><ul>${result.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>`:'<p>NO NUMERICAL WARNING FOR THESE INPUTS</p><span>This remains an ideal synthetic acquisition. Hardware bandwidth, filter response, clipping and calibration are not modeled.</span>';
  drawSpectrum();drawWaveform();
 }
 function update(){try{const parameters=read();const next=simulateAcquisition(parameters);state=clone(next.parameters);result=next;$('acq-error').hidden=true;$('acq-export-json').disabled=false;$('acq-export-csv').disabled=false;render();}catch(e){$('acq-error').textContent=e.message;$('acq-error').hidden=false;$('acq-export-json').disabled=true;$('acq-export-csv').disabled=true;}}
 function choose(id){const preset=ACQUISITION_PRESETS.find(p=>p.id===id)||ACQUISITION_PRESETS[0];state=clone(preset.params);$('acq-preset').value=preset.id;$('acq-description').textContent=preset.description;$('acq-title').textContent=preset.title;populate();update();}
 $('acq-preset').addEventListener('change',()=>choose($('acq-preset').value));$('acq-reset').addEventListener('click',()=>choose(ACQUISITION_PRESETS[0].id));
 $('acq-parameters').addEventListener('submit',e=>e.preventDefault());let timer;
 $('acq-parameters').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{$('acq-title').textContent='Your synthetic capture';update();},80)});
 $('acq-view').addEventListener('change',drawSpectrum);
 $('acq-use-sphere').addEventListener('click',()=>{try{const frequency=getSphereFrequency();if(!Number.isFinite(frequency)||frequency<=0){notify('Enter valid conditions in the Experiment tab first.');return;}state={...clone(DEFAULT_ACQUISITION),...read(),modes:[{frequencyHz:frequency,amplitude:1,decayRatePerSecond:50,phaseRad:0}]};$('acq-description').textContent='Imported intrinsic sphere frequency, used as a lightly damped oscillation approximation. Decay and channel amplitude are illustrative; no hardware recording was made.';$('acq-title').textContent='Current sphere mode';populate();update();notify('Sphere frequency copied into the synthetic signal.');}catch(e){$('acq-error').textContent=e.message;$('acq-error').hidden=false;}});
 $('acq-export-json').addEventListener('click',()=>{if(!result)return;exportFile('synthetic-acquisition-run.json',JSON.stringify({schemaVersion:1,status:'synthetic signal; no physical measurements',buildInfo,parameters:state,result,uncertaintyBudget:{status:'user-supplied standard uncertainties',parameters:uncertaintyParameters,result:uncertainty}},null,2),'application/json');notify('Synthetic waveform, spectrum and parameters downloaded.');});
 $('acq-export-csv').addEventListener('click',()=>{if(!result)return;const rows=['frequency_Hz,synthetic_amplitude'];result.frequencyHz.forEach((f,i)=>rows.push(`${f},${result.spectrumAmplitude[i]}`));exportFile('synthetic-acquisition-spectrum.csv',rows.join('\n')+'\n','text/csv');notify('Synthetic amplitude spectrum downloaded.');});
 const budgetFields=[['frequencyAHz','Fitted frequency A (Hz)',23317.724126,0,5000000],['frequencyBHz','Fitted frequency B (Hz)',23312.319525,0,5000000],['fitStdHz','Fit standard uncertainty, each (Hz)',.4,0,1e6],['temperatureStdK','Temperature standard uncertainty, each (K)',.2,0,100],['temperatureSensitivityHzPerK','Frequency sensitivity (Hz/K)',-5.405,-1e6,1e6],['clockStdPpm','Timebase standard uncertainty, each (ppm)',1,0,1e6],['repeatabilityStdHz','Difference repeatability (Hz)',.2,0,1e6],['coverageFactor','Comparison multiplier k',2,0,10]];
 $('uncertainty-form-slot').innerHTML=`<form id="acq-uncertainty-form" class="uncertainty-form">${budgetFields.map(([id,label,value,min,max])=>`<label>${label}<input id="budget-${id}" type="number" value="${value}" min="${min}" max="${max}" step="any" required></label>`).join('')}<label>Timebase correlation<select id="budget-clock-correlation"><option value="1">Same fully shared error (ρ = 1)</option><option value="0">Independent errors (ρ = 0)</option></select></label></form><p class="microcopy">Fit and temperature errors are independent between A and B in this example. Repeatability is already expressed for the difference; do not count noise already included in fit uncertainty twice. Error categories are assumed independent.</p><p id="budget-error" class="error" role="alert" hidden></p><div id="budget-result" class="budget-result" aria-live="polite"></div>`;
 function updateBudget(){try{const values={};for(const[id,label]of budgetFields){const field=$(`budget-${id}`);if(!field.checkValidity())throw Error(`Check ${label.toLowerCase()}.`);values[id]=Number(field.value);}uncertaintyParameters={frequencyAHz:values.frequencyAHz,frequencyBHz:values.frequencyBHz,fitStdAHz:values.fitStdHz,fitStdBHz:values.fitStdHz,fitCorrelation:0,temperatureStdAK:values.temperatureStdK,temperatureStdBK:values.temperatureStdK,temperatureCorrelation:0,temperatureSensitivityHzPerK:values.temperatureSensitivityHzPerK,clockStdAPpm:values.clockStdPpm,clockStdBPpm:values.clockStdPpm,clockCorrelation:Number($('budget-clock-correlation').value),repeatabilityStdHz:values.repeatabilityStdHz,coverageFactor:values.coverageFactor};uncertainty=compareFrequencyUncertainty(uncertaintyParameters);$('budget-error').hidden=true;$('budget-result').innerHTML=`<div><span>B − A</span><strong>${hz(uncertainty.differenceHz)}</strong></div><div><span>Combined standard uncertainty</span><strong>${hz(uncertainty.combinedStdHz)}</strong></div><div><span>Comparison threshold k × u</span><strong>${hz(uncertainty.comparisonThresholdHz)}</strong></div><p>${uncertainty.exceedsThreshold?'The absolute difference exceeds':'The absolute difference does not exceed'} the declared threshold. This arithmetic does not establish the cause of a shift.</p>`;}catch(e){uncertainty=null;$('budget-error').textContent=e.message;$('budget-error').hidden=false;$('budget-result').innerHTML='';}}
 $('acq-uncertainty-form').addEventListener('submit',e=>e.preventDefault());$('acq-uncertainty-form').addEventListener('input',updateBudget);
 window.addEventListener('acquisition-visible',()=>requestAnimationFrame(()=>{drawSpectrum();drawWaveform();}));document.querySelector('.waveform-details').addEventListener('toggle',drawWaveform);
 if('ResizeObserver' in window){let lastWidth=0;new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width>0&&Math.abs(width-lastWidth)>1){lastWidth=width;requestAnimationFrame(()=>{drawSpectrum();drawWaveform();});}}).observe($('acq-spectrum'));}
 choose(ACQUISITION_PRESETS[0].id);updateBudget();
}

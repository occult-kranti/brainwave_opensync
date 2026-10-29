import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {induction,circularField,thermalNoise,receiver,normalProjection} from './model.mjs';
const here = new URL('.', import.meta.url);
const base = {frequencyHz:7.83,magneticRmsT:1e-12,turns:1000,areaM2:1,angleDeg:0,temperatureK:300,resistanceOhm:1000,bandwidthHz:1};
let assertions=0;
const check=(v)=>{assert(v);assertions++};
const close=(a,b)=>check(Math.abs(a-b)<=Math.max(1e-25,1e-10*Math.abs(b)));
const baseline=receiver(base);
close(baseline.signal.voltageRmsV,4.919734095521616e-8);
close(circularField({...base,radiusM:0.1}).electricRmsVPerM,2.459867047760808e-12);
close(baseline.noise.voltageRmsV,4.070354775692163e-9);
const controls=[];
for(const [name, patch, ratio] of [
 ['zero-field',{magneticRmsT:0},0],['zero-frequency',{frequencyHz:0},0],['zero-turns',{turns:0},0],['zero-area',{areaM2:0},0],['orthogonal',{angleDeg:90},0],
 ['double-field',{magneticRmsT:2e-12},2],['double-frequency',{frequencyHz:15.66},2],['double-area',{areaM2:2},2],['double-turns',{turns:2000},2],['opposite-normal',{angleDeg:180},1]]){
 const output=receiver({...base,...patch});close(output.signal.voltageRmsV,ratio*baseline.signal.voltageRmsV);
 if(['zero-frequency','zero-turns','zero-area','orthogonal'].includes(name)) {check(output.equivalentMagneticNoiseRmsT===null);check(!output.identifiable)}
 controls.push({name,inputs:{...base,...patch},output});
}
check(receiver({...base,magneticRmsT:0}).identifiable);
for(const angle of [-270,-90,90,270])check(normalProjection(angle)===0);
close(normalProjection(60),.5);
close(thermalNoise({...base,temperatureK:1200}).voltageRmsV,2*baseline.noise.voltageRmsV);
close(thermalNoise({...base,resistanceOhm:4000}).voltageRmsV,2*baseline.noise.voltageRmsV);
close(thermalNoise({...base,bandwidthHz:4}).voltageRmsV,2*baseline.noise.voltageRmsV);
for(const patch of [{frequencyHz:0},{magneticRmsT:0},{radiusM:0}])close(circularField({...base,radiusM:.1,...patch}).electricRmsVPerM,0);
const invalid=[];
for(const key of ['frequencyHz','magneticRmsT','turns','areaM2','temperatureK','resistanceOhm','bandwidthHz'])for(const value of [-1,Infinity,NaN]){
 let rejected=false;try{receiver({...base,[key]:value})}catch(e){rejected=e instanceof RangeError}check(rejected);invalid.push({key,value:String(value),rejected});
}
for(const patch of [{resistanceOhm:0},{bandwidthHz:0},{turns:.5},{angleDeg:Infinity},{areaM2:1e308}]){
 let rejected=false;try{receiver({...base,...patch})}catch(e){rejected=e instanceof RangeError}check(rejected);invalid.push({patch:Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)])),rejected});
}
// Independent-formulation numerical control: central difference of sinusoidal flux.
// At t=0, B(t)=sqrt(2)*B_rms*sin(omega*t), so |dFlux/dt|/sqrt(2) equals RMS EMF.
const omega=2*Math.PI*base.frequencyHz;
const derivativeControls=[];
for(const step of [1e-4,5e-5,2.5e-5]){
 const flux=t=>base.turns*base.areaM2*Math.SQRT2*base.magneticRmsT*Math.sin(omega*t);
 const rms=(flux(step)-flux(-step))/(2*step*Math.SQRT2);
 const error=Math.abs(rms-baseline.signal.voltageRmsV)/baseline.signal.voltageRmsV;
 check(error<5e-6);derivativeControls.push({stepSeconds:step,voltageRmsV:rms,relativeError:error});
}
check(derivativeControls[1].relativeError<derivativeControls[0].relativeError/3.9);
check(derivativeControls[2].relativeError<derivativeControls[1].relativeError/3.9);
const amplitudeRatio=35e-6/base.magneticRmsT;close(amplitudeRatio,35000000);
const results={schema:'contact-round2/1',status:'PASS',scope:'synthetic known-law arithmetic; no physical measurements, power, biological effect or contact established',assertions,inputs:base,baseline,circular:circularField({...base,radiusM:.1}),controls,invalid,derivativeControls,amplitudeComparison:{illustrativeFieldT:35e-6,referenceFieldT:1e-12,ratio:amplitudeRatio,limit:'amplitude ratio only; temporal waveform and biological mechanism not equated'},limitations:['uniform field and ideal geometry','RMS conventions','Johnson-only white thermal noise in declared bandwidth','no measured coil calibration, amplifier noise, environment, reactance or loading','no complete receptor model, no ET source attribution']};
await writeFile(new URL('results.json',here),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({status:results.status,assertions,voltageRmsV:baseline.signal.voltageRmsV,equivalentMagneticNoiseRmsT:baseline.equivalentMagneticNoiseRmsT}));

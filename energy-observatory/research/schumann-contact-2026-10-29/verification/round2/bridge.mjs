import {readFile} from 'node:fs/promises';
import {receiver,circularField} from '../../analysis/round2/model.mjs';
const fixture=JSON.parse(await readFile(new URL('./fixtures.json',import.meta.url),'utf8'));
const map=p=>({frequencyHz:p.frequency_hz,magneticRmsT:p.b_rms_t,turns:p.turns,
 areaM2:p.area_m2,angleDeg:p.theta_deg,radiusM:p.radius_m,temperatureK:p.temperature_k,
 resistanceOhm:p.resistance_ohm,bandwidthHz:p.bandwidth_hz});
function run(p){const q=map(p), r=receiver(q), e=circularField(q);return {
 v_rms_v:r.signal.voltageRmsV,e_rms_v_per_m:e.electricRmsVPerM,
 sensitivity_v_per_t:r.signal.sensitivityVPerT,thermal_v_rms_v:r.noise.voltageRmsV,
 equivalent_b_rms_t:r.equivalentMagneticNoiseRmsT,
 identifiability:r.identifiable?'identifiable-ideal-receiver':'unidentifiable'};}
const valid=fixture.valid_cases.map(c=>({id:c.id,actual:run(c.input)}));
const invalid=fixture.invalid_cases.map(c=>{
 const value=c.special?({NaN:NaN,Infinity:Infinity,'-Infinity':-Infinity}[c.special]):c.value;
 try {run({...fixture.base,[c.field]:value});return {id:c.id,rejected:false};}
 catch(e){return {id:c.id,rejected:e instanceof RangeError,errorType:e.constructor.name};}
});
console.log(JSON.stringify({valid,invalid}));

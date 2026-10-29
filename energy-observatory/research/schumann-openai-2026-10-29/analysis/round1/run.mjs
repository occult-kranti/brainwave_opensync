import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import * as M from './model.mjs';
const root=new URL('./',import.meta.url), hash=x=>createHash('sha256').update(x).digest('hex');
const tolerances={relative:2e-12,absolute:1e-24,sampledPeakHz:0.0011,instantaneousEnergyRelative:2e-12};
let checks=0;
const near=(a,b,{absolute=tolerances.absolute,relative=tolerances.relative}={})=>{
 assert.ok(Number.isFinite(a)&&Number.isFinite(b));
 assert.ok(Math.abs(a-b)<=absolute+relative*Math.max(Math.abs(a),Math.abs(b)),`${a} != ${b}`);checks++;
};
const ok=(x,message)=>{assert.ok(x,message);checks++;};
const modes=M.idealCavityModes();
const doubleRadius=M.idealCavityModes({radiusM:2*6371000});
const doubleSpeed=M.idealCavityModes({speedMps:2*M.C0_M_PER_S});
for(let i=0;i<5;i++){
 near(modes[i].frequencyHz*modes[i].horizontalWavelengthM,M.C0_M_PER_S);
 near(doubleRadius[i].frequencyHz,modes[i].frequencyHz/2);
 near(doubleRadius[i].horizontalWavelengthM,2*modes[i].horizontalWavelengthM);
 near(doubleSpeed[i].frequencyHz,2*modes[i].frequencyHz);
}
ok(Math.abs(modes[1].frequencyHz/modes[0].frequencyHz-2)>.2,'The modes are not integer harmonics.');
const vacuum=M.wavelengthReference({frequencyHz:7.8});
ok(Math.abs(vacuum.wavelengthM-modes[0].horizontalWavelengthM)>1e6,'Vacuum and horizontal scales differ.');
const historicalHz=[7.8,14.3,20.8,27.3,33.8];
const fittedSpeedMps=historicalHz[0]*modes[0].horizontalWavelengthM;
const fitted=M.idealCavityModes({speedMps:fittedSpeedMps}).map((m,i)=>({...m,historicalApproxHz:historicalHz[i],differenceHz:m.frequencyHz-historicalHz[i]}));
near(fitted[0].frequencyHz,historicalHz[0]);
ok(fitted.slice(1).every(x=>Math.abs(x.differenceHz)>.5),'One fitted speed does not reproduce illustrative higher modes.');
const f0=7.8,w0=2*Math.PI*f0;
const modeCases=[5,.6,.4].map(Q=>M.dampedMode({naturalFrequencyHz:f0,gammaPerS:w0/(2*Q)}));
near(modeCases[0].displacementPeakHz,f0*Math.sqrt(.98));
near(modeCases[0].ringdownFrequencyHz,f0*Math.sqrt(.99));
near(modeCases[1].displacementPeakHz,0);
near(modeCases[1].ringdownFrequencyHz,f0*Math.sqrt(11)/6);
ok(modeCases[2].ringdownFrequencyHz===null&&!modeCases[2].oscillatoryRingdown,'Q=.4 is overdamped.');
for(const x of modeCases)near(x.velocityPeakHz,f0);
const fixed={naturalFrequencyHz:f0,gammaPerS:w0/10,massKg:.25};
const sampled=[];
for(let i=0;i<=20000;i++){
 const response=M.modeResponse({frequencyHz:i*.001,...fixed});
 sampled.push({f:i*.001,q:response.displacementPsdPerForcePsd,v:response.velocityPsdPerForcePsd});
}
const argmax=(name,scale=1)=>sampled.reduce((a,b)=>b[name]*scale>a[name]*scale?b:a);
const qPeak=argmax('q'),vPeak=argmax('v'),scaledPeak=argmax('q',49);
near(qPeak.f,modeCases[0].displacementPeakHz,{absolute:tolerances.sampledPeakHz,relative:0});
near(vPeak.f,f0,{absolute:tolerances.sampledPeakHz,relative:0});
ok(Math.abs(vPeak.f-qPeak.f)>.07,'Fixed poles, changed readout, different spectral peaks.');
near(scaledPeak.f,qPeak.f);
const readoutControl={fixedPoles:fixed,frequencyBandHz:[0,20],spacingHz:.001,displacementSampledPeakHz:qPeak.f,velocitySampledPeakHz:vPeak.f,constantPsdScale:49,scaledDisplacementPeakHz:scaledPeak.f};
const magnetic=[50e-6,1e-12].map(fieldRmsT=>M.magneticEnergyReference({fieldRmsT}));
for(const x of magnetic)near(M.magneticEnergyReference({fieldRmsT:2*x.fieldRmsT}).energyDensityJPerM3,4*x.energyDensityJPerM3);
near(magnetic[0].energyDensityJPerM3/magnetic[1].energyDensityJPerM3,2.5e15);
const budgets=[];
for(const Q of [5,.6,.4])for(const frequencyHz of [1.2,7.8,14.3]){
 const p={frequencyHz,naturalFrequencyHz:f0,gammaPerS:w0/(2*Q),massKg:.25,forcePeakN:.01};
 const b=M.harmonicEnergyBudget(p),N=2048;
 let averageInputW=0,averageLossW=0,maxIdentityResidualW=0;
 const scale=p.forcePeakN*Math.hypot(b.velocityRealMPerS,b.velocityImagMPerS)+2*p.massKg*p.gammaPerS*Math.hypot(b.velocityRealMPerS,b.velocityImagMPerS)**2;
 for(let j=0;j<N;j++){
  const theta=2*Math.PI*j/N,c=Math.cos(theta),s=Math.sin(theta);
  const q=b.qRealM*c-b.qImagM*s;
  const v=b.velocityRealMPerS*c-b.velocityImagMPerS*s;
  const acceleration=-b.omegaPerS*b.omegaPerS*q,force=p.forcePeakN*c;
  const directEnergyDerivative=p.massKg*v*acceleration+p.massKg*w0*w0*q*v;
  const powerBalance=force*v-2*p.massKg*p.gammaPerS*v*v;
  maxIdentityResidualW=Math.max(maxIdentityResidualW,Math.abs(directEnergyDerivative-powerBalance));
  averageInputW+=force*v/N;averageLossW+=2*p.massKg*p.gammaPerS*v*v/N;
 }
 near(averageInputW,b.averageInputW);near(averageLossW,b.averageDissipationW);near(averageInputW,averageLossW);
 ok(maxIdentityResidualW<=1e-24+tolerances.instantaneousEnergyRelative*scale,'Instantaneous energy balance failed.');
 budgets.push({parameters:p,analyticInputW:b.averageInputW,analyticLossW:b.averageDissipationW,quadratureInputW:averageInputW,quadratureLossW:averageLossW,maxIdentityResidualW,phases:N});
}
const invalid=[
 ()=>M.idealCavityModes({radiusM:0}),()=>M.idealCavityModes({maxDegree:1.5}),()=>M.idealCavityModes({maxDegree:1001}),
 ()=>M.idealCavityModes({speedMps:Infinity}),()=>M.idealCavityModes({radiusM:1e308}),
 ()=>M.wavelengthReference({frequencyHz:0}),()=>M.wavelengthReference({frequencyHz:NaN}),
 ()=>M.magneticEnergyReference({fieldRmsT:-1}),()=>M.magneticEnergyReference({fieldRmsT:1e308}),()=>M.magneticEnergyReference({fieldRmsT:Number.MIN_VALUE}),
 ()=>M.dampedMode({naturalFrequencyHz:7.8,gammaPerS:0}),()=>M.dampedMode({naturalFrequencyHz:-1,gammaPerS:1}),
 ()=>M.modeResponse({...fixed,frequencyHz:-1}),()=>M.modeResponse({...fixed,frequencyHz:1,massKg:0}),
 ()=>M.modeResponse({...fixed,frequencyHz:1e308}),()=>M.harmonicEnergyBudget({...fixed,frequencyHz:1,forcePeakN:-1})
];
for(const fn of invalid){assert.throws(fn,RangeError);checks++;}
const sourceBytes=await readFile(new URL('./model.mjs',import.meta.url));
const runnerBytes=await readFile(fileURLToPath(import.meta.url));
const result={schema:'schumann-reference-round1/1',status:'pass',evidence:'Synthetic reference models and numerical checks; no current Earth data fit.',checks,tolerances,sourceSha256:hash(sourceBytes),runnerSha256:hash(runnerBytes),modes,vacuumReferenceAt7_8Hz:vacuum,historicalReference:{status:'Approximate historical illustrations; no uncertainty model or current anomaly inference.',fittedSpeedMps,rows:fitted},modeCases,readoutControl,magneticEnergyReferences:magnetic,harmonicBudgets:budgets,invalidInputsRejected:invalid.length};
await writeFile(new URL('results.json',root),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks,sourceSha256:result.sourceSha256,readoutControl,modeCases,magneticEnergyReferences:magnetic},null,2));

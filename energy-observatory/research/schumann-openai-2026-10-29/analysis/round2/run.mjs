import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as M from './model.mjs';
const folder=new URL('./',import.meta.url),hash=x=>createHash('sha256').update(x).digest('hex');
const tolerances={relative:3e-12,psdAbsolute:1e-25,peakGridHz:.001,cancellationRelative:1e-27};
let checks=0;
const ok=(test,label)=>{assert.ok(test,label);checks++;};
const near=(a,b)=>{ok(Number.isFinite(a)&&Number.isFinite(b),'Finite comparison');ok(Math.abs(a-b)<=tolerances.psdAbsolute+tolerances.relative*Math.max(Math.abs(a),Math.abs(b)),`${a} differs from ${b}`);};
const band={minHz:1,maxHz:20,spacingHz:.001,points:19001};
const first={naturalFrequencyHz:7.8,gammaPerS:2*Math.PI*7.8/10,massKg:.25};
const second={naturalFrequencyHz:10.3,gammaPerS:2*Math.PI*10.3/6,massKg:.4};
const sourceBaseN2PerHz=1e-6;
const cases=[
 {id:'white',sourceTilt:0,receiverTilt:0,constantScale:1},
 {id:'source-red',sourceTilt:-3,receiverTilt:0,constantScale:1},
 {id:'source-blue',sourceTilt:3,receiverTilt:0,constantScale:1},
 {id:'receiver-blue',sourceTilt:0,receiverTilt:3,constantScale:1},
 {id:'constant-scale',sourceTilt:0,receiverTilt:0,constantScale:49},
 {id:'source-band-end',sourceTilt:12,receiverTilt:0,constantScale:1}
].map(x=>({...x,maximumPsdM2PerHz:-Infinity,maximumHz:null,samples:[]}));
let maxPairRelativeResidual=0,maxVelocityRatioRelativeResidual=0,minSecondPsd=Infinity,maxSecondPsd=0;
let pairPeakFirst={f:null,power:-Infinity},pairPeakSecond={f:null,power:-Infinity};
const pairSamples=[];
for(let i=0;i<band.points;i++){
 const frequencyHz=band.minHz+i*band.spacingHz;
 for(const scenario of cases){
  const sourceWeight=M.positiveSpectralWeight({frequencyHz,tilt:scenario.sourceTilt});
  const receiverWeight=M.positiveSpectralWeight({frequencyHz,tilt:scenario.receiverTilt});
  const p=M.mechanicalPsd({frequencyHz,...first,forcePsdN2PerHz:sourceBaseN2PerHz*sourceWeight*scenario.constantScale,receiverGainSquared:receiverWeight});
  if(p.outputPsdM2PerHz>scenario.maximumPsdM2PerHz){scenario.maximumPsdM2PerHz=p.outputPsdM2PerHz;scenario.maximumHz=frequencyHz;}
  if(i%100===0)scenario.samples.push({frequencyHz,outputPsdM2PerHz:p.outputPsdM2PerHz});
 }
 const pair=M.sameOutputForcing({frequencyHz,first,second,firstForcePsdN2PerHz:sourceBaseN2PerHz});
 maxPairRelativeResidual=Math.max(maxPairRelativeResidual,pair.relativeResidual);
 minSecondPsd=Math.min(minSecondPsd,pair.secondForcePsdN2PerHz);maxSecondPsd=Math.max(maxSecondPsd,pair.secondForcePsdN2PerHz);
 if(pair.firstOutputPsdM2PerHz>pairPeakFirst.power)pairPeakFirst={f:frequencyHz,power:pair.firstOutputPsdM2PerHz};
 if(pair.secondOutputPsdM2PerHz>pairPeakSecond.power)pairPeakSecond={f:frequencyHz,power:pair.secondOutputPsdM2PerHz};
 const p1=M.mechanicalPsd({frequencyHz,...first,forcePsdN2PerHz:sourceBaseN2PerHz});
 const ratio=p1.velocityPsdM2PerS2PerHz/p1.displacementPsdM2PerHz,expected=(2*Math.PI*frequencyHz)**2;
 maxVelocityRatioRelativeResidual=Math.max(maxVelocityRatioRelativeResidual,Math.abs(ratio-expected)/expected);
 if(i%100===0)pairSamples.push(pair);
}
for(const c of cases)c.atBandBoundary=c.maximumHz===band.minHz||c.maximumHz===band.maxHz;
ok(cases[1].maximumHz<cases[0].maximumHz-.05,'Red source shifts maximum down with same physical transfer.');
ok(cases[2].maximumHz>cases[0].maximumHz+.05,'Blue source shifts maximum up with same physical transfer.');
near(cases[2].maximumHz,cases[3].maximumHz);
near(cases[0].maximumHz,cases[4].maximumHz);
ok(cases[5].atBandBoundary,'Large positive source color has a band-censored maximum.');
ok(maxPairRelativeResidual<tolerances.relative,'Exact-ambiguity numerical residual');
ok(minSecondPsd>0&&Number.isFinite(maxSecondPsd),'Constructed source remains positive finite.');
near(pairPeakFirst.f,pairPeakSecond.f);
ok(Math.abs(first.naturalFrequencyHz-second.naturalFrequencyHz)>2,'Different natural frequencies.');
ok(maxVelocityRatioRelativeResidual<tolerances.relative,'Velocity/displacement ratio remains redundant.');
const modes=[first,{naturalFrequencyHz:14.3,gammaPerS:2*Math.PI*14.3/12,massKg:.4,amplitude:.8}];
const phaseCases=[0,Math.PI/2,Math.PI].map(phaseRad=>({phaseRad,...M.coherentModesPsd({frequencyHz:10,modes:[modes[0],{...modes[1],phaseRad}],forcePsdN2PerHz:sourceBaseN2PerHz})}));
for(const x of phaseCases){
 ok(x.coherentPsdM2PerHz>=0&&x.uncorrelatedPsdM2PerHz>0,'Nonnegative total PSDs');
 near(x.coherentPsdM2PerHz,x.uncorrelatedPsdM2PerHz+x.crossTermM2PerHz);
}
near(phaseCases[0].uncorrelatedPsdM2PerHz,phaseCases[2].uncorrelatedPsdM2PerHz);
ok(Math.abs(phaseCases[0].coherentPsdM2PerHz-phaseCases[2].coherentPsdM2PerHz)>.1*phaseCases[0].uncorrelatedPsdM2PerHz,'Common-source phase changes interference.');
const exactCancellation=M.coherentModesPsd({frequencyHz:9,modes:[{...first,amplitude:1},{...first,amplitude:-1}],forcePsdN2PerHz:sourceBaseN2PerHz});
ok(exactCancellation.coherentPsdM2PerHz===0,'Equal opposing signed readouts cancel exactly.');
ok(exactCancellation.uncorrelatedPsdM2PerHz>0,'Incoherent PSD sum cannot reproduce coherent cancellation.');
const h1=M.modeResponse({frequencyHz:9,...first}),h2=M.modeResponse({frequencyHz:9,...second});
const matchedAmplitude=h1.magnitudeMPerN/h2.magnitudeMPerN;
const matchedPhaseRad=Math.atan2(-h1.imagMPerN,-h1.realMPerN)-Math.atan2(h2.imagMPerN,h2.realMPerN);
const distinctCancellation=M.coherentModesPsd({frequencyHz:9,modes:[first,{...second,amplitude:matchedAmplitude,phaseRad:matchedPhaseRad}],forcePsdN2PerHz:sourceBaseN2PerHz});
const distinctCancellationRelative=distinctCancellation.coherentPsdM2PerHz/distinctCancellation.uncorrelatedPsdM2PerHz;
ok(distinctCancellationRelative<tolerances.cancellationRelative,'Matched magnitude and phase cancel distinct modes at the single specified frequency.');
const invalid=[
 ()=>M.positiveSpectralWeight({frequencyHz:-1}),()=>M.positiveSpectralWeight({frequencyHz:1,scaleHz:0}),
 ()=>M.positiveSpectralWeight({frequencyHz:20,tilt:1e8}),()=>M.positiveSpectralWeight({frequencyHz:20,tilt:-1e8}),
 ()=>M.mechanicalPsd({frequencyHz:2,...first,forcePsdN2PerHz:0}),()=>M.mechanicalPsd({frequencyHz:2,...first,receiverGainSquared:-1}),
 ()=>M.coherentModesPsd({frequencyHz:2,modes:[]}),()=>M.coherentModesPsd({frequencyHz:2,modes:[{...first,phaseRad:NaN}]})
];
for(const f of invalid){assert.throws(f,RangeError);checks++;}
const result={schema:'schumann-source-ambiguity-round2/1',status:'pass',evidence:'Synthetic, compact-band mechanical spectra. No observed lightning source law, receiver calibration or Earth fit.',checks,tolerances,band,transfer:first,sourceBaseN2PerHz,scenarios:cases,sameOutput:{first,second,maxPairRelativeResidual,minSecondForcePsdN2PerHz:minSecondPsd,maxSecondForcePsdN2PerHz:maxSecondPsd,firstPeak:pairPeakFirst,secondPeak:pairPeakSecond,maxVelocityRatioRelativeResidual,samples:pairSamples},coherentModes:{parameters:modes,frequencyHz:10,phaseCases,exactIdenticalCancellation:exactCancellation,distinctModeCancellation:{frequencyHz:9,matchedAmplitude,matchedPhaseRad,relativePsd:distinctCancellationRelative,result:distinctCancellation}},invalidInputsRejected:invalid.length,sourceSha256:hash(await readFile(new URL('model.mjs',folder))),runnerSha256:hash(await readFile(new URL(import.meta.url)))};
await writeFile(new URL('results.json',folder),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks,sourceSha256:result.sourceSha256,scenarios:cases.map(({id,maximumHz,atBandBoundary})=>({id,maximumHz,atBandBoundary})),maxPairRelativeResidual,maxVelocityRatioRelativeResidual,distinctCancellationRelative},null,2));

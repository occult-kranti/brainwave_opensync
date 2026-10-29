import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as M from './model.mjs';
const folder=new URL('./',import.meta.url),hash=x=>createHash('sha256').update(x).digest('hex');
const tolerances={relative:2e-10,absoluteMPerN:1e-16,parameterRelative:3e-12,receiverRelative:3e-12};
let checks=0;
const ok=(x,label)=>{assert.ok(x,label);checks++;};
const near=(a,b)=>ok(Math.abs(a-b)<=1e-14+tolerances.parameterRelative*Math.max(Math.abs(a),Math.abs(b)),`${a} differs from ${b}`);
const round2=JSON.parse(await readFile(new URL('../round2/results.json',folder),'utf8'));
const {first,second}=round2.sameOutput;
const sourceInputs={round2ResultsSha256:hash(await readFile(new URL('../round2/results.json',folder)))};
const probeFrequencyHz=5,heldOutHz=[2.5,10.7,16.4];
const response=(parameters,frequencyHz)=>M.modeResponse({...parameters,frequencyHz});
const measured=(parameters,frequencies,gain=1)=>frequencies.map(f=>{
 const h=response(parameters,f);return {frequencyHz:f,realMPerN:gain*h.realMPerN,imagMPerN:gain*h.imagMPerN};
});
const validate=(estimate,measurements)=>M.validateModeAtFrequencies({estimate,measurements,relativeTolerance:tolerances.relative,absoluteTolerance:tolerances.absoluteMPerN});
const recoveries=[first,second,{naturalFrequencyHz:1.2,gammaPerS:8,massKg:.7},{naturalFrequencyHz:50,gammaPerS:60,massKg:2}].map(parameters=>{
 const h=response(parameters,probeFrequencyHz);
 const estimate=M.calibratedModeInverse({frequencyHz:probeFrequencyHz,massKg:parameters.massKg,...h});
 near(estimate.naturalFrequencyHz,parameters.naturalFrequencyHz);near(estimate.gammaPerS,parameters.gammaPerS);
 const heldOut=validate(estimate,measured(parameters,heldOutHz));ok(heldOut.passed,'Correct exact-data single mode passes held-out checks.');
 return {parameters,probeFrequencyHz,estimate,heldOut};
});
const h=response(first,probeFrequencyHz);
let wrongPhaseRejected=false;
try{M.calibratedModeInverse({frequencyHz:probeFrequencyHz,massKg:first.massKg,realMPerN:h.realMPerN,imagMPerN:-h.imagMPerN});}catch(e){wrongPhaseRejected=e instanceof RangeError;}
ok(wrongPhaseRejected,'Conjugating the phase convention implies negative damping and is rejected.');
const gain=1.25;
const gainEstimate=M.calibratedModeInverse({frequencyHz:probeFrequencyHz,massKg:first.massKg,realMPerN:gain*h.realMPerN,imagMPerN:gain*h.imagMPerN});
const gainHeldOut=validate(gainEstimate,measured(first,heldOutHz,gain));ok(!gainHeldOut.passed,'Unmodeled constant gain fails calibrated-gain single-probe held-out check.');
const mix=f=>{
 const a=response(first,f),b=response(second,f);return {frequencyHz:f,realMPerN:a.realMPerN+.35*b.realMPerN,imagMPerN:a.imagMPerN+.35*b.imagMPerN};
};
const mixProbe=mix(probeFrequencyHz);
const mixEstimate=M.calibratedModeInverse({massKg:first.massKg,...mixProbe});
const mixHeldOut=validate(mixEstimate,heldOutHz.map(mix));ok(!mixHeldOut.passed,'Two-mode response fails the declared single-mode held-out model.');
const delta={real:1e-4,imag:-2e-4};
const perturbedH={realMPerN:(1+delta.real)*h.realMPerN-delta.imag*h.imagMPerN,imagMPerN:(1+delta.real)*h.imagMPerN+delta.imag*h.realMPerN};
const perturbedEstimate=M.calibratedModeInverse({frequencyHz:probeFrequencyHz,massKg:first.massKg,...perturbedH});
const perturbationHeldOut=validate(perturbedEstimate,measured(first,heldOutHz));
ok(!perturbationHeldOut.passed,'A fixed deterministic probe perturbation exceeds exact-data numerical agreement tolerance.');
const receiverPoints=Array.from({length:191},(_,i)=>1+.1*i).map(frequencyHz=>M.receiverAmbiguity({frequencyHz,first,second}));
const maxReceiverResidual=Math.max(...receiverPoints.map(x=>x.relativeResidual));ok(maxReceiverResidual<tolerances.receiverRelative,'Arbitrary receiver ambiguity preserves every tested complex response.');
const impostor=receiverPoints.find(x=>Math.abs(x.frequencyHz-probeFrequencyHz)<1e-10);
const impostorEstimate=M.calibratedModeInverse({frequencyHz:probeFrequencyHz,massKg:second.massKg,realMPerN:impostor.observedRealMPerN,imagMPerN:impostor.observedImagMPerN});
const impostorHeldOut=validate(impostorEstimate,heldOutHz.map(f=>{
 const x=M.receiverAmbiguity({frequencyHz:f,first,second});return {frequencyHz:f,realMPerN:x.observedRealMPerN,imagMPerN:x.observedImagMPerN};
}));
ok(impostorHeldOut.passed,'An unconstrained complex receiver can defeat even these held-out checks.');
// Isolate receiver uncertainty while retaining the known physical mass of H1.
const sameMassTarget={...second,massKg:first.massKg};
const sameMassProbe=M.receiverAmbiguity({frequencyHz:probeFrequencyHz,first,second:sameMassTarget});
const sameMassEstimate=M.calibratedModeInverse({frequencyHz:probeFrequencyHz,massKg:first.massKg,realMPerN:sameMassProbe.observedRealMPerN,imagMPerN:sameMassProbe.observedImagMPerN});
const sameMassHeldOut=validate(sameMassEstimate,heldOutHz.map(f=>{
 const x=M.receiverAmbiguity({frequencyHz:f,first,second:sameMassTarget});return {frequencyHz:f,realMPerN:x.observedRealMPerN,imagMPerN:x.observedImagMPerN};
}));
near(sameMassEstimate.naturalFrequencyHz,sameMassTarget.naturalFrequencyHz);
ok(sameMassHeldOut.passed,'Receiver uncertainty alone defeats held-out checks with the true mass retained.');
// Restricted constant-real-gain reconstruction, independently from the calibrated inverse API.
const reciprocal=h=>{const d=h.realMPerN*h.realMPerN+h.imagMPerN*h.imagMPerN;return {real:h.realMPerN/d,imag:-h.imagMPerN/d};};
const fa=3,fb=12,wa=2*Math.PI*fa,wb=2*Math.PI*fb;
const za=reciprocal(measured(first,[fa],gain)[0]),zb=reciprocal(measured(first,[fb],gain)[0]);
const massOverGain=(za.real-zb.real)/(wb*wb-wa*wa);
const constantGainRecovery={massOverGain,naturalFrequencyHz:Math.sqrt(wa*wa+za.real/massOverGain)/(2*Math.PI),gammaPerS:za.imag/(2*massOverGain*wa),gainIfMassKnown:first.massKg/massOverGain};
near(constantGainRecovery.naturalFrequencyHz,first.naturalFrequencyHz);near(constantGainRecovery.gammaPerS,first.gammaPerS);near(constantGainRecovery.gainIfMassKnown,gain);
const observationsFile=new URL('../../panel/observations/observation-summary.json',folder);
const sourcesFile=new URL('../../panel/observations/sources.json',folder);
const observations=JSON.parse(await readFile(observationsFile,'utf8'));
const sources=JSON.parse(await readFile(sourcesFile,'utf8')).sources;
Object.assign(sourceInputs,{observationSummarySha256:hash(await readFile(observationsFile)),observationSourcesSha256:hash(await readFile(sourcesFile))});
const asOfUtc='2026-10-29T04:57:39Z';
const sourceById=id=>sources.find(s=>s.id===id);
const tomsk=sourceById('tomsk-image'),nck=sourceById('nck-image'),noaa=sourceById('noaa-kp');
const actualPackets=[
 {id:'tomsk-quicklook',packet:{stationId:'tomsk',observable:'schumann-mode-frequency',channel:'station quick-look; no numeric extraction',units:'Hz',record:{kind:'quicklook-image',url:tomsk.url,sha256:tomsk.image_sha256},interval:{startUtc:null,endUtc:null},retrievedUtc:asOfUtc,coverageComplete:false,scope:'station',synthetic:false,context:tomsk.visible_dates}},
 {id:'nagycenk-quicklook',packet:{stationId:'nck',observable:'schumann-mode-frequency',channel:'station quick-look; no numeric extraction',units:'Hz',record:{kind:'quicklook-image',url:nck.url,sha256:nck.image_sha256},interval:{startUtc:null,endUtc:null},retrievedUtc:asOfUtc,coverageComplete:false,scope:'station',synthetic:false,context:nck.visible_dates}},
 {id:'noaa-geomagnetic-context',packet:{stationId:'noaa-planetary-estimate',observable:'geomagnetic-Kp',channel:'planetary Kp context',units:'dimensionless',record:{kind:'numeric-context',url:noaa.url,sha256:noaa.sha256},interval:{startUtc:'2026-10-23T00:00:00Z',endUtc:'2026-10-29T03:00:00Z'},retrievedUtc:asOfUtc,coverageComplete:true,scope:'station',synthetic:false,context:observations.observable}}
].map(x=>({...x,result:M.evidenceIntake(x.packet,{asOfUtc})}));
for(const x of actualPackets)ok(x.result.status==='insufficient-evidence'&&!x.result.anomalyEstablished,`Actual ${x.id} cannot establish a Schumann anomaly.`);
const complete={stationId:'synthetic-A',observable:'schumann-mode-frequency',channel:'synthetic fitted magnetic-channel frequency',units:'Hz',record:{kind:'calibrated-numeric',url:'https://example.invalid/synthetic-A.csv',sha256:'a'.repeat(64)},interval:{startUtc:'2026-10-23T00:00:00Z',endUtc:'2026-10-29T03:00:00Z'},retrievedUtc:asOfUtc,coverageComplete:true,calibration:{id:'fixture-cal-A',valid:true},qc:{method:'synthetic fixture only',status:'passed'},baseline:{id:'fixture-baseline-A',matched:true},decision:{method:'hypothetical predeclared matched comparison',uncertainty:'hypothetical full estimator and calibration uncertainty model'},scope:'station',synthetic:true};
const syntheticReady=M.evidenceIntake(complete,{asOfUtc});ok(syntheticReady.status==='ready-for-analysis'&&syntheticReady.synthetic&&!syntheticReady.anomalyEstablished,'Complete synthetic metadata is readiness only.');
const malformed=[];
for(const field of ['stationId','channel','record','interval','retrievedUtc','coverageComplete','calibration','qc','baseline','decision','scope','synthetic']){
 const packet=structuredClone(complete);delete packet[field];malformed.push({id:'missing-'+field,packet});
}
malformed.push({id:'invalid-calendar',packet:{...complete,interval:{startUtc:'2026-02-30T00:00:00Z',endUtc:'2026-03-02T00:00:00Z'}}});
malformed.push({id:'local-time-no-zone',packet:{...complete,retrievedUtc:'2026-10-29T04:57:39'}});
malformed.push({id:'future-observation',packet:{...complete,interval:{...complete.interval,endUtc:'2026-10-30T00:00:00Z'}}});
malformed.push({id:'future-retrieval',packet:{...complete,retrievedUtc:'2026-10-30T00:00:00Z'}});
malformed.push({id:'incomplete-coverage',packet:{...complete,coverageComplete:false}});
malformed.push({id:'truthy-string-calibration',packet:{...complete,calibration:{id:'x',valid:'true'}}});
malformed.push({id:'reversed-interval',packet:{...complete,interval:{startUtc:complete.interval.endUtc,endUtc:complete.interval.startUtc}}});
const other={...structuredClone(complete),stationId:'synthetic-B',record:{...complete.record,url:'https://example.invalid/synthetic-B.csv',sha256:'b'.repeat(64)},calibration:{id:'fixture-cal-B',valid:true}};
const global={...complete,scope:'global',independentStationIds:['synthetic-A','synthetic-B'],independentStations:[complete,other],independenceJustification:'Synthetic independent hardware/source-metadata assumption, not established in Earth data.',sharedObservableModel:'Synthetic matched frequency estimator and common interval with independent calibration metadata.'};
const syntheticGlobalReady=M.evidenceIntake(global,{asOfUtc});ok(syntheticGlobalReady.status==='ready-for-analysis'&&!syntheticGlobalReady.anomalyEstablished,'Synthetic complete global metadata still does not prove an anomaly.');
malformed.push({id:'duplicate-global-stations',packet:{...global,independentStationIds:['synthetic-A',' Synthetic-A ']}});
malformed.push({id:'global-missing-calibration',packet:{...global,independentStations:[complete,{...other,calibration:null}]}});
malformed.push({id:'global-id-list-only',packet:{...global,independentStations:undefined}});
malformed.push({id:'global-incomplete-common-interval',packet:{...global,independentStations:[complete,{...other,interval:{...other.interval,endUtc:'2026-10-28T03:00:00Z'}}]}});
const malformedResults=malformed.map(({id,packet})=>({id,result:M.evidenceIntake(packet,{asOfUtc})}));
for(const x of malformedResults)ok(x.result.status==='insufficient-evidence'&&!x.result.anomalyEstablished,`Malformed ${x.id} rejected.`);
ok(M.evidenceIntake(complete).status==='insufficient-evidence','An explicit assessment cutoff is required.');
const invalid=[
 ()=>M.calibratedModeInverse({frequencyHz:0,massKg:1,realMPerN:1,imagMPerN:-1}),
 ()=>M.calibratedModeInverse({frequencyHz:1,massKg:1,realMPerN:0,imagMPerN:0}),
 ()=>M.calibratedModeInverse({frequencyHz:1,massKg:0,realMPerN:1,imagMPerN:-1}),
 ()=>validate(recoveries[0].estimate,measured(first,[probeFrequencyHz,10])),
 ()=>validate(recoveries[0].estimate,measured(first,[10,10]))
];
for(const f of invalid){assert.throws(f,RangeError);checks++;}
const result={schema:'schumann-calibrated-discriminator-round3/1',status:'pass',evidence:'Synthetic restricted inverse, nuisance countermodels and metadata-only readiness. No Earth fit or statistical anomaly detection.',checks,tolerances,sourceInputs,recoveries,negativeControls:{wrongPhaseRejected,gain:{gain,estimate:gainEstimate,heldOut:gainHeldOut},twoMode:{secondWeight:.35,estimate:mixEstimate,heldOut:mixHeldOut},deterministicPerturbation:{delta,estimate:perturbedEstimate,heldOut:perturbationHeldOut,notAnUncertaintyBound:true}},receiverAmbiguity:{first,second,bandHz:[1,20],spacingHz:.1,points:receiverPoints.length,maxReceiverResidual,impostorEstimate,impostorHeldOut,unequalMassCaseQualification:'Actual R2 pair identity; impostor reconstruction assumes the second mass.',sameKnownMassControl:{target:sameMassTarget,estimate:sameMassEstimate,heldOut:sameMassHeldOut},samples:receiverPoints.filter((_,i)=>i%10===0)},constantRealGainQualification:{gain,knownMassKg:first.massKg,probeFrequenciesHz:[fa,fb],recovery:constantGainRecovery},evidenceIntake:{asOfUtc,actualPackets,syntheticCompletePacket:complete,syntheticReady,syntheticGlobalReady,malformedResults},sourceSha256:hash(await readFile(new URL('model.mjs',folder))),runnerSha256:hash(await readFile(new URL(import.meta.url)))};
await writeFile(new URL('results.json',folder),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks,sourceSha256:result.sourceSha256,recoveries:recoveries.map(x=>({naturalFrequencyHz:x.estimate.naturalFrequencyHz,passed:x.heldOut.passed,maxRelativeError:x.heldOut.maxRelativeError})),negativeControls:{wrongPhaseRejected,gainFails:!gainHeldOut.passed,multimodeFails:!mixHeldOut.passed,perturbationFailsExactTolerance:!perturbationHeldOut.passed},maxReceiverResidual,intakeActual:actualPackets.map(x=>({id:x.id,status:x.result.status,issues:x.result.missing.length})),metadataNegativeCases:malformedResults.length},null,2));

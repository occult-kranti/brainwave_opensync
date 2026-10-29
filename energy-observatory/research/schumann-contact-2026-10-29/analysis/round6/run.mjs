import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {assessPacket,unsaltedDictionaryDemo} from './model.mjs';
const here=new URL('.',import.meta.url),f=JSON.parse(await readFile(new URL('input-freeze.json',here),'utf8'));
let assertions=0;const check=v=>{assert(v);assertions++};
for(const [name,sha]of Object.entries(f.files))check(createHash('sha256').update(await readFile(new URL(name,here))).digest('hex')===sha);
const base=JSON.parse(await readFile(new URL('example-packet.json',here),'utf8'));
const fields=['documentaryMetadataReady','environmentMetadataReady','informationMetadataReady','pairedMetadataReady'];
const all={documentaryMetadataReady:true,environmentMetadataReady:true,informationMetadataReady:true,pairedMetadataReady:true};
const cases=[];
function add(id,mutate,expected){const packet=structuredClone(base);mutate(packet);cases.push({id,packet,expected});}
add('fabricated-complete-observational-all-self-attestations-true',()=>{},all);
add('complete-synthetic-metadata',p=>{p.origin='synthetic';},{...all,pairedMetadataReady:false});
add('complete-Ez-channel',p=>{p.environment.component='Ez';p.environment.units='V/m';},all);
add('documentary-only',p=>{delete p.environment;delete p.information;delete p.paired;},{documentaryMetadataReady:true,environmentMetadataReady:false,informationMetadataReady:false,pairedMetadataReady:false});
const envFail={environmentMetadataReady:false,pairedMetadataReady:false},infoFail={informationMetadataReady:false,pairedMetadataReady:false},pairFail={pairedMetadataReady:false};
add('wrong-magnetic-units',p=>p.environment.units='nT',envFail);
add('wrong-electric-units',p=>{p.environment.component='Ez';p.environment.units='T';},envFail);
add('unknown-component',p=>p.environment.component='total-frequency',envFail);
add('Nyquist-equality',p=>p.environment.bandHz=[5,64],envFail);
add('negative-band',p=>p.environment.bandHz=[-1,40],envFail);
add('reversed-band',p=>p.environment.bandHz=[40,5],envFail);
add('nonfinite-band',p=>p.environment.bandHz=[5,Infinity],envFail);
add('zero-sample-rate',p=>p.environment.sampleRateHz=0,envFail);
add('nonfinite-sample-rate',p=>p.environment.sampleRateHz=Infinity,envFail);
add('invalid-calendar-date',p=>p.environment.startUtc='2026-02-30T00:00:00.000Z',envFail);
add('noncanonical-time',p=>p.environment.startUtc='2026-10-28T00:00:00Z',envFail);
add('future-environment-end',p=>p.environment.endUtc='2026-10-30T00:00:00.000Z',envFail);
add('reversed-environment-window',p=>p.environment.startUtc=p.environment.endUtc,envFail);
add('negative-clock-error',p=>p.environment.clockUncertaintyMs=-1,envFail);
add('nonfinite-clock-error',p=>p.environment.clockUncertaintyMs=NaN,envFail);
add('missing-calibration-reference',p=>delete p.environment.calibration,envFail);
add('missing-noise-reference',p=>delete p.environment.responseNoise,envFail);
add('nonHTTPS-record-reference',p=>p.environment.numericRecords.uri='http://example.invalid/data',envFail);
add('malformed-digest',p=>p.environment.qc.sha256='000',envFail);
add('empty-missingness-rule',p=>p.environment.missingnessRule=' ',envFail);
add('missing-estimator',p=>delete p.environment.estimator,envFail);
add('K-fractional',p=>p.information.K=4.5,infoFail);
add('K-one',p=>p.information.K=1,infoFail);
add('N-mismatch',p=>p.information.N=2,infoFail);
add('duplicate-attempt-ID',p=>p.information.trials[1].id=p.information.trials[0].id,infoFail);
add('missing-attempt-status',p=>delete p.information.trials[0].status,infoFail);
add('upload-used-as-original-event',p=>p.information.trials[0].eventTimeBasis='upload',infoFail);
add('repost-used-as-original-event',p=>p.information.trials[0].eventTimeBasis='repost',infoFail);
add('event-after-response-lock',p=>p.information.trials[0].eventUtc='2026-10-28T10:01:30.000Z',infoFail);
add('early-target-reveal',p=>p.information.trials[0].revealUtc=p.information.trials[0].responseLockedUtc,infoFail);
add('future-target-reveal',p=>p.information.trials[0].revealUtc='2026-10-30T00:00:00.000Z',infoFail);
add('unsalted-commitment',p=>p.information.commitmentScheme='unsalted-sha256',infoFail);
add('missing-commitment-digest',p=>delete p.information.trials[0].commitment.sha256,infoFail);
add('commitment-after-response',p=>p.information.trials[0].commitment.committedUtc=p.information.trials[0].responseLockedUtc,infoFail);
add('too-short-nonce',p=>p.information.trials[0].commitment.nonceBits=127,infoFail);
add('fractional-nonce-bits',p=>p.information.trials[0].commitment.nonceBits=128.5,infoFail);
add('early-nonce-reveal',p=>p.information.trials[0].commitment.nonceRevealUtc='2026-10-28T10:01:59.999Z',infoFail);
add('future-nonce-reveal',p=>p.information.trials[0].commitment.nonceRevealUtc='2026-10-30T00:00:00.000Z',infoFail);
add('nonfixed-stopping',p=>p.information.stoppingRule='until-significant',infoFail);
add('wrong-target-assumption',p=>p.information.generationAssumption='marginally-balanced',infoFail);
add('missing-generation-audit',p=>delete p.information.generationAudit,infoFail);
add('missing-response-archive',p=>delete p.information.responseArchive,infoFail);
add('missing-crosswalk',p=>delete p.paired.crosswalk,pairFail);
add('protocol-locked-too-late',p=>p.paired.protocolLockedUtc=p.environment.startUtc,pairFail);
add('negative-paired-clock-tolerance',p=>p.paired.maxClockUncertaintyMs=-1,pairFail);
add('nonfinite-paired-clock-tolerance',p=>p.paired.maxClockUncertaintyMs=Infinity,pairFail);
add('clock-exceeds-paired-tolerance',p=>p.paired.maxClockUncertaintyMs=.5,pairFail);
add('event-outside-environment-window',p=>p.environment.endUtc='2026-10-28T09:00:00.000Z',pairFail);
add('missing-calendar-controls',p=>delete p.paired.calendarControls,pairFail);
add('missing-fixed-lag-rule',p=>delete p.paired.lagRule,pairFail);
add('invalid-common-asOf-calendar',p=>p.asOfUtc='2026-02-30T00:00:00.000Z',Object.fromEntries(fields.map(k=>[k,false])));
add('wrong-origin',p=>p.origin='verified-contact',Object.fromEntries(fields.map(k=>[k,false])));
add('documentary-asserted-as-fact',p=>p.documentary.assertionStatus='validated',{documentaryMetadataReady:false});
const descriptors=[
 {id:'actual-availability-quicklooks',availabilityDescription:'Previous source audit obtained Tomsk/Nagycenk image quick looks, not a calibrated numeric paired packet.',environment:{kind:'image-quicklook'}},
 {id:'actual-availability-Kp',availabilityDescription:'Previous source audit saved NOAA/GFZ Kp records. Kp is a geomagnetic index, not the specified Bx/By/Ez Schumann channel.',environment:{kind:'geomagnetic-index',component:'Kp',units:'index'}},
 {id:'actual-availability-corpus-text',availabilityDescription:'Selected public occult/contact corpus texts were inspected by panelists; no original-time, concealed-target information packet or numeric paired station series was acquired.',documentary:{readDepth:'selected-passages',assertionStatus:'attributed'}},
 {id:'constant-7.83-lookup-not-data',availabilityDescription:'A frequency label is not an acquired calibrated record.',environment:{kind:'constant-lookup',valueHz:7.83}}
];
for(const d of descriptors)cases.push({id:d.id,packet:{schemaVersion:1,origin:'observational',asOfUtc:base.asOfUtc,...d},expected:{environmentMetadataReady:false,informationMetadataReady:false,pairedMetadataReady:false}});
const outputs=[];
for(const {id,packet,expected}of cases){
 const result=assessPacket(packet);
 for(const [key,value]of Object.entries(expected))check(result[key]===value);
 check(result.evidenceAuthenticated===false);check(result.empiricalResult===null);check(result.couplingEstablished===false);check(result.etContactEstablished===false);
 outputs.push({id,expected,result});
}
const first=outputs[0].result;check(first.declaredAttemptCounts.declaredTrials===3);check(first.declaredAttemptCounts.hits===1);check(first.declaredAttemptCounts.abstentions===1);check(first.declaredAttemptCounts.nonhits===2);
const dictionary=unsaltedDictionaryDemo();check(dictionary.evaluatedCandidates===4);assert.deepEqual(dictionary.matches,['gold']);assertions++;check(dictionary.dictionary.every(x=>/^[a-f0-9]{64}$/.test(x.sha256)));
const results={schema:'contact-round6-results/1',status:'PASS',assertions,packetCases:outputs.length,scope:'metadata-only checks and a four-string hash dictionary; no real experiment, authenticated evidence or physical contact claim',inputBindings:f.files,outputs,availabilityDescriptors:descriptors,dictionary,physicalMeasurements:0,humanExperiments:0};
await writeFile(new URL('results.json',here),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({status:results.status,assertions,packetCases:outputs.length,fabricatedPacket:first,disclosedTarget:dictionary.matches}));

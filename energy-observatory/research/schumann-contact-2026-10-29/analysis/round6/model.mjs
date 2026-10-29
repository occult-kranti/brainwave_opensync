import {createHash} from 'node:crypto';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'&&v.trim().length>0;
const finiteNonnegative=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const digest=v=>typeof v==='string'&&/^[a-fA-F0-9]{64}$/.test(v);
function time(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value))return null;
 const ms=Date.parse(value);return Number.isFinite(ms)&&new Date(ms).toISOString()===value?ms:null;
}
function reference(value){
 if(!object(value)||!text(value.uri)||!digest(value.sha256))return false;
 try{const u=new URL(value.uri);return u.protocol==='https:'&&Boolean(u.hostname);}catch{return false;}
}
export function assessPacket(packet){
 const p=object(packet)?packet:{},common=[];
 if(p.schemaVersion!==1)common.push('schemaVersion must be 1');
 if(!['synthetic','observational'].includes(p.origin))common.push('origin must be synthetic or observational');
 const asOf=time(p.asOfUtc);if(asOf===null)common.push('asOfUtc must be a valid canonical UTC timestamp');
 const reasons={common,documentary:[...common],environment:[...common],information:[...common],paired:[...common]};
 const requireText=(value,label,errors)=>{if(!text(value))errors.push(`${label} requires nonempty text`);};
 const requireRef=(value,label,errors)=>{if(!reference(value))errors.push(`${label} requires inert HTTPS URI and 64-hex SHA256`);};
 const requireTime=(value,label,errors)=>{const ms=time(value);if(ms===null)errors.push(`${label} requires a valid canonical UTC timestamp`);else if(asOf!==null&&ms>asOf)errors.push(`${label} is after asOfUtc`);return ms;};
 const d=p.documentary;
 if(!object(d))reasons.documentary.push('documentary lane is absent');else{
  requireRef(d.source,'documentary.source',reasons.documentary);requireText(d.readDepth,'documentary.readDepth',reasons.documentary);
  if(d.assertionStatus!=='attributed')reasons.documentary.push('documentary assertions must remain attributed');
 }
 const e=p.environment;let start=null,end=null;
 if(!object(e))reasons.environment.push('environment lane is absent');else{
  if(e.kind!=='calibrated-numeric')reasons.environment.push('environment.kind must be calibrated-numeric');
  if(!['Bx','By','Ez'].includes(e.component))reasons.environment.push('environment.component must be Bx, By or Ez');
  const requiredUnit=e.component==='Ez'?'V/m':'T';if(e.units!==requiredUnit)reasons.environment.push(`environment.units must be ${requiredUnit} for this component`);
  if(!finiteNonnegative(e.sampleRateHz)||e.sampleRateHz===0)reasons.environment.push('environment.sampleRateHz must be positive finite');
  const band=e.bandHz;
  if(!Array.isArray(band)||band.length!==2||!band.every(finiteNonnegative)||!(band[0]<band[1])||!(band[1]<e.sampleRateHz/2))reasons.environment.push('environment.bandHz must ascend from nonnegative bounds strictly below Nyquist');
  start=requireTime(e.startUtc,'environment.startUtc',reasons.environment);end=requireTime(e.endUtc,'environment.endUtc',reasons.environment);
  if(start!==null&&end!==null&&!(start<end))reasons.environment.push('environment.startUtc must precede endUtc');
  if(!finiteNonnegative(e.clockUncertaintyMs))reasons.environment.push('environment.clockUncertaintyMs must be nonnegative finite');
  for(const key of ['numericRecords','calibration','responseNoise','qc','baseline'])requireRef(e[key],`environment.${key}`,reasons.environment);
  requireText(e.estimator,'environment.estimator',reasons.environment);requireText(e.missingnessRule,'environment.missingnessRule',reasons.environment);
 }
 const info=p.information,eventTimes=[],counts={declaredTrials:0,hits:0,misses:0,abstentions:0,nonhits:0};
 if(!object(info))reasons.information.push('information lane is absent');else{
  if(!Number.isSafeInteger(info.K)||info.K<2)reasons.information.push('information.K must be a safe integer >= 2');
  if(!Number.isSafeInteger(info.N)||info.N<1)reasons.information.push('information.N must be a safe integer >= 1');
  for(const key of ['targetCustody','responseArchive','scoringPlan','generationAudit'])requireRef(info[key],`information.${key}`,reasons.information);
  if(info.generationAssumption!=='independent-uniform-conditional')reasons.information.push('information.generationAssumption must declare conditional independent uniform targets');
  if(info.stoppingRule!=='fixed-N')reasons.information.push('information.stoppingRule must be fixed-N');
  if(info.commitmentScheme!=='salted-domain-separated-sha256')reasons.information.push('information.commitmentScheme must be salted-domain-separated-sha256');
  if(!Array.isArray(info.trials))reasons.information.push('information.trials must be an array');else{
   counts.declaredTrials=info.trials.length;if(info.trials.length!==info.N)reasons.information.push('information.N must equal all declared trials including abstentions');
   const ids=new Set();
   for(let index=0;index<info.trials.length;index++){
    const t=info.trials[index],label=`information.trials[${index}]`;
    if(!object(t)){reasons.information.push(`${label} must be an object`);continue;}
    if(!text(t.id))reasons.information.push(`${label}.id must be nonempty`);else if(ids.has(t.id))reasons.information.push(`${label}.id is duplicated`);else ids.add(t.id);
    if(!['hit','miss','abstain'].includes(t.status))reasons.information.push(`${label}.status must be hit, miss or abstain`);
    if(t.status==='hit')counts.hits++;if(t.status==='miss')counts.misses++;if(t.status==='abstain')counts.abstentions++;
    if(t.eventTimeBasis!=='original-event')reasons.information.push(`${label}.eventTimeBasis must be original-event, not upload/repost time`);
    const event=requireTime(t.eventUtc,`${label}.eventUtc`,reasons.information),locked=requireTime(t.responseLockedUtc,`${label}.responseLockedUtc`,reasons.information),reveal=requireTime(t.revealUtc,`${label}.revealUtc`,reasons.information);
    if(event!==null)eventTimes.push(event);
    if(event!==null&&locked!==null&&event>locked)reasons.information.push(`${label}: event must not follow response lock`);
    if(locked!==null&&reveal!==null&&locked>=reveal)reasons.information.push(`${label}: response lock must strictly precede reveal`);
    if(!object(t.commitment))reasons.information.push(`${label}.commitment is absent`);else{
     if(!digest(t.commitment.sha256))reasons.information.push(`${label}.commitment.sha256 requires 64 hex`);
     const committed=requireTime(t.commitment.committedUtc,`${label}.commitment.committedUtc`,reasons.information),nonceReveal=requireTime(t.commitment.nonceRevealUtc,`${label}.commitment.nonceRevealUtc`,reasons.information);
     if(committed!==null&&locked!==null&&committed>=locked)reasons.information.push(`${label}: commitment must strictly precede response lock`);
     if(!Number.isSafeInteger(t.commitment.nonceBits)||t.commitment.nonceBits<128)reasons.information.push(`${label}.commitment.nonceBits must declare integer >=128`);
     if(nonceReveal!==null&&reveal!==null&&nonceReveal<reveal)reasons.information.push(`${label}: nonce reveal must not precede target reveal`);
    }
   }
  }
 }
 counts.nonhits=counts.misses+counts.abstentions;
 const documentaryMetadataReady=reasons.documentary.length===0,environmentMetadataReady=reasons.environment.length===0,informationMetadataReady=reasons.information.length===0;
 if(!environmentMetadataReady)reasons.paired.push('environment metadata lane is not ready');
 if(!informationMetadataReady)reasons.paired.push('information metadata lane is not ready');
 if(p.origin!=='observational')reasons.paired.push('paired observational readiness requires observational origin; synthetic remains synthetic');
 const paired=p.paired;
 if(!object(paired))reasons.paired.push('paired lane is absent');else{
  requireRef(paired.crosswalk,'paired.crosswalk',reasons.paired);
  const locked=requireTime(paired.protocolLockedUtc,'paired.protocolLockedUtc',reasons.paired);
  if(locked!==null&&start!==null&&locked>=start)reasons.paired.push('paired protocol must strictly precede environmental start');
  if(locked!==null&&eventTimes.length&&locked>=Math.min(...eventTimes))reasons.paired.push('paired protocol must strictly precede earliest event');
  for(const key of ['lagRule','nullAssumption','calendarControls'])requireText(paired[key],`paired.${key}`,reasons.paired);
  if(!finiteNonnegative(paired.maxClockUncertaintyMs))reasons.paired.push('paired.maxClockUncertaintyMs must be nonnegative finite');
  else if(object(e)&&finiteNonnegative(e.clockUncertaintyMs)&&e.clockUncertaintyMs>paired.maxClockUncertaintyMs)reasons.paired.push('environment clock uncertainty exceeds paired tolerance');
  if(start!==null&&end!==null&&eventTimes.some(t=>t<start||t>end))reasons.paired.push('all original event times must lie within the environmental window');
 }
 return{schemaVersion:1,origin:p.origin??'unknown',documentaryMetadataReady,environmentMetadataReady,informationMetadataReady,pairedMetadataReady:reasons.paired.length===0,reasons,
  declaredAttemptCounts:counts,evidenceAuthenticated:false,empiricalResult:null,couplingEstablished:false,etContactEstablished:false,
  scope:'Syntax and internal chronology only. Inert references were not retrieved or hash-matched; declarations and self-attestations do not authenticate any evidence.'};
}
export function unsaltedDictionaryDemo(){
 const targets=['copper','silver','gold','iron'],selectedTarget='gold',hash=word=>createHash('sha256').update(word,'utf8').digest('hex');
 const publishedDigest=hash(selectedTarget),dictionary=targets.map(target=>({target,sha256:hash(target)})),matches=dictionary.filter(item=>item.sha256===publishedDigest).map(item=>item.target);
 return{targets,publishedDigest,dictionary,matches,evaluatedCandidates:dictionary.length,encoding:'literal UTF-8 without newline',scope:'Four-element unsalted dictionary disclosure demonstration only; no real targets, secret nonces or salted-security proof'};
}

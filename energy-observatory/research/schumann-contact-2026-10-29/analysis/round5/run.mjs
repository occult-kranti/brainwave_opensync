import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pmfInfo,binomialTail,binomialTailInfo,rejectionThreshold,leakDistribution,contamination,score} from './model.mjs';
const here=new URL('.',import.meta.url),raw=await readFile(new URL('fixtures.json',here)),f=JSON.parse(raw),freeze=JSON.parse(await readFile(new URL('input-freeze.json',here),'utf8'));
assert.equal(createHash('sha256').update(raw).digest('hex'),freeze.fixturesSha256);
let assertions=1;const check=v=>{assert(v);assertions++},close=(a,b)=>check(Math.abs(a-b)<=Math.max(1e-14,Math.abs(b)*1e-10));
const threshold=rejectionThreshold({n:f.n,p:1/f.k,alpha:f.alpha});check(threshold.tailAtThreshold<=f.alpha);check(threshold.tailAtPrevious>f.alpha);
const scores=f.hitCounts.map(h=>score({n:f.n,k:f.k,h,alpha:f.alpha}));
const fullTails=Array.from({length:f.n+2},(_,h)=>({h,tail:binomialTail({n:f.n,p:1/f.k,h})}));
for(let h=1;h<fullTails.length;h++)check(fullTails[h].tail<=fullTails[h-1].tail);
const leak=leakDistribution(f);close(leak.q,.4);let maxLeakPmfDifference=0;
for(let h=0;h<=f.n;h++){close(leak.mixturePmf[h],leak.sameQBinomialPmf[h]);maxLeakPmfDifference=Math.max(maxLeakPmfDifference,Math.abs(leak.mixturePmf[h]-leak.sameQBinomialPmf[h]));}
close(leak.mixturePmf.reduce((a,b)=>a+b,0),1);close(leak.sameQBinomialPmf.reduce((a,b)=>a+b,0),1);
const contaminationGrid=[];
for(const h of f.contaminationHitThresholds)for(const m of f.compromisedCounts){
 const value=contamination({n:f.n,k:f.k,h,m});check(value.arbitraryOutcomeCorruption.upperBound+1e-14>=value.preselectedSubset.tail);
 if(m===0)close(value.preselectedSubset.tail,value.arbitraryOutcomeCorruption.upperBound);
 if(h<=m){check(value.preselectedSubset.tail===1);check(value.arbitraryOutcomeCorruption.upperBound===1);}
 contaminationGrid.push(value);
}
const degenerate=[];
for(const request of [{n:0,p:.25,h:0},{n:0,p:.25,h:1},{n:100,p:0,h:0},{n:100,p:0,h:1},{n:100,p:1,h:100},{n:100,p:1,h:101},{n:100,p:.25,h:-100},{n:1000,p:.5,h:1000}]){
 const tail=binomialTail(request);degenerate.push({request,tail});
 const expected=request.h<=0?1:request.h>request.n?0:request.p===0?0:request.p===1?1:2**-1000;close(tail,expected);
}
check(rejectionThreshold({n:0,p:.25,alpha:.05}).h===1);check(!rejectionThreshold({n:0,p:.25,alpha:.05}).attainable);
const underflow=binomialTailInfo({n:1000,p:.25,h:1000});check(underflow.probability===null);check(underflow.status==='positive-underflow');close(underflow.logProbability,-1000*Math.log(4));
let strictUnderflowRejected=false;try{binomialTail({n:1000,p:.25,h:1000})}catch(e){strictUnderflowRejected=e instanceof RangeError}check(strictUnderflowRejected);
const pmfUnderflow=pmfInfo({n:1000,p:.25});check(pmfUnderflow.positiveUnderflowIndices.includes(1000));check(pmfUnderflow.probabilities[1000]===null);close(pmfUnderflow.logProbabilities[1000],-1000*Math.log(4));
const largeKUnderflow=score({n:100,k:1000000,h:100});check(largeKUnderflow.upperTail===null);check(largeKUnderflow.upperTailInfo.status==='positive-underflow');close(largeKUnderflow.upperTailInfo.logProbability,100*Math.log(1e-6));
const invalid=[];
const requests=[['fractional-n','tail',{n:.5,p:.25,h:0}],['too-large-n','tail',{n:1001,p:.25,h:0}],['negative-n','tail',{n:-1,p:.25,h:0}],['nonfinite-n','tail',{n:Infinity,p:.25,h:0}],['fractional-h','tail',{n:100,p:.25,h:.5}],['nonfinite-h','tail',{n:100,p:.25,h:NaN}],['negative-p','tail',{n:100,p:-.1,h:30}],['large-p','tail',{n:100,p:1.1,h:30}],['nonfinite-p','tail',{n:100,p:Infinity,h:30}],['fractional-k','score',{n:100,k:2.5,h:30}],['small-k','score',{n:100,k:1,h:30}],['large-k','score',{n:100,k:1000001,h:30}],['negative-h','score',{n:100,k:4,h:-1}],['too-large-h','score',{n:100,k:4,h:101}],['negative-m','contamination',{n:100,k:4,h:40,m:-1}],['large-m','contamination',{n:100,k:4,h:40,m:101}],['fractional-m','contamination',{n:100,k:4,h:40,m:.5}],['negative-epsilon','leak',{n:100,k:4,epsilon:-.1}],['large-epsilon','leak',{n:100,k:4,epsilon:1.1}],['nonfinite-epsilon','leak',{n:100,k:4,epsilon:NaN}],['zero-alpha','threshold',{n:100,p:.25,alpha:0}],['one-alpha','threshold',{n:100,p:.25,alpha:1}]];
const actions={tail:binomialTail,threshold:rejectionThreshold,leak:leakDistribution,contamination,score};
for(const [name,kind,request]of requests){let rejected=false;try{actions[kind](request)}catch(e){rejected=e instanceof RangeError}check(rejected);invalid.push({name,rejected});}
const results={schema:'contact-round5-results/2',status:'PASS',assertions,inputSha256:freeze.fixturesSha256,scope:'exact binomial-test formulas in bounded binary64 arithmetic; no actual attempts or source attribution',threshold,scores,fullTails,leak:{...leak,maxPmfDifference:maxLeakPmfDifference},contaminationGrid,degenerate,underflow:{...underflow,strictNumericApiRejected:strictUnderflowRejected,exactPositiveCertificate:'4^-1000 > 0',pmfUnderflowIndices:pmfUnderflow.positiveUnderflowIndices},largeKUnderflow,invalid,physicalMeasurements:0};
await writeFile(new URL('results.json',here),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({status:results.status,assertions,threshold,scores:scores.map(s=>({h:s.h,p:s.upperTail})),maxLeakPmfDifference}));

import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {evaluate as evaluate32} from '../round3/model.mjs';
import {evaluateN,sharedDriver} from './model.mjs';
const here=new URL('.',import.meta.url),raw=await readFile(new URL('fixtures.json',here));
const inputFreeze=JSON.parse(await readFile(new URL('input-freeze.json',here),'utf8'));
assert.equal(createHash('sha256').update(raw).digest('hex'),inputFreeze.fixturesSha256);
const f=JSON.parse(raw);let assertions=1;const check=v=>{assert(v);assertions++};
const old=JSON.parse(await readFile(new URL('../round3/fixtures.json',here),'utf8'));
const parity=[];
for(const fixture of old.fixtures){const a=evaluate32({...fixture,lags:old.lags,alpha:old.alpha}),b=evaluateN({...fixture,lags:old.lags,alpha:old.alpha});assert.deepEqual(a.offsets,b.offsets);assertions++;assert.deepEqual(a.rejections,b.rejections);assertions++;parity.push({id:fixture.id,allOffsetsExact:true,rejectionsExact:true});}
const outputs=[];
for(const fixture of f.fixtures){
 const result=evaluateN({...fixture,lags:f.lags,alpha:f.alpha}),allLagResult=evaluateN({...fixture,lags:Array.from({length:256},(_,i)=>i),alpha:f.alpha});
 check(result.rejections.fixed.fraction<=result.globalNullLevelBound);check(result.rejections.lockedMaximum.fraction<=result.globalNullLevelBound);
 for(const o of result.offsets){check(o.maximumP>=o.invalidSelectedMinimumP);check(o.maximumCount>=7);}
 for(const o of allLagResult.offsets){check(o.maximumP===1);check(o.maximumCount===256)}
 const best=result.offsets.reduce((best,o)=>o.maximumScore>best.maximumScore?o:best,result.offsets[0]);
 outputs.push({id:fixture.id,result,allLags:allLagResult,alignedOffsetZero:result.offsets[0],mostAligned:best});
}
const rank=sharedDriver(f.rankFixture);
assert.deepEqual(rank.observational.modelA,rank.observational.modelB);assertions++;
check(rank.observational.design.rank===1);check(rank.observational.design.nullity===1);check(rank.observational.design.gramDeterminant==='0');
check(rank.observational.kernelImage.every(v=>v===0));check(rank.duplicateSensor.rank===1);check(rank.duplicateSensor.nullity===2);
for(const witness of rank.duplicateSensor.kernelWitnesses){const image=rank.z.map((_,i)=>witness.reduce((s,v,j)=>s+v*rank.duplicateSensor.columns[j][i],0));check(image.every(v=>v===0));}
check(rank.hypothetical.design.rank===2);check(rank.hypothetical.design.nullity===0);check(BigInt(rank.hypothetical.design.gramDeterminant)>0n);
assert.deepEqual(rank.hypothetical.difference,rank.hypothetical.expectedDifference);assertions++;
const c=rank.hypothetical.design.columns,minor=c[0][0]*c[1][1]-c[1][0]*c[0][1];check(minor!==0);rank.hypothetical.nonzeroRowMinor={rows:[0,1],determinant:minor};
const invalid=[];
for(const [name,request,kind]of [['empty-phase',{x:[],y:[],lags:[0]},'phase'],['nonfinite-phase',{x:Array(256).fill(Infinity),y:f.fixtures[0].y,lags:[0]},'phase'],['aliased-lags',{...f.fixtures[0],lags:[0,256]},'phase'],['fractional-rank',{z:[0,.5],u:[0,0]},'rank'],['unequal-rank',{z:[0,1],u:[0]},'rank'],['nonfinite-rank',{z:[0,1],u:[0,Infinity]},'rank']]){let rejected=false;try{kind==='rank'?sharedDriver(request):evaluateN(request)}catch(e){rejected=e instanceof RangeError}check(rejected);invalid.push({name,rejected});}
const results={schema:'contact-round4-results/1',status:'PASS',assertions,inputSha256:inputFreeze.fixturesSha256,scope:'synthetic finite-group resolution and exact observational-equivalence examples; no physical or contact evidence',parity,outputs,rank,invalid,physicalMeasurements:0};
await writeFile(new URL('results.json',here),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({status:results.status,assertions,fixtures:outputs.map(o=>({id:o.id,rejections:o.result.rejections,alignedMaximumP:o.alignedOffsetZero.maximumP})),ranks:[rank.observational.design.rank,rank.hypothetical.design.rank]}));

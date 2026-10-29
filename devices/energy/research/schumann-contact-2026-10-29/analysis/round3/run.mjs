import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {evaluate} from './model.mjs';
const here=new URL('.',import.meta.url),raw=await readFile(new URL('fixtures.json',here));
const inputFreeze=JSON.parse(await readFile(new URL('input-freeze.json',here),'utf8'));
assert.equal(createHash('sha256').update(raw).digest('hex'),inputFreeze.fixturesSha256);
const fixtures=JSON.parse(raw);let assertions=1;
const check=v=>{assert(v);assertions++};
const outputs=[];
for(const fixture of fixtures.fixtures){
  const result=evaluate({...fixture,lags:fixtures.lags,alpha:fixtures.alpha});
  const allLagResult=evaluate({...fixture,lags:Array.from({length:32},(_,i)=>i),alpha:fixtures.alpha});
  check(result.rejections.fixed.fraction<=result.globalNullLevelBound);
  check(result.rejections.lockedMaximum.fraction<=result.globalNullLevelBound);
  for(const entry of result.offsets){
    check(Number.isInteger(entry.fixedCount)&&entry.fixedCount>=1&&entry.fixedCount<=32);
    check(Number.isInteger(entry.maximumCount)&&entry.maximumCount>=1&&entry.maximumCount<=32);
    check(entry.maximumP>=entry.invalidSelectedMinimumP);
    check(entry.maximumScore+1e-12>=entry.fixedScore);
  }
  for(const entry of allLagResult.offsets){check(entry.maximumP===1);check(entry.maximumCount===32)}
  check(allLagResult.rejections.lockedMaximum.count===0);
  outputs.push({id:fixture.id,result,allLags:allLagResult});
}
const base={...fixtures.fixtures[0],lags:fixtures.lags,alpha:fixtures.alpha};
const invalidPatches=[
 ['constant-x',{x:Array(32).fill(1)}],['constant-y',{y:Array(32).fill(0)}],['short-x',{x:base.x.slice(1)}],['unequal-y',{y:[...base.y,1]}],
 ['nonfinite-x',{x:base.x.map((v,i)=>i===3?Infinity:v)}],['nan-y',{y:base.y.map((v,i)=>i===3?NaN:v)}],['string-x',{x:base.x.map((v,i)=>i===3?'1':v)}],
 ['null-x',{x:null}],['empty-lags',{lags:[]}],['fractional-lag',{lags:[.5]}],['aliased-lag',{lags:[0,32]}],['nan-lag',{lags:[NaN]}],
 ['missing-lags',{lags:undefined}],['zero-alpha',{alpha:0}],['one-alpha',{alpha:1}],['nonfinite-alpha',{alpha:Infinity}]
];
const invalid=[];
for(const [name,patch]of invalidPatches){let rejected=false;try{evaluate({...base,...patch})}catch(e){rejected=e instanceof RangeError}check(rejected);invalid.push({name,rejected})}
const result={schema:'contact-round3-results/1',status:'PASS',scope:'exact enumeration of stipulated synthetic phase null; no measured contact or Schumann data',
  assertions,inputSha256:inputFreeze.fixturesSha256,selection:fixtures.selection,outputs,invalid,physicalMeasurements:0};
await writeFile(new URL('results.json',here),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,assertions,fixtures:outputs.map(o=>({id:o.id,rejections:o.result.rejections,allLagP:1}))}));

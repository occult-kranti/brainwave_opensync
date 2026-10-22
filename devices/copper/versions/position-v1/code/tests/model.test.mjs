import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { sphereModes, samplingBudget, responseComparison, relativeUncertainty } from '../src/model.mjs';
const root=new URL('../',import.meta.url);
const load=name=>JSON.parse(readFileSync(new URL(name,root),'utf8'));
const hash=name=>createHash('sha256').update(readFileSync(new URL(name,root))).digest('hex');
const close=(x,y,tol=1e-12)=>assert.ok(Math.abs(x-y)<=tol*Math.max(Math.abs(y),1),`${x} vs ${y}`);
test('radial-mode units and independent numerical fixture',()=>{
 const p=sphereModes();
 const r=load('research/physics-verification.json').default_model;
 for(const key of ['massKg','cL','cT'])close(p[key],r[key]);
 p.frequenciesHz.forEach((v,i)=>close(v,r.frequenciesHz[i]));
 close(p.massKg,.07330382858376185);
 assert.ok(p.frequenciesHz[0]>160000&&p.frequenciesHz[0]<170000);
});
test('physical scalings and input domain',()=>{
 const b=sphereModes();
 const twiceR=sphereModes({radiusMm:25}),fourE=sphereModes({E_GPa:494});
 b.frequenciesHz.forEach((f,i)=>{close(twiceR.frequenciesHz[i],f/2);close(fourE.frequenciesHz[i],f*2);});
 for(const p of [{radiusMm:0},{nu:.5},{E_GPa:NaN},{rhoKgM3:Infinity}])assert.throws(()=>sphereModes(p));
 assert.throws(()=>relativeUncertainty({nu:.49}));
});
test('tallest peak can switch with unchanged poles; support toy changes poles',()=>{
 const path=responseComparison({position:1,scenario:'path'});
 assert.deepEqual(path.polesAHz,path.polesBHz);
 assert.ok(Math.abs(path.peakAHz-path.peakBHz)>100000);
 const same=responseComparison({position:0}); assert.deepEqual(same.aDb,same.bDb);
 const spring=responseComparison({scenario:'contact'}); assert.ok(spring.polesBHz.every((f,i)=>f>spring.polesAHz[i]));
 const noSpring=responseComparison({scenario:'contact',supportStiffnessNPerM:0});assert.deepEqual(noSpring.aDb,noSpring.bDb);
 assert.ok(responseComparison({Q:.51}).frequencyHz.every(f=>f>0));
});
test('sampling distinguishes strict Nyquist and selected-mode coverage',()=>{
 assert.equal(samplingBudget({sampleRateHz:48000}).validNyquist,false);
 assert.equal(samplingBudget({sampleRateHz:400000}).validNyquist,false);
 const s=samplingBudget({fMaxHz:100000,sampleRateHz:1000000});
 assert.equal(s.validNyquist,true);assert.equal(s.modeWithinBand,false);assert.equal(s.validPlan,false);
 close(s.binHz,10);
});
test('source graph IDs, explicit reading depth and scoped claims',()=>{
 const e=load('src/evidence.json');
 const ids=new Set([...e.sources,...e.topics].map(s=>s.id));
 assert.equal(ids.size,e.sources.length+e.topics.length);
 for(const s of e.sources){assert.ok(s.title&&s.url&&s.access_read_depth&&s.limits);assert.match(s.url,/^https:\/\//);}
 for(const x of e.edges){assert.ok(ids.has(x.source)&&ids.has(x.target));assert.ok(e.sources.some(s=>s.id===x.evidence));assert.ok(x.relation);}
 assert.equal(e.topics.find(t=>t.id==='position-hypothesis').status,'unresolved');
});
test('independent evidence was frozen and binds current calculator and analysis',()=>{
 const frozen=load('research/initial-review/independent-freeze.json');
 for(const [name,expected]of Object.entries(frozen.sha256))assert.equal(hash('research/initial-review/'+name),expected);
 const receipt=load('research/physics-verification.json');assert.equal(receipt.status,'passed');assert.equal(receipt.source_sha256,hash('src/model.mjs'));
 assert.equal(load('research/postreview-model-results.json').model_sha256,hash('src/model.mjs'));
 const a=load('analysis/verification.json');
 for(const [name,expected]of Object.entries(a.source_sha256))assert.equal(hash(name),expected);
});

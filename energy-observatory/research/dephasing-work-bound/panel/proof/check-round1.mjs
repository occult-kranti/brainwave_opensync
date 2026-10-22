import assert from 'node:assert/strict';
import { dephasingWorkBound as f, maxCoherenceMagnitude as maxR } from '../../../../src/dephasing-bound.mjs';
const c = (r=0,i=0) => [r,i];
const add = (a,b) => c(a[0]+b[0],a[1]+b[1]);
const mul = (a,b) => c(a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]);
const conj = a => c(a[0],-a[1]);
const mm = (a,b) => a.map(row => [0,1].map(j => add(mul(row[0],b[0][j]),mul(row[1],b[1][j]))));
const dagger = a => [0,1].map(i => [0,1].map(j => conj(a[j][i])));
let seed=897123;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
let maxMatrixResidual=0,maxSpectrumResidual=0;
for(let i=0;i<4000;i++) {
  const p=random(),r=maxR(p)*random(),d=random(),phase=6.28*random();
  const result=f({population:p,coherenceMagnitude:r,dephasing:d,gapJ:1});
  const z=1-2*p,R=Math.hypot(z,2*d*r);
  const a=Math.sqrt((1+z/R)/2), b=Math.sqrt((1-z/R)/2);
  const ep=c(Math.cos(phase),Math.sin(phase));
  const U=[[c(a),mul(ep,c(b))],[mul(conj(ep),c(-b)),c(a)]];
  const rho=[[c(1-p),mul(ep,c(d*r))],[mul(conj(ep),c(d*r)),c(p)]];
  const passive=mm(mm(U,rho),dagger(U));
  const residual=Math.max(Math.abs(passive[0][0][0]-(1+R)/2),Math.abs(passive[1][1][0]-(1-R)/2),Math.hypot(...passive[0][1]));
  maxMatrixResidual=Math.max(maxMatrixResidual,residual);
  assert.ok(residual<2e-11);
  const fromMatrix=p-passive[1][1][0];
  maxSpectrumResidual=Math.max(maxSpectrumResidual,Math.abs(fromMatrix-result.workAfterNormalized));
  assert.ok(Math.abs(fromMatrix-result.workAfterNormalized)<2e-11);
  assert.ok(result.lossNormalized>=0&&result.lossNormalized<=result.boundNormalized);
  assert.ok(Math.abs(result.lossNormalized-(result.workBeforeNormalized-result.workAfterNormalized))<5e-16);
}
for(const p of [0,.1,.5,.9,1]) for(const d of [0,.25,1]) {
  const result=f({population:p,coherenceMagnitude:0,dephasing:d,gapJ:2});
  assert.equal(result.lossJ,0);assert.equal(result.lowerEquality,true);assert.equal(result.upperEquality,true);
}
for(const d of [0,.25,1]) {
  const result=f({population:.5,coherenceMagnitude:.25,dephasing:d,gapJ:2});
  assert.equal(result.lossJ,.5*(1-d));assert.equal(result.upperEquality,true);
}
const near=f({population:.2,coherenceMagnitude:1e-12,dephasing:.5,gapJ:1});
assert.equal((near.radiusBefore-near.radiusAfter)/2,0);assert.ok(near.lossNormalized>0);
const rescued=f({population:.2,coherenceMagnitude:1e-200,dephasing:.5,gapJ:1e300});
assert.equal(rescued.representability.lossNormalized,'underflow');assert.ok(rescued.lossJ>0);
const small=f({population:.5,coherenceMagnitude:Number.MIN_VALUE,dephasing:.5,gapJ:1e300});
assert.equal(small.representability.lossNormalized,'underflow');assert.ok(small.lossJ>0);
assert.throws(()=>f({population:0,coherenceMagnitude:Number.MIN_VALUE,dephasing:.5,gapJ:1}));
for(const [key,value] of [['population',-.1],['population',1.1],['coherenceMagnitude',NaN],['dephasing',Infinity],['gapJ',0],['gapJ','1']]) {
  assert.throws(()=>f({population:.5,coherenceMagnitude:.1,dephasing:.5,gapJ:1,[key]:value}));
}
console.log(JSON.stringify({status:'PASS',matrixStates:4000,maxMatrixResidual,maxSpectrumResidual,cancellationCase:near,normalizedUnderflowRescuedJ:rescued.lossJ,subnormalCoherenceRescuedJ:small.lossJ},null,2));

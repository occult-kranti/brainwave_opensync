import test from 'node:test';
import assert from 'node:assert/strict';
import {finiteModalDiagnostics,nuisanceDesignDiagnostics,globalAliasDiagnostics} from '../src/design-diagnostics.mjs';

const near=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<=t,`${a} differs from ${b}`);

test('center node hides the second modal state pair and removes its reachability',()=>{
 const r=finiteModalDiagnostics();
 assert.equal(r.stateDimension,6);assert.equal(r.modeCount,3);
 assert.equal(r.observability.rank,4);assert.equal(r.observability.stateNullity,2);
 assert.equal(r.controllability.rank,4);assert.equal(r.controllability.stateNullity,2);
 near(r.sensorParticipation[0][1],0);near(r.driveParticipation[0][1],0);
 assert.equal(r.observability.kernel.length,2);assert.equal(r.controllability.kernel.length,2);
 assert.ok(r.observability.maxKernelResidual<1e-10);assert.ok(r.controllability.maxKernelResidual<1e-10);
 assert.ok(r.observability.scaling.columnNorms.every(Number.isFinite));
 assert.match(r.noisyConditioningLimit,/does not establish/);
});

test('sensor-only repair cannot repair the drive kernel',()=>{
 const r=finiteModalDiagnostics({sensorPositions:[.5,.25],drivePositions:[.5]});
 assert.equal(r.observability.rank,6);assert.equal(r.observability.stateNullity,0);
 assert.equal(r.controllability.rank,4);assert.equal(r.controllability.stateNullity,2);
});

test('independent nonnodal source and sensor geometry closes this finite structural kernel',()=>{
 const r=finiteModalDiagnostics({sensorPositions:[.5,.25],drivePositions:[.5,.25]});
 assert.equal(r.observability.rank,6);assert.equal(r.controllability.rank,6);
 assert.deepEqual(r.observability.kernel,[]);assert.deepEqual(r.controllability.kernel,[]);
 assert.equal(r.observability.tolerance,1e-10);
 assert.match(r.finiteModelScope,/dimensionless/);assert.match(r.finiteModelScope,/not a complete/);
});

test('one generic sensor observes distinct known modes over time; duplicate nodal channels add no information',()=>{
 const generic=finiteModalDiagnostics({sensorPositions:[.25],drivePositions:[.25]});
 assert.equal(generic.observability.rank,6);assert.equal(generic.controllability.rank,6);
 const duplicate=finiteModalDiagnostics({sensorPositions:[.5,.5],drivePositions:[.5,.5]});
 assert.equal(duplicate.observability.rank,4);assert.equal(duplicate.controllability.rank,4);
 const endpoints=finiteModalDiagnostics({sensorPositions:[0,1],drivePositions:[0,1]});
 assert.equal(endpoints.observability.rank,0);assert.equal(endpoints.controllability.rank,0);
 assert.equal(endpoints.observability.stateNullity,6);
});

test('near-node geometry retains nonzero participation and separates structural rank from noisy detectability',()=>{
 for(const position of [1e-16,.5+Number.EPSILON]){
  const r=finiteModalDiagnostics({sensorPositions:[position],drivePositions:[position]});
  assert.ok(r.sensorParticipation[0].every(value=>value!==0));
  assert.equal(r.observability.rank,6);assert.equal(r.controllability.rank,6);
  assert.match(r.noisyConditioningLimit,/Full structural rank does not establish/);
 }
 const exact=finiteModalDiagnostics({sensorPositions:[1/3],drivePositions:[1/3]});
 assert.equal(exact.sensorParticipation[0][2],0);
 assert.equal(exact.observability.rank,4);assert.equal(exact.controllability.rank,4);
});

test('location locked to temperature has a genuine target-changing kernel',()=>{
 const r=nuisanceDesignDiagnostics();
 assert.equal(r.rank,3);assert.equal(r.nullity,1);assert.equal(r.locationTargetEstimable,false);
 assert.ok(r.targetKernelComponentMax>.1);assert.ok(r.maxKernelResidual<1e-12);
 const direction=r.kernel[0];
 near(direction[2]/direction[3],-.2);
 for(const row of r.matrix)near(row.reduce((sum,x,j)=>sum+x*direction[j],0),0);
});

test('independently varied temperature restores estimability only in the declared family',()=>{
 const r=nuisanceDesignDiagnostics({design:'independent-temperature'});
 assert.equal(r.rank,4);assert.equal(r.nullity,0);assert.equal(r.locationTargetEstimable,true);
 assert.deepEqual(r.kernel,[]);assert.match(r.caveats.join(' '),/not protection/);
});

test('actual retained Location model has identical full responses at symmetric distinct positions',()=>{
 const r=globalAliasDiagnostics();
 assert.deepEqual(r.positions,[.25,.75]);assert.equal(r.maxPoleDifferenceHz,0);
 assert.equal(r.maxResponseDifference,0);assert.equal(r.ambiguityEstablished,true);
 assert.deepEqual(r.coupledHzA,r.coupledHzB);assert.match(r.inference,/ambiguity/);
});

test('invalid geometry, unbounded channel count, design, and tolerance reject before allocation',()=>{
 for(const p of [{sensorPositions:[]},{drivePositions:Array(5).fill(.5)},{sensorPositions:[NaN]},{drivePositions:[-.1]},{sensorPositions:[1.1]},{tolerance:0},{tolerance:Infinity}])assert.throws(()=>finiteModalDiagnostics(p));
 assert.throws(()=>nuisanceDesignDiagnostics({design:'posthoc'}));
 assert.throws(()=>nuisanceDesignDiagnostics({tolerance:1}));
});

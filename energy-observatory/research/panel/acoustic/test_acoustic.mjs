import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {acousticSolve,acousticSweep,planeWaveReference} from '../../../src/acoustic.mjs';
const fixture=JSON.parse(readFileSync(new URL('./results.json',import.meta.url),'utf8'));
const close=(a,b)=>assert.ok(Math.abs(a-b)<=2e-12*Math.max(Math.abs(a),Math.abs(b),1e-20),`${a} differs from ${b}`);
test('scalar harmonic solver agrees with separately frozen full state-matrix formulation',()=>{
 for(const c of fixture.fixtures){const r=acousticSolve(c.parameters);for(const k of ['inputW','loadW','mechanicalLossW','dielectricLossW','voltageRmsV','velocityRmsMps'])close(r[k],c[k]);}
});
test('passive RMS energy balance, force scaling and null coupling',()=>{
 const a=acousticSolve(),b=acousticSolve({forceRmsN:.002});close(a.inputW,a.loadW+a.mechanicalLossW+a.dielectricLossW);close(b.loadW,4*a.loadW);
 const z=acousticSolve({couplingNPerV:0});assert.equal(z.loadW,0);assert.equal(z.voltageRmsV,0);
 const quiet=acousticSolve({forceRmsN:0});assert.ok(quiet.inputW===0);assert.equal(quiet.loadW,0);assert.equal(quiet.efficiency,null);
});
test('plane-wave reference has declared aperture scope and 10 dB power scaling',()=>{
 const a=planeWaveReference({splDb:80}),b=planeWaveReference({splDb:90});close(a.pressureRmsPa,.2);close(a.referencePowerW,9.68588669449745e-7);close(b.referencePowerW,10*a.referencePowerW);
 assert.match(a.status,/not device output or a universal capture bound/);
});
test('finite sweep retains passive budget and fixed-velocity distinction',()=>{
 const s=acousticSweep();assert.equal(s.grid.cells,4941);assert.ok(s.best.loadW>=s.bestAtSelectedFrequency.loadW);
 close(s.fixedVelocityPredictedLoadOhm,1/(2*Math.PI*200*1e-7));
 assert.ok(s.bestAtSelectedFrequency.loadW>=s.predictedLoadEvaluatedInCoupledModel.loadW);
 assert.ok(s.best.efficiency<=1+1e-12);assert.ok(s.maxAbsoluteResidualW<1e-18);
});
test('invalid and singular domains reject explicitly',()=>{
 for(const p of [{loadOhm:0},{frequencyHz:0},{massKg:-1},{capacitanceF:NaN},{dampingNsPerM:-.1},{forceRmsN:Infinity},{dielectricConductanceS:-1}])assert.throws(()=>acousticSolve(p),RangeError);
 assert.throws(()=>acousticSweep({frequencyPoints:1}),RangeError);assert.throws(()=>acousticSweep({loadMinOhm:1000,loadMaxOhm:1}),RangeError);
 assert.throws(()=>planeWaveReference({splDb:201}),RangeError);assert.throws(()=>planeWaveReference({areaM2:0}),RangeError);
});
test('matched-input sweep rescales before checking force, velocity and voltage limits',()=>{
 const s=acousticSweep({mode:'fixed-input',targetInputW:1e-6,maxForceRmsN:.002,maxVelocityRmsMps:.003,maxVoltageRmsV:.3});
 assert.equal(s.feasibleCount+s.rejectedCount,s.grid.cells);assert.ok(s.feasibleCount>0);assert.ok(s.rejectedCount>0);
 close(s.best.inputW,1e-6);assert.ok(s.best.loadW<=1e-6*(1+1e-12));
 for(const r of [...s.frequencyProfile,...s.selectedFrequencyLoadProfile.filter(r=>r.feasible)]){
   close(r.inputW,1e-6);assert.ok(r.forceRmsN<=.002);assert.ok(r.velocityRmsMps<=.003);assert.ok(r.voltageRmsV<=.3);
 }
 for(const cap of [{maxForceRmsN:1e-8},{maxVelocityRmsMps:1e-8},{maxVoltageRmsV:1e-8}]){
   const q=acousticSweep({mode:'fixed-input',frequencyMinHz:200,frequencyMaxHz:200,frequencyPoints:2,loadPoints:3,...cap});
   assert.equal(q.feasibleCount,0);assert.equal(q.rejectedCount,6);assert.equal(q.best,null);
   assert.ok(q.selectedFrequencyLoadProfile.every(r=>!r.feasible&&r.reason==='constraint-limit'));
 }
});
test('unrescalable and zero-conversion responses remain explicit; matched target must be positive',()=>{
 const s=acousticSweep({mode:'fixed-input',couplingNPerV:0,dampingNsPerM:0,frequencyPoints:2,loadPoints:3});
 assert.equal(s.feasibleCount,0);assert.equal(s.rejectedCount,6);assert.equal(s.best,null);
 assert.equal(s.rejectionCounts['nonpositive-unit-input'],6);
 const z=acousticSweep({mode:'fixed-input',couplingNPerV:0,frequencyMinHz:200,frequencyMaxHz:200,frequencyPoints:2,loadPoints:3});
 assert.equal(z.best.loadW,0);assert.equal(z.best.efficiency,0);close(z.best.inputW,1e-6);
 assert.throws(()=>acousticSweep({mode:'fixed-input',targetInputW:0}),RangeError);
 assert.throws(()=>acousticSweep({mode:'unsupported'}),RangeError);
});

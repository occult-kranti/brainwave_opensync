/** Final integration semantics, not independent validation of producer equations. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {energyClosure,phasePower,closureUncertainty} from '../../../src/metrology.mjs';
import {emSolve,emSweep} from '../../../src/em.mjs';
import {acousticSolve,acousticSweep,planeWaveReference} from '../../../src/acoustic.mjs';
import {qubitWork} from '../../../src/quantum.mjs';
import {identifiabilityDemo} from '../../../src/identifiability.mjs';

const checks=[];
function check(name,f){f();checks.push({name,status:'passed'});}
check('A resolved positive ledger residual does not identify an energy source',()=>{
 const r=energyClosure({loadJ:1.8});assert.equal(r.status,'positive-residual');
 assert.match(r.interpretation,/does not establish energy creation/);
});
check('A negative ledger residual also remains an identification problem',()=>{
 assert.equal(energyClosure({loadJ:0}).status,'negative-residual');
});
check('Supplied uncertainty broadens the interval without changing the energy ledger',()=>{
 const a=energyClosure({loadJ:1.8,standardUncertaintyJ:.01}),b=energyClosure({loadJ:1.8,standardUncertaintyJ:1});
 assert.equal(a.residualJ,b.residualJ);assert.equal(b.status,'not-resolved');
 assert.match(b.interpretation,/completeness.*not established/);
 assert.match(b.uncertaintyScope,/User-supplied.*not calculated/);
});
check('Zero uncertainty and numerical PSD tolerance are not a calibration certificate',()=>{
 assert.equal(energyClosure({standardUncertaintyJ:0}).status,'uncertainty-not-established');
 const c=closureUncertainty({covarianceJ2:Array.from({length:6},()=>Array(6).fill(0))});
 assert.equal(c.standardUncertaintyJ,0);assert.match(c.scope,/does not establish exact hardware/);
 assert.equal(c.validationTolerance,1e-12);
});
check('Reactive apparent power is not substituted for real power',()=>{
 const r=phasePower({phaseDeg:90,delayUs:0});assert.equal(r.apparentVA,1);
 assert.ok(Math.abs(r.truePowerW)<1e-15);assert.equal(r.relativeBias,null);
});
check('Zero EM source has zero output and undefined efficiency',()=>{
 const r=emSolve({driveVrms:0});assert.equal(r.outputW,0);assert.equal(r.efficiency,null);
});
check('EM declares its terminal boundary and the omitted changing-M work port',()=>{
 const text=emSolve().limits.join(' ');assert.match(text,/excluding upstream converter\/control/);assert.match(text,/Changing mutual inductance.*work port/);
});
check('EM matched-input result retains finite-grid scope and final-response limits',()=>{
 const r=emSweep({mode:'fixed-input',frequenciesHz:[900,1000],couplings:[.1,.3],loadsOhm:[10,20]});
 assert.match(r.status,/not a global optimum/);assert.match(r.rejectionPolicy,/rescaled response/);
 assert.ok(r.best);assert.ok(Math.abs(r.best.inputW-r.targetInputW)<1e-14);
});
check('Zero receiver force has zero load power and undefined efficiency',()=>{
 const r=acousticSolve({forceRmsN:0});assert.equal(r.loadW,0);assert.equal(r.efficiency,null);
});
check('Acoustic efficiency declares receiver boundary, without amplifier or capture claims',()=>{
 const text=acousticSolve().limits.join(' ');assert.match(text,/receiver mechanical input only/);assert.match(text,/outside this boundary/);
});
check('Plane-wave reference is neither device output nor a universal capture bound',()=>{
 const r=planeWaveReference();assert.match(r.status,/not device output or a universal capture bound/);
 assert.ok(!('loadW' in r));assert.ok(!('efficiency' in r));
});
check('Acoustic matched-input constraints act after amplitude rescaling',()=>{
 const r=acousticSweep({mode:'fixed-input',frequencyPoints:3,loadPoints:3});
 assert.match(r.criterion,/not a global optimum/);assert.match(r.constraints.applied,/after.*rescaling/);
 assert.ok(r.best);assert.ok(Math.abs(r.best.inputW-r.targetInputW)<1e-18);
});
check('Qubit prepared-state energy is not apparatus efficiency',()=>{
 const r=qubitWork();assert.equal(r.apparatusEfficiency,null);
 assert.ok(r.provenance.omitted.includes('preparation apparatus'));assert.ok(r.provenance.omitted.includes('reset implementation'));
});
check('A passive mixed quantum state can contain energy without unitary extractable work',()=>{
 const r=qubitWork({population:.25,coherence:0});assert.ok(r.initial.energyJ>0);assert.equal(r.initial.ergotropyJ,0);
});
check('Identifiability rank is local and does not certify unmeasured hardware',()=>{
 const r=identifiabilityDemo();assert.equal(r.rank,3);assert.equal(r.rankWithVelocity,4);
 const text=r.limits.join(' ');assert.match(text,/Numerical rank is local/);assert.match(text,/cannot certify.*unmeasured hardware/);
});
const producerSHA256={};
for(const name of ['metrology','em','acoustic','quantum','identifiability']){
 const p=fileURLToPath(new URL(`../../../src/${name}.mjs`,import.meta.url));
 producerSHA256[`${name}.mjs`]=createHash('sha256').update(readFileSync(p)).digest('hex');
}
console.log(JSON.stringify({status:'passed',dateUTC:'2026-10-22',checkCount:checks.length,checks,producerSHA256,
 scope:'Selected integration semantics checked by direct API calls. Numerical tolerances are arithmetic checks, not instrument uncertainties. Government/patent evidence is reviewed in prose, not validated by these APIs.'},null,2));

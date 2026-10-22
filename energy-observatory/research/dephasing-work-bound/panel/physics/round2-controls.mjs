import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dephasingWorkBound as evaluate, maxCoherenceMagnitude} from '../../../../src/dephasing-bound.mjs';
const root = new URL('../../../../',import.meta.url);
const sha256 = path => createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex');
const C=(r=0,i=0)=>[r,i], add=(a,b)=>C(a[0]+b[0],a[1]+b[1]), mul=(a,b)=>C(a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]);
const conj=a=>C(a[0],-a[1]);
const multiply=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((v,x,k)=>add(v,mul(x,b[k][j])),C())));
const adjoint=a=>a[0].map((_,i)=>a.map(row=>conj(row[i])));
const rho=(p,r,d,phi)=>[[C(1-p),C(d*r*Math.cos(phi),d*r*Math.sin(phi))],[C(d*r*Math.cos(phi),-d*r*Math.sin(phi)),C(p)]];
const rotate=(state,u)=>multiply(multiply(u,state),adjoint(u));
const energyOverGap=state=>state[1][1][0];
const unitary=(p,r,d,phi)=>{
 const z=1-2*p, R=Math.hypot(z,2*r*d);
 if(r*d===0) return z>=0 ? [[C(1),C()],[C(),C(1)]] : [[C(),C(1)],[C(1),C()]];
 const a=Math.sqrt((R+z)/(2*R)), b=Math.sqrt((R-z)/(2*R));
 return [[C(a),C(b*Math.cos(phi),b*Math.sin(phi))],[C(-b*Math.cos(phi),b*Math.sin(phi)),C(a)]];
};
const tests=[];
const check=(id,condition,evidence)=>{assert.ok(condition,id);tests.push({id,passed:true,...evidence});};
const passive=evaluate({population:.25,coherenceMagnitude:0,dephasing:.3,gapJ:1});
check('passive-is-not-all-stored-energy',passive.workBeforeNormalized===0&&passive.workAfterNormalized===0&&passive.lossNormalized===0,{storedEnergyOverGap:.25,actual:passive,wrongModelWorkOverGap:.25});
const coherent=evaluate({population:.5,coherenceMagnitude:.5,dephasing:0,gapJ:1});
check('dephasing-loss-is-not-heat',coherent.lossNormalized===.5&&coherent.workAfterNormalized===0,{storedEnergyBeforeOverGap:.5,storedEnergyAfterOverGap:.5,stateEnergyChangeOverGap:0,lossOverGap:coherent.lossNormalized});
const phaseCases=[];
for(const phi of [0,Math.PI/2,Math.PI,-2*Math.PI/3]){
 const p=.25,r=.25,d=.5,state=rho(p,r,d,phi),u=unitary(p,r,d,phi),out=rotate(state,u);
 const e=energyOverGap(state),eOut=energyOverGap(out),actual=evaluate({population:p,coherenceMagnitude:r,dephasing:d,gapJ:1});
 const residual=(e-eOut)-actual.workAfterNormalized;
 const frozenPulseEnergy=energyOverGap(rotate(state,unitary(p,r,d,0)));
 check(`complex-phase-${phi}`,Math.abs(residual)<2e-16&&e===p,{phaseRadians:phi,energyOverGap:e,passiveEnergyOverGap:eOut,workOverGap:e-eOut,residualOverGap:residual,fixedZeroPhasePulseEnergyOverGap:frozenPulseEnergy});
 phaseCases.push({phi,eOut,frozenPulseEnergy});
}
check('phase-access-matters-for-fixed-pulse',phaseCases[1].frozenPulseEnergy>phaseCases[1].eOut+1e-3,{correctPhaseEnergyOverGap:phaseCases[1].eOut,wrongPhaseEnergyOverGap:phaseCases[1].frozenPulseEnergy});
for(const [p,r,d] of [[0,0,0],[1,0,0],[.5,0,0],[.25,.25,1],[.5,.5,0]]){
 const actual=evaluate({population:p,coherenceMagnitude:r,dephasing:d,gapJ:1});
 check(`endpoint-${p}-${r}-${d}`,Number.isFinite(actual.lossNormalized)&&actual.lowerEquality===(r===0||d===1)&&actual.upperEquality===(r===0||d===1||p===.5),{actual});
}
let kappaRejected=false;try{evaluate({population:.25,coherenceMagnitude:1,dephasing:.5,gapJ:1});}catch(e){kappaRejected=e instanceof RangeError;}
check('historical-kappa-one-is-not-current-c',kappaRejected,{kappa:1,population:.25,representableMagnitudeAtKappaOne:maxCoherenceMagnitude(.25),explanation:'κ=1 cannot be passed as |c|=1; actual pure boundary is sqrt(p(1-p)).'});
const p=.3,boundary=maxCoherenceMagnitude(p); const buf=new ArrayBuffer(8),dv=new DataView(buf);dv.setFloat64(0,boundary);dv.setBigUint64(0,dv.getBigUint64(0)+1n);const nextUp=dv.getFloat64(0);
evaluate({population:p,coherenceMagnitude:boundary,dephasing:.5,gapJ:1});
let nextRejected=false;try{evaluate({population:p,coherenceMagnitude:nextUp,dephasing:.5,gapJ:1});}catch(e){nextRejected=e instanceof RangeError;}
check('representable-boundary-is-explicit',nextRejected,{population:p,boundary,nextUp,nextUpRejected:nextRejected});
const output={schema:'e1-physics-controls/1',round:2,status:'passed',count:tests.length,sourceHashes:{module:sha256('src/dephasing-bound.mjs'),proof:sha256('research/dephasing-work-bound/proof.md'),contract:sha256('research/dephasing-work-bound/contract.md'),checker:sha256('research/dephasing-work-bound/panel/physics/round2-controls.mjs')},scope:'Interpretation controls with explicit complex 2x2 rotation; finite checks, not a continuum proof, hardware test, or independent precision certificate.',tests};
writeFileSync(new URL('round2-results.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({status:output.status,count:output.count,sourceHashes:output.sourceHashes}));

// Additive generalization. R3 source remains untouched and supplies the tie rule.
import {TIE_TOLERANCE} from '../round3/model.mjs';
const mod=(a,n)=>((a%n)+n)%n;
function centeredUnit(values,n,name){
 if(!Array.isArray(values)||values.length!==n||values.some(v=>typeof v!=='number'||!Number.isFinite(v)))throw new RangeError(`${name} requires ${n} finite entries`);
 const scale=Math.max(...values.map(Math.abs));if(scale===0)throw new RangeError(`${name} must be nonconstant`);
 const scaled=values.map(v=>v/scale),mean=scaled.reduce((a,b)=>a+b,0)/n,centered=scaled.map(v=>v-mean),norm=Math.hypot(...centered);
 if(!(norm>0))throw new RangeError(`${name} must be nonconstant at supported resolution`);return centered.map(v=>v/norm);
}
export function evaluateN({x,y,lags,alpha=.05}){
 const n=Array.isArray(x)?x.length:0;if(n<2||n>2048)throw new RangeError('supported group size is 2 through 2048');
 if(typeof alpha!=='number'||!Number.isFinite(alpha)||alpha<=0||alpha>=1)throw new RangeError('invalid alpha');
 const xn=centeredUnit(x,n,'x'),yn=centeredUnit(y,n,'y');
 if(!Array.isArray(lags)||!lags.length||lags.some(v=>!Number.isSafeInteger(v)))throw new RangeError('lags must be nonempty safe integers');
 const reduced=lags.map(v=>mod(v,n));if(new Set(reduced).size!==reduced.length)throw new RangeError('aliased lags');
 const fixed=Array.from({length:n},(_,offset)=>Math.min(1,Math.abs(xn.reduce((sum,v,i)=>sum+v*yn[(i+offset)%n],0))));
 const maxima=fixed.map((_,offset)=>Math.max(...reduced.map(lag=>fixed[(offset+lag)%n])));
 const count=(distribution,observed)=>distribution.filter(v=>v+TIE_TOLERANCE>=observed).length;
 const fixedCounts=fixed.map(v=>count(fixed,v)),maximumCounts=maxima.map(v=>count(maxima,v));
 const offsets=fixed.map((fixedScore,offset)=>{const selected=Math.min(...reduced.map(lag=>fixedCounts[(offset+lag)%n]));return{
  offset,fixedScore,maximumScore:maxima[offset],fixedCount:fixedCounts[offset],maximumCount:maximumCounts[offset],fixedP:fixedCounts[offset]/n,maximumP:maximumCounts[offset]/n,invalidSelectedMinimumCount:selected,invalidSelectedMinimumP:selected/n};});
 const rejection=key=>{const count=offsets.filter(o=>o[key]<=alpha).length;return{count,total:n,fraction:count/n}};
 return{groupSize:n,lags:[...lags],lagResidues:reduced,alpha,tieTolerance:TIE_TOLERANCE,offsets,
  rejections:{fixed:rejection('fixedP'),lockedMaximum:rejection('maximumP'),invalidSelectedMinimum:rejection('invalidSelectedMinimumP')},globalNullLevelBound:Math.floor(n*alpha)/n,
  null:'Conditional uniform relative cyclic offset of fixed shapes; full group including identity',
  scope:'synthetic phase benchmark only; no empirical stationarity, causal mechanism or ET attribution implied'};
}
const bigintDot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0n);
function centerScaled(a){const n=BigInt(a.length),sum=a.reduce((s,v)=>s+BigInt(v),0n);return a.map(v=>n*BigInt(v)-sum)}
function design(x,z){
 const a=centerScaled(x),b=centerScaled(z),aa=bigintDot(a,a),ab=bigintDot(a,b),bb=bigintDot(b,b),det=aa*bb-ab*ab;
 const rank=aa===0n&&bb===0n?0:det===0n?1:2;
 return{dimensions:[x.length,2],centeringScale:x.length,columns:[a.map(Number),b.map(Number)],gram:[[String(aa),String(ab)],[String(ab),String(bb)]],gramDeterminant:String(det),rank,nullity:2-rank};
}
export function sharedDriver({z,u}){
 if(!Array.isArray(z)||!Array.isArray(u)||z.length!==u.length||z.length<2||z.length>2048)throw new RangeError('equal length vectors with 2 through 2048 entries required');
 if([...z,...u].some(v=>!Number.isSafeInteger(v)||Math.abs(v)>1e6))throw new RangeError('rank fixture needs integer entries of magnitude at most 1e6');
 const x=[...z],xp=z.map((v,i)=>v+u[i]),a=z.map(v=>2*v),ap=xp.map(v=>2*v),bp=[...a],difference=ap.map((v,i)=>v-bp[i]);
 const observed=design(x,z),perturbed=design(xp,z);
 const duplicateColumns=[observed.columns[0],observed.columns[1],observed.columns[1]];
 return{z:[...z],u:[...u],x,observational:{modelA:a,modelB:[...a],design:observed,kernelWitness:[1,-1],kernelImage:observed.columns[0].map((v,i)=>v-observed.columns[1][i])},
  duplicateSensor:{dimensions:[z.length,3],columns:duplicateColumns,rank:observed.rank,nullity:3-observed.rank,kernelWitnesses:[[1,-1,0],[0,1,-1]]},
  hypothetical:{xPrime:xp,modelA:ap,modelB:bp,difference,expectedDifference:u.map(v=>2*v),design:perturbed},
  interpretation:'Known synthetic models; independent intervention u stipulated, not executed or operationally established for humans or planetary fields'};
}

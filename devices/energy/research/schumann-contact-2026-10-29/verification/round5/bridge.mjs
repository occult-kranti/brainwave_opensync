import {readFile} from 'node:fs/promises';
import {score,binomialTail,binomialTailInfo,rejectionThreshold,leakDistribution,contamination,pmfInfo} from '../../analysis/round5/model.mjs';
const f=JSON.parse(await readFile(new URL('./fixtures.json',import.meta.url),'utf8'));
const tails=f.tailCases.map(c=>({id:c.id,actual:score(c)}));
const thresholds=f.thresholdCases.map(c=>({n:c.n,k:c.k,actual:rejectionThreshold({n:c.n,p:1/c.k,alpha:c.alphaNumerator/c.alphaDenominator})}));
const contaminations=f.contaminationCases.map(c=>({actual:contamination(c)}));
const leak=leakDistribution(f.leak);
const leakTails=f.leak.tails.map(c=>({h:c.h,actual:binomialTailInfo({n:f.leak.n,p:leak.q,h:c.h})}));
const invalid=f.invalidCases.map(c=>{
 const base={n:100,k:4,h:35,m:5,epsilon:.2,...c.patch};
 if(c.special)base[c.special.field]=({NaN:NaN,Infinity:Infinity,'-Infinity':-Infinity})[c.special.value];
 const field=c.special?.field??Object.keys(c.patch)[0];
 try{if(field==='epsilon')leakDistribution(base);else if(field==='m')contamination(base);else score(base);return {id:c.id,rejected:false};}
 catch(error){return {id:c.id,rejected:error instanceof RangeError};}
});
let rawTailRejected=false;try{binomialTail({n:1000,p:.25,h:1000})}catch(error){rawTailRejected=error instanceof RangeError}
const underflow={info:binomialTailInfo({n:1000,p:.25,h:1000}),rawTailRejected,pmf:pmfInfo({n:1000,p:.25})};
const boundary=[{n:0,p:.25,h:0},{n:0,p:.25,h:1},{n:8,p:0,h:1},{n:8,p:1,h:8},{n:8,p:.25,h:-2},{n:8,p:.25,h:9}].map(input=>({input,actual:binomialTailInfo(input)}));
console.log(JSON.stringify({tails,thresholds,contaminations,leak,leakTails,invalid,underflow,boundary}));

import {readFile} from 'node:fs/promises';
import {evaluateN,sharedDriver} from '../../analysis/round4/model.mjs';
import {evaluate as original} from '../../analysis/round3/model.mjs';
const own=JSON.parse(await readFile(new URL('./fixtures.json',import.meta.url),'utf8'));
const source=JSON.parse(await readFile(new URL('../../analysis/round4/fixtures.json',import.meta.url),'utf8'));
const old=JSON.parse(await readFile(new URL('../round3/fixtures.json',import.meta.url),'utf8'));
const cases=own.cases.map(c=>({id:c.id,origin:'independent',input:{x:c.x,y:c.y,lags:c.lags},actual:evaluateN(c)}));
for(const c of source.fixtures)for(const [suffix,lags] of [['seven',source.lags],['all',Array.from({length:256},(_,i)=>i)]]){
 const input={x:c.x,y:c.y,lags};cases.push({id:c.id+'_'+suffix,origin:'producer',input,actual:evaluateN(input)});
}
const matrices=own.matrices.map(c=>({id:c.id,actual:sharedDriver({z:c.expected.z,u:c.expected.u})}));
const parity=old.cases.map(c=>{const a=original(c),b=evaluateN(c);return {id:c.id,offsetsEqual:JSON.stringify(a.offsets)===JSON.stringify(b.offsets),rejectionsEqual:JSON.stringify(a.rejections)===JSON.stringify(b.rejections),count:a.offsets.length};});
const invalid=[];
for(const [id,input] of [['unequal',{z:[0,1],u:[0]}],['fractional',{z:[0,.5],u:[0,1]}],['nonfinite',{z:[0,Infinity],u:[0,1]}],['excessive',{z:[0,1000001],u:[0,1]}],['too_short',{z:[0],u:[0]}]]){
 try{sharedDriver(input);invalid.push({id,rejected:false});}catch(error){invalid.push({id,rejected:error instanceof RangeError});}
}
console.log(JSON.stringify({cases,matrices,parity,invalid}));

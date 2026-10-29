import {readFile} from 'node:fs/promises';
import {evaluate} from '../../analysis/round3/model.mjs';
const own=JSON.parse(await readFile(new URL('./fixtures.json',import.meta.url),'utf8'));
const source=JSON.parse(await readFile(new URL('../../analysis/round3/fixtures.json',import.meta.url),'utf8'));
const cases=own.cases.map(c=>({id:c.id,origin:'independent',input:{x:c.x,y:c.y,lags:c.lags},actual:evaluate(c)}));
for(const c of source.fixtures)for(const [suffix,lags] of [['seven',source.lags],['all',Array.from({length:32},(_,i)=>i)]]){
 const input={x:c.x,y:c.y,lags};cases.push({id:c.id+'_'+suffix,origin:'producer',input,actual:evaluate(input)});
}
const invalid=own.invalid_cases.map(c=>{
 const input=structuredClone(own.base);
 if(c.patch)Object.assign(input,c.patch);
 if(c.special){input[c.special.target][c.special.index]=({NaN:NaN,Infinity:Infinity,'-Infinity':-Infinity})[c.special.value]}
 try{evaluate(input);return {id:c.id,rejected:false};}
 catch(error){return {id:c.id,rejected:error instanceof RangeError,errorType:error.constructor.name};}
});
console.log(JSON.stringify({cases,invalid}));

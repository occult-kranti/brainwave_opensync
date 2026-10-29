import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {assessPacket,unsaltedDictionaryDemo} from '../../analysis/round6/model.mjs';
const f=JSON.parse(await readFile(new URL('./fixtures.json',import.meta.url),'utf8'));
const cases=f.cases.map(c=>{
 const packet=structuredClone(c.packet);
 if(c.special){let p=packet;for(const k of c.special.path.slice(0,-1))p=p[k];p[c.special.path.at(-1)]=({NaN:NaN,Infinity:Infinity,'-Infinity':-Infinity})[c.special.value];}
 try{return {id:c.id,actual:assessPacket(packet)};}catch(error){return {id:c.id,error:error.message};}
});
const own=JSON.parse(await readFile(new URL('./hash-dictionary-oracle.json',import.meta.url),'utf8'));
const ownDictionary=Object.fromEntries(own.targets.map(t=>[t,createHash('sha256').update(t,'utf8').digest('hex')]));
console.log(JSON.stringify({cases,dictionary:unsaltedDictionaryDemo(),ownDictionary}));

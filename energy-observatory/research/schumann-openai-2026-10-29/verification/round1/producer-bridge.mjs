import * as model from '../../analysis/round1/model.mjs';
import {readFileSync} from 'node:fs';
const requests=JSON.parse(readFileSync(0,'utf8'));
const results=requests.map(({name,args})=>{
  try { return {ok:true,value:model[name](args)}; }
  catch(error) { return {ok:false,error:error.message}; }
});
process.stdout.write(JSON.stringify(results));

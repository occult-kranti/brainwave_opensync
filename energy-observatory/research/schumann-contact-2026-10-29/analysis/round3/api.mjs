import readline from 'node:readline';
import {evaluate} from './model.mjs';
for await(const line of readline.createInterface({input:process.stdin,crlfDelay:Infinity})) {
  if(!line.trim())continue;
  try {console.log(JSON.stringify({ok:true,result:evaluate(JSON.parse(line))}));}
  catch(error){console.log(JSON.stringify({ok:false,error:error.message}));}
}

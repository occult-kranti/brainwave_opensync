import readline from 'node:readline';
import {evaluateN,sharedDriver} from './model.mjs';
for await(const line of readline.createInterface({input:process.stdin,crlfDelay:Infinity})){
 if(!line.trim())continue;
 try{const request=JSON.parse(line);const result=request.kind==='rank'?sharedDriver(request):evaluateN(request);console.log(JSON.stringify({ok:true,result}));}
 catch(error){console.log(JSON.stringify({ok:false,error:error.message}));}
}

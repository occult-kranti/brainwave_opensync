import readline from 'node:readline';
import {binomialPmf,binomialTail,rejectionThreshold,leakDistribution,contamination,score} from './model.mjs';
const actions={pmf:binomialPmf,tail:binomialTail,threshold:rejectionThreshold,leak:leakDistribution,contamination,score};
for await(const line of readline.createInterface({input:process.stdin,crlfDelay:Infinity})){
 if(!line.trim())continue;
 try{const request=JSON.parse(line),action=actions[request.kind??'score'];if(!action)throw new RangeError('unknown kind');console.log(JSON.stringify({ok:true,result:action(request)}));}
 catch(error){console.log(JSON.stringify({ok:false,error:error.message}));}
}

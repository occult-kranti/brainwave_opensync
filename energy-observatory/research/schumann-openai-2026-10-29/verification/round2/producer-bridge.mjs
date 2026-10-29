import * as model from '../../analysis/round2/model.mjs';
import {readFileSync} from 'node:fs';
const requests=JSON.parse(readFileSync(0,'utf8'));
function invoke({name,args}) {
  if(name==='gridMaxima') {
    const rows=[];
    for(const tilt of [-3,0,3]) {
      const scenarios=[{kind:'source',constant:1},{kind:'source',constant:17},{kind:'receiver',constant:1}];
      for(const scenario of scenarios) {
        let best=null;
        for(let i=0;i<=19000;i++) {
          const frequencyHz=1+i*.001;
          const color=model.positiveSpectralWeight({frequencyHz,referenceHz:8,scaleHz:8,tilt});
          const psd=model.mechanicalPsd({...args,frequencyHz,
            forcePsdN2PerHz:.02*(scenario.kind==='source'?color:1)*scenario.constant,
            receiverGainSquared:scenario.kind==='receiver'?color:1}).outputPsdM2PerHz;
          if(best===null||psd>best.psd)best={frequencyHz,psd,index:i};
        }
        rows.push({tilt,...scenario,...best,endpoint:best.index===0||best.index===19000});
      }
    }
    return rows;
  }
  return model[name](args);
}
process.stdout.write(JSON.stringify(requests.map(request=>{
  try {return {ok:true,value:invoke(request)};}catch(error){return {ok:false,error:error.message};}
})));

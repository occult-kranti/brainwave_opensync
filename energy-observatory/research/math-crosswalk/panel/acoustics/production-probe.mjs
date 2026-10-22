// Read-only bridge to the existing sphere and finite fixture implementation.
// All fixtures and output files live beside this script; production code is unchanged.
import fs from 'node:fs';
import {solidBreathing, coupledSystem, responseAt} from '../../../../../location-spectrum/src/models.mjs';

const requests=JSON.parse(fs.readFileSync(0,'utf8'));
const results=requests.map(request=>{
  if(request.kind==='sphere') return solidBreathing(request.params);
  if(request.kind==='coupled') {
    const system=coupledSystem(request.params);
    return {system, responses:request.frequenciesHz.map(f=>responseAt(system,f))};
  }
  throw new Error(`Unrecognized request ${request.kind}`);
});
process.stdout.write(JSON.stringify(results));

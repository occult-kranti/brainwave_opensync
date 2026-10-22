import fs from 'node:fs';
import { dephasingWorkBound, maxCoherenceMagnitude } from '../../../../src/dephasing-bound.mjs';
const request = JSON.parse(fs.readFileSync(0, 'utf8'));
function run(value) {
  try { return {accepted:true,result:dephasingWorkBound(value)}; }
  catch (e) { return {accepted:false,name:e.name,message:e.message}; }
}
const base={population:.25,coherenceMagnitude:.2,dephasing:.5,gapJ:1};
const invalid = [null, [], {}, {...base,population:NaN}, {...base,population:Infinity},
  {...base,population:-Number.MIN_VALUE}, {...base,population:1+Number.EPSILON},
  {...base,coherenceMagnitude:-Number.MIN_VALUE}, {...base,coherenceMagnitude:.5},
  {...base,dephasing:-Number.MIN_VALUE}, {...base,dephasing:1+Number.EPSILON},
  {...base,gapJ:0}, {...base,gapJ:-1}, {...base,gapJ:Infinity}, {...base,gapJ:'1'},
  {...base,population:0,coherenceMagnitude:Number.MIN_VALUE},
  {...base,population:1,coherenceMagnitude:Number.MIN_VALUE}];
process.stdout.write(JSON.stringify({
  outputs:request.inputs.map(run),
  helpers:request.populations.map(p=>({population:p,boundary:maxCoherenceMagnitude(p)})),
  invalid:invalid.map(run)
}));

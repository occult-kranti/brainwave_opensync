import test from 'node:test';
import assert from 'node:assert/strict';
import { searchAbsorberDesign } from '../src/search.mjs';
test('design search keeps validation frequencies withheld and preserves the fixed mass budget',()=>{
  const result = searchAbsorberDesign();
  assert.equal(result.candidatesEvaluated,81);
  assert.ok(result.validationFrequencyHz.every(f=>!result.trainingFrequencyHz.includes(f)));
  assert.equal(result.best.parameters.massRatio,result.baseline.parameters.massRatio);
  assert.ok(result.best.trainingWorstMm<result.baseline.trainingWorstMm);
  assert.ok(result.best.validationWorstMm<result.baseline.validationWorstMm);
  assert.ok(result.best.powerResidualMaxW<1e-10);
  assert.deepEqual(result,searchAbsorberDesign());
});
test('linearity changes displacement but leaves the chosen tuning invariant',()=>{
  const one = searchAbsorberDesign({forceNrms:1});
  const two = searchAbsorberDesign({forceNrms:2});
  assert.equal(one.best.parameters.tuningRatio,two.best.parameters.tuningRatio);
  assert.equal(one.best.parameters.dampingRatioAbsorber,two.best.parameters.dampingRatioAbsorber);
  assert.ok(Math.abs(two.best.validationWorstMm-2*one.best.validationWorstMm)<1e-12);
  assert.throws(()=>searchAbsorberDesign({forceNrms:0}),/nonzero force/);
});

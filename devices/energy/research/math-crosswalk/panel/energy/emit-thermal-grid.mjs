import fs from 'node:fs';
import assert from 'node:assert/strict';
import {thermalQubitWork} from './thermal-channel.mjs';
import {qubitWork} from '../../../../src/quantum.mjs';
const inputs = JSON.parse(fs.readFileSync(new URL('./round2-inputs.json', import.meta.url), 'utf8'));
const a = inputs.axes;
const cases = [];
const normalized = (s, gap) => [s.population, s.energyJ/gap, s.passiveEnergyJ/gap,
  s.ergotropyJ/gap, s.entropyNats, s.densityMatrix.real[0][1], s.densityMatrix.imag[0][1]];
for (const population of a.population) for (const coherence of a.coherence)
for (const damping of a.damping) for (const bathPopulation of a.bathPopulation)
for (const dephasing of a.dephasing) for (const phaseRadians of a.phaseRadians) {
  const parameters = {frequencyHz: inputs.frequencyHz, population, coherence, damping,
    bathPopulation, dephasing, phaseRadians};
  const r = thermalQubitWork(parameters);
  let legacy = null;
  if (bathPopulation === 0) {
    const old = qubitWork(parameters);
    legacy = [old.initial.energyJ/r.gapJ, old.initial.passiveEnergyJ/r.gapJ,
      old.initial.ergotropyJ/r.gapJ, old.final.energyJ/r.gapJ, old.final.passiveEnergyJ/r.gapJ,
      old.final.ergotropyJ/r.gapJ, old.environmentalEnergyJ/r.gapJ];
  }
  cases.push({parameters, initial: normalized(r.initial,r.gapJ), final: normalized(r.final,r.gapJ),
    heatIntoQubit: r.heatIntoQubitJ/r.gapJ, heatIntoBath: r.heatIntoBathJ/r.gapJ,
    closure: r.energyClosureResidualJ/r.gapJ, betaGap: r.betaGap,
    entropyProduction: r.entropyProductionNats, bathResource:r.bathResource, legacy});
}
assert.equal(cases.length, inputs.expectedCases);
const invalid = [{population:-0.01},{population:1.01},{coherence:NaN},{damping:Infinity},
  {dephasing:-1},{bathPopulation:1.01},{phaseRadians:NaN},{frequencyHz:0},
  {frequencyHz:Infinity},{frequencyHz:Number.MIN_VALUE}];
for (const value of invalid) assert.throws(()=>thermalQubitWork(value), RangeError);
const controls = inputs.wrongModels.map(c => ({id:c.id, expected:c.expectedGapNormalizedError,
  result:thermalQubitWork({...c,frequencyHz:inputs.frequencyHz})}));
process.stdout.write(JSON.stringify({cases, controls, invalidInputsRejected:invalid.length}));

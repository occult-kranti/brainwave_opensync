import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_DEFAULTS, deviceModels, solveRlcAtFrequency, simulateRlc, buildAcousticArray,
  evaluateAcousticField, simulateAcousticArray, resolveAbsorberParameters, solveAbsorberAtFrequency, simulateAbsorber } from '../src/models.mjs';
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} ≠ ${expected}`);

test('RLC independently solvable resonance fixture and real-power balance', () => {
  const p = { primaryInductanceH: 0.01, secondaryInductanceH: 0.01, primaryCapacitanceF: 0.0001,
    secondaryCapacitanceF: 0.0001, primaryResistanceOhm: 1, secondaryResistanceOhm: 1,
    loadResistanceOhm: 1, coupling: 0.1, sourceVoltageVrms: 1 };
  const r = solveRlcAtFrequency(p, 1000 / (2 * Math.PI));
  near(r.primaryCurrentA.re, 2 / 3); near(r.primaryCurrentA.im, 0);
  near(r.secondaryCurrentA.re, 0); near(r.secondaryCurrentA.im, -1 / 3);
  near(r.inputPowerW, 2 / 3); near(r.loadPowerW, 1 / 9); near(r.efficiency, 1 / 6);
  near(r.powerResidualW, 0);
});
test('RLC efficiency matches the independently published SS closed form off resonance', () => {
  for (const frequencyHz of [23000, 67000, 100000, 151000]) for (const coupling of [0, 0.03, 0.2, 0.6]) {
    const p = { ...MODEL_DEFAULTS.rlc, coupling };
    const w = 2 * Math.PI * frequencyHz, m = coupling * Math.sqrt(p.primaryInductanceH * p.secondaryInductanceH);
    const rs = p.secondaryResistanceOhm + p.loadResistanceOhm;
    const x2 = w * p.secondaryInductanceH - 1 / (w * p.secondaryCapacitanceF);
    const eta = p.loadResistanceOhm * m * m * w * w / (p.primaryResistanceOhm * (rs * rs + x2 * x2) + rs * m * m * w * w);
    const r = solveRlcAtFrequency(p, frequencyHz);
    near(r.efficiency, eta); near(r.powerResidualW, 0);
    assert.ok(r.efficiency >= 0 && r.efficiency < 1);
  }
});
test('RLC zero coupling removes transfer, zero source removes power, voltage doubles => power quadruples', () => {
  near(simulateRlc({ coupling: 0 }).operatingPoint.loadPowerW, 0);
  near(simulateRlc({ sourceVoltageVrms: 0 }).operatingPoint.inputPowerW, 0);
  const base = simulateRlc().operatingPoint, doubled = simulateRlc({ sourceVoltageVrms: 2 }).operatingPoint;
  near(doubled.loadPowerW, 4 * base.loadPowerW); near(doubled.efficiency, base.efficiency);
});
test('Acoustic perfect conjugation has target pressure-squared ratio 1 at multiple steered targets', () => {
  for (const targetXM of [-0.02, 0, 0.02]) for (const targetZM of [0.03, 0.08, 0.15]) {
    const a = buildAcousticArray({ targetXM, targetZM });
    near(evaluateAcousticField(a, targetXM, 0, targetZM).relativeIntensity, 1);
  }
});
test('Acoustic global phase is unobservable in pressure squared and target errors cannot improve ideal coherence', () => {
  const a = buildAcousticArray();
  const shifted = { ...a, sources: a.sources.map(s => ({ ...s, phaseRad: s.phaseRad + 1.123 })) };
  for (const [x, y, z] of [[0, 0, 0.08], [0.012, -0.004, 0.12], [-0.03, 0.001, 0.04]]) {
    near(evaluateAcousticField(a, x, y, z).relativeIntensity, evaluateAcousticField(shifted, x, y, z).relativeIntensity);
  }
  for (const phaseBits of [0, 1, 2, 8]) for (const seed of [0, 1, 42, 500]) {
    const noisy = buildAcousticArray({ phaseBits, phaseErrorRad: 1.5, seed });
    assert.ok(evaluateAcousticField(noisy, 0, 0, 0.08).relativeIntensity <= 1 + 1e-12);
    near(noisy.referenceAmplitudePerM, a.referenceAmplitudePerM);
  }
});
test('Single acoustic monopole obeys inverse-square pressure ratio and seed is reproducible', () => {
  const a = buildAcousticArray({ elementsPerSide: 1, targetZM: 0.08 });
  near(evaluateAcousticField(a, 0, 0, 0.16).relativeIntensity, 0.25);
  const options = { phaseErrorRad: 2, seed: 81, width: 3, height: 3 };
  assert.deepEqual(simulateAcousticArray(options), simulateAcousticArray(options));
  const b = buildAcousticArray({ ...options, seed: 82 });
  assert.notDeepEqual(buildAcousticArray(options).sources, b.sources);
});
const absorberFixture = { massPrimaryKg: 1, massSecondaryKg: 0.1, stiffnessPrimaryNpm: 100,
  stiffnessSecondaryNpm: 10, dampingPrimaryNsPm: 2, dampingSecondaryNsPm: 0.2, forceNrms: 1 };
test('Two-mass independently solved complex displacement and RMS dissipation fixture', () => {
  const r = solveAbsorberAtFrequency(absorberFixture, 10 / (2 * Math.PI));
  near(r.primaryDisplacementM.re, -0.002); near(r.primaryDisplacementM.im, -0.014);
  near(r.secondaryDisplacementM.re, -0.072); near(r.secondaryDisplacementM.im, -0.004);
  near(r.inputPowerW, 0.14); near(r.primaryDampingPowerW, 0.04); near(r.absorberDampingPowerW, 0.1);
});
test('Absorber low-frequency static limit and high-frequency inertial limit', () => {
  const low = solveAbsorberAtFrequency(absorberFixture, 0.000001);
  near(low.primaryDisplacementM.re, 0.01); near(low.secondaryDisplacementM.re, 0.01);
  const highFrequencyHz = 1e6, high = solveAbsorberAtFrequency(absorberFixture, highFrequencyHz);
  const scaled = high.primaryDisplacementM.re * (2 * Math.PI * highFrequencyHz) ** 2;
  near(scaled, -1, 1e-8);
});
test('Undamped attachment has exact antiresonance and a finite compensating stroke', () => {
  const r = solveAbsorberAtFrequency({ ...absorberFixture, dampingSecondaryNsPm: 0 }, 10 / (2 * Math.PI));
  near(r.primaryDisplacementRmsM, 0); near(r.secondaryDisplacementM.re, -0.1);
  near(r.inputPowerW, 0);
});
test('Absorber conservation over tuning/damping/frequency sweep; large improvement is frequency-local', () => {
  for (const tuningRatio of [0.5, 0.8, 1, 1.5]) for (const dampingRatioAbsorber of [0, 0.12, 0.5]) {
    const p = resolveAbsorberParameters({ tuningRatio, dampingRatioAbsorber });
    for (const frequencyHz of [1, 8, 13, 16, 19, 30, 40]) {
      const r = solveAbsorberAtFrequency(p, frequencyHz);
      near(r.powerResidualW, 0); assert.ok(r.inputPowerW >= -1e-12);
    }
  }
  const result = simulateAbsorber();
  assert.ok(result.operatingPoint.responseRatio < 0.2);
  assert.ok(result.response.some(r => r.responseRatio > 1.2), 'must disclose off-target amplification');
});
test('All nine presets return finite charts/metrics; models reject invalid input', () => {
  for (const model of Object.values(deviceModels)) for (const preset of model.presets) {
    const result = model.simulate(preset.values);
    assert.ok(result.metrics.every(m => Number.isFinite(m.value)));
    assert.ok(result.series.every(s => s.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))));
    if (result.map) assert.equal(result.map.values.length, result.map.width * result.map.height);
  }
  for (const bad of [NaN, Infinity, -1]) assert.throws(() => simulateRlc({ frequencyHz: bad }), RangeError);
  assert.throws(() => simulateRlc({ coupling: 1.1 }), RangeError);
  assert.throws(() => simulateAbsorber({ dampingRatioPrimary: 0 }), RangeError);
  assert.throws(() => solveAbsorberAtFrequency({ ...absorberFixture, dampingPrimaryNsPm: 0 }, 1), RangeError);
  assert.throws(() => buildAcousticArray({ elementsPerSide: 3.5 }), RangeError);
  assert.throws(() => simulateAcousticArray({ phaseBits: -1 }), RangeError);
  assert.throws(() => simulateRlc({ frequncyHz: 100 }), /Unknown parameter/);
});

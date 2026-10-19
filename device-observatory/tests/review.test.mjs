import test from 'node:test';
import assert from 'node:assert/strict';
import {
  solveRlcAtFrequency, solveAbsorberAtFrequency, resolveAbsorberParameters,
  buildAcousticArray, evaluateAcousticField,
} from '../src/models.mjs';

// These exact fixtures were derived before inspecting models.mjs. They use
// impedance reduction or force-balance substitution, not a second copy of its
// complex matrix inversion. See research/independent-review.md.
const close = (actual, expected, tolerance = 1e-11) => {
  assert.ok(Number.isFinite(actual), `Non-finite result: ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} differs from independent expected value ${expected}`);
};
const circuit = {
  primaryInductanceH: 0.01, secondaryInductanceH: 0.01,
  primaryCapacitanceF: 0.0001, secondaryCapacitanceF: 0.0001,
  primaryResistanceOhm: 1, secondaryResistanceOhm: 1,
  loadResistanceOhm: 1, coupling: 0.1, sourceVoltageVrms: 1,
};
const mechanical = {
  massPrimaryKg: 1, massSecondaryKg: 0.1,
  stiffnessPrimaryNpm: 100, stiffnessSecondaryNpm: 10,
  dampingPrimaryNsPm: 2, dampingSecondaryNsPm: 0.2, forceNrms: 1,
};

test('independent resonant loop fixture accounts for both losses and load', () => {
  const r = solveRlcAtFrequency(circuit, 1000 / (2 * Math.PI));
  close(r.primaryCurrentA.re, 2 / 3);
  close(r.primaryCurrentA.im, 0);
  close(r.secondaryCurrentA.re, 0);
  close(r.secondaryCurrentA.im, -1 / 3);
  close(r.inputPowerW, 2 / 3);
  close(r.loadPowerW, 1 / 9);
  close(r.primaryLossW, 4 / 9);
  close(r.secondaryLossW, 1 / 9);
  close(r.efficiency, 1 / 6);
});

test('a disconnected secondary receives no power and source scaling is quadratic', () => {
  const uncoupled = solveRlcAtFrequency({ ...circuit, coupling: 0 }, 1000 / (2 * Math.PI));
  close(uncoupled.primaryCurrentArms, 1);
  close(uncoupled.secondaryCurrentArms, 0);
  close(uncoupled.loadPowerW, 0);
  const doubled = solveRlcAtFrequency({ ...circuit, sourceVoltageVrms: 2 }, 1000 / (2 * Math.PI));
  close(doubled.loadPowerW, 4 / 9);
  close(doubled.inputPowerW, 8 / 3);
  close(doubled.efficiency, 1 / 6);
});

test('independent damped absorber fixture preserves RMS mechanical power', () => {
  const r = solveAbsorberAtFrequency(mechanical, 10 / (2 * Math.PI));
  close(r.primaryDisplacementM.re, -0.002);
  close(r.primaryDisplacementM.im, -0.014);
  close(r.secondaryDisplacementM.re, -0.072);
  close(r.secondaryDisplacementM.im, -0.004);
  close(r.baselineDisplacementRmsM, 0.05);
  close(r.inputPowerW, 0.14);
  close(r.primaryDampingPowerW, 0.04);
  close(r.absorberDampingPowerW, 0.1);
});

test('an undamped tuned attachment has a primary notch but nonzero internal travel', () => {
  const r = solveAbsorberAtFrequency({ ...mechanical, dampingSecondaryNsPm: 0 }, 10 / (2 * Math.PI));
  close(r.primaryDisplacementRmsM, 0);
  close(r.secondaryDisplacementM.re, -0.1);
  close(r.secondaryDisplacementM.im, 0);
  close(r.inputPowerW, 0);
});

test('vanishing attached mass approaches the bare system, not a finite miracle notch', () => {
  const p = resolveAbsorberParameters({
    primaryFrequencyHz: 10 / (2 * Math.PI), massPrimaryKg: 1,
    dampingRatioPrimary: 0.1, massRatio: 0.000001,
    tuningRatio: 1, dampingRatioAbsorber: 0.1, forceNrms: 1,
  });
  const r = solveAbsorberAtFrequency(p, 10 / (2 * Math.PI));
  assert.ok(Math.abs(r.primaryDisplacementRmsM - 0.05) < 2e-6);
  close(r.baselineDisplacementRmsM, 0.05);
});

test('array equal-path fixture has fixed normalization and destructive phase control', () => {
  const array = buildAcousticArray({ elementsPerSide: 2, pitchM: 0.01, targetXM: 0, targetZM: 0.1 });
  const r = Math.sqrt(0.1 ** 2 + 2 * 0.005 ** 2);
  close(array.referenceAmplitudePerM, 4 / r);
  close(evaluateAcousticField(array, 0, 0, 0.1).relativeIntensity, 1);
  const cancelled = {
    ...array,
    sources: array.sources.map(source => ({ ...source, phaseRad: source.phaseRad + (source.xM > 0 ? Math.PI : 0) })),
  };
  close(cancelled.referenceAmplitudePerM, array.referenceAmplitudePerM);
  assert.ok(evaluateAcousticField(cancelled, 0, 0, 0.1).relativeIntensity < 1e-24);
});

test('global phase and mirror symmetry preserve the acoustic observable', () => {
  const array = buildAcousticArray({ targetXM: 0, phaseErrorRad: 0, phaseBits: 0 });
  const shifted = { ...array, sources: array.sources.map(source => ({ ...source, phaseRad: source.phaseRad + 1.2345 })) };
  const p = evaluateAcousticField(array, 0.015, 0, 0.08).relativeIntensity;
  close(evaluateAcousticField(shifted, 0.015, 0, 0.08).relativeIntensity, p);
  close(evaluateAcousticField(array, -0.015, 0, 0.08).relativeIntensity, p);
});

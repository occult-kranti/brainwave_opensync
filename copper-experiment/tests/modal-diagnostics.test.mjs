import test from 'node:test';
import assert from 'node:assert/strict';
import { solidRadialModes, groundedPointSpringDiagnostics, MODAL_DIAGNOSTIC_DOMAIN } from '../src/modal-diagnostics.mjs';

const TAU = 2 * Math.PI;
const copper = { radiusM: .0125, youngPa: 123.5e9, poisson: .35, densityKgM3: 8960 };
const close = (actual, expected, rtol = 2e-12, atol = 0) => assert.ok(
  Math.abs(actual - expected) <= atol + rtol * Math.max(Math.abs(actual), Math.abs(expected)),
  `${actual} differs from ${expected}`,
);
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const multiply = (matrix, vector) => matrix.map(row => dot(row, vector));
const quadratic = (matrix, vector) => dot(vector, multiply(matrix, vector));
const determinant3 = a => a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1])
  - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0])
  + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);

test('three radial frequencies and surface modal masses match independent direct-traction/quadrature fixtures', () => {
  // R1 SciPy direct j1 derivative stress roots and numerical volume quadrature,
  // not fixture values calculated by the JavaScript producer.
  const expectedF = [166551.05048081325, 367096.79372723564, 558432.0580158163];
  const expectedM = [.0827024496598783, .10434587595866936, .10753151714026402];
  const result = solidRadialModes(copper);
  result.frequencyHz.forEach((f, i) => close(f, expectedF[i]));
  result.modalMassKg.forEach((m, i) => close(m, expectedM[i]));
  close(result.massKg, .07330382858376185);
  assert.ok(result.modalMassKg.every(m => m > result.massKg));
  assert.equal(result.frequencyHz.length, 3);
  assert.match(result.status, /synthetic/);
  assert.ok(result.limits.some(text => /do not identify position/.test(text)));
});

test('ratios cancel common E/rho/R scaling but not a change of Poisson ratio', () => {
  const free = solidRadialModes(copper);
  for (const parameters of [
    { ...copper, radiusM: .025 },
    { ...copper, youngPa: 494e9 },
    { ...copper, youngPa: 247e9, densityKgM3: 17920 },
  ]) {
    const scaled = solidRadialModes(parameters);
    scaled.ratiosToFirst.forEach((r, i) => close(r, free.ratiosToFirst[i], 5e-15));
  }
  const doubleRadius = solidRadialModes({ ...copper, radiusM: .025 });
  doubleRadius.frequencyHz.forEach((f, i) => close(2 * f, free.frequencyHz[i]));
  const newPoisson = solidRadialModes({ ...copper, poisson: .30 });
  assert.ok(Math.abs(newPoisson.ratiosToFirst[1] - free.ratiosToFirst[1]) > .01);
});

test('ONE point spring retains every cross term and has the correct rank-one energy kernel', () => {
  const k = 1e8;
  const result = groundedPointSpringDiagnostics({ ...copper, contactNpm: k });
  result.contactStiffnessNpm.forEach(row => row.forEach(value => assert.equal(value, k)));
  for (const q of [[1, -1, 0], [1, 0, -1], [2, 3, -4]]) {
    close(quadratic(result.contactStiffnessNpm, q), k * q.reduce((a, b) => a + b, 0) ** 2, 1e-14, 1e-8);
    assert.ok(quadratic(result.stiffnessNpm, q) > 0);
  }
  const wrongIndependentSprings = [[k, 0, 0], [0, k, 0], [0, 0, k]];
  assert.equal(quadratic(result.contactStiffnessNpm, [1, -1, 0]), 0);
  assert.equal(quadratic(wrongIndependentSprings, [1, -1, 0]), 2 * k);
  assert.equal(result.passivity.positiveMass, true);
  assert.equal(result.passivity.nonnegativeContact, true);
  assert.equal(result.passivity.positiveEigenvalues, true);
});

test('projected generalized eigenvalues match independent SciPy eigh at weak and stronger contact', () => {
  const cases = [
    [1e8, [166642.94512343212, 367129.86122375785, 558453.1541220413]],
    [1e10, [175236.8161538799, 370436.59177728783, 560589.3617399266]],
  ];
  for (const [contactNpm, expected] of cases) {
    const result = groundedPointSpringDiagnostics({ ...copper, contactNpm });
    result.coupledFrequencyHz.forEach((f, i) => close(f, expected[i]));
    assert.equal(result.eigensolver.converged, true);
    assert.ok(result.eigensolver.iterations <= MODAL_DIAGNOSTIC_DOMAIN.maxJacobiRotations);
    assert.ok(result.eigensolver.maxRelativeResidual < 2e-12);
    assert.ok(result.eigensolver.maxGeneralizedRelativeResidual < 2e-12);
    assert.ok(result.eigensolver.orthogonalityError < 2e-12);
  }
});

test('mass-coordinate eigenvectors, trace/determinant update and rank-one interlacing hold', () => {
  const k = 1e10;
  const result = groundedPointSpringDiagnostics({ ...copper, contactNpm: k });
  const m = result.free.modalMassKg;
  const d = result.free.frequencyHz.map(f => (TAU * f) ** 2);
  const eigen = result.eigenvaluePerS2;
  // Matrix determinant lemma and trace are independent rank-one identities.
  close(eigen.reduce((a, b) => a + b), d.reduce((a, b) => a + b) + k * m.reduce((sum, value) => sum + 1 / value, 0));
  close(eigen.reduce((a, b) => a * b), d.reduce((a, b) => a * b) * (1 + k * m.reduce((sum, mass, i) => sum + 1 / (mass * d[i]), 0)));
  close(determinant3(result.massNormalizedStiffnessPerS2), eigen.reduce((a, b) => a * b));
  assert.ok(d[0] <= eigen[0] && eigen[0] <= d[1]);
  assert.ok(d[1] <= eigen[1] && eigen[1] <= d[2]);
  assert.ok(d[2] <= eigen[2]);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const u = result.physicalCoordinateEigenvectors[i];
    const v = result.physicalCoordinateEigenvectors[j];
    close(dot(u, v.map((value, n) => m[n] * value)), +(i === j), 2e-12, 2e-14);
  }
});

test('zero contact is a spectral null; physical contact and legacy independent-spring toy remain distinct', () => {
  const zero = groundedPointSpringDiagnostics({ ...copper, contactNpm: 0 });
  zero.frequencyShiftHz.forEach(shift => assert.ok(Math.abs(shift) < 1e-9));
  zero.ratioChange.forEach(shift => assert.ok(Math.abs(shift) < 1e-14));
  const loaded = groundedPointSpringDiagnostics({ ...copper, contactNpm: 1e8 });
  close(loaded.frequencyShiftHz[0], 91.89464261889225, 1e-10);
  close(loaded.legacyIndependentSpring.frequencyShiftHz[0], 103.70532209370867, 1e-10);
  assert.match(loaded.legacyIndependentSpring.label, /Legacy illustrative toy/);
  assert.ok(loaded.frequencyShiftHz.every(shift => shift > 0));
  assert.ok(loaded.ratioChange[1] < 0 && loaded.ratioChange[2] < 0);
});

test('finite domain edges and maximum allowed relative contact stay numerically resolved', () => {
  for (const parameters of [
    { radiusM: 1e-5, youngPa: 1e6, poisson: -.9, densityKgM3: 1 },
    { radiusM: 1, youngPa: 1e12, poisson: .49, densityKgM3: 30000 },
    { ...copper, poisson: -.9 },
    { ...copper, poisson: .49 },
  ]) {
    const free = solidRadialModes(parameters);
    const k1 = free.modalMassKg[0] * (TAU * free.frequencyHz[0]) ** 2;
    const contactNpm = Math.min(1e12, 99 * k1);
    const loaded = groundedPointSpringDiagnostics({ ...parameters, contactNpm });
    assert.ok(loaded.coupledFrequencyHz.every(Number.isFinite));
    assert.ok(loaded.eigensolver.maxRelativeResidual < 2e-12);
    assert.ok(loaded.eigensolver.iterations <= 64);
  }
});

test('invalid, nonfinite, wrong-unit-key and unresolved-extreme inputs are rejected before unbounded work', () => {
  for (const params of [null, [], { radiusM: 0 }, { radiusMm: 12.5 }, { youngPa: Infinity },
    { youngPa: '123500000000' }, { poisson: -.91 }, { poisson: .5 }, { densityKgM3: NaN }, { modeCount: 100000 }]) {
    assert.throws(() => solidRadialModes(params));
  }
  for (const contactNpm of [-1, Infinity, NaN, 1e13, '100']) {
    assert.throws(() => groundedPointSpringDiagnostics({ ...copper, contactNpm }));
  }
  assert.throws(() => groundedPointSpringDiagnostics({ radiusM: 1e-5, youngPa: 1e6, contactNpm: 1e12 }), /m1/);
});

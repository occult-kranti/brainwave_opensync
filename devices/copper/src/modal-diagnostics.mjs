/** Three radial coordinates, not a complete elastic sphere or a calibrated contact.
 * Coordinates q_n are radial surface displacements in metres. The contact is ONE
 * grounded linear point spring: V_c = k (q_1 + q_2 + q_3)^2 / 2.
 * See research/modal-diagnostics.md for the projection, units and inference limits.
 */
import { COPPER_REFERENCE, solidBreathing } from './models.mjs';

const TAU = 2 * Math.PI;
const SIZE = 3;
const MAX_ROTATIONS = 64;
const JACOBI_TOLERANCE = 16 * Number.EPSILON;
const RESIDUAL_TOLERANCE = 2e-12;
const MATERIAL_KEYS = ['radiusM', 'youngPa', 'poisson', 'densityKgM3'];
const DEFAULTS = Object.freeze({
  radiusM: .04445,
  youngPa: COPPER_REFERENCE.youngPa,
  poisson: COPPER_REFERENCE.poisson,
  densityKgM3: COPPER_REFERENCE.densityKgM3,
});
export const MODAL_DIAGNOSTIC_DOMAIN = Object.freeze({
  radiusM: Object.freeze([1e-5, 1]),
  youngPa: Object.freeze([1e6, 1e12]),
  poisson: Object.freeze([-.9, .49]),
  densityKgM3: Object.freeze([1, 30000]),
  contactNpm: Object.freeze([0, 1e12]),
  maxContactToFirstModalStiffness: 100,
  modes: SIZE,
  maxJacobiRotations: MAX_ROTATIONS,
});

const LIMITS = Object.freeze([
  'Calculated undamped frequencies of three selected solid-sphere radial l=0 coordinates; no physical measurements.',
  'Rigid motion, nonradial elastic modes, anisotropy, air loading, damping, finite contact area and fixture dynamics are omitted.',
  'Contact stiffness is prescribed in N/m. It is not a measured preload in N or a calibrated contact law.',
  'Mode ratios cancel common frequency scaling only at fixed Poisson ratio and correctly matched mode identity. They do not identify position or a unique physical cause.',
  'Sorted coupled frequencies describe this projected system; coupled eigenvectors mix the free radial coordinates.',
]);

function object(value, allowedKeys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('parameters must be an object');
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) throw new RangeError(`Unknown parameter ${key}; use the documented SI keys`);
  }
}

function bounded(name, value) {
  const [low, high] = MODAL_DIAGNOSTIC_DOMAIN[name];
  if (typeof value !== 'number' || !Number.isFinite(value) || value < low || value > high) {
    throw new RangeError(`${name} must be a finite number from ${low} to ${high}`);
  }
  return value;
}

function materialParameters(params) {
  const result = { ...DEFAULTS, ...params };
  for (const key of MATERIAL_KEYS) bounded(key, result[key]);
  return result;
}

const identity = () => Array.from({ length: SIZE }, (_, i) => Array.from({ length: SIZE }, (_, j) => +(i === j)));
const diagonal = values => values.map((value, i) => values.map((_, j) => i === j ? value : 0));
const matrixNorm = matrix => Math.hypot(...matrix.flat());
const vectorNorm = vector => Math.hypot(...vector);
const multiply = (matrix, vector) => matrix.map(row => row.reduce((sum, value, j) => sum + value * vector[j], 0));
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const ratios = values => values.map(value => value / values[0]);

/** Fixed-size, scaled symmetric Jacobi rotations. No unbounded convergence loop. */
function symmetricEigen3(matrix) {
  const scale = Math.max(...matrix.flat().map(Math.abs));
  if (!(scale > 0) || !Number.isFinite(scale)) throw new RangeError('Stiffness matrix scale is not finite and positive');
  const original = matrix.map(row => row.map(value => value / scale));
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (!Number.isFinite(original[i][j]) || original[i][j] !== original[j][i]) throw new RangeError('Expected a finite symmetric stiffness matrix');
    }
  }
  const a = original.map(row => [...row]);
  const vectors = identity();
  let iterations = 0;
  let converged = false;
  for (; iterations <= MAX_ROTATIONS; iterations++) {
    let p = 0, q = 1;
    for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(a[i][j]) > Math.abs(a[p][q])) { p = i; q = j; }
    }
    if (Math.abs(a[p][q]) <= JACOBI_TOLERANCE * Math.max(...a.map((row, i) => Math.abs(row[i])))) {
      converged = true;
      break;
    }
    if (iterations === MAX_ROTATIONS) break;
    const app = a[p][p], aqq = a[q][q], apq = a[p][q];
    const theta = (aqq - app) / (2 * apq);
    const t = (theta < 0 ? -1 : 1) / (Math.abs(theta) + Math.hypot(1, theta));
    const c = 1 / Math.hypot(1, t), s = t * c;
    a[p][p] = app - t * apq;
    a[q][q] = aqq + t * apq;
    a[p][q] = a[q][p] = 0;
    for (let i = 0; i < SIZE; i++) {
      if (i !== p && i !== q) {
        const aip = a[i][p], aiq = a[i][q];
        a[i][p] = a[p][i] = c * aip - s * aiq;
        a[i][q] = a[q][i] = s * aip + c * aiq;
      }
      const vip = vectors[i][p], viq = vectors[i][q];
      vectors[i][p] = c * vip - s * viq;
      vectors[i][q] = s * vip + c * viq;
    }
  }
  if (!converged) throw new Error('Bounded symmetric eigensolver did not converge');
  const order = [0, 1, 2].sort((i, j) => a[i][i] - a[j][j]);
  const scaledValues = order.map(i => a[i][i]);
  const columns = order.map(j => vectors.map(row => row[j]));
  const norm = matrixNorm(original);
  const residuals = columns.map((v, j) => {
    const av = multiply(original, v);
    return vectorNorm(av.map((value, i) => value - scaledValues[j] * v[i])) / (norm + Math.abs(scaledValues[j]));
  });
  let orthogonalityError = 0;
  for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) {
    orthogonalityError = Math.max(orthogonalityError, Math.abs(dot(columns[i], columns[j]) - +(i === j)));
  }
  const values = scaledValues.map(value => value * scale);
  if (!values.every(value => Number.isFinite(value) && value > 0)
      || Math.max(...residuals) > RESIDUAL_TOLERANCE || orthogonalityError > RESIDUAL_TOLERANCE) {
    throw new Error('Numerically unresolved positive eigenproblem; change parameters within the declared domain');
  }
  return {
    values, columns,
    diagnostics: {
      method: 'scaled symmetric 3x3 Jacobi rotations', converged, iterations,
      maxRelativeResidual: Math.max(...residuals), orthogonalityError,
      residualDefinition: '||A v - lambda v||2 / (||A||F + |lambda|), ||v||2=1; A=M^-1/2 K M^-1/2',
    },
  };
}

/** First three positive free radial modes, using the copied solidBreathing API. */
export function solidRadialModes(params = {}) {
  object(params, MATERIAL_KEYS);
  const parameters = materialParameters(params);
  const modes = Array.from({ length: SIZE }, (_, rootIndex) => solidBreathing({ ...parameters, rootIndex }));
  const frequencyHz = modes.map(mode => mode.frequencyHz);
  const modalMassKg = modes.map(mode => mode.modalMassKg);
  if (![...frequencyHz, ...modalMassKg].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error('Free radial mode calculation did not produce finite positive values');
  }
  return {
    schema: 'copper-solid-radial-diagnostics/1', status: 'synthetic projected model; no measurements',
    parameters, frequencyHz, roots: modes.map(mode => mode.root), massKg: modes[0].massKg,
    modalMassKg, ratiosToFirst: ratios(frequencyHz), modes,
    coordinate: 'Each q_n is radial surface displacement in m; modal masses belong to that normalization.',
    scaleInvariance: 'At fixed Poisson ratio, all f_n scale as sqrt(E/rho)/R; f_n/f_1 cancels that common scale.',
    limits: [...LIMITS],
  };
}

/** One grounded point spring projected into three free radial coordinates.
 * Eigenvectors are returned as columns, each represented by one vector array.
 * physicalCoordinateEigenvectors satisfy u_i^T M u_j=delta_ij (not Euclidean
 * unit normalization). No coordinate is assigned whole-sphere mass implicitly.
 */
export function groundedPointSpringDiagnostics(params = {}) {
  object(params, [...MATERIAL_KEYS, 'contactNpm']);
  const { contactNpm = 1e8, ...material } = params;
  bounded('contactNpm', contactNpm);
  const free = solidRadialModes(material);
  const omega = free.frequencyHz.map(f => TAU * f), masses = free.modalMassKg;
  const freeStiffness = omega.map((w, i) => masses[i] * w * w);
  const contactToFirstModalStiffness = contactNpm / freeStiffness[0];
  if (contactToFirstModalStiffness > MODAL_DIAGNOSTIC_DOMAIN.maxContactToFirstModalStiffness) {
    throw new RangeError('contactNpm must satisfy k/(m1*omega1^2) <= 100 in this bounded projected model');
  }
  const massMatrixKg = diagonal(masses), freeStiffnessNpm = diagonal(freeStiffness);
  const contactStiffnessNpm = Array.from({ length: SIZE }, () => Array(SIZE).fill(contactNpm));
  const stiffnessNpm = freeStiffnessNpm.map((row, i) => row.map((value, j) => value + contactStiffnessNpm[i][j]));
  // Separate square roots make the normalization explicit in the original M.
  const sqrtMass = masses.map(Math.sqrt);
  const massNormalizedStiffnessPerS2 = stiffnessNpm.map((row, i) => row.map((value, j) => value / (sqrtMass[i] * sqrtMass[j])));
  const eigen = symmetricEigen3(massNormalizedStiffnessPerS2);
  const physicalCoordinateEigenvectors = eigen.columns.map(v => v.map((value, i) => value / sqrtMass[i]));
  const kNorm = matrixNorm(stiffnessNpm);
  const generalizedResiduals = physicalCoordinateEigenvectors.map((u, n) => {
    const ku = multiply(stiffnessNpm, u), mu = u.map((value, i) => masses[i] * value);
    return vectorNorm(ku.map((value, i) => value - eigen.values[n] * mu[i]))
      / (kNorm * vectorNorm(u) + eigen.values[n] * vectorNorm(mu));
  });
  if (Math.max(...generalizedResiduals) > RESIDUAL_TOLERANCE) throw new Error('Original mass-coordinate eigenproblem residual failed');
  const coupledFrequencyHz = eigen.values.map(value => Math.sqrt(value) / TAU);
  const coupledRatiosToFirst = ratios(coupledFrequencyHz);
  const legacyHz = free.frequencyHz.map(f => Math.sqrt(f * f + contactNpm / (TAU * TAU * free.massKg)));
  return {
    schema: 'copper-grounded-point-spring-diagnostics/1', status: 'synthetic projected model; no measurements',
    free, contactNpm, contactToFirstModalStiffness,
    massMatrixKg, freeStiffnessNpm, contactStiffnessNpm, stiffnessNpm, massNormalizedStiffnessPerS2,
    eigenvaluePerS2: eigen.values, massNormalizedEigenvectors: eigen.columns, physicalCoordinateEigenvectors,
    coupledFrequencyHz, frequencyShiftHz: coupledFrequencyHz.map((f, i) => f - free.frequencyHz[i]),
    fractionalShift: coupledFrequencyHz.map((f, i) => f / free.frequencyHz[i] - 1),
    coupledRatiosToFirst, ratioChange: coupledRatiosToFirst.map((ratio, i) => ratio - free.ratiosToFirst[i]),
    legacyIndependentSpring: {
      label: 'Legacy illustrative toy: three independent grounded springs, each using whole-sphere mass; not the one-point projected contact.',
      frequencyHz: legacyHz, frequencyShiftHz: legacyHz.map((f, i) => f - free.frequencyHz[i]),
      effectiveMassKg: free.massKg,
    },
    eigensolver: { ...eigen.diagnostics, maxGeneralizedRelativeResidual: Math.max(...generalizedResiduals) },
    passivity: {
      positiveMass: masses.every(m => m > 0), nonnegativeContact: contactNpm >= 0,
      positiveEigenvalues: eigen.values.every(value => value > 0),
      energy: 'T=1/2 sum(m_n*qdot_n^2); V=1/2 sum(m_n*omega_n^2*q_n^2)+1/2*k*(sum(q_n))^2 > 0 for q != 0.',
      scope: 'Conservative positive-energy projected model; no damping, actuator, fixture or whole-apparatus efficiency calculation.',
    },
    limits: [...LIMITS],
  };
}

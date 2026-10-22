/** E1: ideal cyclic-unitary work accessibility for a dephased qubit.
 * All inputs are binary64 numbers. gapJ is a strictly positive finite energy
 * in Joules; population, coherenceMagnitude and dephasing are dimensionless.
 * coherenceMagnitude is |rho_01| itself, NOT a normalized coherence fraction.
 */
const MIN_NORMAL = 2 ** -1022;
const buffer = new ArrayBuffer(8);
const view = new DataView(buffer);

function finite(name, value, low, high) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < low || value > high) {
    throw new RangeError(`${name} must be a finite number in [${low}, ${high}]`);
  }
}
function binary(value) {
  view.setFloat64(0, value, false);
  const bits = view.getBigUint64(0, false);
  const exponent = Number((bits >> 52n) & 2047n);
  const fraction = bits & ((1n << 52n) - 1n);
  return exponent === 0 ? [fraction, -1074] : [(1n << 52n) | fraction, exponent - 1075];
}
// Exact PSD test on the supplied binary64 values, avoiding squared underflow
// and avoiding a tolerance that silently admits non-positive density matrices.
function admissible(population, coherenceMagnitude) {
  if (coherenceMagnitude === 0) return true;
  if (population === 0 || population === 1 || coherenceMagnitude > 0.5) return false;
  const [pm, pe] = binary(population);
  const [cm, ce] = binary(coherenceMagnitude);
  const e = Math.min(pe, ce, 0);
  const p = pm << BigInt(pe - e);
  const c = cm << BigInt(ce - e);
  const one = 1n << BigInt(-e);
  return c * c <= p * (one - p);
}
function adjacent(value, step) {
  view.setFloat64(0, value, false);
  view.setBigUint64(0, view.getBigUint64(0, false) + BigInt(step), false);
  return view.getFloat64(0, false);
}
/** Greatest representable admissible |c| for the supplied population. */
export function maxCoherenceMagnitude(population) {
  finite('population', population, 0, 1);
  if (population === 0 || population === 1) return 0;
  let value = Math.sqrt(population) * Math.sqrt(1 - population);
  while (!admissible(population, value)) value = adjacent(value, -1);
  while (admissible(population, adjacent(value, 1))) value = adjacent(value, 1);
  return value;
}
function rangeStatus(value, physicallyPositive) {
  if (!physicallyPositive) return 'exact-zero';
  if (value === 0) return 'underflow';
  if (value < MIN_NORMAL) return 'subnormal';
  return 'normal';
}
function work(z, r, d, radius, gapJ) {
  if (z === 0) return { normalized: r * d, joules: (gapJ * r) * d };
  if (z < 0) {
    const normalized = radius / 2 - z / 2;
    return { normalized, joules: gapJ * normalized };
  }
  if (r === 0 || d === 0) return { normalized: 0, joules: 0 };
  const ratio = ((2 * r / radius) * d) / (1 + z / radius);
  return { normalized: (r * d) * ratio, joules: ((gapJ * r) * d) * ratio };
}

export function dephasingWorkBound(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Expected an input object');
  const { population: p, coherenceMagnitude: r, dephasing: d, gapJ } = input;
  finite('population', p, 0, 1);
  finite('coherenceMagnitude', r, 0, 0.5);
  finite('dephasing', d, 0, 1);
  if (typeof gapJ !== 'number' || !Number.isFinite(gapJ) || gapJ <= 0) throw new RangeError('gapJ must be a finite, strictly positive energy in Joules');
  if (!admissible(p, r)) throw new RangeError('coherenceMagnitude violates |c|² ≤ population(1−population); use maxCoherenceMagnitude(population) for the representable boundary');
  const z = 1 - 2 * p;
  const radiusBefore = Math.hypot(z, 2 * r);
  const radiusAfter = Math.hypot(z, (2 * r) * d);
  const before = work(z, r, 1, radiusBefore, gapJ);
  const after = work(z, r, d, radiusAfter, gapJ);
  const lossPositive = r > 0 && d < 1;
  // Rationalization, normalized before conversion to Joules. The bounded
  // ratio avoids both cancellation and squaring a possibly tiny coherence.
  const lossRatio = lossPositive
    ? Math.min(1, (2 * r / radiusBefore) * ((1 + d) / (1 + radiusAfter / radiusBefore)))
    : 0;
  const boundNormalized = r * (1 - d);
  const lossNormalized = boundNormalized * lossRatio;
  // Regroup Joule products: a dimensionless underflow need not imply a Joule
  // underflow for a large gap. Each remaining factor is at most one.
  const boundJ = (gapJ * r) * (1 - d);
  const lossJ = boundJ * lossRatio;
  const workBeforePositive = p > 0.5 || r > 0;
  const workAfterPositive = p > 0.5 || (r > 0 && d > 0);
  return {
    population: p, coherenceMagnitude: r, dephasing: d, gapJ,
    radiusBefore, radiusAfter,
    workBeforeNormalized: before.normalized,
    workAfterNormalized: after.normalized,
    lossNormalized, boundNormalized,
    workBeforeJ: before.joules,
    workAfterJ: after.joules,
    lossJ, boundJ, lossRatio,
    lowerEquality: !lossPositive,
    upperEquality: !lossPositive || p === 0.5,
    representability: {
      workBeforeNormalized: rangeStatus(before.normalized, workBeforePositive),
      workAfterNormalized: rangeStatus(after.normalized, workAfterPositive),
      lossNormalized: rangeStatus(lossNormalized, lossPositive),
      boundNormalized: rangeStatus(boundNormalized, lossPositive),
      workBeforeJ: rangeStatus(before.joules, workBeforePositive),
      workAfterJ: rangeStatus(after.joules, workAfterPositive),
      lossJ: rangeStatus(lossJ, lossPositive),
      boundJ: rangeStatus(boundJ, lossPositive),
    },
  };
}
export const evaluateDephasingBound = dephasingWorkBound;

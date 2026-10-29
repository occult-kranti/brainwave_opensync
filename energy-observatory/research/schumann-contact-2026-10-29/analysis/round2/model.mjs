// Ideal receiver arithmetic only. No measured fields, delivered power or biology.
export const BOLTZMANN_J_PER_K = 1.380649e-23;
function nonnegative(name, value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    throw new RangeError(`${name} must be a finite nonnegative number`);
  return value;
}
function finiteResult(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} exceeds supported numeric range`);
  return value;
}
export function normalProjection(angleDeg = 0) {
  if (typeof angleDeg !== 'number' || !Number.isFinite(angleDeg)) throw new RangeError('angleDeg must be finite');
  // Exactly representable odd multiples of 90 degrees are exact orthogonality.
  const angle = angleDeg % 360;
  return Math.abs(angle) % 180 === 90 ? 0 : Math.abs(Math.cos(angle * Math.PI / 180));
}
export function induction({frequencyHz, magneticRmsT, turns, areaM2, angleDeg = 0}) {
  for (const [name, value] of Object.entries({frequencyHz, magneticRmsT, turns, areaM2})) nonnegative(name, value);
  if (!Number.isSafeInteger(turns)) throw new RangeError('turns must be a nonnegative safe integer');
  const projection = normalProjection(angleDeg);
  const sensitivityVPerT = frequencyHz === 0 || turns === 0 || areaM2 === 0 || projection === 0
    ? 0 : finiteResult('sensitivityVPerT', turns * areaM2 * (2 * Math.PI * frequencyHz) * projection);
  const voltageRmsV = finiteResult('voltageRmsV', magneticRmsT * sensitivityVPerT);
  return {voltageRmsV, sensitivityVPerT, projection, magneticConvention: 'RMS', voltageConvention: 'RMS'};
}
export function circularField({frequencyHz, magneticRmsT, radiusM}) {
  for (const [name, value] of Object.entries({frequencyHz, magneticRmsT, radiusM})) nonnegative(name, value);
  const electricRmsVPerM = frequencyHz === 0 || magneticRmsT === 0 || radiusM === 0
    ? 0 : finiteResult('electricRmsVPerM', Math.PI * frequencyHz * radiusM * magneticRmsT);
  return {electricRmsVPerM, scope: 'ideal circular-path azimuthal field in uniform axial B; not tissue dosimetry'};
}
export function thermalNoise({temperatureK, resistanceOhm, bandwidthHz}) {
  for (const [name, value] of Object.entries({temperatureK, resistanceOhm, bandwidthHz})) nonnegative(name, value);
  if (resistanceOhm === 0 || bandwidthHz === 0) throw new RangeError('resistanceOhm and bandwidthHz must be positive');
  return {voltageRmsV: finiteResult('thermal voltage', Math.sqrt(4 * BOLTZMANN_J_PER_K * temperatureK * resistanceOhm * bandwidthHz)),
    scope: 'classical Johnson voltage across an ideal resistor in a stated bandwidth; omitted receiver/environmental noise and reactance'};
}
export function receiver(inputs) {
  const signal = induction(inputs);
  const noise = thermalNoise(inputs);
  const identifiable = signal.sensitivityVPerT > 0;
  return {signal, noise, identifiable,
    equivalentMagneticNoiseRmsT: identifiable ? finiteResult('equivalent magnetic noise', noise.voltageRmsV / signal.sensitivityVPerT) : null,
    status: identifiable ? 'ideal-receiver-arithmetic-only' : 'unidentifiable-zero-sensitivity'};
}

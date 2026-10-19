/** Educational steady-state models. SI units internally; every phasor is RMS.
 * Time convention exp(+i omega t). No hardware, biological, or gravity claim.
 */
const TAU = 2 * Math.PI;
const cx = (re, im = 0) => ({ re, im });
const add = (a, b) => cx(a.re + b.re, a.im + b.im);
const sub = (a, b) => cx(a.re - b.re, a.im - b.im);
const mul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const scale = (a, s) => cx(a.re * s, a.im * s);
const norm2 = (a) => a.re * a.re + a.im * a.im;
const div = (a, b) => {
  const n = norm2(b);
  if (!Number.isFinite(n) || n === 0) throw new RangeError('Singular or non-finite harmonic response');
  return cx((a.re * b.re + a.im * b.im) / n, (a.im * b.re - a.re * b.im) / n);
};
const magnitude = (a) => Math.hypot(a.re, a.im);
function number(name, value, min, max, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    throw new RangeError(`${name} must be ${integer ? 'an integer' : 'finite'} in [${min}, ${max}]`);
  }
  return value;
}
function config(defaults, values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw new TypeError('Parameters must be an object');
  for (const key of Object.keys(values)) if (!Object.hasOwn(defaults, key)) throw new RangeError(`Unknown parameter: ${key}`);
  return { ...defaults, ...values };
}
function linspace(start, end, count) {
  return Array.from({ length: count }, (_, i) => start + (end - start) * i / (count - 1));
}
function sweepValidation(p) {
  number('sweepStartHz', p.sweepStartHz, 1e-6, 1e9);
  number('sweepEndHz', p.sweepEndHz, p.sweepStartHz + 1e-6, 1e9);
  number('sweepPoints', p.sweepPoints, 3, 1001, true);
}
const nominalCapacitance = 1 / ((TAU * 100000) ** 2 * 100e-6);
export const MODEL_DEFAULTS = Object.freeze({
  rlc: Object.freeze({ frequencyHz: 100000, primaryInductanceH: 100e-6, secondaryInductanceH: 100e-6,
    primaryCapacitanceF: nominalCapacitance, secondaryCapacitanceF: nominalCapacitance,
    primaryResistanceOhm: 0.5, secondaryResistanceOhm: 0.5, loadResistanceOhm: 5,
    coupling: 0.15, sourceVoltageVrms: 1, sweepStartHz: 20000, sweepEndHz: 180000, sweepPoints: 241 }),
  array: Object.freeze({ frequencyHz: 40000, soundSpeedMps: 343, elementsPerSide: 8, pitchM: 0.0042875,
    targetXM: 0, targetZM: 0.08, phaseErrorRad: 0, phaseBits: 0, seed: 42,
    width: 81, height: 61, xExtentM: 0.06, zMinM: 0.01, zMaxM: 0.16 }),
  absorber: Object.freeze({ frequencyHz: 16, primaryFrequencyHz: 16, massPrimaryKg: 1,
    dampingRatioPrimary: 0.025, massRatio: 0.1, tuningRatio: 1, dampingRatioAbsorber: 0.12,
    forceNrms: 1, sweepStartHz: 1, sweepEndHz: 40, sweepPoints: 241 }),
});

/** Series-series coupled coils with M=k sqrt(L1 L2). Includes winding loss + load. */
export function solveRlcAtFrequency(p, frequencyHz) {
  number('frequencyHz', frequencyHz, 1e-6, 1e9);
  for (const key of ['primaryInductanceH', 'secondaryInductanceH']) number(key, p[key], 1e-12, 1e6);
  for (const key of ['primaryCapacitanceF', 'secondaryCapacitanceF']) number(key, p[key], 1e-15, 1e3);
  number('primaryResistanceOhm', p.primaryResistanceOhm, 1e-9, 1e9);
  number('secondaryResistanceOhm', p.secondaryResistanceOhm, 0, 1e9);
  number('loadResistanceOhm', p.loadResistanceOhm, 0, 1e9);
  if (p.secondaryResistanceOhm + p.loadResistanceOhm === 0) throw new RangeError('Secondary total resistance must be positive');
  number('coupling', p.coupling, 0, 0.999);
  number('sourceVoltageVrms', p.sourceVoltageVrms, 0, 1e6);
  const w = TAU * frequencyHz;
  const M = p.coupling * Math.sqrt(p.primaryInductanceH * p.secondaryInductanceH);
  const z1 = cx(p.primaryResistanceOhm, w * p.primaryInductanceH - 1 / (w * p.primaryCapacitanceF));
  const z2 = cx(p.secondaryResistanceOhm + p.loadResistanceOhm, w * p.secondaryInductanceH - 1 / (w * p.secondaryCapacitanceF));
  const reflectedImpedanceOhm = div(cx((w * M) ** 2), z2);
  const inputImpedanceOhm = add(z1, reflectedImpedanceOhm);
  const primaryCurrentA = div(cx(p.sourceVoltageVrms), inputImpedanceOhm);
  const secondaryCurrentA = mul(div(cx(0, -w * M), z2), primaryCurrentA);
  const inputPowerW = p.sourceVoltageVrms * primaryCurrentA.re;
  const primaryLossW = p.primaryResistanceOhm * norm2(primaryCurrentA);
  const secondaryLossW = p.secondaryResistanceOhm * norm2(secondaryCurrentA);
  const loadPowerW = p.loadResistanceOhm * norm2(secondaryCurrentA);
  const copperLossW = primaryLossW + secondaryLossW;
  return { frequencyHz, mutualInductanceH: M, primaryCurrentA, secondaryCurrentA,
    primaryCurrentArms: magnitude(primaryCurrentA), secondaryCurrentArms: magnitude(secondaryCurrentA),
    inputImpedanceOhm, reflectedImpedanceOhm, inputPowerW, primaryLossW, secondaryLossW, copperLossW,
    loadPowerW, efficiency: inputPowerW > 0 ? loadPowerW / inputPowerW : 0,
    powerResidualW: inputPowerW - copperLossW - loadPowerW };
}
export function simulateRlc(values = {}) {
  const p = config(MODEL_DEFAULTS.rlc, values); sweepValidation(p);
  const point = solveRlcAtFrequency(p, p.frequencyHz);
  const response = linspace(p.sweepStartHz, p.sweepEndHz, p.sweepPoints).map((f) => solveRlcAtFrequency(p, f));
  return { modelId: 'rlc', parameters: p, operatingPoint: point, response,
    metrics: [
      { label: 'Load power', value: point.loadPowerW, unit: 'W', detail: 'Delivered by the external AC source through mutual inductance.' },
      { label: 'Circuit efficiency', value: 100 * point.efficiency, unit: '%', detail: 'Load / real source power; excludes generator electronics and unmodelled field losses.' },
      { label: 'Source power', value: point.inputPowerW, unit: 'W' },
      { label: 'Winding loss', value: point.copperLossW, unit: 'W' },
      { label: 'Power balance residual', value: point.powerResidualW, unit: 'W' },
    ],
    series: [ ['Load power', 'loadPowerW'], ['Source power', 'inputPowerW'], ['Winding loss', 'copperLossW'] ].map(([name, key]) => ({ name, points: response.map((r) => ({ x: r.frequencyHz / 1000, y: r[key] })) })),
    xLabel: 'Drive frequency (kHz)', yLabel: 'Real power (W)',
  };
}

function makeRandom(seed) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
}
/** Equal-amplitude ideal monopoles; free-space Green function exp(-ikr)/r. */
export function buildAcousticArray(values = {}) {
  const p = config(MODEL_DEFAULTS.array, values);
  number('frequencyHz', p.frequencyHz, 20, 1e6); number('soundSpeedMps', p.soundSpeedMps, 100, 2000);
  number('elementsPerSide', p.elementsPerSide, 1, 16, true); number('pitchM', p.pitchM, 1e-5, 0.1);
  number('targetXM', p.targetXM, -1, 1); number('targetZM', p.targetZM, 0.001, 10);
  number('phaseErrorRad', p.phaseErrorRad, 0, Math.PI); number('phaseBits', p.phaseBits, 0, 16, true);
  number('seed', p.seed, 0, 0xffffffff, true);
  number('width', p.width, 3, 201, true); number('height', p.height, 3, 201, true);
  number('xExtentM', p.xExtentM, 0.001, 2); number('zMinM', p.zMinM, 0.001, 10);
  number('zMaxM', p.zMaxM, p.zMinM + 0.001, 20);
  const wavenumberRadPm = TAU * p.frequencyHz / p.soundSpeedMps;
  const random = makeRandom(p.seed);
  const sources = []; let referenceAmplitudePerM = 0;
  for (let row = 0; row < p.elementsPerSide; row++) for (let col = 0; col < p.elementsPerSide; col++) {
    const xM = (col - (p.elementsPerSide - 1) / 2) * p.pitchM;
    const yM = (row - (p.elementsPerSide - 1) / 2) * p.pitchM;
    const targetDistanceM = Math.hypot(p.targetXM - xM, yM, p.targetZM);
    const idealPhaseRad = wavenumberRadPm * targetDistanceM;
    const quantum = TAU / (2 ** p.phaseBits);
    const phaseRad = (p.phaseBits ? Math.round(idealPhaseRad / quantum) * quantum : idealPhaseRad) + (2 * random() - 1) * p.phaseErrorRad;
    sources.push({ xM, yM, zM: 0, phaseRad, idealPhaseRad, targetDistanceM });
    referenceAmplitudePerM += 1 / targetDistanceM;
  }
  return { parameters: p, sources, wavenumberRadPm, referenceAmplitudePerM };
}
/** Returns a complex 1/metre proxy, not calibrated pressure; pressure-squared proxy is dimensionless (legacy property name relativeIntensity). */
export function evaluateAcousticField(array, xM, yM, zM) {
  number('xM', xM, -100, 100); number('yM', yM, -100, 100); number('zM', zM, 0.000001, 100);
  let re = 0, im = 0;
  for (const source of array.sources) {
    const r = Math.hypot(xM - source.xM, yM - source.yM, zM);
    const angle = source.phaseRad - array.wavenumberRadPm * r;
    re += Math.cos(angle) / r; im += Math.sin(angle) / r;
  }
  return { amplitudeProxyPerM: cx(re, im), relativeIntensity: (re * re + im * im) / (array.referenceAmplitudePerM ** 2) };
}
export function simulateAcousticArray(values = {}) {
  const array = buildAcousticArray(values); const p = array.parameters;
  const xs = linspace(-p.xExtentM, p.xExtentM, p.width);
  const zs = linspace(p.zMinM, p.zMaxM, p.height);
  const mapValues = zs.flatMap((z) => xs.map((x) => evaluateAcousticField(array, x, 0, z).relativeIntensity));
  const reference = buildAcousticArray({ ...p, phaseErrorRad: 0, phaseBits: 0 });
  const target = evaluateAcousticField(array, p.targetXM, 0, p.targetZM);
  const wavelengthM = p.soundSpeedMps / p.frequencyHz;
  const operatingPoint = { targetRelativeIntensity: target.relativeIntensity, wavelengthM,
    apertureM: (p.elementsPerSide - 1) * p.pitchM, elementCount: array.sources.length,
    pitchOverWavelength: p.pitchM / wavelengthM };
  return { modelId: 'array', parameters: p, operatingPoint, sources: array.sources,
    metrics: [
      { label: 'Target coherence', value: 100 * target.relativeIntensity, unit: '%', detail: 'Pressure-squared proxy at the target versus perfect continuous phases for the same geometry; not a power efficiency.' },
      { label: 'Wavelength', value: wavelengthM * 1000, unit: 'mm' },
      { label: 'Array aperture', value: operatingPoint.apertureM * 1000, unit: 'mm', detail: 'Centre-to-centre span, equal in x and y.' },
      { label: 'Pitch / wavelength', value: operatingPoint.pitchOverWavelength, unit: 'λ', detail: 'Large pitch can produce additional lobes; point sources omit transducer directivity.' },
    ],
    series: [
      { name: 'Configured phases', points: xs.map((x) => ({ x: x * 1000, y: evaluateAcousticField(array, x, 0, p.targetZM).relativeIntensity })) },
      { name: 'Ideal continuous phases', points: xs.map((x) => ({ x: x * 1000, y: evaluateAcousticField(reference, x, 0, p.targetZM).relativeIntensity })) },
    ],
    axialSeries: zs.map((z) => ({ x: z * 1000, y: evaluateAcousticField(array, p.targetXM, 0, z).relativeIntensity })),
    xLabel: 'Transverse position at target depth (mm)', yLabel: 'Relative pressure² / ideal target',
    map: { width: p.width, height: p.height, xMin: -p.xExtentM, xMax: p.xExtentM, yMin: p.zMinM, yMax: p.zMaxM, values: mapValues },
  };
}

export function resolveAbsorberParameters(values = {}) {
  const p = config(MODEL_DEFAULTS.absorber, values);
  number('primaryFrequencyHz', p.primaryFrequencyHz, 0.001, 1e6);
  number('massPrimaryKg', p.massPrimaryKg, 1e-9, 1e9);
  number('dampingRatioPrimary', p.dampingRatioPrimary, 0.000001, 10);
  number('massRatio', p.massRatio, 0.000001, 10); number('tuningRatio', p.tuningRatio, 0.001, 10);
  number('dampingRatioAbsorber', p.dampingRatioAbsorber, 0, 10); number('forceNrms', p.forceNrms, 0, 1e9);
  const w1 = TAU * p.primaryFrequencyHz, w2 = w1 * p.tuningRatio;
  const massSecondaryKg = p.massPrimaryKg * p.massRatio;
  return { massPrimaryKg: p.massPrimaryKg, massSecondaryKg,
    stiffnessPrimaryNpm: p.massPrimaryKg * w1 ** 2, stiffnessSecondaryNpm: massSecondaryKg * w2 ** 2,
    dampingPrimaryNsPm: 2 * p.dampingRatioPrimary * p.massPrimaryKg * w1,
    dampingSecondaryNsPm: 2 * p.dampingRatioAbsorber * massSecondaryKg * w2, forceNrms: p.forceNrms };
}
/** Parallel k2/c2 joins masses; k1/c1 joins primary to ground. Absolute displacements. */
export function solveAbsorberAtFrequency(p, frequencyHz) {
  number('frequencyHz', frequencyHz, 1e-6, 1e9);
  for (const key of ['massPrimaryKg', 'massSecondaryKg', 'stiffnessPrimaryNpm', 'stiffnessSecondaryNpm']) number(key, p[key], 1e-12, 1e18);
  // A positive primary damper keeps the bare-primary comparison finite at resonance.
  number('dampingPrimaryNsPm', p.dampingPrimaryNsPm, 1e-15, 1e15);
  number('dampingSecondaryNsPm', p.dampingSecondaryNsPm, 0, 1e15);
  number('forceNrms', p.forceNrms, 0, 1e9);
  const w = TAU * frequencyHz;
  const attachment = cx(p.stiffnessSecondaryNpm, w * p.dampingSecondaryNsPm);
  const bare = cx(p.stiffnessPrimaryNpm - p.massPrimaryKg * w * w, w * p.dampingPrimaryNsPm);
  const a = add(bare, attachment), d = sub(attachment, cx(p.massSecondaryKg * w * w));
  const determinant = sub(mul(a, d), mul(attachment, attachment));
  const primaryDisplacementM = div(scale(d, p.forceNrms), determinant);
  const secondaryDisplacementM = div(scale(attachment, p.forceNrms), determinant);
  const baselineDisplacementM = div(cx(p.forceNrms), bare);
  const relativeDisplacementM = sub(secondaryDisplacementM, primaryDisplacementM);
  const primaryDisplacementRmsM = magnitude(primaryDisplacementM);
  const secondaryDisplacementRmsM = magnitude(secondaryDisplacementM);
  const baselineDisplacementRmsM = magnitude(baselineDisplacementM);
  const inputPowerW = -p.forceNrms * w * primaryDisplacementM.im;
  const primaryDampingPowerW = p.dampingPrimaryNsPm * w * w * norm2(primaryDisplacementM);
  const absorberDampingPowerW = p.dampingSecondaryNsPm * w * w * norm2(relativeDisplacementM);
  return { frequencyHz, primaryDisplacementM, secondaryDisplacementM, relativeDisplacementM,
    primaryDisplacementRmsM, secondaryDisplacementRmsM, baselineDisplacementRmsM,
    responseRatio: baselineDisplacementRmsM > 0 ? primaryDisplacementRmsM / baselineDisplacementRmsM : 0,
    inputPowerW, primaryDampingPowerW, absorberDampingPowerW,
    powerResidualW: inputPowerW - primaryDampingPowerW - absorberDampingPowerW };
}
export function simulateAbsorber(values = {}) {
  const p = config(MODEL_DEFAULTS.absorber, values); sweepValidation(p);
  const physicalParameters = resolveAbsorberParameters(p);
  const point = solveAbsorberAtFrequency(physicalParameters, p.frequencyHz);
  const tuned = resolveAbsorberParameters({ ...p, tuningRatio: 1 });
  const detuned = resolveAbsorberParameters({ ...p, tuningRatio: 0.75 });
  const response = linspace(p.sweepStartHz, p.sweepEndHz, p.sweepPoints).map((f) => ({ ...solveAbsorberAtFrequency(physicalParameters, f),
    tunedDisplacementRmsM: solveAbsorberAtFrequency(tuned, f).primaryDisplacementRmsM,
    detunedDisplacementRmsM: solveAbsorberAtFrequency(detuned, f).primaryDisplacementRmsM }));
  return { modelId: 'absorber', parameters: p, physicalParameters, operatingPoint: point, response,
    metrics: [
      { label: 'Primary displacement', value: point.primaryDisplacementRmsM * 1000, unit: 'mm RMS' },
      { label: 'Response / bare primary', value: point.responseRatio, unit: '×', detail: 'Below 1 reduces response at this frequency; an absorber can amplify other frequencies.' },
      { label: 'Drive power', value: point.inputPowerW, unit: 'W', detail: 'External harmonic force supplies all dissipated power.' },
      { label: 'Absorber stroke', value: magnitude(point.relativeDisplacementM) * 1000, unit: 'mm RMS' },
      { label: 'Power balance residual', value: point.powerResidualW, unit: 'W' },
    ],
    series: [['Configured absorber', 'primaryDisplacementRmsM'], ['Bare primary', 'baselineDisplacementRmsM'], ['Tuning ratio 1', 'tunedDisplacementRmsM'], ['Detuned ratio 0.75', 'detunedDisplacementRmsM']].map(([name, key]) => ({ name, points: response.map((r) => ({ x: r.frequencyHz, y: r[key] * 1000 })) })),
    xLabel: 'Drive frequency (Hz)', yLabel: 'Primary displacement (mm RMS)',
  };
}

export const deviceModels = {
  rlc: { id: 'rlc', title: 'Coupled resonator link', description: 'A loaded series-series circuit: energy moves between coils while winding resistance dissipates it.',
    controls: [
      { key: 'frequencyHz', label: 'Drive frequency', unit: 'Hz', min: 20000, max: 180000, step: 1000, default: 100000 },
      { key: 'coupling', label: 'Magnetic coupling', unit: 'k', min: 0, max: 0.6, step: 0.01, default: 0.15 },
      { key: 'loadResistanceOhm', label: 'Load resistance', unit: 'Ω', min: 0.2, max: 30, step: 0.1, default: 5 },
      { key: 'sourceVoltageVrms', label: 'Source voltage', unit: 'V RMS', min: 0.1, max: 5, step: 0.1, default: 1 },
    ],
    presets: [
      { id: 'rlc-weak', label: 'Weak coupling', group: 'Energy transfer', values: { frequencyHz: 100000, coupling: 0.05, loadResistanceOhm: 5, sourceVoltageVrms: 1 } },
      { id: 'rlc-reference', label: 'Reference resonators', group: 'Energy transfer', values: { frequencyHz: 100000, coupling: 0.15, loadResistanceOhm: 5, sourceVoltageVrms: 1 } },
      { id: 'rlc-split', label: 'Strong coupling sweep', group: 'Energy transfer', values: { frequencyHz: 100000, coupling: 0.4, loadResistanceOhm: 5, sourceVoltageVrms: 1 } },
    ], simulate: simulateRlc },
  array: { id: 'array', title: 'Phase-conjugate acoustic array', description: '64 ideal point sources add coherently at a selected target. Examine aperture, steering and phase errors.',
    controls: [
      { key: 'frequencyHz', label: 'Frequency', unit: 'Hz', min: 20000, max: 60000, step: 1000, default: 40000 },
      { key: 'targetXM', label: 'Target lateral offset', unit: 'm', min: -0.02, max: 0.02, step: 0.001, default: 0 },
      { key: 'targetZM', label: 'Target depth', unit: 'm', min: 0.03, max: 0.15, step: 0.005, default: 0.08 },
      { key: 'pitchM', label: 'Element pitch', unit: 'm', min: 0.002, max: 0.012, step: 0.0000125, default: 0.0042875 },
      { key: 'phaseErrorRad', label: 'Phase error bound', unit: 'rad', min: 0, max: 3.14, step: 0.01, default: 0 },
      { key: 'phaseBits', label: 'Phase bits (0 = continuous)', unit: 'bits', min: 0, max: 8, step: 1, default: 0 },
    ],
    presets: [
      { id: 'array-focus', label: 'Coherent focus', group: 'Wave shaping', values: { frequencyHz: 40000, targetXM: 0, targetZM: 0.08, pitchM: 0.0042875, phaseErrorRad: 0, phaseBits: 0 } },
      { id: 'array-steered', label: 'Steered focus', group: 'Wave shaping', values: { frequencyHz: 40000, targetXM: 0.015, targetZM: 0.08, pitchM: 0.0042875, phaseErrorRad: 0, phaseBits: 0 } },
      { id: 'array-errors', label: 'Quantized + phase noise', group: 'Wave shaping', values: { frequencyHz: 40000, targetXM: 0, targetZM: 0.08, pitchM: 0.0042875, phaseErrorRad: 0.8, phaseBits: 2 } },
    ], simulate: simulateAcousticArray },
  absorber: { id: 'absorber', title: 'Two-mode vibration absorber', description: 'A second mass and a relative-velocity dashpot redistribute a driven structure’s resonances.',
    controls: [
      { key: 'frequencyHz', label: 'Drive frequency', unit: 'Hz', min: 1, max: 40, step: 0.1, default: 16 },
      { key: 'tuningRatio', label: 'Absorber / primary frequency', unit: 'ratio', min: 0.5, max: 1.5, step: 0.005, default: 1 },
      { key: 'dampingRatioAbsorber', label: 'Absorber damping ratio', unit: 'ζ', min: 0, max: 0.5, step: 0.01, default: 0.12 },
      { key: 'massRatio', label: 'Absorber / primary mass', unit: 'ratio', min: 0.02, max: 0.3, step: 0.01, default: 0.1 },
    ],
    presets: [
      { id: 'absorber-tuned', label: 'Tuned reference', group: 'Vibration control', values: { frequencyHz: 16, tuningRatio: 1, dampingRatioAbsorber: 0.12, massRatio: 0.1 } },
      { id: 'absorber-detuned', label: 'Detuned comparison', group: 'Vibration control', values: { frequencyHz: 16, tuningRatio: 0.75, dampingRatioAbsorber: 0.12, massRatio: 0.1 } },
      { id: 'absorber-broad', label: 'Higher damping', group: 'Vibration control', values: { frequencyHz: 16, tuningRatio: 0.95, dampingRatioAbsorber: 0.3, massRatio: 0.1 } },
    ], simulate: simulateAbsorber },
};

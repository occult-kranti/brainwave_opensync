/**
 * Explicit reference models, not an Earth fit or a measurement processor.
 * Geometry: ideal lossless thin spherical shell.
 * Dynamics: mechanical q'' + 2 gamma q' + omega0^2 q = F/m.
 * All scalar inputs and returned quantities use the SI units in their names.
 */
export const C0_M_PER_S = 299792458;
export const MU0_REFERENCE_H_PER_M = 4 * Math.PI * 1e-7;
const TAU = 2 * Math.PI;

function finite(name, value, {positive = false, nonnegative = false} = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value) ||
      (positive && value <= 0) || (nonnegative && value < 0)) {
    throw new RangeError(`${name} must be ${positive ? 'positive ' : nonnegative ? 'nonnegative ' : ''}finite.`);
  }
  return value;
}
function represented(name, value, {positive = false} = {}) {
  if (!Number.isFinite(value) || (positive && value <= 0)) {
    throw new RangeError(`${name} is outside the supported finite numerical range.`);
  }
  return value;
}

export function idealCavityModes({radiusM = 6371000, speedMps = C0_M_PER_S, maxDegree = 5} = {}) {
  finite('radiusM', radiusM, {positive:true});
  finite('speedMps', speedMps, {positive:true});
  if (!Number.isSafeInteger(maxDegree) || maxDegree < 1 || maxDegree > 1000) {
    throw new RangeError('maxDegree must be an integer from 1 through 1000.');
  }
  const circumferenceM = represented('circumferenceM', TAU * radiusM, {positive:true});
  return Array.from({length:maxDegree}, (_, i) => {
    const degree = i + 1, angularFactor = Math.sqrt(degree * (degree + 1));
    const horizontalWavelengthM = represented('horizontalWavelengthM', circumferenceM / angularFactor, {positive:true});
    const frequencyHz = represented('frequencyHz', speedMps / horizontalWavelengthM, {positive:true});
    return {degree, frequencyHz, omegaPerS:represented('omegaPerS', TAU * frequencyHz, {positive:true}), horizontalWavelengthM};
  });
}

export function wavelengthReference({frequencyHz, speedMps = C0_M_PER_S}) {
  finite('frequencyHz', frequencyHz, {positive:true});
  finite('speedMps', speedMps, {positive:true});
  return {
    wavelengthM:represented('wavelengthM', speedMps / frequencyHz, {positive:true}),
    frequencyHz, speedMps,
    scope:'Speed-dependent wavelength reference; an observed cavity peak alone does not determine propagation speed.'
  };
}

export function magneticEnergyReference({fieldRmsT, permeabilityHpm = MU0_REFERENCE_H_PER_M}) {
  finite('fieldRmsT', fieldRmsT, {nonnegative:true});
  finite('permeabilityHpm', permeabilityHpm, {positive:true});
  const energyDensityJPerM3 = fieldRmsT === 0 ? 0 : represented(
    'energyDensityJPerM3', (fieldRmsT / permeabilityHpm) * fieldRmsT / 2, {positive:true});
  return {fieldRmsT, permeabilityHpm, energyDensityJPerM3,
    scope:'Magnetic energy-density reference, not power, extractable cycle energy or total Earth-field energy. Default permeability is an approximation.'};
}

export function dampedMode({naturalFrequencyHz, gammaPerS}) {
  finite('naturalFrequencyHz', naturalFrequencyHz, {positive:true});
  finite('gammaPerS', gammaPerS, {positive:true});
  const omega0PerS = represented('omega0PerS', TAU * naturalFrequencyHz, {positive:true});
  const dampingRatio = represented('dampingRatio', gammaPerS / omega0PerS, {positive:true});
  const qualityFactor = represented('qualityFactor', 0.5 / dampingRatio, {positive:true});
  const positiveDisplacementPeak = dampingRatio < Math.SQRT1_2;
  const oscillatoryRingdown = dampingRatio < 1;
  const displacementPeakHz = positiveDisplacementPeak ? represented('displacementPeakHz',
    naturalFrequencyHz * Math.sqrt(1 - 2 * dampingRatio * dampingRatio), {positive:true}) : 0;
  const ringdownFrequencyHz = oscillatoryRingdown ? represented('ringdownFrequencyHz',
    naturalFrequencyHz * Math.sqrt((1 - dampingRatio) * (1 + dampingRatio)), {positive:true}) : null;
  return {naturalFrequencyHz, omega0PerS, gammaPerS, dampingRatio, qualityFactor,
    displacementPeakHz, displacementPeakKind:positiveDisplacementPeak ? 'positive-frequency maximum' : 'DC maximum',
    velocityPeakHz:naturalFrequencyHz, ringdownFrequencyHz, oscillatoryRingdown,
    scope:'White force spectrum and constant displacement/velocity gain. This mechanical mode is not an Earth electromagnetic normalization.'};
}

export function modeResponse({frequencyHz, naturalFrequencyHz, gammaPerS, massKg = 1}) {
  finite('frequencyHz', frequencyHz, {nonnegative:true});
  finite('massKg', massKg, {positive:true});
  const mode = dampedMode({naturalFrequencyHz, gammaPerS});
  const omegaPerS = represented('omegaPerS', TAU * frequencyHz, {positive:frequencyHz > 0});
  // Factoring the difference avoids subtracting separately squared large values.
  const a = represented('real dynamic coefficient', (mode.omega0PerS - omegaPerS) * (mode.omega0PerS + omegaPerS));
  if (a === 0 && mode.omega0PerS !== omegaPerS) throw new RangeError('A nonzero dynamic coefficient underflows the supported numerical range.');
  const b = represented('imaginary dynamic coefficient', 2 * gammaPerS * omegaPerS, {positive:frequencyHz > 0});
  const scale = Math.max(Math.abs(a), Math.abs(b));
  represented('dynamic coefficient scale', scale, {positive:true});
  const ar = a / scale, br = b / scale, denominator = ar * ar + br * br;
  const reciprocalScale = represented('reciprocal dynamic scale', (1 / massKg) / scale, {positive:true});
  const realMPerN = represented('realMPerN', reciprocalScale * ar / denominator);
  const imagMPerN = represented('imagMPerN', -reciprocalScale * br / denominator);
  if ((a !== 0 && realMPerN === 0) || (b !== 0 && imagMPerN === 0)) {
    throw new RangeError('A nonzero transfer component underflows the supported numerical range.');
  }
  const magnitudeMPerN = represented('magnitudeMPerN', Math.hypot(realMPerN, imagMPerN), {positive:true});
  const displacementPsdPerForcePsd = represented('displacementPsdPerForcePsd', magnitudeMPerN * magnitudeMPerN, {positive:true});
  const velocityMagnitudeMPerNs = omegaPerS === 0 ? 0 : represented('velocityMagnitudeMPerNs', omegaPerS * magnitudeMPerN, {positive:true});
  const velocityPsdPerForcePsd = omegaPerS === 0 ? 0 : represented('velocityPsdPerForcePsd', velocityMagnitudeMPerNs * velocityMagnitudeMPerNs, {positive:true});
  return {frequencyHz, omegaPerS, naturalFrequencyHz, gammaPerS, massKg, realMPerN, imagMPerN,
    magnitudeMPerN, displacementPsdPerForcePsd, velocityPsdPerForcePsd};
}

export function harmonicEnergyBudget({frequencyHz, naturalFrequencyHz, gammaPerS, massKg = 1, forcePeakN = 1}) {
  finite('forcePeakN', forcePeakN, {nonnegative:true});
  const h = modeResponse({frequencyHz, naturalFrequencyHz, gammaPerS, massKg});
  const qRealM = represented('qRealM', h.realMPerN * forcePeakN);
  const qImagM = represented('qImagM', h.imagMPerN * forcePeakN);
  const velocityRealMPerS = represented('velocityRealMPerS', -h.omegaPerS * qImagM);
  const velocityImagMPerS = represented('velocityImagMPerS', h.omegaPerS * qRealM);
  const velocityMagnitudeMPerS = Math.hypot(velocityRealMPerS, velocityImagMPerS);
  const displacementMagnitudeM = Math.hypot(qRealM, qImagM);
  if (forcePeakN > 0 && displacementMagnitudeM === 0) throw new RangeError('Displacement amplitude underflow.');
  const active = frequencyHz > 0 && forcePeakN > 0;
  const averageInputW = represented('averageInputW', 0.5 * forcePeakN * velocityRealMPerS, {positive:active});
  const averageDissipationW = represented('averageDissipationW',
    (massKg * gammaPerS * velocityMagnitudeMPerS) * velocityMagnitudeMPerS, {positive:active});
  return {...h, forcePeakN, qRealM, qImagM, velocityRealMPerS, velocityImagMPerS,
    averageInputW, averageDissipationW,
    relativeClosure:active ? Math.abs(averageInputW - averageDissipationW) / Math.max(averageInputW, averageDissipationW) : 0,
    scope:'Steady harmonic input equals viscous loss in this mechanical model; no uncounted energy source or apparatus efficiency.'};
}

/** Synthetic positive color, dimensionless. No measured source law is implied. */
export function positiveSpectralWeight({frequencyHz, referenceHz = 7.8, scaleHz = 7.8, tilt = 0}) {
  finite('frequencyHz', frequencyHz, {nonnegative:true});
  finite('referenceHz', referenceHz, {nonnegative:true});
  finite('scaleHz', scaleHz, {positive:true});
  finite('tilt', tilt);
  const exponent = represented('color exponent', tilt * ((frequencyHz - referenceHz) / scaleHz));
  return represented('positive spectral weight', Math.exp(exponent), {positive:true});
}

/** Physical displacement/velocity PSDs and dimensionless receiver squared gain. */
export function mechanicalPsd({frequencyHz, naturalFrequencyHz, gammaPerS, massKg = 1,
  forcePsdN2PerHz = 1, receiverGainSquared = 1}) {
  finite('forcePsdN2PerHz', forcePsdN2PerHz, {positive:true});
  finite('receiverGainSquared', receiverGainSquared, {positive:true});
  const h = modeResponse({frequencyHz,naturalFrequencyHz,gammaPerS,massKg});
  const displacementPsdM2PerHz = represented('displacementPsdM2PerHz', h.displacementPsdPerForcePsd * forcePsdN2PerHz, {positive:true});
  const outputPsdM2PerHz = represented('outputPsdM2PerHz', displacementPsdM2PerHz * receiverGainSquared, {positive:true});
  const velocityPsdM2PerS2PerHz = h.omegaPerS === 0 ? 0 : represented('velocityPsdM2PerS2PerHz',
    h.velocityPsdPerForcePsd * forcePsdN2PerHz, {positive:true});
  return {frequencyHz,forcePsdN2PerHz,receiverGainSquared,displacementPsdM2PerHz,outputPsdM2PerHz,velocityPsdM2PerS2PerHz};
}

/** Exact compact-band ambiguity construction; transfers remain different. */
export function sameOutputForcing({frequencyHz, first, second, firstForcePsdN2PerHz = 1}) {
  finite('firstForcePsdN2PerHz', firstForcePsdN2PerHz, {positive:true});
  const h1 = modeResponse({...first,frequencyHz}), h2 = modeResponse({...second,frequencyHz});
  const magnitudeRatio = represented('transfer magnitude ratio', h1.magnitudeMPerN / h2.magnitudeMPerN, {positive:true});
  const secondForcePsdN2PerHz = represented('secondForcePsdN2PerHz',
    (firstForcePsdN2PerHz * magnitudeRatio) * magnitudeRatio, {positive:true});
  const firstOutputPsdM2PerHz = represented('firstOutputPsdM2PerHz',
    h1.displacementPsdPerForcePsd * firstForcePsdN2PerHz, {positive:true});
  const secondOutputPsdM2PerHz = represented('secondOutputPsdM2PerHz',
    h2.displacementPsdPerForcePsd * secondForcePsdN2PerHz, {positive:true});
  return {frequencyHz,firstForcePsdN2PerHz,secondForcePsdN2PerHz,firstOutputPsdM2PerHz,secondOutputPsdM2PerHz,
    relativeResidual:Math.abs(firstOutputPsdM2PerHz-secondOutputPsdM2PerHz)/Math.max(firstOutputPsdM2PerHz,secondOutputPsdM2PerHz)};
}

/**
 * A common coherent force gives the complex sum. The comparison assumes separate
 * uncorrelated forces of equal PSD, one per mode. amplitude is a signed,
 * dimensionless readout weight; phaseRad is a declared phase offset.
 */
export function coherentModesPsd({frequencyHz,modes,forcePsdN2PerHz = 1}) {
  finite('forcePsdN2PerHz', forcePsdN2PerHz, {positive:true});
  if (!Array.isArray(modes) || modes.length < 1 || modes.length > 64) throw new RangeError('modes must contain 1 through 64 modes.');
  let real = 0, imag = 0, uncorrelatedSquared = 0;
  const components = modes.map(mode => {
    const amplitude = mode.amplitude ?? 1, phaseRad = mode.phaseRad ?? 0;
    finite('amplitude',amplitude);finite('phaseRad',phaseRad);
    const h = modeResponse({...mode,frequencyHz}), c = Math.cos(phaseRad), s = Math.sin(phaseRad);
    const componentRealMPerN = represented('componentRealMPerN',amplitude*(c*h.realMPerN-s*h.imagMPerN));
    const componentImagMPerN = represented('componentImagMPerN',amplitude*(s*h.realMPerN+c*h.imagMPerN));
    const magnitude = Math.hypot(componentRealMPerN,componentImagMPerN);
    if (amplitude !== 0 && magnitude === 0) throw new RangeError('Nonzero modal amplitude underflow.');
    const power = represented('individual squared magnitude',magnitude*magnitude,{positive:amplitude!==0});
    real += componentRealMPerN;imag += componentImagMPerN;uncorrelatedSquared += power;
    return {componentRealMPerN,componentImagMPerN};
  });
  represented('coherent real sum',real);represented('coherent imaginary sum',imag);
  represented('uncorrelated squared sum',uncorrelatedSquared);
  const coherentMagnitude = Math.hypot(real,imag);
  const coherentPsdM2PerHz = represented('coherentPsdM2PerHz',
    (coherentMagnitude*forcePsdN2PerHz)*coherentMagnitude,{positive:coherentMagnitude!==0});
  const uncorrelatedPsdM2PerHz = represented('uncorrelatedPsdM2PerHz',
    uncorrelatedSquared*forcePsdN2PerHz,{positive:uncorrelatedSquared!==0});
  return {frequencyHz,forcePsdN2PerHz,components,coherentRealMPerN:real,coherentImagMPerN:imag,
    coherentPsdM2PerHz,uncorrelatedPsdM2PerHz,crossTermM2PerHz:coherentPsdM2PerHz-uncorrelatedPsdM2PerHz,
    scope:'Coherent common-source and uncorrelated equal-source-PSD assumptions are different models; neither implies extra energy.'};
}

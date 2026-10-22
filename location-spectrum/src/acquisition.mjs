/**
 * Finite, synthetic measurement-chain demonstrations. Not a material solver.
 * A damped oscillation frequency, a natural frequency and the largest FFT bin
 * are different quantities. No physical data are generated or inferred here.
 */
const TAU = 2 * Math.PI;
const MAX_SAMPLES = 65536;
const DEFAULT_MODE = Object.freeze({frequencyHz:23317.724126, amplitude:1, decayRatePerSecond:50, phaseRad:0});
export const DEFAULT_ACQUISITION = Object.freeze({
  sampleRateHz:250000, sampleCount:8192, window:'hann', noiseRms:.001,
  seed:42, modes:Object.freeze([DEFAULT_MODE]),
});

export const ACQUISITION_PRESETS = Object.freeze([
  {id:'clean', title:'A finite ring-down', description:'One chosen mode, finite recording, and small sampled noise. The largest FFT bin is an estimator, not a fitted mechanical pole.', params:{...DEFAULT_ACQUISITION}},
  {id:'alias', title:'Ultrasound appears at low frequency', description:'An unfiltered 44.1 kS/s sampler folds a 46.84 kHz oscillation into the audio band. Sampling rate alone is not sensor bandwidth.', params:{...DEFAULT_ACQUISITION,sampleRateHz:44100,modes:[{frequencyHz:46836.628369,amplitude:1,decayRatePerSecond:50,phaseRad:0}]}},
  {id:'short-record', title:'Two modes, too short a record', description:'Two input frequencies are 50 Hz apart, while this record has approximately 244 Hz FFT spacing. The plotted maximum does not identify both modes.', params:{...DEFAULT_ACQUISITION,sampleCount:1024,noiseRms:0,modes:[{...DEFAULT_MODE,decayRatePerSecond:30},{frequencyHz:23367.724126,amplitude:.85,decayRatePerSecond:30,phaseRad:.3}]}},
  {id:'long-record', title:'Same modes, a longer record', description:'The same two-mode signal with a longer observation. Greater FFT density can help; damping, noise, and model validity still limit identification.', params:{...DEFAULT_ACQUISITION,sampleCount:32768,noiseRms:0,modes:[{...DEFAULT_MODE,decayRatePerSecond:30},{frequencyHz:23367.724126,amplitude:.85,decayRatePerSecond:30,phaseRad:.3}]}},
  {id:'noisy', title:'A weak mode in sampled noise', description:'The peak search can select noise. This white sampled noise is illustrative and does not represent a calibrated instrument noise spectrum.', params:{...DEFAULT_ACQUISITION,noiseRms:.05,modes:[{...DEFAULT_MODE,amplitude:.03,decayRatePerSecond:150}]}},
  {id:'hidden-mode', title:'A mode invisible to this channel', description:'A mode assigned zero sensor amplitude leaves no trace here. A second channel or excitation geometry is needed to investigate missing modes.', params:{...DEFAULT_ACQUISITION,noiseRms:0,modes:[{...DEFAULT_MODE,amplitude:0},{frequencyHz:24000,amplitude:1,decayRatePerSecond:50,phaseRad:0}]}},
]);

function finiteRange(name,value,low,high) {
  if (!Number.isFinite(value) || value<low || value>high) throw new RangeError(`${name} must be finite and between ${low} and ${high}`);
  return value;
}
function object(name,value) {
  if (!value || typeof value!=='object' || Array.isArray(value)) throw new TypeError(`${name} must be an object`);
}

/** Validate and copy all inputs. Bounded modes and FFT size keep UI work finite. */
export function normalizeAcquisition(params={}) {
  object('parameters',params);
  const p={...DEFAULT_ACQUISITION,...params};
  finiteRange('sampleRateHz',p.sampleRateHz,1000,2e6);
  if (!Number.isInteger(p.sampleCount) || p.sampleCount<256 || p.sampleCount>MAX_SAMPLES || (p.sampleCount&(p.sampleCount-1))!==0) {
    throw new RangeError('sampleCount must be a power of two between 256 and 65536');
  }
  if (!['hann','rectangular'].includes(p.window)) throw new RangeError('window must be hann or rectangular');
  finiteRange('noiseRms',p.noiseRms,0,1000);
  if (!Number.isInteger(p.seed) || p.seed<0 || p.seed>4294967295) throw new RangeError('seed must be a uint32 integer');
  if (!Array.isArray(p.modes) || p.modes.length<1 || p.modes.length>8) throw new RangeError('modes must contain 1 to 8 entries');
  p.modes=p.modes.map((entry,i)=>{
    object(`mode ${i+1}`,entry);
    const m={...DEFAULT_MODE,...entry};
    finiteRange(`mode ${i+1} frequencyHz`,m.frequencyHz,0,5e6);
    finiteRange(`mode ${i+1} amplitude`,m.amplitude,0,1000);
    finiteRange(`mode ${i+1} decayRatePerSecond`,m.decayRatePerSecond,0,1e6);
    finiteRange(`mode ${i+1} phaseRad`,m.phaseRad,-1e9,1e9);
    return {frequencyHz:m.frequencyHz,amplitude:m.amplitude,decayRatePerSecond:m.decayRatePerSecond,phaseRad:m.phaseRad};
  });
  return {sampleRateHz:p.sampleRateHz,sampleCount:p.sampleCount,window:p.window,noiseRms:p.noiseRms,seed:p.seed,modes:p.modes};
}

/** Nonnegative folded frequency of a real sampled sinusoid. */
export function aliasFrequency(frequencyHz,sampleRateHz) {
  finiteRange('frequencyHz',frequencyHz,0,5e6);
  finiteRange('sampleRateHz',sampleRateHz,1000,2e6);
  const r=frequencyHz % sampleRateHz;
  return r<=sampleRateHz/2?r:sampleRateHz-r;
}

// Radix-2 Cooley-Tukey FFT; input arrays are copied by the caller.
function fft(real,imag) {
  const n=real.length;
  for(let i=1,j=0;i<n;i++) {
    let bit=n>>1;
    for(;j&bit;bit>>=1) j^=bit;
    j^=bit;
    if(i<j){[real[i],real[j]]=[real[j],real[i]];[imag[i],imag[j]]=[imag[j],imag[i]];}
  }
  for(let length=2;length<=n;length*=2) {
    const angle=-TAU/length, stepRe=Math.cos(angle),stepIm=Math.sin(angle),half=length/2;
    for(let start=0;start<n;start+=length) {
      let wr=1,wi=0;
      for(let j=0;j<half;j++) {
        const a=start+j,b=a+half,tr=wr*real[b]-wi*imag[b],ti=wr*imag[b]+wi*real[b];
        real[b]=real[a]-tr;imag[b]=imag[a]-ti;real[a]+=tr;imag[a]+=ti;
        const next=wr*stepRe-wi*stepIm;wi=wr*stepIm+wi*stepRe;wr=next;
      }
    }
  }
}

function gaussianGenerator(seed) {
  let state=seed===0?0x6d2b79f5:seed,spare=null;
  const uniform=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return ((state>>>0)+.5)/4294967296;};
  return ()=>{
    if(spare!==null){const value=spare;spare=null;return value;}
    const radius=Math.sqrt(-2*Math.log(uniform())),angle=TAU*uniform();
    spare=radius*Math.sin(angle);return radius*Math.cos(angle);
  };
}

export function simulateAcquisition(params={}) {
  const p=normalizeAcquisition(params),n=p.sampleCount,fs=p.sampleRateHz;
  const timeSeconds=new Array(n),timeSeries=new Array(n),real=new Float64Array(n),imag=new Float64Array(n);
  const noise=gaussianGenerator(p.seed);let windowSum=0,windowSquares=0,noiseEnergy=0,signalEnergy=0;
  for(let i=0;i<n;i++) {
    const t=i/fs;let value=0;
    for(const m of p.modes) value+=m.amplitude*Math.exp(-m.decayRatePerSecond*t)*Math.cos(TAU*m.frequencyHz*t+(m.phaseRad%TAU));
    const disturbance=p.noiseRms===0?0:p.noiseRms*noise(),weight=p.window==='hann'?.5-.5*Math.cos(TAU*i/n):1;
    timeSeconds[i]=t;timeSeries[i]=value+disturbance;real[i]=weight*timeSeries[i];
    windowSum+=weight;windowSquares+=weight*weight;noiseEnergy+=disturbance*disturbance;signalEnergy+=value*value;
  }
  fft(real,imag);
  const frequencyHz=new Array(n/2+1),spectrumAmplitude=new Array(n/2+1);
  let dominantBinIndex=0,maximum=0;
  for(let k=0;k<=n/2;k++) {
    frequencyHz[k]=k*fs/n;
    const magnitude=Math.hypot(real[k],imag[k])/windowSum*(k===0||k===n/2?1:2);
    spectrumAmplitude[k]=magnitude;
    if(magnitude>maximum){maximum=magnitude;dominantBinIndex=k;}
  }
  const warnings=[
    'Synthetic sampled signal only; no physical measurement or entire-object frequency capture.',
    'No analog anti-alias filter or sensor transfer function is simulated. A real acquisition needs both characterized.',
    'The largest FFT bin is not a fitted mechanical pole. Bin spacing is not a frequency uncertainty or a detection limit.',
    'Amplitudes use coherent-gain normalization for a sinusoidal amplitude spectrum, not power spectral density. Damping and leakage can reduce or spread a peak.',
  ];
  if(p.modes.some(m=>m.frequencyHz>=fs/2)) warnings.push('At least one input frequency is at or beyond Nyquist; the real waveform is not uniquely recoverable from these samples. At Nyquist, phase can hide the signal.');
  if(p.modes.some(m=>m.amplitude===0)) warnings.push('At least one modeled mode has zero readout amplitude. Its absence in this channel does not establish absence from the object.');
  const active=p.modes.filter(m=>m.amplitude>0),widthBins=p.window==='hann'?2:1;
  if(p.window==='hann'&&active.some(m=>m.decayRatePerSecond*n/fs>=3)) {
    warnings.push('The Hann window down-weights the ring-down onset. For these rapidly decaying modes it can remove much of the signal; coherent-gain correction does not recover the initial amplitude. Compare a justified transient window or a time-domain fit.');
  }
  if(active.some((a,i)=>active.some((b,j)=>j>i&&Math.abs(aliasFrequency(a.frequencyHz,fs)-aliasFrequency(b.frequencyHz,fs))<widthBins*fs/n))) {
    warnings.push('Two active folded frequencies are closer than the selected window main-lobe scale. Peak separation is not guaranteed, and damping can broaden them further.');
  }
  if(active.some(m=>m.frequencyHz>0&&m.frequencyHz*n/fs<5)) warnings.push('Fewer than five cycles of at least one oscillation fit in the record; peak interpretation is especially fragile.');
  if(p.noiseRms>0) warnings.push('Noise is deterministic seeded Gaussian noise added after sampling. It omits colored noise, analog noise aliasing, drift, quantization and clipping.');
  return {
    parameters:p,timeSeconds,timeSeries,frequencyHz,spectrumAmplitude,
    durationSeconds:n/fs,lastSampleTimeSeconds:(n-1)/fs,binSpacingHz:fs/n,nyquistHz:fs/2,
    windowCoherentGain:windowSum/n,windowEquivalentNoiseBandwidthHz:fs*windowSquares/(windowSum*windowSum),
    dominantBinHz:maximum===0?null:frequencyHz[dominantBinIndex],dominantBinAmplitude:maximum,dominantBinIndex:maximum===0?null:dominantBinIndex,
    foldedModeHz:p.modes.map(m=>aliasFrequency(m.frequencyHz,fs)),
    signalRms:Math.sqrt(signalEnergy/n),realizedNoiseRms:Math.sqrt(noiseEnergy/n),
    amplitudeUnit:'arbitrary sensor units (synthetic)',warnings,
  };
}

/**
 * First-order covariance propagation for the difference B-A.
 * Inputs are standard uncertainties of estimates, not FFT bin sizes. The k*u
 * interval is a comparison convention, not a confidence interval without a
 * justified distribution/coverage model. Correlations must come from design.
 */
export function compareFrequencyUncertainty(params={}) {
  object('parameters',params);
  const p={frequencyAHz:23317.724126,frequencyBHz:23312.319525,
    fitStdAHz:.5,fitStdBHz:.5,fitCorrelation:0,
    temperatureStdAK:.1,temperatureStdBK:.1,temperatureCorrelation:0,temperatureSensitivityHzPerK:-5.404601,
    clockStdAPpm:1,clockStdBPpm:1,clockCorrelation:1,
    repeatabilityStdHz:0,coverageFactor:2,...params};
  for(const k of ['frequencyAHz','frequencyBHz']) finiteRange(k,p[k],0,5e6);
  for(const k of ['fitStdAHz','fitStdBHz','temperatureStdAK','temperatureStdBK','clockStdAPpm','clockStdBPpm','repeatabilityStdHz']) finiteRange(k,p[k],0,1e6);
  for(const k of ['fitCorrelation','temperatureCorrelation','clockCorrelation']) finiteRange(k,p[k],-1,1);
  finiteRange('temperatureSensitivityHzPerK',p.temperatureSensitivityHzPerK,-1e6,1e6);
  finiteRange('coverageFactor',p.coverageFactor,0,10);
  const pairedVariance=(a,b,r)=>Math.max(0,(a-b)*(a-b)+2*a*b*(1-r));
  const varianceContributions={
    fitHz2:pairedVariance(p.fitStdAHz,p.fitStdBHz,p.fitCorrelation),
    temperatureHz2:p.temperatureSensitivityHzPerK**2*pairedVariance(p.temperatureStdAK,p.temperatureStdBK,p.temperatureCorrelation),
    clockHz2:pairedVariance(p.frequencyAHz*p.clockStdAPpm*1e-6,p.frequencyBHz*p.clockStdBPpm*1e-6,p.clockCorrelation),
    repeatabilityHz2:p.repeatabilityStdHz**2,
  };
  const combinedStdHz=Math.sqrt(Object.values(varianceContributions).reduce((a,b)=>a+b,0));
  const differenceHz=p.frequencyBHz-p.frequencyAHz,comparisonThresholdHz=p.coverageFactor*combinedStdHz;
  return {parameters:p,differenceHz,varianceContributions,combinedStdHz,comparisonThresholdHz,
    intervalDeltaHz:[differenceHz-comparisonThresholdHz,differenceHz+comparisonThresholdHz],
    exceedsThreshold:Math.abs(differenceHz)>comparisonThresholdHz,
    note:'First-order uncertainty budget for B−A. k×u is a declared comparison threshold, not an automatically justified confidence level or experimental detection-power calculation. Independence between error categories is assumed; avoid double-counting repeatability already included in fit uncertainty.',
  };
}

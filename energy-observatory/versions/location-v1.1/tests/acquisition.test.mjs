import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateAcquisition,normalizeAcquisition,aliasFrequency,compareFrequencyUncertainty,ACQUISITION_PRESETS} from '../src/acquisition.mjs';

const base={sampleRateHz:8192,sampleCount:1024,window:'rectangular',noiseRms:0,seed:42};
const mode=(frequencyHz,amplitude=1,decayRatePerSecond=0,phaseRad=0)=>({frequencyHz,amplitude,decayRatePerSecond,phaseRad});
function near(actual,expected,tolerance=1e-10) { assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} not within ${tolerance} of ${expected}`); }

test('coherent one-sided spectrum preserves sinusoid amplitude, DC and Nyquist conventions',()=>{
  const s=simulateAcquisition({...base,modes:[mode(800,2.5),mode(0,3),mode(4096,2.2)]});
  near(s.spectrumAmplitude[100],2.5);near(s.spectrumAmplitude[0],3);near(s.spectrumAmplitude[512],2.2);
  near(s.binSpacingHz,8);near(s.durationSeconds,.125);near(s.lastSampleTimeSeconds,1023/8192);
  near(s.windowEquivalentNoiseBandwidthHz,8);assert.equal(s.dominantBinHz,0);
});

test('periodic Hann coherent gain and equivalent noise bandwidth are explicit',()=>{
  const s=simulateAcquisition({...base,window:'hann',modes:[mode(800,2.5)]});
  near(s.windowCoherentGain,.5);near(s.windowEquivalentNoiseBandwidthHz,12);near(s.spectrumAmplitude[100],2.5);
  // Coherent-gain correction is an amplitude convention, not a PSD normalization.
  near(s.spectrumAmplitude[99],1.25);near(s.spectrumAmplitude[101],1.25);
});

test('FFT agrees with direct DFT for a damped, phase-shifted mixture',()=>{
  const p={...base,window:'hann',modes:[mode(817.2,.7,32,.4),mode(1321,1.2,90,-1.2)]},s=simulateAcquisition(p),N=p.sampleCount;
  for(const k of [0,1,99,100,101,102,165,166,511,512]){
    let re=0,im=0,sumW=0;
    for(let n=0;n<N;n++){
      const w=.5-.5*Math.cos(2*Math.PI*n/N),theta=2*Math.PI*k*n/N;
      re+=s.timeSeries[n]*w*Math.cos(theta);im-=s.timeSeries[n]*w*Math.sin(theta);sumW+=w;
    }
    near(s.spectrumAmplitude[k],Math.hypot(re,im)/sumW*(k===0||k===N/2?1:2),3e-13);
  }
});

test('unfiltered sampling gives exactly indistinguishable alias pairs',()=>{
  const a=simulateAcquisition({...base,modes:[mode(9000,.9,8)]}),b=simulateAcquisition({...base,modes:[mode(808,.9,8)]});
  near(aliasFrequency(9000,8192),808);near(aliasFrequency(4600,8192),3592);near(aliasFrequency(8192,8192),0);
  assert.ok(a.timeSeries.every((x,i)=>Math.abs(x-b.timeSeries[i])<2e-12));
  assert.ok(a.warnings.some(x=>x.includes('Nyquist')));
});

test('longer record can distinguish the preset pair without redefining FFT spacing as uncertainty',()=>{
  const short=simulateAcquisition(ACQUISITION_PRESETS.find(x=>x.id==='short-record').params);
  const long=simulateAcquisition(ACQUISITION_PRESETS.find(x=>x.id==='long-record').params);
  assert.ok(long.binSpacingHz<short.binSpacingHz);
  const maxima=s=>s.frequencyHz.filter((f,i)=>f>23280&&f<23410&&i>0&&i<s.spectrumAmplitude.length-1&&s.spectrumAmplitude[i]>s.spectrumAmplitude[i-1]&&s.spectrumAmplitude[i]>s.spectrumAmplitude[i+1]);
  assert.ok(maxima(short).length<=1);
  assert.equal(maxima(long).length,2);
  assert.ok(long.warnings.some(x=>x.includes('not a frequency uncertainty')));
});

test('seeded noise is reproducible with finite realization variance, zero-readout mode is invisible',()=>{
  const p={...base,sampleCount:65536,noiseRms:.1,modes:[mode(0,0)]};
  const a=simulateAcquisition(p),b=simulateAcquisition(p),c=simulateAcquisition({...p,seed:43});
  assert.deepEqual(a.timeSeries,b.timeSeries);assert.notEqual(a.timeSeries[0],c.timeSeries[0]);
  near(a.realizedNoiseRms,.1,.002);
  const zero=simulateAcquisition({...base,modes:[mode(1900,0)]});
  assert.equal(zero.dominantBinHz,null);assert.equal(zero.dominantBinAmplitude,0);assert.ok(zero.timeSeries.every(x=>x===0));
});

test('Hann can hide an onset-only transient and emits the specific limitation',()=>{
  const p={...base,sampleRateHz:1000,modes:[mode(200,1,1e6)]};
  const rectangular=simulateAcquisition(p),hann=simulateAcquisition({...p,window:'hann'});
  assert.equal(hann.timeSeries[0],1);assert.equal(hann.dominantBinHz,null);assert.ok(rectangular.dominantBinAmplitude>0);
  assert.ok(hann.warnings.some(x=>x.includes('does not recover the initial amplitude')));
});

test('all six presets and maximum bounded mode/sample case remain finite',()=>{
  assert.equal(ACQUISITION_PRESETS.length,6);
  for(const preset of ACQUISITION_PRESETS){const s=simulateAcquisition(preset.params);assert.ok(s.spectrumAmplitude.every(Number.isFinite));assert.ok(s.timeSeries.every(Number.isFinite));}
  const stress=simulateAcquisition({sampleRateHz:2e6,sampleCount:65536,noiseRms:1000,modes:Array.from({length:8},(_,i)=>mode(5e6-i*1000,1000,i*1e5,i))});
  assert.equal(stress.frequencyHz.length,32769);assert.ok(stress.spectrumAmplitude.every(Number.isFinite));
});

test('invalid, nonfinite and resource-unbounded acquisition inputs are rejected',()=>{
  for(const p of [null,[],{sampleRateHz:NaN},{sampleRateHz:999},{sampleRateHz:2e6+1},{sampleCount:1000},{sampleCount:131072},{sampleCount:0},{window:'triangle'},{noiseRms:-1},{seed:-1},{seed:1.5},{modes:[]},{modes:Array(9).fill(mode(10))},{modes:[mode(Infinity)]},{modes:[mode(-1)]},{modes:[mode(1,-1)]},{modes:[mode(1,1,-1)]}])assert.throws(()=>normalizeAcquisition(p));
});

test('paired covariance separates a shared clock from independent clock errors',()=>{
  const p={frequencyAHz:1000,frequencyBHz:990,fitStdAHz:0,fitStdBHz:0,temperatureStdAK:0,temperatureStdBK:0,clockStdAPpm:10,clockStdBPpm:10,repeatabilityStdHz:0};
  const shared=compareFrequencyUncertainty({...p,clockCorrelation:1}),independent=compareFrequencyUncertainty({...p,clockCorrelation:0});
  near(shared.combinedStdHz,10*10e-6,1e-16);near(independent.combinedStdHz,Math.hypot(1000,990)*10e-6,1e-16);
  const nullShared=compareFrequencyUncertainty({...p,frequencyBHz:1000,clockCorrelation:1});near(nullShared.combinedStdHz,0);
});

test('temperature/fit covariance and threshold interval use declared standard uncertainties',()=>{
  const p={frequencyAHz:1000,frequencyBHz:1004,fitStdAHz:1,fitStdBHz:1,fitCorrelation:0,temperatureStdAK:.2,temperatureStdBK:.2,temperatureSensitivityHzPerK:5,temperatureCorrelation:1,clockStdAPpm:0,clockStdBPpm:0,repeatabilityStdHz:0,coverageFactor:2};
  const s=compareFrequencyUncertainty(p);near(s.combinedStdHz,Math.sqrt(2));near(s.varianceContributions.temperatureHz2,0);assert.equal(s.exceedsThreshold,true);
  near(s.intervalDeltaHz[0],4-2*Math.sqrt(2));near(s.intervalDeltaHz[1],4+2*Math.sqrt(2));
  for(const bad of [{fitCorrelation:1.01},{clockStdAPpm:-1},{frequencyAHz:NaN},{temperatureSensitivityHzPerK:Infinity},{coverageFactor:11}])assert.throws(()=>compareFrequencyUncertainty(bad));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {simulateAcquisition,compareFrequencyUncertainty,aliasFrequency} from '../src/acquisition.mjs';
const fixtureURL=new URL('../reference/acquisition-fixtures.json',import.meta.url);
const fixture=JSON.parse(readFileSync(fixtureURL,'utf8'));
let comparisons=0,maxAbsoluteAmplitudeError=0,maxAbsoluteSampleError=0;
function close(actual,expected,label,tolerance=1e-10){
 comparisons++;assert.ok(Number.isFinite(actual),`${label}: nonfinite actual ${actual}`);
 assert.ok(Math.abs(actual-expected)<=tolerance*Math.max(1,Math.abs(expected)),`${label}: ${actual} != ${expected}`);
}

test('independent NumPy DFT, sampled-channel and covariance fixtures',()=>{
 for(const c of fixture.cases){
  const a=simulateAcquisition(c.parameters),e=c.expected;
  for(let j=0;j<e.timeIndices.length;j++){
   const i=e.timeIndices[j];close(a.timeSeconds[i],e.timeSeconds[j],`${c.id} time ${i}`,1e-13);
   maxAbsoluteSampleError=Math.max(maxAbsoluteSampleError,Math.abs(a.timeSeries[i]-e.timeSeries[j]));
   close(a.timeSeries[i],e.timeSeries[j],`${c.id} sample ${i}`);
  }
  for(let j=0;j<e.spectrumIndices.length;j++){
   const i=e.spectrumIndices[j];close(a.frequencyHz[i],e.frequencyHz[j],`${c.id} frequency ${i}`,1e-13);
   maxAbsoluteAmplitudeError=Math.max(maxAbsoluteAmplitudeError,Math.abs(a.spectrumAmplitude[i]-e.spectrumAmplitude[j]));
   close(a.spectrumAmplitude[i],e.spectrumAmplitude[j],`${c.id} spectrum ${i}`);
  }
  for(const field of ['dominantBinAmplitude','durationSeconds','binSpacingHz','nyquistHz','windowCoherentGain']) close(a[field],e[field],`${c.id} ${field}`);
  comparisons++;if(e.dominantBinHz===null)assert.equal(a.dominantBinHz,null);else assert.ok(e.dominantCandidatesHz.includes(a.dominantBinHz),`${c.id} peak ${a.dominantBinHz} outside independent maximum/tied maxima`);
  e.foldedModeHz.forEach((v,i)=>close(a.foldedModeHz[i],v,`${c.id} fold ${i}`,1e-12));
 }
 for(const c of fixture.uncertaintyCases){
  const a=compareFrequencyUncertainty(c.parameters),e=c.expected;
  for(const field of ['differenceHz','combinedStdHz','comparisonThresholdHz'])close(a[field],e[field],`${c.id} ${field}`,1e-12);
  for(const key of ['fit','temperature','clock','repeatability'])close(a.varianceContributions[`${key}Hz2`],e.varianceContributions[key],`${c.id} ${key} variance`,1e-12);
  e.intervalDeltaHz.forEach((v,i)=>close(a.intervalDeltaHz[i],v,`${c.id} interval ${i}`,1e-12));
  comparisons++;assert.equal(a.exceedsThreshold,e.exceedsThreshold);
 }
 const sourceSHA256=createHash('sha256').update(readFileSync(new URL('../src/acquisition.mjs',import.meta.url))).digest('hex');
 const result={passed:true,sourceSHA256,fixtureSHA256:createHash('sha256').update(readFileSync(fixtureURL)).digest('hex'),independentSignalCases:fixture.cases.length,independentUncertaintyCases:fixture.uncertaintyCases.length,numericalComparisons:comparisons,maxAbsoluteAmplitudeError,maxAbsoluteSampleError,limits:['Synthetic samples only; no physical measurements','Compares independent NumPy FFT and first-order covariance propagation','Near-tied FFT maxima accepted within declared arithmetic tolerance; no unique-frequency claim','Phase/modality, analog transfer, anti-alias filtering and calibration remain experimental obligations']};
 writeFileSync(new URL('../research/acquisition-review-results.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
});

test('explicit rectangular inverse has rank one and two independent kernel witnesses',()=>{
 const {jacobian,rank,nullity,kernelColumns}=fixture.identifiability;
 assert.equal(rank,1);assert.equal(nullity,2);assert.equal(jacobian[0].length,3);
 for(let k=0;k<2;k++)assert.equal(jacobian[0].reduce((sum,a,j)=>sum+a*kernelColumns[j][k],0),0);
 // Two distinct finite transformations preserve the same radial frequency law.
 const f=(E,rho,R)=>Math.sqrt(E/rho)/R;
 assert.equal(f(123.5e9,8960,.04445),f(2*123.5e9,2*8960,.04445));
 assert.equal(f(123.5e9,8960,.04445),f(4*123.5e9,8960,2*.04445));
});

test('real sampled aliases are not unique source frequencies',()=>{
 assert.ok(Math.abs(aliasFrequency(46836.628369,48000)-1163.371631)<1e-9);
 const mode={frequencyHz:1000,amplitude:1,decayRatePerSecond:0,phaseRad:0};
 const base={sampleRateHz:8192,sampleCount:1024,window:'rectangular',noiseRms:0,modes:[mode]};
 const a=simulateAcquisition(base),b=simulateAcquisition({...base,modes:[{...mode,frequencyHz:7192}]});
 a.timeSeries.forEach((v,i)=>assert.ok(Math.abs(v-b.timeSeries[i])<2e-12));
});

// Exact finite-group benchmark. Its uniform-offset null is stipulated, not inferred.
export const GROUP_SIZE = 32;
export const TIE_TOLERANCE = 1e-12; // Absolute in the bounded [0,1] score domain.
const mod=(a,n)=>((a%n)+n)%n;
function normalizedCentered(values,name) {
  if(!Array.isArray(values)||values.length!==GROUP_SIZE)throw new RangeError(`${name} must have exactly 32 entries`);
  if(values.some(v=>typeof v!=='number'||!Number.isFinite(v)))throw new RangeError(`${name} must contain only finite numbers`);
  const scale=Math.max(...values.map(Math.abs));
  if(scale===0)throw new RangeError(`${name} must be nonconstant`);
  const scaled=values.map(v=>v/scale),mean=scaled.reduce((a,b)=>a+b,0)/GROUP_SIZE;
  const centered=scaled.map(v=>v-mean),norm=Math.hypot(...centered);
  if(!(norm>0))throw new RangeError(`${name} must be nonconstant at supported numeric resolution`);
  return centered.map(v=>v/norm);
}
function validateLags(lags) {
  if(!Array.isArray(lags)||lags.length===0||lags.some(v=>!Number.isSafeInteger(v)))throw new RangeError('lags must be a nonempty array of safe integers');
  const reduced=lags.map(v=>mod(v,GROUP_SIZE));
  if(new Set(reduced).size!==reduced.length)throw new RangeError('lags must have distinct residues modulo 32');
  return reduced;
}
function exceedanceCount(distribution,observed) {
  return distribution.filter(v=>v+TIE_TOLERANCE>=observed).length;
}
export function evaluate({x,y,lags,alpha=0.05}) {
  if(typeof alpha!=='number'||!Number.isFinite(alpha)||alpha<=0||alpha>=1)throw new RangeError('alpha must be finite and strictly between 0 and 1');
  const xn=normalizedCentered(x,'x'),yn=normalizedCentered(y,'y'),reduced=validateLags(lags);
  const fixedScores=Array.from({length:GROUP_SIZE},(_,offset)=>Math.min(1,Math.abs(xn.reduce((sum,v,i)=>sum+v*yn[(i+offset)%GROUP_SIZE],0))));
  const maximumScores=fixedScores.map((_,offset)=>Math.max(...reduced.map(lag=>fixedScores[(offset+lag)%GROUP_SIZE])));
  const fixedCounts=fixedScores.map(v=>exceedanceCount(fixedScores,v));
  const maximumCounts=maximumScores.map(v=>exceedanceCount(maximumScores,v));
  const offsets=fixedScores.map((score,offset)=>{
    const selectedMinimumCount=Math.min(...reduced.map(lag=>fixedCounts[(offset+lag)%GROUP_SIZE]));
    return {offset,fixedScore:score,maximumScore:maximumScores[offset],fixedCount:fixedCounts[offset],maximumCount:maximumCounts[offset],
      fixedP:fixedCounts[offset]/GROUP_SIZE,maximumP:maximumCounts[offset]/GROUP_SIZE,
      invalidSelectedMinimumCount:selectedMinimumCount,invalidSelectedMinimumP:selectedMinimumCount/GROUP_SIZE};
  });
  const rejection=(key)=>{const count=offsets.filter(o=>o[key]<=alpha).length;return {count,total:GROUP_SIZE,fraction:count/GROUP_SIZE}};
  return {groupSize:GROUP_SIZE,lags:[...lags],lagResidues:reduced,alpha,tieTolerance:TIE_TOLERANCE,
    null:'Conditional on both fixed shapes, relative offset is uniform over all 32 cyclic offsets; identity included',
    pValue:'Exact full-group conservative upper-tail count / 32; no Monte Carlo plus-one adjustment',
    statisticConvention:'abs correlation of x[i] and y[(i+offset+lag) mod 32]; indices are synthetic phase, not timestamps',
    offsets,rejections:{fixed:rejection('fixedP'),lockedMaximum:rejection('maximumP'),invalidSelectedMinimum:rejection('invalidSelectedMinimumP')},
    globalNullLevelBound:Math.floor(GROUP_SIZE*alpha)/GROUP_SIZE,
    interpretation:'Global uniform-offset null only, not strong FWER over partial nulls, an empirical time-series null or ET attribution'};
}

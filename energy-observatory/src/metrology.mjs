/** Energy-closure planning tools. Inputs are user scenarios, not measured observations.
 * R > 0 means apparent excess output. No function establishes boundary completeness.
 */
const finite=(name,x)=>{if(!Number.isFinite(x))throw new RangeError(`${name} must be finite`);return x;};
const nonnegative=(name,x)=>{finite(name,x);if(x<0)throw new RangeError(`${name} must be nonnegative`);return x;};
export function energyClosure({sourceJ=1,environmentJ=0,loadJ=.8,lossJ=.2,initialStorageJ=0,finalStorageJ=0,standardUncertaintyJ=.01,coverageFactor=2}={}) {
  for(const [name,x] of Object.entries({sourceJ,environmentJ,loadJ}))finite(name,x);
  for(const [name,x] of Object.entries({lossJ,initialStorageJ,finalStorageJ,standardUncertaintyJ}))nonnegative(name,x);
  finite('coverageFactor',coverageFactor);if(coverageFactor<=0)throw new RangeError('coverageFactor must be positive');
  const storageChangeJ=finalStorageJ-initialStorageJ,totalInputJ=sourceJ+environmentJ;
  const accountedOutputJ=loadJ+lossJ+storageChangeJ,residualJ=accountedOutputJ-totalInputJ;
  const expandedUncertaintyJ=coverageFactor*standardUncertaintyJ;
  const intervalJ=[residualJ-expandedUncertaintyJ,residualJ+expandedUncertaintyJ];
  for(const x of [storageChangeJ,totalInputJ,accountedOutputJ,residualJ,expandedUncertaintyJ,...intervalJ])finite('calculated energy',x);
  let status,interpretation;
  if(standardUncertaintyJ===0){status='uncertainty-not-established';interpretation='Zero supplied uncertainty does not establish exact measurement. This is arithmetic for the stated ledger only.';}
  else if(intervalJ[0]>0){status='positive-residual';interpretation='A positive residual lies outside the chosen interval. Investigate omitted inputs, storage and calibration; this does not establish energy creation.';}
  else if(intervalJ[1]<0){status='negative-residual';interpretation='A negative residual lies outside the chosen interval. The ledger or its measurement model needs investigation; a cause is not identified.';}
  else{status='not-resolved';interpretation='Zero is inside the chosen interval. No residual is resolved at this supplied uncertainty; boundary completeness and bounded equivalence are not established.';}
  return {residualJ,storageChangeJ,totalInputJ,accountedOutputJ,standardUncertaintyJ,coverageFactor,expandedUncertaintyJ,intervalJ,status,interpretation,
    uncertaintyScope:'User-supplied combined standard uncertainty; not calculated from independent channels. Coverage factor is not automatically a 95% guarantee.',
    boundaryScope:'Signed net source, environmental and load transfers; nonnegative modeled dissipation and storage. Avoid overlapping ports and double-counted heat.'};
}
export function phasePower({voltageRmsV=1,currentRmsA=1,phaseDeg=85,frequencyHz=1000,delayUs=1}={}) {
  nonnegative('voltageRmsV',voltageRmsV);nonnegative('currentRmsA',currentRmsA);
  finite('phaseDeg',phaseDeg);finite('frequencyHz',frequencyHz);finite('delayUs',delayUs);
  if(frequencyHz<=0)throw new RangeError('frequencyHz must be positive');
  const phi=phaseDeg*Math.PI/180,delayPhaseRad=2*Math.PI*frequencyHz*delayUs*1e-6;
  finite('phase in radians',phi);finite('delay phase',delayPhaseRad);
  const apparentVA=voltageRmsV*currentRmsA,truePowerW=apparentVA*Math.cos(phi);
  const measuredPowerW=apparentVA*Math.cos(phi+delayPhaseRad),biasW=measuredPowerW-truePowerW;
  const reactiveVar=apparentVA*Math.sin(phi),phaseSensitivityWPerRad=-apparentVA*Math.sin(phi);
  for(const x of [apparentVA,truePowerW,measuredPowerW,biasW,reactiveVar,phaseSensitivityWPerRad])finite('calculated power',x);
  return {apparentVA,truePowerW,measuredPowerW,biasW,reactiveVar,delayPhaseRad,delayPhaseDeg:delayPhaseRad*180/Math.PI,phaseSensitivityWPerRad,
    relativeBias:Math.abs(truePowerW)>1e-12*apparentVA?biasW/truePowerW:null,
    convention:'Measured current is sqrt(2)*I*cos(omega*t - phi - omega*delay). Positive delay increases the measured current lag.',
    scope:'Sinusoidal, steady-state, RMS-amplitude example. Actual arbitrary-waveform work requires calibrated synchronous signed v(t)i(t) integration.'};
}
/** Covariance order: load, loss, final storage, initial storage, source, environment. */
export function closureUncertainty({covarianceJ2}={}) {
  if(!Array.isArray(covarianceJ2)||covarianceJ2.length!==6||covarianceJ2.some(r=>!Array.isArray(r)||r.length!==6))throw new RangeError('covarianceJ2 must be a 6 by 6 matrix');
  const raw=covarianceJ2.map(r=>r.map(x=>finite('covariance entry',x)));
  const scale=Math.max(...raw.flat().map(Math.abs));
  if(scale===0)return {varianceJ2:0,standardUncertaintyJ:0,minimumNormalizedEigenvalue:0,validationTolerance:1e-12,scope:'Supplied covariance only; zero covariance does not establish exact hardware measurement.'};
  const a=raw.map((r,i)=>r.map((x,j)=>{if(Math.abs(x-raw[j][i])>1e-12*scale)throw new RangeError('covarianceJ2 must be symmetric');return .5*(x+raw[j][i])/scale;}));
  // Symmetric Jacobi diagonalization; unlike checking pairwise correlations, this checks the complete matrix.
  for(let step=0;step<300;step++){
    let p=0,q=1,largest=0;for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)if(Math.abs(a[i][j])>largest){largest=Math.abs(a[i][j]);p=i;q=j;}
    if(largest<1e-15)break;
    const angle=.5*Math.atan2(2*a[p][q],a[q][q]-a[p][p]),c=Math.cos(angle),s=Math.sin(angle);
    const app=a[p][p],aqq=a[q][q],apq=a[p][q];
    a[p][p]=c*c*app-2*s*c*apq+s*s*aqq;a[q][q]=s*s*app+2*s*c*apq+c*c*aqq;a[p][q]=a[q][p]=0;
    for(let k=0;k<6;k++)if(k!==p&&k!==q){const akp=a[k][p],akq=a[k][q];a[k][p]=a[p][k]=c*akp-s*akq;a[k][q]=a[q][k]=s*akp+c*akq;}
  }
  const minimumNormalizedEigenvalue=Math.min(...a.map((r,i)=>r[i]));
  if(minimumNormalizedEigenvalue < -1e-12)throw new RangeError('covarianceJ2 must be positive semidefinite');
  const c=[1,1,1,-1,-1,-1];let varianceJ2=0;
  for(let i=0;i<6;i++)for(let j=0;j<6;j++)varianceJ2+=c[i]*raw[i][j]*c[j];
  if(varianceJ2<0&&Math.abs(varianceJ2)<=36e-12*scale)varianceJ2=0;
  nonnegative('propagated variance',varianceJ2);
  return {varianceJ2,standardUncertaintyJ:Math.sqrt(varianceJ2),minimumNormalizedEigenvalue,validationTolerance:1e-12,
    scope:'Exact signed linear-ledger propagation for the supplied valid covariance. The covariance itself needs calibration and provenance.'};
}

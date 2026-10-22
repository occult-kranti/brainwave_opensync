/** Bounded, dimensionless design diagnostics. No measurement or localization.
 * The sine basis is an illustrative finite model, not elastic-sphere modes.
 */
import {simulateComparison} from './models.mjs';

const STATE_DIMENSION=6;
const DEFAULT_TOLERANCE=1e-10;
const finiteScope='Known dimensionless three-mode/six-state linear sine-basis model only. These are structural algebraic diagnostics, not a complete physical spectrum or a location estimator.';
const noisyLimit='Full structural rank does not establish useful finite-time noisy estimation. No sensor calibration, noise covariance, Fisher information, finite-time Gramian, damping uncertainty, or empirical conditioning is evaluated.';

function toleranceValue(value){
 if(!Number.isFinite(value)||value<1e-14||value>1e-4)throw new RangeError('tolerance must be finite and between 1e-14 and 1e-4');
 return value;
}
function transpose(a){return a[0].map((_,j)=>a.map(row=>row[j]));}
function multiply(a,b){return a.map(row=>b[0].map((_,j)=>row.reduce((sum,value,k)=>sum+value*b[k][j],0)));}
function identity(n){return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));}
function maximumResidual(matrix,kernel){
 let maximum=0;
 for(const direction of kernel)for(const row of matrix)maximum=Math.max(maximum,Math.abs(row.reduce((sum,x,j)=>sum+x*direction[j],0)));
 return maximum;
}

/** Rank-revealing elimination of a small declared matrix. Kernels are mapped
 * back to the original coordinates; normalization does not add information.
 */
function rankKernel(matrix,tolerance){
 const rows=matrix.length,columns=matrix[0].length;
 const scales=Array.from({length:columns},(_,j)=>Math.hypot(...matrix.map(row=>row[j])));
 const a=matrix.map(row=>row.map((x,j)=>scales[j]===0?0:x/scales[j]));
 const pivots=[];let pivotRow=0;
 for(let col=0;col<columns&&pivotRow<rows;col++){
  let selected=pivotRow;
  for(let i=pivotRow+1;i<rows;i++)if(Math.abs(a[i][col])>Math.abs(a[selected][col]))selected=i;
  if(Math.abs(a[selected][col])<=tolerance)continue;
  [a[pivotRow],a[selected]]=[a[selected],a[pivotRow]];
  const pivot=a[pivotRow][col];a[pivotRow]=a[pivotRow].map(x=>x/pivot);
  for(let i=0;i<rows;i++)if(i!==pivotRow){const factor=a[i][col];if(factor!==0)a[i]=a[i].map((x,j)=>x-factor*a[pivotRow][j]);}
  pivots.push(col);pivotRow++;
 }
 const free=Array.from({length:columns},(_,j)=>j).filter(j=>!pivots.includes(j));
 const kernel=free.map(col=>{
  const scaled=Array(columns).fill(0);scaled[col]=1;
  for(let i=0;i<pivots.length;i++)scaled[pivots[i]]=-a[i][col];
  const original=scaled.map((x,j)=>scales[j]===0?x:x/scales[j]);
  const norm=Math.max(...original.map(Math.abs));
  return original.map(x=>x/norm);
 });
 return {rank:pivots.length,nullity:columns-pivots.length,kernel,
  tolerance,rankMethod:'Column-L2-scaled Gauss-Jordan elimination with row pivoting',
  toleranceMeaning:'Absolute pivot cutoff after column normalization; a numerical convention, not an experimental detection threshold.',
  scaling:{method:'Divide each nonzero column by its Euclidean norm',columnNorms:scales,zeroColumns:scales.flatMap((s,j)=>s===0?[j]:[]),physicalNoiseWeighting:false},
  maxKernelResidual:maximumResidual(matrix,kernel)};
}

function positions(value,name){
 if(!Array.isArray(value)||value.length<1||value.length>4)throw new RangeError(`${name} needs 1–4 normalized positions`);
 for(const p of value)if(!Number.isFinite(p)||p<0||p>1)throw new RangeError(`${name} positions must be finite and between 0 and 1`);
 return [...value];
}
function participation(p){
 return [1,2,3].map(j=>{
  const canonicalNode=p===0||p===1||(j===2&&p===.5)||(j===3&&(p===1/3||p===2/3));
  return canonicalNode?0:Math.sin(j*Math.PI*p);
 });
}

export function finiteModalDiagnostics({sensorPositions=[.5],drivePositions=[.5],tolerance=DEFAULT_TOLERANCE}={}){
 tolerance=toleranceValue(tolerance);
 const sensors=positions(sensorPositions,'sensorPositions'),drives=positions(drivePositions,'drivePositions');
 const sensorParticipation=sensors.map(participation),driveParticipation=drives.map(participation);
 // q'' + diag(1,4,9) q = Bq*u in dimensionless time; z=(q,q').
 const generator=Array.from({length:STATE_DIMENSION},()=>Array(STATE_DIMENSION).fill(0));
 for(let j=0;j<3;j++){generator[j][j+3]=1;generator[j+3][j]=-((j+1)**2);}
 const b=Array.from({length:STATE_DIMENSION},(_,i)=>drives.map((_,j)=>i<3?0:driveParticipation[j][i-3]));
 const c=sensorParticipation.map(row=>[...row,0,0,0]);
 const o=[],k=Array.from({length:STATE_DIMENSION},()=>[]);let power=identity(STATE_DIMENSION);
 for(let n=0;n<STATE_DIMENSION;n++){
  o.push(...multiply(c,power));
  const block=multiply(power,b);for(let i=0;i<STATE_DIMENSION;i++)k[i].push(...block[i]);
  power=multiply(power,generator);
 }
 const observable=rankKernel(o,tolerance),reachable=rankKernel(transpose(k),tolerance);
 return {schema:'copper-finite-modal-design/1',status:'synthetic finite-model structural diagnostic',
  stateDimension:STATE_DIMENSION,modeCount:3,dimensionless:true,
  stateOrder:['q1','q2','q3','q1_derivative','q2_derivative','q3_derivative'],
  normalizedAngularFrequencies:[1,2,3],generator,sensorPositions:sensors,drivePositions:drives,
  sensorParticipation,driveParticipation,
  observability:{...observable,matrixShape:[o.length,STATE_DIMENSION],stateNullity:observable.nullity,
   kernelMeaning:'Initial state directions invisible in the ideal complete time readout.'},
  controllability:{...reachable,matrixShape:[STATE_DIMENSION,k[0].length],stateNullity:reachable.nullity,
   analyzedMatrix:'transpose of controllability matrix',
   kernelMeaning:'State directions orthogonal to the span reached by the declared independent drive channels; not free input-history coefficients.'},
  finiteModelScope:finiteScope,noisyConditioningLimit:noisyLimit,
  caveats:['The sine functions are an illustrative one-dimensional basis, not Lamb-sphere eigenfunctions.',
   'Drive channels are assumed independently commandable. Counting duplicate or perfectly linked drives does not create independent excitation.',
   'The diagnostic uses temporal observability, not just instantaneous sensor-matrix rank. A generic single sensor can observe distinct known modes over time.',
   'A new sensor cannot repair an excitation kernel. An observable but unexcited mode need not appear in an actual driven response.']};
}

export function nuisanceDesignDiagnostics({design='locked-temperature',tolerance=DEFAULT_TOLERANCE}={}){
 tolerance=toleranceValue(tolerance);
 if(!['locked-temperature','independent-temperature'].includes(design))throw new RangeError('Unknown nuisance design');
 const location=[0,1,1,0,1,0,0,1],time=location.map((_,i)=>i-3.5);
 const temperature=location.map((x,i)=>.2*x+(design==='independent-temperature'?[-.1,.1,-.1,.1][i%4]:0));
 const matrix=location.map((x,i)=>[1,time[i],x,temperature[i]]),result=rankKernel(matrix,tolerance);
 const targetIndex=2,targetKernelComponentMax=Math.max(0,...result.kernel.map(v=>Math.abs(v[targetIndex])));
 return {schema:'copper-nuisance-design/1',status:'synthetic finite linear design diagnostic',design,
  columns:['intercept','linear_drift','location_beta','temperature_slope'],
  rowModel:'frequency = intercept + linear_drift*time + location_beta*B_indicator + temperature_slope*temperature',
  coordinateUnits:['1','dimensionless centered acquisition index','B indicator (0 or 1)','temperature departure divided by 1 kelvin'],
  matrix,...result,targetIndex,targetKernelComponentMax,
  locationTargetEstimable:targetKernelComponentMax<=10*tolerance,
  targetEstimabilityMeaning:'The location coefficient must be constant along every kernel direction in this declared linear family. Full rank is sufficient here, not proof of causal attribution.',
  kernelMeaning:'Coefficient changes in the original declared units that leave every planned fitted value unchanged; each direction is normalized to maximum absolute entry 1.',
  finiteModelScope:'Eight illustrative ABBA/BAAB acquisitions and four declared coefficients only; independent thermal-control variation adds information within this family.',
  noisyConditioningLimit:noisyLimit,
  caveats:['More repeats of temperature locked to position do not separate location from temperature.',
   'Independent variation restores algebraic estimability in this chosen family, not protection against omitted nonlinear drift, contact, anisotropy, or calibration effects.',
   'No randomization, statistical power, confidence interval, physical thermal coefficient, or measured effect is inferred from these design rows.']};
}

/** An exact global ambiguity in the retained Location forward model. */
export function globalAliasDiagnostics(){
 const parameters={positionA:.25,positionB:.75,tempDeltaK:0,coupling:.08,receiver:'fixed'};
 const result=simulateComparison(parameters);
 const maxPoleDifferenceHz=Math.max(...result.coupledHzA.map((f,i)=>Math.abs(f-result.coupledHzB[i])));
 const maxResponseDifference=Math.max(...result.responseA.map((v,i)=>Math.abs(v-result.responseB[i])));
 return {schema:'copper-forward-global-alias/1',status:'calculated forward-model ambiguity; no measurements',
  source:'retained Location simulateComparison in ./models.mjs',parameters,
  positions:[parameters.positionA,parameters.positionB],maxPoleDifferenceHz,maxResponseDifference,
  responseUnit:result.responseUnit,frequencySamples:result.frequencyHz.length,
  coupledHzA:result.coupledHzA,coupledHzB:result.coupledHzB,projectionA:result.projectionA,projectionB:result.projectionB,
  ambiguityEstablished:maxPoleDifferenceHz===0&&maxResponseDifference===0,
  reason:'Both sin(pi*p) and the fixed receiver projection are invariant under p → 1−p. The forward matrices and complete modeled response coincide, so denser sampling cannot select one location.',
  scope:'This exact alias is a property of the chosen forward model; it is not an experiment or a universal statement about physical locations.',
  inference:'Return an ambiguity class under these assumptions; do not report a unique location.'};
}

/**
 * Electrical-only identification ambiguity in a four-state reciprocal RLC–mass model.
 * This is distinct from the six-state mutual-inductance model in em.mjs.
 * No fit to measured data is performed. References and independent NumPy checks:
 * research/panel/systems/round2.md and independent-reference.json.
 */
export const IDENTIFIABILITY_BASE = Object.freeze({L:.01,C:2.533e-6,R:12,m:.02,b:.4,k:20000,g:2});
const names=['m','b','k','g'],jf=[50,100,200,400,800,1600,3200];
const mag=z=>Math.hypot(z[0],z[1]);
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const div=(a,b)=>{const d=b[0]*b[0]+b[1]*b[1];return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];};
function at(p,f){
 const w=2*Math.PI*f,zm=[p.b,p.m*w-p.k/w],ze=[p.R,p.L*w-1/(p.C*w)];
 const reflected=div([p.g*p.g,0],zm),velocity=div([p.g,0],zm);
 return {z:[ze[0]+reflected[0],ze[1]+reflected[1]],reflected,velocity};
}
function logJacobian(withVelocity=false){
 const base=jf.map(f=>at(IDENTIFIABILITY_BASE,f));
 const vector=p=>{const rr=[],ii=[],vr=[],vi=[];jf.forEach((f,i)=>{const r=at(p,f),a=mag(base[i].reflected),b=mag(base[i].velocity);rr.push(r.reflected[0]/a);ii.push(r.reflected[1]/a);vr.push(r.velocity[0]/b);vi.push(r.velocity[1]/b);});return withVelocity?[...rr,...ii,...vr,...vi]:[...rr,...ii];};
 const h=1e-5,columns=names.map(name=>{const p={...IDENTIFIABILITY_BASE},m={...IDENTIFIABILITY_BASE};p[name]*=Math.exp(h);m[name]*=Math.exp(-h);const a=vector(p),b=vector(m);return a.map((x,i)=>(x-b[i])/(2*h));});
 return columns[0].map((_,row)=>columns.map(col=>col[row]));
}
/** Complete-pivot elimination, scale-relative numeric threshold; not symbolic proof. */
function matrixRank(matrix,relativeTolerance=1e-7){
 const a=matrix.map(row=>[...row]),n=a.length,m=a[0].length,max=Math.max(...a.flat().map(Math.abs)),tol=relativeTolerance*max;let rank=0;
 while(rank<Math.min(n,m)){
  let pi=rank,pj=rank,pivot=0;
  for(let i=rank;i<n;i++)for(let j=rank;j<m;j++)if(Math.abs(a[i][j])>pivot){pivot=Math.abs(a[i][j]);pi=i;pj=j;}
  if(pivot<=tol)break;
  [a[rank],a[pi]]=[a[pi],a[rank]];for(let i=0;i<n;i++)[a[i][rank],a[i][pj]]=[a[i][pj],a[i][rank]];
  for(let i=rank+1;i<n;i++){const factor=a[i][rank]/a[rank][rank];for(let j=rank;j<m;j++)a[i][j]-=factor*a[rank][j];}
  rank++;
 }
 return rank;
}
export function identifiabilityDemo({scale=4}={}){
 if(!Number.isFinite(scale)||scale<.01||scale>100)throw new RangeError('Scale must be between 0.01 and 100.');
 const p=IDENTIFIABILITY_BASE,sp={...p,m:scale*p.m,b:scale*p.b,k:scale*p.k,g:Math.sqrt(scale)*p.g};
 let electricalrelativeDifference=0,reflectedRelativeDifference=0,velocityRatioError=0,velocityratio=0;
 const frequencyHz=[],baseImpedanceMagnitudeOhm=[],scaledImpedanceMagnitudeOhm=[];
 for(let i=0;i<=200;i++){
  const f=25*Math.exp(Math.log(4000/25)*i/200),a=at(p,f),b=at(sp,f),ratio=div(b.velocity,a.velocity);
  electricalrelativeDifference=Math.max(electricalrelativeDifference,mag(sub(b.z,a.z))/mag(a.z));
  reflectedRelativeDifference=Math.max(reflectedRelativeDifference,mag(sub(b.reflected,a.reflected))/mag(a.reflected));
  velocityRatioError=Math.max(velocityRatioError,Math.hypot(ratio[0]-1/Math.sqrt(scale),ratio[1]));velocityratio+=ratio[0]/201;
  frequencyHz.push(f);baseImpedanceMagnitudeOhm.push(mag(a.z));scaledImpedanceMagnitudeOhm.push(mag(b.z));
 }
 const jac=logJacobian(),aug=logJacobian(true),rank=matrixRank(jac),rankWithVelocity=matrixRank(aug),analyticNullVector=[1,1,1,.5];
 const numericNullResidual=Math.max(...jac.map(row=>Math.abs(row.reduce((s,v,i)=>s+v*analyticNullVector[i],0))));
 return {status:'synthetic model demonstration; no measured parameter fit',scale,parameters:p,scaledParameters:sp,
  electricalrelativeDifference,reflectedRelativeDifference,velocityratio,expectedVelocityRatio:1/Math.sqrt(scale),velocityRatioError,
  rank,nullity:4-rank,rankWithVelocity,nullityWithVelocity:4-rankWithVelocity,analyticNullVector,
  logParameterOrder:names,jacobianFrequenciesHz:jf,logStep:1e-5,rankRelativeTolerance:1e-7,numericNullResidual,
  frequencyHz,baseImpedanceMagnitudeOhm,scaledImpedanceMagnitudeOhm,
  limits:['Four-state RLC–mass model with known L,C,R and no independent force drive; not the six-state EM model.',
   'The electrical scaling family is analytically exact. Numerical rank is local to the declared frequencies, parameters and threshold.',
   'Calibrated absolute velocity breaks this positive scaling ambiguity; sign conventions and other model ambiguities need separate controls.',
   'A passive fitted model cannot certify passivity, energy closure or net generation of unmeasured hardware.']};
}

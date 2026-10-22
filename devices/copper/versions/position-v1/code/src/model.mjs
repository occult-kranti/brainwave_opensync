/** Free-sphere l=0 model and explicitly synthetic observation examples.
 * Every frequency is cyclic frequency in Hz; characteristic roots use radians.
 * This is a selected mode family, never the complete spectrum of an object.
 */
const PI = Math.PI;
const finite = (x, name) => {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a finite number`);
  return x;
};
const positive = (x, name) => {
  finite(x, name);
  if (!(x > 0)) throw new RangeError(`${name} must be positive`);
  return x;
};

// [x*j0(x)-4*q*j1(x)]/x. The finite x=0 limit removes the
// nonphysical zero introduced by multiplying the traction equation by x².
export function radialCharacteristic(x, q) {
  finite(x, 'x'); finite(q, 'q');
  if (Math.abs(x) < 0.05) {
    const z = x * x;
    const sinc = 1-z/6+z*z/120-z*z*z/5040+z**4/362880;
    const h = 1/3-z/30+z*z/840-z*z*z/45360+z**4/3991680;
    return sinc - 4*q*h;
  }
  return Math.sin(x)/x - 4*q*(Math.sin(x)-x*Math.cos(x))/(x*x*x);
}

export function sphereModes({radiusMm=12.5,E_GPa=123.5,nu=0.35,rhoKgM3=8960}={}) {
  positive(radiusMm, 'radiusMm'); positive(E_GPa, 'E_GPa'); positive(rhoKgM3, 'rhoKgM3'); finite(nu, 'nu');
  // Bounded calculator domain, narrower than abstract isotropic stability.
  if (radiusMm < 0.01 || radiusMm > 1000) throw new RangeError('radiusMm must be from 0.01 to 1000');
  if (E_GPa < 0.001 || E_GPa > 1000) throw new RangeError('E_GPa must be from 0.001 to 1000');
  if (rhoKgM3 < 1 || rhoKgM3 > 30000) throw new RangeError('rhoKgM3 must be from 1 to 30000');
  if (nu < -0.9 || nu > 0.49) throw new RangeError('nu must be from -0.9 to 0.49');
  const R=radiusMm/1000, E=E_GPa*1e9;
  const shearPa=E/(2*(1+nu));
  const lambdaPa=E*nu/((1+nu)*(1-2*nu));
  const cL=Math.sqrt((lambdaPa+2*shearPa)/rhoKgM3);
  const cT=Math.sqrt(shearPa/rhoKgM3);
  const q=(cT/cL)**2;
  const roots=[];
  for(let n=0;n<3;n++) {
    let lo=n*PI, hi=(n+1)*PI;
    let flo=radialCharacteristic(lo,q), fhi=radialCharacteristic(hi,q);
    if (!(flo*fhi<0)) throw new Error('Could not bracket positive radial root');
    for(let j=0;j<64;j++) {
      const mid=(lo+hi)/2, fm=radialCharacteristic(mid,q);
      if (mid===lo || mid===hi) break;
      if (flo*fm>0) {lo=mid;flo=fm;} else {hi=mid;fhi=fm;}
    }
    roots.push((lo+hi)/2);
  }
  return {massKg:4*PI*R**3*rhoKgM3/3,cL,cT,roots,
    frequenciesHz:roots.map(x=>x*cL/(2*PI*R)),shearPa,lambdaPa,
    family:'First three positive l=0 spheroidal (radial breathing) roots',
    assumptions:'Homogeneous, isotropic, linear elastic sphere with a traction-free surface; no support, air loading, temperature gradient or crystal texture.'};
}

export function samplingBudget({fMaxHz=200000,sampleRateHz=1000000,durationS=0.1,Q=1000,frequencyHz=166551.05048081328}={}) {
  for(const [k,v] of Object.entries({fMaxHz,sampleRateHz,durationS,Q,frequencyHz})) positive(v,k);
  if (Q<=0.5) throw new RangeError('Q must exceed 0.5 for an underdamped ringdown');
  return {validNyquist:sampleRateHz>2*fMaxHz,modeWithinBand:frequencyHz<=fMaxHz,
    validPlan:sampleRateHz>2*fMaxHz && frequencyHz<=fMaxHz,nyquistHz:sampleRateHz/2,
    binHz:1/durationS,ringdownS:Q/(PI*frequencyHz),linewidthHz:frequencyHz/Q,
    samples:Math.ceil(sampleRateHz*durationS),
    guardBand:sampleRateHz>=2.5*fMaxHz,
    note:'Nyquist is necessary, not sufficient: require a calibrated analog passband and anti-alias filter. 1/T is Fourier-bin spacing, not a universal fitted-frequency uncertainty. Ringdown uses Q=1/(2*zeta) and the undamped natural frequency. The linewidth f/Q is a weak-damping approximation.'};
}

function magnitudeDb(f,poles,residues,Q) {
  let real=0,imag=0;
  for(let j=0;j<poles.length;j++) {
    const r=f/poles[j],a=1-r*r,b=r/Q,den=a*a+b*b;
    real+=residues[j]*a/den;
    imag-=residues[j]*b/den;
  }
  return 20*Math.log10(Math.max(1e-8,Math.hypot(real,imag)));
}

/** Normalized modal-coordinate toy, not a measurement or validated support model.
 * Support stiffness is coupled to each independent coordinate as k/m_eff.
 * m_eff=whole sphere mass is an explicit illustrative choice, not a derived
 * modal effective mass for the Lamb sphere eigenfunctions.
 */
export function responseComparison({position=1,scenario='path',radiusMm=12.5,E_GPa=123.5,nu=.35,rhoKgM3=8960,Q=180,points=800,supportStiffnessNPerM=1e8}={}) {
  finite(position,'position');positive(Q,'Q');finite(supportStiffnessNPerM,'supportStiffnessNPerM');
  if(position<0||position>1) throw new RangeError('position must be from 0 to 1');
  if(!['path','contact'].includes(scenario)) throw new RangeError('scenario must be path or contact');
  if(Q<=0.5||Q>10000) throw new RangeError('Q must be above 0.5 and at most 10000');
  if(!Number.isInteger(points)||points<50||points>10000) throw new RangeError('points must be an integer from 50 to 10000');
  if(supportStiffnessNPerM<0||supportStiffnessNPerM>1e10) throw new RangeError('support stiffness must be from 0 to 1e10 N/m');
  const sphere=sphereModes({radiusMm,E_GPa,nu,rhoKgM3});
  const polesAHz=sphere.frequenciesHz;
  const k=scenario==='contact'?position*supportStiffnessNPerM:0;
  const polesBHz=polesAHz.map(f=>Math.sqrt(f*f+k/(4*PI*PI*sphere.massKg)));
  const aWeights=[1,.22,.10];
  const bWeights=scenario==='path'?[1-.8*position,.22+.78*position,.10+.20*position]:aWeights;
  const grid=[];
  const low=.6*polesAHz[0],high=1.1*polesBHz[2];
  for(let i=0;i<points;i++)grid.push(low+(high-low)*i/(points-1));
  // Include pole neighborhoods as deterministic samples so high-Q peaks are
  // not lost merely because of the drawing grid. This is not FFT resolution.
  for(const f of [...polesAHz,...polesBHz])for(const z of [-2,-1,-.5,0,.5,1,2]) {
    const point=f+z*f/Q;
    if(point>0)grid.push(point);
  }
  const frequencyHz=[...new Set(grid)].sort((a,b)=>a-b);
  const aDb=frequencyHz.map(f=>magnitudeDb(f,polesAHz,aWeights,Q));
  const bDb=frequencyHz.map(f=>magnitudeDb(f,polesBHz,bWeights,Q));
  const peakAHz=frequencyHz[aDb.indexOf(Math.max(...aDb))];
  const peakBHz=frequencyHz[bDb.indexOf(Math.max(...bDb))];
  return {frequencyHz,aDb,bDb,polesAHz,polesBHz,peakAHz,peakBHz,
    residuesA:aWeights,residuesB:bWeights,effectiveModalMassKg:sphere.massKg,
    addedStiffnessNPerM:k,units:'dB relative to a fixed normalized modal-response unit',
    label:scenario==='path'?'Synthetic observation-path weights; intrinsic mode frequencies unchanged':'Synthetic added-spring perturbation; mode frequencies change',
    disclaimer:'Synthetic deterministic example, not measured copper data. Three selected radial modes only. Added-spring shifts use an illustrative effective modal mass and do not predict a real table-contact shift.'};
}

export function relativeUncertainty({radiusMm=12.5,E_GPa=123.5,nu=.35,rhoKgM3=8960,uRadiusMm=.01,uE_GPa=2,uNu=.005,uRhoKgM3=10}={}) {
  for(const [k,v] of Object.entries({uRadiusMm,uE_GPa,uNu,uRhoKgM3})) {
    finite(v,k);if(v<0)throw new RangeError(`${k} must be nonnegative`);
  }
  const base=sphereModes({radiusMm,E_GPa,nu,rhoKgM3});
  const step=Math.min(1e-5,(.49-nu)/2,(nu+.9)/2);
  if(!(step>0))throw new RangeError('nu must be strictly inside calculator range for a centered uncertainty derivative');
  const plus=sphereModes({radiusMm,E_GPa,nu:nu+step,rhoKgM3}).frequenciesHz[0];
  const minus=sphereModes({radiusMm,E_GPa,nu:nu-step,rhoKgM3}).frequenciesHz[0];
  const sensitivityNu=(Math.log(plus)-Math.log(minus))/(2*step);
  const terms={radius:uRadiusMm/radiusMm,modulus:.5*uE_GPa/E_GPa,density:.5*uRhoKgM3/rhoKgM3,poisson:Math.abs(sensitivityNu)*uNu};
  const relativeStd=Math.hypot(...Object.values(terms));
  return {frequencyHz:base.frequenciesHz[0],relativeStd,uHz:base.frequenciesHz[0]*relativeStd,terms,sensitivityNu,
    note:'First-order independent-input standard uncertainty, excluding model bias, anisotropy, support, thermal drift and parameter covariance. It is not the uncertainty of an A/B measured frequency difference.'};
}

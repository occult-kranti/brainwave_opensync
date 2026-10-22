/** Copper Sphere Location Lab: finite linear-elastic models, SI units.
 * No function estimates an object's entire spectrum or a universal location frequency.
 * Reproduction and physical scope: model-specification.md.
 */
export const COPPER_REFERENCE = Object.freeze({
  youngPa: 123.5e9, poisson: 0.350, densityKgM3: 8960,
  linearExpansionPerK: 16.5e-6, youngRelativeSlopePerK: -4.8e-4,
});
const TAU = 2 * Math.PI;
const modeShape = position => position===0 || position===1 ? 0 : Math.sin(Math.PI*position);
function finite(name, value) { if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`); return value; }
function positive(name, value) { finite(name, value); if (value <= 0) throw new RangeError(`${name} must be positive`); return value; }
function nonnegative(name, value) { finite(name, value); if (value < 0) throw new RangeError(`${name} must be nonnegative`); return value; }
function inRange(name, value, min, max) { finite(name,value); if (value < min || value > max) throw new RangeError(`${name} must be between ${min} and ${max}`); return value; }
function material(params = {}) {
  const p = {...COPPER_REFERENCE, ...params};
  positive('youngPa',p.youngPa); positive('densityKgM3',p.densityKgM3);
  finite('poisson',p.poisson); if (p.poisson <= -1 || p.poisson >= .5) throw new RangeError('poisson must lie strictly between -1 and 0.5');
  return p;
}
export function materialSpeeds(params = {}) {
  const p=material(params), mu=p.youngPa/(2*(1+p.poisson));
  const lambda=p.youngPa*p.poisson/((1+p.poisson)*(1-2*p.poisson));
  return {longitudinalMps:Math.sqrt((lambda+2*mu)/p.densityKgM3), transverseMps:Math.sqrt(mu/p.densityKgM3), lambdaPa:lambda, shearPa:mu};
}
export function sphericalJ1(x) {
  finite('x',x);
  if (Math.abs(x)<.5) {
    let term=x/3,sum=term;
    for(let k=1;k<=10;k++){term*=-x*x/(2*k*(2*k+3));sum+=term;}
    return sum;
  }
  return Math.sin(x)/x**2-Math.cos(x)/x;
}
function sphericalJ2(x) {
  if(Math.abs(x)<.5) {
    let term=x*x/15,sum=term;
    for(let k=1;k<=10;k++){term*=-x*x/(2*k*(2*k+5));sum+=term;}
    return sum;
  }
  return 3*sphericalJ1(x)/x-Math.sin(x)/x;
}
/** Dimensionless traction residual divided by x: removes the spurious x=0 root. */
export function breathingResidual(x, poisson=.350) {
  positive('x',x); if (!(poisson>-1 && poisson<.5)) throw new RangeError('invalid poisson');
  // Direct subtraction loses the small root as nu approaches -1. Expand the
  // combined residual, including its exact constant (1+nu)/(3*(1-nu)).
  if (x<.5) {
    const z=x*x;
    let sum=(1+poisson)/(3*(1-poisson)),power=1,factorial=6;
    for(let k=1;k<=10;k++) {
      factorial*=(2*k+2)*(2*k+3);power*=z;
      const coefficient=2*(k+1)*((2*k+1)+(1-2*k)*poisson)/((1-poisson)*factorial);
      sum+=(k%2?-1:1)*coefficient*power;
    }
    return sum;
  }
  const q=(1-2*poisson)/(2*(1-poisson));
  return Math.sin(x)/x-4*q*sphericalJ1(x)/x;
}
export function breathingRoot({poisson=.350, rootIndex=0}={}) {
  if (!Number.isInteger(rootIndex) || rootIndex<0 || rootIndex>19) throw new RangeError('rootIndex must be an integer from 0 to 19');
  if (!(poisson>-1 && poisson<.5)) throw new RangeError('invalid poisson');
  // The continuous x=0 residual is positive for every supported nu>-1.
  // Starting at a fixed positive cutoff can skip a legitimate auxetic root.
  let left=0, fl=(1+poisson)/(3*(1-poisson)), found=0;
  const step=Math.PI/64, limit=(rootIndex+3)*Math.PI;
  for(let right=left+step; right<=limit; right+=step) {
    const fr=breathingResidual(right,poisson);
    if(fl*fr<0) {
      if(found===rootIndex) {
        let a=left,b=right,fa=fl;
        for(let i=0;i<80;i++) { const m=(a+b)/2, fm=breathingResidual(m,poisson); if(fa*fm>0){a=m;fa=fm;}else b=m; }
        return (a+b)/2;
      }
      found++;
    }
    left=right;fl=fr;
  }
  throw new Error('root bracket not found');
}
export function solidBreathing(params={}) {
  const p=material(params), radiusM=positive('radiusM',params.radiusM ?? .04445);
  const root=breathingRoot({poisson:p.poisson,rootIndex:params.rootIndex ?? 0});
  const speed=materialSpeeds(p), massKg=4*Math.PI*p.densityKgM3*radiusM**3/3;
  // Exact spherical-Bessel integral for the surface-displacement-normalized radial mode.
  // integral_0^1 y² j1(xy)² dy = [j1(x)²-j0(x)j2(x)]/2.
  const j1=sphericalJ1(root),j0=Math.sin(root)/root,j2=sphericalJ2(root);
  const modalMassKg=massKg*1.5*(1-j0*j2/j1**2);
  return {kind:'solid',radiusM,massKg,modalMassKg,frequencyHz:root*speed.longitudinalMps/(TAU*radiusM),root,rootResidual:breathingResidual(root,p.poisson),...speed};
}
export function shellBreathing(params={}) {
  const p=material(params),radiusM=positive('radiusM',params.radiusM ?? .04445),thicknessM=positive('thicknessM',params.thicknessM ?? .0005);
  const thinness=thicknessM/radiusM;
  if(thinness>.1) throw new RangeError('thin-shell model requires thickness/radius <= 0.1; use full 3D elasticity beyond this exploratory limit');
  // Consistent membrane model mass; exact geometric mass is supplied separately.
  const massKg=4*Math.PI*radiusM**2*thicknessM*p.densityKgM3;
  const geometricMassKg=4*Math.PI*p.densityKgM3*((radiusM+thicknessM/2)**3-(radiusM-thicknessM/2)**3)/3;
  return {kind:'shell',radiusM,thicknessM,thinness,massKg,geometricMassKg,modalMassKg:massKg,
    frequencyHz:Math.sqrt(2*p.youngPa/(p.densityKgM3*(1-p.poisson)))/(TAU*radiusM),
    thinShellApplicable:thinness<=.05,...materialSpeeds(p)};
}
export function thermalShift({frequencyHz,deltaK=0,linearExpansionPerK=COPPER_REFERENCE.linearExpansionPerK,youngRelativeSlopePerK=COPPER_REFERENCE.youngRelativeSlopePerK}={}) {
  positive('frequencyHz',frequencyHz);finite('deltaK',deltaK);finite('linearExpansionPerK',linearExpansionPerK);finite('youngRelativeSlopePerK',youngRelativeSlopePerK);
  const lengthRatio=positive('thermal length ratio',1+linearExpansionPerK*deltaK),youngRatio=positive('thermal modulus ratio',1+youngRelativeSlopePerK*deltaK);
  const ratio=Math.sqrt(lengthRatio*youngRatio);
  return {frequencyHz:frequencyHz*ratio,shiftHz:frequencyHz*(ratio-1),fractionalShift:ratio-1,ratio,lengthRatio,densityRatio:lengthRatio**-3,youngRatio,
    linearFractionalPerK:.5*(linearExpansionPerK+youngRelativeSlopePerK)};
}
/** Weak-field clock comparison against a reference at the lower height; not a local material change. */
export function gravitationalShift({frequencyHz,heightM=0,gravityMps2=9.80665}={}) {
  positive('frequencyHz',frequencyHz);finite('heightM',heightM);positive('gravityMps2',gravityMps2);
  const fractionalShift=gravityMps2*heightM/(299792458**2);
  return {fractionalShift,shiftHz:frequencyHz*fractionalShift};
}
/** Passive point-spring coupling energy: kc*(us-phi*ut)^2/2. */
export function coupledSystem({sphereHz,tableHz,sphereModalMassKg,tableModalMassKg,contactNpm=0,position=0.5,sphereDamping=.002,tableDamping=.01}={}) {
  positive('sphereHz',sphereHz);positive('tableHz',tableHz);positive('sphereModalMassKg',sphereModalMassKg);positive('tableModalMassKg',tableModalMassKg);
  nonnegative('contactNpm',contactNpm);inRange('position',position,0,1);positive('sphereDamping',sphereDamping);positive('tableDamping',tableDamping);
  const ws=TAU*sphereHz,wt=TAU*tableHz,phi=modeShape(position),ms=sphereModalMassKg,mt=tableModalMassKg,kc=contactNpm;
  const k11=ms*ws**2+kc,k22=mt*wt**2+kc*phi**2,k12=-kc*phi;
  const a=k11/ms,d=k22/mt,b=k12/Math.sqrt(ms*mt),disc=Math.hypot(a-d,2*b),high=(a+d+disc)/2;
  const low=(a*d-b*b)/high;
  return {sphereHz,tableHz,sphereModalMassKg:ms,tableModalMassKg:mt,contactNpm:kc,position,phi,k11,k22,k12,
    c11:2*sphereDamping*ms*ws,c22:2*tableDamping*mt*wt,
    frequencyHz:[Math.sqrt(low)/TAU,Math.sqrt(high)/TAU],massNormalizedStiffness:[[a,b],[b,d]]};
}
function divideComplex(ar,ai,br,bi) { const den=br*br+bi*bi;return {re:(ar*br+ai*bi)/den,im:(ai*br-ar*bi)/den}; }
/** Unit modal force on sphere coordinate. Hss and Hts are displacement receptances, m/N. */
export function responseAt(system,frequencyHz) {
  nonnegative('frequencyHz',frequencyHz);
  const w=TAU*frequencyHz,ar=system.k11-system.sphereModalMassKg*w*w,ai=w*system.c11,dr=system.k22-system.tableModalMassKg*w*w,di=w*system.c22;
  const detr=ar*dr-ai*di-system.k12**2,deti=ar*di+ai*dr;
  const sphere=divideComplex(dr,di,detr,deti),table=divideComplex(-system.k12,0,detr,deti);
  return {frequencyHz,sphereRe:sphere.re,sphereIm:sphere.im,sphereMagnitude:Math.hypot(sphere.re,sphere.im),tableRe:table.re,tableIm:table.im,tableMagnitude:Math.hypot(table.re,table.im)};
}
export function receiverProjection(position,receiver='comoving') {
  inRange('position',position,0,1);
  if(receiver==='comoving') return 1;
  if(receiver!=='fixed') throw new RangeError('receiver must be fixed or comoving');
  // A fixed surface-normal marker viewed from horizontal midpoint, elevation L/2.
  return .5/Math.sqrt(.25+(position-.5)**2);
}
/** EMPTY fixture, local point-force and displacement at the same point, m/N. */
export function emptyTablePointResponse({tableHz,tableModalMassKg,position,tableDamping=.01},frequencyHz) {
  positive('tableHz',tableHz);positive('tableModalMassKg',tableModalMassKg);inRange('position',position,0,1);positive('tableDamping',tableDamping);nonnegative('frequencyHz',frequencyHz);
  const phi=modeShape(position),w=TAU*frequencyHz,wt=TAU*tableHz;
  const z=divideComplex(phi*phi,0,tableModalMassKg*(wt*wt-w*w),2*tableDamping*tableModalMassKg*wt*w);
  return {frequencyHz,re:z.re,im:z.im,magnitude:Math.hypot(z.re,z.im),phi};
}
export function simulateComparison(params={}) {
  const p={geometry:'shell',radiusMm:44.45,thicknessMm:.5,tempDeltaK:0,coupling:.08,positionA:.15,positionB:.75,receiver:'fixed',tableRatio:.9,...params};
  if(!['shell','solid'].includes(p.geometry)) throw new RangeError('geometry must be shell or solid');
  positive('radiusMm',p.radiusMm);positive('thicknessMm',p.thicknessMm);inRange('tempDeltaK',p.tempDeltaK,-30,30);inRange('coupling',p.coupling,0,.3);inRange('tableRatio',p.tableRatio,.1,3);
  const sphere=p.geometry==='shell'?shellBreathing({radiusM:p.radiusMm/1000,thicknessM:p.thicknessMm/1000}):solidBreathing({radiusM:p.radiusMm/1000});
  const thermal=thermalShift({frequencyHz:sphere.frequencyHz,deltaK:p.tempDeltaK});
  const shared={tableHz:sphere.frequencyHz*p.tableRatio,sphereModalMassKg:sphere.modalMassKg,tableModalMassKg:sphere.modalMassKg*10,contactNpm:p.coupling*sphere.modalMassKg*(TAU*sphere.frequencyHz)**2};
  const A=coupledSystem({...shared,sphereHz:sphere.frequencyHz,position:p.positionA}),B=coupledSystem({...shared,sphereHz:thermal.frequencyHz,position:p.positionB});
  const projectionA=receiverProjection(p.positionA,p.receiver),projectionB=receiverProjection(p.positionB,p.receiver);
  const min=.75*Math.min(shared.tableHz,...A.frequencyHz,...B.frequencyHz),max=1.18*Math.max(shared.tableHz,...A.frequencyHz,...B.frequencyHz);
  // Uniform plot grid plus points around undamped natural frequencies. This is not spectral fitting.
  const grid=Array.from({length:1001},(_,i)=>min+(max-min)*i/1000);
  for(const f of [shared.tableHz,...A.frequencyHz,...B.frequencyHz]) for(let i=-24;i<=24;i++) { const v=f*(1+i*.00025);if(v>=min&&v<=max)grid.push(v); }
  const frequencyHz=[...new Set(grid)].sort((a,b)=>a-b),responseA=[],responseB=[],tablePointResponseA=[],tablePointResponseB=[];
  for(const f of frequencyHz){responseA.push(responseAt(A,f).sphereMagnitude*projectionA);responseB.push(responseAt(B,f).sphereMagnitude*projectionB);}
  for(const f of frequencyHz){tablePointResponseA.push(emptyTablePointResponse({...shared,position:p.positionA},f).magnitude);tablePointResponseB.push(emptyTablePointResponse({...shared,position:p.positionB},f).magnitude);}
  return {intrinsicHzA:sphere.frequencyHz,intrinsicHzB:thermal.frequencyHz,massKg:sphere.massKg,geometricMassKg:sphere.geometricMassKg ?? sphere.massKg,
    coupledHzA:A.frequencyHz,coupledHzB:B.frequencyHz,frequencyHz,responseA,responseB,tablePointResponseA,tablePointResponseB,responseUnit:'m/N (projected displacement per modal force)',tableResponseUnit:'m/N (empty-table local point-force compliance)',
    projectionA,projectionB,thermal,model:sphere,contactNpm:shared.contactNpm,tableHz:shared.tableHz,tableModalMassKg:shared.tableModalMassKg,
    parameters:p,notes:[
      'Calculated linear-model responses; no physical measurement is included.',
      p.geometry==='shell'?'Uniform breathing of a thin shell; radius is midsurface. Other bending and torsional modes are omitted.':'First radial breathing mode of a homogeneous isotropic solid; lower non-radial modes are omitted.',
      'The fixture is one assumed mode with phi(x)=sin(pi x/L) and modal mass ten times the sphere modal mass; its frequency is a chosen ratio, not a table geometry prediction.',
      'Coupling slider is kc/(ms*omega_s,A^2), held fixed between positions. Contact spring includes both diagonal stiffness changes.',
      'Fixed receiver changes only line-of-sight projection. It cannot change natural frequencies. Co-moving receiver has unit projection.',
      'Empty-table traces are local displacement per force applied at that same point: phi(x)^2/[mt*(omega_t^2-omega^2+i*2*zeta_t*omega_t*omega)]. Position changes amplitude; a mode disappears at a node. The table natural frequency is shared.',
      'One newton denotes unit-force normalization, not a recommended experimental drive; apply a small linear-regime excitation and measure it.',
      'Temperature changes only the sphere at B in this sensitivity model; mass is conserved and Poisson ratio held fixed.',
      'An ordinary frictionless translation assumption removes drag, not acoustic, elastic, electromagnetic or thermal coupling.',
    ]};
}

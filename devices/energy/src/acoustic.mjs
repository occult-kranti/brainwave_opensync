/** Passive force-driven piezoelectric oscillator. RMS phasors, SI units.
 * This is a specified linear model, not a calibrated acoustic capture device.
 */
export const ACOUSTIC_DEFAULTS = Object.freeze({
  frequencyHz: 200, loadOhm: 10000, forceRmsN: .001,
  massKg: .005, stiffnessNPerM: .005*(2*Math.PI*200)**2,
  dampingNsPerM: .2, couplingNPerV: .01, capacitanceF: 1e-7,
  dielectricConductanceS: 0,
});
const finite = (name,v,min=0,strict=false) => {
  if (!Number.isFinite(v) || (strict ? v<=min : v<min))
    throw new RangeError(`${name} must be finite and ${strict?'greater than':'at least'} ${min}.`);
  return v;
};
const div = (ar,ai,br,bi) => {
  const scale=Math.max(Math.abs(br),Math.abs(bi));
  if (!(scale>0) || !Number.isFinite(scale)) throw new RangeError('Singular or nonfinite response; add physical damping and use finite parameters.');
  const b=br/scale,c=bi/scale,d=b*b+c*c;
  return [(ar/scale*b+ai/scale*c)/d,(ai/scale*b-ar/scale*c)/d];
};
const magnitude = z => Math.hypot(...z);
function parameters(options={}) {
  const p={...ACOUSTIC_DEFAULTS,...options};
  for (const n of ['frequencyHz','loadOhm','massKg','stiffnessNPerM','capacitanceF']) finite(n,p[n],0,true);
  for (const n of ['forceRmsN','dampingNsPerM','couplingNPerV','dielectricConductanceS']) finite(n,p[n]);
  return Object.fromEntries(Object.keys(ACOUSTIC_DEFAULTS).map(k=>[k,p[k]]));
}
export function acousticSolve(options={}) {
  const p=parameters(options),w=2*Math.PI*p.frequencyHz,G=p.dielectricConductanceS+1/p.loadOhm;
  // Mechanical displacement X = F/[k-mw²+iwb+iw theta²/(G+iwCp)].
  const feedback=div(0,w*p.couplingNPerV**2,G,w*p.capacitanceF);
  const X=div(p.forceRmsN,0,p.stiffnessNPerM-p.massKg*w*w+feedback[0],w*p.dampingNsPerM+feedback[1]);
  const U=[-w*X[1],w*X[0]],V=div(p.couplingNPerV*U[0],p.couplingNPerV*U[1],G,w*p.capacitanceF);
  const velocityRmsMps=magnitude(U),voltageRmsV=magnitude(V),inputW=p.forceRmsN*U[0],loadW=voltageRmsV**2/p.loadOhm;
  const mechanicalLossW=p.dampingNsPerM*velocityRmsMps**2,dielectricLossW=p.dielectricConductanceS*voltageRmsV**2;
  const residualW=loadW+mechanicalLossW+dielectricLossW-inputW;
  if (![inputW,loadW,mechanicalLossW,dielectricLossW,residualW,velocityRmsMps,voltageRmsV,...X,...U,...V].every(Number.isFinite))
    throw new RangeError('Parameters overflow this floating-point calculation.');
  const efficiency=inputW>0?loadW/inputW:null;
  return {inputW,loadW,mechanicalLossW,dielectricLossW,residualW,voltageRmsV,velocityRmsMps,efficiency,
    displacementRmsM:magnitude(X),meanStoredJ:.5*(p.massKg*velocityRmsMps**2+p.stiffnessNPerM*magnitude(X)**2+p.capacitanceF*voltageRmsV**2),
    phasorsRms:{displacementM:X,velocityMps:U,voltageV:V},parameters:p,
    residualConvention:'Positive means modeled output plus dissipation exceeds mechanical input; periodic mean storage change is zero.',
    limits:['Linear fixed-parameter passive piezoelectric model; illustrative parameters, no hardware data.',
      'RMS force is a separately defined mechanical input, not inferred from a microphone SPL.',
      'Efficiency uses receiver mechanical input only; speaker and amplifier supply energy is outside this boundary.',
      'Resistive AC load only; no rectifier, capacitor charging, room-field capture, or quantum mechanism modeled.']};
}
export function planeWaveReference({splDb=80,areaM2=.01,densityKgM3=1.204,speedMps=343}={}) {
  if (!Number.isFinite(splDb) || splDb < -100 || splDb > 200) throw new RangeError('splDb must be finite between -100 and 200 dB.');
  finite('areaM2',areaM2,0,true);finite('densityKgM3',densityKgM3,0,true);finite('speedMps',speedMps,0,true);
  const pressureRmsPa=20e-6*10**(splDb/20),intensityWPerM2=pressureRmsPa**2/(densityKgM3*speedMps),referencePowerW=intensityWPerM2*areaM2;
  if (![pressureRmsPa,intensityWPerM2,referencePowerW].every(Number.isFinite)) throw new RangeError('Parameters overflow the reference calculation.');
  return {pressureRmsPa,intensityWPerM2,referencePowerW,parameters:{splDb,areaM2,densityKgM3,speedMps},
    status:'Conditional progressive-plane-wave reference flux, not device output or a universal capture bound.',
    limits:['Requires unweighted calibrated RMS pressure in a uniform traveling wave; not dBA or a near/standing field.',
      'Geometric face area need not equal effective absorption cross-section; measure control-surface power for a device budget.',
      'The sound source expends energy. Resonance can concentrate the supplied field but is not an additional source.']};
}
export function acousticSweep(options={}) {
  const p=parameters(options),fMin=options.frequencyMinHz??100,fMax=options.frequencyMaxHz??300,nf=options.frequencyPoints??61,
    rMin=options.loadMinOhm??100,rMax=options.loadMaxOhm??1e6,nr=options.loadPoints??81;
  const mode=options.mode??'fixed-force',targetInputW=options.targetInputW??1e-6,
    maxForceRmsN=options.maxForceRmsN??.01,maxVelocityRmsMps=options.maxVelocityRmsMps??.05,maxVoltageRmsV=options.maxVoltageRmsV??10;
  if(!['fixed-force','fixed-input'].includes(mode))throw new RangeError('mode must be fixed-force or fixed-input.');
  for(const [name,value] of Object.entries({frequencyMinHz:fMin,frequencyMaxHz:fMax,loadMinOhm:rMin,loadMaxOhm:rMax,targetInputW,maxForceRmsN,maxVelocityRmsMps,maxVoltageRmsV}))finite(name,value,0,true);
  if(fMax<fMin||rMax<rMin)throw new RangeError('Sweep upper bounds must be at least lower bounds.');
  if(!Number.isInteger(nf)||!Number.isInteger(nr)||nf<2||nr<2||nf>301||nr>301)throw new RangeError('Sweep dimensions must be integers from 2 through 301.');
  const frequenciesHz=Array.from({length:nf},(_,i)=>fMin+(fMax-fMin)*i/(nf-1)),loadsOhm=Array.from({length:nr},(_,i)=>Math.exp(Math.log(rMin)+(Math.log(rMax)-Math.log(rMin))*i/(nr-1)));
  const compact=s=>({frequencyHz:s.parameters.frequencyHz,loadOhm:s.parameters.loadOhm,forceRmsN:s.parameters.forceRmsN,inputW:s.inputW,loadW:s.loadW,efficiency:s.efficiency,residualW:s.residualW,voltageRmsV:s.voltageRmsV,velocityRmsMps:s.velocityRmsMps});
  function evaluate(frequencyHz,loadOhm) {
    try {
      let forceRmsN=p.forceRmsN;
      if(mode==='fixed-input') {
        const unit=acousticSolve({...p,frequencyHz,loadOhm,forceRmsN:1});
        if(!(unit.inputW>0))return {frequencyHz,loadOhm,feasible:false,reason:'nonpositive-unit-input',inputW:null,loadW:null};
        forceRmsN=Math.sqrt(targetInputW/unit.inputW);
        if(!Number.isFinite(forceRmsN))return {frequencyHz,loadOhm,feasible:false,reason:'unrepresentable-rescaling',inputW:null,loadW:null};
      }
      // Limits are applied to the final rescaled response, never the unit-force probe.
      const r=compact(acousticSolve({...p,frequencyHz,loadOhm,forceRmsN}));
      const violations=[];
      if(r.forceRmsN>maxForceRmsN)violations.push('force');
      if(r.velocityRmsMps>maxVelocityRmsMps)violations.push('velocity');
      if(r.voltageRmsV>maxVoltageRmsV)violations.push('voltage');
      return {...r,feasible:violations.length===0,reason:violations.length?'constraint-limit':null,violations};
    } catch(error) {
      if(!(error instanceof RangeError))throw error;
      return {frequencyHz,loadOhm,feasible:false,reason:'invalid-response',inputW:null,loadW:null,detail:error.message};
    }
  }
  let best=null,maxAbsoluteResidualW=0,feasibleCount=0,rejectedCount=0;
  const rejectionCounts={},frequencyProfile=[],infeasibleFrequenciesHz=[];
  for (const frequencyHz of frequenciesHz) {
    let local=null;
    for(const loadOhm of loadsOhm) {
      const r=evaluate(frequencyHz,loadOhm);
      if(Number.isFinite(r.residualW))maxAbsoluteResidualW=Math.max(maxAbsoluteResidualW,Math.abs(r.residualW));
      if(!r.feasible){rejectedCount++;rejectionCounts[r.reason]=(rejectionCounts[r.reason]??0)+1;continue;}
      feasibleCount++;
      if(!local||r.loadW>local.loadW)local=r;if(!best||r.loadW>best.loadW)best=r;
    }
    if(local)frequencyProfile.push(local);else infeasibleFrequenciesHz.push(frequencyHz);
  }
  const selectedFrequencyLoadProfile=loadsOhm.map(loadOhm=>evaluate(p.frequencyHz,loadOhm));
  const selectedFeasible=selectedFrequencyLoadProfile.filter(r=>r.feasible);
  const bestAtSelectedFrequency=selectedFeasible.length?selectedFeasible.reduce((a,b)=>b.loadW>a.loadW?b:a):null;
  const fixedVelocityPredictedLoadOhm=1/Math.hypot(p.dielectricConductanceS,2*Math.PI*p.frequencyHz*p.capacitanceF);
  const predictedLoadEvaluatedInCoupledModel=evaluate(p.frequencyHz,fixedVelocityPredictedLoadOhm);
  return {mode,criterion:mode==='fixed-input'?'Largest feasible load power on the finite grid at matched receiver mechanical input power; not a global optimum.':'Largest feasible load power on the finite grid at fixed RMS force; not fixed input power or a global optimum.',
    sourceBoundary:'Receiver mechanical port: mean F(t)*velocity(t). Excludes speaker/amplifier electrical supply and acoustic capture efficiency.',
    parameters:p,targetInputW:mode==='fixed-input'?targetInputW:null,
    constraints:{maxForceRmsN,maxVelocityRmsMps,maxVoltageRmsV,applied:'to final response after fixed-input amplitude rescaling'},
    grid:{frequencyMinHz:fMin,frequencyMaxHz:fMax,frequencyPoints:nf,loadMinOhm:rMin,loadMaxOhm:rMax,loadPoints:nr,cells:nf*nr},
    feasibleCount,rejectedCount,rejectionCounts,best,bestAtSelectedFrequency,fixedVelocityPredictedLoadOhm,predictedLoadEvaluatedInCoupledModel,frequencyProfile,infeasibleFrequenciesHz,selectedFrequencyLoadProfile,maxAbsoluteResidualW,
    limits:['Fixed-velocity electrical optimum assumes prescribed motion. The coupled force-driven model includes electrical backaction.',
      'A sampled optimum does not establish a global maximum. Fixed-input power matching uses linear amplitude scaling within this model.',
      'Force, velocity and voltage limits are declared numerical constraints, not established hardware ratings or startup bounds.',
      'Efficiency covers the receiver mechanical boundary only. Do not add upstream speaker electrical and receiver mechanical work as separate inputs.']};
}

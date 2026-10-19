import { MODEL_DEFAULTS, resolveAbsorberParameters, solveAbsorberAtFrequency } from './models.mjs';

/** Bounded exhaustive grid search, not an AI model and not a global optimum proof. */
export function searchAbsorberDesign(overrides = {}) {
  const parameters = { ...MODEL_DEFAULTS.absorber, ...overrides };
  const physical = resolveAbsorberParameters(parameters);
  if (physical.forceNrms === 0) throw new RangeError('Design comparison requires nonzero force');
  const low = parameters.primaryFrequencyHz * 0.8;
  const high = parameters.primaryFrequencyHz * 1.2;
  const trainingFrequencyHz = Array.from({length:31}, (_,i)=>low+(high-low)*i/30);
  const validationFrequencyHz = Array.from({length:30}, (_,i)=>low+(high-low)*(i+0.5)/30);
  function evaluate(candidate, frequencies) {
    const p = resolveAbsorberParameters(candidate);
    const points = frequencies.map(f=>solveAbsorberAtFrequency(p,f));
    const worstDisplacementMm = Math.max(...points.map(p=>p.primaryDisplacementRmsM*1000));
    const powerResidualMaxW = Math.max(...points.map(p=>Math.abs(p.powerResidualW)));
    if (!Number.isFinite(worstDisplacementMm) || points.some(p=>Math.abs(p.powerResidualW)>1e-9*Math.max(1,p.inputPowerW))) {
      throw new Error('Candidate failed finite-response or conservation check');
    }
    return {worstDisplacementMm,powerResidualMaxW};
  }
  const trials = [];
  for (let i=0;i<9;i++) for(let j=0;j<9;j++) {
    const candidate = { ...parameters, tuningRatio:0.8+0.025*i, dampingRatioAbsorber:0.05+0.05*j };
    trials.push({tuningRatio:candidate.tuningRatio,dampingRatioAbsorber:candidate.dampingRatioAbsorber,...evaluate(candidate,trainingFrequencyHz)});
  }
  trials.sort((a,b)=>a.worstDisplacementMm-b.worstDisplacementMm || a.tuningRatio-b.tuningRatio || a.dampingRatioAbsorber-b.dampingRatioAbsorber);
  const bestParameters = {...parameters,tuningRatio:trials[0].tuningRatio,dampingRatioAbsorber:trials[0].dampingRatioAbsorber};
  const validation = evaluate(bestParameters,validationFrequencyHz);
  const baselineTraining = evaluate(parameters,trainingFrequencyHz);
  const baselineValidation = evaluate(parameters,validationFrequencyHz);
  return {
    algorithm:'Exhaustive 9 × 9 grid; no AI model called',
    objective:'Minimize the largest sampled primary RMS displacement over 0.8–1.2 times the bare-primary natural frequency, at fixed mass ratio and force.',
    candidatesEvaluated:trials.length, rejectedCandidates:0,
    frequencyBandHz:[low,high], trainingFrequencyHz, validationFrequencyHz,
    best:{parameters:bestParameters,trainingWorstMm:trials[0].worstDisplacementMm,validationWorstMm:validation.worstDisplacementMm,powerResidualMaxW:Math.max(trials[0].powerResidualMaxW,validation.powerResidualMaxW)},
    baseline:{parameters,trainingWorstMm:baselineTraining.worstDisplacementMm,validationWorstMm:baselineValidation.worstDisplacementMm},
    heldOutImprovement:validation.worstDisplacementMm < baselineValidation.worstDisplacementMm,
    trials,
    limits:['Best of this finite grid only; not a continuous global optimum.', 'Interleaved frequencies test numerical sampling, not model fidelity or real hardware.', 'Mass, force, primary damping, and model parameters remain fixed; no stroke or thermal constraint is optimized.'],
  };
}

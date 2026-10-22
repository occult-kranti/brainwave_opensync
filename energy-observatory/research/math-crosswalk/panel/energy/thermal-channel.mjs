/** Exploratory fixed-Hamiltonian generalized amplitude-damping model.
 * Same-author scalar implementation; checker uses complex Kraus matrices,
 * Hermitian eigensolvers, and an explicit equal-gap bath dilation.
 * Does not model a complete device or the classical capacity of a channel.
 */
const PLANCK_J_S = 6.62607015e-34;
function fraction(name, x) {
  if (!Number.isFinite(x) || x < 0 || x > 1) throw new RangeError(`${name} must be finite and in [0,1]`);
  return x;
}
function entropyFromLowerEigenvalue(l) {
  if (l === 0) return 0;
  return -l * Math.log(l) - (1 - l) * Math.log1p(-l);
}
function state(p, coherenceMagnitude, phase, determinant, gap) {
  // The nonnegative algebraic determinant avoids cancellation in pure states.
  const det = Math.min(0.25, Math.max(0, determinant));
  const lower = 2 * det / (1 + Math.sqrt(Math.max(0, 1 - 4 * det)));
  const re = coherenceMagnitude * Math.cos(phase);
  const im = coherenceMagnitude * Math.sin(phase);
  const energyJ = gap * p;
  const passiveEnergyJ = gap * lower;
  return {
    population: p,
    coherenceMagnitude,
    densityMatrix: {real: [[1 - p, re], [re, p]], imag: [[0, im], [-im, 0]]},
    eigenvaluesAscending: [lower, 1 - lower],
    energyJ,
    passiveEnergyJ,
    ergotropyJ: Math.max(0, energyJ - passiveEnergyJ),
    entropyNats: entropyFromLowerEigenvalue(lower)
  };
}
export function thermalQubitWork({frequencyHz = 5e9, population = 0.25, coherence = 1,
  phaseRadians = 0, damping = 0, dephasing = 1, bathPopulation = 0.25} = {}) {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) throw new RangeError('frequencyHz must be finite and positive');
  if (!Number.isFinite(phaseRadians)) throw new RangeError('phaseRadians must be finite');
  const gapJ = PLANCK_J_S * frequencyHz;
  if (!Number.isFinite(gapJ) || gapJ <= 0) throw new RangeError('frequencyHz produces an unrepresentable gap');
  const p = fraction('population', population), k = fraction('coherence', coherence);
  const gamma = fraction('damping', damping), d = fraction('dephasing', dephasing);
  const nu = fraction('bathPopulation', bathPopulation);
  const initial = state(p, k * Math.sqrt(p * (1 - p)), phaseRadians,
    p * (1 - p) * (1 - k * k), gapJ);
  const pf = (1 - gamma) * p + gamma * nu;
  const cf = d * Math.sqrt(1 - gamma) * initial.coherenceMagnitude;
  const detf = gamma * nu * (1 - nu) + gamma * (1 - gamma) * (p - nu) ** 2
    + (1 - gamma) * p * (1 - p) * (1 - d * d * k * k);
  const final = state(pf, cf, phaseRadians, detf, gapJ);
  const heatIntoQubitJ = gapJ * gamma * (nu - p);
  const betaGap = nu > 0 && nu < 1 ? Math.log1p(-nu) - Math.log(nu) : null;
  const entropyProductionNats = betaGap === null ? null
    : final.entropyNats - initial.entropyNats - betaGap * heatIntoQubitJ / gapJ;
  return {
    schema: 'exploratory-thermal-qubit-work/1',
    status: 'ideal fixed-H channel calculation; no hardware measurements',
    parameters: {frequencyHz, population: p, coherence: k, phaseRadians, damping: gamma,
      dephasing: d, bathPopulation: nu},
    gapJ, initial, final, heatIntoQubitJ, heatIntoBathJ: -heatIntoQubitJ,
    energyClosureResidualJ: final.energyJ - initial.energyJ - heatIntoQubitJ,
    bathResource: nu > 0.5 ? 'population-inverted resource' : nu === 0.5
      ? 'infinite-temperature limit' : nu === 0 ? 'zero-temperature limit' : 'positive-temperature bath',
    betaGap,
    entropyProductionNats,
    entropyProductionScope: betaGap === null ? 'Not evaluated: stationary reference state is rank deficient.'
      : 'Fixed H, thermal amplitude damping followed by energy-basis dephasing; full-rank stationary Gibbs reference. For nu>1/2 beta is negative and the reservoir is an inverted resource.',
    apparatusEfficiency: null,
    limitations: ['Heat is signed energy exchange with a modeled reservoir, not unpowered output.',
      'The optional dephasing map is energy-neutral for this fixed H; its implementation cost is omitted.',
      'Bath re-preparation, refrigeration, control, measurement and reset costs are not calculated.',
      'Ergotropy assumes arbitrary cyclic unitary access and is not measured harvested electricity.',
      'No communication capacity or additivity theorem is evaluated.']
  };
}

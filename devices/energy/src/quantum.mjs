/** Single-qubit work-accessibility model, not apparatus efficiency.
 * Basis: |0> ground, |1> excited. H = diag(0, h f).
 * Fixed Hamiltonian; prepared state -> zero-temperature amplitude damping -> dephasing.
 * No real quantum hardware, calibrated rates or complete preparation/reset costs are modeled.
 */
export const PLANCK_J_S = 6.62607015e-34;
function fraction(name, value) {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError(`${name} must be finite and in [0, 1]`);
  return value;
}
function stateRecord(population, offDiagonal, determinant, gapJ) {
  // det(rho) is evaluated from the channel parameters without subtracting nearly equal squares.
  const det = Math.min(0.25, Math.max(0, determinant));
  const blochLength = Math.sqrt(Math.max(0, 1 - 4 * det));
  const lowerEigenvalue = 2 * det / (1 + blochLength);
  const energyJ = gapJ * population;
  const passiveEnergyJ = gapJ * lowerEigenvalue;
  const ergotropyJ = Math.min(energyJ, Math.max(0, energyJ - passiveEnergyJ));
  const diagonalErgotropyJ = gapJ * Math.max(0, 2 * population - 1);
  return {
    population,
    coherenceMagnitude: offDiagonal,
    densityMatrix: {real: [[1 - population, offDiagonal], [offDiagonal, population]], imag: [[0, 0], [0, 0]]},
    eigenvaluesDescending: [1 - lowerEigenvalue, lowerEigenvalue],
    purity: 1 - 2 * det,
    energyJ,
    passiveEnergyJ,
    ergotropyJ,
    diagonalErgotropyJ,
    coherentErgotropyJ: Math.max(0, ergotropyJ - diagonalErgotropyJ)
  };
}
export function qubitWork({frequencyHz = 5e9, population = 0.25, coherence = 1, damping = 0, dephasing = 1} = {}) {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) throw new RangeError('frequencyHz must be finite and positive');
  const gapJ = PLANCK_J_S * frequencyHz;
  if (!Number.isFinite(gapJ) || gapJ <= 0) throw new RangeError('frequencyHz is outside the representable positive energy range');
  const p = fraction('population', population);
  const kappa = fraction('coherence', coherence);
  const gamma = fraction('damping', damping);
  const d = fraction('dephasing', dephasing);
  const initialOffDiagonal = kappa * Math.sqrt(p * (1 - p));
  const initial = stateRecord(p, initialOffDiagonal, p * (1 - p) * (1 - kappa * kappa), gapJ);
  const finalPopulation = (1 - gamma) * p;
  const finalOffDiagonal = d * Math.sqrt(1 - gamma) * initialOffDiagonal;
  // det(rho_final) = p_final [(1-p)(1-d² kappa²) + gamma p].
  const finalDeterminant = finalPopulation * ((1 - p) * (1 - d * d * kappa * kappa) + gamma * p);
  const final = stateRecord(finalPopulation, finalOffDiagonal, finalDeterminant, gapJ);
  const environmentalEnergyJ = gamma * initial.energyJ;
  return {
    schema: 'fieldwork-qubit-work/1',
    status: 'computed ideal-state model; no hardware measurements',
    parameters: {frequencyHz, population: p, coherence: kappa, damping: gamma, dephasing: d},
    gapJ,
    initial,
    final,
    environmentalEnergyJ,
    energyClosureResidualJ: final.energyJ + environmentalEnergyJ - initial.energyJ,
    apparatusEfficiency: null,
    provenance: {
      basis: 'ground |0>, excited |1>; phase chosen zero because these work quantities are phase-independent',
      Hamiltonian: 'H = diag(0, h f), fixed throughout the channel calculation',
      coherence: 'kappa is the fraction of maximal allowed initial off-diagonal magnitude at fixed population',
      damping: 'gamma is a zero-temperature amplitude-damping probability, not a measured rate',
      dephasing: 'd is the retained fraction of coherence after damping; 1 means no dephasing and 0 means complete dephasing',
      environmentalEnergy: 'battery energy released by the assumed damping channel; excludes apparatus dissipation',
      scope: 'Ergotropy is the ideal maximum under arbitrary cyclic unitary controls. Restricted controls can extract less.',
      omitted: ['preparation apparatus', 'coupler and control supply', 'measurement and memory', 'refrigeration', 'reset implementation', 'hardware calibration']
    }
  };
}

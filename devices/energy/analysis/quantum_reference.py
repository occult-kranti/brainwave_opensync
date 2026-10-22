#!/usr/bin/env python3
"""Independent matrix reconstruction and bounded unitary-search check.

Run: python3 -B analysis/quantum_reference.py --output research/panel/quantum/round2-results.json
No physical data or remote quantum processor is used. NumPy only; Node executes the JS producer.
The reference constructs Kraus channels and diagonalizes complex matrices rather than using
producer scalar formulas. This is a second formulation by the same model-agent; a separate
panel agent supplies independent review in the next round.
"""
from pathlib import Path
import argparse
import hashlib
import itertools
import json
import subprocess
import numpy as np

H_PLANCK = 6.62607015e-34
ROOT = Path(__file__).resolve().parents[1]


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def reference(case, phase=0.0):
    p, kappa = case['population'], case['coherence']
    gamma, d = case['damping'], case['dephasing']
    c = kappa * np.sqrt(p * (1 - p)) * np.exp(1j * phase)
    initial = np.array([[1-p, c], [np.conj(c), p]], dtype=complex)
    k0 = np.diag([1., np.sqrt(1-gamma)])
    k1 = np.array([[0., np.sqrt(gamma)], [0., 0.]])
    damped = k0 @ initial @ k0.conj().T + k1 @ initial @ k1.conj().T
    # Explicit random-unitary phase-flip channel, with q=(1+d)/2.
    z = np.diag([1., -1.])
    final = ((1+d)/2) * damped + ((1-d)/2) * z @ damped @ z
    gap = H_PLANCK * case['frequencyHz']
    h = np.diag([0., 1.])  # Normalize by the declared nonzero gap for arithmetic checks.

    def record(rho):
        eigenvalues = np.linalg.eigvalsh(rho)
        require(eigenvalues.min() >= -5e-15, 'Kraus state positivity')
        require(abs(np.trace(rho).real - 1) <= 5e-15, 'Kraus state trace')
        energy = np.trace(rho @ h).real
        passive = float(np.dot(eigenvalues[::-1], np.diag(h)))
        dephased = np.diag(np.diag(rho))
        diagonal_passive = float(np.dot(np.linalg.eigvalsh(dephased)[::-1], np.diag(h)))
        work = energy - passive
        diagonal_work = energy - diagonal_passive
        return {'energyJ': energy * gap, 'passiveEnergyJ': passive * gap,
                'ergotropyJ': work * gap, 'diagonalErgotropyJ': diagonal_work * gap,
                'coherentErgotropyJ': (work-diagonal_work) * gap,
                'purity': float(np.trace(rho @ rho).real),
                'eigenvaluesDescending': eigenvalues[::-1].tolist()}
    return initial, final, {'initial': record(initial), 'final': record(final),
                            'environmentalEnergyJ': float(np.trace((initial-final) @ h).real * gap)}


def bounded_unitary_search(rho, theta_count=257, phi_count=128):
    """Enumerate two-angle SU(2) rotations, directly evaluating the final excited population."""
    theta = np.linspace(0., np.pi, theta_count)
    phi = np.arange(phi_count) * (2*np.pi/phi_count)
    ct = np.cos(theta/2)[:, None]
    st = np.sin(theta/2)[:, None]
    # Excited row of U is [exp(i phi) sin(theta/2), cos(theta/2)].
    u10 = st * np.exp(1j*phi)[None, :]
    u11 = np.broadcast_to(ct, u10.shape)
    values = (u10 * rho[0, 0] * np.conj(u10)
              + u10 * rho[0, 1] * np.conj(u11)
              + u11 * rho[1, 0] * np.conj(u10)
              + u11 * rho[1, 1] * np.conj(u11)).real
    return float(values.min()), theta_count * phi_count


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=Path, default=ROOT/'src/quantum.mjs')
    parser.add_argument('--output', type=Path, default=None)
    args = parser.parse_args()
    cases = []
    for p, kappa, gamma, d in itertools.product(np.linspace(0, 1, 21), np.linspace(0, 1, 11), [0., .1, .5, .9, 1.], [0., .1, .5, .9, 1.]):
        cases.append({'frequencyHz': 5e9, 'population': float(p), 'coherence': float(kappa), 'damping': gamma, 'dephasing': d})
    grid_count = len(cases)
    rng = np.random.default_rng(20261021)
    for _ in range(512):
        p, kappa, gamma, d = rng.random(4)
        cases.append({'frequencyHz': float(10**rng.uniform(6, 12)), 'population': float(p), 'coherence': float(kappa), 'damping': float(gamma), 'dephasing': float(d)})
    # Boundary cases are intentional, including tiny positive populations.
    for p in [1e-16, 1e-12, 1-1e-12, 1-1e-16]:
        for kappa in [0., 1.]:
            cases.append({'frequencyHz': 5e9, 'population': p, 'coherence': kappa, 'damping': 0., 'dephasing': 1.})
    js = """
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const {qubitWork}=await import(pathToFileURL(process.argv[1]));
const inputs=JSON.parse(readFileSync(0,'utf8'));
const outputs=inputs.map(x=>{const r=qubitWork(x);return {gapJ:r.gapJ,initial:r.initial,final:r.final,environmentalEnergyJ:r.environmentalEnergyJ,energyClosureResidualJ:r.energyClosureResidualJ,apparatusEfficiency:r.apparatusEfficiency};});
const bad=[{frequencyHz:0},{frequencyHz:-1},{frequencyHz:NaN},{frequencyHz:Infinity},{population:-.1},{population:1.1},{coherence:2},{damping:-1},{dephasing:1.1},{dephasing:NaN}];
let rejected=0;for(const x of bad){try{qubitWork(x);}catch(e){if(e instanceof RangeError)rejected++;}}
console.log(JSON.stringify({outputs,rejected,invalidCount:bad.length}));
"""
    raw = subprocess.check_output(['node', '--input-type=module', '-e', js, str(args.model.resolve())], input=json.dumps(cases), text=True)
    producer = json.loads(raw)
    require(producer['rejected'] == producer['invalidCount'], 'invalid JS inputs must be rejected')
    require(len(producer['outputs']) == len(cases), 'case count')
    max_energy_error = 0.
    max_purity_error = 0.
    max_closure_error = 0.
    for index, (case, actual) in enumerate(zip(cases, producer['outputs'])):
        # Complex phase differs from producer's real-state convention; these quantities must be invariant.
        phase = [0., np.pi/3, -.7, 2.4][index % 4]
        initial, final, expected = reference(case, phase)
        gap = H_PLANCK * case['frequencyHz']
        require(actual['apparatusEfficiency'] is None, 'must not invent apparatus efficiency')
        for state in ['initial', 'final']:
            for key in ['energyJ', 'passiveEnergyJ', 'ergotropyJ', 'diagonalErgotropyJ', 'coherentErgotropyJ']:
                error = abs(actual[state][key] - expected[state][key])/gap
                max_energy_error = max(max_energy_error, error)
                require(error < 2e-13, f'matrix mismatch: case {index} {state} {key}')
            max_purity_error = max(max_purity_error, abs(actual[state]['purity']-expected[state]['purity']))
            work, energy = actual[state]['ergotropyJ'], actual[state]['energyJ']
            require(work >= 0 and work <= energy + 2e-14*gap, 'ergotropy energy bound')
        env_error = abs(actual['environmentalEnergyJ']-expected['environmentalEnergyJ'])/gap
        max_energy_error = max(max_energy_error, env_error)
        require(env_error < 2e-13, 'environmental energy mismatch')
        closure = abs(actual['final']['energyJ']+actual['environmentalEnergyJ']-actual['initial']['energyJ'])/gap
        max_closure_error = max(max_closure_error, closure)
        require(closure < 1e-14, 'energy closure')
        if case['damping'] == 0:
            require(abs(actual['initial']['energyJ']-actual['final']['energyJ'])/gap < 1e-14, 'pure dephasing must preserve mean energy')
    require(max_purity_error < 2e-13, 'purity agreement')
    search_rows = []
    total_rotations = 0
    for p, kappa in itertools.product([.1, .25, .5, .75, .9], [0., .3, .7, 1.]):
        case = {'frequencyHz': 5e9, 'population': p, 'coherence': kappa, 'damping': 0., 'dephasing': 1.}
        rho, _, expected = reference(case)
        sampled_minimum, count = bounded_unitary_search(rho)
        exact_minimum = expected['initial']['passiveEnergyJ']/(H_PLANCK*5e9)
        gap_to_bound = sampled_minimum-exact_minimum
        require(gap_to_bound >= -2e-14, 'sampled rotation cannot beat passive bound')
        require(gap_to_bound < 1e-5, 'finite rotation grid must approach passive bound')
        search_rows.append({'population': p, 'coherence': kappa, 'sampledMinusExactInGapUnits': gap_to_bound})
        total_rotations += count
    # Deliberately incorrect claim: all stored energy is extractable by a unitary.
    _, _, passive_control = reference({'frequencyHz': 5e9, 'population': .25, 'coherence': 0., 'damping': 0., 'dephasing': 1.})
    wrong_work = passive_control['initial']['energyJ']
    correct_work = passive_control['initial']['ergotropyJ']
    require(abs(correct_work)/(H_PLANCK*5e9) < 1e-14 and wrong_work > 0, 'negative control must expose wrong estimator')
    record = {
        'status': 'passed-within-declared-model', 'researchDate': '2026-10-21',
        'provenance': 'Scalar JS producer versus matrix/Kraus/eigensolver reference by the same model-agent; separate panel review follows.',
        'modelSHA256': hashlib.sha256(args.model.read_bytes()).hexdigest(),
        'referenceSHA256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'grid': {'populations': 21, 'coherenceFractions': 11, 'dampingProbabilities': 5, 'dephasingRetentions': 5, 'cases': grid_count},
        'randomCases': 512, 'randomSeed': 20261021, 'boundaryCases': 8,
        'totalCases': len(cases), 'invalidInputsRejected': producer['rejected'],
        'maxEnergyErrorInGapUnits': max_energy_error, 'maxPurityError': max_purity_error,
        'maxClosureResidualInGapUnits': max_closure_error,
        'unitarySearch': {'states': len(search_rows), 'thetaCount': 257, 'phiCount': 128, 'totalRotations': total_rotations,
                          'maxSampledMinusExactInGapUnits': max(r['sampledMinusExactInGapUnits'] for r in search_rows), 'results': search_rows,
                          'scope': 'Finite sampled search corroborates the eigenvalue-ordering bound; it does not prove the continuous optimum.'},
        'wrongEstimatorControl': {'state': 'population .25, zero coherence', 'wrongStoredEnergyAsWorkJ': wrong_work, 'correctErgotropyJ': correct_work, 'rejected': True},
        'limits': ['No physical measurements.', 'No wall-plug or complete-cycle efficiency calculated.', 'No acoustic-to-qubit coupling inferred from frequency equality.', 'Matrix channel assumptions and ideal unrestricted unitary extraction define the result.']
    }
    output = json.dumps(record, indent=2)+'\n'
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output)
    print(json.dumps({k:record[k] for k in ['status','totalCases','maxEnergyErrorInGapUnits','maxClosureResidualInGapUnits','invalidInputsRejected']}))


if __name__ == '__main__':
    main()

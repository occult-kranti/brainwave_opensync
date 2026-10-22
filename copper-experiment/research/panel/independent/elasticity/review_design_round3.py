#!/usr/bin/env python3
"""Independent Round 3 review of the inverse seat's finite design module.

Constructs A,B,C,O,K and nuisance designs independently in NumPy. Uses Node only
as a producer of actual module/archive API results. No app files are written.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import numpy as np

BASE = Path(__file__).resolve().parents[2]
APP = BASE / 'sphere-lab-repo/copper-experiment'
DEFAULT_OUTPUT = Path(__file__).with_name('round3-design-results.json')


def analytic_participation(p: float) -> np.ndarray:
    # Explicit canonical sine nodes: do not infer a node from small amplitude.
    result = np.sin(np.arange(1, 4) * np.pi * p)
    if p in (0.0, 1.0):
        result[:] = 0
    if p == 0.5:
        result[1] = 0
    if p in (1 / 3, 2 / 3):
        result[2] = 0
    return result


def independent_matrices(sensors, drives):
    stiffness = np.diag(np.square([1.0, 2.0, 3.0]))
    a = np.block([[np.zeros((3, 3)), np.eye(3)], [-stiffness, np.zeros((3, 3))]])
    c = np.column_stack(([analytic_participation(p) for p in sensors], np.zeros((len(sensors), 3))))
    b = np.vstack((np.zeros((3, len(drives))), np.array([analytic_participation(p) for p in drives]).T))
    o = np.concatenate([c @ np.linalg.matrix_power(a, n) for n in range(6)], axis=0)
    k = np.concatenate([np.linalg.matrix_power(a, n) @ b for n in range(6)], axis=1)
    return a, b, c, o, k


def svd_diagnostic(matrix, tol):
    scales = np.linalg.norm(matrix, axis=0)
    normalized = np.divide(matrix, scales, out=np.zeros_like(matrix), where=scales != 0)
    _, singular, vt = np.linalg.svd(normalized, full_matrices=True)
    rank = int(np.count_nonzero(singular > tol))
    null = vt[rank:]
    original_null = np.divide(null, scales, out=np.copy(null), where=scales != 0)
    for row in original_null:
        row /= np.max(np.abs(row))
    return rank, singular, normalized, original_null


def build_cases():
    cases = [
        ('center', [.5], [.5]),
        ('sensor_only_repair', [.5, .25], [.5]),
        ('source_and_sensor_repair', [.5, .25], [.5, .25]),
        ('generic_single', [.25], [.25]),
        ('duplicate_center', [.5, .5], [.5, .5]),
        ('endpoints', [0, 1], [0, 1]),
        ('canonical_third_node', [1 / 3], [1 / 3]),
        ('two_canonical_third_nodes', [1 / 3, 2 / 3], [1 / 3, 2 / 3]),
        ('near_endpoint_nonzero', [1e-16], [1e-16]),
        ('near_center_nonzero', [.5 + np.finfo(float).eps], [.5 + np.finfo(float).eps]),
        ('near_third_node_nonzero', [np.nextafter(1 / 3, 1)], [np.nextafter(1 / 3, 1)]),
        ('weak_sensor_nodal_drive', [1e-16], [.5]),
        ('nodal_sensor_weak_drive', [.5], [1e-16]),
        ('endpoint_and_center', [0, .5, 1], [0, .5, 1]),
        ('four_duplicate_generic', [.25] * 4, [.25] * 4),
    ]
    rng = np.random.default_rng(225103)
    for i in range(20):
        ns, nd = rng.integers(1, 5, size=2)
        cases.append((f'seeded_geometry_{i:02}', rng.uniform(1e-6, 1 - 1e-6, ns).tolist(), rng.uniform(1e-6, 1 - 1e-6, nd).tolist()))
    expanded = []
    for name, sensors, drives in cases:
        for tol in (1e-14, 1e-10, 1e-4):
            expanded.append({'id': f'{name}_tol{tol:g}', 'sensorPositions': sensors, 'drivePositions': drives, 'tolerance': tol})
    return expanded


def actual_producer(cases):
    paths = {
        'D': APP / 'src/design-diagnostics.mjs',
        'L': APP / 'public/versions/location-v1.1/src/models.mjs',
        'P': APP / 'public/versions/position-v1/src/model.mjs',
    }
    program = '\n'.join(f"import * as {key} from {json.dumps(path.as_uri())};" for key, path in paths.items())
    program += '\nconst inputs=' + json.dumps(cases) + ';\n'
    program += r'''
const modal=inputs.map(({id,...p})=>({id,result:D.finiteModalDiagnostics(p)}));
const nuisance=['locked-temperature','independent-temperature'].map(design=>({design,result:D.nuisanceDesignDiagnostics({design})}));
const directLocation=[];
for(const p of [0,.01,.123,.25,.3,.5,.75,.99]) {
 const r=L.simulateComparison({positionA:p,positionB:1-p,tempDeltaK:0,coupling:.08,receiver:'fixed'});
 const peak=Math.max(...r.responseA,...r.responseB,Number.MIN_VALUE);
 directLocation.push({positionA:p,positionB:1-p,maxPoleDifferenceHz:Math.max(...r.coupledHzA.map((x,i)=>Math.abs(x-r.coupledHzB[i]))),maxRelativeResponseDifference:Math.max(...r.responseA.map((x,i)=>Math.abs(x-r.responseB[i])))/peak});
}
const pa=P.responseComparison({position:.5,scenario:'contact',supportStiffnessNPerM:1e8});
const pb=P.responseComparison({position:1,scenario:'contact',supportStiffnessNPerM:5e7});
const directPosition={maxPoleDifferenceHz:Math.max(...pa.polesBHz.map((x,i)=>Math.abs(x-pb.polesBHz[i]))),maxResponseDifferenceDb:Math.max(...pa.bDb.map((x,i)=>Math.abs(x-pb.bDb[i]))),sameFrequencyGrid:JSON.stringify(pa.frequencyHz)===JSON.stringify(pb.frequencyHz),addedStiffnessA:pa.addedStiffnessNPerM,addedStiffnessB:pb.addedStiffnessNPerM};
const invalid=[];
for(const input of [{sensorPositions:[]},{drivePositions:Array(5).fill(.5)},{sensorPositions:[NaN]},{drivePositions:[-.1]},{sensorPositions:[1.1]},{tolerance:0},{tolerance:Infinity}]){
 let rejected=false;try {D.finiteModalDiagnostics(input);}catch {rejected=true;}invalid.push(rejected);
}
console.log(JSON.stringify({modal,nuisance,alias:D.globalAliasDiagnostics(),directLocation,directPosition,invalid}));
'''
    output = subprocess.check_output(['node', '--input-type=module', '-e', program], text=True)
    return json.loads(output), paths


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    cases = build_cases()
    actual, paths = actual_producer(cases)
    failures = []
    results = []
    for case, produced in zip(cases, actual['modal']):
        r = produced['result']
        a, b, c, o, k = independent_matrices(case['sensorPositions'], case['drivePositions'])
        case_result = {'id': case['id'], 'input': case, 'instantaneous_sensor_rank': int(np.linalg.matrix_rank(c)), 'generator_max_abs_error': float(np.max(np.abs(a - np.asarray(r['generator']))))}
        if case_result['generator_max_abs_error'] != 0:
            failures.append(f"{case['id']}: generator differs")
        for name, matrix in [('observability', o), ('controllability', k.T)]:
            rank, singular, normalized, _ = svd_diagnostic(matrix, case['tolerance'])
            got = r[name]
            kernel = np.array(got['kernel'], dtype=float)
            if kernel.size:
                residual = float(np.max(np.abs(matrix @ kernel.T)))
            else:
                residual = 0.0
            correct = rank == got['rank'] and 6 - rank == got['stateNullity'] and len(got['kernel']) == 6 - rank
            if not correct:
                failures.append(f"{case['id']} {name}: NumPy rank {rank}, producer rank {got['rank']}")
            if residual > 2e-9:
                failures.append(f"{case['id']} {name}: original-coordinate kernel residual {residual}")
            case_result[name] = {'numpy_rank': rank, 'producer_rank': got['rank'], 'nullity': got['stateNullity'], 'normalized_singular_values': singular.tolist(), 'independent_original_kernel_residual': residual, 'rank_matches': correct}
        # For this known distinct-frequency diagonal generator, every participating
        # mode contributes its q and q' pair to temporal structural rank.
        independent_obs = 2 * int(np.count_nonzero(np.any(np.array([analytic_participation(p) != 0 for p in case['sensorPositions']]), axis=0)))
        independent_ctrl = 2 * int(np.count_nonzero(np.any(np.array([analytic_participation(p) != 0 for p in case['drivePositions']]), axis=0)))
        if (case_result['observability']['numpy_rank'], case_result['controllability']['numpy_rank']) != (independent_obs, independent_ctrl):
            failures.append(f"{case['id']}: SVD differs from distinct-frequency participation theorem")
        results.append(case_result)

    nuisance_results = []
    for entry in actual['nuisance']:
        design, got = entry['design'], entry['result']
        x = np.array([0., 1., 1., 0., 1., 0., 0., 1.])
        t = np.arange(8) - 3.5
        temp = .2 * x
        if design == 'independent-temperature':
            temp = temp + np.tile([-.1, .1, -.1, .1], 2)
        matrix = np.column_stack([np.ones(8), t, x, temp])
        rank, singular, normalized, null = svd_diagnostic(matrix, 1e-10)
        expected_estimable = not any(abs(row[2]) > 1e-9 for row in null)
        correct = np.array_equal(matrix, np.array(got['matrix'])) and rank == got['rank'] and expected_estimable == got['locationTargetEstimable']
        if not correct:
            failures.append(f'{design}: nuisance output differs from independent matrix/nullspace')
        kernel = np.array(got['kernel'], dtype=float)
        residual = float(np.max(np.abs(matrix @ kernel.T))) if kernel.size else 0
        nuisance_results.append({'design': design, 'rank': rank, 'nullity': 4-rank, 'normalized_singular_values': singular.tolist(), 'numpy_kernel_in_original_units': null.tolist(), 'producer_kernel_residual': residual, 'target_estimable': expected_estimable, 'matches': correct})

    # Stress the inference, not the producer: repetition cannot remove a locked
    # nuisance kernel; adding an omitted locked preload destroys target uniqueness.
    locked = np.column_stack([np.ones(8), t, x, .2*x])
    repeated = np.tile(locked, (100, 1))
    varied = np.column_stack([np.ones(8), t, x, .2*x + np.tile([-.1,.1,-.1,.1], 2)])
    omitted_preload = np.column_stack([varied, .7*x])
    stress = {'locked_800_rows_rank': int(np.linalg.matrix_rank(repeated)), 'independent_temperature_rank': int(np.linalg.matrix_rank(varied)), 'with_omitted_locked_preload_rank': int(np.linalg.matrix_rank(omitted_preload)), 'with_omitted_locked_preload_columns': 5, 'explicit_preload_null': [0,0,.7,0,-1], 'preload_null_max_residual': float(np.max(np.abs(omitted_preload @ np.array([0,0,.7,0,-1]))))}
    if stress['locked_800_rows_rank'] != 3 or stress['with_omitted_locked_preload_rank'] != 4:
        failures.append('independent inference stress ranks unexpected')
    def contrast(sequence, curvature):
        time = np.arange(4, dtype=float)
        at_b = np.array([p == 'B' for p in sequence])
        f = curvature*time*time
        return float(np.mean(f[at_b]) - np.mean(f[~at_b]))
    stress['quadratic_drift_contrasts'] = {'ABBA_c1':contrast('ABBA',1),'BAAB_c1':contrast('BAAB',1),'balanced_different_curvatures_mean':(contrast('ABBA',1)+contrast('BAAB',2))/2}

    if not actual['alias']['ambiguityEstablished'] or actual['alias']['maxPoleDifferenceHz'] != 0 or actual['alias']['maxResponseDifference'] != 0:
        failures.append('declared exact Location alias did not reproduce')
    if any(r['maxPoleDifferenceHz'] > 1e-8 or r['maxRelativeResponseDifference'] > 2e-12 for r in actual['directLocation']):
        failures.append('retained Location reflection family differs beyond floating-point allowance')
    if actual['directPosition']['maxPoleDifferenceHz'] != 0 or actual['directPosition']['maxResponseDifferenceDb'] != 0 or not actual['directPosition']['sameFrequencyGrid']:
        failures.append('retained Position contact-product alias did not reproduce')
    if not all(actual['invalid']):
        failures.append('a malformed/resource-unbounded design input was accepted')
    archive_bindings = {'location_archive_equals_pinned_source': paths['L'].read_bytes() == (BASE/'sphere-lab-repo/location-spectrum/src/models.mjs').read_bytes(), 'position_archive_equals_pinned_source': paths['P'].read_bytes() == (BASE/'position-review/device-observatory/position/src/model.mjs').read_bytes()}
    if not all(archive_bindings.values()):
        failures.append('retained archive model differs from pinned source')
    source_paths = {**paths, 'documentation': APP/'research/design-diagnostics.md', 'protocol':APP/'research/protocol-integrated.md'}
    hashes = {str(path.relative_to(BASE)): hashlib.sha256(path.read_bytes()).hexdigest() for path in source_paths.values()}
    record = {'schema':'copper-elasticity-independent-design-review/1','status':'passed' if not failures else 'failed','review_seat':'elasticity agent, reviewing inverse agent source; not physical replication','numpy_version':np.__version__,'source_sha256':hashes,'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'method':'Independent NumPy block-state A,B,C construction, matrix powers, column-normalized SVD, explicit nulls, actual Node archive API execution. No producer elimination reused.','temporal_cases':results,'nuisance_cases':nuisance_results,'independent_inference_stress':stress,'actual_location_alias_function':actual['alias'],'retained_location_reflection_cases':actual['directLocation'],'retained_position_product_alias':actual['directPosition'],'invalid_input_rejections':actual['invalid'],'archive_bindings':archive_bindings,'counts':{'temporal_design_cases':len(cases),'independent_O_and_K_rank_comparisons':2*len(cases),'nuisance_design_cases':2,'location_reflection_cases':len(actual['directLocation']),'malformed_inputs':len(actual['invalid'])},'failures':failures,'limits':['SVD rank cutoff and column scaling are algebraic conventions; no physical noise calibration or finite-time estimation result.','Fixtures use a known dimensionless sine basis with three distinct frequencies, not Lamb modes or a complete apparatus.','Exact aliases establish nonuniqueness only in their retained forward models.','No review of this seat own modal module is counted as independent evidence.']}
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(record,indent=2,allow_nan=False)+'\n')
    print(json.dumps({'output':str(args.output),'status':record['status'],'counts':record['counts'],'failures':failures}))
    return 1 if failures else 0

if __name__ == '__main__':
    sys.exit(main())

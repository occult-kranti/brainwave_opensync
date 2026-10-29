#!/usr/bin/env python3
"""Independent R2 ideal Faraday/Johnson oracle; no implementation imports."""
import json
import math
from pathlib import Path

KB = 1.380649e-23  # exact SI definition, J K^-1


def nonnegative(name, value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(name + ': not a real number')
    if not math.isfinite(value) or value < 0:
        raise ValueError(name + ': must be finite and nonnegative')
    return value


def positive(name, value):
    value = nonnegative(name, value)
    if value == 0:
        raise ValueError(name + ': must be positive')
    return value


def projected_area(turns, area_m2, theta_deg):
    nonnegative('turns', turns)
    nonnegative('area_m2', area_m2)
    if isinstance(theta_deg, bool) or not isinstance(theta_deg, (int, float)) or not math.isfinite(theta_deg):
        raise ValueError('theta_deg: must be finite')
    # Exactly represented odd multiples of 90 degrees mean exact orthogonality.
    if theta_deg % 180 == 90:
        return 0.0
    return turns * area_m2 * abs(math.cos(math.radians(theta_deg)))


def solve(p):
    f = nonnegative('frequency_hz', p['frequency_hz'])
    b = nonnegative('b_rms_t', p['b_rms_t'])
    r = nonnegative('radius_m', p['radius_m'])
    temp = nonnegative('temperature_k', p['temperature_k'])
    resistance = positive('resistance_ohm', p['resistance_ohm'])
    bandwidth = positive('bandwidth_hz', p['bandwidth_hz'])
    # Derivation independent of a producer function: derivative of flux
    # N*A*sqrt(2)*B_rms*cos(wt), then divide peak emf by sqrt(2).
    omega = 2 * math.pi * f
    sensitivity = omega * projected_area(p['turns'], p['area_m2'], p['theta_deg'])
    vrms = sensitivity * b
    # 2*pi*r*E_peak = pi*r^2 * w*B_peak; define continuous r=0 limit.
    erms = omega * r * b / 2
    noise = 2 * math.sqrt(KB * temp * resistance * bandwidth)
    values = [sensitivity, vrms, erms, noise]
    if not all(math.isfinite(x) for x in values):
        raise ValueError('outside finite numerical range')
    equivalent = noise / sensitivity if sensitivity > 0 else None
    if equivalent is not None and not math.isfinite(equivalent):
        raise ValueError('outside finite numerical range')
    return {'v_rms_v': vrms, 'e_rms_v_per_m': erms,
            'sensitivity_v_per_t': sensitivity, 'thermal_v_rms_v': noise,
            'equivalent_b_rms_t': equivalent,
            'identifiability': 'identifiable-ideal-receiver' if sensitivity > 0 else 'unidentifiable'}


BASE = dict(frequency_hz=7.83, b_rms_t=1e-12, turns=1000, area_m2=1.0,
            theta_deg=0.0, radius_m=0.1, temperature_k=300,
            resistance_ohm=1000, bandwidth_hz=1.0)


def main():
    valid_changes = [
        ('baseline', {}), ('zero_field', {'b_rms_t': 0}),
        ('zero_frequency', {'frequency_hz': 0}), ('zero_turns', {'turns': 0}),
        ('zero_area', {'area_m2': 0}), ('orthogonal', {'theta_deg': 90}),
        ('reversed_normal', {'theta_deg': 180}), ('angle_60', {'theta_deg': 60}),
        ('double_field', {'b_rms_t': 2e-12}), ('double_frequency', {'frequency_hz': 15.66}),
        ('double_area', {'area_m2': 2}), ('double_turns', {'turns': 2000}),
        ('double_radius', {'radius_m': 0.2}), ('zero_radius', {'radius_m': 0}),
        ('fourfold_bandwidth', {'bandwidth_hz': 4}),
        ('fourfold_resistance', {'resistance_ohm': 4000}),
        ('illustrative_35_microtesla', {'b_rms_t': 35e-6}),
        ('one_square_centimetre', {'area_m2': 1e-4}),
        ('one_millimetre_radius', {'radius_m': 1e-3}),
    ]
    cases = []
    for label, changes in valid_changes:
        inputs = BASE | changes
        cases.append({'id': label, 'input': inputs, 'expected': solve(inputs)})
    invalid = []
    for field in ['frequency_hz', 'b_rms_t', 'turns', 'area_m2', 'radius_m',
                  'temperature_k', 'resistance_ohm', 'bandwidth_hz']:
        invalid.append({'id': 'negative_' + field, 'field': field, 'value': -1})
    for field in BASE:
        for label in ['NaN', 'Infinity', '-Infinity']:
            invalid.append({'id': label + '_' + field, 'field': field, 'special': label})
    invalid += [{'id': 'zero_' + f, 'field': f, 'value': 0}
                for f in ['resistance_ohm', 'bandwidth_hz']]
    for c in invalid:
        bad = {'NaN': math.nan, 'Infinity': math.inf, '-Infinity': -math.inf}[c['special']] if 'special' in c else c['value']
        try:
            solve(BASE | {c['field']: bad})
        except ValueError:
            c['expected'] = 'reject'
        else:
            raise AssertionError(c['id'])
    result = {'schema': 'independent-r2-faraday-oracle-v1',
              'scope': 'synthetic ideal detector calculation; no tissue or universal magnetoreception bound',
              'field_convention': 'RMS', 'theta_convention': 'degrees; exact odd multiples of 90 are orthogonal',
              'relative_tolerance': 1e-10, 'absolute_zero_tolerance': 1e-25,
              'valid_cases': cases, 'invalid_cases': invalid,
              'base': BASE, 'executed_valid_cases': len(cases), 'executed_invalid_cases': len(invalid)}
    Path(__file__).with_name('fixtures.json').write_text(json.dumps(result, indent=2, allow_nan=False) + '\n')


if __name__ == '__main__':
    main()

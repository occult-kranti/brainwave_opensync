"""Independent round-1 boundary controls; no producer import or station inference."""
import cmath
import json
import math
from pathlib import Path

rows = []
for quality in (5.0, 0.6, 0.4):
    w0 = 2 * math.pi * 7.8
    gamma = w0 / (2 * quality)
    dpeak = math.sqrt(max(0.0, w0*w0 - 2*gamma*gamma))
    ring = math.sqrt(w0*w0 - gamma*gamma) if gamma < w0 else None
    poles = [-gamma + cmath.sqrt(gamma*gamma - w0*w0),
             -gamma - cmath.sqrt(gamma*gamma - w0*w0)]
    def den(w):
        return (w0*w0-w*w)**2 + (2*gamma*w)**2
    def psd(w, velocity=False, gain=1.0):
        return gain*gain * (w*w if velocity else 1.0) / den(w)
    candidates = [0.0, 0.9*w0, w0, 1.1*w0, dpeak]
    displacement_checks = all(psd(dpeak) >= psd(w)*(1-1e-14) for w in candidates)
    velocity_checks = all(psd(w0, True) >= psd(w, True)*(1-1e-14) for w in candidates)
    gain_checks = all(psd(dpeak, gain=g) >= psd(w, gain=g)*(1-1e-14)
                      for g in (0.1, 2.0, 10.0) for w in candidates)
    # Independent time quadrature under a physical harmonic force.
    mass, force, w = 2.3, 0.73, 0.87*w0
    amplitude = force / (mass * complex(w0*w0-w*w, 2*gamma*w))
    n = 4096
    pin = pout = 0.0
    for j in range(n):
        phase = 2*math.pi*j/n
        v = (1j*w*amplitude*cmath.exp(1j*phase)).real
        pin += force*math.cos(phase)*v/n
        pout += 2*mass*gamma*v*v/n
    power_relative_residual = abs(pin-pout)/max(abs(pin), abs(pout))
    assert displacement_checks and velocity_checks and gain_checks
    assert power_relative_residual < 1e-12
    assert (ring is None) == (quality <= 0.5)
    assert (dpeak == 0.0) == (quality <= 1/math.sqrt(2))
    rows.append(dict(Q=quality, displacement_peak_over_w0=dpeak/w0,
                     velocity_peak_over_w0=1.0,
                     ringdown_over_w0=ring/w0 if ring is not None else None,
                     poles_over_w0=[[p.real/w0,p.imag/w0] for p in poles],
                     displacement_sample_checks=displacement_checks,
                     velocity_sample_checks=velocity_checks,
                     positive_constant_gain_checks=gain_checks,
                     average_input_w=pin, average_damping_w=pout,
                     power_relative_residual=power_relative_residual))

result = dict(scope="Synthetic physical-force oscillator only; algebra proves the domain formulas, samples check arithmetic.",
              tolerance=dict(peak_relative_slack=1e-14, power_relative=1e-12),
              producer_imported=False, station_fits=0, rows=rows)
Path(__file__).with_suffix('.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result, indent=2))

"""Independent final-round inverse and nuisance controls; no producer import."""
import cmath
import json
import math
from pathlib import Path

def H(f, f0, gamma, mass):
    w,w0=2*math.pi*f,2*math.pi*f0
    return 1/(mass*complex(w0*w0-w*w,2*gamma*w))

def inverse(f,h,mass):
    w=2*math.pi*f
    z=1/h
    w0sq=w*w+z.real/mass
    gamma=z.imag/(2*mass*w)
    if w0sq<=0 or gamma<=0:
        return None
    return math.sqrt(w0sq)/(2*math.pi),gamma

def relative(a,b):return abs(a-b)/max(abs(a),abs(b))

cases=[dict(f0=7.8,gamma=2*math.pi*7.8/10,mass=.25),
       dict(f0=10.3,gamma=2*math.pi*10.3/6,mass=.4)]
probe,heldouts=6.4,[3.2,12.6]
recoveries=[]
for c in cases:
    h=H(probe,**c)
    fit=inverse(probe,h,c['mass'])
    assert fit is not None
    assert abs(fit[0]-c['f0'])/c['f0']<1e-13
    assert abs(fit[1]-c['gamma'])/c['gamma']<1e-13
    errors=[relative(H(f,*fit,c['mass']),H(f,**c)) for f in heldouts]
    assert max(errors)<1e-13
    wrong_phase=inverse(probe,h.conjugate(),c['mass'])
    assert wrong_phase is None
    gain=1.25
    biased=inverse(probe,gain*h,c['mass'])
    gain_errors=[relative(H(f,*biased,c['mass']),gain*H(f,**c)) for f in heldouts]
    assert min(gain_errors)>1e-3
    # Constant-gain ambiguity does not erase poles: two inverse-response points.
    f1,f2=heldouts
    w1,w2=2*math.pi*f1,2*math.pi*f2
    z1,z2=1/(gain*H(f1,**c)),1/(gain*H(f2,**c))
    effective_mass=(z1.real-z2.real)/(w2*w2-w1*w1)
    recovered_w0sq=w1*w1+z1.real/effective_mass
    recovered_gamma=z1.imag/(2*effective_mass*w1)
    assert abs(effective_mass-c['mass']/gain)/(c['mass']/gain)<1e-13
    assert abs(math.sqrt(recovered_w0sq)/(2*math.pi)-c['f0'])/c['f0']<1e-13
    assert abs(recovered_gamma-c['gamma'])/c['gamma']<1e-13
    # A bounded deterministic complex perturbation has an exact inverse bound.
    delta=h*complex(1e-5,-2e-5)
    eta=abs(delta)
    reciprocal_error=abs(1/(h+delta)-1/h)
    reciprocal_bound=eta/(abs(h)*(abs(h)-eta))
    assert reciprocal_error<=reciprocal_bound*(1+1e-10)
    recoveries.append(dict(true=c,recovered=fit,heldout_relative_errors=errors,
      conjugated_phase_rejected=wrong_phase is None,constant_gain=gain,
      wrong_known_mass_fit=biased,wrong_known_mass_heldout_errors=gain_errors,
      two_frequency_effective_mass=effective_mass,
      two_frequency_recovered_f0=math.sqrt(recovered_w0sq)/(2*math.pi),
      two_frequency_recovered_gamma=recovered_gamma,
      perturbation_reciprocal_error=reciprocal_error,perturbation_reciprocal_bound=reciprocal_bound))

fs=[1+i*.05 for i in range(381)]
receiver_errors=[]
for f in fs:
    h1,h2=H(f,**cases[0]),H(f,**cases[1])
    receiver=h2/h1
    receiver_errors.append(relative(receiver*h1,h2))
assert max(receiver_errors)<1e-13

weight=.3
mixed=lambda f:H(f,**cases[0])+weight*H(f,**cases[1])
fit=inverse(probe,mixed(probe),cases[0]['mass'])
assert fit is not None
mixed_errors=[relative(H(f,*fit,cases[0]['mass']),mixed(f)) for f in heldouts]
assert min(mixed_errors)>1e-3

out=dict(scope='Final-round synthetic mechanical controls; no experimental uncertainty certification.',
    probe_hz=probe,heldout_hz=heldouts,tolerance_relative=1e-13,
    recoveries=recoveries,arbitrary_receiver_max_relative_error=max(receiver_errors),
    multimode_fit=fit,multimode_heldout_errors=mixed_errors,
    notes=['Conjugation is a wrong-convention control only when inversion keeps exp(+i omega t).',
      'Frequency-dependent receiver construction is a bandwise nuisance, not a realized causal calibrated sensor.',
      'Finite held-out passes cannot establish universal model validity.'],producer_imported=False)
Path(__file__).with_suffix('.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(out,indent=2))

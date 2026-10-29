"""Independent R2 algebra/finite arithmetic checks; no producer import."""
import cmath
import json
import math
from pathlib import Path

def response(f, f0, quality, mass=0.25):
    w, w0 = 2*math.pi*f, 2*math.pi*f0
    gamma = w0/(2*quality)
    return 1/(mass*complex(w0*w0-w*w,2*gamma*w))

fs = [1+0.002*i for i in range(9501)]
base, colored, constant, matched = [], [], [], []
ratios=[]
for f in fs:
    h1,h2=response(f,7.8,5),response(f,9.1,4)
    p1,p2=abs(h1)**2,abs(h2)**2
    s1=1+0.1*math.cos(f)
    s2=s1*p1/p2
    y1,y2=p1*s1,p2*s2
    residual=abs(y1-y2)/max(y1,y2)
    assert s1>0 and math.isfinite(s2) and s2>0
    assert residual<1e-14
    matched.append(residual)
    ratios.append(s2/s1)
    base.append(p1)
    colored.append(p1*math.exp(0.4*(f-7.8)))
    constant.append(p1*49)

peak=lambda values:fs[max(range(len(values)),key=values.__getitem__)]
assert peak(base)==peak(constant)
assert abs(peak(base)-peak(colored))>0.002

f=8.3
h1,h2=response(f,7.8,5),response(f,9.1,4)
# A common input reaches the second mode through an explicitly complex weight.
weight=-h1/h2
coherent=abs(h1+weight*h2)**2
uncorrelated=abs(h1)**2+abs(weight*h2)**2
cross=2*(h1*(weight*h2).conjugate()).real
assert coherent/uncorrelated<1e-28
assert abs((uncorrelated+cross)-coherent)/uncorrelated<1e-14
assert uncorrelated>0
aligned=abs(h1-weight*h2)**2
assert abs(aligned/uncorrelated-2)<1e-14

result=dict(scope='Synthetic band-limited arithmetic; no global-maximum proof or station fit.',
    band_hz=[1,20],inclusive_grid_step_hz=0.002,grid_count=len(fs),
    units=dict(force_psd='N^2/Hz',displacement_psd='m^2/Hz',receiver_squared_gain='dimensionless'),
    responses=[dict(f0_hz=7.8,Q=5,mass_kg=0.25),dict(f0_hz=9.1,Q=4,mass_kg=0.25)],
    equality_max_relative_residual=max(matched),source_ratio_sample_range=[min(ratios),max(ratios)],
    peaks_hz=dict(white=peak(base),colored=peak(colored),constant_scale=peak(constant)),
    coherent_control=dict(frequency_hz=f,complex_weight=[weight.real,weight.imag],
      coherent_cancellation=coherent,uncorrelated_power=uncorrelated,cross_term=cross,
      aligned_power=aligned),
    producer_imported=False,
    limits='Source color and receiver squared gain have identical scalar-PSD algebra. Velocity/displacement PSD ratio omega^2 supplies no independent response parameter.')
Path(__file__).with_suffix('.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))

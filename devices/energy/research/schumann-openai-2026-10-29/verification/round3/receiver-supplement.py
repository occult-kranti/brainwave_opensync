"""Reviewer-requested same-known-mass isolation, frozen before producer read."""
import hashlib,json,math
from pathlib import Path
HERE=Path(__file__).resolve().parent
base=json.loads((HERE/'independent-fixtures.json').read_text())
first=dict(base['positiveCases'][0]['truth'])
second=dict(base['positiveCases'][1]['truth']);second['massKg']=first['massKg']
def h(f,p):
    w,w0=2*math.pi*f,2*math.pi*p['naturalFrequencyHz']
    return 1/(p['massKg']*complex(w0*w0-w*w,2*p['gammaPerS']*w))
points=[]
for f in [2.3,6.4,11.7,17.1]:
    gain=h(f,second)/h(f,first);observed=gain*h(f,first)
    points.append(dict(frequencyHz=f,first=first,second=second,gainReal=gain.real,gainImag=gain.imag,
                       transformedReal=observed.real,transformedImag=observed.imag,
                       secondReal=h(f,second).real,secondImag=h(f,second).imag))
probe=points[1];w=2*math.pi*probe['frequencyHz']
inverse=1/complex(probe['transformedReal'],probe['transformedImag'])
estimate=dict(naturalFrequencyHz=math.sqrt(w*w+inverse.real/first['massKg'])/(2*math.pi),
              gammaPerS=inverse.imag/(2*first['massKg']*w),massKg=first['massKg'],probeFrequencyHz=6.4)
assert math.isclose(estimate['naturalFrequencyHz'],second['naturalFrequencyHz'],rel_tol=2e-14)
result=dict(schema='round3-receiver-isolation/1',
            timing='Observation reviewer requested same-known-mass isolation after initial fixtures; this supplement was computed before verifier read any producer R3 source.',
            reason='Keep the known mass fixed so only unconstrained receiver calibration causes the wrong-pole yet held-out-passing inference.',
            points=points,estimate=estimate,oracleSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest())
out=HERE/'receiver-supplement.json';out.write_text(json.dumps(result,indent=2)+'\n')
print(hashlib.sha256(out.read_bytes()).hexdigest())

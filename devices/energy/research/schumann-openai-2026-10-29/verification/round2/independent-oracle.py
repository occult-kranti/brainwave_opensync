#!/usr/bin/env python3
"""Independent R2 fixtures; written before reading R2 producer source."""
import cmath
import hashlib
import json
import math
from pathlib import Path
import numpy as np

HERE=Path(__file__).resolve().parent
FIRST={'naturalFrequencyHz':8.,'gammaPerS':2*math.pi*8/(2*5),'massKg':.75}
SECOND={'naturalFrequencyHz':10.,'gammaPerS':2*math.pi*10/(2*2),'massKg':1.25}

def h(f,p):
    w=2*math.pi*f;w0=2*math.pi*p['naturalFrequencyHz']
    return 1/(p['massKg']*complex(w0*w0-w*w,2*p['gammaPerS']*w))

def weight(f,tilt):return math.exp(tilt*(f-8)/8)

def main():
    rows=[];mode_rows=[]
    for f in [1.,4.,7.5,8.,10.,12.,20.]:
        a=h(f,FIRST);b=h(f,SECOND)
        for tilt in [-3.,0.,3.]:
            source=.02*weight(f,tilt)
            second=source*(abs(a)/abs(b))**2
            rows.append({'frequencyHz':f,'tilt':tilt,'weight':weight(f,tilt),
                         'firstForcePsdN2PerHz':source,'secondForcePsdN2PerHz':second,
                         'firstOutputPsd':abs(a)**2*source,'secondOutputPsd':abs(b)**2*second,
                         'velocityPsd':(2*math.pi*f)**2*abs(a)**2*source,
                         'receiverGainSquared':weight(f,-tilt),
                         'receiverOutputPsd':abs(a)**2*source*weight(f,-tilt),
                         'wrongInvertedRatioOutputPsd':abs(b)**2*source*(abs(b)/abs(a))**2})
        for phase in [0.,math.pi/2,math.pi]:
            total=a+.8*cmath.exp(1j*phase)*b
            coherent=.02*abs(total)**2
            incoherent=.02*(abs(a)**2+.64*abs(b)**2)
            mode_rows.append({'frequencyHz':f,'phaseRad':phase,'coherentPsd':coherent,
                              'uncorrelatedPsd':incoherent,'crossTerm':coherent-incoherent})
    grid=np.linspace(1,20,19001);omegas=2*np.pi*grid;omega0=16*np.pi
    h2=1/(FIRST['massKg']**2*((omega0**2-omegas**2)**2+4*FIRST['gammaPerS']**2*omegas**2))
    maxima=[]
    for tilt in [-3.,0.,3.]:
        color=np.exp(tilt*(grid-8)/8)
        psd=.02*h2*color
        i=int(np.argmax(psd));scaled=int(np.argmax(17*psd))
        maxima.append({'tilt':tilt,'gridMaximumHz':float(grid[i]),
                       'constantScaledMaximumHz':float(grid[scaled]),
                       'endpointMaximum':i in [0,len(grid)-1],
                       'sameSourceAndReceiverWeightMaximumHz':float(grid[int(np.argmax(.02*h2*color))])})
    assert all(x['gridMaximumHz']==x['constantScaledMaximumHz'] for x in maxima)
    assert maxima[0]['gridMaximumHz']<maxima[1]['gridMaximumHz']<maxima[2]['gridMaximumHz']
    mismatch=max(abs(x['wrongInvertedRatioOutputPsd']-x['firstOutputPsd'])/x['firstOutputPsd'] for x in rows)
    assert mismatch>.1
    out={'schema':'schumann-round2-independent-oracle/1','read_producer_before_freeze':False,
         'source_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
         'bandHz':[1,20],'gridStepHz':.001,'first':FIRST,'second':SECOND,
         'responseCases':rows,'modeCases':mode_rows,'maxima':maxima,
         'tolerances':{'normal_relative':2e-12,'PSD_absolute':1e-22,'grid_frequency_Hz':.001,
                       'equal_mode_cancellation_relative_to_uncorrelated':1e-28},
         'wrong_ratio_max_relative_mismatch':mismatch,
         'scope':'Finite-band synthetic spectra, not observed Earth forcing or receiver calibration.'}
    (HERE/'independent-fixtures.json').write_text(json.dumps(out,indent=2)+'\n')
    print(json.dumps({'rows':len(rows),'modeRows':len(mode_rows),'maxima':maxima,
                      'wrongRatioMismatch':mismatch,'sourceSHA':out['source_sha256']},indent=2))

if __name__=='__main__':main()

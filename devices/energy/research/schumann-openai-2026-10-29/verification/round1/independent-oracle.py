#!/usr/bin/env python3
"""Round 1 oracle frozen before reading the JavaScript producer."""
import hashlib
import json
import math
from pathlib import Path

HERE=Path(__file__).resolve().parent
C=299792458.0
R=6371000.0
MU0=4*math.pi*1e-7  # stated numerical approximation, not a claim of exact SI mu0

def geometry(degree,radius,speed):
    laplacian=degree*(degree+1)
    horizontal=2*math.pi*radius/math.sqrt(laplacian)
    frequency=speed/horizontal
    return {'degree':degree,'radiusM':radius,'speedMps':speed,
            'frequencyHz':frequency,'angularFrequencyRadS':2*math.pi*frequency,
            'horizontalScaleM':horizontal,'vacuumReferenceM':C/frequency}

def characteristic(mass,f0,q):
    w0=2*math.pi*f0; gamma=w0/(2*q)
    displacement=math.sqrt(max(0,w0*w0-2*gamma*gamma))/(2*math.pi)
    free=math.sqrt(w0*w0-gamma*gamma)/(2*math.pi) if gamma<w0 else None
    return {'massKg':mass,'naturalFrequencyHz':f0,'qualityFactor':q,
            'omega0RadS':w0,'gammaPerS':gamma,
            'whiteDisplacementPeakHz':displacement,
            'whiteVelocityPeakHz':f0,'ringdownFrequencyHz':free}

def response(mass,f0,q,f):
    w0=2*math.pi*f0; gamma=w0/(2*q); w=2*math.pi*f
    h=1/complex(mass*(w0*w0-w*w),2*mass*gamma*w)
    return h

def real_quadrature(mass,f0,q,f,force_peak):
    h=response(mass,f0,q,f); omega=2*math.pi*f
    w0=2*math.pi*f0; gamma=w0/(2*q)
    n=32768
    input_samples=[]; loss_samples=[]; balance=[]
    for j in range(n):
        phase=2*math.pi*j/n
        cosine=math.cos(phase); sine=math.sin(phase)
        force=force_peak*cosine
        displacement=force_peak*(h.real*cosine-h.imag*sine)
        velocity=force_peak*omega*(-h.real*sine-h.imag*cosine)
        acceleration=-omega*omega*displacement
        power_input=force*velocity
        power_loss=2*mass*gamma*velocity*velocity
        energy_derivative=mass*velocity*(acceleration+w0*w0*displacement)
        input_samples.append(power_input);loss_samples.append(power_loss)
        balance.append(energy_derivative-(power_input-power_loss))
    return {'inputMeanW':math.fsum(input_samples)/n,
            'dampingMeanW':math.fsum(loss_samples)/n,
            'instantaneousBalanceMaxAbsW':max(map(abs,balance)),
            'pointsPerPeriod':n,
            'forcePeakN':force_peak,'frequencyHz':f,
            'independentInputComplexW':-force_peak**2*omega*h.imag/2,
            'independentDampingComplexW':mass*gamma*force_peak**2*omega**2*abs(h)**2}

def main():
    geometries=[geometry(l,r,v) for l in range(1,6)
                for r,v in [(R,C),(2*R,C),(R,C/2)]]
    reference_peaks=[7.8,14.3,20.8,27.3,33.8]
    effective_speed=reference_peaks[0]*(2*math.pi*R/math.sqrt(2))
    holdout=[{'degree':l,'referenceApproxHz':observed,
              'predictedHz':geometry(l,R,effective_speed)['frequencyHz'],
              'residualHz':geometry(l,R,effective_speed)['frequencyHz']-observed}
             for l,observed in enumerate(reference_peaks,1)]
    dynamics=[]; responses=[]; powers=[]
    for q in [5.,.6,.4]:
        dynamics.append(characteristic(.75,8.,q))
        for f in [0.,.5,2.,8.,11.,30.]:
            h=response(.75,8.,q,f)
            responses.append({'massKg':.75,'naturalFrequencyHz':8.,'qualityFactor':q,
                              'frequencyHz':f,'real':h.real,'imag':h.imag,
                              'displacementPsd':abs(h)**2,
                              'velocityPsd':(2*math.pi*f)**2*abs(h)**2})
        for f in [2.,8.,11.]:
            powers.append({'massKg':.75,'naturalFrequencyHz':8.,'qualityFactor':q,
                           **real_quadrature(.75,8.,q,f,.03)})
    fields=[{'fieldT':b,'energyDensityJm3':b*b/(2*MU0)} for b in [0.,1e-12,50e-6,100e-6]]
    wrong_controls={
        'integer_harmonics':{'mode2Hz':geometries[3]['frequencyHz'],
                            'twiceMode1Hz':2*geometries[0]['frequencyHz'],
                            'rejected':not math.isclose(geometries[3]['frequencyHz'],2*geometries[0]['frequencyHz'],rel_tol=1e-6)},
        'ringdown_equals_displacement_peak':{
            'Q':.6,'ringdownHz':dynamics[1]['ringdownFrequencyHz'],
            'displacementPeakHz':dynamics[1]['whiteDisplacementPeakHz'],
            'rejected':dynamics[1]['ringdownFrequencyHz']>0 and dynamics[1]['whiteDisplacementPeakHz']==0},
        'field_density_scales_linearly':{'fieldRatio':2,'actualDensityRatio':fields[-1]['energyDensityJm3']/fields[-2]['energyDensityJm3'],
                                       'incorrectDensityRatio':2,'rejected':True},
    }
    result={'schema':'schumann-round1-independent-oracle/1',
            'source_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'read_producer_before_freeze':False,
            'tolerances':{'normal_relative':5e-13,'response_absolute':1e-20,
                          'power_absolute_W':1e-15,'grid_peak_Hz':.0002},
            'geometry':geometries,'effectiveSpeedFit':{'speedMps':effective_speed,'speedFractionC':effective_speed/C,'holdout':holdout},
            'dynamics':dynamics,'responses':responses,'power':powers,'magneticEnergy':fields,
            'wrong_model_controls':wrong_controls,
            'scope':'Synthetic mathematical fixtures; no Earth observations or universal floating-point guarantee.'}
    (HERE/'independent-fixtures.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'geometryCases':len(geometries),'responseCases':len(responses),
                      'realQuadratures':len(powers),'dynamics':dynamics,
                      'controls':wrong_controls,'source_sha256':result['source_sha256']},indent=2))

if __name__=='__main__':main()

"""Independent NumPy reference for the finite-record acquisition demonstrator.

Written from the frozen acceptance contract before inspecting the producer code.
Synthetic signals only. It does not validate an apparatus or infer a full spectrum.
Run: python reference/acquisition-reference.py
"""
from pathlib import Path
import json
import hashlib
import numpy as np
from decimal import Decimal, localcontext
from scipy.integrate import quad
from scipy.special import spherical_jn

ROOT = Path(__file__).resolve().parent.parent
TAU = 2 * np.pi
CASES = [
    dict(id="rect-exact", sampleRateHz=8192., sampleCount=1024, window="rectangular", modes=[dict(frequencyHz=1000., amplitude=1., decayRatePerSecond=0., phaseRad=0.), dict(frequencyHz=2000., amplitude=.25, decayRatePerSecond=0., phaseRad=.4)]),
    dict(id="hann-exact", sampleRateHz=8192., sampleCount=1024, window="hann", modes=[dict(frequencyHz=1000., amplitude=1., decayRatePerSecond=0., phaseRad=0.), dict(frequencyHz=2000., amplitude=.25, decayRatePerSecond=0., phaseRad=.4)]),
    dict(id="dc-nyquist-rect", sampleRateHz=8192., sampleCount=1024, window="rectangular", modes=[dict(frequencyHz=0., amplitude=.75, decayRatePerSecond=0., phaseRad=0.), dict(frequencyHz=4096., amplitude=.2, decayRatePerSecond=0., phaseRad=0.)]),
    dict(id="dc-nyquist-hann", sampleRateHz=8192., sampleCount=1024, window="hann", modes=[dict(frequencyHz=0., amplitude=.75, decayRatePerSecond=0., phaseRad=0.), dict(frequencyHz=4096., amplitude=.2, decayRatePerSecond=0., phaseRad=0.)]),
    dict(id="leakage-damping", sampleRateHz=8192., sampleCount=2048, window="hann", modes=[dict(frequencyHz=1123.25, amplitude=1., decayRatePerSecond=1.5, phaseRad=.63), dict(frequencyHz=2470.5, amplitude=.3, decayRatePerSecond=4., phaseRad=1.2)]),
    dict(id="solid-aliased", sampleRateHz=48000., sampleCount=2048, window="hann", modes=[dict(frequencyHz=46836.628369, amplitude=1., decayRatePerSecond=.2, phaseRad=.3)]),
    dict(id="shell-aliased", sampleRateHz=44100., sampleCount=2048, window="rectangular", modes=[dict(frequencyHz=23317.724126, amplitude=1., decayRatePerSecond=.2, phaseRad=.3)]),
    dict(id="close-modes", sampleRateHz=8192., sampleCount=1024, window="hann", modes=[dict(frequencyHz=1000., amplitude=1., decayRatePerSecond=0., phaseRad=0.), dict(frequencyHz=1008., amplitude=.9, decayRatePerSecond=0., phaseRad=.5)]),
    dict(id="zero-projection", sampleRateHz=8192., sampleCount=1024, window="rectangular", modes=[dict(frequencyHz=500., amplitude=0., decayRatePerSecond=0., phaseRad=0.), dict(frequencyHz=1200., amplitude=1., decayRatePerSecond=0., phaseRad=0.)]),
    dict(id="zero-signal", sampleRateHz=8192., sampleCount=1024, window="hann", modes=[dict(frequencyHz=500., amplitude=0., decayRatePerSecond=0., phaseRad=0.)]),
    dict(id="shell-pilot", sampleRateHz=250000., sampleCount=8192, window="hann", modes=[dict(frequencyHz=23317.724126, amplitude=1., decayRatePerSecond=50., phaseRad=0.)]),
    dict(id="fully-window-suppressed-transient", sampleRateHz=1000., sampleCount=256, window="hann", modes=[dict(frequencyHz=100., amplitude=1., decayRatePerSecond=1e6, phaseRad=0.)]),
    dict(id="maximum-record-eight-modes", sampleRateHz=2e6, sampleCount=65536, window="hann", modes=[dict(frequencyHz=50000.125+57000.375*i, amplitude=1./(i+1), decayRatePerSecond=5.*i, phaseRad=.1*i) for i in range(8)]),
]

def fold(f, fs):
    # Closest integer multiple of fs gives the nonnegative real-signal alias.
    return abs(f - fs * np.floor(f / fs + .5))

def reference(case):
    n, fs = case['sampleCount'], case['sampleRateHz']
    t = np.arange(n) / fs
    y = np.zeros(n)
    for mode in case['modes']:
        y += mode['amplitude'] * np.exp(-mode['decayRatePerSecond'] * t) * np.cos(TAU * mode['frequencyHz'] * t + mode['phaseRad'])
    window = np.hanning(n + 1)[:-1] if case['window'] == 'hann' else np.ones(n)
    spectrum = np.abs(np.fft.rfft(y * window)) / window.sum()
    spectrum[1:-1] *= 2
    frequency = np.fft.rfftfreq(n, 1 / fs)
    # Keep full spectra for short fixtures; longest fixture uses selected bins.
    select = np.unique(np.r_[np.arange(min(12, len(spectrum))), np.linspace(0,len(spectrum)-1,53,dtype=int), np.arange(max(0,np.argmax(spectrum)-5), min(len(spectrum),np.argmax(spectrum)+6)), len(spectrum)-1]) if n > 2048 else np.arange(len(spectrum))
    tselect = np.unique(np.r_[np.arange(10), np.linspace(0,n-1,43,dtype=int), n-1])
    peak = None if not np.any(spectrum) else int(np.argmax(spectrum))
    return dict(id=case['id'], parameters={k:v for k,v in case.items() if k!='id'} | dict(noiseRms=0., seed=42), expected=dict(
        timeIndices=tselect.tolist(), timeSeconds=t[tselect].tolist(), timeSeries=y[tselect].tolist(), spectrumIndices=select.tolist(), frequencyHz=frequency[select].tolist(), spectrumAmplitude=spectrum[select].tolist(),
        dominantBinHz=None if peak is None else float(frequency[peak]), dominantCandidatesHz=[] if peak is None else frequency[spectrum>=spectrum.max()-1e-12*max(1.,spectrum.max())].tolist(), dominantBinAmplitude=0. if peak is None else float(spectrum[peak]), durationSeconds=n/fs, binSpacingHz=fs/n, nyquistHz=fs/2, windowCoherentGain=float(window.mean()), foldedModeHz=[float(fold(m['frequencyHz'],fs)) for m in case['modes']]))

UNCERTAINTY_CASES = [
    dict(id='independent-fit', frequencyAHz=23000., frequencyBHz=23005., fitStdAHz=.3, fitStdBHz=.4, fitCorrelation=0., temperatureStdAK=0., temperatureStdBK=0., temperatureCorrelation=0., temperatureSensitivityHzPerK=-5.4, clockStdAPpm=0., clockStdBPpm=0., clockCorrelation=0., repeatabilityStdHz=0., coverageFactor=2.),
    dict(id='shared-clock', frequencyAHz=23000., frequencyBHz=23005., fitStdAHz=0., fitStdBHz=0., fitCorrelation=0., temperatureStdAK=0., temperatureStdBK=0., temperatureCorrelation=0., temperatureSensitivityHzPerK=-5.4, clockStdAPpm=10., clockStdBPpm=10., clockCorrelation=1., repeatabilityStdHz=0., coverageFactor=2.),
    dict(id='independent-clock', frequencyAHz=23000., frequencyBHz=23005., fitStdAHz=0., fitStdBHz=0., fitCorrelation=0., temperatureStdAK=0., temperatureStdBK=0., temperatureCorrelation=0., temperatureSensitivityHzPerK=-5.4, clockStdAPpm=10., clockStdBPpm=10., clockCorrelation=0., repeatabilityStdHz=0., coverageFactor=2.),
    dict(id='mixed-covariance', frequencyAHz=23000., frequencyBHz=23005., fitStdAHz=.3, fitStdBHz=.4, fitCorrelation=-.2, temperatureStdAK=.02, temperatureStdBK=.03, temperatureCorrelation=.8, temperatureSensitivityHzPerK=-5.4, clockStdAPpm=8., clockStdBPpm=12., clockCorrelation=.7, repeatabilityStdHz=.12, coverageFactor=2.),
    dict(id='null-shared-errors', frequencyAHz=23000., frequencyBHz=23000., fitStdAHz=.3, fitStdBHz=.3, fitCorrelation=1., temperatureStdAK=.02, temperatureStdBK=.02, temperatureCorrelation=1., temperatureSensitivityHzPerK=-5.4, clockStdAPpm=10., clockStdBPpm=10., clockCorrelation=1., repeatabilityStdHz=0., coverageFactor=2.),
]

def uncertainty(case):
    c=case
    # Independent algebraic form avoids subtracting nearly equal variances.
    def diffvar(a,b,r): return (a-b)**2 + 2*a*b*(1-r)
    components=dict(fit=diffvar(c['fitStdAHz'],c['fitStdBHz'],c['fitCorrelation']),temperature=c['temperatureSensitivityHzPerK']**2 * diffvar(c['temperatureStdAK'],c['temperatureStdBK'],c['temperatureCorrelation']),clock=diffvar(c['frequencyAHz']*c['clockStdAPpm']*1e-6,c['frequencyBHz']*c['clockStdBPpm']*1e-6,c['clockCorrelation']),repeatability=c['repeatabilityStdHz']**2)
    sigma=float(np.sqrt(sum(components.values())))
    difference=c['frequencyBHz']-c['frequencyAHz']; threshold=c['coverageFactor']*sigma
    return dict(id=c['id'], parameters={k:v for k,v in c.items() if k!='id'}, expected=dict(differenceHz=difference,varianceContributions=components,combinedStdHz=sigma,comparisonThresholdHz=threshold,intervalDeltaHz=[difference-threshold,difference+threshold],exceedsThreshold=abs(difference)>threshold))

def auxetic_roots():
    """90-digit direct sine/cosine traction calculation, independent of JS series."""
    D=Decimal
    with localcontext() as context:
        context.prec=90
        def trig(x,kind):
            term=D(1) if kind=='cos' else x
            total=term;k=1
            while abs(term)>D('1e-95'):
                denominator=(2*k-1)*(2*k) if kind=='cos' else (2*k)*(2*k+1)
                term*=-x*x/D(denominator);total+=term;k+=1
            return total
        output=[]
        for nu_float in [-.9999,-.999999,-.999999999999,-.9999999999999999,.35]:
            nu=D.from_float(nu_float);q=(1-2*nu)/(2*(1-nu))
            def residual(x):
                sine=trig(x,'sin');cosine=trig(x,'cos')
                return sine/x-4*q*(sine/x**2-cosine/x)/x
            lower=D(0);upper=2*(10*(1+nu)/(3-nu)).sqrt() if nu<0 else D(3)
            for _ in range(290):
                middle=(lower+upper)/2
                if residual(middle)>0:lower=middle
                else:upper=middle
            root=(lower+upper)/2
            xf=float(root)
            modal_mass_ratio=3*quad(lambda y:y*y*(spherical_jn(1,xf*y)/spherical_jn(1,xf))**2,0,1,epsabs=1e-13,epsrel=1e-13)[0]
            output.append(dict(poisson=nu_float,root=xf,rootDecimal90=str(root),modalMassToPhysicalMass=modal_mass_ratio))
        return output

jac=np.array([[.5,-.5,-1.]])
kernel=np.array([[1.,2.],[1.,0.],[0.,1.]])
rank=int(np.linalg.matrix_rank(jac))
result=dict(schema='acquisition-reference-v1',numpyVersion=np.__version__,status='synthetic independent reference; no measured specimen',cases=[reference(c) for c in CASES],uncertaintyCases=[uncertainty(c) for c in UNCERTAINTY_CASES],auxeticRootReference=auxetic_roots(),identifiability=dict(parameters=['logE','logRho','logRadius'],jacobian=jac.tolist(),rank=rank,nullity=3-rank,kernelColumns=kernel.tolist(),kernelResidual=(jac@kernel).tolist()))
out=ROOT/'reference'/'acquisition-fixtures.json'
out.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(dict(output=str(out),cases=len(CASES),uncertaintyCases=len(UNCERTAINTY_CASES),rank=rank,nullity=3-rank,sha256=hashlib.sha256(out.read_bytes()).hexdigest())))

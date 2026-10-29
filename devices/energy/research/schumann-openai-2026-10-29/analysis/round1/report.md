# Research round 1: geometry, readout and energy references

Status: producer execution passed; independent reviewer admission is separate. This round implements the prospectively frozen `rounds/round1-contract.md`. All modeled cases are synthetic. No station data are fitted, no recent Schumann anomaly is established, and no Earth electromagnetic normalization is assigned to the mechanical oscillator.

## Statements and derivations

For an ideal, thin, lossless spherical shell of radius R with wave speed v, the degree-l spherical harmonic has horizontal wavenumber k_l=sqrt[l(l+1)]/R. The dispersion relation omega=v*k gives

\[
f_l=\frac{v\sqrt{l(l+1)}}{2\pi R},\qquad
\lambda_{h,l}=\frac{2\pi R}{\sqrt{l(l+1)}},\qquad f_l\lambda_{h,l}=v.
\]

This is an established ideal model. Its wavelength is a horizontal modal scale. A separate numerical reference c/f uses the vacuum light speed; substituting an observed lossy-cavity peak does not establish the physical propagation speed. Doubling R halves all ideal frequencies and doubles their horizontal scales. Modal ratios sqrt[l(l+1)/2] are not integer harmonics.

With R=6,371,000 m and c=299,792,458 m/s, the first ideal frequency is approximately 10.5913 Hz. A common effective speed chosen to force f1=7.8 Hz underpredicts the illustrative higher-mode sequence 14.3,20.8,27.3,33.8 Hz. These are approximate historical reference values without a joint uncertainty model here: the residuals show the limitation of this one-parameter ideal model, not statistical rejection or present-day anomalies.

The mechanical model is

\[
m\ddot q+2m\gamma\dot q+m\omega_0^2q=F(t),\qquad
H(\omega)=\frac{q}{F}=\frac{1}{m(\omega_0^2-\omega^2+2i\gamma\omega)}.
\]

Here q is displacement in metres, F is force in newtons, m is kilograms, gamma is s^-1, and H is m/N. Positive m,omega0,gamma are required. For white force PSD and constant displacement gain, the relevant denominator is D(x)=(omega0²-x)²+4gamma²*x with x=omega²>=0. Its derivative is 2x+4gamma²-2omega0² and its second derivative is positive. The PSD maximum therefore occurs at sqrt(max(0,omega0²-2gamma²)). This is a DC maximum if gamma>=omega0/sqrt(2), not a positive-frequency resonance.

For velocity readout, the PSD is proportional to x/D(x). Its derivative has the sign of D-xD'=omega0^4-x². Its unique positive-frequency maximum is omega=omega0 for every gamma>0. The homogeneous characteristic roots are -gamma±sqrt(gamma²-omega0²); an oscillatory ringdown exists only when gamma<omega0 and then has angular frequency sqrt(omega0²-gamma²). These distinctions hold for every admitted real parameter, not merely sampled test cases.

At fixed omega0 and gamma, displacement and velocity observe the **same poles** yet have different spectral maxima. Constant positive force-PSD or constant squared-gain scaling preserves either maximum. Changing gamma changes the poles; it is not an unchanged-pole control.

For the stated oscillator, E=m*qdot²/2+m*omega0²*q²/2. Multiplying its equation by qdot gives exactly

\[
\dot E=F\dot q-2m\gamma\dot q^2.
\]

For a harmonic force F0 cos(omega*t), the average input is F0 Re(i*omega*H*F0)/2 and the average dissipated power is m*gamma*|i*omega*H*F0|². The transfer formula makes them equal. The implementation separately records analytic averages and a real-time periodic quadrature of force, displacement, velocity and energy derivative. All supplied force energy remains in the balance.

Finally, the magnetic reference u_B=B_rms²/(2mu) has units J/m³. A constant field can use its constant magnitude as RMS. For B=B0+b(t) with mean b=0, the mean magnetic reference density is B0²/(2mu)+mean(b²)/(2mu); the cross term vanishes. A nonzero mean perturbation requires retaining the cross term. None of these identities gives watts, a harvesting efficiency, net cycle work or total Earth's magnetic energy. The default 4*pi*1e-7 H/m is an approximate vacuum reference.

## Actual execution

Run from `energy-observatory/`:

```sh
node research/schumann-openai-2026-10-29/analysis/round1/run.mjs
```

The runner uses its frozen `model.mjs`, rather than silently importing future revisions. `results.json` binds that module and runner by SHA-256. It passed **91 checks**, including 16 invalid/range inputs, degree-1-through-5 geometry and scaling, nine harmonic quadratures using 2,048 phases each, and unchanged-pole readout controls. Numerical tolerances were fixed before production comparisons: relative 2e-12, absolute 1e-24, sampled peak allowance 0.0011 Hz for a declared 0.001 Hz grid. Instantaneous energy residuals use a separately stated force/velocity scale.

For f0=7.8 Hz and Q=5, the analytic displacement maximum is 7.72160605 Hz; the sampled maximum is 7.722 Hz. Velocity peaks at 7.8 Hz; oscillatory ringdown is 7.76090201 Hz. Multiplying the displacement PSD by 49 keeps its sampled maximum unchanged. At Q=0.6 the displacement maximum is DC but oscillatory ringdown remains at 4.31161223 Hz. At Q=0.4 there is no oscillatory ringdown while the velocity maximum remains 7.8 Hz.

The 50 microtesla reference gives 0.0009947183943 J/m³, and the 1 picotesla RMS reference gives 3.978873577e-19 J/m³. Doubling either field quadruples its reference energy density. These inputs are illustrative, not measured station amplitudes.

## Numerical and scientific limits

The formulas are ordinary binary64 evaluations, not interval certificates or correctly rounded universal implementations. Invalid inputs and detected nonrepresentable derived scales are rejected. The API supports at most 1,000 enumerated degrees. Positive finite damping excludes the undamped singular driven limit. Explicit coefficient-underflow checks prevent a nonzero damping term or detuning from being silently interpreted as a zero coefficient.

The cavity approximation omits ionospheric conductivity, finite height, dispersion, geographic forcing, sensor response, mode interference and temporal variation. The oscillator white-force and constant-gain assumptions are substantive. An ambient measured spectrum need not satisfy them. The next round should therefore test an actual source/readout ambiguity before attempting to infer an Earth eigenfrequency from a measured peak. This is a proposal for advisor selection, not a round already executed.

Novelty: established geometry, oscillator and magnetic-energy identities applied with explicit units and reproducible controls. No new physical law or fundamental theorem is claimed.

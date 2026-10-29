# Round 1 independent verification

Reviewer: `oct_verifier`. The Python oracle and fixtures were generated and hashed before the reviewer read `src/schumann-model.mjs`. This report covers the advisor's Round 1 contract only. No Round 2 result is claimed.

## Mathematical scope

For the ideal thin spherical shell, the angular Laplacian eigenvalue is `l(l+1)/R^2`. The stipulated wave speed gives `omega_l^2=v^2*l(l+1)/R^2`; therefore `f_l=v*sqrt(l(l+1))/(2*pi*R)` and the horizontal scale is `lambda_h=2*pi*R/sqrt(l(l+1))`. These yield `f_l*lambda_h=v` exactly in the model. The separate value `c/f` is a vacuum speed reference. Substituting an observed frequency into `c/f` cannot determine the actual cavity's phase speed or angular mode. At fixed radius the ratios are square roots of `l(l+1)`, not integer harmonics.

For `m*q''+2*m*gamma*q'+m*omega0^2*q=F`, a harmonic force and the `exp(i*omega*t)` convention give `H=1/[m*(omega0^2-omega^2+2*i*gamma*omega)]`. Put `y=omega^2`. The displacement-power denominator, apart from `m^2`, is

`D(y)=y^2+(4*gamma^2-2*omega0^2)*y+omega0^4`.

Its minimum over `y>=0` occurs at `max(0,omega0^2-2*gamma^2)`. In contrast, the derivative of `y/D(y)`, the velocity-power response, has numerator `omega0^4-y^2`, so its maximum is at `omega=omega0`. The free characteristic roots are `-gamma +/- sqrt(gamma^2-omega0^2)`, giving an oscillatory ringdown only when `gamma<omega0`. Thus the three frequency notions differ under the same poles. Positivity of gamma and omega0 keeps the real-axis transfer denominator nonzero.

At natural frequency 8 Hz: Q=5 gives displacement peak 7.9195959493 Hz and ringdown 7.9598994969 Hz; Q=0.6 gives a DC displacement maximum with oscillatory ringdown 4.4221663871 Hz; Q=0.4 gives a DC maximum and no oscillatory ringdown. The velocity maximum remains 8 Hz in all three white-force, constant-gain cases.

Multiplying the equation by velocity proves `E'=F*qdot-2*m*gamma*qdot^2` for `E=m*(qdot^2+omega0^2*q^2)/2`. Integrating a periodic steady state gives equal mean input and dissipation. The independent verifier used real sine/cosine quadrature and the direct derivative of E, separately from the producer's complex power expressions.

For a constant field or a declared RMS magnetic amplitude, `u_B=B^2/(2*mu0)` is a magnetic energy-density reference. There is no extra sinusoidal half factor for an already-RMS amplitude. The default `mu0=4*pi*1e-7 H/m` is the stated approximation. A 50 microtesla field gives about 0.0009947183943 J/m^3; 1 picotesla RMS gives about 3.9788735773e-19 J/m^3. Doubling B quadruples this reference density. No power or accessible energy cycle follows.

## Executed comparison

Reproduce from `energy-observatory/`:

```sh
python3 -B research/schumann-openai-2026-10-29/verification/round1/compare_producer.py
```

The immutable oracle is `independent-oracle.py`; its generated `independent-fixtures.json` is bound in the comparison script. Executed results are in `comparison-results.json` with exact source hashes. The comparison made 79 public-API requests, including 169 scalar field comparisons and 15 invalid-input rejections. Maximum nonzero relative error was about 8.99e-16. Nine real quadratures used 32,768 points per period; three independent PSD grids used 0.0002 Hz spacing. The grid tolerance is resolution-aware and does not establish an all-frequency result.

Preregistered tolerances were 5e-13 relative for ordinary finite results, 1e-20 absolute for complex-response values and 1e-15 W absolute for power. Invalid radius, speed, degree, field amplitude, permeability, natural frequency, damping, mass, force amplitude and string-valued numerical input cases were rejected. Wrong-model controls reject integer harmonic spacing, substitution of ringdown frequency for the driven displacement peak, and linear rather than quadratic magnetic-field energy scaling.

The fitted common-speed demonstration uses an approximate historical five-frequency sequence, not a calibrated observation with uncertainty. Its higher-mode residuals show the limitations of a one-speed thin-shell fit. They are not a statistical rejection of an Earth model or a current anomaly measurement.

## Remaining limits

The checker samples finite normal-range cases; it supplies no uniform binary64 accuracy theorem. Supported numerical ranges may be narrower than the real-valued mathematical domain. The producer was separately alerted to possible underflow in dynamic coefficients before its final freeze. The admitted source rejects a zero imaginary dynamic coefficient at positive frequency, or a zero real dynamic coefficient when the two angular frequencies differ. These guards were already present in the compared final source, SHA-256 `86f92e1d90ee7b7b4ac5d8286c830d915a360f0c634fdeae4c2f3798c1443cc8`. The final verifier imports the frozen `analysis/round1/model.mjs`, preserving replay when later rounds extend the live module.

This establishes a useful known-model baseline and discriminating readout control. It does not identify Earth cavity parameters from station screenshots, calibrate a magnetic sensor, validate an OpenAI theorem or establish scientific novelty. A fixed-pole readout change can shift the observed peak; unknown forcing and receiver responses remain the next inference problem.

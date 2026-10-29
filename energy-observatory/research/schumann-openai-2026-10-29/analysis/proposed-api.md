# Producer API proposal — not a research execution

This proposal is pending the advisor's first research-round contract. No implementation, simulation result or accepted research round is claimed here. Runtime inspection found Node 24.22.1 and Python 3.12.14. All new scientific implementation will live in `src/schumann-model.mjs`; execution records and producer scripts will live in this `analysis/` directory. Existing source modules and frozen receipts remain untouched.

## Common input and evidence contract

- SI units in parameter names; finite numbers only; positive radius, propagation speed, modal frequency, mass and magnetic permeability; nonnegative damping and PSD.
- Angular frequency is `omega = 2*pi*frequencyHz`; damping rate `gammaPerS` is the coefficient in `q'' + 2*gamma*q' + omega0^2*q = F/m`, not a frequency in hertz.
- Models return explicit status and units. Every plotted series is synthetic unless it comes from a separately attributed observation record.
- Use exact `c = 299792458 m/s`. A permeability default of `4*pi*1e-7 H/m` is a vacuum **reference approximation**, not an exact post-2019 SI constant.

## Proposed exports

1. `idealCavityModes({radiusM=6371000, speedMps=299792458, maxDegree=5})`
   - For degrees `l=1..maxDegree`, return `omegaPerS`, `frequencyHz`, `horizontalWavelengthM = 2*pi*R/sqrt(l*(l+1))`.
   - Thin, lossless, spherical-shell model only. No fitted effective speed or observed Earth-frequency claim.
2. `wavelengthReference({frequencyHz, speedMps=299792458})`
   - Return `speedMps/frequencyHz`, explicitly a propagation-speed-dependent wavelength reference. An observed lossy-cavity peak does not determine its actual propagation speed.
3. `magneticEnergyReference({fieldRmsT, permeabilityHpm=4*pi*1e-7})`
   - Return time-averaged magnetic energy density `fieldRmsT^2/(2*permeabilityHpm)` in J/m³.
   - A static field may use its constant magnitude as RMS. No flux, power, harvester efficiency, net cycle energy or total Earth-field energy is inferred.
4. `dampedMode({naturalFrequencyHz, gammaPerS})`
   - Return undamped frequency, ringdown oscillation frequency if underdamped, and white-force/displacement-PSD peak frequency if the nonzero-frequency maximum exists.
   - Treat overdamped and DC-maximum cases explicitly, without taking square roots of negative numbers or claiming a resonance at an imaginary frequency.
5. `modeResponse({frequencyHz, naturalFrequencyHz, gammaPerS, massKg=1})`
   - Complex displacement/force transfer `H = 1/[m*(omega0²-omega² + 2*i*gamma*omega)]`, units m/N.
   - At the undamped resonant pole return an explicit singular condition or reject; do not return finite fabricated output.
6. `responseSpectrum(...)` (pending later-round selection)
   - Compute `S_q = |G*H|² S_F + S_noise`, with readout gain and forcing spectral shape stated. Any gain coloration or noise is a nuisance model, not fitted Earth data.
   - Preserve both true pole parameters and sampled-peak metadata so a plot cannot silently identify one with the other.
7. `calibratedModeInverse(...)` (only if selected adaptively)
   - Recover model parameters from controlled complex response measurements, with declared gain/phase assumptions and a held-out frequency check.
   - Do not label uncontrolled ambient PSD as a coherent transfer measurement.

## Candidate checks to freeze before coding

Geometry: dimensional scaling in radius/speed, `f*lambda=speed`, integer-degree validation, and the counterexample to treating modal ratios as integer harmonics. Dynamics: energy identity with input power and damping loss; white-force displacement peak versus ringdown frequency; DC-maximum and undamped-pole branches. Inverse inference: fixed poles with altered forcing can shift a spectral maximum; equal ambient spectra can arise from distinct pole parameters after changing positive forcing PSD. Independent verification must use a separate formulation, not compare repeated calls to one implementation.

The advisor will select the actual first-round scope and numerical tolerances. Subsequent exports and tests depend on observed objections, not this provisional list.

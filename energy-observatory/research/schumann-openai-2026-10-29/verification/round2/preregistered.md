# R2 independent fixture contract

Written before reading the R2 producer module. The prior R1 module is known and frozen; these fixtures independently implement the new spectral operations with Python complex arithmetic.

Band: 1–20 Hz inclusive; independent grid spacing 0.001 Hz. First oscillator: mass 0.75 kg, natural frequency 8 Hz, Q=5. Second: mass 1.25 kg, natural frequency 10 Hz, Q=2. Stable transfer functions are nonzero on this real compact band.

Force PSD is `0.02*exp(t*(f-8)/8)` N^2/Hz, with t=-3,0,3. A separate dimensionless receiver squared gain uses the same positive exponential shape. Finite-band boundedness is guaranteed; no all-frequency exponential PSD extension is assumed. Multiplication by 17 supplies the constant positive scaling control.

Independent samples: seven frequencies × three source tilts; seven frequencies × three coherent two-mode phases. The coherent second mode has dimensionless amplitude 0.8. Also test identical-mode phase 0 and pi: the former doubles the uncorrelated PSD, and the latter cancels to numerical phase precision. A PSD sum cannot replace coherent amplitude summation.

Normal-value relative tolerance: 2e-12. PSD absolute tolerance: 1e-22 in the declared SI output units. Grid maxima agreement tolerance: 0.001 Hz. Equal-mode cancellation tolerance: 1e-28 relative to the nonzero uncorrelated PSD. None is a universal error bound.

The unknown-input pair is constructed with `S2=S1*abs(H1/H2)^2`, and the deliberately reversed ratio must fail at a relative residual above 0.1 in at least one frozen sample. Since both output PSDs coincide for distinct poles, any rule using their single identical peak cannot uniquely identify which oscillator produced it. A displacement/velocity PSD ratio omega^2 is redundant, not an extra independent measurement.

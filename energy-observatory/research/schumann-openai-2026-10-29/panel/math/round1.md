# Round 1 mathematical review

Decision: **accept within the declared reference-model scope**. This review followed the frozen round1-contract.md. The independent analytic derivation was saved before reading worker results in round1-derivation.md (SHA256 723db3458d37cff3e89b6b259157a9c9347770d863e4f5e3fb024053c8c46040). Final review inspected the JavaScript, producer results and independent verifier report/results.

## Evidence inspected

The admitted implementation is src/schumann-model.mjs, SHA256 86f92e1d90ee7b7b4ac5d8286c830d915a360f0c634fdeae4c2f3798c1443cc8. Producer analysis/round1/results.json binds that same source, reports 91 passing checks and hashes to 46dea2f66433bbeff4d2a1ddfa578ca3dd6f5faf0857f45c90906065428fd808. The independent verification/round1/comparison-results.json also binds that source: 79 API requests, 169 scalar comparisons, 15 invalid-input rejections and maximum nonzero relative error 8.992431468513376e-16 against its preregistered 5e-13 relative tolerance. The independent oracle was frozen before producer inspection. These are implementation checks, not independent verification of an external theorem.

## Mathematical and quantitative findings

**Geometry.** The implementation matches f_l=v sqrt(l(l+1))/(2πR) and λ_h=2πR/sqrt(l(l+1)). Radius and speed scaling, f_l λ_h=v, and the first five modes agree with the independent oracle. The fitted speed is 220,783,736.1522542 m/s at a 7.8 Hz fundamental. Higher-mode residuals against the approximate historical reference are −0.7900, −1.6940, −2.6342 and −3.5907 Hz. They expose the one-speed model's limitation. With no measurement uncertainty model, they are not statistical rejection or evidence of a current anomaly. Horizontal modal scale and the separately computed vacuum c/f retain distinct meanings.

**Peaks and poles.** The independent all-domain derivation minimizes a quadratic in y=ω² for displacement and differentiates y/D(y) for velocity. It establishes the formulas on m,ω0,γ>0. The producer's f0=7.8 Hz, Q=5 example gives displacement maximum 7.7216060506 Hz and ringdown 7.7609020094 Hz, while velocity peaks at 7.8 Hz. Its finite grid gives 7.722 versus 7.8 Hz with identical poles; multiplying the displacement PSD by 49 leaves its peak unchanged.

The Q=0.6 case correctly has a DC displacement maximum but an oscillatory 4.3116122275 Hz ringdown. Q=0.4 has a DC maximum and no oscillatory ringdown. Thus the wrong implication “no positive displacement maximum means no oscillatory ringdown” fails. The independent fixture uses f0=8 Hz and reaches the same distinction with its separately computed values. Changing damping is a changed-pole case; changing readout at fixed full transfer parameters is the actual unchanged-pole control.

**Energy.** H has units m/N and q is mechanical displacement under physical force F. The proved identity is E'=F qdot−2mγ qdot², with E=m(qdot²+ω0²q²)/2. Nine producer harmonic cases compare complex-response power with real quadrature; the independent verifier uses its own nine real quadratures with 32,768 points per period. At the producer's resonant Q=5 case, mean input and dissipation are each approximately 2.04044798836e-5 W. No surplus appears. The magnetic examples give 9.94718394324e-4 J/m³ at 50 μT and 3.97887357730e-19 J/m³ at 1 pT RMS, with no extra RMS factor or conversion to watts.

## Resolved and remaining objections

The independent verifier raised dynamic-coefficient underflow before freeze. I inspected the final source's explicit rejection of a spuriously zero nonzero real coefficient and of a zero positive-frequency imaginary coefficient; its final hash matches the compared hash. This resolves that specific implementation objection without claiming universal floating-point accuracy. The API intentionally rejects some mathematically finite inputs outside its supported numerical range.

Known-model identities and finite checks do not establish a conductivity model for Earth, calibration of an ELF field channel, or novelty. In particular, the mechanical displacement/velocity control is a transparent example; it is not a derived mapping between actual terrestrial electric and magnetic sensors.

**Specific next question:** after holding the entire transfer function and receiver fixed, can a different admissible forcing spectrum move the observed peak; and can distinct stable transfers produce exactly identical output PSDs through a compensating source spectrum? Round 1 tests white forcing and readout choice only, so that source-identifiability question remains unresolved by these executed artifacts. No later-round implementation or conclusion is admitted here.


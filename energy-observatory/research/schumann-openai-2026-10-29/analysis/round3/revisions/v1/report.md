# Round 3 — calibrated inverse and evidence admission

This is the final contracted research round. It answers the R2 objection that an output PSD cannot separate the forcing, receiver and modal dynamics. The result is an exact inverse inside a restricted calibrated single-mode model, together with counterexamples showing why calibration and model checking remain necessary. These are established system-identification calculations applied to this dossier, not a new physical theorem, an Earth fit or a detected Schumann anomaly.

## Exact restricted inverse

Use the same mechanical convention as R1–R2: q(t)=Re(Q exp(iωt)), physical force F in newtons, displacement Q in metres, positive known mass m in kilograms, γ>0 in s⁻¹, and ω=2πf>0. Then

\[
H(\omega)=\frac{Q}{F}=\frac{1}{m(\omega_0^2-\omega^2+2i\gamma\omega)},\qquad Z=H^{-1}.
\]

Taking real and imaginary parts gives

\[
\omega_0^2=\omega^2+\frac{\Re Z}{m},\qquad
\gamma=\frac{\Im Z}{2m\omega}.
\]

Thus one exact calibrated complex datum identifies the two positive modal parameters within this assumed model. It does not establish that an unknown apparatus is a single mode. `calibratedModeInverse` rejects zero/nonfinite response, nonpositive frequency/mass and nonpositive/nonfinite reconstructed parameters. Numerical range checks do not confer a conditioning guarantee: at high probe frequency, cancellation in the real-part formula can amplify measurement or rounding error.

The implementation retains H in m/N. It does not reinterpret mechanical mass or force as an electromagnetic cavity normalization. `validateModeAtFrequencies` requires at least two distinct positive held-out frequencies, excludes the reconstruction probe, and explicitly returns `modelValidityEstablished:false` even on a pass.

## Executed controls

`run.mjs` imports the round's own frozen `model.mjs`, reads the actual R2 pair from its hashed results and uses a 5 Hz reconstruction probe. The held-out frequencies are 2.5, 10.7 and 16.4 Hz. The declared complex-response arithmetic threshold is 10⁻¹⁶ m/N plus 2×10⁻¹⁰ times the larger response magnitude. This is a numerical verification tolerance, not an experimental uncertainty budget. Parameter comparisons use 10⁻¹⁴ plus relative 3×10⁻¹².

| Synthetic input | Recovered natural frequency | Largest held-out relative discrepancy | Outcome |
|---|---:|---:|---|
| Actual R2 first oscillator, m=0.25 kg | 7.8 Hz | 6.013×10⁻¹⁷ | Pass |
| Actual R2 second oscillator, m=0.4 kg | 10.300000000000002 Hz | 0 | Pass |
| Independent f₀=1.2 Hz, γ=8 s⁻¹, m=0.7 kg | 1.199999999999999 Hz | 3.943×10⁻¹⁶ | Pass |
| Independent f₀=50 Hz, γ=60 s⁻¹, m=2 kg | 50 Hz | 1.001×10⁻¹⁷ | Pass |

The wrong phase convention conjugates H, implies negative γ and is rejected. An unmodeled constant real gain of 1.25 fails the calibrated-gain one-probe held-out test, with maximum relative disagreement 0.28744. A response H₁+0.35H₂ fitted by one mode fails with maximum disagreement 0.31968. Multiplying only the reconstruction datum by 1+10⁻⁴−2i×10⁻⁴ changes the recovered parameters and fails the strict exact-data comparison with maximum disagreement 2.59861×10⁻⁴. This final deterministic perturbation is a sensitivity example, not a statistical robustness guarantee. These declared controls do not prove that every incorrect model fails a finite set of tests.

## Receiver ambiguity and its qualification

For nonzero individual oscillator transfers, define G=H₂/H₁. Then G H₁=H₂ exactly. Positive damping ensures these individual mechanical transfers have no real-frequency poles or zeros; on a finite compact band their quotient is finite. This statement does not permit dividing by a multimode total at a cancellation node.

The actual unequal-mass R2 pair is checked at 191 frequencies from 1 through 20 Hz, spacing 0.1 Hz. Its largest complex-response relative discrepancy is 2.829×10⁻¹⁶. The reconstruction using the second mass also passes held-out checks, but that example changes the assumed mass as well as the receiver. Following the observation review, a separate receiver-only control retains the true known mass 0.25 kg and uses a target with the second oscillator's distinct poles and that same mass. It recovers the apparent 10.3 Hz oscillator and passes all held-out checks, with maximum relative discrepancy 1.341×10⁻¹⁷. Thus an unconstrained complex receiver can defeat these checks even with the correct physical mass retained.

For these specific oscillators the countermodel has a stronger system-theory form:

\[
G(s)=\frac{m_1}{m_2}
\frac{s^2+2\gamma_1s+\omega_{01}^2}
     {s^2+2\gamma_2s+\omega_{02}^2}.
\]

Both quadratics have roots with negative real parts for positive γ and ω₀. The ratio is proper, real rational and stable, with stable zeros; a causal state-space realization can include direct feedthrough. Therefore causality and stability alone do not rescue identifiability. No passive sensor hardware, actual calibration or physical realization of this response has been built or established here. The numerical evidence remains on the stated band.

An unknown **constant positive real gain** is a narrower nuisance class and must not be conflated with this frequency-dependent complex G. For Hobs=gH,

\[
Z_{\rm obs}=A(\omega_0^2-\omega^2+2i\gamma\omega),\quad A=m/g,
\qquad A=\frac{\Re Z_1-\Re Z_2}{\omega_2^2-\omega_1^2}.
\]

Two distinct positive frequencies therefore recover A, ω₀ and γ in this exact model; known m also recovers g=m/A. Only when m is unknown does the mass/gain scale remain confounded. The executed 3 and 12 Hz case recovers A=0.2 kg, f₀=7.8 Hz, γ=4.900884539600078 s⁻¹ and g=1.25. The earlier gain-error failure means the gain-one assumption was wrong; it does not mean pole recovery is impossible under a constant-gain model.

## Metadata readiness, not anomaly detection

`evidenceIntake` neither fetches nor authenticates records, and it does not run calibration, QC, spectral extraction, baseline comparison or a statistical test. It checks asserted metadata: a station/channel and Hz observable; a calibrated numeric record URL and SHA-256; strict valid calendar UTC interval, retrieval and explicit assessment cutoff; complete stated coverage; identified calibration and QC; a matched baseline; and an uncertainty/decision procedure. Required booleans are strict. Global scope also requires distinct station identifiers, complete child station metadata for the same interval, individual calibration metadata, an independence justification and a shared-observable model. IDs and textual justifications alone cannot prove independent hardware or independent errors.

The source packet is bound by hashes in `results.json`. The cutoff is 2026-10-29T04:57:39Z. The intended recent window spans October 23–29; retained numeric geomagnetic context ends at October 29 03:00 UTC, while quick-look images do not supply an authenticated calibrated numeric Schumann interval. The declared cutoff is not an assertion of complete coverage through the whole October 29 day.

| Actual intake | Admission result | Why it cannot establish a Schumann anomaly |
|---|---|---|
| Tomsk quick-look image | Insufficient evidence | No calibrated numeric SR series, verified UTC coverage, QC, matched baseline or uncertainty procedure |
| Nagycenk quick-look image | Insufficient evidence | Same required numeric and metrology gaps |
| NOAA planetary Kp numeric context | Insufficient evidence | Kp is a different observable; it is not an SR frequency measurement |

One fully specified synthetic station packet and one fully specified synthetic two-station packet return `ready-for-analysis`. They always return `metadataOnly:true` and `anomalyEstablished:false`. The example.invalid URLs and artificial hashes are explicit fictional metadata fixtures, never real measurements. Twenty-three missing/malformed/global-incomplete packet cases fail closed, including invalid calendar days, absent UTC zones, future intervals/retrievals, reversed intervals, incomplete coverage, truthy string booleans, duplicate station IDs, missing individual calibration and differing station intervals. An omitted assessment cutoff also fails.

The recent Schumann anomaly question remains unresolved. A readiness pass would only permit a separately specified analysis; it would still require trustworthy waveform/numeric records, instrument and environmental uncertainty, matched baselines, selection/multiple-comparison controls, and justified treatment of correlated stations and source/receiver nuisance models.

## Execution and stopping point

The final producer runner executes **57 assertions**, with all positive and required negative controls passing. R1 and R2 files remain unchanged. Before freeze the observational review identified an unequal-mass confound in the receiver-only interpretation; the original R2-pair calculation was retained and explicitly labeled, and the same-known-mass control was added. The math review's stable causal rational qualification was also incorporated. No acceptance threshold was changed.

Run from the repository root:

```sh
node research/schumann-openai-2026-10-29/analysis/round3/run.mjs
```

The source and input hashes are in `results.json`; `freeze.json` binds source, runner, results and this report. Independent verifier and four panel receipts are separate artifacts, so this report does not substitute producer assertions for independent review. This closes the three authorized research rounds. No fourth cycle, new energy source, direct Earth fit, local formal-proof execution or novel theorem is claimed.

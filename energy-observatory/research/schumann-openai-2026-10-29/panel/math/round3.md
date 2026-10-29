# Round 3 mathematical review

Decision: **admit the revised R3 implementation within its exact one-mode and metadata-only scope**. The restriction to a calibrated model is essential; finite held-out agreement does not establish a physical model or a Schumann anomaly. No fourth round was executed.

## Evidence inspected

The independent derivation in `round3-derivation.md` preceded worker-result inspection. This final review inspected both worker reports, their actual result records, the final inverse/receiver implementation, the preserved failure and revision record, and both freeze manifests. Recomputing SHA-256 matched all 5 producer and 15 verifier manifest entries.

| Artifact | Exact binding / result |
|---|---|
| `analysis/round3/model.mjs` | `c59e7b5d2489294c897a641a767fce25d5c743ea49e4236dcfebdc35ea1bec30` |
| `analysis/round3/results.json` | `5cdfff4035371cbc162899474f8e6f98130331b2f9a8d767d2b4d5782c5cb399`; 58 producer assertions pass |
| `verification/round3/comparison-results.json` | `e1d165e3e91109c320a27d9e29d45b785354df57b4bdb0ac592a50d7cbe6f182`; 82 API requests, 340 recorded assertions pass |
| Final independent numerical comparison | Maximum nonzero relative field discrepancy 3.206766622410441×10⁻¹³, below its 2×10⁻¹¹ comparison tolerance |
| Initial failure retained | `initial-comparison-results.json`, `initial-producer-model.mjs`, and `revision-record.md`; old snapshot is not the admitted snapshot |

Assertion totals describe code checks, not independent measurements or statistical evidence.

## Analytic claim and domain

For known m>0, a positive probe angular frequency ω, calibrated complex H=q/F, and q(t)=Re(Q exp(iωt)),

\[
 H^{-1}=m(\omega_0^2-\omega^2+2i\gamma\omega)
\]

gives ω₀²=ω²+Re(H⁻¹)/m and γ=Im(H⁻¹)/(2mω). This is a direct algebraic inverse of the assumed two-parameter model. H has units m/N; H⁻¹/m has units s⁻²; the damping formula has units s⁻¹. The code rejects nonpositive or nonfinite parameters and an unsupported numerical replay. It does not turn a mechanical effective mass into an electromagnetic cavity normalization.

The producer recovers the actual R2 7.8/10.3 Hz pair and two additional modes; its three held-outs are 2.5, 10.7 and 16.4 Hz, distinct from the 5 Hz probe. The independent oracle uses its own Q=0.6 and Q=0.4 fixtures and held-outs 2.3, 11.7 and 17.1 Hz. This addresses distinct damping regimes and avoids only reproducing the producer's chosen cases. Both reports correctly label the thresholds as arithmetic rather than observational uncertainties.

## Actual objections and their resolution

1. **Numerical range defect found, then repaired.** The original snapshot accepted H=(1−i)×10³⁰⁸ m/N at 6.4 Hz and m=0.25 kg. The inverse correction to ω² was lost, and its returned parameters could not forward-reproduce the input in the supported response/PSD range. The revised code calls the forward response and rejects unsupported range or relative replay mismatch above 10⁻¹⁰. The unchanged independent extreme fixture is now rejected, alongside the ordinary positive controls. This is a bounded repair, not a proof of uniform floating-point accuracy. Cancellation and experimental conditioning remain separate issues.
2. **Held-out residual convention differed.** The oracle used the measured-response norm; the API reports the maximum of predicted/measured norms. The preserved revision record explains the adjustment to comparison of the reported field. The original oracle decision and its tolerance were retained; both definitions reject the declared perturbation case. This is a reporting reconciliation, not a relaxed physical acceptance criterion.
3. **Unequal masses could confound a receiver-only interpretation.** The original R2 pair remains labeled as unequal mass. A separate same-known-mass control uses m=0.25 kg for both modes. Its receiver-transformed 7.8 Hz response reconstructs the apparent 10.3 Hz mode and passes all three independent held-outs with maximum relative mismatch about 4.31×10⁻¹⁶. Thus the receiver ambiguity does not require an erroneous mass.
4. **Unknown gain was initially easy to overgeneralize.** The final analysis distinguishes an arbitrary frequency-dependent complex receiver from an unknown constant positive real scalar. The latter is identifiable together with the poles using two distinct exact frequencies when m is known. No impossibility claim is retained for that narrower class.

The phase-conjugation control gives negative damping and is rejected. Declared gain-one and one-mode fits to corrupted responses fail held-outs. The producer's gain and two-mode maximum residuals are about 0.28744 and 0.31968; independent distinct cases reach about 0.3021 and 0.4901 under the oracle normalization. The perturbations are deterministic sensitivity examples, not confidence bounds. These examples do not imply all wrong models fail finite held-outs.

## Receiver ambiguity: exact qualification

Where individual H₁,H₂ are nonzero, G=H₂/H₁ gives GH₁=H₂ exactly. For our positive-damped oscillators,

\[
 G(s)=\frac{m_1}{m_2}
 \frac{s^2+2\gamma_1s+\omega_{01}^2}
      {s^2+2\gamma_2s+\omega_{02}^2}.
\]

This proper real rational transfer has stable poles and zeros and admits a causal realization with direct feedthrough. Stability and causality alone therefore do not remove the constructed ambiguity. No hardware or passive sensor realization has been demonstrated. Division by a total multimode transfer at a cancellation zero remains excluded.

For Y=gH with g>0 constant, Z=Y⁻¹=A(ω₀²−ω²+2iγω), A=m/g. Two distinct frequencies give

\[
 A=\frac{\Re Z_1-\Re Z_2}{\omega_2^2-\omega_1^2},\qquad
 \omega_0^2=\omega_1^2+\Re Z_1/A,\qquad
 \gamma=\Im Z_1/(2A\omega_1).
\]

Known m also gives g=m/A. If m is unknown, the mass/gain scale remains confounded even though poles can be recovered. Both workers execute distinct constant-gain examples. This is the precise qualification needed to prevent “uncalibrated means impossible” from becoming an overclaim.

## Observations and dashboard wording

The verifier executes 46 metadata cases: 2 synthetic readiness passes and 44 insufficient-evidence results. The actual October packet remains insufficient, with `metadataOnly:true` and `anomalyEstablished:false`. Kp is not a Schumann-frequency observable. The producer's revised report preserves missing image retrieval times as null and distinguishes them from the assessment cutoff; no inferred retrieval time is supplied. Neither metadata acceptance nor unique station IDs authenticate calibration, independence, or baseline suitability.

The reviewed dashboard source correctly distinguishes peaks from poles, vacuum wavelength from horizontal geometric scale, energy density from power, and synthetic calculations from measurements. Two earlier wording corrections are present: E1 is a **qubit** partial-dephasing bound, and the Yang–Mills comparison says no contradiction was identified in a bounded review rather than asserting full revalidation. At review time the inverse summary/results were still awaiting root's final R3 integration; they must receive final admitted figures, with these scope limits retained. The roadmap's controlled bench instruction should use at least two distinct held-out frequencies to match this contract.

## Remaining question and stopping point

The unresolved question is which justified source/receiver restrictions and independent calibrated observables could make a real modal-change estimate identifiable and statistically meaningful. The current data packet cannot answer it. Further synthetic agreement cannot replace those missing observations, and stable causality alone is not a sufficient receiver restriction.

The separate [prior-art gate](prior-art-gate.md) concludes that the present inverse, spectral ambiguity and coherence calculations are established mathematics or elementary consequences of it. This round admits a scoped implementation and preserves a repaired defect; it does not prove a novel theorem, detect a recent anomaly, or verify an external OpenAI proof. No next three-round cycle is admitted by this review.

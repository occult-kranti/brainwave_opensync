# Round 3 independent inverse derivation

Prepared from the frozen contract before reading R3 worker artifacts. This is a restricted mechanical-model derivation, not a reconstruction of Earth.

## Calibrated single-mode inverse

Assume known m>0, probe ω>0 and exact calibrated complex displacement-to-force response
\[
 H=\frac{1}{m(\omega_0^2-\omega^2+2i\gamma\omega)}
\]
under exp(iωt), with ω0,γ>0. Let Z=1/H. Then
\[
 \omega_0^2=\omega^2+\frac{\operatorname{Re}Z}{m},
 \qquad
 \gamma=\frac{\operatorname{Im}Z}{2m\omega}.
\]
H must be finite and nonzero. The reconstructed ω0² and γ must be finite and strictly positive, and binary64 computation may impose a narrower admissible range. The equations identify the two real parameters uniquely within this already assumed model and mass. A different model can agree at one complex datum; thus successful inversion alone does not establish the one-mode model.

The units are [H]=m/N=s²/kg, [Z]=kg/s², [Re Z/m]=s^-2 and [Im Z/(mω)]=s^-1. Ambient PSD is not this complex response: it lacks the calibrated input reference and relative phase.

With an unannounced conjugate convention, Im(1/conj H)=−Im(1/H), so the same formula gives negative γ and fails the positive-damping gate. That control concerns inconsistent conventions; a consistently changed Fourier convention is equally valid physics.

At a held-out frequency u>0, the recovered parameters predict the entire complex transfer. Checking it tests consistency of the declared one-mode/calibration assumptions at those selected points. It neither proves a general response function nor guarantees that every wrong model is detected.

## Perturbation limitation

For measured H+δH with |δH|≤ε|H| and 0≤ε<1,
\[
 \delta Z=-\frac{\delta H}{H(H+\delta H)},\qquad
 |\delta Z|\le\frac{\epsilon}{1-\epsilon}|Z|.
\]
Consequently
\[
 |\delta(\omega_0^2)|\le
 \frac{\epsilon |Z|}{(1-\epsilon)m},\qquad
 |\delta\gamma|\le
 \frac{\epsilon |Z|}{(1-\epsilon)2m\omega}.
\]
These bounds concern the given complex relative perturbation, not an experimentally calibrated uncertainty distribution. Reconstruction can be poorly conditioned: at frequencies far above the mode, ω² and Re Z/m nearly cancel in ω0², while a small phase error can strongly affect a small damping estimate. A single deterministic small-perturbation case cannot guarantee robust recovery for every parameter/probe configuration.

## Unconstrained receiver ambiguity

On a compact band K with H1,H2 continuous, finite and nowhere zero, define
\[
 G(f)=H_2(f)/H_1(f).
\]
G and its reciprocal are continuous and bounded, and G H1=H2 everywhere on K. Therefore a receiver allowed an arbitrary unknown frequency-dependent complex response can make one physical system imitate another even in complex held-out transfer measurements. This is an exact nuisance-model counterexample; the finite-band construction does not establish a globally causal, passive or buildable sensor. Those physical constraints would be additional assumptions requiring a different analysis.

## Unknown constant positive real gain

For the much narrower class H_obs=gH with a frequency-independent g>0, write A=m/g. Then
\[
 Z_{\rm obs}(\omega)=A(\omega_0^2-\omega^2+2i\gamma\omega).
\]
At two distinct known positive frequencies ω1,ω2,
\[
 A=\frac{\operatorname{Re}Z_{\rm obs}(\omega_1)-
          \operatorname{Re}Z_{\rm obs}(\omega_2)}
         {\omega_2^2-\omega_1^2},
\quad
 \omega_0^2=\omega_1^2+
             \frac{\operatorname{Re}Z_{\rm obs}(\omega_1)}{A},
\quad
 \gamma=\frac{\operatorname{Im}Z_{\rm obs}(\omega_1)}
               {2A\omega_1}.
\]
Under this exact single-mode class, A>0 and the pole parameters remain identifiable. If m is unknown, only the ratio m/g is recovered; mass and gain remain confounded. If m is independently known as in this contract, g=m/A is also identifiable. The imaginary-part consistency across frequencies is a further model check.

A one-frequency inverse that incorrectly assumes g=1 while using physical m instead returns
\[
 \widehat{\omega}_0^2=\omega_p^2+
       (\omega_0^2-\omega_p^2)/g,\qquad \widehat\gamma=\gamma/g.
\]
At another frequency u, its predicted inverse response differs from the measured inverse response by
\[
 Z_{\rm fit}(u)-Z_{\rm obs}(u)
 =m(1-1/g)(\omega_p^2-u^2).
\]
Thus the incorrect one-frequency fit generally fails the held-out comparison for g≠1. This failure is not proof that constant unknown gain makes pole identification fundamentally impossible.

## Metadata boundary

A record that includes station, channel, units, calibration provenance, UTC coverage, QC, baseline and a decision procedure is merely eligible for analysis. It does not establish truth of those fields, model adequacy, statistical significance, station independence, or a global anomaly. An actual incomplete quick-look/Kp packet must remain insufficient for a Schumann anomaly claim. R3's metadata function must not silently convert readiness into an anomaly result.


# Round 2 independent derivation

Prepared from the frozen Round 2 contract before reading producer or verifier R2 artifacts. All claims below concern the stated linear mechanical model on a finite positive-frequency band, not a fitted terrestrial field.

## Exact output-PSD ambiguity

Let K=[f_min,f_max] with 0<f_min<f_max<∞. Let H1,H2:K→C be continuous and nowhere zero, and let S1:K→(0,∞) be continuous. Define
\[
 S_2(f)=S_1(f)\frac{|H_1(f)|^2}{|H_2(f)|^2}.
\]
The compact-domain extreme-value theorem gives positive lower bounds for |H1|,|H2| and S1 and finite upper bounds. Thus S2 is continuous, strictly positive, bounded and integrable over K. Pointwise,
\[
 |H_2|^2S_2=|H_1|^2S_1.
\]
This identity, rather than a sampled residual, establishes the all-frequency equality on K. No outside-band behavior or physical realization of an actual lightning spectrum is inferred.

For the R1 oscillator, H_i=1/[m_i(ω0_i²−ω²+2iγ_iω)], m_i,ω0_i,γ_i>0 and ω=2πf, the denominator has no real positive-frequency zero because its imaginary part is positive. The response is finite and nowhere zero on K. Its Laplace poles have negative real parts. Two distinct such models therefore meet the construction's assumptions. If mass differs, the ratio remains dimensionless because both transfers have units m/N. Source spectra have units N²/Hz and displacement output PSD has units m²/Hz.

A known common receiver G and equal additive noise PSD preserve equality after multiplication by |G|² and addition. If G has a zero, equal observed spectra remain equal but inverse division at that zero is not justified. If the total response of several coherent modes has a node, it cannot be substituted for a nonzero H2 across that node without a new argument.

Any deterministic peak-only estimator receives the same peak from this equal-output pair and therefore cannot return both distinct underlying parameter vectors correctly. The same holds for any estimator using only that exact output PSD within K. It is a structural non-injectivity of the declared model class, not a lower bound on every experimental inference method or an empirical claim about Earth.

For a fixed H, a varying positive source PSD or receiver gain can alter the maximum of |G H|² S_F. Multiplication by a positive constant cannot change the set of maxima. A numerical example of a shifted grid maximum supports that example; it does not prove the location of an arbitrary continuous-spectrum maximum.

## Coherent and uncorrelated mixtures

Define S12(f)=E[F1(f)F2(f)*] with matching normalization and two outputs combined as
\[
 Y=H_1F_1+e^{i\phi}H_2F_2.
\]
Then
\[
 S_Y=|H_1|^2S_{11}+|H_2|^2S_{22}
 +2\operatorname{Re}(H_1e^{-i\phi}H_2^*S_{12}).
\]
For an admissible source spectral matrix, S11,S22≥0 and |S12|²≤S11 S22. These conditions make the quadratic form nonnegative.

With one common source F1=F2=F, S11=S22=S12=S_F, so
\[
 S_Y=|H_1+e^{i\phi}H_2|^2S_F.
\]
Amplitudes must be summed before squaring. The cross term depends on phase and can be negative; the total power remains nonnegative. At a selected frequency, exact cancellation requires both matched magnitudes and opposite total phase. Opposite phase alone does not cancel unequal magnitudes. With independently adjustable dimensionless participation coefficients, choosing c2=−c1 H1/H2 at one nonzero-response frequency produces cancellation there. Identical responses with equal weights cancel everywhere under phase π, but that is a special control, not generic distinct-mode behavior.

For explicitly uncorrelated sources S12=0, the output is the sum of the two power spectra and the relative phase is irrelevant. Using that sum for a coherent common source silently discards interference and is a wrong-model control. Conversely, adding amplitudes for independent sources asserts a cross correlation they do not possess. Coherence assumptions must be recorded with the numerical control.

## Redundant observable and next-data requirements

For the same displacement q, v=qdot implies V=iωQ, hence S_v=ω²S_q. The cross spectrum is likewise determined by S_q. A noiseless derivative readout gives no independent transfer/source separation; its apparent peak can differ while this information remains redundant. Separate noise, gain and differentiation filters would require their own model, not automatic identifiability.

A later discriminating experiment could measure complex displacement divided by a known coherent applied force with independently calibrated amplitude and phase, or use a separately modeled channel whose transfer ratio depends on the unknown parameters. Both demand an explicit input/readout calibration and the correct source-sharing model. This statement proposes information requirements only; no reconstruction experiment is performed here.

These source and interference formulas do not add any energy-production term to the R1 energy balance. For a physically realized stationary forcing, actual energy accounting also needs its measured amplitude and the model's damping/loading; equal output PSD is not an energy-surplus claim.


# Round 2 mathematical review

Decision: **accept the finite-band model counterexamples and scoped implementation**. The independent derivation was written before reading R2 worker artifacts in round2-derivation.md, SHA256 084f9ba4acb33cb8aba6fb545bf2b2271bb7dfb097160863f3cee77583f86dd4. The final review read the producer's new spectral functions, complete runner, summarized numerical results and representative interference outputs, plus the independent verifier's frozen report and comparison.

## Actual evidence

Both workers bind frozen analysis/round2/model.mjs at bc31ad2d8d95ffc6152bdb80ac408c3b277b1669f07fc182f9bcac38760b359d. Producer results.json hashes to 0beb9e603f0b5ba4756b925c1fc0244ebbb8de3c7f2201efa59a12156eab9819 and records 36 passing checks, including eight invalid-input rejections. Independent comparison-results.json hashes to 8e5c6f5981612d96b8900c7a2b286ea91b0aa82339c3f71918951385fddc3737: 96 API requests, 211 scalar comparisons, nine invalid-input rejections, and nine 19,001-point grids. Its largest nonzero relative discrepancy is 3.7648462045635346e-14, below its 2e-12 normal relative tolerance. The verifier reports no outstanding defect in this scope.

## What the round established

**Fixed poles, moving observed peak.** The producer holds f0=7.8 Hz, γ=4.9008845396 s^-1 and m=0.25 kg fixed on [1,20] Hz. The source-white, source-red and source-blue sampled maxima are respectively 7.722, 7.598 and 7.840 Hz. A receiver squared-gain color reproduces the blue shift; multiplying the white PSD by 49 leaves its maximum at 7.722 Hz. The stronger color control peaks at the 20 Hz endpoint and is explicitly marked band-censored. These are grid maxima with 0.001 Hz spacing, not globally certified continuous extrema or estimated station frequencies. The independently selected f0=8 Hz fixtures exhibit the same mechanism.

**Exact inverse ambiguity.** The producer's two systems have natural frequencies 7.8 and 10.3 Hz, different damping, and masses 0.25 and 0.4 kg. Its compensating source PSD is positive throughout the sampled band, with sampled minimum approximately 1.0558e-6 and maximum 5.1489e-5 N²/Hz. Both output maxima are 7.722 Hz, and the largest sampled relative output mismatch is 5.56e-16.

The stronger result follows from the separately written algebra: continuous nonzero H1,H2 and continuous positive S1 on a compact band imply that S2=S1|H1/H2|² is positive, finite, continuous and integrable; then |H2|²S2=|H1|²S1 pointwise. The numerical scan checks code, not that all-band theorem. No outside-band exponential source law or actual lightning spectrum is assumed. The verifier's intentionally reversed ratio fails with approximately 0.9996 relative mismatch, so the test discriminates the required quotient from an easy implementation error.

**Coherence matters.** The common-source two-mode calculation sums complex weighted responses before squaring. At 10 Hz, changing the phase from zero to π changes the coherent PSD from about 4.1298e-12 to 7.8722e-12 m²/Hz, while the explicitly uncorrelated comparison remains about 6.0010e-12 m²/Hz. Cross terms have both signs, but total output PSD stays nonnegative. Identical opposing signed readouts cancel exactly; separately, distinct modes cancel at the selected 9 Hz point after matching both magnitude and phase, with a residual PSD ratio approximately 1.11e-32. Opposite phase alone would not cancel unequal amplitudes.

## Objections and retained limits

The ambiguity proof must not divide by a coherent total-response node. The executed compensation uses individual stable oscillator responses, which are nonzero on the band, so it meets that restriction. The distinct-mode cancellation is a separate pointwise control; it is not fed into the compensation quotient. This resolves that domain objection.

The wrong power-sum treatment fails the coherent cancellation control. It remains correct under the separately declared uncorrelated-source assumption. The plotted readout PSD is not the total energy of the oscillators, and constructive interference does not imply an energy surplus.

The executed velocity/displacement PSD ratio agrees with ω² (maximum sampled relative residual 6.47e-16). Thus that additional derivative readout is redundant for this inverse problem. Greater numerical precision or brute-force search cannot make a non-injective forward map injective. None of these known-model identities establishes scientific novelty or a new measured Earth effect.

**Specific next question from these results:** can calibrated complex input–output transfer at known mass distinguish the actual equal-PSD pair, and does it survive a held-out frequency check? Under the stated convention the candidate inverse uses ω0²=ω²+Re(1/H)/m and γ=Im(1/H)/(2mω), with positivity and model-consistency gates. A later wrong-calibration control should distinguish arbitrary frequency-dependent gain from a constant gain: frequency diversity may retain pole information under the latter while mass and gain remain confounded. No such reconstruction or Round 3 test was executed in this review.


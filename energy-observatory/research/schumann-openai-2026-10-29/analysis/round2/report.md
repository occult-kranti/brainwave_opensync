# Research round 2: fixed poles do not identify an ambient PSD

Status: producer execution passed; independent admission is separate. This round was selected from the Round 1 objections under `rounds/round2-contract.md`. All spectra are synthetic compact-band mechanical examples. No current Earth observation or source spectrum is fitted.

## Model and exact counterexample

Retain the Round 1 mechanical displacement/force transfer H(f), with positive mass, natural frequency and damping. Let S_F(f)>0 be a force PSD in N²/Hz and let R(f)>0 be a dimensionless squared receiver gain. On the positive band I=[1,20] Hz the displacement and receiver spectra are

\[
S_q(f)=|H(2\pi f)|^2 S_F(f),\qquad
S_y(f)=R(f)S_q(f).
\]

Synthetic source color and receiver weight use exp[t*(f−7.8 Hz)/(7.8 Hz)], for a declared dimensionless tilt t. The function is positive and bounded on I. It is a deliberately chosen nuisance model, not an observed lightning law or a globally calibrated causal receiver model.

For two distinct individual oscillator transfers H1,H2, define

\[
S_2(f)=S_1(f)\left|\frac{H_1(2\pi f)}{H_2(2\pi f)}\right|^2.
\]

Positive damping and frequency ensure that each oscillator denominator is nonzero. Each H is continuous, finite and nowhere zero on I. The extreme-value theorem supplies positive minima for |H1| and |H2| and finite maxima. Therefore, for continuous positive S1, S2 is continuous, strictly positive, finite, bounded and integrable on I. Direct substitution proves

\[
|H_1|^2 S_1=|H_2|^2 S_2
\]

at every frequency in I. This is an exact all-band ambiguity statement; the finite-grid residual only checks its numerical implementation. No outside-band extension or realistic terrestrial forcing claim is needed. The argument applies to these nowhere-zero individual transfers. A coherent multimode sum can have zeros and cannot be substituted into a denominator across such a zero without a new argument.

Thus one output PSD with an unrestricted unknown source PSD cannot uniquely recover the poles. A peak-only rule necessarily assigns the same inferred frequency to the equal-output pair despite their distinct natural frequencies. More grid points or a brute-force parameter search do not remove this exact ambiguity. If velocity is merely the derivative readout of the same coordinate, S_v/S_q=(2*pi*f)², so that additional spectrum is algebraically redundant.

## Coherent and uncorrelated source models

For a common force with PSD S_F and complex dimensionless readout weights a_j, the output PSD is

\[
S_{\rm coherent}=S_F\left|\sum_j a_jH_j\right|^2.
\]

For independent, uncorrelated forces each having PSD S_F, it is instead

\[
S_{\rm uncorrelated}=S_F\sum_j|a_jH_j|^2.
\]

For two modes the coherent expression contains the cross term 2*S_F*Re[a1 H1 conjugate(a2 H2)]. It can be negative, although the complete squared magnitude is nonnegative. A phase change modifies this cross term; it does not modify the poles. Negative real `amplitude` inputs in the API represent signed receiver projections, not negative PSDs.

Two identical modal transfers with weights +1 and −1 cancel exactly in the coherent readout while their uncorrelated PSD sum remains positive. This is cancellation at the chosen observable, not zero energy in the modes. For the distinct-mode single-frequency control, the second weight's magnitude is |H1/H2| and its phase is arg(−H1)−arg(H2). Both conditions are needed: a phase offset of pi alone does not generally cancel different modes.

## Actual execution and results

```sh
node research/schumann-openai-2026-10-29/analysis/round2/run.mjs
```

The runner imports its frozen `model.mjs`. It passed **36 assertions**. The numerical grid contains **19,001 points**, 1–20 Hz inclusive with 0.001 Hz spacing. Sampled maxima are band-limited numerical findings, not certified continuous extrema. Relative tolerance is 3e-12, PSD absolute tolerance 1e-25 in the declared units, and the distinct-mode cancellation relative-PSD tolerance is 1e-27. Reported plot samples are decimated from the full evaluated grid.

The common fixed transfer has natural frequency 7.8 Hz, damping 4.9008845396 s^-1 and mass 0.25 kg. Base force PSD is 1e-6 N²/Hz.

| Scenario | Sampled maximum | Interpretation |
| --- | --- | --- |
| White source, constant receiver | 7.722 Hz | Baseline |
| Source tilt −3 only | 7.598 Hz | Changed source, identical transfer |
| Source tilt +3 only | 7.840 Hz | Changed source, identical transfer |
| Squared receiver-gain tilt +3 only | 7.840 Hz | Same product spectrum through a different nuisance factor |
| Constant PSD multiplier 49 | 7.722 Hz | No-shift control |
| Source tilt +12 | 20 Hz | Maximum reaches the band end; censored by the declared band |

The exact equal-output construction uses a second transfer with natural frequency 10.3 Hz, damping 10.7861348 s^-1 and mass 0.4 kg. Both output PSDs peak at 7.722 Hz on the grid. Their maximum relative residual is about 5.56e-16. The velocity/displacement PSD-ratio check has maximum relative residual about 6.47e-16. The constructed source remains strictly positive and finite at every sampled point; the continuity argument establishes admissibility between them.

Phase-dependent two-mode tests return nonnegative total PSDs and an unchanged uncorrelated sum. The exact identical-mode cancellation returns zero coherent PSD and positive uncorrelated PSD. Matched magnitude/phase cancellation of the distinct modes at 9 Hz has relative residual PSD about 1.11e-32. That final cancellation is a single-frequency control, not cancellation across the band.

Eight invalid or unrepresentable input cases were rejected. The first runner invocation reached the output-writing stage but failed because a file-URL string was passed to `readFile` as a path; converting it to a URL object fixed the runner. No scientific result or acceptance threshold was changed by that repair.

## API and numerical scope

The new exports are `positiveSpectralWeight`, `mechanicalPsd`, `sameOutputForcing` and `coherentModesPsd`. All retain explicit mechanical SI units and positive source PSDs. Array size and finite-range guards prevent unbounded modal enumeration or nonrepresentable transfer/PSD output. Finite accepted calculations remain binary64 approximations, not global error certificates. Earlier Round 1 snapshots remain byte-identical.

The previously proved oscillator energy identity still applies to each physically driven coordinate. Receiver color and interference alter the observable; they do not create an unaccounted energy source. Equal displacement PSDs do not imply equal dissipated powers when mass and damping differ.

## What extra information could discriminate?

A controlled complex force-to-displacement transfer measurement can divide out a known applied force and reveal amplitude and phase, provided the receiver calibration, phase convention and model class are fixed. Known mass or multiple probe frequencies can then constrain the oscillator parameters. A held-out frequency is needed to challenge a falsely restricted model. Calibrating a terrestrial sensor alone does not measure lightning forcing, and two uncontrolled station PSDs do not automatically satisfy this contract.

These are proposed next-round discriminators, not experiments already executed in this round. The exact ambiguity and interference identities are established systems mathematics; this project's contribution is a reproducible countermodel and explicit scope, with no new fundamental novelty claimed.

# Measurement / DSP scientist-agent — Round 1

Status: first independent panel pass, 22 October 2026. This is a model-agent review, not a human specialist consultation. No app edits and no physical measurements. Round 2 is intentionally not precomputed.

Reviewed applications: `sphere-lab-repo/location-spectrum` at `07e57b4`; `position-review/device-observatory/position` at `a8913c8`. Applied the OpenSync audio research and Tesla mechanism resonance skills: preserve deterministic DSP, separate arithmetic from physiological interpretation, identify the generator and units, and account for source work and losses.

## Recommendation to the panel

Combine the first app's explicit acquisition failure demonstrations with the second app's measurement protocol and local H1/block analysis. The useful next step is a **calibrated finite-band response and matched-mode workflow**, with a passive transient example and reverse checks bridging the theory, recorder and estimator. The apps already reject an undefined universal object/location frequency. Keep that boundary.

The strongest new experiment is a crossed **position × measured preload** comparison with matched geometry and interleaved phase-reversed low-amplitude excitation. Its observable is a fitted complex mechanical pole and calibrated input/output response. It tests support and instrument explanations before interpreting a position residual. A named listening state, EEG band or beat rate cannot supply the missing constitutive law for copper.

## What the implementations actually calculate

| Layer | Location Spectrum | Position Spectroscopy | Integration decision |
|---|---|---|---|
| Free object | Thin-shell uniform breathing or first radial solid mode; explicit surface-normalized solid modal mass | First three positive solid radial `l=0` roots; normalized response toy chooses total mass as illustrative modal mass | Preserve both geometry choices; do not silently equate the masses or modal families |
| Fixture | Passive two-coordinate mass/stiffness/damping model; contact energy `kc(us−φut)²/2`; FRF displacement per generalized force in m/N | Independent added-spring toy and observation-residue toy, in normalized dB | Use the first for physical units; keep the second as a clearly labeled explanatory counterexample |
| Observation | Fixed LDV projection changes amplitude only; empty-table local FRF includes source and readout participation | Changing residues can switch the tallest peak without changing the frequencies in the oscillator denominators | Show excitation/readout vectors and common modes before comparing maxima |
| Recorder | Explicit unfiltered damped-sinusoid sampling, seeded sampled noise, periodic Hann or rectangular amplitude FFT | Sampling planner plus offline Welch/CSD of synchronized force, velocity and table acceleration | Offer separate transient and stationary paths; do not feed a short free decay into an assumed stationary H1 pipeline without validating that choice |
| Estimate | Dominant FFT bin; covariance calculator for supplied uncertainties | H1 candidate response bins; Student-t block interval from supplied matched-mode fit frequencies | Neither currently implements end-to-end modal fitting and mode matching |

Reproduction of defaults: first-app 44.45 mm radius, 0.5 mm shell reference is 23,317.7241 Hz and 0.1112324 kg; its equal-radius solid reference is 46,836.6284 Hz. The second app's 12.5 mm radius solid is 166,551.0505 Hz, with next radial roots at 367,096.7937 and 558,432.0580 Hz. These are different specimens, not conflicting predictions. A 200–250 kHz instrument band covers only the first second-app radial example. None is a certificate for a fabricated specimen.

Code anchors: first `src/models.mjs:82–149`, `src/acquisition.mjs:95–139`, `src/acquisition-ui.mjs:71`; second `src/model.mjs:29–117`, `analysis/analyze.py:50–117,120–177`.

## Findings requiring a concrete integration decision

1. **Force versus voltage must be enforced by the data contract.** The second app's protocol and `research/acquisition-template.json:32–36` allow either calibrated force N or monitored drive V. Its actual trace analyzer only accepts `force_N` and always exports mobility `(m/s)/N` and force PSD `N²/Hz`. The present CLI is therefore a force-only analyzer. Add an explicit drive-quantity field/route before offering voltage records, and keep `(m/s)/V` separately typed. Piezo voltage does not become force through a column rename. Calibration must include frequency response and channel phase, not merely one nominal gain.

2. **Close the estimator gap without mislabeling the existing result.** First-app `dominantBinHz` is correctly named. Second-app `candidate_response_peaks` are also explicitly bin maxima. The block tool assumes a fit performed elsewhere and cannot authenticate mode identity. An integrated path needs a declared complex-pole/ringdown fit, residual inspection, parameter uncertainty and matching across channels/positions. Do not attach the block interval directly to each trace's tallest peak. In second-app `polesAHz`, the values are undamped natural frequencies in oscillator denominators; actual damped poles are complex. A future shared schema should distinguish `natural_frequency_hz`, `pole_oscillation_hz`, `decay_per_s`, `response_peak_hz`, and `fft_max_bin_hz`.

3. **Preload N and incremental stiffness N/m are different quantities.** Both apps mention preload, but neither predicts contact stiffness from a measured preload. The first's `contactNpm` and the second's added spring are prescribed parameters. Record static preload, fixture orientation and air supply, then calibrate the local dependence empirically. A solid Hertz contact formula is not automatically valid for the thin shell, a padded cradle or a joined sphere. Position-correlated preload cannot be removed by ABBA alone.

4. **Keep two uncertainty outputs.** The second app's Student-t interval describes repeated block contrasts under stated independence/normality assumptions; it excludes calibration, fitting, thermal and support systematic terms. The first covariance calculator can express correlated categories, but its input uncertainties are chosen, and its `k×u` has no automatic coverage interpretation. Do not simply add both totals: fit repeatability can already be included in between-block variability. Estimate covariance and document corrections separately.

5. **Band and timing are apparatus properties.** A high sample rate does not prove ultrasonic source or sensor bandwidth. Anti-alias transition band, out-of-band rejection, transducer roll-off, ADC range, clipping and synchronization must be measured. The second sampling planner's `2.5×fmax` guard is a heuristic, not a specified attenuation design. Its timestamp check establishes regular numeric spacing, not SI-second traceability or negligible jitter. A common constant clock-scale error acts on a difference; changing clock drift and interchannel timing errors do not disappear automatically. At 167 kHz, a 100 ns relative delay is about 6° of phase, which matters to the complex FRF even if magnitude looks plausible.

6. **Gravity is two different controls.** Static weight and orientation can change preload, sag and coupling and belong in the mechanical fixture budget. The first app's `gΔh/c²` is instead a comparison between clocks at different gravitational potentials, not a local material shift when specimen and recorder travel together. At its shell reference it is about `2.54×10⁻¹² Hz/m`, far beneath the proposed apparatus. Do not use a gravitational clock term as a model of contact loading or gravitational shielding.

## Pole, peak, FFT and window sanity checks

For `m x¨ + c x˙ + kx = F`, define `ωn=√(k/m)`, `γ=c/(2m)`, `fd=√(ωn²−γ²)/(2π)`. A free decay contains `fd`; its decay gives γ. An isolated displacement receptance peaks at `ωn√(1−2ζ²)` when that peak exists. An isolated force-to-velocity mobility with viscous damping peaks at `ωn`; multiplying a displacement FRF by `iω` changes the channel. Coupled modes and modal mixtures require the complete response model. FFT maxima add finite-record/window/grid effects on top of all of these.

The first app's acquisition `frequencyHz` is explicitly a damped oscillation frequency. Copying an intrinsic sphere frequency into it is disclosed as a light-damping approximation; it is not the dynamical transient of the two-mode fixture. Its default decay `50 s⁻¹` is independently chosen, whereas the default mechanical sphere damping `ζ=.002` gives approximately `293 s⁻¹` for the shell. A shared implementation must derive the transient from the selected M,C,K model or continue to label it as a separate signal demonstration.

The first app's amplitude normalization, DC/Nyquist endpoints, coherent gain, ENBW and Hann-onset warning are correctly explicit. The second's Welch bin spacing is `fs/nperseg`, not `1/(whole record duration)`, and overlapping segments are not independent experiments. For a rapid ringdown, a validated time-domain fit or appropriate transient window is needed; simply recording long post-decay noise or zero-padding does not create information. The existing `46.8366 kHz → 2.7366 kHz` unfiltered 44.1 kS/s alias is a useful falsifier, not an instruction to defeat hardware filters.

## Gateway / Hemi-Sync: what transfers

Transferable engineering concepts are controlled phase, beats, envelopes, reproducible stimulus manifests, timebase checks, level measurement, randomized conditions and explicit sham/null comparisons. They are general signal methods. A mechanical source can use an envelope or two tones, but the actual force spectrum and mechanical response must be calculated and calibrated.

The OpenSync engine's binaural renderer sends separate carriers to L/R. It does not put a mechanical difference-frequency force into a sphere. Summed tones or AM have calculable carrier/sideband content; a low-rate envelope is not automatically a linear force component at that rate. Any nonlinear demodulation claim needs its own constitutive mechanism and observable. Digital dBFS, acoustic Pa, force N and EEG μV are different calibrations. A headphone composition cannot act as an ultrasonic force/velocity calibration file.

Hemi-Sync's official page presents Focus 10 as a named listening/training state; it does not define it as a measured 10 Hz copper mode. The inspected official Gateway assessment pages concern a historical evaluation and provide no calibrated copper transduction mechanism. These source categories can inspire a separately labeled audio exhibit or stimulus-control analogy. They supply no brain-frequency-to-copper law, location code, gravity cancellation, material relocation or energy gain. Do not label a new engineering stimulus a reproduction of proprietary Hemi-Sync processing.

## New bounded proposal: preload crossover with a passive witness

First execute a numerical witness with a specified mass, stiffness, viscous loss, finite calibrated force pulse and velocity/displacement outputs. Then, if a physical pilot is commissioned, cross two independently measured low preload states at each surveyed position while preserving orientation and optical geometry. Use balanced ABBA/BAAB blocks within each preload state, randomize state order, and repeat the original state to reveal hysteresis. Preload range and drive amplitude must come from an instrument/specimen-specific linearity pilot, not the virtual numbers below.

At each setting interleave a pulse and its exact phase reversal. For a stationary linear system with unchanged initial state, force reversal reverses displacement/velocity while supplied work and loss remain unchanged. The odd half-difference emphasizes the linear driven response; the even half-sum exposes phase-independent background, offsets or even-order response. Failure of this control does not identify a location mechanism: heating, trigger mismatch, nonlinear contact, different initial states and drift must be checked. Force-proportional electrical pickup can also reverse, so phase reversal alone is insufficient; retain independent optical readout, drive-off, empty fixture, and an electrical dummy/reference control.

Primary outcomes: a common fitted pole and decay in the declared band; calibrated complex velocity/force response; the A/B contrast at each preload; and whether the residual follows preload, sensor geometry or room coordinate. Fit the preload dependence from independently varied settings, not from a permanently confounded A/B sequence. Hold out return runs or a second day for validation. Do not extrapolate a two-state calibration to a global contact law.

Energy contract for the witness: `E=mv²/2+kx²/2`, `W=∫Fv dt`, `L=∫cv² dt`, `W−L=Efinal−Einitial`. A later two-coordinate extension must include both oscillator energies and `kc(us−φut)²/2`, plus actuator/support losses. Measured mechanical work at one port is not whole-apparatus electrical efficiency.

Executed example: `examples/passive_ringdown.py` with NumPy 2.3.5/SciPy 1.17.0; output `examples/round1-example-results.json`. It uses the first app's shell modal mass, not a fabricated apparatus calibration. A virtual 1 mN bounded pulse is normalization only.

| Executed synthetic check | Result |
|---|---:|
| Undamped / damped frequency | 23,317.7241 / 23,317.6775 Hz |
| 20 ms record, Hann velocity FFT maximum | 23,300 Hz on 50 Hz bins |
| Prescribed +0.1% total stiffness; fitted damped shift | +11.6560 Hz, while FFT maximum jumps +50 Hz |
| Net mechanical source work | `6.81544×10⁻¹⁴ J` |
| Dissipated / remaining energy | `6.81538×10⁻¹⁴ / 6.62751×10⁻¹⁹ J` |
| Maximum relative energy-balance residual | `2.24×10⁻¹⁰` |
| Reverse reconstruction of stiffness from fitted fd,γ and known mass | relative error `−8.41×10⁻¹²` |
| Force phase reversal | velocity reverses exactly; work unchanged |
| Analytical +10 ppm inferred frequency scale | +0.23318 Hz |

These checks demonstrate the software/model distinction: an 11.656 Hz physical model shift can produce a 50 Hz maximum-bin change; they do not establish an experimental detection limit. This example is self-checked by this seat, not independently reviewed. Its work, loss and motion are integrated by the same solver. The tail fit uses essentially noiseless data generated by the assumed model. Analog filtering, ADC, colored noise, clipping, actual sensor calibration and jitter remain outside this executed witness and must be added before any apparatus performance claim. The support perturbation is prescribed stiffness, not derived preload.

Reverse checks for a future integrated witness: reconstruct natural frequency and stiffness from decay plus oscillation; compare energy balance; set coupling to zero; rotate/read at a node without changing poles; reverse source phase; vary supported sample rate and preserve the same in-band estimate; introduce known clock scale/delay; and recover known synthetic preload/temperature effects on held-out runs. A failed check blocks the related inference only.

## Source reading and verification

- [SciPy 1.17 CSD](https://docs.scipy.org/doc/scipy-1.17.0/reference/generated/scipy.signal.csd.html) and [Welch](https://docs.scipy.org/doc/scipy-1.17.0/reference/generated/scipy.signal.welch.html): current pinned-version definitions/settings inspected; these support the implemented cross-spectrum and density estimators, not mechanical calibration.
- [Theuss et al., arXiv:2303.03473v2 / PRL 132, 066003](https://arxiv.org/html/2303.03473v2): methods and measurement-uncertainty passages inspected. Weak contact and remounting affect the RUS inference; its other materials' numerical uncertainties are not copied to copper.
- [NIST LDV characterization](https://www.nist.gov/programs-projects/dynamic-mechanical-metrology-acceleration-force-and-acoustics/characterization): full short project description read. It treats velocity and bandwidth calibration together with LDV electronics, using a traceable frequency shift.
- [NIST gravitational clock comparison](https://www.nist.gov/news-events/news/2022/02/jila-atomic-clocks-measure-einsteins-general-relativity-millimeter-scale): official report inspected for the clock-comparison category, not as a copper-mechanics experiment.
- [Official Hemi-Sync Gateway page](https://hemi-sync.com/gateway-experience/): product and Focus-state descriptions read; vendor claims are not assumed validated endpoints. [Official GovInfo Gateway assessment scan](https://www.govinfo.gov/content/pkg/GOVPUB-D101-PURL-gpo152943/pdf/GOVPUB-D101-PURL-gpo152943.pdf): PDF pages 1–3 inspected by rendered screenshot only in this pass; no full-report reading claimed.

Verification executed: first-app acquisition tests 11/11; second-app model tests 6/6; second-app Python analysis tests 11/11; new passive witness completed with the residuals above. No full repository gate was needed for this read-only app review. No browser behavior or physical instrument performance was tested by this seat.

Round-1 completion: both actual apps/protocols/calculations compared; units, poles/peaks, aliasing, preload, clocks, gravity and bandwidth audited; audio analogy bounded; one executed finite witness and one proposed physical crossover described. Await panel discussion before Round 2.

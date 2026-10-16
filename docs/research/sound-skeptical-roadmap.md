# Sound research: mechanism tests before conclusions

Research update: 16 October 2026. Six proposals are stored in `src/sound-research/researchQuestions.ts`. Every proposal remains **Proposed**. They are extensions of established questions, not discoveries, clinical protocols or evidence that OpenSync changes health. The source survey is selective rather than exhaustive.

The useful question is not whether sound can affect a person in any way. It is which part of an intervention produces which measured change, compared with which alternative. A pleasing experience is a legitimate result. It does not automatically demonstrate a resonance mechanism, a change in brain state or repair of tissue.

## Six mechanisms to challenge

| Proposal | What the mathematics establishes | What remains unestablished | Decisive control |
| --- | --- | --- | --- |
| System before frequency | A specified linear oscillator changes response with frequency ratio and damping. | A body's transfer function, coupling and biological endpoint are not supplied by a frequency label. | Flat-response and instrument-only baselines; independently changed system parameters. |
| Envelope before band name | Modulation changes RMS, sidebands and the time envelope, even at the same nominal rate. | Whether any particular construction changes comfort or attention independently of loudness and expectation. | Zero depth, carrier-only and duplicate audio, with remaining acoustic differences disclosed. |
| Tracking versus state | Repeated responses can produce a spectrum peaked at the stimulus repetition rate. | Whether endogenous oscillations changed, and whether any separate behavior changed. | Irregular timing, stimulus-free intervals and equipment-artifact checks; competing models on held-out data. |
| Tuning without number labels | Uniform pitch scaling preserves intervals and changes register by a calculable number of cents. | A special biological optimum at a numerical tuning reference. | Nearby transpositions and hidden neutral codes, with unchanged tempo and arrangement. |
| Difference-tone accounting | A linear two-tone signal differs from a nonlinear system that generates sum/difference frequencies. | Where a measured extra component originated, or what it does biologically. | Single-tone and linear controls; distinguish pressure and envelope spectra; characterize instrument distortion. |
| Expectation versus acoustics | Identical waveforms have zero acoustic difference; ratings can be analyzed against independently varied metadata. | Whether ratings reflect perception, demand, memory or another process, and whether any clinical endpoint changes. | Byte-identical repeats, genuine acoustic contrasts, balanced order and a no-difference response. |

### Resonance is a conditional relation

For a mass–spring model, `m x'' + c x' + k x = F₀ sin(ωt)`. Defining `r=ω/√(k/m)` and `ζ=c/(2√(km))` gives normalized displacement `H=[(1−r²)²+(2ζr)²]⁻¹/²`. For weak damping, the displacement peak occurs at `r=√(1−2ζ²)`, not exactly at one. A source frequency is therefore only one input to a response model. The driving amplitude, coupling and system properties are also necessary.

The browser curve does not establish an acoustic pressure, absorbed energy, mechanical stress or cellular response. A headphone voltage waveform and mechanical contact with an actuator are different input conditions. A scalar oscillator cannot represent heterogeneous tissue merely by relabeling its axes. Physical validation should first identify a passive nonliving reference system; any later biological research is a separate undertaking requiring qualified oversight. No biological targeting or operating parameters are proposed here.

### A shared rate does not make two sounds equivalent

For the laboratory sine envelope, `x=A[(1−d/2)+(d/2)sin(2πfₘt)]sin(2πf꜀t)`. When its spectral components are distinct and cross terms average out, its mean square is `A²[(1−d/2)²+d²/8]/2`. Full-depth AM therefore has RMS `A√3/4`, while the unmodulated sine has RMS `A/√2`. At zero modulation rate this averaging formula does not apply: the chosen sine-phase envelope becomes constant. Finite files, fades and windowing require direct sample measurements rather than those asymptotic values.

Matching digital RMS still does not match perceived loudness. Matching carrier and rate also does not match spectrum: a two-tone sum and full-depth sinusoidal AM have different spectral lines. The current site's preview/export `monaural` renderer uses sine AM, while live Studio uses a two-tone sum. The new cards disclose that distinction. Comparisons must identify the actual renderer and verify the exported signal. A future renderer-unification change should have separate regression tests rather than silently changing existing sessions.

### A frequency in EEG is not a named mental state

The response-summation model `y(t)=Σh(t−tₙ)+ε(t)` can contain a spectral peak at regularly spaced event times without a self-sustaining oscillator. A periodic spectral component is thus insufficient to choose between explanations. Estimate the impulse response independently from irregular events rather than allowing a flexible kernel to absorb every outcome. Persistence alone also leaves alternatives such as a long impulse-response tail or an omission response. A published speech experiment examined responses after stimulation ended to help distinguish sustained oscillations from repeated evoked responses; its findings concern speech processing and do not validate wellness soundtracks.[2]

A primary binaural/acoustic-beat experiment reported no supported change in the tested EEG-power, heart-rate and skin-conductance comparisons after its correction for multiple comparisons.[1] That is a boundary on that study's claims, not proof that all possible auditory effects are absent. Conversely, finding an auditory steady-state response would not establish calmness or disease improvement. Recording artifacts, filter ringing and analysis flexibility must be addressed before interpreting neural measures. The app currently has neither EEG acquisition nor a validated neural model.

### Musical ratios, nonlinearities and expectation are different explanations

Uniformly changing the reference tuning multiplies all pitches by the same factor. For `k=432/440`, the shift is approximately `−31.77` cents, with frequency ratios unchanged. That algebra neither proves nor disproves a preference; it does show that assigning special significance to a number requires evidence beyond preserved musical intervals. Tempo must stay constant if pitch is the intended independent variable.

A linear sum has only its component frequencies, even when a slow envelope is visible. In the illustrative map `y=x+αx²`, cross-products generate sum and difference components. This is a mathematical example, not a model calibrated to air, the ear or tissue. Smith's physical-audio text discusses polynomial distortion in audio modelling; it is not biomedical evidence.[4] A measured extra frequency must first be separated from loudspeaker, microphone and analysis artifacts.

Expectation is a testable alternative, not a way to dismiss experience. A randomized music-format study varied the reported format as well as the actual format and found that labels influenced reported qualities.[3] It studied music-format judgments, not sound healing, and did not use our proposed identical-waveform design. The narrower lesson is that an acoustic explanation should be compared with a contextual explanation. Do not assume every improvement is placebo, or that a context effect proves a specific biological mechanism.

## Work sequence and evidence gates

| Phase | Work that can be completed in software | What the result may establish | What it cannot establish |
| --- | --- | --- | --- |
| 1. Stimulus audit | Freeze recipe, renderer version and output hash; verify channel content, RMS, peaks, spectrum, fades, duration and silent loading. Include limiting cases and duplicate-signal controls. | The file matches its stated construction, within numerical tolerance. | Actual output at a person's ear or a physiological effect. |
| 2. Model audit | Validate oscillator asymptotes and peak shifts, finite-window signal identities and parameter sensitivity. Compare several explanations instead of fitting one flexible curve. | Internal consistency and conditional mathematical predictions. | A correct model of a real body, or a newly discovered healing frequency. |
| 3. Physical measurement | Prepare analysis and provenance formats for calibrated recordings of a passive reference system. Qualified measurement work supplies the observations. | Whether the specified physical system and equipment agree with a model. | Human neural, psychological or clinical outcomes. |
| 4. Perception study design | Build neutral condition codes, exact stimulus identity checks, balanced presentation and prespecified summaries. Do not activate participant recruitment as part of this release. | A reviewable design and reliable data collection software. | Results before people are measured. Prospective research requires consent and applicable ethics oversight. |
| 5. External validation | Analyze appropriately obtained data with a locked primary endpoint, effect estimates, uncertainty and all exclusions retained. Keep replication data separate. | Evidence about the stated population, intervention, comparator and endpoint. | Universal efficacy, diagnosis or a mechanism inferred solely from a self-report difference. |

Prioritize the stimulus audit and model audit now. Existing Signal Bench, NanoLab and Harmonic Lab supply partial tools, not all six experiments. The EEG and expectation proposals intentionally have no simulation link. Their missing research capabilities are stated rather than implied to exist.

For future observational comparisons, select the primary endpoint and smallest effect of interest before analysis. A non-significant result does not prove equivalence; an interval narrow enough to exclude a prespecified meaningful effect is more informative. Separate exploratory endpoints from confirmatory ones and account for multiple comparisons. Record missing observations, early stops, order and device changes. Do not make a “best frequency” leaderboard from noisy individual observations.

## Endpoint ledger

| Endpoint level | Examples | Evidence needed |
| --- | --- | --- |
| Digital | Sample RMS, FFT, channel separation | Reproducible calculation on the actual rendered file. |
| Acoustic/mechanical | Measured pressure or displacement in a specified setup | Calibrated instrumentation, input/output characterization and uncertainty. |
| Perceptual | Comfort, preference, detectability | Appropriate comparison, neutral labeling, repeated observations and uncertainty. |
| Neurophysiological | EEG power or phase locking | Real recordings, artifact controls, prespecified analysis and an independently justified interpretation. |
| Clinical | Function, symptoms over time, health outcomes | Separately reviewed clinical research with suitable controls and follow-up. No clinical study or protocol is supplied here. |

No automatic arrow connects one row to the next. The six questions propose ways to test missing links; they do not fill those links with simulation output.

## Checked sources and scope

1. López-Caballero & Escera (2017), [Binaural Beat: A Failure to Enhance EEG Power and Emotional Arousal](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2017.00557/full). Open primary article; abstract, comparison design, results and multiple-comparison statements checked. No inference that all auditory effects are null.
2. van Bree et al. (2021), [Sustained neural rhythms reveal endogenous oscillations supporting speech perception](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3001142). Primary article; indexed abstract and the author's university publication record checked after publisher retrieval became intermittent. This is not a complete full-text audit. Used for a methodological distinction, not transfer of speech findings to healing audio.
3. Enstroem & Schmaltz (2022), [Vinyl as Fine Wine: The Role of Expectation on the Perception of Music Format](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.873517/full). Open primary article; randomized label/format design and reported interpretation checked. Used only to motivate controls for contextual effects, not to endorse the article's broader claims about format fidelity.
4. Julius O. Smith III, [Enhancing Even Harmonics, Physical Audio Signal Processing](https://www.dsprelated.com/freebooks/pasp/Enhancing_Even_Harmonics.html). Author's technical text, accessible hosted edition. Polynomial distortion is a signal-processing reference; no biological relevance is inferred.

The mathematical derivations above are independently checkable from the written assumptions. The proposed listening and biological interpretations remain untested. Searches also identified further EEG papers, but findings that were not adequately checked were not added as support.

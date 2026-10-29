# Comparison panel — observations and measurement transfer

Prepared 29 October 2026 by `oct_observations`, after the initial eight reports were frozen. Reviewed all three other roles' `papers.md` and `schumann.md`, the independent `verification/observation-checks.json`, the prior math crosswalk, E1 novelty audit, copper position protocol/derivation and location-v1.1 acquisition model, and the Energy Observatory advisor report. This comparison adds no new physical measurements or model execution. It does not edit the frozen reports.

## Decision

The recent geomagnetic context is partly quantified; the claimed recent Schumann anomaly remains unresolved. Neither an incomplete station quick-look nor the geomagnetic record establishes an anomalous global resonance-frequency shift. The independent verifier confirms the retained numerical summaries and their limits. The strongest immediate research task is a controlled demonstration of what a local spectral maximum does and does not identify, followed by a measurement-intake gate that abstains on the present station material.

## Resolving the mutable-source date conflict

The skeptic's retrieved NOAA body was dated October 8 despite a later search snippet. That retrieval cannot support October 23–29. Our separately retained response to the same mutable URL has an internal issue line of `2026 Oct 29 0030 UTC`, a retrieval timestamp of `2026-10-29T04:56:20.950210+00:00`, 1,909 bytes and SHA-256 `88028a1c2f234c415e892fdccd0d5cf90baf2ced5d2829ad54c97b82d0c32dc7`. These are distinct retrieval artifacts, not contradictory observations of the same dated bulletin. We admit only the date-appropriate saved body for this window; we do not overwrite the skeptic's evidence or infer that the service is always fresh.

The independently checked weekly response was issued October 26 and covers observations October 19–25; only its October 23–25 observations enter the requested window. Its later dates are forecasts. The October 29 forecast contains a table/rationale inconsistency about October 31 G1 conditions. That is retained as a source inconsistency, excluded from observed-event claims and outside the requested observation dates.

The verifier recomputed SHA-256 bindings, interval filters and maxima from the actual NOAA/GFZ JSON bodies. It reports `pass`, rejects duplicate/invalid/stale controls and excludes the open GFZ October 29 03:00–06:00 interval. Each provider has 49 complete intervals from October 23 00:00 through October 29 03:00 UTC, and 17 from October 27 00:00 through that same endpoint. The October 29 day is incomplete. NOAA is estimated planetary Kp; GFZ is preliminary Kp with `pre` flags. Their maximum matched-bin difference is 1.667, so averaging them or silently substituting one for the other would erase a material product distinction. Verification of a saved response is not independent upstream instrument calibration.

## Claim admission table

| Window | Observable or claim | Evidence actually held | Admission and limit |
| --- | --- | --- | --- |
| Oct 23–29, ending Oct 29 03:00 UTC | Completed-interval planetary Kp | Saved NOAA estimated and GFZ preliminary JSON; 49 completed bins each; independent recomputation | Admit provider-specific maxima 4.33 and 4.333 and no retained completed Kp≥5 bin. Does not exclude local disturbances or any Schumann event. |
| Oct 27–29, ending Oct 29 03:00 UTC | Same Kp products | 17 complete bins each | Admit maxima 2.67 and 2.667. Do not describe this as three complete UTC days. |
| Oct 23–25 | Geomagnetic and particle context | Saved NOAA weekly bulletin issued Oct 26 | Admit reported active conditions Oct 23, quiet Oct 24–25, and high >2 MeV electron flux Oct 23–25. These are different observables from ELF spectra. |
| Prior 24 hours as reported at Oct 29 00:30 UTC | NOAA radio-blackout / solar-radiation status | Observed section of retained dated bulletin | Admit that this bulletin reports no radio blackouts and radiation below storm levels for its stated look-back period. No direct GOES series was downloaded or independently analyzed here. |
| Oct 27–29 chart labels | Tomsk electric-channel time-frequency display | Primary pixels visually inspected; URL and image hash recorded, no image redistribution | Admit qualitative bands and broadband features only. Chart time zone, calibrated numerical spectra, QC and a baseline were not established. No numerical frequency anomaly is admitted. |
| Oct 29 00:00–approximately 04:45 UTC | Nagycenk current-day spectra and mode trace | Primary image with UTC axis visually inspected; observatory methods read | Admit availability of a partial-day quick-look. The visually near-7.8 Hz trace is not a calibrated estimate with uncertainty or a seven-day anomaly test; electric amplitude is shown in arbitrary units. |
| Oct 23–29 | Hylaty multi-day station record | Institutional access lead, no acquired current-window numeric series | Not available to this analysis. “Available on request” does not mean received or analyzed. |
| Oct 23–29 / Oct 27–29 | Global Schumann frequency anomaly, resonance “shutdown”, or frequency jump inferred from brightness | No calibrated multiday multistation record and matched baseline | Unresolved. A dark recording gap is not a disappearing Earth resonance; color intensity is not frequency. Several mirrors of one station are not independent replication. |
| Oct 21 / Oct 31 | G1 event / forecast | Weekly report / forecast table | Outside the requested window; the latter is a forecast, additionally internally conflicted. Neither may be inserted into the recent observed-event timeline. |

This table is a bounded availability and claim audit, not an assertion that the search located every station record or that no event occurred.

## What transfers to the existing work

**Copper position and acquisition.** The prior position protocol already distinguishes the complete dynamical matrix from input/output projections: `H(x,ω)=C(x)[K(x)−ω²M(x)+iωD(x)]⁻¹B(x)`. It contains a synthetic apparent peak shift at fixed poles and a separate contact-stiffness case that moves coupled poles. The acquisition extension further separates damped oscillation frequency, dominant FFT bin, bin spacing, ENBW and fitted-frequency uncertainty. Those established distinctions transfer directly to an ELF observation model. Their repetition in Schumann language is application and integration, not a new theorem.

A station's forced PSD may be written `S_y=|G|²|H_θ|²S_F+S_N`. A peak can move because lightning forcing, geometry, loss, noise or sensor transfer changes. With unrestricted positive source spectra on a finite band and nonzero transfer functions, different candidate responses can give the same PSD through `S_F,2=S_F,1|H_1/H_2|²`. This exact model ambiguity does not prove that actual lightning realizes arbitrary spectra. It establishes why assumptions or additional measurements are required before inferring a cavity parameter from a single PSD. Numerical frequency equality between copper, sound, EEG or electromagnetic channels supplies no coupling mechanism.

For the copper question, the next meaningful measurement remains a repeated, calibrated, same-mode A/B comparison with return, sham/remount, support/preload, temperature and clock controls. Existing ABBA/BAAB drift cancellation does not remove a confound perfectly correlated with position. A result may identify position dependence of the measured assembly; it does not by itself identify an intrinsic property of empty space.

**Energy and E1.** Current reciprocal EM/acoustic models already use input power, losses and storage. A driven Earth cavity adds an environmental source, not an exception to that balance. Static geomagnetic field energy density, ELF field amplitude, acoustic intensity and extracted electrical power are different quantities. A standing-wave energy density cannot be converted to available power by unconditionally multiplying by `c`. A quantum ergotropy bound likewise supplies no harvesting mechanism. E1 remains a correct specialization of earlier theory and a useful benchmark; its prior-art verdict is unchanged by these new releases.

**OpenAI mathematics.** The public local-smoothing statement concerns a Euclidean free half-wave propagator and specified norms. A stochastic, curved, dispersive, lossy cavity with a local sensor does not satisfy those hypotheses automatically. No inverse uniqueness, calibration or source-estimation theorem follows. ETH could be considered only after a finite inference task has an explicit fixed-width CNF encoding with controlled size and preserved answers; neither practical speedup nor continuous parameter recovery follows from the headline. The math reviewer and source reviewer additionally distinguish the manuscript's bound from its narrower formalized companion. No proposed Schumann calculation currently requires either theorem, and no local Lean execution is claimed.

The announcement of pure Yang–Mills existence has no publicly inspected physics proof in this audit and is distinct from a positive mass gap. It cannot repair the current fixed-spacing certificate's cutoff-uniformity/continuum obligations, and it does not disprove that certificate. The prior crosswalk's dimensional coupling obstruction remains a stated limitation of that particular certificate, not a counterexample to continuum Yang–Mills theory. Update the old catalogue census/date as a historical comparison; do not retroactively claim the earlier review inspected the new artifacts.

## Next missing measurement

For the recent-event question, obtain one station's numerical, calibrated channel/PSD record covering October 23–29 and its season/local-time matched baseline, with explicit UTC timestamps, transfer function, sampling/filter metadata, missingness/saturation/weather/interference flags, and reproducible mode-fit uncertainty. Preselect the statistic and baseline before labeling an extreme. A **global** event claim additionally needs independently located station records and a model separating common forcing from common cavity change. Our current Tomsk/Nagycenk images cannot supply that contract. Permission-restricted archives should be obtained through their ordinary access process; no contact or purchase is authorized or performed by this report.

The smallest practical project-side addition is a calibrated reference/source channel or another independently calibrated response channel. It can constrain the specific nuisance family in a declared model; it does not guarantee general identifiability. For power claims, acquire synchronized input/load waveforms and initial/final storage over the same boundary and interval, including the environmental source.

## Controls nominated for research round 1

1. Freeze a one-mode forced response with explicit physical/normalized units, known loss and a fixed pole. Compare flat versus colored forcing and constant versus frequency-dependent receiver response. Report the intrinsic parameter, free-decay frequency and measured spectral maximum separately. A peak-only classifier should fail at least one fixed-pole case.
2. Independently check the ideal spherical geometry and wavelength definitions. Treat a one-speed fit to a first peak as calibration; reserve higher peaks as held-out model checks. Use historical approximate peak values only as illustrative references, never as October 2026 station data.
3. Include white-forcing displacement and velocity observables as distinct analytic controls, with zero/strong damping domain checks. Keep all synthetic axes labeled and disclose if a spectral maximum occurs at a band endpoint.
4. Preserve the geometric/forced-response mismatch and source-readout ambiguity as objections for the advisor's next decision. Do not fit real station parameters or announce an anomaly from the present evidence.

The [math report](../math/schumann.md) flags an unresolved displayed-equation transcription issue in a recent Schumann paper. No copied estimator from that equation should enter these controls until checked against the primary PDF. Standard oscillator identities suffice for this bounded round.

## Evidence pointers

- [Independent observation receipt](../../verification/observation-checks.json), [frozen raw-response manifest](download-manifest.json), [GFZ manifest](gfz-download.json), [source ledger](sources.json).
- [Prior math crosswalk](../../../math-crosswalk/report.md), [E1 prior-art verdict](../../../dephasing-work-bound/novelty-audit/README.md).
- Project files read: `versions/position-v1.0/research/protocol.md`, `derivation.md`, `final-scientific-review.md`; `versions/location-v1.1/research/acquisition-model.md`; `research/advisor.md`.
- Current role reports are the six frozen files under `../sources/`, `../math/` and `../skeptic/`, plus this role's two initial reports.

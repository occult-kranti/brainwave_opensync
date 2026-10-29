# Schumann panel: independent skeptical review

Role: `oct_skeptic`; cutoff: 2026-10-29, with requested October 23–29 and October 27–29 windows. No other current panel report was read. No station waveform was acquired or fitted by this reviewer, and no recent Schumann anomaly is independently admitted here.

## Source and date checks

The primary operator [SOS70](https://sos70.ru/) explains that its spectrogram includes Schumann bands, local lightning and human-made ELF interference. Black vertical bands mean missing recordings. Its [methods page](https://sos70.ru/?page_id=43) describes 80 Hz sampling, 50-second Fourier windows shifted by five seconds, 0.02 Hz bins, and three-minute summaries. Peak frequency is selected from spectral-power maxima; amplitude is the square root of peak PSD and Q uses half-power width. This extraction procedure is an observable estimator, not direct access to a cavity eigenvalue. Its [parameters page](https://sos70.ru/?page_id=48) displays three experimental days, while weekly numerical records require a subscription. The public image link was retrieved as binary text by the web renderer and was not visually measured in this review. No subscription or redistribution permission was inferred.

A concrete freshness failure occurred twice:

| Dynamic source | Search result described | Opening the same URL returned | Admission |
| --- | --- | --- | --- |
| NOAA/NWS 3-Day Forecast | Oct 27 bulletin and Oct 27–29 forecast | Oct 8 bulletin and Oct 8–10 forecast | Reject as evidence for the requested window |
| Canadian BLC hourly magnetic ranges | Oct 27–28 table | Oct 7–8 table | Reject as evidence for the requested window |

The NOAA landing page likewise rendered an old date and unavailable values. These discrepancies could reflect retrieval caching or dynamic content; they do not establish the agencies' actual current state. Neither a recent search snippet nor a “today” title is sufficient evidence. Retrieve dated raw records and preserve bytes before using the numbers. The reviewer immediately withdrew the preliminary numerical leads sent to the advisor after the opened-page mismatch appeared.

Third-party “raised” and amplitude-score pages were found. Their current labels were not admitted as calibrated global anomalies. This is absence of adequate evidence in this bounded review, not proof that no unusual event occurred.

## Exact alternative explanations

[Koloskov, Hayakawa and Nickolaenko (2026)](https://angeo.copernicus.org/articles/44/949/2026/), introduction and section 2, explicitly distinguishes forced spectral maxima from cavity eigenfrequencies. Its source–observer model also exhibits peak changes and nodal disappearance from source geometry and neighboring-mode interference. Thus a measured peak shift alone is insufficient to identify changed Earth–ionosphere eigenvalues.

For a transparent candidate control, write the observed stationary spectrum as

\[
S_y(\omega)=|G(\omega)|^2|H(\omega)|^2S_F(\omega)+S_N(\omega).
\]

Here H is the physical transfer response, G the receiver response, F the forcing and N additive noise under the stated uncorrelated-noise model. The maximum of S_y need not occur at a pole-related frequency of H. Changing forcing color or receiver weighting can move that maximum while leaving the physical poles unchanged.

There is an exact inverse ambiguity on any finite band where two candidate responses H1 and H2 are nonzero: set S_F2=S_F1 |H1/H2|². Both are nonnegative forcing spectra and produce identical output PSDs with the same receiver and additive noise. Without an independently restricted forcing class, even a perfect single-channel PSD need not identify H. A numerical fit with many data points cannot remove this structural ambiguity. Multiple calibrated receivers can help only with an explicit shared-source/cross-spectrum model; unknown gains and mixtures can restore ambiguity.

For q''+2γq'+ω0²q=F, white forcing and displacement readout give a power maximum at sqrt(ω0²−2γ²) when positive. Velocity readout and colored forcing produce different maxima. This is a useful simple control, not a complete Earth model. Proposed next tests should compare fixed poles with changed forcing/readout before fitting new “Earth frequency” parameters.

## Wavelength, energy and anomaly gates

Specify whether wavelength means a vacuum reference c/f, an effective propagation wavelength, or the horizontal scale 2πR/sqrt(l(l+1)) of a spherical mode. These quantities are not interchangeable when loss and dispersion are present. A single fitted effective speed reproducing one peak is calibration, not a validated physical explanation of the remaining modes.

The quasi-static geomagnetic field and the ELF oscillation are separate quantities. B²/(2μ0) is an energy density, not power or guaranteed extractable energy. Multiplying it by c presumes a traveling-wave relation inappropriate to a general static or standing field. A device needs a measured flux/work balance, including loading, losses, stored-energy change and source replenishment. No local cavity calculation or new quantum existence theorem removes those obligations.

Admit a recent anomaly only after identifying the station/channel, UTC coverage, calibration, baseline distribution, preprocessing, estimator uncertainty and missing-data fraction. Predeclare whether the anomaly is amplitude, fitted frequency, bandwidth, polarization or cross-station coherence. Separate exploratory findings from a holdout test; a large scan requires an account of multiple comparisons. Solar/geomagnetic activity is contextual evidence, not a substitute Schumann measurement and not a causal explanation without timing and mechanism tests.

Recommended research outcome: test the source/readout ambiguity and model energy budget while building an honest availability ledger. If adequate dated station records remain unavailable, the dashboard should say “recent anomaly assessment unresolved,” not draw a simulated anomaly timeline.

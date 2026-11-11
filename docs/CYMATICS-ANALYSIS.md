# Cymatic Studio: analysis on one page

## Interface plan

The visual instrument remains the first view. Independent, keyboard-accessible disclosures underneath it group waveform and stereo inspection, spectrum and peaks, recent spectrogram history, signal levels, and spectral shape and bands. Open only the sections needed, or expand the live analysis together. A shared source label and held/live state identify what is being inspected.

Live panels follow the instrument's selected input. They do not ask for additional capture permission, create another audible playback path, or upload audio. Freeze holds the view; it does not mean the browser has stopped sharing. Stop capture, source changes, navigation and Panic release the capture resources through the existing input lifecycle.

A separate **complete recording report** disclosure embeds the existing Recording analysis tool, so its full collection of plots is available without leaving Cymatic Studio. Selecting a file in the instrument can supply that same File object to this report; opening the report starts its local decode and analysis. The report also retains its own file picker for a different recording. Its filename and duration identify its source independently of the live input.

## Live measurements

Live analysis uses bounded PCM frames and samples the displays at a limited rate rather than storing a continuous recording. At 48 kHz, a 2,048-sample frame spans approximately 42.7 ms. Updating the display around eight times per second does not turn those short frames into a complete continuous file.

Waveforms show the time-domain samples for the left and right channels. Digital RMS, sample peak, crest factor and DC offset describe those samples. Values expressed in dBFS are relative to digital full scale, not calibrated room sound pressure. A near-full-scale sample count is a diagnostic, not proof that clipping occurred earlier in a recording chain. A sample peak is not an intersample true-peak measurement.

Frequency analysis applies a window before the FFT. Averaging the two channels' spectral powers preserves opposite-polarity stereo energy that would disappear in a mono sum. Bin spacing is determined by sample rate divided by FFT size; interpolation can refine a peak estimate without adding true frequency resolution. A strongest spectral peak and its nearest musical note are not necessarily a fundamental pitch, particularly for chords, speech or noisy material.

The visual instrument selects its drive peak within 20–1,200 Hz. The analysis spectrum covers 20 Hz to the current Nyquist limit, so its strongest peak can differ from the frequency driving the virtual plate.

Band shares, centroid, spread, rolloff and flatness describe the spectral distribution. Stereo correlation, channel balance and mid/side energy describe the relationship between channels. Undefined values, such as correlation with a silent channel, remain unavailable rather than being shown as a confident zero.

Recent spectrogram and level histories are bounded display snapshots. Their time labels and blank gaps must reflect elapsed display time; they are not exported audio recordings. Collapsed or hidden analysis should not perform unnecessary FFT or history work.

## Complete recording report

The embedded report reuses `src/samplelab/analysis.ts` and the existing Recording analysis plots. It includes:

- Chunked STFT spectrogram and spectral centroid, spread, rolloff, flatness and flux.
- Octave-band energy and onset/tempo candidates.
- Mid/side energy, channel correlation and carrier-offset/modulation diagnostics.
- Loudness history and the existing file-based loudness and peak estimates.
- Pitch tracking, nearest-note summaries and voiced-frame coverage.
- Loop/self-similarity diagnostics, with minimum-duration and feature checks.

For captured browser-tab, laptop or audio-input sources, **Sample 10 seconds of live audio** creates a continuous audio-only recording in this page's memory and passes it to the same report. This starts only when requested. The sample stops at ten seconds and is capped at 5 MiB of encoded data; cancel, source replacement, navigation or source failure discards an unfinished sample. Original playback and sharing continue. The report's filename and decoded duration identify the resulting sample. Closing the disclosure retains its current report, and a running sample's countdown remains visible in the closed summary.

These require a decoded recording and their own analysis windows. The short live FFT panels do not claim integrated LUFS, reliable tempo, whole-recording pitch or loop detection. The full-file report may return no estimate when the recording is too short, silent, noisy or otherwise insufficient for a method.

Loop output is presented as a repetition candidate: steady tones and unchanging textures can have high similarity at many lags, so a score alone does not establish an edited or repeated recording.

The existing file engine uses an arithmetic mono mix for its spectrogram, tempo and pitch paths. Opposite-polarity channels can cancel in that mix; inspect its separate stereo diagnostics and the live channel-power spectrum before interpreting a sparse file spectrum. The live panels average channel powers and preserve this energy.

Cancelling, selecting another file or unmounting the report invalidates its pending FileReader, decode and DSP callbacks. Decode contexts are closed before pure file analysis runs. An old result cannot replace a newer file's progress or completed report. No new file-duration or file-size policy is introduced by embedding this existing tool.

## Evidence and interpretation

These are digital audio measurements and declared visual models. A detected frequency, modulation pattern, tempo or visual symmetry does not establish a physiological effect. Sand and ink remain idealized virtual-plate responses, liquid remains an artistic field, and stereo traces remain signal plots. The existing feature explanations and method uncertainty stay attached to the complete recording plots.

Related implementation: `src/cymatics/instrument/`, `src/pages/SampleLab.tsx`, `src/samplelab/analysis.ts`, `src/dsp/fft.ts` and `src/dsp/loudness.ts`.

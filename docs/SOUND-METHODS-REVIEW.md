# Sound Methods and plain-language copy

OpenSync 2.4.0 adds `/sound-methods` alongside the earlier `/harmonics` and `/channeled` pages. This review covers the new sound methods, the source research, and the copy edits. Source review date: 2026-09-13.

## Scope

This is a focused collection of 21 sources: seven patent disclosures/applications, two documentary/product descriptions, seven studies or reviews, and five software projects. It covers headphone-audio methods and related historical claims. It does not claim to have reviewed every metaphysical patent or every recording. The existing Programs Archive remains the wider historical index.

The user requested original sound implementations informed by Gateway, Monroe, papers, patents, and niche open-source tools. No commercial recordings, narration, scripts, samples, or third-party source code were copied. Synthesis code was independently written for this project. No patent-status or freedom-to-operate conclusion is made.

## Research decisions

Independent advisors reviewed primary source documents, study methods, software licenses, and implementation. A separate copy editor removed slogans and unsupported statements. Reviewers inspected the actual code and requested corrections before publication. The workflow used the project's `opensync-audio-research` skill.

| Finding | Implemented decision |
| --- | --- |
| Monroe's 1993 patent gives 100 Hz left / 104 Hz right | Reproduce that specific carrier example with a bounded output ceiling. |
| The 1994 Septon table has three tones in each channel | Reproduce the six listed tones; do not assert seven independent percepts. |
| The SAM application supplies opposite phase equations | Implement phase modulation, separate from amplitude panning. Use radians for depth. |
| Phased-noise disclosure does not provide a complete master recording | Generate seeded pink-like noise and show the chosen comb-delay range and sweep rate. |
| The 1975 method calls for an EEG-like sound envelope | A chosen sine-envelope noise demonstration states that no measured EEG signal is used. |
| Gateway report includes a 10 Hz difference example | Use a chosen 200/210 Hz pair. Do not assign a fixed Hz value to a Focus label. |
| SBaGen's Focus files cite anonymous USENET material and missing amplitudes | Do not treat those files as verified Monroe recording recipes. |
| Monaural two-tone beating and sinusoidal AM are different constructions | Give them separate sound choices and exact settings. |
| Modifying a preset can invalidate its title and default captions | Use “Custom sound,” a current-signal summary, and a separately labeled default-source note. |
| Digital peak matching does not match perceived loudness | State the distinction; no blinded or loudness-matched trial claim. |
| Electrical/RF devices cannot be represented by headphone WAVs | List the Flanagan disclosure as context, without a fake acoustic replica. |

## Implemented sounds

All default sounds last 20 seconds at a conservative −24 dBFS sample-amplitude ceiling. The user can preview 10, 20, or 30 seconds and export up to five minutes. Longer exports repeat the stationary construction; they are not complete guided courses or staged protocols.

| Sound | Default construction | Fidelity |
| --- | --- | --- |
| Monroe 4 Hz pair | L=100 Hz; R=104 Hz | Published carrier example only |
| Gateway 10 Hz example | L=200 Hz; R=210 Hz | Report's difference; chosen carriers |
| Three-pair Septon | L=200+204+208 Hz; R=204+208+212 Hz | Published carrier table only |
| Opposite stereo phase | 200 Hz carrier; offsets ±1·sin(2π·0.125·t) radians | Disclosed equation; chosen settings |
| Sweeping filtered noise | Seeded noise, opposite 0.5–5 ms comb delays; 0.125 Hz sweep; depth 0.7 | Original approximation from disclosed principle |
| Noise with 7 Hz envelope | Seeded noise × [0.5+0.5 cos(2π·7·t)] | Chosen sine envelope, no EEG data |
| Mixed 4 Hz pair | L=R=[sin(2π100t)+sin(2π104t)]/2 | Original physical-beat comparison |
| 4 Hz tone envelope | L=R=sin(2π200t)·[0.5+0.5cos(2π4t)] | Original AM comparison |
| Steady comparison | L=R=sin(2π200t) | Original labeled comparison |

Every signal receives a 50 ms raised-cosine fade at the beginning and end. Pair weights are divided by max(1, sum of weights), preserving intentionally quiet weights. Noise uses a bounded Voss–McCartney-style octave random-hold approximation with a white-noise term; it is not an exact 1/f spectrum. A deterministic seed is included in exported settings. Phase modulation is not strictly band limited, but the bounded carrier, rate, and depth keep significant sidebands well below Nyquist at supported sample rates.

`src/soundmethods/model.ts` does not modify the existing deterministic engine. Previews use shared transport tracking and the global panic path, prevent overlapping Studio sessions, require advisory acknowledgment, respect mute and governor limits, and are unavailable in infant mode. Preview playback does not update the Studio dose log. The selected gain is included in both playback and WAV samples.

Long WAVs render in a cancellable module worker. Browsers without workers allow only short exports; they do not silently run a five-minute render on the main thread. Imported recipes are validated before allocation and limited to 64 KB, known method IDs, finite numeric ranges, and supported durations. Stale imports and exports cannot overwrite newer choices or download after cancellation.

## Source corpus

Historical disclosures and documents:

- [Hull, US2304095A (1942)](https://patents.google.com/patent/US2304095A/en): slowly varied sound and proposed physiological effects.
- [Flanagan, US3393279A (1968)](https://patents.google.com/patent/US3393279A/en): electrical coupling, outside the audio renderer's scope.
- [Monroe, US3884218A (1975)](https://patents.google.com/patent/US3884218A/en): familiar sound with an EEG-like envelope.
- [Nagle, US4191175A (1980)](https://patents.google.com/patent/US4191175A/en): rhythmic filtered noise; a shared rate is not circuit replication.
- [McDonnell, Army Gateway assessment (1983)](https://documents2.theblackvault.com/documents/cia/CIA-RDP96-00788R001700210016-5.pdf): accessible mirror of the original scan. The CIA catalog PDF URL redirected to the Reading Room during review.
- [Monroe, US5213562A (1993)](https://patents.google.com/patent/US5213562A/en): binaural pairs and phased noise.
- [Monroe, US5356368A (1994)](https://patents.google.com/patent/US5356368A/en): Septon example and noise-delay method.
- [Atwater and Turner, US20130010967A1 (2013 application)](https://patents.google.com/patent/US20130010967A1/en): stereo phase modulation.
- [Monroe Sound Science, official description](https://www.monroeinstitute.org/pages/monroe-sound-science): current first-party product provenance, not independent validation.

Studies and reviews:

- [Ingendoh et al. (2023)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0286023): 14-study review; five supportive, eight negative, one mixed for the proposed EEG entrainment effect; substantial methodological variation.
- [Orozco Perez et al. (2020)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7082494/): auditory responses under binaural and monaural conditions; connectivity differences, no mood change in this experiment.
- [López-Caballero and Escera (2017)](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2017.00557/full): small study with no corresponding EEG-power or autonomic changes under its protocol.
- [Engelbregt et al. (2021)](https://link.springer.com/article/10.1007/s00221-021-06155-z): task-error differences without consistent 40–45 Hz EEG-power increase; behavioral and mechanism questions remain distinct.
- [Söderlund et al. (2010)](https://link.springer.com/article/10.1186/1744-9081-6-55): different recall responses to white noise across attention subgroups; no optimal-level claim or quiet-app replication.
- [Kanzler et al. (2023)](https://www.explorationpub.com/Journals/ent/Article/100464): exploratory combined-sound study; small sample, participant-accounting questions, varying rates, and a 0.10 significance threshold limit inference.
- [Melnichuk et al. (2025), indexed abstract](https://pubmed.ncbi.nlm.nih.gov/39910150/): parameter-design information verified; full-text retrieval was incomplete, so no detailed endpoint result is claimed.

Open-source tools:

- [SBaGen](https://uazu.net/sbagen/): GPLv2 source header verified in the official 1.4.5 archive; scheduling and carrier/noise documentation reviewed.
- [SBaGenX](https://github.com/lm7137/SBaGenX): [GPL-2.0 license](https://github.com/lm7137/SBaGenX/blob/main/COPYING.txt), public usage and curve/envelope features reviewed; executable not run.
- [Moodist](https://github.com/remvze/moodist): [MIT code license](https://github.com/remvze/moodist/blob/main/LICENSE); bundled audio has separate licenses and was not imported.
- [Kayvan Sylvan's Binaural Generator](https://github.com/ksylvan/binaural-generator): [MIT license](https://github.com/ksylvan/binaural-generator/blob/main/LICENSE); YAML schedules and export documentation reviewed.
- [Gnaural](https://gnaural.sourceforge.net/): scheduling and graph-editor documentation reviewed. Exact first-party license file not verified; no code imported.

## Copy cleanup

Home, About, Harmonic Lab, Sonic Lab, Channeled Sources, feature help, Gateway protocol captions, site metadata, and shell descriptions now use direct task and signal explanations. The cleanup removed slogans, self-praise, uncited competitor criticism, blanket patent-status statements, and unsupported Focus-number-to-Hz mapping. It also corrected the sign of the just-major-third offset relative to equal temperament.

Earlier Channeled Sources presets still retain their authored 20-second amplitude fades as metadata only. The current session engine does not execute those per-phase fades; the page states this limitation. The new Sound Methods renderer's 50 ms edge fades are implemented and tested.

## Verification

The local check passed all 1,076 tests across 77 suites, TypeScript, and the production/PWA build. Final lint, affected tests, and the Pages build passed; GitHub CI also passed on the merged release. Model tests cover exact frequency components, AM sidebands, phase-modulation cancellation, seeded noise, invalid inputs, silence, fades, and output bounds. UI tests cover natural completion, replacement, mute/panic, failed playback, infant restrictions, tightened gain, long-export separation, cancellation, numeric editing, source filtering, imported duration, and stale/invalid import handling. WAV tests compare encoded samples with renderer output and verify cancellation and long-render fallback limits.

Desktop browser checks on the published site covered Home, Sound Methods, Harmonic Lab, and Channeled Sources. Sound Methods played a generated preview reporting a −24 dBFS sample peak, completed a five-minute WAV export in its worker, and filtered the source list to five tools. The three new page layouts were inspected. Physical phone testing remains outstanding; mobile behavior is covered by the existing automated tests and responsive CSS. Actual headphone loudness is not calibrated by the application.

Publishing exposed a Pages configuration error: the source pointed to the feature branch's unbuilt files. Pages now serves the generated `gh-pages` branch. The deployment completed successfully, compiled assets and new routes returned HTTP 200, and the installed PWA loaded the release through its Update control. A final advisory correction clarifies that only Studio sessions enter the dose estimate; short previews are excluded.

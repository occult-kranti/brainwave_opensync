# Overnight sound, dreaming and controlled signal presets

Reviewed 15 October 2026. This is a targeted primary-source review and implementation record, not a systematic or exhaustive inventory of every government program. It extends [the listening evidence review](listening-evidence-2026-10-15.md), whose sourcebook covers US archives, Soviet apparatus, Russian research, Chinese research and official qigong guidance, and spiritual books.

## Evidence and its application

| Source | What was accessible | Finding and design consequence |
| --- | --- | --- |
| [Basner et al., 2026, Sleep, PMID 41627391](https://pubmed.ncbi.nlm.nih.gov/41627391/) and [Penn Medicine report](https://www.pennmedicine.org/news/pink-noise-reduces-rem-sleep-and-may-harm-sleep-quality) | Indexed primary abstract; university report. PMC full text encountered access screening. | A controlled 25-adult experiment found reduced REM in the tested pink-noise condition. This is a reason to default to a short wind-down, not evidence that every sound or every level has the same effect. |
| [Konkoly et al., 2024, Consciousness and Cognition](https://pubmed.ncbi.nlm.nih.gov/39278157/) | Abstract and figure descriptions; PMC full text screening. | Home TLR paired training with replay of the trained cue and compared control conditions. A continuous untrained tone is not an equivalent intervention. Do not label the overnight preset TLR or promise lucidity. |
| [Auditory-triggered reality checks, IJoDR 2026](https://doi.org/10.11588/ijodr.2026.1.115408) | Indexed publisher record; full text blocked. | Current sleep-laboratory research lead. No numerical result or copied stimulus prescription is claimed. |
| [Multisensory induction, August 2026 preprint](https://www.biorxiv.org/content/10.1101/2024.06.21.600133v2) | Indexed abstract; full text 403. | Preregistered multicenter study of trained multisensory cues during REM and sham conditions. Preprint status and access limitations are visible in the app. No effectiveness result is asserted. |
| [Aspy, 2020, International Lucid Dream Induction Study](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.01746/full) | Primary publication. | Cognitive induction concerns intention, recall and practice, not a universal audio-frequency prescription. The app offers an original pre-sleep intention and journal prompt without waking the listener. |
| [NCCIH music and health](https://www.nccih.nih.gov/health/music-and-health-what-you-need-to-know) | Government evidence summary. | Subjective sleep quality and insomnia severity are different outcomes. The reviewed music interventions do not establish the effects of these steady tones. |
| [NHLBI sleep duration](https://www.nhlbi.nih.gov/health/sleep/how-much-sleep) | Official guidance. | Adults generally need 7–9 hours of sleep. The requested seven hours is a soundtrack duration, not a limit on time asleep. |
| [CIA retrospective on psychic research](https://www.cia.gov/stories/story/ask-molly-did-cia-really-study-psychic-powers) | Official 2021 retrospective. Original 1995 AIR report URL redirected to the archive home. | CIA describes the program's operational unreliability and decision not to restore it. Archival existence does not validate a remote-viewing frequency or an overnight audio protocol. The app supplies a journal background and encourages blinded scoring of any separate experiment. |
| [Leadbeater, The Astral Plane (1895)](https://www.gutenberg.org/ebooks/21080) | Primary historical book, introductory material and contents inspected. | Theosophical claims are presented as beliefs. No frequency prescription is extracted or literal separation of consciousness promised. |
| [Blanke et al., Nature (2002)](https://www.nature.com/articles/419269a) | Primary abstract. | Altered body perception under electrical stimulation offers a neuroscientific account of subjective experience; it is not an audio study or validation of astral travel. |
| [Cordi et al., 2014](https://pubmed.ncbi.nlm.nih.gov/24882909/) | Previously reviewed primary study, see companion review. | Spoken hypnotic suggestion is not interchangeable with an instrumental tone. The app clearly labels the absence of voice and hidden messages. |

Government custody, research funding, inventor nationality, university affiliation, and positive clinical evidence are distinct facts. The Russian and Chinese records in the sourcebook do not establish a seven-hour home sound protocol. No claim to have searched inaccessible secret programs is made.

## Mathematical support and limits

Seven hours is 420 minutes or 25,200 seconds. The overnight presets use two identical 12,600-second phases because the existing persistence format caps a single phase at six hours. This partition has no physiological meaning and does not prescribe sleep cycles.

A carrier frequency counts audio cycles per second; a modulation frequency describes an envelope. Neither quantity alone measures EEG or identifies REM. Fixed blocks cannot substitute for a sleep-stage sensor. Consequently, the new overnight planner has no scheduled dream cues or fake REM windows.

At the same calibrated acoustic level, seven hours has fourteen times the energy of thirty minutes. The equal-energy difference is `10 log10(14) ≈ 11.46 dB`. This does not turn a digital fader into a sound-pressure measurement and does not predict sleep quality.

At 48,000 samples/s, stereo PCM16 for seven hours needs `25,200 × 48,000 × 2 × 2 + 44 = 4,838,400,044` bytes. It exceeds ordinary RIFF/WAV's practical 32-bit size limit, while full float buffers need still more memory. Browser export therefore rejects plans over the existing 90-minute workflow before rendering. Live synthesis and lightweight saved settings remain available. A short excerpt can still be exported.

## Implemented recipes and practice

Six Grade-D experimental seven-hour beds use 120, 196, 140, 174, 110 and 180 Hz for sleep, lucid-dream intention, astral imagery, remote-viewing journaling, comfort/healing traditions and self-hypnosis respectively. These are original aesthetic pitch choices, not research-derived treatment frequencies. Optional rain, ocean and stream layers are explicitly authored; no inherited bells or bowls are left active. All have zero binaural difference, no voice, no alarms and a −30 dBFS master ceiling on load. This is not a calibrated acoustic ceiling.

The planner defaults to 30 minutes of sound and 390 minutes of quiet. Selecting continuous explicitly loads 420 minutes, subject to the listener's existing cap. Loading stops prior playback, never starts audio, never raises volume and sets a 60-second end fade. Quiet means playback has stopped; there is no automatic restart at seven hours. The UI warns that mobile browsers can suspend playback and that this is not an alarm. No seven-hour physical-device endurance test is claimed.

## NanoLab signal presets

Four exact bench recipes compare the existing implementations at carrier 400 Hz, rate 16 Hz, length 10 seconds and gain −30 dBFS:

| Recipe | Stationary components before fades | Scope |
| --- | --- | --- |
| Physical two-tone sum | 392 and 408 Hz | Envelope magnitude repeats at 16 Hz; linear summation adds no separate 16 Hz component. |
| Sine AM | 384, 400 and 416 Hz | A 400 Hz carrier modulated at 16 Hz. |
| Baseband control | 16 Hz | Potentially inaudible on ordinary speakers; never raise volume to chase it. |
| Carrier control | 400 Hz | No modulation. |

Three five-minute Studio presets provide 16 Hz AM, 40 Hz AM and the unmodulated carrier. Studio monaural mode is sine AM; it is not mislabeled as the bench's two-tone construction. [OpenStax beats](https://openstax.org/books/university-physics-volume-1/pages/17-6-beats) and [CMU amplitude modulation](https://www.cs.cmu.edu/~15322/book/ch06/03.html) support the signal algebra. Wellness effects remain Grade D. These signals supply no magnetic/optical exposure, nanoparticle response, material dose or tissue treatment.

## Validation scope

Tests cover seven-hour persistence, bounded finite previews, speaker compatibility, intersecting filters, loading without autoplay, the 30-minute default, existing caps, and elapsed wall-time shutdown after a simulated seven-hour jump. NanoLab bench signals retain identical channels and quiet digital peaks. Export allocation is rejected before synthesis. Existing engine tests remain unchanged. Desktop/mobile branch rendering is automated; a real-device overnight run and physical speaker calibration remain outside this review.

# Open Sync vs. the state of the art (September 2026)

A feature-level comparison against the open-source tools people actually use for this, plus the two commercial reference points. It drove the v2 backlog: every ✗ in the v1 column that a peer had ✓ was a candidate, filtered by "does it fit an evidence-honest instrument?".

Sources: project READMEs and live demos — [Moodist](https://github.com/remvze/moodist), [Gnaural-Web](https://github.com/Gnaural-Web/), [Open Entrainer](https://github.com/pajew-ski/open-entrainer), [AmbiMix Studio](https://ambimix.com/), [Brainaural](https://brainaural.com/), [Brain.fm](https://www.brain.fm/), [Endel](https://endel.io/). Commercial products are closed; their rows reflect public feature lists only.

## Generation

| | Open Sync v1 | **Open Sync v2** | Moodist | Gnaural-Web | Open Entrainer | AmbiMix | Brainaural |
|---|---|---|---|---|---|---|---|
| Binaural beats | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ |
| Monaural beats | ✓ | ✓ | – | – | – | – | – |
| Isochronic tones | ✓ | ✓ | ✓ | – | – | – | ✓ |
| Bilateral / panning modulation | – | – (v2.1) | – | – | – | – | ✓ |
| Multi-phase schedule editor | ✓ (8 phases, drag) | ✓ | – | ✓ (segments, XML) | ✓ (3-phase ramp) | timeline | – |
| Continuous beat ramps | 1 s steps | 1 s steps (worklet in v2.1) | – | ✓ | ✓ (log-sigmoid) | n/a | – |
| Noise colors | 6 | 6 | white/pink/brown | white/pink/brown | pink | – | modulated white |
| Ambient layers | 5 nature + bowl | same | 84 sounds | 11 | – | library | – |
| Mathematical generators (Shepard, Euclidean, chaos, tuning systems…) | 17 | 17 | – | – | – | – | – |
| Cymatics simulator | ✓ | ✓ | – | – | – | – | – |
| Waveform / spectrum / correlation scopes | ✓ | ✓ | – | – | waterfall | – | – |

## Sessions & UX

| | v1 | **v2** | Moodist | Gnaural-Web | Open Entrainer | AmbiMix |
|---|---|---|---|---|---|---|
| Presets with evidence grades + citations | ✓ (46) | ✓ | – | some | – | – |
| User presets | ✓ | ✓ | ✓ | XML files | – | ✓ |
| Shareable URL that reproduces a setup | ✗ | **✓** | ✓ | – | – | – |
| Setup remembered across reloads | ✗ | **✓** | ✓ | – | – | ✓ |
| Sleep timer / fade-out | ✗ (hard stop) | **✓ dB-linear fade** | ✓ | – | ✓ (ramp-out phase) | – |
| Session cap + weekly dose meter | ✓ | ✓ persistent 7-day log | – | – | – | – |
| Panic button on every screen | ✓ | ✓ | – | – | – | – |
| Global pause / resume | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Command palette | ✓ | ✓ (complete) | – | – | – | – |
| Keyboard shortcuts + help sheet | partial | **✓ registry + `?`** | ✓ | – | – | – |
| Pomodoro / countdown / notes | – | – (deliberately) | ✓ | – | – | – |
| Breathing pacer | ✓ (engine cue) | ✓ | ✓ | – | – | – |

## Measurement & honesty (Open Sync's actual differentiator)

| | v1 | **v2** | Others |
|---|---|---|---|
| A–D grade on every claim, split grades for math-vs-meaning | ✓ | ✓ | none |
| Banned-vocabulary lint in tests | ✓ (5 copies) | ✓ (one module, CI) | none |
| BS.1770 loudness, THD, true-peak analyzer | ✓ | ✓ | none |
| Analyze your own files (binaural-construction detection) | ✓ | ✓ | none |
| Blinded n-of-1 experiments with CI reporting | ✓ | ✓ | none |
| Pre-registered experiment registry + stimulus pack | ✓ | ✓ | none |
| Claim audit chains, critique library, program archive | ✓ | ✓ | none |

## Safety

| | v1 | **v2** | Others |
|---|---|---|---|
| Gain cap enforced at the fader | −6 dBFS (at export only) | **fader + START** | none (Moodist: volume only) |
| First-run advisory (driving, seizure, medication, crisis) | text on Safety page | **gate before first START** | none |
| Infant mode: ≤50 dBA, ≤1 kHz, ≤45 min | rules existed, never enforced | **enforced, live low-pass path** | none |
| OS interruption handling | silent "running" | **auto-pause + notice** | varies |
| Hard limit ending | hard stop | **sleep fade then stop** | timer |

## Platform

| | v1 | **v2** | Moodist | Gnaural-Web | Open Entrainer | AmbiMix |
|---|---|---|---|---|---|---|
| Installable PWA / offline | ✗ | **✓** | ✓ | – | – | – |
| Lock-screen controls (Media Session) | ✗ | **✓** | ✓ | – | – | – |
| Screen Wake Lock | ✗ | **✓** | – | – | – | – |
| Export | WAV 16-bit, main thread | **WAV 16/24/float, worker** | – | – | – | MP3 / WAV |
| Works on a project-path deploy (GitHub Pages) | broken assets | **✓** | ✓ | ✓ | ✓ | n/a |
| CI + automated deploy | ✗ | **✓** | ✓ | – | – | n/a |
| Zero telemetry, no account | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| License | MIT | MIT | MIT | GPL-3.0 | Unlicense | closed |

## Commercial reference points

**Brain.fm** does not use beats at all; it composes music with patented amplitude-modulation "phase-locking" and sells outcomes. **Endel** generates adaptive ambient soundscapes from circadian, heart-rate and weather inputs. Both are closed, subscription products whose efficacy claims are exactly what Open Sync's Critique Library and Theory Explorer exist to audit. Open Sync deliberately does **not** copy their outcome language; it copies what is honest in them — polished playback, a gentle end to a session, and remembering the user — which is what v2 adds.

## What v2 borrowed, and what it refused

Borrowed: share links and setup memory (Moodist), sleep fade / ramp-out (Open Entrainer, Moodist), PWA + Media Session (Moodist), multi-format export (AmbiMix), a keyboard help sheet (Moodist).

Refused: Pomodoro/notes/to-do widgets (scope creep for an instrument), "healing frequency" presets without grades (Brainaural-style catalogs), any claim that a session *induces* a state.

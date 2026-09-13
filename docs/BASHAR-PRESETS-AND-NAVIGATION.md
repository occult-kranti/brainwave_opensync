# Bashar sounds and practical navigation

Release 2.5.0 extends the three existing Bashar sequences with a complete chord preset and makes all four easy to find. The attached `bashar-opensync-prompt.md` is the source brief; its transcript digests remain unverified. [The earlier source review](HARMONIC-AND-SOURCE-REVIEW.md) records the arithmetic and evidence decisions. This change adds playback and navigation; it establishes no physiological outcome.

## Sound collection

Direct route: `/presets?collection=bashar`. It is linked from Home, Presets, and Channeled Sources. The normal preset catalog contains all four entries as Experimental / Grade D. Changing a minimum-grade filter can hide them, with a visible empty result and Clear filters action.

| Preset | Full duration | Audible specification |
|---|---:|---|
| Bashar scale illustration | 35 min | Seven five-minute phases at 6, 10, 27.4, 28.6, 29.2, 40, 66.6 Hz. Carrier 200 Hz; first five binaural, final two monaural. With chosen k = 5,000, anchored on 200,000 ↔ 40 Hz, each source number is divided by 5,000. This is an illustrative conversion. |
| Alpha / gamma descriptions | 20 min | Ten minutes of 10.5 Hz binaural sound, followed by ten minutes of 40 Hz monaural sound; carrier 200 Hz. Rate and mode both change, so it is a listening comparison with confounds. |
| Golden-ratio pitch ladder | 25 min | Five five-minute steady pitches: 110 × φⁿ Hz, n = 0…4. No beat modulation. Full-precision phi is retained. |
| Golden-ratio bowl chord | 15 min | The same five phi-spaced modeled bowls together over a steady 110 Hz sine root. Crystal-quartz model, soft strike, bowl faders −26 dB, pans −0.6…0.6, re-strike 12 s. |

All four use authored phase gain −16 dBFS. Loading selects the quieter of that level, the current fader, a saved ceiling if present, and the governor limit. Neither dBFS nor a device volume percentage is a calibrated acoustic listening level. Starting pitches, durations, instrument choice, and stereo placement are app choices.

Each card has an opening preview and a full-session Load action. **Details & steps** plays eight seconds of any selected segment in isolation, preserving its carrier, mode, and mixer profile. The shipped opening previews are six seconds; the on-demand fallback is ten seconds. Captions use the manifest's actual file duration.

## Technical decisions

- `SessionSpec.mix` holds a portable optional profile. The four Bashar presets include explicit sine-wave profiles that clear prior noise, nature, bells, and bowls. The fourth restores its own five bowls. Legacy catalog presets without a profile retain their existing loading behavior.
- Saving a Studio preset now includes mixer settings and the current fader ceiling. Reading persisted profiles sanitizes finite numeric bounds, supported model names, bowl count, and re-strike intervals. Older saved presets still load.
- Channeled Sources loads the complete chord preset rather than only swapping the bowl set over an unknown previous session.
- Preview files and on-demand previews use the same profile adapter. WAV export includes the selected bowls. Bowl levels retain their absolute fader attenuation; the adapter caps `BowlSpec.level` at one. Share links no longer round bowl frequencies to two decimals.
- Existing deterministic engine algorithms and reference fixtures are unchanged. The new signal is composed with existing tone and bowl renderers.
- Shared preview state clears after a failed or immediately ended playback call. Presets checks advisory acknowledgment, active sessions, mute, panic, and infant restrictions; filter changes, leaving the route, and closing details stop previews.

## Navigation and interaction

The route registry remains the single source for desktop, mobile More, the command palette, and Home cards.

| Group | Contents | Initial state |
|---|---|---|
| Home | Home | Visible |
| Tools | Studio, Presets, Library, Harmonic Lab, Sound Methods, Sonic Lab, Sample Lab, Analyzer, Cymatics, Sleep & Dream, Quick Lab, Experiment Lab, Replication Bay | Visible |
| Theory & research | Levels, Knowledge, Channeled Sources, Theory Explorer, Critique Library, Hypothesis Tracker, Programs Archive | Collapsed |
| Help | Safety, Guide, About | Visible |

Opening a theory route reveals its navigation group. Explicitly collapsing the group on that route retains a current-page cue. The disclosure has an accessible name, expanded state, and controlled element, including in icon mode. Mobile keeps its four bottom tabs and pinned Panic control. Home uses a native collapsed details section for theory cards.

Preset cards are articles with separate buttons, avoiding nested interactive card semantics. The details sheet is a named modal with focus trapping, Escape handling, and a sticky Panic button. Search covers names, pitches, modes, and rhythm values; steady-tone cards display carrier pitches instead of strings of zero beat values.

## Review and remaining limits

An OpenAI agent acting as senior technical lead reviewed and implemented the mixer path, signal adapters, persistence, and audio checks. A second agent acting as UI/UX lead designed and implemented grouped navigation, aligned Home, and reviewed preset interactions. Their findings led to the fourth preset, clean mixer loading, truthful mode labels, conservative export levels, a reachable Panic button, and blocker-specific status text.

The authored 20-second fades on the three older sequences are still metadata. Studio and offline rendering use their existing transition behavior. Live monaural synthesis uses a pair of tones; offline monaural rendering uses amplitude modulation, so live playback and exported waveforms are not identical. The new chord includes a steady root plus modeled bowls; it is not a pure-sine chord or an acoustic recording. The app's Harmonic Lab can create a separate pure-tone phi chord.

Validation includes exact phi pitch preservation, nonzero stereo bowl content, quiet-level scaling and upper bounds, mixer save/load and share round-trips, preview failure and lifecycle checks, direct collection routing, search and grade filters, step playback, modal Panic, and grouped navigation on desktop and phone layouts. All fifty preview files were regenerated: 57.6 MB total, under the 60 MB limit. The full repository gate passed 1,103 tests across 79 suites, lint, TypeScript, and the production/PWA build. Phone behavior is covered by automated layout and interaction tests; physical-device listening has not been calibrated.

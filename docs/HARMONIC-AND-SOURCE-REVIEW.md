# Harmonic Lab and Channeled Sources

This change extends Open Sync v2.3.0 with two research routes: `/harmonics` and `/channeled`. It preserves the existing React/Vite app, Ink & Amber design, Everyday app, four mobile bottom tabs, and GitHub Pages deployment base. The new pages are visible in the rail, More menu, command palette, Home modules, and Guide through the central registry.

## Repository and website audit

The source baseline is `e679a37` on `occult-kranti/brainwave_opensync`. The live website was inspected at https://occult-kranti.github.io/brainwave_opensync/. Its desktop rail and Home modules agree with the 21-screen route registry. The Everyday app is a separate simplified entry at `/app/`; its bowl labels share the underlying bowl-set data.

The audit mapped the full architecture and all screen groups, then inspected the changed paths in depth:

| Area | Role and implications for this change |
| --- | --- |
| Studio, presets, Library | Shared SessionProvider owns transport, catalogs, export, saved presets, and preview playback. New catalog rows must preserve evidence scope and modality. |
| Analyzer, Sample Lab | Existing measurement workflows remain available for inspecting exported audio. A predicted spectrum on the composer is explicitly different from a measurement. |
| Sonic Lab, Cymatics | Existing mathematical synthesis and visualization overlap with this request. Harmonic Lab focuses on composing a reusable sound, not duplicating every generator. |
| Sleep/Dream, Replication, Quick Lab | Separate protocols and experiments already exist. The new listening comparison makes no blinded-trial or physiological-outcome claim. |
| Theory, critiques, hypotheses, programs, Knowledge | Existing source audits use graded provenance. The new exhibit follows that discipline and records supplied-digest limitations. |
| Safety, shell, live audio | Panic and preview tracking are shared. Previews bypass session dose accounting and the main volume fader, which requires explicit page-level handling. |
| Pure engine and measurement DSP | Bit-exact synthesis stays intact. Only a mathematical bowl-set data entry is appended within `src/engine`. A separate harmonic renderer lives in its content module. |
| Route/docs/storage/build | Central registries cover navigation and device storage. GitHub Pages requires base-aware assets and generated deep-link shells. Preview metadata must match all catalog presets. |

## Implemented experience

Harmonic Lab offers a 55–880 Hz root, eight chord/interval choices, just/equal/Pythagorean tuning, custom fractional ratios, eight relative harmonic weights, four timbre starting points, held chords, arpeggios, and a four-bar root progression. The frequency table displays ratios, Hz, cents, and deviation from equal temperament. The partial component map and waveform are labeled predictions; coincident per-voice weights are explicitly unsummed.

Listening previews are 2–30 seconds. The labeled A/B comparison uses four seconds of the same chord and gain in just and equal tuning; it is not a blinded trial. WAV exports include the selected gain, and recipe JSON preserves the controls. Up to twelve validated recipes can be saved locally and portable recipes can be imported/exported. No accounts, telemetry, external model calls, or microphones are added.

The Channeled Sources exhibit contains a provenance-first header, six digest themes, measurement/consistency audit, a calculator and table for the chosen scale mapping, conditional literal-physics calculations, golden-ratio pitch arithmetic, three experimental catalog presets, and a five-bowl chord. It integrates eight frequency rows, four Knowledge entries, split evidence grades, Everyday bowl copy, and preview assets.

## Advisor and critic decisions

Independent OpenAI agents reviewed audio architecture, source claims, implementation, and integration. No Claude runtime was available and none is claimed. The workflow used bounded review tasks and explicit feedback/test gates, informed by [Anthropic's orchestrator/worker and evaluator/optimizer patterns](https://www.anthropic.com/engineering/building-effective-agents) and [OpenAI's repository-centered verification practices](https://openai.com/index/harness-engineering/). A reusable OpenSync audio research skill captures the resulting project guidance.

| Finding | Decision |
| --- | --- |
| Existing Sonic Lab already implements many synthesis families | Build a focused composition and tuning workspace with reusable recipes. |
| Generic render rails warn about some limits without enforcing them | Validate duration, array sizes, finite numbers, frequency range, and sample rate before harmonic allocation; omit out-of-band partials explicitly. |
| Existing preview path bypasses session gain and dose | Apply quiet output gain in the buffer, keep previews bounded, prevent session overlap, and stop on navigation, panic, mute, and blocked settings. Research previews are unavailable in infant mode. |
| Existing sample interpolation is not a reconstructed true-peak meter | Display sample peak dBFS only. Do not relabel it dBTP. |
| Export could otherwise be louder than preview | Encode the same already-attenuated samples to WAV. |
| Preset loading discarded per-phase carrier and mode | Preserve those optional values through live playback, export, save/reload, persistence, and share. Explicit global carrier/mode edits clear the corresponding phase overrides. |
| Source brief says no Hz values anywhere, but supplies EEG Hz | Limit the claim to the supplied digest's lack of an established 432/528 Hz musical prescription. Do not claim complete-corpus coverage. |
| Source wording is provided as auto-transcript digests | Mark it unverified and paraphrase; do not fabricate verbatim transcripts. |
| Gamma and alpha descriptions are called contradictory | Label the comparison unresolved: distinct frequency components can coexist and no underlying EEG data are supplied. |
| One arbitrary fitted constant resembles a discovered conversion | State the chosen k = 5,000 and anchor 200,000 ↔ 40 Hz wherever the mapping appears. A applies only to arithmetic; interpretations remain D. |
| Frequency is treated automatically as radio | Make the electromagnetic-in-vacuum assumption explicit before using c/f; distinguish sound and EEG quantities. |
| Brief rounds phi values | Calculate from φ = (1 + √5)/2 internally and round only display. The interval is approximately 833.09 cents and is not an integer harmonic or a low-rate beat. |

The catalog retains the authored 20-second amplitude-ramp metadata. The existing live bridge and offline sequencer do not execute per-phase amplitude envelopes; live transitions and offline overlap crossfades remain distinct. Implementing these fades faithfully is deferred because this brief prohibits changing the deterministic engine. This limitation is stated next to the exhibit playback controls. Loaded presets use their total duration under the existing session cap and a conservative fixed live level; exported phase gains retain their relative differences.

The brief's proposed universal EEG cutoff, universal neuronal firing limit, asserted beta anchor, and blanket whole-body resonance estimate were not adopted. They are unnecessary for the exhibit and would introduce misleading physical claims.

## Evidence consulted

- [UNSW musical acoustics](https://newt.phys.unsw.edu.au/jw/tartini-temperament.html): harmonics, simple ratios, equal temperament and tuning tradeoffs.
- [W3C Web Audio](https://www.w3.org/TR/webaudio/): browser audio primitives.
- [WHO–ITU H.870](https://www.itu.int/rec/T-REC-H.870): listening devices and exposure; digital gain is not a calibrated acoustic level.
- [BIPM SI Brochure](https://www.bipm.org/en/publications/si-brochure): frequency units.
- [Braboszcz et al., PLOS ONE, 2017](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0170647): alpha and gamma analyzed in the same EEG study, not evidence for Anka's particular claims.
- [NIST CODATA table: speed of light and Planck time](https://physics.nist.gov/cuu/Constants/Table/allascii.txt): arithmetic inputs, not evidence for a reality frame rate.
- [ICNIRP 2020, Appendix A](https://www.icnirp.org/cms/upload/publications/ICNIRPrfgdl2020.pdf): biological resonance depends on exposure conditions and body geometry.
- [Yan et al., 2021](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2021.682011/full): high-frequency scalp EEG observations, demonstrating why a universal 100 Hz cutoff is inappropriate.

The user-supplied `bashar-opensync-prompt.md` provides the video identifiers and digest claims. Direct checks did not recover the original transcripts for the sampled IDs. The UI documents this limitation; it does not present the digests as independently corroborated.

## Verification record

Verified on 2026-09-13: preview regeneration produced 49/49 previews at six seconds each (56.5 MB, below the 60 MB guard). `npm run check` passed lint, TypeScript, all 977 tests across 74 suites, and the production/PWA build. `npm run build:pages` passed and emitted 22 route shells plus the SPA fallback, using the existing GitHub Pages base path. New tests cover tuning/FFT agreement, render bounds, all-zero silence, output headroom, exported samples, preview lifecycle, recipe validation, source provenance, split grades, catalog integration, and per-phase session behavior.

The existing public website was inspected in the browser. The available cloud browser could not open the local development origin (`ERR_BLOCKED_BY_CLIENT`); local visual/browser QA is therefore not represented as completed. DOM interaction tests cover the new controls, but they cannot establish actual device playback quality or final responsive appearance. A reviewer should check both new routes at phone and desktop widths, keyboard navigation, long labels, and low-volume playback before release.

## Follow-on features to evaluate

Keep later work separate: a randomized blinded preference trial, longer compositions using a worker and dose-aware transport, measured-spectrum overlay using the existing Analyzer, and timestamped transcript ingestion once original sources are supplied. None is necessary to claim the current arithmetic or short-preview behavior works.

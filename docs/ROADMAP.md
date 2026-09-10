# Roadmap

## v2.0 (this release) — organize, fix, catch up with the field

**Done.** See `CHANGELOG.md`. In short: route/shortcut/storage/vocabulary registries; session context split; 40 dead dependencies and 52 dead files removed; CI + Pages; sleep fade; share links; front-panel and dose persistence; governor enforcement at START with a first-run advisory; infant low-pass in the live path; OS-interruption recovery; Media Session + Wake Lock; PWA; worker export with format choice; keyboard registry + help sheet; error boundary; SEO; and the GitHub Pages asset-path fix.

## v2.1 — audio engine depth

- **AudioWorklet engine.** Move the tone chain into an `AudioWorkletProcessor` so beat and carrier ramps are sample-accurate and continuous (today the beat steps once per second from the React clock and the isochronic gate is a pre-rendered loop). Keep the pure engine as the reference: worklet output must match `renderSession()` within a tolerance test.
- **Seamless layer loops.** Cross-fade the 8–12 s noise/nature loops (or render them 4× longer) — the loop seams are audible on headphones. (Bowl loops are seamless since 2.1: the closed-form tail sum makes a buffer of whole re-strike cycles periodic.)
- **Decorrelated stereo layers.** `NoiseSpec.stereoWidth` (default 0 to keep v1 renders bit-exact) rendering independent L/R seeds mixed by width.
- **Bilateral / panning modulation** (Brainaural-style) as a fourth modality, graded like the others.
- **Preview routing** through the master analyser tap so previews show on the scope and the meters.

## v2.2 — sessions and experiments

- **Session history.** Persist completed sessions (preset, duration, level, dose) and show a 7-day timeline in the Safety Center next to the dose log.
- **Calibration flow.** Replace the fixed 76 dB offset with a per-headphone profile (pink-noise reference + user-entered SPL or a "loudness match" task) so the H.870 numbers are less nominal.
- **Quick Lab ↔ Studio hand-off.** One tap from a blinded arm result to a saved preset, keeping the arm sealed until reveal.
- **Import/export of user data** (presets, journal, quick-lab runs, dose log) as one JSON file.

## v2.3 — platform and reach

- **Output device selection** (`setSinkId`) and a headphone-detection heuristic (binaural on speakers is meaningless).
- **Light theme** on the same token system (the instrument look stays the default).
- **i18n** scaffold (message catalog; copy stays evidence-graded per locale).
- **Opus/OGG export** via `MediaRecorder` for small shareable files, alongside WAV.
- **Embedded reproducibility manifest** in exported WAVs (RIFF `LIST/INFO` with the spec hash the sequencer already computes).

## Always

- Grades only move with citations. Disputes are the most valuable issues.
- Safety rails only tighten.
- No telemetry, ever.

## Explicitly not planned

- Claims of clinical effect, "digital drug" framing, or hiding the D-grade material — the exhibits stay visible and labeled.
- Accounts or cloud sync. Share links and JSON export cover the honest use cases.

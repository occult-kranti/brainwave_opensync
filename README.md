# Open Sync — Evidence-Honest Brainwave Audio Laboratory

[![CI](https://github.com/occult-kranti/brainwave_opensync/actions/workflows/ci.yml/badge.svg)](https://github.com/occult-kranti/brainwave_opensync/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![Version](https://img.shields.io/badge/version-2.1.0-amber)

An open, evidence-graded replication **and correction** of commercial brainwave-entrainment
platforms, rebuilt as a browser app where every frequency, protocol and claim carries an
**A–D evidence grade**, every graph explains itself, and you can run **blinded experiments on
yourself**. No account, no server, nothing phones home.

**Live site (GitHub Pages):** https://occult-kranti.github.io/brainwave_opensync/ — installable as a PWA.

---

## What it is

A "neural audio instrument" that refuses to overclaim:

- The beat-generation math is real and sample-accurate (rendered beat frequency verified to <0.001 Hz in tests, renders bit-exact).
- Cortical entrainment by binaural beats is *unproven* (8 of 14 rigorous EEG studies contradict
  it) — so the app leads with **measurement and self-verification**, not promises.
- Solfeggio / chakra / "angel number" frequencies ship with their audited origins (1970s–90s
  numerology, not medieval), Schumann modes use *measured* geophysical values, and astral/occult
  content is quarantined as cultural-historical exhibits.
- Safety rails are contracts, not advisories: a −6 dBFS gain cap, a 90-minute session cap, a
  WHO-ITU H.870 weekly dose meter that really spans seven days, an infant mode with a live 1 kHz
  low-pass, a panic button on every screen, and a one-time advisory gate before the first START.

## What's new in v2

| | |
|---|---|
| **Sleep fade** | Sessions end with a dB-linear fade (30 s default, up to 10 min) instead of a hard cut; `FADE NOW` / `F` fades on demand |
| **Share links** | `SHARE` copies a URL that reproduces the entire front panel on any device — no server, validated on decode |
| **Memory** | The Studio remembers your last setup; dose exposures persist as a rolling 7-day log |
| **Safety enforcement** | The governor now actually gates START (it existed in v1 but was never called): advisory acknowledgment, gain cap, session cap, infant rules with a live low-pass |
| **Phone-grade playback** | Media Session lock-screen controls, Screen Wake Lock, OS-interruption recovery (a call pauses the session instead of leaving it silently "running") |
| **PWA** | Installable, offline app shell, update chip (a live session is never interrupted by an update), icons, Open Graph card |
| **Export v2** | Web-Worker render, PCM-16 / PCM-24 / float-32, capped at the session limit |
| **Keyboard** | One shortcut registry and a `?` help sheet: `⌘K` · `[` · `Space` · `M` · `F` · `P` · `Shift P` |
| **Fixes** | Preview audio 404'd on GitHub Pages; layer bypass was a no-op live; mixer moves before START were lost; limit changes mid-session were ignored |
| **Organization** | Route registry, storage-key registry, shared banned-vocabulary module, session context split into six modules, 40 unused dependencies and 52 dead UI files removed, CI + Pages workflows, 0 lint errors, 760+ tests |

Full details: [`CHANGELOG.md`](CHANGELOG.md). How it compares to other open-source tools:
[`docs/SOTA-COMPARISON.md`](docs/SOTA-COMPARISON.md). Where it goes next: [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Modules (21 screens)

| Area | What you get |
|---|---|
| **Studio** | Live binaural / monaural / isochronic engine, 6 noise colors, nature layer, a bowl set of up to 7 singing bowls (5 materials × 3 techniques, pan, intervals, ready-made sets), interval bell, multi-phase session timeline, live L/R scope, virtual-plate cymatics, sleep fade, share links, WAV export |
| **Sonic Lab** | 17 mathematical sound generators: Shepard/Risset illusions, Euclidean & prime & golden-ratio rhythms, fractal 1/f^α noise, logistic-map chaos, waveform designer (additive/FM/Chebyshev/phase distortion), tuning systems (JI/12-TET/Bohlen-Pierce), astronomically derived tunings with split grades: *arithmetic A · meaning D* |
| **Cymatic Studio** | Chladni plate simulator (square/circular/Bessel modes, sand particles, colormaps, audio-reactive) with physics/art honesty labels |
| **Frequency Library** | 44 audited frequencies in 7 sets, grade badges, citation popovers, corrected Schumann values |
| **Presets** | 46 evidence-graded protocols with instant pre-rendered previews + MY PRESETS |
| **Levels** | Deep Focus ladder (discrete Monroe-style signposts) + an accurate exhibit on the 1983 CIA Gateway report (a *theoretical assessment*, no experiments) |
| **Analyzer** | ITU-R BS.1770 loudness (LUFS/LRA/true-peak), THD/SINAD, spectrum, wow & flutter, azimuth |
| **Sample Lab** | 9-module analysis of your own audio files: STFT, spectral shape, octave bands, tempo, mid/side + binaural-construction detection, loudness over time, pitch, loop detection |
| **Sleep & Dream** | MILD/WBTB/SSILD techniques, Targeted Lucidity Reactivation cueing (Carr et al. 2023), dream journal, WBTB weekly caps |
| **Replication Bay** | Government-program stimulus replications (Gateway, GENUS 40 Hz, TMR, closed-loop sleep) with "stimulus replication ≠ claim validation" banners; non-replicable items (MEDUSA, LRAD) as museum cards |
| **Experiment Lab** | Pre-registration-grade registry X01–X14 with power analyses, null-handling rules and a 67-entry stimulus plan (20 reference files shipped) |
| **Quick Lab** | Blinded n-of-1 self-experiments: seeded block randomization, sealed arms, results only as n + estimate + 95% CI — "inconclusive" when it's inconclusive |
| **Theory Explorer** | Step-by-step audits of the big claims — weakest inference links highlighted, verdicts from REPAIRABLE to DISCARD |
| **Programs Archive** | 42 global government programs, documented-vs-validated two-axis grading |
| **Critique Library · Hypothesis Tracker** | 13 flaw-taxonomy reviews; 12 pre-registered claims with audit trails |
| **Knowledge / About / Guide / Home** | 1839→2026 research archive, honest-claims manifesto, dual-register (simple + deep) docs for every feature |
| **Safety Center** | H.870 dose tracking, panic button everywhere, first-run advisory, infant mode (≤50 dBA, ≤1 kHz, ≤45 min), crisis resources |

## Run it locally

Requirements: **Node.js 20.19+ or 22.12+** (22 LTS recommended — Vite 7 needs it).

```bash
git clone https://github.com/occult-kranti/brainwave_opensync.git
cd brainwave_opensync
npm ci             # install exactly the locked dependencies
npm run dev        # dev server → http://localhost:3000
```

Production build + local preview:

```bash
npm run build      # tsc -b + vite build (+ service worker) → dist/
npm run preview    # serve dist/ locally
```

Everything runs in the browser. There is no backend to configure.

## Test, lint, check

```bash
npm test               # 760+ vitest cases: DSP math, engine bit-exactness, safety rails,
                       # blinding engine, share-link/persistence codecs, shell contracts, docs lint
npm run lint           # eslint (0 errors is the bar; CI enforces it)
npm run typecheck      # tsc -b
npm run check          # all of the above + build — what CI runs
npx vitest run src/engine/__tests__/synth.test.ts   # one file
```

Optional Python tooling (icons) lives in a virtualenv:

```bash
uv venv .venv && source .venv/bin/activate && uv pip install pillow
npm run icons:render   # regenerates public/icons/*.png and the Open Graph image
```

## Deploy

The **Pages** workflow (`.github/workflows/pages.yml`) builds with `VITE_BASE=/brainwave_opensync/`,
copies `index.html` to `404.html` for deep links, and publishes `dist/` to the `gh-pages` branch on
every push to `master` (the repository's Pages source is "Deploy from a branch: gh-pages"). To host
under a different path, change `VITE_BASE`; to host at a domain root, drop it.

## Project layout

```
src/
  app/        # route registry, keyboard-shortcut registry, PWA registration
  engine/     # pure DSP: oscillators, noise colors, bowls, nature, sequencer, WAV encoder
  dsp/        # FFT, BS.1770 loudness, THD/SINAD, wow & flutter, azimuth, biquads
  safety/     # H.870 dose tracker, session governor (authorization, infant rules, advisories)
  data/       # evidence-graded frequency DB, 46 presets, levels, knowledge base
  docs/       # features.ts — single source of truth for dual-register docs; vocabulary.ts
  lib/        # storage (versioned keys), asset URLs, cn()
  cymatics/   # Chladni solvers, sand sim, colormaps, audio link
  soniclab/   # 17 mathematical sound generators + render safety rails
  samplelab/  # 9-module audio-file analysis
  quicklab/   # blinded n-of-1 experiment engine (randomization, sealing, CI stats)
  dream/      # lucid-dreaming protocols, scheduler, journal
  replication/# government-program replication protocols
  research/   # experiment registry, critiques, hypotheses, programs, stimulus pack
  theory/     # six-pass claim audit chains
  ui/
    audio/    # live Web Audio engine, export worker, media session bridge
    session/  # session provider + types, hook, math, defaults, persistence, share links
    components, layout, hooks, theme
  pages/      # 21 routed screens
  test/       # vitest setup + helpers
scripts/      # render-previews.mjs (preset WAVs), render-icons.py (PWA icons)
docs/         # ARCHITECTURE, ROADMAP, SOTA-COMPARISON
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the layers fit together and
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the rules of the road.

## Evidence & safety commitments

- Every claim carries an A–D grade; banned vocabulary ("induces", "synchronizes", "digital drug"…)
  is enforced by tests that CI runs on every push.
- Safety rails: H.870 weekly dose model with a persistent 7-day log, −6 dBFS cap enforced at the
  fader, 90-minute session cap with sleep fade, panic button with rehearse mode, first-run advisory
  gate, seizure-disorder exclusion notice, infant mode enforced in the live signal path.
- Blinded experiment results are never reported without n and a confidence interval.
- Wellness product only — no disease claims (FDA General Wellness boundary).

## License

Code is released under the **MIT License** (see `LICENSE`). Third-party research citations remain
the property of their authors. Runtime dependencies are MIT-class; GPL-licensed references (e.g.
SuperCollider, Strudel, Gnaural) were studied as documentation only and re-implemented, not copied.

**Freedom-to-operate:** professional FTO opinion pending — this is a wellness-tier, claims-clean
release; no medical claims are made. Not medical advice; not a medical device.

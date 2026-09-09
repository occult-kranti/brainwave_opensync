# Open Sync — Evidence-Honest Brainwave Audio Laboratory

An open, evidence-graded replication **and improvement** of commercial brainwave-entrainment
platforms (inspired by *Brain Synchronize Unified*, cortexfrequencyresearch.org) — rebuilt as a
browser app where every frequency, protocol, and claim carries an **A–D evidence grade**, every
graph explains itself, and you can run **blinded experiments on yourself**.

**Live site (GitHub Pages):** https://occult-kranti.github.io/brainwave_opensync/

---

## What it is

A professional "neural audio instrument" that refuses to overclaim:

- The beat-generation math is real and sample-accurate (verified to <0.001 Hz in tests).
- Cortical entrainment by binaural beats is *unproven* (8 of 14 rigorous EEG studies contradict
  it) — so the app leads with **measurement and self-verification**, not promises.
- Solfeggio/chakra/"angel number" frequencies ship with their audited origins
  (1970s–90s numerology, not medieval), Schumann modes use *measured* geophysical values,
  and astral/occult content is quarantined as cultural-historical exhibits.

## Modules (20 screens)

| Area | What you get |
|---|---|
| **Studio** | Live binaural / monaural / isochronic engine, 6 noise colors, nature & bowl layers, multi-phase session timeline, live L/R waveform scope, live virtual-plate cymatics panel, WAV export |
| **Sonic Lab** | 17 mathematical sound generators: Shepard/Risset illusions, Euclidean & prime & golden-ratio rhythms, fractal 1/f^α noise, logistic-map chaos, custom waveform designer (additive/FM/Chebyshev/phase distortion), tuning systems (JI/12-TET/Bohlen-Pierce), astronomically derived tunings (TRAPPIST-1, Earth-year tone) with split grades: *arithmetic A · meaning D* |
| **Cymatic Studio** | Chladni plate simulator (square/circular/Bessel modes, sand particles, colormaps, audio-reactive) with physics/art honesty labels |
| **Frequency Library** | 7 audited frequency sets, grade badges, citation popovers, corrected Schumann values |
| **Presets** | 46 evidence-graded protocols with instant pre-rendered audio previews |
| **Levels** | Deep Focus ladder (discrete Monroe-style signposts) + an accurate exhibit on the 1983 CIA Gateway report (a *theoretical assessment*, no experiments) |
| **Analyzer** | ITU-R BS.1770 loudness (LUFS/LRA/true-peak), THD/SINAD, spectrum, wow & flutter, azimuth |
| **Sleep & Dream** | MILD/WBTB/SSILD techniques, Targeted Lucidity Reactivation cueing (50% vs 17% signal-verified in lab naps, Carr et al. 2023), dream journal, WBTB weekly caps |
| **Replication Bay** | Government-program stimulus replications (Gateway, GENUS 40 Hz, TMR, closed-loop sleep) with "stimulus replication ≠ claim validation" banners; non-replicable items (MEDUSA, LRAD) as museum cards |
| **Experiment Lab** | Pre-registration-grade registry X01–X14 with power analyses and null-handling rules |
| **Quick Lab** | Blinded n-of-1 self-experiments: seeded block randomization, sealed arms, results only as n + estimate + 95% CI — "inconclusive" when it's inconclusive |
| **Theory Explorer** | Step-by-step audits of the big claims — weakest inference links highlighted, verdicts from REPAIRABLE to DISCARD |
| **Programs Archive** | 42 global government programs, documented-vs-validated two-axis grading |
| **Knowledge / About / Guide / Home** | 1839→2026 research archive, honest-claims manifesto, dual-register (simple + deep technical) docs for every feature |
| **Safety Center** | WHO-ITU H.870 dose tracking, panic button everywhere, corrected infant mode (≤50 dBA), crisis resources |

## Run it locally

Requirements: **Node.js 20+**.

```bash
git clone https://github.com/occult-kranti/brainwave_opensync.git
cd brainwave_opensync
npm install        # install dependencies
npm run dev        # dev server → http://localhost:3000
```

Production build + local preview:

```bash
npm run build      # type-check (tsc -b) + bundle → dist/
npm run preview    # serve dist/ locally
```

## Test

```bash
npx vitest run     # 615+ tests: DSP math, engine bit-exactness, safety rails,
                   # blinding engine, mobile shell contracts, docs lint
```

## Project layout

```
src/
  engine/     # pure DSP: oscillators, noise colors, bowls, nature, sequencer, WAV encoder
  dsp/        # FFT, BS.1770 loudness, THD/SINAD, wow&flutter, azimuth, biquads
  safety/     # H.870 dose tracker, session governor (panic, infant gates, advisories)
  data/       # evidence-graded frequency DB, 46 presets, levels, knowledge base
  cymatics/   # Chladni solvers, sand sim, colormaps, audio link
  soniclab/   # 17 mathematical sound generators + render safety rails
  quicklab/   # blinded n-of-1 experiment engine (randomization, sealing, CI stats)
  dream/      # lucid-dreaming protocols, scheduler, journal
  replication/# government-program replication protocols
  research/   # experiment registry, critiques, hypotheses, programs data
  theory/     # six-pass claim audit chains
  docs/       # features.ts — single source of truth for dual-register docs
  ui/         # shell, components (Knob, Fader, Visualizer, InfoPopover, panic…)
  pages/      # 20 routed screens
```

## Evidence & safety commitments

- Every claim carries an A–D grade; banned vocabulary ("induces", "synchronizes",
  "digital drug"…) is lint-checked in CI.
- Safety rails: H.870 weekly dose model, −6 dBFS default cap, 90-minute session cap,
  panic button with rehearse mode, seizure-disorder exclusion notice.
- Blinded experiment results are never reported without n and confidence interval.
- Wellness product only — no disease claims (FDA General Wellness boundary).

## License

Code is released under the **MIT License** (see `LICENSE`). Third-party research
citations remain the property of their authors. Dependency-license audit: runtime
dependencies are MIT-class; GPL-licensed references (e.g., SuperCollider, Strudel)
were studied as documentation only and re-implemented, not copied.

**Freedom-to-operate:** professional FTO opinion pending — this is a wellness-tier,
claims-clean release; no medical claims are made. Not medical advice; not a medical
device.

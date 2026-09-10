# Changelog

All notable changes to Open Sync. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [2.0.0] — 2026-09-10

The v2 release reorganizes the project, fixes several silent v1 defects found in a full audit, and adds the features that state-of-the-art open-source audio tools (Moodist, Gnaural-Web, Open Entrainer, AmbiMix) ship and v1 lacked — without loosening a single safety rail or evidence rule.

### Added
- **Sleep fade.** The session limit now ends with a dB-linear fade (default 30 s; 0 / 30 s / 2 / 5 / 10 min) instead of a hard cut. `FADE NOW` (or the `F` key) fades any running session on demand.
- **Shareable session links.** `SHARE` in the Studio copies a URL that reproduces the whole front panel — modality, carrier, waveform, phase plan, noise mixer, layers, limit, fade — on any device. No server, no account; every field is validated and clamped on decode.
- **Front-panel persistence.** The last Studio setup survives reloads (versioned, sanitized). `RESET` restores factory defaults.
- **Persistent dose log.** The WHO-ITU H.870 "weekly allowance" now really spans seven days: exposures are coalesced into a rolling 7-day log and replayed into the tracker at boot.
- **First-run safety advisory.** START is gated once per device by the governor's own advisory text (headphones/level, driving, seizure, medication precaution, crisis line). The acknowledgment is persisted and reviewable in the Safety Center.
- **Governor enforcement at START.** `SafetyGovernor.authorizeSession()` — present in v1 but never called at runtime — now gates every live session: gain cap (−6 dBFS) at the fader, session cap, and in infant mode a live 1 kHz low-pass, a ≤50 dBA level ceiling (≤ −26 dBFS) and the 45-minute cap. Refusals are listed inline.
- **Infant low-pass in the live engine.** A BiquadFilter path (≤1 kHz) is cross-faded in click-free when infant mode is on; the governor refuses infant sessions on platforms that cannot build it.
- **OS interruption recovery.** A phone call or audio-session steal flips the session to PAUSED with a visible notice instead of leaving a silent "running" state.
- **Media Session + keep-alive.** Lock-screen / hardware-key PLAY · PAUSE · STOP, session title and mode metadata; a silent keep-alive keeps the tab "playing" so mobile browsers do not throttle a long session.
- **Screen Wake Lock** while a session runs (re-acquired when the tab returns to the foreground).
- **Installable PWA** with offline app shell (Workbox precache), runtime caching for preview WAVs, update chip in the status bar (never a forced reload), PNG/maskable icons and an Open Graph image rendered by `scripts/render-icons.py`.
- **Off-thread WAV export** in a Web Worker (sync fallback), **format choice** (PCM-16 / PCM-24 / float-32), and the export now **honors the session limit** (v1 computed the cap and discarded it).
- **Keyboard shortcut registry** (`src/app/shortcuts.ts`) driving one global handler and a `?` help sheet: `⌘/Ctrl K`, `[`, `Space`, `M` mute, `F` fade, `P` panic, `Shift P` rehearse, `?` help.
- **Route error boundary**: a crashing screen no longer blanks the app — the shell, audio and panic button stay up.
- **Skip-to-content link** and a `main` landmark.
- **SEO / social**: meta description, Open Graph + Twitter cards, JSON-LD, `robots.txt`, `sitemap.xml`, SVG favicon, Apple touch icon, font preconnects.
- **GitHub Actions**: CI (lint · typecheck · tests · build) on every push/PR and a GitHub Pages deploy workflow with the SPA `404.html` fallback and `.nojekyll`. Dependabot, issue and PR templates.
- **Command palette** actions: copy share link, sleep fade now, reset front panel, keyboard shortcuts — and it now lists every screen (v1 was missing four).
- `npm run check`, `typecheck`, `test:watch`, `test:coverage`, `previews:render`, `icons:render` scripts.

### Fixed
- **Preview and stimulus-pack audio 404'd on GitHub Pages** — URLs were root-absolute; all public assets now resolve through a deploy-base-aware helper and the router uses the deploy basename.
- **Nature/bowl layer bypass was a no-op in the live engine** — the layers were wired past the layer bus. They now route through it (and the export path already omitted them correctly).
- **Mixer moves made before the first START were lost** — the engine now remembers noise/nature/bowl state set while idle and materializes it on start.
- **Changing the limit mid-session did nothing** — the 1 s clock captured a stale limit; it now reads live refs.
- **Muted time was debited to the dose meter** — no longer.
- **Typing `p` in the preset-name field could trigger panic** in some focus states — shortcuts are now inert in every typing context.
- **Space double-fired on focused buttons** — guarded in the registry.

### Changed
- `package.json` identity (`open-sync` 2.0.0, MIT, repository, engines), pruned 40 unused dependencies (radix kits, gsap, lenis, zod, recharts, forms, carousels …); one shadcn component (`sheet`) remains.
- Route registry (`src/app/routes.ts`) is the single source of truth for App, rail, bottom bar, MORE drawer, command palette and Home icons.
- Storage keys registered in one place (`src/lib/storage.ts`) with a versioned envelope helper; historical key strings preserved so v1 user data survives.
- Banned claim vocabulary lives in `src/docs/vocabulary.ts` and is imported by every test that enforces it (five copies collapsed).
- `SessionContext.tsx` split into `types.ts`, `useSession.ts`, `sessionMath.ts`, `sessionDefaults.ts`, `sessionPersistence.ts`, `shareLink.ts`; canvas and timeline helpers moved out of component files (react-refresh clean, 0 lint errors).
- Vitest setup file isolates persisted state between tests and models a returning user for the advisory gate.
- ESLint: React-Compiler purity rules disabled for test probes; `_`-prefixed unused args allowed.

### Removed
- 52 unused shadcn/ui component files, `src/pages/ComingSoon.tsx`, `scripts/wa-reapply.py` (a stale workflow patcher), scaffold `info.md`, and the stale research hand-off note.

## [1.7.0] — 2026

- Sample Lab (9-module audio analyzer), Studio scope fix, sand cymatics, layer bypass toggles, Monroe-structure research.

## [1.6.0] — 2026

- Global pause/resume on every screen, 46 pre-rendered preset preview WAVs, MY PRESETS user store, UX flaw ledger, code-splitting (entry 1.2 MB → 366 KB), MIT license + FTO statement. 666 tests.

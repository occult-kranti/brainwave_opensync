# Changelog

All notable changes to Open Sync. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [2.0.1] — 2026-09-10

Deploy fix plus the first round of an adversarial multi-agent review of the v2 diff (seven reviewers, three refuters per finding).

### Fixed
- **Deploy.** The Pages workflow now publishes `dist/` to the `gh-pages` branch (the repository's Pages source); the Actions-artifact route was rejected by the `github-pages` environment and the live site had stayed on v1. CI no longer runs on `gh-pages` pushes.
- **OS interruption left audio live.** A call or audio-session steal flipped the session to PAUSED but left the master gain at full level, so a platform auto-resume played audio while the UI said PAUSED and the clock/dose/limit were frozen. The engine now hard-mutes on interruption; RESUME ramps back.
- **Lock-screen controls missing on Chrome/Android.** The keep-alive clip was 0.1 s; Chromium treats media under 5 s as transient and refuses to make the session controllable. The clip is now 6 s.
- **MUTE was ignored during a sleep fade** (up to 10 minutes). Mute now cuts the curve immediately; unmuting re-issues the remainder of the fade.
- **Previews bypassed infant mode** (no 1 kHz low-pass, no level ceiling). Engine previews and pre-rendered preview files now run through a dedicated preview path with its own low-pass split and are capped at the infant ceiling.
- **Fade re-trigger could jump the volume up** (curve anchored at the nominal level rather than the current one). Fades start from the current level and a muted engine fades straight to 0.
- **pause → resume race** could misreport the engine's own suspend as an OS interruption; **STOP → START within 360 ms** could tear down the new tone chain. Both timers are now tracked.
- **`resumeSafely()` bypassed the advisory gate and the governor** and was reachable from a panic rehearsal on a fresh device. It now goes through the same checks as START at the lowered level.
- **Same-tick `setVolumeDb`/`setLimitMin` + `start()`** (the Quick Lab arm launcher) authorized and started with stale values. START and the governor now read synchronous refs.
- **Rehearsing panic during a live session** froze pause/resume and a later STOP re-opened the panic overlay. Rehearsal is inert while running; STOP clears it.
- **UI kept showing FADING after pause / interruption** while the engine had dropped the fade; the engine now emits `fade-cancelled` and the UI mirrors it. The FADING countdown now counts to the fade's own end, not the session limit.
- **Cancelling the limit fade re-armed it every second** (a volume pump). The limit fade is issued once per session.
- **START after a manual STOP resumed the old clock**, phase and limit bar. A fresh START begins at 00:00; only RESUME SAFELY continues the budget.
- **Safety Center DRIVING ACK chip** and the START gate disagreed (two writers). One writer now updates the flag, the synchronous ref and the persisted record.
- **Level change on a carrier-locked bowl rendered a silent bowl** (0 Hz) and persisted it into the mixer memory.
- **Layer OFF and nature/bowl swaps popped** (hard stop); layers now ramp to silence over 20 ms before they are stopped.
- **Front panel and dose log could lose the last seconds on tab close or a phone OS kill**; both are flushed on `pagehide` / `visibilitychange`.
- **Wake lock could outlive the session** when the request resolved after STOP; a lock resolved after disposal is released immediately.
- Lock-screen metadata no longer churns every second during a phase glide (the beat readout was in the artist field).
- Infant-mode toast in the Safety Center now states both the one-shot setting (−40 dBFS / 20:00) and the enforced ceiling (−26 dBFS / 45:00).
- **Reviewing the advisory from the Safety Center during a live session restarted it** (the dialog always started). The dialog now knows whether START raised it; reviewing never starts, and START is a no-op while running.
- **The advisory and shortcut sheets covered the phone PANIC button.** Both now sit below the bottom bar, and the advisory carries its own PANIC button for desktop.
- **`P` (panic) was inert while a select, slider or knob had focus**, and `⌘/Ctrl K` no longer worked from inputs. PANIC and modifier chords now fire from any control; plain letters stay inert only in real text entry.
- **Space could double-fire** on ARIA buttons/sliders (click-to-type readouts, citations). Any activatable role, and any already-handled event, is exempt.
- **One Escape closed every stacked overlay.** A modal stack lets only the top-most sheet answer Escape; sheets also trap Tab and give initial focus to the sheet (a held Enter can no longer accept the advisory by key repeat).
- **Phone layout guard** used `overflow-x: hidden` on `main` (which disabled `position: sticky` inside pages) and made every panel a scroll container (clipping citation popovers). It now uses `overflow-x: clip` and scopes inner scrolling to tables and scopes.
- Share fallback (no clipboard) now stays on screen until dismissed, receives focus, and announces via a live region; the WAV format note is visible text; disabled chips look disabled; fade-length chips are toggle buttons instead of half-implemented radios.
- **Pre-rendered preset previews ignored infant mode's low-pass** (they played through a bare `<audio>` element). They now run through the engine's preview path via a media-element source when Web Audio is available.
- **Safety Center showed controls that did nothing**: an "AUTO-FADE SLEEP" row with a lit LED (removed — the real sleep fade lives in the Studio) and a "QUIET HOURS 22:00–07:00" chip that only capped the output (relabelled as the −30 dBFS cap it is). Its infant-mode paragraph now states the enforced rails.
- **Docs claimed things the app did not do**: a dose-week reset (now a real RESET DOSE WEEK action in the Safety Center), an infant-only preset list (now implemented on the Presets screen), "updates never forced" (qualified: a live session is never interrupted), a driving-impairment citation that studied fluid intelligence (rescoped), and "<0.001 Hz" beat accuracy with no test (now measured by a 60 s zero-crossing test).
- Tests: the stop→start teardown and restart tests now actually fail on the bug they guard; new tests for the route registry, the media-query breakpoint hook, provider-level engine events on a fake AudioContext, an infant session on a capable platform, and share-link boot from the URL hash. DOM suites stub the preview-manifest fetch (no more ECONNREFUSED noise). CI runs once per PR.

### Changed
- Dependabot: minors and patches arrive grouped; majors are excluded and reviewed by hand (ESLint 10 and Vite plugin-react 6 broke CI); GitHub Actions bumps are grouped. `actions/checkout` and `actions/setup-node` moved to v7.

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
- **Installable PWA** with offline app shell (Workbox precache), runtime caching for preview WAVs, update chip in the status bar (a running session is never interrupted by an update), PNG/maskable icons and an Open Graph image rendered by `scripts/render-icons.py`.
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
- **Phone layout could desync and overflow** — `useIsMobile()` read `window.innerWidth`, which grows when desktop-width content overflows on a phone, so a lazily-loaded page could mount in desktop mode under the mobile shell. The hook now trusts the media query, and a phone-width CSS guard keeps every route inside the viewport (verified on all 21 routes at 390 px, emulated and plain).
- **START after the first-run advisory** re-opened the gate (stale closure); acknowledgment and start now happen in one tick.

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

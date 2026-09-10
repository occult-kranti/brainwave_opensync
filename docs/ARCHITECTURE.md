# Architecture

Open Sync is a static single-page app: React 19 + TypeScript on Vite 7, Tailwind 3 for utilities, hand-rolled "Ink & Amber" components, and two audio layers — a **pure, deterministic engine** and a **live Web Audio bridge**. Nothing runs on a server.

```
                 ┌──────────────────────── UI ────────────────────────┐
 pages/ ──▶ ui/session (SessionProvider) ──▶ ui/audio/liveEngine ──▶ Web Audio graph
   │              │           │                    │
   │              │           └── ui/audio/renderExport ──▶ render.worker ──▶ engine/ (offline)
   │              └── safety/ (governor, dose)        docs/, data/, research/ (graded content)
   └── app/routes ── app/shortcuts ── lib/storage ── lib/assetUrl
```

## Layers

### `src/engine` — pure DSP (no DOM, no Web Audio)
Deterministic renderers: `renderBinaural / renderMonaural / renderIsochronic`, six noise colors, singing bowls (`bowls.ts`: five material profiles, three techniques, per-bowl pan, `Phase.bowls[]`; `renderBowl` sums every earlier strike's tail in closed form so periodic re-strikes cost one sine per partial and loop seamlessly) and nature textures, a phase sequencer with equal-power crossfades, breath cues, peak-normalization, and a WAV encoder (PCM-16/24, float-32). `renderSession(spec)` returns stereo `Float32Array`s plus a **manifest** (hash of the spec, duration, peak, warnings) so an export is reproducible. Everything here is bit-exact under test and runs in node, in the browser, in the export worker, and in `scripts/render-previews.mjs`.

### `src/dsp` — measurement
FFT, RBJ biquads, ITU-R BS.1770-4 loudness (K-weighting, gating, LRA, 4× true-peak), THD / THD+N / SINAD, wow & flutter, azimuth, phase coherence. Used by the Analyzer and Sample Lab.

### `src/safety` — the contracts
`SoundDoseTracker` (WHO-ITU H.870 equal-energy model) and `SafetyGovernor` (`authorizeSession()`, infant constraints, panic sequence spec, advisory copy). v2 wires `authorizeSession()` into the live START path; v1 shipped it un-called.

### `src/ui/audio/liveEngine.ts` — the real-time graph
```
tone chain ─┐
noiseBus  ──┼─▶ bus ─┬─▶ directGain ────────────┬─▶ master ─▶ spectrum analyser ─▶ destination
layerBus  ──┘        └─▶ infantFilter ─▶ filterGain ┘       └─▶ splitter ─▶ L/R analysers

previews ──▶ previewBus ─┬─▶ previewDirect ─────────────────┬─▶ destination
                         └─▶ previewFilter ─▶ previewFiltered ┘
```
- Oscillators (binaural: hard-panned pair; monaural: summed pair; isochronic: one carrier gated by a looped raised-cosine envelope buffer).
- Noise / nature / bowl are engine-rendered loops on their **section buses**; a bypass ramps a bus with a 50 ms time constant instead of stopping sources (click-free, phase-continuous). The engine **remembers** layer state set while idle and materializes it on `start()`.
- Bowls are a **set** (`setBowls`, keyed by id, up to `MAX_BOWLS`): each bowl is its own loop whose length is its re-strike interval, through an optional `StereoPannerNode`, into the layer bus. A level/pan change ramps the existing nodes; a voice change (pitch, material, technique, interval) re-renders and swaps with a release ramp. The interval bell (`strikeBell`) is a cached one-shot on the same bus, so bypass, infant low-pass and master gain all apply.
- **Infant path**: a 1 kHz low-pass cross-faded in with equal-power gains.
- **Sleep fade**: `fadeOut(sec)` schedules a 12-segment piecewise-linear (dB-linear) ramp to −60 dBFS then 0, keeps `running` true until it lands, then stops and emits `fade-done`.
- **Pause** ramps master to 0 and suspends the context (phase accumulators freeze; resume is click-free). **Panic** is a 0 ms hard cut of everything, including previews.
- `ctx.onstatechange` distinguishes our own suspend from an **OS interruption** and emits `interrupted`.
- Previews (`playBuffer`, and pre-rendered files via `attachMediaElement`) run through a **preview path** — `previewBus → {previewDirect | previewFilter → previewFiltered} → destination` — so they are audible while the session is stopped (master is 0) yet still honor infant mode's low-pass; they bypass master, so panic cuts them explicitly.
- Gain creation order (bus, master, noiseBus, layerBus, directGain, filterGain) is part of the test contract.

### `src/ui/session` — application state
`SessionProvider` (SessionContext.tsx) owns the front panel, transport, clock, dose, governor, presets, previews, export and share links. It is split so each concern is testable:

| File | Holds |
|---|---|
| `types.ts` | `SessionSnapshot`, `SessionActions` |
| `useSession.ts` | the context object + `useSession()` / `useSessionOptional()` |
| `sessionMath.ts` | pure helpers: phase truncation, export phases, preset previews, beat glide, `fmtClock`, `newUiPhase` |
| `sessionDefaults.ts` | `DEFAULT_FRONT_PANEL`, `FADE_OUT_CHOICES`, `INFANT_MAX_VOLUME_DB` |
| `sessionPersistence.ts` | front-panel blob (sanitized on read), 7-day dose log, advisory acknowledgment |
| `shareLink.ts` | `#s=` codec (base64url JSON, validated + clamped) |
| `userPresets.ts` | MY PRESETS store |
| `previewManifest.ts` | pre-rendered preview lookup |

The 1 s clock reads live refs (limit, fade, phases, volume) so mid-session changes apply; it debits the dose tracker, appends to the dose log, drives the beat glide from the phase plan, and triggers the sleep fade `fadeOutSec` before the limit.

`start()` is the enforcement point: advisory acknowledged → `engine.prepare()` → `SafetyGovernor.authorizeSession({ durationMin, gainDbFs, lowpassHz (infant + filter available), autoShutoff, targetDbA })` → refuse with reasons or start. The fader itself is clamped to the governor cap (and the infant ceiling).

### `src/ui/audio/renderExport.ts` + `render.worker.ts`
Export builds a spec truncated to the session limit, renders in a module Worker (falls back to a synchronous render where `Worker` is unavailable, e.g. tests) and downloads the WAV. The worker imports only from `engine/`.

### `src/app`
- `routes.ts` — **the** route table: path, label, feature-docs module, icon, group, lazy component, bottom-tab flag. App, rail, bottom bar, MORE drawer, palette and Home icons all derive from it.
- `shortcuts.ts` — the shortcut registry; `AppShell` binds one handler from it and `ShortcutsOverlay` renders it.
- `pwa.ts` — service-worker registration with an "update available" event; a cross-tab update never reloads a tab while its session is running.

### `src/lib`
- `storage.ts` — `STORAGE_KEYS` registry + versioned `{version, data}` envelope read/write, try/catch-guarded, injectable for tests. Historical key strings are preserved.
- `assetUrl.ts` — deploy-base-aware URLs for `public/` files (`import.meta.env.BASE_URL`).

### Content layers
`data/` (frequencies with A–D grades and split grades, presets, levels, knowledge), `research/` (experiments X01–X14, critiques, hypotheses, 42 programs, stimulus pack), `theory/` (claim audit chains), `replication/`, `dream/`, `quicklab/`, `soniclab/`, `samplelab/`, `cymatics/`. `docs/features.ts` is the single source of truth for every feature's simple + deep explanation; `docs/vocabulary.ts` is the banned-claim list every copy test imports.

## Shell and platform

`AppShell` renders the desktop rail (full / icon / hidden, persisted), the status bar (session readout, palette hint, PWA update chip, engine LED, pause chip, UTC clock, panic), or the phone bottom bar with a pinned panic segment. It mounts the panic overlay, the first-run **AdvisoryDialog**, the **ShortcutsOverlay**, the **CommandPalette**, and a skip link. Routes render inside an **ErrorBoundary** so a crashing screen never takes the shell (or the panic button) down.

Platform integrations live where the state is: `useWakeLock(running && !paused)` and the `MediaSessionBridge` (lock-screen PLAY/PAUSE/STOP + a silent keep-alive element) are driven from `SessionProvider`.

## Build & deploy

`vite.config.ts` reads `VITE_BASE` (default `/`); the Pages workflow sets `/brainwave_opensync/`. The router basename, `assetUrl`, the manifest `start_url`/`scope` and the Workbox navigation fallback all follow it. The service worker precaches the app shell (~1.4 MB) and caches `previews/` and `stimulus_pack/` WAVs at runtime (cache-first, capped). `index.html` is copied to `404.html` for SPA deep links.

## Testing

Vitest 4. Default environment is node (DSP/data suites); UI suites opt into happy-dom per file. `src/test/setup.ts` clears persisted blobs before every test and seeds the advisory acknowledgment (a "returning user"); `src/test/helpers.ts` exposes `seedAdvisoryAck()` / `clearAdvisoryAck()`. Engine tests run against fake AudioContexts that record connections and AudioParam automation. Page smoke tests use `renderToString` inside `MemoryRouter` + `SessionProvider`.

## Historical note

Comments still cite pre-release design documents (`design.md §…`, `safety.md`, `S30.2`, `W-A`, `P0-4`…). Those documents were the v1 planning corpus and are not in this repository; treat the references as provenance, not as links.

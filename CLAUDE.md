# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Open Sync — an evidence-honest brainwave-audio laboratory: a static React 19 + TypeScript + Vite 7 single-page app (no server, no accounts, no telemetry) with a pure DSP engine, a live Web Audio bridge, safety rails that are contracts, and A–D evidence grades on every claim. Deployed to GitHub Pages under `/brainwave_opensync/`.

## Commands

```bash
npm ci                       # install (Node 20.19+ / 22.12+)
npm run dev                  # http://localhost:3000
npm run check                # lint → typecheck → tests → build (what CI runs)
npm run lint                 # eslint; 0 errors is the bar
npm run typecheck            # tsc -b
npm test                     # vitest run (760+ cases, ~25 s)
npx vitest run src/engine/__tests__/synth.test.ts        # one file
npx vitest run src/ui -t "sleep fade"                    # by name
npm run build                # tsc -b + vite build (+ service worker) → dist/
VITE_BASE=/brainwave_opensync/ npm run build             # the Pages variant
npm run previews:render      # regenerate public/previews/*.wav (node + esbuild)
npm run icons:render         # PWA icons; needs the venv: uv venv .venv && uv pip install pillow
```

Tests: default environment is **node**; a UI suite opts into the DOM with `// @vitest-environment happy-dom` as its first line. `src/test/setup.ts` runs before every file: it clears the persisted front panel / dose log and seeds the advisory acknowledgment (a "returning user"). Suites that call `localStorage.clear()` themselves must call `seedAdvisoryAck()` from `@/test/helpers` afterwards; suites testing the START gate call `clearAdvisoryAck()`.

## Architecture (read `docs/ARCHITECTURE.md` for the full picture)

- **`src/engine`** — pure, deterministic, bit-exact DSP (renderers, sequencer, WAV encoder). No DOM, no Web Audio. Used by the app, the export worker and `scripts/render-previews.mjs`. Changing output here changes preview hashes and breaks bit-exactness tests on purpose.
- **`src/ui/audio/liveEngine.ts`** — the real-time graph (oscillators, section buses, infant low-pass path, sleep fade, pause/suspend, panic, interruption detection). Gain creation order `bus, master, noiseBus, layerBus, directGain, filterGain` is a test contract. New graph behaviour needs a test against the fake AudioContext pattern in `src/ui/__tests__/live-engine-v2.test.ts`.
- **`src/ui/session/`** — `SessionProvider` (SessionContext.tsx, exports only the provider) + `types.ts`, `useSession.ts`, `sessionMath.ts` (pure), `sessionDefaults.ts`, `sessionPersistence.ts`, `shareLink.ts`. `start()` is the safety enforcement point (advisory → `engine.prepare()` → `SafetyGovernor.authorizeSession()`).
- **`src/safety`** — `SoundDoseTracker` (H.870) and `SafetyGovernor`. Rails only ever tighten.
- **`src/app/routes.ts`** — the single route table; App, rail, bottom bar, palette and Home icons derive from it. A new screen = one entry here + a feature doc.
- **`src/app/shortcuts.ts`** — shortcut registry; `AppShell` binds one handler from it, `ShortcutsOverlay` renders it.
- **`src/lib/storage.ts`** — every persisted key is registered here with a versioned envelope; never inline a key string. Historical key strings must be preserved.
- **`src/docs/features.ts`** — single source of truth for feature docs (simple + deep register); `src/docs/vocabulary.ts` — banned claim phrases. Tests enforce sentence counts, word limits, banned words, and screen↔doc coverage.
- **Content layers** (`data/`, `research/`, `theory/`, `replication/`, `dream/`, `quicklab/`, `soniclab/`, `samplelab/`, `cymatics/`) are graded data + pure logic with their own `__tests__`.

## Conventions that bite

- `react-refresh/only-export-components` is an error: `.tsx` files that export a component may export nothing else but types. Put helpers in a `.ts` module (e.g. `canvasDraw.ts`, `phaseTimelineLogic.ts`, `sessionMath.ts`).
- `erasableSyntaxOnly` is on: no constructor parameter properties, no enums.
- `noUnusedLocals` / `noUnusedParameters` are on; `_`-prefixed names are allowed by eslint.
- Public assets must go through `assetUrl()` (root-absolute paths 404 on GitHub Pages). The router basename follows `import.meta.env.BASE_URL`.
- Every claim in copy carries an A–D grade and a citation; "documented" is never "validated"; never use the banned vocabulary.
- Comments citing `design.md §…`, `safety.md`, `S30.2`, `W-A`, `P0-4` etc. refer to the pre-release planning corpus that is not in this repo — provenance, not links.

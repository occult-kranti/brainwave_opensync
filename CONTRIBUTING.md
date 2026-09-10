# Contributing to Open Sync

Thanks for helping build an audio lab that refuses to overclaim. This page is short on purpose; the architecture lives in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and the plan in [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Setup

```bash
git clone https://github.com/occult-kranti/brainwave_opensync.git
cd brainwave_opensync
npm ci
npm run dev            # http://localhost:3000
```

Node 20.19+ or 22.12+ is required (Vite 7). Python (3.11+) is only needed for `scripts/render-icons.py`; use a virtualenv:

```bash
uv venv .venv && source .venv/bin/activate && uv pip install pillow
npm run icons:render
```

## Before you push

```bash
npm run check          # lint · typecheck · 760+ tests · production build
```

CI runs the same four steps on every push and pull request. A red `lint` job is almost always a non-component export in a `.tsx` file (move it to a `.ts` module) or an unused import.

Run a single test file with `npx vitest run src/engine/__tests__/synth.test.ts`, or a single case with `-t "name"`. UI suites opt into the DOM with a `// @vitest-environment happy-dom` docblock; everything else runs in node.

## Rules that are not negotiable

1. **Every claim carries an A–D grade and a citation.** A = solid physics / multiple replications · B = some human evidence · C = plausible mechanism, weak evidence · D = folklore or numerology. "Documented" is never "validated".
2. **Banned vocabulary** (`src/docs/vocabulary.ts`) never appears in user-facing copy. Tests enforce it.
3. **Safety rails are only ever tightened.** The −6 dBFS cap, the 90-minute limit, infant mode, the panic path and the advisory gate are contracts. Loosening any of them needs an evidence note in the PR and a reviewer.
4. **New screens go through the registry** (`src/app/routes.ts`) and get a feature doc (`src/docs/features.ts`, both registers) — the docs tests cross-check both.
5. **Persisted state goes through `src/lib/storage.ts`** with a registered, versioned key and a sanitizer on read.
6. **Nothing phones home.** No analytics, no telemetry, no external calls beyond fonts.

## Where things go

| You are adding… | Put it in |
|---|---|
| DSP that must be bit-exact and testable in node | `src/engine/` or `src/dsp/` (pure functions, no Web Audio) |
| Real-time graph behaviour | `src/ui/audio/liveEngine.ts` (+ a test against the fake AudioContext) |
| Session state or an action | `src/ui/session/` (types → `types.ts`, pure math → `sessionMath.ts`) |
| A screen | `src/pages/` + `src/app/routes.ts` + `src/docs/features.ts` |
| Data with grades | `src/data/` or `src/research/` |
| A keyboard shortcut | `src/app/shortcuts.ts` (the help sheet renders from it) |

## Reporting evidence problems

Use the **Evidence challenge** issue template. Cite the study, report or measurement; propose the grade and wording. Disputes about grades are the most valuable issues this project gets.

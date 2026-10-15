# Spatial edition verification — 15 October 2026

## Candidate gate

`npm run check` passed lint, TypeScript, 98 test files / 1,325 tests and the production build. Evidence: `/tmp/spatial-release-check.log` in this work session. The lazy WebGL renderer chunk is 519.21 kB / 130.34 kB gzip; the new original four-cover WebP is 104 KiB. The Three.js chunk is dynamically imported; no renderer is needed for ordinary DOM controls.

New interaction tests cover bounded 50–180% zoom in both projection modes, reset, route continuity, versioned preferences, malformed-state recovery, reduced-motion preference, still fallback, unchanged active sound through camera/material/motion changes, and panic stopping sound and closing the immersive room. Existing mobile branch, playback/advisory, preview, preset, source, safety and engine tests pass.

The first gate exposed an SSR preference read; it was corrected with a browser guard. Review also corrected reset/drag animation continuity, a fresh-canvas retry after context failure, context-loss animation cancellation and redraw when a paused theme changes. An old copy assertion was satisfied by retaining the explicit “not a brainwave reading” scope statement.

No changes in `src/engine`, `src/ui/audio`, `src/ui/session`, `src/safety` or preset/preview data. Master application code remains unchanged; its workflow metadata and release note identify the new archive edition. Previously preserved branches are untouched.

Calculated contrast on solid panel surfaces: Night body 10.16:1, muted 7.10:1, primary action 11.40:1; Horizon body 9.81:1, muted 7.41:1, primary action 10.98:1. These are token-pair checks, not a full accessibility certification.

## Live review

The local browser cannot reach this workspace preview. WebGL shader execution, desktop visual composition, theme changes, zoom, modal keyboard flow, catalog/player navigation and audio continuity are therefore checked after publication. The automated DOM harness does not compile GPU shaders.

Real-phone visual/device endurance, full screen-reader coverage, WebGL context-loss recovery on physical hardware and a seven-hour playback run are not claimed. Existing mobile component tests and responsive CSS gates run; live desktop verification is recorded in the release report.

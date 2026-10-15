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

## First deployed review and corrective pass

Live Pages release `98b8447` was published successfully (CI 38821371955 and 38821374461; combined build 38821374560; hosting 38822123627). The verification browser reports WebGL disabled (`GL_VENDOR = Disabled`, context creation rejected). This is an environment limitation; GPU shading is not claimed as visually verified. The fallback remained usable for listening, and the live check confirmed zoom state, 4D-axis keyboard adjustment, Escape closing, focus returning to Visual space, silent preset loading, and sound continuing while zoom was activated with Space and the theme changed.

The browser review exposed a clipped fallback notice caused by the old circular camera viewport. The corrective pass makes that viewport rectangular, gives controls the full available width, and adds a genuine interactive Canvas2D fallback for both 3D and 4D geometry. A targeted test checks the actual drawn coordinates scale with zoom, 4D changes the projection, and disposal prevents drawing. Static artwork remains the last fallback. The background remains static without GPU access to avoid multiplying CPU rendering cost.

Corrective release gate: `npm run check` passed lint, TypeScript, **99 files / 1,326 tests**, and the production build (`/tmp/spatial-final-release-check.log`). The fallback is a separate 2.73 kB (1.37 kB gzip) lazy chunk. The live first-release check also confirmed speaker/duration filtering in the hypnosis collection, both themes, and the workshop directory. Escape focus restoration was checked after the dialog's close lifecycle completed; focus returned to the Visual space button. Panic showed the existing Sound is off dialog and reset the session to stopped.

## Final deployed verification

Application commit `17974b28f1978679e1b920a908a75376f776f677`; master publishing commit `22af1cd1a9a37dc8d1cacac2e52be0aabf065dd7`. Both CI runs succeeded (38822867715 / 38822872272), combined publication succeeded (38822872323), and Pages hosting succeeded (38823452033). The published manifest reports the correct archive commit and the 50–180% camera range.

The live browser used the Canvas2D fallback because its WebGL implementation is disabled. Foreground DOM reports `data-renderer=canvas`; background remains still. Visually checked the actual torus at 120%, the Clifford projection at 100% and 70%, fourth-axis keyboard adjustment to 360°, reset to 100%, readable fallback status, expanded controls, Escape/close and focus restoration. The new geometry visibly changes scale. Screenshot: `spatial-live.jpg` (4D at 100%, fallback explicitly labelled). The earlier same-release controls/audio checks remain valid; audio implementation is unchanged.

Ended at the archive home with 3D selected, zoom 100%, motion paused and sound stopped. GPU surface shading remains unverified in this environment; real-phone visuals, screen-reader testing and seven-hour device endurance are also not claimed.

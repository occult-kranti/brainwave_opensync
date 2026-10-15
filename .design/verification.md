# Quiet horizons — verification record

## Preserved contracts
+ Audio synthesis, preset definitions and rendered previews are unchanged.
+ All 131 catalog presets remain available. Existing tool routes remain registered.
+ Selection loads silently. The shared session provider still owns audio, advisory gates, dose, gain limits, pause, stop, persistence and export.
+ The previous release is pinned to ae4a1ebd6d1449979739edc9b5f84e2f09d39287 on archive/listening-room-2026-10-15.

## Automated coverage
The required `npm run check` gate runs lint, TypeScript, the full Vitest suite and a production build. New integration cases exercise Today-style direct selection, explicit playback, pause/resume/stop, editor continuity, advisory gating, unknown presets and infant-mode direct-link rejection. Existing overnight, sand-stage, filter, saved-preset, preview, navigation and engine tests remain active. Mobile and desktop render branches include Listen and Research.

`npm run build:pages` emits 34 route shells plus the home page and 404 fallback. The workflow builds the frozen release with its own base URL and service-worker scope; parent navigation fallback excludes `/previous/`. Small redirect shells preserve links from the archive to the separately built research and legacy projects.

## Visual and access checks
Measured token contrasts: primary text 10.76:1, secondary 5.75:1, muted text 4.56:1 on the paper canvas; primary button 6.96:1; night-section body text 8.09:1. Grade badges use theme-aware colors, and source popovers align away from the viewport edge. Images have intrinsic dimensions, WebP encoding and lazy loading except the main feature. The two new images total approximately 330 KiB.

Source review covers semantic links/buttons, labeled inputs, 16px narrow-screen fields, wrapping layouts, touch controls, reduced motion, and retention of the existing overlay focus/Escape behavior. These checks do not constitute a screen-reader or cross-device certification. The available cloud browser cannot resize its viewport; real phone and seven-hour locked-screen endurance testing remain unperformed. A live desktop walkthrough of the deployed release verified Today → Listen, explicit play/pause/resume/stop, the full-screen sand stage, preset search and its detail sheet, Research and tool search, and the separately deployed archived home. The walkthrough caught and corrected a stopped-player timer display and a section-label decoration collision. A final live check follows the polish deployment.

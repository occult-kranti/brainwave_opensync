# Listening Atlas verification

Date: 2026-10-29. Scope: archive/dark-landscapes, based on 8852ffe. The user's latest instruction rejects both prior designs and the ambient 3D/4D background. This record concerns the replacement, not the previous Nocturne release.

## What changed

The application shell, Home chooser, sound library, player, Studio editing flow, practice worksheet and research directory have new compositions. New paper/ink/blue tokens, self-hosted Instrument Sans and original flat print artwork replace dark spatial framing. Shared headers, form fields, buttons, related-tool navigation and research surfaces carry the same system across the 41 retained routes. Existing topic content, signal calculations, saved data, preview logic and safety contracts remain.

No ambient world renderer or field mounts in the shell, Home, Player, Studio, Healing, Nature or Lucid pages. Dedicated Cymatics and explicit signal views remain tools. A returning device's saved old field preference cannot restore the rejected background.

## Three bounded review stages

1. **Inventory and direction.** Audited all 41 pages and mapped their tasks, first actions, secondary views and overlapping roles. The [architecture record](listening-atlas-architecture.md) distinguishes listening, making, measurement, comparison, models, sources and help. Author/publisher material, available book excerpts and primary interface/accessibility documentation informed the decisions; no claim of full-book reading or superiority over all current products is made.
2. **Implementation.** Rebuilt the principal flows in parallel with clear file ownership, preserved public routes, retained explicit playback/safety gates, and added chosen-time propagation from Home to Player. Targeted checks exercised the changed controls and their existing safety contracts.
3. **Independent structure and rendered review.** Inspected combined phone/desktop captures, fixed confirmed navigation density, Studio hierarchy, tablet overflow, and mobile library hierarchy issues in one correction batch, then confirmed the results. These are AI reviews, not a human usability study.

## Executed checks

| Check | Observed result |
| --- | --- |
| ESLint and TypeScript | Passed |
| Complete repository tests | 126 files / 1,613 tests passed with two workers |
| Late library correction | Four mobile-filter tests passed after phone grouping/sorting moved into the filter sheet |
| Initial full test run | Three stale presentation expectations corrected; a DSP and a NanoLab case passed the bounded targeted recheck; the complete subsequent run passed without changing either renderer or weakening those tests |
| All routes | 41 routes × 320px/1440px = 82 Chromium checks; each rendered a main heading, no document overflow or uncaught page error |
| Old enabled backdrop state | Seeded opensync.field4d='1' before route visits; zero ambient background nodes across every route |
| Representative layouts | Home, Sounds, Player, Practice, Studio, Cymatics, Research, Bashar, Newton–Tesla and session finder at 320/390/900/1440px; 40 route/width checks with no final document overflow or browser errors |
| Tablet collection strip | 768/800/900/1024px documents match viewport; collection strip scrolls within its bounds |
| Phone library hierarchy | First sound title at y650 on 320/390px viewport with navigation beginning at y780; arrangement settings and repeated collection explanation stay available on request |
| Home → Player | Intention, time and equipment produce a concrete sound; chosen window loads quietly; advisory gate, Play, Pause, Resume and Stop work; no duplicate active dock on the full player |
| Studio at 320px | Editing section opens directly, BROWN mixer keyboard adjustment changed -28 to -25dB, expanded textures do not expand the document |
| Long Menu | All 41 route links become available; Close and Stop remain visible after scrolling; Escape restores the invoking control |
| Filter/detail dialogs | Filter closes with focus restoration; sound detail/practice sheet opens and closes; impossible search has a working Clear filters recovery |
| Planner/directory | Two-week selection renders two weeks; directory search finds Bashar and its source page |
| Production build | Vite production base /brainwave_opensync/archive/, PWA and direct route shells verified before publication |

The interactive script initially had two locator errors (a shrinking live selector list and an obsolete button label). Corrected selectors reran only those two checks successfully; those script failures were not application defects. The other three primary interaction checks passed initially.

## Contrast and adaptation scope

Calculated token pairs on the paper surface: primary text 13.51:1, secondary text 6.41:1, muted text 4.66:1. White primary-action text on blue is 5.90:1. Strong input boundaries were darkened to #7e8d81 (3.49:1 on white); the orange text accent was darkened to #bb3d20. These are token-pair calculations and sampled rendered checks, not a screen-reader audit or whole-site WCAG certification. Native form labels, visible focus, meaningful pressed states, reduced motion, disclosure behavior and keyboard transport remain.

## Limits

Browser checks used Chromium and emulated widths, not a physical Android/iOS listening test or a screen reader. Dedicated calculator/visualizer routes rendered successfully; every numerical control and seven-hour/locked-screen behavior were not exhaustively exercised. The earlier audio stability improvements remain, but the user's device-specific 15–30-second noise switch remains unconfirmed. The redesign does not introduce new clinical or extraordinary-effect claims.

## Release boundary

Publish archive/ only, preserving its redirects and every non-archive blob. Master remains protected. Verify source/build tree equality through the connected GitHub integration, successful Pages deployment, and live HTML/entry-asset bytes against the tested build. Record the current application source in archive/deployment.json; do not overwrite the protected root release manifest.

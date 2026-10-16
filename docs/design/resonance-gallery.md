# Archive redesign / 2026-10-16

## Boundaries
Only source branch archive/dark-landscapes. Deploy by replacing archive/ in the existing gh-pages tree. Compare all non-archive blobs before and after. Do not run the master coordinator, merge into master, change the root worker or change other deployments.

## Source-led decisions
- Don Norman, The Design of Everyday Things (2013), author synopsis and contents: https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/ — visible actions and feedback, consistent mappings, recoverable mistakes. Consulted the author material, not claimed full-book reading.
- Jakob Nielsen, Progressive Disclosure: https://www.nngroup.com/articles/progressive-disclosure/ — frequent controls remain visible; specialist settings disclosed in context.
- Thomas Müller, Numerical Chladni figures (2013): https://arxiv.org/abs/1308.5523 — arbitrary membrane solutions require numerical modelling. Our existing analytic virtual-plate approximation is retained and labelled; the renderer is not a new FEM solver.
- Thomas Banchoff, Beyond the Third Dimension, chapter 6: https://www.math.brown.edu/tbanchof/Beyond3d.new/chapter6/s6_8.html — projection changes with 4D rotation. The existing Clifford renderer retains its explicitly mathematical description.
- Three.js OrbitControls: https://threejs.org/docs/pages/OrbitControls.html — damping, constrained camera distance, keyboard-accessible companion controls, dispose on unmount.
- Reddit creator inspiration: https://www.reddit.com/r/threejs/comments/1tyomxr/wavefield_a_real_time_immersive_3js_audio/ and https://www.reddit.com/r/threejs/comments/1to1x53/a_realtime_multioscillator_cymatic_pattern/ — large performance stage and discoverable manipulation. Inspiration only; no copied code/assets or reliance on Reddit for physics.
- Creator implementation reference: https://tympanus.net/codrops/2025/06/18/coding-a-3d-audio-visualizer-with-three-js-gsap-web-audio-api/ — shader-driven displacement and audio/visual separation. Existing React 19, Vite, Three.js and Web Audio are a suitable stack; no framework migration needed.

## Decision ledger
Sequential AI perspectives (UX, graphics engineering, domain skeptic), not independent participant research.
| Finding | Evidence | Change | Acceptance |
|---|---|---|---|
| Navigation changes across page families | AppShell discovery conditional vs instrument rail | Universal header and related tools | Every route reachable; active path clear |
| Small canvas and long inspector compete | Cymatics 640px square, 380px sidebar | Wide stage, presets, fullscreen and task inspector | Camera, pause, capture usable with keyboard |
| Main scene can consume GPU behind an active tool | SpatialBackdrop | Disable ambient background rendering in cymatics | One active visual stage |
| Existing 5D label overstates phase styling | plate5d is a 3D projection effect | Label phase art honestly | No physical 5D claim |
| Multiple styles overlaid | archive-theme.css / spatial.css / page CSS | Single final token/surface layer | Consistent type, surfaces, contrast |
| Master publishing risk | pages.yml rebuilds all branches | Archive subtree publication only | Non-archive Git blob maps identical |

## Artwork
Built-in image generator; original prompt: cinematic dark gallery with a floating copper filament torus, icy-blue glass ring, silver particles, basalt floor, left-side negative space, no text/UI. Result: public/art/resonance-gallery.webp. Expressive artwork; not a scientific measurement. Existing scientific visuals are rendered from code.

## Release verification
- `VITE_BASE=/brainwave_opensync/archive/ npm run check`: lint, TypeScript, 99 suites / 1,323 tests, and production build pass. One intermediate run had an intermittent existing harmonic gain assertion; the isolated suite and final complete gate both passed. No DSP code was changed.
- All 35 routes were loaded through their lazy-route boundary in the production build at 1440×1000 and 390×844. Zero uncaught page errors, failed requests, or horizontal overflows. The bundled Inter font returned HTTP 200.
- Browser interactions: GPU canvas; zoom changes rendered pixels; circular plate; frequency entry; all six views; 4D zoom; fullscreen and Escape exit; sound-library empty state and recovery; preset loading into the player without autoplay.
- With WebGL disabled, the Canvas fallback renders. Reduced-motion preference starts the stage paused. Tests used Chromium software WebGL; this is not a hardware performance benchmark.
- Scientific scope: analytic square/circular virtual-plate fields and existing sand approximation. Fluid art is explicitly artistic; 4D geometry is a projection. No new fluid solver or FEM claim.
- Publication method: update only `archive/` on `gh-pages`, retain archive redirects, compare every non-archive file's Git blob ID, and verify the `master` ref is unchanged.

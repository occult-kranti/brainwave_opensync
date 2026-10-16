# Immersive world redesign — research and review ledger

Research date: 2026-10-16 UTC. Source baseline: `592f96b` on `archive/dark-landscapes`. This is an independent agent review of source material and the existing application, not a human user study. Implementation and live acceptance are recorded separately; the checks below are requirements, not claimed passes.

## Brief and existing constraints

The user rejected a conventional website containing a 3D illustration. The whole archive should inhabit the rendered environment, with more expressive, cross-dimensional sand art. The existing gallery established a coherent palette but its home hero is a static image, specialist routes retain opaque page surfaces, and the nodal particle renderer is a mostly planar point set. Adding more particles alone will not address the composition problem.

Keep the existing React, TypeScript, Three.js, Vite and Web Audio contracts. Starting or loading a visual never starts sound. Stop/panic, keyboard access, deep links, readable research, the Canvas fallback and the unmodified master publication are requirements. A 4D-to-3D projection is mathematical artwork; it is not a simulation of physical sand moving through a fourth spatial dimension.

## Eight actionable findings

### 1. Make the world persistent and change its composition with the route

**Evidence:** Three.js requires explicit resource disposal in a single-page app; geometries, materials and textures are not released automatically. The official performance guidance recommends sharing repeated resources and reducing draw calls. [Three.js cleanup](https://threejs.org/manual/pages/cleanup.html), [React Three Fiber performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

**Design decision:** One mounted world behind the common shell, with route-family camera targets, scene colors and geometry poses. Home can be an open spatial portal; Sounds a ring catalogue; Studio an instrument chamber; Research a quieter observatory. This is a compositional proposal, not a result established by the documentation. Preserve meaningful HTML controls above it. Do not wrap every component in a new canvas.

**Acceptance:** The world remains visibly present in the first viewport of Home, Sounds, Player, Studio and Research. Route changes do not create accumulating contexts or duplicate background canvases. A 20-route navigation cycle leaves the world instance stable and no abandoned RAF loops or scene listeners.

### 2. Build dense sand as one buffered field with shader motion

**Evidence:** Three.js documents per-object draw overhead. Bruno Imbrizi's original particle tutorial uses shared geometry and per-instance attributes instead of a mesh per particle; interaction is passed into a shader. [Three.js object optimization](https://threejs.org/manual/pages/optimize-lots-of-objects.html), [Imbrizi's tutorial](https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/).

**Design decision:** Use a bounded `Points` or instanced field with seeded attributes and shader uniforms for time, dimensional fold, turbulence and color. Make grain structures read as volumes, ribbons, folded surfaces and toroidal streams. Keep a few clear macro shapes; avoid uniform screen noise. Point count must be an implementation budget, not an exaggerated visual claim.

**Acceptance:** No per-grain React components and no rebuilding a particle array on every frame. Distinct presets must produce structurally distinct silhouettes at phone size. Reset reproduces a finite, stable state. Density never exceeds the declared cap.

### 3. GPGPU is available, but a full material solver is a separate product choice

**Evidence:** Three.js `GPUComputationRenderer` uses floating-point textures and paired render targets for evolving state. Its `init()` reports an error and its resources require disposal. Sebastien Lempens' MIT project is a concrete GPU flow-field implementation. [Official addon](https://threejs.org/docs/pages/GPUComputationRenderer.html), [r3f-flow-field-particles](https://github.com/sebastien-lempens/r3f-flow-field-particles).

**Design decision:** For this release, a deterministic shader field is a suitable way to deliver the requested expressive result without making the entire application depend on a new simulation pipeline. If persistent grain velocities are implemented, use a small bounded ping-pong state texture, an initialization failure path, clamped simulation timestep and a no-compute fallback. The API documentation is not evidence that a particular grain model is physically valid.

**Acceptance:** Unsupported float targets or shader initialization failure leaves the interface usable. Pause freezes evolution while camera controls still work. No unsupported claim of fluid dynamics or granular material accuracy.

### 4. Use genuine 4D rotation and an explicitly bounded projection

**Evidence:** Banchoff describes central projection from four-space, including the Clifford torus and its image in three-space. [Beyond the Third Dimension, chapter 6 excerpt](https://www.math.brown.edu/tbanchof/Beyond3d.new/chapter6/s6_8.html). Only this author-hosted chapter excerpt was consulted; this ledger does not claim the full book was read.

**Design decision:** Generate a four-coordinate form, rotate in named coordinate planes, then project to 3D. For example a unit Clifford torus can use `(cos u, sin u, cos v, sin v) / sqrt(2)`. With this unit-norm input and orthogonal rotations, a perspective factor `d / (d - w)` is bounded when `d > 1`. A slider should change the actual fourth-coordinate rotation or projection; merely recoloring a 3D surface is insufficient. Other artistic displacements must preserve the chosen bound or clamp the denominator separately.

**Acceptance:** Sampled coordinates remain finite through the entire control range. Rotation preserves the input 4D norm before artistic distortion. Projection cannot cross its singular plane. Users can see and reset a dimensional change. UI describes it as a projection/art, not measured physical space.

### 5. Borrow the volumetric composition, not an unexamined WebGPU dependency

**Evidence:** `holtsetio/flow` is an MIT-licensed MLS-MPM demo using Three.js `WebGPURenderer`; its README names Refik Anadol as an artistic influence and links separate asset credits. [Flow repository](https://github.com/holtsetio/flow), [asset credits](https://github.com/holtsetio/flow/blob/master/CREDITS.md).

**Design decision:** Study the dense illuminated volumes and their changing silhouettes as art direction. Do not transplant its solver, dependency graph or external assets into the current audio app merely to use a newer renderer. If its code/assets are later incorporated, inspect and preserve both its license and individual asset obligations. No Flow code or asset was copied by this research task.

**Acceptance:** The release identifies its actual rendering technology. WebGL failure is recoverable. It does not advertise MLS-MPM, WebGPU or a physical fluid solver unless those systems are genuinely present and validated.

### 6. Cap the actual render buffer and avoid competing animated scenes

**Evidence:** The Three.js responsive manual distinguishes CSS size from drawing-buffer size, explains the extra work of high DPI, and demonstrates limiting total internal pixels. R3F's performance documentation advocates on-demand rendering when a scene rests. [Responsive design](https://threejs.org/manual/pages/responsive.html), [performance guide](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

**Design decision:** Bound both pixel ratio and total buffer area. Use restrained material complexity, short draw-call chains and an adaptive or conservative quality tier. Suspend the ambient world when an expanded foreground visual occupies the display. Reduced motion must also disable pointer parallax and auto-orbit; a frozen time uniform alone is incomplete.

**Acceptance:** DPR 3 phone and 4K desktop sizes respect the pixel cap. Hidden tabs do not advance simulation. Reduced-motion startup does not animate scene or camera. No performance claim is inferred from software WebGL screenshots; real-device frame timing remains a separate measurement.

### 7. Make the art a playable instrument with a small visible vocabulary

**Evidence:** The Wavefield creator describes its field as cymatic-inspired, explicitly disclaims physical accuracy, and emphasizes presets, layers, projection modes and color response. This is an original creator report on Reddit, used as inspiration only. [Wavefield creator post](https://www.reddit.com/r/threejs/comments/1tyomxr/wavefield_a_real_time_immersive_3js_audio/).

**Design decision:** Offer named structural presets, a dimensional fold, turbulence, density and a few curated palettes, with deeper controls disclosed. Keep Pause, Reset, Zoom and Exit reachable without guessing a gesture. A user should be able to create a strongly different image in two actions without understanding shader terminology.

**Acceptance:** Every structural preset changes the generated geometry. Values and selection states are visible. Tab/Enter can operate all essential actions, Escape exits expanded view, focus returns, and touch scrolling outside the stage still works. Screenshot export records the current camera and preset.

### 8. Treat route legibility and active audio controls as part of immersion

**Evidence:** `PRODUCT.md` establishes voluntary listening, explicit starts, preservation of safety controls and no brain-state inference from chosen frequencies. `DESIGN.md` distinguishes operating tools from reading pages. These repository contracts, rather than an external aesthetic reference, govern the interface.

**Design decision:** Use consistent translucent and darkened surfaces whose density follows the task. Long research text needs a quiet reading plane; the surrounding scene should remain visible at the margins. Keep navigation, sound state and Stop in reliable screen positions. Immersion comes from consistent space, lighting and composition, not making text or safety controls float unpredictably.

**Acceptance:** At desktop and 390px phone widths, no horizontal page overflow, no unreadable text against bright particles, no keyboard trap, no blocked Stop. Every existing route still loads directly below `/archive/`. Loading a preset remains silent until explicit Play.

## Reuse and license ledger

| Resource | Verified source information | Intended use in this pass |
|---|---|---|
| [Three.js](https://github.com/mrdoob/three.js/blob/dev/LICENSE) | MIT; existing project dependency | Rendering primitives and documented APIs; retain dependency notices |
| [r3f-flow-field-particles](https://github.com/sebastien-lempens/r3f-flow-field-particles) | Repository declares MIT | Architecture reference; no vendored implementation from this research task |
| [holtsetio/flow](https://github.com/holtsetio/flow) | Repository declares MIT and separate asset credits | Visual/technical reference; no imported assets or solver |
| [Imbrizi particle tutorial](https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/) | Original author tutorial; repository linked | Technique explanation; no copied code or art |
| Banchoff chapter, Wavefield creator post | Authored mathematics / creator inspiration | Paraphrased understanding; no copied artwork or text |

## Deployment gate

Pass the repository's existing lint, type, unit and production-build gates. Exercise all route families and the new world/sand controls in a browser, including reduced motion and unavailable WebGL. Record observed outcomes without equating screenshots with performance benchmarks. Publish only `/archive/`, compare every non-archive blob before and after, and verify the `master` ref is unchanged. This ledger does not authorize changes outside that boundary.

## Independent implementation review

Review covers the new world renderer and common-shell integration; sand and final page styling were still being implemented at this checkpoint.

| Finding | Evidence | Resolution at this checkpoint |
|---|---|---|
| Changing quality or ambient state recreated a renderer on a forcibly lost canvas context | `ResonantWorld.tsx` effect dependencies combined with `worldRenderer.ts` disposal. Isolated Chromium software-WebGL check: initial context valid, disposal lost it, immediate same-canvas recreation threw a precision lookup error. | Implementing agent keyed the GPU and fallback canvases by quality/enabled/immersive state. Code inspected. The implementing agent subsequently reported successful quality/ambient toggle and forced-context-loss browser checks. |
| Floor and halo shaders used reversed `smoothstep` edges | `worldShaders.ts`: the former `(16, 3)` and `(1, .7)` edge pairs relied on undefined GLSL behavior. | Implementing agent changed both to one minus ascending-edge `smoothstep`. Code inspected. |
| Reset did not reset time-driven rotation or parallax | Provider incremented `resetToken`, but both renderers ignored it. | GPU now resets elapsed time and pointer/smoothed offsets; Canvas resets elapsed time. Code inspected. The implementing agent reported pixel-identical reset screenshots after animation. |
| The first integrated world host had no size | Independent browser found a healthy WebGL renderer inside a zero-height `.resonant-world`; no corresponding positioning selector was present yet. | Home/CSS owner added the positioning rules. Independent browser recheck: world bounds `1440 × 1000` at `1440 × 1000` viewport; the original GPU canvas survives navigation from Home to Studio. |
| Interacting inside Visual space hid its focus-return target | Independent browser reproduced Scene → Visual space → Zoom → Escape: outside-pointer handler closed the parent details, then focus returned to `BODY` because the trigger was hidden. | Integration owner prevents details dismissal while the portal is active. Independent browser recheck: details stay open during zoom interaction; Escape restores focus to the visible Scene summary. Zero uncaught page errors. |

The world component is outside the pathname-keyed route transition, so ordinary navigation preserves the background renderer. Its loop yields when hidden or suspended; the drawing buffer is bounded by pixel ratio and a three-million-pixel area limit. These are source observations, not hardware performance results. The expanded visual space deliberately mounts its own renderer while suspending the background loop; there can therefore be two allocated contexts but only one active world animation.

## Integrated release verification

The final production build uses `/brainwave_opensync/archive/`. `npm run check` passed ESLint, TypeScript, all 102 test files / 1,336 tests, and the production build. The two former image-theme assertions were updated to verify the persistent rendered world while retaining audio continuity, saved theme and route behavior checks.

Production-preview Chromium checks fully rendered all 35 routes at 1440 × 1000 and 390 × 844. No uncaught page errors, failed requests or horizontal page overflow were observed. The world canvas remains mounted on Home → Studio navigation. One batched visual inspection led to a single material correction: the default sculpture now has a shaded copper/silver body, procedural reflections and a reflected floor image. Desktop and mobile confirmation views were inspected after that correction.

A final production interaction check passed reduced-motion startup, 3D/4D changes, quality and ambient off/on, expanded-world zoom with Escape/focus return, all five sand forms, XW/YW changes, camera zoom changing pixels, PNG export, stage expansion/Escape and Canvas fallbacks with WebGL unavailable. The implementing agents also checked forced context loss, deterministic reset and the world drawing-buffer pixel cap. Browser GPU checks used Chromium software WebGL; they do not establish real-device frame rates.

The release contains original shader/geometry implementations using the existing MIT Three.js dependency. No external repository code or artwork was vendored in this pass. Publication is restricted to the archive subtree with byte-for-byte Git object checks for every other deployed file.

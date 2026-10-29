# Open Sync: Listening Atlas

The current brief supersedes every previous spatial brief: the user rejected both the old design and the continuous 3D/4D background, and gave complete design control. This release replaces the visual system, application shell and principal task flows. Work remains on archive/dark-landscapes; master and other published versions are protected.

## Design contract

Open Sync is a personal sound library and workbench. The first useful view helps a visitor choose a sound, rather than demonstrating a renderer. The central object is a sound recipe: find it, load it quietly, deliberately press Play, optionally edit it, inspect its signal, or follow its source. All 41 existing routes remain available.

A bright editorial desk suits actual daytime phone use and legible tools. Warm paper #f4f3ec, white surfaces and ink #1d2926 replace dark scenery, glass and scrims. Electric blue #3159d9 identifies actions and selected controls. Persimmon #bb3d20 adds a small art/navigation accent. Secondary text #4d5b55 and muted #637069 remain readable. Borders #d3d8ce organize groups; strong borders #7e8d81 identify inputs.

Self-hosted Instrument Sans carries headings and the wordmark; Inter carries controls and reading. Heading tracking stops at -.04em. Panels generally use 12–16px radii and controls 6–8px. Measurement digits remain tabular. A single original flat print-art cover supplies visual identity inside the Home chooser. It is not wallpaper, a simulated signal or a medical visualization. See public/art/listening-atlas-provenance.md for the exact prompt and optimization record.

## Information architecture and views

Home, Sounds, Make and Research are the four main desktop destinations. Phones expose Home, Sounds, Make and Menu with persistent Stop. The full menu and searchable directory group Listening, Making, Measuring audio, Models & experiments, Reading & sources, and Help. Actual measurement, personal comparison and speculative physical models are clearly distinct. The complete route inventory is docs/design/listening-atlas-architecture.md.

Home is an actual chooser: intention, available time and equipment lead to a concrete sound and capped listening window. Phone settings use a compact Adjust disclosure. Loading never starts audio. The player prioritizes state, remaining time, Play/Pause/Stop and volume; setup and source details follow. The active-session dock appears on other routes, not as a duplicate on the full player.

Sounds is a searchable row-based library. Preview, Choose sound and detailed practice/source guidance are separate actions. Familiar listening collections precede specialist studies. On phones, arrangement controls live in Filters, while collection context is optional. Tablets scroll the collection strip locally without expanding the document.

Studio places editing navigation before the playback/settings desk. Tone, textures, sequence, signal views and Save/export are distinct work areas. Phones disclose long sound metadata and starting-point links. A dedicated visual lab and user-opened signal views remain tools; they are not page backgrounds.

Practice is a form-first planning worksheet. Weekly rows, readiness guidance, repetition advice and sources remain. Research is a searchable task directory with source-reading guidance. Shared research headers prioritize titles and useful introductions; evidence conventions can be opened when needed. Related lab navigation collapses on phones.

## Boundaries and implementation

No ambient 3D/4D renderer mounts in the shell, Home, Player, Studio, Healing, Nature or Lucid pages. Old enabled preferences cannot restore rejected backgrounds. Dedicated Cymatics artwork and actual signal plots remain available. The existing React/TypeScript/Vite stack, Lucide icons and tested dialog primitives remain appropriate; adding a new framework would not improve these tasks.

Preserve every sound definition, safety governor, explicit-start gate, gain/session limits, Stop/panic, previews, saved presets, exports and local privacy. The earlier audio buffering/smoothing improvements remain unchanged. A selected Home window cannot extend the original preset or governor maximum. Native disclosures, labels, readable fields, keyboard focus, scroll containment and reduced motion are core interaction contracts.

The Impeccable launcher is unavailable in this runtime. Its published craft floor and available design guidance were read directly; no CLI quality score is claimed. The user explicitly delegated design choice, so this build did not stop for another aesthetic selection. No new Figma file or human usability study is claimed.

## Verification and publication

Use one combined desktop/phone inspection and one bounded correction/confirmation pass. Exercise the actual chooser→player→advisory→pause/resume/stop flow, filters/details, menu focus and sticky Stop, expanded Studio controls, planner and directory. Run lint, TypeScript, complete repository tests and the production-base build. Check all 41 routes at 320 and 1440px, including old enabled background state. Record observations and limitations in docs/design/listening-atlas-verification.md.

Publish only archive/ while preserving its redirect folders. Compare all non-archive Pages blobs and master before/after. An archive-local deployment record identifies the application source; the protected root manifest remains untouched.

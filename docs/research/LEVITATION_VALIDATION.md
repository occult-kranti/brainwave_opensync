# Levitation laboratory validation

16 October 2026. These checks validate software behavior and selected analytical translations; no new physical levitation, energy-generation or biological experiment was performed.

## Research and model checks

- 35 distinct source records; 18 typed connections and eight proposed experiments have resolved source references. Three media records distinguish official transcripts, retrieved supplied captions and unavailable video inspection.
- Independent source review corrected the NASA capacitor report title and Einstein PDF page locator, removed an unsupported controller detail from a China program summary, and surfaced the AcousTools manuscript/code sign discrepancy.
- 39 model tests cover units, signs, pressure conventions, finite-difference force/potential consistency, both contrast signs, gravity and buoyancy, marginal/no-equilibrium cases, phase periodicity, magnetic gradient conventions, and mechanical source/loss power.
- A separate reviewer checked 336 numerical probes. The pinned-reference comparison uses 244 samples and is documented in `levitation-code-audit.md`. Agreement under shared approximations is not experimental validation.
- The three SVGs are original conceptual diagrams with accessible titles/descriptions. Acoustic node positions, magnetic-model limits and the vibration load path were reviewed.

## Application checks

- Archive: **1,489 tests in 113 files** passed. Master: **1,426 tests in 103 files** passed.
- Both editions passed lint, TypeScript checks and production builds. The new page has seven behavior tests for filters, model exports, silent controls, advisory/infant restrictions, owned-preview cleanup and silent Studio loading.
- Headless Chromium 153 with Playwright 1.62.1 checked both actual deployment base paths at 1440 × 1000 and 390 × 844. All six sections, country/query and connection filters, three CSV downloads, SVG download, four preset cards and Studio loading passed. No page exceptions, failed resource responses or horizontal page overflow were observed. Bench interaction and preset loading created no AudioContext.
- Mobile plots retain a readable minimum width within their own horizontal scroll area; CSV exports expose all numerical rows and units.

## Preservation checks

- All **155 existing preview WAV hashes**, their entry metadata and the manifest defaults match the pre-change branch heads. Four new two-second 12 kHz PCM16 stereo sine previews bring the catalog to **159**.
- Preview audio plus manifest totals **59,936,455 bytes**, under the existing 60 MB budget. All 159 headers, sizes and hashes are checked. The append tool refused an over-budget dry run before writing files.
- Shared new implementation and evidence files are identical in both editions. Edition-specific navigation/layout files were patched individually; the audio engine, live engine, session provider, global safety rules and home pages were not changed.
- The existing deployment workflow remains responsible for publishing master, the archive edition and the preserved older editions. No workflow or frozen branch was modified.

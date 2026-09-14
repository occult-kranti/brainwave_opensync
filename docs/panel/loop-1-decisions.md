# Loop 1 — decisions and ownership

Date: 2026-09-14. Baseline: OpenSync 2.5.0, master `2d19357`.

The moderator read all five independent reports: [UI/UX](loop-1-ux.md), [psychology](loop-1-psychology.md), [therapist](loop-1-therapist.md), [user](loop-1-user.md), and [moderator](loop-1-moderator.md). These are AI role reviews of implementation and sources. They are not human interviews, clinical endorsements, measured usability rates, or a claim of WCAG conformance.

## Decision

Keep one main workspace and make listening its first entry. Home's main action opens the existing Presets route. Make the ordinary Studio view a player with duration and output controls; reveal synthesis and file operations on request. Keep specialist pages reachable through shallow task groups and a compact searchable directory. Do not add another route, audio engine, player state provider or onboarding wizard.

All four reviewing roles independently identified the same main problem: the visible Tools label still contained thirteen unrelated peers and Home repeated them. They also agreed that Studio is too dense for the first listening task and that Presets should lead with audible descriptions. The therapist role found an additional behavioral defect: the immediate stop dialog focused a button that could begin a Studio session after stopping only a preview. That correction is part of this release.

## Accepted scope and evidence ledger

| ID | Accepted change | Reports | Verification required |
|---|---|---|---|
| A1 | Compact Home with Listen, Create and Inspect task paths. Choose a sound opens `/presets`; build a chord and inspect a recording have direct links. Remove the large illustrative hero and module-wide lowest grades. | All roles | Initial Home task order; links resolve; no tool-wide grades; reduced-motion and narrow-layout checks. |
| A2 | Home, Presets and Studio remain direct primary destinations. Specialized navigation is closed initially, one level deep, with current-route context on deep links. | UX, psychology, therapist, user | Initial visible route count reduced; all routes reachable; current group auto-reveals; explicit collapse respected; hidden links are not keyboard stops. |
| A3 | Shared metadata supplies purpose labels, old-name aliases, search terms and group membership to desktop, mobile, Home directory and command search. | UX, psychology, moderator | Registry coverage without duplicate visible destinations; route URLs unchanged; ordinary searches such as chord, recording, Monroe, Bashar and noise; clear empty/reset behavior. |
| A4 | Presets has a compact starting choice, explicit all-presets and Bashar browsing, visible preview lengths and a separate full-session load action. Evidence filtering is optional and describes claim evidence rather than sound quality. | UX, psychology, therapist, user | Preview/manifest duration; chosen collection survives Back/refresh; all four Bashar sounds; source details and metadata-only phase-fade limit; no autoplay; old saved presets accessible. |
| A5 | Studio keeps current sound, Edited/Ready/Playing/Paused state, duration, level and transport visible. Sound design, detailed visualizers and export/share/reset become secondary sections. | All roles | Change duration without visiting Safety; caps still apply; view toggles preserve live settings; active layers summarized; blocked starts and export errors remain visible. |
| A6 | Stop all sound retains the immediate global cut. The dialog initially focuses Keep sound off. Any restart action explicitly refers to Studio and does not claim a calibrated safe level. | Therapist, UX, psychology, user | Default focus/Enter stays stopped; Escape and keep-off never start; explicit restart still passes advisory/governor; previews cut; mobile and modal stop reachable. |
| A7 | Correct the inspected Safety implant reassurance and the globally-disable label whose action changes Studio only. Remove the identified slogans. | Therapist | Copy matches checked primary guidance and actual handler scope; no changed safety limits or clinical intake. |
| A8 | Guide starts with ordinary task links while retaining the existing searchable feature documentation. Simple player is a secondary, clearly separate entry. | Psychology, UX, moderator | Task links resolve; old docs remain; no claim of seamless playback transfer to `/app/`. |

## Final navigation mapping

Home task headings and navigation group headings serve different purposes. Home offers three paths; the persistent menu exposes common destinations and puts specialist routes into the following groups. Every route appears once in the navigation model.

| Navigation area | Destinations | Initial presentation |
|---|---|---|
| Primary | Home, Presets, Studio | Direct links |
| Create & explore | Harmonic Lab, Sound Methods, Sonic Lab, Frequency reference (`/library`), Cymatics | One collapsed disclosure |
| Analyze audio | Recording analysis (`/sample-lab`), Live analyzer (`/analyzer`) | One collapsed disclosure |
| Run experiments | Sleep & Dream, Quick Lab, Experiment Lab, Replication Bay | One collapsed disclosure; sleep page described as an experiment |
| Theory & research | Levels, Knowledge, Channeled Sources, Theory Explorer, Critique Library, Hypothesis Tracker, Programs Archive | One collapsed disclosure |
| Help | Safety, Guide, About | Safety directly reachable; other help may collapse |

Mobile's four ordinary tabs become Home, Presets, Studio and Safety, followed by More and the existing pinned global stop segment. This replaces the frequency-reference tab with the listening catalog. Paths, module identifiers, feature-doc coverage and saved data do not change because a navigation label changes.

## Delegated ownership

Ownership was communicated before implementation. Agents must coordinate any change beyond these boundaries with the root integrator.

| Owner | Files/surfaces |
|---|---|
| UI/UX | `src/app/routes.ts`, new shared navigation metadata, `GroupedNavigation`, `AppShell`, `CommandPalette`, dedicated route/navigation/palette/mobile checks. Supplies metadata interface to Home owner. |
| Psychology | `Home`, Home-specific CSS, `Guide`, Guide-specific CSS if needed, dedicated Home/Guide checks. Uses the UI/UX registry. |
| Therapist | `Panic`, `Safety`, dedicated stop-dialog checks. Supplies final wording to shell owner. |
| User | `Presets`, `presets.css`, preset presentation helper if necessary, dedicated preset/Bashar checks. Coordinates starting sounds and complete mix profiles with root before changing load behavior. |
| Root integrator | Studio progressive controls and duration; shared state/data and any necessary claim/preview integration; docs/features; reusable skill; integration checks, release and publication. |
| Moderator | Decision ledger, independent cross-cutting inspection, actual loop-2 synthesis and loop-3 release recommendation. No push authority used by this role. |

## Deferred or rejected proposals

| Proposal | Decision and reason |
|---|---|
| Replace root with Everyday or build a new simplified player | Defer. The existing separate document uses another bootstrap/router lifecycle. A primary Presets path and simpler Studio address the task without a migration or implied session transfer. |
| Add favorites, recommendation scores, mood tracking or personalization | Defer. Not needed to organize existing tools; could add decisions and imply unsupported suitability. |
| Redesign every specialist page in the same release | Defer. Improve the paths to existing functioning tools first. Existing specialist complexity can remain inside its named destination; specific misleading captions may be corrected. |
| Rewrite deterministic DSP or implement the deferred authored phase fades | Out of scope. This is a task-flow release. Preserve known audio limits and disclose them. |
| Globally replace all evidence grades or upgrade metaphysical claims | Reject for this release. Remove inappropriate module-wide navigation grades and clarify optional filtering. Grade semantics and source claims remain tied to the specific evidence. |
| Change arbitrary session defaults to clinically recommended durations | Reject. In-context duration and described starting sounds give control without inventing therapeutic prescriptions. |

### Starting sound selection

The compact set uses three existing entries: `relax-alpha-ease`, `exp-phi-ladder`, and `exp-phi-bowl-chord`. They offer a beat pair, a pitch sequence and a modeled bowl chord. These are examples of audible forms, not recommendations for a mental state. Root adds a complete clean mix profile to `relax-alpha-ease`; the two phi examples already carry deliberate profiles. Full duration remains visible and editable in Studio.

A proposed pink-noise starter was rejected after inspecting `loadPreset`: legacy noise-mode entries are mapped to binaural live mode. Promoting that entry would promise a sound different from its current full-session load. That pre-existing live/load mismatch is recorded as a deferred audio issue; it is not disguised by the new starting set and should not be described as repaired in this release.

## Cross-cutting checks before loop 2

- `setLimitMin` permits only shorter limits while running. Studio must not silently offer lengthening a live session; explain or disable it without weakening the setter.
- Legacy presets without a mix profile retain prior layers. A promoted starter must use a complete deliberate mix or plainly describe that behavior; root owns any shared-data change.
- Tracked previews are distinct from Studio playback. Global idle wording must say Studio is ready, not claim all audio is silent: some existing Analyzer calibration buffers do not use `previewId`.
- Harmonic Lab and Sound Methods currently tell a panicked visitor to use the global resume control. Update those captions to the new keep-off workflow; restarting Studio would block the intended preview.
- File operations may be collapsed, but progress, cancellation and errors that require action remain perceivable. A clean initial screenshot does not justify hiding an active operation.
- Recheck the same tasks after implementation and again after corrections. An implementation note is not a substitute for the second and third review passes.

## Later-loop record

Loop 2 will record findings against A1–A8 after code exists, with blocking defects delegated back to their owners. Each reviewer will inspect at least one surface outside their own implementation ownership to avoid treating self-review as an independent critique. Loop 3 will record remaining defects and actual automated/browser release evidence. This document deliberately does not mark future checks as passed.

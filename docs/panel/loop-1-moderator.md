# Loop 1 — moderator's independent brief

Review baseline: OpenSync 2.5.0, master `2d19357`. This is an AI role review of repository content and flows, not a study with human participants or a clinical assessment. Findings below are independent of the other panel reports, which were not yet available when this brief was written.

## Problem definition

The current release changes the label above thirteen practical routes to Tools but still presents thirteen peer choices. Home repeats that inventory after a large hero, an explanation, and a four-step guide. Its main action sends a beginner to the full Studio. Studio starts with transport, meters, saving and export, continues through session controls, and exposes synthesis, visualizers, noise, layers and phases together. Presets opens a complete catalog while also promoting one experimental collection. The visitor must understand our modules before choosing what to do.

The existing Everyday entry already supports a small listening flow, but it is described as another app among four Home actions. It shares the underlying session architecture but mounts in another document. Moving there is navigation, not a seamless transfer of an active session. The next release should clarify this option while keeping one dependable main work path.

## Tasks and acceptance criteria

These are product acceptance targets for the release, not measured human success rates.

| Task | Success criteria |
|---|---|
| Hear a sound without learning synthesis | Home has one clearly named listening entry. The next screen offers a short, described starting set and optional browsing. A visitor can preview a selected sound without opening a theory page or configuring a synthesis parameter. Advisory, stop, mute and failure states stay reachable. |
| Choose and play a full preset, including Bashar sounds | The sound catalog identifies audible character and duration before source details. Collection links survive refresh and Back. Loading still exposes the selected name and full-session length before Start; it never starts a newly chosen sound implicitly. |
| Change the sound I am using | Studio opens with play/stop, selected sound, output level and duration in the primary area. Editing sections have explicit names and visible state. Hiding a section does not disable its active sound, erase changes or hide the fact that a layer is on. |
| Make a chord or compare an audio method | A compact Create group distinguishes musical harmony, sound patterns and the session editor in plain descriptions. Existing direct links, saved recipes, WAV export and the universal stop path remain available. |
| Check a claim or inspect an audio file | Research remains collapsed initially and opens when its route is current. Audio measurement and listening experiments have a distinct secondary grouping. Nothing implies that an audio analyzer measures brain activity or that an evidence grade is a sound-quality score. |

## Bounded architecture alternatives

| Alternative | Benefit | Cost and risk | Decision |
|---|---|---|---|
| Keep all Tools links visible; improve labels and spacing | Small implementation scope | The same number of competing entry points and full Studio remain | Insufficient for the user's complaint |
| Replace root with the separate Everyday app | Very short first-listen flow already exists | Two document/router/state lifecycles; source collections and creation tools need bridges; old installed entry and active playback behavior need substantial migration work | Defer as a separate migration |
| Task-led Home, a short listening entry, grouped specialist navigation and progressive Studio controls | Reduces first decisions while retaining existing route and audio contracts | Requires explicit grouping metadata, deep-link tests, expanded-state handling and truthful active-layer summaries | Recommended scope for this release |

The recommendation does not require a new audio renderer, clinical personalization, mood inference, engagement scoring, a database, accounts, or a new brand. Those would not resolve the present organization problem.

## Proposed navigation model

Home should answer “What would you like to do?” with three entry paths: Listen, Create, and Inspect. Listen is the primary action; Create and Inspect carry a short description. The first screen should not reproduce the full application map.

The persistent navigation should show the ordinary destinations needed to resume work, then disclosures for specialist tools. One possible mapping is:

| Group | Destinations |
|---|---|
| Listen | Presets; the existing simple player as a clearly marked separate entry; Sleep & Dream where appropriate |
| Create | Studio, Harmonic Lab, Sound Methods, Sonic Lab |
| Inspect & test | Analyzer, Sample Lab, Cymatics, Quick Lab, Experiment Lab, Replication Bay |
| Theory & research | Existing seven research pages; Library if its actual content is a reference catalog rather than playable presets |
| Help | Safety, Guide, About |

This mapping is provisional. The designer and user role should challenge labels using the five tasks; the moderator should resolve duplication before code. Preserve `/library` and its module name even if its navigation label becomes more explicit. Preserve Home, Studio, Library and Safety as the current four mobile tabs unless the accepted panel finding justifies changing the tab contract together with tests and docs. Panic is not a negotiable navigation item.

## Three-loop moderation and implementation plan

1. **Loop 1: diagnose and decide.** Each role records concrete observations with file or route references, separates evidence from interpretation, and proposes at most five changes. Moderator merges overlapping findings into one acceptance matrix, records disagreements and selects a bounded architecture. Each accepted change receives an owner and a verification method. Repository facts take precedence over assumptions about users.
2. **Loop 2: build and challenge.** Delegate independent surfaces with explicit file ownership: route/shell navigation; Home/catalog entry; Studio disclosure and summaries; verification/copy. Reviewer roles walk the same five tasks in the implementation, including first visit, keyboard use, active playback, mute, panic and narrow layouts. Moderator prioritizes defects that block the task or misdescribe state, then delegates corrections. Styling preference alone does not reopen accepted architecture.
3. **Loop 3: verify and release.** Review the revised build against the acceptance matrix; collect actual task evidence, automated checks and browser observations. Record what was changed, what was rejected and what remains unverified. Resolve release blockers, run the repository gate, push, verify CI/deployment and inspect the published routes. Do not present role simulations as a psychologist or therapist endorsing the product.

## Change risks and controls

- **Hidden active audio:** collapsed controls must summarize active layers and keep stop, selected session, gain and remaining time visible. Controls continue to use the existing SessionProvider; no second player inside the main app.
- **Broken navigation or duplicated taxonomy:** derive destinations from the route registry; use explicit navigation metadata rather than copying route arrays into Home and the shell. Research direct links must reveal their current-page context without permanently defeating a user's collapse action.
- **Preset filtering that misleads:** do not rank acoustics by clinical evidence. Keep grade filtering optional and explain the claim scope in details. URL collection state must stay coherent with categories, search and empty states.
- **Loss of work:** disclosures and route changes must preserve the current front panel and saved recipes. Controls must not reset because their view is hidden. Loading a new preset remains a deliberate action.
- **Comfort control lost in cleanup:** never bury panic, stop or an active-session indicator to achieve a cleaner screenshot. Keep the existing safety and DSP contracts unchanged; device loudness is not inferred from a digital fader.
- **Evidence and language:** psychological and therapist perspectives can identify comprehension or agency risks. They do not establish a medical indication or validate the sounds. Review statements about sleep, focus or nervous-system state against the actual claim and source.

## Initial moderator recommendation

Proceed with the task-led architecture, not another feature expansion. The concrete release should reduce the initial choices, provide a normal listening path, preserve specialist routes behind named groups, and progressively disclose Studio complexity. Final group names and first-listen destination are intentionally awaiting the other roles' independent findings.

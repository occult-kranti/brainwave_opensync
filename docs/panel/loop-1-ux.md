# Loop 1 — UI/UX designer audit

Date: 2026-09-14. Baseline: repository v2.5. This is an independent expert code walkthrough, not observed participant research or a clinical review. The requested redesign should change the order of decisions and the density of the working screens, not only rename the existing sidebar group.

## Inspection

Read `CLAUDE.md`, `docs/ARCHITECTURE.md`, the route registry, `Home`, `GroupedNavigation`, `AppShell`, `CommandPalette`, `Studio`, `Presets`, `Library`, `Analyzer`, `SampleLab`, `HarmonicLab`, and the Everyday entry, Play screen, copy, and intent application. Inspected the other practical routes' panels and actions. Applied the OpenSync audio research skill: shared playback and safety contracts remain the integration boundary.

The current top-level Tools group exposes 13 pages at once. Home repeats the same 13 destinations as large cards with steps and module-wide lowest grades. Grouping theory pages helped one part of the hierarchy, but did not prioritize the practical tools.

## Task walkthroughs and problems

| Task | Current route through the implementation | Friction and implication |
| --- | --- | --- |
| Hear a ready-made sound | Home → Studio, or Home → Presets → preview → load → Studio → start; alternatively Home → separate Everyday app | Four hero actions compete. The main action takes the listener directly to a technical editor. The simple player exists but its label explains neither its sounds nor that it leaves the current application entry. Presets has the most useful first listening action but is not the primary Home action. |
| Build a chord or frequency sequence | Choose between Studio, Library, Harmonic Lab, Sound Methods, Sonic Lab, Cymatics and three experiment pages | The navigation labels describe modules and implementation history, not distinguishable tasks. Harmonic Lab's numbered flow is already clearer than the flat catalog. Library is actually a frequency reference with audition, not saved music. |
| Inspect an audio file | Choose Analyzer or Sample Lab; both accept files | The choice is ambiguous until opening both. Sample Lab is the deeper recording report; Analyzer is the live signal/microphone view with a smaller file path. The Home summaries do not establish this distinction. |
| Play an imported Bashar preset | Presets → collection → Load into Studio | Studio presents start, elapsed time, limit, preset, gain, mute, save, analyzer, WAV, fade, format, share, reset, and notices before the main synthesis controls. Duration is displayed here but must be set elsewhere in Safety. This interrupts the straightforward choose-duration-play workflow. |
| Keep experimenting after opening another tool | Global shell plus independent tool previews | The global status reports the Studio engine, not every preview. Do not imply that a sound-method preview can be paused by a Studio-only pause control. Keep scope explicit. |

## Recommendations by priority

### P0: replace the catalog-first Home with three task paths

Use a compact heading and short introduction. Offer **Listen to a sound**, **Create a sound**, and **Inspect audio** as the three clear paths. Each contains one primary destination and a small set of descriptive alternatives:

- Listen: Presets; secondary Bashar collection and the existing simple player, explicitly labeled as a separate player.
- Create: Studio; secondary Chords & tuning, Sound recipes, and Audio patterns.
- Inspect: Recording analysis; secondary Live signal analyzer and Sound visualization.

Place a complete, searchable tool directory below these paths with concise purpose text. This is the discovery surface for specialized tools, replacing the repeated documentation cards and three-step lists. Keep the library of documentation in Guide. Place theory and source links in one closed disclosure, as the user already requested. Avoid a new simple-player implementation: reuse the existing functioning session layer and Everyday entry.

The full-height animated hero is an optional illustration, not a task. Reduce it substantially or remove it from Home. A waveform that is not monitoring the current sound should not resemble a live session display.

### P0: make the sidebar task-based and shallow

Keep Home, Presets, and Studio directly reachable. Under Tools, provide predictable task categories rather than thirteen peer items. Proposed categories and route placement:

| Category | Routes | Presentation |
| --- | --- | --- |
| Listen | `/presets`, `/dream` | Presets primary; label Dream as an advanced sleep experiment, not ordinary sleep audio. |
| Create & explore | `/studio`, `/harmonics`, `/sound-methods`, `/sonic-lab`, `/library`, `/cymatics` | Studio primary; specialized choices in a disclosure. Name Library as Frequency reference. |
| Analyze audio | `/sample-lab`, `/analyzer` | Recording analysis and Live analyzer, with original page names retained as searchable aliases. |
| Run experiments | `/quicklab`, `/lab`, `/replication` | Closed by default; describe as comparisons/protocol tools, not required listening steps. |
| Theory & research | Current seven research routes | Closed by default, auto-reveal the active deep-linked route. |
| Help | `/safety`, `/guide`, `/about` | Safety stays plainly accessible; Guide and About may be in a Help disclosure. |

The exact label taxonomy is a panel decision. Do not duplicate Studio or Presets in the visible menu when making them primary. Use one shared category registry to derive desktop, mobile, Home directory, and command search. Keep route paths and deep links intact. Limit navigation to one disclosure level; opening a group exposes links rather than another stack of nested accordions.

### P0: split Studio into a player and optional editing sections

Keep the sound name, **Play / Stop**, pause, duration, volume, and remaining time visible. Provide a visible input for session duration using the existing setter and governor bounds. Put Save, WAV settings, Share and Reset in a clearly labeled secondary area. Use a default listening view with the timeline summary and current sound description, plus a **Sound controls** disclosure or explicit edit view for tones, noise, layers, and detailed phase editing. Export failures and blocked-start messages must remain visible even when their associated panel is closed.

Do not remount or recreate the audio graph when changing view. Preserve the preset's full specification, sequence and gain metadata; the view change only affects presentation. Avoid a wizard: adjusting sound and listening are interdependent and should remain on the same screen.

### P1: make Presets a useful listening library

Lead with sound name, a plain description, duration, and Preview. Keep the existing load-to-Studio behavior explicit. Show details and technical phase steps on request. Move the evidence-grade filter into optional filters; make source limits accessible on cards without presenting a grade as a sound-quality score. When not in the Bashar collection, place its four examples beside other collections rather than a dominant banner above every result.

Do not hide source limits for metaphysical presets: retain the visible chosen-mapping label. Do not rename every speculative preset as an established relaxation treatment. Avoid inventing favorites, recommendations or tracking to solve this organizational task.

### P1: name analysis and generator destinations by their purpose

Use short purpose subtitles consistently:

- Studio — Mix and play a session.
- Harmonic Lab — Build chords and compare tunings.
- Sound Methods — Edit published sound examples.
- Sonic Lab — Try audio patterns and illusions.
- Frequency Library — Browse and hear frequency references.
- Sample Lab — Inspect an audio recording.
- Analyzer — Monitor a live signal.
- Cymatics — Simulate sound-driven patterns.

Preserve route URLs and include original names in directory and command search so existing users can still find them. Remove the Analyzer's remaining adversarial caption and self-awarded trustworthiness copy while editing that surface.

## Acceptance criteria for loop 2 implementation

1. Home explains listening, creation and inspection before listing specialized modules; its primary listening action opens Presets.
2. The initial sidebar no longer displays all 13 tool links simultaneously. All current routes remain reachable from the directory and command search; the active route is visible on a deep link.
3. Desktop and mobile derive categories from the same data and preserve the same relative order. The mobile bottom bar prioritizes Home, Presets and Studio; any change to its fourth destination must keep Safety and Stop all sound directly reachable.
4. Studio allows selecting duration, changing output volume and playing a loaded preset without visiting Safety or opening advanced synthesis panels. Hidden controls do not change or discard their values.
5. An open running session, an active preview, export state and a blocked start have different, accurate status descriptions. Global Stop all sound remains available in every navigation state and modal.
6. Tool search accepts ordinary terms such as "chord", "recording", "Monroe", "Bashar", "noise" and the original page names. Empty results offer a clear reset; do not make a failed search the only route to tools.
7. At 360 CSS px width, controls wrap without horizontal page overflow; labels stay visible, touch targets remain usable, dialogs fit the viewport, and the fixed bottom bar does not cover the final control.
8. All new disclosures use native details/summary or buttons with accurate `aria-expanded`, Enter/Space operation, and removed hidden links from the tab sequence. Check keyboard focus after navigation and dialog close.
9. Reduced motion is respected. Any decorative wave is identified as illustrative and does not claim to monitor the user's brain or current signal.
10. Required repository gates pass, followed by live desktop and narrow-layout task walkthroughs. Record actual checks and limits; this expert review does not supply user success rates.

## Verified design references

These references support the design principles; the proposed route grouping is an inference from this code audit, not a grouping validated with participants.

- [W3C: Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html): labels should identify purpose and help users orient themselves. This supports naming the file and live analysis routes distinctly.
- [W3C: Consistent Navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html): repeated navigation should preserve relative ordering. Use one registry for both shells and directory.
- [W3C APG: Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): documents disclosure button semantics, expanded state and keyboard interaction.
- [Nielsen Norman Group: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/): prioritize common controls, make advanced options discoverable, and avoid excessive disclosure depth. The Studio recommendation uses this pattern; it should be assessed against actual task behavior in later loops.

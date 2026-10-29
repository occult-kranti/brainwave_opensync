# Open Sync: page and task architecture

Date: 2026-10-29. Inventory baseline: archive/dark-landscapes at 8852ffe. The user rejected both the previous design and the continuous 3D/4D background, and authorized a complete replacement. This is a route/task audit and design proposal, not evidence of user testing or an assertion that a new layout is already shipped.

## Product and use scene

Open Sync contains several different products inside one browser application: a listening library, a sound editor, measurement tools, personal-comparison protocols, physical teaching models and a research notebook. A visitor should not need to understand those implementation layers to find a useful task. The audio/session/safety contracts, saved local data, evidence distinctions, historical sources, existing URLs and preserved releases remain valuable; the old page framing does not.

The central object is a **sound recipe**. A listener finds one, loads it silently, and explicitly starts it. A maker edits that recipe. An investigator inspects an audio signal or compares conditions. A reader follows a claim to its sources. These jobs justify the navigation and page templates below.

## Main navigation and page ownership

Desktop primary navigation: **Home**, **Sounds**, **Make**, **Research**. Their destinations are `/`, `/presets`, `/studio`, and `/research-hub`. Avoid the ambiguous label “Explore”: it currently means the preset library while research and visual tools are also forms of exploration.

Phone primary navigation can use **Home**, **Sounds**, **Make**, **Menu**. The full directory and research remain one explicit Menu action away. A player is stateful transport, rather than another permanent discovery destination: an active-session dock can expose the current sound, Open player, Pause/Resume and Stop. Keep Stop available even when another view or dialog owns the screen. A dock must never imply a selected sound is already playing.

The full directory should provide these groups, with descriptive one-line introductions:

| Group | Visitor question | Important distinction |
| --- | --- | --- |
| Listening | “What should I listen to, and when?” | Ready-made sounds and practice planning are distinct from claims about effects. |
| Making | “How do I build or change a sound?” | Editing a recipe does not automatically start it. |
| Measuring & comparing | “What is in this signal, or what did I observe?” | Signal measurement, a personal rating and physiological measurement are different things. |
| Models & research | “What would this mechanism predict?” | Virtual models and proposals do not establish a physical device or clinical outcome. |
| Sources & notes | “Where did this idea come from?” | Documented interest, attributed claims and validated effects retain separate status. |
| Help | “How do I use this safely, or understand a control?” | Instructions and safety remain searchable and reachable throughout. |

Existing internal category identifiers can remain compatible with tests and search aliases. The displayed hierarchy should reflect the visitor’s jobs, rather than the historical `tools` versus `research` route split. Each route has one main home in the directory; topical cross-links should connect related tasks without creating competing duplicate navigation trees.

## Complete route inventory

All 41 registered routes were inspected through their component headers, major sections, primary controls, disclosure states, links and corresponding feature documentation. The route purpose is preserved; the proposed first action and disclosure priority are design decisions.

| Route | Directory home | Actual task and first useful action | Secondary view or next step |
| --- | --- | --- | --- |
| `/` | Home | Choose a listening task or continue the current session. | Sound chooser, practice planning, then full directory. |
| `/presets` | Listening | Find a ready-made sound by intention; preview or choose it. | Filters, recipe details, sources, saved sounds. |
| `/listen` | Listening | Play/pause/stop the current recipe and set volume. | Practice guide and Customize in Studio; no ambient-geometry panel is required. |
| `/meditate` | Listening | Set intention, time and speakers/headphones; choose a match. | Explain matching and experimental inclusion; open library if no match. |
| `/practice-plan` | Listening | Choose a two/four-week window, cadence, time and materials. | Week/day details, repetitions, equipment and source provenance. |
| `/overnight` | Listening | Select intention and wind-down/quiet or continuous arrangement. | Test sound, night setup, evidence and mechanism notes. |
| `/hypnosis` | Listening | Understand the difference between hypnosis and sleep-onset imagery; choose a practice. | Mathematics, evidence notebook and fair-comparison link. |
| `/studio` | Making | Edit and deliberately play a sound recipe. | Duration/volume remain visible; detailed layers, save/export and visual tools are optional. |
| `/harmonics` | Making | Choose root/tuning/ratios and preview a harmony. | Overtones, measured frequencies, A/B tuning, recipe/WAV export. |
| `/sound-methods` | Making | Choose a published-method example and preview/edit it. | Construction, sources, settings import/export and WAV rendering. |
| `/sonic-lab` | Making | Select a sound pattern or illusion; play and adjust it. | Custom wave construction, arithmetic and WAV export. |
| `/library` | Making | Browse a frequency reference and hear a brief example. | Loading a protocol is separate from catalog browsing; retain evidence and aliases. |
| `/cymatics` | Making | Choose a dedicated visual/model mode and manipulate its pattern. | Orbit/zoom/reset/capture and model assumptions remain local to this tool. |
| `/sample-lab` | Measuring & comparing | Pick/drop a local audio file and inspect its signal. | Spectrum, loudness, tuning and detailed analytical outputs. |
| `/analyzer` | Measuring & comparing | Choose Studio/microphone/file input and inspect the live signal. | Freeze/resume graph, measurements and report export. |
| `/nano-lab` | Measuring & comparing | Build one of four controlled signal conditions and compare its spectrum. | Predicted components, assumptions, WAV/manifest download and file analysis. |
| `/quicklab` | Measuring & comparing | Select a personal comparison, complete screening and enroll. | Seeded session schedule, ratings/tap test, estimates and local-log controls. |
| `/lab` | Measuring & comparing | Inspect a planned experiment and open its protocol. | Stimulus preview, null rule, source files and registry status. |
| `/replication` | Measuring & comparing | Compare a runnable stimulus with the published protocol. | Clearly separate runnable examples from non-runnable museum records. |
| `/dream` | Measuring & comparing | Review a sleep protocol, schedule a permitted cue or add a journal observation. | Protocol detail, timing limits, history and delete controls. |
| `/sound-research` | Models & research | Select a signal/resonance/acoustics model and change an input. | Mechanisms, government records, studies, books and falsifiable proposals. |
| `/frequency-hypotheses` | Models & research | Choose a physical channel/model and vary assumptions. | Claim distinctions, proposed tests, null cases and listening illustrations. |
| `/newton-tesla` | Models & research | Inspect a typed source connection or a teaching model. | Newton/Tesla records, controlled proposals and model CSV. |
| `/levitation` | Models & research | Choose a force/control bench and inspect force balance. | Energy accounting, dossiers, media access and proposed tests. |
| `/lucid` | Models & research | Explore cue studies, a night timing map and related practice. | Sound recipes, astronomy comparisons, sources and limits. |
| `/healing` | Models & research | Compare studied sound modalities and their actual exposure channels. | Evidence, mathematical portraits and optional listening illustrations. |
| `/nature` | Models & research | Explore documented animal-call bands or the cricket-temperature calculator. | Natural history, plant bioacoustics, source limits and listening examples. |
| `/research-hub` | Sources & notes | Find a tool/page by task or search; choose a research starting point. | Split measurement/comparison links from models and source reading. |
| `/knowledge` | Sources & notes | Search/read an explanation or evidence entry. | Selected-entry details, timeline context and citations. |
| `/levels` | Sources & notes | Inspect historical Focus-level descriptions and their limitations. | Optional protocol load is an illustration, not a measured state assignment. |
| `/traditions` | Sources & notes | Choose an archive/tradition and inspect its provenance. | Source limits and original listening reconstructions. |
| `/bashar-research` | Sources & notes | Inspect an attributed statement and the evidence bridge it would need. | Transcripts, typed connections, proposals and controls. |
| `/channeled` | Sources & notes | Read the digest/mapping analysis and its provenance. | Original experimental sound previews and harmonic-editor link. |
| `/theory` | Sources & notes | Follow a claim/assumption chain to its supporting source. | Alternative mechanisms, critique and experiment links. |
| `/critique` | Sources & notes | Compare the claim, strongest defensible version and verdict. | Flaw tables, citations and skeptic-overreach register. |
| `/hypotheses` | Sources & notes | Inspect an open claim and its proposed test. | Grade-change audit trail and source records. |
| `/programs` | Sources & notes | Browse historical programs and official outcomes. | Negative results, fraud case files, source tables and links. |
| `/projects` | Sources & notes | Open a preserved application or related source repository. | Explain which project opens and stop active sound before leaving. |
| `/guide` | Help | Find instructions for the task or tool. | Deep technical register, gestures and keyboard shortcuts. |
| `/safety` | Help | Inspect listening status/limits and change the relevant safety setting. | Advisory, dose-log controls, infant settings and explanations. |
| `/about` | Help | Understand the project, privacy, evidence scheme and licenses. | Historical names and source/software provenance. |

## Duplicated roles and the decisions they require

- **Catalog, chooser and player:** Sounds is the catalog; Find a session is an optional guided matcher; Listen is the active recipe’s transport. Their labels should make these differences explicit. A “Choose sound” button must not unexpectedly start audio, and a Preview action must clearly describe its short duration.
- **Studio versus specialist makers:** Studio edits a full session, while Harmonics, Sound Methods and Sonic Lab have focused constructions. Keep specialist tools discoverable as making tasks, with sensible next links; do not merge their independent signal mathematics merely to reduce route count.
- **Measurement versus models:** Sample Lab and Analyzer inspect signals; NanoLab constructs known controls; Quick Lab estimates personal associations. Frequency/levitation/topic models calculate conditional predictions. Grouping all of these as identical labs hides an essential scientific distinction.
- **Research hub versus Knowledge:** The hub is wayfinding and curated entry points. Knowledge is an entry-based reference. A large explanatory hero before a complete directory delays the hub’s actual job.
- **Programs versus Traditions:** Programs emphasizes documented institutional records and outcomes; Traditions provides broader historical context plus reconstructions. Retain both, cross-reference them, and describe the distinction in link summaries.
- **Bashar research versus Channeled Sources:** The former audits statements and proposed mechanisms; the latter is a bounded digest/mapping and sound-recipe view. Avoid duplicating the same claim as if it were independent evidence.
- **Dream versus Lucid:** Dream contains active journal/scheduler/protocol flows. Lucid is a research/model dossier. A simple overnight listener belongs in Overnight, not either advanced lab.

## Page templates and control order

**Listening:** title and purpose → duration/equipment → single primary action → transport/status → optional practice/source detail. Real-time state must distinguish selected, ready, playing, paused, previewing, fading and stopped.

**Making:** recipe name → transport → frequently edited controls → preview/output feedback → specialist controls → save/export. Avoid making people repeatedly reopen the controls they use on every edit. Keep diagnostics, advanced construction and visual art independently optional.

**Measuring/comparing:** input or protocol choice → explicit start → actual result with units/status → interpretation/limits → export/log. Empty and permission-denied states must explain the next useful action. “No data yet” is a meaningful state, not a blank chart to decorate.

**Models/research:** one question and model selector → interactive result and stated units → assumptions/controls → sources. Present tested measurements and calculated examples differently. A page with many modes needs a local selector and persistent title, not a second global navigation bar.

**Reading:** clear subject/title → short conclusion/scope → content index when long → evidence/source trail → related next task. The sources and limits stay findable; decorative scene controls are unrelated to the reader’s goal.

**Utility:** current status → relevant setting/action → confirmation and recovery explanation. Destructive local actions such as deleting logs need specific labels. Do not use blocking popups for routine navigation.

Native `<details>` is suitable for optional explanatory material. A real dialog is suitable for a focused filter or menu that needs contained focus; it must support Escape, restore focus, and keep Stop reachable. Tabs are appropriate when exactly one peer view is displayed, provided their keyboard and selected-panel semantics are implemented. Do not add `role=tab` to ordinary links without implementing the tabs interaction model.

## Sources and what was actually checked

These sources inform the design decisions; they do not establish that this particular application has achieved a measured usability gain. Older foundational principles remain useful alongside current accessibility contracts. No new framework, visual effect or “SOTA” label substitutes for a tested task flow.

| Primary source | Access scope | Application here |
| --- | --- | --- |
| Steve Krug, [Don’t Make Me Think](https://sensible.com/dont-make-me-think/) and the author-hosted [usability-testing chapter excerpt](https://sensible.com/downloads/DMMTchapter10_for_personal_use_only.pdf) | Author’s overview and selected sections of the 20-page excerpt; not the complete book. Excerpt is linked, not redistributed. | Keep choices understandable and validate concrete tasks; distinguish AI review from observed human use. |
| Don Norman, [revised-edition preface](https://jnd.org/preface-design-of-everyday-things-revised-edition/) | Author-hosted preface, not the complete book. | Make possible actions and resulting system state legible; preserve feedback and control. |
| NN/G, [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | Full article text available; initial/secondary split and discoverability sections checked. | Keep common transport/actions visible; disclose uncommon options with descriptive labels. |
| NN/G, [Information Scent](https://www.nngroup.com/articles/information-scent/) | Article’s definition, link-label and context sections checked. | Replace ambiguous Explore/Library collisions with Sounds, Frequency reference and Research summaries. |
| W3C WAI, [Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) | Keyboard and ARIA contract checked. | Use real show/hide controls and expose expanded state. |
| W3C WAI, [Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | Roles, selected panels and keyboard behavior checked. | Implement genuine local view tabs deliberately; use ordinary links for route navigation. |
| W3C, [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Criterion, 320px requirement and two-dimensional-content exceptions checked. | Stack ordinary content at narrow widths; keep necessary data-table/diagram scrolling local. |
| Google, [Material navigation documentation](https://github.com/material-components/material-components-android/blob/master/docs/components/BottomNavigation.md) | Official implementation documentation accessed. The current Material 3 overview required JavaScript in the text reader; no unseen specification is claimed. | Use a small stable destination set, visible labels and a separate active-state transport. |

## Reusable open-source implementation choices

The installed React/React Router, Lucide, Radix Dialog, cmdk and existing native controls can deliver this IA. Reuse route metadata and aliases in the menu, directory and command search. Existing Three.js can stay inside the dedicated Cymatics/model tools; it is not needed for the site shell. Adding another UI framework or a Figma replacement would introduce maintenance work without establishing a better route flow.

The installed design tools are resources, not a requirement to import every available component. Prefer a consistent small set of button, field, sheet, disclosure, status and empty-state treatments over unrelated library examples. Keep real diagrams/calculators exact; decorative art must not imply measured results.

## Verification handoff

Check these concrete tasks after integration:

1. A new listener opens Sounds, chooses a sound and explicitly starts it; selection never autoplays.
2. A returning listener can find the active sound, pause it and stop all sound from any route or overlay.
3. Speakers-only matching never presents a headphone-dependent recipe as speaker compatible.
4. A maker can adjust common settings without reopening secondary panels, then save/export a recognizable recipe.
5. A file analyst sees a useful local-file empty state, input failure recovery and a result with units.
6. A reader can find the source trail and distinguish a historical record from tested support.
7. Each of the 41 routes remains reachable by menu or searchable directory, with original names as aliases.
8. At 320px, 390px, tablet and desktop widths, ordinary text and actions fit; necessary data visualizations scroll inside their own region.
9. Menu/filter dialogs contain focus, Escape closes, focus returns, and no hidden/global palette opens behind them.
10. Audio safety gates, pause/stop behavior, long-running texture continuity and offline/base-path behavior remain intact.

This document supplies the IA and review criteria. The integrating agent must append observed implementation/test results rather than treating the proposal as completion evidence.


## Independent implementation structure review

Reviewed the implemented Home, AppShell, GroupedNavigation, WorkspaceNav, navigation metadata, Sounds, ResearchHub, Studio, PracticePlan and shared listening-atlas styles against the route inventory above. This is a source review; rendered confirmation follows separately.

Observed improvements: Home begins with an actual intention/time/equipment choice and loads a recipe quietly. The shell uses Home/Sounds/Make/Research and an active-session dock. The catalog puts practical listening shelves before studies. ResearchHub exposes three concrete research tasks and the searchable complete directory early. Studio divides editing into useful areas while keeping transport and common settings clear. The practice planner is the planning surface rather than a long research article. No route removal or unsupported claim that the new UI achieved measured user outcomes was found.

A material brief violation was found and fixed: although the new shell removed the persistent ResonantWorld, HealingLab, NatureLab and LucidLab still mounted an ambient Field4D for returning devices whose saved opensync.field4d preference was enabled. These three pages now have no Field4D import, hook, background mount or toggle. Their study data, calculators, preset controls and sources are unchanged. Dedicated Cymatics remains a deliberate visual tool. TypeScript passed; the healing/nature/lucid data suites and mobile page smoke suite passed, 125 tests across four files. No existing ambient-field assertion was removed.

Two shell observations were corrected by the shell owner and checked in source: ResearchHub no longer inherits primary-category Home/Sounds links under a Reading label; a sticky Menu header/transport wrapper preserves Close and Stop during directory scrolling. The primary Studio link is excluded from the disclosed Making group to avoid duplicate navigation. Browser confirmation remains required. Home's selected-time promise must also be checked against the integrating agent's new Listen duration handling before release. No additional structural changes were requested.

## Rendered structure and complete-route confirmation

Real Chromium route smoke covered all 41 registry routes at 320px and 1440px: 82 checks. Every route rendered a main heading, every document width matched its viewport, and no uncaught page error or route failure occurred. The browser was seeded with the old `opensync.field4d = 1` device preference before loading, so returning-device behavior was included. No `.resonant-world`, legacy landscape, spatial-world shell or ambient negative-layer field canvas was mounted on these routes. The dedicated Cymatics tool remained available. Raw results are in the integrating workspace's `atlas-review/all-routes.json`; they are not an exhaustive calculator interaction audit.

Initial 390px captures of Home, Studio, Sounds, Player, Practice and Research were inspected independently. They establish a substantial replacement of the rejected environment: paper surfaces, clear blue actions, a quiet original identity and task-driven views. The listening chooser, studio editor areas, catalog controls, player transport, planning form and tool-directory entry points are legible in the captured phone layout. No additional material structural defect was found in those six captures. Final correction captures and Menu transport/focus checks remain the integrating agent's confirmation step; this route smoke does not substitute for them.


## Final bounded review verdict

**Ship at the reviewed scope.** Final phone captures for Home (320px and 390px), Studio, the Bashar research page, Player, Practice and Menu, plus desktop Studio, were inspected. The rejected site-wide 3D/4D environment is absent. The paper-and-blue design is coherent across these different tasks; text, primary controls, form fields and menu groups are legible and fit the captured viewports. Studio's peer editing areas and transport are distinct from secondary controls. Research uses readable text and explicit local sections. No additional material visual correction is requested.

The combined capture record contains 40 route/viewport checks and two phone Menu checks, with no recorded document overflow or uncaught error. This complements the separate 82-check complete-route smoke, rather than replacing it. The final library hierarchy changed after the initial library screenshot: its dedicated flow measurements show the first sound heading at approximately 650px on 320/390px screens, with the action reachable by ordinary vertical scrolling; tablet checks at 768, 800, 900 and 1024px keep document width equal to viewport width while collection choices scroll within their own region.

Five representative interaction cases are supported by the combined primary and corrected follow-up records: (1) Home preferences load silently, apply the selected ten-minute limit and preserve advisory/Play/Pause/Resume/Stop; (2) Studio keyboard editing changes brown noise from -28 to -25dB at 320px without document overflow; (3) Menu exposes all 41 routes and retains Close/Stop during scrolling; (4) sound filters/details preserve focus and user-controlled selection; (5) the two-week planner and Bashar directory search work. Two initial script attempts used stale/moving locators; the corrected follow-up cases passed, and are not counted as application failures or silently omitted tests.

All previously reported structural findings are resolved: persisted ambient fields are removed, the hub has no misleading related-primary navigation, Menu controls remain sticky, and Home's time promise now has observed player-limit behavior. This review does not claim exhaustive interaction testing of every scientific calculator, physical headphone/Bluetooth verification, a human usability study, or complete WCAG conformance. No Figma/account gate is required for this implementation. Release build and publication confirmation remain the integrating agent's final steps.

# Loop 2 — correction decisions

Date: 2026-09-14. Reviewed implementation checkpoint: `ff51bf8` (v3.0.0 local). The moderator read the actual cross-surface reports from [UI/UX](loop-2-ux.md), [psychology](loop-2-psychology.md), [therapist](loop-2-therapist.md), [user](loop-2-user.md) and the [moderator](loop-2-moderator.md). Implementation-only notes are separate. These findings are code/test reviews; browser geometry and participant success are not inferred.

## Decision

Keep the accepted architecture. All four roles confirm that ordinary listening, chord creation and file inspection now have intelligible entry paths. The second loop found state and handoff defects, not a need for more pages. Apply the following bounded corrections, then inspect the revised checkpoint in loop 3.

## Correction ledger

| ID | Finding merged from reports | Accepted correction | Owner | Required evidence |
|---|---|---|---|---|
| C1 | M2-1, P2-PSY-1, UX2-1: chosen playback length does not survive Save, and longer-than-plan playback produces a shorter WAV | Add optional saved-preset `SessionSpec.limitMin`, with finite sanitization and existing governor limits. Keep the complete phase plan so editing is preserved. Saved-preset presentation uses the explicit playback limit. Show actual WAV duration and a conditional explanation that live playback holds the final phase beyond the plan. Existing catalog semantics and DSP stay unchanged. | Root | Save/reload a five-minute playback limit over a fifteen-minute sequence; invalid/legacy data fallback; tighter existing limits; shorter/equal/longer plan cases; effective WAV duration. |
| C2 | T2-2, M2-2: a tightened limit can leave an old fade countdown, and bounded duration input can silently change | Countdown uses the earlier of fade endpoint and current limit, clamped at zero. Show the effective maximum and why a running session cannot be lengthened. Align the visible output range with the effective infant/governor ceiling. | Root | Shorten during an active fade, including before elapsed time; remain within caps; invalid/over-cap edit behavior visible. |
| C3 | T2-1, M2-3: command search can hide every immediate-stop control | Add a persistent Stop all sound button outside filtered palette results. It invokes the existing immediate cut and closes the palette so the stop dialog is reachable. | UI/UX | With a query removing transport actions and active sound, stop remains visible, cuts sound, closes palette and focuses Keep sound off. |
| C4 | P2-PSY-2: shell loses the reason for silence after leaving a muted Studio | Include muted state in desktop and mobile Studio status without changing preview precedence or implying an untracked preview is silent. | UI/UX | Muted running session outside Studio; unmuted and paused states; tracked preview wording. |
| C5 | P2-PSY-3: muted Presets has a disabled action without a recovery destination | Explicitly say Studio is muted and link to Open Studio to unmute. No implicit unmute or playback. | User | Muted visitor sees and can follow the actual recovery link; preview remains blocked until explicit unmute. |
| C6 | UX2-2, P2-PSY-4: palette-started export permits a competing local export and false failure; action names differ | Guard and disable Studio export/retry using both local and shared busy state. Idle action says Export WAV, matching Guide. Keep progress/errors outside disclosures. | Root | An unresolved export started elsewhere cannot trigger another export or a false local error; action becomes available after completion. |
| C7 | UX2-3, U2-1: Home's suggested search “audio files” returns no matches | Add the ordinary plural to shared Recording analysis search metadata. | UI/UX | Actual matching maps “audio files” to `/sample-lab`, including directory/command integration. |
| C8 | UX2-4: fixed unwrapped headers are constrained at narrow desktop and More widths | Bound secondary text and permit appropriate wrapping; keep global stop and close controls visible. Remove or subordinate secondary clock/readout content where needed. Preserve task groups and mobile tab count. | UI/UX | Structural checks plus actual browser inspection when reachable; do not call CSS inspection a measured fit. |
| C9 | U2-2: task label changes name on arrival | Align the Recording analysis and Live analyzer headings with the navigation labels. Keep route/module names and old-name search aliases. | Root | Heading/entry label agreement; file and live controls remain; legacy search works. |

The root integrator and moderator explicitly chose persistence for C1 over the psychology report's smaller copy-only alternative. A prominent duration control should save what the user selected. The optional field is a narrow data-layer addition using existing safety constraints, not a renderer rewrite. Its validation must cover legacy saved presets before release.

## Task acceptance after prototype review

| Loop 1 decision | Checkpoint assessment | Remaining gate |
|---|---|---|
| A1 task-led Home | Implemented; direct Listen/Create/Inspect paths and no module-wide grades | Published route/browser check |
| A2 shallow navigation | Implemented; initial direct links reduced, active category reveals deep links, hidden links removed from keyboard sequence | Responsive header/More inspection C8 |
| A3 consistent discovery | Implemented with original aliases and intact routes | Advertised plural C7 and arrival names C9 |
| A4 preset discovery | Implemented; three explicit mixes, full/Bashar/saved alternatives, URL filters, preview lengths and source limits | Muted recovery C5 |
| A5 simple Studio with truthful state | Implemented main controls and mounted secondary sections | Duration persistence/countdown C1–C2, muted shell C4, export C6 |
| A6 user-controlled immediate stop | Keep-off default and explicit Studio restart implemented | Unfiltered modal cut C3 |
| A7 corrected Safety copy | Implemented with source-checked implant guidance and scoped handler label | No new clinical claims; existing safety checks remain |
| A8 task-led Guide and separate simple player | Implemented; existing documentation retained | Verify links after final copy integration |

## Scope held

No new audio engine, recommendation system, clinical workflow, extra player, feature directory route or additional navigation tier is approved. The legacy noise-preset live mismatch and authored twenty-second phase fades remain documented earlier limits. More speculative research or additional sound recipes would not resolve the failed cases from this loop.

## Loop 3 assignments

After a single corrected checkpoint exists, reviewers recheck the failed cases across other owners' work:

- **UI/UX:** verify Presets→Studio shortened duration/save/export and task arrivals; check visible controls with disclosures closed. Inspect root's duration/export corrections rather than merely approving the reviewer's own shell.
- **Psychology:** verify selected/current/saved duration meanings, muted recovery, shell status and Guide action names. Confirm no added explanation creates a competing first task or a misleading grade interpretation.
- **Therapist:** verify palette cut and keep-off flow, fade deadline after shortening, explicit unmute behavior and source-limit visibility. Keep the distinction between interface review and clinical endorsement.
- **User:** repeat the four tasks, including “audio files” search and arrival heading, Bashar steps, saved five-minute session and explicit global stop. Label code/test versus actual browser evidence separately.
- **Moderator:** synthesize A1–A8 and C1–C9 closure, remaining constraints, root's full gate and actual publication checks; recommend release only after observable blockers are resolved.

At the time of this decision file, fixes are assigned and in progress. Future tests, browser checks, commit, CI and deployment are deliberately not marked complete.

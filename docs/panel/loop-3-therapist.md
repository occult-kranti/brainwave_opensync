# Loop 3 — final interaction-control review

Date: 2026-09-14. Reviewed checkpoint: `c42fb1a`, plus the root integrator's observed duration-status correction in the working tree. Role: AI therapist-informed interface perspective. This report is code and test inspection; it is not clinical endorsement, an actual therapist session, participant research, or a browser geometry measurement.

## Closure of the second-loop findings

| Correction | Status | What was inspected |
|---|---|---|
| C3 / T2-1 — stop remains available in command search | Closed at code/test review | `CommandPalette` now renders **Stop all sound** before the filtered command region. Its handler calls the existing panic action and closes the palette. The new `pause-transport` cases search **chord** and **no-matches-here** while Studio runs, verify that typing P does not cut sound, then verify the persistent cut stops playback, closes the palette and moves focus to **Keep sound off**. |
| C2 / T2-2 — shortened fade countdown | Closed at code/test review | Studio uses the earlier of the current limit and fade endpoint, clamped at zero. The `studio-player` case advances playback, starts a longer fade, shortens the limit and checks both a three-minute countdown and zero when the new limit is before elapsed time. The underlying session deadline still stops at the tightened limit. |
| C5 — explicit unmute recovery | Closed at code/test review | Presets provides **Open Studio** and names the **Unmute** action, including inside the details sheet. Navigation itself does not unmute or play. The updated Bashar preset test verifies that following the link leaves the session muted and stopped. The preview remains blocked until the user changes that setting explicitly. |
| C4 — state outside Studio | Closed at code/test review | Shell status distinguishes a tracked preview from Studio playback and includes muted status for running/paused Studio. It avoids treating Studio readiness as proof that every possible app audio source is silent. |

The corrections address the actual failed paths without introducing another page, a new onboarding flow, implicit playback or a second audio state system.

## Primary player and modal controls

- Play, Pause/Resume, Stop, duration and output remain outside Studio's collapsed sections. A preview and a full Studio session still have separate named controls and status.
- The saved-preset dialog now passes `saveDialogRef` to the shared focus-management hook. Its name field receives initial focus; Tab stays within the dialog; Escape closes it. A **Stop all sound** button is present inside that modal, whose stacking level is below the stopped overlay.
- Preset details retain their own cut control. The global cut keeps its existing engine/session action. The stopped overlay defaults to **Keep sound off**, and Escape/backdrop/default activation do not start playback. Optional **Play Studio quietly** retains the first-use and governor checks and explicitly refers to Studio, not the stopped preview.
- The shortcut registry continues to exclude native button activation from the global Space handler. A focused Play/Pause/Stop control therefore does not also trigger the global pause shortcut.

These points were inspected in the integrated implementation and its existing tests. This reviewer did not simulate assistive technology or report a physical phone test.

## Source and duration meanings

- Bashar details still show the chosen conversion and its anchor, the source-analysis link, individual eight-second step previews, and the authored phase-fade limitation. Collapsing theory navigation has not removed these decision-relevant limits from the sound details.
- The optional grade filter still explains that grades describe claims, not sound quality or guaranteed effects.
- Shorter saved playback now preserves the complete phase sequence and the selected duration. If live duration exceeds the sequence, Studio explains that it holds the final settings and separately gives the shorter WAV duration.
- The legacy noise-preset live/load mismatch and metadata-only authored fades remain deferred limitations. This review does not reclassify them as fixed or validate any proposed physiological outcome.

## Final small status issue

The root integrator identified that changing the newly saved duration could leave **Preset loaded** visible instead of **Edited settings**. This matters to A5's state accuracy, although it does not lose the selected duration. The inspected working-tree correction sets the dirty flag only for an accepted, changed duration. The new test covers a genuine change, an unchanged value, a cap-clamped no-op and rejected live lengthening. Recommendation: include this correction and its actual passing verification in the final release checkpoint. No additional product scope is requested.

## Recommendation

No remaining blocking defect was found in this review's assigned interaction paths after C2, C3 and C5. Proceed to the root's final validation and publication checks, including the small duration-status correction. Attach the actual full-suite/CI result and live desktop observations separately; do not convert this source review into a claim of measured usability, mobile-device testing or clinical benefit. No duplicate optional test run was started while the root's full check was running.

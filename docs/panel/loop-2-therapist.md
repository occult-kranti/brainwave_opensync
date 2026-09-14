# Loop 2 — independent cross-surface review

Date: 2026-09-14. Prototype: `ff51bf8` (Open Sync 3.0.0), following implementation of the first-loop decisions. Role: AI therapist-informed usability reviewer. This is source and test inspection, not a clinical assessment, a human user study, or a measured browser usability result.

The prior implementation-only note is now [implementation-therapist.md](implementation-therapist.md). This review deliberately inspects Studio, Presets, shell state and the command palette, outside the reviewer's Panic/Safety implementation ownership.

## Findings requiring correction

| ID | Priority / decision | Location | Finding | Minimal correction | Required verification |
|---|---|---|---|---|---|
| T2-1 | P1 / A6 | `src/ui/components/CommandPalette.tsx`, backdrop near line 192 and action filtering near line 254 | The command palette's z-index 110 covers desktop global stop controls and the mobile stop segment at z-index 100. Its only Stop all sound item is filtered out by unrelated queries such as **chord**. Audio can continue while the only visible immediate-stop choice disappears; the P shortcut correctly does not fire while typing in the search input. | Add an always-visible **Stop all sound** control outside the filtered results. Invoke the existing panic action and close the palette together, so the stopped overlay is not left behind the higher palette. | Start a tracked preview or session, open the palette, enter a query with no matching transport actions, and activate the persistent cut. Confirm sound is stopped, the palette closes, and the stopped dialog focuses Keep sound off. Check the same arrangement at phone width. |
| T2-2 | P2 / A5 | `src/pages/Studio.tsx`, `remainingSec` near line 121; `src/ui/session/SessionContext.tsx`, deadline enforcement near lines 583–587 | When a fade is already active, Studio's remaining-time display prefers `fadeEndsAtSec` over the current session limit. Shortening the duration leaves the old fade endpoint in that display, although the session clock stops at the new limit. The displayed remaining time can therefore outlast actual playback. | Derive the displayed endpoint from the earlier of the fade endpoint and the current session limit, then clamp remaining time to zero. Keep engine and governor behavior unchanged. | During an active fade, shorten the Studio duration below the old fade endpoint. Assert the visible countdown uses the new deadline and playback still stops by that deadline. Include a shortened limit that is already before elapsed time. |

Both issues were sent to the moderator before writing this report. T2-1 blocks claiming that the immediate cut remains reachable throughout the new navigation flow. T2-2 blocks claiming that the newly visible duration/countdown pair is consistent in the inspected fade case.

## Accepted decisions checked

| Decision | Inspection result | Evidence and limits |
|---|---|---|
| A4 — bounded preset discovery | Met in the inspected code paths. | The initial three entries are explicit; All, Bashar and My presets remain separate. Search and collection persist in URL parameters. Preview button length uses the manifest when available; loading calls stop before load and navigation, without calling start. `bashar-presets.test.tsx` covers these paths. |
| A4 — first-use choice and source limits | Met in the inspected code paths. | First preview opens the existing advisory, gives a plain “press again” hint, and does not autoplay after acknowledgment. Details retain the Bashar mapping caveat, individual eight-second steps, grade scope, citations and the metadata-only authored phase-fade limitation. |
| A5 — visible controls and retained settings | Met except T2-2. | Duration, output and main transport sit outside disclosures. The running duration maximum respects the existing limit and governor cap; longer quick choices are disabled. The source sequence duration is labelled separately, with explicit text that shortening playback leaves the sequence unchanged. View disclosures do not recreate session state. `studio-player.test.tsx` covers cap-aware duration, clean starter mix, state preservation and the first-play advisory. |
| A5 — current state and errors | Met in the inspected code paths. | The Studio header summarizes the current tone and active layers and distinguishes stopped, paused, fading, muted and playing. Preview notices, blocked-start reasons, active export status and export failures remain outside the file disclosure. The wording says **Studio stopped**, not that every app sound is silent. |
| A6 — modal stop access | Partly met; T2-1 remains. | Preset details include their own cut control above a z-index 71 sheet. Studio Save includes a cut control above its z-index 80 backdrop. Mobile More ends above the z-index 100 bottom stop segment. The palette is the unresolved higher overlay. |
| A6 — preview versus session state | Met in the inspected shell display. | `SessionReadout` prefers **Preview playing**, then describes Studio playing/paused, otherwise says **Studio ready**. The neutral ready state correctly avoids claiming all audio is off when a legacy untracked calibration sound is possible. |

## Specific limits and non-findings

- The fixed starter set uses complete intended mix profiles, as required in the first-loop ledger. A legacy noise-preset live/load mismatch remains explicitly deferred there; this review does not count it as repaired.
- The remaining-time issue is an interface/deadline mismatch, not evidence that duration limits were disabled. The clock still checks the tightened limit before applying the next phase.
- The reviewed Presets and Studio flows do not add treatment instructions, symptom interpretation, a completion score, or automatic next-session playback.
- No new physiological claim was evaluated or upgraded. Named experimental collections remain available without turning grade badges into treatment recommendations.
- No separate full-suite run was started during the root integrator's active check. Existing tests were read; the moderator/root must attach the actual full-run and later browser evidence after corrections.

## Next review

Recheck T2-1 and T2-2 after fixes. Then repeat a listening path through the integrated UI, including first-use advisory, source details, shortening duration, opening a modal during playback, immediate stop and Keep sound off. Only completed observations should be recorded as release evidence.

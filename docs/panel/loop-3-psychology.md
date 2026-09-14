# Loop 3 — final state and task-meaning review

Date: 2026-09-14. Reviewed corrected checkpoint `c42fb1a` against C1–C9 and the four findings in the psychology loop-2 report. This is an AI cross-surface code/test inspection. It does not report clinical endorsement, human-participant validation, or an actual browser usability trial.

## Recommendation

The four loop-2 findings are corrected in the inspected implementation. One small state-indicator correction remains: changing the newly saved playback duration must mark the loaded preset as edited. Release is recommended after that correction and the root integrator's existing full check and publication checks pass. No additional page, feature, intake form, or design loop is needed.

## Closure of prior findings

| Finding | Status at the checkpoint | Inspected evidence |
|---|---|---|
| P2-PSY-1 / C1 — selected playback duration did not survive Save | Corrected in code and covered by dedicated regression cases | `SessionSpec.limitMin` is optional; save includes the selected duration, loading applies it within current governor/live caps, and legacy records retain their prior fallback. Studio distinguishes full sequence duration from selected playback duration and displays actual WAV length. The save dialog says the full sequence, mix, and selected duration are saved. The test in `studio-player.test.tsx` saves 5 minutes over a 15-minute phase plan, reloads it, and checks tighter caps. `user-presets.test.tsx` includes invalid/legacy sanitization cases. |
| P2-PSY-2 / C4 — muted state disappeared outside Studio | Corrected in code | Desktop and mobile shell readouts now retain the muted suffix with Studio's playing/paused/fading state. Tracked previews still take precedence. The idle wording remains scoped to Studio, so it does not assert that an untracked analyzer sound is silent. |
| P2-PSY-3 / C5 — muted Presets had no visible recovery destination | Corrected in code and covered by regression assertions | Presets adds **Open Studio** and the instruction to select Unmute and return. The details view retains the same recovery help. The link itself neither unmutes nor starts sound. The blocked-preview tests inspect the recovery link and preserved muted state. |
| P2-PSY-4 / C6 — Guide and Studio export action names differed | Corrected in code | Studio's idle action is now **Export WAV**, matching Guide. Busy/progress/error feedback remains outside the collapsed file section. The action also respects shared export-busy state. |

The corrected implementation gives three distinct duration meanings where needed: full phase plan, selected live playback duration, and actual exported WAV duration. The exceptional longer-than-plan explanation appears only when it applies. This adds relevant context without another decision screen. Saving now matches the Guide's “current setup” description for the duration issue identified in loop 2.

## Remaining finding

### P3-PSY-1 — a saved duration edit still appears unedited (P1)

At `src/ui/session/SessionContext.tsx:899–909`, `setLimitMin` updates the effective duration but does not call `markDirty`. At `src/pages/Studio.tsx:145`, the current-sound line consequently stays **Preset loaded** after an accepted duration change. That state was arguable when duration was only a playback control; C1 makes it part of saved preset data.

Smallest correction: inside the accepted duration-update branch, compare the clamped value with the current effective limit and mark dirty only when it changes. Perform the comparison before assigning `limitRef.current`. Do not mark an unchanged request, a request clamped back to the same value, or a rejected live lengthening as edited.

Required focused check: load a preset, confirm clean state, change duration, confirm **Edited settings**, save, and confirm clean state again. Also verify that an unchanged value and rejected live lengthening do not create a false edit. This change should leave the governor and phase sequence untouched.

## Cross-surface assessment

- **Current versus playing:** Studio's named current sound remains visible while stopped; playback state and the explicit Play action are distinct. Presets states that Load does not play. No new ambiguity was introduced by the corrections.
- **Edited versus saved:** mix changes already mark edited; the duration case above is the one remaining mismatch found in this pass.
- **Preview versus session:** card preview lengths and Stop preview remain separate from full-session loading. The shell labels a tracked preview as a preview. Global stop retains an independent action even in a filtered command palette.
- **Evidence:** optional filtering still explains that a grade applies to the preset's claim rather than sound quality. The first task does not require understanding grades. Bashar's chosen-mapping explanation and source/fade limitations remain accessible; no new benefit claim was added.
- **Navigation and help:** the directory's ordinary “audio files” wording now has a matching alias, and arrival headings say Recording analysis / Live analyzer. Guide's task links and separate Simple player description remain accurate. No specialist description was promoted into a clinical recommendation.
- **Amount of explanation:** the new persistent duration cap and recovery link answer immediate task questions. Save/WAV detail remains inside the file section, and longer-than-plan behavior is conditional. The corrected screens do not require reading theory before playback.

## Evidence limits

This pass inspected the updated implementation and its relevant test cases. It did not rerun broad suites while the root integrator's full gate was already running. The loop-2 review's 41 passing tests belong to its earlier checkpoint and are not relabeled as a test run of `c42fb1a`. Actual browser geometry, deployed behavior, and the final full-suite result should be cited from the integrator's release record.

Authored phase fades and the disclosed legacy noise-preset playback differences remain prior limits, outside this organization release. No unsupported statement of clinical effectiveness or real-user usability success is warranted by these reviews.

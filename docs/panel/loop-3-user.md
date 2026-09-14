# Loop 3 — final user-task review

Checkpoint: `c42fb1a`, OpenSync 3.0.0, reviewed 2026-09-14 against A1–A8 and C1–C9. Product code was read only during this review.

Evidence is source inspection, review of targeted interaction tests, and an executed read-only reproduction of the shared search metadata. No broad suite was rerun because the root integrator is running the release gate. No live-browser behavior, mobile geometry, audio measurements, or human success rates are asserted here. This role owns Presets, so its independent assessment concentrates on Home, task navigation, Studio, analysis arrivals, and global stop.

## Repeated tasks

| Task | Corrected path and result supported by code/tests | Remaining concern |
|---|---|---|
| Hear a quiet, short sound | Home → Choose a sound → one of three described starters → bounded preview or Load into Studio. Studio exposes current sound, duration, output, and transport before sound-design details. Five minutes can be selected without visiting Safety. The first-play advisory remains enforced. | Digital output is not a measured headphone level; nearby copy correctly leaves device-volume choice with the user. No task blocker found. |
| Hear Bashar steps and save a short full session | Home's original `/presets?collection=bashar` link still opens all four sounds. The step controls describe eight-second playback and stop on a second activation. Loading a bowl chord into Studio and choosing five minutes now saves `spec.limitMin: 5` while retaining the fifteen-minute phase plan. The targeted Studio test reloads it from persistent saved-preset data, restores five minutes without autoplay, and verifies a tighter cap wins. | Changing a saved duration still leaves the Edited state stale at this checkpoint; see U3-1. The separate known authored-phase-fade limit remains disclosed. |
| Create a chord | Home → Build a chord → `/harmonics`. The arrival heading and description match the task. Chord/root controls, bounded preview, Stop, and export remain available. The stop-recovery caption directs a visitor to Keep sound off before previewing again. | The existing specialist controls remain detailed by design. Redesigning those controls was explicitly deferred; no new blocker found. |
| Find and inspect an audio file | Home's advertised “audio files” query now matches `/sample-lab`. The resulting destination heading is Recording analysis, matching the directory, navigation, and Guide. The original Sample Lab name remains searchable, and the file picker/drop target, local processing, progress, and cancel/error states remain. `/analyzer` now arrives at Live analyzer. | Actual browser rendering and file decoding remain root QA tasks. No code-based discovery blocker remains. |

## Search and arrival closures

The same read-only metadata reproduction used in Loop 2 now produces:

| Query | Matching paths |
|---|---|
| audio files | `/sample-lab` |
| sample lab | `/sample-lab` |
| chords | `/harmonics` |
| Bashar | `/presets`, `/library`, `/channeled` |

`src/app/navigation.ts` includes the plural alias, and `src/app/__tests__/navigation.test.ts` includes the advertised query. `src/pages/SampleLab.tsx` and `src/pages/Analyzer.tsx` render the new arrival names while route paths and old-name aliases remain unchanged. **U2-1/C7 and U2-2/C9 are closed in source.** This checks actual current metadata, not an assumed stemming algorithm.

## State and handoff closures

| Correction | Source/test evidence reviewed | Status for this role |
|---|---|---|
| C1 — saved duration and WAV meaning | `saveCurrentAsPreset` stores `limitMin`; `presetDurationMin` uses a validated saved limit; `loadPreset` applies the existing cap. The Studio test saves five minutes over a fifteen-minute plan, reloads it, and verifies both durations. The UI labels actual WAV duration and explains that live playback can hold final settings beyond the sequence while WAV ends with the sequence. Legacy/invalid duration handling is covered in `user-presets.test.tsx`. | Core persistence and duration distinction addressed; U3-1 remains a small feedback defect. |
| C2 — countdown and bounds | Remaining time is clamped to the earlier of the fade endpoint and current limit. The targeted test shortens during a fade and expects 03:00, then 00:00 when the limit is already behind elapsed time. Effective duration and output limits remain visible. | Addressed in source and targeted test contract. |
| C3 — stop inside filtered command search | The palette has a Stop all sound button outside the filtered result list. Its handler invokes the existing immediate cut and closes the palette. | Addressed in source; actual focus/geometry remains part of root verification. |
| C4 — muted shell state | Desktop and mobile status append muted to a running Studio state, including paused/fading variants. Tracked preview status takes precedence. | Addressed in source. |
| C5 — explicit unmute recovery | Muted Presets and its details dialog show Open Studio, then an explicit instruction to select Unmute and return. The targeted muted test follows the link and verifies mute remains on, playback remains off, and the route is Studio. | Addressed. Supporting self-owned test evidence, not independent human validation. |
| C6 — competing export | `runExport` returns while either local or shared export is busy; the main export action is disabled under both conditions. Existing errors/progress stay outside disclosures. A targeted test holds an externally started export unresolved, clicks the local action, and expects one render call and no false local failure. The idle action is Export WAV. | Addressed for the competing-export defect. |
| C8 — bounded header layout | Header wrapping, constrained text, and subordinate readout layout are present. | Structurally addressed; measured fit is unverified here. Root's browser inspection is required. |

The global stop overlay remains a clear handoff: Sound is off → Keep sound off by default. Optional Play Studio quietly explicitly names the session it affects and says stopped previews stay off. The stop-agency tests cover default activation, Escape, backdrop, preview cleanup, advisory, and the explicit restart path. Nothing in the reviewed task path requires automatically unmuting or starting another sound to return to the page.

## U3-1 — changing saved playback duration does not mark the setup edited

**Priority:** P2, small release correction. **Affected contract:** A5, following C1's decision to save playback duration.

At `c42fb1a`, `src/ui/session/SessionContext.tsx:899` changes `limitMin` without calling `markDirty`. `saveCurrentAsPreset` now persists that same field and clears `dirty` after a successful save. `src/pages/Studio.tsx:145` chooses Edited settings versus Preset loaded from `s.dirty`.

Consequently, after saving or loading a five-minute preset, selecting ten minutes changes a persisted property but leaves the screen saying Preset loaded. The duration itself is visible and correct, and saving again captures it; this is a misleading edit-state cue rather than data loss or a playback failure.

**Smallest correction:** Mark the setup edited when an accepted duration change changes the effective value. A blocked live extension or a no-op selection should not mark it edited. After saving, the ordinary clean state should return.

**Verification:** Load/save a preset, change only duration, assert Edited settings; save and assert the clean state; assert that a blocked/no-op duration request preserves its prior edit state. The moderator reports that root is implementing this focused correction. This checkpoint review does not claim the pending change has passed.

## Release recommendation

The four tasks now have coherent routes and explicit playback choices. C7/C9 close this role's Loop 2 findings; C1–C6 correct the reviewed duration, silence, and export handoffs. No new P0/P1 issue was identified. Complete U3-1, the root release gate, and actual browser checks before publishing the final release claim. C8's geometry and real device playback remain outside this source-only approval.

The final description should continue to distinguish simulated panel review from clinical endorsement or human usability testing. Existing metaphysical interpretation limits, legacy noise-preset behavior, and metadata-only authored phase fades remain documented limits rather than changes delivered by this organization release.

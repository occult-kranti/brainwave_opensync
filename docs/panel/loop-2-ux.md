# Loop 2 — independent UI/UX review

Date: 2026-09-14. Reviewed integrated prototype commit `ff51bf8` (v3.0.0), against decisions A1–A8. This pass reviewed Home, Presets and Studio in addition to the navigation implementation. It was a code and CSS walkthrough; no browser geometry, participant results or clinical validation are claimed.

## Task walkthrough

The principal flow is now coherent: Home's Choose a sound opens Presets; the initial catalog contains three audible forms; preview length and the full session length are separate; Load into Studio does not play; Studio presents transport, duration and output without opening its two secondary sections. The Presets query encodes collection and filters, and the first-preview advisory tells users to press Preview again. Create has a direct chord link, Inspect has a recording-analysis link, and the shared directory/palette preserve old names.

The new collapsed Studio controls remain mounted, so disclosure changes do not throw away the mix. The visible summary includes enabled noise and layers. Start failures, interruptions, fades, export progress and export errors are outside the closed file-controls disclosure. Source limits and the metadata-only authored phase fades remain in Presets details. These are code-confirmed improvements addressing A1–A5; they do not by themselves establish responsive usability.

## Findings requiring a small correction

### UX2-1 — P2: duration beyond the phase plan has two different meanings

Location: `src/pages/Studio.tsx` lines 161–173 and 219–226; `src/ui/session/sessionMath.ts` lines 259–278; `src/ui/audio/renderExport.ts` lines 38–41.

The visible 20 min shortcut can lengthen the 15 min starting bowl preset. Live playback keeps the final phase until the duration cap (`beatAtTime` selects the final phase even after its authored end), while WAV export only truncates the existing phase plan and therefore remains 15 minutes. The caption says the sequence stays unchanged, but does not tell a listener what plays in the extra time or that the exported file has a different length. This is an existing renderer distinction made much more accessible by the new duration input.

Smallest correction: retain audio behavior and show a conditional duration note when the cap exceeds sequence length: playback holds the final phase; WAV length is the shorter of sequence and selected duration. Display the actual export length in file options. Do not implement a new sequence-stretching algorithm as part of this organizational release.

Necessary check: extend `studio-player.test.tsx` with a 15-minute phase plan and a 20-minute cap; assert the explanatory note and displayed 15-minute export length. Existing cap tests should continue to verify that running sessions cannot be lengthened.

### UX2-2 — P2: the new global export status does not disable a competing Studio export

Location: `src/pages/Studio.tsx` lines 70–83, 196–198 and 225; `src/ui/session/SessionContext.tsx` lines 1338–1342.

When WAV export starts from the command palette, global `s.exporting` becomes true and the new notice correctly says Rendering WAV. Studio's WAV button is disabled only by its own local `exportState`, which is still idle. Pressing it calls `exportWav`, whose concurrent-export guard returns false. Studio then reports Export failed even though the first export is still working. This undermines the visible progress/error cleanup in A5.

Smallest correction: use both local and shared export state to disable the WAV and retry controls and to guard `runExport`. No worker or engine changes are needed.

Necessary check: while a mocked unresolved global export is active, the Studio export action must be disabled and must not produce the local failure message. Once complete, it becomes available again.

### UX2-3 — P2: Home's suggested search phrase returns no results

Location: `src/pages/Home.tsx` search placeholder; `src/app/navigation.ts` Recording analysis entry and `navigationMatches`.

Home suggests “audio files”, but the recording metadata uses “audio file” and a singular `file` alias. Matching requires every literal query token; no entry contains `files`, so that exact suggested phrase returns an empty result. “chords” and “Bashar” are already covered.

Smallest correction: add the `audio files` alias to Recording analysis, or change the placeholder to an already-supported phrase. Prefer the alias so the ordinary wording works in both directory and palette.

Necessary check: add `audio files` → `/sample-lab` to the shared navigation matching test; the Home integration test may reuse the same example.

## Responsive risk to resolve with geometry inspection

### UX2-4 — P2 verification gap: shell headers remain constrained at narrow widths

Location: `src/ui/layout/AppShell.tsx` desktop header lines 398–434 and More drawer header lines 692–724; `src/pages/home.css` lines 12, 34 and 52–56.

The desktop header retains a fixed 48px height, an unwrapped flex row, and unbounded route/status text beside action buttons. At the 768px breakpoint a full 240px rail leaves a 528px workspace. The More header also keeps the long running-session readout, density control, clock and close button in one unwrapped row. The larger plain Stop label and new explicit Studio status add pressure. This is a code-based risk, not a measured overflow finding.

Inspect Home, Studio and a long-label route around 768–900px with a running-session readout, and inspect More at 360px. Confirm Stop and Close remain fully visible and that text does not escape the header. If they do not fit, allow bounded wrapping or truncate secondary readouts while keeping actions stable. Home's three task columns switch at viewport 700px, so inspect their narrow desktop content width too; a container-aware or wider breakpoint is a small optional correction if task links become cramped.

Existing happy-dom tests confirm route targets and bottom-bar structure, not CSS geometry. Record the actual browser result before marking the responsive gate complete.

## Other reviewed details

- Starting preset profiles deliberately clear prior layers; broader legacy preset mix behavior was already deferred in the decision ledger and is not claimed repaired here.
- The Studio output slider's maximum uses the governor gain but does not display the stricter infant-specific value; the setter still clamps it. This is a minor existing-range presentation inconsistency, not a bypass. It can be aligned with the effective ceiling if that control is touched for another correction.
- The noise summary hides finite values at exactly −60 dBFS, while the live mixer can still contain that quiet layer. If describing enabled layers rather than perceived audibility, use the same finite/enabled predicate as the mixer. This is a low-priority wording/detail issue, not a reason to change gain behavior.
- All specialized groups are shallow and active deep links reveal their category. No duplicate navigation routes or eager module-cycle problem remains in the inspected model.

## Recommendation

Apply UX2-1 through UX2-3 and resolve the header geometry check before release. The accepted organizational direction is materially implemented; no additional features, new player or DSP rewrite is needed to address this review.

## Authorized corrections after this review

The moderator authorized the following focused changes, made after preserving the independent findings above:

- Added the `audio files` alias to Recording analysis, resolving UX2-3 in the shared directory/palette matcher.
- Replaced the palette's filtered stop action with an always-visible Stop all sound button. It closes the palette and invokes the shared immediate cut. This resolves a separate moderator P1 finding: the palette overlay obscured the shell control, while a query hid its own stop result and the input correctly suppressed the P shortcut.
- Desktop and mobile Studio readouts now include the muted state while preserving preview precedence and paused/fading distinctions.
- Allowed the desktop header and More header to wrap, bounded the desktop route label, kept the More close-controls group from shrinking, and removed the More UTC clock. This addresses the structural pressure in UX2-4; actual browser geometry still needs inspection.

Five affected suites passed **66 tests**, including real DOM cases with a running session at 360px mocked width, both a chord search and an empty-result query, the typing shortcut guard, a keyboard-focusable stop button, immediate cut, closed palette and Keep sound off focus. Desktop/mobile muted status and the suggested audio-files search also passed. Typecheck passed. Mocked viewport width tests prove state and DOM behavior; they are not CSS geometry measurements.

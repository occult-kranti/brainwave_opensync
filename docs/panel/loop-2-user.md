# Loop 2 — cross-surface user walkthrough

Checkpoint: `ff51bf8`, OpenSync 3.0.0 local build, reviewed 2026-09-14. Read against A1–A8 in `loop-1-decisions.md`.

This is a simulated first-time-user review based on source code, existing interaction tests, and one executed search-data reproduction. It is not a browser session, a human interview, or a measured success rate. This role implemented Presets, so the independent part of this review concentrates on Home, navigation, Studio, Harmonic Lab, recording analysis, and the stop dialog. Presets checks below are identified as supporting evidence, not an independent approval of my own implementation.

## Four tasks

| Task | Actual code path and visible information | Assessment against the accepted scope |
|---|---|---|
| Hear a quiet, short sound | Home's first action is Choose a sound → `/presets`. Three named starting sounds have bounded previews and a separate full-session load. After loading, Studio exposes the selected name, current tone/layers, output level, Play session, and 5/10/20-minute duration choices before either details section. | The original route-to-a-90-minute-unnamed-session problem is addressed. Duration and output can be understood before playback, without visiting Safety. Device volume is explicitly separate from the digital fader. The word “quiet” is still a user's device-level choice, not a measured sound-pressure claim. |
| Hear the Bashar collection | Home retains the direct `/presets?collection=bashar` link. The collection contains four sounds, with visible preview duration and full-session length. Load into Studio does not start playback. Studio's name, phase count, sequence length, and independent playback duration remain visible. | The practical path avoids theory. A 25-minute authored sequence shortened with the five-minute button remains visibly a 25-minute sequence with a five-minute playback duration; the nearby caption says the sequence stays unchanged. Sources and the metadata-only phase-fade limit remain in the details path. |
| Create a chord | Home Create → Build a chord → `/harmonics`. Arrival says Harmonic Lab, Chords and tuning, and “Build chords, adjust overtones, compare tunings, and export audio.” Root/chord selection and Play composition lead into the existing numbered workflow. | The destination now matches the user's task without requiring a choice between several labs. The specialist control density remains, as explicitly deferred by the accepted scope. Stop preview and the global Stop all sound remain available. The blocked-stop caption now directs the user to Keep sound off, not to starting Studio. |
| Inspect an audio file | Home Inspect → Inspect an audio file → `/sample-lab`. The navigation and Guide call it Recording analysis. The destination shows a pick-file action and a large drop target, local-processing text, progress, cancel, and error/retry states. The separate `/analyzer` destination is described as a live-signal tool. | The intended file workflow is now direct. One naming discontinuity remains at arrival: its H1 still says Sample Lab. Analyzer's graph control now says Freeze graph / Resume graph, removing the earlier ambiguous Run action. No autoplay is implied by the file workflow. |

## Navigation, state, and stop checks

- **A1/A2:** Home's task links and the initial navigation no longer require scanning thirteen equal tools. `GroupedNavigation` renders Home, Presets, and Studio directly, specialist categories as shallow disclosures, and Safety directly. Child links are not mounted when a category is closed. An active deep link opens its group; explicit collapse keeps a current-page caption.
- **A3:** Home and command search use shared `navigationMatches` metadata. Old terms such as Sample Lab, frequency library, and Sleep & Dream remain aliases. Route paths remain `/studio`, `/presets`, `/harmonics`, `/sample-lab`, `/analyzer`, and the existing research routes. A search example advertised on Home currently fails; see U2-1.
- **A4, supporting self-check:** The existing 19-test Presets suite passed before this checkpoint. It covers URL initialization, changing collections, Back restoring a Bashar query, stopping previews on Back, expanding a search without losing the query, visible manifest/fallback duration, saved presets, and the first-use gate. This review read that test coverage rather than rerunning or calling it independent validation.
- **A5:** `studio-player.test.tsx` explicitly checks duration changes without changing the phase-array reference, refusal to lengthen while playing, pause/resume/stop, clean Alpha Ease loading, preserved layers through disclosure changes, and the first-play advisory. The source leaves transport, duration, active-mix summary, interrupted/blocked-start notices, and export errors outside collapsed sound controls. Loaded name and Edited settings are separate from Studio playing/paused/stopped status. These are observable contracts; this role did not listen to output or measure timing.
- **A6:** The stop dialog says Sound is off, focuses Keep sound off, and names its optional restart Play Studio quietly. It explicitly says stopped previews stay off. `stop-agency.test.tsx` covers Enter on the default action, Escape, backdrop dismissal, preview cleanup, explicit Studio restart, advisory, and infant gating. Source behavior matches the stated next action.
- **A8:** Guide starts with task links to Presets, Harmonic Lab, Recording analysis, and Studio. Home marks Simple player as a separate listening view and uses the existing base-relative `/app/` entry. It does not claim that an active Studio session transfers there.
- **A7:** Medical source wording was not independently re-researched in this user-role review. The therapist role owns that source check; this review makes no clinical approval claim.

## Findings

### U2-1 — advertised “audio files” search returns no destination

**Priority:** P2, a small release correction. **Scope:** A3; file-inspection discovery.

**Evidence:** `src/pages/Home.tsx:76` advertises “Try chords, Bashar, or audio files.” `src/app/navigation.ts:41` gives Recording analysis the singular terms “audio file” and “file”; `navigationMatches` requires every literal query token. No metadata entry includes the token “files.” A read-only Node reproduction using the actual metadata produced:

| Query | Matching paths |
|---|---|
| chords | `/harmonics` |
| Bashar | `/presets`, `/library`, `/channeled` |
| audio files | none |
| sample lab | `/sample-lab` |
| recording | `/sample-lab` |

The current route labels/modules also contain no plural “files,” so those extra fields do not change this result.

**User-facing consequence:** Someone copying the suggested file-inspection query sees zero pages despite the existing tool.

**Smallest fix:** Add `audio files` to the Recording analysis aliases, or use the working singular query in the placeholder. An alias is preferable because it also handles the ordinary plural in command search.

**Verification:** Add the advertised query to the navigation search cases and the Home search check; confirm `/sample-lab` appears. No renderer, route, or new feature is needed.

### U2-2 — Recording analysis changes names at arrival

**Priority:** P3, minor clarity correction. **Scope:** A3; destination recognition.

**Evidence:** `src/app/navigation.ts:41`, the Home directory, and `src/pages/Guide.tsx:134` call `/sample-lab` Recording analysis. `src/pages/SampleLab.tsx:199` still renders the H1 Sample Lab. The shell breadcrumb uses RECORDING ANALYSIS, so the same screen visibly has two names. Likewise, the Live analyzer navigation arrives at the shorter Analyzer heading (`src/pages/Analyzer.tsx:206`), though its description makes the function clear.

**User-facing consequence:** The task still works, but a newcomer must infer that the destination with a different name is the one they selected.

**Smallest fix:** Make the file-tool heading Recording analysis and retain Sample Lab as a small legacy-name subtitle if useful. Keep its route and documentation module unchanged. Align the Analyzer H1 with Live analyzer if doing the same copy pass.

**Verification:** Check that the heading matches the clicked navigation name, that old-name search still works, and that the existing file picker remains present. This does not require rebuilding either analysis tool.

## Recommendation for Loop 3

Fix U2-1, and apply U2-2 if included in the final caption pass. No P0 or P1 blocker was identified in these four code-based task paths. Repeat the corrected search and arrival check in Loop 3, then combine this source review with the root's full gate and actual browser checks. Mobile appearance, touch target placement, live sound output, and keyboard behavior in a real browser remain unverified by this role.

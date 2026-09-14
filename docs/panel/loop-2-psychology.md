# Loop 2 — cross-surface psychology-informed review

Date: 2026-09-14. Reviewed integrated local commit `ff51bf8`, version 3.0.0, against decisions A1–A8. This is an AI code-and-test review of Studio, Presets, shell state, command search, and their handoffs. It is separate from the reviewer's Home/Guide implementation work. No clinical credential, participant result, physical-device measurement, or actual browser walk is claimed.

## Verdict

The first listening path is much clearer: preview and full-session load have distinct labels, ordinary transport and duration remain outside disclosures, and specialist navigation has recognizable purposes. The remaining corrections are small state/copy issues. The duration-versus-save distinction should be explained before release because the newly prominent duration control can otherwise appear to save with a preset when it does not.

## Findings

| ID | Priority | Observed behavior and location at the reviewed commit | Smallest correction | Verification |
|---|---|---|---|---|
| P2-PSY-1 | P1 | Choose a 25-minute sequence, shorten playback to 5 minutes, then save a preset. `saveCurrentAsPreset` copies the entire phase list and mix without `limitMin` (`src/ui/session/SessionContext.tsx:966–993`). Loading that saved preset derives duration from the full phase list (`:1015–1018`). The new Studio duration is clearly described as a playback stop, but Save as preset gives no reminder of this distinction (`src/pages/Studio.tsx:201–229`), and Guide currently says “save the current setup” (`src/pages/Guide.tsx:135`). | Add short copy beside Save as preset and in its dialog: “Presets save the full sequence and mix. The playback duration is not saved.” Adjust Guide's save explanation to match. Keeping duration in saved presets would be a separate data-contract decision, not necessary for this release. | Shorten a long preset, save and reload it; confirm the duration behavior is disclosed before saving. No claim that the shortened duration survives. The share-link path already includes `limitMin` and can remain a separate exact-setup path. |
| P2-PSY-2 | P1 | Studio accurately reports “Studio playing · muted,” but after navigating to another tool the desktop/mobile shell only says “Studio playing” (`src/ui/layout/AppShell.tsx:376–381`, `:441–459`). The reader loses the explanation for silence outside Studio. | Include `muted` in the shared status wording: “Studio playing · muted.” Preserve preview precedence and paused semantics. | Start Studio, mute, navigate to another tool, and inspect desktop and mobile status text. Unmuting removes the suffix. This is state visibility, not a request to alter playback or safety controls. |
| P2-PSY-3 | P1 | A returning muted visitor opens Presets and sees disabled previews plus “Unmute before previewing,” but there is no unmute action or destination in the message (`src/pages/Presets.tsx:37–38`, `:145`). The new interface specifically labels its mute control as Studio, so a visitor may not know that this setting also blocks previews. | Change the message to “Studio is muted. Open Studio and unmute before previewing,” with an **Open Studio** link; or provide an explicit unmute action if the moderator approves the scope. Do not automatically unmute. | Mute Studio, stop, open Presets, and verify a visible recovery path reaches the actual unmute control. Preview must remain blocked until an explicit action clears mute. |
| P2-PSY-4 | P2 | The Guide's task says “Export WAV,” but the actual Studio export action is still only “WAV” (`src/pages/Studio.tsx:219–229`). This weakens the new plain-task handoff. | Label the idle action **Export WAV**, retain Rendering and Saved feedback, and keep progress/errors outside the collapsed section. | The Guide's export instruction and Studio's button use the same action name. |

No product code was edited during this pass. Findings are handed to the moderator for ownership and correction.

## Walk-through of the integrated task

This is an explicit code walk backed by existing automated tests, not an assertion of end-to-end browser execution.

1. **Home → Presets.** Home's first link points to `/presets`. Presets defaults to three starting sounds. The complete catalog, Bashar collection, and saved presets remain explicit alternatives. The page states that loading does not start playback (`Presets.tsx:97–104`).
2. **Preview.** Preview labels expose their manifest duration; the first-use message tells the listener to press Preview again after acknowledging the notice (`:77–87`). A playing card changes to Stop preview. The shell distinguishes a tracked preview from Studio playback. Preview source limits remain available in details.
3. **Load → Studio.** Load stops a preview and any prior session, applies the preset, and navigates without starting it (`:74–75`). Studio shows current sound, preset/edited text, stopped state, tone/mix summary, duration, and transport before any disclosure. The two phi starters retain “experimental tier” in the loaded title.
4. **Short duration → Play.** The duration presets call the existing limiter and leave the phase plan unchanged (`Studio.tsx:163–173`). The text expressly says playback stops at the chosen duration. Current sequence length and playback duration therefore have distinct meanings. Live lengthening remains disabled, and the start handler still uses the advisory/governor gate.
5. **Another tool → Stop.** Session state belongs to the shell's provider, so route navigation does not imply stopping. The global stop control remains available outside Studio and calls the existing immediate cut. The stop dialog focuses Keep sound off; previews do not restart through that action. The muted-state omission above is the remaining cross-route wording issue.
6. **Optional evidence.** More filters starts collapsed. Active filters are indicated on its summary, the scope note explicitly separates evidence from sound quality, and an empty result has recovery controls. The Bashar-specific source explanation retains the chosen conversion and its measurement limits.
7. **Command search.** Route results consume the shared navigation descriptions and aliases; specialist names remain searchable. The empty-state clear button and shallow grouping are present. Some action hints still use implementation language (“worker render,” “front panel”), but that is secondary, existing expert UI and does not block the first listening path.

## Checks executed in this pass

`npx vitest run src/ui/__tests__/studio-player.test.tsx src/ui/__tests__/stop-agency.test.tsx src/ui/__tests__/bashar-presets.test.tsx src/app/__tests__/navigation.test.ts`

Result: **41 tests passed across 4 files**. These cover collapsed-control preservation, duration limits, transport states, explicit stop behavior, preset loading without autoplay, URL-backed collections/search, preview lengths, blocked preview states, and registry coverage. The muted-shell wording and save-duration disclosure findings follow from inspected code; this pass did not introduce tests that merely enshrine the defects.

## Loop 3 targets

- Verify P2-PSY-1's save explanation and P2-PSY-3's recovery path in the actual rendered flow.
- Confirm shell mute/preview/paused states after correction.
- Recheck that no disclosure hides an active failure, a required recovery action, or the current sound.
- Distinguish browser evidence from test evidence and do not present the AI review as validation with listeners.

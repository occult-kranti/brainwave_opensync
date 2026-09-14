# Loop 3 — moderator release assessment

Date: 2026-09-14. Reviewed corrected checkpoint `c42fb1a` and the final role findings against the A1–A8 task criteria and C1–C9 correction ledger.

## Decision

The redesign is ready for a release candidate after the two final state corrections below pass their focused checks. No additional feature or architecture loop is required. Publication and a desktop browser walkthrough remain root-owned release steps; this assessment does not claim they already happened.

All four roles independently confirm that the main task paths now work coherently in the inspected code: choose a preset, hear a bounded preview, load it without autoplay, set a duration and play; find the Bashar collection without opening theory; make a chord; inspect an audio recording. Their reports are AI role/code reviews, not a human usability study or therapist endorsement.

## Correction closure

| Correction | Inspected status at `c42fb1a` |
|---|---|
| C1 saved duration and export meaning | Optional duration is saved, sanitized, shown for saved presets and loaded through existing caps while preserving the complete phase plan. Studio identifies actual WAV length and the final-phase hold when live duration exceeds the plan. One remaining edited-status inconsistency is corrected below. |
| C2 tightened countdown and effective limits | Remaining time uses the earlier of fade endpoint and current limit. Main controls show duration caps and the effective infant/output ceiling. Engine enforcement remains unchanged. |
| C3 persistent modal cut | Palette has an unfiltered Stop all sound action that cuts and closes it. The stopped dialog retains Keep sound off as its focused default. |
| C4 muted shell state | Desktop/mobile readouts retain the muted explanation outside Studio and distinguish tracked previews, paused sessions and ordinary playback. |
| C5 muted preview recovery | Presets and its details view give an explicit Open Studio recovery destination. Navigation does not unmute or start sound. |
| C6 shared export busy state and wording | Primary export is guarded by shared and local busy state and says Export WAV. The final stale-failure/retry presentation correction is recorded below. |
| C7 advertised plural search | “audio files” resolves to Recording analysis through shared metadata. |
| C8 constrained headers | Headers now allow bounded wrapping and subordinate secondary information while retaining stop/close. Code/structure is corrected; actual physical/mobile geometry remains unverified by the panel. |
| C9 destination names | Recording analysis and Live analyzer headings agree with their task labels; original route/module identities and search aliases remain. |

## Final corrections authorized

1. **Duration edit status.** The root integrator identified, and all four roles independently confirmed, that a newly persisted duration change could leave the current sound labelled Preset loaded. `setLimitMin` must mark the setup dirty only when an accepted bounded value actually changes. Rejected live lengthening, same-value requests and clamped no-ops remain clean. The narrow check covers loaded → changed duration → Edited settings → Save → clean, plus ignored requests. This is a status correction; saved duration already survives reload.
2. **Export feedback during another export.** The UI/UX reviewer found that retry remained enabled during shared busy state and an old failure could remain beside a new palette-started render. Suppress the stale failure while rendering and keep any exposed retry disabled while shared/local busy. The existing concurrent-export guard remains the authority; no worker change is needed.

Both corrections are assigned to root, preserving ownership of shared session/Studio integration. They should be verified through the relevant existing suites rather than starting another broad review loop.

## Verification reported by root

The full `npm run check` on `c42fb1a` passed **1,144 tests across 83 suites**, ESLint, TypeScript and the production/PWA build. All fifty preview WAV hashes remained unchanged. These are root's executed verification results, not tests independently rerun by the moderator. Final state corrections need their focused result recorded by root before candidate publication.

## Publication checks still required

- Push the reviewed candidate and confirm its CI and Pages deployment.
- Inspect the deployed Home → Presets → Studio path, new grouped navigation, a research deep link, chord/recording arrivals and Stop all sound/Keep sound off. Record only completed browser actions and measurements.
- Distinguish any actual desktop observation from CSS/test coverage at simulated narrow widths. The current browser connection does not expose a viewport-size control; no physical-phone usability or calibrated listening level is claimed.

## Known limits retained

The authored twenty-second phase fades remain metadata; a legacy noise-preset live/load mismatch is documented and excluded from the starting set; live playback and WAV synthesis still have their documented method differences. The redesigned navigation does not validate speculative source interpretations or measure brain activity. None of these existing limits is concealed by collapsing theory or technical controls.

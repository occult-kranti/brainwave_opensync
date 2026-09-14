# OpenSync 3.0 release verification

Date: 2026-09-14. Release implementation: `62523cca39f3bb57cd6d7a23caf8bcb218c12d96`. This record follows three panel loops and their implemented corrections. The final documentation commit also corrects the singular phase caption.

## Executed checks

- `npm run check`: **1,145 tests across 83 suites**, ESLint, TypeScript, production build and PWA generation passed on the final functional implementation.
- The focused Studio tests cover clean starter loading, disclosure preservation, bounded duration, save/reload, edited-state changes, first-play authorization, tightened fade deadlines and competing exports. The export test also checks that an earlier failure disappears after a successful shared retry.
- All fifty preset previews were regenerated at six seconds each, totalling 57.6 MB. All fifty WAV hashes remained unchanged.
- No files in the deterministic engine or live audio bridge changed. Existing routes and storage keys remain intact; saved presets have an optional bounded playback-duration field.
- [CI](https://github.com/occult-kranti/brainwave_opensync/actions/runs/34792778343), [Pages publication](https://github.com/occult-kranti/brainwave_opensync/actions/runs/34792778409), and [Pages deployment](https://github.com/occult-kranti/brainwave_opensync/actions/runs/34792836163) succeeded for the implementation and generated site.

## Live browser observations

The root agent used the published site after applying its UPDATE prompt. These are actual browser interactions and DOM/screenshot observations, not participant research or calibrated audio measurements.

| Task | Observed result |
|---|---|
| Find a starting task | Home shows Listen, Create and Inspect with Choose a sound as its primary action. The sidebar shows Home, Presets, Studio and Safety directly; five specialist/help groups begin closed. |
| Preview a starting sound | Presets shows three sounds with six-second preview labels. Alpha Ease entered Preview playing. Stop all sound cut the preview and opened Sound is off; keyboard focus moved to Keep sound off. |
| Load without autoplay | Golden-ratio bowl chord loaded into Studio with five bowls, its fifteen-minute sequence and Studio stopped. Both optional Studio sections were closed. |
| Save a shorter session | Selecting five minutes displayed Edited settings. A temporary saved preset showed Full session 05:00 in My presets. Reload restored five minutes while retaining the fifteen-minute editable phase plan. |
| Stop from a filtered command menu | A Studio session started explicitly. Searching for chord left the persistent Stop all sound control available. It stopped playback, closed the command menu, and focused Keep sound off. |
| Find recording analysis | Searching Home for audio files returned one Recording analysis result. It opened the matching heading and audio-file picker with its local-processing explanation. |
| Find chord creation | Build a chord opened Harmonic Lab and its harmony, preview, overtones, frequency and export controls. |
| Follow a research deep link | Opening Channeled Sources revealed its research group. Explicit collapse hid the links and retained Current page: Channeled Sources. |
| Use the Bashar collection | All four sounds and full durations appeared. The scale details retained source limits and the unrendered-fade note. Step 6 entered Preview playing; closing the sheet stopped the preview. |
| Inspect desktop layout | Home and Studio screenshots were inspected. Studio reported a 1363 × 936 viewport and document scroll width of 1363 pixels, with visible main controls and no horizontal page overflow. |

The temporary review preset was deleted through the interface. The original fifteen-minute bowl chord was restored and left stopped.

## Limits

Physical-phone layout, mobile operating-system audio behavior, live file upload and a live WAV download were not tested in this browser pass. Narrow-layout branches, analysis and rendering retain their automated coverage. The available browser did not expose viewport resizing, so desktop observations are not presented as measured phone geometry.

The panel does not establish clinical benefits, brainwave changes or a literal human vibration scale. Existing legacy noise presets still produce the labelled carrier-tone fallback; authored twenty-second phase fades remain metadata; live and offline synthesis have their documented differences. Those issues were not represented as repaired by reorganizing the interface.

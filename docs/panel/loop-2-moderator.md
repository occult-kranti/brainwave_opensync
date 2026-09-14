# Loop 2 — moderator cross-cutting review

Checkpoint: `ff51bf8`, v3.0.0 local. Review method: read the integrated implementation and the underlying session/export contracts, independently of each feature owner. No browser timing, rendered-width measurement, participant behavior or clinical benefit was inferred. Root is running the full repository gate separately.

## Confirmed improvements

- Home now begins with a clear Presets action and Listen/Create/Inspect paths. The separate simple player has explanatory copy. The fabricated live-looking hero and weakest-grade navigation cards are gone.
- Presets initially shows three deliberately mixed examples, preserves the Bashar collection, and exposes actual manifest/fallback preview durations. Advanced claim filtering is optional and scoped.
- Studio has a named current sound, plain playback/edited state, transport, duration and output in one main panel. File options and synthesis controls are native disclosures; they remain mounted rather than changing the audio graph on toggle.
- Preview state and Studio state are separately named. The new stop dialog focuses Keep sound off, while the explicit alternative says that it plays Studio.
- Source and audio limitations remain visible in the appropriate preset descriptions/details. The new organization does not establish a human-frequency measurement or a therapeutic indication.

## Findings

| ID | Priority | Observable issue | Minimal correction and verification |
|---|---|---|---|
| M2-1 | P1 | `Studio.tsx:163–173` presents Duration as a main session control, but `SessionContext.tsx:971–982` saves all original phase durations. A user who changes the fifteen-minute bowl sound to five minutes and saves it reloads fifteen minutes. Conversely, lengthening that sound to twenty minutes lets live playback hold its final phase, while `renderExport.ts:39–41` only truncates the authored plan, producing a fifteen-minute WAV. | Root should either narrowly preserve the chosen duration in saved presets using existing data-layer helpers, or explicitly label the distinct playback/save/export behavior before Save. At minimum show actual effective WAV duration and final-phase hold behavior when they differ. Test the three cases: shorter, equal, longer than plan; do not rewrite DSP. |
| M2-2 | P2 | The custom duration input accepts a value over the governor cap and silently returns the clamped value on blur. Its `max` attribute alone does not enforce programmatic handlers, and the main UI supplies no cap text for the stopped state. This makes a normal edit look ignored. | Show the allowed maximum or an inline reason when a value is bounded, including infant mode and running tighter-only behavior. Preserve the setter's constraints. |
| M2-3 | P1 | The therapist independently identified that `CommandPalette.tsx` is above the persistent stop controls, while its own stop item disappears under a search such as “chord.” The input correctly suppresses the global P shortcut. The moderator confirmed the z-index and filter paths. | Add an unfiltered, always-visible Stop all sound action inside the palette that stops and closes it before the stop dialog appears. Test while a query removes all ordinary stop actions. |

The therapist also found a stale countdown when duration is shortened during an already scheduled fade. That finding belongs to the therapist report and should be merged with the duration corrections rather than duplicated as a second implementation task.

## Release implication

The architecture is accepted; none of these findings requires reopening the task grouping or adding a new feature. Correct duration-state communication and modal stop access, then repeat the specific failed cases in loop 3. Browser checks of actual responsive rendering remain necessary on a reachable release candidate; this code review cannot establish that a desktop header fits at every width.

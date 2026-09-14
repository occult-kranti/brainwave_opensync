# Loop 1 — simulated first-time user walkthrough

This is a code-based walkthrough of the v2.5 labels, components, defaults, and existing interaction tests. It is not a browser observation, user study, or claim about a particular person's experience. The reviewer follows four tasks without prior knowledge of the product's module names.

## What the first screen asks me to decide

Home says “Build and compare sounds” and presents Open Studio, Bashar Sounds, Read the Guide, and Everyday App. Below its introduction and quick start is a grid of 13 practical tools. The desktop rail also lists those 13 tools individually. Theory is successfully collapsed, but the practical tools still lack task groups. A newcomer must already understand Studio, Library, Presets, Harmonic Lab, Sonic Lab, Sound Methods, Quick Lab, and Replication Bay to choose well.

The current factory Studio is a 90-minute session at −12 dBFS, with a 200 Hz carrier and stages at 10, 6, and 4 Hz. Home's instruction to open Studio and press Start does not describe this sequence or tell me its duration. “Everyday App” offers a second entry, with “simple, phone-first player” in its title attribute; its visible button does not explain why I should leave the main application.

## Task 1 — hear a quiet, short sound

**Current path:** Home → Open Studio → Start Session → first-use advisory → I Understand — Start. To change the session to a few minutes, find the limit readout's tooltip, then go to Safety and set the session length before returning to Studio.

**Questions I cannot answer from the first actions:** What exactly will play? Is “CUSTOM” something I created? Is 90:00 a timer I can edit? Is this a short preview or the full sequence? Where do I set five minutes? Does the output number describe how loud my headphones are? Why must a routine duration change happen on a page called Safety?

**Failure points:**

- Home offers creation as its primary action although this task is listening. It does not supply a named, short starting sound.
- The initial duration is long for this task. Its editing location is separate from playback.
- Session output and device listening level need a short nearby explanation; the advisory contains this, but the start controls do not provide the full listening plan.
- Stop is clear inside Studio. Away from Studio, the visible global control says “PANIC”; its broader stop meaning is primarily in the tooltip/accessibility label. “ENGINE OFF” also describes Studio state and can coexist with a separately generated preview.

**Acceptance criteria:**

1. Home has an explicit listening entry with a named sound, audible description, and duration before any playback starts.
2. The listening entry offers a small duration choice beside its play control, without navigating to Safety or modifying global ceilings.
3. Opening the page or changing the selection does not autoplay. The first-use advisory remains effective.
4. The current sound and whether it is a preview or full session are stated while playing. Stopping all sound remains visible without learning an emergency label.
5. A short starting choice can be loaded without inheriting unrelated noise, bowls, or previous user settings.

## Task 2 — hear the Bashar sounds

**Current path:** Home → Bashar Sounds → four-card collection → Preview, or Details & Steps → Hear Step for 8 Seconds. Load into Studio transfers the full sequence without starting it.

**What already works:** The direct Home link avoids theory. Four options is a manageable choice. Cards give a sound description, full duration, and signal summary. Details show the phases and separate later-step playback. Existing tests cover no autoplay, preview stop on a second tap, cleanup on navigation, and load without retained prior noise.

**Remaining questions:** Does the visible “PREVIEW” button play ten seconds or the whole 35-minute sequence? The accessible name includes the manifest duration, but the visible card button does not. The first-use preview advisory requires a second press; the acknowledgement does not visibly promise that next step. The full sequence still leads into the complex Studio instead of a small player. The A–D grade filter can hide the whole experimental collection even though the sound arithmetic is valid; “Minimum evidence grade” requires more interpretation than “hear these four sounds.”

**Acceptance criteria:**

1. Preserve the direct, shareable Bashar collection URL and all four sounds.
2. Every visible preview action includes its duration; the full-session action remains a separate explicit action with the full duration.
3. After an advisory that does not start playback, state plainly that the user can press Preview again.
4. Keep the sound description on the card; move source detail and advanced filtering behind an optional control. Preserve access to grades and sources.
5. Preserve step playback, the authored-fade limitation, and the distinction between chosen pitch mappings and measured physiology.

## Task 3 — create a chord

**Current path:** Home → scan tools for Harmonic Lab → choose root frequency, chord, tuning → Play Composition → optionally change overtones → Export WAV.

**What already works:** The destination explains “Build chords, adjust overtones, compare tunings, and export audio.” Its numbered panels define a coherent sequence. Play and Stop appear together, the preview duration is visible, and changes stop the owned preview. A default chord can play without first filling blank fields. Existing tests cover playback cleanup, exact export samples, saves, malformed imports, and focused decimal editing.

**Failure points:**

- The user thinks “make a chord,” while navigation asks them to choose among three Labs and Studio. The Home description eventually explains the distinction but does not create a direct task entry.
- Root frequency in Hz, tuning systems, eight partial sliders, component plots, and a cents table all arrive before the basic task is established. These are useful editing controls but can be progressively disclosed.
- “Save on device” stores recipes inside this page, while “My presets” is elsewhere. The product has multiple saving locations; the page does explain the recipe file, but the top-level Library label does not make those scopes clear.

**Acceptance criteria:**

1. Home or a clearly named Create group offers “Build a chord,” linking to the existing working Harmonic Lab.
2. Root, chord, duration, Play, Stop, and Export are easy to find before opening advanced tuning or harmonic controls.
3. Advanced controls remain available; a collapsed panel must not silently reset its values or misrepresent its contribution to playback.
4. Saving feedback states where the recipe can be found. Do not imply that these recipes are Studio presets if they are stored separately.

## Task 4 — inspect an audio file

**Current paths:** Home → Sample Lab → Pick Audio File; or Home → Analyzer → File → Drop / Pick File. Both exist under Tools without an explicit distinction in their navigation labels.

**What already works:** Sample Lab has a large file target, states that analysis is local, names common formats, shows progress/cancel and errors/retry, and distinguishes file properties from effects on a listener. Harmonic Lab's footer correctly links an exported recording to Sample Lab.

**Failure points:**

- “Analyzer” sounds like the obvious place for any analysis, but opens on Engine Bus. It then offers File and Live Input alongside calibration-tone controls. “Sample Lab” is actually the more direct file-inspection workflow.
- Home's quick start says “Use the Visualizer,” but there is no route named Visualizer. The user needs the implementation's knowledge that waveform displays live inside other tools.
- Analyzer's “RUN” control freezes/unfreezes visual output; a newcomer might interpret it as playing or analyzing the selected file. Calibration sound controls further blur that expectation.

**Acceptance criteria:**

1. A clear “Inspect an audio file” entry leads directly to the dedicated file workflow.
2. Group file inspection and live signal measurement together, with visible descriptions that distinguish them.
3. Replace references to nonexistent navigation destinations with the actual destination label.
4. File selection explains the next action and never implies autoplay. Graph pause/freeze controls are labeled as graph controls, and calibration tones are separated from routine inspection.
5. Preserve local processing, cancel/error feedback, and existing analysis data.

## Proposed order for the next loop

1. Establish task entries: Listen, Create, Inspect. Keep Theory & research collapsed, and make Help easy to find without treating it as a production tool.
2. Add a short listening path with clear sound, duration, and transport. This addresses the largest gap before redesigning all existing expert tools.
3. Preserve Bashar access and mature tool behavior while improving task names, preview labels, and the global stop wording.
4. Walk the same four tasks again against the changed components. Report only changes supported by code or actual browser observations.

## Evidence inspected

- `src/pages/Home.tsx`, `src/app/routes.ts`, `src/ui/layout/GroupedNavigation.tsx`, `src/ui/layout/AppShell.tsx`
- `src/pages/Studio.tsx`, `src/ui/session/sessionDefaults.ts`, `src/pages/Safety.tsx`, `src/ui/components/AdvisoryDialog.tsx`, `src/ui/components/Panic.tsx`
- `src/pages/Presets.tsx`, `src/ui/__tests__/bashar-presets.test.tsx`
- `src/pages/HarmonicLab.tsx`, `src/harmoniclab/__tests__/page.test.tsx`
- `src/pages/Analyzer.tsx`, `src/pages/SampleLab.tsx`, `src/samplelab/__tests__/page.test.tsx`
- `src/docs/__tests__/home-guide.smoke.test.tsx`, `src/ui/__tests__/mobile-shell.test.tsx`

Existing test cases were read, not rerun by this role. No timing measurements or success rates are inferred from them.

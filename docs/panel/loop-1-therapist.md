# Loop 1 — therapist-informed usability review

Date: 2026-09-14. Baseline: Open Sync 2.5 source. Role: an AI reviewer applying a therapist-informed usability perspective, not a practicing clinician, clinical assessment, or participant study. This review uses the OpenSync audio research skill and preserves the governor and deterministic audio engine.

## Reviewed material

`CLAUDE.md`, `docs/ARCHITECTURE.md`, route registry, Home, Presets and its detail sheet, Studio transport, Safety, AdvisoryDialog, Panic controls, GradeBadge, Everyday Play/Player/copy/intents, and the session panic/resume actions. Findings concern observable interface structure and code paths; no listening outcome has been measured.

## What should change first

| Priority | Observed issue | Proposed change | Acceptance check |
|---|---|---|---|
| P0 | The global stop overlay initially focuses **RESUME SAFELY**; the alternative is a visually secondary **DISMISS**. After stopping only a preview, this control can start a Studio session instead of resuming that preview. | Keep the immediate global cut. Label it **Stop all sound** in ordinary navigation. Focus a primary **Keep sound off** button when the overlay opens. If retaining playback here, label it **Play Studio quietly** and explain that it starts/continues Studio, not the stopped preview. Do not call a quieter digital setting “safe.” | Keyboard Enter after opening the overlay does not restart audio. Keep sound off, Escape and backdrop behavior never call start/resume. An explicit Studio action still passes the existing advisory and governor. Panic continues to cut every preview and live source. |
| P1 | Home offers Studio, Bashar sounds, Guide and a second Everyday app before an unfamiliar user has selected a task; the practical catalog then exposes 13 equal peers. | Begin with **Listen**, **Create**, and **Inspect sound**. Make Listen the obvious first action. Put source reading behind the existing collapsed Theory & research group. Keep Bashar as a named collection within Listen instead of a competing global start. Keep the separate Everyday destination secondary and clearly identified. | A new visitor reaches an audible preview by choosing a sound without learning a lab vocabulary or leaving the main app. No automatic playback occurs on navigation. All old routes remain discoverable through their task group/search. |
| P1 | Studio presents session transport, sharing, file format, analyzer navigation, mode science, many instrument panels and phases together. Session length is edited elsewhere in Safety. | Make the first Studio view about the loaded sound, output level, duration, Play/Pause/Stop and basic sound controls. Put export/share and detailed editing under clearly named disclosures. Show a direct **Session length & limits** link if moving duration is outside this release. Never hide stop, current sound, duration or a blocked-start explanation. | Selecting a preset leaves the user with a readable summary of what will play and how long. Advanced controls can be opened without losing the loaded state. Main actions remain reachable at phone width and keyboard zoom. |
| P1 | Preset discovery asks for a **Minimum evidence grade** before many users can know what that grade applies to. Cards combine intended uses, sound settings and graded claims. | Keep source grades attached to claims but move the evidence filter into optional filters. Explain **Grades describe evidence for a claim, not sound quality or a personal outcome.** Use sound descriptions first; preserve intended-use categories as browsing labels, without promising results. | A preview can be chosen without evaluating a grade. The exact claim and citation remain one action away. A grade-A arithmetic example cannot read as grade-A treatment efficacy. |
| P1 | Safety contains an absolute reassurance about implanted electronics and a control labelled **DISABLE ISOCHRONIC GLOBALLY** that only calls `setMode('binaural')`. | Correct the existing absolute statement with a device-guidance link; label the action **Switch Studio to binaural**. Do not add a new medical intake flow or silently change modes elsewhere. | Copy matches the actual scope of the action. No claim says headphone hardware has no mechanism for affecting an implant. Existing constraints stay enforced. |
| P2 | Numerous animated plots, lab readouts and all-caps labels compete with the sound task. Everyday's moving ring is decorative, yet could be read as an instruction to match breathing. | Keep nonessential visual motion secondary, honor reduced motion, and avoid introducing breathing or symptom instructions. Prefer sentence case for ordinary actions. Retain plots where they help inspect the signal. | Reduced-motion users can operate the primary listening flow without an endlessly moving decorative element. No new timing/physiology interpretation is attached to decorative motion. |

## Proposed listening flow

1. Home: **Choose a sound**. Supporting sentence: **Hear a short preview, then open it in Studio.**
2. Sound collection: name, plain sound description, full duration, explicit preview duration. A short preview is a choice, never a consequence of opening a card.
3. Details: sequence, exact pitches/rates and sources are available on demand. Bashar's chosen conversion and unrendered authored phase fades remain visible in its details.
4. Studio: current sound, duration, output and **Play session**. Retain the existing first-use advisory gate and its explicit Start wording.
5. While playing: persistent current-sound state, Pause and Stop; **Stop all sound** remains available even on another page.
6. After stop: **Sound is off** with the ordinary interface available. No completion score, streak, obligation to finish, interpretation of mental state, or automatic next session.

These are interaction recommendations, not a prescription for a particular sound, frequency, session length, or therapeutic result.

## Copy requiring caution

- Avoid **Resume safely**: the existing action lowers digital level; it does not measure sound pressure at the listener's ear.
- The existing **wellness-tier audio instrument** phrase is harder to understand than **a sound generator and listening tool**. Keep the existing medical-device distinction without building it into every caption.
- **Loud, long, or late is the actual risk here — not the beat frequency** is an unnecessarily categorical opening for Safety. Prefer **Set playback limits and review the listening notes.**
- The existing **±6 dB** headphone estimate and infant **50 dBA** caption should not be made more prominent or treated as calibration. The app has no microphone-at-ear or headphone-model calibration evidence in the reviewed flow. Keep model estimates explicitly separate from actual listening loudness.
- **That’s the whole protocol** in the discomfort block overstates the completeness of generic advice. Remove the slogan rather than inventing a new symptom-management protocol in an interface redesign.
- Keep curiosity possible: a Bashar or historical-source sound can be described as an **experimental sound example** without endorsing a physiological interpretation or ridiculing the source.

## Source check for the existing implant claim

The reviewed Safety statement says: “Audio through headphones cannot affect implanted electronics — no mechanism exists.” The categorical practical reassurance is inappropriate when users are handling headphone hardware. The American Heart Association explicitly lists headphone magnets as a possible source of implant interference and supplies device-distance guidance. The FDA also discusses magnetic interference from consumer electronics. A suitable short replacement is: **Follow your implant manufacturer's guidance for headphones and other magnetic electronics.** Link the explanation instead of inventing a new app-specific restriction. [American Heart Association, Devices That May Interfere With ICDs and Pacemakers](https://www.heart.org/en/health-topics/arrhythmia/prevention--treatment-of-arrhythmia/devices-that-may-interfere-with-icds-and-pacemakers), [FDA, Magnets in consumer electronics and implanted devices](https://www.fda.gov/radiation-emitting-products/cell-phones/magnets-cell-phones-and-smart-watches-may-affect-pacemakers-and-other-implanted-medical-devices). Checked 2026-09-14.

## Loop 2 questions for the moderator

1. Is the default entry Listen or Create? For a broad visitor audience, Listen avoids demanding sound-design knowledge before the first useful action.
2. Does grouping reduce visible choices, or merely add headings over the same long list? The proposed result should visibly expose fewer initial decisions.
3. Which current-state information survives navigation? A user must understand that a session may continue when a research or analysis page opens.
4. Can every stopped state remain stopped using keyboard, touch and browser navigation? This matters more than animation polish.
5. Are treatment-like claims being removed from prominent navigation while their sources and limits remain available? Hiding theory must not hide a limitation that changes what a listening control means.

## Loop 3 release checks

- Walk through Home → choose sound → preview → details → Studio → play → another page → Stop all sound → Keep sound off.
- Repeat using keyboard, with reduced motion, at phone width, and with the first-use advisory unacknowledged.
- Inspect an experimental Bashar preset and a basic sound: both need clear acoustics, preview/full-session distinction, and reachable sources.
- Confirm controls do not substitute an outcome promise for a description of the signal.
- Confirm shared panic, preview cleanup, start gate, infant restrictions, duration caps and volume caps remain covered by existing tests.
- Report these as interface/code checks, not therapist validation, clinical benefit, or real-user testing.

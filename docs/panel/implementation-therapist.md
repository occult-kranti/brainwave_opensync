# Implementation — stop control and listening notes

Date: 2026-09-14. AI therapist-informed usability role; this is an implementation review, not clinical validation or a participant study.

## Changes made

- Every `Panic.tsx` button now says **Stop all sound**, retaining the same immediate shared panic action. Mobile text wraps within the existing 72-pixel segment. The decorative pulse on these buttons was removed.
- The stopped screen says **Sound is off** and initially focuses **Keep sound off**. That action, Escape and clicking the backdrop all dismiss without starting audio. Focus is trapped in the dialog and restored to the trigger on close.
- The optional audio action says **Play Studio quietly**. Its caption explicitly scopes it to starting/continuing the current Studio session and says stopped previews remain off. It still invokes the existing advisory/governor-controlled `resumeSafely` action. Repeated Enter events are prevented on that optional action.
- Safety describes output and dose as digital settings/model estimates, removes the unsupported ±6 dB precision statement, and states that short previews and other audio are outside the Studio dose log. The infant-mode paragraph lists its actual digital controls without promising an acoustic level at the ear.
- Safety's stop explanation and rehearsal labels use direct descriptions. Its categorical risk-opening slogan and “whole protocol” claim were removed.
- The implant paragraph now links the checked American Heart Association guidance and asks users to follow their device manufacturer's headphone/magnet guidance. **Switch Studio to binaural** replaces a misleading “globally disable” label; the action is unchanged.
- No DSP, live graph, governor rules, session duration policy, preview output, or session action implementation changed.

## Verification

`npx vitest run src/ui/__tests__/stop-agency.test.tsx`: **7 tests passed**. The integration suite uses the real SessionProvider and checks:

1. A live session is immediately stopped; initial focus and Enter activation keep sound off.
2. A tracked preview is stopped and is not restarted by backdrop dismissal.
3. Escape keeps silence and restores focus to the stop button.
4. Explicit Studio playback uses the existing quieter setting and does not restart the stopped preview.
5. The first-use advisory still gates that explicit Studio action.
6. The infant low-pass requirement still gates that explicit Studio action.
7. A held Enter cannot repeatedly activate the optional playback control.

Lint passed for the two implementation files and new test. The first test run exposed happy-dom's incomplete animation cancellation behavior; disabling that test environment's Web Animations API, consistently with the existing shell suites, resolved the harness errors. No production animation API or test assertion was weakened.

## Handoff and outstanding checks

The UX owner is aligning shell labels and existing focus tests; root is coordinating shared smoke-test copy and the full check gate. The next independent review should inspect the stopped overlay at phone width, keyboard-only operation and the first listening path after the navigation redesign. Existing source/theory limitations remain available and should not be hidden by the new grouping. No claim of real-user or clinician testing is warranted.

Files owned in this implementation: `src/ui/components/Panic.tsx`, `src/pages/Safety.tsx`, `src/ui/__tests__/stop-agency.test.tsx` and this panel note.

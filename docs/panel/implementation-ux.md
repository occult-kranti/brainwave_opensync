# Navigation implementation and checks

Date: 2026-09-14. Implements the accepted Loop 1 hierarchy; this note is implementation evidence, not the independent Loop 2 review.

## Changes

- Home, Presets and Studio are direct links. Safety remains directly reachable. Create & explore, Analyze audio, Run experiments, Theory & research and Help are shallow disclosures, initially closed. An active deep link reveals its group; an explicit collapse retains a current-page cue.
- All 24 routes retain their URLs. The initial desktop rail and mobile drawer expose four direct links instead of the former list of all 13 practical tools. Opening every disclosure exposes every route exactly once.
- Shared `src/app/navigation.ts` provides task categories, concise purpose text and search aliases for Home, Guide, navigation and the command palette. Route references resolve lazily because Home is imported eagerly by the route registry.
- Frequency reference, Recording analysis, Live analyzer and Sleep experiments now distinguish their purpose in navigation. Original names remain searchable. Dream sits with the advanced experiment tools.
- Find opens the command palette. Its results are grouped by the same tasks and match descriptions, familiar terms and former page names. A failed search provides Clear search.
- Mobile tabs are Home, Presets, Studio and Safety, followed by More and the persistent Stop all sound control. Studio pause moves to the header so the five navigation targets have more room on narrow screens.
- Shell status says Studio ready, Studio playing or Studio paused and reports tracked previews separately. It does not assert universal silence when Studio is idle. Studio pause is named accordingly. The full header's extra UTC clock is removed; the clock remains in More.
- AppShell's icon stop action and the palette use Stop all sound. Keyboard behavior and audio actions are unchanged. The therapist role owns the shared Stop component and recovery dialog.

## Checks completed

A focused run passed six suites and 62 tests covering route metadata, navigation reachability, full/icon/hidden sidebar states, mobile drawer, pause transport and command actions. After adding a real DOM search interaction, the sidebar suite passed all 12 tests, including a failed search, Clear search, lookup by the former Sample Lab name, navigation to Recording analysis, and automatic Analyze audio disclosure.

The metadata tests check unique coverage of all routes, primary ordering, placement of advanced sleep experiments and common searches: chord, recording, Monroe, Bashar, noise and old route names. Existing direct links, disclosure semantics, current-page cues, keyboard shortcuts and pause behavior remain covered. Typecheck and whitespace checks were run on the integrated working tree.

These are automated checks, not browser geometry checks or a usability study. Live desktop, narrow-layout and keyboard walkthroughs remain part of the moderator's subsequent review and release gate. No deterministic DSP, rendering or audio safety contract changed in this assignment.

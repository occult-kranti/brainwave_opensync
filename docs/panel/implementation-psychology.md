# Home and Guide implementation checkpoint

Date: 2026-09-14. This records implementation work following the moderator's loop-1 decisions. It is not the independent loop-2 review.

## Changes

- Home starts with **Choose a sound** and three task paths: Listen, Create, and Inspect. Chords and audio-file inspection have direct links. Bashar is a listening collection; Simple player is a secondary link explicitly described as a separate view.
- Removed the tall animated waveform hero, duplicated quick-start blocks, and module-wide weakest-grade badges.
- A compact directory reads names, descriptions, aliases, and groups from the shared navigation registry. Every retained route remains browsable. Theory starts collapsed; a matching search exposes it. Empty results offer a clear reset.
- Guide begins with four ordinary tasks, keeps full feature documentation under native disclosures, and searches both simple and technical explanations. Search opens matching modules. Evidence scope is shown in both explanation modes.
- New page-specific CSS provides stacked small-screen layouts, visible keyboard focus, and a mobile Guide search bar that does not cover the task content while scrolling.

## Checks

The dedicated Home/Guide tests cover the first action, direct chord/file links, all-route discovery, collapsed research, old-name search, search recovery, optional full instructions, and technical search. Updated the old Home smoke test to the new task-first presentation. TypeScript passed during the shared implementation checkpoint. Browser layout and integrated playback are reserved for the release review; this report does not claim physical-device or human-participant testing.

## Integration finding

Detected and reported an initialization cycle in `routes → Home → navigation → routes`. The navigation owner replaced eager route resolution with getters; Home only reads resolved entries during render.

## Scope

Owned files: `src/pages/Home.tsx`, `src/pages/home.css`, `src/pages/Guide.tsx`, `src/pages/guide.css`, `src/pages/__tests__/home-guide-v3.test.tsx`, and `src/docs/__tests__/home-guide.smoke.test.tsx`. No DSP, session, preset, navigation-registry, or global-style changes were made by this implementer.

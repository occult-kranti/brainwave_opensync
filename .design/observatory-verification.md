# Sound Observatory verification — 15 October 2026

## Executed release gate
- Archive: `npm run check` passed lint, TypeScript, 97 test files / 1,322 tests and production build.
- Main: `npm run check` passed lint, TypeScript, 92 test files / 1,273 tests and production build.
- All 139 deterministic preview WAVs rendered at 2 seconds each; total 53.4 MB, below the 60 MB guard. Existing preview hashes remain unchanged.
- No changes to the deterministic engine, live audio graph, safety governor or SessionProvider. Main receives the previously tested 90-minute browser export allocation guard alongside overnight presets.
- New assertions cover hypnosis source/mix/duration constraints, speaker filtering, intention matching, finite 3D/4D projection over rotations, parameter seams, the inline finder URL and the desktop workshop drawer. Existing tests retain preview/advisory/mute/panic behavior, loading without autoplay, session continuity, mobile navigation and themes.
- Original master shell and all specialist routes retained. Archive rail assertions now run on specialist routes; horizontal discovery navigation has separate coverage. Test copy expectations were updated for the new UI; safety expectations were not weakened.

## Live checks
Post-publication checks will exercise the real deployed home, catalog, 3D/4D switch, workshop directory, theme switch and player. Responsive rules and mobile component branches are covered locally. The available browser does not expose viewport resizing; real-phone visual and seven-hour device-endurance testing are not claimed.

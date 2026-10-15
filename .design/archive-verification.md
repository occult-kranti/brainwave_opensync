> Historical verification of the preceding release. Superseded by observatory-verification.md for current code.

# Archive themes and restoration verification

## Source separation
Master restores the source from 78b0751. Its only app-source difference is a link from Home to /archive/. The audio engine, session state, original preset data, and Studio match that source. The redesigned branch remains based on 3676da7 and retains all 131 presets and newer research / overnight features. No engine, session, or preset changes are made for theming.

## Executed checks
- Restored master: npm run check passed lint, TypeScript, 90 test files / 1,256 tests, and a production build.
- Archive: npm run check passed lint, TypeScript, 95 test files / 1,316 tests, and a production build.
- Theme integration tests cover active-session continuity, route continuity, persistence across remount, recovery from an unsupported value, and sibling-project URLs.
- Pages workflow parses and explicitly checks out master plus archive/dark-landscapes. The parent worker excludes /archive/ and /previous/; the archive builds with its own base and scope.
- Muted text contrast on an 82% dark reading surface over pure white: 5.01:1 Night Country; 5.21:1 Quiet Horizon. Real painted areas have additional scrims. Controls use native buttons, aria-pressed and visible focus. No landscape motion or parallax.

## Live verification
A live walkthrough of both deployed editions and both theme choices follows publication. Desktop visual and keyboard checks are available; real-phone visual testing and overnight device endurance are not performed in this environment.

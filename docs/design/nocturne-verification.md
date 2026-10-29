# Nocturne archive verification

Date: 2026-10-29. Scope: archive/dark-landscapes, based on dc85d935ac35ebdc6730d59fea56ef21d3cc990a. Reviews are AI implementation reviews, not a human usability study.

## Requirements and evidence

| Requirement | Result | Evidence |
| --- | --- | --- |
| Replace the archive visual framing | Implemented | Shared indigo/slate/porcelain tokens, Newsreader/Inter, reading scrim, redesigned Home and desktop/phone shell |
| Keep the live 3D/4D experience | Preserved | Shared Three.js world, existing dimension/pause/zoom controls and Canvas fallback; no static replacement image |
| Mobile layout and optional detail | Verified at sampled viewports | Home, Presets, Listen, Home Practice, Studio, Cymatics and Research at 320, 390, 900 and 1440px: 28 route/width checks, no document overflow and no uncaught page errors |
| Accessible Menu | Browser verified | Escape closes and restores focus to Menu at 320 and 390px; background inert, own Stop control; DOM tests cover focus containment and scroll lock |
| Practice schedule in navigation | Implemented | Prominent sidebar/Menu/Home links, existing /practice-plan route enhanced with 2/4 weeks, repeat spacing, quiet days, time window and equipment guidance |
| Official and community source distinction | Reviewed | Publisher sequence/FAQ, full extracted 24-page historical manual cross-check, earlier 25-page mirror reading record, community anecdotes clearly separated; current purchased manual unavailable |
| Mobile audio stability | Scoped verification passed | Playback latency preference and legacy fallback; 50ms pitch ramps preserve source identity; 90 clock-update regression plus real 35-second browser check |
| Repository checks | Passed | ESLint, TypeScript, all 126 test files / 1,610 tests, production build with /brainwave_opensync/archive/ base and 40 generated route shells |
| Design references and three rounds | Complete | [Source and review record](nocturne-reference-review.md) documents source/incumbent audit, implementation review and rendered confirmation |
| Figma | Pending connection choice | Two connected accounts ('Primary' and 'Figma'); the account-selection question received no choice. No Figma file was created or claimed. |

An additional complete registry smoke covered all 41 routes at 320px and 1440px: 82 checks, zero missing headings, route error boundaries, document overflow or uncaught page errors. Internal scrollable data areas remain permitted; this is a route-render/reflow check, not an exhaustive interaction audit of every calculator.

## Actual browser audio observation

Chromium with a 390px viewport and actual Web Audio: 44,100Hz sample rate; baseLatency 0.02322 seconds; currentTime advanced from 0.20898 to 35.22467 seconds. Exactly two AudioBufferSourceNodes were created for brown noise and thunder, and the count remained two. Context remained running. Pause suspended it; resume returned it to running; panic stopped the engine. Browser output was muted by the automated browser. This proves graph/clock continuity in this environment, not acoustic quality, Bluetooth fidelity or physical phone behavior.

The reported 15–30-second noise switch was not reproduced on a physical device. Existing 8/12-second texture seam handling remains in place. The new buffering preference and pitch smoothing address plausible interruptions/clicks without asserting that they fix every device-specific cause. Rapid acoustic retargeting during an unfinished ramp was not measured. A useful follow-up device report needs the preset, browser/OS, output device and whether the event happens with the screen visible or locked.

## Review findings resolved

- Home initially reused a suggestion sentence implying automatic shortening, although the player loads the full preset. It now explicitly describes the longer recording and leaves playback under user control.
- Bright geometry initially competed with mobile headings. A consistent reading scrim resolved the visible contrast defect in the reviewed captures.
- The 320px Home zoom row received a final spacing adjustment, preserving 44px controls.

## Release boundary

Only the archive source branch and archive/ published subtree are eligible for changes. Preserve existing archive redirect folders. Keep master and every non-archive Pages blob unchanged. An archive-local deployment.json records the source; the protected root release manifest remains untouched. Remote deployment confirmation is recorded after publication.

Production build confirmation used the real /brainwave_opensync/archive/ path: the subset Newsreader font loaded; all five Home scene buttons measured 44×44px on one row at 320px; Practice rendered four weeks and 28 days; no asset HTTP failures or uncaught errors occurred.

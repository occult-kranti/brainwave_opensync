# Mobile, audio and home-practice review

Date: 2026-10-29. Baseline: `42acf6faf24e6dfb5fefbb735cc3f91211ce1478` on `archive/dark-landscapes`.

Four independent AI roles contributed: mobile interface implementation, audio engineering, practice-source research, and independent accessibility/product review. The root integrated their decisions. These are AI reviews, not human usability studies or professional endorsements. The three rounds below review successive working artifacts rather than repeating an unchanged report.

## Round 1: baseline assessment and first revision

| Finding and evidence | Decision and owner | Acceptance check |
| --- | --- | --- |
| Phone library exposes 21 collection controls and several full filter rows before results | Mobile designer: compact collection selector and a filter sheet with active settings/count | Select, reset and close without losing URL state; search and results stay visible |
| More drawer omits the focus-trap root; sheets sit below fixed navigation | Mobile designer: rooted focus trap, contained scrolling and modal layering; Stop remains inside each sheet | Tab/Shift+Tab, Escape, restore focus, background navigation blocked |
| World controls are small and precede player transport on narrow screens | Mobile designer: disclose optional graphics controls and put listening controls first | Reach transport on a small phone; graphics settings remain available |
| A later global `.chip` rule overrides the primary button background while retaining dark text | Mobile designer: explicit readable primary action styling | Rendered label/icon contrast and clear action targets |
| Raw 8-second noise and 12-second nature buffers have sharp loop joins | Audio engineer: live-only overlap-add construction; preserve nominal duration and RMS | Compare seam with normal sample differences at 44.1/48 kHz; repeated joins through 90 seconds |
| Nature gain edits rebuild the source even when its kind is unchanged | Audio engineer: ramp the existing gain | Source identity and phase survive gain-only changes; real kind changes still replace the source |
| The requested tape timetable needs source provenance and self-paced repetition | Practice researcher: editable plan, full source-access ledger, official tape names separated from original companions | No autoplay; no fixed validated OBE dose; short windows do not silently truncate official exercises |

## Design sources and tools

- Don Norman, [Signifiers, not affordances](https://jnd.org/signifiers-not-affordances/): make actions and their state visible. Public article consulted; no entire-book reading claimed.
- Steve Krug, [Don't Make Me Think, Revisited](https://sensible.com/dont-make-me-think/): author page and available sample material consulted for clear navigation and scanning; not a claim to have read all 212 pages.
- Nielsen Norman Group, [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/): defer specialist controls while retaining primary actions and useful state summaries.
- W3C, [Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): focus containment, Escape, return focus, and an inert background.
- W3C, [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): WCAG 2.2 AA uses 24 CSS pixels with exceptions. This project aims for larger 44-pixel touch targets for key actions; that target is not represented as the AA minimum.
- [Penpot](https://github.com/penpot/penpot): independent MPL-2.0 open-source design/prototyping platform. It is not described as reverse-engineered Figma. Existing React, CSS, Lucide and disclosure/dialog facilities are the implementation tools; installing a separate editor is unnecessary for the identified fixes.
- Figma became connected after the implementation rounds. An [editable review file](https://www.figma.com/design/yEC3aXLr4B2iyjhZ3N8P6w) was created for the mobile screens. Composition was still in progress at this source checkpoint; no completed Figma-to-code import is claimed. The implemented interface and browser verification use the actual React application.

Practice sources, reading depth, manual hash and official/community distinctions are recorded in `docs/research/home-practice-sources.md`.

## Round 2: challenge the changed artifact

The independent reviewer challenged the first revision against the actual modal lifecycle and the research provenance. It found that Ctrl+K could open an invisible palette behind a sheet, global navigation could change the route behind a dialog, and a timetable could put Exploration, Sleep in the morning. The revision blocks ordinary global shortcuts while a modal is open, keeps immediate Stop available, locks background scrolling, restores focus on dismissal and gives sleep exercises an explicit bedtime slot. The advisory and panic overlays retain priority.

The audio panel checked the proposed fix against actual rendered waveforms rather than assuming the reported hardware symptom had been reproduced. Six 90-second Chromium OfflineAudioContext renders covered brown noise, fire and thunder at 44.1 and 48 kHz. They confirmed improved joins without changing the nominal loop period; sample-level tests also cover 11.025 and 96 kHz. Gain-only nature edits retain the existing source. The practice panel checked all time-budget arithmetic and separated the publisher's current FAQ from the complete historical manual mirror and anecdotal community discussions.

## Round 3: final verification and release

Responsive Chromium checks covered seven representative routes at 320, 390, 430 and 1440 CSS pixels. A separate 390 × 844 sweep visited all 41 routes without horizontal document overflow, an application exception or an error boundary. Screenshots were inspected for the library, player, Studio and practice plan.

A final screenshot caught a blocker that source-level z-index checks had missed: the clipped workspace formed a stacking context below the bottom navigation, so filter footer buttons could still be covered. The final revision ports preset filters, preset details and Studio Save into a dedicated AppShell overlay host outside that workspace. Its layer is above navigation and below the global advisory and panic dialogs. Independent structural review checked pointer handling, focus refs, React context and the standalone portal fallback. Browser verification then checks the actual element receiving a tap at each footer button's center, as well as background-navigation occlusion; computed z-index alone is not accepted as evidence.

Regression coverage includes URL-preserved filters, focus wrapping and return, advisory and panic priority, explicit playback after dismissal, bedtime scheduling, portal placement, source continuity and audio joins. Detailed final check results are recorded in `docs/validation/mobile-practice-2026-10-29.json`. Publication is restricted to the archive application and its deployment metadata.

## Verification boundaries

Mobile viewport emulation can test layout, controls and the browser audio graph. It does not reproduce a physical phone's Bluetooth codec, headphone firmware, operating-system routing or background restrictions. A source-level loop defect and its regression tests support a bounded fix, not a claim that every possible hardware switching noise has been reproduced.

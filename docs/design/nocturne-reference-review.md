# Nocturne reference and review record

Reviewed 29 October 2026. Scope: the archive redesign, mobile navigation and home-practice planning. The main/master experience is outside this change.

## Reference provenance

These are source checks and design applications, not a claim to have read every cited book in full. No unlicensed book downloads were used. The book references were checked through author/publisher material and available excerpt descriptions. Accessibility and implementation decisions were checked against current primary documentation.

| Reference | Material checked | Application |
| --- | --- | --- |
| Steve Krug, [Don't Make Me Think, Revisited](https://sensible.com/dont-make-me-think/) | Author's book page and publisher sample information | Use familiar task labels, make the next action visible and reduce navigation choices presented at once. |
| Don Norman, [The Design of Everyday Things, revised edition](https://jnd.org/preface-design-of-everyday-things-revised-edition/) | Author's revised-edition preface and book overview | Label controls with understandable actions, distinguish selected/playing states and retain visible feedback. |
| Adam Wathan and Steve Schoger, [Refactoring UI](https://refactoringui.com/) | Official overview and topic list | Use deliberate hierarchy, consistent spacing and readable text rather than making every element equally prominent. |
| W3C WAI, [Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Pattern and keyboard/focus contract | Move focus inside, contain Tab navigation, support Escape, restore the invoking control and make background interaction inert. |
| W3C WAI, [Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) | Pattern, keyboard behavior and ARIA properties | Keep route groups, session notes and technical background collapsible with an understandable expanded state. |
| W3C WAI, [WCAG 2.2 target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | AA minimum and exceptions | The criterion specifies 24 CSS pixels or sufficient spacing; this design generally aims for 44–48 pixel mobile controls. |
| W3C WAI, [Reflow](https://w3c.github.io/wcag/understanding/reflow.html) | 320 CSS-pixel reflow criterion and exceptions | Avoid page-level horizontal scrolling; stack reading and form content on small screens. |
| W3C WAI, [Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) | AAA criterion and reduced-motion techniques | Respect reduced motion, provide scene pause and keep animation independent from audio playback. This reference alone does not establish WCAG conformance. |
| [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) | Component behavior and accessibility API | Reuse existing dialog infrastructure; retain accessible naming, focus management and Escape behavior. |
| Three.js, [Responsive design](https://threejs.org/manual/pages/responsive.html) and [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) | Drawing-buffer sizing and renderer options | Preserve one shared scene; budget mobile rendering deliberately. A power preference is a browser hint, not a guaranteed optimization. |
| MDN, [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) | Loading, autoplay, user controls and parameter guidance | Distinguish long streaming tracks from generated sounds and samples; maintain explicit playback controls. This does not prove the cause of a particular device's noise change. |

## Open-source design-tool check

[Penpot](https://github.com/penpot/penpot) is a verifiable open-source design/prototyping platform using open web standards, with cloud and self-hosted options. It is an alternative to Figma; this review did not establish that it reverse-engineers Figma.

[tldraw](https://tldraw.dev/community/license) exposes source under its own license. Its documented default terms permit development use; production requires an applicable trial, commercial or hobby key. It was therefore not added as an unqualified open-source production dependency.

The user requested Figma. No Figma file is claimed in this record. Account selection, connection state and actual tool results must be recorded by the integrating agent before claiming that deliverable.

## Round 1: direction and incumbent audit

The incumbent already used dark sage/amber, an immersive field, grouped navigation and a large editorial hero. Repeating that combination would not fulfill a complete redesign. The agreed replacement is Nocturne: indigo/slate surfaces, porcelain text, lavender accents and sand primary controls. Display type is reserved for headings; tools use readable text and clear actions.

Material incumbent issues identified:

- Small uppercase labels and technical readouts competed with the listening task.
- Idle phone controls consumed header space.
- Dense bottom navigation required small-screen target checks.
- Many route-level style generations required a bounded cascade inspection.

Preserve the audio state, route registry, existing focus/scroll-lock behavior, immediate Stop controls and shared 3D/4D scene while replacing the framing.

## Round 2: implementation review

Files inspected: `src/pages/Home.tsx`, `src/pages/nocturne-home.css`, `src/pages/nocturne.css`, `src/ui/layout/AppShell.tsx`, `src/ui/layout/mobile-shell.css`, `src/pages/PracticePlan.tsx`, `src/pages/practice-plan.css`, the session recommendation function and the Listen preset-loading path.

Positive findings:

- The shared palette and heading type establish a clear replacement world.
- Home exposes explicit listening and practice entry points; sound still requires Play.
- The desktop rail and phone Menu use the same route groups and prominently expose Practice at home.
- The phone Menu has its own Stop control while ordinary navigation becomes inert.
- Idle pause is hidden on phones and returns when a session runs.
- Reduced-motion handling is applied to Menu transitions.
- The practice builder stacks at small widths, uses native form controls and keeps detailed notes/sources behind explicit disclosures.
- Home's additional class generally raises specificity above incumbent immersive rules. Rendered verification is still required.
- At 320 CSS pixels, four ordinary tabs plus Menu receive about 49.6 pixels each after the 72-pixel Stop segment. This is a layout calculation, not a rendered accessibility audit.

One material issue reported: a shortened Home recommendation reused copy saying it was shortened to the available time, but the link loaded the complete preset in Listen. The displayed copy must describe the actual full-preset behavior or the player must support the specified duration. A caveat below the link does not resolve contradictory primary text.

Browser checks requested for the final pass: Menu Escape/focus restoration after `inert` removal; desktop sidebar/main layout at 1200 pixels; 320-pixel Home/Practice reflow; real 3D caption/hero overlap; dialog close/Stop reachability.

## Round 3: rendered confirmation

The first batched 390-pixel captures were inspected for Home, Practice at home, Listen, Presets, Studio, Research and Cymatics. The text hierarchy, navigation and player controls fit the captured width. No page-level horizontal overflow is visible in those captures; this visual observation does not replace a document-width check.

One shared material defect was reported for correction: bright live-scene highlights sit behind unprotected text in Home's headline/body, Practice's heading/intro, Presets' heading, Studio's header, Research's hero and Listen's top customization link. A consistent reading scrim is needed for those textual surfaces, while preserving the live world in dedicated visual areas and gaps. The Listen player panel already provides suitable reading separation. Cymatics' main artwork fits the captured viewport; its top mode labels should receive the same contrast protection.

The integrating agent corrected the Home recommendation wording and added a consistent reading scrim. The confirmation captures inspected were desktop Home at 1440 pixels, Home at 320 pixels, Practice at home at 390 pixels and Menu at 320 pixels. The scrim protects the reading layer while retaining the live sculpture; the desktop rail/main relationship is clear; the phone Menu keeps its Close and Stop actions reachable. The 320-pixel Home capture wraps the final zoom control to a second line; its control remains reachable, and the integrating agent is removing a legacy group margin to make the row fit while keeping 44-pixel targets. No further visual correction was requested by this reviewer.

The integrating agent's `ui-review/checks.json` was inspected. Its 28 route/width combinations cover seven routes at 320, 390, 900 and 1440 pixels. All report equal document scroll/client width and zero page errors. Some internal scrollable tab strips and canvases extend outside the viewport; the page-level checks do not claim every individual child fits without internal scrolling. Both 320- and 390-pixel Menu checks report Escape close and focus restoration to the invoker.

The separate browser audio record reports the same two source nodes at the beginning and after 35 seconds, a running context, and working pause/resume/stop transitions. This is useful continuity evidence, not a physical-device speaker/headphone listening test or proof that every mobile noise artifact has been eliminated.

Final scope verdict: the reviewed shell, Home and practice-planning surfaces coherently implement Nocturne, and the material recommendation-copy/reading-contrast findings were addressed. The documented UI verification covers the routes and widths above. It does not establish an exhaustive audit of every experiment route, WCAG certification, physical mobile/Bluetooth audio behavior or a completed Figma deliverable.

The final registry-wide smoke subsequently covered all 41 routes at 320px and 1440px (82 checks). Every route rendered its main heading; no document overflow, route error boundary or uncaught page error was observed. This extends route-rendering coverage, not the scope of the visual or hardware-audio review.

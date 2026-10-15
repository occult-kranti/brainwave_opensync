# Listening screens, flow and mobile plan

## Product decisions

The front door asks what the listener wants to do. Technical controls and source details are progressive disclosures, with the active sound and stop controls visible. The visual system uses deep pine surfaces, warm ivory text, muted sage and a restrained sand-colored primary action. Existing artwork provides atmosphere without adding a heavy background video.

Reference reading: Steve Krug, *Don't Make Me Think, Revisited* (2014), [author's book page](https://sensible.com/dont-make-me-think/), as a usability reading reference rather than a claim of full-book review; and [W3C's reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Applied decisions are our own: explicit action labels, readable hierarchy, visible selection and result counts, and single-column reflow. No claim of a complete WCAG audit is made.

| Screen | First task | Secondary content | Mobile arrangement |
| --- | --- | --- | --- |
| Home | Find a session | Intention widget, overnight invitation, full tool directory | Stacked hero and intention links; tools behind disclosures |
| Find a session | Choose intention, time and output | Reasons for matches; experimental opt-in | Selection above results; large labeled controls |
| Presets | Select collection, filter, preview | Source sheet and individual phase previews | Two-column collection buttons; one-column filters and sound cards |
| Overnight | Intention → sound duration → listening setup | Read plan, short sound test, evidence groups | One-column flow; plan loses desktop sticky behavior; full-width main action |
| Studio | Play, pause, stop, set duration | Mixer, textures, phases, visuals, file tools | Playback first; each advanced control group independently collapsible |
| NanoLab | Load one of four controlled recipes | Exact parameters, plots, export, source scope | Two-column recipes on tablets, one on small phones; existing analysis below |
| Sourcebook / Hypnosis | Inspect theory and evidence | Original recipes and mathematics | One source column, wrapped links, collapsible topics |

## Main flow and state rules

1. Home leads to the suggestion page, preset browser or overnight planner.
2. Preset filters combine setup, duration, sound character, evidence, category and search. Group by collection or category; sort inside groups. Query state is in the URL and works with browser back/forward.
3. Preview is bounded and separate from loading. Active sessions, mute, panic and infant mode retain their restrictions.
4. Loading a new plan stops the previous session, applies the authored mix, respects the existing cap, and does not increase volume. Playback requires a separate Play action in Studio.
5. Sources remain one link away. Experimental labels travel with the preset rather than being hidden in a general disclaimer.

## Responsive and performance constraints

- Use `minmax(0, 1fr)`, wrapping text, and fluid widths so controls do not impose a desktop minimum. Mobile targets are at least 44 CSS pixels. Long source links wrap; drawers account for bottom navigation.
- Native details/summary preserves keyboard disclosure behavior. Preset sheets trap focus, return focus and offer a visible close. Sand art uses a body-level portal so the player cannot clip it.
- Only Home is eager; all other pages are route-split. The new source data is text, without extra image downloads. Existing preset art is lazy-loaded.
- Night playback synthesizes live; it does not allocate a seven-hour PCM buffer. Exports over 90 minutes fail before worker construction. The deterministic engine remains unchanged.
- Sand art is bounded to 24 fps, pauses when hidden, uses fewer particles and a smaller field on mobile, and defaults to stillness for reduced motion.
- The standard four mobile tabs plus More keep every existing feature reachable. The new Overnight entry lives in Meditation & rest and has a direct home invitation.

## Review limits

Automated desktop/mobile React branch smoke tests and interaction regressions are run. Responsive CSS was reviewed for 320-pixel reflow constraints. The available cloud browser exposes no viewport resizing and could not reach the local server; real-phone visual inspection and background audio endurance are not claimed. Production desktop navigation, plan setup, filtering, NanoLab selection and sand-stage interaction are checked after deployment.

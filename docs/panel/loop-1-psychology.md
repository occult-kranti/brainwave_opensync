# Loop 1 — psychology-informed interface review

Date: 2026-09-14. Reviewer: an AI panel role applying cognitive-accessibility guidance. This is a source/code review, not a licensed psychologist's assessment, a clinical evaluation, or a study with users. No playback or browser interaction was performed for this report. The OpenSync audio research skill, `CLAUDE.md`, architecture, routes, Home, Studio, Presets, Guide, GradeBadge, and Everyday were inspected.

## Main finding

The app separates reading from doing, but its practical-tool list is still an inventory of implementations. A new listener must distinguish Studio, Library, Presets, several Labs, and an Everyday app before choosing a sound. Home repeats the inventory with instructions for every tool. The interface asks the visitor to learn the product's structure before beginning their own task.

This is a design inference from the inspected interface, not a measured claim about users. The next version should give listeners one short, recognizable starting path while preserving direct access for returning makers and researchers.

## Guidance used

- W3C's supplemental cognitive-accessibility guidance recommends clear purpose, familiar labels, short task paths, relevant content, and optional simplification. It supports a smaller initial set of choices with descriptive disclosures for the rest. It also calls for testing with actual users; this AI review cannot substitute for that. [Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/), particularly sections 4.6.2–4.6.4 and 4.9.3. This is supplemental guidance, not a claim of WCAG conformance or an experimentally established optimum number of menu items.
- Descriptive headings and labels let people understand both an individual control and the organization around it. [W3C Understanding SC 2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html).
- Existing status messages should be identifiable by assistive technology without forcing focus changes. A search-result count and a completed export are examples of useful noninterrupting feedback. [W3C Understanding SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

## Decisions recommended for the moderator

| Priority | Observed issue | Concrete change | Observable acceptance criterion |
|---|---|---|---|
| P0 | Home offers Studio, Bashar sounds, Guide, and Everyday together, followed by 13 equally weighted tools. | Put a listening action first: **Choose a sound**. Follow with purpose-led **Create sound** and **Inspect sound** entry points. Keep Bashar as a collection within listening. Put research in the requested collapsed group. | A first visitor can find the preset collection without knowing what a lab or Studio is. The first Home section does not reproduce the complete route list. Every retained tool remains reachable and searchable. |
| P0 | The single Tools heading still contains unlike jobs, including Experiment Lab and Replication Bay. | Use a small number of task groups such as **Listen**, **Create**, and **Inspect & test**. Give ambiguous tool names a short concrete description. For example, “Sample Lab — inspect an audio file” and “Harmonic Lab — build chords and tuning comparisons.” | Sidebar, Home, mobile menu, and search use the same group names and destinations. A deep-linked page exposes its group and location. Search still finds the old names. |
| P0 | Studio opens all transport actions, export format, fades, engine details, graphs, mixers, layers, and phases at once. | Default to a listening/editing workspace with current sound, Play/Stop, output level, duration, and a clear route to presets. Put sound design, layers, analysis, and save/export in descriptively labeled disclosures or panels. Keep the selected sound and playback state visible when panels are closed. | Loading a preset never requires opening an advanced panel to hear or stop it. Expanding/collapsing a panel neither resets audio settings nor starts or stops sound. Modified settings survive toggling the view. |
| P0 | Home grades each entire module by its weakest claim; badges read SOLID/HUMAN/PLAUS./FOLKL. | Remove grades from tool navigation and Home tool cards. Keep grades next to specific claims. Replace cryptic abbreviated badge words with neutral, readable evidence terms where space permits; always provide the full meaning to assistive technology. | No sound-creation tool appears graded as effective or ineffective. A listener can distinguish evidence for an audible signal from evidence for a proposed human effect without interpreting a lone letter or color. |
| P0 | The preset filter says “Minimum evidence grade,” inviting a single quality ranking of unlike claims. | Move this optional filter behind **More filters** and explain its scope. Keep the grade's claim text in card details. Do not describe A as the best listening experience or D as an unsafe sound. | Filtering is optional and never blocks browsing. Grade explanations remain available on keyboard and touch. No filter caption presents a letter as a treatment score. |
| P0 | The selected preset is a compact transport chip; edited state is a small colored dot. | Use a visible current-sound name and plain **Edited** status. Distinguish **Ready**, **Playing**, **Paused**, and **Previewing** where relevant. Use **Load into Studio** for configuration transfer and **Play** only where playback begins. | A stopped loaded sound cannot be mistaken for a playing sound. State does not rely on LED color or hover text. A custom edit is visible in text. |
| P1 | Duration is labeled LIMIT and its tooltip sends people to Safety Center, making a basic session choice appear to be an unrelated safety setting. | Show **Session length** with an in-context duration control constrained by the existing governor. Keep the safety cap visible as a secondary explanation only when it affects the choice. | The normal listening path can inspect its duration in Studio. Any rejected or clamped duration has a visible reason. No governor cap is weakened. |
| P1 | Home tells a visitor to use the Visualizer in the quick start, whether or not they want analysis. | Make the short path “Choose a sound → Preview → Load into Studio → Play.” Put optional analysis after successful listening. | A first-session guide ends at the user's listening task and includes how to stop. It does not require opening a graph or reading theory. |
| P1 | Everyday is a separately bootstrapped app with another naming/navigation system. | Label it **Simple player** and describe what changes. Prefer a link from the listening area rather than a second equally prominent product launch. Do not promise live-state continuity across a full page reload unless tested. | Its entry says it offers fewer controls. Its return path names the full workspace. There is no implied continuation of active playback across the app boundary. |
| P1 | Guide search examples lead with specialist terms such as LUFS and Chladni. | Start the Guide with task links such as “Play a preset,” “Make a chord,” and “Export a WAV.” Keep technical search and full feature documentation available underneath. | A visitor can find a basic workflow using ordinary verbs. Technical documentation remains searchable without crowding the initial task guidance. |

## Copy and interpretation details

The app already says it measures audio rather than brain activity; retain that short distinction at relevant places. However, Studio's main control calls the beat rate a brainwave band and some mode descriptions foreground cortical responses. Put the sound first: “One tone in each ear,” “Two tones mixed together,” or “A pulsing tone.” Technical limits and comparative evidence can follow in the source details. A band label must refer to the selected audio modulation rate and must not resemble a measurement of the listener.

The Bashar collection currently discloses its chosen conversion and timings. Preserve this disclosure when simplifying its presentation. A shorter interface must not erase the difference between an authored example, a published setting, and an observed physiological result. Display **Experimental listening example** with a short source link; retain the chosen k = 5,000 anchor in the collection explanation and detailed specification.

Prefer **Sound details** to “spec sheet,” **Save sound** or **Save as preset** to an unexplained save icon, and **Export WAV** to “WAV.” The same action should have the same wording on cards, details, and Studio. Avoid promises such as “reach theta,” “improve sleep,” “therapist approved,” or “train your brain.” Categories like Sleep and Focus should be presented as browsing labels or intended use, not predicted outcomes.

## Review tasks for loop 2

1. From Home, choose a preset, hear a bounded preview, load it, inspect duration, play, and stop. Check that every state and next action is visible.
2. From a direct Harmonic Lab or Analyzer URL, identify the task group and return to the relevant tool listing without reading theory.
3. Load a Bashar preset, close advanced controls, and verify the current sound still identifies itself as an experimental example. Open details and find its chosen parameters and authored-fade limitation.
4. Expand a Studio panel, edit a value, collapse and reopen it. Verify the value persists and the view change never changes playback.
5. Apply filters that produce no presets, then recover with a visible reset. Check a keyboard user can reach and dismiss source details.

## Loop 3 release questions

- Are there any dead ends introduced by grouping, especially on mobile and deep links?
- Does every playing or previewing state retain a visible stop route?
- Is the first practical action obvious without grade knowledge or audio vocabulary?
- Are status messages accurate, with the selected sound distinguished from actual playback?
- Are reviewer conclusions reported as an AI panel's design judgments, with real-user validation left explicitly unmeasured?

No new accounts, streaks, goal scores, mental-state scoring, achievement badges, or personalization survey is recommended. Those features would add choices and claims before solving the organization problem.

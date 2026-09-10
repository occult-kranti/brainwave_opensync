# Open Sync Everyday — planning document

Council: marketing lead, senior front-end/audio engineer, technical-docs lead, brand designer, UI/UX designer. The decision is taken and not re-opened here: a second, simplified, mobile-first app **Open Sync Everyday** ships at `/brainwave_opensync/app/` from the same repository (second Vite entry `app/index.html` → `src/everyday/`, hash router, own manifest, shared root service worker, shared `SessionProvider`, engine, live engine and `SafetyGovernor`). The lab stays untouched at the root.

Every effect statement here and in the app carries the grade of the preset it comes from, or is absent. Banned phrases (`src/docs/vocabulary.ts`) never appear in copy.

---

## 1. Positioning & marketing

**Positioning.** *Open Sync Everyday is the calm half of Open Sync: four sounds for sleep, focus, rest and meditation, with the lab's safety rails and evidence grades and none of its reading.*

### Audiences and jobs

| Audience | Job to be done | Intent | Default session |
|---|---|---|---|
| Light sleepers | Mask the room, drift off, have it stop by itself | Sleep | `sleep-slow-wave-cue` (B) + brown noise, fade 10 min, 45 min |
| Deep-work blocks | A steady bed of sound for one work block | Focus | `focus-alpha-flow` (C), tones only, fade 30 s, 30 min |
| Evening wind-down | Twenty minutes of something soft, no decisions | Relax | `relax-alpha-ease` (B) + pink noise + rain, fade 2 min, 30 min |
| Meditators | A timer with a bell and a bed of sound | Meditate | `meditate-theta-garden` (C) + `himalayan-trio` bowls, bell every 10 min, fade 1 min, 20 min |

### The wedge

Subscription sound apps (Brain.fm, Endel; see `docs/SOTA-COMPARISON.md`) are closed, need an account and sell outcomes. Everyday is free because there is nothing to sell: no account, no server, no data leaves the phone, and it works in airplane mode once installed. That is the whole pitch.

### Honest evidence, without preaching

The grade is information, not a sermon: one pill ("Evidence B") on the running screen, four lines behind it, a link to the lab's Knowledge page. Never contrast ourselves with "apps that lie"; say what we know and stop. House phrase: "labeled, not promised."

### Messaging

| | Lab (root) | Everyday (`/app/`) |
|---|---|---|
| Headline | The brainwave-audio lab that grades its own claims | Sleep, focus, relax, meditate. One tap. |
| Subline | Binaural, monaural, isochronic sessions, blinded self-experiments, a graded research archive | Free, offline, no account, no tracking. Evidence grade on every sound. |
| Proof | 760+ tests, bit-exact renders, WHO-ITU H.870 dose meter, MIT | Same engine and safety rails as the lab; 20-second recording; Lighthouse ≥ 95 |

### Launch checklist (store-less PWA)

| Step | Detail |
|---|---|
| Recording | 20 s, 390×844, dark theme: open → tap Sleep → advisory → ring breathing → "Fade & stop". No voice, no music. MP4 + GIF via ffmpeg. |
| r/opensource, r/coolgithubprojects, r/SideProject | Lead with "MIT, no server, no telemetry"; repo link first. |
| r/binauralbeats | Lead with the grade pill and the dose meter; answer grade disputes with the citations in `src/data/presets.ts`. |
| r/audiomeditation | **Tool** flair; mention only the bowl sets and the interval bell. |
| r/InternetIsBeautiful | 90/10 rule: this is the one self-post; no cross-posting that week. |
| Product Hunt | "Sleep, focus, relax, meditate — free, offline, graded." First comment explains the grades. |
| alternativeto.net, awesome-pwa, awesome-web-audio | Feature list only; no outcome language. |
| GitHub | Release tag, social-preview image, topics `pwa`, `web-audio`, `binaural-beats`, `sleep-sounds`. |

### What not to claim

No "improves sleep", "boosts focus", "reduces anxiety", "treats" anything; no "scientifically proven"; no banned phrase; no medical, insomnia, ADHD or infant-health claims; no numbers absent from a preset's `rationale`. Allowed: the grade letter, "relaxation before sleep (B)", "calm alertness (C)", descriptions of sound.

---

## 2. UX

### Information architecture

```
#/           Play      four intent cards → running view
#/sounds     Sounds    noise · nature · bowls · bell · three level sliders
#/settings   Settings  cap · fade · infant mode · theme · install · lab link · About
#/about      About     version · credits · one-line safety notes · "read full"
```

Bottom tab bar (Play, Sounds, Settings); About opens from Settings. No drawer, palette or shortcuts overlay.

### First-run flow (≤ 2 taps to audio)

1. Tap an intent card. `start()` returns false and raises `advisoryOpen` + `advisoryPendingStart` because `open-sync:advisory-ack.v2` is empty.
2. Compact advisory sheet: four lines (headphones at a comfortable level; never while driving; not with a seizure history; never on an infant without infant mode) and one button, "I understand", which calls `acknowledgeAdvisory({ andStart: true })` inside the same gesture.
3. Returning users skip step 2: one tap.

### Play screen states

```
idle ──tap card──▶ (no ack) advisory ──accept──▶ running ◀──resume── paused
  ▲                     │ dismiss                  │  pause ──────────▲
  │◀────────────────────┘                          │ "Fade & stop" / limit reached
  │                                                ▼
  └──────────── stopped ◀── fade-done ◀──────── fading (ring dims, chip "Fading")
Refused (cap, infant rule, no Web Audio): stays idle, one-line reason from `startBlocked`.
OS interruption: running → paused, "Paused by a call" (snapshot `interrupted`).
```

### Micro-copy rules

Every visible string ≤ 12 words; headings ≤ 3 words; sentence case; no exclamation marks; verbs first on buttons; time as "42 min left · ends 23:10"; the grade letter is the only evidence word on Play. Ten labels:

| Where | Label |
|---|---|
| Intent card | Sleep · Brown noise · 45 min |
| Running | 42 min left |
| Running | Ends 23:10 |
| Button | Fade & stop |
| Chip | Bell every 10 min |
| Pill | Evidence B |
| Sheet | Relaxation before sleep. Small, mixed studies. |
| Settings | Session cap |
| Settings | Infant mode: quieter, low-pass, 45 min |
| Error | Audio is off. Tap play to allow sound. |

### Accessibility checklist

- Text contrast ≥ 4.5:1 in both themes, pills and chips checked as text-on-fill.
- Every control is a `<button>` or native input; visible 2 px amber focus ring.
- Ring, press scale and sheet slide honour `prefers-reduced-motion` through `MotionConfig reducedMotion="user"` (as the lab does).
- `aria-label` on icon-only buttons; the ring is `aria-hidden`; remaining time in an `aria-live="polite"` region updated once a minute.
- Duration chips are a `radiogroup`; the tab bar is a `nav` with `aria-current`.
- One-hand reach: play/pause, "Fade & stop" and the tabs in the bottom 40 % of the viewport.
- Touch targets ≥ 48 px; safe-area insets on tab bar and sheets.

### Error and edge states

| State | Behaviour |
|---|---|
| Autoplay blocked | `LiveEngine.start()` already calls `ctx.resume()`; if the context stays suspended show "Audio is off. Tap play to allow sound." and re-issue `start()` from that tap. |
| Cap reached | Chips above `governor.maxSessionMin` disabled with "Cap 60 min · Settings"; live sessions tighten as in the lab. |
| Infant mode | Cards carry an "Infant mode" badge; durations > 45 min hidden; volume clamped to `INFANT_MAX_VOLUME_DB`; bowls and bell stay (they pass the low-pass). |
| Offline | Everything works; About shows "Offline · installed" from `navigator.onLine`. |
| Web Audio unavailable | Play shows the `startBlocked` reason; Sounds and Settings still open. |
| Interrupted by a call | Paused state, "Paused by a call", one-tap resume. |

---

## 3. Visual design

### Palette

| Role | Dark | Light | Notes |
|---|---|---|---|
| Background | `#0B0C0D` (ink-0) | `#F5F2EC` | Brand ink; warm paper |
| Surface / card | `#16191B` (ink-2) | `#FFFFFF` | Cards, sheets |
| Surface raised | `#1D2124` (ink-3) | `#EDE9E1` | Chips, tab bar |
| Line | `#262B2F` | `#D9D4CA` | 1 px hairlines |
| Text primary | `#E9E5DC` | `#141414` | |
| Text secondary | `#A8A399` | `#5A564F` | Verify ≥ 4.5:1 on both grounds |
| Accent (amber) | `#D9A441` | fill `#D9A441`, text `#8A6318` | Amber text fails on paper; use the dark amber |
| Secondary (teal) | `#4F8C82` | `#2F6B62` | Running ring, Focus/Meditate tint |
| Danger | `#C4634F` | `#A2432F` | Refusals only |
| Grade A/B/C/D | `#5FA98C` / `#A9B368` / `#D9A441` / `#C4634F` | same | Ink text on fill; D is the borderline pair, darken to `#B2523E` if it fails |

Tokens live in `src/everyday/theme.css` under `:root` (dark) and `[data-theme="light"]`; `prefers-color-scheme` picks the default, the Settings override sets the attribute.

### Type scale (Inter variable, self-hosted)

| Token | Size / line | Weight | Use |
|---|---|---|---|
| display | 40 / 44 | 600 | Remaining time |
| title | 24 / 30 | 600 | Screen title |
| card | 18 / 24 | 600 | Intent names |
| body | 16 / 24 | 400 | Everything else |
| chip | 14 / 20 | 500 | Chips, tabs |
| caption | 13 / 18 | 400 | End clock, evidence sheet |

Tabular figures on all times.

### Spacing, radius, elevation

8-pt grid: 8 / 16 / 24 / 32 / 48. Radius: cards 20 px, chips 999 px, sheets 24 px top, buttons 16 px. Elevation: none in dark (surface steps only); light uses one shadow `0 1px 2px rgb(20 20 20 / 0.06)`. Max width 520 px centred on desktop; 16 px gutters; tab bar 56 px + `env(safe-area-inset-bottom)`.

### Breathing ring

Circle 208 px, 2 px stroke in the intent tint, inner fill at 12 % alpha. Loop: scale 1.00 → 1.08 over 4 s, back over 4 s, `easeInOut`, forever. `animate` is driven from `running && !paused`, so pausing freezes it in place and resuming continues from the current scale. Fading: stroke alpha eases to 0 over `fadeEndsAtSec − elapsedSec`. Reduced motion: no scale, a 1 s opacity pulse 0.7 → 1.0. Press feedback: scale 0.96 for 120 ms.

### Iconography (Lucide)

Sleep `Moon` · Focus `Focus` · Relax `Leaf` · Meditate `Flower2` · Play `CirclePlay` · Sounds `Waves` · Settings `SlidersHorizontal` · bell `Bell` · volume `Volume2` · fade `ArrowDownToLine` · evidence `Info`. 24 px, 1.75 stroke, one colour.

### Imagery and icon

No stock images. Idle Play is the four cards on the plain ground; each card has a CSS radial gradient (intent tint 18 % → 0 %), nothing loaded. The app icon reuses `public/icons/icon-512.png` and `icon-512-maskable.png`; the Everyday manifest points at a variant with a teal ring under the same mark (`public/app/icons/`), rendered by `scripts/render-icons.py` behind a flag, 80 % safe zone.

### Do / don't

Do: one accent per screen, whitespace over lines, sentence case, tabular numbers. Don't: captions under controls, glow, more than three type sizes per screen, mono type (the lab's voice), pictures of brains or waves.

---

## 4. Engineering

### Architecture

```
app/index.html ─▶ src/everyday/main.tsx
   MotionConfig ▶ HashRouter ▶ SessionProvider (shared) ▶ EverydayShell
      ├─ #/          Play      ─ intents.ts ─▶ session setters ─▶ LiveEngine (shared)
      ├─ #/sounds    Sounds    ─ setNoiseDb / setNature / setBowls / setBellEveryMin
      ├─ #/settings  Settings  ─ setGovernor / setFadeOutSec / theme
      └─ #/about     About
   shared: src/ui/session/*, src/ui/audio/*, src/safety/*, src/engine/*, src/data/presets.ts,
           src/lib/storage.ts, src/docs/vocabulary.ts, public/icons, root sw.js
   not shared: AppShell, routes.ts, shortcuts.ts, features.ts, pages/*, lab component classes
```

### Files to create

| Path | Purpose |
|---|---|
| `app/index.html` | Second entry: own title, `theme-color`, manifest link, `viewport-fit=cover` |
| `src/everyday/main.tsx` | Providers, `HashRouter`, `registerPwa()` |
| `src/everyday/theme.css` | Tokens, `@fontsource-variable/inter`, reset |
| `src/everyday/intents.ts` | Pure: `INTENTS` (preset id, layer mix, duration, icon, four evidence lines), `applyIntent(actions, intent, cap, infant)` |
| `src/everyday/copy.ts` | Every visible string, keyed; the only place copy lives |
| `src/everyday/copyRules.ts` | Pure validators for the copy test |
| `src/everyday/everydayStorage.ts` | Theme override under a new registered key `STORAGE_KEYS.everyday = 'open-sync:everyday.v1'` |
| `src/everyday/screens/{Play,Sounds,Settings,About}.tsx` | Screens |
| `src/everyday/components/{BreathingRing,IntentCard,Sheet,Chip,TabBar,EvidencePill}.tsx` | Components; no non-component exports |
| `src/everyday/__tests__/{intents,copy}.test.ts`, `play.smoke.test.tsx` | See testing |
| `public/app/manifest.webmanifest`, `public/app/icons/*` | Second manifest and icons |
| `e2e/everyday.spec.ts` | Playwright at 390 px |

Config: `vite.config.ts` gains `build.rollupOptions.input = { main: 'index.html', app: 'app/index.html' }`; `tailwind.config.js` `content` adds `./app/index.html`; `package.json` adds `@fontsource-variable/inter` and a size script.

### Shared state

- One front-panel blob per origin (`open-sync:front-panel.v2`). An intent writes through the setters: `loadPreset(getPresetById(id))` (carrier, beat, phases, name, grade), then `setLimitMin`, `setNoiseDb`/`setNoiseOn`, `setNature`, `setBowls(bowlSetToLayers(set))`, `setBellEveryMin`, `setFadeOutSec`. The lab shows that state next time it opens; About says "Shares its setup with the lab".
- `loadPreset` keeps at most 8 phases and does not set the limit, so `applyIntent` sets it explicitly to `min(duration, cap)` (45 under infant mode); the intents test checks this.
- Cap (`governor.maxSessionMin`, 5 min – 24 h), infant mode, the advisory acknowledgment and the dose log are the same objects. `start()` stays the only enforcement point; Everyday never touches the engine directly and shows dose only as a refusal reason.

### PWA

- Static `public/app/manifest.webmanifest` with `id`, `scope` and `start_url` all `/brainwave_opensync/app/`, `display: standalone`, own name and icons. A different scope makes it a separate install; `VitePWA` keeps generating the root manifest.
- One root-scope service worker. The existing `globPatterns` (`**/*.{js,css,html,svg,png,json,woff2}`) precaches `app/index.html`, its chunks and the font once the entry exists.
- `navigateFallback` is the lab's `index.html`. A navigation to `/brainwave_opensync/app/` matches the precached `app/index.html` (directory index) and never reaches the fallback; `/app` without the slash is a Pages 301. Always link with the slash. Hash routes need no shells; `scripts/emit-route-shells.mjs` is untouched.
- `registerPwa()` is reused; the update chip becomes one row in Settings.

### Performance budget

Lab initial JS today: `index` 146 + `vendor` 17 + `motion` 42 + `icons` 5 ≈ 210 kB gz. Everyday: ≤ 180 kB gz initial JS, first paint < 1.5 s on a mid-range Android, no route chunks. Levers: framer-motion through `LazyMotion` + `domAnimation` + `m.*` (roughly 40 % of the full bundle), named Lucide imports, `getPresetById` only (no preset UI), Inter woff2 preloaded with `font-display: swap`. `scripts/check-size.mjs` gzips the app entry and its static imports from the Vite manifest and fails above 180 kB; wired into `npm run check`.

### Testing

| Suite | Env | Checks |
|---|---|---|
| `intents.test.ts` | node | Every intent references an existing preset id and grade, a `BOWL_SETS` id or null, a `NatureKind` or null, a bell from `BELL_CHOICES`, a fade from `FADE_OUT_CHOICES`; `applyIntent` calls the setters with expected values and clamps to the cap and to 45 min under infant mode |
| `copy.test.ts` | node | Every string in `copy.ts`: ≤ 12 words, headings ≤ 3, no `!`, no `BANNED_PHRASES`, no claim words (`improves`, `boosts`, `treats`, `cures`, `proven`, `heals`) |
| `play.smoke.test.tsx` | happy-dom | Play inside `SessionProvider` after `clearAdvisoryAck()`: tap → sheet → accept → `running`; chips above the cap disabled; fake AudioContext from `live-engine-v2.test.ts` |
| `everyday.spec.ts` | Playwright, 390×844 | Tab bar visible, two-tap start, reduced-motion emulation freezes the ring, Lighthouse CLI on built `dist/app/` |

### CI and deploy

Same `ci.yml` (`npm run check` now includes the size gate) and same `pages.yml`: `dist/app/` lands on `gh-pages` with the rest. Add `https://occult-kranti.github.io/brainwave_opensync/app/` to `public/sitemap.xml` at priority 0.9. Playwright runs as a separate job so the unit suite stays near 25 s.

### Risks

| Risk | Mitigation |
|---|---|
| Autoplay: audio must start inside a gesture | Advisory accept calls `acknowledgeAdvisory({ andStart: true })` synchronously; no `await` before `start()` |
| iOS audio session (silent switch, background suspend) | Shared `MediaSessionBridge` keep-alive applies; About mentions the ring switch; test Safari 17+ |
| Background-tab throttling drifts the 1 s clock | Provider clock reads wall time; verify drift < 2 s after 10 min in background on Android Chrome |
| Shared persisted state surprises lab users | One line in both Abouts; lab RESET restores defaults; Everyday never edits phases beyond the preset |
| Bundle creep | Size gate in CI; `LazyMotion`; no catalog UI |
| Two manifests, one SW | Chromium keys installs by manifest `id`; verify Safari install; fall back to an "Add to Home Screen" hint |

---

## 5. Documentation

**README section** ("Open Sync Everyday", after "What's new"): three sentences (what it is, the URL, that it shares engine, rails and setup with the lab) and a bullet per intent with its grade. Links to this plan and `CHANGELOG.md`.

**In-app About** (`#/about`): version from `package.json`; "Shares its setup with the lab"; credits (React, Vite, Tailwind, framer-motion, Lucide, Inter OFL, Workbox); safety notes one line each with "Read full" opening the lab's `/safety`: headphones at a comfortable level · never while driving · not with a seizure history · infants only in infant mode · in a crisis, 988 (US) or findahelpline.com. Evidence: "Grades A–D come from the lab's preset catalog" linking `/knowledge`.

**CONTRIBUTING note** ("The Everyday entry"): copy lives only in `src/everyday/copy.ts` and is checked by `copy.test.ts`; screens contain no literal strings; to add an intent, add one `INTENTS` entry in `intents.ts` (preset id from `src/data/presets.ts`, layer mix, duration, four evidence lines quoting the preset's `rationale`) plus an icon, and the intents test does the rest; `features.ts` is not used by Everyday; safety rails still only tighten.

**Changelog policy**: one `CHANGELOG.md`; Everyday lines prefixed "Everyday:"; the app version equals the package version; a change to a shared file (provider, engine, governor) is logged once under the lab and referenced from the Everyday line.

**Evidence disclosures** live in `intents.ts` next to the preset id. Sleep: "Relaxation before sleep. Small, mixed studies. Not an insomnia treatment. Grade B." Focus: "Calm alertness. Pooled effects modest and mixed. Grade C." Relax: "Alpha-range relaxation has the most consistent trial support. Grade B." Meditate: "Cultural soundscape, no frequency-specific claim. Grade C." Each ends "Bowls, noise and nature are sound only (D)." with the Knowledge link.

---

## 6. Open-source tools and resources

| Tool | License | Why |
|---|---|---|
| React 19 | MIT | Existing framework; shared provider |
| Vite 7 | MIT | Multi-page build, one config, Pages base handling |
| Tailwind 3 | MIT | Utilities only; tokens in plain CSS |
| framer-motion (`LazyMotion`) | MIT | Ring, press feedback, reduced motion |
| lucide-react | ISC | Icons, tree-shaken |
| @fontsource-variable/inter | MIT package, OFL 1.1 font | Self-hosted Inter; no Google Fonts request |
| vite-plugin-pwa / Workbox | MIT | Root SW, precache, runtime caches |
| vitest 4 + happy-dom | MIT | Unit and DOM suites |
| Playwright | Apache-2.0 | 390 px flows, reduced-motion emulation |
| Lighthouse CLI | Apache-2.0 | PWA and accessibility gate |
| Radix Colors | MIT | Reference scales for the light palette |
| WebAIM contrast checker | Free web tool | Verify every palette pair |
| Squoosh, oxipng | Apache-2.0, MIT | Icon and social image compression |
| ffmpeg | LGPL/GPL (tool only) | The 20-second recording |
| GitHub Pages + Actions | Free for public repos | Same deploy path as the lab |

---

## 7. Roadmap

**v1 (this release).** Play, Sounds, Settings, About; four intents; advisory sheet; breathing ring; duration chips; layer toggles; bell chip; fade & stop; evidence pill; dark/light; installable; offline; copy contract; size gate; Playwright; README, CONTRIBUTING and CHANGELOG updates.

**v1.1.** Breath pacer on the ring (a "Breathe" chip with 4-4, 4-6 and 5-5 patterns using the engine's breath cue, no effect claim); session history read from the shared dose log as a 7-day list ("Sleep · 45 min · Tue"); a "Same as last time" card on Play.

**v1.2.** Manifest `shortcuts` (Sleep, Focus, Relax, Meditate → `#/?intent=`) so long-press on the icon starts an intent; Web Share of a lab share link ("Open in the lab") from Settings; per-intent duration memory.

**Stays lab-only.** Carrier and beat editing, phase timelines, analyzer, export, preview catalog, experiments, research modules, dose gauge detail, panic rehearsal, keyboard shortcuts, custom bowls beyond the five sets.

---

## 8. Success criteria (no telemetry)

- Qualitative: five people outside the project reach audio in ≤ 2 taps without help; nobody asks what the Play screen means; the evidence sheet is called "useful", never "a lecture".
- Lighthouse on `dist/app/` (mobile, throttled): installable, Accessibility ≥ 95, Performance ≥ 90, Best Practices ≥ 95; first paint < 1.5 s under Lighthouse's default mobile profile.
- Size gate green on every push.
- GitHub: stars and issues trend after launch week; an Evidence-challenge issue about an Everyday grade counts as success.
- Reddit: no comment corrects an effect claim; the "no account, offline" line is what gets quoted.
- Safety: zero reports of audio above the cap, of infant mode without the low-pass, or of sound after "Fade & stop".

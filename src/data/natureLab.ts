/**
 * Nature Calls Lab — animal-call acoustics, plant bioacoustics, soundscape
 * health, and the Dolbear thermometer math.
 *
 * Discipline (same as the other labs):
 *  - call parameters come from measured acoustics (audiograms, spectrogram
 *    analyses) — every card states its band in Hz and its source;
 *  - synthesized presets are APPROXIMATIONS in the documented band, never
 *    recordings and never "species language" — a tone at a call's frequency is
 *    not the call;
 *  - playback ethics are load-bearing: broadcasting calls at wild animals can
 *    stress them, draw predators, or disrupt nesting. Field playback guidance
 *    is restrictive on purpose.
 *  - plants: airborne ultrasound emissions and vibration responses are real
 *    2014–2023 science; audio portraits of them carry the usual dual grade.
 */

import type { Grade } from './frequencies';
import type { Preset } from './presets';
import { CLEAN_PRESET_MIX } from './presetMix';

type PresetSpec = Omit<Preset, 'dose' | 'art' | 'purpose' | 'links'> & { purpose: string };

// ---------------------------------------------------------------------------
// 1. Species cards — hearing, repertoire, meaning, observation protocol
// ---------------------------------------------------------------------------

export interface SpeciesCall {
  name: string;
  /** Measured band, Hz or kHz. */
  band: string;
  /** What the call is for (documented function). */
  meaning: string;
}

export interface SpeciesCard {
  id: string;
  species: string;
  hearing: string;
  calls: SpeciesCall[];
  observe: string;
  headline: string;
  grade: Grade;
  source: string;
}

export const SPECIES_CARDS: readonly SpeciesCard[] = [
  {
    id: 'species-cat',
    species: 'Domestic cat (Felis catus)',
    hearing: '48 Hz – 85 kHz at 70 dB SPL — one of the broadest mammal audiograms; most sensitive around 8 kHz.',
    calls: [
      { name: 'Purr', band: '25–30 Hz fundamental (self-oscillating larynx, both inhale and exhale)', meaning: 'Contentment — but also nursing, fear, illness; context decides.' },
      { name: 'Solicitation purr', band: 'purr + embedded cry band 220–520 Hz (mean ~380 Hz)', meaning: 'Food request aimed at humans; rated more urgent and less pleasant (McComb 2009).' },
      { name: 'Meow', band: 'F0 ≈ 400–600 Hz (breed/context variation; Siamese to ~800 Hz)', meaning: 'Directed mostly at humans; contour carries intent (rising = request).' },
    ],
    observe: 'Indoor: notice purr rate as a slow rumble you feel. Outdoor: dawn/dusk activity peaks. Never approach or feed unknown animals.',
    headline: 'Cats hear to ~85 kHz and purr at 25–30 Hz; the food purr hides a ~380 Hz cry.',
    grade: 'A',
    source: 'Heffner & Heffner 1985, Hear Res 19:85–88; Herbst et al. 2023, Curr Biol (larynx 25–30 Hz); McComb et al. 2009, Curr Biol; Schötz 2019 (meow F0)',
  },
  {
    id: 'species-sparrow',
    species: 'House sparrow (Passer domesticus)',
    hearing: 'Small-songbird typical: roughly 0.5–8 kHz best sensitivity (species-level audiograms vary).',
    calls: [
      { name: 'Chirp / chirrup', band: '≈3–4.5 kHz, short 50–100 ms notes', meaning: 'Contact and flock cohesion; the everyday street-sparrow sound.' },
      { name: 'Urban shift', band: 'minimum song frequency rises ~0.5–1 kHz in city noise', meaning: 'Lombard-style pitch shift to be heard over low-frequency traffic rumble (Nemeth & Brumm).' },
      { name: 'Alarm chatter', band: 'rapid broadband chatter 2–6 kHz', meaning: 'Mobbing and predator alert.' },
    ],
    observe: 'Morning flock chatter at feeders. Listen for the pitch floor — city sparrows sit higher than country ones.',
    headline: 'Sparrow chirps live around 3–4.5 kHz; city birds pitch up to cut through traffic noise.',
    grade: 'B',
    source: 'Nemeth & Brumm 2010 (urban pitch shift); standard passerine bioacoustics (chirp band measured on public spectrograms)',
  },
  {
    id: 'species-bluejay',
    species: 'Blue jay (Cyanocitta cristata)',
    hearing: 'Songbird-typical midrange sensitivity; strong discrimination in the 1–4 kHz band.',
    calls: [
      { name: 'Jeer', band: 'harsh broadband ≈1.5–3.5 kHz, ~0.5 s, repeated', meaning: 'Alarm and territorial broadcast; the loud classic.' },
      { name: 'Hawk mimicry', band: 'copies red-shouldered hawk at 2–3 kHz and broad-winged hawk at 4–4.5 kHz', meaning: 'Documented imitation (James 1988) — possibly to clear feeders or announce real predators.' },
      { name: 'Toolool / bell notes', band: 'softer whistled 1–2.5 kHz', meaning: 'Close-contact pair communication.' },
    ],
    observe: 'Watch the crest and listen for context: jeers travel far, toolool notes stay close. If a "hawk" calls from a feeder with no hawk in sight — check twice.',
    headline: 'The jeer runs ~1.5–3.5 kHz, and blue jays are documented hawk mimics at 2–4.5 kHz.',
    grade: 'B',
    source: 'James 1988, Ontario Birds (mimicry spectrograms); standard corvid bioacoustics references',
  },
  {
    id: 'species-squirrel',
    species: 'Eastern gray squirrel (Sciurus carolinensis)',
    hearing: 'Rodent-typical: sensitive from low kHz into ultrasound; alarm energy is well inside human range.',
    calls: [
      { name: 'Kuk', band: 'broadband, dominant 2–5 kHz (energy 0.5–16 kHz), <0.15 s', meaning: 'Alarm series opener; short sharp barks.' },
      { name: 'Quaa', band: 'same 2–5 kHz band, >0.15 s, often modulated', meaning: 'Longer alarm note; duration carries urgency.' },
      { name: 'Moan', band: 'narrow harmonic bands (~1–3 kHz) fading out', meaning: 'Lower-grade alert; tail-flagging often pairs with all three (multimodal alarm).' },
    ],
    observe: 'Alarm bouts at parks: kuks first, quaas if the threat persists, moans as it fades. The tail is part of the signal — watch it.',
    headline: 'Squirrel alarms are broadband barks at 2–5 kHz: short kuks, longer quaas, fading moans.',
    grade: 'A',
    source: 'Lishak 1984, JSTOR (alarm vocalization acoustics); Partan thesis (predator-specific multimodal alarms)',
  },
];

// ---------------------------------------------------------------------------
// 2. Playback ethics — restrictive on purpose
// ---------------------------------------------------------------------------

export const PLAYBACK_ETHICS: readonly string[] = [
  'Never broadcast calls at nests, dens, or roosts — playback can draw predators and stress parents.',
  'Keep any field playback under ~30 seconds and stop the moment an animal reacts; agitation means stop.',
  'Never use playback with endangered or protected species; many jurisdictions restrict it outright.',
  'Pets: watch body language — flattened ears, tucked tail or freezing means the sound is unwelcome.',
  'These presets are for learning the bands and meanings; listening beats broadcasting.',
];

// ---------------------------------------------------------------------------
// 3. Research rows — plants, insects, soundscapes, the thermometer math
// ---------------------------------------------------------------------------

export interface NatureStudy {
  id: string;
  name: string;
  finding: string;
  numbers: string;
  headline: string;
  grade: Grade;
  source: string;
}

export const NATURE_STUDIES: readonly NatureStudy[] = [
  {
    id: 'nature-plants-ultrasound',
    name: 'Stressed plants emit airborne ultrasound (Khait 2023, Cell)',
    finding: 'Drought-stressed or cut tomato and tobacco plants emit ultrasonic clicks; classifiers separated stress type from the sound alone.',
    numbers: '20–100 kHz clicks; ~30–50 clicks/hour stressed vs ~1/hour healthy; above human hearing.',
    headline: 'Tomatoes under drought stress click ultrasonically ~30–50× per hour.',
    grade: 'A',
    source: 'Khait et al. 2023, Cell 186(7):1328–1336 (Hadany lab, Tel Aviv)',
  },
  {
    id: 'nature-caterpillar-vibration',
    name: 'Plants hear being eaten (Appel & Cocroft 2014)',
    finding: 'Arabidopsis exposed to caterpillar-chewing vibrations mounted chemical defenses — and distinguished chewing from wind or insect-song vibrations.',
    numbers: 'Vibration-specific response; mustard-oil defenses up on chewing playback only.',
    headline: 'Thale cress hears chewing vibrations and answers with mustard oil.',
    grade: 'A',
    source: 'Appel & Cocroft 2014, Oecologia 175:1257–1266',
  },
  {
    id: 'nature-bee-nectar',
    name: 'Flowers respond to bee buzz with sweeter nectar (Veits 2019)',
    finding: 'Evening primrose petals exposed to bee flight-sound frequencies produced nectar with higher sugar concentration within minutes; the petals act as the hearing organ.',
    numbers: 'Response to ~0.2–0.5 kHz bee-band vibration; sugar concentration measurably up in 3 minutes.',
    headline: 'A flower sweetens its nectar within minutes of hearing bee-wing frequencies.',
    grade: 'B',
    source: 'Veits et al. 2019, Ecology Letters 22(9):1483–1492',
  },
  {
    id: 'nature-buzz-pollination',
    name: 'Buzz pollination (floral sonication)',
    finding: 'Bumblebees vibrate flight muscles while gripping flowers, shaking pollen loose — a behavior flowers like tomato and blueberry effectively require.',
    numbers: 'Sonication buzzes cluster around ~300–400 Hz (species- and size-dependent).',
    headline: 'A bumblebee\'s ~350 Hz buzz is the key that opens tomato flowers.',
    grade: 'B',
    source: 'Buzz-pollination literature (Buchmann; Vallejo-Marín): sonication in the ~300–400 Hz band',
  },
  {
    id: 'nature-dolbear-law',
    name: 'Dolbear\'s law — the cricket thermometer (1897; Brooks 1881)',
    finding: 'Snowy tree-cricket chirp rate tracks air temperature nearly linearly; the U.S. National Weather Service still publishes a chirp-to-temperature converter.',
    numbers: '°F ≈ chirps in 15 s + 40 (valid ~55–100 °F); °C ≈ chirps in 25 s ÷ 3 + 4. Credit line: Margarette W. Brooks published the observation in 1881, Dolbear in 1897.',
    headline: 'Count cricket chirps for 15 seconds, add 40 — that\'s the temperature in °F.',
    grade: 'A',
    source: 'Dolbear 1897, Am. Naturalist ("The Cricket as a Thermometer"); Brooks 1881, Pop. Sci. Monthly; NOAA/NWS converter',
  },
  {
    id: 'nature-soundscape-health',
    name: 'Natural soundscapes improve health markers (Buxton 2021, PNAS)',
    finding: 'Systematic review + meta-analysis of natural-sound exposure across hospitals, offices and parks: less stress and annoyance, better health and positive-affect outcomes.',
    numbers: '36 publications; meta of 18: stress/annoyance g = −0.60 (95% CI −0.97…−0.23), positive outcomes g = 1.63.',
    headline: 'Nature soundscapes beat noise for stress — the largest honest effect in this field.',
    grade: 'B',
    source: 'Buxton et al. 2021, PNAS 118(14):e2013097118',
  },
];

// ---------------------------------------------------------------------------
// 4. Dolbear math canon
// ---------------------------------------------------------------------------

/** °F from chirps counted in 15 s (Dolbear/Brooks, snowy tree cricket). */
export const dolbearF = (chirps15s: number): number => chirps15s + 40;
/** Chirps per second expected at a given °F. */
export const dolbearRateHz = (tempF: number): number => ((tempF - 40) * 4) / 60;
/** Validity band per the field literature. */
export const DOLBEAR_VALID_F = { min: 55, max: 100 } as const;
/** Snowy tree cricket chirp carrier band (public spectrogram canon). */
export const CRICKET_CARRIER_HZ = 3000;

// ---------------------------------------------------------------------------
// 5. Nature presets — bands documented above, honestly approximated
// ---------------------------------------------------------------------------

export const NATURE_PRESETS: readonly PresetSpec[] = [
  {
    id: 'nature-cat-purr-companion',
    title: 'Cat Purr Companion (25 Hz AM, 20 min)',
    category: 'Relax',
    purpose: 'Use case: the measured cat-purr rate (25 Hz) as a slow rumble envelope — a calm-reading companion.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'purr-bed', durationSec: 1200, carrierHz: 110, beatHz: 25, mode: 'monaural', gainDbFs: -18, rampSec: 60 },
      ],
    },
    grade: 'C',
    rationale:
      'A 25 Hz amplitude envelope on a low carrier — the measured self-oscillation rate of the cat larynx (25–30 Hz, ' +
      'Herbst 2023). "Purr frequencies heal bone" claims (25/50/100 Hz lists) come from a conference-proceedings ' +
      'proposition, never a controlled trial — treat this as a comfort ritual, not therapy. Best on speakers you can ' +
      'feel faintly.',
    citations: ['Herbst et al. 2023, Curr Biol (25–30 Hz larynx)', 'von Muggenthaler 2001 (proceedings; uncontrolled)'],
  },
  {
    id: 'nature-sparrow-band',
    title: 'Sparrow Chirp Band (education, 10 min) — experimental tier',
    category: 'Experimental',
    purpose: 'Use case: hear where the house sparrow lives — a chirp-rate pulse train in the 3–4.5 kHz band.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'country-band', durationSec: 300, carrierHz: 3200, beatHz: 6, mode: 'isochronic', gainDbFs: -20, rampSec: 30 },
        { name: 'city-shift', durationSec: 300, carrierHz: 4000, beatHz: 6, mode: 'isochronic', gainDbFs: -20, rampSec: 30 },
      ],
    },
    grade: 'D',
    rationale:
      'A synthesized pulse train approximating the sparrow chirp band (measured ~3–4.5 kHz), then the same train pitched ' +
      'up 0.8 kHz — the documented urban noise shift (Nemeth & Brumm), placed at the top of this app\'s isochronic domain ' +
      '(4 kHz ceiling). A tone train is NOT a chirp (no FM structure, no syringeal texture); this is band education for ' +
      'your ears, not a call to play at birds. Playback ethics apply (see the ethics card).',
    citations: ['Nemeth & Brumm 2010 (urban pitch shift)', 'Passerine chirp-band spectrogram canon (~3–4.5 kHz)'],
  },
  {
    id: 'nature-bluejay-jeer',
    title: 'Blue Jay Jeer Band (education, 8 min) — experimental tier',
    category: 'Experimental',
    purpose: 'Use case: learn the jeer band (~2.5 kHz) and the hawk-mimicry band (2–4.5 kHz) by ear.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'jeer-band', durationSec: 240, carrierHz: 2500, beatHz: 1.1, mode: 'isochronic', gainDbFs: -22, rampSec: 20 },
        { name: 'hawk-mimic-band', durationSec: 240, carrierHz: 3200, beatHz: 1.1, mode: 'isochronic', gainDbFs: -24, rampSec: 20 },
      ],
    },
    grade: 'D',
    rationale:
      'Slow-spaced pulses in the jeer band, then the hawk-mimicry band (James 1988: jays copy red-shouldered hawks at ' +
      '2–3 kHz and broad-winged hawks at 4–4.5 kHz). The harshness and FM sweep of a real jeer are beyond a tone ' +
      'engine — approximation for ear training, indoors, at low level.',
    citations: ['James 1988, Ontario Birds 6(1) (mimicry spectrograms, 2–4.5 kHz)'],
  },
  {
    id: 'nature-squirrel-alarm',
    title: 'Squirrel Alarm Bands (education, 10 min) — experimental tier',
    category: 'Experimental',
    purpose: 'Use case: tell kuk from quaa by ear — short fast pulses vs longer slow ones in the 3–4 kHz band.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'kuk-style', durationSec: 300, carrierHz: 3800, beatHz: 8, mode: 'isochronic', gainDbFs: -24, rampSec: 20 },
        { name: 'quaa-style', durationSec: 300, carrierHz: 3400, beatHz: 2.5, mode: 'isochronic', gainDbFs: -24, rampSec: 20 },
      ],
    },
    grade: 'D',
    rationale:
      'Lishak (1984) measured gray-squirrel alarm energy concentrated at 3–6 kHz, kuks under 0.15 s, quaas longer and ' +
      'often frequency-modulated. Two pulse trains capture duration/rate difference only — real calls are broadband ' +
      'barks. Ear training; never broadcast at wildlife.',
    citations: ['Lishak 1984 (kuk/quaa/moan acoustics)', 'Partan thesis (multimodal alarm)'],
  },
  {
    id: 'nature-plant-clicks-portrait',
    title: 'Plant Ultrasound Portrait (20–100 kHz) — experimental tier',
    category: 'Experimental',
    purpose: 'Use case: the tomato-plant stress clicks, octaved into hearing — a portrait of 2023\'s strangest good science.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'click-band-low-20khz', durationSec: 240, carrierHz: 78.13, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'click-band-mid-50khz', durationSec: 240, carrierHz: 195.31, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'click-band-top-100khz', durationSec: 240, carrierHz: 195.31, beatHz: 0.8, mode: 'isochronic', gainDbFs: -18, rampSec: 20 },
      ],
    },
    grade: 'D',
    rationale:
      'Khait 2023 (Cell): drought-stressed tomato/tobacco plants emit 20–100 kHz airborne clicks, ~30–50/hour vs ~1/hour ' +
      'healthy. Portraits: 20 kHz ×2⁻⁸ = 78.13 Hz, 50 kHz ×2⁻⁸ = 195.31 Hz; the third phase pulses that tone at ~0.8/s — ' +
      'the stressed-click rate accelerated 60× so it is audible as a rhythm (rate arithmetic stated, not resampled ' +
      'recordings). Arithmetic A; meaning D.',
    citations: ['Khait et al. 2023, Cell 186(7):1328–1336'],
  },
  {
    id: 'nature-bee-buzz-portrait',
    title: 'Bee Buzz Portrait (~350 Hz, 15 min) — experimental tier',
    category: 'Experimental',
    purpose: 'Use case: the buzz-pollination band as a listening portrait — the frequency flowers answer with sugar.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'flight-buzz', durationSec: 450, carrierHz: 350, beatHz: 0, gainDbFs: -16, rampSec: 30 },
        { name: 'sonication-band', durationSec: 450, carrierHz: 350, beatHz: 12, mode: 'isochronic', gainDbFs: -18, rampSec: 30 },
      ],
    },
    grade: 'D',
    rationale:
      'Veits 2019: evening-primrose petals exposed to bee-band vibration (~0.2–0.5 kHz) raised nectar sugar within ' +
      'minutes; buzz pollination sonication clusters near ~350 Hz. The first phase is the plain band tone; the second ' +
      'adds a wingbeat-rate envelope (~12 Hz). Plants respond to vibration through their tissue — a speaker in your ' +
      'room is not a bee on a flower, and no garden outcome is claimed.',
    citations: ['Veits et al. 2019, Ecology Letters 22(9)', 'Buzz-pollination sonication literature (~300–400 Hz)'],
  },
  {
    id: 'nature-dolbear-cricket',
    title: 'Dolbear Cricket — 70 °F reference (15 min) — experimental tier',
    category: 'Experimental',
    purpose: 'Use case: a reference chirp rate for the cricket thermometer — 2.0 chirps/s means ~70 °F.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'cricket-70f', durationSec: 900, carrierHz: 3000, beatHz: 2, mode: 'isochronic', gainDbFs: -26, rampSec: 30 },
      ],
    },
    grade: 'C',
    rationale:
      'Dolbear\'s law (Brooks 1881; Dolbear 1897): °F ≈ chirps in 15 s + 40, so 70 °F ↔ 2.0 chirps/s — the rate this ' +
      'preset holds in the snowy-tree-cricket band (~3 kHz). Compare it against real crickets on a summer night and run ' +
      'the page\'s thermometer widget backward. The math is grade A as an approximation (valid ~55–100 °F); this tone ' +
      'is the reference, not a synthetic cricket.',
    citations: ['Dolbear 1897, Am. Naturalist; Brooks 1881', 'NOAA/NWS chirp converter (gov resource)'],
  },
  {
    id: 'nature-stream-soundscape',
    title: 'Stream Soundscape Bed (30 min, beat-free)',
    category: 'Relax',
    purpose: 'Use case: a beat-free water-and-texture soundscape — the natural-sound evidence base, made of layers.',
    spec: {
      autoShutoff: true,
      mix: { ...CLEAN_PRESET_MIX, nature: { on: true, kind: 'stream', db: -26 }, noiseOn: true, noiseDb: { brown: -30 } },
      phases: [{ name: 'stream', durationSec: 1800, carrierHz: 140, beatHz: 0, gainDbFs: -26 }],
    },
    grade: 'B',
    rationale:
      'Natural soundscapes carry the strongest evidence in this domain: Buxton 2021 (PNAS, 36 studies) found reduced ' +
      'stress/annoyance (g = −0.60) and improved positive-affect outcomes. This bed is synthesized layers, not a field ' +
      'recording — the meta-analysis studied real soundscapes, so grade it one notch below and say so.',
    citations: ['Buxton et al. 2021, PNAS 118(14):e2013097118', 'Longman et al. 2025, Sci Rep (forest vs industrial noise)'],
  },
];

// ---------------------------------------------------------------------------
// 6. Hypotheses — nature edition
// ---------------------------------------------------------------------------

export interface NatureHypothesis {
  id: string;
  presetId: string;
  title: string;
  headline: string;
  statement: string;
  prediction: string;
  homeTest: string;
  prior: string;
  grade: Grade;
  citations: string[];
}

export const NATURE_HYPOTHESES: readonly NatureHypothesis[] = [
  {
    id: 'hyp-purr-companion-calm',
    presetId: 'nature-cat-purr-companion',
    title: 'Purr-rate envelope as a calm companion',
    headline: 'Does a 25 Hz rumble feel calmer than silence while reading? Prior: small.',
    statement: 'The purr rate is a measured 25–30 Hz self-oscillation; whether an AM envelope at that rate feels calming to humans is untested.',
    prediction: 'Calm ratings (0–10) while reading with the purr bed exceed silent evenings by ~1 point; larger gaps suggest expectancy.',
    homeTest: 'Six reading evenings, alternating purr bed vs silence, randomized; rate calm 0–10 at the end of each.',
    prior: 'Small positive at best; purr-therapy claims are unproven.',
    grade: 'C',
    citations: ['Herbst 2023 (purr biomechanics)', 'von Muggenthaler 2001 (uncontrolled proposition)'],
  },
  {
    id: 'hyp-dolbear-field-check',
    presetId: 'nature-dolbear-cricket',
    title: 'Field-check the cricket thermometer',
    headline: 'Does Dolbear\'s law hold in your yard within ±2 °F? Prior: yes in the valid band.',
    statement: 'The 15-seconds-plus-40 rule is a published approximation for the snowy tree cricket; local accuracy depends on species mix.',
    prediction: 'Chirp-count temperature lands within ±2 °F of a real thermometer on most evenings when chirps are steady.',
    homeTest: 'On three summer evenings: count chirps 15 s ×3, average, add 40; compare with a thermometer at the same spot. Log both.',
    prior: 'High inside 55–100 °F with steady chirpers; low outside it.',
    grade: 'B',
    citations: ['Dolbear 1897; Brooks 1881', 'NOAA/NWS converter documentation'],
  },
  {
    id: 'hyp-call-ear-training',
    presetId: 'nature-squirrel-alarm',
    title: 'Band training transfers to the field',
    headline: 'After ear training, can you tag kuk vs quaa in a real alarm bout? Prior: moderate.',
    statement: 'Synthesized pulse trains teach duration/rate differences (kuk <0.15 s vs quaa >0.15 s), not spectral texture.',
    prediction: 'Two sessions of band training let you correctly label ≥70% of calls in a field-recorded alarm bout.',
    homeTest: 'Listen to the preset twice; then play a real gray-squirrel alarm recording (any public archive) and tag 20 calls kuk/quaa; score against the recording\'s documentation.',
    prior: 'Moderate — duration cues transfer better than texture.',
    grade: 'C',
    citations: ['Lishak 1984 (duration split at 0.15 s)'],
  },
  {
    id: 'hyp-soundscape-vs-tone',
    presetId: 'nature-stream-soundscape',
    title: 'Soundscape bed vs plain tone for evening calm',
    headline: 'Does the layered soundscape beat a plain tone for evening calm? Prior: yes, small.',
    statement: 'Meta-analytic support exists for natural soundscapes (Buxton 2021); a synthesized approximation should keep part of the benefit if texture is the active ingredient.',
    prediction: 'Evening calm ratings with the stream bed exceed the 432 Drift tone by ~1 point; a tie says the ritual is the ingredient.',
    homeTest: 'Eight evenings, alternating the two presets blind-ish (have someone load them); rate calm 0–10 after 20 min.',
    prior: 'Small positive for the soundscape.',
    grade: 'C',
    citations: ['Buxton 2021 PNAS (g = −0.60 stress)', 'Longman 2025 Sci Rep'],
  },
];

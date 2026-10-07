/**
 * Healing Sound Lab — research-grade data for the healing-frequencies page.
 *
 * Same claim discipline as lucidLab.ts (see src/docs/vocabulary.ts):
 *  - measured instrument acoustics and clinical session parameters are real
 *    content; "healing frequency" meanings are graded separately;
 *  - vibroacoustic therapy (VAT) and whole-body vibration (WBV) are TACTILE
 *    modalities — airborne audio is an analog, never the studied dose;
 *  - ultrasound / nanoparticle stimulation is portrait-only: an audible octave
 *    of a 1 MHz field shares no physics with the field (energy scales with f);
 *  - occult and historical sources (Pythagoras, Kybalion, Inayat Khan,
 *    Berendt) prescribe intervals and practice, never Hz — stated plainly.
 */

import type { Grade } from './frequencies';
import type { Preset } from './presets';
import { CLEAN_PRESET_MIX } from './presetMix';

type PresetSpec = Omit<Preset, 'dose'>;

// ---------------------------------------------------------------------------
// 1. Evidence table — healing-sound studies with their doses and setups
// ---------------------------------------------------------------------------

export interface HealingStudy {
  id: string;
  name: string;
  setup: string;
  /** Session dose: duration, frequency content, cadence. */
  dose: string;
  outcome: string;
  grade: Grade;
  gradeMinus?: boolean;
  note: string;
  source: string;
}

export const HEALING_STUDIES: readonly HealingStudy[] = [
  {
    id: 'heal-study-goldsby-bowls',
    name: 'Singing-bowl sound meditation (Goldsby 2017)',
    setup: 'Live Tibetan bowls, gongs and bells played while participants (N=62, mean age 49.7) reclined in group sessions at three sites.',
    dose: 'One guided sound-meditation session; effects measured immediately pre/post.',
    outcome: 'Tension, anger, fatigue and depressed mood all fell significantly (P<.001); spiritual well-being rose. Bowl-naïve participants benefited most; pain ratings in the 40–59 group dropped 2.00 → 0.79.',
    grade: 'C',
    note: 'Observational, no control group — the authors say so themselves. A real but early signal; the acoustic physics of bowls are separately well measured (below).',
    source: 'Goldsby et al. 2017, J Evid Based Complementary Altern Med 22(3):401–406, PMC5871151',
  },
  {
    id: 'heal-study-bowl-acoustics',
    name: 'What a bowl actually emits (measured acoustics)',
    setup: 'MIT (Terwagne/Bush) modal analysis of antique bowls; Colombian 1/3-octave band measurements of small/medium/large bowls struck and rubbed.',
    dose: 'Bowl fundamentals span 50–750 Hz (e.g. a (2,0) mode at 188 Hz); measured band peaks: large ≈500 Hz, medium ≈630 Hz, small ≈800 Hz. Frequency scales with rim thickness over radius squared (f ∝ a/R²).',
    outcome: 'Bowls are omnidirectional, harmonic-rich resonators with slow beating between near-degenerate modes — the physics behind the "shimmer".',
    grade: 'A',
    note: 'This is the honest baseline for any bowl product: rich partials and beating, yes; single magic frequencies, no.',
    source: 'Terwagne & Bush, MIT (arXiv bowl acoustics); Ballesteros et al., acoustic characterization of Tibetan bowls (Dialnet 2023)',
  },
  {
    id: 'heal-study-skille-vat',
    name: 'Physioacoustic therapy (Skille protocols)',
    setup: 'Olav Skille\'s low-frequency sound delivered to the BODY via transducers — chairs, beds, mats — not headphones.',
    dose: '30–120 Hz, moderate amplitude; sessions 20–45 min, typically 1–3× per week; single-digit-minute exposures also studied.',
    outcome: 'Decades of clinical use for pain, muscle tension and stress; controlled evidence is promising but heterogeneous.',
    grade: 'C',
    note: 'The modality boundary matters: airborne 40 Hz through a speaker is NOT the studied tactile dose. Our VAT-flavored presets are labeled as audible analogs.',
    source: 'Skille VAT literature; Kantor et al. 2022, BMJ Open scoping review (40 Hz predominant, 20–45 min sessions)',
  },
  {
    id: 'heal-study-naghdi-fibro',
    name: 'Fibromyalgia VAT trial (Naghdi 2015)',
    setup: '23-minute vibroacoustic sessions, 40 Hz tactile, twice weekly for 5 weeks, fibromyalgia patients.',
    dose: '40 Hz · 23 min · 2×/week · 5 weeks (10 sessions).',
    outcome: 'Pain and sleep improved during treatment; 25% of participants discontinued pain medication.',
    grade: 'B',
    gradeMinus: true,
    note: 'Small and modality-specific, but it is a controlled trial with an explicit dose — the reason our audible analog uses exactly 23 minutes.',
    source: 'Naghdi et al. 2015, Pain Res Manag 20(1):e34–e39',
  },
  {
    id: 'heal-study-mosabbir-parkinson',
    name: 'Parkinson\'s VAT randomized trial (Mosabbir 2020)',
    setup: '40 Hz vibroacoustic chair sessions vs no-treatment control in Parkinson\'s disease.',
    dose: '40 Hz · 30 min sessions · 5×/week · 3 weeks.',
    outcome: 'Motor and non-motor symptom scores improved in the treatment arm in this small RCT.',
    grade: 'B',
    gradeMinus: true,
    note: 'Small sample, tactile delivery; replication needed. Not a headphone protocol.',
    source: 'Mosabbir et al. 2020, Can. J. Neurol. Sci. (RCT, 40 Hz VAT)',
  },
  {
    id: 'heal-study-wbv-bone',
    name: 'Whole-body vibration — the 30 Hz bone window',
    setup: 'Standing on vibrating platforms; muscle and bone respond to mechanical oscillation, not sound.',
    dose: 'Clinical range 12.6–45 Hz; Rubin lab\'s window centers on 30 Hz (transmissibility to hip/spine ~80%, dropping sharply above ~33 Hz); typical dosing 20 min/day or 5×/week programs over 6–12 months.',
    outcome: 'Meta-analyses: small bone-density gains (Hedges g = 0.11, 2022; 2026 update: femoral neck/Ward\'s triangle improved, L1–L4 not). Verschueren: hip BMD +0.93% over 6 months at 35–40 Hz.',
    grade: 'B',
    note: 'Real dose-response physics — but it is a platform under your feet, not a tone in your ears. Our 30 Hz analog is body-listening education, not skeletal therapy.',
    source: 'DadeMatthews et al. 2022 meta-analysis; BMC Musculoskelet Disord 2026 updated meta-analysis; Rubin lab (SUNY Stony Brook)',
  },
  {
    id: 'heal-study-cochrane-preop',
    name: 'Music listening for preoperative anxiety (Cochrane)',
    setup: 'Recorded music of the patient\'s or clinician\'s choice before surgery, vs standard care.',
    dose: 'Single listening session pre-surgery; 26 trials, 2,051 participants.',
    outcome: 'Significant anxiety reduction; one large trial (Bringman 2009) found music outperformed midazolam on anxiety, heart rate and blood pressure.',
    grade: 'A',
    gradeMinus: true,
    note: 'The strongest evidence in this entire field is for MUSIC — melody, familiarity, attention — not for any Hz value. Tone-based presets are not this intervention.',
    source: 'Bradt et al. 2013, Cochrane Database Syst Rev CD006908',
  },
  {
    id: 'heal-study-cochrane-cancer',
    name: 'Music interventions in cancer care (Cochrane)',
    setup: 'Music therapy/listening for adults with cancer across treatment settings.',
    dose: '17 trials, 1,381 participants; session lengths varied by protocol.',
    outcome: 'Large anxiety-reducing effect, plus beneficial effects on pain, fatigue and quality of life.',
    grade: 'A',
    gradeMinus: true,
    note: 'Same lesson: active ingredient is music + relationship, not a carrier frequency.',
    source: 'Bradt et al. 2016, Cochrane Database Syst Rev CD006911',
  },
  {
    id: 'heal-study-akimoto-528',
    name: '528 Hz vs 440 Hz acute pilot (Akimoto 2018)',
    setup: 'Nine healthy participants listened to piano tones at 528 Hz and 440 Hz on separate occasions.',
    dose: 'Two 5-minute listening exposures, counterbalanced.',
    outcome: 'Cortisol decreased and oxytocin rose slightly after 528 Hz relative to 440 Hz in this tiny sample.',
    grade: 'C',
    note: 'n=9, single session, unreplicated. Interesting enough to keep the tone available (with blind controls), nowhere near enough to claim "DNA repair".',
    source: 'Akimoto et al. 2018, Health 10:37–46',
  },
  {
    id: 'heal-study-tuning-fork-audit',
    name: 'Tuning-fork therapy (Otto 128 etc.) — evidence audit',
    setup: 'Weighted and unweighted forks at 32–512 Hz applied on or near the body; "Otto 128" is the most-sold therapeutic fork.',
    dose: 'Practitioner sessions 15–60 min; no standardized dose exists.',
    outcome: 'No controlled trials located in the 2026 audit; claims rest on practitioner tradition and VAT-adjacent reasoning.',
    grade: 'D',
    note: 'The fork itself is honest acoustics (a pure tone with a long decay). The therapy claims are folklore-tier until someone runs the trial.',
    source: 'Evidence audit 2026: no peer-reviewed RCTs for therapeutic tuning forks',
  },
];

// ---------------------------------------------------------------------------
// 2. Government / national-program context for healing sound
// ---------------------------------------------------------------------------

export interface HealingGov {
  id: string;
  name: string;
  years: string;
  agency: string;
  record: string;
  recordGrade: Grade;
  claimGrade: Grade;
  source: string;
}

export const HEALING_GOV: readonly HealingGov[] = [
  {
    id: 'heal-gov-nih-vat',
    name: 'NIH Clinical Center vibroacoustic relaxation program',
    years: '1992–present (program record)',
    agency: 'U.S. National Institutes of Health, Rehabilitation Medicine Department',
    record:
      'George Patrick\'s recreation-therapy program at the NIH Clinical Center treated 15,000+ patients with a ' +
      'vibroacoustic relaxation protocol. Program communications report single sessions producing a 33% increase in ' +
      'relaxation measures and 54% reduction across pain/tension/fatigue/nausea/headache/depression symptom scores. ' +
      'These are program-reported aggregates, not a published RCT — graded accordingly.',
    recordGrade: 'C',
    claimGrade: 'C',
    source: 'NIH Clinical Center VAT program (secondary summaries, 2026 audit)',
  },
  {
    id: 'heal-gov-gantt-military',
    name: 'DoD theta-binaural HRV trial (cross-reference)',
    years: '2017',
    agency: 'U.S. military treatment facilities',
    record:
      'N=74 post-deployment service members, theta-band binaural-beat music ≥30 min at bedtime, 3 nights/week for 4 ' +
      'weeks: LF-HRV down, HF-HRV up (p=.01), less self-reported stress. Detailed in the Government File on the Lucid ' +
      'Audio Lab page.',
    recordGrade: 'A',
    claimGrade: 'B',
    source: 'Gantt et al. 2017, J Nurs Scholarsh 49(4):411–420',
  },
  {
    id: 'heal-gov-nccih-music',
    name: 'NCCIH music-therapy evidence synthesis',
    years: 'reviews ongoing',
    agency: 'U.S. National Center for Complementary and Integrative Health',
    record:
      'NCCIH summarizes the Cochrane evidence: music-based interventions show large anxiety-reduction effects in cancer ' +
      'care (17 trials, 1,381 participants) and significant preoperative anxiety reduction (26 trials, 2,051 participants). ' +
      'The federal reading of the evidence is about music, not frequencies.',
    recordGrade: 'A',
    claimGrade: 'B',
    source: 'NCCIH music-therapy summaries; Bradt 2013/2016 Cochrane reviews',
  },
];

// ---------------------------------------------------------------------------
// 3. Ultrasound & nanoparticle portraits — audible octaves of real modalities
// ---------------------------------------------------------------------------

export interface NanoPortrait {
  id: string;
  label: string;
  physicalHz: string;
  octaveN: number;
  toneHz: number;
  context: string;
  citation: string;
}

export const NANO_PORTRAITS: readonly NanoPortrait[] = [
  {
    id: 'nano-sdt-088',
    label: 'SDT low band (porous-silicon NP protocol)',
    physicalHz: '0.88 MHz, 1 W/cm²',
    octaveN: 13,
    toneHz: 107.42,
    context: 'Sonodynamic therapy with porous silicon nanoparticles in melanoma models. Portrait only — cavitation and ROS do not exist at audio energies.',
    citation: 'Nanoparticle-assisted ultrasound review, PMC6420022',
  },
  {
    id: 'nano-sdt-100',
    label: 'BTNP piezoelectric neural stimulation',
    physicalHz: '1.00 MHz, 0.8 W/cm² pulses',
    octaveN: 13,
    toneHz: 122.07,
    context: 'Barium-titanate nanoparticles converting ultrasound to local voltage (Marino 2015 in vitro; Chen 2022 in vivo; Tang 2025 epilepsy suppression, 1 MHz, 0.3–0.6 W/cm²).',
    citation: 'Marino et al. 2015; Chen et al. 2022; Tang et al. 2025, Adv. Mater.',
  },
  {
    id: 'nano-sdt-110',
    label: 'SDT gold-NP protocol',
    physicalHz: '1.10 MHz, 2 W/cm², 3 min',
    octaveN: 13,
    toneHz: 134.28,
    context: 'Gold/protoporphyrin sonosensitizer protocols in colon-carcinoma mouse models.',
    citation: 'PMC6420022, Table 1',
  },
  {
    id: 'nano-hifu-264',
    label: 'SDT high band',
    physicalHz: '2.64 MHz, 2 W/cm²',
    octaveN: 14,
    toneHz: 161.13,
    context: 'Upper sonodynamic band; HIFU proper runs 0.8–3.3 MHz.',
    citation: 'Sonodynamic & acoustically responsive nanodrug review, PMC11566213',
  },
  {
    id: 'nano-menp-50',
    label: 'MENP field rate (no octave needed)',
    physicalHz: '50 Hz, 1.7 kOe AC magnetic field',
    octaveN: 0,
    toneHz: 50,
    context: 'Magnetoelectric nanoparticles sensitize neurons to 50 Hz alternating magnetic fields. The field rate is already audio-range — but a 50 Hz TONE is not a 50 Hz MAGNETIC FIELD; this portrait renders the rate as a quiet AM envelope only.',
    citation: 'Kozielski et al. lineage; Controlling action potentials with MENPs, ScienceDirect 2024',
  },
];

// ---------------------------------------------------------------------------
// 4. Hypothesis ledger — healing edition
// ---------------------------------------------------------------------------

export interface HealingHypothesis {
  id: string;
  presetId: string;
  title: string;
  statement: string;
  prediction: string;
  homeTest: string;
  prior: string;
  grade: Grade;
  citations: string[];
}

export const HEALING_HYPOTHESES: readonly HealingHypothesis[] = [
  {
    id: 'hyp-bowl-synth-parity',
    presetId: 'heal-bowl-session',
    title: 'Synthesized bowls vs recorded bowls',
    statement:
      'Goldsby\'s relaxation effect came from live acoustic bowls. Our bowl engine models the same physics (measured ' +
      'materials, partials, beating) — but synthesized audio lacks room acoustics and air movement.',
    prediction:
      'Post-session tension ratings (0–10) after the synthesized 30-min session will sit between silence and a recorded ' +
      'bowl meditation — closer to recorded if physical modeling captures the active ingredient, closer to silence if ' +
      'room/body coupling is the active ingredient.',
    homeTest:
      'Three evenings, same hour: (a) this preset, (b) a quality bowl recording, (c) quiet rest. Rate tension 0–10 before ' +
      'and after each. Compare deltas.',
    prior: 'Moderate for a real difference vs silence; unknown vs recordings.',
    grade: 'C',
    citations: ['Goldsby et al. 2017 (observational, no control)', 'Terwagne & Bush (bowl physics)'],
  },
  {
    id: 'hyp-vat-analog-dose',
    presetId: 'heal-vat-skille-scan',
    title: 'Audible-analog dose response (20 vs 45 min)',
    statement:
      'Clinical VAT doses run 20–45 min tactile. The audible analog can only test the LISTENING side of that dose curve: ' +
      'does a longer low-frequency scan change body-calm ratings more than a shorter one?',
    prediction: '45 min ≥ 20 min by less than 1 point on a 0–10 body-calm scale. A larger gap would be the interesting anomaly.',
    homeTest:
      'Six sessions across two weeks, alternating 20-min and 45-min versions (set the Studio duration), randomized order, ' +
      'rate body calm 0–10 immediately after.',
    prior: 'Null-to-small. Tactile VAT evidence does not transfer to airborne audio.',
    grade: 'C',
    citations: ['Kantor et al. 2022 BMJ Open (20–45 min VAT session norms)', 'Naghdi 2015 (23-min sessions)'],
  },
  {
    id: 'hyp-wbv-30-steadiness',
    presetId: 'heal-wbv-30-analog',
    title: 'The 30 Hz window as listening texture',
    statement:
      'Rubin\'s 30 Hz window is a body-transmission property of vibrating platforms. An audible 30 Hz AM envelope is a ' +
      'different physical thing; the only honest home endpoint is subjective.',
    prediction: 'No difference in steadiness/grounding ratings between the 30 Hz analog and a 40 Hz control; preference may still differ.',
    homeTest:
      'Blind A/B: this preset vs the VAT 40 Hz analog (a friend loads one), 10 sessions, rate steadiness 0–10 after each.',
    prior: 'Null. Bone-density claims require the platform, full stop.',
    grade: 'C',
    citations: ['Rubin lab transmissibility window (30 Hz, ~80% to spine)', 'DadeMatthews 2022 meta-analysis (g = 0.11)'],
  },
  {
    id: 'hyp-nano-portrait-aesthetic',
    presetId: 'exp-sonodynamic-portrait',
    title: 'Ultrasound portraits — aesthetic only, by construction',
    statement:
      'Sonodynamic and piezo-nanoparticle work happens at 0.88–3.3 MHz and 0.3–2 W/cm² in tissue. Octaving those ' +
      'frequencies down by 2⁻¹³–2⁻¹⁴ preserves nothing but the ratio of the numbers.',
    prediction:
      'Blind preference across the five portrait tones will track pitch preferences, not which clinical protocol each tone ' +
      'portrays. Any therapeutic interpretation is falsified by the energy arithmetic alone.',
    homeTest: 'Listen blind to the five phases in shuffle; rank pleasantness; unblind and compare against the protocol list.',
    prior: 'High for aesthetic-null. This card keeps the NanoLab honesty chain intact.',
    grade: 'D',
    citations: ['PMC11566213 (SDT 0.5–3.0 MHz)', 'Marino 2015 / Tang 2025 (BTNP 1 MHz)'],
  },
  {
    id: 'hyp-fork-128-preference',
    presetId: 'exp-tuning-fork-128',
    title: 'Otto 128 vs its neighbor — preference test',
    statement:
      'The "Otto 128" fork is the most-sold therapeutic tuning fork, with no controlled trials. A 128 Hz tone differs from ' +
      'a 120 Hz tone by about a semitone-plus; any felt difference is detectable blind if it exists at all.',
    prediction: 'Blind preference between 128 and 120 Hz blocks will not exceed chance by a meaningful margin.',
    homeTest: 'This preset already alternates 128/120 Hz blocks for self-blinding; rate warmth 0–10 per block without watching the readout.',
    prior: 'Null; folklore-tier by evidence audit.',
    grade: 'D',
    citations: ['Evidence audit 2026: no peer-reviewed RCTs for therapeutic tuning forks'],
  },
];

// ---------------------------------------------------------------------------
// 5. Healing preset pack — measured acoustics, clinical doses, honest labels
// ---------------------------------------------------------------------------

const BOWL_MEDITATION_MIX = {
  ...CLEAN_PRESET_MIX,
  bowls: [
    { on: true, material: 'himalayan-antique' as const, strike: 'soft' as const, baseHz: 136.1, db: -24, pan: -0.4, restrikeSec: 12, lock: true },
    { on: true, material: 'tibetan-bronze' as const, strike: 'mallet' as const, baseHz: 188, db: -26, pan: 0.35, restrikeSec: 16, lock: true },
    { on: true, material: 'crystal-quartz' as const, strike: 'soft' as const, baseHz: 500, db: -30, pan: 0.05, restrikeSec: 12, lock: true },
  ],
};

export const HEALING_PRESETS: readonly PresetSpec[] = [
  {
    id: 'heal-bowl-session',
    title: 'Himalayan Bowl Meditation (30 min)',
    category: 'Meditate',
    spec: {
      autoShutoff: true,
      mix: BOWL_MEDITATION_MIX,
      phases: [
        { name: 'settle', durationSec: 600, carrierHz: 110, beatHz: 0, gainDbFs: -26, rampSec: 90 },
        { name: 'dwell', durationSec: 1080, carrierHz: 110, beatHz: 0, gainDbFs: -28 },
        { name: 'release', durationSec: 120, carrierHz: 90, beatHz: 0, gainDbFs: -34, rampSec: 60 },
      ],
    },
    grade: 'C',
    rationale:
      'A synthesized three-bowl session in the measured geometry of real instruments: antique bronze at the OM-adjacent ' +
      '136.1 Hz, a 188 Hz bronze (the MIT (2,0) mode value) and a crystal bowl at the measured large-bowl 500 Hz band. ' +
      '30 min matches the single-session format of Goldsby 2017 (N=62 observational: tension/mood improved, no control ' +
      'group). The acoustics are grade A; the relaxation signal is grade C until randomized trials exist.',
    citations: [
      'Goldsby et al. 2017, J Evid Based Complementary Altern Med 22(3):401–406',
      'Terwagne & Bush (MIT bowl acoustics, 50–750 Hz); Ballesteros 2023 (500/630/800 Hz bands)',
    ],
  },
  {
    id: 'heal-vat-skille-scan',
    title: 'Physioacoustic Scan 30–120 Hz (20 min, audible analog)',
    category: 'Relax',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'sub-30', durationSec: 300, carrierHz: 30, beatHz: 0, gainDbFs: -14, rampSec: 20 },
        { name: 'low-60', durationSec: 300, carrierHz: 60, beatHz: 0, gainDbFs: -14, rampSec: 20 },
        { name: 'mid-90', durationSec: 300, carrierHz: 90, beatHz: 0, gainDbFs: -14, rampSec: 20 },
        { name: 'top-120', durationSec: 300, carrierHz: 120, beatHz: 0, gainDbFs: -14, rampSec: 20 },
      ],
    },
    grade: 'C',
    rationale:
      'Skille\'s physioacoustic range (30–120 Hz) walked as pure tones, 5 min per step — the VAT session floor (20 min). ' +
      'Honest boundary: the clinical modality is TACTILE (transducers in chairs/beds; sessions 20–45 min, 1–3×/week). ' +
      'A 30 Hz tone needs a subwoofer or good headphones to exist at all; at laptop speakers this is mostly silence. ' +
      'Listening education, not therapy.',
    citations: ['Kantor et al. 2022, BMJ Open VAT scoping review', 'Skille physioacoustic protocols (30–120 Hz)'],
  },
  {
    id: 'heal-wbv-30-analog',
    title: 'Bone-Window 30 Hz (WBV audible analog, 20 min)',
    category: 'Relax',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'window', durationSec: 1200, carrierHz: 120, beatHz: 30, mode: 'monaural', gainDbFs: -14, rampSec: 30 },
      ],
    },
    grade: 'C',
    rationale:
      'Rubin\'s lab picked 30 Hz because body transmissibility peaks there (~80% to hip/spine, falling above ~33 Hz) — ' +
      'platform physics, 20 min/day over months, with small measured bone-density gains (meta g = 0.11). This preset is a ' +
      '30 Hz amplitude envelope on an audible carrier: it demonstrates the RATE, not the dose. No skeletal claim can ' +
      'survive the modality change, and we make none.',
    citations: [
      'Rubin lab (SUNY Stony Brook) transmissibility window',
      'DadeMatthews 2022 meta (Hedges g = 0.11); BMC Musculoskelet Disord 2026 update',
    ],
  },
  {
    id: 'heal-pythagorean-ladder',
    title: 'Pythagorean Harmonic Ladder (24 min)',
    category: 'Meditate',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'h1', durationSec: 240, carrierHz: 72, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'h2-octave', durationSec: 240, carrierHz: 144, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'h3-fifth', durationSec: 240, carrierHz: 216, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'h4-octave2', durationSec: 240, carrierHz: 288, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'h5-third', durationSec: 240, carrierHz: 360, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'h6-fifth2', durationSec: 240, carrierHz: 432, beatHz: 0, gainDbFs: -16, rampSec: 20 },
      ],
    },
    grade: 'C',
    rationale:
      'The authentic content of the tradition is RATIOS, not Hz: harmonics 1–6 of a 72 Hz fundamental (72/144/216/288/360/432), ' +
      'four minutes each — octave, fifth, octave, third, fifth. Pythagoras\' monochord, the Kybalion\'s vibration principle, ' +
      'Inayat Khan\'s Mysticism of Sound (1923) and Berendt\'s Nada Brahma assign no frequencies; this ladder realizes the ' +
      'one thing they all actually describe — the harmonic series — as a meditation soundscape.',
    citations: [
      'Pythagorean ratio tradition (monochord division)',
      'Inayat Khan, The Mysticism of Sound and Music (1923); Berendt, Nada Brahma (1983) — no Hz assignments in the sources',
    ],
  },
  {
    id: 'exp-sonodynamic-portrait',
    title: 'Therapeutic Ultrasound Portrait (0.88–3.3 MHz band) — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'sdt-low-0.88mhz', durationSec: 240, carrierHz: 107.42, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'btnp-1mhz', durationSec: 240, carrierHz: 122.07, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'gold-np-1.1mhz', durationSec: 240, carrierHz: 134.28, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'sdt-high-2.64mhz', durationSec: 240, carrierHz: 161.13, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'hifu-top-3.3mhz', durationSec: 240, carrierHz: 201.42, beatHz: 0, gainDbFs: -16, rampSec: 20 },
      ],
    },
    grade: 'D',
    rationale:
      'Five tones, each an exact octave-down portrait (n stated per phase in the Nano Portrait table) of a real ' +
      'sonodynamic/HIFU protocol frequency (0.88, 1.0, 1.1, 2.64, 3.3 MHz), 4 min each, 20 min. Physics honesty: at 1 MHz ' +
      'a photon-equivalent energy argument is beside the point — the clinical mechanism is acoustic cavitation and ' +
      'piezoelectric conversion in tissue at W/cm² intensities; an audible tone delivers neither the frequency nor the ' +
      'intensity nor the nanoparticles. Arithmetic A; therapy meaning D.',
    citations: [
      'Sonodynamic & acoustically responsive nanodrug review, PMC11566213 (0.5–3.0 MHz)',
      'Nanoparticle-assisted ultrasound review, PMC6420022 (protocol table)',
      'Marino et al. 2015; Chen et al. 2022; Tang et al. 2025 (BTNP 1 MHz)',
    ],
  },
  {
    id: 'exp-piezo-nano-portrait',
    title: 'Piezo-Nano Stimulation Portrait (BTNP + 50 Hz field rate) — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'piezo-portrait', durationSec: 900, carrierHz: 122.07, beatHz: 50, mode: 'monaural', gainDbFs: -16, rampSec: 30 },
      ],
    },
    grade: 'D',
    rationale:
      'Two numbers from the SOTA literature, one audible object: carrier = 1 MHz (the BTNP ultrasound frequency used from ' +
      'Marino 2015 to Tang 2025\'s epilepsy suppression in rats) octaved down 2⁻¹³ to 122.07 Hz; envelope = 50 Hz, the ' +
      'alternating magnetic-field rate used by magnetoelectric nanoparticle neuromodulation (1.7 kOe). 15 min. A portrait ' +
      'of two real laboratory parameters — headphones cannot reproduce a nanoparticle, a field, or a clinical dose.',
    citations: [
      'Tang et al. 2025, Adv. Mater. (BTO@PDA nanostimulators, 1 MHz, 0.3–0.6 W/cm²)',
      'Kim et al. 2023, Nat Biomed Eng (HIFU + piezo NPs, Parkinson mouse model)',
      'MENP action-potential control study, ScienceDirect 2024 (50 Hz, 1.7 kOe)',
    ],
  },
  {
    id: 'exp-tuning-fork-128',
    title: 'Otto 128 Fork Tradition (with 120 Hz blind blocks) — experimental tier',
    category: 'Experimental',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'fork-a', durationSec: 300, carrierHz: 128, beatHz: 0, gainDbFs: -14, rampSec: 20 },
        { name: 'control-120', durationSec: 300, carrierHz: 120, beatHz: 0, gainDbFs: -14, rampSec: 20 },
        { name: 'fork-b', durationSec: 300, carrierHz: 128, beatHz: 0, gainDbFs: -14, rampSec: 20 },
        { name: 'control-120-b', durationSec: 300, carrierHz: 120, beatHz: 0, gainDbFs: -14, rampSec: 20 },
      ],
    },
    grade: 'D',
    rationale:
      'The most-sold "therapeutic" fork, Otto 128, rendered as a pure tone with alternating 120 Hz blocks for self-blinded ' +
      'comparison (20 min). Evidence audit 2026: no controlled trials for therapeutic tuning forks exist — the fork is ' +
      'honest acoustics with a folklore label. If you feel a difference between the blocks, that is exactly what a blind ' +
      'test is for; log it.',
    citations: ['Evidence audit 2026: no peer-reviewed RCTs for therapeutic tuning forks'],
  },
];

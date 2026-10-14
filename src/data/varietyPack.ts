/**
 * Variety Pack — everyday presets spread across the standard categories.
 *
 * Requested explicitly: more options in the catalog that do NOT pile into the
 * Experimental tier. Every entry here is grade B or C (the repo's D-grade
 * rule is what forces Experimental), framed around the parts of the evidence
 * that hold up: timing, pacing, masking, ritual — not frequency mysticism.
 */

import type { Preset } from './presets';
import { CLEAN_PRESET_MIX, type PresetMix } from './presetMix';

type PresetSpec = Omit<Preset, 'dose' | 'art' | 'purpose' | 'links'> & { purpose: string };

const RAIN_MIX: PresetMix = { ...CLEAN_PRESET_MIX, nature: { on: true, kind: 'rain', db: -30 } };
const BOWL_OM_FIFTH_MIX: PresetMix = {
  ...CLEAN_PRESET_MIX,
  bowls: [
    { on: true, material: 'himalayan-antique' as const, strike: 'soft' as const, baseHz: 136.1, db: -26, pan: -0.3, restrikeSec: 16, lock: true },
    { on: true, material: 'crystal-quartz' as const, strike: 'soft' as const, baseHz: 204.15, db: -30, pan: 0.3, restrikeSec: 12, lock: true },
  ],
};
const BOWL_BATH_MIX: PresetMix = {
  ...CLEAN_PRESET_MIX,
  bowls: [
    { on: true, material: 'crystal-quartz' as const, strike: 'soft' as const, baseHz: 500, db: -26, pan: -0.4, restrikeSec: 16, lock: true },
    { on: true, material: 'tibetan-bronze' as const, strike: 'soft' as const, baseHz: 630, db: -28, pan: 0.15, restrikeSec: 12, lock: true },
    { on: true, material: 'bell-bronze' as const, strike: 'mallet' as const, baseHz: 800, db: -32, pan: 0.45, restrikeSec: 16, lock: true },
  ],
};

export const VARIETY_PRESETS: readonly PresetSpec[] = [
  // ------------------------------------------------------------------ Sleep
  {
    id: 'sleep-rem-rebound-nap',
    title: 'REM Rebound Nap (90 min)',
    category: 'Sleep',
    purpose: 'Use case: a full-cycle morning nap bed — the same window TLR studies use for cued naps.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'settle', durationSec: 600, carrierHz: 160, beatHz: 8, gainDbFs: -18, rampSec: 90 },
        { name: 'cycle', durationSec: 3600, carrierHz: 140, beatHz: 5.5, gainDbFs: -22 },
        { name: 'rise', durationSec: 1200, carrierHz: 180, beatHz: 10, gainDbFs: -18, rampSec: 120 },
      ],
    },
    grade: 'C',
    rationale:
      'A 90-minute nap arc: settle (alpha→theta), long theta hold, and a 20-minute alpha rise so you surface instead of ' +
      'grokking awake. The morning nap window is the lab standard for cueing research (Carr 2023 used 90-min naps); the ' +
      'audio is comfort and timing, the window is the active ingredient.',
    citations: ['Carr et al. 2023 (90-min morning nap design)', 'Mallett/Paller 2024 (home cueing window)'],
  },
  {
    id: 'sleep-432-drift',
    title: '432 Drift (25 min bedtime)',
    category: 'Sleep',
    purpose: 'Use case: a slow 432 Hz wind-down with a breathing-paced volume envelope for bedtime.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'drift', durationSec: 1500, carrierHz: 432, beatHz: 0.1, mode: 'monaural', gainDbFs: -18, rampSec: 120 },
      ],
    },
    grade: 'C',
    rationale:
      'A 432 Hz carrier under a 0.1 Hz amplitude envelope (≈6 breaths/min pacing feel), fading in over two minutes. ' +
      '432-tuned music carried a small heart-rate advantage in one double-blind pilot (n=33, corrigendum noted); the ' +
      'envelope doubles as a breath pacer, which is the more reliable ingredient.',
    citations: ['Calamassi & Pomponi 2019 (+2020 corrigendum)', 'Slow-paced breathing literature'],
  },
  {
    id: 'sleep-power-nap-25',
    title: 'Power-Nap Descent (25 min)',
    category: 'Sleep',
    purpose: 'Use case: a 20–26 minute nap with a built-in wake-up rise — long enough to refresh, short enough to avoid grogginess.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'descend', durationSec: 480, carrierHz: 150, beatHz: 8, gainDbFs: -16, rampSec: 60 },
        { name: 'nap', durationSec: 720, carrierHz: 120, beatHz: 4.5, gainDbFs: -22 },
        { name: 'wake-rise', durationSec: 300, carrierHz: 200, beatHz: 12, gainDbFs: -14, rampSec: 60 },
      ],
    },
    grade: 'C',
    rationale:
      'Sized to the NASA/Fatigue-Science nap finding (a ~26-minute cockpit nap improved alertness; the dose is the ' +
      'timing, not the sound). The last five minutes ramp up through alpha so the session itself wakes you — no alarm ' +
      'shock, no sleep-inertia trap of longer naps.',
    citations: ['Rosekind et al., NASA nap study (26-min nap, alertness/performance)', 'Nap-duration sleep-inertia literature'],
  },

  // ------------------------------------------------------------------ Focus
  {
    id: 'focus-52-17-rhythm',
    title: '52/17 Work Rhythm (69 min)',
    category: 'Focus',
    purpose: 'Use case: a timeboxed deep-work block with a real break built in — 52 minutes on, 17 off.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'work-block', durationSec: 3120, carrierHz: 200, beatHz: 15, gainDbFs: -14, rampSec: 60 },
        { name: 'break', durationSec: 1020, carrierHz: 160, beatHz: 10, gainDbFs: -18, rampSec: 60 },
      ],
    },
    grade: 'C',
    rationale:
      'The timebox is the intervention, not the beat: a 52-minute low-beta bed, then a 17-minute alpha break you are ' +
      'meant to actually take (stand up, look far away). Beta-focus entrainment claims are inconsistent — the largest ' +
      'study found 15 Hz worsened fluid-intelligence scores DURING listening, so treat this as a pacing ritual.',
    citations: ['Klichowski et al., Sci Rep 2023 (n=1000 caution)', 'Basu & Banerjee 2023 (heterogeneous)'],
  },
  {
    id: 'focus-study-alpha',
    title: 'Study Alpha (45 min reading)',
    category: 'Focus',
    purpose: 'Use case: calm-alert reading or study without the jitters of beta-range tracks.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'settle', durationSec: 300, carrierHz: 170, beatHz: 11, gainDbFs: -14, rampSec: 60 },
        { name: 'read', durationSec: 2400, carrierHz: 160, beatHz: 10, gainDbFs: -16 },
      ],
    },
    grade: 'C',
    rationale:
      'Upper-alpha hold for reading. Alpha-range audio has the strongest RELAXATION evidence in this literature; for ' +
      'study it is best framed as a calm-alert ritual. Keep volume low enough that the text stays the loudest thing ' +
      'in your attention.',
    citations: ['Padmanabhan 2005 (alpha anxiety RCT)', 'Garcia-Argibay 2019 (modest pooled effects)'],
  },
  {
    id: 'focus-brown-rain',
    title: 'Brown Rain Work Bed (50 min, beat-free)',
    category: 'Focus',
    purpose: 'Use case: masking office/room noise with rain and brown noise — no beat at all.',
    spec: {
      autoShutoff: true,
      mix: { ...RAIN_MIX, noiseOn: true, noiseDb: { brown: -24 } },
      phases: [{ name: 'mask', durationSec: 3000, carrierHz: 150, beatHz: 0, gainDbFs: -22 }],
    },
    grade: 'C',
    rationale:
      'A deliberately beat-free masking bed: brown noise plus a quiet rain layer under a faint carrier. Masking is the ' +
      'honest mechanism for distraction control; nothing here claims entrainment, and beats-in-noise have associated ' +
      'with null EEG findings anyway.',
    citations: ['Ingendoh et al. 2023 (beats-in-noise null findings)', 'Garcia-Argibay 2019 (masking moderator null)'],
  },

  // ------------------------------------------------------------------ Relax
  {
    id: 'relax-528-blind-pair',
    title: '528 / 440 Blind Pair (20 min)',
    category: 'Relax',
    purpose: 'Use case: self-blind the 528 Hz claim — alternating 528/440 blocks, rate each before checking which was which.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'block-a-528', durationSec: 300, carrierHz: 528, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'block-b-440', durationSec: 300, carrierHz: 440, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'block-c-528', durationSec: 300, carrierHz: 528, beatHz: 0, gainDbFs: -16, rampSec: 20 },
        { name: 'block-d-440', durationSec: 300, carrierHz: 440, beatHz: 0, gainDbFs: -16, rampSec: 20 },
      ],
    },
    grade: 'C',
    rationale:
      'The 528 Hz literature is one n=9 acute pilot (cortisol/oxytocin shift vs 440 Hz). This preset is built for honest ' +
      'self-testing: four alternating blocks, same level, no labels on screen while it plays. Preference data from your ' +
      'own blinded evening beats a marketing page.',
    citations: ['Akimoto et al. 2018, Health 10 (n=9 pilot)', 'Babayi & Riazi 2017 (no DNA endpoint)'],
  },
  {
    id: 'relax-cyclic-sigh-pacer',
    title: 'Cyclic-Sigh Pacer (10 min)',
    category: 'Relax',
    purpose: 'Use case: pace the double-inhale / long-exhale sigh pattern — 5–10 minutes, the studied daily dose.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'learn', durationSec: 120, carrierHz: 180, beatHz: 0.14, mode: 'monaural', gainDbFs: -16, rampSec: 30 },
        { name: 'practice', durationSec: 480, carrierHz: 170, beatHz: 0.09, mode: 'monaural', gainDbFs: -18 },
      ],
    },
    grade: 'B',
    rationale:
      'The envelope marks a slow sigh cadence (≈8–11 s breaths: quick inhale, top-up inhale at the swell, long exhale ' +
      'as it falls). Cyclic sighing beat mindfulness meditation for mood and respiratory rate in a randomized trial of ' +
      '5-minute daily practice (Balban/Spiegel 2023). The breathing is the intervention; the tone is the metronome.',
    citations: ['Balban et al. 2023, Cell Reports Medicine 42(1):100895 (cyclic sighing RCT)'],
  },
  {
    id: 'relax-bhramari-drone',
    title: 'Bhramari Humming Drone (12 min)',
    category: 'Relax',
    purpose: 'Use case: a steady low drone to hum along with (bee-breath practice) — your hum is the instrument.',
    spec: {
      autoShutoff: true,
      mix: BOWL_OM_FIFTH_MIX,
      phases: [{ name: 'drone', durationSec: 720, carrierHz: 136.1, beatHz: 0, gainDbFs: -20, rampSec: 45 }],
    },
    grade: 'C',
    rationale:
      'Bhramari pranayama (humming-bee breathing) has small-trial support for blood-pressure and heart-rate effects; ' +
      'this preset supplies a comfortable drone reference (136.1 Hz + quiet fifth bowl strikes) to hum over. The hum — ' +
      'its long exhale and vibration — is the practice; the drone just keeps pitch honest.',
    citations: ['Bhramari pranayama small-trial literature (BP/HR)', 'Nada/chanting practice tradition'],
  },

  // --------------------------------------------------------------- Meditate
  {
    id: 'meditate-nada-drone',
    title: 'Nada Drone (OM + fifth, 25 min)',
    category: 'Meditate',
    purpose: 'Use case: a still two-note drone for deep listening — the nada yoga practice, not a Hz prescription.',
    spec: {
      autoShutoff: true,
      mix: BOWL_OM_FIFTH_MIX,
      phases: [{ name: 'listen', durationSec: 1500, carrierHz: 136.1, beatHz: 0, gainDbFs: -20, rampSec: 90 }],
    },
    grade: 'C',
    rationale:
      'Nada yoga and Inayat Khan\'s sound mysticism prescribe LISTENING practice, never frequencies. This drone pairs ' +
      'the 136.1 Hz earth-year tone with its just fifth (204.15 Hz) as quiet bowl strikes — a still point for the ' +
      'attention practice the texts actually describe.',
    citations: ['Inayat Khan, The Mysticism of Sound and Music (1923) — no Hz in source', 'Cousto arithmetic (grade A) / meaning grade D'],
  },
  {
    id: 'meditate-bowl-bath-walk',
    title: 'Bowl Bath Walk (30 min)',
    category: 'Meditate',
    purpose: 'Use case: a slow tour of the measured large/medium/small bowl bands (500 → 630 → 800 Hz).',
    spec: {
      autoShutoff: true,
      mix: BOWL_BATH_MIX,
      phases: [
        { name: 'large-bowl-band', durationSec: 600, carrierHz: 500, beatHz: 0, gainDbFs: -22, rampSec: 60 },
        { name: 'medium-bowl-band', durationSec: 600, carrierHz: 630, beatHz: 0, gainDbFs: -22, rampSec: 60 },
        { name: 'small-bowl-band', durationSec: 600, carrierHz: 800, beatHz: 0, gainDbFs: -24, rampSec: 60 },
      ],
    },
    grade: 'C',
    rationale:
      'A walk through the three measured resonance bands of Tibetan bowls (large ≈500, medium ≈630, small ≈800 Hz), ' +
      'with synthesized bowl strikes riding each band. Sound-bath evidence is a single uncontrolled study (Goldsby ' +
      '2017); the acoustics are the solid part — this session is built on them.',
    citations: ['Ballesteros 2023 (measured 500/630/800 Hz bands)', 'Goldsby 2017 (observational)'],
  },
  {
    id: 'meditate-zazen-descent',
    title: 'Zazen Descent (20 min)',
    category: 'Meditate',
    purpose: 'Use case: a 20-minute sit with a slow alpha→theta descent and an end bell.',
    spec: {
      autoShutoff: true,
      mix: { ...CLEAN_PRESET_MIX, bellEveryMin: 10 },
      phases: [
        { name: 'posture', durationSec: 300, carrierHz: 160, beatHz: 10, gainDbFs: -16, rampSec: 60 },
        { name: 'sit', durationSec: 840, carrierHz: 140, beatHz: 7, gainDbFs: -18, rampSec: 120 },
        { name: 'return', durationSec: 60, carrierHz: 180, beatHz: 11, gainDbFs: -16, rampSec: 20 },
      ],
    },
    grade: 'C',
    rationale:
      'A plain sitting container: settle at upper alpha, sink toward theta for the body of the sit, a soft rise and an ' +
      'interval bell at 10 minutes. Meditation benefits come from the sit; the audio is a timer with a mood.',
    citations: ['Meditation-attention literature (practice-driven effects)', 'Garcia-Argibay 2019 (audio alone: modest)'],
  },

  // ------------------------------------------------------------- Lucid Dream
  {
    id: 'lucid-morning-nap-window',
    title: 'Morning Nap Window (95 min)',
    category: 'Lucid Dream',
    purpose: 'Use case: the cued-morning-nap companion — quiet bed, cue window near the end, gentle rise to journal.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'settle', durationSec: 600, carrierHz: 160, beatHz: 8, gainDbFs: -18, rampSec: 90 },
        { name: 'nap-cycle', durationSec: 3300, carrierHz: 140, beatHz: 5.5, gainDbFs: -22 },
        { name: 'cue-window', durationSec: 1500, carrierHz: 180, beatHz: 7.5, gainDbFs: -20 },
        { name: 'rise-to-journal', durationSec: 300, carrierHz: 200, beatHz: 10, gainDbFs: -16, rampSec: 60 },
      ],
    },
    grade: 'C',
    rationale:
      'Naps near the morning REM peak are the lab standard (Carr 2023: 50% vs 17% signal-verified lucid dreams in cued ' +
      'naps). This bed structures one: settle, long theta hold, a lighter cue-window stretch where your paired cue ' +
      'belongs (play it over this), and a rise that lands you at the journal.',
    citations: ['Carr et al. 2023 (nap cueing)', 'Mallett/Paller 2024 (home cueing)'],
  },
  {
    id: 'lucid-first-half-guard',
    title: 'First-Half Guard (40 min, then silence)',
    category: 'Lucid Dream',
    purpose: 'Use case: protect the deep-sleep first half of the night — the session ends, the night stays quiet.',
    spec: {
      autoShutoff: true,
      phases: [
        { name: 'onset', durationSec: 900, carrierHz: 130, beatHz: 6, gainDbFs: -18, rampSec: 120 },
        { name: 'deep-quiet', durationSec: 1500, carrierHz: 110, beatHz: 3, gainDbFs: -24, rampSec: 120 },
      ],
    },
    grade: 'C',
    rationale:
      'Lucidity work lives in the last third of the night; the first half is slow-wave territory you should not poke. ' +
      'This session accompanies sleep onset with a delta-ward drift and then gets out of the way — auto-shutoff leaves ' +
      'the deep-sleep window silent, keeping your REM-rich morning intact for TLR practice.',
    citations: ['REM/SWS night distribution (sleep physiology canon)', 'Carr 2023 / Mallett 2024 (cue timing belongs late)'],
  },
];

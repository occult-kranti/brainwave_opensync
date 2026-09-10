/**
 * Open Sync Everyday — every user-visible string, in one typed object.
 *
 * Copy contract (enforced by __tests__/copy.test.ts):
 *   - ≤ 12 words per string, headings ≤ 3 words, no "!"
 *   - none of the banned phrases in src/docs/vocabulary.ts
 *   - no effect claims: intent sublines describe the SOUND, never an outcome
 *
 * The verbatim governor advisory texts (About → Safety notes → Read full)
 * are the one place long text appears; they come from SafetyGovernor, not
 * from here, and stay collapsed by default.
 */

export const copy = {
  app: {
    wordmark: 'Open Sync',
    tagline: 'Free, open source, no account, nothing leaves your device',
  },
  tabs: {
    play: 'Play',
    sounds: 'Sounds',
    settings: 'Settings',
  },
  headings: {
    beforeStart: 'Before you start',
    evidence: 'Evidence',
    noise: 'Noise',
    nature: 'Nature',
    bowls: 'Bowls',
    bell: 'Bell',
    sessionCap: 'Session cap',
    sleepFade: 'Sleep fade',
    infantMode: 'Infant mode',
    theme: 'Theme',
    install: 'Install',
    about: 'About',
    version: 'Version',
    credits: 'Credits',
    source: 'Source',
    safetyNotes: 'Safety notes',
  },
  intents: {
    sleep: { name: 'Sleep', sub: 'Slow waves, then quiet' },
    focus: { name: 'Focus', sub: 'Steady tones, no lyrics' },
    relax: { name: 'Relax', sub: 'Soft alpha with rain' },
    meditate: { name: 'Meditate', sub: 'Theta with bowls' },
  },
  evidence: {
    pill: 'Evidence',
    rows: {
      tones: { label: 'Tones', note: 'Small studies, mixed results', grade: 'B/C' },
      noise: { label: 'Noise for sleep', note: 'Modest evidence', grade: 'B' },
      nature: { label: 'Nature sounds', note: 'Relaxation, not entrainment', grade: 'B' },
      bowls: { label: 'Bowls', note: 'Tradition, no trials', grade: 'D' },
    },
    labLink: 'Full grades in the lab',
  },
  advisory: {
    headphones: 'Headphones at a comfortable level',
    driving: 'Never while driving',
    seizure: 'Not with a seizure history',
    infant: 'Never on an infant without infant mode',
    accept: 'I understand — start',
    dismiss: 'Not now',
  },
  player: {
    play: 'Play',
    pause: 'Pause',
    paused: 'Paused',
    remaining: 'Remaining',
    ends: 'Ends',
    fading: 'Fading',
    duration: 'Duration',
    volume: 'Volume',
    noise: 'Noise',
    nature: 'Nature',
    bowls: 'Bowls',
    bell: 'Bell',
    fadeStop: 'Fade & stop',
    cancelFade: 'Cancel fade',
    stop: 'Stop',
  },
  sounds: {
    level: 'Level',
    off: 'Off',
    noise: { pink: 'Pink', brown: 'Brown', white: 'White' },
    nature: { rain: 'Rain', ocean: 'Ocean', stream: 'Stream', fire: 'Fire', thunder: 'Thunder' },
    /** ≤ 6-word lines per BOWL_SETS entry (the engine blurbs are too long for a row). */
    bowlSets: {
      'himalayan-trio': 'Three antique bowls, staggered strikes',
      'crystal-pair': 'Two quartz bowls, sung rims',
      'seven-note-set': 'Seven bowls, C major scale',
      'deep-drone': 'Two low bowls, brass accent',
      'bright-bells': 'High bronze and brass, quick decay',
    },
  },
  settings: {
    capOff: 'Off',
    custom: 'Custom',
    customPlaceholder: 'Minutes',
    infantLine: 'Low-pass, 50 dBA, 45 min max',
    theme: { auto: 'Auto', dark: 'Dark', light: 'Light' },
    installButton: 'Add to home screen',
    installHint: "Use your browser's Add to Home Screen",
    openLab: 'Open the full lab',
    about: 'About',
  },
  about: {
    sourceLink: 'github.com/occult-kranti/brainwave_opensync',
    readFull: 'Read full',
    safety: {
      medication: 'Medication or pregnancy: ask your clinician first',
      seizure: 'Seizure history: do not use this app',
      driving: 'Never while driving or operating machinery',
      crisis: 'In crisis: US 988, or findahelpline.com',
    },
    credits: [
      { name: 'React', license: 'MIT' },
      { name: 'Vite', license: 'MIT' },
      { name: 'Tailwind CSS', license: 'MIT' },
      { name: 'framer-motion', license: 'MIT' },
      { name: 'Lucide', license: 'ISC' },
      { name: 'Inter', license: 'OFL 1.1' },
      { name: 'Workbox', license: 'MIT' },
    ],
  },
  units: {
    min: 'min',
    sec: 's',
    minutes: 'minutes',
  },
  a11y: {
    mainNav: 'Main',
    close: 'Close',
    openLab: 'Open the full lab',
  },
} as const;

export type Copy = typeof copy;

export type PracticeCadence = 3 | 5 | 7;
export type PracticeBudget = 10 | 20 | 45;
export type PracticeMaterial = 'opensync' | 'gateway';
export type PracticeApproach = 'repeat' | 'sequence';

export const PRACTICE_PLAN_SOURCES = [
  { id: 'official-tips', label: 'Hemi-Sync · Listening Tips', kind: 'Official guidance', url: 'https://hemi-sync.com/help-center/category/listening-tips/', section: 'Repetition, equipment, verbal recordings and listening cautions', note: 'Read in full. The publisher recommends repeating training exercises, including Gateway; it gives no universal repeat count.' },
  { id: 'official-discovery', label: 'Hemi-Sync · Wave I: Discovery', kind: 'Official sequence', url: 'https://hemi-sync.com/product/gateway-experience-wave-i-discovery-dr-album/', section: 'Six exercises and progressive album order', note: 'The current product listing supplies the six names and sequence below. Its outcome descriptions are publisher claims.' },
  { id: 'official-gift', label: 'Hemi-Sync · 2025 gift guide', kind: 'Publisher suggestion', url: 'https://hemi-sync.com/hemi-sync-articles/hemi-sync-holiday-gift-guide/', section: 'Gateway Experience Waves I–VIII', note: 'Suggests one or two tracks per day. This is practical publisher advice, not a tested optimal dose or a requirement.' },
  { id: 'manual-mirror', label: 'Gateway Experience manual · 25-page historical mirror', kind: 'Historical manual · mirror', url: 'https://archive.org/download/the-gateway-experience-manual/The%20Gateway%20Experience%20Manual.pdf', section: 'PDF p. 1; pp. 4–6, especially FAQ 14', note: 'All 25 pages were read. It describes an approximately 45-minute undisturbed window and flexible repetition. This mirror has not been authenticated as the current official edition.' },
  { id: 'community-pace', label: 'Community discussion · pacing and repetition', kind: 'Anecdotes · January 2026', url: 'https://www.reddit.com/r/gatewaytapes/comments/1qfzcia/starting_the_tapes_do_you_listen_to_one_a_day_is/', section: 'Discussion, 18 January 2026', note: 'Participants describe very different repeat counts and often returning to introductory material. Self-selected reports cannot establish an effective schedule.' },
  { id: 'community-fatigue', label: 'Community discussion · rest and difficulty progressing', kind: 'Anecdotes · May 2026', url: 'https://www.reddit.com/r/gatewaytapes/comments/1t5pyr7/gateway_and_self_hypnosis_tapespossible_issues/', section: 'Discussion, 6 May 2026', note: 'A participant reports persistent sleepiness and frustration despite frequent practice. More repetition is not proof of benefit; comfort and normal sleep remain useful checks.' },
] as const;

/** Titles and order follow the current publisher listing; no commercial audio is hosted. */
export const FOUNDATION_TAPES = [
  { id: 'orientation', title: 'Orientation', purpose: 'Learn the format and preparation.', repeat: 'Return when restarting or when the instructions are unfamiliar.' },
  { id: 'intro-10', title: 'Intro Focus 10', purpose: 'Become familiar with the introductory relaxation practice.', repeat: 'A useful foundation to revisit while the instructions still need attention.' },
  { id: 'advanced-10', title: 'Advanced Focus 10', purpose: 'Revisit the additional preparation tools.', repeat: 'Repeat after the introduction feels familiar; no particular sensation is required.' },
  { id: 'release', title: 'Release and Recharge', purpose: 'Explore a reflective release exercise.', repeat: 'Optional after the earlier exercises; choose an ordinary, manageable concern.' },
  { id: 'sleep', title: 'Exploration, Sleep', purpose: 'Use the sleep-oriented recording at an appropriate bedtime.', repeat: 'This is a separate sleep session, rather than an alert daytime exercise.' },
  { id: 'free-flow', title: 'Focus 10 Free Flow', purpose: 'Practice with less verbal structure.', repeat: 'Revisit once the earlier preparation is familiar; return to guidance whenever helpful.' },
] as const;
export type FoundationId = typeof FOUNDATION_TAPES[number]['id'];

export interface PracticePlanOptions {
  cadence: PracticeCadence;
  budget: PracticeBudget;
  time: string;
  material: PracticeMaterial;
  approach: PracticeApproach;
  foundation: FoundationId;
}
export interface PracticeDay {
  day: number;
  week: number;
  active: boolean;
  time: string;
  title: string;
  detail: string;
  foundation: FoundationId | null;
  presetId: string | null;
  listenMin: number;
  preparationMin: number;
  reflectionMin: number;
}

const ACTIVE_DAYS: Record<PracticeCadence, readonly number[]> = { 3: [0, 2, 4], 5: [0, 1, 2, 3, 4], 7: [0, 1, 2, 3, 4, 5, 6] };

export function practiceTimeWindow(time: string, minutes: number): string {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return 'Choose a local start time';
  const [h, m] = time.split(':').map(Number);
  const end = h * 60 + m + minutes;
  const endLabel = `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
  return `${time}–${endLabel}${end >= 1440 ? ' (+1 day)' : ''}`;
}

/** An editable planning aid, not a prescription or a claim of tested OBE induction. */
export function buildPracticePlan(options: PracticePlanOptions): PracticeDay[] {
  let practiceIndex = 0;
  return Array.from({ length: 14 }, (_, i) => {
    const active = ACTIVE_DAYS[options.cadence].includes(i % 7);
    if (!active) return { day: i + 1, week: Math.floor(i / 7) + 1, active, time: 'No audio planned', title: 'Quiet day', detail: 'Keep your usual sleep. Review a note or rest without a recording; nothing needs to be made up.', foundation: null, presetId: null, listenMin: 0, preparationMin: 0, reflectionMin: 0 };
    const index = options.approach === 'repeat' ? FOUNDATION_TAPES.findIndex(t => t.id === options.foundation) : Math.min(Math.floor(practiceIndex / 2), FOUNDATION_TAPES.length - 1);
    const tape = FOUNDATION_TAPES[Math.max(0, index)];
    practiceIndex += 1;
    const short = options.budget < 45;
    const presetId = options.budget === 10 ? 'practice-soft-landing' : options.budget === 20 ? 'archive-gateway-inspired' : 'gateway-focus-10-reconstruction';
    const listenMin = options.budget === 10 ? 5 : options.budget === 20 ? 15 : 35;
    const actualTape = options.material === 'gateway' && !short;
    return {
      day: i + 1, week: Math.floor(i / 7) + 1, active, time: actualTape && tape.id === 'sleep' ? 'At bedtime · allow the full recording' : practiceTimeWindow(options.time, options.budget), foundation: tape.id,
      title: actualTape ? tape.title : options.budget === 10 ? 'Soft landing · original OpenSync sound' : options.budget === 20 ? 'Gateway-inspired descent · original OpenSync sound' : 'Focus 10 companion · original OpenSync sound',
      detail: actualTape ? `${tape.purpose} Use the complete duration shown by your own player, including its ending. The 45-minute block is a planning window, not a verified track length; extend it if your edition needs more time.` : `${options.material === 'gateway' ? 'This window is short: use an original companion or quiet practice instead of cutting a commercial tape mid-instruction. ' : ''}Allow time to settle, listen quietly, and write a short note. This sound is not the commercial ${tape.title} recording.`,
      presetId: actualTape ? null : presetId, listenMin: actualTape ? 0 : listenMin,
      preparationMin: actualTape ? 0 : 3, reflectionMin: actualTape ? 0 : options.budget - listenMin - 3,
    };
  });
}

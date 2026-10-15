import { PRESETS, presetDurationMin, type Preset, type PresetCategory } from './presets';
import { PRACTICE_PRESET_GOALS, type PracticeGoal } from './listeningPractice';
import { ARCHIVE_PRESET_GOALS } from './archivePractice';

export interface SessionPreferences { goal: PracticeGoal; minutes: number; headphones: boolean; experimental: boolean; infantMode?: boolean }
const categories: Record<PracticeGoal, readonly PresetCategory[]> = {
  unwind: ['Relax'], meditate: ['Meditate'], sleep: ['Sleep'], dream: ['Lucid Dream', 'Sleep'],
  hypnosis: ['Meditate', 'Relax'], focus: ['Focus'], comfort: ['Relax', 'Meditate'],
};
export const needsHeadphones = (p: Preset) => p.spec.phases.some((phase) => (phase.mode ?? 'binaural') === 'binaural' && phase.beatHz > 0);

/** Transparent preference matching, not inference about the listener's brain or health. */
export function suggestSessions(prefs: SessionPreferences, catalog: readonly Preset[] = PRESETS) {
  if (prefs.infantMode || !Number.isFinite(prefs.minutes) || prefs.minutes < 1) return [];
  return catalog.filter((p) => p.category !== 'Infant' && (prefs.experimental || (p.grade !== 'D' && p.category !== 'Experimental')) && (prefs.headphones || !needsHeadphones(p)))
    .map((preset) => {
      const specific = (PRACTICE_PRESET_GOALS[preset.id] ?? ARCHIVE_PRESET_GOALS[preset.id])?.includes(prefs.goal) ?? false;
      const relevant = specific || categories[prefs.goal].includes(preset.category);
      const duration = presetDurationMin(preset);
      const score = (specific ? 100 : relevant ? 35 : -100) + (duration <= prefs.minutes ? 25 : -20) - Math.abs(duration - prefs.minutes) + (preset.spec.mix ? 5 : 0);
      return { preset, score, minutes: Math.min(duration, prefs.minutes), shortened: duration > prefs.minutes,
        reason: `${specific ? 'Designed for this intention' : `From the ${preset.category.toLowerCase()} collection`}; ${duration <= prefs.minutes ? 'fits your available time' : 'play the beginning, shortened to your time'}. ${needsHeadphones(preset) ? 'Stereo headphones required.' : 'Suitable for speakers or headphones.'}` };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.preset.id.localeCompare(b.preset.id)).slice(0, 3);
}

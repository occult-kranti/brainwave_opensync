import { presetDurationMin, type Preset } from './presets';
import { needsHeadphones } from './sessionSuggestions';
import { isBasharPreset } from '@/ui/components/presetPresentation';

export const PRESET_COLLECTIONS = [
  ['all', 'Browse all presets'], ['start', 'Start here'], ['hypnosis', 'Hypnosis & suggestion'],
  ['practice', 'Meditation & rest'], ['sleep', 'Sleep & wind-down'], ['dream', 'Dreaming & imagery'],
  ['focus', 'Focus & attention'], ['comfort', 'Comfort & healing traditions'], ['nature', 'Nature & soundscapes'],
  ['overnight', 'Overnight · 7 hours'], ['archive', 'Programs & traditions'], ['nano', 'NanoLab signals'],
  ['bashar', 'Bashar sounds'], ['saved', 'My presets'],
] as const;
export type PresetCollection = typeof PRESET_COLLECTIONS[number][0];
export const STARTER_IDS = ['practice-soft-landing', 'practice-bowl-attention', 'practice-evening-rain', 'practice-steady-focus'];
export const COLLECTION_NOTES: Record<PresetCollection, string> = {
 all: 'Every sound, organized by practice. Open a group to explore it.', start: 'Four easy places to begin: rain, bowls, a wind-down and a quiet task.',
 hypnosis: 'Attention, imagery and voluntary suggestion. Read the practice in Sound details before starting. These are sound beds, with no recorded voice.',
 practice: 'Short practices for settling, listening and returning attention.', sleep: 'Wind down before bed. These sounds do not detect or determine sleep stages.',
 dream: 'Dream recall, sleep-onset imagery and experimental listening. Keep a notebook nearby.', focus: 'Steady tones, noise and rhythm for your next quiet task.',
 comfort: 'Listening for rest, plus clearly labeled healing traditions. No medical outcome is promised.', nature: 'Rain, water, nature textures and acoustic portraits.',
 overnight: 'Continuous seven-hour sound beds, all speaker-compatible. The night planner offers a shorter beginning followed by quiet.',
 archive: 'Original listening experiments inspired by programs, books and traditions. Archival documentation is not proof of efficacy.',
 nano: 'Hear amplitude modulation and steady controls. The signal mathematics is established; wellness effects are not.',
 bashar: 'Four listening examples from the supplied digest. Starting pitches and timings are app choices.', saved: 'Your Studio presets, saved in this browser.',
};
export function presetFamily(p: Preset): string {
 if (p.id.startsWith('hypnosis-') || p.id === 'practice-suggestion-space' || p.id === 'practice-theta-comparison') return 'Hypnosis & suggestion';
 if (p.id.startsWith('night-')) return 'Overnight · seven hours';
 if (p.id.startsWith('nano-')) return 'NanoLab · signal controls';
 if (p.id.startsWith('archive-')) return 'Programs & traditions';
 if (isBasharPreset(p)) return 'Bashar sounds';
 if (/^(nature-|crop-|species-)/.test(p.id)) return 'Nature & acoustic portraits';
 if (/^(heal-|healing-|vat-)/.test(p.id)) return 'Healing traditions & comfort';
 if (p.category === 'Sleep') return 'Sleep & wind-down';
 if (p.category === 'Lucid Dream' || /dream|lucid|expedition/.test(p.id)) return 'Dreaming & imagery';
 if (p.category === 'Focus') return 'Focus & attention';
 if (p.category === 'Meditate') return 'Meditation & breath';
 if (p.category === 'Relax') return 'Rest & relaxation';
 if (p.category === 'Infant') return 'Infant · restricted listening';
 return 'Experimental listening';
}
export function matchesCollection(p: Preset, collection: PresetCollection): boolean {
 const family = presetFamily(p);
 switch (collection) {
  case 'all': return true;
  case 'start': return STARTER_IDS.includes(p.id);
  case 'saved': return false;
  case 'hypnosis': return family === 'Hypnosis & suggestion' || p.id === 'night-hypnosis';
  case 'practice': return p.id.startsWith('practice-') || p.category === 'Meditate';
  case 'sleep': return p.category === 'Sleep' || p.id === 'night-sleep';
  case 'dream': return family === 'Dreaming & imagery' || p.id === 'hypnosis-dream-notebook' || ['night-lucid', 'night-astral', 'night-viewing'].includes(p.id);
  case 'focus': return p.category === 'Focus';
  case 'comfort': return family === 'Healing traditions & comfort' || p.id === 'night-comfort' || p.id === 'hypnosis-body-rest';
  case 'nature': return family === 'Nature & acoustic portraits' || Boolean(p.spec.mix?.nature.on);
  case 'overnight': return p.id.startsWith('night-');
  case 'archive': return p.id.startsWith('archive-');
  case 'nano': return p.id.startsWith('nano-');
  case 'bashar': return isBasharPreset(p);
 }
}
export const FAMILY_ORDER = ['Hypnosis & suggestion', 'Meditation & breath', 'Rest & relaxation', 'Sleep & wind-down', 'Dreaming & imagery', 'Focus & attention', 'Nature & acoustic portraits', 'Healing traditions & comfort', 'Overnight · seven hours', 'Programs & traditions', 'NanoLab · signal controls', 'Bashar sounds', 'Experimental listening', 'Infant · restricted listening'];

export function matchesListeningFilters(p: Preset, setup: string, duration: string, sound: string): boolean {
  const minutes = presetDurationMin(p);
  if (setup === 'speakers' && needsHeadphones(p)) return false;
  if (setup === 'headphones' && !needsHeadphones(p)) return false;
  if (duration === 'short' && minutes > 15) return false;
  if (duration === 'medium' && (minutes <= 15 || minutes > 60)) return false;
  if (duration === 'long' && (minutes <= 60 || minutes >= 420)) return false;
  if (duration === 'night' && minutes < 420) return false;
  const phases = p.spec.phases;
  if (sound === 'steady' && !phases.every(ph => ph.beatHz === 0)) return false;
  if (sound === 'binaural' && !needsHeadphones(p)) return false;
  if (sound === 'pulse' && !phases.some(ph => ph.beatHz > 0 && ['monaural', 'isochronic'].includes(ph.mode ?? 'binaural'))) return false;
  if (sound === 'nature' && !p.spec.mix?.nature.on) return false;
  if (sound === 'noise' && !(p.spec.mix?.noiseOn && Object.keys(p.spec.mix.noiseDb).length)) return false;
  if (sound === 'bowls' && !p.spec.mix?.bowls.some(b => b.on)) return false;
  return true;
}

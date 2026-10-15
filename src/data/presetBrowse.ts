import { presetDurationMin, type Preset } from './presets';
import { needsHeadphones } from './sessionSuggestions';

export const PRESET_COLLECTIONS = [
  ['start', 'Start here'], ['practice', 'Meditation & rest'], ['overnight', 'Overnight · 7 hours'],
  ['archive', 'Programs & traditions'], ['nano', 'NanoLab signals'], ['all', 'Browse all presets'],
  ['bashar', 'Bashar sounds'], ['saved', 'My presets'],
] as const;
export type PresetCollection = typeof PRESET_COLLECTIONS[number][0];

export function presetFamily(p: Preset): string {
  if (p.id.startsWith('night-')) return 'Overnight · seven hours';
  if (p.id.startsWith('nano-')) return 'NanoLab · signal controls';
  if (p.id.startsWith('archive-')) return 'Programs & traditions';
  if (p.id.startsWith('practice-')) return 'Meditation & rest';
  if (/^(nature-|crop-|species-)/.test(p.id)) return 'Nature & acoustic portraits';
  if (/^(heal-|healing-|vat-)/.test(p.id)) return 'Healing traditions & comfort';
  return p.category;
}

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

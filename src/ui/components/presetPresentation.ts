import type { Phase, Preset } from '@/data/presets';
import { BASHAR_PRESETS, MAPPING_CONTEXT } from '@/channeled/bashar';

export const isBasharPreset = (preset: Preset): boolean => BASHAR_PRESETS.some((p) => p.id === preset.id);
export const presetDisplayName = (preset: Preset): string => preset.title.replace(/\s*\(experimental tier\)$/i, '');
export const hzLabel = (hz: number): string => Number(hz.toFixed(2)).toString();

export function phaseSoundLabel(phase: Phase): string {
  if (phase.beatHz === 0) return `${hzLabel(phase.carrierHz)} Hz steady tone`;
  const mode = phase.mode ?? 'binaural';
  const rhythm = mode === 'binaural' ? 'binaural beat' : mode === 'isochronic' ? 'pulses' : 'monaural rhythm';
  return `${hzLabel(phase.beatHz)} Hz ${rhythm} · ${hzLabel(phase.carrierHz)} Hz carrier`;
}

export function presetSoundDescription(preset: Preset): string {
  switch (preset.id) {
    case 'relax-alpha-ease': return 'Five minutes with a 150 Hz carrier and 10 Hz binaural beat, then 25 minutes at 140 Hz with a 9 Hz beat. Headphones separate the tones between your ears.';
    case 'focus-brown-noise': return 'This legacy preset currently produces a steady 150 Hz tone. Its intended brown-noise texture is not implemented in preset playback.';
    case 'focus-pink-noise':
    case 'sleep-pink-quiet': return 'This legacy preset currently produces a steady 200 Hz tone. Its intended pink-noise texture is not implemented in preset playback.';
    case 'exp-bashar-scale-map': return `Seven five-minute steps, from 6 to 66.6 Hz. ${MAPPING_CONTEXT}`;
    case 'exp-bashar-gamma-contradiction': return 'Ten minutes of a 10.5 Hz binaural beat, then ten minutes of a 40 Hz monaural rhythm. Both use a 200 Hz carrier.';
    case 'exp-phi-ladder': return 'Five steady pitches, one after another. Each is the previous pitch multiplied by the golden ratio, starting at 110 Hz.';
    case 'exp-phi-bowl-chord': return 'Five modeled bowls spaced by the golden ratio, played together over a steady 110 Hz root.';
    default: return preset.rationale;
  }
}

export function presetSignalSummary(preset: Preset): string {
  const bowls = preset.spec.mix?.layersOn ? preset.spec.mix.bowls.filter((b) => b.on) : [];
  if (bowls?.some((b) => b.lock)) return `${bowls.map((b) => b.lock ? 'follows carrier' : `${hzLabel(b.baseHz)} Hz`).join(' / ')} · bowls`;
  if (bowls?.length) return `${bowls.map((b) => hzLabel(b.baseHz)).join(' / ')} Hz bowls`;
  const phases = preset.spec.phases;
  if (phases.every((p) => p.beatHz === 0)) return `${phases.map((p) => hzLabel(p.carrierHz)).join(' → ')} Hz · steady pitches`;
  const modes = [...new Set(phases.map((p) => p.mode ?? 'binaural'))];
  return `${phases.map((p) => hzLabel(p.beatHz)).join(' → ')} Hz · ${modes.join(' / ')}`;
}

export function presetMatchesSearch(preset: Preset, query: string): boolean {
  const words = query.toLowerCase().trim().split(/\s+/);
  const text = [preset.title, preset.id, preset.category, presetSoundDescription(preset), presetSignalSummary(preset), ...preset.spec.phases.map(phaseSoundLabel)].join(' ').toLowerCase();
  return words.every((word) => text.includes(word));
}

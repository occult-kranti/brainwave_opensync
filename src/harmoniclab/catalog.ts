import type { HarmonicRecipe } from './model';

export const CHOICES = [
  { id: 'unison', label: 'Single note' }, { id: 'fifth', label: 'Open fifth' },
  { id: 'major', label: 'Major triad' }, { id: 'minor', label: 'Minor triad' },
  { id: 'dominant7', label: 'Dominant seventh' }, { id: 'harmonic', label: 'Harmonic series · 1–7' },
  { id: 'phi', label: 'Golden-ratio intervals' }, { id: 'custom', label: 'Custom ratios' },
] as const;

export const TIMBRES = [
  { label: 'Sine', values: [1, 0, 0, 0, 0, 0, 0, 0] },
  { label: 'Warm', values: [1, .35, .2, .1, .06, .03, 0, 0] },
  { label: 'Odd partials', values: [1, 0, .33, 0, .2, 0, .14, 0] },
  { label: 'Bright', values: [1, .5, .33, .25, .2, .17, .14, .125] },
] as const;

export const HARMONIC_SOURCES = [
  { label: 'UNSW · harmonics, temperament, and beats', url: 'https://newt.phys.unsw.edu.au/jw/tartini-temperament.html', scope: 'Grade A · acoustic principles and tuning calculations' },
  { label: 'Web Audio specification · digital audio', url: 'https://www.w3.org/TR/webaudio/', scope: 'Grade A · browser audio implementation' },
  { label: 'WHO–ITU H.870 · listening level and exposure', url: 'https://www.itu.int/rec/T-REC-H.870', scope: 'Level and duration guidance; digital gain is not a measured sound level' },
] as const;

export function parseRatios(text: string): number[] {
  const tokens = text.trim().split(/[\s,]+/).filter(Boolean);
  if (tokens.length < 1 || tokens.length > 7) throw new Error('Enter one to seven ratios, separated by commas.');
  return tokens.map((token) => {
    if (!/^\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?$/.test(token)) throw new Error('Use positive numbers or fractions, such as 1, 5/4, 3/2.');
    const [a, b = '1'] = token.split('/');
    const value = Number(a) / Number(b);
    if (!Number.isFinite(value) || value < .25 || value > 8) throw new Error('Every ratio must be between 0.25 and 8.');
    return value;
  });
}

export function recipeTitle(recipe: HarmonicRecipe): string {
  return `${CHOICES.find((x) => x.id === recipe.chord)?.label ?? 'Chord'} · ${recipe.rootHz} Hz · ${recipe.tuning}`;
}

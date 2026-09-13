import { readJson, writeJson, STORAGE_KEYS } from '@/lib/storage';
import { validateRecipe, type HarmonicRecipe } from './model';

export function readRecipes(): HarmonicRecipe[] {
  const stored = readJson<unknown>(STORAGE_KEYS.harmonicRecipes, 1);
  if (!Array.isArray(stored)) return [];
  return stored.slice(0, 12).flatMap((item) => {
    try { return [validateRecipe(item)]; } catch { return []; }
  });
}

export function saveRecipes(recipes: HarmonicRecipe[]): boolean {
  return writeJson(STORAGE_KEYS.harmonicRecipes, 1, recipes.slice(0, 12).map(validateRecipe));
}

export function encodeRecipe(recipe: HarmonicRecipe): Uint8Array {
  return new TextEncoder().encode(JSON.stringify({ format: 'opensync-harmonic-recipe', version: 1, recipe: validateRecipe(recipe) }, null, 2));
}

export function decodeRecipe(json: string): HarmonicRecipe {
  if (json.length > 32768) throw new Error('Choose an OpenSync recipe smaller than 32 KB.');
  const value: unknown = JSON.parse(json);
  if (!value || typeof value !== 'object' || !('format' in value) || value.format !== 'opensync-harmonic-recipe' || !('version' in value) || value.version !== 1 || !('recipe' in value)) throw new Error('This is not a supported OpenSync harmonic recipe.');
  return validateRecipe(value.recipe);
}

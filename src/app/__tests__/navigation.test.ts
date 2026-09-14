import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routes';
import { DISCLOSURE_CATEGORIES, NAVIGATION_ENTRIES, getPrimaryNavRoutes, getSafetyRoute, entriesForCategory, navigationForPath, navigationMatches } from '../navigation';

describe('task navigation', () => {
  it('covers every route once with a plain purpose and preserves primary listening paths', () => {
    expect(NAVIGATION_ENTRIES).toHaveLength(ROUTES.length);
    expect(new Set(NAVIGATION_ENTRIES.map((entry) => entry.route.path))).toEqual(new Set(ROUTES.map((route) => route.path)));
    expect(getPrimaryNavRoutes().map((route) => route.path)).toEqual(['/', '/presets', '/studio']);
    const disclosed = DISCLOSURE_CATEGORIES.flatMap((category) => entriesForCategory(category.id)).filter((entry) => entry.route.path !== getSafetyRoute().path);
    expect([...getPrimaryNavRoutes(), ...disclosed.map((entry) => entry.route), getSafetyRoute()]).toHaveLength(ROUTES.length);
    for (const entry of NAVIGATION_ENTRIES) expect(entry.description.length).toBeGreaterThan(10);
  });

  it('distinguishes creating, recording analysis, and advanced sleep experiments', () => {
    expect(navigationForPath('/library')?.title).toBe('Frequency reference');
    expect(navigationForPath('/library')?.category).toBe('create');
    expect(navigationForPath('/sample-lab')?.title).toBe('Recording analysis');
    expect(navigationForPath('/analyzer')?.title).toBe('Live analyzer');
    expect(navigationForPath('/dream')?.category).toBe('experiments');
    expect(navigationForPath('/unknown')).toBeUndefined();
  });

  it.each([
    ['chord', '/harmonics'], ['recording', '/sample-lab'], ['audio files', '/sample-lab'], ['Monroe', '/sound-methods'],
    ['Bashar', '/presets'], ['noise', '/studio'], ['sample lab', '/sample-lab'],
    ['frequency library', '/library'], ['sleep & dream', '/dream'], ['  GOLDEN   ratio ', '/channeled'],
  ])('finds %s through familiar words or old page names', (query, path) => {
    expect(navigationMatches(navigationForPath(path)!, query)).toBe(true);
  });

  it('requires every query word and supports empty search', () => {
    const entry = navigationForPath('/harmonics')!;
    expect(navigationMatches(entry, '')).toBe(true);
    expect(navigationMatches(entry, 'chord microphone')).toBe(false);
  });
});

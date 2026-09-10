import { describe, expect, it } from 'vitest';
import { BOTTOM_TAB_ROUTES, CORE_ROUTES, RESEARCH_ROUTES, ROUTES, iconForModule, routeByPath } from '../routes';
import { APP_SCREENS, FEATURES } from '@/docs/features';

describe('route registry', () => {
  it('has unique paths and labels, and every screen in the feature docs (and vice versa)', () => {
    expect(new Set(ROUTES.map((r) => r.path)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map((r) => r.label)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map((r) => r.path))).toEqual(new Set(APP_SCREENS.map((s) => s.route)));
    const modules = new Set(FEATURES.map((f) => f.module));
    for (const r of ROUTES) expect(modules.has(r.module)).toBe(true);
  });

  it('keeps the phone bottom bar to at most four tabs and splits core/research cleanly', () => {
    expect(BOTTOM_TAB_ROUTES.length).toBeLessThanOrEqual(4);
    expect(BOTTOM_TAB_ROUTES.map((r) => r.path)).toEqual(['/', '/studio', '/library', '/safety']);
    expect(CORE_ROUTES.length + RESEARCH_ROUTES.length).toBe(ROUTES.length);
    expect(routeByPath('/studio')?.label).toBe('STUDIO');
    expect(routeByPath('/nope')).toBeUndefined();
    expect(iconForModule('Studio')).toBe(routeByPath('/studio')?.icon);
  });
});

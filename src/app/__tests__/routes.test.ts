import { describe, expect, it } from 'vitest';
import { BOTTOM_TAB_ROUTES, HOME_ROUTES, TOOL_ROUTES, HELP_ROUTES, RESEARCH_ROUTES, ROUTES, iconForModule, routeByPath } from '../routes';
import { APP_SCREENS, FEATURES } from '@/docs/features';

describe('route registry', () => {
  it('has unique paths and labels, and every screen in the feature docs (and vice versa)', () => {
    expect(new Set(ROUTES.map((r) => r.path)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map((r) => r.label)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map((r) => r.path))).toEqual(new Set(APP_SCREENS.map((s) => s.route)));
    const modules = new Set(FEATURES.map((f) => f.module));
    for (const r of ROUTES) expect(modules.has(r.module)).toBe(true);
  });

  it('keeps four phone tabs and groups tools, reference pages and help without duplicates', () => {
    expect(BOTTOM_TAB_ROUTES.length).toBeLessThanOrEqual(4);
    expect(BOTTOM_TAB_ROUTES.map((r) => r.path)).toEqual(['/', '/presets', '/studio', '/safety']);
    expect([...HOME_ROUTES, ...TOOL_ROUTES, ...RESEARCH_ROUTES, ...HELP_ROUTES]).toEqual(ROUTES);
    expect(HOME_ROUTES.map((r) => r.path)).toEqual(['/']);
    for (const path of ['/studio', '/presets', '/library', '/harmonics', '/sound-methods', '/sonic-lab', '/sample-lab', '/analyzer', '/cymatics', '/dream', '/quicklab', '/lab', '/replication']) {
      expect(routeByPath(path)?.group, path).toBe('tools');
    }
    for (const path of ['/levels', '/knowledge', '/channeled', '/theory', '/critique', '/hypotheses', '/programs']) {
      expect(routeByPath(path)?.group, path).toBe('research');
    }
    expect(HELP_ROUTES.map((r) => r.path)).toEqual(['/safety', '/guide', '/about']);
    expect(routeByPath('/studio')?.label).toBe('STUDIO');
    expect(routeByPath('/nope')).toBeUndefined();
    expect(iconForModule('Studio')).toBe(routeByPath('/studio')?.icon);
  });
});

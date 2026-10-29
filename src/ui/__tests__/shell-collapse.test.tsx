// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { AppShell } from '../layout/AppShell';
import { SessionProvider } from '../session/SessionContext';
import { seedAdvisoryAck } from '@/test/helpers';
import { ROUTES } from '@/app/routes';
import { DISCLOSURE_CATEGORIES } from '@/app/navigation';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// happy-dom's WAAPI implementation rejects on Animation.cancel during
// framer-motion unmount cleanup; force framer-motion onto its rAF fallback.
if (typeof Element !== 'undefined') {
  (Element.prototype as unknown as Record<string, unknown>).animate = undefined;
}

/** Mock a phone/desktop viewport: settable innerWidth + matchMedia spy. */
function mockViewport(width: number) {
  const mql = {
    matches: width < 768,
    media: '(max-width: 767px)',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  };
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
}

let roots: Root[] = [];
let containers: HTMLElement[] = [];

async function renderShell(width: number, path = '/safety') {
  mockViewport(width);
  const container = document.createElement('div');
  document.body.appendChild(container);
  containers.push(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <SessionProvider>
          <AppShell>
            <div>page content</div>
          </AppShell>
        </SessionProvider>
      </MemoryRouter>,
    );
  });
  return container;
}

async function click(el: HTMLElement) {
  await act(async () => {
    el.click();
  });
}

async function pressKey(key: string, init: KeyboardEventInit = {}) {
  await act(async () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
  });
}

beforeEach(() => {
  roots = [];
  containers = [];
  window.localStorage.clear();
  seedAdvisoryAck();
});

afterEach(async () => {
  for (const root of roots) {
    await act(async () => root.unmount());
  }
  for (const c of containers) c.remove();
  document.body.innerHTML = '';
  window.localStorage.clear();
});

describe('Archive shared navigation', () => {
  it.each(['/', '/studio', '/cymatics', '/channeled', '/sample-lab'])('keeps the same primary destinations on %s', async path => {
    const c = await renderShell(1280, path);
    const nav = c.querySelector('[data-testid="observatory-navigation"]')!;
    for(const dest of ['/', '/presets', '/studio', '/cymatics', '/research-hub']) expect(nav.querySelector(`a[href="${dest}"]`)).not.toBeNull();
    expect(c.querySelector('[data-testid="module-rail"]')).toBeNull();
    if(path !== '/') expect(c.querySelector(`.workspace-subnav a[href="${path}"]`)?.getAttribute('aria-current')).toBe('page');
    expect(c.querySelector('button[title^="Stop all sound"]')).not.toBeNull();
  });
  it('all routes remain reachable through the grouped drawer', async () => {
    const c = await renderShell(1280);
    await click(c.querySelector<HTMLElement>('[data-testid="observatory-navigation"] button')!);
    const drawer = c.querySelector('[data-testid="more-drawer"]')!;
    for (const category of DISCLOSURE_CATEGORIES) {
      const toggle=drawer.querySelector<HTMLElement>(`[data-testid="drawer-${category.id}-toggle"]`);
      if(toggle?.getAttribute('aria-expanded')==='false') await click(toggle);
    }
    for(const route of ROUTES) expect(drawer.querySelector(`a[href="${route.path}"]`),route.path).not.toBeNull();
  });
  it('keyboard opens all tools and Escape closes the drawer', async () => {
    const c = await renderShell(1280);
    await pressKey('[');
    expect(c.querySelector('[data-testid="more-drawer"]')).not.toBeNull();
    expect(c.querySelector('.archive-workspace')!.hasAttribute('inert')).toBe(true);
    expect(c.querySelector('.listening-sidebar')!.hasAttribute('inert')).toBe(true);
    expect(c.querySelector('[data-testid="more-drawer"]')!.getAttribute('aria-labelledby')).toBe('site-navigation-title');
    await pressKey('Escape');
    await act(async()=>{await new Promise(resolve=>setTimeout(resolve,400));});
    expect(c.querySelector('[data-testid="more-drawer"]')).toBeNull();
    expect(c.querySelector('.archive-workspace')!.hasAttribute('inert')).toBe(false);
  });
  it('legacy saved rail state cannot hide archive navigation', async () => {
    window.localStorage.setItem('open-sync:sidebar','hidden');
    const c = await renderShell(1280);
    expect(c.querySelector('[data-testid="observatory-navigation"]')).not.toBeNull();
    expect(window.localStorage.getItem('open-sync:sidebar')).toBe('hidden');
  });
  it('mobile keeps its primary tabs and immediate stop', async () => {
    const c = await renderShell(390);
    expect(c.querySelector('[data-testid="mobile-bottom-bar"]')).not.toBeNull();
    expect(c.querySelector('[data-testid="mobile-panic"]')).not.toBeNull();
    expect(c.querySelector('[data-testid="module-rail"]')).toBeNull();
  });
});

/**
 * V3 collapsible-sidebar tests (happy-dom pattern from mobile-shell.test.tsx):
 *  - three states render correctly: full 240px labels / 64px icon strip with
 *    tooltips / 0px hidden with a 16px amber-edge reopen handle
 *  - chevron toggle + `[` keyboard shortcut cycle the states
 *  - localStorage persistence round-trip
 *  - all routes reachable in full AND icon states after expanding research
 *  - panic reachable in every state; rail footer carries density toggle +
 *    collapse control; a11y attributes on the toggles
 *  - mobile shell (bottom bar) is unaffected by sidebar state
 *
 * Run: `npm test`.
 */
// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { AppShell } from '../layout/AppShell';
import { SessionProvider } from '../session/SessionContext';
import { seedAdvisoryAck } from '@/test/helpers';
import { RESEARCH_ROUTES } from '@/app/routes';
import { DISCLOSURE_CATEGORIES } from '@/app/navigation';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// happy-dom's WAAPI implementation rejects on Animation.cancel during
// framer-motion unmount cleanup; force framer-motion onto its rAF fallback.
if (typeof Element !== 'undefined') {
  (Element.prototype as unknown as Record<string, unknown>).animate = undefined;
}

const ALL_ROUTE_PATHS = [
  '/',
  '/studio',
  '/library',
  '/presets',
  '/levels',
  '/analyzer',
  '/cymatics',
  '/dream',
  '/replication',
  '/safety',
  '/knowledge',
  '/about',
  '/guide',
  '/lab',
  '/critique',
  '/hypotheses',
  '/programs',
  '/quicklab',
  '/theory',
  '/sonic-lab',
  '/sample-lab',
  '/harmonics',
  '/channeled',
  '/sound-methods',
];

const STORAGE_KEY = 'open-sync:sidebar';

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

async function renderShell(width: number, path = '/') {
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

function railOf(c: HTMLElement) {
  return c.querySelector<HTMLElement>('[data-testid="module-rail"]');
}

function railHrefs(c: HTMLElement) {
  return new Set(
    Array.from(railOf(c)!.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')),
  );
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

describe('V3 collapsible sidebar — three states', () => {
  it('full state: primary tasks visible, specialized groups collapsed, every route reachable', async () => {
    const c = await renderShell(1280);
    const rail = railOf(c)!;
    expect(rail).toBeTruthy();
    expect(rail.dataset.state).toBe('full');
    expect(rail.style.width).toBe('240px');
    // Width animates with the motion token.
    expect(rail.style.transition).toContain('var(--motion-2)');
    // Labels visible.
    expect(rail.textContent).toContain('STUDIO');
    expect(rail.textContent).not.toContain('REPLICATION BAY');
    // Practical tools are visible; references are one native-button disclosure.
    const researchToggle = rail.querySelector<HTMLButtonElement>('[data-testid="rail-research-toggle"]')!;
    expect(researchToggle.tagName).toBe('BUTTON');
    expect(researchToggle.type).toBe('button');
    expect(researchToggle.getAttribute('aria-expanded')).toBe('false');
    const researchContent = document.getElementById(researchToggle.getAttribute('aria-controls')!)!;
    expect(researchContent.hidden).toBe(true);
    expect([...railHrefs(c)]).toEqual(['/', '/presets', '/studio', '/safety']);
    for (const route of RESEARCH_ROUTES) expect(railHrefs(c).has(route.path)).toBe(false);
    researchToggle.focus();
    await click(researchToggle);
    expect(document.activeElement).toBe(researchToggle);
    expect(researchContent.hidden).toBe(false);
    expect(researchToggle.getAttribute('aria-expanded')).toBe('true');
    for (const category of DISCLOSURE_CATEGORIES.filter((category) => category.id !== 'research')) {
      await click(rail.querySelector<HTMLElement>(`[data-testid="rail-${category.id}-toggle"]`)!);
    }
    // Expanding all task groups makes every destination reachable, without duplicates.
    const hrefs = railHrefs(c);
    expect(hrefs.size).toBe(ALL_ROUTE_PATHS.length);
    for (const p of ALL_ROUTE_PATHS) expect(hrefs.has(p), `rail links to ${p}`).toBe(true);
    // Footer: density toggle + collapse control + full panic button.
    const footer = c.querySelector('[data-testid="rail-footer"]')!;
    expect(footer.querySelector('[data-testid="density-toggle"]')).toBeTruthy();
    const toggle = footer.querySelector<HTMLElement>('[data-testid="rail-collapse-toggle"]')!;
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBeTruthy();
    expect(toggle.getAttribute('aria-controls')).toBe('module-rail');
    expect(rail.querySelector('button[title^="Stop all sound"], button[aria-label^="Stop all sound"]')).toBeTruthy();
    // No reopen handle while the rail is visible.
    expect(c.querySelector('[data-testid="rail-reopen-handle"]')).toBeNull();
  });

  it('icon state: named research disclosure, named tool icons, all routes reachable, panic reachable', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'icon');
    const c = await renderShell(1280);
    const rail = railOf(c)!;
    expect(rail.dataset.state).toBe('icon');
    expect(rail.style.width).toBe('64px');
    // Labels hidden.
    expect(rail.textContent).not.toContain('STUDIO');
    expect(rail.textContent).not.toContain('Stop all sound');
    const researchToggle = rail.querySelector<HTMLButtonElement>('[data-testid="rail-research-toggle"]')!;
    expect(researchToggle.getAttribute('aria-label')).toBe('Theory & research');
    expect(researchToggle.getAttribute('title')).toBe('Show Theory & research');
    expect(researchToggle.getAttribute('aria-expanded')).toBe('false');
    expect(rail.querySelector('a[href="/theory"]')).toBeNull();
    for (const category of DISCLOSURE_CATEGORIES) {
      await click(rail.querySelector<HTMLElement>(`[data-testid="rail-${category.id}-toggle"]`)!);
    }
    // Every route can still be reached, with tooltip and accessible name.
    const links = Array.from(rail.querySelectorAll('a[href]'));
    expect(links.length).toBe(ALL_ROUTE_PATHS.length);
    const hrefs = new Set(links.map((a) => a.getAttribute('href')));
    for (const p of ALL_ROUTE_PATHS) expect(hrefs.has(p), `rail links to ${p}`).toBe(true);
    for (const a of links) {
      expect(a.getAttribute('title')).toBeTruthy();
      expect(a.getAttribute('aria-label')).toBe(a.getAttribute('title'));
    }
    // Footer still carries density toggle + collapse control.
    const footer = c.querySelector('[data-testid="rail-footer"]')!;
    expect(footer.querySelector('[data-testid="density-toggle"]')).toBeTruthy();
    expect(footer.querySelector('[data-testid="rail-collapse-toggle"]')).toBeTruthy();
    // Panic reachable: icon panic in rail footer + status-bar panic.
    const railPanic = footer.querySelector('button[title^="Stop all sound"], button[aria-label^="Stop all sound"]');
    expect(railPanic).toBeTruthy();
    expect(c.querySelector('button[title^="Stop all sound"], button[aria-label^="Stop all sound"]')).toBeTruthy();
  });

  it('reveals a theory deep link, keeps its cue when collapsed, and reveals another theory destination', async () => {
    const c = await renderShell(1280, '/channeled');
    const rail = railOf(c)!;
    const toggle = rail.querySelector<HTMLButtonElement>('[data-testid="rail-research-toggle"]')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(rail.querySelector('a[href="/channeled"]')!.getAttribute('aria-current')).toBe('page');
    await click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(rail.textContent).toContain('Current page: Channeled Sources');
    expect(toggle.getAttribute('aria-label')).toContain('current page: Channeled Sources');
    // A page reached through the palette also reveals its position in navigation.
    await pressKey('k', { ctrlKey: true });
    const item = Array.from(document.querySelectorAll<HTMLElement>('[cmdk-item]')).find((el) =>
      el.getAttribute('data-value') === '/theory',
    )!;
    await click(item);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(rail.querySelector('a[href="/theory"]')!.getAttribute('aria-current')).toBe('page');
    await click(rail.querySelector<HTMLElement>('a[href="/studio"]')!);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(rail.querySelector('a[href="/theory"]')).toBeNull();
  });

  it('opens the active theory group in the icon rail and keeps a named cue when collapsed', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'icon');
    const c = await renderShell(1280, '/channeled');
    const rail = railOf(c)!;
    const toggle = rail.querySelector<HTMLButtonElement>('[data-testid="rail-research-toggle"]')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(rail.querySelector('a[href="/channeled"]')!.getAttribute('aria-current')).toBe('page');
    await click(toggle);
    expect(toggle.getAttribute('aria-label')).toContain('current page: Channeled Sources');
    expect(toggle.getAttribute('title')).toContain('current page: Channeled Sources');
  });

  it('hidden state: 0px rail, 16px amber-edge reopen handle restores full, panic still reachable', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'hidden');
    const c = await renderShell(1280);
    const rail = railOf(c)!;
    expect(rail.dataset.state).toBe('hidden');
    expect(rail.style.width).toBe('0px');
    // Reopen handle: slim, left-pinned, amber edge, a11y-wired.
    const handle = c.querySelector<HTMLElement>('[data-testid="rail-reopen-handle"]')!;
    expect(handle).toBeTruthy();
    expect(handle.className).toContain('rail-reopen-handle');
    expect(handle.getAttribute('aria-label')).toBeTruthy();
    expect(handle.getAttribute('aria-expanded')).toBe('false');
    expect(handle.getAttribute('aria-controls')).toBe('module-rail');
    // Panic reachable via the status bar.
    expect(c.querySelector('button[title^="Stop all sound"], button[aria-label^="Stop all sound"]')).toBeTruthy();
    // Handle click restores the full rail.
    await click(handle);
    expect(railOf(c)!.dataset.state).toBe('full');
    expect(railOf(c)!.style.width).toBe('240px');
    expect(c.querySelector('[data-testid="rail-reopen-handle"]')).toBeNull();
  });
});

describe('V3 collapsible sidebar — toggle + keyboard + persistence', () => {
  it('chevron button cycles full → icon → hidden → full', async () => {
    const c = await renderShell(1280);
    const toggle = () => c.querySelector<HTMLElement>('[data-testid="rail-collapse-toggle"]')!;
    expect(railOf(c)!.dataset.state).toBe('full');
    await click(toggle());
    expect(railOf(c)!.dataset.state).toBe('icon');
    await click(toggle());
    expect(railOf(c)!.dataset.state).toBe('hidden');
    expect(c.querySelector('[data-testid="rail-reopen-handle"]')).toBeTruthy();
  });

  it("'[' keyboard shortcut cycles the states and persists each step", async () => {
    const c = await renderShell(1280);
    expect(railOf(c)!.dataset.state).toBe('full');
    await pressKey('[');
    expect(railOf(c)!.dataset.state).toBe('icon');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('icon');
    await pressKey('[');
    expect(railOf(c)!.dataset.state).toBe('hidden');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('hidden');
    await pressKey('[');
    expect(railOf(c)!.dataset.state).toBe('full');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('full');
  });

  it("'[' inside a text input does not collapse the sidebar", async () => {
    const c = await renderShell(1280);
    const input = document.createElement('input');
    c.appendChild(input);
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: '[', bubbles: true }));
    });
    expect(railOf(c)!.dataset.state).toBe('full');
    input.remove();
  });

  it('persistence round-trip: stored state wins on reload and unknown values fall back to full', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'hidden');
    const c = await renderShell(1440);
    expect(railOf(c)!.dataset.state).toBe('hidden');
    await act(async () => roots[roots.length - 1].unmount());
    roots.pop();
    containers.pop()!.remove();

    window.localStorage.setItem(STORAGE_KEY, 'garbage');
    const c2 = await renderShell(1440);
    expect(railOf(c2)!.dataset.state).toBe('full');
  });
});

describe('V3 collapsible sidebar — command palette + mobile isolation', () => {
  it('finds a recording tool by its old name, supports clear search, and opens its category', async () => {
    const c = await renderShell(1280);
    await pressKey('k', { ctrlKey: true });
    const palette = document.querySelector<HTMLElement>('[data-testid="command-palette"]')!;
    const input = palette.querySelector<HTMLInputElement>('input')!;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    const search = async (value: string) => {
      await act(async () => {
        setValue.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    };
    await search('does-not-exist');
    expect(palette.textContent).toContain('No tools or actions match');
    const clear = Array.from(palette.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent === 'Clear search')!;
    await click(clear);
    expect(input.value).toBe('');
    await search('sample lab');
    expect(palette.querySelectorAll('[cmdk-item]')).toHaveLength(1);
    const recording = palette.querySelector<HTMLElement>('[cmdk-item][data-value="/sample-lab"]')!;
    expect(recording.textContent).toContain('Recording analysis');
    await click(recording);
    expect(railOf(c)!.querySelector('[data-testid="rail-analyze-toggle"]')!.getAttribute('aria-expanded')).toBe('true');
    expect(railOf(c)!.querySelector('a[href="/sample-lab"]')!.getAttribute('aria-current')).toBe('page');
  });

  it("palette lists 'TOGGLE SIDEBAR' and running it collapses the rail", async () => {
    const c = await renderShell(1280);
    expect(c.querySelector('[data-testid="command-palette"]')).toBeNull();
    await pressKey('k', { ctrlKey: true });
    const palette = document.querySelector('[data-testid="command-palette"]')!;
    expect(palette).toBeTruthy();
    const item = Array.from(palette.querySelectorAll('[cmdk-item]')).find((el) =>
      el.textContent?.includes('TOGGLE SIDEBAR'),
    ) as HTMLElement | undefined;
    expect(item).toBeTruthy();
    await click(item!);
    expect(railOf(c)!.dataset.state).toBe('icon');
  });

  it('mobile shell is unaffected: bottom bar intact, no rail, no reopen handle, "[" is inert', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'hidden');
    const c = await renderShell(390);
    expect(c.querySelector('[data-testid="mobile-bottom-bar"]')).toBeTruthy();
    expect(c.querySelector('[data-testid="mobile-panic"]')).toBeTruthy();
    expect(c.querySelector('[data-testid="module-rail"]')).toBeNull();
    expect(c.querySelector('[data-testid="rail-reopen-handle"]')).toBeNull();
    await pressKey('[');
    expect(c.querySelector('[data-testid="module-rail"]')).toBeNull();
    expect(c.querySelector('[data-testid="mobile-bottom-bar"]')).toBeTruthy();
  });
});

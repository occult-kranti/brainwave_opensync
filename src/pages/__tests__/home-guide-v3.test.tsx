// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { ROUTES } from '@/app/routes';
import Home from '@/pages/Home';
import Guide from '@/pages/Guide';
import ResearchHub from '@/pages/ResearchHub';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
// Match the existing UI harness: happy-dom's native animation cancellation
// rejects on unmount even when the component cleanup is correct.
(Element.prototype as unknown as Record<string, unknown>).animate = undefined;

let root: Root | undefined;
let container: HTMLDivElement;

async function mount(page: React.ReactNode) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root!.render(<MemoryRouter>{page}</MemoryRouter>));
  return container;
}

async function search(value: string) {
  const input = container.querySelector('input[type="search"]') as HTMLInputElement;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  container?.remove();
  root = undefined;
});

describe('Home task paths and discovery', () => {
  it('offers a direct listening path, a small intention chooser and the sound workshop', async () => {
    const page = await mount(<Home />);
    expect(page.querySelector('a')!.getAttribute('href')).toBe('/listen?preset=practice-soft-landing');
    expect(page.querySelector('.moment-result a[href="/meditate?goal=unwind&minutes=10"]')).not.toBeNull();
    expect(page.querySelector('a[href="/studio"]')).not.toBeNull();
    expect(page.querySelector('a[href="/research-hub#tools"]')).not.toBeNull();
    expect(page.querySelector('a[href="/previous/"]')).not.toBeNull();
    expect(page.querySelector('canvas')?.getAttribute('aria-label')).toContain('Generative art');
    await act(async () => { Array.from(page.querySelectorAll('button')).find(b => b.textContent === 'Self-hypnosis')!.click(); });
    await act(async () => { Array.from(page.querySelectorAll('button')).find(b => b.textContent === '20 min')!.click(); });
    expect(page.querySelector('.moment-result a')?.getAttribute('href')).toBe('/meditate?goal=hypnosis&minutes=20');
  });

  it('retains every page in a browsable directory with research initially collapsed', async () => {
    const page = await mount(<ResearchHub />);
    const directory = page.querySelector('.home-directory')!;
    for (const route of ROUTES.filter((entry) => entry.path !== '/')) {
      expect(directory.querySelector(`a[href="${route.path}"]`), route.path).not.toBeNull();
    }
    expect(page.querySelector<HTMLDetailsElement>('[data-testid="home-research"]')?.open).toBe(false);
    expect(directory.textContent).not.toContain('LOWEST GRADE');
    expect(directory.querySelector('[title*="evidence"]')).toBeNull();
  });

  it('finds former tool names and exposes matching research without requiring prior category knowledge', async () => {
    await mount(<ResearchHub />);
    await search('Sample Lab');
    const directory = container.querySelector('.home-directory')!;
    expect(directory.querySelector('a[href="/sample-lab"]')).not.toBeNull();
    expect(directory.querySelector('a[href="/studio"]')).toBeNull();
    await search('Bashar');
    expect(directory.querySelector('a[href="/channeled"]')).not.toBeNull();
    expect(container.querySelector<HTMLDetailsElement>('[data-testid="home-research"]')?.open).toBe(true);
    await search('');
    expect(container.querySelector<HTMLDetailsElement>('[data-testid="home-research"]')?.open).toBe(false);
  });

  it('offers a direct recovery when search has no results', async () => {
    await mount(<ResearchHub />);
    await search('no-such-tool-zzzzz');
    expect(container.querySelector('[role="status"]')?.textContent).toBe('0 pages found');
    const clear = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Clear search')!;
    await act(async () => clear.click());
    expect(container.querySelector('.home-directory a[href="/presets"]')).not.toBeNull();
    expect(container.querySelector<HTMLInputElement>('input')?.value).toBe('');
  });
});

describe('Guide task help and optional details', () => {
  it('offers ordinary tasks before collapsed full instructions and keeps evidence scope in simple explanations', async () => {
    const page = await mount(<Guide />);
    expect(page.querySelector('.guide-start a[href="/presets"]')).not.toBeNull();
    expect(page.querySelector('.guide-start a[href="/sample-lab"]')).not.toBeNull();
    const modules = Array.from(page.querySelectorAll<HTMLDetailsElement>('.guide-module'));
    expect(modules.length).toBeGreaterThan(10);
    expect(modules.every((module) => !module.open)).toBe(true);
    expect(page.textContent).toContain('Evidence scope:');
    expect(page.textContent).toContain('Binaural engine');
    expect(page.textContent).toContain('Sound dose gauge');
  });

  it('searches technical explanations and opens only matching instruction groups', async () => {
    await mount(<Guide />);
    const allCount = container.querySelectorAll('.guide-module:not(.guide-shortcuts)').length;
    await search('LUFS');
    const modules = Array.from(container.querySelectorAll<HTMLDetailsElement>('.guide-module:not(.guide-shortcuts)'));
    expect(modules.length).toBeGreaterThan(0);
    expect(modules.length).toBeLessThan(allCount);
    expect(modules.every((module) => module.open)).toBe(true);
    const technical = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'DEEP TECHNICAL')!;
    await act(async () => technical.click());
    expect(technical.getAttribute('aria-pressed')).toBe('true');
    expect(container.textContent).toContain('LUFS');
    await search('');
    expect(container.querySelectorAll('.guide-module:not(.guide-shortcuts)').length).toBe(allCount);
    expect(Array.from(container.querySelectorAll<HTMLDetailsElement>('.guide-module:not(.guide-shortcuts)')).every((module) => !module.open)).toBe(true);
  });
});

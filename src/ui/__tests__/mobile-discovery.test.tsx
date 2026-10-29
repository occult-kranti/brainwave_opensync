// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router';
import Presets from '@/pages/Presets';
import Listen from '@/pages/Listen';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { PRESET_COLLECTIONS } from '@/data/presetBrowse';
import { AppShell } from '@/ui/layout/AppShell';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
if (typeof Element !== 'undefined') (Element.prototype as unknown as Record<string, unknown>).animate = undefined;
let root: Root | undefined;
let container: HTMLDivElement;
let search = '';
let session: ReturnType<typeof useSession>;
function Probe() { search = useLocation().search; session = useSession(); return null; }
async function mount(entry: string, component = <Presets />) {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => root!.render(<MemoryRouter initialEntries={[entry]}><SessionProvider><Probe />{component}</SessionProvider></MemoryRouter>));
}
function findButton(label: string) {
  return Array.from(document.querySelectorAll('button')).find(button => button.textContent?.trim() === label || button.getAttribute('aria-label') === label)!;
}
async function change(selector: string, value: string) {
  const field = document.querySelector<HTMLSelectElement>(selector)!;
  await act(async () => { field.value = value; field.dispatchEvent(new Event('change', { bubbles: true })); });
}
beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation(query => ({ matches: query === '(max-width: 767px)', media: query, onchange: null, addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: () => true })) as typeof window.matchMedia;
});
afterEach(async () => { if (root) await act(async () => root!.unmount()); root = undefined; container?.remove(); vi.restoreAllMocks(); });

describe('mobile sound discovery', () => {
  it('uses a single collection chooser and discloses filters without starting audio', async () => {
    await mount('/presets?collection=obe');
    const picker = container.querySelector<HTMLSelectElement>('[aria-label="Preset collection"]')!;
    expect(picker.value).toBe('obe');
    expect(picker.options).toHaveLength(PRESET_COLLECTIONS.length);
    expect(container.querySelector('.preset-collections')).toBeNull();
    expect(container.querySelector('[aria-label="Listening setup"]')).toBeNull();
    expect(container.querySelector('#obe-subgroup')).toBeNull();
    const trigger = findButton('Filters'); trigger.focus();
    await act(async () => trigger.click());
    const sheet = document.querySelector('[role="dialog"]')!;
    expect(sheet.getAttribute('aria-labelledby')).toBe('preset-filter-title');
    expect(document.body.style.overflow).toBe('hidden');
    await change('#obe-subgroup', 'gateway');
    expect(new URLSearchParams(search).get('obe')).toBe('gateway');
    await act(async () => findButton('Show 5 presets').click());
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(document.activeElement).toBe(trigger);
    expect(session.running).toBe(false);
  });

  it('keeps live filter values across dismissal and resets them without changing the collection', async () => {
    await mount('/presets?collection=obe&setup=speakers&obe=astral-imagery');
    await act(async () => container.querySelector<HTMLButtonElement>('.preset-filter-trigger')!.click());
    expect(document.querySelector<HTMLSelectElement>('#obe-subgroup')!.value).toBe('astral-imagery');
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(new URLSearchParams(search).get('obe')).toBe('astral-imagery');
    await act(async () => container.querySelector<HTMLButtonElement>('.preset-filter-trigger')!.click());
    await act(async () => findButton('Reset filters').click());
    expect(search).toBe('?collection=obe');
    expect(document.querySelector<HTMLSelectElement>('#obe-subgroup')!.value).toBe('');
    expect(session.running).toBe(false);
  });

  it('traps keyboard navigation inside the sheet and releases page scrolling after unmount', async () => {
    await mount('/presets');
    await act(async () => findButton('Filters').click());
    const sheet = document.querySelector<HTMLElement>('[role="dialog"]')!;
    const buttons = Array.from(sheet.querySelectorAll<HTMLElement>('button,input,select'));
    for (const node of buttons) Object.defineProperty(node, 'offsetParent', { configurable: true, get: () => sheet });
    const first = buttons[0]; const last = buttons[buttons.length - 1];
    last.focus();
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(first);
    first.focus();
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(last);
    await act(async () => root!.unmount()); root = undefined;
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('shows transport before optional scene controls and keeps the scene collapsed', async () => {
    await mount('/listen?preset=exp-bashar-scale-map', <Listen />);
    const optional = container.querySelector<HTMLDetailsElement>('.listen-scene-options')!;
    expect(optional.open).toBe(false);
    expect(container.querySelector<HTMLDetailsElement>('.listen-purpose')!.open).toBe(false);
    expect(findButton('Play session')).toBeDefined();
    expect(session.running).toBe(false);
    expect(container.querySelector('.listen-controls h1')?.textContent).toContain('Bashar');
  });

  it('does not open an invisible global palette behind a filter sheet, while Stop still works', async () => {
    await mount('/presets', <AppShell><Presets /></AppShell>);
    await act(async () => findButton('Filters').click());
    const filterSheet = document.querySelector('.preset-filter-sheet')!;
    expect(filterSheet.closest('#archive-overlay-root')).not.toBeNull();
    expect(filterSheet.closest('.archive-workspace')).toBeNull();
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true })));
    expect(container.querySelector('[data-testid="command-palette"]')).toBeNull();
    expect(document.querySelector('.preset-filter-sheet')).not.toBeNull();
    await act(async () => document.querySelector<HTMLButtonElement>('.preset-filter-sheet button[title^="Stop all sound"]')!.click());
    expect(document.querySelector('.preset-filter-sheet')).toBeNull();
    expect(session.panicked).toBe(true);
    const stopped = container.querySelector<HTMLElement>('[data-testid="sound-stopped-backdrop"]')!;
    expect(stopped).not.toBeNull();
    expect(Number(stopped.style.zIndex)).toBeGreaterThan(121);
    expect(session.running).toBe(false);
  });
});

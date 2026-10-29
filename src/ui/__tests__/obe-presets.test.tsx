// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router';
import Presets from '@/pages/Presets';
import { PRESETS } from '@/data/presets';
import { matchesCollection } from '@/data/presetBrowse';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement;
let root: Root;
let path: string;
let session: ReturnType<typeof useSession>;
function Probe() { path = useLocation().search; session = useSession(); return null; }
async function mount(entry: string) {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => root.render(<MemoryRouter initialEntries={[entry]}><SessionProvider><Probe /><Presets /></SessionProvider></MemoryRouter>));
}
const cards = () => container.querySelectorAll('[data-testid^="preset-card-"]');
const button = (label: string) => Array.from(container.querySelectorAll('button')).find(b => b.textContent === label || b.getAttribute('aria-label') === label)!;
async function select(selector: string, value: string) {
  const field = container.querySelector<HTMLSelectElement>(selector)!;
  await act(async () => { field.value = value; field.dispatchEvent(new Event('change', { bubbles: true })); });
}
afterEach(async () => { if (root) await act(async () => root.unmount()); container?.remove(); });

describe('OBE library browsing', () => {
  it('opens an explicit group with subgroups and no automatic playback', async () => {
    await mount('/presets?collection=obe');
    expect(cards()).toHaveLength(PRESETS.filter(p => matchesCollection(p, 'obe')).length);
    expect(container.querySelectorAll('.preset-category-group')).toHaveLength(5);
    expect(container.textContent).toContain('have not been shown to cause literal out-of-body travel');
    expect(container.textContent).toContain('Remote-viewing journal');
    expect(session.running).toBe(false);
  });
  it('restores a subgroup deep link while honoring existing listening filters and counts', async () => {
    await mount('/presets?collection=obe&obe=astral-imagery&setup=speakers&duration=night');
    expect(cards()).toHaveLength(1);
    expect(container.querySelector('[data-testid="preset-card-night-astral"]')).not.toBeNull();
    expect(container.querySelector<HTMLSelectElement>('#obe-subgroup')!.value).toBe('astral-imagery');
    const options = Array.from(container.querySelectorAll('#obe-subgroup option')).map(o => o.textContent);
    expect(options).toContain('Astral imagery (1)');
    expect(options).toContain('Gateway-inspired listening (0)');
    await select('#obe-subgroup', 'remote-viewing');
    expect(new URLSearchParams(path).get('setup')).toBe('speakers');
    expect(new URLSearchParams(path).get('duration')).toBe('night');
    expect(container.querySelector('[data-testid="preset-card-night-viewing"]')).not.toBeNull();
  });
  it('clears subgroup filters and resets them when changing collections', async () => {
    await mount('/presets?collection=obe&obe=astral-imagery');
    await act(async () => button('Clear filters').click());
    expect(path).toBe('?collection=obe');
    expect(cards()).toHaveLength(PRESETS.filter(p => matchesCollection(p, 'obe')).length);
    await select('#obe-subgroup', 'gateway');
    await act(async () => button('Math & frequency patterns').click());
    expect(path).toBe('?collection=math');
    expect(container.querySelector('#obe-subgroup')).toBeNull();
    expect(container.querySelector('[data-testid="preset-card-exp-phi-ladder"]')).not.toBeNull();
  });
  it('exposes listening guidance on each card and complete rationale in the details sheet', async () => {
    await mount('/presets?collection=bashar');
    const card = container.querySelector('[data-testid="preset-card-exp-phi-ladder"]')!;
    expect(card.querySelector('details summary')?.textContent).toBe('How to listen & what to expect');
    expect(card.textContent).toContain('What you may notice');
    expect(card.textContent).toContain('How often');
    await act(async () => card.querySelector<HTMLButtonElement>('.preset-details-button')!.click());
    const dialog = container.querySelector('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    for (const text of ['Why this sound', 'What you may notice', 'How to use', 'How often', 'Evidence & limits']) expect(dialog.textContent).toContain(text);
    expect(dialog.querySelector('.preset-guide-sources a')).not.toBeNull();
    expect(session.running).toBe(false);
  });
  it('keeps the evidence filter and infant restriction active in the OBE collection', async () => {
    await mount('/presets?collection=obe&obe=astral-imagery&grade=A');
    expect(cards()).toHaveLength(0);
    await act(async () => button('Clear filters').click());
    await act(async () => session.setGovernor({ infantMode: true }));
    expect(container.querySelector('#obe-subgroup')).toBeNull();
    expect(container.querySelector('[data-testid="preset-card-night-astral"]')).toBeNull();
    expect(container.querySelector('[data-testid="preset-card-infant-womb-hush"]')).not.toBeNull();
  });
});

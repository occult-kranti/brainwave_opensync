// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import PracticePlan from '@/pages/PracticePlan';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let container: HTMLDivElement;
async function mount() {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => root.render(<MemoryRouter><PracticePlan /></MemoryRouter>));
}
async function choose(label: string, value: string) {
  const el = Array.from(container.querySelectorAll('label')).find(l => l.firstChild?.textContent === label)!.querySelector('select')!;
  await act(async () => { el.value = value; el.dispatchEvent(new Event('change', { bubbles: true })); });
}
afterEach(async () => { if (root) await act(async () => root.unmount()); container?.remove(); });

describe('home practice page', () => {
  it('offers a readable two-week draft and separate expandable tape/source guidance', async () => {
    await mount();
    expect(container.querySelector('h1')!.textContent).toBe('Practice at home.');
    expect(container.querySelectorAll('.home-practice-day')).toHaveLength(14);
    expect(container.querySelectorAll('.home-practice-quiet')).toHaveLength(4);
    expect(container.querySelector('.home-practice-week')!.hasAttribute('open')).toBe(true);
    expect(container.querySelectorAll('.home-practice-week')[1].hasAttribute('open')).toBe(false);
    expect(container.querySelector('#practice-sources')!.hasAttribute('open')).toBe(false);
    expect(container.textContent).toContain('no validated OBE dose');
    expect(container.querySelector('audio')).toBeNull();
    await act(async () => container.querySelector<HTMLAnchorElement>('a[href="#practice-sources"]')!.click());
    expect(container.querySelector('#practice-sources')!.hasAttribute('open')).toBe(true);
  });
  it('recalculates the timetable and clears reviewed marks when preferences change', async () => {
    await mount();
    const tick = container.querySelector<HTMLInputElement>('input[type=checkbox]')!;
    await act(async () => tick.click());
    expect(tick.checked).toBe(true);
    await choose('Sessions per week', '3');
    expect(container.querySelectorAll('.home-practice-quiet')).toHaveLength(8);
    expect(container.querySelectorAll('input:checked')).toHaveLength(0);
    await choose('Time available', '10');
    expect(container.querySelector('.home-practice-dose')!.textContent).toContain('5 min audio');
    expect(container.querySelector('.home-practice-day-actions a')!.getAttribute('href')).toBe('/listen?preset=practice-soft-landing');
  });
  it('treats owned recordings as external practice rather than commercial audio hosted here', async () => {
    await mount();
    await choose('What will you use?', 'gateway');
    expect(container.textContent).toContain('instead of cutting a commercial tape');
    await choose('Time available', '45');
    expect(container.querySelector('.home-practice-day h3')!.textContent).toBe('Intro Focus 10');
    expect(container.querySelectorAll('.home-practice-day-actions a')).toHaveLength(0);
    await choose('Foundation to revisit', 'sleep');
    expect(container.querySelector('.home-practice-day-top')!.textContent).toContain('At bedtime');
  });
});

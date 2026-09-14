// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation, useNavigate, type NavigateFunction } from 'react-router';
import Presets from '@/pages/Presets';
import { PRESETS } from '@/data/presets';
import { BASHAR_PRESETS } from '@/channeled/bashar';
import { PHI_LADDER_HZ } from '@/channeled/mapping';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { clearAdvisoryAck } from '@/test/helpers';
import { phaseSoundLabel, presetMatchesSearch, presetSignalSummary } from '@/ui/components/presetPresentation';
import type { PreviewManifest } from '@/ui/session/previewManifest';

const manifestState = vi.hoisted(() => ({ current: null as PreviewManifest | null }));
vi.mock('@/ui/session/previewManifest', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/ui/session/previewManifest')>(),
  usePreviewManifest: () => manifestState.current,
}));
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
if (typeof Element !== 'undefined') (Element.prototype as unknown as Record<string, unknown>).animate = undefined;

let container: HTMLDivElement;
let root: Root;
let session: ReturnType<typeof useSession>;
let path: string;
let navigate: NavigateFunction;
function Probe() { session = useSession(); navigate = useNavigate(); const location = useLocation(); path = location.pathname + location.search; return null; }
async function mount(entry = '/presets?collection=bashar') {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => root.render(<MemoryRouter initialEntries={[entry]}><SessionProvider><Probe /><Routes>
    <Route path="/presets" element={<Presets />} /><Route path="/studio" element={<p>Studio</p>} />
    <Route path="/channeled" element={<p>Source analysis</p>} />
  </Routes></SessionProvider></MemoryRouter>));
}
function card(id: string) { return container.querySelector<HTMLElement>(`[data-testid="preset-card-${id}"]`)!; }
function button(text: string, within: ParentNode = container) { return Array.from(within.querySelectorAll('button')).find((b) => b.textContent === text)!; }
async function details(id: string) { await act(async () => button('DETAILS & STEPS', card(id)).click()); }
async function input(value: string) {
  const field = container.querySelector<HTMLInputElement>('input[type="search"]')!;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  await act(async () => { setter.call(field, value); field.dispatchEvent(new Event('input', { bubbles: true })); });
}

describe('Bashar preset collection', () => {
  beforeEach(() => {
    manifestState.current = null;
    vi.spyOn(LiveEngine.prototype, 'playBuffer').mockReturnValue(true);
    vi.spyOn(LiveEngine.prototype, 'prepare').mockReturnValue(true);
    vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
  });
  afterEach(async () => {
    if (root) await act(async () => root.unmount());
    container?.remove(); vi.restoreAllMocks();
  });

  it('opens four practical sounds directly, with no automatic playback', async () => {
    await mount();
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(4);
    for (const p of BASHAR_PRESETS) expect(card(p.id)).toBeTruthy();
    expect(container.textContent).toContain('chosen k = 5,000, anchored on 200,000 ↔ 40 Hz');
    expect(card('exp-phi-ladder').textContent).toContain('110 → 177.98 → 287.98 → 465.97 → 753.95 Hz');
    expect(card('exp-bashar-scale-map').textContent).toContain('binaural / monaural');
    expect(card('exp-phi-bowl-chord').textContent).toContain('steady 110 Hz root');
    expect(container.querySelector('article[role="button"]')).toBeNull();
    expect(session.running).toBe(false);
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
  });

  it('starts with three sounds and makes the full and Bashar collections explicit', async () => {
    await mount('/presets');
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(3);
    for (const id of ['relax-alpha-ease', 'exp-phi-ladder', 'exp-phi-bowl-chord']) expect(card(id)).toBeTruthy();
    expect(container.querySelector<HTMLDetailsElement>('.preset-more-filters')!.open).toBe(false);
    await act(async () => button('Browse all presets').click());
    expect(path).toBe('/presets?collection=all');
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(PRESETS.length);
    await act(async () => button('Bashar sounds').click());
    expect(path).toBe('/presets?collection=bashar');
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(4);
    await act(async () => button('Start here').click());
    expect(path).toBe('/presets');
  });

  it('restores collection and search from the URL and browser Back', async () => {
    await mount('/presets?collection=bashar&q=66.6');
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(1);
    expect(container.querySelector<HTMLInputElement>('input[type="search"]')!.value).toBe('66.6');
    await act(async () => button('Browse all presets').click());
    expect(path).toBe('/presets?collection=all');
    await act(async () => button('▶ PREVIEW · 10 S', card('exp-phi-ladder')).click());
    expect(session.previewId).toBe('preset:exp-phi-ladder');
    await act(async () => navigate(-1));
    expect(path).toBe('/presets?collection=bashar&q=66.6');
    expect(session.previewId).toBeNull();
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(1);
    expect(card('exp-bashar-scale-map')).toBeTruthy();
  });

  it('expands an empty starting-sound search to all presets without dropping the query', async () => {
    await mount('/presets');
    await input('432 Evening');
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(0);
    await act(async () => button('Search all presets instead').click());
    expect(new URLSearchParams(path.split('?')[1]).get('collection')).toBe('all');
    expect(new URLSearchParams(path.split('?')[1]).get('q')).toBe('432 Evening');
    expect(card('relax-432-evening')).toBeTruthy();
  });

  it('shows saved Studio presets separately and states the storage scope', async () => {
    await mount('/presets?collection=saved');
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(0);
    expect(container.textContent).toContain('No saved Studio presets yet.');
    expect(container.textContent).toContain('Harmonic Lab recipes stay in Harmonic Lab.');
    await act(async () => session.saveCurrentAsPreset('My test sound'));
    expect(container.querySelectorAll('[data-testid^="my-preset-preview-"]')).toHaveLength(1);
    expect(container.querySelector('[data-testid^="my-preset-preview-"]')?.textContent).toBe('▶ PREVIEW · 10 S');
  });

  it('searches pitch and mode, and reports an empty filtered collection', async () => {
    await mount();
    await input('66.6 monaural');
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(1);
    expect(card('exp-bashar-scale-map')).toBeTruthy();
    await input('a sound that does not exist');
    expect(container.textContent).toContain('No presets match these filters.');
    await act(async () => button('Clear filters').click());
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(4);
  });

  it('does not silently ignore the evidence filter for the Bashar collection', async () => {
    await mount();
    const select = container.querySelector('select')!;
    await act(async () => { select.value = 'A'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(container.querySelectorAll('[data-testid^="preset-card-"]')).toHaveLength(0);
    expect(container.textContent).toContain('0 presets');
  });

  it('labels shipped preview lengths using the manifest, not the fallback length', async () => {
    manifestState.current = { version: 1, sampleRate: 48000, format: 'pcm16-stereo', seconds: 6, targetSeconds: 12, totalBytes: 0,
      files: [{ id: 'exp-phi-bowl-chord', bytes: 44, sha256: 'test' }] };
    await mount();
    expect(card('exp-phi-bowl-chord').querySelector('[data-testid^="preset-preview-"]')?.getAttribute('aria-label')).toContain('first 6 seconds');
    expect(card('exp-phi-ladder').querySelector('[data-testid^="preset-preview-"]')?.getAttribute('aria-label')).toContain('first 10 seconds');
    expect(card('exp-phi-bowl-chord').querySelector('[data-testid^="preset-preview-"]')?.textContent).toBe('▶ PREVIEW · 6 S');
    expect(card('exp-phi-ladder').querySelector('[data-testid^="preset-preview-"]')?.textContent).toBe('▶ PREVIEW · 10 S');
    expect(card('exp-phi-ladder').textContent).toContain('Full session · 25:00');
  });

  it('hears the later monaural stage immediately, then stops on a second tap', async () => {
    await mount(); await details('exp-bashar-scale-map');
    const step = container.querySelector<HTMLButtonElement>('[aria-label="Hear step 6 for 8 seconds"]')!;
    await act(async () => step.click());
    expect(session.previewId).toBe('preset:exp-bashar-scale-map:step:6');
    const [left, right, sampleRate] = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls[0];
    expect(left.length).toBe(8 * sampleRate);
    expect(left).toEqual(right); // Offline monaural preview is the same physical sound in both ears.
    expect(step.getAttribute('aria-pressed')).toBe('true');
    await act(async () => step.click());
    expect(session.previewId).toBeNull();
  });

  it('shows the fade limitation and keeps Stop all sound accessible inside the details dialog', async () => {
    await mount(); await details('exp-phi-ladder');
    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.textContent).toContain('Authored phase fades (20 s) are saved as metadata');
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Hear step 5 for 8 seconds"]')!.click());
    expect(session.previewId).toBe('preset:exp-phi-ladder:step:5');
    await act(async () => button('Stop all sound', dialog).click());
    expect(session.panicked).toBe(true);
    expect(session.previewId).toBeNull();
  });

  it('loads the full chord from its card without starting or retaining prior noise', async () => {
    await mount();
    await act(async () => { session.setNoiseOn(true); session.setWaveform('square'); });
    await act(async () => button('LOAD INTO STUDIO', card('exp-phi-bowl-chord')).click());
    expect(path).toBe('/studio');
    expect(session.bowls.map((b) => b.baseHz)).toEqual(PHI_LADDER_HZ);
    expect(session.noiseOn).toBe(false);
    expect(session.waveform).toBe('sine');
    expect(session.running).toBe(false);
    expect(session.phases[0]).toMatchObject({ durationSec: 900, beatHz: 0, carrierHz: 110 });
  });

  it('requires advisory acknowledgment before any preview', async () => {
    clearAdvisoryAck(); await mount();
    await act(async () => button('▶ PREVIEW · 10 S', card('exp-phi-ladder')).click());
    expect(session.advisoryOpen).toBe(true);
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    await act(async () => session.acknowledgeAdvisory());
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    expect(container.textContent).toContain('press Preview or Hear step again');
    await act(async () => button('▶ PREVIEW · 10 S', card('exp-phi-ladder')).click());
    expect(session.previewId).toBe('preset:exp-phi-ladder');
  });

  it.each(['muted', 'running', 'panic'] as const)('blocks card and step previews when %s', async (reason) => {
    await mount(); await details('exp-phi-ladder');
    await act(async () => {
      if (reason === 'muted') session.setMuted(true);
      else if (reason === 'running') session.start();
      else session.panic();
    });
    const step = container.querySelector<HTMLButtonElement>('[aria-label="Hear step 1 for 8 seconds"]')!;
    expect(step.disabled).toBe(true);
    expect(card('exp-phi-ladder').querySelector<HTMLButtonElement>('[data-testid^="preset-preview-"]')!.disabled).toBe(true);
    await act(async () => step.click());
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    if (reason === 'muted') {
      expect(container.textContent).toContain('Unmute before previewing.');
      expect(container.textContent).not.toContain('Stop the active session');
      const dialog = container.querySelector('[role="dialog"]')!;
      expect(dialog.textContent).toContain('and select Unmute, then return here to preview.');
      const studioLink = dialog.querySelector<HTMLAnchorElement>('a[href="/studio"]')!;
      expect(studioLink.textContent).toBe('Open Studio');
      await act(async () => studioLink.click());
      expect(path).toBe('/studio');
      expect(session.muted).toBe(true);
      expect(session.running).toBe(false);
    }
  });

  it('hides the Bashar collection when infant mode is enabled', async () => {
    await mount(); await act(async () => session.setGovernor({ infantMode: true }));
    expect(container.querySelector('#bashar-collection-title')).toBeNull();
    expect(card('exp-phi-ladder')).toBeNull();
    expect(container.textContent).toContain('Infant mode: only Infant presets are shown.');
  });

  it('stops a preview when filters change, the dialog closes, or the route changes', async () => {
    await mount();
    await act(async () => button('▶ PREVIEW · 10 S', card('exp-phi-ladder')).click());
    await input('phi'); expect(session.previewId).toBeNull();
    await details('exp-phi-ladder');
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Hear step 1 for 8 seconds"]')!.click());
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    expect(session.previewId).toBeNull(); expect(container.querySelector('[role="dialog"]')).toBeNull();
    await act(async () => button('▶ PREVIEW · 10 S', card('exp-phi-ladder')).click());
    await act(async () => container.querySelector<HTMLAnchorElement>('a[href="/channeled"]')!.click());
    expect(path).toBe('/channeled'); expect(session.previewId).toBeNull();
  });
});

describe('preset sound labels', () => {
  it('separates zero-beat pitches from modulation rates', () => {
    const ladder = BASHAR_PRESETS.find((p) => p.id === 'exp-phi-ladder')!;
    expect(phaseSoundLabel(ladder.spec.phases[1])).toBe('177.98 Hz steady tone');
    expect(presetSignalSummary(ladder)).not.toMatch(/(^| → )0( →| Hz)/);
    expect(presetMatchesSearch(ladder, '753.95 steady')).toBe(true);
    expect(presetMatchesSearch(BASHAR_PRESETS[0], '66.6 monaural')).toBe(true);
  });
  it('labels carrier-locked saved bowls without presenting their unused stored pitch', () => {
    const chord = BASHAR_PRESETS.find((p) => p.id === 'exp-phi-bowl-chord')!;
    const saved = { ...chord, spec: { ...chord.spec, mix: { ...chord.spec.mix!, bowls: [{ ...chord.spec.mix!.bowls[0], lock: true, baseHz: 500 }] } } };
    expect(presetSignalSummary(saved)).toContain('follows carrier');
    expect(presetSignalSummary(saved)).not.toContain('500');
  });
});

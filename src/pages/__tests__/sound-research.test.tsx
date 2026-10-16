// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useNavigate, type NavigateFunction } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SoundResearch from '../SoundResearch';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { clearAdvisoryAck, seedAdvisoryAck } from '@/test/helpers';
import * as exports from '@/ui/audio/renderExport';
import { GOVERNMENT_RECORDS } from '@/sound-research/government';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let host: HTMLDivElement;
let session: ReturnType<typeof useSession>;
let navigate: NavigateFunction;
function Probe() { session = useSession(); navigate = useNavigate(); return null; }
async function mount() {
  await act(async () => root.render(<MemoryRouter initialEntries={['/sound-research']}><SessionProvider><Probe /><Routes><Route path="/sound-research" element={<SoundResearch />} /><Route path="/studio" element={<p>Studio destination</p>} /><Route path="/elsewhere" element={<p>Another page</p>} /></Routes></SessionProvider></MemoryRouter>));
}
function button(text: string) {
  const match = Array.from(host.querySelectorAll('button')).find(item => item.textContent?.includes(text));
  expect(match, `button containing ${text}`).toBeDefined();
  return match!;
}
async function click(text: string) { await act(async () => button(text).click()); }
async function slide(label: string, value: number) {
  const input = host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, String(value));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
beforeEach(() => {
  window.localStorage.clear(); seedAdvisoryAck();
  vi.spyOn(LiveEngine.prototype, 'playBuffer').mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); window.localStorage.clear(); });

describe('Sound Research listening bench', () => {
  it('starts only on request and stops its eight-second preview when the signal changes', async () => {
    await mount();
    expect(session.previewId).toBeNull();
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    await click('Preview · 8 seconds');
    expect(session.previewId).toBe('sound-research:bench');
    expect(session.running).toBe(false);
    const [left, right, sampleRate] = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls[0];
    expect(left.length / sampleRate).toBeLessThanOrEqual(8);
    expect(right.length).toBe(left.length);
    await click('Carrier only');
    expect(session.previewId).toBeNull();
    expect(host.querySelector<HTMLInputElement>('[aria-label="Beat or modulation frequency"]')!.disabled).toBe(true);
  });

  it('updates quantitative curves and exports the selected settings', async () => {
    const download = vi.spyOn(exports, 'downloadBytes').mockImplementation(() => {});
    await mount();
    const before = host.querySelector('[data-testid="research-resonance"]')!.getAttribute('d');
    await slide('Damping ratio', .5);
    expect(host.querySelector('[data-testid="research-response"]')!.textContent).toContain('1.000');
    expect(host.querySelector('[data-testid="research-resonance"]')!.getAttribute('d')).not.toBe(before);
    await click('Resonance CSV');
    expect(download).toHaveBeenCalledOnce();
    const [bytes, filename, mime] = download.mock.calls[0];
    expect(filename).toBe('opensync-resonance-model.csv');
    expect(mime).toContain('text/csv');
    expect(new TextDecoder().decode(bytes)).toContain('# dampingRatio=0.5');
    expect(new TextDecoder().decode(bytes)).toContain('No tissue, disease, or treatment response');
    await click('Amplitude modulation');
    expect(host.querySelector('svg[aria-label*="Amplitude envelope"]')).not.toBeNull();
  });

  it('keeps advisory, mute, active-session, panic, and infant gates', async () => {
    clearAdvisoryAck();
    await mount();
    await click('Preview · 8 seconds');
    expect(session.advisoryOpen).toBe(true);
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    await act(async () => { session.acknowledgeAdvisory(); session.setMuted(true); });
    expect(button('Preview · 8 seconds').disabled).toBe(true);
    await act(async () => { session.setMuted(false); session.start(); });
    expect(button('Preview · 8 seconds').disabled).toBe(true);
    await act(async () => { session.stop(); session.panic(); });
    expect(button('Preview · 8 seconds').disabled).toBe(true);
    await act(async () => { session.resumeSafely(); session.setGovernor({ infantMode: true }); });
    expect(button('Preview · 8 seconds').disabled).toBe(true);
    await click('Original presets');
    expect(host.textContent).toContain('adult experimental presets are unavailable');
    expect(host.querySelector('[data-testid^="research-preset-"]')).toBeNull();
  });

  it('loads an original preset silently through the existing Studio flow', async () => {
    await mount();
    await click('Original presets');
    const card = host.querySelector('[data-testid="research-preset-research-carrier-control"]')!;
    const load = Array.from(card.querySelectorAll('button')).find(item => item.textContent === 'LOAD INTO STUDIO')!;
    await act(async () => load.click());
    expect(host.textContent).toContain('Studio destination');
    expect(session.phases[0].carrierHz).toBe(220);
    expect(session.running).toBe(false);
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
  });

  it('stops owned audio on route exit while leaving another page’s preview alone', async () => {
    await mount();
    await click('Preview · 8 seconds');
    await act(async () => navigate('/elsewhere'));
    expect(session.previewId).toBeNull();
    await act(async () => navigate('/sound-research'));
    const externalStop = vi.fn();
    await act(async () => session.togglePreview('another:preview', () => externalStop));
    await act(async () => navigate('/elsewhere'));
    expect(session.previewId).toBe('another:preview');
    expect(externalStop).not.toHaveBeenCalled();
  });

  it('separates wavelength medium from hypothetical interface transmission', async () => {
    const download = vi.spyOn(exports, 'downloadBytes').mockImplementation(() => {});
    await mount();
    expect(host.querySelector('[data-testid="research-wavelength"]')!.textContent).toContain('1.906');
    expect(host.querySelector('[data-testid="research-transmission"]')!.textContent).toContain('100.0');
    const select = host.querySelector<HTMLSelectElement>('[aria-label="Propagation medium"]')!;
    await act(async () => { select.value = '1480'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(host.querySelector('[data-testid="research-wavelength"]')!.textContent).toContain('8.222');
    expect(host.querySelector('[data-testid="research-transmission"]')!.textContent).toContain('100.0');
    await slide('Logarithm of impedance ratio', 1);
    expect(host.querySelector('[data-testid="research-transmission"]')!.textContent).toContain('33.1');
    await slide('Acoustic frequency', 360);
    expect(host.querySelector('[data-testid="research-wavelength"]')!.textContent).toContain('4.111');
    expect(host.querySelector('[data-testid="research-transmission"]')!.textContent).toContain('33.1');
    await click('Acoustics CSV');
    expect(download.mock.calls[0][1]).toBe('opensync-acoustics-model.csv');
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
  });

  it('filters government records and exposes mechanism and falsification readings', async () => {
    await mount();
    await click('Government records');
    expect(host.querySelectorAll('[data-country]')).toHaveLength(GOVERNMENT_RECORDS.length);
    await click('China');
    expect(host.querySelectorAll('[data-country]')).toHaveLength(3);
    expect(host.querySelectorAll('[data-country="China"]')).toHaveLength(3);
    expect(host.textContent).toContain('Not established');
    await click('Mechanisms');
    const details = host.querySelector<HTMLDetailsElement>('.sr-reading-entry details')!;
    await act(async () => details.querySelector('summary')!.click());
    expect(details.open).toBe(true);
    expect(details.textContent).toContain('Discriminating test');
    expect(details.querySelector('a[href^="https://"]')).not.toBeNull();
    await click('Research questions');
    expect(host.textContent).toContain('Biological unknown');
    expect(host.textContent).toContain('Possible falsifier');
    expect(host.textContent).toContain('UNTESTED');
    await click('Related model');
    expect(host.querySelector('section[aria-label="Signal bench"]')).not.toBeNull();
  });
});

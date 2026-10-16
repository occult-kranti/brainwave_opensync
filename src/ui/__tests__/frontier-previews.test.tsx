// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useNavigate, type NavigateFunction } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Presets from '@/pages/Presets';
import { FRONTIER_PRESETS } from '@/data/frontierPresets';
import { RUNTIME_PREVIEW_CATALOG } from '@/data/runtimePreviewCatalog';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { clearAdvisoryAck, seedAdvisoryAck } from '@/test/helpers';
import type { PreviewManifest } from '@/ui/session/previewManifest';

const manifestState = vi.hoisted(() => ({ current: null as PreviewManifest | null }));
vi.mock('@/ui/session/previewManifest', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/ui/session/previewManifest')>(),
  usePreviewManifest: () => manifestState.current,
}));
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
let session: ReturnType<typeof useSession>, navigate: NavigateFunction;
function Probe() { session = useSession(); navigate = useNavigate(); return null; }
async function mount() {
  await act(async () => root.render(<MemoryRouter initialEntries={['/presets?collection=all&q=study-']}>
    <SessionProvider><Probe /><Routes>
      <Route path="/presets" element={<Presets />} /><Route path="/listen" element={<p>Listening destination</p>} />
      <Route path="/studio" element={<p>Studio destination</p>} /><Route path="/elsewhere" element={<p>Another page</p>} />
    </Routes></SessionProvider>
  </MemoryRouter>));
}
function preview(id = FRONTIER_PRESETS[0].id) {
  const control = host.querySelector<HTMLButtonElement>(`[data-testid="preset-preview-${id}"]`);
  expect(control).not.toBeNull(); return control!;
}
async function play(id?: string) { await act(async () => preview(id).click()); }

beforeEach(() => {
  window.localStorage.clear(); seedAdvisoryAck();
  manifestState.current = {
    version: 1, sampleRate: 48000, format: 'pcm16-stereo', seconds: 2, targetSeconds: 12, totalBytes: 0,
    // Deliberately stale file entries must not override explicit runtime policy.
    files: FRONTIER_PRESETS.map(({ id }) => ({ id, bytes: 44, sha256: 'stale' })),
  };
  vi.spyOn(LiveEngine.prototype, 'playBuffer').mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, 'stopPreviews');
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); window.localStorage.clear();
});

describe('declared runtime preset previews', () => {
  it('labels all eight as 10 seconds and renders their opening through the quiet tracked engine path', async () => {
    await mount();
    expect(host.querySelectorAll('[data-testid^="preset-card-bashar-study-"], [data-testid^="preset-card-frequency-study-"]')).toHaveLength(8);
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    for (const entry of RUNTIME_PREVIEW_CATALOG) {
      expect(preview(entry.id).getAttribute('aria-label')).toContain('first 10 seconds');
      expect(preview(entry.id).textContent).toContain('10 s');
      await play(entry.id);
      expect(session.previewId).toBe(`preset:${entry.id}`);
      const [left, right, sampleRate, gainDb] = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls.at(-1)!;
      expect(sampleRate).toBe(entry.sampleRate);
      expect(left.length).toBe(entry.sampleRate * entry.maxSeconds); expect(right.length).toBe(left.length);
      expect(gainDb).toBeLessThanOrEqual(-12);
      let peak = 0;
      for (const channel of [left, right]) {
        expect(channel.every(Number.isFinite)).toBe(true);
        for (const value of channel) peak = Math.max(peak, Math.abs(value));
      }
      expect(peak).toBeGreaterThan(0.01); expect(peak).toBeLessThan(0.016);
      expect(preview(entry.id).getAttribute('aria-label')).toContain('Stop preview');
      await play(entry.id); expect(session.previewId).toBeNull();
    }
    expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(8);
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled(); expect(session.running).toBe(false);
  });

  it('keeps advisory, mute and infant gates active and never resumes automatically', async () => {
    clearAdvisoryAck(); await mount(); await play();
    expect(session.advisoryOpen).toBe(true); expect(session.previewId).toBeNull();
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    await act(async () => session.acknowledgeAdvisory()); await play();
    expect(session.previewId).not.toBeNull();
    await act(async () => session.setMuted(true));
    expect(session.previewId).toBeNull(); expect(preview().disabled).toBe(true);
    await act(async () => session.setMuted(false));
    expect(session.previewId).toBeNull(); expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(1);
    await play(); await act(async () => session.setGovernor({ infantMode: true }));
    expect(session.previewId).toBeNull();
    expect(host.querySelector('[data-testid^="preset-card-bashar-study-"]')).toBeNull();
    expect(host.querySelector('[data-testid^="preset-card-frequency-study-"]')).toBeNull();
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
  });

  it('clears runtime previews on end, failure, panic and page exit', async () => {
    await mount(); await play();
    const onEnded = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls.at(-1)![4]!;
    await act(async () => onEnded()); expect(session.previewId).toBeNull();
    vi.mocked(LiveEngine.prototype.playBuffer).mockReturnValueOnce(false);
    await play(); expect(session.previewId).toBeNull();
    await play(); await act(async () => session.panic());
    expect(session.previewId).toBeNull(); expect(preview().disabled).toBe(true);
    expect(session.running).toBe(false);
    await act(async () => session.dismissPanic());
    await play(); expect(session.previewId).not.toBeNull();
    vi.mocked(LiveEngine.prototype.stopPreviews).mockClear();
    await act(async () => navigate('/elsewhere'));
    expect(host.textContent).toContain('Another page');
    expect(session.previewId).toBeNull();
    expect(LiveEngine.prototype.stopPreviews).toHaveBeenCalled();
  });

  it('stops a playing runtime preview when choosing the recipe without starting a session', async () => {
    await mount(); await play();
    const card = host.querySelector(`[data-testid="preset-card-${FRONTIER_PRESETS[0].id}"]`)!;
    const choose = Array.from(card.querySelectorAll('button')).find(button => button.textContent?.includes('Choose sound') || button.textContent?.includes('Load into Studio'))!;
    await act(async () => choose.click());
    expect(host.textContent).toMatch(/Listening destination|Studio destination/);
    expect(session.presetName).toBe(FRONTIER_PRESETS[0].title);
    expect(session.previewId).toBeNull(); expect(session.running).toBe(false);
    expect(session.volumeDb).toBe(-30);
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
  });
});

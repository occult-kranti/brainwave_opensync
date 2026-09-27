// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import NanoLab from '@/pages/NanoLab';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { downloadBytes } from '@/ui/audio/renderExport';
import { exportNanoSignal } from '../model';

vi.mock('@/ui/audio/renderExport', async original => ({ ...await original<typeof import('@/ui/audio/renderExport')>(), downloadBytes: vi.fn() }));
vi.mock('../model', async original => ({ ...await original<typeof import('../model')>(), exportNanoSignal: vi.fn() }));
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
describe('NanoLab shared audio ownership and controls', () => {
  let container: HTMLDivElement, root: Root, session: ReturnType<typeof useSession>, ended: (() => void) | undefined;
  function Probe() { session = useSession(); return null; }
  const button = (text: string) => [...container.querySelectorAll('button')].find(b => b.textContent?.trim() === text)!;
  const click = async (text: string) => { await act(async () => button(text).click()); };
  const input = async (label: string, value: string) => { const field = container.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!; await act(async () => { setter.call(field, value); field.dispatchEvent(new Event('input', { bubbles: true })); }); };
  beforeEach(async () => {
    vi.spyOn(LiveEngine.prototype, 'playBuffer').mockImplementation((_l, _r, _sr, _db, onEnded) => { ended = onEnded; return true; });
    vi.spyOn(LiveEngine.prototype, 'stopPreviews');
    vi.mocked(exportNanoSignal).mockResolvedValue({ wav: new Uint8Array([1]), manifest: new Uint8Array([2]) });
    container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
    await act(async () => root.render(<MemoryRouter><SessionProvider><Probe /><NanoLab /></SessionProvider></MemoryRouter>));
  });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.mocked(exportNanoSignal).mockReset(); vi.mocked(downloadBytes).mockClear(); });
  it('plays bounded exact buffers and natural completion clears the shared preview', async () => {
    await click('Play preview'); const [left, right, sr, gain] = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls[0];
    expect(left.length).toBe(480000); expect(left).toEqual(right); expect(sr).toBe(48000); expect(gain).toBe(0); expect(session!.previewId).toBe('nano:preview');
    await act(async () => ended?.()); expect(session!.previewId).toBeNull(); expect(LiveEngine.prototype.stopPreviews).toHaveBeenCalled();
  });
  it('stops on edits, mute, tighter governor, and panic; later playback uses the ceiling', async () => {
    await click('Play preview'); await click('Amplitude modulation'); expect(session!.previewId).toBeNull();
    await click('Play preview'); await input('Rate / tone spacing · Hz', '20'); expect(session!.previewId).toBeNull();
    await click('Play preview'); await act(async () => session!.setMuted(true)); expect(session!.previewId).toBeNull(); expect(button('Play preview').disabled).toBe(true);
    await act(async () => session!.setMuted(false)); await click('Play preview'); await act(async () => session!.setGovernor({ maxGainDbFs: -40 })); expect(session!.previewId).toBeNull();
    await click('Play preview'); let peak = 0; for (const x of vi.mocked(LiveEngine.prototype.playBuffer).mock.calls.at(-1)![0]) peak = Math.max(peak, Math.abs(x)); expect(peak).toBeLessThanOrEqual(.01 + 1e-8);
    await act(async () => session!.panic()); expect(session!.previewId).toBeNull(); expect(button('Play preview').disabled).toBe(true);
  });
  it('enforces advisory, infant restrictions, and failed-start cleanup', async () => {
    await act(async () => session!.setGovernor({ drivingWarningAcknowledged: false })); await click('Play preview'); expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled(); expect(container.textContent).toContain('Read the listening advisory');
    await act(async () => session!.setGovernor({ drivingWarningAcknowledged: true })); vi.mocked(LiveEngine.prototype.playBuffer).mockReturnValue(false);
    await click('Play preview'); expect(session!.previewId).toBeNull(); expect(container.querySelector('[role=alert]')?.textContent).toContain('Audio could not start');
    await act(async () => session!.setGovernor({ infantMode: true })); expect(button('Play preview').disabled).toBe(true); expect(button('Download WAV').disabled).toBe(true); expect(button('Download manifest').disabled).toBe(true);
  });
  it('clears stale measurements for invalid edits and never renders oversized buffers', async () => {
    await click('Play preview'); await input('Length · seconds', '99999999999'); expect(session!.previewId).toBeNull(); expect(container.querySelectorAll('figure')).toHaveLength(0); expect(button('Play preview').disabled).toBe(true); expect(button('Download WAV').disabled).toBe(true);
    await input('Length · seconds', ''); expect(container.querySelector('[role=alert]')?.textContent).toContain('Complete every');
    await input('Length · seconds', '30'); expect(container.querySelectorAll('figure')).toHaveLength(2); await click('Play preview'); expect(vi.mocked(LiveEngine.prototype.playBuffer).mock.calls.at(-1)![0].length).toBe(1440000);
  });
  it('exports the same preview buffers and discards a stale asynchronous export', async () => {
    await click('Play preview'); const played = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls[0]; await click('Download WAV'); const exported = vi.mocked(exportNanoSignal).mock.calls[0][0]; expect(exported.left).toBe(played[0]); expect(exported.right).toBe(played[1]); expect(session!.previewId).toBeNull(); expect(downloadBytes).toHaveBeenCalledOnce();
    vi.mocked(downloadBytes).mockClear(); let finish: (value: { wav: Uint8Array; manifest: Uint8Array }) => void;
    vi.mocked(exportNanoSignal).mockImplementation(() => new Promise(resolve => { finish = resolve; })); await click('Download manifest'); await act(async () => session!.setGovernor({ maxGainDbFs: -45 }));
    await act(async () => finish!({ wav: new Uint8Array([3]), manifest: new Uint8Array([4]) })); expect(downloadBytes).not.toHaveBeenCalled(); expect(button('Download manifest').disabled).toBe(false);
  });
  it('relinquishes ownership when another shared preview replaces it and on navigation', async () => {
    await click('Play preview'); const oldEnd = ended; await act(async () => session!.togglePreview('other', () => () => undefined)); expect(session!.previewId).toBe('other'); await act(async () => oldEnd?.()); expect(session!.previewId).toBe('other');
    await click('Play preview'); await act(async () => root.render(<MemoryRouter><SessionProvider><Probe /></SessionProvider></MemoryRouter>)); expect(session!.previewId).toBeNull(); expect(LiveEngine.prototype.stopPreviews).toHaveBeenCalled();
  });
  it('stops shared previews before opening the external sound protocol document', async () => {
    await click('Play preview');
    const link = [...container.querySelectorAll('a')].find(a => a.textContent?.startsWith('Open sound protocols'))!;
    expect(link.getAttribute('href')).toContain('research/sound-lab/');
    // Keep this test in-document while exercising React's navigation cleanup.
    link.addEventListener('click', event => event.preventDefault());
    await act(async () => link.click());
    expect(session!.previewId).toBeNull();
    expect(LiveEngine.prototype.stopPreviews).toHaveBeenCalled();
  });
});

// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import Meditate from '../Meditate';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { seedAdvisoryAck } from '@/test/helpers';
import { CymaticsOverlay } from '@/ui/components/CymaticsOverlay';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let host: HTMLDivElement;
let session: ReturnType<typeof useSession>;
function Probe() { session = useSession(); return null; }
beforeEach(() => {
  window.localStorage.clear(); seedAdvisoryAck();
  vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); window.localStorage.clear(); });

describe('practice integration', () => {
  it('replaces a running session with the chosen duration, keeps gain caps, and never autoplays', async () => {
    await act(async () => root.render(<MemoryRouter initialEntries={['/meditate?goal=sleep']}><SessionProvider><Probe /><Routes><Route path="/meditate" element={<Meditate />} /><Route path="/studio" element={<div>Studio destination</div>} /></Routes></SessionProvider></MemoryRouter>));
    act(() => { session.setVolumeDb(-35); session.setLimitMin(1); });
    act(() => { session.start(); });
    expect(session.running).toBe(true);
    const five = Array.from(host.querySelectorAll('button')).find((b) => b.textContent === '5 min')!;
    await act(async () => five.click());
    const load = Array.from(host.querySelectorAll('button')).find((b) => b.textContent?.includes('Set up this session'))!;
    await act(async () => load.click());
    expect(host.textContent).toContain('Studio destination');
    expect(session.running).toBe(false);
    expect(session.limitMin).toBe(5);
    expect(session.volumeDb).toBeLessThanOrEqual(-35);
    expect(session.nature.on).toBe(true);
    expect(session.phases[0].durationSec).toBe(900);
  });
  it('mounts the sand stage outside the clipped player and restores scrolling and focus on close', async () => {
    const trigger = document.createElement('button'); document.body.appendChild(trigger); trigger.focus();
    const close = vi.fn();
    document.body.style.overflow = 'auto';
    await act(async () => root.render(<SessionProvider><div style={{ isolation: 'isolate', overflow: 'hidden' }}><CymaticsOverlay onClose={close} /></div></SessionProvider>));
    const dialog = document.querySelector('[role="dialog"][aria-label="Cymatics sand plate stage"]')!;
    expect(dialog.parentElement).toBe(document.body);
    expect(host.contains(dialog)).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(close).toHaveBeenCalledOnce();
    await act(async () => root.render(<div />));
    expect(document.body.style.overflow).toBe('auto');
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});

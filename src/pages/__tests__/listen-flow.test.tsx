// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route, Link, useNavigate, type NavigateFunction } from 'react-router';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import Listen from '../Listen';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { seedAdvisoryAck, clearAdvisoryAck } from '@/test/helpers';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let host: HTMLDivElement;
let session: ReturnType<typeof useSession>;
let navigate: NavigateFunction;
function Probe() { session = useSession(); navigate = useNavigate(); return null; }
function Workshop() { const s = useSession(); return <><button onClick={() => { s.setCarrierHz(333); s.setMode('binaural'); s.setPhases(s.phases.map(phase => ({ ...phase, carrierHz: 333, mode: 'binaural', beatHz: 7 })));  }}>Edit carrier</button><Link to="/listen">Back to listening</Link></>; }
async function mount(url: string) {
  await act(async () => root.render(<MemoryRouter initialEntries={[url]}><SessionProvider><Probe /><Routes><Route path="/listen" element={<Listen />} /><Route path="/studio" element={<Workshop />} /></Routes></SessionProvider></MemoryRouter>));
}
function button(label: string) { return Array.from(host.querySelectorAll('button')).find(b => b.textContent === label)!; }
beforeEach(() => {
  window.localStorage.clear(); seedAdvisoryAck();
  vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(LiveEngine.prototype, 'resume').mockImplementation(() => {});
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); window.localStorage.clear(); });

describe('Today → Listen → Customize', () => {
  it('loads the actual sound silently and retains transport and stop behavior', async () => {
    await mount('/listen?preset=practice-soft-landing');
    expect(session.presetName).toBe('Soft landing');
    expect(session.limitMin).toBe(5);
    expect(session.nature.kind).toBe('rain');
    expect(session.running).toBe(false);
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
    await act(async () => button('Play session').click());
    expect(session.running).toBe(true);
    await act(async () => button('Pause session').click());
    expect(session.paused).toBe(true);
    await act(async () => button('Resume session').click());
    expect(session.paused).toBe(false);
    await act(async () => button('Stop').click());
    expect(session.running).toBe(false);
  });
  it('keeps edits when returning from the workshop instead of reloading the original', async () => {
    await mount('/listen?preset=practice-bowl-attention');
    await act(async () => host.querySelector<HTMLAnchorElement>('a[href="/studio"]')!.click());
    await act(async () => button('Edit carrier').click());
    await act(async () => host.querySelector<HTMLAnchorElement>('a[href="/listen"]')!.click());
    expect(session.carrierHz).toBe(333);
    expect(session.bowls).toHaveLength(2);
    expect(host.textContent).toContain('edited this session');
    expect(host.querySelector('.listen-meta')!.textContent).toContain('Stereo headphones');
    expect(session.running).toBe(false);
  });
  it('uses the existing advisory gate and respects mute', async () => {
    clearAdvisoryAck();
    await mount('/listen?preset=practice-soft-landing');
    await act(async () => button('Play session').click());
    expect(session.advisoryOpen).toBe(true);
    expect(session.running).toBe(false);
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Mute sound"]')!.click());
    expect(session.muted).toBe(true);
    expect(host.querySelector('[aria-label="Unmute sound"]')).not.toBeNull();
  });
  it('does not load an adult practice through a direct link while infant mode is active', async () => {
    await mount('/listen');
    await act(async () => session.setGovernor({ infantMode: true }));
    const phases = session.phases;
    await act(async () => navigate('/listen?preset=practice-soft-landing'));
    expect(session.phases).toBe(phases);
    expect(session.presetName).toBeNull();
    expect(host.textContent).toContain('adult practice has not been loaded');
    expect(session.running).toBe(false);
  });
  it('recovers from an unknown preset without overwriting the current sound', async () => {
    await mount('/listen?preset=missing-sound');
    expect(host.textContent).toContain('could not be found');
    expect(session.presetName).toBeNull();
    expect(session.running).toBe(false);
  });
});

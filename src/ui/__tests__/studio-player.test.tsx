// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import Studio from '@/pages/Studio';
import { PRESETS } from '@/data/presets';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { clearAdvisoryAck, seedAdvisoryAck } from '@/test/helpers';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => true }));
if (typeof Element !== 'undefined') (Element.prototype as unknown as Record<string, unknown>).animate = undefined;
let root: Root;
let container: HTMLDivElement;
let session: ReturnType<typeof useSession>;
function Probe() { session = useSession(); return null; }
async function mount() {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await act(async () => root.render(<MemoryRouter><SessionProvider><Probe /><Studio /></SessionProvider></MemoryRouter>));
}
function button(label: string) { return Array.from(container.querySelectorAll('button')).find((b) => b.textContent === label)!; }
beforeEach(() => {
  window.localStorage.clear(); seedAdvisoryAck();
  vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(LiveEngine.prototype, 'resume').mockImplementation(() => {});
});
afterEach(async () => { if (root) await act(async () => root.unmount()); container?.remove(); vi.restoreAllMocks(); window.localStorage.clear(); });

describe('Studio player', () => {
  it('keeps transport visible, edits duration without changing the sequence, and refuses live lengthening', async () => {
    await mount();
    const phases = session.phases;
    for (const d of container.querySelectorAll('details.studio-disclosure')) expect(d.hasAttribute('open')).toBe(false);
    expect(button('Play session').closest('details')).toBeNull();
    expect(container.querySelector('#studio-duration')!.closest('details')).toBeNull();
    await act(async () => button('5 min').click());
    expect(session.limitMin).toBe(5); expect(session.phases).toBe(phases);
    await act(async () => button('Play session').click());
    expect(session.running).toBe(true);
    expect(button('10 min').disabled).toBe(true);
    expect(container.querySelector('#studio-duration')!.getAttribute('max')).toBe('5');
    await act(async () => button('Pause session').click());
    expect(session.paused).toBe(true);
    expect(container.querySelector('[data-testid="studio-playback-state"]')!.textContent).toBe('Studio paused');
    await act(async () => button('Resume session').click());
    expect(session.paused).toBe(false);
    await act(async () => button('Stop session').click());
    expect(session.running).toBe(false); expect(button('20 min').disabled).toBe(false);
  });

  it('loads a complete starter mix and preserves it through disclosure changes', async () => {
    await mount();
    await act(async () => { session.setNoiseDb('pink', -20); session.setNature({ on: true }); session.setWaveform('square'); session.addBowl(); });
    await act(async () => session.loadPreset(PRESETS.find((p) => p.id === 'relax-alpha-ease')!));
    expect(session.noiseOn).toBe(false); expect(session.nature.on).toBe(false); expect(session.bowls).toEqual([]); expect(session.waveform).toBe('sine');
    await act(async () => { session.setNoiseDb('pink', -30); session.setNoiseOn(true); });
    const phases = session.phases;
    const details = container.querySelector<HTMLDetailsElement>('[data-testid="studio-sound-controls"]')!;
    await act(async () => { details.open = true; details.dispatchEvent(new Event('toggle')); });
    await act(async () => { details.open = false; details.dispatchEvent(new Event('toggle')); });
    expect(session.phases).toBe(phases); expect(session.noiseDb.pink).toBe(-30); expect(session.noiseOn).toBe(true);
    expect(container.querySelector('[data-testid="studio-mix-summary"]')!.textContent).toContain('pink noise');
    expect(session.running).toBe(false);
  });

  it('retains the first-play advisory gate with sound controls closed', async () => {
    clearAdvisoryAck(); await mount();
    await act(async () => button('Play session').click());
    expect(session.running).toBe(false); expect(session.advisoryOpen).toBe(true);
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
  });
});

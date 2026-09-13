// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import ChanneledSources from '@/pages/ChanneledSources';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { clearAdvisoryAck } from '@/test/helpers';
import { BASHAR_COPY, BASHAR_PRESETS } from '../bashar';
import { PHI_LADDER_HZ } from '../mapping';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let session: ReturnType<typeof useSession>;
let location: string;

function Probe() {
  session = useSession();
  location = useLocation().pathname;
  return null;
}

async function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(
    <MemoryRouter initialEntries={['/channeled']}><SessionProvider><Probe /><Routes>
      <Route path="/channeled" element={<ChanneledSources />} />
      <Route path="/studio" element={<p>Studio destination</p>} />
    </Routes></SessionProvider></MemoryRouter>,
  ));
}

function buttons(label: string): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button')).filter((button) => button.textContent === label);
}

describe('Channeled Sources page integration', () => {
  beforeEach(() => {
    vi.spyOn(LiveEngine.prototype, 'playBuffer').mockReturnValue(true);
  });
  afterEach(async () => {
    if (root) await act(async () => root.unmount());
    container?.remove();
    vi.restoreAllMocks();
  });

  it('places all three provenance assertions and grades before any playable control', async () => {
    await mount();
    const provenance = container.querySelector('[data-testid="channeled-provenance"]')!;
    for (const paragraph of BASHAR_COPY.provenance) expect(provenance.textContent).toContain(paragraph);
    expect(provenance.textContent).toContain('D · SOURCE CLAIMS');
    expect(provenance.textContent).toContain('A · ARITHMETIC ONLY');
    expect(provenance.compareDocumentPosition(buttons(BASHAR_COPY.preview)[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.textContent).toContain('Alpha and gamma: unresolved descriptions');
    expect(container.textContent).toContain('200,000 ↔ 40 Hz');
    expect(container.querySelectorAll('table tbody tr')).toHaveLength(7);
    expect(buttons(BASHAR_COPY.preview)).toHaveLength(3);
    expect(session.running).toBe(false);
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
  });

  it('recalculates valid numbers and rejects an empty input without displaying NaN', async () => {
    await mount();
    const input = container.querySelector<HTMLInputElement>('#channeled-stated')!;
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    await act(async () => { set.call(input, '143000'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(container.querySelector('output')!.textContent).toContain('143,000 ÷ 5,000 = 28.6 Hz');
    await act(async () => { set.call(input, ''); input.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('output')!.textContent).toBe(BASHAR_COPY.calculatorInvalid);
    expect(container.querySelector('output')!.textContent).not.toContain('NaN');
  });

  it('toggles opening previews through the existing shared playback path', async () => {
    await mount();
    await act(async () => buttons(BASHAR_COPY.preview)[0].click());
    expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledOnce();
    expect(session.previewId).toBe('preset:exp-bashar-scale-map');
    expect(session.running).toBe(false);
    await act(async () => buttons(BASHAR_COPY.stopPreview)[0].click());
    expect(session.previewId).toBeNull();
  });

  it('opens the advisory before playback and requires a fresh preview click after acknowledgment', async () => {
    clearAdvisoryAck();
    await mount();
    await act(async () => buttons(BASHAR_COPY.preview)[0].click());
    expect(session.advisoryOpen).toBe(true);
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    await act(async () => session.acknowledgeAdvisory());
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    await act(async () => buttons(BASHAR_COPY.preview)[0].click());
    expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledOnce();
  });

  it.each(['running', 'muted', 'panic', 'infant'] as const)('blocks new previews while %s', async (reason) => {
    vi.spyOn(LiveEngine.prototype, 'prepare').mockReturnValue(true);
    vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
    await mount();
    await act(async () => {
      if (reason === 'running') session.start();
      else if (reason === 'muted') session.setMuted(true);
      else if (reason === 'panic') session.panic();
      else session.setGovernor({ infantMode: true });
    });
    const button = buttons(BASHAR_COPY.preview)[0];
    expect(button.disabled).toBe(true);
    await act(async () => button.click());
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
  });

  it('stops an owned preview when mute is enabled and when leaving the page', async () => {
    await mount();
    await act(async () => buttons(BASHAR_COPY.preview)[0].click());
    expect(session.previewId).not.toBeNull();
    await act(async () => session.setMuted(true));
    expect(session.previewId).toBeNull();
    await act(async () => session.setMuted(false));
    await act(async () => buttons(BASHAR_COPY.preview)[0].click());
    expect(session.previewId).not.toBeNull();
    await act(async () => buttons(BASHAR_COPY.bowlLoad)[0].click());
    expect(session.previewId).toBeNull();
  });

  it('loads the complete scale sequence with monaural phases intact, without starting', async () => {
    await mount();
    await act(async () => buttons(BASHAR_COPY.loadPreset)[0].click());
    expect(location).toBe('/studio');
    expect(session.presetName).toBe(BASHAR_PRESETS[0].title);
    expect(session.phases).toHaveLength(7);
    expect(session.phases[5]).toMatchObject({ beatHz: 40, mode: 'monaural' });
    expect(session.phases[6]).toMatchObject({ beatHz: 66.6, mode: 'monaural' });
    expect(session.running).toBe(false);
  });

  it('loads all five precise phi carriers for Studio rather than repeating the first pitch', async () => {
    await mount();
    await act(async () => buttons(BASHAR_COPY.loadPreset)[2].click());
    expect(location).toBe('/studio');
    expect(session.phases).toHaveLength(5);
    session.phases.forEach((phase, index) => expect(phase).toMatchObject({ carrierHz: PHI_LADDER_HZ[index], beatHz: 0 }));
    expect(session.running).toBe(false);
  });

  it('replaces the bowl set with the exact phi chord and enables the existing layer', async () => {
    await mount();
    await act(async () => buttons(BASHAR_COPY.bowlLoad)[0].click());
    expect(location).toBe('/studio');
    expect(session.bowls.map((bowl) => bowl.baseHz)).toEqual(PHI_LADDER_HZ);
    expect(session.bowls.every((bowl) => bowl.on && !bowl.lock)).toBe(true);
    expect(session.layersOn).toBe(true);
    expect(session.running).toBe(false);
  });
});

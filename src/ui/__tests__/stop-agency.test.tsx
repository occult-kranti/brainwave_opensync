// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { clearAdvisoryAck, seedAdvisoryAck } from '@/test/helpers';
import { LiveEngine } from '../audio/liveEngine';
import { PanicButton, PanicOverlay } from '../components/Panic';
import { SessionProvider } from '../session/SessionContext';
import { useSession } from '../session/useSession';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
// The suite tests DOM controls, not happy-dom's partial Web Animations API.
(Element.prototype as unknown as Record<string, unknown>).animate = undefined;

let session: ReturnType<typeof useSession>;
let root: Root;
let container: HTMLDivElement;

function Probe() {
  session = useSession();
  return <><PanicButton /><PanicOverlay /></>;
}

async function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<SessionProvider><Probe /></SessionProvider>));
}

function button(label: string) {
  const element = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === label);
  if (!element) throw new Error(`Missing button: ${label}`);
  return element;
}

async function stopAll() {
  await act(async () => {
    button('Stop all sound').focus();
    button('Stop all sound').click();
  });
  await vi.waitFor(() => expect(document.activeElement).toBe(button('Keep sound off')));
}

beforeEach(() => {
  window.localStorage.clear();
  seedAdvisoryAck();
  vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, 'panic');
  vi.spyOn(LiveEngine.prototype, 'resumeSafely');
});

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('global stop preserves the choice to stay silent', () => {
  it('cuts an active session and focuses a default action that keeps sound off', async () => {
    await mount();
    act(() => { session.start(); });
    expect(session.running).toBe(true);
    await stopAll();
    expect(session.running).toBe(false);
    expect(LiveEngine.prototype.panic).toHaveBeenCalledOnce();

    const focused = document.activeElement as HTMLButtonElement;
    expect(focused.textContent).toBe('Keep sound off');
    act(() => {
      // happy-dom does not synthesize a native button click from Enter.
      // Model that activation on the element selected by the focus contract.
      const allowed = focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      if (allowed) focused.click();
    });
    expect(session.running).toBe(false);
    expect(session.panicked).toBe(false);
    expect(LiveEngine.prototype.resumeSafely).not.toHaveBeenCalled();
  });

  it('cuts a tracked preview and leaves it off when the backdrop is clicked', async () => {
    await mount();
    const stopPreview = vi.fn();
    act(() => session.togglePreview('test:preview', () => stopPreview));
    expect(session.previewId).toBe('test:preview');
    await stopAll();
    expect(stopPreview).toHaveBeenCalledOnce();
    expect(session.previewId).toBeNull();
    act(() => container.querySelector<HTMLElement>('[data-testid="sound-stopped-backdrop"]')!.click());
    expect(session.panicked).toBe(false);
    expect(session.running).toBe(false);
    expect(LiveEngine.prototype.resumeSafely).not.toHaveBeenCalled();
  });

  it('Escape returns focus to the stop control without starting audio', async () => {
    await mount();
    const trigger = button('Stop all sound');
    await stopAll();
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(session.panicked).toBe(false);
    expect(session.running).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(LiveEngine.prototype.resumeSafely).not.toHaveBeenCalled();
  });

  it('the separate playback action starts Studio at a lower level and never restarts a preview', async () => {
    await mount();
    const stopPreview = vi.fn();
    act(() => session.togglePreview('test:preview', () => stopPreview));
    const originalDb = session.volumeDb;
    await stopAll();
    expect(container.textContent).toContain('Stopped previews stay off');
    act(() => button('Play Studio quietly').click());
    expect(session.running).toBe(true);
    expect(session.previewId).toBeNull();
    expect(session.elapsedSec).toBe(0);
    expect(session.volumeDb).toBe(Math.max(-60, originalDb - 12));
    expect(stopPreview).toHaveBeenCalledOnce();
    expect(LiveEngine.prototype.resumeSafely).toHaveBeenCalledOnce();
  });

  it('the explicit Studio action still requires the first-use advisory', async () => {
    clearAdvisoryAck();
    await mount();
    await stopAll();
    act(() => button('Play Studio quietly').click());
    expect(session.advisoryOpen).toBe(true);
    expect(session.advisoryPendingStart).toBe(true);
    expect(session.running).toBe(false);
    expect(LiveEngine.prototype.resumeSafely).not.toHaveBeenCalled();
  });

  it('the explicit Studio action still enforces the infant low-pass gate', async () => {
    await mount();
    act(() => session.setGovernor({ infantMode: true }));
    await stopAll();
    act(() => button('Play Studio quietly').click());
    // happy-dom has no AudioContext, so it cannot provide the required filter.
    expect(session.running).toBe(false);
    expect(session.startBlocked.join(' ')).toMatch(/low-pass/i);
    expect(LiveEngine.prototype.resumeSafely).not.toHaveBeenCalled();
  });

  it('holding Enter on the optional playback action does not repeat its activation', async () => {
    await mount();
    await stopAll();
    const play = button('Play Studio quietly');
    const repeatedEnter = new KeyboardEvent('keydown', { key: 'Enter', repeat: true, bubbles: true, cancelable: true });
    act(() => play.dispatchEvent(repeatedEnter));
    expect(repeatedEnter.defaultPrevented).toBe(true);
    expect(session.running).toBe(false);
    expect(LiveEngine.prototype.resumeSafely).not.toHaveBeenCalled();
  });
});

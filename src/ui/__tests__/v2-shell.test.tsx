// @vitest-environment happy-dom
/**
 * v2 shell + session contracts: the START advisory gate, governor enforcement
 * at START, the `?` shortcuts sheet and the M / F hotkeys, share-link round
 * trip through the provider, and front-panel persistence across mounts.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { renderToString } from 'react-dom/server';
import { LiveEngine } from '../audio/liveEngine';
import { SessionProvider } from '../session/SessionContext';
import { useSession } from '../session/useSession';
import { INFANT_MAX_VOLUME_DB } from '../session/sessionDefaults';
import { decodeShare } from '../session/shareLink';
import { AppShell } from '../layout/AppShell';
import { STORAGE_KEYS } from '@/lib/storage';
import { clearAdvisoryAck, seedAdvisoryAck } from '@/test/helpers';
import Studio from '@/pages/Studio';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
if (typeof Element !== 'undefined') {
  (Element.prototype as unknown as Record<string, unknown>).animate = undefined;
}

type Session = ReturnType<typeof useSession>;

function mockViewport(width: number) {
  const mql = {
    matches: width < 768,
    media: '(max-width: 767px)',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  };
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
}

let roots: Root[] = [];
let containers: HTMLElement[] = [];
let session: Session;
function Probe() {
  session = useSession();
  return null;
}

async function mount(node: React.ReactNode): Promise<HTMLElement> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  containers.push(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => root.render(node));
  return container;
}

async function mountShell() {
  return mount(
    <MemoryRouter>
      <SessionProvider>
        <Probe />
        <AppShell>
          <div data-testid="page" />
        </AppShell>
      </SessionProvider>
    </MemoryRouter>,
  );
}

function press(key: string, init: KeyboardEventInit = {}) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
  });
}

beforeEach(() => {
  mockViewport(1280);
  window.localStorage.clear();
  seedAdvisoryAck();
  vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(LiveEngine.prototype, 'resume').mockImplementation(() => {});
  vi.spyOn(LiveEngine.prototype, 'fadeOut').mockReturnValue(true);
});

afterEach(async () => {
  for (const r of roots) await act(async () => r.unmount());
  for (const c of containers) c.remove();
  roots = [];
  containers = [];
  vi.restoreAllMocks();
  vi.useRealTimers();
  window.localStorage.clear();
});

describe('START advisory gate', () => {
  it('refuses the first START, opens the advisory, and continues after acknowledgment', async () => {
    clearAdvisoryAck();
    const c = await mountShell();
    expect(session.advisoryAcknowledged).toBe(false);
    let ok = true;
    act(() => {
      ok = session.start();
    });
    expect(ok).toBe(false);
    expect(session.running).toBe(false);
    expect(session.advisoryOpen).toBe(true);
    expect(document.querySelector('[data-testid="advisory-dialog"]')).not.toBeNull();
    // Copy is the governor's own advisory text — never paraphrased.
    expect(c.ownerDocument.body.textContent).toContain('Never use while driving or operating machinery');
    act(() => session.acknowledgeAdvisory());
    expect(session.advisoryAcknowledged).toBe(true);
    expect(session.advisoryOpen).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEYS.advisoryAck)).toContain('"at"');
    act(() => {
      ok = session.start();
    });
    expect(ok).toBe(true);
    expect(session.running).toBe(true);
  });

  it('a returning user starts straight away', async () => {
    await mountShell();
    act(() => void session.start());
    expect(session.running).toBe(true);
    expect(session.startBlocked).toEqual([]);
  });
});

describe('governor enforcement at START', () => {
  it('infant mode tightens the fader and limit, and refuses to start without a live low-pass path', async () => {
    await mountShell();
    act(() => session.setGovernor({ infantMode: true }));
    expect(session.volumeDb).toBeLessThanOrEqual(INFANT_MAX_VOLUME_DB);
    expect(session.limitMin).toBeLessThanOrEqual(45);
    // No AudioContext in happy-dom ⇒ the engine cannot build the 1 kHz low-pass.
    let ok = true;
    act(() => {
      ok = session.start();
    });
    expect(ok).toBe(false);
    expect(session.running).toBe(false);
    expect(session.startBlocked.join(' ')).toMatch(/low-pass/i);
    // The fader cannot be pushed above the infant ceiling while infant mode is on.
    act(() => session.setVolumeDb(-6));
    expect(session.volumeDb).toBe(INFANT_MAX_VOLUME_DB);
  });

  it('the fader is capped at the governor gain cap (−6 dBFS)', async () => {
    await mountShell();
    act(() => session.setVolumeDb(0));
    expect(session.volumeDb).toBe(-6);
    expect(session.authorization.ok).toBe(true);
  });
});

describe('shortcut registry in the shell', () => {
  it('? opens the shortcuts sheet, Esc closes it, M mutes, F fades a running session', async () => {
    await mountShell();
    press('?');
    expect(document.querySelector('[data-testid="shortcuts-overlay"]')).not.toBeNull();
    expect(document.body.textContent).toContain('PANIC');
    press('Escape');
    // AnimatePresence keeps the node for its exit transition; give it a tick.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350));
    });
    expect(document.querySelector('[data-testid="shortcuts-overlay"]')).toBeNull();
    press('m');
    expect(session.muted).toBe(true);
    press('m');
    expect(session.muted).toBe(false);
    // F is inert while idle …
    press('f');
    expect(session.fading).toBe(false);
    // … and starts the sleep fade while running.
    act(() => void session.start());
    press('f');
    expect(session.fading).toBe(true);
    expect(LiveEngine.prototype.fadeOut).toHaveBeenCalledWith(30);
  });

  it('typing "p" in a text field never panics', async () => {
    await mountShell();
    act(() => void session.start());
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true }));
    });
    expect(session.panicked).toBe(false);
    expect(session.running).toBe(true);
    input.remove();
  });
});

describe('share links through the provider', () => {
  it('round-trips the front panel', async () => {
    await mountShell();
    act(() => {
      session.setMode('isochronic');
      session.setCarrierHz(300);
      session.setNoiseDb('pink', -20);
      session.setFadeOutSec(120);
    });
    const link = session.getShareLink();
    expect(link).toContain('/studio#s=');
    const decoded = decodeShare(link.split('#s=')[1])!;
    expect(decoded.mode).toBe('isochronic');
    expect(decoded.carrierHz).toBe(300);
    expect(decoded.noiseDb.pink).toBe(-20);
    expect(decoded.fadeOutSec).toBe(120);
    act(() => session.resetFrontPanel());
    expect(session.mode).toBe('binaural');
    act(() => session.applyShare(decoded));
    expect(session.mode).toBe('isochronic');
    expect(session.carrierHz).toBe(300);
    expect(session.presetName).toBe('Shared session');
  });
});

describe('front-panel persistence', () => {
  it('remembers the panel across provider mounts', async () => {
    vi.useFakeTimers();
    await mountShell();
    act(() => {
      session.setMode('monaural');
      session.setCarrierHz(432);
      session.setFadeOutSec(300);
    });
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(window.localStorage.getItem(STORAGE_KEYS.frontPanel)).toContain('"monaural"');
    for (const r of roots) await act(async () => r.unmount());
    roots = [];
    await mountShell();
    expect(session.mode).toBe('monaural');
    expect(session.carrierHz).toBe(432);
    expect(session.fadeOutSec).toBe(300);
    expect(session.dirty).toBe(false);
  });
});

describe('Studio session tools (SSR smoke)', () => {
  it('renders the v2 tools row with the fade chips, share, format and headphone notice', () => {
    const html = renderToString(
      <MemoryRouter>
        <SessionProvider>
          <Studio />
        </SessionProvider>
      </MemoryRouter>,
    );
    expect(html).toContain('data-testid="session-tools"');
    expect(html).toContain('SLEEP FADE');
    expect(html).toContain('data-testid="share-link"');
    expect(html).toContain('id="export-format"');
    expect(html).toContain('HEADPHONES REQUIRED');
  });
});

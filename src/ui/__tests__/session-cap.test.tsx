// @vitest-environment happy-dom
/**
 * v2.2: the fixed 90-minute session cap is gone; the user sets their own.
 *  - no cap by default (only the 24 h engineering bound)
 *  - a cap bounds the length, tightens a running session, never loosens one
 *  - the cap persists with the front panel; a share link lands under it
 *  - Safety Center chips / typed values drive the governor
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { SessionProvider } from '../session/SessionContext';
import { useSession } from '../session/useSession';
import { decodeShare, encodeShare } from '../session/shareLink';
import { MAX_SESSION_MIN } from '@/safety/governor';
import { STORAGE_KEYS } from '@/lib/storage';
import { seedAdvisoryAck } from '@/test/helpers';
import Safety from '@/pages/Safety';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
if (typeof Element !== 'undefined') {
  (Element.prototype as unknown as Record<string, unknown>).animate = undefined;
}
const mobileState = vi.hoisted(() => ({ mobile: false }));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => mobileState.mobile }));

class FakeParam {
  value = 1;
  setTargetAtTime() {}
  cancelScheduledValues() {}
  setValueAtTime() {}
  linearRampToValueAtTime() {}
}
class FakeNode {
  connect() {}
  disconnect() {}
}
function installFakeAudio() {
  (globalThis as Record<string, unknown>).AudioContext = class {
    state = 'running';
    currentTime = 0;
    sampleRate = 48000;
    destination = new FakeNode();
    onstatechange: (() => void) | null = null;
    createGain() {
      return Object.assign(new FakeNode(), { gain: new FakeParam() });
    }
    createAnalyser() {
      return Object.assign(new FakeNode(), { fftSize: 2048, frequencyBinCount: 1024, smoothingTimeConstant: 0 });
    }
    createChannelSplitter() {
      return new FakeNode();
    }
    createChannelMerger() {
      return new FakeNode();
    }
    createOscillator() {
      return Object.assign(new FakeNode(), { type: 'sine', frequency: new FakeParam(), start() {}, stop() {} });
    }
    createBufferSource() {
      return Object.assign(new FakeNode(), { buffer: null, loop: false, start() {}, stop() {}, onended: null });
    }
    createBuffer(_c: number, len: number) {
      return { getChannelData: () => new Float32Array(len) };
    }
    createBiquadFilter() {
      return Object.assign(new FakeNode(), { type: 'lowpass', frequency: new FakeParam(), Q: new FakeParam() });
    }
    resume() {}
    suspend() {}
  };
}

let session: ReturnType<typeof useSession>;
function Probe() {
  session = useSession();
  return null;
}
let roots: Root[] = [];
let containers: HTMLElement[] = [];
async function mountSession(children?: React.ReactNode): Promise<HTMLElement> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  containers.push(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () =>
    root.render(
      <MemoryRouter>
        <SessionProvider>
          <Probe />
          {children}
        </SessionProvider>
      </MemoryRouter>,
    ),
  );
  return container;
}

/** Type into a controlled input the way a user would (native setter + input event), then press Enter. */
function typeAndEnter(input: HTMLInputElement, text: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
}

const chips = (root: HTMLElement, testId: string): HTMLButtonElement[] =>
  Array.from(root.querySelector(`[data-testid="${testId}"]`)!.querySelectorAll('button'));

describe('session cap (v2.2)', () => {
  beforeEach(() => {
    roots = [];
    containers = [];
    mobileState.mobile = false;
    window.localStorage.clear();
    seedAdvisoryAck();
    installFakeAudio();
  });
  afterEach(async () => {
    for (const r of roots) await act(async () => r.unmount());
    for (const c of containers) c.remove();
    delete (globalThis as Record<string, unknown>).AudioContext;
    vi.useRealTimers();
  });

  it('has no cap by default: the length can pass 90 minutes, up to the 24-hour bound', async () => {
    await mountSession();
    expect(session.governor.maxSessionMin).toBe(MAX_SESSION_MIN);
    expect(session.limitMin).toBe(90); // the default length is unchanged
    act(() => session.setLimitMin(300));
    expect(session.limitMin).toBe(300);
    expect(session.authorization.ok).toBe(true);
    act(() => session.setLimitMin(99999));
    expect(session.limitMin).toBe(MAX_SESSION_MIN);
  });

  it('a user cap bounds the length, tightens a running session at once, and never loosens one', async () => {
    await mountSession();
    act(() => session.setLimitMin(120));
    act(() => session.setGovernor({ maxSessionMin: 60 }));
    expect(session.governor.maxSessionMin).toBe(60);
    expect(session.limitMin).toBe(60);
    act(() => session.setLimitMin(90));
    expect(session.limitMin).toBe(60); // clamped to the cap
    act(() => session.setGovernor({ maxSessionMin: 2 }));
    expect(session.governor.maxSessionMin).toBe(5); // floor
    act(() => session.setGovernor({ maxSessionMin: 60 }));
    act(() => session.setLimitMin(60));
    let ok = false;
    act(() => {
      ok = session.start();
    });
    expect(ok).toBe(true);
    act(() => session.setGovernor({ maxSessionMin: 30 }));
    expect(session.limitMin).toBe(30); // tightened mid-session
    act(() => session.setGovernor({ maxSessionMin: MAX_SESSION_MIN }));
    act(() => session.setLimitMin(90));
    expect(session.limitMin).toBe(30); // loosening refused while running
    act(() => session.stop());
    act(() => session.setLimitMin(90));
    expect(session.limitMin).toBe(90);
  });

  it('is remembered with the front panel, and a share link lands under the cap', async () => {
    vi.useFakeTimers();
    await mountSession();
    act(() => session.setGovernor({ maxSessionMin: 45 }));
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.frontPanel)!) as { data: { sessionCapMin: number; limitMin: number } };
    expect(raw.data.sessionCapMin).toBe(45);
    expect(raw.data.limitMin).toBe(45);
    const enc = encodeShare({
      mode: 'binaural',
      carrierHz: 200,
      waveform: 'sine',
      phases: [{ durationSec: 120, beatHz: 10 }],
      noiseDb: {},
      noiseOn: true,
      nature: { on: false, kind: 'rain', db: -30 },
      bowls: [],
      bellEveryMin: 0,
      layersOn: true,
      limitMin: 600,
      fadeOutSec: 30,
    });
    const shared = decodeShare(enc)!;
    expect(shared.limitMin).toBe(600); // the link itself may carry a long session
    act(() => session.applyShare(shared));
    expect(session.limitMin).toBe(45); // but it lands under the receiver's cap
  });

  it('Safety Center: OFF / chips / a typed cap drive the governor; length chips stay inside the cap', async () => {
    const c = await mountSession(<Safety />);
    const readout = () => c.querySelector('[data-testid="session-cap-readout"]')!.textContent;
    expect(readout()).toBe('NO CAP');
    const capChip = (label: string) => chips(c, 'session-cap').find((b) => b.textContent === label)!;
    act(() => capChip('60').click());
    expect(session.governor.maxSessionMin).toBe(60);
    expect(readout()).toBe('01:00:00');
    expect(capChip('60').getAttribute('aria-pressed') ?? capChip('60').className).toBeTruthy();
    // Length chips above the cap disappear.
    const lengthLabels = chips(c, 'session-length').map((b) => b.textContent);
    expect(lengthLabels).toEqual(['30', '60']);
    act(() => typeAndEnter(c.querySelector<HTMLInputElement>('input[aria-label="Custom session cap (minutes)"]')!, '75'));
    expect(session.governor.maxSessionMin).toBe(75);
    act(() => typeAndEnter(c.querySelector<HTMLInputElement>('input[aria-label="Custom session cap (minutes)"]')!, '2'));
    expect(session.governor.maxSessionMin).toBe(75); // out of range → refused, not clamped silently
    act(() => typeAndEnter(c.querySelector<HTMLInputElement>('input[aria-label="Custom session length (minutes)"]')!, '70'));
    expect(session.limitMin).toBe(70);
    act(() => capChip('OFF').click());
    expect(session.governor.maxSessionMin).toBe(MAX_SESSION_MIN);
    expect(readout()).toBe('NO CAP');
    expect(chips(c, 'session-length').map((b) => b.textContent)).toEqual(['30', '60', '90', '120', '180', '240']);
  });

  it('on a phone every Safety panel spans one column (an ungated span-4 child collapsed the grid)', async () => {
    mobileState.mobile = true;
    const c = await mountSession(<Safety />);
    const grid = Array.from(c.querySelectorAll('div.grid')).find((g) => g.textContent?.includes('SESSION LIMITS'))!;
    expect(grid).toBeTruthy();
    expect((grid as HTMLElement).style.gridTemplateColumns).toBe('1fr');
    const spans = Array.from(grid.children).map((ch) => (ch as HTMLElement).style.gridColumn);
    expect(spans.length).toBeGreaterThanOrEqual(4);
    expect(spans.every((v) => v === 'span 1')).toBe(true);
  });
});

// @vitest-environment happy-dom
/**
 * Open Sync Everyday — app-level tests over the real SessionProvider with a
 * fake AudioContext: first-run advisory → start, the player, Sounds rows,
 * Settings chips, tab navigation, and the "nothing longer than 12 words"
 * rule for every screen (About's disclosures excepted).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { clearAdvisoryAck, seedAdvisoryAck } from '@/test/helpers';
import { BOWL_SETS } from '@/engine';
import EverydayApp from '../EverydayApp';
import { THEME_STORAGE_KEY } from '../theme';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
if (typeof Element !== 'undefined') {
  (Element.prototype as unknown as Record<string, unknown>).animate = undefined;
}

// ---------------------------------------------------------------------------
// Fake Web Audio (same shape as the lab's session tests)
// ---------------------------------------------------------------------------

class FakeParam {
  value = 1;
  setTargetAtTime() {}
  cancelScheduledValues() {}
  setValueAtTime() {}
  linearRampToValueAtTime() {}
  exponentialRampToValueAtTime() {}
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
    createStereoPanner() {
      return Object.assign(new FakeNode(), { pan: new FakeParam() });
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
    createMediaElementSource() {
      return new FakeNode();
    }
    resume() {}
    suspend() {}
  };
}

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

let session: ReturnType<typeof useSession>;
function Probe() {
  session = useSession();
  return null;
}

let roots: Root[] = [];
let containers: HTMLElement[] = [];

async function mountApp(path = '/'): Promise<HTMLElement> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  containers.push(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () =>
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <SessionProvider>
          <Probe />
          <EverydayApp />
        </SessionProvider>
      </MemoryRouter>,
    ),
  );
  return container;
}

const q = <T extends HTMLElement = HTMLElement>(root: ParentNode, testId: string): T => {
  const el = root.querySelector<T>(`[data-testid="${testId}"]`);
  if (!el) throw new Error(`missing [data-testid="${testId}"]`);
  return el;
};
const has = (root: ParentNode, testId: string): boolean => root.querySelector(`[data-testid="${testId}"]`) !== null;
const click = async (el: HTMLElement) => act(async () => el.click());

/** Drive a controlled range/number input the way a user would (native setter + input event). */
function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

const wordCount = (s: string): number => s.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;

/** Every text node's word count, skipping <details> (About's disclosures) and hidden nodes. */
function longTextNodes(root: HTMLElement, max = 12): string[] {
  const out: string[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent ?? '';
    if (!text.trim()) continue;
    const el = n.parentElement;
    if (!el || el.closest('details') || el.closest('script, style')) continue;
    if (wordCount(text) > max) out.push(text.trim());
  }
  return out;
}

beforeEach(() => {
  roots = [];
  containers = [];
  window.localStorage.clear();
  seedAdvisoryAck();
  installFakeAudio();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(async () => {
  for (const root of roots) await act(async () => root.unmount());
  for (const c of containers) c.remove();
  document.body.innerHTML = '';
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  delete (globalThis as Record<string, unknown>).AudioContext;
});

// ---------------------------------------------------------------------------
// Play
// ---------------------------------------------------------------------------

describe('Play — first run', () => {
  it('fresh profile: Sleep raises the advisory sheet; accepting starts the session and shows the remaining time', async () => {
    clearAdvisoryAck();
    const c = await mountApp('/');
    expect(has(c, 'intent-cards')).toBe(true);
    expect(has(c, 'advisory-sheet')).toBe(false);

    await click(q(c, 'intent-sleep'));
    expect(session.running).toBe(false);
    expect(session.advisoryOpen).toBe(true);
    const sheet = q(c, 'advisory-sheet');
    expect(sheet.getAttribute('role')).toBe('dialog');
    expect(sheet.textContent).toContain('Before you start');
    expect(sheet.querySelectorAll('.ev-adv-row')).toHaveLength(4);

    await click(q(c, 'advisory-accept'));
    expect(session.advisoryAcknowledged).toBe(true);
    expect(session.running).toBe(true);
    expect(session.limitMin).toBe(45);
    expect(session.presetName).toBe('Slow-Wave Cueing (closed-loop analog)');
    expect(session.noiseDb.brown).toBe(-30);
    expect(session.noiseDb.pink).toBe(-Infinity);
    expect(session.fadeOutSec).toBe(600);
    expect(has(c, 'player')).toBe(true);
    expect(has(c, 'intent-cards')).toBe(false);
    expect(q(c, 'remaining').textContent).toBe('45:00');
    expect(q(c, 'ends-at').textContent).toMatch(/Ends \d/);
    expect(q(c, 'intent-chip-sleep').getAttribute('aria-pressed')).toBe('true');
    expect(q(c, 'evidence-pill').textContent).toBe('Evidence B');
  });

  it('Not now closes the sheet without starting', async () => {
    clearAdvisoryAck();
    const c = await mountApp('/');
    await click(q(c, 'intent-focus'));
    expect(session.advisoryOpen).toBe(true);
    await click(q(c, 'advisory-dismiss'));
    expect(session.advisoryOpen).toBe(false);
    expect(session.running).toBe(false);
    expect(session.advisoryAcknowledged).toBe(false);
    expect(has(c, 'intent-cards')).toBe(true);
  });
});

describe('Play — player', () => {
  it('returning user: Meditate starts at once with bowls + bell; pause / resume / stop', async () => {
    const c = await mountApp('/');
    await click(q(c, 'intent-meditate'));
    expect(session.running).toBe(true);
    expect(session.limitMin).toBe(20);
    expect(session.bowls.filter((b) => b.on)).toHaveLength(3);
    expect(session.bellEveryMin).toBe(10);
    expect(session.nature.on).toBe(false);
    expect(q(c, 'toggle-bowls').getAttribute('aria-pressed')).toBe('true');
    expect(q(c, 'toggle-bell').getAttribute('aria-pressed')).toBe('true');
    expect(q(c, 'toggle-noise').getAttribute('aria-pressed')).toBe('false');

    const pp = q(c, 'play-pause');
    expect(pp.getAttribute('aria-label')).toBe('Pause');
    await click(pp);
    expect(session.paused).toBe(true);
    expect(has(c, 'paused')).toBe(true);
    expect(q(c, 'play-pause').getAttribute('aria-label')).toBe('Play');
    await click(q(c, 'play-pause'));
    expect(session.paused).toBe(false);
    expect(has(c, 'paused')).toBe(false);

    await click(q(c, 'stop'));
    expect(session.running).toBe(false);
    expect(has(c, 'player')).toBe(false);
    expect(has(c, 'intent-cards')).toBe(true);
  });

  it('duration chips, volume, quick toggles and the bell cycle drive the session', async () => {
    const c = await mountApp('/');
    await click(q(c, 'intent-relax'));
    expect(session.running).toBe(true);
    expect(session.nature).toEqual({ on: true, kind: 'rain', db: -30 });
    expect(session.noiseDb.pink).toBe(-34);

    // Chips: the cap allows 15…180; a running session only tightens.
    const chips = Array.from(q(c, 'duration-chips').querySelectorAll('button')).map((b) => b.textContent);
    expect(chips).toEqual(['15 min', '30 min', '45 min', '60 min', '90 min', '120 min', '180 min']);
    expect(q<HTMLButtonElement>(c, 'duration-60').disabled).toBe(true);
    await click(q(c, 'duration-15'));
    expect(session.limitMin).toBe(15);
    expect(q(c, 'remaining').textContent).toBe('15:00');

    // Volume: 0–100 % ↔ −60…0 dB (the governor caps at −6 dBFS).
    const vol = q<HTMLInputElement>(c, 'volume');
    await act(async () => setInputValue(vol, '50'));
    expect(session.volumeDb).toBe(-30);
    await act(async () => setInputValue(vol, '100'));
    expect(session.volumeDb).toBe(-6);

    await click(q(c, 'toggle-noise'));
    expect(session.noiseOn).toBe(false);
    await click(q(c, 'toggle-noise'));
    expect(session.noiseOn).toBe(true);
    await click(q(c, 'toggle-nature'));
    expect(session.nature.on).toBe(false);
    await click(q(c, 'toggle-bowls'));
    expect(session.bowls.filter((b) => b.on)).toHaveLength(3);
    await click(q(c, 'toggle-bowls'));
    expect(session.bowls.some((b) => b.on)).toBe(false);

    expect(session.bellEveryMin).toBe(0);
    await click(q(c, 'toggle-bell'));
    expect(session.bellEveryMin).toBe(5);
    await click(q(c, 'toggle-bell'));
    expect(session.bellEveryMin).toBe(10);
    await click(q(c, 'toggle-bell'));
    expect(session.bellEveryMin).toBe(15);
    await click(q(c, 'toggle-bell'));
    expect(session.bellEveryMin).toBe(0);
  });

  it('Fade & stop becomes Cancel fade while fading', async () => {
    const c = await mountApp('/');
    await click(q(c, 'intent-focus'));
    const fade = q(c, 'fade');
    expect(fade.textContent).toBe('Fade & stop');
    await click(fade);
    expect(session.fading).toBe(true);
    expect(q(c, 'fade').textContent).toBe('Cancel fade');
    expect(q(c, 'ends-at').textContent).toMatch(/^Fading · Ends/);
    await click(q(c, 'fade'));
    expect(session.fading).toBe(false);
    expect(q(c, 'fade').textContent).toBe('Fade & stop');
  });

  it('the evidence pill opens a sheet with exactly four rows and the lab link', async () => {
    const c = await mountApp('/');
    expect(has(c, 'evidence-sheet')).toBe(false);
    await click(q(c, 'evidence-pill'));
    const sheet = q(c, 'evidence-sheet');
    expect(sheet.querySelectorAll('.ev-ev-row')).toHaveLength(4);
    expect(q<HTMLAnchorElement>(sheet, 'evidence-lab-link').getAttribute('href')).toMatch(/knowledge$/);
  });

  it('a #/?intent= shortcut applies that intent once and clears the query', async () => {
    const c = await mountApp('/?intent=focus');
    expect(session.running).toBe(true);
    expect(session.presetName).toBe('Alpha Flow');
    expect(q(c, 'intent-chip-focus').getAttribute('aria-pressed')).toBe('true');
    expect(q(c, 'evidence-pill').textContent).toBe('Evidence C');
  });
});

// ---------------------------------------------------------------------------
// Sounds
// ---------------------------------------------------------------------------

describe('Sounds', () => {
  it('noise rows: Brown sets brown finite and every other colour −∞; Off silences all', async () => {
    const c = await mountApp('/sounds');
    expect(q(c, 'noise-off').getAttribute('aria-checked')).toBe('true');
    await click(q(c, 'noise-brown'));
    expect(Number.isFinite(session.noiseDb.brown)).toBe(true);
    for (const [color, db] of Object.entries(session.noiseDb)) if (color !== 'brown') expect(db, color).toBe(-Infinity);
    expect(session.noiseOn).toBe(true);
    expect(q(c, 'noise-brown').getAttribute('aria-checked')).toBe('true');
    expect(q(c, 'noise-off').getAttribute('aria-checked')).toBe('false');

    // Level slider (0–100 % ↔ −60…−10 dB) writes the selected colour.
    await act(async () => setInputValue(q<HTMLInputElement>(c, 'noise-level'), '50'));
    expect(session.noiseDb.brown).toBe(-35);

    await click(q(c, 'noise-pink'));
    expect(session.noiseDb.pink).toBe(-35);
    expect(session.noiseDb.brown).toBe(-Infinity);

    await click(q(c, 'noise-off'));
    for (const db of Object.values(session.noiseDb)) expect(db).toBe(-Infinity);
    expect(q<HTMLInputElement>(c, 'noise-level').disabled).toBe(true);
  });

  it('nature rows + level', async () => {
    const c = await mountApp('/sounds');
    await click(q(c, 'nature-ocean'));
    expect(session.nature.on).toBe(true);
    expect(session.nature.kind).toBe('ocean');
    expect(q(c, 'nature-ocean').getAttribute('aria-checked')).toBe('true');
    await act(async () => setInputValue(q<HTMLInputElement>(c, 'nature-level'), '100'));
    expect(session.nature.db).toBe(-10);
    await click(q(c, 'nature-off'));
    expect(session.nature.on).toBe(false);
  });

  it('bowl rows: the Himalayan trio turns three bowls on; the level applies to every bowl; Off keeps the set', async () => {
    const c = await mountApp('/sounds');
    expect(q(c, 'bowls-off').getAttribute('aria-checked')).toBe('true');
    expect(c.querySelectorAll('[data-testid^="bowls-"]:not([data-testid="bowls-off"]):not([data-testid="bowls-level"])')).toHaveLength(BOWL_SETS.length);
    await click(q(c, 'bowls-himalayan-trio'));
    expect(session.bowls.filter((b) => b.on)).toHaveLength(3);
    expect(q(c, 'bowls-himalayan-trio').getAttribute('aria-checked')).toBe('true');
    await act(async () => setInputValue(q<HTMLInputElement>(c, 'bowls-level'), '0'));
    for (const b of session.bowls) expect(b.db).toBe(-60);
    await click(q(c, 'bowls-off'));
    expect(session.bowls.some((b) => b.on)).toBe(false);
    expect(session.bowls).toHaveLength(3);
    expect(q(c, 'bowls-off').getAttribute('aria-checked')).toBe('true');
  });

  it('bell rows', async () => {
    const c = await mountApp('/sounds');
    expect(q(c, 'bell-0').getAttribute('aria-checked')).toBe('true');
    await click(q(c, 'bell-20'));
    expect(session.bellEveryMin).toBe(20);
    expect(q(c, 'bell-20').getAttribute('aria-checked')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

describe('Settings', () => {
  it('cap chips, custom cap, sleep fade, infant mode', async () => {
    const c = await mountApp('/settings');
    expect(q(c, 'cap-off').getAttribute('aria-pressed')).toBe('true');
    await click(q(c, 'cap-60'));
    expect(session.governor.maxSessionMin).toBe(60);
    expect(q(c, 'cap-60').getAttribute('aria-pressed')).toBe('true');
    expect(session.limitMin).toBeLessThanOrEqual(60);

    const custom = q<HTMLInputElement>(c, 'cap-custom');
    await act(async () => {
      setInputValue(custom, '75');
    });
    await act(async () => {
      custom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    });
    expect(session.governor.maxSessionMin).toBe(75);
    expect(q(c, 'cap-60').getAttribute('aria-pressed')).toBe('false');

    await click(q(c, 'cap-off'));
    expect(session.governor.maxSessionMin).toBe(24 * 60);

    await click(q(c, 'fade-120'));
    expect(session.fadeOutSec).toBe(120);
    expect(q(c, 'fade-120').getAttribute('aria-pressed')).toBe('true');

    const infant = q(c, 'infant-mode');
    expect(infant.getAttribute('aria-checked')).toBe('false');
    await click(infant);
    expect(session.governor.infantMode).toBe(true);
    expect(q(c, 'infant-mode').getAttribute('aria-checked')).toBe('true');
    expect(session.limitMin).toBeLessThanOrEqual(45);
  });

  it('theme chips stamp data-theme on <html> and persist under the everyday key', async () => {
    const c = await mountApp('/settings');
    expect(q(c, 'theme-auto').getAttribute('aria-pressed')).toBe('true');
    await click(q(c, 'theme-light'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    await click(q(c, 'theme-dark'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    await click(q(c, 'theme-auto'));
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('install hint, lab link and About link', async () => {
    const c = await mountApp('/settings');
    expect(has(c, 'install-hint')).toBe(true);
    expect(has(c, 'install-button')).toBe(false);
    expect(q<HTMLAnchorElement>(c, 'open-lab').getAttribute('href')).toBe(import.meta.env.BASE_URL);
    await click(q(c, 'about-link'));
    expect(has(c, 'screen-about')).toBe(true);
    expect(c.querySelectorAll('details.ev-details')).toHaveLength(4);
    for (const d of Array.from(c.querySelectorAll<HTMLDetailsElement>('details.ev-details'))) expect(d.open).toBe(false);
    expect(q(c, 'safety-crisis').textContent).toContain('988');
  });
});

// ---------------------------------------------------------------------------
// Tabs + copy rule in the DOM
// ---------------------------------------------------------------------------

describe('Tab bar', () => {
  it('navigates between Play, Sounds and Settings; the active tab carries aria-current', async () => {
    const c = await mountApp('/');
    expect(q(c, 'tab-play').getAttribute('aria-current')).toBe('page');
    await click(q(c, 'tab-sounds'));
    expect(has(c, 'screen-sounds')).toBe(true);
    expect(q(c, 'tab-sounds').getAttribute('aria-current')).toBe('page');
    expect(q(c, 'tab-play').getAttribute('aria-current')).toBeNull();
    await click(q(c, 'tab-settings'));
    expect(has(c, 'screen-settings')).toBe(true);
    expect(q(c, 'tab-settings').className).toContain('is-active');
    await click(q(c, 'tab-play'));
    expect(has(c, 'screen-play')).toBe(true);
  });
});

describe('No string longer than 12 words', () => {
  it('Play (idle, running, with the advisory and evidence sheets), Sounds, Settings, About', async () => {
    clearAdvisoryAck();
    const play = await mountApp('/');
    expect(longTextNodes(play)).toEqual([]);
    await click(q(play, 'intent-sleep'));
    expect(longTextNodes(play)).toEqual([]); // advisory sheet open
    await click(q(play, 'advisory-accept'));
    expect(session.running).toBe(true);
    expect(longTextNodes(play)).toEqual([]); // player
    await click(q(play, 'evidence-pill'));
    expect(longTextNodes(play)).toEqual([]); // evidence sheet

    for (const path of ['/sounds', '/settings', '/about']) {
      const c = await mountApp(path);
      expect(longTextNodes(c), path).toEqual([]);
    }
  });
});

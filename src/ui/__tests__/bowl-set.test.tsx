// @vitest-environment happy-dom
/**
 * Studio bowl set (LAYERS panel) — UI tests for BowlSet.tsx:
 *  - header count, + ADD BOWL / remove rows, ADD disabled at MAX_BOWLS
 *  - per-row controls (LED, material, strike, note, typed Hz, LOCK, pan,
 *    interval, level) call through to the session and the live engine
 *  - LOAD SET replaces the set with the preset's bowls and resets the menu
 *  - interval-bell chips set bellEveryMin with aria-pressed
 *  - LOCK shows the carrier Hz and note, and follows carrier changes
 *  - the pure helpers in bowlSetLogic.ts
 *
 * Run: `npx vitest run src/ui/__tests__/bowl-set.test.tsx`.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { BOWL_NOTE_CHOICES, BOWL_SETS, MAX_BOWLS, noteLabel } from '@/engine';
import { SessionProvider } from '../session/SessionContext';
import { useSession } from '../session/useSession';
import { LiveEngine } from '../audio/liveEngine';
import Studio from '@/pages/Studio';
import {
  CUSTOM_NOTE,
  bellChoiceLabel,
  bowlCaption,
  bowlPitchHz,
  customNoteLabel,
  levelSliderDb,
  listedNoteFor,
  noteSelectValue,
  panLabel,
  parseBowlHz,
  restrikeLabel,
} from '../components/bowlSetLogic';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// happy-dom's WAAPI rejects on Animation.cancel during framer-motion unmount
// cleanup; force framer-motion onto its rAF fallback.
if (typeof Element !== 'undefined') {
  (Element.prototype as unknown as Record<string, unknown>).animate = undefined;
}

const mobileState = vi.hoisted(() => ({ mobile: false }));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => mobileState.mobile }));

// ---------------------------------------------------------------------------
// Fake AudioContext (same shape as the studio-bypass harness, kept local)
// ---------------------------------------------------------------------------

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

class FakeAudioContext {
  state: AudioContextState = 'running';
  currentTime = 0;
  sampleRate = 48000;
  destination = new FakeNode();
  createGain() {
    return Object.assign(new FakeNode(), { gain: new FakeParam() });
  }
  createAnalyser() {
    return Object.assign(new FakeNode(), {
      fftSize: 2048,
      frequencyBinCount: 1024,
      smoothingTimeConstant: 0,
      getByteTimeDomainData() {},
      getFloatTimeDomainData() {},
      getByteFrequencyData() {},
    });
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
    return Object.assign(new FakeNode(), { buffer: null as unknown, loop: false, start() {}, stop() {}, onended: null });
  }
  createBuffer(_ch: number, len: number, _sr: number) {
    return { getChannelData: () => new Float32Array(len) };
  }
  resume() {}
  suspend() {}
}

// ---------------------------------------------------------------------------
// Mount harness
// ---------------------------------------------------------------------------

let roots: Root[] = [];
let containers: HTMLElement[] = [];
let session: ReturnType<typeof useSession>;

function Probe() {
  session = useSession();
  return null;
}

async function mountStudio(): Promise<HTMLElement> {
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
          <Studio />
        </SessionProvider>
      </MemoryRouter>,
    ),
  );
  return container;
}

/** Query by aria-label (the public contract of every bowl control). */
function byLabel<T extends Element = HTMLElement>(c: HTMLElement, label: string): T {
  const el = c.querySelector<T>(`[aria-label="${label}"]`);
  if (!el) throw new Error(`no element with aria-label "${label}"`);
  return el;
}

/**
 * Drive a controlled <select> / <input> the way a user would: set the value
 * through the prototype setter (bypassing React's value tracker) and fire the
 * native event React listens to (change for select, input for range/text).
 */
async function setValue(el: HTMLInputElement | HTMLSelectElement, value: string) {
  const isSelect = el instanceof HTMLSelectElement;
  const proto = isSelect ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  await act(async () => {
    if (setter) setter.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event(isSelect ? 'change' : 'input', { bubbles: true }));
  });
}

function rows(c: HTMLElement): HTMLElement[] {
  return Array.from(c.querySelectorAll<HTMLElement>('[data-testid="bowl-row"]'));
}

function chipByText(c: HTMLElement, text: string): HTMLButtonElement {
  const el = Array.from(c.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === text);
  if (!el) throw new Error(`no button "${text}"`);
  return el;
}

describe('Studio bowl set UI', () => {
  beforeEach(() => {
    roots = [];
    containers = [];
    mobileState.mobile = false;
    (globalThis as Record<string, unknown>).AudioContext = FakeAudioContext;
    vi.spyOn(LiveEngine.prototype, 'setBowls');
    vi.spyOn(LiveEngine.prototype, 'strikeBell').mockImplementation(() => true);
  });

  afterEach(async () => {
    for (const root of roots) {
      await act(async () => root.unmount());
    }
    for (const c of containers) c.remove();
    document.body.innerHTML = '';
    delete (globalThis as Record<string, unknown>).AudioContext;
    vi.restoreAllMocks();
  });

  it('renders the header, the default row and the interval bell', async () => {
    const c = await mountStudio();
    expect(c.textContent).toContain('SINGING BOWLS');
    expect(c.textContent).toContain('INTERVAL BELL');
    expect(c.querySelector('[data-testid="bowl-count"]')?.textContent).toBe(`1 / ${MAX_BOWLS}`);
    expect(rows(c)).toHaveLength(1);
    // Every per-row control is reachable by its aria-label.
    for (const label of ['Bowl 1 on', 'Bowl 1 material', 'Bowl 1 strike', 'Bowl 1 note', 'Bowl 1 pan', 'Bowl 1 interval', 'Bowl 1 level', 'Remove bowl 1']) {
      expect(byLabel(c, label), label).toBeTruthy();
    }
    expect(byLabel<HTMLSelectElement>(c, 'Load bowl set').value).toBe('');
    // Caption comes from the material + strike blurbs (sound model, no effect claim).
    expect(c.querySelector('[data-testid="bowl-caption"]')?.textContent).toBe(bowlCaption(session.bowls[0].material, session.bowls[0].strike));
    // The header InfoPopover + the bell InfoPopover both resolve their feature docs.
    expect(byLabel(c, 'About the singing bowls layer')).toBeTruthy();
    expect(byLabel(c, 'About the interval bell')).toBeTruthy();
  });

  it('+ ADD BOWL appends a row (count updates) and × removes it', async () => {
    const c = await mountStudio();
    const add = chipByText(c, '+ ADD BOWL');
    expect(add.disabled).toBe(false);
    await act(async () => add.click());
    expect(session.bowls).toHaveLength(2);
    expect(rows(c)).toHaveLength(2);
    expect(c.querySelector('[data-testid="bowl-count"]')?.textContent).toBe(`2 / ${MAX_BOWLS}`);
    expect(byLabel(c, 'Bowl 2 on').getAttribute('aria-pressed')).toBe('true'); // new bowls start on
    expect(LiveEngine.prototype.setBowls).toHaveBeenCalled();

    const secondId = session.bowls[1].id;
    await act(async () => byLabel<HTMLButtonElement>(c, 'Remove bowl 2').click());
    expect(session.bowls).toHaveLength(1);
    expect(session.bowls.some((b) => b.id === secondId)).toBe(false);
    expect(rows(c)).toHaveLength(1);
    expect(c.querySelector('[data-testid="bowl-count"]')?.textContent).toBe(`1 / ${MAX_BOWLS}`);

    await act(async () => byLabel<HTMLButtonElement>(c, 'Remove bowl 1').click());
    expect(session.bowls).toHaveLength(0);
    expect(rows(c)).toHaveLength(0);
    expect(c.querySelector('[data-testid="bowl-set-empty"]')).toBeTruthy();
  });

  it('LED toggles the bowl on/off', async () => {
    const c = await mountStudio();
    const led = byLabel<HTMLButtonElement>(c, 'Bowl 1 on');
    expect(session.bowls[0].on).toBe(false); // factory default: present but off
    expect(led.getAttribute('aria-pressed')).toBe('false');
    await act(async () => led.click());
    expect(session.bowls[0].on).toBe(true);
    expect(led.getAttribute('aria-pressed')).toBe('true');
  });

  it('material / strike / pan / interval / level controls call through to the set', async () => {
    const c = await mountStudio();
    const id = session.bowls[0].id;
    const calls = (LiveEngine.prototype.setBowls as unknown as { mock: { calls: unknown[][] } }).mock.calls.length;

    await setValue(byLabel<HTMLSelectElement>(c, 'Bowl 1 material'), 'brass');
    expect(session.bowls[0].material).toBe('brass');
    expect(c.querySelector('[data-testid="bowl-caption"]')?.textContent).toContain('Thin brass model');

    expect(c.querySelector('[data-testid="bowl-interval-label"]')?.textContent).toBe('INTERVAL');
    await setValue(byLabel<HTMLSelectElement>(c, 'Bowl 1 strike'), 'rim');
    expect(session.bowls[0].strike).toBe('rim');
    // A rim-sung bowl's interval is the loop length of its swell/release cycle.
    expect(c.querySelector('[data-testid="bowl-interval-label"]')?.textContent).toBe('CYCLE');

    await setValue(byLabel<HTMLInputElement>(c, 'Bowl 1 pan'), '-0.5');
    expect(session.bowls[0].pan).toBeCloseTo(-0.5);
    expect(c.querySelector('[data-testid="bowl-pan-label"]')?.textContent).toBe('L 50');

    await setValue(byLabel<HTMLSelectElement>(c, 'Bowl 1 interval'), '12');
    expect(session.bowls[0].restrikeSec).toBe(12);

    await setValue(byLabel<HTMLInputElement>(c, 'Bowl 1 level'), '-20');
    expect(session.bowls[0].db).toBe(-20);
    expect(c.querySelector('[data-testid="bowl-level-label"]')?.textContent).toBe('-20.0 dB');

    // Same bowl throughout (patched by id), and every patch reached the engine.
    expect(session.bowls[0].id).toBe(id);
    expect((LiveEngine.prototype.setBowls as unknown as { mock: { calls: unknown[][] } }).mock.calls.length).toBe(calls + 5);
  });

  it('note picker: a custom Hz shows the CUSTOM option; choosing a note sets baseHz', async () => {
    const c = await mountStudio();
    const note = byLabel<HTMLSelectElement>(c, 'Bowl 1 note');
    // Factory 136.1 Hz is not a 12-TET note → custom option, labelled with the nearest note.
    expect(note.value).toBe(CUSTOM_NOTE);
    expect(note.options[0].textContent).toBe(customNoteLabel(136.1));
    expect(note.options[0].textContent).toContain('C#3');
    expect(c.querySelector('[data-testid="bowl-note-label"]')?.textContent).toBe(noteLabel(136.1));

    const c4 = BOWL_NOTE_CHOICES.find((n) => n.label === 'C4')!;
    await setValue(note, String(c4.hz));
    expect(session.bowls[0].baseHz).toBe(c4.hz);
    expect(note.value).toBe(String(c4.hz));
    // The custom option disappears once the pitch is a listed note.
    expect(Array.from(note.options).some((o) => o.value === CUSTOM_NOTE)).toBe(false);
    expect(c.querySelector('[data-testid="bowl-note-label"]')?.textContent).toBe('C4');
  });

  it('typed Hz readout: commits 20 < v < 1000, rejects out-of-range', async () => {
    const c = await mountStudio();
    const row = rows(c)[0];
    const readout = row.querySelector<HTMLElement>('[role="button"][title="Click to type a value"]')!;
    expect(readout.textContent).toContain('136.10');
    await act(async () => readout.click());
    let input = row.querySelector<HTMLInputElement>('input[type="text"], input:not([type])')!;
    expect(input).toBeTruthy();
    await setValue(input, '5000');
    await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(session.bowls[0].baseHz).toBe(136.1); // rejected, still editing
    input = row.querySelector<HTMLInputElement>('input[type="text"], input:not([type])')!;
    expect(input).toBeTruthy();
    await setValue(input, '432');
    await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(session.bowls[0].baseHz).toBe(432);
    expect(rows(c)[0].textContent).toContain('432.00');
  });

  it('LOCK shows the carrier Hz + note, disables the note picker, and follows the carrier', async () => {
    const c = await mountStudio();
    const lock = chipByText(rows(c)[0], 'LOCK');
    expect(lock.getAttribute('aria-pressed')).toBe('false');
    expect(lock.title).toBe('Detune to carrier');
    await act(async () => lock.click());
    expect(session.bowls[0].lock).toBe(true);
    expect(lock.getAttribute('aria-pressed')).toBe('true');
    const carrier = session.carrierHz;
    expect(rows(c)[0].textContent).toContain(carrier.toFixed(2));
    expect(c.querySelector('[data-testid="bowl-note-label"]')?.textContent).toBe(noteLabel(carrier));
    expect(byLabel<HTMLSelectElement>(c, 'Bowl 1 note').disabled).toBe(true);
    // The readout is no longer editable while locked.
    expect(rows(c)[0].querySelector('[role="button"][title="Click to type a value"]')).toBeNull();

    const a3 = BOWL_NOTE_CHOICES.find((n) => n.label === 'A3')!;
    await act(async () => session.setCarrierHz(a3.hz));
    expect(rows(c)[0].textContent).toContain(a3.hz.toFixed(2));
    expect(c.querySelector('[data-testid="bowl-note-label"]')?.textContent).toBe('A3');
    // baseHz is kept underneath the lock.
    expect(session.bowls[0].baseHz).toBe(136.1);
  });

  it('LOAD SET replaces the set with the preset bowls and resets the menu', async () => {
    const c = await mountStudio();
    const menu = byLabel<HTMLSelectElement>(c, 'Load bowl set');
    expect(menu.options[0].textContent).toBe('LOAD SET…');
    expect(menu.options).toHaveLength(BOWL_SETS.length + 1);
    const before = session.bowls.map((b) => b.id);

    const trio = BOWL_SETS.find((x) => x.id === 'himalayan-trio')!;
    await setValue(menu, trio.id);
    expect(session.bowls).toHaveLength(trio.bowls.length);
    expect(rows(c)).toHaveLength(trio.bowls.length);
    expect(session.bowls.every((b) => b.on)).toBe(true);
    expect(session.bowls.some((b) => before.includes(b.id))).toBe(false); // replaced, not merged
    expect(session.bowls.map((b) => b.baseHz)).toEqual(trio.bowls.map((b) => b.baseHz));
    expect(session.bowls.map((b) => b.pan)).toEqual(trio.bowls.map((b) => b.pan));
    expect(menu.value).toBe(''); // back to the placeholder
    expect(c.querySelector('[data-testid="bowl-set-blurb"]')?.textContent).toContain(trio.blurb);

    const pair = BOWL_SETS.find((x) => x.id === 'crystal-pair')!;
    await setValue(menu, pair.id);
    expect(session.bowls).toHaveLength(pair.bowls.length);
    expect(rows(c)).toHaveLength(pair.bowls.length);
    expect(session.bowls.map((b) => b.strike)).toEqual(['rim', 'rim']);
    expect(c.querySelector('[data-testid="bowl-count"]')?.textContent).toBe(`${pair.bowls.length} / ${MAX_BOWLS}`);
  });

  it('+ ADD BOWL is disabled at MAX_BOWLS', async () => {
    const c = await mountStudio();
    const seven = BOWL_SETS.find((x) => x.bowls.length === MAX_BOWLS)!;
    await setValue(byLabel<HTMLSelectElement>(c, 'Load bowl set'), seven.id);
    expect(session.bowls).toHaveLength(MAX_BOWLS);
    expect(c.querySelector('[data-testid="bowl-count"]')?.textContent).toBe(`${MAX_BOWLS} / ${MAX_BOWLS}`);
    const add = chipByText(c, '+ ADD BOWL');
    expect(add.disabled).toBe(true);
    await act(async () => add.click());
    expect(session.bowls).toHaveLength(MAX_BOWLS);
    expect(session.addBowl()).toBeNull();
    // Removing one re-enables it.
    await act(async () => byLabel<HTMLButtonElement>(c, `Remove bowl ${MAX_BOWLS}`).click());
    expect(session.bowls).toHaveLength(MAX_BOWLS - 1);
    expect(chipByText(c, '+ ADD BOWL').disabled).toBe(false);
  });

  it('interval bell chips set bellEveryMin with aria-pressed', async () => {
    const c = await mountStudio();
    const group = byLabel(c, 'Interval bell period');
    const chips = Array.from(group.querySelectorAll<HTMLButtonElement>('button'));
    expect(chips.map((b) => b.textContent?.trim())).toEqual(['OFF', '1 MIN', '2 MIN', '3 MIN', '5 MIN', '10 MIN', '15 MIN', '20 MIN', '30 MIN']);
    expect(session.bellEveryMin).toBe(0);
    expect(chips[0].getAttribute('aria-pressed')).toBe('true');

    const five = chips.find((b) => b.textContent?.trim() === '5 MIN')!;
    await act(async () => five.click());
    expect(session.bellEveryMin).toBe(5);
    expect(five.getAttribute('aria-pressed')).toBe('true');
    expect(five.className).toContain('chip-active');
    expect(chips[0].getAttribute('aria-pressed')).toBe('false');
    expect(c.querySelector('[data-testid="interval-bell-caption"]')?.textContent).toContain('every 5 min');

    await act(async () => chips[0].click());
    expect(session.bellEveryMin).toBe(0);
    expect(chips[0].getAttribute('aria-pressed')).toBe('true');
    expect(five.getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps the bypass caption and the bowl rows when the layers are bypassed', async () => {
    const c = await mountStudio();
    await act(async () => c.querySelector<HTMLButtonElement>('[data-testid="layers-toggle"]')!.click());
    expect(session.layersOn).toBe(false);
    expect(c.querySelector('[data-testid="layers-body"]')?.getAttribute('data-dimmed')).toBe('true');
    expect(c.textContent).toContain('Bypassed: per-layer settings kept, but nature and bowls are silent live and excluded from export.');
    expect(rows(c)).toHaveLength(1);
  });

  it('renders every row control on the phone shell too', async () => {
    mobileState.mobile = true;
    const c = await mountStudio();
    await setValue(byLabel<HTMLSelectElement>(c, 'Load bowl set'), 'seven-note-set');
    expect(rows(c)).toHaveLength(MAX_BOWLS);
    for (let n = 1; n <= MAX_BOWLS; n++) expect(byLabel(c, `Bowl ${n} level`)).toBeTruthy();
    // Rows wrap rather than force a wide layout.
    for (const row of rows(c)) expect(['0', '0px']).toContain(row.style.minWidth);
  });
});

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('bowlSetLogic helpers', () => {
  it('listedNoteFor / noteSelectValue: exact notes match, custom pitches do not', () => {
    const c4 = BOWL_NOTE_CHOICES.find((n) => n.label === 'C4')!;
    expect(listedNoteFor(c4.hz)?.label).toBe('C4');
    expect(listedNoteFor(c4.hz * Math.pow(2, 1 / 1200))?.label).toBe('C4'); // +1¢ still C4
    expect(listedNoteFor(136.1)).toBeNull(); // C#3 −31¢
    expect(listedNoteFor(0)).toBeNull();
    expect(listedNoteFor(NaN)).toBeNull();
    expect(noteSelectValue(c4.hz)).toBe(String(c4.hz));
    expect(noteSelectValue(136.1)).toBe(CUSTOM_NOTE);
    expect(customNoteLabel(136.1)).toBe(`CUSTOM · ${noteLabel(136.1)}`);
  });

  it('parseBowlHz accepts 20 < v < 1000 only', () => {
    expect(parseBowlHz('432')).toBe(432);
    expect(parseBowlHz(' 136.1 ')).toBe(136.1);
    expect(parseBowlHz('20')).toBeNull();
    expect(parseBowlHz('1000')).toBeNull();
    expect(parseBowlHz('abc')).toBeNull();
    expect(parseBowlHz('')).toBeNull();
  });

  it('labels', () => {
    expect(bowlPitchHz({ lock: true, baseHz: 100 }, 200)).toBe(200);
    expect(bowlPitchHz({ lock: false, baseHz: 100 }, 200)).toBe(100);
    expect(restrikeLabel('rim')).toBe('CYCLE');
    expect(restrikeLabel('mallet')).toBe('INTERVAL');
    expect(restrikeLabel('soft')).toBe('INTERVAL');
    expect(bellChoiceLabel(0)).toBe('OFF');
    expect(bellChoiceLabel(15)).toBe('15 MIN');
    expect(panLabel(0)).toBe('C');
    expect(panLabel(-0.45)).toBe('L 45');
    expect(panLabel(1)).toBe('R 100');
    expect(panLabel(NaN)).toBe('C');
    expect(levelSliderDb(-Infinity)).toBe(-60);
    expect(levelSliderDb(-30)).toBe(-30);
    expect(levelSliderDb(5)).toBe(0);
    expect(bowlCaption('crystal-quartz', 'rim')).toContain('Frosted quartz model');
    expect(bowlCaption('crystal-quartz', 'rim')).toContain('Rubbed rim');
  });
});

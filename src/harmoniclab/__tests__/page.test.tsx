// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import HarmonicLab from '@/pages/HarmonicLab';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { downloadBytes } from '@/ui/audio/renderExport';
import { DEFAULT_RECIPE } from '../model';
import { decodeRecipe, encodeRecipe, readRecipes } from '../recipes';
import { parseRatios } from '../catalog';
import { STORAGE_KEYS } from '@/lib/storage';

vi.mock('@/ui/audio/renderExport', async (original) => ({ ...await original<typeof import('@/ui/audio/renderExport')>(), downloadBytes: vi.fn() }));
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('Harmonic Lab interaction and output', () => {
  let container: HTMLDivElement;
  let root: Root;
  let session: ReturnType<typeof useSession>;
  let ended: (() => void) | undefined;
  function Probe() { session = useSession(); return null; }
  const button = (label: string) => [...container.querySelectorAll('button')].find((b) => b.textContent?.trim() === label)!;
  const click = async (label: string) => { await act(async () => button(label).click()); };

  beforeEach(async () => {
    localStorage.removeItem(STORAGE_KEYS.harmonicRecipes);
    vi.spyOn(LiveEngine.prototype, 'playBuffer').mockImplementation((_l, _r, _sr, _db, onEnded) => { ended = onEnded; return true; });
    vi.spyOn(LiveEngine.prototype, 'stopPreviews');
    container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
    await act(async () => root.render(<MemoryRouter><SessionProvider><Probe /><HarmonicLab /></SessionProvider></MemoryRouter>));
  });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.mocked(downloadBytes).mockClear(); });

  it('plays a bounded quiet buffer and clears the shared state on natural completion', async () => {
    await click('Play composition');
    expect(session!.previewId).toBe('harmonic:composition');
    const [left, right, sr, db] = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls[0];
    expect(left.length).toBe(8 * 48000); expect(right).toEqual(left); expect(sr).toBe(48000); expect(db).toBe(0);
    let peak = 0; for (const sample of left) peak = Math.max(peak, Math.abs(sample));
    expect(peak).toBeLessThanOrEqual(10 ** (-24 / 20) + 1e-7);
    await act(async () => ended?.());
    expect(session!.previewId).toBeNull(); expect(button('Play composition')).toBeTruthy();
  });

  it('stops its sound on input replacement, manual stop, panic, and unmount', async () => {
    await click('Play composition'); await click('440'); expect(session!.previewId).toBeNull();
    await click('Play composition'); await click('Stop'); expect(session!.previewId).toBeNull();
    await click('Play composition'); await act(async () => session!.panic()); expect(session!.previewId).toBeNull();
    expect(button('Play composition').disabled).toBe(true);
  });

  it('unmount stops its preview', async () => {
    await click('Play composition'); vi.mocked(LiveEngine.prototype.stopPreviews).mockClear();
    await act(async () => root.render(<MemoryRouter><SessionProvider><Probe /></SessionProvider></MemoryRouter>));
    expect(LiveEngine.prototype.stopPreviews).toHaveBeenCalled(); expect(session!.previewId).toBeNull();
  });

  it('does not orphan a running state when Web Audio refuses playback', async () => {
    vi.mocked(LiveEngine.prototype.playBuffer).mockReturnValue(false);
    await click('Play composition'); expect(session!.previewId).toBeNull();
    expect(container.querySelector('[role=alert]')?.textContent).toContain('Audio could not start');
  });

  it('disables playback and WAV export in infant mode', async () => {
    await act(async () => session!.setGovernor({ infantMode: true }));
    expect(button('Play composition').disabled).toBe(true); expect(button('Export WAV').disabled).toBe(true);
  });

  it('stops an active preview when the governor ceiling tightens', async () => {
    await click('Play composition');
    await act(async () => session!.setGovernor({ maxGainDbFs: -40 }));
    expect(session!.previewId).toBeNull();
    await click('Play composition');
    const samples = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls.at(-1)![0];
    let peak = 0; for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
    expect(peak).toBeLessThanOrEqual(.01 + 1e-7);
  });

  it('exports the same samples and gain as playback in a valid WAV', async () => {
    await click('Play composition'); const played = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls[0][0];
    await click('Export WAV');
    const [wav] = vi.mocked(downloadBytes).mock.calls[0]; const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
    expect(new TextDecoder().decode(wav.subarray(0, 4))).toBe('RIFF');
    expect(view.getUint16(22, true)).toBe(2); expect(view.getUint32(24, true)).toBe(48000); expect(view.getUint16(34, true)).toBe(16);
    let offset = 12; while (new TextDecoder().decode(wav.subarray(offset, offset + 4)) !== 'data') offset += 8 + view.getUint32(offset + 4, true);
    expect(view.getUint32(offset + 4, true)).toBe(played.length * 4);
    for (const i of [1000, 30000, 120000]) expect(view.getInt16(offset + 8 + i * 4, true) / 32768).toBeCloseTo(played[i], 4);
  });

  it('saves and restores exact recipes and rejects hostile or malformed inputs', async () => {
    await click('Save on device'); expect(readRecipes()).toEqual([DEFAULT_RECIPE]);
    expect(decodeRecipe(new TextDecoder().decode(encodeRecipe(DEFAULT_RECIPE)))).toEqual(DEFAULT_RECIPE);
    expect(parseRatios('1, 5/4, 3/2')).toEqual([1, 1.25, 1.5]);
    for (const text of ['1/0', '1;alert(1)', 'NaN', '', '9']) expect(() => parseRatios(text)).toThrow();
    expect(() => decodeRecipe('{"format":"opensync-harmonic-recipe","version":1,"recipe":{"rootHz":1e308}}')).toThrow();
  });

  it('keeps the numeric input focused while entering a decimal root', async () => {
    const input = container.querySelector<HTMLInputElement>('input[type=number]')!;
    input.focus();
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    for (const value of ['', '5', '55', '550', '550.2', '550.25']) {
      await act(async () => { setValue.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); });
      expect(document.activeElement).toBe(input);
    }
    expect(input.value).toBe('550.25');
    await click('Save on device'); expect(readRecipes()[0].rootHz).toBe(550.25);
  });
});

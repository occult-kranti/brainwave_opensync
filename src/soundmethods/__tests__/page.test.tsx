// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import SoundMethods from '@/pages/SoundMethods';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { downloadBytes } from '@/ui/audio/renderExport';
import { exportMethodWav } from '../export';
import { SOUND_METHODS, METHOD_SOURCES, recipeFile } from '../catalog';
import { validateSoundRecipe } from '../model';
import { findBannedPhrases } from '@/docs/vocabulary';

vi.mock('@/ui/audio/renderExport', async (original) => ({ ...await original<typeof import('@/ui/audio/renderExport')>(), downloadBytes: vi.fn() }));
vi.mock('../export', () => ({ exportMethodWav: vi.fn() }));
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('published method catalog', () => {
  it('preserves disclosed channel examples and marks all custom choices', () => {
    expect(SOUND_METHODS.find((m) => m.id === 'monroe-pair')!.recipe.pairs).toEqual([{ leftHz: 100, rightHz: 104, weight: 1 }]);
    expect(SOUND_METHODS.find((m) => m.id === 'septon')!.recipe.pairs).toEqual([{ leftHz: 200, rightHz: 204, weight: 1 }, { leftHz: 204, rightHz: 208, weight: 1 }, { leftHz: 208, rightHz: 212, weight: 1 }]);
    expect(SOUND_METHODS.find((m) => m.id === 'gateway-example')!.basis).toContain('our choice');
    expect(SOUND_METHODS.find((m) => m.id === 'phase-motion')!.recipe.kind).toBe('phase-mod');
    for (const method of SOUND_METHODS) {
      expect(validateSoundRecipe(method.recipe)).toEqual(method.recipe);
      expect(method.boundary).toBeTruthy();
      for (const id of method.sourceIds) expect(METHOD_SOURCES.some((source) => source.id === id)).toBe(true);
    }
    expect(new Set(METHOD_SOURCES.map((s) => s.id)).size).toBe(METHOD_SOURCES.length);
    expect(findBannedPhrases(JSON.stringify(SOUND_METHODS))).toEqual([]);
    expect(findBannedPhrases(JSON.stringify(METHOD_SOURCES))).toEqual([]);
  });
  it('exports complete settings with a fixed format and sample rate', () => {
    const method = SOUND_METHODS[0];
    const data = JSON.parse(new TextDecoder().decode(recipeFile(method.recipe, method.id)));
    expect(data).toEqual({ format: 'opensync-sound-method', version: 1, sampleRate: 48000, methodId: method.id, recipe: method.recipe });
  });
});

describe('Sound Methods playback and export', () => {
  let container: HTMLDivElement;
  let root: Root;
  let session: ReturnType<typeof useSession>;
  let ended: (() => void) | undefined;
  function Probe() { session = useSession(); return null; }
  const button = (text: string) => [...container.querySelectorAll('button')].find((b) => b.textContent?.trim() === text)!;
  const click = async (text: string) => { await act(async () => button(text).click()); };
  const selectMethod = async (title: string) => { await act(async () => [...container.querySelectorAll<HTMLButtonElement>('.method-choice')].find((b) => b.querySelector('strong')?.textContent === title)!.click()); };
  const changeSelect = async (label: string, value: string) => {
    const element = container.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!;
    await act(async () => { element.value = value; element.dispatchEvent(new Event('change', { bubbles: true })); });
  };
  beforeEach(async () => {
    vi.spyOn(LiveEngine.prototype, 'playBuffer').mockImplementation((_l, _r, _sr, _db, onEnded) => { ended = onEnded; return true; });
    vi.mocked(exportMethodWav).mockResolvedValue(new Uint8Array([1, 2, 3]));
    container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
    await act(async () => root.render(<MemoryRouter><SessionProvider><Probe /><SoundMethods /></SessionProvider></MemoryRouter>));
  });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.mocked(exportMethodWav).mockReset(); vi.mocked(downloadBytes).mockClear(); });

  it('plays the selected stereo pattern with bounded duration and gain; natural completion clears tracking', async () => {
    await click('Play preview');
    const [left, right, sr, db] = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls[0];
    expect(left.length).toBe(20 * 48000); expect(right.length).toBe(left.length); expect(sr).toBe(48000); expect(db).toBe(0);
    expect(Math.abs(left[0])).toBe(0); expect(Math.abs(left.at(-1)!)).toBe(0);
    let peak = 0; for (const sample of left) peak = Math.max(peak, Math.abs(sample));
    expect(peak).toBeLessThanOrEqual(10 ** (-24 / 20) + 1e-7);
    expect(session!.previewId).toBe('sound-method:preview');
    await act(async () => ended?.()); expect(session!.previewId).toBeNull();
  });
  it('stops when the sound or duration changes, when muted, or on panic', async () => {
    await click('Play preview'); await selectMethod('A tone with a 4 Hz envelope'); expect(session!.previewId).toBeNull();
    await click('Play preview'); await changeSelect('Preview length', '30'); expect(session!.previewId).toBeNull();
    await click('Play preview'); await act(async () => session!.setMuted(true)); expect(session!.previewId).toBeNull(); expect(button('Play preview').disabled).toBe(true);
    await act(async () => session!.setMuted(false)); await click('Play preview'); await act(async () => session!.panic()); expect(session!.previewId).toBeNull();
  });
  it('handles a failed playback start and infant restrictions', async () => {
    await act(async () => session!.resetFrontPanel());
    vi.mocked(LiveEngine.prototype.playBuffer).mockReturnValue(false);
    await click('Play preview'); expect(session!.previewId).toBeNull(); expect(container.querySelector('[role=alert]')?.textContent).toContain('Audio could not start');
    await act(async () => session!.setGovernor({ infantMode: true })); expect(button('Play preview').disabled).toBe(true); expect(button('Export WAV').disabled).toBe(true);
  });
  it('uses the tightened governor ceiling for later playback and export', async () => {
    await click('Play preview'); await act(async () => session!.setGovernor({ maxGainDbFs: -40 })); expect(session!.previewId).toBeNull();
    await click('Play preview'); const samples = vi.mocked(LiveEngine.prototype.playBuffer).mock.calls.at(-1)![0];
    let peak = 0; for (const sample of samples) peak = Math.max(peak, Math.abs(sample)); expect(peak).toBeLessThanOrEqual(.01 + 1e-7);
    await click('Export WAV'); expect(vi.mocked(exportMethodWav).mock.calls[0][0].gainDb).toBe(-40); expect(downloadBytes).toHaveBeenCalledOnce();
  });
  it('caps previews while exporting the separately selected long duration', async () => {
    await changeSelect('WAV length', '300'); await click('Play preview');
    expect(vi.mocked(LiveEngine.prototype.playBuffer).mock.calls[0][0].length).toBe(20 * 48000);
    await click('Export WAV'); expect(vi.mocked(exportMethodWav).mock.calls[0][0].durationSec).toBe(300);
  });
  it('aborts export on cancellation or a tighter governor without a late download', async () => {
    let exportSignal: AbortSignal;
    vi.mocked(exportMethodWav).mockImplementation((_recipe, signal) => new Promise((_resolve, reject) => { exportSignal = signal; signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError'))); }));
    await click('Export WAV'); expect(button('Export WAV').disabled).toBe(true);
    await click('Cancel export'); expect(exportSignal!.aborted).toBe(true); expect(button('Export WAV').disabled).toBe(false); expect(downloadBytes).not.toHaveBeenCalled();
    await click('Export WAV'); await act(async () => session!.setGovernor({ maxGainDbFs: -45 }));
    expect(exportSignal!.aborted).toBe(true); expect(button('Export WAV').disabled).toBe(false); expect(downloadBytes).not.toHaveBeenCalled();
  });
  it('keeps an edited frequency focused until commit and updates the shown difference', async () => {
    const input = container.querySelector<HTMLInputElement>('input[type=number]')!;
    input.focus(); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    await act(async () => { setter.call(input, '100.25'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(document.activeElement).toBe(input);
    await act(async () => input.blur()); expect(container.textContent).toContain('Difference: 3.75 Hz');
    expect(container.querySelector('.method-player-heading h2')?.textContent).toBe('Custom sound');
  });
  it('filters the source collection and displays an empty result message', async () => {
    await changeSelect('Source type', 'Tool'); expect(container.querySelectorAll('.method-source-grid article')).toHaveLength(5);
    const input = container.querySelector<HTMLInputElement>('input[aria-label="Search sources"]')!;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    await act(async () => { setter.call(input, 'no-such-source'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(container.textContent).toContain('No matching sources');
  });
  it('imports a valid nonstandard length and ignores a stale file read', async () => {
    const fileInput = container.querySelector<HTMLInputElement>('input[type=file]')!;
    const recipe = { ...SOUND_METHODS[0].recipe, durationSec: 2.5 };
    const payload = new TextDecoder().decode(recipeFile(recipe, SOUND_METHODS[0].id));
    const file = new File([payload], 'settings.json', { type: 'application/json' });
    await act(async () => { Object.defineProperty(fileInput, 'files', { configurable: true, value: [file] }); fileInput.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(container.querySelector<HTMLSelectElement>('select[aria-label="WAV length"]')!.value).toBe('2.5');
    let finishRead: (text: string) => void;
    const slow = new File([payload], 'slow.json');
    vi.spyOn(slow, 'text').mockImplementation(() => new Promise((resolve) => { finishRead = resolve; }));
    await act(async () => { Object.defineProperty(fileInput, 'files', { configurable: true, value: [slow] }); fileInput.dispatchEvent(new Event('change', { bubbles: true })); });
    await selectMethod('A tone with a 4 Hz envelope');
    await act(async () => finishRead!(payload));
    expect(container.querySelector('.method-player-heading h2')?.textContent).toBe('A tone with a 4 Hz envelope');
  });
  it('rejects invalid or mismatched imported settings without replacing the current sound', async () => {
    const fileInput = container.querySelector<HTMLInputElement>('input[type=file]')!;
    const invalid = new File([JSON.stringify({ format: 'opensync-sound-method', version: 1, sampleRate: 48000, methodId: 'monroe-pair', recipe: { ...SOUND_METHODS[0].recipe, kind: 'noise-am' } })], 'bad.json');
    await act(async () => { Object.defineProperty(fileInput, 'files', { configurable: true, value: [invalid] }); fileInput.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(container.querySelector('[role=alert]')?.textContent).toContain('does not match');
    expect(container.querySelector('.method-player-heading h2')?.textContent).toBe('Monroe’s 4 Hz pair');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportMethodWav } from '../export';
import { DEFAULT_SOUND_RECIPE, renderSoundRecipe } from '../model';

afterEach(() => vi.unstubAllGlobals());
describe('sound-method WAV rendering', () => {
  it('fallback exports the same samples at 48 kHz, with the selected gain', async () => {
    vi.stubGlobal('Worker', undefined);
    const recipe = { ...DEFAULT_SOUND_RECIPE, durationSec: 2, gainDb: -40 };
    const sound = renderSoundRecipe(recipe);
    const wav = await exportMethodWav(recipe, new AbortController().signal);
    const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
    expect(new TextDecoder().decode(wav.subarray(0, 4))).toBe('RIFF'); expect(view.getUint32(24, true)).toBe(48000); expect(view.getUint16(22, true)).toBe(2);
    let offset = 12; while (new TextDecoder().decode(wav.subarray(offset, offset + 4)) !== 'data') offset += 8 + view.getUint32(offset + 4, true);
    expect(view.getUint32(offset + 4, true)).toBe(sound.left.length * 4);
    for (const i of [0, 1000, 10000, 40000, sound.left.length - 1]) { expect(view.getInt16(offset + 8 + 4 * i, true) / 32768).toBeCloseTo(sound.left[i], 4); expect(view.getInt16(offset + 10 + 4 * i, true) / 32768).toBeCloseTo(sound.right[i], 4); }
  });
  it('does not start an aborted export or allocate a long main-thread fallback', async () => {
    vi.stubGlobal('Worker', undefined); const controller = new AbortController(); controller.abort();
    await expect(exportMethodWav(DEFAULT_SOUND_RECIPE, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    await expect(exportMethodWav({ ...DEFAULT_SOUND_RECIPE, durationSec: 300 }, new AbortController().signal)).rejects.toThrow('cannot render long');
  });
  it('terminates a worker when cancelled and removes its listener', async () => {
    class FakeWorker {
      static instances: FakeWorker[] = [];
      onmessage: ((event: unknown) => void) | null = null;
      onerror: (() => void) | null = null;
      terminate = vi.fn(); postMessage = vi.fn();
      constructor() { FakeWorker.instances.push(this); }
    }
    vi.stubGlobal('Worker', FakeWorker);
    const controller = new AbortController(); const remove = vi.spyOn(controller.signal, 'removeEventListener');
    const promise = exportMethodWav({ ...DEFAULT_SOUND_RECIPE, durationSec: 300 }, controller.signal);
    const worker = FakeWorker.instances[0];
    expect(worker!.postMessage).toHaveBeenCalledOnce(); controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' }); expect(worker!.terminate).toHaveBeenCalledOnce(); expect(remove).toHaveBeenCalled();
  });
});

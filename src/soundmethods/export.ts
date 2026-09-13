import { encodeWav } from '@/engine';
import { renderSoundRecipe, validateSoundRecipe, type SoundRecipe } from './model';

/** Long exports require a worker. A cancelled export never downloads later. */
export function exportMethodWav(input: SoundRecipe, signal: AbortSignal): Promise<Uint8Array> {
  const recipe = validateSoundRecipe(input);
  if (signal.aborted) return Promise.reject(new DOMException('Export cancelled.', 'AbortError'));
  if (typeof Worker === 'undefined') {
    if (recipe.durationSec > 30) return Promise.reject(new Error('This browser cannot render long files in the background. Choose a length of 30 seconds or less.'));
    return new Promise((resolve, reject) => setTimeout(() => {
      if (signal.aborted) { reject(new DOMException('Export cancelled.', 'AbortError')); return; }
      try {
        const audio = renderSoundRecipe(recipe);
        resolve(encodeWav(audio.left, audio.right, audio.sampleRate, 'pcm16'));
      } catch (error) { reject(error); }
    }, 0));
  }
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try { worker = new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' }); }
    catch { reject(new Error('Background export could not start. Try another browser.')); return; }
    const clean = () => { worker.terminate(); signal.removeEventListener('abort', abort); };
    const abort = () => { clean(); reject(new DOMException('Export cancelled.', 'AbortError')); };
    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = (event: MessageEvent<{ ok: boolean; wav?: ArrayBuffer; error?: string }>) => {
      clean();
      if (event.data.ok && event.data.wav) resolve(new Uint8Array(event.data.wav));
      else reject(new Error(event.data.error ?? 'WAV rendering failed.'));
    };
    worker.onerror = () => { clean(); reject(new Error('Background audio rendering failed.')); };
    try { worker.postMessage(recipe); } catch (error) { clean(); reject(error); }
  });
}

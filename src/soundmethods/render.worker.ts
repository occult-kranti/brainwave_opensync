import { encodeWav } from '@/engine';
import { renderSoundRecipe, type SoundRecipe } from './model';

self.onmessage = (event: MessageEvent<SoundRecipe>) => {
  try {
    const audio = renderSoundRecipe(event.data);
    const wav = encodeWav(audio.left, audio.right, audio.sampleRate, 'pcm16');
    const buffer = wav.buffer as ArrayBuffer;
    (self as unknown as Worker).postMessage({ ok: true, wav: buffer }, [buffer]);
  } catch (error) {
    (self as unknown as Worker).postMessage({ ok: false, error: error instanceof Error ? error.message : 'WAV rendering failed.' });
  }
};

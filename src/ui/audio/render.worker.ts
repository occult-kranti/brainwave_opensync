/**
 * WAV export worker. Renders a SessionSpec through the pure engine and
 * encodes it off the main thread so a 90-minute export never freezes the
 * UI. Imports only from the engine package (no React, no DOM).
 */

import { encodeWav, renderSession, type SessionSpec, type WavFormat } from '@/engine';

export interface RenderWorkerRequest {
  id: number;
  spec: SessionSpec;
  format: WavFormat;
}

export type RenderWorkerResponse =
  | { id: number; ok: true; wav: ArrayBuffer; sampleRate: number; hash: string; totalDurationSec: number; warnings: string[] }
  | { id: number; ok: false; error: string };

self.onmessage = (e: MessageEvent<RenderWorkerRequest>) => {
  const { id, spec, format } = e.data;
  try {
    const r = renderSession(spec);
    const wav = encodeWav(r.left, r.right, r.manifest.sampleRate, format);
    const buf = wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength) as ArrayBuffer;
    const msg: RenderWorkerResponse = {
      id,
      ok: true,
      wav: buf,
      sampleRate: r.manifest.sampleRate,
      hash: r.manifest.hash,
      totalDurationSec: r.manifest.totalDurationSec,
      warnings: r.manifest.warnings,
    };
    (self as unknown as Worker).postMessage(msg, [buf]);
  } catch (err) {
    const msg: RenderWorkerResponse = { id, ok: false, error: err instanceof Error ? err.message : String(err) };
    (self as unknown as Worker).postMessage(msg);
  }
};

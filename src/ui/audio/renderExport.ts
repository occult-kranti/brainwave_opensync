/**
 * WAV export orchestration (main thread).
 *
 * v1 rendered synchronously inside a click handler and ignored the session
 * limit. v2: the spec is truncated to the session limit, the format is a
 * choice (PCM-16 / PCM-24 / float-32), and rendering runs in a Web Worker
 * when the platform has one — falling back to a synchronous render in
 * environments without `Worker` (tests, very old browsers).
 */

import { encodeWav, renderSession, type Phase as EnginePhase, type SessionSpec, type WavFormat } from '@/engine';
import { truncatePhases } from '../session/sessionMath';
import type { RenderWorkerRequest, RenderWorkerResponse } from './render.worker';

export type ExportFormat = WavFormat;

export const EXPORT_FORMATS: readonly { id: ExportFormat; label: string; note: string }[] = [
  { id: 'pcm16', label: 'PCM 16-bit', note: 'Universal; ~11.5 MB / min stereo' },
  { id: 'pcm24', label: 'PCM 24-bit', note: 'Archive quality; ~17 MB / min' },
  { id: 'float32', label: 'Float 32-bit', note: 'DAW / analysis; ~23 MB / min' },
];

export interface ExportOptions {
  format?: ExportFormat;
  /** Hard cap in seconds (the session limit); phases beyond it are dropped. */
  maxSec?: number;
  masterGainDb?: number;
}

export interface ExportResult {
  wav: Uint8Array;
  sampleRate: number;
  hash: string;
  totalDurationSec: number;
  warnings: string[];
}

/** Build the engine spec for an export, clamped to `maxSec`. */
export function buildExportSpec(name: string, phases: readonly EnginePhase[], opts: ExportOptions = {}): SessionSpec {
  const capped = Number.isFinite(opts.maxSec) && (opts.maxSec as number) > 0 ? truncatePhases(phases, opts.maxSec as number) : [...phases];
  return { name, phases: capped, masterGainDb: opts.masterGainDb ?? -6 };
}

export function exportFileName(name: string | null, format: ExportFormat): string {
  const base = (name ?? 'open-sync').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'open-sync';
  const tag = format === 'pcm16' ? '' : `-${format}`;
  return `${base}${tag}.wav`;
}

/** Synchronous render (fallback / tests). */
export function renderExportSync(spec: SessionSpec, format: ExportFormat): ExportResult {
  const r = renderSession(spec);
  const wav = encodeWav(r.left, r.right, r.manifest.sampleRate, format);
  return {
    wav,
    sampleRate: r.manifest.sampleRate,
    hash: r.manifest.hash,
    totalDurationSec: r.manifest.totalDurationSec,
    warnings: r.manifest.warnings,
  };
}

let seq = 0;

/** True when a module Worker can be constructed on this platform. */
export function canUseWorker(): boolean {
  return typeof Worker !== 'undefined' && typeof URL !== 'undefined' && typeof import.meta.url === 'string';
}

/**
 * Render off the main thread. Resolves with the encoded WAV; rejects on a
 * worker failure or abort. Falls back to a synchronous render when Workers
 * are unavailable so callers have one code path.
 */
export function renderExportAsync(
  spec: SessionSpec,
  format: ExportFormat,
  opts: { signal?: AbortSignal } = {},
): Promise<ExportResult> {
  if (!canUseWorker()) {
    return new Promise((resolve, reject) => {
      // Yield once so the UI can paint the EXPORTING state before the render.
      setTimeout(() => {
        try {
          resolve(renderExportSync(spec, format));
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      }, 0);
    });
  }
  return new Promise((resolve, reject) => {
    const id = ++seq;
    let worker: Worker;
    try {
      worker = new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' });
    } catch (e) {
      // Worker construction can fail under strict CSP; degrade gracefully.
      try {
        resolve(renderExportSync(spec, format));
      } catch (inner) {
        reject(inner instanceof Error ? inner : new Error(String(e)));
      }
      return;
    }
    const done = () => {
      worker.terminate();
      opts.signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      done();
      reject(new DOMException('Export cancelled', 'AbortError'));
    };
    opts.signal?.addEventListener('abort', onAbort, { once: true });
    worker.onmessage = (e: MessageEvent<RenderWorkerResponse>) => {
      const msg = e.data;
      if (msg.id !== id) return;
      done();
      if (msg.ok) {
        resolve({
          wav: new Uint8Array(msg.wav),
          sampleRate: msg.sampleRate,
          hash: msg.hash,
          totalDurationSec: msg.totalDurationSec,
          warnings: msg.warnings,
        });
      } else {
        reject(new Error(msg.error));
      }
    };
    worker.onerror = (ev) => {
      done();
      reject(new Error(ev.message || 'Export worker failed'));
    };
    const req: RenderWorkerRequest = { id, spec, format };
    worker.postMessage(req);
  });
}

/** Trigger a browser download for encoded bytes. */
export function downloadBytes(bytes: Uint8Array, filename: string, mime = 'audio/wav'): void {
  const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the click has dereferenced the URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

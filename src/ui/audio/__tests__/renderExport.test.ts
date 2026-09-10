import { describe, expect, it } from 'vitest';
import type { Phase } from '@/engine';
import { buildExportSpec, canUseWorker, exportFileName, renderExportAsync, renderExportSync } from '../renderExport';

const phases: Phase[] = [
  { durationSec: 4, carrierHz: 200, beatHz: 10, mode: 'binaural', gainDb: 0 },
  { durationSec: 4, carrierHz: 200, beatHz: 6, mode: 'binaural', gainDb: 0 },
];

describe('renderExport', () => {
  it('clamps the spec to the session limit (v1 ignored it)', () => {
    const spec = buildExportSpec('t', phases, { maxSec: 5 });
    expect(spec.phases.map((p) => p.durationSec)).toEqual([4, 1]);
    const uncapped = buildExportSpec('t', phases);
    expect(uncapped.phases.map((p) => p.durationSec)).toEqual([4, 4]);
    expect(uncapped.masterGainDb).toBe(-6);
  });

  it('names files safely and tags non-default formats', () => {
    expect(exportFileName('Deep Focus / SMR', 'pcm16')).toBe('deep-focus-smr.wav');
    expect(exportFileName(null, 'pcm24')).toBe('open-sync-pcm24.wav');
    expect(exportFileName('   ', 'float32')).toBe('open-sync-float32.wav');
  });

  it('renders all three formats with the right byte sizes', () => {
    const spec = buildExportSpec('t', phases, { maxSec: 1 });
    const r16 = renderExportSync(spec, 'pcm16');
    const r24 = renderExportSync(spec, 'pcm24');
    const r32 = renderExportSync(spec, 'float32');
    const frames = Math.round(r16.totalDurationSec * r16.sampleRate);
    expect(r16.wav.length).toBe(44 + frames * 2 * 2);
    expect(r24.wav.length).toBe(44 + frames * 2 * 3);
    expect(r32.wav.length).toBe(44 + frames * 2 * 4);
    expect(r16.hash).toBe(r24.hash); // same render, different encoding
  });

  it('falls back to a synchronous render when Workers are unavailable', async () => {
    expect(canUseWorker()).toBe(false);
    const spec = buildExportSpec('t', phases, { maxSec: 0.5 });
    const r = await renderExportAsync(spec, 'pcm16');
    expect(r.wav.subarray(0, 4)).toEqual(new Uint8Array([0x52, 0x49, 0x46, 0x46])); // RIFF
    expect(r.totalDurationSec).toBeCloseTo(0.5, 3);
  });
});

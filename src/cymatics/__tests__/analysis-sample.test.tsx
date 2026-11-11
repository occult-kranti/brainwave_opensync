// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnalysisSample } from '../instrument/useAnalysisSample';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
class Track extends EventTarget {
  kind: string;
  readyState = 'live';
  stop = vi.fn(() => { this.readyState = 'ended'; });
  constructor(kind: string) { super(); this.kind = kind; }
  end() { this.readyState = 'ended'; this.dispatchEvent(new Event('ended')); }
}
class Stream {
  tracks: Track[];
  constructor(tracks: Track[] = []) { this.tracks = tracks; }
  getAudioTracks() { return this.tracks.filter((track) => track.kind === 'audio'); }
  getTracks() { return this.tracks; }
}
const recorders: Recorder[] = [];
class Recorder {
  static isTypeSupported = (type: string) => type.includes('webm');
  state: RecordingState = 'inactive';
  mimeType: string;
  stream: Stream;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(stream: Stream, options: MediaRecorderOptions) { this.stream = stream; this.mimeType = options.mimeType || 'audio/webm'; recorders.push(this); }
  start = vi.fn(() => { this.state = 'recording'; });
  stop = vi.fn(() => {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['audio'], { type: this.mimeType }) });
    this.onstop?.();
  });
}
let hook: ReturnType<typeof useAnalysisSample>;
let root: Root;
let container: HTMLElement;
let onFile: ReturnType<typeof vi.fn<(file: File) => void>>;
function Probe({ sourceKey = 'tab-1' }: { sourceKey?: string }) {
  hook = useAnalysisSample(sourceKey, onFile);
  return null;
}
async function mount(sourceKey = 'tab-1') { await act(async () => root.render(<Probe sourceKey={sourceKey} />)); }
function source() { return new Stream([new Track('audio'), new Track('video')]); }
const asMedia = (stream: Stream) => stream as unknown as MediaStream;

beforeEach(() => {
  vi.useFakeTimers();
  recorders.length = 0;
  vi.stubGlobal('MediaStream', Stream);
  vi.stubGlobal('MediaRecorder', Recorder);
  onFile = vi.fn<(file: File) => void>();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('bounded audio samples for the recording report', () => {
  it('records audio only for ten seconds, emits one local file, and leaves source tracks alive', async () => {
    await mount();
    const shared = source();
    act(() => hook.start(asMedia(shared), 'Spotify / music'));
    expect(hook.recording).toBe(true);
    expect(hook.secondsLeft).toBe(10);
    expect(recorders[0].stream.getTracks()).toEqual(shared.getAudioTracks());
    await act(async () => vi.advanceTimersByTime(10000));
    expect(hook.recording).toBe(false);
    expect(hook.secondsLeft).toBe(0);
    expect(onFile).toHaveBeenCalledTimes(1);
    const file = onFile.mock.calls[0][0] as File;
    expect(file.name).toBe('Spotify-music-sample.webm');
    expect(file.size).toBeGreaterThan(0);
    expect(file.type).toBe('audio/webm;codecs=opus');
    expect(hook.status).toMatch(/10\.0 seconds/);
    expect(shared.getTracks().every((track) => !track.stop.mock.calls.length)).toBe(true);
    await act(async () => vi.advanceTimersByTime(30000));
    expect(onFile).toHaveBeenCalledTimes(1);
  });

  it('cancel invalidates pending stop callbacks without stopping the shared source', async () => {
    await mount();
    const shared = source();
    act(() => hook.start(asMedia(shared), 'Music'));
    const staleStop = recorders[0].onstop!;
    act(() => hook.cancel());
    act(() => staleStop());
    await act(async () => vi.advanceTimersByTime(10000));
    expect(onFile).not.toHaveBeenCalled();
    expect(hook.recording).toBe(false);
    expect(shared.getTracks().every((track) => track.readyState === 'live')).toBe(true);
  });

  it('source replacement discards the old sample and its timers', async () => {
    await mount();
    act(() => hook.start(asMedia(source()), 'Music'));
    await mount('tab-2');
    expect(recorders[0].stop).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTime(10000));
    expect(hook.recording).toBe(false);
    expect(onFile).not.toHaveBeenCalled();
  });

  it('unmount discards unfinished recording without releasing caller-owned tracks', async () => {
    await mount();
    const shared = source();
    act(() => hook.start(asMedia(shared), 'Music'));
    await act(async () => root.unmount());
    await act(async () => vi.advanceTimersByTime(10000));
    expect(onFile).not.toHaveBeenCalled();
    expect(recorders[0].stop).toHaveBeenCalledTimes(1);
    expect(shared.getTracks().every((track) => track.readyState === 'live')).toBe(true);
  });

  it('external source end discards the unfinished sample', async () => {
    await mount();
    const shared = source();
    act(() => hook.start(asMedia(shared), 'Music'));
    act(() => shared.getAudioTracks()[0].end());
    expect(hook.recording).toBe(false);
    expect(hook.status).toMatch(/source ended/);
    await act(async () => vi.advanceTimersByTime(10000));
    expect(onFile).not.toHaveBeenCalled();
    expect(shared.getTracks()[1].readyState).toBe('live');
  });

  it('recorder errors are recoverable and never publish chunks', async () => {
    await mount();
    act(() => hook.start(asMedia(source()), 'Music'));
    act(() => recorders[0].onerror!());
    expect(hook.recording).toBe(false);
    expect(hook.status).toMatch(/failed/);
    expect(onFile).not.toHaveBeenCalled();
    act(() => hook.start(asMedia(source()), 'New music'));
    expect(hook.recording).toBe(true);
  });

  it('discards oversized data before retaining a chunk beyond the five MiB cap', async () => {
    await mount();
    act(() => hook.start(asMedia(source()), 'Music'));
    act(() => recorders[0].ondataavailable!({ data: new Blob([new Uint8Array(5 * 1024 * 1024 + 1)]) }));
    expect(hook.recording).toBe(false);
    expect(hook.status).toMatch(/5 MiB/);
    expect(onFile).not.toHaveBeenCalled();
  });

  it('replacing an in-progress recorder publishes only the newer complete sample', async () => {
    await mount();
    act(() => hook.start(asMedia(source()), 'Old music'));
    const stale = recorders[0].onstop!;
    act(() => hook.start(asMedia(source()), 'New music'));
    act(() => stale());
    await act(async () => vi.advanceTimersByTime(10000));
    expect(onFile).toHaveBeenCalledTimes(1);
    expect((onFile.mock.calls[0][0] as File).name).toBe('New-music-sample.webm');
  });

  it('reports missing sources and missing recorder support without creating a recorder', async () => {
    await mount();
    act(() => hook.start(null, 'Missing'));
    expect(hook.status).toMatch(/Connect/);
    vi.stubGlobal('MediaRecorder', undefined);
    act(() => hook.start(asMedia(source()), 'Music'));
    expect(hook.status).toMatch(/unavailable/);
    expect(recorders).toHaveLength(0);
  });

  it('uses the browser default audio codec when isTypeSupported is unavailable', async () => {
    await mount();
    class DefaultRecorder extends Recorder { static isTypeSupported = undefined as unknown as typeof Recorder.isTypeSupported; }
    vi.stubGlobal('MediaRecorder', DefaultRecorder);
    act(() => hook.start(asMedia(source()), 'Default'));
    await act(async () => vi.advanceTimersByTime(10000));
    expect(onFile).toHaveBeenCalledTimes(1);
    expect((onFile.mock.calls[0][0] as File).name).toBe('Default-sample.webm');
  });
});

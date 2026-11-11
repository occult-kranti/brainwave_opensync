// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInstrumentInput } from '../instrument/useInstrumentInput';
import { connectInput, signalReader, type Analysers } from '../instrument/signal';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

class Track extends EventTarget {
  kind: 'audio' | 'video';
  label: string;
  muted = false;
  readyState: MediaStreamTrackState = 'live';
  stop = vi.fn(() => { this.readyState = 'ended'; });
  constructor(kind: 'audio' | 'video', label = kind === 'audio' ? 'Music tab' : 'Shared display') {
    super();
    this.kind = kind;
    this.label = label;
  }
  end() {
    this.readyState = 'ended';
    this.dispatchEvent(new Event('ended'));
  }
  setMuted(value: boolean) {
    this.muted = value;
    this.dispatchEvent(new Event(value ? 'mute' : 'unmute'));
  }
}

class Stream {
  tracks: Track[];
  constructor(tracks: Track[] = []) { this.tracks = tracks; }
  getTracks() { return this.tracks; }
  getAudioTracks() { return this.tracks.filter((track) => track.kind === 'audio'); }
  getVideoTracks() { return this.tracks.filter((track) => track.kind === 'video'); }
}

class Node {
  context: Context;
  connections: Node[] = [];
  gain = { value: 1 };
  channelCount = 2;
  channelCountMode = 'max';
  fftSize = 2048;
  frequencyBinCount = 1024;
  disconnect = vi.fn(() => { this.connections = []; });
  constructor(context: Context) { this.context = context; }
  connect(target: Node) { this.connections.push(target); return target; }
}

class Context extends EventTarget {
  state: AudioContextState = 'running';
  sampleRate = 48000;
  destination = new Node(this);
  nodes: Node[] = [];
  mediaStreams: Stream[] = [];
  resume = vi.fn(() => resumeResult ?? Promise.resolve());
  close = vi.fn(async () => { this.state = 'closed'; });
  constructor() { super(); contexts.push(this); }
  node() { const node = new Node(this); this.nodes.push(node); return node; }
  createGain() { return this.node(); }
  createAnalyser() { return this.node(); }
  createChannelSplitter() { return this.node(); }
  createMediaStreamSource(stream: Stream) { this.mediaStreams.push(stream); return this.node(); }
  createMediaElementSource() { return this.node(); }
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function music() { return new Stream([new Track('audio'), new Track('video')]); }

let contexts: Context[];
let resumeResult: Promise<void> | undefined;
let input: ReturnType<typeof useInstrumentInput>;
let root: Root;
let container: HTMLDivElement;
let getDisplayMedia: ReturnType<typeof vi.fn>;
let getUserMedia: ReturnType<typeof vi.fn>;

function Probe({ panicked = false }: { panicked?: boolean }) {
  input = useInstrumentInput(panicked);
  return <button onClick={() => { void input.start('tab'); }}>Capture music</button>;
}

async function mount(panicked = false) {
  await act(async () => root.render(<Probe panicked={panicked} />));
}

beforeEach(() => {
  contexts = [];
  resumeResult = undefined;
  getDisplayMedia = vi.fn(async () => music());
  getUserMedia = vi.fn(async () => new Stream([new Track('audio', 'Loopback input')]));
  vi.stubGlobal('AudioContext', Context);
  vi.stubGlobal('MediaStream', Stream);
  vi.stubGlobal('navigator', { mediaDevices: { getDisplayMedia, getUserMedia } });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe('live laptop audio input lifecycle', () => {
  it('requests the picker during the click, keeps original playback, and asks for audio', async () => {
    const pending = deferred<Stream>();
    getDisplayMedia.mockReturnValue(pending.promise);
    await mount();
    act(() => container.querySelector('button')!.click());
    // The permission call must precede an asynchronous setup boundary.
    expect(getDisplayMedia).toHaveBeenCalledTimes(1);
    const options = getDisplayMedia.mock.calls[0][0];
    expect(options.video).toBeTruthy();
    expect(options.audio).toBeTruthy();
    expect(options).toMatchObject({ systemAudio: 'exclude', selfBrowserSurface: 'exclude' });
    expect(options.audio).toMatchObject({ suppressLocalAudioPlayback: false });
    expect(input.waiting).toBe(true);
    await act(async () => { pending.resolve(music()); });
    expect(input.active).toBe(true);
    expect(input.waiting).toBe(false);
  });

  it('connects system audio only when the returned stream includes audio', async () => {
    const shared = music();
    getDisplayMedia.mockResolvedValue(shared);
    await mount();
    await act(async () => input.start('system'));
    expect(getDisplayMedia.mock.calls[0][0]).toMatchObject({ systemAudio: 'include' });
    expect(input.active).toBe(true);
    expect(input.sourceLabel).toBeTruthy();
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(shared.getTracks().every((track) => track.readyState === 'live')).toBe(true);
  });

  it('releases a video-only share and reports the missing audio instead of using a mic', async () => {
    const shared = new Stream([new Track('video')]);
    getDisplayMedia.mockResolvedValue(shared);
    await mount();
    await act(async () => input.start('tab'));
    expect(input.active).toBe(false);
    expect(input.waiting).toBe(false);
    expect(input.connection.current).toBeNull();
    expect(input.status).toMatch(/audio/i);
    expect(shared.getTracks()[0].stop).toHaveBeenCalled();
    expect(contexts.every((context) => context.state === 'closed')).toBe(true);
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('makes permission denial recoverable and releases its AudioContext', async () => {
    getDisplayMedia.mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'));
    await mount();
    await act(async () => input.start('system'));
    expect(input.active).toBe(false);
    expect(input.waiting).toBe(false);
    expect(input.status).toMatch(/cancel|denied|allow|permission/i);
    expect(contexts.every((context) => context.state === 'closed')).toBe(true);
    await act(async () => input.stop());
    expect(input.status).toBe('');
  });

  it('reports unsupported display capture without silently starting a microphone', async () => {
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    await mount();
    await act(async () => input.start('tab'));
    expect(input.active).toBe(false);
    expect(input.status).toMatch(/browser|available|support/i);
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('stops a permission request and immediately releases a stream returned afterwards', async () => {
    const pending = deferred<Stream>();
    getDisplayMedia.mockReturnValue(pending.promise);
    await mount();
    let start!: Promise<void>;
    act(() => { start = input.start('tab'); });
    await act(async () => input.stop());
    expect(input.waiting).toBe(false);
    const late = music();
    await act(async () => { pending.resolve(late); await start; });
    expect(input.active).toBe(false);
    expect(input.connection.current).toBeNull();
    expect(late.getTracks().every((track) => track.readyState === 'ended')).toBe(true);
    expect(contexts.every((context) => context.state === 'closed')).toBe(true);
  });

  it('does not let an old picker result tear down a newer connection', async () => {
    const pending = deferred<Stream>();
    const current = music();
    getDisplayMedia.mockReturnValueOnce(pending.promise).mockResolvedValueOnce(current);
    await mount();
    let oldStart!: Promise<void>;
    act(() => { oldStart = input.start('tab'); });
    await act(async () => input.start('system'));
    const currentConnection = input.connection.current;
    const stale = music();
    await act(async () => { pending.resolve(stale); await oldStart; });
    expect(stale.getTracks().every((track) => track.readyState === 'ended')).toBe(true);
    expect(input.active).toBe(true);
    expect(input.connection.current).toBe(currentConnection);
    expect(current.getTracks().every((track) => track.readyState === 'live')).toBe(true);
    // Even a queued ended event from the old source must not stop the new one.
    await act(async () => stale.getVideoTracks()[0].end());
    expect(input.connection.current).toBe(currentConnection);
  });

  it('does not connect a track that ends while the AudioContext is still resuming', async () => {
    const resume = deferred<void>();
    resumeResult = resume.promise;
    const shared = music();
    getDisplayMedia.mockResolvedValue(shared);
    await mount();
    let start!: Promise<void>;
    await act(async () => { start = input.start('tab'); await Promise.resolve(); });
    expect(input.waiting).toBe(true);
    await act(async () => shared.getAudioTracks()[0].end());
    await act(async () => { resume.resolve(undefined); await start; });
    expect(input.active).toBe(false);
    expect(input.waiting).toBe(false);
    expect(input.connection.current).toBeNull();
    expect(input.status).toMatch(/end|stop|audio/i);
    expect(shared.getTracks().every((track) => track.readyState === 'ended')).toBe(true);
    expect(contexts.every((context) => context.state === 'closed')).toBe(true);
  });

  it('releases a returned stream when the AudioContext cannot resume', async () => {
    const resume = deferred<void>();
    resumeResult = resume.promise;
    const shared = music();
    getDisplayMedia.mockResolvedValue(shared);
    await mount();
    let start!: Promise<void>;
    await act(async () => { start = input.start('system'); await Promise.resolve(); });
    await act(async () => { resume.reject(new Error('Audio context could not resume.')); await start; });
    expect(input.active).toBe(false);
    expect(input.waiting).toBe(false);
    expect(input.connection.current).toBeNull();
    expect(input.status).toMatch(/resume/i);
    expect(shared.getTracks().every((track) => track.readyState === 'ended')).toBe(true);
    expect(contexts.every((context) => context.state === 'closed')).toBe(true);
  });

  it('releases audio and display tracks when the browser ends sharing', async () => {
    const shared = music();
    getDisplayMedia.mockResolvedValue(shared);
    await mount();
    await act(async () => input.start('tab'));
    await act(async () => shared.getVideoTracks()[0].end());
    expect(input.active).toBe(false);
    expect(input.connection.current).toBeNull();
    expect(shared.getTracks().every((track) => track.readyState === 'ended')).toBe(true);
    expect(input.status).toMatch(/end|stop|disconnect/i);
  });

  it('distinguishes a muted track from stopped sharing and recovers on unmute', async () => {
    const shared = music();
    getDisplayMedia.mockResolvedValue(shared);
    await mount();
    await act(async () => input.start('tab'));
    const originalConnection = input.connection.current;
    await act(async () => shared.getAudioTracks()[0].setMuted(true));
    expect(input.muted).toBe(true);
    expect(input.active).toBe(true);
    expect(input.connection.current).toBe(originalConnection);
    await act(async () => shared.getAudioTracks()[0].setMuted(false));
    expect(input.muted).toBe(false);
    expect(input.active).toBe(true);
  });

  it('releases an explicit microphone or configured loopback input on replacement', async () => {
    const loopback = new Stream([new Track('audio', 'Stereo Mix')]);
    getUserMedia.mockResolvedValue(loopback);
    await mount();
    await act(async () => input.start('mic'));
    expect(input.active).toBe(true);
    await act(async () => input.start('tab'));
    expect(loopback.getTracks()[0].stop).toHaveBeenCalled();
    expect(input.active).toBe(true);
    expect(getDisplayMedia).toHaveBeenCalledTimes(1);
  });

  it('stops all capture tracks on unmount', async () => {
    const shared = music();
    getDisplayMedia.mockResolvedValue(shared);
    await mount();
    await act(async () => input.start('tab'));
    await act(async () => root.unmount());
    expect(shared.getTracks().every((track) => track.readyState === 'ended')).toBe(true);
    expect(contexts.every((context) => context.state === 'closed')).toBe(true);
  });

  it('disposes a stream that arrives after the route has unmounted', async () => {
    const pending = deferred<Stream>();
    getDisplayMedia.mockReturnValue(pending.promise);
    await mount();
    let start!: Promise<void>;
    act(() => { start = input.start('tab'); });
    await act(async () => root.unmount());
    const late = music();
    await act(async () => { pending.resolve(late); await start; });
    expect(late.getTracks().every((track) => track.readyState === 'ended')).toBe(true);
    expect(contexts.every((context) => context.state === 'closed')).toBe(true);
  });

  it('panic releases active capture and prevents a pending permission result from reconnecting', async () => {
    const shared = music();
    getDisplayMedia.mockResolvedValueOnce(shared);
    await mount();
    await act(async () => input.start('tab'));
    await mount(true);
    expect(input.active).toBe(false);
    expect(shared.getTracks().every((track) => track.readyState === 'ended')).toBe(true);
    await mount(false);
    const pending = deferred<Stream>();
    getDisplayMedia.mockReturnValueOnce(pending.promise);
    let start!: Promise<void>;
    act(() => { start = input.start('tab'); });
    await mount(true);
    const late = music();
    await act(async () => { pending.resolve(late); await start; });
    expect(input.active).toBe(false);
    expect(input.waiting).toBe(false);
    expect(late.getTracks().every((track) => track.readyState === 'ended')).toBe(true);
  });
});

describe('capture graph feedback and cleanup', () => {
  it('only connects the analysis graph to speakers through an explicitly zero gain sink', () => {
    const context = new Context();
    const shared = music();
    const connection = connectInput(context as unknown as AudioContext, shared as unknown as MediaStream);
    const destinationInputs = context.nodes.filter((node) => node.connections.includes(context.destination));
    expect(destinationInputs).toHaveLength(1);
    expect(destinationInputs[0].gain.value).toBe(0);
    const source = context.nodes[0];
    expect(source.connections).not.toContain(context.destination);
    expect(context.mediaStreams[0].getAudioTracks()).toEqual(shared.getAudioTracks());
    expect(context.mediaStreams[0].getVideoTracks()).toHaveLength(0);
    expect(shared.getTracks().every((track) => track.readyState === 'live')).toBe(true);
    connection.close();
  });

  it('disconnects every allocated node and closes resources only once on repeated release', () => {
    const context = new Context();
    const shared = music();
    const connection = connectInput(context as unknown as AudioContext, shared as unknown as MediaStream);
    connection.close();
    connection.close();
    expect(context.nodes.every((node) => node.disconnect.mock.calls.length === 1)).toBe(true);
    expect(shared.getTracks().every((track) => track.stop.mock.calls.length === 1)).toBe(true);
    expect(context.close).toHaveBeenCalledTimes(1);
  });
});

describe('stereo input analysis', () => {
  function analysis(leftValue: number, rightValue: number, leftSize = 2048, rightSize = 2048): Analysers {
    const channel = (value: number, fftSize: number) => ({
      fftSize, frequencyBinCount: fftSize / 2,
      getFloatTimeDomainData: (data: Float32Array) => data.fill(value),
      getFloatFrequencyData: (data: Float32Array) => {
        data.fill(-Infinity);
        if (value === 0) return;
        const position = 440 * fftSize / 48000;
        // A known log-parabolic spectral maximum verifies native FFT spacing
        // and sub-bin refinement independently of the mono spectrum stub.
        for (let index = Math.floor(position) - 2; index <= Math.ceil(position) + 2; index++) {
          data[index] = -20 - 6 * (index - position) ** 2;
        }
      },
    });
    return {
      spectrum: {
        context: { sampleRate: 48000 }, fftSize: 4096, frequencyBinCount: 2048,
        // Simulate full cancellation in the legacy mono analyser.
        getFloatFrequencyData: (data: Float32Array) => data.fill(-Infinity),
      },
      left: channel(leftValue, leftSize),
      right: channel(rightValue, rightSize),
    } as unknown as Analysers;
  }

  it('reacts to right-only audio and distinguishes it from digital silence', () => {
    const silent = signalReader()(analysis(0, 0), 100);
    const rightOnly = signalReader()(analysis(0, 0.25), 100);
    expect(silent.level).toBe(0);
    expect(silent.hz).toBe(0);
    expect(silent.bands).toEqual([0, 0, 0]);
    expect(rightOnly.level).toBeGreaterThan(0.2);
    expect(rightOnly.hz).toBeCloseTo(440, 3);
    expect(rightOnly.bands[1]).toBeGreaterThan(0.5);
  });

  it('preserves the frequency and level when stereo channels have opposite polarity', () => {
    const inPhase = signalReader()(analysis(0.25, 0.25), 100);
    const opposite = signalReader()(analysis(0.25, -0.25), 100);
    expect(opposite.level).toBeGreaterThan(0.3);
    expect(opposite.level).toBeCloseTo(inPhase.level, 8);
    expect(opposite.hz).toBeCloseTo(440, 3);
    expect(opposite.hz).toBeCloseTo(inPhase.hz, 8);
    expect(opposite.bands).toEqual(inPhase.bands);
  });

  it('maps different native FFT sizes using physical frequency rather than shared bin indices', () => {
    const signal = signalReader()(analysis(0, 0.25, 2048, 4096), 100);
    expect(signal.hz).toBeCloseTo(440, 3);
    expect(signal.level).toBeGreaterThan(0.2);
    expect(Number.isFinite(signal.level)).toBe(true);
    const reversed = signalReader()(analysis(0.25, 0, 4096, 2048), 100);
    expect(reversed.hz).toBeCloseTo(440, 3);
    expect(reversed.level).toBeCloseTo(signal.level, 8);
  });

  it('retains a stable detected frequency across successive opposite-phase frames', () => {
    const read = signalReader();
    const nodes = analysis(0.25, -0.25);
    for (let frame = 0; frame < 5; frame++) expect(read(nodes, 100).hz).toBeCloseTo(440, 3);
  });

  it('does not mistake a 12 kHz waveform for silence by subsampling its zero crossings', () => {
    const nodes = analysis(0, 0);
    const samples = (data: Float32Array<ArrayBuffer>) => {
      for (let i = 0; i < data.length; i++) data[i] = 0.25 * Math.sin(Math.PI * i / 2);
    };
    nodes.left.getFloatTimeDomainData = samples;
    nodes.right.getFloatTimeDomainData = samples;
    const signal = signalReader()(nodes, 100);
    expect(signal.level).toBeGreaterThan(0.2);
    expect(Number.isFinite(signal.level)).toBe(true);
  });
});

// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveEngine } from '../audio/liveEngine';

class FakeParam {
  value = 1;
  targets: number[] = [];
  setTargetAtTime(value: number) { this.targets.push(value); this.value = value; }
  cancelScheduledValues() {}
  setValueAtTime(value: number) { this.value = value; }
  linearRampToValueAtTime(value: number) { this.value = value; }
}
class FakeNode {
  connect() {}
  disconnect() {}
}
class FakeBuffer {
  data: Float32Array;
  constructor(length: number) { this.data = new Float32Array(length); }
  getChannelData() { return this.data; }
}
class FakeSource extends FakeNode {
  buffer: FakeBuffer | null = null;
  loop = false;
  starts = 0;
  stops = 0;
  onended: (() => void) | null = null;
  start() { this.starts++; }
  stop() { this.stops++; }
}
class FakeContext {
  state = 'running';
  sampleRate = 48000;
  currentTime = 0;
  destination = new FakeNode();
  onstatechange: (() => void) | null = null;
  sources: FakeSource[] = [];
  gains: (FakeNode & { gain: FakeParam })[] = [];
  createGain() { const node = Object.assign(new FakeNode(), { gain: new FakeParam() }); this.gains.push(node); return node; }
  createAnalyser() { return Object.assign(new FakeNode(), { fftSize: 2048, frequencyBinCount: 1024, smoothingTimeConstant: 0 }); }
  createChannelSplitter() { return new FakeNode(); }
  createChannelMerger() { return new FakeNode(); }
  createOscillator() { return Object.assign(new FakeNode(), { type: 'sine', frequency: new FakeParam(), start() {}, stop() {} }); }
  createBiquadFilter() { return Object.assign(new FakeNode(), { type: 'lowpass', frequency: new FakeParam(), Q: new FakeParam() }); }
  createBuffer(_channels: number, length: number) { return new FakeBuffer(length); }
  createBufferSource() { const source = new FakeSource(); this.sources.push(source); return source; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
}

describe('live texture stability across mobile-length listening', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('AudioContext', FakeContext); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('keeps the same noise and nature sources through 90 clock updates and pause/resume', () => {
    const engine = new LiveEngine();
    engine.setNoiseLevel('brown', -28);
    engine.setNature('thunder', -28);
    expect(engine.start()).toBe(true);
    const context = engine.context as unknown as FakeContext;
    const sources = context.sources.slice();
    expect(sources.map(source => source.buffer!.data.length).sort((a, b) => a - b)).toEqual([8 * 48000, 12 * 48000]);
    for (let second = 1; second <= 90; second++) {
      context.currentTime = second;
      engine.updateConfig({ mode: 'binaural', carrierHz: 180, beatHz: 6 });
      // An unchanged UI value / gain-only update must not reset the texture.
      engine.setNature('thunder', second < 45 ? -28 : -30);
      engine.setNoiseLevel('brown', -28);
      vi.advanceTimersByTime(1000);
    }
    engine.pause();
    vi.advanceTimersByTime(100);
    engine.resume();
    expect(context.sources).toEqual(sources);
    expect(sources.every(source => source.starts === 1 && source.stops === 0)).toBe(true);
    expect(engine.isRunning).toBe(true);
    engine.panic();
    vi.advanceTimersByTime(200);
    expect(sources.every(source => source.stops === 1)).toBe(true);
    expect(engine.isRunning).toBe(false);
  });

  it('releases a genuine nature-kind replacement but retains a gain-only edit', () => {
    const engine = new LiveEngine();
    engine.start();
    const context = engine.context as unknown as FakeContext;
    engine.setNature('ocean', -28);
    const first = context.sources[0];
    engine.setNature('ocean', -32);
    expect(context.sources).toHaveLength(1);
    expect(first.stops).toBe(0);
    engine.setNature('rain', -32);
    expect(context.sources).toHaveLength(2);
    expect(first.stops).toBe(0);
    vi.advanceTimersByTime(150);
    expect(first.stops).toBe(1);
    expect(context.sources[1].stops).toBe(0);
    engine.setNature(null, -Infinity);
    vi.advanceTimersByTime(150);
    expect(context.sources[1].stops).toBe(1);
  });

  it('keeps cached noise and loop sources across interruption, and safely reuses the buffer after panic', () => {
    const engine = new LiveEngine();
    engine.setNoiseLevel('brown', -28);
    engine.setNature('thunder', -28);
    engine.start();
    const context = engine.context as unknown as FakeContext;
    const original = context.sources.slice();
    const noiseBuffer = original[0].buffer;
    context.currentTime = 24;
    context.state = 'interrupted';
    context.onstatechange?.();
    expect(engine.isPaused).toBe(true);
    expect(context.gains[1].gain.value).toBe(0);
    // A platform auto-resume remains muted until explicit user resume.
    context.state = 'running';
    context.onstatechange?.();
    expect(engine.isPaused).toBe(true);
    expect(context.gains[1].gain.value).toBe(0);
    engine.resume();
    expect(context.sources).toEqual(original);
    engine.panic();
    engine.start();
    expect(context.sources).toHaveLength(4);
    expect(context.sources[2].buffer).toBe(noiseBuffer);
    vi.advanceTimersByTime(150);
    expect(original.every(source => source.stops === 1)).toBe(true);
    expect(context.sources.slice(2).every(source => source.starts === 1 && source.stops === 0)).toBe(true);
    expect(engine.isRunning).toBe(true);
  });
});

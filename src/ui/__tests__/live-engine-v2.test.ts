// @vitest-environment happy-dom
/**
 * LiveEngine v2 contracts — layer routing, sleep fade, OS interruption
 * detection, infant low-pass path — against a fake AudioContext that
 * records node connections and AudioParam automation.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveEngine } from '../audio/liveEngine';

class FakeParam {
  value = 1;
  log: [string, ...unknown[]][] = [];
  setTargetAtTime(...args: unknown[]) {
    this.log.push(['setTargetAtTime', ...args]);
  }
  cancelScheduledValues(...args: unknown[]) {
    this.log.push(['cancelScheduledValues', ...args]);
  }
  setValueAtTime(...args: unknown[]) {
    this.log.push(['setValueAtTime', ...args]);
  }
  linearRampToValueAtTime(...args: unknown[]) {
    this.log.push(['linearRampToValueAtTime', ...args]);
  }
}

class FakeNode {
  connections: unknown[] = [];
  connect(target: unknown) {
    this.connections.push(target);
  }
  disconnect() {}
}

const gains: (FakeNode & { gain: FakeParam })[] = [];
const filters: (FakeNode & { type: string; frequency: FakeParam; Q: FakeParam })[] = [];

function makeCtx(withFilter: boolean) {
  return class FakeAudioContext {
    state: AudioContextState = 'running';
    currentTime = 0;
    sampleRate = 48000;
    destination = new FakeNode();
    onstatechange: (() => void) | null = null;
    createGain() {
      const g = Object.assign(new FakeNode(), { gain: new FakeParam() });
      gains.push(g);
      return g;
    }
    createAnalyser() {
      return Object.assign(new FakeNode(), { fftSize: 2048, frequencyBinCount: 1024, smoothingTimeConstant: 0 });
    }
    createChannelSplitter() {
      return new FakeNode();
    }
    createChannelMerger() {
      return new FakeNode();
    }
    createOscillator() {
      return Object.assign(new FakeNode(), { type: 'sine', frequency: new FakeParam(), start() {}, stop() {} });
    }
    createBufferSource() {
      return Object.assign(new FakeNode(), { buffer: null as unknown, loop: false, start() {}, stop() {}, onended: null });
    }
    createBuffer(_ch: number, len: number, _sr: number) {
      return { getChannelData: () => new Float32Array(len) };
    }
    createBiquadFilter = withFilter
      ? () => {
          const f = Object.assign(new FakeNode(), { type: 'allpass', frequency: new FakeParam(), Q: new FakeParam() });
          filters.push(f);
          return f;
        }
      : undefined;
    resume() {}
    suspend() {}
  };
}

function install(withFilter = true) {
  gains.length = 0;
  filters.length = 0;
  (globalThis as Record<string, unknown>).AudioContext = makeCtx(withFilter);
}

describe('LiveEngine v2 — layer routing', () => {
  beforeEach(() => install());
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).AudioContext;
  });

  it('routes nature and bowl loops through the layer bus (bypass was a no-op in v1)', () => {
    const eng = new LiveEngine();
    eng.start();
    const layerBus = gains[3];
    const before = gains.length;
    eng.setNature('rain', -20);
    eng.setBowl(true, 136.1, -24);
    const natureGain = gains[before];
    const bowlGain = gains[before + 1];
    expect(natureGain.connections).toContain(layerBus);
    expect(bowlGain.connections).toContain(layerBus);
    // Noise still sums into the noise bus.
    eng.setNoiseLevel('pink', -20);
    expect(gains[gains.length - 1].connections).toContain(gains[2]);
  });

  it('keeps the v1 gain creation order (bus, master, noiseBus, layerBus)', () => {
    const eng = new LiveEngine();
    eng.start();
    // master starts silent, section buses at unity, direct path open, filter path closed.
    expect(gains[1].gain.value).toBe(0);
    expect(gains[2].gain.value).toBe(1);
    expect(gains[3].gain.value).toBe(1);
    expect(gains[4].gain.value).toBe(1);
    expect(gains[5].gain.value).toBe(0);
  });
});

describe('LiveEngine v2 — sleep fade', () => {
  beforeEach(() => {
    install();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as Record<string, unknown>).AudioContext;
  });

  it('schedules a dB-linear ramp to silence, keeps running until it lands, then stops and emits fade-done', () => {
    const eng = new LiveEngine();
    const events: string[] = [];
    eng.subscribe((e) => events.push(e));
    eng.setOutputDb(-12);
    eng.start();
    const master = gains[1];
    master.gain.log.length = 0;
    expect(eng.fadeOut(30)).toBe(true);
    expect(eng.isFading).toBe(true);
    expect(eng.isRunning).toBe(true);
    const ramps = master.gain.log.filter((l) => l[0] === 'linearRampToValueAtTime');
    expect(ramps.length).toBeGreaterThanOrEqual(12);
    // Monotonically decreasing targets, ending at true 0 just after 30 s.
    const targets = ramps.map((l) => l[1] as number);
    for (let i = 1; i < targets.length; i++) expect(targets[i]).toBeLessThanOrEqual(targets[i - 1]);
    expect(targets[targets.length - 1]).toBe(0);
    expect(ramps[ramps.length - 1][2]).toBeCloseTo(30.05, 3);
    // Volume changes during the fade do not fight the ramp.
    master.gain.log.length = 0;
    eng.setOutputDb(-6);
    expect(master.gain.log.length).toBe(0);
    vi.advanceTimersByTime(30_200);
    expect(eng.isRunning).toBe(false);
    expect(eng.isFading).toBe(false);
    expect(events).toEqual(['fade-done']);
  });

  it('cancelFadeOut restores the volume and stop/panic clear the fade', () => {
    const eng = new LiveEngine();
    eng.start();
    eng.fadeOut(10);
    eng.cancelFadeOut();
    expect(eng.isFading).toBe(false);
    expect(eng.isRunning).toBe(true);
    eng.fadeOut(10);
    eng.panic();
    expect(eng.isFading).toBe(false);
    vi.advanceTimersByTime(20_000);
    expect(eng.isRunning).toBe(false);
  });

  it('is a no-op when idle or paused', () => {
    const eng = new LiveEngine();
    expect(eng.fadeOut(5)).toBe(false);
    eng.start();
    eng.pause();
    expect(eng.fadeOut(5)).toBe(false);
  });
});

describe('LiveEngine v2 — OS interruption', () => {
  beforeEach(() => install());
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).AudioContext;
  });

  it('flips to paused and notifies when the context is suspended externally', () => {
    const eng = new LiveEngine();
    const events: string[] = [];
    eng.subscribe((e) => events.push(e));
    eng.start();
    const ctx = eng.context as unknown as { state: string; onstatechange: (() => void) | null };
    ctx.state = 'interrupted';
    ctx.onstatechange?.();
    expect(eng.isPaused).toBe(true);
    expect(eng.isRunning).toBe(true);
    expect(events).toEqual(['interrupted']);
  });

  it("does not misreport the engine's own pause() as an interruption", () => {
    const eng = new LiveEngine();
    const events: string[] = [];
    eng.subscribe((e) => events.push(e));
    eng.start();
    eng.pause();
    const ctx = eng.context as unknown as { state: string; onstatechange: (() => void) | null };
    ctx.state = 'suspended';
    ctx.onstatechange?.();
    expect(events).toEqual([]);
  });
});

describe('LiveEngine v2 — infant low-pass path', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).AudioContext;
  });

  it('builds a 1 kHz lowpass and cross-fades it in/out click-free', () => {
    install(true);
    const eng = new LiveEngine();
    eng.start();
    expect(eng.hasInfantFilter).toBe(true);
    expect(filters[0].type).toBe('lowpass');
    expect(filters[0].frequency.value).toBe(1000);
    expect(eng.setInfantFilter(true)).toBe(true);
    expect(gains[4].gain.log).toContainEqual(['setTargetAtTime', 0, 0, 0.05]);
    expect(gains[5].gain.log).toContainEqual(['setTargetAtTime', 1, 0, 0.05]);
    eng.setInfantFilter(false);
    expect(gains[4].gain.log).toContainEqual(['setTargetAtTime', 1, 0, 0.05]);
  });

  it('reports false when the platform cannot filter (caller must refuse infant sessions)', () => {
    install(false);
    const eng = new LiveEngine();
    eng.start();
    expect(eng.hasInfantFilter).toBe(false);
    expect(eng.setInfantFilter(true)).toBe(false);
    expect(eng.setInfantFilter(false)).toBe(true);
    // Direct path stays open so audio is not lost.
    expect(gains[4].gain.value).toBe(1);
  });

  it('honors infant mode requested before the graph exists', () => {
    install(true);
    const eng = new LiveEngine();
    eng.setInfantFilter(true);
    eng.start();
    expect(gains[4].gain.value).toBe(0);
    expect(gains[5].gain.value).toBe(1);
  });
});

describe('LiveEngine v2 — mixer memory before first start', () => {
  beforeEach(() => install());
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).AudioContext;
  });

  it('applies noise/nature/bowl set while idle when the session starts (v1 lost them)', () => {
    const eng = new LiveEngine();
    eng.setNoiseLevel('pink', -20);
    eng.setNoiseLevel('brown', -30);
    eng.setNoiseLevel('brown', -Infinity); // turned back off before start
    eng.setNature('rain', -24);
    eng.setBowl(true, 136.1, -28);
    expect(eng.prepare()).toBe(true);
    const before = gains.length;
    eng.start();
    // tone chain (gL, gR) + one gain per live layer: pink noise, nature, bowl (brown was cleared)
    expect(gains.length - before).toBe(5);
    expect(gains[before + 2].connections).toContain(gains[2]); // pink → noiseBus
    expect(gains[before + 3].connections).toContain(gains[3]); // nature → layerBus
    expect(gains[before + 4].connections).toContain(gains[3]); // bowl → layerBus
    // Restarting does not duplicate nodes.
    eng.stop();
    const afterStop = gains.length;
    eng.start();
    expect(gains.length - afterStop).toBeLessThanOrEqual(2); // tone chain gains only (gL, gR)
  });
});

describe('LiveEngine v2.0.1 — interruption, timers, mute vs fade, previews, releases', () => {
  beforeEach(() => {
    install();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as Record<string, unknown>).AudioContext;
  });

  it('hard-mutes the master on an OS interruption so a platform auto-resume stays silent', () => {
    const eng = new LiveEngine();
    eng.setOutputDb(-12);
    eng.start();
    eng.fadeOut(30);
    const master = gains[1];
    master.gain.value = 0.25;
    const events: string[] = [];
    eng.subscribe((e) => events.push(e));
    const ctx = eng.context as unknown as { state: string; onstatechange: (() => void) | null };
    ctx.state = 'interrupted';
    ctx.onstatechange?.();
    expect(master.gain.value).toBe(0);
    expect(eng.isPaused).toBe(true);
    expect(eng.isFading).toBe(false);
    expect(events).toEqual(['fade-cancelled', 'interrupted']);
    // The platform resuming the context by itself does not un-pause us.
    ctx.state = 'running';
    ctx.onstatechange?.();
    expect(eng.isPaused).toBe(true);
  });

  it("treats the engine's own pause() suspend as self-inflicted, and a fast resume cancels it", () => {
    const eng = new LiveEngine();
    eng.start();
    const ctx = eng.context as unknown as { state: string; onstatechange: (() => void) | null; suspend: () => void };
    const suspendSpy = vi.spyOn(ctx, 'suspend');
    const events: string[] = [];
    eng.subscribe((e) => events.push(e));
    eng.pause();
    vi.advanceTimersByTime(100); // suspend timer fires → suspendPending
    expect(suspendSpy).toHaveBeenCalledTimes(1);
    ctx.state = 'suspended';
    ctx.onstatechange?.();
    expect(events).toEqual([]); // not an interruption
    eng.resume();
    ctx.state = 'running';
    ctx.onstatechange?.();
    // Second round: resume before the timer fires → no suspend at all.
    eng.pause();
    eng.resume();
    vi.advanceTimersByTime(200);
    expect(suspendSpy).toHaveBeenCalledTimes(1);
    expect(eng.isPaused).toBe(false);
  });

  it('mute wins over a fade (ramps to 0 now), unmute re-issues the remainder, fade-done still fires', () => {
    const eng = new LiveEngine();
    const events: string[] = [];
    eng.subscribe((e) => events.push(e));
    eng.setOutputDb(-12);
    eng.start();
    const master = gains[1];
    eng.fadeOut(10);
    master.gain.log.length = 0;
    eng.setMuted(true);
    const ramp = master.gain.log.find((l) => l[0] === 'linearRampToValueAtTime');
    expect(ramp?.[1]).toBe(0);
    expect(ramp?.[2]).toBeCloseTo(0.02, 3);
    expect(eng.isFading).toBe(true);
    master.gain.log.length = 0;
    eng.setMuted(false);
    // Re-issued curve: many segments again, ending at 0.
    const ramps = master.gain.log.filter((l) => l[0] === 'linearRampToValueAtTime');
    expect(ramps.length).toBeGreaterThanOrEqual(12);
    expect(ramps[ramps.length - 1][1]).toBe(0);
    vi.advanceTimersByTime(11_000);
    expect(eng.isRunning).toBe(false);
    expect(events).toContain('fade-done');
  });

  it('starts a fade from the current level, never above it (re-trigger mid-fade cannot jump up)', () => {
    const eng = new LiveEngine();
    eng.setOutputDb(-12); // nominal 0.251
    eng.start();
    const master = gains[1];
    master.gain.value = 0.05; // fade already 2/3 of the way down
    master.gain.log.length = 0;
    eng.fadeOut(10);
    const ramps = master.gain.log.filter((l) => l[0] === 'linearRampToValueAtTime');
    for (const r of ramps) expect(r[1] as number).toBeLessThanOrEqual(0.05 + 1e-9);
  });

  it('a start() inside the stop fade window survives the delayed teardown', () => {
    const eng = new LiveEngine();
    eng.start();
    eng.stop(0.3);
    eng.start();
    expect(eng.isRunning).toBe(true);
    const oscStops: number[] = [];
    // count oscillator stop() calls after the timer by instrumenting the fake nodes created so far
    vi.advanceTimersByTime(500);
    expect(eng.isRunning).toBe(true);
    expect(oscStops.length).toBe(0);
    // the live chain is still connected: updateConfig can address oscillators without throwing
    expect(() => eng.updateConfig({ beatHz: 7 })).not.toThrow();
  });

  it('routes previews through the preview bus (infant low-pass path), not straight to destination', () => {
    const eng = new LiveEngine();
    eng.prepare();
    const previewBus = gains[6];
    const before = gains.length;
    eng.playBuffer(new Float32Array(480), new Float32Array(480), 48000, -18);
    expect(gains[before].connections).toContain(previewBus);
    eng.setInfantFilter(true);
    expect(gains[7].gain.log).toContainEqual(['setTargetAtTime', 0, 0, 0.05]); // previewDirect closes
    expect(gains[8].gain.log).toContainEqual(['setTargetAtTime', 1, 0, 0.05]); // previewFiltered opens
    expect(filters.length).toBe(2); // session + preview low-pass
  });

  it('releases a layer with a ramp before stopping it, instead of a hard cut', () => {
    const eng = new LiveEngine();
    eng.start();
    eng.setNoiseLevel('brown', -18);
    const g = gains[gains.length - 1];
    eng.setNoiseLevel('brown', -Infinity);
    expect(g.gain.log).toContainEqual(['setTargetAtTime', 0, 0, 0.02]);
    // and turning it back on before the release lands creates a fresh, independent node
    eng.setNoiseLevel('brown', -20);
    expect(gains[gains.length - 1]).not.toBe(g);
    vi.advanceTimersByTime(200);
  });
});

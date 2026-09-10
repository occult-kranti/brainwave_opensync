// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MediaSessionBridge, silentWavDataUri } from '../mediaSession';

class FakeSession {
  metadata: unknown = null;
  playbackState: 'none' | 'paused' | 'playing' = 'none';
  handlers = new Map<string, (() => void) | null>();
  setActionHandler(action: string, handler: (() => void) | null) {
    this.handlers.set(action, handler);
  }
}

describe('MediaSessionBridge', () => {
  afterEach(() => {
    delete (navigator as unknown as Record<string, unknown>).mediaSession;
    vi.restoreAllMocks();
  });

  it('emits a valid tiny silent WAV', () => {
    const uri = silentWavDataUri(0.1, 8000);
    expect(uri.startsWith('data:audio/wav;base64,')).toBe(true);
    const bytes = Uint8Array.from(atob(uri.split(',')[1]), (c) => c.charCodeAt(0));
    expect(String.fromCharCode(...bytes.subarray(0, 4))).toBe('RIFF');
    expect(bytes.length).toBe(44 + 800);
    expect(bytes[44]).toBe(0x80); // unsigned-8 silence
  });

  it('is a silent no-op without the API', () => {
    const b = new MediaSessionBridge({ play: () => {}, pause: () => {}, stop: () => {} });
    expect(b.isSupported).toBe(false);
    expect(() => {
      b.activate({ title: 'x' });
      b.pause({ title: 'x' });
      b.deactivate();
    }).not.toThrow();
  });

  it('binds lock-screen handlers, tracks state, and tears down on stop', () => {
    const fake = new FakeSession();
    (navigator as unknown as Record<string, unknown>).mediaSession = fake;
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
    const calls: string[] = [];
    const b = new MediaSessionBridge({ play: () => calls.push('play'), pause: () => calls.push('pause'), stop: () => calls.push('stop') });
    expect(b.isSupported).toBe(true);
    b.activate({ title: 'Deep focus · BIN 10.00 Hz' });
    expect(fake.playbackState).toBe('playing');
    expect(document.querySelector('audio')).not.toBeNull();
    fake.handlers.get('pause')!();
    fake.handlers.get('play')!();
    fake.handlers.get('stop')!();
    expect(calls).toEqual(['pause', 'play', 'stop']);
    b.pause({ title: 'x' });
    expect(fake.playbackState).toBe('paused');
    b.deactivate();
    expect(fake.playbackState).toBe('none');
    expect(fake.handlers.get('play')).toBeNull();
    expect(document.querySelector('audio')).toBeNull();
  });
});

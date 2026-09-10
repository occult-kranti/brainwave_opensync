/**
 * Media Session + keep-alive bridge (v2).
 *
 * Two platform facts drive this module:
 *  1. Lock-screen / notification / hardware-key transport controls come from
 *     the Media Session API, and most browsers only surface them while an
 *     HTMLMediaElement is playing — a bare Web Audio graph does not count.
 *  2. Mobile browsers throttle or suspend background tabs that are not
 *     "playing media".
 *
 * So while a session runs we loop a tiny silent WAV in an <audio> element
 * (inaudible, ~0.1 s, muted-level PCM) which (a) activates the media
 * session so PLAY / PAUSE / STOP work from the lock screen and (b) marks the
 * tab as playing audio. The element is created lazily and removed on stop.
 * Everything is feature-detected and try/catch-guarded: on platforms without
 * the API this module is a no-op.
 */

export interface MediaSessionHandlers {
  play: () => void;
  pause: () => void;
  stop: () => void;
}

export interface MediaSessionInfo {
  title: string;
  artist?: string;
  album?: string;
}

interface SessionLike {
  metadata: unknown;
  playbackState: 'none' | 'paused' | 'playing';
  setActionHandler(action: string, handler: (() => void) | null): void;
}

/**
 * Keep-alive clip length. Chromium classifies media shorter than 5 s as
 * transient content and refuses to make its media session controllable
 * (no lock-screen / notification / hardware-key controls, and the tab is not
 * treated as persistently playing). 6 s of 8 kHz 8-bit silence is ~48 KB of
 * PCM (~64 KB as a data URI) — cheap, and comfortably past the threshold.
 */
export const KEEPALIVE_SEC = 6;

/** `seconds` of 8 kHz mono 8-bit silence (0x80 = zero for unsigned PCM8) as a data URI. */
export function silentWavDataUri(seconds = KEEPALIVE_SEC, sampleRate = 8000): string {
  const frames = Math.max(1, Math.round(seconds * sampleRate));
  const bytes = new Uint8Array(44 + frames);
  const dv = new DataView(bytes.buffer);
  const str = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) bytes[o + i] = s.charCodeAt(i);
  };
  str(0, 'RIFF');
  dv.setUint32(4, 36 + frames, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true); // PCM
  dv.setUint16(22, 1, true); // mono
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, sampleRate, true); // byte rate (1 byte/frame)
  dv.setUint16(32, 1, true); // block align
  dv.setUint16(34, 8, true); // bits
  str(36, 'data');
  dv.setUint32(40, frames, true);
  bytes.fill(0x80, 44);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return `data:audio/wav;base64,${btoa(bin)}`;
}

function getSession(nav: Navigator | undefined = typeof navigator !== 'undefined' ? navigator : undefined): SessionLike | null {
  try {
    const s = (nav as unknown as { mediaSession?: SessionLike } | undefined)?.mediaSession;
    return s && typeof s.setActionHandler === 'function' ? s : null;
  } catch {
    return null;
  }
}

export class MediaSessionBridge {
  private audio: HTMLAudioElement | null = null;
  private handlersBound = false;
  private lastInfo: string | null = null;
  private lastState: 'playing' | 'paused' | null = null;
  private readonly handlers: MediaSessionHandlers;

  constructor(handlers: MediaSessionHandlers) {
    this.handlers = handlers;
  }

  get isSupported(): boolean {
    return getSession() !== null;
  }

  /** Called on session start / resume: keep-alive on, metadata + handlers set. */
  activate(info: MediaSessionInfo): void {
    if (!this.isSupported) return;
    try {
      const a = this.ensureAudio();
      // Only (re)start the keep-alive when it is not already playing — the
      // metadata may update many times during one session.
      if (a && (a.paused || this.lastState !== 'playing')) {
        const p = a.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            /* autoplay policy — the OS controls simply won't appear */
          });
        }
      }
    } catch {
      /* platforms without media playback */
    }
    this.update(info, 'playing');
  }

  /** Called on pause: keep-alive paused (so the OS shows PLAY), state paused. */
  pause(info: MediaSessionInfo): void {
    try {
      this.audio?.pause();
    } catch {
      /* ignore */
    }
    this.update(info, 'paused');
  }

  /** Called on stop / panic: keep-alive torn down, handlers cleared. */
  deactivate(): void {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.removeAttribute('src');
        this.audio.load();
        this.audio.remove();
      } catch {
        /* ignore */
      }
      this.audio = null;
    }
    this.lastInfo = null;
    this.lastState = null;
    const s = getSession();
    if (!s) return;
    try {
      s.playbackState = 'none';
      s.metadata = null;
      if (this.handlersBound) {
        for (const a of ['play', 'pause', 'stop']) s.setActionHandler(a, null);
        this.handlersBound = false;
      }
    } catch {
      /* ignore */
    }
  }

  private ensureAudio(): HTMLAudioElement | null {
    if (this.audio) return this.audio;
    if (typeof document === 'undefined' || typeof Audio === 'undefined') return null;
    try {
      const a = new Audio(silentWavDataUri());
      a.loop = true;
      a.volume = 0.01;
      a.setAttribute('aria-hidden', 'true');
      a.style.display = 'none';
      document.body.appendChild(a);
      this.audio = a;
      return a;
    } catch {
      return null;
    }
  }

  private update(info: MediaSessionInfo, state: 'playing' | 'paused'): void {
    const s = getSession();
    if (!s) return;
    try {
      const key = `${info.title}\u0000${info.artist ?? ''}\u0000${info.album ?? ''}`;
      if (key !== this.lastInfo) {
        const Meta = (globalThis as { MediaMetadata?: new (init: MediaSessionInfo) => unknown }).MediaMetadata;
        s.metadata = Meta ? new Meta({ title: info.title, artist: info.artist ?? 'Open Sync', album: info.album ?? 'Evidence-honest audio lab' }) : null;
        this.lastInfo = key;
      }
      if (state !== this.lastState) {
        s.playbackState = state;
        this.lastState = state;
      }
      if (!this.handlersBound) {
        s.setActionHandler('play', () => this.handlers.play());
        s.setActionHandler('pause', () => this.handlers.pause());
        s.setActionHandler('stop', () => this.handlers.stop());
        this.handlersBound = true;
      }
    } catch {
      /* a platform that throws on unsupported actions is still fine */
    }
  }
}

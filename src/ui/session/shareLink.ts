/**
 * Shareable session links (v2). The whole front panel — modality, carrier,
 * waveform, phase plan, noise mixer, nature/bowl layers, fade — is encoded
 * into a compact, URL-safe string carried in the hash (`/studio#s=…`), so a
 * link reproduces a setup on another device with no server and no account.
 *
 * Decoding is defensive: every field is validated and clamped to the same
 * ranges the Studio setters enforce, unknown fields are ignored, and any
 * structural problem yields null (the app then keeps its current state).
 */

import type { EntrainmentMode, NatureKind, NoiseColor } from '@/engine';
import type { Waveform } from '../audio/liveEngine';

export const SHARE_VERSION = 2;
export const SHARE_PARAM = 's';

export interface SharePhase {
  durationSec: number;
  beatHz: number;
}

export interface ShareState {
  mode: EntrainmentMode;
  carrierHz: number;
  waveform: Waveform;
  phases: SharePhase[];
  /** Only finite (audible) noise levels are carried. */
  noiseDb: Partial<Record<NoiseColor, number>>;
  noiseOn: boolean;
  nature: { on: boolean; kind: NatureKind; db: number };
  bowl: { on: boolean; baseHz: number; db: number; lock: boolean };
  layersOn: boolean;
  limitMin: number;
  fadeOutSec: number;
  presetName?: string;
}

const MODES: EntrainmentMode[] = ['binaural', 'monaural', 'isochronic'];
const WAVES: Waveform[] = ['sine', 'triangle', 'square'];
const NOISES: NoiseColor[] = ['white', 'pink', 'brown', 'blue', 'violet', 'grey'];
const NATURES: NatureKind[] = ['rain', 'ocean', 'stream', 'fire', 'thunder'];
export const MAX_SHARE_PHASES = 8;

/** Compact wire format: short keys, phases as [sec, hz] pairs. */
interface Wire {
  v: number;
  m: string;
  c: number;
  w: string;
  p: [number, number][];
  n?: Record<string, number>;
  no?: 0 | 1;
  na?: [0 | 1, string, number];
  b?: [0 | 1, number, number, 0 | 1];
  lo?: 0 | 1;
  l?: number;
  f?: number;
  t?: string;
}

function clamp(v: unknown, lo: number, hi: number, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, n));
}

function round(v: number, places: number): number {
  const k = 10 ** places;
  return Math.round(v * k) / k;
}

/** base64url without padding (URL-hash safe, no percent-encoding needed). */
export function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(s: string): string | null {
  try {
    const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeShare(state: ShareState): string {
  const wire: Wire = {
    v: SHARE_VERSION,
    m: state.mode,
    c: round(state.carrierHz, 2),
    w: state.waveform,
    p: state.phases.slice(0, MAX_SHARE_PHASES).map((ph) => [Math.round(ph.durationSec), round(ph.beatHz, 2)]),
  };
  const noise: Record<string, number> = {};
  for (const [k, v] of Object.entries(state.noiseDb)) {
    if (typeof v === 'number' && Number.isFinite(v)) noise[k] = round(v, 1);
  }
  if (Object.keys(noise).length) wire.n = noise;
  if (!state.noiseOn) wire.no = 0;
  if (state.nature.on) wire.na = [1, state.nature.kind, round(state.nature.db, 1)];
  if (state.bowl.on) wire.b = [1, round(state.bowl.baseHz, 2), round(state.bowl.db, 1), state.bowl.lock ? 1 : 0];
  if (!state.layersOn) wire.lo = 0;
  if (state.limitMin !== 90) wire.l = Math.round(state.limitMin);
  if (state.fadeOutSec !== 30) wire.f = Math.round(state.fadeOutSec);
  if (state.presetName) wire.t = state.presetName.slice(0, 60);
  return toBase64Url(JSON.stringify(wire));
}

export function decodeShare(encoded: string): ShareState | null {
  const json = fromBase64Url(encoded.trim());
  if (!json) return null;
  let wire: Partial<Wire>;
  try {
    wire = JSON.parse(json) as Partial<Wire>;
  } catch {
    return null;
  }
  if (!wire || typeof wire !== 'object' || wire.v !== SHARE_VERSION) return null;
  if (!Array.isArray(wire.p) || wire.p.length === 0) return null;
  const mode = MODES.includes(wire.m as EntrainmentMode) ? (wire.m as EntrainmentMode) : 'binaural';
  const waveform = WAVES.includes(wire.w as Waveform) ? (wire.w as Waveform) : 'sine';
  const phases: SharePhase[] = [];
  for (const pair of wire.p.slice(0, MAX_SHARE_PHASES)) {
    if (!Array.isArray(pair) || pair.length < 2) continue;
    const rawD = Number(pair[0]);
    const rawB = Number(pair[1]);
    if (!(rawD > 0) || !(rawB > 0)) continue; // non-positive / NaN pairs are invalid, not clamped
    phases.push({ durationSec: clamp(rawD, 1, 6 * 3600, 60), beatHz: clamp(rawB, 0.1, 80, 10) });
  }
  if (phases.length === 0) return null;
  const noiseDb: Partial<Record<NoiseColor, number>> = {};
  if (wire.n && typeof wire.n === 'object') {
    for (const [k, v] of Object.entries(wire.n)) {
      if (NOISES.includes(k as NoiseColor)) {
        const db = clamp(v, -60, 0, NaN);
        if (Number.isFinite(db)) noiseDb[k as NoiseColor] = db;
      }
    }
  }
  const na = Array.isArray(wire.na) ? wire.na : null;
  const b = Array.isArray(wire.b) ? wire.b : null;
  return {
    mode,
    carrierHz: clamp(wire.c, 20, 1000, 200),
    waveform,
    phases,
    noiseDb,
    noiseOn: wire.no !== 0,
    nature: {
      on: !!na && na[0] === 1 && NATURES.includes(na[1] as NatureKind),
      kind: na && NATURES.includes(na[1] as NatureKind) ? (na[1] as NatureKind) : 'rain',
      db: clamp(na?.[2], -60, 0, -30),
    },
    bowl: {
      on: !!b && b[0] === 1,
      baseHz: clamp(b?.[1], 20, 1000, 136.1),
      db: clamp(b?.[2], -60, 0, -30),
      lock: !!b && b[3] === 1,
    },
    layersOn: wire.lo !== 0,
    limitMin: clamp(wire.l, 1, 90, 90),
    fadeOutSec: clamp(wire.f, 0, 600, 30),
    presetName: typeof wire.t === 'string' && wire.t.trim() ? wire.t.trim().slice(0, 60) : undefined,
  };
}

/** Full share URL for the Studio route (works on any deploy base). */
export function shareUrl(state: ShareState, origin: string, base: string): string {
  const path = `${base.replace(/\/$/, '')}/studio`;
  return `${origin}${path}#${SHARE_PARAM}=${encodeShare(state)}`;
}

/** Extract the share payload from a location hash, if present. */
export function shareFromHash(hash: string): ShareState | null {
  const m = /[#&]s=([A-Za-z0-9_-]+)/.exec(hash);
  return m ? decodeShare(m[1]) : null;
}

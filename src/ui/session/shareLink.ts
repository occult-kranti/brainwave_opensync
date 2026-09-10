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

import type { BowlMaterial, BowlStrike, EntrainmentMode, NatureKind, NoiseColor } from '@/engine';
import { BOWL_MATERIAL_IDS, BOWL_STRIKE_IDS, MAX_BOWLS } from '@/engine';
import type { Waveform } from '../audio/liveEngine';
import { MAX_SESSION_MIN } from '@/safety/governor';

export const SHARE_VERSION = 2;
export const SHARE_PARAM = 's';

export interface SharePhase {
  durationSec: number;
  beatHz: number;
}

export interface ShareBowl {
  on: boolean;
  material: BowlMaterial;
  strike: BowlStrike;
  baseHz: number;
  db: number;
  pan: number;
  restrikeSec: number;
  lock: boolean;
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
  /** The bowl set; only bowls that are on (and audible) travel in a link. */
  bowls: ShareBowl[];
  /** Interval bell period in minutes (0 = off). */
  bellEveryMin: number;
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
export const MAX_SHARE_BOWLS = MAX_BOWLS;
const RESTRIKES = [4, 6, 8, 12, 16];

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
  /** v2.0 single bowl: [on, hz, db, lock] — still decoded. */
  b?: [0 | 1, number, number, 0 | 1];
  /** v2.1 bowl set: [hz, db, materialIdx, strikeIdx, pan, restrikeSec, lock][] (only bowls that are on). */
  bs?: [number, number, number, number, number, number, 0 | 1][];
  /** Interval bell, minutes. */
  be?: number;
  lo?: 0 | 1;
  l?: number;
  f?: number;
  t?: string;
}

/** Strict: only finite JSON numbers count — null/strings/booleans fall back (never coerce null → 0 dB). */
function clamp(v: unknown, lo: number, hi: number, fallback: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  return Math.min(hi, Math.max(lo, v));
}

/** Truncate by code points so a surrogate pair is never split into a lone surrogate. */
export function truncateCodePoints(s: string, max: number): string {
  return Array.from(s).slice(0, max).join('');
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
  // A layer whose fader sits at −∞ is simply off — JSON has no −Infinity.
  if (state.nature.on && Number.isFinite(state.nature.db)) wire.na = [1, state.nature.kind, round(state.nature.db, 1)];
  const bowls = state.bowls.filter((b) => b.on && Number.isFinite(b.db)).slice(0, MAX_SHARE_BOWLS);
  if (bowls.length) {
    wire.bs = bowls.map((b) => [
      round(b.baseHz, 2),
      round(b.db, 1),
      Math.max(0, BOWL_MATERIAL_IDS.indexOf(b.material)),
      Math.max(0, BOWL_STRIKE_IDS.indexOf(b.strike)),
      round(b.pan, 2),
      Math.round(b.restrikeSec),
      b.lock ? 1 : 0,
    ]);
  }
  if (state.bellEveryMin > 0) wire.be = Math.round(state.bellEveryMin);
  if (!state.layersOn) wire.lo = 0;
  if (state.limitMin !== 90) wire.l = Math.round(state.limitMin);
  if (state.fadeOutSec !== 30) wire.f = Math.round(state.fadeOutSec);
  if (state.presetName) wire.t = truncateCodePoints(state.presetName, 60);
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
  const bowls: ShareBowl[] = [];
  if (Array.isArray(wire.bs)) {
    for (const row of wire.bs.slice(0, MAX_SHARE_BOWLS)) {
      if (!Array.isArray(row)) continue;
      const mi = clamp(row[2], 0, BOWL_MATERIAL_IDS.length - 1, 0);
      const si = clamp(row[3], 0, BOWL_STRIKE_IDS.length - 1, 0);
      const rs = clamp(row[5], 4, 16, 8);
      bowls.push({
        on: true,
        material: BOWL_MATERIAL_IDS[Math.round(mi)],
        strike: BOWL_STRIKE_IDS[Math.round(si)],
        baseHz: clamp(row[0], 20, 1000, 136.1),
        db: clamp(row[1], -60, 0, -30),
        pan: clamp(row[4], -1, 1, 0),
        restrikeSec: RESTRIKES.reduce((best, c) => (Math.abs(c - rs) < Math.abs(best - rs) ? c : best), 8),
        lock: row[6] === 1,
      });
    }
  } else if (b && b[0] === 1) {
    bowls.push({
      on: true,
      material: 'tibetan-bronze',
      strike: 'mallet',
      baseHz: clamp(b[1], 20, 1000, 136.1),
      db: clamp(b[2], -60, 0, -30),
      pan: 0,
      restrikeSec: 8,
      lock: b[3] === 1,
    });
  }
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
    bowls,
    bellEveryMin: clamp(wire.be, 0, 60, 0),
    layersOn: wire.lo !== 0,
    limitMin: clamp(wire.l, 1, MAX_SESSION_MIN, 90),
    fadeOutSec: clamp(wire.f, 0, 600, 30),
    presetName: typeof wire.t === 'string' && wire.t.trim() ? truncateCodePoints(wire.t.trim(), 60) : undefined,
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

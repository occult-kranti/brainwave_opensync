/**
 * Everyday intents — four one-tap setups over the shared session layer.
 * `applyIntent` is a pure function over the session ACTIONS: it loads the
 * graded preset and sets noise / nature / bowls / bell / limit / fade, then
 * calls start(). Nothing audio-related lives here.
 */

import { getPresetById, type Preset } from '@/data/presets';
import { BOWL_SETS, type NatureKind, type NoiseColor } from '@/engine';
import { ALL_NOISE_OFF } from '@/ui/session/sessionDefaults';
import { bowlSetToLayers, type BowlLayer } from '@/ui/session/sessionMath';
import type { SessionActions } from '@/ui/session/types';

export type IntentId = 'sleep' | 'focus' | 'relax' | 'meditate';

export interface Intent {
  id: IntentId;
  presetId: string;
  durationMin: number;
  fadeOutSec: number;
  noise: { color: NoiseColor; db: number } | null;
  nature: { kind: NatureKind; db: number } | null;
  bowls: { setId: string; db: number } | null;
  bellEveryMin: number;
}

export const INTENTS: readonly Intent[] = [
  { id: 'sleep', presetId: 'sleep-slow-wave-cue', durationMin: 45, fadeOutSec: 600, noise: { color: 'brown', db: -30 }, nature: null, bowls: null, bellEveryMin: 0 },
  { id: 'focus', presetId: 'focus-alpha-flow', durationMin: 30, fadeOutSec: 30, noise: null, nature: null, bowls: null, bellEveryMin: 0 },
  { id: 'relax', presetId: 'relax-alpha-ease', durationMin: 30, fadeOutSec: 120, noise: { color: 'pink', db: -34 }, nature: { kind: 'rain', db: -30 }, bowls: null, bellEveryMin: 0 },
  { id: 'meditate', presetId: 'meditate-theta-garden', durationMin: 20, fadeOutSec: 60, noise: null, nature: null, bowls: { setId: 'himalayan-trio', db: -28 }, bellEveryMin: 10 },
];

export const INTENT_IDS: readonly IntentId[] = INTENTS.map((i) => i.id);

export function isIntentId(v: unknown): v is IntentId {
  return typeof v === 'string' && (INTENT_IDS as readonly string[]).includes(v);
}

export function intentById(id: IntentId): Intent {
  const found = INTENTS.find((i) => i.id === id);
  if (!found) throw new Error(`Unknown intent: ${id}`);
  return found;
}

/** The graded data-layer preset behind an intent (the four ids are static). */
export function intentPreset(intent: Intent): Preset {
  const preset = getPresetById(intent.presetId);
  if (!preset) throw new Error(`Missing preset for intent ${intent.id}: ${intent.presetId}`);
  return preset;
}

/** Reverse lookup from the session's presetName (the front panel persists it across reloads). */
export function intentFromPresetName(presetName: string | null): Intent | null {
  if (!presetName) return null;
  return INTENTS.find((i) => intentPreset(i).title === presetName) ?? null;
}

/** A bowl set as fresh session rows, every bowl at `db`. */
export function bowlSetLayers(setId: string, db: number): BowlLayer[] {
  const set = BOWL_SETS.find((s) => s.id === setId);
  if (!set) return [];
  return bowlSetToLayers(set).map((b) => ({ ...b, db }));
}

/** The slice of the session API an intent needs. */
export type IntentSession = Pick<
  SessionActions,
  'loadPreset' | 'setNoiseDb' | 'setNoiseOn' | 'setNature' | 'setBowls' | 'setBellEveryMin' | 'setLimitMin' | 'setFadeOutSec' | 'setLayersOn' | 'start'
>;

export const NOISE_COLORS: readonly NoiseColor[] = Object.keys(ALL_NOISE_OFF) as NoiseColor[];

/**
 * Apply an intent and start. Returns start()'s verdict: false means the
 * session layer raised the advisory or filled `startBlocked`.
 */
export function applyIntent(session: IntentSession, intent: Intent): boolean {
  session.loadPreset(intentPreset(intent));
  for (const color of NOISE_COLORS) {
    session.setNoiseDb(color, intent.noise && intent.noise.color === color ? intent.noise.db : -Infinity);
  }
  session.setNoiseOn(true);
  session.setNature(intent.nature ? { on: true, kind: intent.nature.kind, db: intent.nature.db } : { on: false });
  session.setBowls(intent.bowls ? bowlSetLayers(intent.bowls.setId, intent.bowls.db) : []);
  session.setBellEveryMin(intent.bellEveryMin);
  session.setLimitMin(intent.durationMin);
  session.setFadeOutSec(intent.fadeOutSec);
  session.setLayersOn(true);
  return session.start();
}

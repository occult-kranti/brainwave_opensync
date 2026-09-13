/** Portable preset mixer data. Missing profiles preserve legacy load behavior. */
import { BOWL_MATERIAL_IDS, BOWL_RESTRIKE_CHOICES, BOWL_STRIKE_IDS, MAX_BOWLS } from '@/engine';
import type { BowlMaterial, BowlStrike, NatureKind, NoiseColor } from '@/engine';

export interface PresetBowl {
  on: boolean;
  material: BowlMaterial;
  strike: BowlStrike;
  baseHz: number;
  db: number;
  pan: number;
  restrikeSec: number;
  lock: boolean;
}

export interface PresetMix {
  waveform: 'sine' | 'triangle' | 'square';
  /** Only finite noise levels are stored; omitted colors are off. */
  noiseDb: Partial<Record<NoiseColor, number>>;
  noiseOn: boolean;
  nature: { on: boolean; kind: NatureKind; db: number };
  bowls: PresetBowl[];
  bellEveryMin: number;
  layersOn: boolean;
  /** Saved fader ceiling. Loading may lower this further, never raise it. */
  volumeDb?: number;
}

export const CLEAN_PRESET_MIX: PresetMix = {
  waveform: 'sine', noiseDb: {}, noiseOn: false,
  nature: { on: false, kind: 'rain', db: -30 }, bowls: [],
  bellEveryMin: 0, layersOn: true,
};

const NOISES: readonly NoiseColor[] = ['white', 'pink', 'brown', 'blue', 'violet', 'grey'];
const NATURES: readonly NatureKind[] = ['rain', 'ocean', 'stream', 'fire', 'thunder'];
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const number = (v: unknown, min: number, max: number, fallback: number): number => finite(v) ? Math.max(min, Math.min(max, v)) : fallback;

/** Unknown serialized fields never become live graph values or render lengths. */
export function sanitizePresetMix(value: unknown): PresetMix | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  const noise = raw.noiseDb && typeof raw.noiseDb === 'object' ? raw.noiseDb as Record<string, unknown> : {};
  const noiseDb: Partial<Record<NoiseColor, number>> = {};
  for (const color of NOISES) if (finite(noise[color])) noiseDb[color] = number(noise[color], -60, 0, -60);
  const nature = raw.nature && typeof raw.nature === 'object' ? raw.nature as Record<string, unknown> : {};
  const bowls: PresetBowl[] = [];
  for (const value of (Array.isArray(raw.bowls) ? raw.bowls : []).slice(0, MAX_BOWLS)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const bowl = value as Record<string, unknown>;
    if (!finite(bowl.baseHz)) continue;
    const requestedInterval = number(bowl.restrikeSec, 4, 16, 12);
    bowls.push({
      on: bowl.on === true && finite(bowl.db),
      material: BOWL_MATERIAL_IDS.includes(bowl.material as BowlMaterial) ? bowl.material as BowlMaterial : 'crystal-quartz',
      strike: BOWL_STRIKE_IDS.includes(bowl.strike as BowlStrike) ? bowl.strike as BowlStrike : 'soft',
      baseHz: number(bowl.baseHz, 20, 1000, 110), db: number(bowl.db, -60, 0, -60),
      pan: number(bowl.pan, -1, 1, 0), lock: bowl.lock === true,
      restrikeSec: BOWL_RESTRIKE_CHOICES.reduce((best, choice) => Math.abs(choice - requestedInterval) < Math.abs(best - requestedInterval) ? choice : best, 12),
    });
  }
  return {
    waveform: raw.waveform === 'triangle' || raw.waveform === 'square' ? raw.waveform : 'sine',
    noiseDb, noiseOn: raw.noiseOn === true,
    nature: {
      on: nature.on === true && finite(nature.db),
      kind: NATURES.includes(nature.kind as NatureKind) ? nature.kind as NatureKind : 'rain',
      db: number(nature.db, -60, 0, -30),
    },
    bowls, bellEveryMin: Math.round(number(raw.bellEveryMin, 0, 60, 0)),
    layersOn: raw.layersOn !== false,
    ...(finite(raw.volumeDb) ? { volumeDb: number(raw.volumeDb, -60, 0, -60) } : {}),
  };
}

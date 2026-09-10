/**
 * Session defaults and fixed choice tables (pure data, no React).
 */

import type { NoiseColor } from '@/engine';
import { INFANT_CEILING_DBA } from '@/safety/dose';
import { DBFS_TO_DBA_OFFSET, newUiPhase, type UiPhase } from './sessionMath';
import type { FrontPanel } from './sessionPersistence';

/** Sleep-fade choices offered by the Studio (seconds; 0 = hard stop at the limit). */
export const FADE_OUT_CHOICES: readonly { sec: number; label: string }[] = [
  { sec: 0, label: 'OFF' },
  { sec: 30, label: '30 S' },
  { sec: 120, label: '2 MIN' },
  { sec: 300, label: '5 MIN' },
  { sec: 600, label: '10 MIN' },
];

export const DEFAULT_PHASES: UiPhase[] = [newUiPhase(8 * 60, 10), newUiPhase(20 * 60, 6), newUiPhase(62 * 60, 4)];

export const ALL_NOISE_OFF: Record<NoiseColor, number> = {
  white: -Infinity,
  pink: -Infinity,
  brown: -Infinity,
  blue: -Infinity,
  violet: -Infinity,
  grey: -Infinity,
};

/** Loudest volume permitted in infant mode: 50 dBA at the crib ⇒ ≤ −26 dBFS on the headphone estimate. */
export const INFANT_MAX_VOLUME_DB = INFANT_CEILING_DBA - DBFS_TO_DBA_OFFSET;

export const DEFAULT_FRONT_PANEL: FrontPanel = {
  mode: 'binaural',
  carrierHz: 200,
  beatHz: 10,
  waveform: 'sine',
  phaseLock: true,
  gateDuty: 0.5,
  gateShape: 'raised-cosine',
  limitMin: 90,
  volumeDb: -12,
  noiseDb: ALL_NOISE_OFF,
  noiseOn: true,
  nature: { on: false, kind: 'rain', db: -30 },
  bowl: { on: false, baseHz: 136.1, db: -30, lock: false },
  layersOn: true,
  phases: DEFAULT_PHASES,
  presetName: null,
  presetGrade: null,
  fadeOutSec: 30,
  infantMode: false,
};

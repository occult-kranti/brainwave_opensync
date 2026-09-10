/**
 * Stimulus preview planning for the Experiment Lab: play the shipped
 * reference WAV when one exists in public/stimulus_pack, otherwise render the
 * experiment's reference stimulus through the engine preview path. A preview
 * is never an experiment run.
 */

import type { Phase as EnginePhase } from '@/engine';
import { assetUrl } from '@/lib/assetUrl';
import { PACK_FILES } from './stimulusPack';
import type { PackFile } from './types';

// ---------------------------------------------------------------------------
// Stimulus preview (S10.3): play the shipped reference WAV when one exists in
// /public/stimulus_pack, otherwise render the experiment's reference stimulus
// through the engine preview path. A preview is never an experiment run.
// ---------------------------------------------------------------------------

export type StimulusPlan =
  | { kind: 'wav'; url: string; file: string }
  | { kind: 'render'; phase: EnginePhase };

/** Derive the reference stimulus from the pack filename grammar (ospx_xNN_<kind>_c<carrier>_d<beat>_…). */
function referencePhaseFor(f: PackFile): EnginePhase {
  const m = f.file.match(/_(bb|mb|iso)_c([\d.]+)_d([\d.]+)_/);
  if (m) {
    const mode = m[1] === 'bb' ? 'binaural' : m[1] === 'mb' ? 'monaural' : 'isochronic';
    return { durationSec: 10, carrierHz: Number(m[2]), beatHz: Number(m[3]), mode, gainDb: -20 };
  }
  const tone = f.file.match(/_tone_([\d.]+)hz/i);
  if (tone) {
    return { durationSec: 10, carrierHz: Number(tone[1]), beatHz: 0, mode: 'monaural', gainDb: -20 };
  }
  // Canonical screening stimulus — matches the pack's 400 Hz / Δf 10 reference.
  return { durationSec: 10, carrierHz: 400, beatHz: 10, mode: 'binaural', gainDb: -20 };
}

/** Preview plan for an experiment: shipped WAV when listed, else engine render. */
export function stimulusPlan(expId: string): StimulusPlan | null {
  const files = PACK_FILES.filter((f) => f.serves.includes(expId));
  if (files.length === 0) return null;
  const rendered = files.find((f) => f.url);
  if (rendered?.url) return { kind: 'wav', url: assetUrl(rendered.url), file: rendered.file };
  return { kind: 'render', phase: referencePhaseFor(files[0]) };
}

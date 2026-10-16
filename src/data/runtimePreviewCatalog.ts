import { FRONTIER_PRESETS } from './frontierPresets';

export interface RuntimePreviewEntry {
  id: string;
  mode: 'engine';
  /** Existing SessionProvider previewPhases limit; not a second playback path. */
  maxSeconds: 10;
  sampleRate: 48000;
  reason: string;
}

/**
 * Explicit additions that use the existing bounded engine preview path.
 * This is separate from the immutable file manifest: it adds no WAV assets,
 * preserves all 159 shipped files and keeps their 60 MB budget unchanged.
 * Missing catalog IDs outside this declaration remain integrity failures.
 */
export const RUNTIME_PREVIEW_CATALOG: readonly RuntimePreviewEntry[] = FRONTIER_PRESETS.map(({ id }) => ({
  id, mode: 'engine', maxSeconds: 10, sampleRate: 48000,
  reason: 'Render the opening on demand through SessionProvider; preserve existing preview files and the 60 MB asset limit.',
}));

const runtimeIds = new Set(RUNTIME_PREVIEW_CATALOG.map(entry => entry.id));
export const isRuntimePreview = (id: string): boolean => runtimeIds.has(id);

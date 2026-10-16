#!/usr/bin/env node
/**
 * Render pre-rendered preset preview WAVs into public/previews/.
 *
 * For every preset in src/data/presets.ts, renders the FIRST ~12 seconds of
 * its phase plan through the pure engine (renderSession) and encodes a
 * 48 kHz 16-bit stereo WAV (encodeWav) at public/previews/<preset-id>.wav,
 * plus a manifest.json pinning { id, sha256, bytes } per file.
 *
 * Size guard: the total must stay under 60 MB. With 46 presets, 12 s of
 * stereo PCM16 would be ~104 MB, so the per-file duration is auto-reduced to
 * the largest whole second that fits the guard (budget-fit; the chosen value
 * is logged and recorded in the manifest as `seconds`, with `targetSeconds`
 * keeping the 12 s intent).
 *
 * Run: `node scripts/render-previews.mjs` — plain node; the TS engine and
 * preset data are bundled on the fly with esbuild (already in node_modules
 * via vite), so no vite-node/tsx shim is needed.
 *
 * Preserve an existing catalog and append only missing files:
 *   node scripts/render-previews.mjs --append --sample-rate=12000 --seconds=2
 * Add --dry-run to validate inputs, existing files and the proposed budget
 * without rendering or writing previews. Overrides apply only to new files;
 * each new manifest entry records its actual sampleRate, seconds and note.
 */

import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'previews');

const SAMPLE_RATE = 48000;
const CHANNELS = 2; // stereo (binaural presets need independent L/R)
const BYTES_PER_SAMPLE = 2; // pcm16
const WAV_HEADER_BYTES = 44;
const TARGET_SEC = 12;
const MAX_TOTAL_BYTES = 60_000_000; // hard guard: total < 60 MB
const XFADE_SEC = 0.5; // mirrors the app's engine preview path
const MASTER_GAIN_DB = -6;

function parseOptions(args) {
  const options = { append: false, dryRun: false, sampleRate: SAMPLE_RATE, seconds: undefined };
  const seen = new Set();
  for (const arg of args) {
    const [key, raw] = arg.split('=');
    if (seen.has(key)) throw new Error(`Duplicate argument: ${key}`);
    seen.add(key);
    if (arg === '--append') options.append = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (key === '--sample-rate' && /^\d+$/.test(raw ?? '') && arg === `${key}=${raw}`) {
      options.sampleRate = Number(raw);
      if (options.sampleRate < 8000 || options.sampleRate > 96000) throw new Error('Sample rate must be 8000..96000 Hz.');
    } else if (key === '--seconds' && /^\d+$/.test(raw ?? '') && arg === `${key}=${raw}`) {
      options.seconds = Number(raw);
      if (options.seconds < 1 || options.seconds > TARGET_SEC) throw new Error(`Seconds must be 1..${TARGET_SEC}.`);
    } else throw new Error(`Unknown or invalid argument: ${arg}`);
  }
  if (!options.append && (options.dryRun || seen.has('--sample-rate') || seen.has('--seconds'))) {
    throw new Error('Preview overrides and --dry-run require --append; the default rebuild contract is unchanged.');
  }
  return options;
}

const options = parseOptions(process.argv.slice(2));

// ---------------------------------------------------------------------------
// Bundle the TS engine + preset data with esbuild, then import the bundle.
// ---------------------------------------------------------------------------
const bundlePath = path.join(os.tmpdir(), `open-sync-render-previews-${process.pid}.mjs`);
await build({
  stdin: {
    contents: [
      `export { renderSession, encodeWav, checkPhaseGuardrails } from ${JSON.stringify(path.join(ROOT, 'src/engine/index.ts'))};`,
      `export { PRESETS } from ${JSON.stringify(path.join(ROOT, 'src/data/presets.ts'))};`,
      `export { presetPreviewPhases } from ${JSON.stringify(path.join(ROOT, 'src/ui/session/sessionMath.ts'))};`,
    ].join('\n'),
    resolveDir: ROOT,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: bundlePath,
  logLevel: 'silent',
});
const { renderSession, encodeWav, checkPhaseGuardrails, PRESETS, presetPreviewPhases } = await import(pathToFileURL(bundlePath).href);
rmSync(bundlePath, { force: true });

// ---------------------------------------------------------------------------
// Preset → engine phases (first `maxSec` of the plan). Mirrors the app's
// presetPreviewPhases() but honors each phase's own modality. 'noise'-mode
// presets have no engine modality (and the live engine plays them as the
// steady carrier), so they render as a beat-0 monaural tone — identical to
// what loading the preset in Studio produces.
// ---------------------------------------------------------------------------
function enginePhases(preset, maxSec) {
  if (preset.spec.mix) return presetPreviewPhases(preset, maxSec);
  const out = [];
  let remaining = maxSec;
  for (const p of preset.spec.phases) {
    if (remaining <= 0) break;
    const d = Math.min(p.durationSec, remaining);
    if (d <= 0) continue;
    const mode = p.mode ?? 'binaural';
    out.push({
      durationSec: d,
      carrierHz: p.carrierHz,
      beatHz: mode === 'noise' ? 0 : p.beatHz,
      mode: mode === 'noise' ? 'monaural' : mode,
      gainDb: Math.min(0, p.gainDbFs),
    });
    remaining -= d;
  }
  return out;
}

// Append mode is deliberately separate from the legacy rebuild: no existing
// audio, entry metadata or manifest defaults are regenerated in this path.
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const sha256Of = (bytes) => createHash('sha256').update(bytes).digest('hex');
const serializeManifest = (manifest) => JSON.stringify(manifest, null, 2) + '\n';
const positive = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

function validateWav(bytes, sampleRate, seconds, label) {
  const frames = seconds * sampleRate;
  if (!Number.isSafeInteger(frames) || bytes.length !== WAV_HEADER_BYTES + frames * CHANNELS * BYTES_PER_SAMPLE ||
      bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE' ||
      bytes.toString('ascii', 12, 16) !== 'fmt ' || bytes.readUInt32LE(16) !== 16 ||
      bytes.readUInt16LE(20) !== 1 || bytes.readUInt16LE(22) !== CHANNELS ||
      bytes.readUInt32LE(24) !== sampleRate || bytes.readUInt32LE(28) !== sampleRate * CHANNELS * BYTES_PER_SAMPLE ||
      bytes.readUInt16LE(32) !== CHANNELS * BYTES_PER_SAMPLE || bytes.readUInt16LE(34) !== 16 ||
      bytes.toString('ascii', 36, 40) !== 'data' || bytes.readUInt32LE(40) !== bytes.length - WAV_HEADER_BYTES ||
      bytes.readUInt32LE(4) !== bytes.length - 8) throw new Error(`${label}: WAV header/length disagrees with metadata.`);
}

function checkedExistingManifest() {
  const filename = path.join(OUT_DIR, 'manifest.json');
  if (!existsSync(filename) || !lstatSync(filename).isFile()) throw new Error('Append requires an existing regular manifest.json.');
  const original = readFileSync(filename, 'utf8');
  const manifest = JSON.parse(original);
  if (manifest.version !== 1 || manifest.format !== 'pcm16-stereo' || !Number.isSafeInteger(manifest.sampleRate) ||
      !positive(manifest.sampleRate) || !positive(manifest.seconds) || !positive(manifest.targetSeconds) ||
      !Array.isArray(manifest.files)) throw new Error('Append requires a valid PCM16 stereo manifest.');
  const ids = new Set();
  let totalBytes = 0;
  for (const entry of manifest.files) {
    if (!entry || typeof entry.id !== 'string' || !ID_PATTERN.test(entry.id) || ids.has(entry.id) || !/^[a-f0-9]{64}$/.test(entry.sha256) ||
        !Number.isSafeInteger(entry.bytes) || entry.bytes < WAV_HEADER_BYTES) throw new Error('Invalid or duplicate existing manifest entry.');
    const sampleRate = entry.sampleRate ?? manifest.sampleRate;
    const seconds = entry.seconds ?? manifest.seconds;
    if (!Number.isSafeInteger(sampleRate) || !positive(sampleRate) || !positive(seconds) ||
        (entry.sampleRate !== undefined && entry.sampleRate !== sampleRate) ||
        (entry.seconds !== undefined && entry.seconds !== seconds)) throw new Error(`${entry.id}: invalid render metadata.`);
    const wavPath = path.join(OUT_DIR, `${entry.id}.wav`);
    if (!existsSync(wavPath) || !lstatSync(wavPath).isFile()) throw new Error(`${entry.id}: missing or non-regular WAV.`);
    const bytes = readFileSync(wavPath);
    if (bytes.length !== entry.bytes || sha256Of(bytes) !== entry.sha256) throw new Error(`${entry.id}: existing size/hash mismatch; refusing append.`);
    validateWav(bytes, sampleRate, seconds, entry.id);
    ids.add(entry.id);
    totalBytes += bytes.length;
  }
  const wavNames = readdirSync(OUT_DIR).filter((name) => name.endsWith('.wav'));
  if (wavNames.length !== ids.size || wavNames.some((name) => !ids.has(name.slice(0, -4)))) {
    throw new Error('Untracked WAV files exist; append will not overwrite or remove them.');
  }
  if (totalBytes !== manifest.totalBytes) throw new Error('Existing manifest totalBytes is inconsistent.');
  if (totalBytes + Buffer.byteLength(original) >= MAX_TOTAL_BYTES) throw new Error('Existing preview directory exceeds the total budget.');
  return { manifest, original, ids };
}

function appendPreviews() {
  const { manifest, original, ids } = checkedExistingManifest();
  const catalogIds = new Set();
  for (const preset of PRESETS) {
    if (typeof preset.id !== 'string' || !ID_PATTERN.test(preset.id) || catalogIds.has(preset.id)) throw new Error('Invalid or duplicate preset ID.');
    catalogIds.add(preset.id);
  }
  if ([...ids].some((id) => !catalogIds.has(id))) throw new Error('Existing previews are absent from the catalog; append will not remove them.');
  const pending = PRESETS.filter((preset) => !ids.has(preset.id));
  const sampleRate = options.sampleRate;
  const seconds = options.seconds ?? manifest.seconds;
  const note = `Appended ${seconds}s at ${sampleRate} Hz; per-file metadata overrides manifest defaults and preserves existing previews.`;
  const plans = pending.map((preset) => {
    if (existsSync(path.join(OUT_DIR, `${preset.id}.wav`))) throw new Error(`${preset.id}: refusing to overwrite an existing WAV.`);
    if (!Array.isArray(preset.spec?.phases) || !preset.spec.phases.length || preset.spec.phases.some((phase) =>
      !positive(phase.durationSec) || !positive(phase.carrierHz) || !Number.isFinite(phase.beatHz) || phase.beatHz < 0 ||
      !Number.isFinite(phase.gainDbFs) || phase.gainDbFs > 0 || !['binaural', 'monaural', 'isochronic', 'noise'].includes(phase.mode ?? 'binaural'))) {
      throw new Error(`${preset.id}: invalid source phase specification.`);
    }
    const phases = enginePhases(preset, seconds);
    if (!phases.length || phases.some((phase) => !positive(phase.durationSec) || checkPhaseGuardrails(phase, sampleRate).length)) {
      throw new Error(`${preset.id}: rendered phase specification fails engine preflight.`);
    }
    // Lower-rate append is for explicitly clean sine examples only. No
    // unexamined noise, harmonic waveform, bowl or nature spectrum is downsampled.
    const mix = preset.spec.mix;
    if (sampleRate < SAMPLE_RATE && (!mix || mix.waveform !== 'sine' || mix.noiseOn || mix.nature?.on ||
      mix.bowls?.some((bowl) => bowl.on) || mix.bellEveryMin !== 0 || mix.layersOn !== true ||
      phases.some((phase) => phase.mode !== 'binaural' || phase.noise || phase.bowl || phase.bowls?.length || phase.nature))) {
      throw new Error(`${preset.id}: reduced-rate append requires a clean binaural sine recipe.`);
    }
    const requestedFrames = Math.round(phases.reduce((sum, phase) => sum + phase.durationSec, 0) * sampleRate);
    return { preset, phases, estimatedBytes: requestedFrames * CHANNELS * BYTES_PER_SAMPLE + WAV_HEADER_BYTES };
  });
  const estimatedEntries = plans.map(({ preset, estimatedBytes }) => ({ id: preset.id, sha256: '0'.repeat(64), bytes: estimatedBytes, sampleRate, seconds, note }));
  const estimatedManifest = { ...manifest, files: [...manifest.files, ...estimatedEntries], totalBytes: manifest.totalBytes + plans.reduce((sum, plan) => sum + plan.estimatedBytes, 0) };
  const estimatedTotal = estimatedManifest.totalBytes + Buffer.byteLength(serializeManifest(estimatedManifest));
  if (estimatedTotal >= MAX_TOTAL_BYTES) throw new Error(`Append budget preflight failed: ${estimatedTotal} bytes >= ${MAX_TOTAL_BYTES}; no previews written.`);
  if (options.dryRun || !plans.length) {
    console.log(`${options.dryRun ? 'Dry run' : 'No new presets'}: ${ids.size} existing previews verified; ${plans.length} pending; proposed total ${estimatedTotal} bytes < ${MAX_TOTAL_BYTES}. No previews written.`);
    return;
  }

  // Render in memory; inspect complete output and the exact manifest budget
  // before creating any new preview file.
  const outputs = plans.map(({ preset, phases }) => {
    const rendered = renderSession({ name: `preview:${preset.id}`, phases, crossfadeSec: XFADE_SEC, masterGainDb: MASTER_GAIN_DB, sampleRate });
    if (rendered.warnings.length || !rendered.left.length || rendered.left.length !== rendered.right.length ||
      !rendered.left.every(Number.isFinite) || !rendered.right.every(Number.isFinite) || rendered.manifest.peak <= 0 || rendered.manifest.peak > 1) {
      throw new Error(`${preset.id}: invalid rendered audio; no previews written.`);
    }
    const actualSeconds = rendered.left.length / sampleRate;
    const wav = Buffer.from(encodeWav(rendered.left, rendered.right, sampleRate, 'pcm16'));
    validateWav(wav, sampleRate, actualSeconds, preset.id);
    const entry = { id: preset.id, sha256: sha256Of(wav), bytes: wav.length, sampleRate, seconds: actualSeconds, note };
    return { wav, entry };
  });
  const updated = { ...manifest, files: [...manifest.files, ...outputs.map(({ entry }) => entry)], totalBytes: manifest.totalBytes + outputs.reduce((sum, { wav }) => sum + wav.length, 0) };
  const json = serializeManifest(updated);
  const grandTotal = updated.totalBytes + Buffer.byteLength(json);
  if (grandTotal >= MAX_TOTAL_BYTES) throw new Error(`Append budget failed: ${grandTotal} bytes >= ${MAX_TOTAL_BYTES}; no previews written.`);
  const latest = checkedExistingManifest();
  if (latest.original !== original) throw new Error('Manifest changed during append; no previews written.');

  const created = [];
  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  const temporaryManifest = path.join(OUT_DIR, `.manifest-${process.pid}.tmp`);
  let temporaryCreated = false;
  try {
    for (const { wav, entry } of outputs) {
      const filename = path.join(OUT_DIR, `${entry.id}.wav`);
      writeFileSync(filename, wav, { flag: 'wx' });
      created.push(filename);
    }
    writeFileSync(temporaryManifest, json, { flag: 'wx' });
    temporaryCreated = true;
    if (readFileSync(manifestPath, 'utf8') !== original) throw new Error('Manifest changed before commit.');
    renameSync(temporaryManifest, manifestPath);
    temporaryCreated = false;
  } catch (error) {
    for (const filename of created) rmSync(filename, { force: true });
    if (temporaryCreated) rmSync(temporaryManifest, { force: true });
    throw error;
  }
  for (const { entry } of outputs) console.log(`${entry.id}.wav: ${entry.bytes} bytes, ${entry.sampleRate} Hz, ${entry.seconds}s, sha256:${entry.sha256}`);
  console.log(`Appended ${outputs.length} previews; preserved ${ids.size}; total including manifest ${grandTotal} bytes < ${MAX_TOTAL_BYTES}.`);
}

if (options.append) {
  appendPreviews();
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Budget-fit duration: largest whole second keeping the total < 60 MB.
// ---------------------------------------------------------------------------
const bytesPerSec = SAMPLE_RATE * CHANNELS * BYTES_PER_SAMPLE;
const perFileBytes = (sec) => sec * bytesPerSec + WAV_HEADER_BYTES;
let seconds = TARGET_SEC;
while (seconds > 1 && PRESETS.length * perFileBytes(seconds) > MAX_TOTAL_BYTES - 64 * 1024) seconds--;
if (seconds < TARGET_SEC) {
  console.log(
    `size guard: ${PRESETS.length} presets × ${TARGET_SEC}s stereo PCM16 would exceed 60 MB — ` +
      `rendering ${seconds}s per file instead (budget-fit).`,
  );
}

// ---------------------------------------------------------------------------
// Render + encode + hash + write.
// ---------------------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true });
const files = [];
let totalBytes = 0;
for (const preset of PRESETS) {
  const phases = enginePhases(preset, seconds);
  if (phases.length === 0) {
    console.warn(`SKIP ${preset.id}: no renderable phases`);
    continue;
  }
  const rendered = renderSession({
    name: `preview:${preset.id}`,
    phases,
    crossfadeSec: XFADE_SEC,
    masterGainDb: MASTER_GAIN_DB,
    sampleRate: SAMPLE_RATE,
  });
  const wav = encodeWav(rendered.left, rendered.right, SAMPLE_RATE, 'pcm16');
  const bytes = wav.byteLength;
  const sha256 = createHash('sha256').update(wav).digest('hex');
  writeFileSync(path.join(OUT_DIR, `${preset.id}.wav`), wav);
  files.push({ id: preset.id, sha256, bytes });
  totalBytes += bytes;
  console.log(`${preset.id}.wav  ${(bytes / 1_048_576).toFixed(2)} MiB  sha256:${sha256.slice(0, 12)}…`);
}

// Drop stale previews not produced by this run.
const live = new Set(files.map((f) => `${f.id}.wav`));
for (const f of readdirSync(OUT_DIR)) {
  if (f.endsWith('.wav') && !live.has(f)) {
    rmSync(path.join(OUT_DIR, f));
    console.log(`removed stale ${f}`);
  }
}

const manifest = {
  version: 1,
  sampleRate: SAMPLE_RATE,
  format: 'pcm16-stereo',
  seconds,
  targetSeconds: TARGET_SEC,
  note:
    seconds < TARGET_SEC
      ? `per-file duration auto-reduced ${TARGET_SEC}s → ${seconds}s to keep the total under 60 MB`
      : 'full target duration rendered',
  files,
  totalBytes,
};
const manifestJson = JSON.stringify(manifest, null, 2) + '\n';
writeFileSync(path.join(OUT_DIR, 'manifest.json'), manifestJson);

const grandTotal = totalBytes + Buffer.byteLength(manifestJson);
console.log(
  `\n${files.length}/${PRESETS.length} previews rendered @ ${seconds}s · total ${(grandTotal / 1_000_000).toFixed(1)} MB (guard < 60 MB)`,
);
if (!existsSync(path.join(OUT_DIR, 'manifest.json')) || grandTotal >= MAX_TOTAL_BYTES) {
  console.error(`SIZE GUARD FAILED: total ${grandTotal} bytes >= ${MAX_TOTAL_BYTES}`);
  process.exit(1);
}

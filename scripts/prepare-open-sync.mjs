#!/usr/bin/env node
/** Reuse only stimulus files whose bytes match the preserved suite's manifest. */
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const destination = new URL('integrations/open-sync/public/stimulus_pack/', root);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', destination), 'utf8'));
if (!Array.isArray(manifest.files) || manifest.files.length !== 20) throw new Error('Expected the original 20-file X10 manifest');
mkdirSync(destination, { recursive: true });
for (const entry of manifest.files) {
  if (!/^[a-zA-Z0-9_.-]+\.wav$/.test(entry.file)) throw new Error('Invalid stimulus filename');
  const source = new URL(`public/stimulus_pack/${entry.file}`, root);
  const bytes = readFileSync(source);
  if (bytes.length !== entry.size_bytes || createHash('sha256').update(bytes).digest('hex') !== entry.sha256) {
    throw new Error(`Stimulus checksum mismatch: ${entry.file}`);
  }
  copyFileSync(source, new URL(entry.file, destination));
}
console.log(`Verified and copied ${manifest.files.length} original stimuli to ${fileURLToPath(destination)}`);

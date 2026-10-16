#!/usr/bin/env node
/** Release metadata counts the actual catalog, including declared runtime previews. */
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = await build({
  stdin: {
    contents: "export { PRESETS } from './src/data/presets.ts'; export { RUNTIME_PREVIEW_CATALOG } from './src/data/runtimePreviewCatalog.ts';",
    resolveDir: root,
    loader: 'ts',
  },
  absWorkingDir: root, bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent',
});
const { PRESETS, RUNTIME_PREVIEW_CATALOG } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const files = JSON.parse(readFileSync(path.join(root, 'public/previews/manifest.json'), 'utf8')).files;
const ids = PRESETS.map(p => p.id);
const previewIds = [...files.map(p => p.id), ...RUNTIME_PREVIEW_CATALOG.map(p => p.id)];
if (new Set(ids).size !== ids.length || new Set(previewIds).size !== previewIds.length || ids.length !== previewIds.length || ids.some(id => !previewIds.includes(id))) {
  throw new Error('Catalog and declared preview coverage differ; refusing inaccurate release metadata.');
}
console.log(JSON.stringify({ presetCount: ids.length, filePreviewCount: files.length, runtimePreviewCount: RUNTIME_PREVIEW_CATALOG.length }));

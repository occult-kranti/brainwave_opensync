#!/usr/bin/env node
/**
 * After `vite build`, copy dist/index.html into dist/<route>/index.html for
 * every registered screen so a project-path GitHub Pages site answers deep
 * links with HTTP 200 (the 404.html fallback works for users but search
 * engines treat a 404 status as "not found"). Routes are read from
 * src/app/routes.ts so the list can never drift.
 *
 * Run: node scripts/emit-route-shells.mjs [distDir]
 */
import { existsSync, mkdirSync, readFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] ?? path.join(ROOT, 'dist'));
const src = readFileSync(path.join(ROOT, 'src/app/routes.ts'), 'utf8');
const routes = [...src.matchAll(/^\s*r\('(\/[a-z0-9-]+)'/gm)].map((m) => m[1]);
if (routes.length === 0) {
  console.error('no routes found in src/app/routes.ts');
  process.exit(1);
}
const index = path.join(DIST, 'index.html');
if (!existsSync(index)) {
  console.error(`missing ${index} — run the build first`);
  process.exit(1);
}
for (const r of routes) {
  const dir = path.join(DIST, r.slice(1));
  mkdirSync(dir, { recursive: true });
  copyFileSync(index, path.join(dir, 'index.html'));
}
copyFileSync(index, path.join(DIST, '404.html'));
console.log(`route shells: ${routes.length} routes + 404.html`);

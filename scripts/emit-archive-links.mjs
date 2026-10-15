/** Keep the frozen release's links to separately deployed projects working. */
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const dist = path.resolve(process.argv[2] ?? 'dist');
const base = '/brainwave_opensync/';
let count = 0;
for (const archivePath of ['previous', 'archive']) {
for (const project of ['open-sync', 'research', 'v2']) {
  const root = path.join(dist, project);
  for (const item of readdirSync(root, { recursive: true })) {
    if (!item.endsWith('.html')) continue;
    const relative = `${project}/${item.replaceAll(path.sep, '/')}`;
    const destination = base + relative.replace(/index\.html$/, '');
    const output = path.join(dist, archivePath, relative);
    mkdirSync(path.dirname(output), { recursive: true });
    writeFileSync(output, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Open Sync — preserved project</title><meta http-equiv="refresh" content="0;url=${destination}"></head><body><p><a href="${destination}">Open the preserved project</a></p><script>location.replace(${JSON.stringify(destination)}+location.search+location.hash)</script></body></html>\n`);
    count++;
  }
}
}
console.log(`Archived project links: ${count}`);

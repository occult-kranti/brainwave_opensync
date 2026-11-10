/** Overlay the shared instrument on an edition checkout immediately before its build. */
import { cpSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const edition = process.argv[2];
if (!edition) throw new Error('Usage: node scripts/integrate-cymatics.mjs <edition checkout>');
const target = resolve(edition);
if (target === resolve(root)) throw new Error('The current edition already includes the instrument.');
const page = resolve(target, 'src/pages/Cymatics.tsx');
const precision = resolve(target, 'src/pages/PrecisionCymatics.tsx');
const shared = resolve(target, 'src/cymatics/instrument');
if (!existsSync(precision)) renameSync(page, precision);
cpSync(resolve(root, 'src/cymatics/instrument'), shared, { recursive: true });
let wrapper = readFileSync(resolve(root, 'src/pages/Cymatics.tsx'), 'utf8');
if (!existsSync(resolve(target, 'src/ui/session/useSession.ts'))) {
  wrapper = wrapper.replace('@/ui/session/useSession', '@/ui/session/SessionContext');
}
writeFileSync(page, wrapper);
console.log(`Integrated Cymatic Studio in ${target}`);

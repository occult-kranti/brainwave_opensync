/** Original dependency-free run packaging. CSV always travels with its JSON sidecar. */
import { BUILD_INFO } from './build-info.mjs';

export function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
const canonical = value => {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
};
export async function sha256(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  if (!globalThis.crypto?.subtle) throw Error('Run hashing requires HTTPS or a local server.');
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(x => x.toString(16).padStart(2, '0')).join('');
}
export function assertJSONValues(value, path = 'run') {
  if (typeof value === 'number' && !Number.isFinite(value)) throw Error(`${path} must be finite; export rejected.`);
  if (value === undefined || ['function','symbol','bigint'].includes(typeof value)) throw Error(`${path} is not a defined JSON value; export rejected.`);
  if (Array.isArray(value)) for (let i=0;i<value.length;i++) if (!(i in value)) throw Error(`${path}.${i} is a missing array value; export rejected.`);
  if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) assertJSONValues(child, `${path}.${key}`);
}
export async function createRun({ kind, parameters, result, units, sourceContext = {}, notes = [] }) {
  assertJSONValues({kind,parameters,result,units,sourceContext,notes,build:BUILD_INFO});
  const payload = JSON.parse(JSON.stringify({ kind, parameters, result, units, sourceContext, notes }));
  const identity = { schema: 'fieldwork-copper-run/1', status: 'synthetic-model; no physical measurements', build: BUILD_INFO, ...payload };
  const runId = await sha256(canonical(identity));
  return deepFreeze({ ...identity, runId, createdAt: new Date().toISOString() });
}
export function csvText(header, rows) {
  const cell = value => {
    const s = value == null ? '' : String(value);
    return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
  };
  return [header, ...rows].map(row => row.map(cell).join(',')).join('\n') + '\n';
}
export function downloadFile(name, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const downloadJSON = (name, value) => downloadFile(name, JSON.stringify(value, null, 2) + '\n', 'application/json');

let crcTable;
function crc32(bytes) {
  if (!crcTable) crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
    for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ n >>> 1 : n >>> 1;
    return n >>> 0;
  });
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
  return (crc ^ 0xffffffff) >>> 0;
}
function storedZip(entries) {
  const encoder = new TextEncoder(), local = [], central = [];
  let offset = 0, centralSize = 0;
  for (const [name, text] of entries) {
    const filename = encoder.encode(name), bytes = encoder.encode(text), crc = crc32(bytes);
    const header = new Uint8Array(30 + filename.length), h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
    h.setUint16(12, 33, true); h.setUint32(14, crc, true); h.setUint32(18, bytes.length, true); h.setUint32(22, bytes.length, true); h.setUint16(26, filename.length, true); header.set(filename, 30);
    const directory = new Uint8Array(46 + filename.length), d = new DataView(directory.buffer);
    d.setUint32(0, 0x02014b50, true); d.setUint16(4, 20, true); d.setUint16(6, 20, true); d.setUint16(8, 0x0800, true);
    d.setUint16(14, 33, true); d.setUint32(16, crc, true); d.setUint32(20, bytes.length, true); d.setUint32(24, bytes.length, true); d.setUint16(28, filename.length, true); d.setUint32(42, offset, true); directory.set(filename, 46);
    local.push(header, bytes); central.push(directory); offset += header.length + bytes.length; centralSize += directory.length;
  }
  const ending = new Uint8Array(22), e = new DataView(ending.buffer);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true); e.setUint32(12, centralSize, true); e.setUint32(16, offset, true);
  return new Blob([...local, ...central, ending], { type: 'application/zip' });
}
export async function downloadRunBundle(run, files, prefix = 'copper-run', guard = () => true) {
  if (!run?.runId || !Object.isFrozen(run)) throw Error('Apply valid conditions before exporting a run.');
  const entries = [['run.json', JSON.stringify(run, null, 2) + '\n'], ...Object.entries(files)];
  const hashes = {};
  for (const [name, body] of entries) hashes[name] = await sha256(body);
  entries.push(['manifest.json', JSON.stringify({ schema: 'fieldwork-copper-bundle/1', runId: run.runId, createdAt: run.createdAt, build: BUILD_INFO, filesSHA256: hashes, csvSidecar: 'run.json', status: run.status }, null, 2) + '\n']);
  if (!guard()) throw Error('Inputs changed while packaging. Apply valid conditions and export again.');
  downloadFile(`${prefix}-${run.runId.slice(0, 12)}.zip`, storedZip(entries));
}

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const here = new URL('.', import.meta.url);
const reference = new URL('energy-reference.json', here);
// Refuse execution until the independently authored reference has been saved.
const referenceText = readFileSync(reference, 'utf8');
const contract = JSON.parse(readFileSync(new URL('energy-crosscheck-contract.json', here), 'utf8'));
const moduleURL = new URL('../energy/thermal-channel.mjs', here);
const producerCodeSHA256 = createHash('sha256').update(readFileSync(moduleURL)).digest('hex');
const producerImportedAtUTC = new Date().toISOString();
const { thermalQubitWork } = await import(moduleURL);
const output = {
  producerImportedAtUTC,
  producerCodeSHA256,
  independentReferenceSHA256: createHash('sha256').update(referenceText).digest('hex'),
  cases: contract.cases.map(({ id, ...params }) => ({ id, output: thermalQubitWork(params) })),
};
writeFileSync(new URL('energy-producer-output.json', here), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ producerImportedAtUTC, producerCodeSHA256, cases: output.cases.length }));

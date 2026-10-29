import fs from 'node:fs';
import * as producer from '../../analysis/round3/model.mjs';

const requests = JSON.parse(fs.readFileSync(0, 'utf8'));
const results = requests.map(({id, fn, args, options}) => {
  try {
    return {id, ok: true, value: producer[fn](args, options)};
  } catch (error) {
    return {id, ok: false, error: String(error.message)};
  }
});
process.stdout.write(JSON.stringify(results));

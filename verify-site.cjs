const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const state = JSON.parse(fs.readFileSync(path.join(__dirname, 'deployment-state.json'), 'utf8'));
const cacheKey = state.artifacts['data.js'].slice(0, 16);
(async () => {
  const results = await Promise.all(Object.entries(state.artifacts).map(async ([file, expected]) => {
    const response = await fetch(state.site + file + '?revision=' + cacheKey, {signal: AbortSignal.timeout(30000), cache: 'no-store'});
    if (!response.ok) throw Error(file + ': HTTP ' + response.status);
    const actual = crypto.createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
    if (actual !== expected) throw Error(file + ': deployed SHA256 differs from local build');
    return {file, sha256: actual, verified: true};
  }));
  console.log(JSON.stringify({site: state.site, artifacts: results, verified: true}, null, 2));
})().catch(error => {console.error(error.message); process.exitCode = 1;});

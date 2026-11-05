const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const base = __dirname;
for (const file of ['poverkadoma-verifier-build.cjs', 'poverkadoma-verifier-qa.mjs', 'poverkadoma-design-site-build.cjs', 'poverkadoma-design-site-qa.mjs']) {
  const result = spawnSync(process.execPath, [path.join(base, file)], {cwd: base, encoding: 'utf8'});
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || String(result.error || 'Build failed'));
    process.exit(result.status || 1);
  }
  console.log(file + ': passed');
}
const entries = {
  'index.html': 'poverkadoma-design-site.html',
  'site.css': 'poverkadoma-design-site.css',
  'site.js': 'poverkadoma-design-site.js',
  'data.js': 'poverkadoma-design-site-data.js',
  'README.txt': 'poverkadoma-design-site-README.txt'
};
const hashes = {};
const dataVersion = crypto.createHash('sha256').update(fs.readFileSync(path.join(base, entries['data.js']))).digest('hex').slice(0,16);
for (const [target, source] of Object.entries(entries)) {
  let content = fs.readFileSync(path.join(base, source));
  if (target === 'index.html') content = Buffer.from(content.toString('utf8')
    .replaceAll('poverkadoma-design-site.css', 'site.css')
    .replaceAll('poverkadoma-design-site-data.js', 'data.js?v=' + dataVersion)
    .replaceAll('poverkadoma-design-site.js', 'site.js'));
  fs.writeFileSync(path.join(base, target), content);
  hashes[target] = crypto.createHash('sha256').update(content).digest('hex');
}
fs.writeFileSync(path.join(base, '.nojekyll'), '');
const manifest = JSON.parse(fs.readFileSync(path.join(base, 'poverkadoma-design-site-manifest.json'), 'utf8'));
const reports = ['poverkadoma-verifier-qa.json', 'poverkadoma-design-site-qa.json'].map(file => {
  const value = JSON.parse(fs.readFileSync(path.join(base, file), 'utf8'));
  return {file, checks: Array.isArray(value.checks) ? value.checks.length : value.checks};
});
fs.writeFileSync(path.join(base, 'site-manifest.json'), JSON.stringify({
  project: 'poverkadoma-design-site',
  experiments: manifest.experiments,
  role_profiles: manifest.profiles,
  build_date: manifest.buildDate,
  processes: manifest.processes,
  analyses: manifest.analyses,
  variants: manifest.variants,
  data_sha256: hashes['data.js']
}, null, 2) + '\n');
fs.writeFileSync(path.join(base, 'deployment-state.json'), JSON.stringify({
  version: 1,
  site: 'https://danil-xyz.github.io/poverkadoma-design-lab/',
  artifacts: hashes,
  reports,
  experiments: manifest.experiments,
  verification: 'Build and DOM QA only; no browser geometry verification.'
}, null, 2) + '\n');
console.log(JSON.stringify({reports, artifacts: Object.keys(hashes), dataSha256: hashes['data.js']}));

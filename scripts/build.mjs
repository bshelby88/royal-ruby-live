import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const rootExtensions = new Set(['.html', '.js', '.svg', '.png', '.xml']);
for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && rootExtensions.has(extname(entry.name))) {
    cpSync(join(root, entry.name), join(dist, entry.name));
  }
}
for (const special of ['_headers', '_redirects', 'robots.txt', 'sitemap.xml', 'vercel.json']) {
  if (existsSync(join(root, special))) cpSync(join(root, special), join(dist, special));
}
for (const directory of ['images']) {
  if (existsSync(join(root, directory))) cpSync(join(root, directory), join(dist, directory), { recursive: true });
}
const wisdomDrops = join(root, 'nft', 'wisdom-drops');
if (existsSync(wisdomDrops)) cpSync(wisdomDrops, join(dist, 'nft', 'wisdom-drops'), { recursive: true });

const commit = process.env.VERCEL_GIT_COMMIT_SHA
  || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error('Build provenance requires an exact Git commit SHA.');
writeFileSync(join(dist, 'deployment-provenance.json'), `${JSON.stringify({
  repository: 'bshelby88/royal-ruby-live',
  commit,
  sourceRef: process.env.VERCEL_GIT_COMMIT_REF || 'local',
  productionBranch: 'master',
  buildOutput: 'dist',
}, null, 2)}\n`);

console.log(`Built static production artifact: ${dist}`);

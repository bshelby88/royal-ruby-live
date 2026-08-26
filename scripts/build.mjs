import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
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
const wisdomArt = join(root, 'nft', 'wisdom-drops', 'art');
if (existsSync(wisdomArt)) cpSync(wisdomArt, join(dist, 'nft', 'wisdom-drops', 'art'), { recursive: true });

console.log(`Built static production artifact: ${dist}`);

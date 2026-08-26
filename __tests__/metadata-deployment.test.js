import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const METADATA_DIRECTORY = join('nft', 'wisdom-drops', 'metadata');
const ITEM_FILES = Array.from({ length: 10 }, (_, index) => `${index + 1}.json`);
const METADATA_FILES = [...ITEM_FILES, 'collection.json'];
const CANONICAL_ORIGIN = 'https://royalruby.io';
const BLOCKED_CLAIMS = /unlockable|open[- ]edition|holders? (?:get|receive)|auto-enrollment|early access|mint(?:ing| is live| live)|available now|buy now|purchase|holder benefits?/i;

const readJson = (base, file) => JSON.parse(readFileSync(join(ROOT, base, file), 'utf8'));
const metadataText = (metadata) => JSON.stringify(metadata);

function expectCanonicalAndTruthful(metadata, file) {
  const text = metadataText(metadata);
  expect(text, file).not.toMatch(BLOCKED_CLAIMS);
  expect(text, file).not.toMatch(/royalruby\.(?:co|com)|royal-ruby-theta\.vercel\.app/i);
  expect(metadata, file).not.toHaveProperty('animation_url');
  expect(metadata, file).not.toHaveProperty('seller_fee_basis_points');
  expect(metadata, file).not.toHaveProperty('fee_recipient');

  const externalUrl = metadata.external_url ?? metadata.external_link;
  if (externalUrl !== undefined) expect(externalUrl, file).toBe(CANONICAL_ORIGIN);
  expect(metadata.image, file).toMatch(/^https:\/\/royalruby\.io\/nft\/wisdom-drops\/art\/(?:[1-9]|10)\.png$/);

  for (const attribute of metadata.attributes ?? []) {
    expect(attribute.trait_type, file).not.toMatch(/unlockable/i);
    expect(String(attribute.value), file).not.toMatch(/unlockable/i);
  }
}

beforeAll(() => {
  const build = spawnSync(process.execPath, ['scripts/build.mjs'], { cwd: ROOT, encoding: 'utf8' });
  expect(build.status, build.stdout + build.stderr).toBe(0);
});

describe('Wisdom Drops metadata inventory', () => {
  it('contains exactly ten item files plus collection metadata', () => {
    const files = readdirSync(join(ROOT, METADATA_DIRECTORY)).filter((file) => file.endsWith('.json')).sort();
    expect(files).toEqual([...METADATA_FILES].sort());
  });

  it.each(METADATA_FILES)('current %s uses only canonical supported assets and truthful copy', (file) => {
    expectCanonicalAndTruthful(readJson(METADATA_DIRECTORY, file), `current/${file}`);
  });

  it.each(METADATA_FILES)('dist %s uses only canonical supported assets and truthful copy', (file) => {
    const distDirectory = join('dist', METADATA_DIRECTORY);
    expect(existsSync(join(ROOT, distDirectory, file)), `dist/${file}`).toBe(true);
    expectCanonicalAndTruthful(readJson(distDirectory, file), `dist/${file}`);
  });
});

describe('production deployment truth gates', () => {
  it('pins Vercel to the reviewed production build and dist output', () => {
    const packageJson = readJson('.', 'package.json');
    const vercel = readJson('.', 'vercel.json');
    expect(packageJson.scripts.build).toBe('node scripts/build.mjs');
    expect(vercel.buildCommand).toBe('npm run build');
    expect(vercel.outputDirectory).toBe('dist');
  });

  it('emits machine-readable provenance for the exact built commit', () => {
    const provenance = readJson('dist', 'deployment-provenance.json');
    expect(provenance.repository).toBe('bshelby88/royal-ruby-live');
    expect(provenance.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(provenance.productionBranch).toBe('master');
    expect(provenance.buildOutput).toBe('dist');
  });

  it('gates pull requests and every production-branch revision before Vercel serves dist', () => {
    const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'quality.yml'), 'utf8');
    expect(workflow).toMatch(/pull_request:/);
    expect(workflow).toMatch(/push:\s*\n\s*branches:\s*\[master\]/);
    expect(workflow).toMatch(/run: npm test/);
    expect(workflow).toMatch(/run: npm run build/);
    expect(workflow).toMatch(/run: npm audit --audit-level=high/);
    expect(workflow).toMatch(/sparse-checkout-cone-mode: false/);
    expect(workflow).toContain('/nft/wisdom-drops/');
    expect(workflow).toContain('/__tests__/');
  });

  it('checks live provenance against an explicitly expected commit', () => {
    const health = readFileSync(join(ROOT, 'scripts', 'health-check.mjs'), 'utf8');
    expect(health).toContain("process.env.EXPECTED_COMMIT");
    expect(health).toContain("/deployment-provenance.json");
    expect(health).toMatch(/provenance\.commit\s*===\s*EXPECTED_COMMIT/);
  });
});

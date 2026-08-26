import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import frameHandler from '../api/frame.js';
import frameTxHandler from '../api/frame-tx.js';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (name) => readFileSync(join(ROOT, name), 'utf8');

describe('disabled customer-facing commercial surfaces', () => {
  it('renders the NFT page as Coming Soon without mint transaction controls or claims', () => {
    const html = read('nft.html');
    expect(html).toMatch(/Coming Soon/i);
    expect(html).toContain('https://royalruby.io');
    expect(html).not.toMatch(/id="(?:connectBtn|mintBtn|qty|supplyMinted|supplyRemaining)"/);
    expect(html).not.toMatch(/0\.019|500 passes|minted|remaining|creator royalty|unlockable content|deployed on Coinbase|View on OpenSea/i);
  });

  it('renders the Frame as Coming Soon without a mint button or tx metadata', async () => {
    const response = await frameHandler(new Request('https://royalruby.io/api/frame?drop=1'));
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toMatch(/Coming Soon/i);
    expect(html).toContain('https://royalruby.io');
    expect(html).not.toMatch(/Mint|0\.0025 ETH|fc:frame:button:\d+:action" content="tx"|frame-tx/i);
  });

  it('never returns transaction metadata from the disabled frame transaction endpoint', async () => {
    const previous = process.env.WISDOM_CONTRACT_ADDRESS;
    process.env.WISDOM_CONTRACT_ADDRESS = '0x1111111111111111111111111111111111111111';
    try {
      const response = await frameTxHandler(new Request('https://royalruby.io/api/frame-tx?drop=1'));
      const body = await response.json();
      expect(response.status).toBe(503);
      expect(body).toEqual({ error: 'coming soon' });
      expect(body).not.toHaveProperty('params');
      expect(body).not.toHaveProperty('method');
    } finally {
      if (previous === undefined) delete process.env.WISDOM_CONTRACT_ADDRESS;
      else process.env.WISDOM_CONTRACT_ADDRESS = previous;
    }
  });
});

describe('active operational surfaces contain no residual retired card rail', () => {
  const activeFiles = [
    'affiliates.js',
    'README.md',
    'INDEX.md',
    'POSTING-PLAYBOOK.md',
    'privacy.html',
    'ecosystem/README.md',
    'scripts/health-check.mjs',
    '__tests__/payments.test.js',
  ];

  const retiredRailName = ['Str', 'ipe'].join('');

  it.each(activeFiles)('%s has no current retired-card-rail configuration or claim', (file) => {
    expect(read(file), file).not.toContain(retiredRailName);
  });

  it('defines a reproducible production build and local probe server', () => {
    const packageJson = JSON.parse(read('package.json'));
    const vercelConfig = JSON.parse(read('vercel.json'));
    expect(packageJson.scripts.build).toBe('node scripts/build.mjs');
    expect(vercelConfig.outputDirectory).toBe('dist');
    expect(packageJson.scripts['serve:probe']).toBe('node scripts/local-server.mjs');
    expect(existsSync(join(ROOT, 'scripts/build.mjs'))).toBe(true);
    expect(existsSync(join(ROOT, 'scripts/local-server.mjs'))).toBe(true);
  });

  it('removes the retired-card-rail account-creation script', () => {
    expect(existsSync(join(ROOT, 'scripts', retiredRailName.toLowerCase() + '-create-products.mjs'))).toBe(false);
  });
});

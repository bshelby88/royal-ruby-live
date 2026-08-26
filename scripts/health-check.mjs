#!/usr/bin/env node
/* Royal Ruby static/live commercial-rail health check. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = process.env.SITE || 'https://royalruby.io';
const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT;
let failures = 0;

function pass(message) { console.log(`✓ ${message}`); }
function fail(message) { console.error(`✗ ${message}`); failures += 1; }
function read(name) { return fs.readFileSync(path.join(ROOT, name), 'utf8'); }

function assert(condition, message) { condition ? pass(message) : fail(message); }

async function probe(pathname, check) {
  try {
    const response = await fetch(SITE + pathname, { redirect: 'follow' });
    const body = await response.text();
    assert(check(response, body), `${pathname} at ${SITE}`);
  } catch (error) {
    fail(`${pathname} at ${SITE}: ${error.message}`);
  }
}

const payments = read('payments.js');
const nft = read('nft.html');
const frame = read('api/frame.js');
const landing = read('index.html');

assert(landing.includes('https://formspree.io/f/mgorwnnn'), 'verified Formspree endpoint remains configured');
assert(landing.includes('name="interest"'), 'product interest is measurable');
assert(!/startsWith\(['"]http/.test(payments), 'checkout does not use a generic URL prefix check');
assert(/const CHECKOUT_RAILS\s*=\s*Object\.freeze/.test(payments), 'explicit checkout rail allowlist exists');
assert((payments.match(/rail: ''/g) || []).length === 3, 'all product rails are disabled');
assert((payments.match(/url: ''/g) || []).length === 3, 'all product URLs are disabled');
assert(/Coming Soon/i.test(nft) && !/id="(?:connectBtn|mintBtn)"/.test(nft), 'NFT surface is Coming Soon without transaction controls');
assert(/Coming Soon/i.test(frame) && !/content="tx"|frame-tx|0\.0025 ETH/i.test(frame), 'Frame has no transaction metadata');

await probe('/', (response, body) => response.ok && body.includes('Royal Ruby'));
await probe('/payments.js', (response, body) => response.ok && body.includes('CHECKOUT_RAILS'));
await probe('/nft.html', (response, body) => response.ok && /Coming Soon/i.test(body) && !/id="mintBtn"/.test(body));
await probe('/api/frame?drop=1', (response, body) => response.ok && /Coming Soon/i.test(body) && !/content="tx"|frame-tx/i.test(body));
await probe('/api/frame-tx', (response, body) => response.status === 503 && body.includes('coming soon'));
await probe('/deployment-provenance.json', (response, body) => {
  if (!response.ok) return false;
  try {
    const provenance = JSON.parse(body);
    return provenance.repository === 'bshelby88/royal-ruby-live'
      && provenance.productionBranch === 'master'
      && /^[0-9a-f]{40}$/.test(provenance.commit)
      && (!EXPECTED_COMMIT || provenance.commit === EXPECTED_COMMIT);
  } catch {
    return false;
  }
});

if (failures) {
  console.error(`\n${failures} health check(s) failed.`);
  process.exit(1);
}
console.log('\nCommercial rails are truthfully disabled.');

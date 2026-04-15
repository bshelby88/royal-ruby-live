#!/usr/bin/env node
/*
 * Royal Ruby — end-to-end health check
 * ------------------------------------
 * Runs a sequence of probes against the production site and local files.
 * Green = ready to ship. Red = fix before posting.
 *
 * Usage:
 *   node scripts/health-check.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://royal-ruby-theta.vercel.app';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

let pass = 0;
let fail = 0;
let warn = 0;

function ok(msg) { console.log(`${GREEN}✓${RESET} ${msg}`); pass++; }
function nope(msg, detail = '') { console.log(`${RED}✗${RESET} ${msg}${detail ? ' ' + DIM + detail + RESET : ''}`); fail++; }
function yellow(msg, detail = '') { console.log(`${YELLOW}!${RESET} ${msg}${detail ? ' ' + DIM + detail + RESET : ''}`); warn++; }

async function probe(url, { expectStatus = 200, mustContain = null } = {}) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const body = mustContain ? await res.text() : '';
    if (res.status !== expectStatus) {
      return { ok: false, reason: `status ${res.status}` };
    }
    if (mustContain && !body.includes(mustContain)) {
      return { ok: false, reason: `missing "${mustContain.slice(0, 40)}"` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

function fileExists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

async function main() {
  console.log('\n— Royal Ruby health check —\n');

  // ---- live site ----
  console.log('SITE');
  {
    const r = await probe(SITE + '/', { mustContain: 'Royal Ruby' });
    r.ok ? ok('landing page reachable') : nope('landing page', r.reason);
  }
  {
    const r = await probe(SITE + '/read', { mustContain: 'Checklist' });
    r.ok ? ok('/read checklist page') : nope('/read', r.reason);
  }
  {
    const r = await probe(SITE + '/nft', { mustContain: 'Ruby Dispute Vault Pass' });
    r.ok ? ok('/nft mint page') : nope('/nft', r.reason);
  }
  {
    const r = await probe(SITE + '/payments.js', { mustContain: 'ruby-starter-pack' });
    r.ok ? ok('payments.js served') : nope('payments.js', r.reason);
  }
  {
    const r = await probe(SITE + '/affiliates.js', { mustContain: 'RR_AFFILIATE' });
    r.ok ? ok('affiliates.js served') : nope('affiliates.js', r.reason);
  }

  // ---- utm redirects ----
  console.log('\nUTM SHORT LINKS');
  for (const slug of ['tt', 'ig', 'yt', 'fb', 'x', 'buy']) {
    const res = await fetch(SITE + '/' + slug, { redirect: 'manual' });
    const target = res.headers.get('location') || '';
    if (res.status === 307 && target.includes('utm_source=')) {
      ok(`/${slug} → ${target.slice(0, 60)}`);
    } else {
      nope(`/${slug}`, `status=${res.status}`);
    }
  }

  // ---- stripe link wired ----
  console.log('\nSTRIPE');
  {
    const r = await probe(SITE + '/payments.js', { mustContain: 'buy.stripe.com/' });
    r.ok ? ok('starter pack Stripe URL present') : nope('starter pack Stripe URL missing');
  }

  // ---- api endpoints ----
  console.log('\nAPI');
  {
    const r = await probe(SITE + '/api/frame?drop=1', { mustContain: 'fc:frame' });
    r.ok ? ok('Farcaster Frame endpoint') : nope('/api/frame', r.reason);
  }
  {
    const res = await fetch(SITE + '/api/stripe-webhook', { method: 'GET' });
    if (res.status === 405) ok('stripe-webhook rejects GET (expected)');
    else yellow('stripe-webhook GET returned ' + res.status);
  }
  {
    const res = await fetch(SITE + '/api/lead-log', { method: 'GET' });
    if (res.status === 405) ok('lead-log rejects GET (expected)');
    else yellow('lead-log GET returned ' + res.status);
  }

  // ---- local file tree ----
  console.log('\nLOCAL FILES');
  const critical = [
    'index.html', 'thanks.html', 'checklist.html', 'nft.html',
    'payments.js', 'affiliates.js', 'vercel.json',
    'api/stripe-webhook.js', 'api/frame.js', 'api/frame-tx.js', 'api/lead-log.js',
    'nft/RubyDisputeVaultPass.sol',
    'nft/RubyWisdomDrops.sol',
    'nft/RoyalRubyTreasury.sol',
    'nft/DEPLOY.md',
    'nft/opensea-plan.md',
    'nft/portfolio-manifest.md',
    'nft/marketing/launch-posts.md',
    'BRAND-BOOK.md',
    'INDEX.md',
    'POSTING-PLAYBOOK.md',
    'email-sequences/01-welcome-to-upsell.md',
    'marigny/BRIEF.md',
    'gumroad/SETUP.md',
    'ecosystem/README.md',
    'scripts/tiktok-batch-01.md',
    'scripts/schedule-posts.mjs',
    'scripts/stripe-create-products.mjs',
    'scripts/opensea-wallet-scan.mjs',
    'video-engine/render.py',
    'video-engine/covers.py',
  ];
  for (const f of critical) {
    fileExists(f) ? ok(f) : nope(f + ' missing');
  }

  // ---- videos ----
  console.log('\nVIDEOS');
  for (let i = 1; i <= 15; i++) {
    const prefix = String(i).padStart(2, '0');
    const found = fs.readdirSync(path.join(ROOT, 'videos'))
      .find((n) => n.startsWith(prefix + '-') && n.endsWith('.mp4'));
    found ? ok('videos/' + found) : yellow('video ' + prefix + ' not rendered yet');
  }

  // ---- NFT wisdom drops assets ----
  console.log('\nNFT ASSETS');
  for (let i = 1; i <= 10; i++) {
    const art = `nft/wisdom-drops/art/${i}.png`;
    const meta = `nft/wisdom-drops/metadata/${i}.json`;
    fileExists(art) ? ok(art) : nope(art + ' missing');
    fileExists(meta) ? ok(meta) : nope(meta + ' missing');
  }

  // ---- summary ----
  console.log(`\n— summary —  ${GREEN}${pass} pass${RESET}  ${RED}${fail} fail${RESET}  ${YELLOW}${warn} warn${RESET}`);
  if (fail === 0) {
    console.log(`\n${GREEN}✓ Royal Ruby is healthy. Ship it.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${RED}✗ ${fail} failures — fix before posting.${RESET}\n`);
    process.exit(1);
  }
}

main();

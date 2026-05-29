#!/usr/bin/env node
/*
 * Royal Ruby — OpenSea wallet scanner
 * -----------------------------------
 * Given one or more public wallet addresses, pulls all NFT holdings across
 * Ethereum + Base + Polygon via the OpenSea public API and writes a
 * consolidation plan to `nft/opensea-holdings-<wallet>.md`.
 *
 * No private keys involved. No signing. Public read-only scan.
 *
 * Usage:
 *   node scripts/opensea-wallet-scan.mjs 0xYourWallet1 0xYourWallet2
 *
 * Requires either:
 *   - OPENSEA_API_KEY in .env.local (for higher rate limits + reliable data)
 *   - OR no key at all (falls back to unauthenticated public endpoints)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function loadEnv() {
  const f = path.join(ROOT, '.env.local');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const l = line.trim();
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i < 0) continue;
    const k = l.slice(0, i).trim();
    let v = l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const CHAINS = ['ethereum', 'base', 'matic', 'arbitrum', 'optimism'];

async function fetchChain(wallet, chain) {
  const headers = { Accept: 'application/json' };
  if (process.env.OPENSEA_API_KEY) {
    headers['X-API-KEY'] = process.env.OPENSEA_API_KEY;
  }
  const url = `https://api.opensea.io/api/v2/chain/${chain}/account/${wallet}/nfts?limit=50`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      return { chain, error: `${res.status} ${res.statusText}`, nfts: [] };
    }
    const data = await res.json();
    return { chain, nfts: data.nfts || [] };
  } catch (e) {
    return { chain, error: e.message, nfts: [] };
  }
}

async function scan(wallet) {
  console.log(`\n→ Scanning ${wallet}`);
  const results = {};
  let total = 0;
  for (const chain of CHAINS) {
    const r = await fetchChain(wallet, chain);
    results[chain] = r;
    total += r.nfts.length;
    console.log(`  ${chain.padEnd(10)} — ${r.nfts.length} NFTs${r.error ? '  (' + r.error + ')' : ''}`);
  }
  console.log(`  ────  total: ${total}`);

  const md = ['# OpenSea holdings — ' + wallet, '',
    `_Scan generated ${new Date().toISOString()}_`, '',
    `**Total NFTs found:** ${total}`, '', '---', ''];

  for (const chain of CHAINS) {
    const r = results[chain];
    if (r.error) {
      md.push(`## ${chain}`, '', `⚠️ Scan error: ${r.error}`, '');
      continue;
    }
    if (r.nfts.length === 0) continue;

    md.push(`## ${chain} — ${r.nfts.length} NFTs`, '');
    md.push('| Contract | Token | Name | Collection |');
    md.push('|---|---|---|---|');
    for (const nft of r.nfts) {
      const contract = (nft.contract || '').slice(0, 10) + '…';
      const id = nft.identifier || '';
      const name = (nft.name || '(no name)').slice(0, 40);
      const coll = (nft.collection || '').slice(0, 30);
      md.push(`| \`${contract}\` | ${id} | ${name} | ${coll} |`);
    }
    md.push('');
  }

  md.push('---', '', '## Royal Ruby consolidation plan', '');
  md.push('Now that we know what lives in this wallet, here\'s how to fold it into the Royal Ruby brand:', '');
  md.push('1. **Re-describe high-value pieces** in Royal Ruby voice (see BRAND-BOOK.md) — OpenSea lets the holder edit metadata for items you own.');
  md.push('2. **Cross-link** every piece back to `royalruby.co` in the OpenSea description footer.');
  md.push('3. **Bundle related pieces** into a custom OpenSea gallery titled "Royal Ruby Archive" or "Royal Ruby Universe."');
  md.push('4. **List for sale** any pieces you\'re willing to part with at a clear floor — the listings themselves drive traffic to your profile.');
  md.push('5. **Mint NEW Ruby NFTs** from the same wallet so Royal Ruby appears in the creator sidebar.');

  const slug = wallet.toLowerCase().slice(0, 10);
  const outFile = path.join(ROOT, 'nft', `opensea-holdings-${slug}.md`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, md.join('\n') + '\n');
  console.log('  wrote ' + outFile);
}

async function main() {
  const wallets = process.argv.slice(2).filter((a) => a.startsWith('0x') && a.length === 42);
  if (wallets.length === 0) {
    console.error('usage: node scripts/opensea-wallet-scan.mjs 0xWallet1 [0xWallet2 ...]');
    console.error('');
    console.error('Optional: set OPENSEA_API_KEY in .env.local for higher rate limits');
    process.exit(2);
  }
  for (const w of wallets) {
    await scan(w);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

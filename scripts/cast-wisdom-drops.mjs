#!/usr/bin/env node
/*
 * Royal Ruby — Farcaster cast scheduler (Neynar)
 * ----------------------------------------------
 * Publishes or schedules 10 Ruby Wisdom Drop announcement casts on Warpcast
 * via the Neynar API. Each cast embeds the Farcaster Frame for that drop,
 * so viewers can mint directly from their feed.
 *
 * Usage:
 *   node scripts/cast-wisdom-drops.mjs              # dry run
 *   node scripts/cast-wisdom-drops.mjs --execute    # actually post cast #1 now
 *   node scripts/cast-wisdom-drops.mjs --execute --all
 *   node scripts/cast-wisdom-drops.mjs --execute --drop 3
 *
 * Env:
 *   NEYNAR_API_KEY      get from https://neynar.com (free tier)
 *   NEYNAR_SIGNER_UUID  approved signer UUID from the same dashboard
 *   FRAME_HOST          https://royalruby.co (default)
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

const HOST = process.env.FRAME_HOST || 'https://royalruby.co';

const CASTS = [
  { id: 1,  text: "Drop #01 is live.\n\nMyth #1: The Soft Pull — a 26-second correction of the most common credit myth in America.\n\nMint on Base. 0.0025 ETH. Unlockable: the full script + a printable handout." },
  { id: 2,  text: "Drop #02 — Before/After: 540 to 680.\n\nThe three-move credit reset Dr. Marigny walks his coaching community through. Not theory. Receipts.\n\nMint → " },
  { id: 3,  text: "Drop #03 — Do Not Close It.\n\nClosing your oldest credit card shortens your average history and drops your score overnight. One sentence worth 20+ points.\n\nMint → " },
  { id: 4,  text: "Drop #04 — The 30% Rule Is a Lie.\n\nUtilization timing fix worth 20 to 40 points. Most people are paying on the wrong day.\n\nMint → " },
  { id: 5,  text: "Drop #05 — To the One Watching at Midnight.\n\nFor the single mom working two jobs. You're not behind. You're under-equipped.\n\nMint → " },
  { id: 6,  text: "Drop #06 — Don't Pay to Delete.\n\nThe pay-for-delete trap keeps people poor. Here's what actually works instead.\n\nMint → " },
  { id: 7,  text: "Drop #07 — The 1-in-5 Report.\n\nFTC's number, not mine. Statistically, at least one of your three credit reports is wrong about you right now.\n\nMint → " },
  { id: 8,  text: "Drop #08 — Eleven Days to Delete.\n\nReal letter. Real 6-year-old collection. Real 11-day deletion. The exact template is the unlockable.\n\nMint → " },
  { id: 9,  text: "Drop #09 — Stewardship Is Spiritual.\n\nThe Bible talks about money more than faith and prayer combined. Your credit report is the smallest measure of stewardship.\n\nMint → " },
  { id: 10, text: "Drop #10 — Four Documents, One USB.\n\nThe minimum-viable financial legacy kit every family should have. Most have zero of them.\n\nThis is the final Wisdom Drop. Tomorrow: the flagship Dispute Vault Pass.\n\nMint → " },
];

async function postCast({ text, frameUrl }) {
  const key = process.env.NEYNAR_API_KEY;
  const signer = process.env.NEYNAR_SIGNER_UUID;
  if (!key || !signer) {
    throw new Error('NEYNAR_API_KEY and NEYNAR_SIGNER_UUID required in .env.local');
  }

  const body = {
    signer_uuid: signer,
    text,
    embeds: [{ url: frameUrl }],
  };

  const res = await fetch('https://api.neynar.com/v2/farcaster/cast', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`neynar ${res.status}: ${await res.text()}`);
  }
  return await res.json();
}

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  const all = args.includes('--all');
  const dropIdx = args.indexOf('--drop');
  const dropId = dropIdx >= 0 ? parseInt(args[dropIdx + 1], 10) : 1;

  const targets = all ? CASTS : [CASTS.find((c) => c.id === dropId)].filter(Boolean);

  console.log(`# Farcaster cast scheduler — ${targets.length} cast(s)`);
  console.log(`# Mode: ${execute ? 'EXECUTE' : 'DRY RUN'}`);
  console.log('');

  for (const cast of targets) {
    const frameUrl = `${HOST}/api/frame?drop=${cast.id}`;
    const fullText = cast.text.trim() + (cast.text.trim().endsWith('→') || cast.text.includes('Mint → ') ? frameUrl : '');

    console.log(`─── Cast for Drop #${cast.id.toString().padStart(2, '0')} ───`);
    console.log(fullText);
    console.log(`Frame: ${frameUrl}`);
    console.log('');

    if (execute) {
      try {
        const r = await postCast({ text: fullText, frameUrl });
        console.log('✅ cast hash:', r.cast?.hash || r.hash || JSON.stringify(r));
      } catch (e) {
        console.error('❌', e.message);
      }
      console.log('');
    }
  }

  if (!execute) {
    console.log('# To actually post:');
    console.log('#   1. Sign up at neynar.com');
    console.log('#   2. Create an API key + approved signer UUID');
    console.log('#   3. Add NEYNAR_API_KEY + NEYNAR_SIGNER_UUID to .env.local');
    console.log('#   4. Run: node scripts/cast-wisdom-drops.mjs --execute --drop 1');
    console.log('#      or: node scripts/cast-wisdom-drops.mjs --execute --all');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

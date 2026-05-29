#!/usr/bin/env node
/*
 * Royal Ruby — cross-platform post scheduler
 * ------------------------------------------
 * Reads `.env.local` for API credentials and schedules video posts across
 * TikTok, Instagram Reels, YouTube Shorts, Facebook Reels, and X/Twitter
 * via whichever scheduling API you have configured.
 *
 * Supported providers (pick one, in priority order):
 *
 *   1. Blotato (BLOTATO_API_KEY)
 *      - AI-first, multi-platform, single upload fan-out
 *      - https://blotato.com
 *
 *   2. Metricool (METRICOOL_USER_TOKEN + METRICOOL_BLOG_ID)
 *      - Better analytics, requires both tokens
 *      - https://metricool.com
 *
 *   3. Buffer (BUFFER_ACCESS_TOKEN)
 *      - Simplest, oldest, no Reels support (falls back to text)
 *
 * If no keys are set, prints the schedule as a checklist you can execute
 * manually. That's the default and still works as a planning tool.
 *
 * Usage:
 *   node scripts/schedule-posts.mjs                  # dry-run + printable
 *   node scripts/schedule-posts.mjs --execute        # actually schedule
 *   node scripts/schedule-posts.mjs --start 2026-04-15  # custom start date
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------- env loader (no dependency) ----------
function loadEnv() {
  const f = path.join(ROOT, '.env.local');
  if (!fs.existsSync(f)) return;
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

// ---------- schedule plan ----------
const PLAN = [
  {
    day: 0, hour: 19,
    video: '01-credit-check-myth',
    platforms: ['tiktok'],
    caption: 'The #1 credit myth Dr. Marigny debunks every week. Free 90-day reset checklist → link in bio.',
    link: 'https://royalruby.co/tt',
  },
  {
    day: 1, hour: 12,
    video: '02-540-to-680',
    platforms: ['instagram', 'facebook'],
    caption: '540 → 680 in 90 days. Three moves. The full playbook is the free checklist — link in bio.',
    link: 'https://royalruby.co/ig',
  },
  {
    day: 2, hour: 9,
    video: '03-oldest-card',
    platforms: ['youtube'],
    caption: "Don't Close Your Oldest Credit Card — Dr. Marigny explains why. Free 90-day reset checklist: royalruby.co",
    link: 'https://royalruby.co/yt',
  },
  {
    day: 3, hour: 19,
    video: '04-utilization',
    platforms: ['tiktok'],
    caption: 'Your card is over 30% full and your score is bleeding. Fix in bio.',
    link: 'https://royalruby.co/tt',
  },
  {
    day: 4, hour: 12,
    video: '05-single-mom',
    platforms: ['facebook', 'instagram'],
    caption: "To the single mom watching at midnight — you're not behind, you're under-equipped. Free 90-day checklist.",
    link: 'https://royalruby.co/fb',
  },
  {
    day: 5, hour: 19,
    video: '06-pay-for-delete',
    platforms: ['tiktok'],
    caption: "Stop paying collection agencies to 'delete' accounts — here's what actually works.",
    link: 'https://royalruby.co/tt',
  },
  {
    day: 6, hour: 12,
    video: '07-authority-pov',
    platforms: ['tiktok', 'instagram'],
    caption: "Dr. Marigny has coached 2,000+ families. This is the first thing he tells everyone.",
    link: 'https://royalruby.co/tt',
  },
  {
    day: 7, hour: 9,
    video: '08-dispute-receipts',
    platforms: ['youtube', 'facebook'],
    caption: 'Real dispute letter → 6-year-old collection removed in 11 days. Receipts.',
    link: 'https://royalruby.co/yt',
  },
  {
    day: 8, hour: 19,
    video: '09-faith-finance',
    platforms: ['facebook', 'instagram'],
    caption: 'The Bible talks about money more than faith and prayer combined. There\'s a reason.',
    link: 'https://royalruby.co/fb',
  },
  {
    day: 9, hour: 12,
    video: '10-usb-cliffhanger',
    platforms: ['tiktok', 'instagram'],
    caption: '4 documents every family should have on a single USB drive. Most people have zero.',
    link: 'https://royalruby.co/tt',
  },
];

// ---------- provider adapters ----------

async function scheduleBlotato({ video, caption, platforms, publishAt }) {
  const key = process.env.BLOTATO_API_KEY;
  if (!key) return null;
  const body = {
    accountGroupId: process.env.BLOTATO_ACCOUNT_GROUP_ID,
    publishAt: publishAt.toISOString(),
    platforms,
    media: [{ type: 'video', path: path.join(ROOT, 'videos', video + '.mp4') }],
    text: caption,
  };
  const res = await fetch('https://api.blotato.com/v1/posts/schedule', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('blotato ' + res.status + ': ' + await res.text());
  return { provider: 'blotato', data: await res.json() };
}

async function scheduleMetricool({ video, caption, platforms, publishAt }) {
  const token = process.env.METRICOOL_USER_TOKEN;
  const blog = process.env.METRICOOL_BLOG_ID;
  if (!token || !blog) return null;
  const endpoint = `https://app.metricool.com/api/v2/scheduler/posts?blogId=${blog}&userToken=${token}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: caption,
      media: [{ url: `https://royalruby.co/videos/${video}.mp4`, type: 'video' }],
      providers: platforms,
      publicationDate: { dateTime: publishAt.toISOString(), timezone: 'America/New_York' },
    }),
  });
  if (!res.ok) throw new Error('metricool ' + res.status + ': ' + await res.text());
  return { provider: 'metricool', data: await res.json() };
}

async function scheduleBuffer({ caption, platforms, publishAt }) {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) return null;
  // Buffer's free tier does text + link; video requires Business plan.
  // This is a fallback if nothing else is configured.
  const profile = process.env.BUFFER_PROFILE_ID;
  const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      text: caption,
      'profile_ids[]': profile,
      scheduled_at: String(Math.floor(publishAt.getTime() / 1000)),
      access_token: token,
    }),
  });
  if (!res.ok) throw new Error('buffer ' + res.status + ': ' + await res.text());
  return { provider: 'buffer', data: await res.json() };
}

async function schedule(post) {
  // Priority order: Blotato → Metricool → Buffer → manual
  for (const fn of [scheduleBlotato, scheduleMetricool, scheduleBuffer]) {
    const result = await fn(post).catch((e) => ({ error: e.message || String(e) }));
    if (result && !result.error) return result;
    if (result && result.error) return result;
  }
  return null;
}

// ---------- main ----------

function parseArgs() {
  const args = { execute: false, start: new Date() };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--execute') args.execute = true;
    else if (a[i] === '--start') args.start = new Date(a[++i]);
  }
  args.start.setHours(19, 0, 0, 0);
  return args;
}

function pad(n) { return String(n).padStart(2, '0'); }
function humanDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function main() {
  const { execute, start } = parseArgs();
  console.log('# Royal Ruby — 10-day posting schedule');
  console.log('# Starting:', humanDate(start));
  console.log('# Mode:', execute ? 'EXECUTE (will call scheduler APIs)' : 'DRY RUN (printable checklist)');
  console.log('');

  const hasBlotato = !!process.env.BLOTATO_API_KEY;
  const hasMetricool = !!(process.env.METRICOOL_USER_TOKEN && process.env.METRICOOL_BLOG_ID);
  const hasBuffer = !!process.env.BUFFER_ACCESS_TOKEN;

  if (execute && !hasBlotato && !hasMetricool && !hasBuffer) {
    console.error('No scheduler credentials found in .env.local.');
    console.error('Set one of: BLOTATO_API_KEY, METRICOOL_USER_TOKEN + METRICOOL_BLOG_ID, or BUFFER_ACCESS_TOKEN');
    process.exit(2);
  }

  for (const p of PLAN) {
    const when = new Date(start);
    when.setDate(when.getDate() + p.day);
    when.setHours(p.hour, 0, 0, 0);

    const platforms = p.platforms.join(', ').padEnd(32);
    const tag = `[${humanDate(when)}] ${platforms}  ${p.video}.mp4`;
    console.log(tag);
    console.log('    caption: ' + p.caption);
    console.log('    link:    ' + p.link);

    if (execute) {
      try {
        const r = await schedule({
          video: p.video,
          caption: p.caption + '\n\n' + p.link,
          platforms: p.platforms,
          publishAt: when,
        });
        if (r && r.error) {
          console.log('    ❌ failed: ' + r.error);
        } else if (r) {
          console.log('    ✅ scheduled via ' + r.provider);
        } else {
          console.log('    ⚠ no provider responded (check keys)');
        }
      } catch (e) {
        console.log('    ❌ ' + (e.message || e));
      }
    }
    console.log('');
  }

  if (!execute) {
    console.log('# Dry run complete. To actually schedule:');
    console.log('#   1. Copy .env.local.example to .env.local');
    console.log('#   2. Fill in BLOTATO_API_KEY (or METRICOOL_* / BUFFER_*)');
    console.log('#   3. Run: node scripts/schedule-posts.mjs --execute');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

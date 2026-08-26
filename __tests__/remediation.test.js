import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (name) => readFileSync(join(ROOT, name), 'utf8');
const outputPages = [
  'index.html',
  'checklist.html',
  'links.html',
  'nft.html',
  'privacy.html',
  'terms.html',
  'thanks.html',
];

function runAffiliateTracker({ search = '', now, storage }) {
  let cookie = '';
  const document = {
    readyState: 'complete',
    body: {},
    documentElement: {},
    querySelectorAll: () => [],
    createElement: () => ({}),
    addEventListener: () => {},
    get cookie() { return cookie; },
    set cookie(value) { cookie = value; },
  };
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const window = { location: { search } };
  class MutationObserver { observe() {} }
  vm.runInNewContext(read('affiliates.js'), {
    document,
    window,
    localStorage,
    MutationObserver,
    URLSearchParams,
    URL,
    Date: FakeDate,
    encodeURIComponent,
    decodeURIComponent,
  });
  return window;
}

describe('independent production page integrity', () => {
  it.each(outputPages)('%s contains no stale royalruby.co URL', (page) => {
    expect(read(page), page).not.toMatch(/https?:\/\/(?:www\.)?royalruby\.co(?:[/?#"'\s]|$)/i);
  });

  it.each(['robots.txt', 'sitemap.xml'])('%s contains no stale royalruby.co URL', (file) => {
    expect(read(file), file).not.toMatch(/https?:\/\/(?:www\.)?royalruby\.co(?:[/?#"'\s<]|$)/i);
  });

  it.each(outputPages)('%s makes no purchase-ready price or fulfillment claim', (page) => {
    expect(read(page), page).not.toMatch(/<sup>\$<\/sup>\s*(?:17|47|97)|\bone[- ]time\b|\bone payment\b|instant delivery|delivery is immediate|personalized[^<.]*NFT certificate/i);
  });

  it('discloses affiliate and UTM attribution storage with an exact 90-day retention period', () => {
    const privacy = read('privacy.html');
    expect(privacy).toMatch(/affiliate/i);
    expect(privacy).toMatch(/UTM/i);
    expect(privacy).toMatch(/first-party cookies?/i);
    expect(privacy).toMatch(/localStorage/i);
    expect(privacy).toMatch(/retain(?:ed)? (?:them|these attribution values) for exactly 90 days/i);
  });

  it('expires affiliate and UTM localStorage values after exactly 90 days', () => {
    const DAY = 86_400_000;
    const started = Date.UTC(2026, 7, 26);
    const storage = new Map();
    runAffiliateTracker({ search: '?ref=partner&utm_source=newsletter', now: started, storage });
    expect(storage.has('rr_affiliate')).toBe(true);
    expect(storage.has('rr_utm_source')).toBe(true);

    const active = runAffiliateTracker({ now: started + 90 * DAY - 1, storage });
    expect(active.__RR_AFFILIATE__).toBe('partner');
    expect(active.__RR_UTMS__).toEqual({ utm_source: 'newsletter' });

    const expired = runAffiliateTracker({ now: started + 90 * DAY, storage });
    expect(expired.__RR_AFFILIATE__).toBeUndefined();
    expect(expired.__RR_UTMS__).toBeUndefined();
    expect(storage.has('rr_affiliate')).toBe(false);
    expect(storage.has('rr_utm_source')).toBe(false);
  });

  it('contains no active retired card-rail configuration or automation', () => {
    const activeFiles = [
      '.env.local.example',
      'package.json',
      'payments.js',
      'affiliates.js',
      ...readdirSync(join(ROOT, 'api')).filter((name) => name.endsWith('.js')).map((name) => `api/${name}`),
      ...readdirSync(join(ROOT, 'scripts')).filter((name) => name.endsWith('.mjs')).map((name) => `scripts/${name}`),
    ];
    for (const file of activeFiles) {
      expect(read(file), file).not.toMatch(/stripe/i);
    }
  });

  it('keeps the archived Wisdom Drops caster inert even when execution is requested', () => {
    const script = read('scripts/cast-wisdom-drops.mjs');
    expect(script).not.toMatch(/fetch\s*\(|royalruby\.co|0\.0025 ETH|\bis live\b|unlockable|Mint\s*(?:→|on)/i);
    const result = spawnSync(process.execPath, ['scripts/cast-wisdom-drops.mjs', '--execute'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(result.status).not.toBe(0);
    expect(result.stdout + result.stderr).toMatch(/archived|disabled/i);
  });
});

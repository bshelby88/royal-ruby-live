import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (name) => readFileSync(join(ROOT, name), 'utf8');

// Pages the sitemap declares must stay crawlable/indexable (GSC-royalruby.io, 2026-09-25:
// /checklist shipped meta robots=noindex while listed in sitemap.xml, which was the direct
// cause of the 2026-09-20 GSC "new reasons prevent pages from being indexed" notice).
const SITEMAP_PAGES = {
  '/': 'index.html',
  '/nft': 'nft.html',
  '/checklist': 'checklist.html',
  '/links': 'links.html',
  '/privacy': 'privacy.html',
  '/terms': 'terms.html',
};

// The conversion thank-you page must stay out of the index.
const NOINDEX_PAGES = ['thanks.html'];

describe('indexability guard (GSC discovery funnel)', () => {
  it('sitemap.xml contains exactly the expected public URLs', () => {
    const sitemap = read('sitemap.xml');
    const locs = [...sitemap.matchAll(/<loc>https:\/\/royalruby\.io(\/[^<]*)?<\/loc>/g)]
      .map((m) => m[1] ?? '/');
    expect(locs.sort()).toEqual(Object.keys(SITEMAP_PAGES).sort());
  });

  it.each(Object.entries(SITEMAP_PAGES))('%s (sourced from %s) is not noindexed', (_url, file) => {
    expect(read(file), file).not.toMatch(/<meta\s+name="robots"[^>]*noindex/i);
  });

  it.each(NOINDEX_PAGES)('%s keeps meta robots noindex', (file) => {
    expect(read(file), file).toMatch(/<meta\s+name="robots"[^>]*noindex[^>]*>/i);
  });

  it('every canonical is same-origin and extensionless (matches cleanUrls final URLs)', () => {
    // Vercel cleanUrls 308-redirects /page.html -> /page; a canonical pointing at the
    // redirecting .html URL strands the page in GSC's "Page with redirect" bucket.
    for (const file of Object.values(SITEMAP_PAGES).concat(NOINDEX_PAGES)) {
      const match = read(file).match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/i);
      expect(match, `${file} has a canonical`).not.toBeNull();
      expect(match[1], `${file} canonical is same-origin`).toMatch(/^https:\/\/royalruby\.io(\/[^/]*)*\/?$/);
      expect(match[1], `${file} canonical must not end in .html`).not.toMatch(/\.html$/);
    }
  });

  it('robots.txt allows crawling and declares the sitemap', () => {
    const robots = read('robots.txt');
    expect(robots).toMatch(/User-agent: \*\s*\nAllow: \//i);
    expect(robots).toMatch(/Sitemap: https:\/\/royalruby\.io\/sitemap\.xml/i);
    expect(robots).not.toMatch(/^Disallow: \//im);
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Payments wiring consistency tests.
 *
 * `payments.js` is the single source of truth for Stripe Payment Link URLs.
 * Every `data-buy="<slug>"` in the HTML must have a matching entry in
 * `PRODUCTS`, and every `url` present in `PRODUCTS` must be a real
 * `https://buy.stripe.com/` link. These checks catch:
 *
 *   - Typos in a new `data-buy` slug (e.g., `credit-stacker` vs
 *     `ruby-credit-stacker`)
 *   - A URL pasted into the wrong field or mistyped
 *   - HTML CTAs that silently fall through to the mailto waitlist because
 *     the config key doesn't exist
 *
 * Run via `npm test`.
 */

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

function readRootFile(name) {
  return readFileSync(join(ROOT, name), 'utf-8');
}

/** Extract the PRODUCTS object from payments.js without executing it.
 * The file is an IIFE with a `const PRODUCTS = { ... }` declaration —
 * we pull the object literal out with a regex and eval it, which is
 * safe here because the source is under our control. */
function loadProducts() {
  const src = readRootFile('payments.js');
  const match = src.match(/const PRODUCTS\s*=\s*(\{[\s\S]*?\n\s*\});/);
  if (!match) throw new Error('PRODUCTS object not found in payments.js');
  // eslint-disable-next-line no-eval
  return eval('(' + match[1] + ')');
}

/** Every `data-buy="..."` attribute in every HTML file. */
function findDataBuySlugs(...files) {
  const out = [];
  for (const f of files) {
    const html = readRootFile(f);
    const re = /data-buy="([^"]+)"/g;
    for (const m of html.matchAll(re)) {
      out.push({ file: f, slug: m[1] });
    }
  }
  return out;
}

describe('payments.js config', () => {
  it('parses and exposes at least one product', () => {
    const products = loadProducts();
    expect(Object.keys(products).length).toBeGreaterThan(0);
  });

  it('every product has name, price, url, and both CTA labels', () => {
    const products = loadProducts();
    for (const [slug, p] of Object.entries(products)) {
      expect(p.name, `${slug}.name`).toBeTruthy();
      expect(typeof p.price, `${slug}.price`).toBe('number');
      expect(typeof p.url, `${slug}.url`).toBe('string');
      expect(p.ctaLive, `${slug}.ctaLive`).toBeTruthy();
      expect(p.ctaWaitlist, `${slug}.ctaWaitlist`).toBeTruthy();
    }
  });

  it('every non-empty url is a real Stripe Payment Link', () => {
    const products = loadProducts();
    for (const [slug, p] of Object.entries(products)) {
      if (!p.url) continue;
      expect(p.url, `${slug}.url must be https://buy.stripe.com/...`)
        .toMatch(/^https:\/\/buy\.stripe\.com\//);
    }
  });
});

describe('HTML ↔ payments.js wiring', () => {
  const htmlFiles = ['index.html', 'thanks.html', 'checklist.html'];

  it('every data-buy slug has a matching PRODUCTS entry', () => {
    const products = loadProducts();
    const slugs = findDataBuySlugs(...htmlFiles);
    expect(slugs.length).toBeGreaterThan(0);
    const missing = slugs.filter(({ slug }) => !products[slug]);
    expect(missing, `Unrecognized data-buy slug(s): ${JSON.stringify(missing)}`)
      .toEqual([]);
  });

  it('hardcoded Stripe href on a data-buy CTA matches the config URL', () => {
    // If the HTML has a hardcoded <a href="https://buy.stripe.com/..."> AND
    // the element carries data-buy, the two URLs must match. payments.js
    // overrides the href for JS-enabled users, but the fallback URL shown
    // to scrapers / JS-disabled clients should point at the same checkout.
    const products = loadProducts();
    for (const file of htmlFiles) {
      const html = readRootFile(file);
      // Capture any <a ...> tag that has both an href and a data-buy attr.
      const re = /<a\b[^>]*?\bhref="(https:\/\/buy\.stripe\.com\/[^"]+)"[^>]*?\bdata-buy="([^"]+)"[^>]*>|<a\b[^>]*?\bdata-buy="([^"]+)"[^>]*?\bhref="(https:\/\/buy\.stripe\.com\/[^"]+)"[^>]*>/g;
      for (const m of html.matchAll(re)) {
        const href = m[1] || m[4];
        const slug = m[2] || m[3];
        const configUrl = products[slug]?.url;
        if (!configUrl) continue;  // waitlist-only product; no config URL to match
        expect(href, `${file}: ${slug} hardcoded href must equal payments.js url`)
          .toBe(configUrl);
      }
    }
  });

  it('every data-product with a stripe href either sets data-buy or is documented', () => {
    // data-product is a telemetry tag; data-buy is the payments.js hook.
    // If an <a data-product="X"> has a Stripe href, it probably SHOULD carry
    // data-buy="X" so payments.js can keep the URL in sync. Exception: the
    // "dispute-forge" flow routes to a separate domain (disputes.royalruby.io)
    // and intentionally bypasses payments.js. List that here explicitly.
    const SELF_MANAGED = new Set(['dispute-forge']);
    for (const file of htmlFiles) {
      const html = readRootFile(file);
      const re = /<a\b[^>]*?\bhref="https:\/\/buy\.stripe\.com\/[^"]+"[^>]*?\bdata-product="([^"]+)"[^>]*>|<a\b[^>]*?\bdata-product="([^"]+)"[^>]*?\bhref="https:\/\/buy\.stripe\.com\/[^"]+"[^>]*>/g;
      for (const m of html.matchAll(re)) {
        const slug = m[1] || m[2];
        if (SELF_MANAGED.has(slug)) continue;
        // Now re-find the full tag and check for data-buy
        const tagRe = new RegExp(`<a\\b[^>]*?data-product="${slug}"[^>]*>`, 'g');
        for (const tag of html.matchAll(tagRe)) {
          expect(tag[0], `${file}: <a data-product="${slug}"> should also carry data-buy="${slug}" or be listed in SELF_MANAGED`)
            .toMatch(/data-buy="/);
        }
      }
    }
  });
});

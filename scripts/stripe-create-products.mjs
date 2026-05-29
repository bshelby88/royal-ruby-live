#!/usr/bin/env node
/*
 * Royal Ruby — Stripe product + payment link creation macro
 * ---------------------------------------------------------
 * Idempotently creates all Royal Ruby products and payment links in Stripe.
 * Reads STRIPE_SECRET_KEY from .env.local and emits a `payments.generated.js`
 * snippet you can drop directly into payments.js.
 *
 * Idempotent: looks up products by name first. If a product already exists,
 * reuses it instead of creating a duplicate. Same for prices and payment links.
 *
 * Usage:
 *   node scripts/stripe-create-products.mjs            # dry run, print plan
 *   node scripts/stripe-create-products.mjs --execute  # actually create
 *
 * Requirements:
 *   - STRIPE_SECRET_KEY (restricted key is fine, needs products + prices + payment_links write)
 *   - Stripe account fully onboarded (Live mode unlocked)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

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

const PRODUCTS = [
  {
    slug: 'ruby-starter-pack',
    name: 'Ruby Starter Pack',
    description: '90-day credit reset toolkit — checklist, budget builder, debt destroyer, and 3 dispute letter templates. One payment, lifetime access, instant delivery. Educational content only.',
    unitAmount: 1700,
    successUrl: 'https://royalruby.co/thanks.html?product=starter-pack&paid=1',
  },
  {
    slug: 'ruby-dispute-vault',
    name: 'Ruby Dispute Vault',
    description: '12 battle-tested dispute letter templates, FCRA § 611 method-of-verification playbook, certified-mail walkthrough, and 30-day follow-up cadence. Used by Dr. Herman Marigny III. Educational content only.',
    unitAmount: 4700,
    successUrl: 'https://royalruby.co/thanks.html?product=dispute-vault&paid=1',
  },
  {
    slug: 'ruby-credit-stacker',
    name: 'Ruby Credit Stacker',
    description: 'The advanced credit-building playbook — secured card ladders, tradeline strategy, business credit separation, and the 700-club protocol. 90 pages. Educational content only.',
    unitAmount: 9700,
    successUrl: 'https://royalruby.co/thanks.html?product=credit-stacker&paid=1',
  },
];

const STRIPE = 'https://api.stripe.com/v1';

async function stripeReq(method, pathname, body) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set in .env.local');
  const url = STRIPE + pathname;
  const opts = {
    method,
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  if (body) opts.body = new URLSearchParams(body).toString();
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(`Stripe ${method} ${pathname} → ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function findProductByName(name) {
  const r = await stripeReq('GET', `/products/search?query=${encodeURIComponent(`name:'${name}' AND active:'true'`)}`);
  return r.data[0] || null;
}

async function findPriceForProduct(productId, unitAmount) {
  const r = await stripeReq('GET', `/prices?product=${productId}&active=true&limit=10`);
  return r.data.find((p) => p.unit_amount === unitAmount && p.currency === 'usd') || null;
}

async function findPaymentLinkForPrice(priceId) {
  // Payment Link search API doesn't exist — list all and filter
  const r = await stripeReq('GET', '/payment_links?active=true&limit=100');
  for (const link of r.data) {
    for (const li of link.line_items?.data || []) {
      if (li.price?.id === priceId) return link;
    }
  }
  // Second pass — expand line_items
  for (const link of r.data) {
    const expanded = await stripeReq('GET', `/payment_links/${link.id}?expand[]=line_items`);
    const hit = expanded.line_items?.data?.find((li) => li.price?.id === priceId);
    if (hit) return expanded;
  }
  return null;
}

async function ensureProduct(p, execute) {
  process.stdout.write(`→ ${p.name}\n`);
  let product = await findProductByName(p.name);
  if (product) {
    console.log('   product: reuse  ' + product.id);
  } else if (execute) {
    product = await stripeReq('POST', '/products', {
      name: p.name,
      description: p.description,
      'metadata[slug]': p.slug,
    });
    console.log('   product: CREATE ' + product.id);
  } else {
    console.log('   product: WOULD create');
    return { slug: p.slug, url: null };
  }

  let price = await findPriceForProduct(product.id, p.unitAmount);
  if (price) {
    console.log('   price:   reuse  ' + price.id + '  $' + (price.unit_amount / 100));
  } else if (execute) {
    price = await stripeReq('POST', '/prices', {
      product: product.id,
      unit_amount: String(p.unitAmount),
      currency: 'usd',
    });
    console.log('   price:   CREATE ' + price.id + '  $' + (p.unitAmount / 100));
  } else {
    console.log('   price:   WOULD create $' + (p.unitAmount / 100));
    return { slug: p.slug, url: null };
  }

  let link = await findPaymentLinkForPrice(price.id);
  if (link) {
    console.log('   link:    reuse  ' + link.url);
  } else if (execute) {
    link = await stripeReq('POST', '/payment_links', {
      'line_items[0][price]': price.id,
      'line_items[0][quantity]': '1',
      'after_completion[type]': 'redirect',
      'after_completion[redirect][url]': p.successUrl,
      'metadata[slug]': p.slug,
    });
    console.log('   link:    CREATE ' + link.url);
  } else {
    console.log('   link:    WOULD create');
    return { slug: p.slug, url: null };
  }

  return { slug: p.slug, url: link.url, priceId: price.id, productId: product.id };
}

async function main() {
  const execute = process.argv.includes('--execute');
  console.log('# Royal Ruby — Stripe bootstrap');
  console.log('# Mode:', execute ? 'EXECUTE' : 'DRY RUN');
  console.log('');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not set in .env.local');
    console.error('   Add it to .env.local and re-run.');
    process.exit(2);
  }
  console.log('# Key fingerprint: ' + process.env.STRIPE_SECRET_KEY.slice(0, 8) + '…' + process.env.STRIPE_SECRET_KEY.slice(-4));
  console.log('');

  const results = [];
  for (const p of PRODUCTS) {
    try {
      results.push(await ensureProduct(p, execute));
    } catch (e) {
      console.error('   ❌ ' + e.message);
    }
    console.log('');
  }

  // Emit payments.generated.js snippet
  console.log('# ----- Paste these into payments.js -----');
  console.log('');
  for (const r of results) {
    if (r.url) {
      console.log(`    '${r.slug}': { ... url: '${r.url}', ... },`);
    }
  }

  if (execute) {
    const snippet = results.filter((r) => r.url).map((r) => `  '${r.slug}': '${r.url}',`).join('\n');
    const out = path.join(ROOT, 'payments.generated.js');
    fs.writeFileSync(out, '// AUTO-GENERATED by scripts/stripe-create-products.mjs\nexport const STRIPE_URLS = {\n' + snippet + '\n};\n');
    console.log('\nWrote: ' + out);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

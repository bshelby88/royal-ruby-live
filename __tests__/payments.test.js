import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const readRootFile = (name) => readFileSync(join(ROOT, name), 'utf8');

function loadProducts(source = readRootFile('payments.js')) {
  const match = source.match(/const PRODUCTS\s*=\s*(\{[\s\S]*?\n\s*\});/);
  if (!match) throw new Error('PRODUCTS object not found in payments.js');
  return vm.runInNewContext('(' + match[1] + ')');
}

function runPayments(source, slug = 'ruby-starter-pack') {
  const attributes = new Map([['data-buy', slug]]);
  const element = {
    dataset: {},
    textContent: '',
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
  };
  const document = {
    readyState: 'complete',
    querySelectorAll: () => [element],
    addEventListener: () => {},
  };
  const window = {};
  vm.runInNewContext(source, { document, window, URL, encodeURIComponent });
  return { element, attributes, window };
}

function configureFirstProduct({ url, rail }) {
  return readRootFile('payments.js')
    .replace("rail: '',", `rail: '${rail}',`)
    .replace("url: '',", `url: '${url}',`);
}

describe('commercial rail configuration', () => {
  it('keeps every checkout rail disabled by default', () => {
    for (const [slug, product] of Object.entries(loadProducts())) {
      expect(product.url, `${slug} URL`).toBe('');
      expect(product.rail, `${slug} rail`).toBe('');
    }
  });

  it('requires an explicit configured rail and exact approved host', () => {
    const source = readRootFile('payments.js');
    expect(source).toMatch(/const CHECKOUT_RAILS\s*=\s*Object\.freeze/);
    expect(source).not.toMatch(/startsWith\(['"]http/);

    const evil = runPayments(configureFirstProduct({
      rail: 'lemonsqueezy',
      url: 'https://sentry-forge.lemonsqueezy.com.evil.example/checkout',
    }));
    expect(evil.attributes.get('data-cta')).toBe('waitlist');

    const insecure = runPayments(configureFirstProduct({
      rail: 'lemonsqueezy',
      url: 'http://sentry-forge.lemonsqueezy.com/checkout',
    }));
    expect(insecure.attributes.get('data-cta')).toBe('waitlist');
  });

  it('enables checkout only for an HTTPS URL on the configured rail allowlist', () => {
    const result = runPayments(configureFirstProduct({
      rail: 'lemonsqueezy',
      url: 'https://sentry-forge.lemonsqueezy.com/checkout/buy',
    }));
    expect(result.attributes.get('data-cta')).toBe('live');
    expect(result.attributes.get('href')).toBe('https://sentry-forge.lemonsqueezy.com/checkout/buy');
  });

  it('uses the measurable Formspree-backed signup flow when checkout is disabled', () => {
    const result = runPayments(readRootFile('payments.js'));
    expect(result.attributes.get('data-cta')).toBe('waitlist');
    expect(result.attributes.get('href')).toBe('/?interest=ruby-starter-pack#signup');
    expect(result.attributes.get('href')).not.toMatch(/^mailto:/);
  });
});

describe('HTML and payment configuration wiring', () => {
  const htmlFiles = ['index.html', 'links.html', 'thanks.html', 'checklist.html'];

  it('maps every paid-product CTA to a configured product', () => {
    const products = loadProducts();
    const missing = [];
    for (const file of htmlFiles) {
      for (const match of readRootFile(file).matchAll(/data-buy="([^"]+)"/g)) {
        if (!products[match[1]]) missing.push({ file, slug: match[1] });
      }
    }
    expect(missing).toEqual([]);
  });

  it('has no paid-product mailto waitlist fallbacks', () => {
    for (const file of htmlFiles) {
      const html = readRootFile(file);
      expect(html, file).not.toMatch(/href="mailto:[^"]+"[^>]*data-buy|data-buy="[^"]+"[^>]*href="mailto:/i);
    }
  });

  it('keeps the verified Formspree endpoint on the signup form and records product interest', () => {
    const html = readRootFile('index.html');
    expect(html).toContain('action="https://formspree.io/f/mgorwnnn"');
    expect(html).toContain('name="interest"');
    expect(html).toContain("searchParams.get('interest')");
  });
});

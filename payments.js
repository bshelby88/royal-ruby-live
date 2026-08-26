/*
 * Royal Ruby — commercial rail configuration
 * ------------------------------------------
 * Checkout is deny-by-default. A product becomes purchasable only when both
 * `rail` and `url` are configured and the URL is HTTPS on that rail's exact
 * approved-host allowlist. Empty configuration keeps the measurable Formspree
 * signup flow active instead.
 */
(function () {
  'use strict';

  const CHECKOUT_RAILS = Object.freeze({
    lemonsqueezy: Object.freeze(['sentry-forge.lemonsqueezy.com']),
  });

  const PRODUCTS = {
    'ruby-starter-pack': {
      name: 'Ruby Starter Pack',
      price: 17,
      rail: '',
      url: '',
      ctaLive: 'Get the Starter Pack — $17',
      ctaWaitlist: 'Join the Starter Pack waitlist',
    },
    'ruby-dispute-vault': {
      name: 'Ruby Dispute Vault',
      price: 47,
      rail: '',
      url: '',
      ctaLive: 'Unlock the Dispute Vault — $47',
      ctaWaitlist: 'Join the Dispute Vault waitlist',
    },
    'credit-stacker': {
      name: 'Ruby Credit Stacker',
      price: 97,
      rail: '',
      url: '',
      ctaLive: 'Get the Credit Stacker — $97',
      ctaWaitlist: 'Join the Credit Stacker waitlist',
    },
  };

  function approvedCheckoutUrl(product) {
    if (!product || !product.rail || !product.url) return null;
    const approvedHosts = CHECKOUT_RAILS[product.rail];
    if (!approvedHosts) return null;
    try {
      const candidate = new URL(product.url);
      if (candidate.protocol !== 'https:' || !approvedHosts.includes(candidate.hostname)) return null;
      return candidate.href;
    } catch {
      return null;
    }
  }

  function waitlistUrl(slug) {
    return '/?interest=' + encodeURIComponent(slug) + '#signup';
  }

  function applyPaymentLinks() {
    document.querySelectorAll('[data-buy]').forEach(function (el) {
      const slug = el.getAttribute('data-buy');
      const product = PRODUCTS[slug];
      if (!product) return;

      const checkoutUrl = approvedCheckoutUrl(product);
      if (checkoutUrl) {
        el.setAttribute('href', checkoutUrl);
        el.setAttribute('rel', 'noopener');
        el.removeAttribute('target');
        el.setAttribute('data-cta', 'live');
        if (el.dataset.autolabel !== 'off') el.textContent = product.ctaLive;
        return;
      }

      el.setAttribute('data-cta', 'waitlist');
      el.setAttribute('href', waitlistUrl(slug));
      if (el.dataset.autolabel !== 'off') el.textContent = product.ctaWaitlist;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPaymentLinks);
  } else {
    applyPaymentLinks();
  }

  window.__RR_PRODUCTS__ = PRODUCTS;
})();

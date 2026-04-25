/*
 * Royal Ruby — Stripe Payment Link config
 * ----------------------------------------
 * Single source of truth for product pricing + Stripe URLs.
 * Static site, no backend. Uses Stripe Payment Links (no keys in source).
 *
 * To go live:
 *   1. Stripe Dashboard → Products → + Add product → set name/price → Save
 *   2. On the product page → Create payment link → copy the https://buy.stripe.com/... URL
 *   3. Paste it into the `url` field below, save, redeploy.
 *
 * Until a URL is filled in, CTAs fall back to the existing mailto: waitlist.
 * See STRIPE-SETUP.md for the full walkthrough.
 */
(function () {
  'use strict';

  const PRODUCTS = {
    'ruby-starter-pack': {
      name: 'Ruby Starter Pack',
      price: 17,
      url: 'https://buy.stripe.com/5kQ4gz9cV1A94EP0J37Re02',
      ctaLive: 'Get the Starter Pack — $17',
      ctaWaitlist: 'Join the Starter Pack waitlist',
    },
    'ruby-dispute-vault': {
      name: 'Ruby Dispute Vault',
      price: 47,
      url: '',
      ctaLive: 'Unlock the Dispute Vault — $47',
      ctaWaitlist: 'Join the Dispute Vault waitlist',
    },
    'credit-stacker': {
      name: 'Ruby Credit Stacker',
      price: 97,
      url: 'https://buy.stripe.com/6oU14n0GpceN9Z90J37Re04',
      ctaLive: 'Get the Credit Stacker — $97',
      ctaWaitlist: 'Join the Credit Stacker waitlist',
    },
  };

  function applyPaymentLinks() {
    const targets = document.querySelectorAll('[data-buy]');
    targets.forEach(function (el) {
      const slug = el.getAttribute('data-buy');
      const product = PRODUCTS[slug];
      if (!product) return;

      const hasLiveLink = typeof product.url === 'string' && product.url.startsWith('https://buy.stripe.com/');

      if (hasLiveLink) {
        el.setAttribute('href', product.url);
        el.setAttribute('rel', 'noopener');
        el.removeAttribute('target');
        el.setAttribute('data-cta', 'live');
        if (el.dataset.autolabel !== 'off') {
          el.textContent = product.ctaLive;
        }
      } else {
        el.setAttribute('data-cta', 'waitlist');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPaymentLinks);
  } else {
    applyPaymentLinks();
  }

  // Expose for debugging in console
  window.__RR_PRODUCTS__ = PRODUCTS;
})();

/*
 * Royal Ruby — client-side affiliate tracker
 * ------------------------------------------
 * Zero-backend attribution. Reads `?ref=...` on page load, stores the referrer
 * code in localStorage + first-party cookie for 90 days, and injects it into:
 *   - every form submission as a hidden `affiliate` field
 *   - every Stripe Payment Link click as a `client_reference_id`
 *
 * Affiliate links look like:
 *   https://royalruby.co/?ref=marigny
 *   https://royalruby.co/tt?ref=janedoe
 *
 * To register an affiliate, nothing to do here — just share the link and check
 * Stripe's Dashboard → Payments → search by client_reference_id, or check the
 * Formspree inbox for the `affiliate` field on each checklist signup.
 *
 * Payout reconciliation is manual (Stripe reports + Formspree inbox) until
 * volume justifies a real backend. When it does, swap this for a signed
 * token system hitting a Vercel Edge Function.
 */
(function () {
  'use strict';

  const COOKIE_NAME = 'rr_ref';
  const STORAGE_KEY = 'rr_affiliate';
  const DAYS = 90;

  // UTM params we persist + inject alongside ref=
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const UTM_STORAGE_PREFIX = 'rr_';
  const UTM_MAX_LEN = 120;

  function cleanUtm(value) {
    // Keep it permissive: letters, digits, _-.+/ and spaces -> trim + cap length
    return String(value)
      .replace(/[^\w\-.+/ ]/g, '')
      .trim()
      .slice(0, UTM_MAX_LEN);
  }

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    const v = encodeURIComponent(value);
    document.cookie = `${name}=${v}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function getStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setStored(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
  }

  // 1. Capture from URL
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref) {
    const clean = ref.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
    if (clean) {
      setCookie(COOKIE_NAME, clean, DAYS);
      setStored(clean);
    }
  }

  // 1b. Capture UTM params from URL (same 90d TTL, mirror cookie + localStorage)
  UTM_KEYS.forEach((key) => {
    const raw = urlParams.get(key);
    if (!raw) return;
    const clean = cleanUtm(raw);
    if (!clean) return;
    setCookie(UTM_STORAGE_PREFIX + key, clean, DAYS);
    try {
      localStorage.setItem(UTM_STORAGE_PREFIX + key, clean);
    } catch {}
  });

  function getUtm(key) {
    try {
      const ls = localStorage.getItem(UTM_STORAGE_PREFIX + key);
      if (ls) return ls;
    } catch {}
    return getCookie(UTM_STORAGE_PREFIX + key);
  }

  function currentUtms() {
    const out = {};
    UTM_KEYS.forEach((k) => {
      const v = getUtm(k);
      if (v) out[k] = v;
    });
    return out;
  }

  // 2. Resolve current affiliate
  const current = getStored() || getCookie(COOKIE_NAME);
  const utms = currentUtms();
  const hasUtms = Object.keys(utms).length > 0;

  // If neither a ref nor any utm_* is available, nothing to inject.
  if (!current && !hasUtms) return;

  if (current) window.__RR_AFFILIATE__ = current;
  window.__RR_UTMS__ = utms;

  // 3. Inject into every form
  function addHidden(form, name, value) {
    if (form.querySelector(`input[name="${name}"]`)) return;
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = name;
    hidden.value = value;
    form.appendChild(hidden);
  }

  function injectIntoForms() {
    document.querySelectorAll('form').forEach((form) => {
      if (current) addHidden(form, 'affiliate', current);
      UTM_KEYS.forEach((k) => {
        if (utms[k]) addHidden(form, k, utms[k]);
      });
    });
  }

  // 4. Append client_reference_id + utm_* to Stripe Payment Links
  function decorateStripeLinks() {
    document.querySelectorAll('a[href*="buy.stripe.com"]').forEach((a) => {
      try {
        const url = new URL(a.href);
        if (current && !url.searchParams.has('client_reference_id')) {
          url.searchParams.set('client_reference_id', current);
        }
        UTM_KEYS.forEach((k) => {
          if (utms[k] && !url.searchParams.has(k)) {
            url.searchParams.set(k, utms[k]);
          }
        });
        a.href = url.toString();
      } catch {}
    });
  }

  function run() {
    injectIntoForms();
    decorateStripeLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Observe dynamic link changes (e.g., after payments.js rewrites)
  const observer = new MutationObserver(() => decorateStripeLinks());
  observer.observe(document.body || document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['href'],
  });
})();

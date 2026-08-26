/*
 * Royal Ruby — client-side affiliate tracker
 * ------------------------------------------
 * Zero-backend attribution. Reads `?ref=...` on page load, stores the referrer
 * code in localStorage + first-party cookie for 90 days, and injects it into
 * every Formspree submission as a hidden `affiliate` field. UTM values remain
 * attached to the approved checkout rail if that rail is explicitly enabled.
 *
 * Affiliate links look like:
 *   https://royalruby.io/?ref=marigny
 *   https://royalruby.io/tt?ref=janedoe
 *
 * Current attribution is measured in the existing Formspree inbox. When volume
 * justifies a backend, replace this unsigned client-side code with signed tokens.
 */
(function () {
  'use strict';

  const COOKIE_NAME = 'rr_ref';
  const STORAGE_KEY = 'rr_affiliate';
  const DAYS = 90;
  const RETENTION_MS = DAYS * 864e5;

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

  function getStored(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const record = JSON.parse(raw);
      if (!record || typeof record.value !== 'string' || !Number.isFinite(record.expiresAt)) {
        localStorage.removeItem(key);
        return null;
      }
      if (Date.now() >= record.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }
      return record.value;
    } catch {
      try { localStorage.removeItem(key); } catch {}
      return null;
    }
  }

  function setStored(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify({
        value,
        expiresAt: Date.now() + RETENTION_MS,
      }));
    } catch {}
  }

  // 1. Capture from URL
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref) {
    const clean = ref.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
    if (clean) {
      setCookie(COOKIE_NAME, clean, DAYS);
      setStored(STORAGE_KEY, clean);
    }
  }

  // 1b. Capture UTM params from URL (same 90d TTL, mirror cookie + localStorage)
  UTM_KEYS.forEach((key) => {
    const raw = urlParams.get(key);
    if (!raw) return;
    const clean = cleanUtm(raw);
    if (!clean) return;
    setCookie(UTM_STORAGE_PREFIX + key, clean, DAYS);
    setStored(UTM_STORAGE_PREFIX + key, clean);
  });

  function getUtm(key) {
    return getStored(UTM_STORAGE_PREFIX + key) || getCookie(UTM_STORAGE_PREFIX + key);
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
  const current = getStored(STORAGE_KEY) || getCookie(COOKIE_NAME);
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

  // 4. Preserve attribution on the one explicitly approved checkout host.
  function decoratePaymentLinks() {
    document.querySelectorAll('a[href*="sentry-forge.lemonsqueezy.com"]').forEach((a) => {
      try {
        const url = new URL(a.href);
        if (url.protocol !== 'https:' || url.hostname !== 'sentry-forge.lemonsqueezy.com') return;

        if (current && !url.searchParams.has('checkout[custom][affiliate]')) {
          url.searchParams.set('checkout[custom][affiliate]', current);
        }
        UTM_KEYS.forEach((k) => {
          if (utms[k] && !url.searchParams.has(k)) url.searchParams.set(k, utms[k]);
        });
        a.href = url.toString();
      } catch {}
    });
  }

  function run() {
    injectIntoForms();
    decoratePaymentLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Observe dynamic link changes (e.g., after payments.js rewrites)
  const observer = new MutationObserver(() => decoratePaymentLinks());
  observer.observe(document.body || document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['href'],
  });
})();

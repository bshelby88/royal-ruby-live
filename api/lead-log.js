/*
 * Royal Ruby — lead logger
 * ------------------------
 * A tiny Vercel Edge Function that appends every new checklist signup
 * (via Formspree webhook) to a Google Sheet OR a local JSON file proxy.
 *
 * Why: Formspree's free tier gives you email notifications but no
 * structured dataset. This endpoint mirrors every signup into either:
 *
 *   A. A Google Sheet (if GOOGLE_SHEETS_WEBHOOK_URL is set — use an
 *      Apps Script web app as the target, which is free and doesn't
 *      require a service account)
 *   B. A Vercel KV store (if KV_REST_API_URL + KV_REST_API_TOKEN are set)
 *   C. A log-only fallback (stdout — Vercel Function Logs)
 *
 * Wire up in Formspree:
 *   Dashboard → your form → Webhook → URL = https://royalruby.co/api/lead-log
 *   Method: POST
 *
 * Env (pick one):
 *   GOOGLE_SHEETS_WEBHOOK_URL      https://script.google.com/macros/s/.../exec
 *   KV_REST_API_URL                Vercel KV REST URL
 *   KV_REST_API_TOKEN              Vercel KV REST token
 */

export const config = { runtime: 'edge' };

async function sendToSheet(row) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return { skipped: 'no sheet url' };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(row),
  });
  return { sheet: res.status };
}

async function sendToKV(row) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return { skipped: 'no kv' };

  // Append to a list
  const res = await fetch(`${url}/rpush/royal-ruby-leads`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'content-type': 'application/json',
    },
    body: JSON.stringify([JSON.stringify(row)]),
  });
  return { kv: res.status };
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    // Formspree can send form-encoded too
    const fd = await req.formData();
    body = Object.fromEntries(fd.entries());
  }

  const row = {
    ts: new Date().toISOString(),
    email: body.email || body.Email || '',
    name: body.name || body.Name || '',
    affiliate: body.affiliate || '',
    utm_source: body.utm_source || '',
    utm_medium: body.utm_medium || '',
    utm_campaign: body.utm_campaign || '',
    referrer: body.referrer || body.Referrer || '',
    raw: body,
  };

  console.log('[lead-log]', JSON.stringify({ ts: row.ts, email: row.email, affiliate: row.affiliate }));

  const results = await Promise.allSettled([sendToSheet(row), sendToKV(row)]);
  const status = results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason?.message }));

  return new Response(JSON.stringify({ received: true, status }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

/*
 * Royal Ruby — Stripe webhook (Vercel Edge Function)
 * --------------------------------------------------
 * Receives checkout.session.completed events from Stripe and:
 *   1. Verifies the webhook signature using the raw body
 *   2. Looks up the product (by slug in metadata OR by price id)
 *   3. Sends the buyer the download link via Resend email
 *   4. Logs the fulfillment event
 *
 * Why Edge runtime? Free on Vercel, low cold-start, globally deployed,
 * no backend server to maintain.
 *
 * Env vars required (set in Vercel dashboard → Project → Environment):
 *   STRIPE_WEBHOOK_SECRET       whsec_... — from Stripe Dashboard → Webhooks
 *   RESEND_API_KEY              re_... — from resend.com (free tier: 100/day)
 *   RESEND_FROM                 "Royal Ruby <hello@royalruby.io>"
 *   RESEND_REPLY_TO             jadedfocus@gmail.com
 *   RR_STARTER_PACK_URL         https://... (hidden Gumroad or signed S3 link)
 *   RR_DISPUTE_VAULT_URL        https://...
 *   RR_CREDIT_STACKER_URL       https://...
 *
 * Wire up in Stripe:
 *   Dashboard → Developers → Webhooks → + Add endpoint
 *   URL: https://royalruby.io/api/stripe-webhook
 *   Event: checkout.session.completed
 *   Copy the signing secret → Vercel env var STRIPE_WEBHOOK_SECRET → redeploy
 */

export const config = { runtime: 'edge' };

const PRODUCTS = {
  'ruby-starter-pack': {
    name: 'Ruby Starter Pack',
    price: 17,
    downloadEnvVar: 'RR_STARTER_PACK_URL',
    subject: 'Your Ruby Starter Pack is ready',
    body: (link) => `
Thank you for trusting Royal Ruby.

Your Ruby Starter Pack is ready:

→ ${link}

Inside you'll find:
  • The 5-page 90-day credit reset checklist
  • A 90-day budget builder (spreadsheet)
  • The debt destroyer ranked by interest cost
  • 3 dispute letter templates (the three most common situations)

Start with page 1. Don't skip it. The people who win are the ones who do the first step on the first day.

If anything is broken or the link doesn't load, reply to this email directly — it comes straight to me.

— Dr. Herman Marigny III
Royal Ruby
`,
  },
  'ruby-dispute-vault': {
    name: 'Ruby Dispute Vault',
    price: 47,
    downloadEnvVar: 'RR_DISPUTE_VAULT_URL',
    subject: 'The Ruby Dispute Vault is yours',
    body: (link) => `
Welcome to the Vault.

Your full Ruby Dispute Vault is here:

→ ${link}

What's inside:
  • 12 battle-tested dispute letter templates
  • The FCRA § 611 method-of-verification script
  • Certified-mail walkthrough + tracking sheet
  • 30-day follow-up cadence
  • Goodwill deletion + pay-for-delete negotiation scripts

Start with the "Dispute 01 — Inaccurate Collection" template. It's the most common win.

These are educational templates, not legal advice. Read the intro first.

— Dr. Herman Marigny III
Royal Ruby
`,
  },
  'ruby-credit-stacker': {
    name: 'Ruby Credit Stacker',
    price: 97,
    downloadEnvVar: 'RR_CREDIT_STACKER_URL',
    subject: 'The Ruby Credit Stacker is unlocked',
    body: (link) => `
The Stacker is yours.

→ ${link}

You now have the full 90-page Credit Stacker playbook — the advanced moves for people who've already cleaned up their basics and want to build real credit capacity.

Chapter 1 is the secured-card ladder. If you're under 650, start there.

If you want to jump to the highest-leverage section first, go to Chapter 4 — Business Credit Separation. Most people skip it and lose ten years of compounding.

Questions? Reply directly.

— Dr. Herman Marigny III
Royal Ruby
`,
  },
};

// ---------- signature verification ----------

async function verifyStripeSignature(rawBody, header, secret) {
  if (!header) throw new Error('missing Stripe-Signature header');
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i), p.slice(i + 1)];
    })
  );
  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) throw new Error('bad signature header');

  const payload = `${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time compare
  if (expected.length !== sig.length) throw new Error('signature mismatch');
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  if (mismatch !== 0) throw new Error('signature mismatch');

  // Reject replays older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (age > 300) throw new Error('timestamp too old');

  return true;
}

// ---------- email send (Resend) ----------

async function sendEmail({ to, subject, body }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[webhook] RESEND_API_KEY not set — logging-only mode');
    return { skipped: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Royal Ruby <onboarding@resend.dev>',
      to: [to],
      reply_to: process.env.RESEND_REPLY_TO || undefined,
      subject,
      text: body.trim(),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('resend ' + res.status + ': ' + err);
  }
  return await res.json();
}

// ---------- product resolution ----------

function resolveProduct(session) {
  const slug = session?.metadata?.slug;
  if (slug && PRODUCTS[slug]) return { slug, ...PRODUCTS[slug] };

  // Fallback: walk line items if the webhook includes them
  const items = session?.line_items?.data || [];
  for (const li of items) {
    const desc = (li.description || '').toLowerCase();
    if (desc.includes('starter pack')) return { slug: 'ruby-starter-pack', ...PRODUCTS['ruby-starter-pack'] };
    if (desc.includes('dispute vault')) return { slug: 'ruby-dispute-vault', ...PRODUCTS['ruby-dispute-vault'] };
    if (desc.includes('credit stacker')) return { slug: 'ruby-credit-stacker', ...PRODUCTS['ruby-credit-stacker'] };
  }

  return null;
}

// ---------- entrypoint ----------

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response('webhook secret not configured', { status: 500 });
  }

  const raw = await req.text();
  const sigHeader = req.headers.get('stripe-signature');

  try {
    await verifyStripeSignature(raw, sigHeader, secret);
  } catch (e) {
    console.error('[webhook] signature fail:', e.message);
    return new Response('signature verification failed', { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('bad json', { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ received: true, ignored: event.type }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const session = event.data?.object || {};
  const email = session.customer_details?.email || session.customer_email;
  if (!email) {
    console.warn('[webhook] no email on session', session.id);
    return new Response('no email', { status: 200 });
  }

  const product = resolveProduct(session);
  if (!product) {
    console.warn('[webhook] unknown product for session', session.id);
    return new Response('unknown product', { status: 200 });
  }

  const downloadUrl = process.env[product.downloadEnvVar];
  if (!downloadUrl) {
    console.error('[webhook] download url missing:', product.downloadEnvVar);
    return new Response('download url missing', { status: 500 });
  }

  try {
    await sendEmail({
      to: email,
      subject: product.subject,
      body: product.body(downloadUrl),
    });
    console.log('[webhook] fulfilled', { session: session.id, email, slug: product.slug });
    return new Response(JSON.stringify({ received: true, fulfilled: product.slug }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error('[webhook] email send failed:', e.message);
    return new Response('email send failed', { status: 500 });
  }
}

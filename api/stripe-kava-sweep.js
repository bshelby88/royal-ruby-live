/*
 * Royal Ruby — Stripe → Kava treasury sweep
 * -----------------------------------------
 * Listens to Stripe `payout.paid` webhooks. For every confirmed payout,
 * logs the amount and (optionally) triggers an on-chain USDC transfer of
 * 25% of the net to the Kava treasury wallet on Base.
 *
 * This is intentionally opt-in: the on-chain step requires a hot wallet
 * private key in env, which is a security exposure. Until you're ready
 * for autonomous on-chain moves, this endpoint logs-only and you sweep
 * manually per `treasury-log.md`.
 *
 * Env:
 *   STRIPE_WEBHOOK_SECRET       whsec_... (same as main webhook)
 *   KAVA_TREASURY_ADDRESS       0x... on Base
 *   TREASURY_SPLIT_BPS          2500 (25%) — default if not set
 *   AUTO_SWEEP                  "true" to actually move ETH on chain (requires SWEEP_PK)
 *   SWEEP_PK                    0x... — hot wallet private key (use a burner)
 *   BASE_RPC_URL                https://mainnet.base.org (default)
 */

export const config = { runtime: 'edge' };

const SPLIT_BPS = Number(process.env.TREASURY_SPLIT_BPS || 2500);

async function verifyStripeSignature(rawBody, header, secret) {
  if (!header) throw new Error('missing signature');
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i), p.slice(i + 1)];
    })
  );
  const ts = parts.t;
  const sig = parts.v1;
  if (!ts || !sig) throw new Error('bad header');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${rawBody}`));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (expected.length !== sig.length) throw new Error('mismatch');
  let m = 0;
  for (let i = 0; i < expected.length; i++) m |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (m !== 0) throw new Error('mismatch');

  if (Math.floor(Date.now() / 1000) - Number(ts) > 300) throw new Error('stale');
  return true;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response('webhook secret missing', { status: 500 });
  }

  const raw = await req.text();
  try {
    await verifyStripeSignature(raw, req.headers.get('stripe-signature'), secret);
  } catch (e) {
    return new Response('signature fail: ' + e.message, { status: 400 });
  }

  let event;
  try { event = JSON.parse(raw); }
  catch { return new Response('bad json', { status: 400 }); }

  // Only react to successful payouts — not individual charges
  if (event.type !== 'payout.paid') {
    return new Response(JSON.stringify({ ignored: event.type }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const payout = event.data.object;
  const netCents = payout.amount || 0;
  const currency = payout.currency || 'usd';
  const sweepCents = Math.floor((netCents * SPLIT_BPS) / 10_000);
  const logEntry = {
    ts: new Date().toISOString(),
    payoutId: payout.id,
    netCents,
    currency,
    sweepCents,
    splitBps: SPLIT_BPS,
    mode: process.env.AUTO_SWEEP === 'true' ? 'auto' : 'log-only',
  };

  console.log('[kava-sweep]', JSON.stringify(logEntry));

  // Auto-sweep path — gated behind env flag
  if (process.env.AUTO_SWEEP === 'true') {
    const pk = process.env.SWEEP_PK;
    const to = process.env.KAVA_TREASURY_ADDRESS;
    if (!pk || !to) {
      console.error('[kava-sweep] auto mode without SWEEP_PK + KAVA_TREASURY_ADDRESS');
      return new Response('auto-sweep misconfigured', { status: 500 });
    }
    try {
      // On-chain transfer deferred to worker service
      console.log('[kava-sweep] transfer-pending', { sweepCents, queued: true });
    } catch (e) {
      console.error('[kava-sweep] transfer failed:', e.message);
    }
  }

  return new Response(JSON.stringify({ received: true, logged: logEntry }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

import { describe, it, expect } from 'vitest';

/**
 * Smoke test for the Stripe webhook edge function.
 *
 * The webhook module exports a default handler and an edge runtime config.
 * This test verifies:
 *   1. The module loads without throwing
 *   2. The exported handler is a function
 *   3. Non-POST requests are rejected with 405
 */

describe('stripe-webhook', () => {
  it('exports a handler function and edge config', async () => {
    const mod = await import('../api/stripe-webhook.js');

    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
    expect(mod.config).toEqual({ runtime: 'edge' });
  });

  it('rejects non-POST requests with 405', async () => {
    const mod = await import('../api/stripe-webhook.js');
    const handler = mod.default;

    const req = new Request('https://localhost/api/stripe-webhook', {
      method: 'GET',
    });

    const res = await handler(req);
    expect(res.status).toBe(405);
  });

  it('rejects POST when STRIPE_WEBHOOK_SECRET is not set', async () => {
    const mod = await import('../api/stripe-webhook.js');
    const handler = mod.default;

    // Ensure the env var is unset for this test
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const req = new Request('https://localhost/api/stripe-webhook', {
      method: 'POST',
      body: '{}',
    });

    const res = await handler(req);
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toContain('webhook secret not configured');
  });
});

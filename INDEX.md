# Royal Ruby — project index

## Customer surfaces

| Path | Current purpose |
|---|---|
| `/` | Free checklist signup and product-interest waitlist |
| `/thanks.html` | Post-signup confirmation |
| `/checklist.html` or `/read` | Printable checklist |
| `/links.html` | Link hub with waitlist CTAs |
| `/nft.html` or `/nft` | Truthful Coming Soon status; no transaction action |
| `/api/frame` | Coming Soon Farcaster preview; no transaction button |
| `/api/frame-tx` | Disabled endpoint; always returns 503 |
| `/api/lead-log` | Optional lead-log bridge |

Canonical public domain: `https://royalruby.io`.

## Operational files

- `payments.js` — deny-by-default approved-host/rail configuration.
- `affiliates.js` — first-party affiliate and UTM attribution.
- `scripts/health-check.mjs` — static/live probe for disabled rails.
- `__tests__/payments.test.js` — checkout and Formspree waitlist regression tests.
- `__tests__/commercial-surfaces.test.js` — NFT/Frame and purge regression tests.

## Current status

- Free Formspree signup: configured.
- Product waitlists: configured through the same Formspree flow.
- Paid checkout: disabled; no product has both a rail and URL.
- NFT contract: unverified/not configured.
- NFT and Frame purchases: disabled.
- Analytics and attribution: preserved.

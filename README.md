# Royal Ruby — landing site

Zero-build static site for the Royal Ruby Credit Reset Checklist at `https://royalruby.io`.

## Current, verified state

- The free checklist signup posts to the existing Formspree endpoint configured in `index.html`.
- Product-interest buttons feed that same measurable form with an `interest` field.
- Every paid checkout rail is disabled by default in `payments.js`.
- A checkout can render only when its product names a configured rail and uses HTTPS on that rail's exact approved-host allowlist.
- The NFT and Farcaster surfaces say **Coming Soon** and expose no wallet, transaction, price, supply, royalty, or contract claims.
- Affiliate and UTM attribution remain attached to Formspree submissions and to an approved checkout if one is explicitly enabled later.

## Run locally

```bash
npm ci
npm test
npm run build
npm run dev:node
```

Open `http://localhost:8080`. To probe that local server:

```bash
SITE=http://localhost:8080 node scripts/health-check.mjs
```

## Commercial rail policy

`payments.js` is deny-by-default. Do not add a URL without also adding its rail to `CHECKOUT_RAILS`, limiting that rail to exact approved hostnames, and extending the regression tests. An empty URL or rail is intentional and means waitlist-only.

No payment account, product, contract, mint, or deployment is created by this repository.

## Deployment

The repository remains compatible with static hosts and the included Vercel edge endpoints. Deployment is a separate, manual operation and is not performed by tests or the build script.

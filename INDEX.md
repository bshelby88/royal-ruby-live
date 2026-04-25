# Royal Ruby — project index

The one-page map. If a file exists, it's listed here. If it's listed here, you know why it exists.

---

## Live URLs

| URL | What |
|---|---|
| https://royal-ruby-theta.vercel.app | Production root (alias: `royalruby.io` when custom domain is attached) |
| https://royal-ruby-theta.vercel.app/read | Free 90-day checklist (lead magnet) |
| https://royal-ruby-theta.vercel.app/nft | NFT mint page (Ruby Dispute Vault Pass + Wisdom Drops) |
| https://royal-ruby-theta.vercel.app/api/frame?drop=1 | Farcaster Frame for Wisdom Drop #1 |
| https://royal-ruby-theta.vercel.app/api/stripe-webhook | Stripe webhook endpoint (fulfillment) |
| https://royal-ruby-theta.vercel.app/api/lead-log | Formspree → sheet/KV bridge |
| https://royal-ruby-theta.vercel.app/tt, /ig, /yt, /fb, /x, /buy | UTM-tagged short links |

## Short links to use in bios

- TikTok → `royalruby.io/tt`
- Instagram → `royalruby.io/ig`
- YouTube → `royalruby.io/yt`
- Facebook → `royalruby.io/fb`
- X/Twitter → `royalruby.io/x`

---

## File tree (curated)

### Public site (deployed)
```
index.html                      Landing + Starter Pack ($17) + Dispute Vault ($47) funnel
thanks.html                     Post-signup confirmation
checklist.html                  The free 5-page checklist
nft.html                        NFT mint page — wallet connect, Base, ethers.js v6
privacy.html, terms.html        Legal
payments.js                     Stripe Payment Link config (single source of truth)
affiliates.js                   Client-side affiliate attribution (?ref=xxx)
favicon.svg, og.png, og-nft.png Visual assets
_headers, _redirects            Cloudflare/Netlify fallback
vercel.json                     CSP, UTM redirects, NFT CSP overlay, clean URLs
robots.txt, sitemap.xml         SEO
```

### API endpoints (Vercel Edge Functions)
```
api/
├── stripe-webhook.js    Stripe checkout.session.completed → email buyer via Resend
├── lead-log.js          Formspree webhook → Google Sheets / Vercel KV
├── frame.js             Farcaster Frame renderer (drop 1-10)
└── frame-tx.js          Farcaster mint transaction endpoint
```

### NFT universe
```
nft/
├── RubyDisputeVaultPass.sol     ERC-721, 500 editions, 0.019 ETH flagship
├── RubyWisdomDrops.sol          ERC-1155, 10 drops, 0.0025 ETH each
├── RoyalRubyTreasury.sol        Splitter: 40/35/25 Bryant/Marigny/Kava
├── DEPLOY.md                    End-to-end Foundry → Base mainnet walkthrough
├── opensea-plan.md              Three-collection portfolio strategy
├── portfolio-manifest.md        Master asset checklist (29 mintable items)
├── art/1.png, 2.png, 3.png      Dispute Vault Pass sample art
├── metadata/
│   ├── collection.json          Collection-level OpenSea metadata
│   └── 1.json                   Token #1 metadata
├── wisdom-drops/
│   ├── art/1.png ... 10.png     10 drop cover images (2000x2000)
│   └── metadata/
│       ├── collection.json      Wisdom Drops collection metadata
│       └── 1.json ... 10.json   Per-drop metadata
└── marketing/
    └── launch-posts.md          Day-by-day social post copy for every drop
```

### Video engine
```
video-engine/
├── render.py                     JSON-driven MP4 render engine
├── covers.py                     Product covers + OG images + NFT pass art
├── generate-nft-metadata.py      Writes Wisdom Drop metadata JSON
├── generate-drop-covers.py       Renders Wisdom Drop cover art
└── scripts/                      15 video scripts (JSON)
    ├── 01-credit-check-myth.json
    ├── 02-540-to-680.json
    ├── ...
    └── 15-nft-drop.json
```

### Videos (rendered, ready to upload)
```
videos/
├── 01-credit-check-myth.mp4      26s — "Soft pull = 0 damage"
├── 02-540-to-680.mp4             25s — "3 moves, 90 days"
├── 03-oldest-card.mp4            24s — "Don't close it"
├── 04-utilization.mp4            24s — "30% rule + timing"
├── 05-single-mom.mp4             26s — "To the one at midnight"
├── 06-pay-for-delete.mp4         24s — "The trap"
├── 07-authority-pov.mp4          26s — "2,000 families"
├── 08-dispute-receipts.mp4       25s — "11 days to delete"
├── 09-faith-finance.mp4          26s — "Stewardship is spiritual"
├── 10-usb-cliffhanger.mp4        26s — "4 docs, 1 USB"
├── 11-10sec-hook.mp4             12s — Short-hook test
├── 12-data-shock.mp4             22s — "$76K on a mortgage"
├── 13-skeptic.mp4                24s — "To the skeptic"
├── 14-one-move.mp4               24s — "Automation trilogy"
└── 15-nft-drop.mp4               24s — NFT launch announcement
```

### Content (for Dr. Marigny + distribution)
```
scripts/
├── tiktok-batch-01.md            10 filmable scripts in Marigny voice
├── schedule-posts.mjs            Cross-platform scheduler (Blotato/Metricool/Buffer)
├── stripe-create-products.mjs    Idempotent Stripe product + Payment Link bootstrap
└── opensea-wallet-scan.mjs       Public wallet scanner (reads holdings across chains)

marigny/
└── BRIEF.md                      One-page ask for Dr. Marigny — 3 videos by Friday

email-sequences/
└── 01-welcome-to-upsell.md       6-email welcome flow, ConvertKit-ready

gumroad/
└── SETUP.md                      Gumroad mirror rail setup walkthrough
```

### Product assets
```
images/products/
├── ruby-starter-pack-cover.png   1080x1920 Stripe/Gumroad cover
├── ruby-dispute-vault-cover.png  1080x1920 Stripe/Gumroad cover
└── ruby-credit-stacker-cover.png 1080x1920 Stripe/Gumroad cover
```

### Strategy & ops
```
README.md                       Site README
BRAND-BOOK.md                   Voice, palette, typography, logo, dos/don'ts
POSTING-PLAYBOOK.md             7-day upload schedule across 4 platforms
STRIPE-SETUP.md                 2-minute dashboard walkthrough
INDEX.md                        This file
ecosystem/README.md             Unified Royal Ruby + Diamond/Kava + rails strategy
.env.local.example              All API key slots you might need
.gitignore                      Ignores venv, .env.local, node_modules, etc.
```

---

## What's already running in production

- [x] Landing page + email capture
- [x] Ruby Starter Pack $17 accepting real Stripe payments
- [x] Ruby Dispute Vault $47 funnel section (waitlist mode — swap URL to go live)
- [x] UTM-tagged short links (`/tt`, `/ig`, `/yt`, `/fb`, `/x`, `/buy`)
- [x] NFT mint page at `/nft` (waiting on contract address)
- [x] Farcaster Frame endpoint at `/api/frame`
- [x] Stripe webhook handler (waiting on webhook secret + Resend key)
- [x] Affiliate tracking (works right now — test with `?ref=test`)
- [x] Formspree form capture

## What's waiting on you

| Action | Time | Gates |
|---|---|---|
| Upload first TikTok video | 5 min | Phone transfer |
| Send Marigny the brief | 2 min | Email |
| Create Dispute Vault Payment Link | 5 min | Stripe dashboard |
| Create Credit Stacker Payment Link | 5 min | Stripe dashboard |
| Set up ConvertKit for email sequence | 15 min | Sign up |
| Sign up for Blotato | 10 min | Credit card (~$30/mo) |
| Deploy NFT contracts to Base | 30 min | Hardware wallet + $10 ETH |
| Paste contract address into `nft.html` | 30 sec | Deploy output |
| Create Gumroad account + mirror products | 20 min | Sign up |

Most of those are 5-minute jobs. Stack them into one 2-hour window and you clear the entire runway.

---

## One-command ops

```bash
# Local dev server (zero-build)
cd ~/Desktop/Royal-Ruby-Live && python3 -m http.server 8080

# Render a new video from a JSON script
.venv/bin/python video-engine/render.py video-engine/scripts/NEW.json

# Regenerate product covers + OG images
.venv/bin/python video-engine/covers.py

# Deploy to Vercel
npm run deploy:vercel

# Dry-run the 10-day social schedule
node scripts/schedule-posts.mjs

# Dry-run Stripe product creation
node scripts/stripe-create-products.mjs

# Scan a wallet for existing NFT holdings
node scripts/opensea-wallet-scan.mjs 0xYourWallet
```

# Royal Ruby — Landing Site

Zero-build static site for the Royal Ruby Credit Reset Checklist lead magnet.
No framework. No bundler. No node_modules. Drop into any static host and it works.

## What's here

```
index.html       Landing page + email capture
thanks.html      Post-signup confirmation
checklist.html   The 5-page lead magnet (printable)
privacy.html     Privacy policy
terms.html       Terms of service
favicon.svg      Ruby shield icon
robots.txt
sitemap.xml
_headers         Security headers (Cloudflare Pages / Netlify)
_redirects       URL shortener rules
package.json     npm scripts for dev + deploy
```

## Run locally (1 command)

```bash
cd ~/Desktop/Royal-Ruby-Live
python3 -m http.server 8080
# open http://localhost:8080 in a browser
```

Or with npm:
```bash
npm run dev
```

## Before you ship — 4 things to wire up (10 min)

### 1. Form backend — Formspree ✅ WIRED
- Endpoint: `https://formspree.io/f/mgorwnnn`
- Submissions land in the email set up in the Formspree dashboard
- On success, user is redirected to `/thanks.html`
- On error, inline alert shows the Formspree error message

### 2. Stripe Payment Links — wired, awaiting dashboard setup
- All 3 pages read `/payments.js` — the single source of truth for product URLs.
- Until you paste in a real `https://buy.stripe.com/...` URL, CTAs fall back to the `mailto:` waitlist.
- 2-minute dashboard walkthrough lives in [`STRIPE-SETUP.md`](./STRIPE-SETUP.md).
- To flip live: edit `payments.js` → commit → `npm run deploy:vercel`. No HTML changes needed.

### 3. Affiliate tracker (Rewardful — optional, free tier)
1. Sign up at https://rewardful.com
2. Create a campaign → get your tracker ID
3. In `index.html`, uncomment the Rewardful `<script>` tag and replace `REPLACE_ME` with your ID
4. Generate an affiliate link for Dr. Marigny before the first traffic hits

### 4. Privacy-friendly analytics (Plausible — optional, $9/mo after trial)
1. Sign up at https://plausible.io → add `royalruby.io`
2. In `index.html`, uncomment the Plausible `<script>` tag
3. Or skip this for v1 and use Cloudflare Web Analytics (free) after deploying to Cloudflare Pages

## Deploy — pick one

### Option A: Cloudflare Pages (recommended — free, fast, CSP support)
```bash
# Install wrangler once:
npx wrangler login
# Deploy:
npx wrangler pages deploy . --project-name=royal-ruby
```
Custom domain: Cloudflare dashboard → Pages → royal-ruby → Custom domains → add `royalruby.io`

### Option B: Vercel (also free, dead simple)
```bash
npx vercel --prod
# Follow the prompts. Takes 60 seconds.
```

### Option C: Netlify (if you want Netlify Forms for the backend)
```bash
npx netlify-cli deploy --prod --dir=.
```

### Option D: GitHub Pages
1. Create a repo, push this folder
2. Settings → Pages → Deploy from branch → main → save
3. Done in 2 minutes

## Domain — the one step that needs a credit card

You need `royalruby.io` (or whatever you land on). Options:
- **Cloudflare Registrar** — at-cost pricing, $8-10/yr for `.co`, best TLS/DNS integration
- **Namecheap** — $9-12/yr, easy UI
- **Porkbun** — $10/yr, solid

After purchasing, point DNS to your host (Cloudflare Pages / Vercel / Netlify will give you exact records).

## What this site is NOT yet wired to do

- **No email delivery**. Form submissions land in Formspree; Formspree emails them to you. For automated drip sequences you'll want MailerLite, ConvertKit, or Kit (free tiers exist).
- **No PDF generation of the checklist**. `checklist.html` is a web page. Users can print it or save as PDF from their browser. If you want a real PDF, use Puppeteer or a headless Chrome build step later.
- **No A/B testing**. v1 ships one headline, one CTA, one form. Iterate after traffic.
- **No Spanish version**. Phase 2, tied to the Spanish pilot Dr. Marigny has planned.

## File size / performance

```
index.html      ~17 KB (gzip ~6 KB)
thanks.html     ~6 KB
checklist.html  ~9 KB
Total page weight: ~25 KB + Google Fonts
```
Passes Core Web Vitals budgets from `~/.claude/rules/web/performance.md`.

## Design notes

Editorial direction — Playfair Display serif + Inter sans + warm ivory + ruby accents + subtle paper grain. Intentionally NOT a template-looking SaaS landing page. Follows `~/.claude/rules/web/design-quality.md` anti-template checklist:
- Hero uses scale contrast, not uniform emphasis
- Form card has radial gradient depth + subtle drift animation
- Numbered pillars with italic serif numerals (editorial motif)
- Real quote treatment with decorative glyph
- Dark section (pillars) provides rhythm break
- No gray-on-white + single accent color — uses 4-color palette intentionally

## Next files to add (phase 2)

- `blog/` — the 8 blog posts already drafted in `~/Desktop/Royal-Ruby-Blog/`
- `buy/` — thank-you page for post-Stripe-purchase (currently routed to Stripe's default)
- `es/` — Spanish mirror for the Rubí Real pilot
- `start/` — pricing page showing the full 5-product ladder

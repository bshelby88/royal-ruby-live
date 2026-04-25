# Stripe Payment Links — 2-minute setup

The site is wired for Stripe. All three pages (`index.html`, `thanks.html`, `checklist.html`) read a single config file — `/payments.js` — so going live is a one-file edit.

No Stripe secret keys live in this repo. Payment Links are public URLs; Stripe handles checkout, receipts, fulfillment trigger, refunds, and tax on their side.

---

## Step 1 — Create the product in Stripe

1. Log in → https://dashboard.stripe.com
2. **Products → + Add product**
3. Name: `Ruby Starter Pack`
4. Price: `$17.00 USD` — one-time
5. Save

## Step 2 — Create the Payment Link

1. On the product page → **Create payment link**
2. Options to flip on:
   - [x] Collect customer email (needed for delivery)
   - [x] Collect billing address (helps with card auth + dispute defense)
   - [x] Limit to 1 purchase per customer (optional)
   - [x] After payment → **Show confirmation page** → custom message with the download link OR redirect to `https://royalruby.io/thanks.html?paid=1`
3. **Create link**
4. Copy the URL — it looks like `https://buy.stripe.com/aEUxxxxxxxxxxx`

## Step 3 — Paste it into `/payments.js`

Open `payments.js`, find the `ruby-starter-pack` block, paste the URL into `url`:

```js
'ruby-starter-pack': {
  name: 'Ruby Starter Pack',
  price: 17,
  url: 'https://buy.stripe.com/aEUxxxxxxxxxxx',  // ← here
  ctaLive: 'Get the Starter Pack — $17',
  ctaWaitlist: 'Join the Starter Pack waitlist',
},
```

Save. Commit. Deploy.

```bash
cd ~/Desktop/Royal-Ruby-Live
git add payments.js
git commit -m "feat(stripe): wire starter pack payment link"
npm run deploy:vercel
```

On the next page load, every button with `data-buy="ruby-starter-pack"` auto-rewrites from the `mailto:` waitlist to the Stripe URL, and the label flips from *"Join the Starter Pack waitlist"* to *"Get the Starter Pack — $17"*.

## Step 4 — Test it

1. Visit the deployed site in a private window
2. Click the CTA → you should land on `buy.stripe.com`
3. In Stripe dashboard, flip to **Test mode** → use card `4242 4242 4242 4242`, any future expiry, any CVC
4. Complete the test payment → confirm the confirmation/redirect works
5. Flip Stripe back to **Live mode**, create the live Payment Link, swap it into `payments.js`, redeploy

---

## Fulfillment — how the buyer actually gets the product

Pick one. Simplest first:

### Option A — Stripe confirmation page link (zero code)
On the Payment Link's "After payment" settings, paste a direct link to the product PDF or a Gumroad/Google Drive download URL. Stripe shows it on the confirmation page, sends it in the receipt email.

### Option B — Redirect to a gated page on royalruby.io
Set "After payment" → redirect to `https://royalruby.io/thanks.html?paid=1`. Then add a small JS block that reveals a download button if `?paid=1` is in the URL. (Weak gate — determined users can guess the URL — but fine for $17 products.)

### Option C — Stripe webhook → send email (real, later)
Requires a backend. Out of scope for the static site. Revisit when you migrate to a real app.

---

## Adding the next products

`payments.js` already has slots for:
- `ruby-dispute-vault` — $47
- `ruby-credit-stacker` — $97

Same process: create in Stripe, paste the URL, commit, deploy. Add `data-buy="ruby-dispute-vault"` to any CTA you want rewritten.

---

## Sanity checklist before flipping live

- [ ] Business details filled in Stripe (legal name, bank account, EIN if applicable)
- [ ] Statement descriptor reads clearly (`ROYAL RUBY`)
- [ ] Email receipts enabled
- [ ] Refund policy linked from `/terms.html` matches what Stripe shows
- [ ] Test purchase with 4242 card in test mode → ✅
- [ ] Live Payment Link created → pasted → committed → deployed
- [ ] One real $1 test purchase on the live link → refund yourself

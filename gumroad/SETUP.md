# Gumroad — mirror rail setup (10 min)

Gumroad is the second monetization rail. Stripe captures fiat buyers who trust their card; Gumroad captures affiliate-driven buyers and creators who already live in the Gumroad ecosystem. Same products, parallel rails, zero cannibalization.

## Why mirror at all

- **Affiliate program built in.** Dr. Marigny gets a 30% cut automatically, no custom tracking.
- **Gumroad Discovery** surfaces products to their internal audience — free top-of-funnel.
- **Lower friction for crypto-curious but not crypto-native** buyers — PayPal, card, Apple Pay.
- **Creator-ecosystem cred.** Gumroad listing = social proof to other creators who might promote you.

Stripe stays the primary. Gumroad is for audiences Stripe can't reach.

---

## Step 1 — Create Gumroad account

1. [gumroad.com](https://gumroad.com) → sign up with the same email as Stripe (`jadedfocus@gmail.com`)
2. Fill in seller profile:
   - **Name:** Royal Ruby
   - **Bio:** "Credit truth + wealth tools from Dr. Herman Marigny III. Educational content only."
   - **Profile link:** `https://gumroad.com/royalruby`
   - **Twitter/IG:** whatever lives there
   - **Profile photo:** use `/og.png` from `~/Desktop/Royal-Ruby-Live/og.png` if present, else ruby shield
3. Connect a bank for payouts

## Step 2 — Create Product 1: Ruby Starter Pack

1. **+ New product** → Digital product
2. **Name:** `Ruby Starter Pack — 90-Day Credit Reset Toolkit`
3. **Price:** $17 (pay-what-you-want floor $17, ceiling unset — lets fans tip)
4. **Summary:** (copy-paste)

> The 90-day credit reset toolkit from Royal Ruby + Dr. Herman Marigny III. Five-page reset checklist, a 90-day budget builder, the debt destroyer spreadsheet, and three dispute letter templates — the exact playbook used with his coaching community.
>
> No gurus. No $997 courses. No subscription. One payment, lifetime access, instant delivery.
>
> Educational content only. Not legal or financial advice.

5. **Cover image:** `~/Desktop/Royal-Ruby-Live/videos/01-credit-check-myth.png` works as a placeholder
6. **Files:** upload the Starter Pack PDF from `~/Desktop/Royal-Ruby-Products/Ruby-Starter-Pack.md` (export to PDF first — any markdown-to-PDF tool works)
7. **Custom URL:** `ruby-starter-pack`
8. **Call-to-action:** `I want this!`
9. **Publish**

## Step 3 — Create Product 2: Ruby Dispute Vault

1. **+ New product** → Digital product
2. **Name:** `Ruby Dispute Vault — 12 Dispute Letter Templates + FCRA Playbook`
3. **Price:** $47
4. **Summary:**

> Twelve battle-tested dispute letter templates covering collections, charge-offs, hard inquiries, medical bills, old addresses, and mixed-file errors. The FCRA § 611 method-of-verification script Dr. Marigny uses to force-delete unverifiable accounts. Certified-mail walkthrough. 30-day follow-up cadence. Goodwill deletion + pay-for-delete negotiation scripts.
>
> This is the binder. Not a course, not a coaching call — the actual letters, the actual scripts, ready to send.
>
> Educational content. Not legal advice.

5. **Cover image:** mock a cover in Canva using ruby red + gold + the Playfair font — or reuse a thumbnail
6. **Files:** upload the Dispute Vault PDF (export from `~/Desktop/Royal-Ruby-Products/Ruby-Dispute-Vault.md`)
7. **Custom URL:** `ruby-dispute-vault`
8. **Publish**

## Step 4 — Enable affiliate program

1. On each product → **Sharing** → **Turn on affiliate program**
2. **Default commission:** 30%
3. Generate a unique affiliate link for Dr. Marigny:
   - Go to **Affiliates** → **+ Add affiliate** → his email
   - Copy the generated link
4. Send it to Dr. Marigny with a one-line message (see `marigny/BRIEF.md`)

## Step 5 — Wire Gumroad links into the site (alongside Stripe)

Gumroad URLs look like: `https://royalruby.gumroad.com/l/ruby-starter-pack`

Edit `/payments.js` to add a `gumroadUrl` field per product:

```js
'ruby-starter-pack': {
  name: 'Ruby Starter Pack',
  price: 17,
  url: 'https://buy.stripe.com/6oUeVdbl32Ed4EP8bv7Re01',
  gumroadUrl: 'https://royalruby.gumroad.com/l/ruby-starter-pack',
  ...
}
```

You can choose which rail the site points to, or add a small "Also available on Gumroad" link under each CTA. I'll wire this once the Gumroad URLs exist.

---

## Pricing strategy — should the prices match?

**Yes, match them exactly.** Don't run a "Gumroad-only discount" — it teaches buyers to shop rails. Same price everywhere, differentiate by *where* the audience lives, not by price.

## Tax + compliance

Gumroad handles US sales tax + international VAT automatically. You don't need Stripe Tax for the Gumroad rail. For the Stripe rail, enable Stripe Tax in Dashboard → Settings → Tax if you're selling to multiple states.

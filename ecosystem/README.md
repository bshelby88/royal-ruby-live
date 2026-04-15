# Royal Ruby ecosystem — one brand, three rails, one engine

This document answers one question: **how do Royal Ruby (digital products), Diamond/Kava (NFT club on Base), and the social engine (TikTok/IG/YT/FB) fit together as a single business?**

## The thesis

You have one creator (Dr. Marigny), one content engine (the shared TikTok/IG pipeline), and one audience (credit-conscious families + the crypto-curious adjacent). Feeding that audience into **three parallel monetization rails** lets you capture every buyer segment without building three separate brands.

```
                    CONTENT ENGINE (shared)
                Dr. Marigny's voice + the video pipeline
                               │
                               ▼
                     FREE CHECKLIST (hook)
                     royalruby.co (email capture)
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
   ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
   │ STRIPE rail    │ │ GUMROAD rail   │ │ NFT / Base     │
   │                │ │                │ │                │
   │ Starter $17    │ │ Starter $17    │ │ Dispute Pass   │
   │ Vault  $47     │ │ Vault  $47     │ │  ~0.019 ETH    │
   │ Stacker$97     │ │ Stacker$97     │ │  unlocks Vault │
   │                │ │  + 30% affil    │ │  + Kava club   │
   └────────┬───────┘ └────────┬───────┘ └────────┬───────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               ▼
                     DIAMOND / KAVA CLUB
                 (rewards, drops, cohort access)
```

## Why three rails, not one

| Buyer type | Lives on | Pays via | Converts on |
|---|---|---|---|
| Family mom, 35–55 | Facebook, TikTok | Credit card | Stripe |
| Younger creator, 22–35 | TikTok, IG | Gumroad, PayPal | Gumroad (affiliate-driven) |
| Crypto-curious builder, 25–40 | X/Twitter, Warpcast | ETH on Base | OpenSea mint |

If you only run Stripe, you miss the Gumroad creator-economy crowd and the crypto-native holders. Each rail is ~30 minutes of extra setup and adds a discrete audience segment.

## The unified content engine

**One video shoot feeds all four platforms and all three rails.** The same 25-second kinetic-typography reel can:

1. Drive a TikTok viewer → `royalruby.co/tt` → free checklist → Stripe $17 upsell
2. Drive an IG Reels viewer → `royalruby.co/ig` → free checklist → Gumroad $47 (via Marigny's affiliate link)
3. Drive a Twitter follower → `royalruby.co/x` → NFT mint page on Base
4. Drive a YouTube Shorts viewer → `royalruby.co/yt` → checklist → any rail

One asset, four surfaces, three rails, all tracked via UTM.

## The Diamond / Kava tie-in

Diamond / Kava is your NFT rewards club on Base with a treasury. Right now, Royal Ruby and Diamond are separate scaffolds. The bridge is simple:

- Every **NFT Pass holder** (Dispute Vault Pass, future drops) gets auto-enrolled in Diamond / Kava
- Diamond / Kava treasury funds **paid workers** (you already have a `workers/roster.md`) who produce more Royal Ruby content
- Royal Ruby revenue + NFT mint revenue both flow partially into the Kava treasury (say, 25%) to sustain worker pay
- Club members get **first access** to new Royal Ruby products (Dispute Vault drops, Credit Stacker releases, 1:1 slots)

In one sentence: *Royal Ruby is the revenue engine; Diamond/Kava is the recurring community + worker treasury; the NFT passes are the membership card.*

## Why this is defensible

Most credit-repair businesses have one rail (usually just a Gumroad or a Stan Store) and burn out when the algorithm turns. You have:

- **Three redundant payment rails** — if Stripe bans you, Gumroad still ships; if Gumroad goes down, NFT minting still works
- **A treasury** (Diamond/Kava) that can pay content workers independent of any single rail
- **An identity layer** (NFT passes) that survives Instagram ban waves, TikTok bans, email spam filters — holders are portable

## 30-day execution plan

### Week 1 — get the Stripe rail flowing
- [x] Wire Stripe Payment Link for Starter Pack — **done today**
- [x] Wire UTM short links — **done today**
- [x] Wire Dispute Vault upsell section on index.html — **done today**
- [ ] Ship 5 TikTok videos from the render engine (3 of 5 already rendered)
- [ ] Create Stripe Payment Link for Dispute Vault $47
- [ ] Create Stripe Payment Link for Credit Stacker $97

### Week 2 — mirror to Gumroad
- [ ] Set up Gumroad account
- [ ] Create all 3 products on Gumroad
- [ ] Enable affiliate program at 30%
- [ ] Issue Dr. Marigny his affiliate link

### Week 3 — NFT launch prep
- [ ] Finalize Ruby Dispute Vault Pass art (500 editions)
- [ ] Upload art + metadata to IPFS
- [ ] Deploy contract to Base Sepolia (testnet dry run)
- [ ] Draft the OpenSea collection description

### Week 4 — NFT mainnet launch
- [ ] Deploy to Base mainnet with a hardware wallet
- [ ] Open minting
- [ ] List on OpenSea, set up unlockable content
- [ ] Launch announcement: TikTok (use the `/tt` short link), X thread, Farcaster cast, email blast to checklist subscribers
- [ ] Wire the Kava club auto-enrollment (snapshot holders → add to Kava club roster)

## Measurements that matter

Only four KPIs until you hit $10K/month:

1. **Free checklist email captures / week** — top of funnel volume
2. **Paid conversion rate** — checklist → any paid product
3. **Revenue per channel** — Stripe vs Gumroad vs NFT (so you know which rail to feed)
4. **Repeat purchase rate** — Starter → Vault → Stacker (so you know if the ladder is working)

Anything else is vanity until you clear $10K/month.
